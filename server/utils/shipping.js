/**
 * Courier dispatcher — routes shipping operations to Shiprocket or Delhivery
 * based on the site-wide default courier (ShiprocketSettings.defaultCourierProvider)
 * or an order's already-chosen courierProvider.
 */

import { prisma } from "../config/db.js";
import * as shiprocket from "./shiprocket.js";
import * as delhivery from "./delhivery.js";

/**
 * Auto-sync a freshly placed order to whichever courier is configured as the
 * site-wide default. Called right after order/payment creation — mirrors the
 * previous direct `shiprocket.processOrderForShipping` call sites.
 */
export async function dispatchOrderForShipping(orderId) {
    const settings = await prisma.shiprocketSettings.findFirst();
    const defaultProvider = settings?.defaultCourierProvider || "SHIPROCKET";

    if (defaultProvider === "DELHIVERY") {
        return delhivery.processOrderForShipping(orderId);
    }
    return shiprocket.processOrderForShipping(orderId);
}

/**
 * Cancel whichever courier's shipment is present on the order (an order can
 * only ever be synced to one courier at a time).
 */
export async function dispatchCancelShipment(order) {
    if (order.delhiveryWaybill) {
        return delhivery.cancelDelhiveryShipment(order.delhiveryWaybill);
    }
    if (order.shiprocketOrderId) {
        return shiprocket.cancelShiprocketOrder(order.shiprocketOrderId);
    }
    return null;
}

/**
 * Process a return (reverse pickup) with whichever courier fulfilled the order.
 */
export async function dispatchReturn(orderId, reason) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { courierProvider: true },
    });

    if (order?.courierProvider === "DELHIVERY") {
        return delhivery.processDelhiveryReturn(orderId, reason);
    }
    return shiprocket.processShiprocketReturn(orderId, reason);
}
