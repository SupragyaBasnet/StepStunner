const jwt = require('jsonwebtoken');

// Test function to decode JWT token
function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT payload:', decoded);
    console.log('Role in token:', decoded.role);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

// Export for use in other files
module.exports = { decodeToken }; 