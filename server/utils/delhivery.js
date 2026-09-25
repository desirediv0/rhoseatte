/**
 * Delhivery API Service
 * Handles all communication with Delhivery's shipping API
 *
 * API Documentation: https://www.delhivery.com/business/api-documentation
 * Base URL: https://track.delhivery.com
 *
 * Unlike Shiprocket, Delhivery does not use a login call — every request is
 * authenticated with a single static API token issued from the Delhivery
 * dashboard, sent as `Authorization: Token <api_token>`.
 */

import { prisma } from "../config/db.js";
import { decrypt } from "./encryption.js";
import sendEmail from "./sendEmail.js";
import { getOrderShippedTemplate } from "../email/temp/EmailTemplate.js";

const DELHIVERY_BASE_URL = "https://track.delhivery.com";

/**
 * Get Delhivery settings from database
 */
export async function getDelhiverySettings() {
    let settings = await prisma.delhiverySettings.findFirst();

    if (!settings) {
        settings = await prisma.delhiverySettings.create({
            data: {
                isEnabled: false,
                defaultLength: 10,
                defaultBreadth: 10,
                defaultHeight: 10,
                defaultWeight: 0.5,
            },
        });
    }

    return settings;
}

/**
 * Decrypt the stored API token for use in requests.
 */
function getDecryptedToken(settings) {
    if (!settings.apiToken) return null;
    return settings.apiToken.startsWith("enc:")
        ? decrypt(settings.apiToken.replace("enc:", ""))
        : settings.apiToken;
}

/**
 * Make an authenticated request to Delhivery's API.
 * `body` is sent as query params on GET, and as `application/json` on other methods
 * (Delhivery's newer endpoints accept plain JSON; the legacy create/cancel endpoints
 * that need `format=json&data=` are built explicitly by their own functions below).
 */
async function delhiveryRequest(endpoint, method = "GET", body = null) {
    const settings = await getDelhiverySettings();
    const token = getDecryptedToken(settings);

    if (!token) {
        throw new Error("Delhivery API token not configured");
    }

    const options = {
        method,
        headers: {
            Authorization: `Token ${token}`,
            Accept: "application/json",
        },
    };

    let url = `${DELHIVERY_BASE_URL}${endpoint}`;

    if (body && method === "GET") {
        url += `${endpoint.includes("?") ? "&" : "?"}${new URLSearchParams(body)}`;
    } else if (body) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const raw = await response.text();

    let data;
    try {
        data = raw ? JSON.parse(raw) : {};
    } catch {
        // Some Delhivery endpoints (create/cancel) reply as text/plain with an
        // embedded JSON body, or plain text on success/failure.
        if (!response.ok) {
            throw new Error(`Delhivery API error ${response.status}: ${raw.slice(0, 300)}`);
        }
        return { raw };
    }

    if (!response.ok) {
        const detail =
            data.message || data.error || data.rmk || `Delhivery API error: ${response.status}`;
        throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    }

    return data;
}

/**
 * Build the `format=json&data=<encoded json>` body Delhivery's legacy
 * create/edit endpoints expect instead of a plain JSON body.
 */
