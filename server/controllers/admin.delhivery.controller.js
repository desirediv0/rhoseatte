/**
 * Delhivery Admin Controller
 * Handles admin operations for Delhivery integration
 */

import { ApiError } from "../utils/ApiError.js";
import { ApiResponsive } from "../utils/ApiResponsive.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/db.js";
import { encrypt } from "../utils/encryption.js";
import {
    getDelhiverySettings,
    checkServiceability,
    getRateEstimate,
    processOrderForShipping,
    trackShipment,
    trackByOrderNumber,
    cancelDelhiveryShipment,
    generateLabel,
    pickWarehouseForOrder,
    registerWarehouseOnDelhivery,
} from "../utils/delhivery.js";

// Get Delhivery settings
export const getSettings = asyncHandler(async (req, res) => {
    const settings = await getDelhiverySettings();

    const maskedSettings = {
        ...settings,
        apiToken: settings.apiToken ? "********" : null,
    };

    res.status(200).json(
        new ApiResponsive(200, { settings: maskedSettings }, "Settings fetched successfully")
    );
});

// Update Delhivery settings
export const updateSettings = asyncHandler(async (req, res) => {
    const {
        isEnabled,
        apiToken,
        clientName,
        bookingMode,
        defaultLength,
        defaultBreadth,
        defaultHeight,
        defaultWeight,
        defaultCourierProvider,
    } = req.body;

    const settings = await getDelhiverySettings();

    const updateData = {};

    if (typeof isEnabled === "boolean") {
        updateData.isEnabled = isEnabled;
    }

    if (clientName !== undefined) {
        updateData.clientName = clientName.trim();
    }

    if (apiToken && apiToken !== "********") {
        updateData.apiToken = "enc:" + encrypt(apiToken.trim());
    }

    if (bookingMode !== undefined && (bookingMode === "AUTO" || bookingMode === "MANUAL")) {
        updateData.bookingMode = bookingMode;
        if (bookingMode === "AUTO") {
            updateData.isEnabled = true;
        }
    }

    if (defaultLength !== undefined) updateData.defaultLength = parseFloat(defaultLength);
    if (defaultBreadth !== undefined) updateData.defaultBreadth = parseFloat(defaultBreadth);
    if (defaultHeight !== undefined) updateData.defaultHeight = parseFloat(defaultHeight);
    if (defaultWeight !== undefined) updateData.defaultWeight = parseFloat(defaultWeight);

    updateData.updatedBy = req.admin?.id;

    const updatedSettings = await prisma.delhiverySettings.update({
        where: { id: settings.id },
        data: updateData,
    });

    // The default courier provider is a site-wide setting shared with
    // Shiprocket (lives on ShiprocketSettings, see schema.prisma comment).
    if (
        defaultCourierProvider !== undefined &&
        (defaultCourierProvider === "SHIPROCKET" || defaultCourierProvider === "DELHIVERY")
    ) {
        const shiprocketSettings = await prisma.shiprocketSettings.findFirst();
        if (shiprocketSettings) {
            await prisma.shiprocketSettings.update({
                where: { id: shiprocketSettings.id },
                data: { defaultCourierProvider },
            });
        }
    }

    const maskedSettings = {
        ...updatedSettings,
        apiToken: updatedSettings.apiToken ? "********" : null,
    };

    res.status(200).json(
        new ApiResponsive(200, { settings: maskedSettings }, "Settings updated successfully")
    );
});

// Test Delhivery connection (no login step — a lightweight pincode lookup instead)
export const testConnection = asyncHandler(async (req, res) => {
    try {
        const result = await checkServiceability({ pincode: "110001" });
        const ok = Array.isArray(result?.delivery_codes) && result.delivery_codes.length > 0;

        if (ok) {
            res.status(200).json(
                new ApiResponsive(200, { connected: true }, "Connection successful")
            );
        } else {
            throw new Error("Unexpected response from Delhivery");
        }
    } catch (error) {
        throw new ApiError(400, `Connection failed: ${error.message}`);
    }
});

