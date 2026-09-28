import express from "express";
import {
  getOrders,
  getOrderFilterCounts,
  getOrderById,
  downloadOrderInvoice,
  downloadBulkInvoices,
  getInvoiceSettings,
  updateInvoiceSettings,
  updateOrderStatus,
  updateTracking,
  createOrder,
  processPayment,
  recoverOrphanedPayment,
  getOrderStats,
  cleanupInvalidPartnerEarnings,
} from "../controllers/admin.order.controller.js";
import {
  verifyAdminJWT,
  hasPermission,
} from "../middlewares/admin.middleware.js";
import { reconcileMissingOrders } from "../controllers/payment.controller.js";

const router = express.Router();

// Order routes
router.get(
  "/orders",
  verifyAdminJWT,
  hasPermission("orders", "read"),
  getOrders
);

router.get(
  "/orders/filter-counts",
  verifyAdminJWT,
  hasPermission("orders", "read"),
  getOrderFilterCounts
);

// Bulk invoice download must come before /orders/:orderId so "invoices"
// isn't captured as an :orderId param.
router.get(
  "/orders/invoices/bulk",
  verifyAdminJWT,
  hasPermission("orders", "read"),
  downloadBulkInvoices
);

router.get(
  "/orders/invoice-settings",
  verifyAdminJWT,
  hasPermission("orders", "read"),
  getInvoiceSettings
);

router.put(
  "/orders/invoice-settings",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  updateInvoiceSettings
);

// Find Razorpay payments that were captured (money taken) but have no
// matching order in our DB — e.g. from a server crash or a cart-emptied
// race during payment verification. ?days=N controls the lookback window
// (default 7). Must come before /orders/:orderId or Express matches
// "reconcile-payments" as an :orderId value.
router.get(
  "/orders/reconcile-payments",
  verifyAdminJWT,
  hasPermission("orders", "read"),
  reconcileMissingOrders
);

// Recover an orphaned Razorpay payment into a real (PAID) order, with
// confirmation email + courier dispatch — used from the Missing Orders
// Check panel once the admin knows what the customer actually ordered.
router.post(
  "/orders/recover-payment",
  verifyAdminJWT,
  hasPermission("orders", "create"),
  recoverOrphanedPayment
);

router.get(
  "/orders/:orderId",
  verifyAdminJWT,
  hasPermission("orders", "read"),
  getOrderById
);

router.get(
  "/orders/:orderId/invoice/download",
  verifyAdminJWT,
  hasPermission("orders", "read"),
  downloadOrderInvoice
);

router.patch(
  "/orders/:orderId/status",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  updateOrderStatus
);

router.patch(
  "/orders/:orderId/tracking",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  updateTracking
);

router.post(
  "/orders",
  verifyAdminJWT,
  hasPermission("orders", "create"),
  createOrder
);

router.post(
  "/orders/:orderId/process-payment",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  processPayment
);

// Order statistics
router.get(
  "/orders-stats",
  verifyAdminJWT,
  hasPermission("dashboard", "read"),
  getOrderStats
);

// Cleanup invalid partner earnings (Admin only)
router.post(
  "/cleanup-partner-earnings",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  cleanupInvalidPartnerEarnings
);

export default router;
