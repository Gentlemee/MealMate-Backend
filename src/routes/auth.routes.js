import express from "express";
import { register, login, forgotPassword, resetPassword, logout, getProfile, updateProfile, } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js"; 
import { authorize } from "../middleware/auth.middleware.js";
import { registerValidation, loginValidation, updateProfileValidation, validate, } from "../validators/auth.validator.js";


const router = express.Router();

// Public Routes
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/admin-test", authenticate, authorize("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: `Welcome Admin ${req.user.fullName}!`,
    });
  }
);

// Protected Routes
router.post("/logout", authenticate, logout);
router.get("/profile", authenticate, getProfile);
router.patch("/profile", authenticate, updateProfile);

export default router;