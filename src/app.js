import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import reviewRoutes from "./routes/review.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);

export default app;