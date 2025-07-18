const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
  customizationId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  productType: { type: String, required: true },
  type: { type: String }, // e.g., Circle, Rectangle, etc.
  size: { type: String },
  color: { type: String },
  elements: { type: Array, default: [] }, // Array of customization elements (text, image, art, etc.)
  image: { type: String }, // Final rendered image or preview
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Customization', customizationSchema); 