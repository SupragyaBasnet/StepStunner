const User = require('../models/User');
const Product = require('../models/Product');
const Customization = require('../models/Customization');

// Calculate price for any customized product (same logic as before)
function calculateCustomizationPrice(productDoc, customization) {
  let extra = 0;
  if (!customization) return productDoc.price;
  let textCount = 0, imageCount = 0, artCount = 0, stickerCount = 0, shapeCount = 0, toolCount = 0;
  if (customization.elements && Array.isArray(customization.elements)) {
    for (const el of customization.elements) {
      if (el.type === 'text') textCount++;
      if (el.type === 'image') imageCount++;
      if (el.type === 'art') artCount++;
      if (el.type === 'sticker') stickerCount++;
      if (el.type === 'shape') shapeCount++;
      if (el.type === 'tool') toolCount++;
    }
  }
  const t = (productDoc.category || productDoc.type || '').toLowerCase();
  if (t === 'tshirt' || t === 't-shirt') {
    if (customization.color && customization.color !== '#ffffff') extra += 100;
    extra += textCount * 150;
    extra += imageCount * 300;
    extra += artCount * 220;
    extra += stickerCount * 180;
    extra += shapeCount * 120;
    extra += toolCount * 120;
  } else if (t === 'mug') {
    if (customization.color && customization.color !== '#ffffff') extra += 60;
    extra += textCount * 120;
    extra += imageCount * 220;
    extra += artCount * 180;
    extra += stickerCount * 150;
    extra += shapeCount * 90;
    extra += toolCount * 90;
  } else if (t === 'notebook') {
    if (customization.color && customization.color !== '#ffffff') extra += 40;
    extra += textCount * 80;
    extra += imageCount * 150;
    extra += artCount * 100;
    extra += stickerCount * 100;
    extra += shapeCount * 60;
    extra += toolCount * 60;
  } else if (t === 'frame') {
    if (customization.color && customization.color !== '#ffffff') extra += 80;
    extra += textCount * 140;
    extra += imageCount * 250;
    extra += artCount * 200;
    extra += stickerCount * 160;
    extra += shapeCount * 100;
    extra += toolCount * 100;
  } else if (t === 'keychain') {
    if (customization.color && customization.color !== '#ffffff') extra += 30;
    extra += textCount * 60;
    extra += imageCount * 120;
    extra += artCount * 80;
    extra += stickerCount * 80;
    extra += shapeCount * 40;
    extra += toolCount * 40;
  } else if (t === 'waterbottle') {
    if (customization.color && customization.color !== '#ffffff') extra += 50;
    extra += textCount * 100;
    extra += imageCount * 180;
    extra += artCount * 120;
    extra += stickerCount * 120;
    extra += shapeCount * 70;
    extra += toolCount * 70;
  } else if (t === 'cap') {
    if (customization.color && customization.color !== '#ffffff') extra += 50;
    extra += textCount * 100;
    extra += imageCount * 180;
    extra += artCount * 120;
    extra += stickerCount * 120;
    extra += shapeCount * 70;
    extra += toolCount * 70;
  } else if (t === 'pen') {
    if (customization.color && customization.color !== '#ffffff') extra += 20;
    extra += textCount * 40;
    extra += imageCount * 80;
    extra += artCount * 60;
    extra += stickerCount * 60;
    extra += shapeCount * 30;
    extra += toolCount * 30;
  } else if (t === 'phonecase') {
    if (customization.color && customization.color !== '#ffffff') extra += 70;
    extra += textCount * 130;
    extra += imageCount * 240;
    extra += artCount * 180;
    extra += stickerCount * 160;
    extra += shapeCount * 90;
    extra += toolCount * 90;
  } else if (t === 'pillowcase') {
    if (customization.color && customization.color !== '#ffffff') extra += 60;
    extra += textCount * 120;
    extra += imageCount * 220;
    extra += artCount * 180;
    extra += stickerCount * 150;
    extra += shapeCount * 90;
    extra += toolCount * 90;
  } else {
    if (customization.color && customization.color !== '#ffffff') extra += 50;
    extra += textCount * 100;
    extra += imageCount * 200;
    extra += artCount * 150;
    extra += stickerCount * 120;
    extra += shapeCount * 80;
    extra += toolCount * 80;
  }
  return (productDoc.basePrice || productDoc.price || 0) + extra;
}

// Add to cart for customized products only
exports.addToCartCustom = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { customizationId, category, customization, price, image, quantity } = req.body;
    if (!customizationId || !category || !customization || typeof price !== 'number') {
      return res.status(400).json({ message: 'Missing required customization fields.' });
    }
    // Derive a name for the custom product
    const name = customization.productType
      ? `${customization.productType.charAt(0).toUpperCase() + customization.productType.slice(1)}`
      : 'Custom Product';
    // Build the cart item and ensure no product field is present
    const cartItem = {
      customizationId,
      category,
      customization,
      price,
      image,
      quantity: quantity || 1,
      name,
      type: 'custom'
    };
    // Defensive: remove product field if present in req.body
    if ('product' in cartItem) delete cartItem.product;
    // Check for existing item with same customizationId
    const existingItem = user.cart.find(item => item.customizationId === customizationId);
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cart.push(cartItem);
    }
    await user.save();
    res.json(user.cart);
  } catch (err) {
    console.error('Add to Cart Customization Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new customized product
exports.createCustomization = async (req, res) => {
  try {
    const { customizationId, category, productType, type, size, color, elements, image, price } = req.body;
    const user = req.user.id;
    if (!customizationId || !category || !productType || typeof price !== 'number') {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const customization = new Customization({
      customizationId,
      user,
      category,
      productType,
      type,
      size,
      color,
      elements,
      image,
      price,
    });
    await customization.save();
    res.status(201).json(customization);
  } catch (err) {
    console.error('[createCustomization] Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all customizations for the logged-in user
exports.getCustomizationsForUser = async (req, res) => {
  try {
    const user = req.user.id;
    const customizations = await Customization.find({ user });
    res.json(customizations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single customization by customizationId
exports.getCustomizationById = async (req, res) => {
  try {
    const { customizationId } = req.params;
    const customization = await Customization.findOne({ customizationId });
    if (!customization) return res.status(404).json({ message: 'Not found' });
    res.json(customization);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a customization by customizationId
exports.updateCustomization = async (req, res) => {
  try {
    const { customizationId } = req.params;
    const update = req.body;
    const customization = await Customization.findOneAndUpdate(
      { customizationId, user: req.user.id },
      update,
      { new: true }
    );
    if (!customization) return res.status(404).json({ message: 'Not found' });
    res.json(customization);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a customization by customizationId
exports.deleteCustomization = async (req, res) => {
  try {
    const { customizationId } = req.params;
    const customization = await Customization.findOneAndDelete({ customizationId, user: req.user.id });
    if (!customization) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Customization deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 