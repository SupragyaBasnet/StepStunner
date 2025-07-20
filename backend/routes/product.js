const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken'); // Added missing import for jwt

router.get('/', productController.getAllProducts);

// Get trending products (top 6 by rating and reviews) - MUST be before /:id route
router.get('/trending', async (req, res) => {
  try {
    const trendingProducts = await Product.find()
      .sort({ rating: -1, reviews: -1 })
      .limit(6);
    res.json(trendingProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle orders - supports both userId query parameter and authenticated requests
router.get('/orders', auth, async (req, res) => {
  console.log('getting user orders - route hit');
  
  try {
    console.log('Order model:', typeof Order);
    console.log('About to query database...');
    
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price image category',
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log('Orders found:', orders.length);
    console.log('First order:', orders[0]);

    // Clean up orders to avoid frontend errors
    const cleanedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: item.product || null, // fallback if product deleted
      })),
    }));

    console.log('Sending response with', cleanedOrders.length, 'orders');
    res.json(cleanedOrders);
  } catch (err) {
    console.error('Get user orders error - Full error:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error fetching orders',
      error: err.message 
    });
  }
});

router.get('/:id', productController.getProductById);
router.post('/', auth, productController.createProduct);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);
router.post('/order', auth, productController.placeOrder);

router.delete('/orders', auth, productController.deleteAllUserOrders);

// Admin route for getting all orders
router.get('/all-orders', auth, productController.getAllOrders);
router.post('/add-or-get', productController.addOrGetProduct);

// Add review to an order
router.put('/orders/:orderId/review', auth, async (req, res) => {
  const { orderId } = req.params;
  const { review, rating } = req.body;
  if (!review || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Review and rating (1-5) are required.' });
  }
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, user: req.user.id },
      { review, rating },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found or not yours.' });

    // Update product rating and review count
    if (order && order.items) {
      for (const item of order.items) {
        if (item.product) {
          // Find all orders with a review for this product
          const reviewedOrders = await Order.find({
            'items.product': item.product,
            rating: { $exists: true, $ne: null }
          });
          // Gather all ratings for this product
          let ratings = [];
          reviewedOrders.forEach(ord => {
            ord.items.forEach(ordItem => {
              if (ordItem.product && ordItem.product.toString() === item.product.toString() && ord.rating) {
                ratings.push(ord.rating);
              }
            });
          });
          if (ratings.length > 0) {
            const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
            await Product.findByIdAndUpdate(item.product, {
              rating: avgRating,
              reviews: ratings.length
            });
          }
        }
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/find?category=...&name=...
router.get('/find', async (req, res) => {
  const { category, name } = req.query;
  if (!category || !name) {
    return res.status(400).json({ message: 'Category and name are required.' });
  }
  try {
    const product = await Product.findOne({
      category: { $regex: new RegExp(`^${category}$`, 'i') },
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;