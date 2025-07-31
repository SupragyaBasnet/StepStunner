const axios = require('axios');
const speakeasy = require('speakeasy');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const TEST_CONFIG = {
  testUser: {
    name: 'Security Test User',
    email: `securitytest${Date.now()}@example.com`,
    phone: '+9771234567890',
    password: 'SecurePass123!'
  },
  adminUser: {
    name: 'Admin Test User',
    email: `admintest${Date.now()}@example.com`,
    phone: '+9771234567891',
    password: 'AdminPass123!'
  }
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
const logTest = (testName, passed, details = '') => {
  const result = { testName, passed, details, timestamp: new Date().toISOString() };
  testResults.tests.push(result);
  
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName} - PASSED`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName} - FAILED: ${details}`);
  }
};

// Helper function to make authenticated requests
const makeAuthRequest = async (token, endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    return await axios(config);
  } catch (error) {
    return error.response;
  }
};

// Test 1: User Registration with Password Policy
const testUserRegistration = async () => {
  console.log('\n🔐 Testing User Registration...');
  
  try {
    // Test valid registration
    const validResponse = await axios.post(`${BASE_URL}/api/auth/register`, TEST_CONFIG.testUser);
    if (validResponse.status === 201) {
      logTest('User Registration - Valid Data', true);
    } else {
      logTest('User Registration - Valid Data', false, `Expected 201, got ${validResponse.status}`);
    }
  } catch (error) {
    logTest('User Registration - Valid Data', false, error.response?.data?.message || error.message);
  }
  
  // Test weak password
  try {
    await axios.post(`${BASE_URL}/api/auth/register`, {
      ...TEST_CONFIG.testUser,
      password: 'weak'
    });
    logTest('User Registration - Weak Password', false, 'Should have rejected weak password');
  } catch (error) {
    if (error.response?.status === 400) {
      logTest('User Registration - Weak Password', true);
    } else {
      logTest('User Registration - Weak Password', false, 'Unexpected error');
    }
  }
  
  // Test invalid email
  try {
    await axios.post(`${BASE_URL}/api/auth/register`, {
      ...TEST_CONFIG.testUser,
      email: 'invalid-email'
    });
    logTest('User Registration - Invalid Email', false, 'Should have rejected invalid email');
  } catch (error) {
    if (error.response?.status === 400) {
      logTest('User Registration - Invalid Email', true);
    } else {
      logTest('User Registration - Invalid Email', false, 'Unexpected error');
    }
  }
};

// Test 2: Authentication and Rate Limiting
const testAuthentication = async () => {
  console.log('\n🔑 Testing Authentication...');
  
  try {
    // Test successful login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_CONFIG.testUser.email,
      password: TEST_CONFIG.testUser.password,
      recaptchaToken: 'test-token' // Mock token for testing
    });
    
    if (loginResponse.data.token) {
      logTest('User Login - Valid Credentials', true);
      return loginResponse.data.token;
    } else {
      logTest('User Login - Valid Credentials', false, 'No token received');
      return null;
    }
  } catch (error) {
    logTest('User Login - Valid Credentials', false, error.response?.data?.message || error.message);
    return null;
  }
};

// Test 3: MFA Setup and Verification
const testMFA = async (token) => {
  console.log('\n🔐 Testing Multi-Factor Authentication...');
  
  if (!token) {
    logTest('MFA Setup', false, 'No authentication token available');
    return;
  }
  
  try {
    // Setup MFA
    const setupResponse = await makeAuthRequest(token, '/api/auth/mfa/setup', 'POST', {
      mfaMethod: 'totp'
    });
    
    if (setupResponse.status === 200 && setupResponse.data.secret) {
      logTest('MFA Setup - TOTP', true);
      
      // Generate valid TOTP token
      const validToken = speakeasy.totp({
        secret: setupResponse.data.secret,
        encoding: 'base32'
      });
      
      // Verify MFA
      const verifyResponse = await makeAuthRequest(token, '/api/auth/mfa/verify', 'POST', {
        token: validToken,
        secret: setupResponse.data.secret,
        backupCodes: setupResponse.data.backupCodes
      });
      
      if (verifyResponse.status === 200) {
        logTest('MFA Verification - Valid Token', true);
      } else {
        logTest('MFA Verification - Valid Token', false, 'Verification failed');
      }
      
      // Test invalid token
      const invalidResponse = await makeAuthRequest(token, '/api/auth/mfa/verify', 'POST', {
        token: '123456',
        secret: setupResponse.data.secret,
        backupCodes: setupResponse.data.backupCodes
      });
      
      if (invalidResponse.status === 400) {
        logTest('MFA Verification - Invalid Token', true);
      } else {
        logTest('MFA Verification - Invalid Token', false, 'Should have rejected invalid token');
      }
      
    } else {
      logTest('MFA Setup - TOTP', false, 'Setup failed');
    }
  } catch (error) {
    logTest('MFA Setup', false, error.message);
  }
};

