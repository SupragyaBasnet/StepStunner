const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false // Allow anonymous activities
  },
  action: { 
    type: String, 
    required: true,
    enum: [
      'login', 'logout', 'register', 'password_change', 'password_reset',
      'profile_update', 'order_create', 'order_view', 'cart_update',
      'payment_attempt', 'payment_success', 'payment_failure',
      'admin_action', 'security_event', 'api_access',
      'mfa_enabled', 'mfa_disabled', 'mfa_verification', 'mfa_setup',
      'request', 'get', 'post', 'put', 'delete'
    ]
  },
  details: { 
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  ipAddress: { 
    type: String, 
    required: true 
  },
  userAgent: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['success', 'failure', 'warning'], 
    default: 'success' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  sessionId: { 
    type: String 
  },
  requestId: { 
    type: String 
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    default: 'GET'
  },
  url: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ ipAddress: 1, timestamp: -1 });
activityLogSchema.index({ status: 1, timestamp: -1 });

// Static method to log activity
activityLogSchema.statics.logActivity = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to avoid breaking main functionality
  }
};

// Static method to get user activity summary
activityLogSchema.statics.getUserActivitySummary = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), timestamp: { $gte: startDate } } },
    { $group: { 
      _id: '$action', 
      count: { $sum: 1 },
      lastActivity: { $max: '$timestamp' }
    }},
    { $sort: { lastActivity: -1 } }
  ]);
};

// Static method to get security events
activityLogSchema.statics.getSecurityEvents = async function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.find({
    action: { $in: ['login', 'password_change', 'password_reset', 'security_event'] },
    timestamp: { $gte: startDate }
  }).sort({ timestamp: -1 }).limit(100);
};

module.exports = mongoose.model('ActivityLog', activityLogSchema); 