const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testProfilePhone() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/StepStunner');
    console.log('✅ Connected to MongoDB');

    // Get all users and their phone numbers
    const users = await User.find().select('name email phone');
    
    console.log(`📊 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Phone: ${user.phone || 'Not set'}`);
      console.log(`  Phone length: ${user.phone ? user.phone.length : 0}`);
      
      if (user.phone) {
        console.log(`  Phone starts with +977: ${user.phone.startsWith('+977')}`);
        console.log(`  Phone without +977: ${user.phone.replace(/^\+977/, '')}`);
        console.log(`  Phone number part: ${user.phone.replace(/^\+977/, '').length} digits`);
      }
    });

    // Test phone number formatting
    console.log('\n🧪 Testing phone number formatting:');
    const testPhones = [
      '+9771234567890',
      '+977',
      '+9779816315056',
      '9816315056',
      '+977123456789'
    ];
    
    testPhones.forEach(phone => {
      console.log(`  "${phone}" -> "${phone.replace(/^\+977/, '')}"`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testProfilePhone(); 