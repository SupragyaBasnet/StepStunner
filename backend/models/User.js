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
  
  // Security fields
  passwordHistory: [{ 
    password: String, 
    changedAt: { type: Date, default: Date.now } 
  }],
  passwordChangedAt: { type: Date, default: Date.now },
  passwordExpiresAt: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  accountLockedUntil: { type: Date },
  lastLoginAt: { type: Date },
  lastLoginIp: { type: String },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // MFA fields
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String }, // For TOTP
  mfaBackupCodes: [{ type: String }], // Backup codes for account recovery
  mfaMethod: { type: String, enum: ['totp', 'sms', 'email'], default: 'totp' },
  mfaVerified: { type: Boolean, default: false },
  
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

// Check if account is locked
userSchema.methods.isAccountLocked = function() {
  if (!this.accountLockedUntil) return false;
  return new Date() < this.accountLockedUntil;
};

// Increment failed login attempts
userSchema.methods.incrementFailedAttempts = function() {
  this.failedLoginAttempts += 1;
  
      // Lock account after 15 failed attempts for 15 minutes
    if (this.failedLoginAttempts >= 15) {
    this.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  }
  
  return this.save();
};

// Reset failed login attempts
userSchema.methods.resetFailedAttempts = function() {
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = null;
  this.lastLoginAt = new Date();
  return this.save();
};

// Check if password has expired
userSchema.methods.isPasswordExpired = function() {
  if (!this.passwordExpiresAt) return false;
  return new Date() > this.passwordExpiresAt;
};

// Check if password has been used recently
userSchema.methods.isPasswordReused = function(newPassword) {
  if (!this.passwordHistory || this.passwordHistory.length === 0) {
    return false;
  }
  
  // Check last 5 passwords
  const recentPasswords = this.passwordHistory.slice(-5);
  for (const historyItem of recentPasswords) {
    if (bcrypt.compareSync(newPassword, historyItem.password)) {
      return true;
    }
  }
  return false;
};

// Update password with history
userSchema.methods.updatePassword = async function(newPassword) {
  // Add current password to history
  this.passwordHistory.push({
    password: this.password,
    changedAt: new Date()
  });
  
  // Keep only last 10 passwords
  if (this.passwordHistory.length > 10) {
    this.passwordHistory = this.passwordHistory.slice(-10);
  }
  
  // Update password
  this.password = newPassword;
  this.passwordChangedAt = new Date();
  this.passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
  
  return this.save();
};

// Use existing model if already compiled
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
