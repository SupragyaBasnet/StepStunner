const fs = require('fs');
const path = require('path');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/StepStunner

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_change_in_production

# Session Configuration
SESSION_SECRET=your_super_secure_session_secret_key_here_change_in_production

# Environment
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Configuration (for password reset, MFA)
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=wkch qqaw qfwy wfkd

# reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# Payment Gateway Configuration
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('⚠️  Please update the values in .env file with your actual configuration');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🔧 To start the server:');
console.log('1. Make sure MongoDB is running');
console.log('2. Update the .env file with your actual values');
console.log('3. Run: npm run dev');
console.log('\n🐛 If you get MongoDB connection errors:');
console.log('- Install MongoDB: brew install mongodb-community');
console.log('- Start MongoDB: brew services start mongodb-community');
console.log('- Or use MongoDB Atlas (cloud) and update MONGODB_URI'); 