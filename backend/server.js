require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Debug: Log environment variables and file path
console.log('Current directory:', __dirname);
console.log('Looking for .env at:', __dirname + '/.env');
console.log('Environment Variables:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'exists' : 'undefined',
  JWT_SECRET: process.env.JWT_SECRET ? 'exists' : 'undefined',
  PORT: process.env.PORT || 'undefined'
});

const { MONGODB_URI, PORT } = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Expense Tracking API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 