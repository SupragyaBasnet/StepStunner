const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

router.post('/cart', auth, cartController.addToCart);

module.exports = router;
