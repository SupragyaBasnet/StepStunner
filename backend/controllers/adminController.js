const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ActivityLog = require('../models/ActivityLog');

// List all users (with optional search and pagination)
exports.getUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const query = search
      ? { 
          $and: [
            { role: { $ne: 'admin' } },
            { $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { phone: { $regex: search, $options: 'i' } }
            ] }
          ]
        }
      : { role: { $ne: 'admin' } };
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password -passwordHistory -mfaSecret -mfaBackupCodes');
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -passwordHistory -mfaSecret -mfaBackupCodes');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

// Update user (name, email, phone, role, isActive, mfaEnabled)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, isActive, mfaEnabled } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (typeof mfaEnabled === 'boolean') user.mfaEnabled = mfaEnabled;
    await user.save();
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const query = search
      ? { $or: [
          { name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } }
        ] }
      : {};
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Product.countDocuments(query);
    res.json({ products, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, image, stock, isActive } = req.body;
    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      brand,
      image,
      stock: Number(stock) || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, image, stock, isActive } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (image) product.image = image;
    if (stock !== undefined) product.stock = Number(stock);
    if (typeof isActive === 'boolean') product.isActive = isActive;
    
    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const query = search
      ? { $or: [
          { 'user.name': { $regex: search, $options: 'i' } },
          { 'user.email': { $regex: search, $options: 'i' } },
          { 'items.name': { $regex: search, $options: 'i' } },
          { 'address': { $regex: search, $options: 'i' } }
        ] }
      : {};
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price image category')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Order.countDocuments(query);
    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price image category');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { status, shippingAddress, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (status) order.status = status;
    if (shippingAddress) order.shippingAddress = shippingAddress;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();
    res.json({ message: 'Order updated successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, user } = req.query;
    
    console.log('🔍 Fetching logs with filters:', { search, page, limit, user });
    console.log('🔍 All query params:', req.query);
    
    // Build query
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { 'details.url': { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } }
      ];
    }
    
    // User filter
    if (user && user !== 'all') {
      // Convert string to ObjectId if needed
      const mongoose = require('mongoose');
      try {
        query.userId = mongoose.Types.ObjectId(user);
        console.log(`👤 Filtering by user ID: ${user}`);
      } catch (error) {
        console.log(`❌ Invalid user ID format: ${user}`);
        // Try as string, but also check if it's a valid ObjectId string
        if (mongoose.Types.ObjectId.isValid(user)) {
          query.userId = user;
        } else {
          console.log(`❌ Invalid user ID: ${user}`);
        }
      }
    }
    
    console.log('🔍 Final query:', JSON.stringify(query, null, 2));
    
    const logs = await ActivityLog.find(query)
      .populate('userId', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ timestamp: -1 });
      
    const total = await ActivityLog.countDocuments(query);
    
    console.log(`📊 Found ${logs.length} logs out of ${total} total`);
    console.log(`👥 Users in logs:`, logs.map(log => log.userId?.email || 'No user').slice(0, 5));
    
    res.json({ logs, total });
  } catch (err) {
    console.error('❌ Error fetching logs:', err);
    res.status(500).json({ message: 'Failed to fetch logs', error: err.message });
  }
}; 

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);
    
    const totalProducts = await Product.countDocuments();
    console.log('Total products:', totalProducts);
    
    const totalOrders = await Order.countDocuments();
    console.log('Total orders:', totalOrders);
    
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    console.log('Total revenue:', totalRevenue);
    
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .then(orders => orders.filter(order => order.user)); // Filter out orders with null user
    console.log('Recent orders count:', recentOrders.length);
    
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('name stock category')
      .limit(5);
    console.log('Low stock products count:', lowStockProducts.length);
    
    const response = {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentOrders,
      lowStockProducts
    };
    
    console.log('Sending dashboard response:', response);
    res.json(response);
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: err.message });
  }
};

