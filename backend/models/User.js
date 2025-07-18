const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  profileImage: { type: String },
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
      customizationId: { type: String },
      category: { type: String },
      customization: { type: mongoose.Schema.Types.Mixed },
      price: { type: Number },
      image: { type: String },
      quantity: { type: Number, default: 1 },
    }
  ],
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Use existing model if already compiled
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
