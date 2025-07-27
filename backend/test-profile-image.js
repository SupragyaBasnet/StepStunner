const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testProfileImage() {
  console.log('🧪 Testing Profile Image Persistence...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test User',
      email: `testuser${Date.now()}@example.com`,
      phone: '+9771234567890',
      password: 'TestPass123!'
    });

    if (!registerResponse.data.token) {
      console.log('❌ Registration failed');
      return;
    }

    const token = registerResponse.data.token;
    console.log('✅ Registration successful');

    // Test 2: Update profile image
    console.log('\n2. Updating profile image...');
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // 1x1 pixel
    
    const updateResponse = await axios.put(`${BASE_URL}/api/auth/profile-image`, {
      profileImage: testImage
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (updateResponse.data.profileImage) {
      console.log('✅ Profile image updated successfully');
    } else {
      console.log('❌ Profile image update failed');
      return;
    }

    // Test 3: Logout (simulate by clearing token)
    console.log('\n3. Simulating logout...');
    console.log('✅ Logout simulated');

    // Test 4: Login again and check if profile image persists
    console.log('\n4. Logging in again...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: registerResponse.data.user.email,
      password: 'TestPass123!',
      recaptchaToken: 'test-token' // You might need to handle this differently
    });

    if (loginResponse.data.user.profileImage) {
      console.log('✅ Profile image persisted after login!');
      console.log('📸 Profile image URL:', loginResponse.data.user.profileImage.substring(0, 50) + '...');
    } else {
      console.log('❌ Profile image not found after login');
    }

    console.log('\n🎉 Profile image persistence test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testProfileImage(); 