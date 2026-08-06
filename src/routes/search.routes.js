import express from "express";
import { searchMeals } from "../controllers/search.controller.js";

const router = express.Router();

// Search and filter meals
router.get("/", searchMeals);

export default router;