const ActivityLog = require('../models/ActivityLog');

const logRequest = async (req, res, next) => {
  // Store original send function
  const originalSend = res.send;
  
  // Override send function to capture response
  res.send = function(data) {
    // Log the request after response is sent
    logActivity(req, res, data);
    // Call original send function
    originalSend.call(this, data);
  };
  
  next();
};

const logActivity = async (req, res, responseData) => {
  try {
    // Skip logging for certain endpoints
    const skipEndpoints = ['/api/health', '/api/csrf-token', '/favicon.ico'];
    if (skipEndpoints.includes(req.path)) {
      return;
    }

    // Determine action based on method and path
    let action = req.method.toLowerCase();
    if (req.path.includes('/login')) action = 'login';
    else if (req.path.includes('/register')) action = 'register';
    else if (req.path.includes('/logout')) action = 'logout';
    else if (req.path.includes('/password')) action = 'password_change';
    else if (req.path.includes('/profile')) action = 'profile_update';
    else if (req.path.includes('/orders')) action = 'order_create';
    else if (req.path.includes('/payment')) action = 'payment_success';
    else if (req.path.includes('/admin')) action = 'admin_action';
    else if (req.path.includes('/products')) action = 'product_view';
    else if (req.path.includes('/users')) action = 'user_management';
    else if (req.path.includes('/logs')) action = 'log_view';

    // Get user ID if available
    let userId = req.user ? req.user._id : null;
    
    // For login actions, try to get user from request body
    if (action === 'login' && req.body && req.body.email) {
      try {
        const User = require('../models/User');
        const user = await User.findOne({ email: req.body.email });
        if (user) {
          userId = user._id;
        }
      } catch (error) {
        console.error('Error finding user for login log:', error);
      }
    }

    // Get IP address properly
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     req.connection.socket?.remoteAddress || 
                     'unknown';

    // Create log entry
    const logData = {
      userId: userId,
      action: action,
      method: req.method,
      url: req.originalUrl,
      details: {
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer'),
        responseStatus: res.statusCode,
        requestBody: req.body ? Object.keys(req.body).length > 0 : false
      },
      ipAddress: ipAddress,
      status: res.statusCode < 400 ? 'success' : 'failure',
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };

    // Log all requests for better tracking
    await ActivityLog.logActivity(logData);
  } catch (error) {
    // Don't let logging errors break the main functionality
    console.error('Error logging activity:', error);
  }
};

module.exports = { logRequest }; 