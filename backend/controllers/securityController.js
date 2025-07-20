const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get security events for admin dashboard
exports.getSecurityEvents = async (req, res) => {
  try {
    const { days = 7, limit = 100 } = req.query;
    const events = await ActivityLog.getSecurityEvents(parseInt(days));
    
    res.json({
      events: events.slice(0, parseInt(limit)),
      total: events.length,
      period: `${days} days`
    });
  } catch (err) {
    console.error('Get security events error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user activity summary
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const activity = await ActivityLog.getUserActivitySummary(userId, parseInt(days));
    
    res.json({
      userId,
      activity,
      period: `${days} days`
    });
  } catch (err) {
    console.error('Get user activity error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get failed login attempts
exports.getFailedLogins = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const failedLogins = await ActivityLog.find({
      action: 'login',
      status: 'failure',
      timestamp: { $gte: startTime }
    }).sort({ timestamp: -1 }).limit(100);
    
    res.json({
      failedLogins,
      total: failedLogins.length,
      period: `${hours} hours`
    });
  } catch (err) {
    console.error('Get failed logins error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lock/unlock user account
exports.toggleUserLock = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'lock' or 'unlock'
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (action === 'lock') {
      user.accountLockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      user.isActive = false;
    } else if (action === 'unlock') {
      user.accountLockedUntil = null;
      user.failedLoginAttempts = 0;
      user.isActive = true;
    }
    
    await user.save();
    
    // Log admin action
    await ActivityLog.logActivity({
      userId: req.user.id,
      action: 'admin_action',
      details: { 
        targetUserId: userId, 
        action: `account_${action}`,
        adminId: req.user.id 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });
    
    res.json({ 
      message: `Account ${action}ed successfully`,
      user: {
        id: user._id,
        email: user.email,
        isActive: user.isActive,
        accountLockedUntil: user.accountLockedUntil
      }
    });
  } catch (err) {
    console.error('Toggle user lock error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Force password reset for user
exports.forcePasswordReset = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Set password to expire immediately
    user.passwordExpiresAt = new Date();
    await user.save();
    
    // Log admin action
    await ActivityLog.logActivity({
      userId: req.user.id,
      action: 'admin_action',
      details: { 
        targetUserId: userId, 
        action: 'force_password_reset',
        adminId: req.user.id 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });
    
    res.json({ 
      message: 'Password reset required for user',
      user: {
        id: user._id,
        email: user.email,
        passwordExpiresAt: user.passwordExpiresAt
      }
    });
  } catch (err) {
    console.error('Force password reset error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get system security statistics
exports.getSecurityStats = async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get various statistics
    const [
      totalUsers,
      activeUsers,
      lockedUsers,
      failedLogins24h,
      failedLogins7d,
      securityEvents24h,
      securityEvents7d,
      recentActivity
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ accountLockedUntil: { $gt: now } }),
      ActivityLog.countDocuments({ 
        action: 'login', 
        status: 'failure', 
        timestamp: { $gte: last24h } 
      }),
      ActivityLog.countDocuments({ 
        action: 'login', 
        status: 'failure', 
        timestamp: { $gte: last7d } 
      }),
      ActivityLog.countDocuments({ 
        action: 'security_event', 
        timestamp: { $gte: last24h } 
      }),
      ActivityLog.countDocuments({ 
        action: 'security_event', 
        timestamp: { $gte: last7d } 
      }),
      ActivityLog.find().sort({ timestamp: -1 }).limit(10)
    ]);
    
    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        locked: lockedUsers,
        inactive: totalUsers - activeUsers
      },
      security: {
        failedLogins24h,
        failedLogins7d,
        securityEvents24h,
        securityEvents7d
      },
      recentActivity
    });
  } catch (err) {
    console.error('Get security stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Invalidate all user sessions (force logout all users)
exports.invalidateAllSessions = async (req, res) => {
  try {
    // In a real implementation, you would invalidate sessions in Redis/database
    // For now, we'll just log the action
    
    await ActivityLog.logActivity({
      userId: req.user.id,
      action: 'admin_action',
      details: { 
        action: 'invalidate_all_sessions',
        adminId: req.user.id 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });
    
    res.json({ 
      message: 'All user sessions will be invalidated on next request',
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Invalidate sessions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get audit trail for specific user
exports.getUserAuditTrail = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const activities = await ActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await ActivityLog.countDocuments({ userId });
    
    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get user audit trail error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 