const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} = require('../controllers/wishlistController');

router.use(protect);

router.post('/', addToWishlist);
router.get('/', getWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
