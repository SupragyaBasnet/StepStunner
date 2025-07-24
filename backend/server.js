const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();
const nodemailer = require("nodemailer");
const orderRoutes = require('./routes/order');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // or your SMTP host
  port: 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.GMAIL_USER, // use GMAIL_USER for consistency
    pass: process.env.GMAIL_PASS, // use GMAIL_PASS for consistency
  },
});
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Log every incoming request for debugging
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});
app.use('/api/orders', orderRoutes);