// Get all pickup addresses
export const getPickupAddresses = asyncHandler(async (req, res) => {
    const addresses = await prisma.delhiveryPickupAddress.findMany({
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    res.status(200).json(
        new ApiResponsive(200, { addresses }, "Pickup addresses fetched successfully")
    );
});

// Create pickup address
export const createPickupAddress = asyncHandler(async (req, res) => {
    const { nickname, name, email, phone, address, address2, city, state, country, pincode, isDefault } =
        req.body;

    if (!name || !email || !phone || !address || !city || !state || !pincode) {
        throw new ApiError(400, "All required fields must be provided");
    }

    if (isDefault) {
        await prisma.delhiveryPickupAddress.updateMany({
            where: { isDefault: true },
            data: { isDefault: false },
        });
    }

    let pickupAddress = await prisma.delhiveryPickupAddress.create({
        data: {
            nickname: nickname || "Warehouse",
            name,
            email,
            phone,
            address,
            address2: address2 || null,
            city,
            state,
            country: country || "India",
            pincode,
            isDefault: isDefault ?? true,
        },
    });

    let syncWarning = null;
    try {
        pickupAddress = await registerWarehouseOnDelhivery(pickupAddress);
    } catch (e) {
        syncWarning = `Saved locally, but Delhivery sync failed: ${e.message}`;
    }

    res.status(201).json(
        new ApiResponsive(
            201,
            { address: pickupAddress, syncWarning },
            "Pickup address created successfully"
        )
    );
});

// Update pickup address
export const updatePickupAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const existing = await prisma.delhiveryPickupAddress.findUnique({ where: { id } });
    if (!existing) {
        throw new ApiError(404, "Pickup address not found");
    }

    if (updateData.isDefault) {
        await prisma.delhiveryPickupAddress.updateMany({
            where: { isDefault: true, id: { not: id } },
            data: { isDefault: false },
        });
    }

    const { syncWarning: _sw, delhiveryRegistered: _dr, id: _id, createdAt, updatedAt, ...clean } = updateData;

    let updated = await prisma.delhiveryPickupAddress.update({
        where: { id },
        data: clean,
    });

    let syncWarn = null;
    try {
        updated = await registerWarehouseOnDelhivery(updated);
    } catch (e) {
        syncWarn = `Updated locally, but Delhivery sync failed: ${e.message}`;
    }

    res.status(200).json(
        new ApiResponsive(
            200,
            { address: updated, syncWarning: syncWarn },
            "Pickup address updated successfully"
        )
    );
});

// Force a (re-)sync of one warehouse to Delhivery
export const syncPickupAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.delhiveryPickupAddress.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Pickup address not found");

    const updated = await registerWarehouseOnDelhivery(existing);

    res.status(200).json(
        new ApiResponsive(200, { address: updated }, "Warehouse synced to Delhivery")
    );
});

// Delete pickup address
export const deletePickupAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.delhiveryPickupAddress.findUnique({ where: { id } });
    if (!existing) {
        throw new ApiError(404, "Pickup address not found");
    }

    await prisma.delhiveryPickupAddress.delete({ where: { id } });

    res.status(200).json(new ApiResponsive(200, null, "Pickup address deleted successfully"));
});

// Check serviceability + rate estimate for an order
export const checkOrderServiceability = asyncHandler(async (req, res) => {
    const { pickupPincode, deliveryPincode, weight, cod } = req.body;

    if (!pickupPincode || !deliveryPincode || !weight) {
        throw new ApiError(400, "Pickup pincode, delivery pincode, and weight are required");
    }

    const serviceability = await checkServiceability({ pincode: deliveryPincode });
    const rate = await getRateEstimate({
        pickupPincode,
        deliveryPincode,
        weightGrams: Math.round(parseFloat(weight) * 1000),
        paymentType: cod ? "COD" : "Pre-paid",
    });

    res.status(200).json(
        new ApiResponsive(200, { serviceability, rate }, "Serviceability checked successfully")
    );
});

// Fetch a rate estimate for a specific order (mirrors Shiprocket's courier list, single-provider)
export const getRateForOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            shippingAddress: true,
            items: { include: { variant: true } },
        },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.status === "CANCELLED" || (order.delhiveryWaybill && order.delhiveryStatus !== "CANCELLED")) {
        return res.status(200).json(
            new ApiResponsive(200, { rate: null, alreadySynced: true }, "Order is already processed or cancelled")
        );
    }

    const settings = await getDelhiverySettings();
    const pickupAddress =
        (await prisma.delhiveryPickupAddress.findFirst({ where: { isDefault: true } })) ||
        (await prisma.delhiveryPickupAddress.findFirst());

    if (!pickupAddress || !order.shippingAddress?.postalCode) {
        throw new ApiError(400, "Pickup address or shipping pincode missing");
    }

    let totalWeight = 0;
    for (const item of order.items) {
        totalWeight += (item.variant?.shippingWeight || settings.defaultWeight || 0.5) * item.quantity;
    }

    try {
        const rate = await getRateEstimate({
            pickupPincode: pickupAddress.pincode,
            deliveryPincode: order.shippingAddress.postalCode,
            weightGrams: Math.round(totalWeight * 1000),
            paymentType: order.paymentMethod === "CASH" ? "COD" : "Pre-paid",
        });

        res.status(200).json(
            new ApiResponsive(200, { rate }, "Rate estimate fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching Delhivery rate:", error);
        throw new ApiError(500, `Failed to fetch rate estimate: ${error.message}`);
    }
});

