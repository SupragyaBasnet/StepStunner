const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  customizationOptions: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
});

module.exports = mongoose.model('Product', productSchema); 