import express from "express";
import { createVendor, getVendors, getVendorById, updateVendor, deleteVendor } from "../controllers/vendorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateObjectIdParam, validateVendorCreate, validateVendorQuery, validateVendorUpdate } from "../middleware/validateRequest.js";

const router = express.Router();
router.route("/").post(protect, authorize("vendor", "admin"), validateVendorCreate, createVendor).get(validateVendorQuery, getVendors);
router.route("/:id").get(validateObjectIdParam("id"), getVendorById).patch(protect, authorize("vendor", "admin"), validateObjectIdParam("id"), validateVendorUpdate, updateVendor).delete(protect, authorize("vendor", "admin"), validateObjectIdParam("id"), deleteVendor);

export default router;
