const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const riderRoutes = require('./routes/riderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});