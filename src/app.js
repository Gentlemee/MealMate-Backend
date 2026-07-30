const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const riderRoutes = require('./routes/riderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cart.routes');
const vendorRoutes = require('./routes/vendorRoutes');
const kitchenRoutes = require('./routes/kitchenRoutes');
const mealRoutes = require('./routes/mealRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

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
app.use('/api/vendors', vendorRoutes);
app.use('/api/kitchens', kitchenRoutes);
app.use('/api/meals', mealRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
