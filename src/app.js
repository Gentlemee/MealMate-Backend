import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import mealRoutes from "./routes/mealRoutes.js";
import reviewRoutes from "./routes/review.routes.js";
import searchRoutes from "./routes/search.routes.js";
import favouriteRoutes from "./routes/favourite.routes.js";
import addressRoutes from "./routes/address.routes.js";

import riderRoutes from "./routes/riderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import kitchenRoutes from "./routes/kitchenRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("MealMate API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/riders", riderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/kitchens", kitchenRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
