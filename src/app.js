const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const riderRoutes = require('./routes/riderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes  = require('./routes/cart.routes');
const favouriteRoutes = require("./routes/favourite.routes");
const mealRoutes = require('./routes/meal'); // Pointing to meal.js

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Enable CORS for cross-origin requests
app.use(cors());

// Middleware to parse incoming JSON
app.use(express.json());

// Base test route
app.get('/', (req, res) => {
  res.send('MealMate API is running...');
});

// Mount routes
app.use('/api/riders', riderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/meals', mealRoutes); // Mounted meal routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});