const express = require('express');
const mongoose = require('mongoose');
const ActivityLog = require('./models/ActivityLog');
const User = require('./models/User');
require('dotenv').config();

// Create a simple Express app to test the API
const app = express();

async function testFrontendAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/StepStunner');
    console.log('✅ Connected to MongoDB');

    // Simulate the exact API call that the frontend makes
    const { search = '', page = 1, limit = 10, user } = { search: '', page: 1, limit: 10, user: 'all' };
    
    console.log('🔍 Simulating frontend API call with params:', { search, page, limit, user });
    
    // Build query (same as backend)
    const query = {};
    
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { 'details.url': { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (user && user !== 'all') {
      const mongoose = require('mongoose');
      try {
        query.userId = mongoose.Types.ObjectId(user);
      } catch (error) {
        if (mongoose.Types.ObjectId.isValid(user)) {
          query.userId = user;
        }
      }
    }
    
    console.log('🔍 Final query:', JSON.stringify(query, null, 2));
    
    // Execute the same query as the backend
    const logs = await ActivityLog.find(query)
      .populate('userId', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ timestamp: -1 });
      
    const total = await ActivityLog.countDocuments(query);
    
    console.log(`📊 API returned ${logs.length} logs out of ${total} total`);
    
    // Simulate what the frontend receives
    const response = { logs, total };
    console.log('\n📤 Response that frontend receives:');
    console.log(JSON.stringify(response, null, 2));
    
    // Test what the frontend would display
    console.log('\n👥 What frontend should display for USER column:');
    logs.forEach((log, index) => {
      const userDisplay = log.userId && log.userId.name && log.userId.email 
        ? `${log.userId.name} (${log.userId.email})`
        : log.details?.userEmail 
          ? `${log.details.userName || 'User'} (${log.details.userEmail})`
          : 'Guest User (guest@stepstunner.com)';
      
      console.log(`  ${index + 1}. ${userDisplay} - Action: ${log.action}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testFrontendAPI(); 