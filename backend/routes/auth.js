const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const {
  changePassword,
  updateProfileImage,
  removeProfileImage,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/authController");
const axios = require("axios");
const {
  EsewaPaymentGateway,
  EsewaCheckStatus,
  generateUniqueId,
} = require("esewajs");
const customizationController = require("../controllers/customizationController");
require("dotenv").config();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", auth, authController.profile);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);
router.put("/profile", auth, authController.updateProfile);
router.put("/change-password", auth, changePassword);
router.put("/profile-image", auth, updateProfileImage);
router.delete("/profile-image", auth, removeProfileImage);
router.get("/cart", auth, getCart);
router.post("/cart", auth, addToCart);
router.put("/cart", auth, updateCartItem);
router.delete("/cart", auth, removeFromCart);
router.delete("/cart/clear", auth, clearCart);
router.delete("/delete-account", auth, authController.deleteAccount);

// eSewa Payment Initiation Endpoint
router.post("/payment/esewa/initiate", async (req, res) => {
  try {
    const { total } = req.body;
    const amount = total;
    const transactionUUID = generateUniqueId();
    const reqPayment = await EsewaPaymentGateway(
      amount,
      0, // productDeliveryCharge
      0, // productServiceCharge
      0, // taxAmount
      transactionUUID,
      process.env.MERCHANT_ID,
      process.env.SECRET,
      process.env.SUCCESS_URL,
      process.env.FAILURE_URL,
      process.env.ESEWAPAYMENT_URL
    );
    if (!reqPayment || reqPayment.status !== 200) {
      return res.status(400).json({ error: "Error sending data to eSewa" });
    }
    return res.json({ url: reqPayment.request.res.responseUrl });
  } catch (error) {
    console.error("eSewa payment initiation error:", error);
    return res.status(500).json({ error: "Failed to initiate eSewa payment" });
  }
});

// eSewa Payment Status Verification Endpoint
router.post("/payment/esewa/status", async (req, res) => {
  try {
    const { amount, productId } = req.body;
    const status = await EsewaCheckStatus(
      amount,
      productId,
      process.env.MERCHANT_ID,
      process.env.ESEWAPAYMENT_STATUS_CHECK_URL
    );
    if (status && status.status === 200) {
      return res.json({ status: status.data.status });
    } else {
      return res.status(400).json({ error: "Failed to verify payment status" });
    }
  } catch (error) {
    console.error("eSewa payment status check error:", error);
    return res.status(500).json({ error: "Failed to check payment status" });
  }
});

// Add this route for customization add-to-cart
router.post(
  "/customization/cart",
  auth,
  customizationController.addToCartCustom
);

// Customization CRUD routes
router.post(
  "/customizations",
  auth,
  customizationController.createCustomization
);
router.get(
  "/customizations",
  auth,
  customizationController.getCustomizationsForUser
);
router.get(
  "/customizations/:customizationId",
  auth,
  customizationController.getCustomizationById
);
router.put(
  "/customizations/:customizationId",
  auth,
  customizationController.updateCustomization
);
router.delete(
  "/customizations/:customizationId",
  auth,
  customizationController.deleteCustomization
);

module.exports = router;
