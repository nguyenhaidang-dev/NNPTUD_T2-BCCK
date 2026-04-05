const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan'); // Thêm thư viện dòm ngó API
require('dotenv').config();

const app = express();

// Middleware
app.use(morgan('dev')); // Bật chế độ in log ra terminal cực đẹp
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drugstore_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/users', require('./routes/user.route'));
app.use('/api/products', require('./routes/product.route'));
app.use('/api/orders', require('./routes/order.route'));
app.use('/api/prescriptions', require('./routes/prescription.route'));
app.use('/api/categories', require('./routes/category.route'));
app.use('/api/manufacturers', require('./routes/manufacturer.route'));
app.use('/api/marketing', require('./routes/marketing.route'));
app.use('/api/roles', require('./routes/role.route'));
app.use('/api/settings', require('./routes/setting.route'));
app.use('/api/logs', require('./routes/log.route'));
app.use('/api/reports', require('./routes/report.route'));
// app.use('/api/inventory', require('./routes/inventoryRoutes'));

// Basic API test route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Drugstore Management System server running on port ${PORT}`);
});
