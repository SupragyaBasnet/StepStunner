const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

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
app.use('/api/auth', authRoutes);

const productRoutes = require('./routes/product');
app.use('/api/products', productRoutes);




module.exports = app;
