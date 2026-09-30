import express from "express";
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
} from "../controllers/newsletter.controller.js";

const router = express.Router();

// Public endpoint for newsletter subscription
router.post("/subscribe", subscribeNewsletter);

// Public endpoint behind the unsubscribe link in marketing emails
router.post("/unsubscribe", unsubscribeNewsletter);

export default router;
