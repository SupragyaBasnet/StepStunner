const axios = require('axios');
const speakeasy = require('speakeasy');

const BASE_URL = 'http://localhost:5000';

async function testMFAVerification() {
  console.log('🧪 Testing MFA Verification Process...\n');

  try {
    // Test 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'MFA Test User',
      email: `mfatest${Date.now()}@example.com`,
      phone: '+9771234567890',
      password: 'TestPass123!'
    });

    if (!registerResponse.data.token) {
      console.log('❌ Registration failed');
      return;
    }

    const token = registerResponse.data.token;
    console.log('✅ Registration successful');

    // Test 2: Setup MFA
    console.log('\n2. Setting up MFA...');
    const setupResponse = await axios.post(`${BASE_URL}/api/auth/mfa/setup`, {
      mfaMethod: 'totp'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!setupResponse.data.secret) {
      console.log('❌ MFA setup failed');
      return;
    }

    const secret = setupResponse.data.secret;
    const backupCodes = setupResponse.data.backupCodes;
    console.log('✅ MFA setup successful');
    console.log('🔑 Secret:', secret.substring(0, 10) + '...');
    console.log('📋 Backup Codes:', backupCodes.length, 'codes generated');

    // Test 3: Generate a valid TOTP token
    console.log('\n3. Generating valid TOTP token...');
    const validToken = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    console.log('✅ Valid token generated:', validToken);

    // Test 4: Verify MFA with valid token
    console.log('\n4. Verifying MFA with valid token...');
    const verifyResponse = await axios.post(`${BASE_URL}/api/auth/mfa/verify`, {
      token: validToken,
      secret: secret,
      backupCodes: backupCodes
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (verifyResponse.data.message) {
      console.log('✅ MFA verification successful');
      console.log('📝 Response:', verifyResponse.data.message);
    } else {
      console.log('❌ MFA verification failed');
      return;
    }

    // Test 5: Try to verify with invalid token
    console.log('\n5. Testing with invalid token...');
    try {
      await axios.post(`${BASE_URL}/api/auth/mfa/verify`, {
        token: '123456',
        secret: secret,
        backupCodes: backupCodes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Invalid token should have failed');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid token correctly rejected');
      } else {
        console.log('❌ Unexpected error with invalid token');
      }
    }

    console.log('\n🎉 MFA Verification test completed successfully!');
    console.log('\n📱 To test in the UI:');
    console.log('1. Go to http://localhost:3000/profile/mfa');
    console.log('2. Click "SCAN QR CODE"');
    console.log('3. Scan the QR code with your authenticator app');
    console.log('4. Enter the 6-digit code from your app');
    console.log('5. Click "Verify & Enable MFA"');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testMFAVerification(); 