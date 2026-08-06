import express from "express";
import { createKitchen, getKitchens, updateKitchen, deleteKitchen } from "../controllers/kitchenController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateObjectIdParam, validateKitchenCreate, validateKitchenUpdate } from "../middleware/validateRequest.js";

const router = express.Router();
router.route("/").post(protect, authorize("vendor", "admin"), validateKitchenCreate, createKitchen).get(getKitchens);
router.route("/:id").patch(protect, authorize("vendor", "admin"), validateObjectIdParam("id"), validateKitchenUpdate, updateKitchen).delete(protect, authorize("vendor", "admin"), validateObjectIdParam("id"), deleteKitchen);

export default router;
