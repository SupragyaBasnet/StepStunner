const mongoose = require('mongoose');
const ActivityLog = require('./models/ActivityLog');
const User = require('./models/User');
require('dotenv').config();

async function testLogsAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/StepStunner');
    console.log('✅ Connected to MongoDB');

    // Get users
    const users = await User.find().limit(3);
    console.log(`📦 Found ${users.length} users`);

    if (users.length === 0) {
      console.log('❌ No users found.');
      return;
    }

    // Test the logs API directly
    console.log('\n🔍 Testing logs API...');
    
    // Test 1: Get all logs
    console.log('\n1. Testing: Get all logs');
    const allLogs = await ActivityLog.find()
      .populate('userId', 'name email')
      .limit(5);
    console.log(`📊 Found ${allLogs.length} logs`);
    allLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. User: ${log.userId?.name || 'No user'} - Action: ${log.action}`);
    });

    // Test 2: Filter by specific user
    const testUser = users[0];
    console.log(`\n2. Testing: Filter by user ${testUser.name} (${testUser.email})`);
    const userLogs = await ActivityLog.find({ userId: testUser._id })
      .populate('userId', 'name email')
      .limit(5);
    console.log(`📊 Found ${userLogs.length} logs for this user`);
    userLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. User: ${log.userId?.name || 'No user'} - Action: ${log.action}`);
    });

    // Test 3: Check if logs have proper user IDs
    console.log('\n3. Testing: Check log user IDs');
    const logsWithUsers = await ActivityLog.find({ userId: { $exists: true, $ne: null } });
    const logsWithoutUsers = await ActivityLog.find({ userId: { $exists: false } });
    console.log(`📊 Logs with user IDs: ${logsWithUsers.length}`);
    console.log(`📊 Logs without user IDs: ${logsWithoutUsers.length}`);

    // Test 4: Simulate the API query
    console.log('\n4. Testing: Simulate API query');
    const query = { userId: testUser._id };
    console.log('🔍 Query:', JSON.stringify(query, null, 2));
    
    const apiLogs = await ActivityLog.find(query)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(10);
    
    console.log(`📊 API query returned ${apiLogs.length} logs`);
    apiLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.userId?.name || 'No user'} (${log.userId?.email || 'No email'}) - ${log.action}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testLogsAPI(); 