// Which warehouse would be used for this order (auto-pick preview) + full list
export const getOrderWarehouseOptions = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { shippingAddress: true },
    });
    if (!order) throw new ApiError(404, "Order not found");

    const warehouses = await prisma.delhiveryPickupAddress.findMany({
        orderBy: [{ isDefault: "desc" }, { nickname: "asc" }],
    });

    let suggested = null;
    if (warehouses.length > 0) {
        try {
            const { warehouse } = await pickWarehouseForOrder(order, null);
            suggested = warehouse?.id || null;
        } catch {
            suggested = null;
        }
    }

    res.status(200).json(
        new ApiResponsive(
            200,
            {
                warehouses: warehouses.map((w) => ({
                    id: w.id,
                    nickname: w.nickname,
                    city: w.city,
                    state: w.state,
                    pincode: w.pincode,
                    isDefault: w.isDefault,
                })),
                suggestedWarehouseId: suggested,
                currentWarehouseId: order.delhiveryWarehouseId || null,
                currentWarehouseNickname: order.delhiveryWarehouseNickname || null,
                assignedBy: order.delhiveryWarehouseAssignedBy || null,
            },
            "Warehouse options fetched"
        )
    );
});

// Sync order to Delhivery (manual sync)
export const syncOrderToDelhivery = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { warehouseId } = req.body || {};

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.status === "CANCELLED") {
        throw new ApiError(400, "Cannot sync a cancelled order. Reactivate it first.");
    }

    // An order can only be booked with one courier at a time — if it's live
    // on Shiprocket, that must be cancelled first before switching to Delhivery.
    const shiprocketShipmentActive =
        order.shiprocketOrderId && order.shiprocketStatus !== "CANCELLED";
    if (shiprocketShipmentActive) {
        throw new ApiError(
            400,
            "This order already has an active Shiprocket shipment. Cancel it before syncing to Delhivery."
        );
    }

    const shipmentCancelled = order.delhiveryWaybill && order.delhiveryStatus === "CANCELLED";

    if (order.delhiveryWaybill && !shipmentCancelled) {
        throw new ApiError(400, "Order already synced to Delhivery");
    }

    if (shipmentCancelled) {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                delhiveryWaybill: null,
                delhiveryOrderId: null,
                delhiveryStatus: null,
            },
        });
    }

    const result = await processOrderForShipping(orderId, true, warehouseId || null);

    if (!result) {
        throw new ApiError(400, "Delhivery is disabled or configuration is missing");
    }

    const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            courierProvider: true,
            delhiveryWaybill: true,
            delhiveryOrderId: true,
            delhiveryStatus: true,
            delhiveryWarehouseId: true,
            delhiveryWarehouseNickname: true,
            delhiveryWarehouseAssignedBy: true,
        },
    });

    res.status(200).json(
        new ApiResponsive(200, { order: updatedOrder, delhiveryResponse: result }, "Order synced to Delhivery successfully")
    );
});

// Get tracking info for an order
export const getOrderTracking = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { delhiveryWaybill: true, orderNumber: true },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    let trackingData = null;

    if (order.delhiveryWaybill) {
        trackingData = await trackShipment(order.delhiveryWaybill);
    } else {
        trackingData = await trackByOrderNumber(order.orderNumber);
    }

    res.status(200).json(
        new ApiResponsive(200, { tracking: trackingData }, "Tracking info fetched successfully")
    );
});

// Cancel Delhivery shipment (does NOT cancel the order itself)
export const cancelShipment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    let result = null;
    if (order.delhiveryWaybill) {
        try {
            result = await cancelDelhiveryShipment(order.delhiveryWaybill);
        } catch (err) {
            console.warn("Delhivery cancellation warning:", err);
        }
    }

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { delhiveryStatus: "CANCELLED" },
    });

    res.status(200).json(
        new ApiResponsive(
            200,
            { result, order: updatedOrder },
            "Shipment cancelled. Order remains active and can be re-synced."
        )
    );
});

// Get shipping label for order (redirects to Delhivery's packing-slip PDF URL)
export const getShippingLabel = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { delhiveryWaybill: true, orderNumber: true },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (!order.delhiveryWaybill) {
        throw new ApiError(400, "Order not synced to Delhivery");
    }

    const labelUrl = await generateLabel(order.delhiveryWaybill);

    res.status(200).json(
        new ApiResponsive(
            200,
            { labelUrl, waybill: order.delhiveryWaybill, orderNumber: order.orderNumber },
            "Shipping label URL generated successfully"
        )
    );
});

