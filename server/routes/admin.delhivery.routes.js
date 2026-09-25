/**
 * Delhivery Admin Routes
 */

import express from "express";
import { isAdmin } from "../middlewares/auth.middleware.js";
import {
    getSettings,
    updateSettings,
    testConnection,
    getPickupAddresses,
    createPickupAddress,
    updatePickupAddress,
    deletePickupAddress,
    syncPickupAddress,
    checkOrderServiceability,
    getRateForOrder,
    getOrderWarehouseOptions,
    syncOrderToDelhivery,
    getOrderTracking,
    cancelShipment,
    getShippingLabel,
    downloadShippingLabel,
    getOrderInvoice,
    downloadOrderInvoice,
} from "../controllers/admin.delhivery.controller.js";

const router = express.Router();

// Settings routes
router.get("/settings", isAdmin, getSettings);
router.put("/settings", isAdmin, updateSettings);
router.post("/test-connection", isAdmin, testConnection);

// Pickup address routes
router.get("/pickup-addresses", isAdmin, getPickupAddresses);
router.post("/pickup-addresses", isAdmin, createPickupAddress);
router.put("/pickup-addresses/:id", isAdmin, updatePickupAddress);
router.post("/pickup-addresses/:id/sync", isAdmin, syncPickupAddress);
router.delete("/pickup-addresses/:id", isAdmin, deletePickupAddress);

// Serviceability / rate check
router.post("/serviceability", isAdmin, checkOrderServiceability);

// Order operations
router.get("/orders/:orderId/rate", isAdmin, getRateForOrder);
router.get("/orders/:orderId/warehouse-options", isAdmin, getOrderWarehouseOptions);
router.post("/orders/:orderId/sync", isAdmin, syncOrderToDelhivery);
router.get("/orders/:orderId/tracking", isAdmin, getOrderTracking);
router.post("/orders/:orderId/cancel", isAdmin, cancelShipment);
router.get("/orders/:orderId/label", isAdmin, getShippingLabel);
router.get("/orders/:orderId/label/download", isAdmin, downloadShippingLabel);
router.get("/orders/:orderId/invoice", isAdmin, getOrderInvoice);
router.get("/orders/:orderId/invoice/download", isAdmin, downloadOrderInvoice);

export default router;
