const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const speakeasy = require("speakeasy"); // For TOTP generation
const qr = require("qrcode"); // For QR code generation
const axios = require('axios'); // Add at the top
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || 'YOUR_RECAPTCHA_SECRET_KEY'; // Add at the top
// Optional: for auto-login after register

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Log registration attempt
    await ActivityLog.logActivity({
      action: 'register',
      details: { email, attempt: 'started' },
      ipAddress,
      userAgent,
      status: 'success'
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await ActivityLog.logActivity({
        action: 'register',
        details: { email, reason: 'invalid_email' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    // Phone validation (+977 followed by 10 digits)
    const phoneRegex = /^\+977\d{10}$/;
    if (!phoneRegex.test(phone)) {
      await ActivityLog.logActivity({
        action: 'register',
        details: { email, reason: 'invalid_phone' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({
        message:
          "Phone number must start with +977 and be followed by exactly 10 digits.",
      });
    }

    // Enhanced password strength validation
    if (password.length < 8 || password.length > 128) {
      await ActivityLog.logActivity({
        action: 'register',
        details: { email, reason: 'password_length_invalid' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({
        message: "Password must be between 8 and 128 characters long."
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      await ActivityLog.logActivity({
        action: 'register',
        details: { email, reason: 'password_complexity_invalid' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
      });
    }

    // Check for common passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
      await ActivityLog.logActivity({
        action: 'register',
        details: { email, reason: 'common_password' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({
        message: "Password is too common. Please choose a more secure password."
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      await ActivityLog.logActivity({
        action: 'register',
        details: { email, reason: 'email_already_exists' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({ message: "Email already registered" });
    }

    // Set password expiry (90 days from now)
    const passwordExpiresAt = new Date();
    passwordExpiresAt.setDate(passwordExpiresAt.getDate() + 90);

    const user = new User({ 
      name, 
      email, 
      phone, 
      password,
      passwordExpiresAt,
      passwordChangedAt: new Date()
    });
    await user.save();

    // Log successful registration
    await ActivityLog.logActivity({
      userId: user._id,
      action: 'register',
      details: { email, registrationMethod: 'email' },
      ipAddress,
      userAgent,
      status: 'success'
    });

    // Generate token with security claims
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role,
        passwordChangedAt: user.passwordChangedAt.getTime(),
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET || "your_jwt_secret_here",
      { 
        expiresIn: "7d",
        issuer: 'stepstunner',
        audience: 'stepstunner-users'
      }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
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
    const { email, password, recaptchaToken } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({ message: "Please complete the reCAPTCHA" });
    }

    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    );

    if (!recaptchaResponse.data.success) {
      await ActivityLog.logActivity({
        action: 'login',
        details: { email, reason: 'recaptcha_failed' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    // Log login attempt
    await ActivityLog.logActivity({
      action: 'login',
      details: { email, attempt: 'started' },
      ipAddress,
      userAgent,
      status: 'success'
    });

    const user = await User.findOne({ email });
    if (!user) {
      await ActivityLog.logActivity({
        action: 'login',
        details: { email, reason: 'user_not_found' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'login',
        details: { reason: 'account_locked' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(423).json({ 
        message: "Account is temporarily locked due to multiple failed login attempts. Please try again later." 
      });
    }

    // Check if password has expired
    if (user.isPasswordExpired()) {
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'login',
        details: { reason: 'password_expired' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(401).json({ 
        message: "Your password has expired. Please reset your password.",
        requiresPasswordReset: true
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed login attempts
      await user.incrementFailedAttempts();
      
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'login',
        details: { 
          reason: 'invalid_password',
          failedAttempts: user.failedLoginAttempts 
        },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset failed login attempts on successful login
    await user.resetFailedAttempts();

    // Generate OTP for email verification
    const loginOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Store OTP in user document
    user.loginOtp = loginOtp;
    user.loginOtpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    try {
      console.log('📧 Sending OTP email to:', user.email);
      console.log('🔧 Using Gmail config:', {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS ? '***configured***' : 'NOT_CONFIGURED'
      });
      
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
      
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: user.email,
        subject: "StepStunner Login Verification OTP",
        text: `Your login verification OTP is: ${loginOtp}. It is valid for 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d72660;">StepStunner Login Verification</h2>
            <p>Hello ${user.name},</p>
            <p>Your login verification OTP is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #d72660; font-size: 32px; margin: 0;">${loginOtp}</h1>
            </div>
            <p>This OTP is valid for 5 minutes.</p>
            <p>If you didn't attempt to login, please ignore this email.</p>
            <p>Best regards,<br>StepStunner Team</p>
          </div>
        `
      };
      
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      console.error('📧 Email config:', {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS ? '***configured***' : 'NOT_CONFIGURED'
      });
      // Continue with login even if email fails
    }

    // Log OTP sent
    await ActivityLog.logActivity({
      userId: user._id,
      action: 'login_otp_sent',
      details: { email: user.email },
      ipAddress,
      userAgent,
      status: 'success'
    });

    // Generate temporary token for OTP verification
    const tempToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role,
        passwordChangedAt: user.passwordChangedAt,
        requiresOtp: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '10m' } // Short expiry for OTP verification
    );

    res.json({
      message: "Login OTP sent to your email",
      requiresOtp: true,
      tempToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        mfaEnabled: user.mfaEnabled,
        mfaMethod: user.mfaMethod
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -passwordHistory -mfaSecret -mfaBackupCodes");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage || null,
      role: user.role || 'user',
      mfaEnabled: user.mfaEnabled || false,
      mfaVerified: user.mfaVerified || false,
      mfaMethod: user.mfaMethod || 'totp',
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

exports.verifyLoginOtp = async (req, res) => {
  try {
    const { otp, tempToken } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    if (!otp || !tempToken) {
      return res.status(400).json({ message: "OTP and temporary token are required" });
    }

    // Verify temporary token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired temporary token" });
    }

    if (!decoded.requiresOtp) {
      return res.status(400).json({ message: "Invalid token for OTP verification" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP is expired
    if (!user.loginOtpExpiry || new Date() > user.loginOtpExpiry) {
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'login_otp_verification',
        details: { reason: 'otp_expired' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({ message: "OTP has expired. Please login again." });
    }

    // Verify OTP
    if (user.loginOtp !== otp) {
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'login_otp_verification',
        details: { reason: 'invalid_otp' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear OTP after successful verification
    user.loginOtp = undefined;
    user.loginOtpExpiry = undefined;
    await user.save();

    // Generate final JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role,
        passwordChangedAt: user.passwordChangedAt
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set session data
    req.session.userId = user._id;
    req.session.userRole = user.role;

    // Log successful login
    await ActivityLog.logActivity({
      userId: user._id,
      action: 'login',
      details: { loginMethod: 'password_otp' },
      ipAddress,
      userAgent,
      status: 'success'
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        mfaEnabled: user.mfaEnabled,
        mfaMethod: user.mfaMethod
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, recaptchaToken } = req.body;
    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({ message: 'CAPTCHA verification failed' });
    }
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
    const captchaRes = await axios.post(verifyUrl);
    if (!captchaRes.data.success) {
      return res.status(400).json({ message: 'CAPTCHA verification failed' });
    }
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
  try {
    const { email, otp, password, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
    user.password = password || newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    return res.json({ message: "Password reset successful." });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, email } = req.body;
    
    console.log('🔍 Profile update request:', { userId, name, phone, email });
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    let emailChanged = false;
    let changes = [];
    
    if (name && name !== user.name) {
      user.name = name;
      changes.push('name');
    }
    
    if (phone && phone !== user.phone) {
      user.phone = phone;
      changes.push('phone');
    }
    
    if (email && email !== user.email) {
      // Check if new email is already taken
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== userId) {
        return res.status(400).json({ message: "Email already registered" });
      }
      user.email = email;
      emailChanged = true;
      changes.push('email');
    }
    
    if (changes.length === 0) {
      return res.status(400).json({ message: "No changes to update" });
    }
    
    await user.save();
    
    console.log('✅ Profile updated successfully:', changes);
    
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
        { id: user._id, email: user.email, role: user.role },
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
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Log password change attempt
    await ActivityLog.logActivity({
      userId: user._id,
      action: 'password_change',
      details: { attempt: 'started' },
      ipAddress,
      userAgent,
      status: 'success'
    });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'password_change',
        details: { reason: 'current_password_incorrect' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Enhanced password validation
    if (newPassword.length < 8 || newPassword.length > 128) {
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'password_change',
        details: { reason: 'new_password_length_invalid' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({
        message: "New password must be between 8 and 128 characters long."
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'password_change',
        details: { reason: 'new_password_complexity_invalid' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({
        message: "New password must include uppercase, lowercase, number, and special character."
      });
    }

    // Check for password reuse
    if (user.isPasswordReused(newPassword)) {
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'password_change',
        details: { reason: 'password_reused' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({
        message: "New password cannot be the same as your last 5 passwords."
      });
    }

    // Check for common passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.includes(newPassword.toLowerCase())) {
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'password_change',
        details: { reason: 'common_password' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({
        message: "New password is too common. Please choose a more secure password."
      });
    }

    // Update password with history
    await user.updatePassword(newPassword);

    // Invalidate all existing sessions for this user
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });
    }

    // Log successful password change
    await ActivityLog.logActivity({
      userId: user._id,
      action: 'password_change',
      details: { changeMethod: 'current_password' },
      ipAddress,
      userAgent,
      status: 'success'
    });

    // Generate new token with updated password timestamp
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        passwordChangedAt: user.passwordChangedAt.getTime(),
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET || "your_jwt_secret_here",
      { 
        expiresIn: "7d",
        issuer: 'stepstunner',
        audience: 'stepstunner-users'
      }
    );

    res.json({ 
      message: "Password changed successfully. Please log in again with your new password.",
      token,
      requiresReauth: true
    });
  } catch (err) {
    console.error('Change password error:', err);
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
      { profileImage: null },
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

// Delete account endpoint
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Log account deletion attempt
    await ActivityLog.logActivity({
      action: 'delete_account',
      details: { userId, attempt: 'started' },
      ipAddress,
      userAgent,
      status: 'success'
    });

    // Delete the user from database
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      await ActivityLog.logActivity({
        action: 'delete_account',
        details: { userId, reason: 'user_not_found' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(404).json({ message: 'User not found' });
    }

    // Log successful deletion
    await ActivityLog.logActivity({
      action: 'delete_account',
      details: { userId, success: true },
      ipAddress,
      userAgent,
      status: 'success'
    });

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Setup MFA
exports.setupMFA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mfaMethod } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (mfaMethod === 'totp') {
      // Generate TOTP secret with enhanced QR code
      const secret = speakeasy.generateSecret({
        name: `StepStunner (${user.email})`,
        issuer: 'StepStunner',
        length: 32,
        encoding: 'base32'
      });

      // Don't save to user yet - wait for verification
      // user.mfaSecret = secret.base32;
      // user.mfaMethod = 'totp';
      
      // Generate backup codes
      const backupCodes = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
      }
      // user.mfaBackupCodes = backupCodes;

      await ActivityLog.logActivity({
        userId: user._id,
        action: 'mfa_setup_initiated',
        details: { method: 'totp' },
        ipAddress,
        userAgent,
        status: 'pending'
      });

      // Generate QR code as data URL
      const qrCodeDataUrl = await qr.toDataURL(secret.otpauth_url);
      
      res.json({
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        backupCodes: backupCodes
      });
    } else if (mfaMethod === 'sms' || mfaMethod === 'email') {
      // Generate OTP for SMS/Email verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user.mfaMethod = mfaMethod;

      // Send OTP
      if (mfaMethod === 'email') {
        await sendOtpEmail(user.email, otp);
      } else if (mfaMethod === 'sms') {
        // Implement SMS sending here
        console.log(`SMS OTP for ${user.phone}: ${otp}`);
      }

      await ActivityLog.logActivity({
        userId: user._id,
        action: 'mfa_setup',
        details: { method: mfaMethod },
        ipAddress,
        userAgent,
        status: 'success'
      });

      res.json({ message: `MFA setup initiated. Check your ${mfaMethod} for verification code.` });
    } else {
      return res.status(400).json({ message: "Invalid MFA method" });
    }

    await user.save();
  } catch (err) {
    console.error("MFA setup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify and enable MFA
exports.verifyMFA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, secret, backupCodes } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let isValid = false;

    if (secret) {
      // This is TOTP setup verification
      isValid = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (isValid) {
        // Save TOTP settings
        user.mfaSecret = secret;
        user.mfaMethod = 'totp';
        user.mfaBackupCodes = backupCodes;
      }
    } else if (user.mfaMethod === 'totp') {
      isValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });
    } else if (user.mfaMethod === 'sms' || user.mfaMethod === 'email') {
      isValid = user.otp === token && user.otpExpiry > new Date();
    }

    if (!isValid) {
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'mfa_verification',
        details: { reason: 'invalid_token' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({ message: "Invalid verification token" });
    }

    // Enable MFA
    user.mfaEnabled = true;
    user.mfaVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    await ActivityLog.logActivity({
      userId: user._id,
      action: 'mfa_enabled',
      details: { method: user.mfaMethod },
      ipAddress,
      userAgent,
      status: 'success'
    });

    res.json({ message: "MFA enabled successfully" });
  } catch (err) {
    console.error("MFA verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Disable MFA
exports.disableMFA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify password before disabling MFA
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'mfa_disable',
        details: { reason: 'invalid_password' },
        ipAddress,
        userAgent,
        status: 'failure'
      });
      return res.status(400).json({ message: "Invalid password" });
    }

    // Disable MFA
    user.mfaEnabled = false;
    user.mfaVerified = false;
    user.mfaSecret = undefined;
    user.mfaBackupCodes = [];
    user.mfaMethod = 'totp';
    await user.save();

    await ActivityLog.logActivity({
      userId: user._id,
      action: 'mfa_disabled',
      details: {},
      ipAddress,
      userAgent,
      status: 'success'
    });

    res.json({ message: "MFA disabled successfully" });
  } catch (err) {
    console.error("MFA disable error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Generate QR code for MFA setup
exports.generateMFAQR = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate new TOTP secret
    const secret = speakeasy.generateSecret({
      name: `StepStunner (${user.email})`,
      issuer: 'StepStunner',
      length: 32,
      encoding: 'base32'
    });

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    res.json({
      secret: secret.base32,
      qrCode: secret.otpauth_url,
      backupCodes: backupCodes,
      accountName: user.email,
      issuer: 'StepStunner'
    });
  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Auto-enable MFA endpoint removed - users must verify manually through the verify endpoint
