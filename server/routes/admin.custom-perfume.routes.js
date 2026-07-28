import express from "express";
import {
  getAdminCustomPerfumeNotes,
  createCustomPerfumeNote,
  createCustomPerfumeBottle
} from "../controllers/admin.custom-perfume.controller.js";
import { verifyAdminJWT } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.use(verifyAdminJWT);

router.get("/custom-perfume/notes", getAdminCustomPerfumeNotes);
router.post("/custom-perfume/notes", createCustomPerfumeNote);
router.post("/custom-perfume/bottles", createCustomPerfumeBottle);

export default router;
