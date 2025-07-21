const User = require('../models/User');

// List all users (with optional search and pagination)
exports.getUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const query = search
      ? { $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ] }
      : {};
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

exports.getProducts = (req, res) => res.json({ message: 'getProducts not implemented' });
exports.createProduct = (req, res) => res.json({ message: 'createProduct not implemented' });
exports.updateProduct = (req, res) => res.json({ message: 'updateProduct not implemented' });
exports.deleteProduct = (req, res) => res.json({ message: 'deleteProduct not implemented' });
exports.getOrders = (req, res) => res.json({ message: 'getOrders not implemented' });
exports.getOrderById = (req, res) => res.json({ message: 'getOrderById not implemented' });
exports.updateOrder = (req, res) => res.json({ message: 'updateOrder not implemented' });
exports.deleteOrder = (req, res) => res.json({ message: 'deleteOrder not implemented' });
exports.getLogs = (req, res) => res.json({ message: 'getLogs not implemented' }); 