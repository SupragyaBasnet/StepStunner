const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Security monitoring routes (admin only)
router.get('/events', auth, requireAdmin, securityController.getSecurityEvents);
router.get('/stats', auth, requireAdmin, securityController.getSecurityStats);
router.get('/failed-logins', auth, requireAdmin, securityController.getFailedLogins);

// User management routes (admin only)
router.get('/users/:userId/activity', auth, requireAdmin, securityController.getUserActivity);
router.get('/users/:userId/audit-trail', auth, requireAdmin, securityController.getUserAuditTrail);
router.put('/users/:userId/lock', auth, requireAdmin, securityController.toggleUserLock);
router.put('/users/:userId/force-reset', auth, requireAdmin, securityController.forcePasswordReset);

// System security routes (admin only)
router.post('/invalidate-sessions', auth, requireAdmin, securityController.invalidateAllSessions);

module.exports = router; 