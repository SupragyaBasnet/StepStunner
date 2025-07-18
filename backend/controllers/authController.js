const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// Optional: for auto-login after register

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    // Phone validation (+977 followed by 10 digits)
    const phoneRegex = /^\+977\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message:
          "Phone number must start with +977 and be followed by exactly 10 digits.",
      });
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = new User({ name, email, phone, password });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret_here",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,

        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Helper: send OTP email
const sendOtpEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
            subject: "Your StepStunner Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}. It is valid for 5 minutes.`,
  });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // For security, always respond with success
      return res.json({
        message: "If this email exists, an OTP has been sent.",
      });
    }
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    await sendOtpEmail(email, otp);
    res.json({ message: "If this email exists, an OTP has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.otp || !user.otpExpiry) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }
  if (user.otp !== otp || user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }
  res.json({ message: "OTP verified." });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.otp || !user.otpExpiry) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }
  if (user.otp !== otp || user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }
  user.password = newPassword;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();
  res.json({ message: "Password reset successful." });
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, email } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    let emailChanged = false;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email && email !== user.email) {
      // Check if new email is already taken
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== userId) {
        return res.status(400).json({ message: "Email already registered" });
      }
      user.email = email;
      emailChanged = true;
    }
    await user.save();
    let response = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
    };
    if (emailChanged) {
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET || "your_jwt_secret_here",
        { expiresIn: "7d" }
      );
      response.token = token;
    }
    res.json(response);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    // Generate new token after password change
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "your_jwt_secret_here",
      { expiresIn: "7d" }
    );
    res.json({ message: "Password changed successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ profileImage: user.profileImage });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: "" },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile image removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");
    if (!user) return res.status(404).json({ message: "User not found" });

    const cartWithType = user.cart.map((item) => {
      if (item.customizationId) {
        return {
          ...item.toObject(),
          type: "custom",
          product: null,
          customization: item.customization,
          customizationId: item.customizationId,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        };
      } else {
        return {
          ...item.toObject(),
          type: "normal",
          product: item.product,
          customization: null,
          customizationId: null,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        };
      }
    });

    res.json(cartWithType);
  } catch (err) {
    console.error("[getCart] Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    let { product, quantity } = req.body;
    // Clamp quantity between 1 and 10
    quantity = Math.max(1, Math.min(10, parseInt(quantity) || 1));
    console.log(
      "[addToCart] User:",
      req.user.id,
      "Product:",
      product,
      "Quantity:",
      quantity
    );
    console.log("[addToCart] User cart before:", user.cart);
    // Try to find the product in the database
    const dbProduct = await require("../models/Product").findById(product);
    let image = dbProduct ? dbProduct.image : undefined;
    let price = dbProduct ? dbProduct.price : undefined;
    const existingItem = user.cart.find(
      (item) => item.product && item.product.toString() === product
    );
    if (existingItem) {
      existingItem.quantity = Math.max(1, Math.min(10, quantity || 1));
      if (image && !existingItem.image) existingItem.image = image;
      if (typeof price === "number" && !existingItem.price)
        existingItem.price = price;
      console.log(
        "[addToCart] Set existing item quantity to:",
        existingItem.quantity
      );
    } else {
      user.cart.push({ product, quantity, image, price });
      console.log("[addToCart] Added new item to cart");
    }
    await user.save();
    console.log("[addToCart] Updated Cart:", user.cart);
    res.json(user.cart);
  } catch (err) {
    console.error("[addToCart] Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { product, quantity } = req.body;
    // Clamp quantity between 1 and 10
    const newQuantity = Math.max(1, Math.min(10, parseInt(quantity) || 1));
    // Try to find by product ObjectId first
    let item = user.cart.find(
      (item) => item.product && item.product.toString() === product
    );
    // If not found, try to find by customizationId
    if (!item) {
      item = user.cart.find(
        (item) => item.customizationId && item.customizationId === product
      );
    }
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    item.quantity = newQuantity;
    console.log(
      "[updateCartItem] Set quantity for",
      product,
      "to",
      newQuantity
    );
    await user.save();
    res.json(user.cart);
  } catch (err) {
    console.error("[updateCartItem] Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { product } = req.body;
    user.cart = user.cart.filter((item) => {
      // Remove by product ObjectId or by customizationId
      if (item.product && item.product.toString() === product) return false;
      if (item.customizationId && item.customizationId === product)
        return false;
      return true;
    });
    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.cart = [];
    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      console.error("Delete account error: User ID missing in req.user");
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    console.log(`Deleting account for user: ${userId}`);

    // Delete user's orders first (blocking)
    await require("../models/Order").deleteMany({ user: userId });

    // Delete user account
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      console.error(`User not found during deletion: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`User account deleted successfully: ${userId}`);

    // Only log order deletion, do not try to delete again or do anything async after this
    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    return res
      .status(500)
      .json({ message: "Server error while deleting account" });
  }
};
