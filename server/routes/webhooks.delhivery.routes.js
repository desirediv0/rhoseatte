/**
 * Delhivery public webhook route.
 * Mounted separately from admin.delhivery.routes.js so only this one
 * endpoint is public — unlike Shiprocket's webhook, which is reachable by
 * accidentally re-mounting its whole admin router at a second base path.
 */

import express from "express";
import { handleWebhook } from "../controllers/admin.delhivery.controller.js";

const router = express.Router();

router.post("/webhook", handleWebhook);

export default router;
