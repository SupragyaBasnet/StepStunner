const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require authentication and admin access
router.use(auth, auth.isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Product management
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Bulk product operations
router.put('/products/bulk/update', adminController.bulkUpdateProducts);
router.delete('/products/bulk/delete', adminController.bulkDeleteProducts);

// Order management
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderById);
router.put('/orders/:id', adminController.updateOrder);
router.delete('/orders/:id', adminController.deleteOrder);

// Bulk order operations
router.put('/orders/bulk/update', adminController.bulkUpdateOrders);

// Security logs
router.get('/logs', adminController.getLogs);
router.post('/logs/sample', adminController.createSampleLogs);

module.exports = router; 