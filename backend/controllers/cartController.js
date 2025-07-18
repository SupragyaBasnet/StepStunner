const Cart = require('../models/Cart'); // Import your Cart model

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product, quantity } = req.body;

    if (!product || !quantity) {
      return res.status(400).json({ message: 'Product and quantity are required.' });
    }

    // Check if the product is already in the cart
    const existingItem = await Cart.findOne({ user: userId, product });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      const newItem = new Cart({
        user: userId,
        product,
        quantity,
      });
      await newItem.save();
    }

    res.status(200).json({ message: 'Cart updated successfully.' });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
