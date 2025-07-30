const mongoose = require('mongoose');
const ActivityLog = require('./models/ActivityLog');
const User = require('./models/User');
require('dotenv').config();

async function testLogFiltering() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/StepStunner');
    console.log('✅ Connected to MongoDB');

    // Get users
    const users = await User.find().limit(3);
    console.log(`📦 Found ${users.length} users:`, users.map(u => `${u.name} (${u.email})`));

    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }

    // Clear existing logs
    await ActivityLog.deleteMany({});
    console.log('🗑️ Cleared existing logs');

    // Create test logs for each user
    const testLogs = [];
    
    for (let i = 0; i < 10; i++) {
      const user = users[i % users.length]; // Cycle through users
      const actions = ['login', 'logout', 'register', 'profile_update'];
      const action = actions[i % actions.length];
      
      const log = {
        userId: user._id,
        action: action,
        method: 'POST',
        url: `/api/auth/${action}`,
        details: {
          url: `/api/auth/${action}`,
          method: 'POST',
          userAgent: 'Test Browser',
          userEmail: user.email,
          userName: user.name
        },
        ipAddress: '192.168.1.100',
        status: 'success',
        timestamp: new Date(Date.now() - i * 60000) // Each log 1 minute apart
      };
      
      testLogs.push(log);
    }
    
    await ActivityLog.insertMany(testLogs);
    console.log(`✅ Created ${testLogs.length} test logs`);

    // Test filtering by each user
    for (const user of users) {
      console.log(`\n🔍 Testing filter for user: ${user.name} (${user.email})`);
      
      const logs = await ActivityLog.find({ userId: user._id })
        .populate('userId', 'name email');
      
      console.log(`📊 Found ${logs.length} logs for this user`);
      logs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.userId?.name} - ${log.action} - ${log.url}`);
      });
    }

    // Test the API endpoint
    const axios = require('axios');
    const BASE_URL = 'http://localhost:5000';
    
    try {
      // First, get a token (you'll need to login first)
      console.log('\n🌐 Testing API endpoint...');
      console.log('📡 To test the API, login and then visit:');
      console.log(`   ${BASE_URL}/api/admin/logs?user=${users[0]._id}`);
      
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

testLogFiltering(); 