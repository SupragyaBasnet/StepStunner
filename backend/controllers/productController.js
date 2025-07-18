const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getAllProducts = async (req, res) => {
  console.log("All products requested");
  try {
    console.log("products");
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createProduct = async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    let { items, total, address, paymentMethod } = req.body;

    // Clean items: remove product field from custom items
    items = items.map(item => {
      if (item.type === 'custom' || item.customizationId) {
        const { product, ...rest } = item;
        return rest;
      }
      return item;
    });

    // Now validate cleaned items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items to order.' });
    }
    for (const item of items) {
      if (!item.product && !item.customizationId) {
        return res.status(400).json({ message: 'Each item must have either a product or a customizationId.' });
      }
      if (typeof item.quantity !== 'number' || typeof item.price !== 'number') {
        return res.status(400).json({ message: 'Each item must have quantity and price.' });
      }
    }

    // Store all fields as received (product, customizationId, customization, image, name, quantity, price)
    const order = new Order({ user: req.user.id, items, total, address, paymentMethod });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Place order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getUserOrders = async (req, res) => {
  console.log('getUserOrders called for user:', req.user);
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name price image category',
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 })
      .lean(); // make result plain JS object

    // Clean up orders to avoid frontend errors
    const cleanedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: item.product || null, // fallback if product deleted
      })),
    }));

    res.json(cleanedOrders);
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};







exports.deleteAllUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    await Order.deleteMany({ user: userId });
    res.json({ message: 'All your orders have been deleted.' });
  } catch (err) {
    console.error('Delete orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add or get product by name, category, and price
exports.addOrGetProduct = async (req, res) => {
  try {
    const { name, category, price, image, description } = req.body;
    let product = await Product.findOne({ name, category, price });
    if (!product) {
      product = new Product({ name, category, price, image, description });
      await product.save();
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  
  try {
    const orders = await Order.find()
      .populate({
        path: 'user',
        select: 'name email phone',
      })
      .populate({
        path: 'items.product',
        select: 'name price image category',
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Clean up orders to avoid frontend errors
    const cleanedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: item.product || null, // fallback if product deleted
      })),
    }));

    res.json(cleanedOrders);
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ message: 'Server error fetching all orders' });
  }
}; 