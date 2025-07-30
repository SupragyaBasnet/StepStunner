const mongoose = require('mongoose');
const ActivityLog = require('./models/ActivityLog');
const User = require('./models/User');
require('dotenv').config();

async function testLogsAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/StepStunner');
    console.log('✅ Connected to MongoDB');

    // Get a few logs with population
    const logs = await ActivityLog.find()
      .populate('userId', 'name email')
      .limit(5)
      .sort({ timestamp: -1 });

    console.log(`📊 Found ${logs.length} logs`);
    
    logs.forEach((log, index) => {
      console.log(`\n📝 Log ${index + 1}:`);
      console.log(`  ID: ${log._id}`);
      console.log(`  Action: ${log.action}`);
      console.log(`  Timestamp: ${log.timestamp}`);
      console.log(`  userId:`, log.userId);
      console.log(`  userId._id:`, log.userId?._id);
      console.log(`  userId.name:`, log.userId?.name);
      console.log(`  userId.email:`, log.userId?.email);
      console.log(`  details:`, log.details);
    });

    // Test the exact query that the API uses
    console.log('\n🔍 Testing API query...');
    const apiLogs = await ActivityLog.find({})
      .populate('userId', 'name email')
      .skip(0)
      .limit(10)
      .sort({ timestamp: -1 });
      
    console.log(`📊 API query returned ${apiLogs.length} logs`);
    apiLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. User: ${log.userId?.name || 'No name'} (${log.userId?.email || 'No email'}) - Action: ${log.action}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testLogsAPI(); 