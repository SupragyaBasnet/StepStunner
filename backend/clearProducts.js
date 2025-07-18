const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = 'mongodb://localhost:27017/StepStunner';

async function clearAllProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    const result = await Product.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} products from database`);
    
    console.log('\n🎉 Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

clearAllProducts(); 