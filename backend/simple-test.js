const { validatePasswordStrength } = require('./middleware/security');

console.log('🔒 Testing Security Middleware Functions\n');

// Test password validation
const testPasswords = [
  'weak',
  'password123',
  'SecurePass123!',
  '123456789',
  'abcdefgh',
  'ABCDEFGH',
  'Abcdefgh1',
  'Abcdefgh1!'
];

console.log('1. Testing Password Strength Validation...\n');

testPasswords.forEach((password, index) => {
  console.log(`Test ${index + 1}: "${password}"`);
  
  // Create mock request and response objects
  const req = { body: { password } };
  const res = {
    status: (code) => ({
      json: (data) => {
        console.log(`   ❌ Rejected: ${data.message}`);
        return res;
      }
    })
  };
  
  let passed = true;
  const originalStatus = res.status;
  const originalJson = res.json;
  
  res.status = (code) => {
    if (code === 400) {
      passed = false;
      return {
        json: (data) => {
          console.log(`   ❌ Rejected: ${data.message}`);
          return res;
        }
      };
    }
    return res;
  };
  
  // Mock next function
  const next = () => {
    if (passed) {
      console.log(`   ✅ Accepted`);
    }
  };
  
  validatePasswordStrength(req, res, next);
  console.log('');
});

console.log('🎉 Password Validation Testing Complete!');
console.log('\n📋 Expected Results:');
console.log('- "weak" should be rejected (too short)');
console.log('- "password123" should be rejected (common password)');
console.log('- "SecurePass123!" should be accepted');
console.log('- "123456789" should be rejected (no uppercase, no special char)');
console.log('- "abcdefgh" should be rejected (no uppercase, no numbers, no special char)');
console.log('- "ABCDEFGH" should be rejected (no lowercase, no numbers, no special char)');
console.log('- "Abcdefgh1" should be rejected (no special character)');
console.log('- "Abcdefgh1!" should be accepted'); 