import express from "express";

import {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createAddress);

router.get("/", protect, getAddresses);

router.put("/:id", protect, updateAddress);

router.delete("/:id", protect, deleteAddress);

export default router;