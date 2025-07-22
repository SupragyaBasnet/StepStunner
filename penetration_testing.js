#!/usr/bin/env node

/**
 * StepStunner Penetration Testing Script
 * 
 * This script helps test various security vulnerabilities in the application.
 * Run with: node penetration_testing.js
 */

const axios = require('axios');
const crypto = require('crypto');

class PenetrationTester {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  async testEndpoint(endpoint, method = 'GET', data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, status: response.status, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        status: error.response?.status, 
        data: error.response?.data,
        error: error.message 
      };
    }
  }

  // Test 1: SQL Injection
  async testSQLInjection() {
    this.log('Testing SQL Injection vulnerabilities...', 'TEST');
    
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "1' OR '1'='1'--"
    ];

    for (const payload of sqlPayloads) {
      const result = await this.testEndpoint('/api/products/search', 'POST', {
        query: payload
      });
      
      if (result.success && result.status === 200) {
        this.log(`Potential SQL injection found with payload: ${payload}`, 'VULNERABILITY');
        this.results.push({
          type: 'SQL_INJECTION',
          payload,
          endpoint: '/api/products/search',
          severity: 'HIGH'
        });
      }
    }
  }

  // Test 2: XSS Testing
  async testXSS() {
    this.log('Testing XSS vulnerabilities...', 'TEST');
    
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '"><script>alert("XSS")</script>'
    ];

    for (const payload of xssPayloads) {
      const result = await this.testEndpoint('/api/auth/register', 'POST', {
        name: payload,
        email: 'test@example.com',
        phone: '+9771234567890',
        password: 'TestPass123!'
      });
      
      if (result.success && result.status === 200) {
        this.log(`Potential XSS found with payload: ${payload}`, 'VULNERABILITY');
        this.results.push({
          type: 'XSS',
          payload,
          endpoint: '/api/auth/register',
          severity: 'HIGH'
        });
      }
    }
  }

  // Test 3: Authentication Bypass
  async testAuthBypass() {
    this.log('Testing authentication bypass...', 'TEST');
    
    // Test admin endpoints without authentication
    const adminEndpoints = [
      '/api/admin/dashboard',
      '/api/admin/users',
      '/api/admin/orders',
      '/api/admin/products'
    ];

    for (const endpoint of adminEndpoints) {
      const result = await this.testEndpoint(endpoint);
      
      if (result.success && result.status === 200) {
        this.log(`Authentication bypass found: ${endpoint}`, 'VULNERABILITY');
        this.results.push({
          type: 'AUTH_BYPASS',
          endpoint,
          severity: 'CRITICAL'
        });
      }
    }
  }

  // Test 4: CSRF Testing
  async testCSRF() {
    this.log('Testing CSRF vulnerabilities...', 'TEST');
    
    // Test state-changing operations without CSRF token
    const csrfEndpoints = [
      { endpoint: '/api/auth/change-password', method: 'POST', data: { currentPassword: 'test', newPassword: 'newpass123!' } },
      { endpoint: '/api/admin/products', method: 'POST', data: { name: 'test', price: 100 } },
      { endpoint: '/api/cart/add', method: 'POST', data: { productId: 'test', quantity: 1 } }
    ];

    for (const test of csrfEndpoints) {
      const result = await this.testEndpoint(test.endpoint, test.method, test.data);
      
      if (result.success && result.status === 200) {
        this.log(`CSRF vulnerability found: ${test.endpoint}`, 'VULNERABILITY');
        this.results.push({
          type: 'CSRF',
          endpoint: test.endpoint,
          severity: 'HIGH'
        });
      }
    }
  }

  // Test 5: Rate Limiting
  async testRateLimiting() {
    this.log('Testing rate limiting...', 'TEST');
    
    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push(this.testEndpoint('/api/auth/login', 'POST', {
        email: 'test@example.com',
        password: 'wrongpassword',
        recaptchaToken: 'fake-token'
      }));
    }

    const results = await Promise.all(requests);
    const successCount = results.filter(r => r.success).length;
    
    if (successCount > 10) {
      this.log('Rate limiting may be insufficient', 'VULNERABILITY');
      this.results.push({
        type: 'RATE_LIMITING',
        details: `${successCount} requests succeeded out of 20`,
        severity: 'MEDIUM'
      });
    }
  }

  // Test 6: Information Disclosure
  async testInfoDisclosure() {
    this.log('Testing information disclosure...', 'TEST');
    
    const sensitiveEndpoints = [
      '/api/users',
      '/api/admin/users',
      '/api/config',
      '/api/health',
      '/.env',
      '/package.json'
    ];

    for (const endpoint of sensitiveEndpoints) {
      const result = await this.testEndpoint(endpoint);
      
      if (result.success && result.status === 200) {
        this.log(`Information disclosure found: ${endpoint}`, 'VULNERABILITY');
        this.results.push({
          type: 'INFO_DISCLOSURE',
          endpoint,
          severity: 'MEDIUM'
        });
      }
    }
  }

  // Test 7: Session Management
  async testSessionManagement() {
    this.log('Testing session management...', 'TEST');
    
    // Test session fixation
    const loginResult = await this.testEndpoint('/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'testpass123!',
      recaptchaToken: 'fake-token'
    });
    
    if (loginResult.success) {
      this.log('Session management test completed', 'INFO');
    }
  }

  // Test 8: Input Validation
  async testInputValidation() {
    this.log('Testing input validation...', 'TEST');
    
    const maliciousInputs = [
      { field: 'email', value: 'test<script>alert("xss")</script>@example.com' },
      { field: 'name', value: 'Test<script>alert("xss")</script>User' },
      { field: 'phone', value: '+977<script>alert("xss")</script>1234567890' }
    ];

    for (const input of maliciousInputs) {
      const result = await this.testEndpoint('/api/auth/register', 'POST', {
        name: input.field === 'name' ? input.value : 'Test User',
        email: input.field === 'email' ? input.value : 'test@example.com',
        phone: input.field === 'phone' ? input.value : '+9771234567890',
        password: 'TestPass123!'
      });
      
      if (result.success && result.status === 200) {
        this.log(`Input validation bypass found: ${input.field}`, 'VULNERABILITY');
        this.results.push({
          type: 'INPUT_VALIDATION',
          field: input.field,
          payload: input.value,
          severity: 'MEDIUM'
        });
      }
    }
  }

  // Generate Report
  generateReport() {
    this.log('Generating security report...', 'REPORT');
    
    console.log('\n' + '='.repeat(60));
    console.log('SECURITY TESTING REPORT');
    console.log('='.repeat(60));
    
    if (this.results.length === 0) {
      console.log('✅ No vulnerabilities detected in basic testing');
    } else {
      console.log(`⚠️  Found ${this.results.length} potential vulnerabilities:\n`);
      
      const bySeverity = {
        CRITICAL: [],
        HIGH: [],
        MEDIUM: [],
        LOW: []
      };
      
      this.results.forEach(result => {
        bySeverity[result.severity].push(result);
      });
      
      Object.entries(bySeverity).forEach(([severity, results]) => {
        if (results.length > 0) {
          console.log(`${severity} SEVERITY (${results.length}):`);
          results.forEach(result => {
            console.log(`  - ${result.type}: ${result.endpoint || result.field || result.payload}`);
          });
          console.log('');
        }
      });
    }
    
    console.log('='.repeat(60));
    console.log('Testing completed. For comprehensive security testing,');
    console.log('consider using professional penetration testing tools.');
    console.log('='.repeat(60));
  }

  // Run all tests
  async runAllTests() {
    this.log('Starting penetration testing...', 'START');
    
    await this.testSQLInjection();
    await this.testXSS();
    await this.testAuthBypass();
    await this.testCSRF();
    await this.testRateLimiting();
    await this.testInfoDisclosure();
    await this.testSessionManagement();
    await this.testInputValidation();
    
    this.generateReport();
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  const tester = new PenetrationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = PenetrationTester; 