const express = require('express');
const app = express();
require('dotenv').config();

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));

// Health check route
app.get('/', (req, res) => {
  console.log("server is running");
  res.send('StepStunner backend is running!');
});

// app.use('/api', (req, res, next) => {
//   res.set('Cache-Control', 'no-store');
//   next();
// });
// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const productRoutes = require('./routes/product');
app.use('/api/products', productRoutes);




module.exports = app;
