import express from "express";
import { registerRiderProfile, getRiderProfile, toggleAvailability } from "../controllers/riderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/register", protect, registerRiderProfile);
router.get("/me", protect, getRiderProfile);
router.patch("/availability", protect, toggleAvailability);

export default router;
