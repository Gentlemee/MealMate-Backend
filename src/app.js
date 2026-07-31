const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const riderRoutes = require('./routes/riderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes  = require('./routes/cart.routes');
const orderRoutes = require("./routes/orderRoutes");
const vendorRoutes = require('./routes/vendorRoutes');
const kitchenRoutes = require('./routes/kitchenRoutes');
const mealRoutes = require('./routes/mealRoutes');
const paymentRoutes = require("./routes/paymentRoutes");
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const favouriteRoutes = require("./routes/favourite.routes");
const authRoutes = require('./routes/auth'); // Added auth routes import

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base test route
app.get('/', (req, res) => {
  res.send('MealMate API is running...');
});

// Mount routes
app.use('/api/riders', riderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/kitchens', kitchenRoutes);
app.use('/api/meals', mealRoutes);
app.use("/api/payments", paymentRoutes);
app.use(notFound);
app.use(errorHandler);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/meals', mealRoutes); // Mounted meal routes
app.use('/api/auth', authRoutes); // Mounted auth routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