// Bulk operations
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updates } = req.body;
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updates }
    );
    res.json({ message: `${result.modifiedCount} products updated successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to bulk update products', error: err.message });
  }
};

exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;
    const result = await Product.deleteMany({ _id: { $in: productIds } });
    res.json({ message: `${result.deletedCount} products deleted successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to bulk delete products', error: err.message });
  }
};

// Create sample logs for testing
exports.createSampleLogs = async (req, res) => {
  try {
    const users = await User.find().limit(5);
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'No users found. Please create users first.' });
    }
    
    // Clear existing sample logs
    await ActivityLog.deleteMany({});
    console.log('🗑️ Cleared existing logs');
    
    const sampleLogs = [];
    
    const actions = ['login', 'logout', 'register', 'password_change', 'profile_update', 'order_create', 'payment_success', 'product_view', 'user_management', 'log_view'];
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const urls = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/logout',
      '/api/users/profile',
      '/api/users/password',
      '/api/products',
      '/api/products/123',
      '/api/orders',
      '/api/orders/create',
      '/api/admin/dashboard',
      '/api/admin/users',
      '/api/admin/orders',
      '/api/admin/logs',
      '/api/admin/products',
      '/api/cart/add',
      '/api/cart/remove',
      '/api/payment/process'
    ];
    
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
    ];
    
    console.log(`📝 Creating sample logs for ${users.length} users...`);
    
    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const url = urls[Math.floor(Math.random() * urls.length)];
      const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
      
      const log = {
        userId: user._id, // Always include user ID
        action: action,
        method: method,
        url: url,
        details: {
          url: url,
          method: method,
          userAgent: userAgent,
          referer: 'http://localhost:3000',
          responseStatus: 200,
          requestBody: method === 'POST' || method === 'PUT',
          userEmail: user.email,
          userName: user.name
        },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        status: 'success',
        userAgent: userAgent,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
      };
      
      sampleLogs.push(log);
    }
    
    await ActivityLog.insertMany(sampleLogs);
    console.log(`✅ Created ${sampleLogs.length} sample logs`);
    
    // Verify the logs were created with proper user IDs
    const createdLogs = await ActivityLog.find().populate('userId', 'name email');
    console.log(`📊 Created logs with users: ${createdLogs.filter(log => log.userId).length}/${createdLogs.length} have user IDs`);
    
    res.json({ 
      message: `${sampleLogs.length} sample logs created successfully`,
      usersWithLogs: createdLogs.filter(log => log.userId).map(log => log.userId.email)
    });
  } catch (err) {
    console.error('Error creating sample logs:', err);
    res.status(500).json({ message: 'Failed to create sample logs', error: err.message });
  }
};

exports.bulkUpdateOrders = async (req, res) => {
  try {
    const { orderIds, updates } = req.body;
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: updates }
    );
    res.json({ message: `${result.modifiedCount} orders updated successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to bulk update orders', error: err.message });
  }
}; 

// Create sample logs for testing
exports.createSampleLogs = async (req, res) => {
  try {
    const sampleLogs = [
      {
        userId: null, // Anonymous activity
        action: 'login',
        details: { ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date()
      },
      {
        userId: null,
        action: 'register',
        details: { email: 'test@example.com', ipAddress: '192.168.1.101' },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        userId: null,
        action: 'order_create',
        details: { orderId: '687f60678b09c6c4649bf045', total: 110250 },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(Date.now() - 7200000) // 2 hours ago
      },
      {
        userId: null,
        action: 'payment_attempt',
        details: { method: 'esewa', amount: 110250 },
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(Date.now() - 10800000) // 3 hours ago
      },
      {
        userId: null,
        action: 'admin_action',
        details: { action: 'status_update', orderId: '687f60678b09c6c4649bf045' },
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0',
        status: 'success',
        timestamp: new Date(Date.now() - 14400000) // 4 hours ago
      }
    ];

    await ActivityLog.insertMany(sampleLogs);
    res.json({ message: 'Sample logs created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create sample logs', error: err.message });
  }
}; 