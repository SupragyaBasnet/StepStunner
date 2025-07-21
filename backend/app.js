const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const session = require('express-session');

// Import security middleware
const {
  securityHeaders,
  generalLimiter,
  authLimiter,
  sanitizeInput,
  activityLogger,
  sessionConfig
} = require('./middleware/security');

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Apply security headers
app.use(securityHeaders);

// Apply session management
app.use(session(sessionConfig));

// Apply general rate limiting
app.use(generalLimiter);

// Apply activity logging
app.use(activityLogger);

// Apply input sanitization
app.use(sanitizeInput);

app.use(express.json({ limit: '5mb' }));

// Serve static images from frontend assets
app.use('/heels', express.static(path.join(__dirname, '../frontend/src/assets/heels')));
app.use('/flats', express.static(path.join(__dirname, '../frontend/src/assets/flats')));
app.use('/sneakers', express.static(path.join(__dirname, '../frontend/src/assets/sneakers')));
app.use('/products', express.static(path.join(__dirname, '../frontend/src/assets/products')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));

// Health check route
app.get('/', (req, res) => {
  console.log("server is running");
  res.send('StepStunner backend is running!');
});

const authRoutes = require('./routes/auth');
// Apply auth-specific rate limiting to auth routes
app.use('/api/auth', authLimiter, authRoutes);

const productRoutes = require('./routes/product');
app.use('/api/products', productRoutes);

const securityRoutes = require('./routes/security');
app.use('/api/security', securityRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

module.exports = app;