// Stream label PDF through server (avoids browser CORS on Delhivery URLs)
export const downloadShippingLabel = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { delhiveryWaybill: true, orderNumber: true },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    if (!order.delhiveryWaybill) {
        throw new ApiError(400, "Order not synced to Delhivery");
    }

    const labelUrl = await generateLabel(order.delhiveryWaybill);
    const pdfRes = await fetch(labelUrl);
    if (!pdfRes.ok) {
        throw new ApiError(502, `Failed to fetch label PDF (${pdfRes.status})`);
    }

    const buf = Buffer.from(await pdfRes.arrayBuffer());
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${order.orderNumber || orderId}-label.pdf"`
    );
    res.setHeader("Content-Length", String(buf.length));
    res.send(buf);
});

// Get invoice for order. Delhivery has no separate invoice API like
// Shiprocket does — its packing slip already includes the invoice details,
// so this returns the same packing-slip PDF URL under an "invoice" name to
// keep parity with the Shiprocket admin UI (two buttons, one per courier).
export const getOrderInvoice = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { delhiveryWaybill: true, orderNumber: true },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (!order.delhiveryWaybill) {
        throw new ApiError(400, "Order not synced to Delhivery");
    }

    const invoiceUrl = await generateLabel(order.delhiveryWaybill);

    res.status(200).json(
        new ApiResponsive(
            200,
            { invoiceUrl, waybill: order.delhiveryWaybill, orderNumber: order.orderNumber },
            "Invoice URL generated successfully"
        )
    );
});

// Stream invoice PDF through server (avoids browser CORS on Delhivery URLs)
export const downloadOrderInvoice = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { delhiveryWaybill: true, orderNumber: true },
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    if (!order.delhiveryWaybill) {
        throw new ApiError(400, "Order not synced to Delhivery");
    }

    const invoiceUrl = await generateLabel(order.delhiveryWaybill);
    const pdfRes = await fetch(invoiceUrl);
    if (!pdfRes.ok) {
        throw new ApiError(502, `Failed to fetch invoice PDF (${pdfRes.status})`);
    }

    const buf = Buffer.from(await pdfRes.arrayBuffer());
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${order.orderNumber || orderId}-invoice.pdf"`
    );
    res.setHeader("Content-Length", String(buf.length));
    res.send(buf);
});

// Webhook handler for Delhivery tracking updates
export const handleWebhook = asyncHandler(async (req, res) => {
    const { Shipment } = req.body || {};

    // Delhivery's webhook payload nests the update under a "Shipment" key.
    const waybill = Shipment?.AWB || req.body?.waybill;
    const status = Shipment?.Status?.Status || req.body?.status;
    const statusLocation = Shipment?.Status?.StatusLocation || "";
    const statusDateTime = Shipment?.Status?.StatusDateTime || null;
    const referenceNo = Shipment?.ReferenceNo || req.body?.order_id;

    console.log("Delhivery webhook received:", { waybill, status, referenceNo });

    let order = null;

    if (waybill) {
        order = await prisma.order.findFirst({ where: { delhiveryWaybill: waybill } });
    }

    if (!order && referenceNo) {
        order = await prisma.order.findUnique({ where: { orderNumber: referenceNo } });
    }

    if (!order) {
        console.log("Order not found for Delhivery webhook:", { waybill, referenceNo });
        return res.status(200).json({ status: "ok" });
    }

    const updateData = { delhiveryStatus: status };

    // Map Delhivery status → internal order status. Cancelled/RTO only
    // updates delhiveryStatus — order stays active for admin to re-sync,
    // matching the Shiprocket webhook's cancellation handling.
    const statusMapping = {
        "In Transit": "SHIPPED",
        Dispatched: "SHIPPED",
        "Out for Delivery": "SHIPPED",
        Delivered: "DELIVERED",
    };

    if (statusMapping[status]) {
        updateData.status = statusMapping[status];
    }

    await prisma.order.update({ where: { id: order.id }, data: updateData });

    if (order.tracking) {
        await prisma.tracking.update({
            where: { orderId: order.id },
            data: {
                status: status === "Delivered" ? "DELIVERED" : "IN_TRANSIT",
                ...(status === "Delivered" && { deliveredAt: new Date() }),
            },
        });

        await prisma.trackingUpdate.create({
            data: {
                trackingId: order.tracking.id,
                status: status || "UPDATE",
                location: statusLocation || "",
                description: status || "Status update",
            },
        });
    }

    res.status(200).json({ status: "ok" });
});
