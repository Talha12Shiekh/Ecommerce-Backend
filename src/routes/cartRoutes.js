const express = require('express');
const { addToCart, removeFromCart, updateCartItemQuantity, getCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', addToCart);
router.delete('/:productId', removeFromCart);
router.patch('/:productId', updateCartItemQuantity);
router.get('/', getCart);

module.exports = router;
