const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testMFAQR() {
  console.log('🧪 Testing MFA QR Code Generation...\n');

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

    // Test 2: Generate QR code
    console.log('\n2. Generating QR code...');
    const qrResponse = await axios.get(`${BASE_URL}/api/auth/mfa/qr`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (qrResponse.data.qrCode) {
      console.log('✅ QR code generated successfully');
      console.log('📱 QR Code URL:', qrResponse.data.qrCode.substring(0, 50) + '...');
      console.log('🔑 Secret:', qrResponse.data.secret.substring(0, 10) + '...');
      console.log('📋 Backup Codes:', qrResponse.data.backupCodes.length, 'codes generated');
      console.log('👤 Account Name:', qrResponse.data.accountName);
      console.log('🏢 Issuer:', qrResponse.data.issuer);
    } else {
      console.log('❌ QR code generation failed');
      return;
    }

    // Test 3: Setup MFA with QR code
    console.log('\n3. Setting up MFA with QR code...');
    const setupResponse = await axios.post(`${BASE_URL}/api/auth/mfa/setup`, {
      mfaMethod: 'totp'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (setupResponse.data.qrCode) {
      console.log('✅ MFA setup with QR code successful');
      console.log('📱 Setup QR Code URL:', setupResponse.data.qrCode.substring(0, 50) + '...');
      console.log('🔑 Setup Secret:', setupResponse.data.secret.substring(0, 10) + '...');
      console.log('📋 Setup Backup Codes:', setupResponse.data.backupCodes.length, 'codes');
    } else {
      console.log('❌ MFA setup failed');
    }

    console.log('\n🎉 MFA QR Code test completed!');
    console.log('\n📱 To test with authenticator app:');
    console.log('1. Open Google Authenticator, Authy, or similar app');
    console.log('2. Scan the QR code or enter the secret manually');
    console.log('3. The app should show "StepStunner" with your email');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testMFAQR(); 