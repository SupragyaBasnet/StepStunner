const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testOtpLoginFlow() {
  console.log('🧪 Testing Complete OTP Login Flow...\n');
  
  try {
    // Step 1: Login with credentials
    console.log('📝 Step 1: Attempting login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'TestPass123!',
      recaptchaToken: 'test-token'
    });
    
    console.log('✅ Login response:', {
      requiresOtp: loginResponse.data.requiresOtp,
      hasTempToken: !!loginResponse.data.tempToken,
      message: loginResponse.data.message
    });
    
    if (!loginResponse.data.requiresOtp) {
      console.log('❌ Login did not require OTP');
      return;
    }
    
    // Step 2: Verify OTP (you'll need to get this from email)
    console.log('\n📝 Step 2: OTP verification...');
    console.log('📧 Check your email for the OTP code');
    console.log('📧 Email sent to:', loginResponse.data.user.email);
    
    // For testing, we'll simulate with a placeholder
    const testOtp = '123456'; // Replace with actual OTP from email
    
    const otpResponse = await axios.post(`${BASE_URL}/api/auth/verify-login-otp`, {
      otp: testOtp,
      tempToken: loginResponse.data.tempToken
    });
    
    console.log('✅ OTP verification response:', {
      success: otpResponse.status === 200,
      hasToken: !!otpResponse.data.token,
      userRole: otpResponse.data.user?.role,
      message: otpResponse.data.message
    });
    
    if (otpResponse.data.token) {
      console.log('🎉 Login successful!');
      console.log('🔑 Token received:', otpResponse.data.token.substring(0, 20) + '...');
      console.log('👤 User role:', otpResponse.data.user.role);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 400) {
      console.log('💡 This might be because:');
      console.log('   - OTP is incorrect (use actual OTP from email)');
      console.log('   - OTP has expired (try logging in again)');
      console.log('   - Temporary token is invalid');
    }
  }
}

// Instructions for manual testing
console.log('📋 Manual Testing Instructions:');
console.log('1. Start the backend: npm start');
console.log('2. Start the frontend: cd ../frontend && npm start');
console.log('3. Go to http://localhost:3000/login');
console.log('4. Enter your credentials');
console.log('5. Check your email for OTP');
console.log('6. Enter the OTP in the verification form');
console.log('7. You should be logged in and redirected to homepage');
console.log('');

testOtpLoginFlow(); 