async function delhiveryFormRequest(endpoint, payload) {
    const settings = await getDelhiverySettings();
    const token = getDecryptedToken(settings);

    if (!token) {
        throw new Error("Delhivery API token not configured");
    }

    const body = `format=json&data=${JSON.stringify(payload)}`;

    const response = await fetch(`${DELHIVERY_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body,
    });

    const raw = await response.text();
    let data;
    try {
        data = raw ? JSON.parse(raw) : {};
    } catch {
        if (!response.ok) {
            throw new Error(`Delhivery API error ${response.status}: ${raw.slice(0, 300)}`);
        }
        return { raw };
    }

    if (!response.ok) {
        const detail = data.message || data.error || data.rmk || `Delhivery API error: ${response.status}`;
        throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    }

    return data;
}

/**
 * Check pincode serviceability
 */
export async function checkServiceability({ pincode }) {
    return delhiveryRequest("/c/api/pin-codes/json/", "GET", {
        filter_codes: pincode,
    });
}

/**
 * Get an estimated shipping rate for a pickup/delivery pincode pair.
 * `weightGrams` — Delhivery's rate API expects weight in grams (cgm).
 * `paymentType` — "Pre-paid" or "COD".
 */
export async function getRateEstimate({
    pickupPincode,
    deliveryPincode,
    weightGrams,
    paymentType = "Pre-paid",
}) {
    return delhiveryRequest("/api/kinko/v1/invoice/charges/.json", "GET", {
        md: "E",
        ss: "Delivered",
        o_pin: pickupPincode,
        d_pin: deliveryPincode,
        cgm: weightGrams,
        pt: paymentType,
    });
}

/**
 * Create a forward shipment on Delhivery
 */
export async function createDelhiveryShipment(payload) {
    return delhiveryFormRequest("/api/cmu/create.json", payload);
}

/**
 * Cancel a shipment on Delhivery
 */
export async function cancelDelhiveryShipment(waybill) {
    return delhiveryFormRequest("/api/p/edit", {
        waybill,
        cancellation: true,
    });
}

/**
 * Track shipment by waybill number
 */
export async function trackShipment(waybill) {
    return delhiveryRequest("/api/v1/packages/json/", "GET", { waybill });
}

/**
 * Track shipment by the order's own reference number
 */
export async function trackByOrderNumber(orderNumber) {
    return delhiveryRequest("/api/v1/packages/json/", "GET", { ref_ids: orderNumber });
}

/**
 * Generate the shipping label / packing slip URL for a waybill
 */
export async function generateLabel(waybill) {
    const settings = await getDelhiverySettings();
    const token = getDecryptedToken(settings);
    if (!token) {
        throw new Error("Delhivery API token not configured");
    }
    // The packing-slip endpoint returns a PDF directly rather than a JSON URL,
    // so callers stream this URL through to the browser instead of parsing JSON.
    return `${DELHIVERY_BASE_URL}/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=true`;
}

/**
 * Register (or confirm) a warehouse as a Delhivery client warehouse.
 * Safe to call repeatedly — Delhivery's create endpoint is idempotent by name.
 */
export async function registerWarehouseOnDelhivery(warehouse) {
    const payload = {
        name: warehouse.nickname,
        registered_name: warehouse.name,
        email: warehouse.email,
        phone: String(warehouse.phone || "").replace(/\D/g, "").slice(-10),
        address: warehouse.address,
        city: warehouse.city,
        state: warehouse.state,
        country: warehouse.country || "India",
        pin: String(warehouse.pincode || ""),
    };

    try {
        await delhiveryRequest("/api/backend/clientwarehouse/create/", "POST", payload);
    } catch (err) {
        // "already exists" is fine — the warehouse is usable either way.
        console.log(`Delhivery warehouse create for "${warehouse.nickname}" warning: ${err.message}`);
    }

    return prisma.delhiveryPickupAddress.update({
        where: { id: warehouse.id },
        data: { delhiveryRegistered: true },
    });
}

/**
 * Get default pickup address from database
 */
export async function getDefaultPickupAddress() {
    return (
        (await prisma.delhiveryPickupAddress.findFirst({ where: { isDefault: true } })) ||
        (await prisma.delhiveryPickupAddress.findFirst())
    );
}

/**
 * Pick the warehouse an order should ship from — same pincode-proximity
 * scoring as Shiprocket's pickWarehouseForOrder (see server/utils/shiprocket.js).
 */
export async function pickWarehouseForOrder(order, warehouseId = null) {
    const warehouses = await prisma.delhiveryPickupAddress.findMany();

    if (warehouses.length === 0) {
        throw new Error("No pickup address configured");
    }

    if (warehouseId) {
        const chosen = warehouses.find((w) => w.id === warehouseId);
        if (!chosen) throw new Error("Selected warehouse not found");
        return { warehouse: chosen, assignedBy: "MANUAL" };
    }

    if (warehouses.length === 1) {
        return { warehouse: warehouses[0], assignedBy: "AUTO" };
    }

    const deliveryPin = String(
        order?.shippingAddress?.postalCode || order?.shippingAddress?.pincode || ""
    ).replace(/\D/g, "");

    const defaultWarehouse = warehouses.find((w) => w.isDefault) || warehouses[0];

    if (deliveryPin.length < 3) {
        return { warehouse: defaultWarehouse, assignedBy: "AUTO" };
    }

    let best = { warehouse: defaultWarehouse, score: 0 };
    for (const w of warehouses) {
        const whPin = String(w.pincode || "").replace(/\D/g, "");
        if (whPin.length < 1) continue;
        let score = 0;
        if (whPin.slice(0, 3) === deliveryPin.slice(0, 3)) score = 3;
        else if (whPin.slice(0, 2) === deliveryPin.slice(0, 2)) score = 2;
        else if (whPin.slice(0, 1) === deliveryPin.slice(0, 1)) score = 1;
        if (score > best.score) best = { warehouse: w, score };
    }

    return { warehouse: best.warehouse, assignedBy: "AUTO" };
}

async function ensurePickupAddressSynced(pickupAddress) {
    if (pickupAddress.delhiveryRegistered) {
        return pickupAddress;
    }
    try {
        return await registerWarehouseOnDelhivery(pickupAddress);
    } catch (error) {
        console.log(
            `Delhivery pickup sync failed for "${pickupAddress.nickname}": ${error.message}. ` +
            `Falling back to sending the nickname directly.`
        );
        return pickupAddress;
    }
}

const splitName = (fullName) => {
    if (!fullName) return { first: "Customer", last: "Name" };
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return { first: parts[0], last: "Customer" };
    const first = parts.slice(0, -1).join(" ");
    const last = parts[parts.length - 1];
    return { first, last };
};

const cleanPhone = (phone) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.length > 10) return digits.slice(-10);
    return digits;
};

/**
 * Build the shipment payload Delhivery's /api/cmu/create.json expects
 * from our Order — mirrors buildShiprocketOrderPayload in shiprocket.js.
 */
export async function buildDelhiveryShipmentPayload(order, warehouseId = null) {
    const settings = await getDelhiverySettings();

    const { warehouse: pickupAddress, assignedBy } = await pickWarehouseForOrder(
        order,
        warehouseId
    );

    if (!pickupAddress) {
        throw new Error("No pickup address configured");
    }

    const syncedPickupAddress = await ensurePickupAddressSynced(pickupAddress);
    order.__chosenWarehouse = { warehouse: pickupAddress, assignedBy };

    const shippingAddress = order.shippingAddress;
    if (!shippingAddress) {
        throw new Error("No shipping address for order");
    }

    let totalWeight = 0; // kg
    for (const item of order.items) {
        const variant = item.variant;
        const weight = variant.shippingWeight || settings.defaultWeight;
        totalWeight += weight * item.quantity;
    }
    const weightGrams = Math.round(totalWeight * 1000);

    const billingName = splitName(shippingAddress.name || order.user.name);
    const cleanedPhone = cleanPhone(shippingAddress.phone || order.user.phone || "");

    const shipment = {
        name: `${billingName.first} ${billingName.last}`.trim(),
        add: shippingAddress.street,
        pin: shippingAddress.postalCode,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country || "India",
        phone: cleanedPhone,
        order: order.orderNumber,
        payment_mode: order.paymentMethod === "CASH" ? "COD" : "Prepaid",
        cod_amount: order.paymentMethod === "CASH" ? parseFloat(order.total) : 0,
        total_amount: parseFloat(order.total),
        products_desc: order.items
            .map((item) => item.product.name)
            .filter(Boolean)
            .join(", "),
        quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
        weight: weightGrams,
        shipment_width: settings.defaultBreadth,
        shipment_height: settings.defaultHeight,
        shipping_mode: "Surface",
        address_type: "home",
    };

    const payload = {
        shipments: [shipment],
        pickup_location: {
            name: syncedPickupAddress.nickname,
        },
    };

    return payload;
}

/**
 * Top-level orchestration: build payload → create shipment → save waybill.
 * Respects bookingMode the same way processOrderForShipping does in
 * server/utils/shiprocket.js.
 */
export async function processOrderForShipping(orderId, isManualSync = false, warehouseId = null) {
    const settings = await getDelhiverySettings();

    if (!isManualSync && settings.bookingMode === "MANUAL") {
        console.log("Delhivery booking mode is MANUAL, skipping auto-sync. Admin can manually sync from order details.");
        return null;
    }

    if (!settings.isEnabled && settings.bookingMode !== "AUTO" && !isManualSync) {
        console.log("Delhivery is disabled and not in AUTO mode, skipping shipping integration");
        return null;
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            shippingAddress: true,
            items: {
                include: {
                    product: true,
                    variant: true,
                },
            },
        },
    });

    if (!order) {
        throw new Error("Order not found");
    }

    try {
        const payload = await buildDelhiveryShipmentPayload(order, warehouseId);
        const response = await createDelhiveryShipment(payload);

        const packageResult = response?.packages?.[0];
        if (!packageResult || packageResult.status !== "Success") {
            const remark = packageResult?.remarks?.join?.(", ") || packageResult?.remarks || "Unknown error";
            throw new Error(`Delhivery shipment creation failed: ${remark}`);
        }

        const waybill = packageResult.waybill;
        const chosen = order.__chosenWarehouse;

        await prisma.order.update({
            where: { id: orderId },
            data: {
                courierProvider: "DELHIVERY",
                delhiveryWaybill: waybill,
                delhiveryOrderId: String(response?.upload_wbn || order.orderNumber),
                delhiveryStatus: "CREATED",
                ...(chosen
                    ? {
                        delhiveryWarehouseId: chosen.warehouse.id,
                        delhiveryWarehouseNickname: chosen.warehouse.nickname,
                        delhiveryWarehouseAssignedBy: chosen.assignedBy,
                    }
                    : {}),
            },
        });

        // Send tracking email to customer
        try {
            const user = await prisma.user.findUnique({
                where: { id: order.userId },
                select: { email: true, name: true },
            });

            if (user && user.email) {
                const trackingEmailData = {
                    userName: user.name || "Customer",
                    orderNumber: order.orderNumber,
                    awbCode: waybill,
                    courierName: "Delhivery",
                    estimatedDelivery: null,
                    shippingAddress: order.shippingAddress,
                };

                await sendEmail({
                    email: user.email,
                    subject: `Your Order #${order.orderNumber} Has Been Shipped! - Track with Waybill: ${waybill}`,
                    html: getOrderShippedTemplate(trackingEmailData),
                });
            }
        } catch (emailError) {
            console.error("Failed to send Delhivery tracking email:", emailError.message);
        }

        return response;
    } catch (error) {
        console.error("Failed to process order for Delhivery:", error);
        throw error;
    }
}