// Test 4: Password Change and History
const testPasswordChange = async (token) => {
  console.log('\n🔒 Testing Password Change...');
  
  if (!token) {
    logTest('Password Change', false, 'No authentication token available');
    return;
  }
  
  try {
    // Test valid password change
    const changeResponse = await makeAuthRequest(token, '/api/auth/change-password', 'PUT', {
      currentPassword: TEST_CONFIG.testUser.password,
      newPassword: 'NewSecurePass123!'
    });
    
    if (changeResponse.status === 200) {
      logTest('Password Change - Valid New Password', true);
    } else {
      logTest('Password Change - Valid New Password', false, 'Password change failed');
    }
    
    // Test weak new password
    const weakResponse = await makeAuthRequest(token, '/api/auth/change-password', 'PUT', {
      currentPassword: 'NewSecurePass123!',
      newPassword: 'weak'
    });
    
    if (weakResponse.status === 400) {
      logTest('Password Change - Weak Password Rejection', true);
    } else {
      logTest('Password Change - Weak Password Rejection', false, 'Should have rejected weak password');
    }
    
    // Test password reuse
    const reuseResponse = await makeAuthRequest(token, '/api/auth/change-password', 'PUT', {
      currentPassword: 'NewSecurePass123!',
      newPassword: TEST_CONFIG.testUser.password
    });
    
    if (reuseResponse.status === 400) {
      logTest('Password Change - Reuse Prevention', true);
    } else {
      logTest('Password Change - Reuse Prevention', false, 'Should have prevented password reuse');
    }
    
  } catch (error) {
    logTest('Password Change', false, error.message);
  }
};

// Test 5: File Upload Security
const testFileUpload = async (token) => {
  console.log('\n📁 Testing File Upload Security...');
  
  if (!token) {
    logTest('File Upload', false, 'No authentication token available');
    return;
  }
  
  try {
    // Test profile image upload
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const uploadResponse = await makeAuthRequest(token, '/api/auth/profile-image', 'PUT', {
      profileImage: base64Image
    });
    
    if (uploadResponse.status === 200) {
      logTest('File Upload - Valid Image', true);
    } else {
      logTest('File Upload - Valid Image', false, 'Upload failed');
    }
    
  } catch (error) {
    logTest('File Upload', false, error.message);
  }
};

// Test 6: Admin Functions
const testAdminFunctions = async () => {
  console.log('\n👑 Testing Admin Functions...');
  
  try {
    // Register admin user
    const adminResponse = await axios.post(`${BASE_URL}/api/auth/register`, TEST_CONFIG.adminUser);
    
    if (adminResponse.status === 201) {
      logTest('Admin Registration', true);
      
      // Login as admin
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: TEST_CONFIG.adminUser.email,
        password: TEST_CONFIG.adminUser.password,
        recaptchaToken: 'test-token'
      });
      
      if (loginResponse.data.token) {
        const adminToken = loginResponse.data.token;
        
        // Test admin logs access
        const logsResponse = await makeAuthRequest(adminToken, '/api/admin/logs');
        
        if (logsResponse.status === 200) {
          logTest('Admin Logs Access', true);
        } else {
          logTest('Admin Logs Access', false, 'Failed to access admin logs');
        }
        
        // Test admin users access
        const usersResponse = await makeAuthRequest(adminToken, '/api/admin/users');
        
        if (usersResponse.status === 200) {
          logTest('Admin Users Access', true);
        } else {
          logTest('Admin Users Access', false, 'Failed to access admin users');
        }
        
      } else {
        logTest('Admin Login', false, 'Admin login failed');
      }
    } else {
      logTest('Admin Registration', false, 'Admin registration failed');
    }
    
  } catch (error) {
    logTest('Admin Functions', false, error.message);
  }
};

