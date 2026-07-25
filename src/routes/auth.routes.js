import express from "express";
import { register, login, forgotPassword, resetPassword, logout, getProfile, updateProfile, } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js"; 
import { registerValidation, loginValidation, validate, } from "../validators/auth.validator.js";


const router = express.Router();

// Public Routes
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected Routes
router.post("/logout", authenticate, logout);
router.get("/profile", authenticate, getProfile);
router.patch("/profile", authenticate, updateProfile);

export default router;