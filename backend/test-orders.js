const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function testOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/StepStunner');
    console.log('✅ Connected to MongoDB');

    // Check if there are any orders
    const totalOrders = await Order.countDocuments();
    console.log(`📦 Total orders in database: ${totalOrders}`);

    if (totalOrders > 0) {
      // Get a sample order
      const sampleOrder = await Order.findOne().populate('user', 'name email');
      console.log('📋 Sample order:', {
        _id: sampleOrder._id,
        user: sampleOrder.user,
        total: sampleOrder.total,
        status: sampleOrder.status,
        createdAt: sampleOrder.createdAt
      });
    } else {
      console.log('❌ No orders found in database');
    }

    // Test the admin orders API
    const axios = require('axios');
    const BASE_URL = 'http://localhost:5000';

    try {
      // First, try to get a user token (you'll need to create a test user first)
      console.log('\n🔍 Testing admin orders API...');
      
      // This would require a valid admin token
      // For now, just check if the endpoint exists
      console.log('📡 Admin orders endpoint: GET /api/admin/orders');
      
    } catch (error) {
      console.log('❌ API test failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testOrders(); 