const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAdminOrders() {
  console.log('🧪 Testing Admin Orders with Address...\n');

  try {
    // Test 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@stepstunner.com', // Replace with actual admin email
      password: 'admin123', // Replace with actual admin password
      recaptchaToken: 'test-token'
    });

    if (!loginResponse.data.token) {
      console.log('❌ Admin login failed');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Test 2: Fetch admin orders
    console.log('\n2. Fetching admin orders...');
    const ordersResponse = await axios.get(`${BASE_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (ordersResponse.data.orders && ordersResponse.data.orders.length > 0) {
      console.log('✅ Orders fetched successfully');
      console.log(`📊 Found ${ordersResponse.data.orders.length} orders`);
      
      // Check if orders have address information
      const ordersWithAddress = ordersResponse.data.orders.filter(order => order.address);
      console.log(`📍 Orders with address: ${ordersWithAddress.length}/${ordersResponse.data.orders.length}`);
      
      if (ordersWithAddress.length > 0) {
        console.log('✅ Address information is present in orders');
        console.log('📋 Sample order with address:');
        const sampleOrder = ordersWithAddress[0];
        console.log(`   Order ID: ${sampleOrder._id}`);
        console.log(`   User: ${sampleOrder.user.name}`);
        console.log(`   Address: ${sampleOrder.address}`);
        console.log(`   Total: Rs ${sampleOrder.total.toFixed(2)}`);
        console.log(`   Status: ${sampleOrder.status}`);
      } else {
        console.log('⚠️  No orders with address information found');
      }
    } else {
      console.log('⚠️  No orders found or orders fetch failed');
    }

    console.log('\n🎉 Admin orders test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testAdminOrders(); 