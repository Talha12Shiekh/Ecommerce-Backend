const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');

router.get('/', getAllReviews);
router.get('/:id', getSingleReview);

router.use(protect);

router.post('/', createReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