/**
 * Process return for a Delhivery order — reverse pickup, mirrors
 * processShiprocketReturn in server/utils/shiprocket.js.
 */
export async function processDelhiveryReturn(orderId, returnReason = "Customer Return") {
    const settings = await getDelhiverySettings();

    if (!settings.isEnabled) {
        console.log("Delhivery is disabled, skipping return processing");
        return null;
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            shippingAddress: true,
            items: {
                include: {
                    product: true,
                    variant: true,
                },
            },
        },
    });

    if (!order || !order.delhiveryWaybill) {
        console.log("Order not found or no Delhivery waybill");
        return null;
    }

    try {
        const pickupAddress = await getDefaultPickupAddress();
        if (!pickupAddress) {
            throw new Error("No pickup address configured");
        }

        const billingName = splitName(order.shippingAddress.name || order.user.name);
        const cleanedPhone = cleanPhone(order.shippingAddress.phone || order.user.phone || "");

        // Reverse pickup: customer's address becomes the pickup point, the
        // warehouse becomes the delivery destination.
        const returnShipment = {
            name: `${billingName.first} ${billingName.last}`.trim(),
            add: order.shippingAddress.street,
            pin: order.shippingAddress.postalCode,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            country: order.shippingAddress.country || "India",
            phone: cleanedPhone,
            order: `${order.orderNumber}-RET`,
            payment_mode: "Pickup",
            return_pin: pickupAddress.pincode,
            return_city: pickupAddress.city,
            return_state: pickupAddress.state,
            return_country: pickupAddress.country || "India",
            return_add: pickupAddress.address,
            return_phone: cleanPhone(pickupAddress.phone),
            return_name: pickupAddress.name,
            products_desc: order.items.map((item) => item.product.name).filter(Boolean).join(", "),
            quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
        };

        const payload = {
            shipments: [returnShipment],
            pickup_location: { name: pickupAddress.nickname },
        };

        const response = await createDelhiveryShipment(payload);

        await prisma.order.update({
            where: { id: orderId },
            data: {
                delhiveryStatus: "RETURN_INITIATED",
            },
        });

        console.log(`Delhivery return created for order ${order.orderNumber}`);
        return response;
    } catch (error) {
        console.error("Failed to create Delhivery return:", error.message);
        await prisma.order.update({
            where: { id: orderId },
            data: { delhiveryStatus: "RETURN_APPROVED" },
        });
        return null;
    }
}
