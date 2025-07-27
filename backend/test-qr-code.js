const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testQRCode() {
  console.log('🧪 Testing QR Code Generation for TOTP MFA...\n');

  try {
    // Test 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'QR Test User',
      email: `qrtest${Date.now()}@example.com`,
      phone: '+9771234567890',
      password: 'TestPass123!'
    });

    if (!registerResponse.data.token) {
      console.log('❌ Registration failed');
      return;
    }

    const token = registerResponse.data.token;
    console.log('✅ Registration successful');

    // Test 2: Setup TOTP MFA (should show QR code)
    console.log('\n2. Setting up TOTP MFA...');
    const setupResponse = await axios.post(`${BASE_URL}/api/auth/mfa/setup`, {
      mfaMethod: 'totp'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!setupResponse.data.qrCode) {
      console.log('❌ QR code not generated');
      return;
    }

    console.log('✅ QR Code generated successfully!');
    console.log('📱 QR Code Data URL:', setupResponse.data.qrCode.substring(0, 50) + '...');
    console.log('🔑 Secret:', setupResponse.data.secret);
    console.log('📋 Backup Codes:', setupResponse.data.backupCodes);

    // Test 3: Verify with a test token (this will fail but shows the process)
    console.log('\n3. Testing verification process...');
    const testToken = '123456'; // This will fail, but shows the flow
    
    try {
      const verifyResponse = await axios.post(`${BASE_URL}/api/auth/mfa/verify`, {
        token: testToken,
        secret: setupResponse.data.secret,
        backupCodes: setupResponse.data.backupCodes
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Verification successful (unexpected)');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Verification failed as expected (invalid test token)');
      } else {
        console.log('❌ Verification error:', error.response?.data?.message);
      }
    }

    console.log('\n🎉 QR Code test completed successfully!');
    console.log('\n📱 To see the QR code in the UI:');
    console.log('1. Go to http://localhost:3000/profile/mfa');
    console.log('2. Click "SETUP TOTP" (not email)');
    console.log('3. You should see the QR code in Step 2');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testQRCode(); 