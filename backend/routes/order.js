const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Get all orders (admin only)
router.get('/all', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  
  try {
    const orders = await Order.find()
      .populate({
        path: 'user',
        select: 'name email phone',
      })
      .populate({
        path: 'items.product',
        select: 'name price image category',
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Clean up orders to avoid frontend errors
    const cleanedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: item.product || null, // fallback if product deleted
      })),
    }));

    res.json(cleanedOrders);
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ message: 'Server error fetching all orders' });
  }
});

// Get all orders for the logged-in user (with product info)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price image category',
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 })
      .lean();
    // Clean up items to always have product info or null
    const cleanedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: item.product || null,
      })),
    }));
    res.json(cleanedOrders);
  } catch (err) {
    console.error('Order history fetch error:', err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Get details for a specific order
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price image category',
        options: { strictPopulate: false },
      })
      .lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Order detail fetch error:', err);
    res.status(500).json({ message: 'Server error fetching order details' });
  }
});

// Add review/rating to an order
router.put('/:orderId/review', auth, async (req, res) => {
  const { review, rating } = req.body;
  if (!review || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Review and rating (1-5) are required.' });
  }
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, user: req.user.id },
      { review, rating },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found or not yours.' });

    // Update product rating and review count (copied from product.js)
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
    console.error('Order review error:', err);
    res.status(500).json({ message: 'Server error adding review' });
  }
});

module.exports = router; 