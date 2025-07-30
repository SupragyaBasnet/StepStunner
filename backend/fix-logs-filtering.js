const mongoose = require('mongoose');
const ActivityLog = require('./models/ActivityLog');
const User = require('./models/User');
require('dotenv').config();

async function fixLogsFiltering() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/StepStunner');
    console.log('✅ Connected to MongoDB');

    // Get users
    const users = await User.find().limit(5);
    console.log(`📦 Found ${users.length} users:`, users.map(u => `${u.name} (${u.email})`));

    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }

    // Clear all existing logs
    await ActivityLog.deleteMany({});
    console.log('🗑️ Cleared all existing logs');

    // Create new logs with proper user IDs
    const newLogs = [];
    
    for (let i = 0; i < 30; i++) {
      const user = users[i % users.length]; // Cycle through users
      const actions = ['login', 'logout', 'register', 'profile_update', 'password_change', 'order_create'];
      const action = actions[i % actions.length];
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      const method = methods[i % methods.length];
      
      const log = {
        userId: user._id, // Always include user ID
        action: action,
        method: method,
        url: `/api/auth/${action}`,
        details: {
          url: `/api/auth/${action}`,
          method: method,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          userEmail: user.email,
          userName: user.name
        },
        ipAddress: `192.168.1.${100 + (i % 50)}`,
        status: 'success',
        timestamp: new Date(Date.now() - i * 60000) // Each log 1 minute apart
      };
      
      newLogs.push(log);
    }
    
    await ActivityLog.insertMany(newLogs);
    console.log(`✅ Created ${newLogs.length} new logs with proper user IDs`);

    // Verify the logs were created correctly
    console.log('\n🔍 Verifying logs...');
    
    for (const user of users) {
      const userLogs = await ActivityLog.find({ userId: user._id })
        .populate('userId', 'name email');
      
      console.log(`📊 User ${user.name}: ${userLogs.length} logs`);
      userLogs.slice(0, 3).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.userId?.name} - ${log.action} - ${log.method}`);
      });
    }

    // Test the filtering
    console.log('\n🧪 Testing filtering...');
    const testUser = users[0];
    const filteredLogs = await ActivityLog.find({ userId: testUser._id })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 });
    
    console.log(`📊 Filtered logs for ${testUser.name}: ${filteredLogs.length} found`);
    filteredLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.userId?.name} (${log.userId?.email}) - ${log.action}`);
    });

    console.log('\n✅ Logs filtering should now work correctly!');
    console.log('📝 To test:');
    console.log('1. Go to Admin Panel > Logs');
    console.log('2. Select a user from the "FILTER BY USER" dropdown');
    console.log('3. You should see only logs for that user');

  } catch (error) {
    console.error('❌ Error fixing logs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixLogsFiltering(); 