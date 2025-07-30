const mongoose = require('mongoose');
const ActivityLog = require('./models/ActivityLog');
const User = require('./models/User');
require('dotenv').config();

async function createRealisticLogs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/StepStunner');
    console.log('✅ Connected to MongoDB');

    // Get some users
    const users = await User.find().limit(3);
    console.log(`📦 Found ${users.length} users`);

    if (users.length === 0) {
      console.log('❌ No users found. Please create some users first.');
      return;
    }

    // Clear existing logs
    await ActivityLog.deleteMany({});
    console.log('🗑️ Cleared existing logs');

    const sampleLogs = [];
    
    const actions = [
      'login', 'logout', 'register', 'password_change', 'profile_update', 
      'order_create', 'payment_success', 'product_view', 'user_management', 
      'log_view', 'get', 'post', 'put', 'delete'
    ];
    
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    
    const urls = [
      '/api/auth/login',
      '/api/auth/register', 
      '/api/auth/logout',
      '/api/users/profile',
      '/api/users/password',
      '/api/products',
      '/api/products/123',
      '/api/orders',
      '/api/orders/create',
      '/api/admin/dashboard',
      '/api/admin/users',
      '/api/admin/orders',
      '/api/admin/logs',
      '/api/admin/products',
      '/api/cart/add',
      '/api/cart/remove',
      '/api/payment/process',
      '/api/mfa/setup',
      '/api/mfa/verify'
    ];
    
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
    ];
    
    const ipAddresses = [
      '192.168.1.100',
      '192.168.1.101', 
      '192.168.1.102',
      '10.0.0.50',
      '172.16.0.25',
      '127.0.0.1'
    ];

    console.log('📝 Creating realistic logs...');
    
    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const url = urls[Math.floor(Math.random() * urls.length)];
      const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
      const ipAddress = ipAddresses[Math.floor(Math.random() * ipAddresses.length)];
      
      // Create realistic timestamp (last 7 days)
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      // Ensure all logs have user information
      const log = {
        userId: user._id, // Always include user ID
        action: action,
        method: method,
        url: url,
        details: {
          url: url,
          method: method,
          userAgent: userAgent,
          referer: 'http://localhost:3000',
          responseStatus: 200,
          requestBody: method === 'POST' || method === 'PUT',
          userEmail: user.email, // Include user email in details
          userName: user.name // Include user name in details
        },
        ipAddress: ipAddress,
        status: 'success',
        userAgent: userAgent,
        timestamp: timestamp
      };
      
      sampleLogs.push(log);
    }
    
    await ActivityLog.insertMany(sampleLogs);
    console.log(`✅ Created ${sampleLogs.length} realistic logs`);
    
    // Show some sample logs
    const recentLogs = await ActivityLog.find()
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(5);
    
    console.log('\n📋 Sample logs created:');
    recentLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.userId?.name || 'Anonymous'} - ${log.action} - ${log.method} ${log.url} - ${log.ipAddress}`);
    });

  } catch (error) {
    console.error('❌ Error creating logs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createRealisticLogs(); 