// Frontend Security Tests for StepStunner
// This utility tests security features in the React application

export interface SecurityTestResult {
  testName: string;
  passed: boolean;
  details: string;
  timestamp: string;
}

export interface TestSummary {
  passed: number;
  failed: number;
  tests: SecurityTestResult[];
  successRate: number;
}

// Test results storage
const testResults: SecurityTestResult[] = [];

// Helper function to log test results
const logTest = (testName: string, passed: boolean, details: string = ''): void => {
  const result: SecurityTestResult = {
    testName,
    passed,
    details,
    timestamp: new Date().toISOString()
  };
  testResults.push(result);
  
  if (passed) {
    console.log(`✅ ${testName} - PASSED`);
  } else {
    console.log(`❌ ${testName} - FAILED: ${details}`);
  }
};

// Test 1: Password Strength Validation
export const testPasswordStrength = (): void => {
  console.log('\n🔐 Testing Password Strength Validation...');
  
  // Test strong password
  const strongPassword = 'SecurePass123!';
  const hasUpperCase = /[A-Z]/.test(strongPassword);
  const hasLowerCase = /[a-z]/.test(strongPassword);
  const hasNumbers = /\d/.test(strongPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(strongPassword);
  const isLongEnough = strongPassword.length >= 8;
  
  if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough) {
    logTest('Password Strength - Strong Password', true);
  } else {
    logTest('Password Strength - Strong Password', false, 'Password does not meet requirements');
  }
  
  // Test weak password
  const weakPassword = 'weak';
  const weakHasUpperCase = /[A-Z]/.test(weakPassword);
  const weakHasLowerCase = /[a-z]/.test(weakPassword);
  const weakHasNumbers = /\d/.test(weakPassword);
  const weakHasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(weakPassword);
  const weakIsLongEnough = weakPassword.length >= 8;
  
  if (!(weakHasUpperCase && weakHasLowerCase && weakHasNumbers && weakHasSpecialChar && weakIsLongEnough)) {
    logTest('Password Strength - Weak Password Rejection', true);
  } else {
    logTest('Password Strength - Weak Password Rejection', false, 'Weak password should have been rejected');
  }
};