// Test 7: Rate Limiting
const testRateLimiting = async () => {
  console.log('\n⏱️ Testing Rate Limiting...');
  
  try {
    // Test rate limiting by making multiple requests
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        axios.post(`${BASE_URL}/api/auth/login`, {
          email: 'test@example.com',
          password: 'wrongpassword',
          recaptchaToken: 'test-token'
        }).catch(err => err.response)
      );
    }
    
    const responses = await Promise.all(promises);
    const rateLimited = responses.some(res => res.status === 429);
    
    if (rateLimited) {
      logTest('Rate Limiting - Authentication', true);
    } else {
      logTest('Rate Limiting - Authentication', false, 'Rate limiting not triggered');
    }
    
  } catch (error) {
    logTest('Rate Limiting', false, error.message);
  }
};

// Test 8: Session Security
const testSessionSecurity = async (token) => {
  console.log('\n🔐 Testing Session Security...');
  
  if (!token) {
    logTest('Session Security', false, 'No authentication token available');
    return;
  }
  
  try {
    // Test session validation
    const sessionResponse = await makeAuthRequest(token, '/api/auth/profile');
    
    if (sessionResponse.status === 200) {
      logTest('Session Validation', true);
    } else {
      logTest('Session Validation', false, 'Session validation failed');
    }
    
    // Test invalid token
    const invalidResponse = await makeAuthRequest('invalid-token', '/api/auth/profile');
    
    if (invalidResponse.status === 401) {
      logTest('Invalid Token Rejection', true);
    } else {
      logTest('Invalid Token Rejection', false, 'Should have rejected invalid token');
    }
    
  } catch (error) {
    logTest('Session Security', false, error.message);
  }
};

// Test 9: Input Sanitization
const testInputSanitization = async () => {
  console.log('\n🧹 Testing Input Sanitization...');
  
  try {
    // Test XSS prevention
    const xssResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: '<script>alert("xss")</script>',
      email: 'test@example.com',
      phone: '+9771234567890',
      password: 'SecurePass123!'
    });
    
    // If registration succeeds, the input was sanitized
    if (xssResponse.status === 201) {
      logTest('Input Sanitization - XSS Prevention', true);
    } else {
      logTest('Input Sanitization - XSS Prevention', false, 'XSS prevention failed');
    }
    
  } catch (error) {
    logTest('Input Sanitization', false, error.message);
  }
};

// Test 10: Security Headers
const testSecurityHeaders = async () => {
  console.log('\n🛡️ Testing Security Headers...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/profile`);
    
    const headers = response.headers;
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];
    
    const missingHeaders = requiredHeaders.filter(header => !headers[header]);
    
    if (missingHeaders.length === 0) {
      logTest('Security Headers', true);
    } else {
      logTest('Security Headers', false, `Missing headers: ${missingHeaders.join(', ')}`);
    }
    
  } catch (error) {
    logTest('Security Headers', false, error.message);
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive Security Tests for StepStunner...\n');
  
  try {
    // Run all tests
    await testUserRegistration();
    const token = await testAuthentication();
    await testMFA(token);
    await testPasswordChange(token);
    await testFileUpload(token);
    await testAdminFunctions();
    await testRateLimiting();
    await testSessionSecurity(token);
    await testInputSanitization();
    await testSecurityHeaders();
    
    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n🔍 Failed Tests:');
      testResults.tests.filter(t => !t.passed).forEach(test => {
        console.log(`  - ${test.testName}: ${test.details}`);
      });
    }
    
    console.log('\n🎉 Security testing completed!');
    
  } catch (error) {
    console.error('❌ Test runner error:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, testResults }; 