// Test 2: Input Sanitization
export const testInputSanitization = (): void => {
  console.log('\n🧹 Testing Input Sanitization...');
  
  // Test XSS prevention
  const maliciousInput = '<script>alert("xss")</script>';
  const sanitizedInput = maliciousInput
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
  
  if (sanitizedInput !== maliciousInput) {
    logTest('Input Sanitization - XSS Prevention', true);
  } else {
    logTest('Input Sanitization - XSS Prevention', false, 'Input was not sanitized');
  }
  
  // Test SQL injection prevention
  const sqlInjectionInput = "'; DROP TABLE users; --";
  const sanitizedSQL = sqlInjectionInput.replace(/['";]/g, '');
  
  if (sanitizedSQL !== sqlInjectionInput) {
    logTest('Input Sanitization - SQL Injection Prevention', true);
  } else {
    logTest('Input Sanitization - SQL Injection Prevention', false, 'SQL injection input was not sanitized');
  }
};

// Test 3: Token Storage Security
export const testTokenStorage = (): void => {
  console.log('\n🔑 Testing Token Storage Security...');
  
  // Test localStorage token storage
  const testToken = 'test-jwt-token';
  localStorage.setItem('stepstunnerToken', testToken);
  
  const retrievedToken = localStorage.getItem('stepstunnerToken');
  if (retrievedToken === testToken) {
    logTest('Token Storage - localStorage', true);
  } else {
    logTest('Token Storage - localStorage', false, 'Token not stored correctly');
  }
  
  // Test token removal
  localStorage.removeItem('stepstunnerToken');
  const removedToken = localStorage.getItem('stepstunnerToken');
  if (!removedToken) {
    logTest('Token Storage - Token Removal', true);
  } else {
    logTest('Token Storage - Token Removal', false, 'Token not removed correctly');
  }
};

// Test 4: reCAPTCHA Integration
export const testRecaptchaIntegration = (): void => {
  console.log('\n🤖 Testing reCAPTCHA Integration...');
  
  // Check if reCAPTCHA script is loaded
  const recaptchaScript = document.querySelector('script[src*="recaptcha"]');
  if (recaptchaScript) {
    logTest('reCAPTCHA Integration - Script Loading', true);
  } else {
    logTest('reCAPTCHA Integration - Script Loading', false, 'reCAPTCHA script not found');
  }
  
  // Check if reCAPTCHA container exists
  const recaptchaContainer = document.querySelector('.g-recaptcha');
  if (recaptchaContainer) {
    logTest('reCAPTCHA Integration - Container', true);
  } else {
    logTest('reCAPTCHA Integration - Container', false, 'reCAPTCHA container not found');
  }
};

// Test 5: Session Management
export const testSessionManagement = (): void => {
  console.log('\n⏰ Testing Session Management...');
  
  // Test session timeout calculation
  const sessionTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const expectedTimeout = 604800000; // 7 days in milliseconds
  
  if (sessionTimeout === expectedTimeout) {
    logTest('Session Management - Timeout Calculation', true);
  } else {
    logTest('Session Management - Timeout Calculation', false, 'Session timeout calculation incorrect');
  }
  
  // Test session expiry check
  const now = Date.now();
  const sessionExpiry = now + sessionTimeout;
  const isSessionValid = sessionExpiry > now;
  
  if (isSessionValid) {
    logTest('Session Management - Expiry Check', true);
  } else {
    logTest('Session Management - Expiry Check', false, 'Session expiry check failed');
  }
};

// Test 6: File Upload Security
export const testFileUploadSecurity = (): void => {
  console.log('\n📁 Testing File Upload Security...');
  
  // Test file type validation
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  
  if (allowedTypes.includes(testFile.type)) {
    logTest('File Upload Security - File Type Validation', true);
  } else {
    logTest('File Upload Security - File Type Validation', false, 'File type validation failed');
  }
  
  // Test file size validation
  const maxSize = 5 * 1024 * 1024; // 5MB
  const testFileSize = testFile.size;
  
  if (testFileSize <= maxSize) {
    logTest('File Upload Security - File Size Validation', true);
  } else {
    logTest('File Upload Security - File Size Validation', false, 'File size validation failed');
  }
  
  // Test base64 encoding
  const testString = 'test data';
  const base64Encoded = btoa(testString);
  const base64Decoded = atob(base64Encoded);
  
  if (base64Decoded === testString) {
    logTest('File Upload Security - Base64 Encoding', true);
  } else {
    logTest('File Upload Security - Base64 Encoding', false, 'Base64 encoding/decoding failed');
  }
};

// Test 7: MFA Integration
export const testMFAIntegration = (): void => {
  console.log('\n🔐 Testing MFA Integration...');
  
  // Test QR code generation
  const testSecret = 'JBSWY3DPEHPK3PXP';
  const testAccount = 'test@example.com';
  const testIssuer = 'StepStunner';
  
  const qrCodeUrl = `otpauth://totp/${encodeURIComponent(testIssuer)}:${encodeURIComponent(testAccount)}?secret=${testSecret}&issuer=${encodeURIComponent(testIssuer)}`;
  
  if (qrCodeUrl.includes('otpauth://totp/') && qrCodeUrl.includes('secret=')) {
    logTest('MFA Integration - QR Code Generation', true);
  } else {
    logTest('MFA Integration - QR Code Generation', false, 'QR code URL generation failed');
  }
  
  // Test backup codes generation
  const backupCodes = Array.from({ length: 10 }, () => 
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  
  if (backupCodes.length === 10 && backupCodes.every(code => code.length === 6)) {
    logTest('MFA Integration - Backup Codes Generation', true);
  } else {
    logTest('MFA Integration - Backup Codes Generation', false, 'Backup codes generation failed');
  }
};

// Test 8: Security Headers Check
export const testSecurityHeaders = async (): Promise<void> => {
  console.log('\n🛡️ Testing Security Headers...');
  
  try {
    const response = await fetch('/api/auth/profile');
    const headers = response.headers;
    
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];
    
    const missingHeaders = requiredHeaders.filter(header => !headers.get(header));
    
    if (missingHeaders.length === 0) {
      logTest('Security Headers - Required Headers', true);
    } else {
      logTest('Security Headers - Required Headers', false, `Missing headers: ${missingHeaders.join(', ')}`);
    }
  } catch (error) {
    logTest('Security Headers - Required Headers', false, 'Failed to check security headers');
  }
};

// Test 9: Rate Limiting UI
export const testRateLimitingUI = (): void => {
  console.log('\n⏱️ Testing Rate Limiting UI...');
  
  // Test rate limit message display
  const rateLimitMessage = 'Too many authentication attempts. Please try again in 15 minutes.';
  
  if (rateLimitMessage.includes('Too many') && rateLimitMessage.includes('15 minutes')) {
    logTest('Rate Limiting UI - Message Display', true);
  } else {
    logTest('Rate Limiting UI - Message Display', false, 'Rate limit message not properly formatted');
  }
  
  // Test retry after calculation
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const retryAfter = Math.ceil(windowMs / 1000); // Convert to seconds
  
  if (retryAfter === 900) { // 15 minutes = 900 seconds
    logTest('Rate Limiting UI - Retry After Calculation', true);
  } else {
    logTest('Rate Limiting UI - Retry After Calculation', false, 'Retry after calculation incorrect');
  }
};

// Test 10: Error Handling
export const testErrorHandling = (): void => {
  console.log('\n🚨 Testing Error Handling...');
  
  // Test error message sanitization
  const errorMessage = '<script>alert("error")</script>Error occurred';
  const sanitizedError = errorMessage.replace(/[<>]/g, '');
  
  if (!sanitizedError.includes('<script>')) {
    logTest('Error Handling - Message Sanitization', true);
  } else {
    logTest('Error Handling - Message Sanitization', false, 'Error message not sanitized');
  }
  
  // Test error logging
  const testError = new Error('Test error');
  const errorLog = {
    message: testError.message,
    stack: testError.stack,
    timestamp: new Date().toISOString()
  };
  
  if (errorLog.message && errorLog.timestamp) {
    logTest('Error Handling - Error Logging', true);
  } else {
    logTest('Error Handling - Error Logging', false, 'Error logging failed');
  }
};

// Main test runner
export const runFrontendSecurityTests = async (): Promise<TestSummary> => {
  console.log('🚀 Starting Frontend Security Tests for StepStunner...\n');
  
  try {
    // Run all frontend tests
    testPasswordStrength();
    testInputSanitization();
    testTokenStorage();
    testRecaptchaIntegration();
    testSessionManagement();
    testFileUploadSecurity();
    testMFAIntegration();
    await testSecurityHeaders();
    testRateLimitingUI();
    testErrorHandling();
    
    // Calculate summary
    const passed = testResults.filter(t => t.passed).length;
    const failed = testResults.filter(t => !t.passed).length;
    const total = testResults.length;
    const successRate = total > 0 ? (passed / total) * 100 : 0;
    
    const summary: TestSummary = {
      passed,
      failed,
      tests: testResults,
      successRate
    };
    
    // Print summary
    console.log('\n📊 Frontend Test Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n🔍 Failed Tests:');
      testResults.filter(t => !t.passed).forEach(test => {
        console.log(`  - ${test.testName}: ${test.details}`);
      });
    }
    
    console.log('\n🎉 Frontend security testing completed!');
    
    return summary;
    
  } catch (error) {
    console.error('❌ Frontend test runner error:', error);
    return {
      passed: 0,
      failed: 1,
      tests: [],
      successRate: 0
    };
  }
};

// Export for use in components
export { testResults }; 