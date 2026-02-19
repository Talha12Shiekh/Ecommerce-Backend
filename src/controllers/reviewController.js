const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Create new review
// @route   POST /api/v1/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { product: productId } = req.body;

        const isValidProduct = await Product.findById(productId);

        if (!isValidProduct) {
            return res.status(404).json({
                success: false,
                message: `No product with id : ${productId}`
            });
        }

        const alreadySubmitted = await Review.findOne({
            product: productId,
            user: req.user.id,
        });

        if (alreadySubmitted) {
            return res.status(400).json({
                success: false,
                message: 'Already submitted review for this product'
            });
        }

        req.body.user = req.user.id;
        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({}).populate({
            path: 'product',
            select: 'name company price',
        });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getSingleReview = async (req, res) => {
    try {
        const { id: reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: `No review with id ${reviewId}`
            });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update review
// @route   PATCH /api/v1/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
    try {
        const { id: reviewId } = req.params;
        const { rating, title, comment } = req.body;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: `No review with id ${reviewId}`
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this review'
            });
        }

        review.rating = rating;
        review.title = title;
        review.comment = comment;

        await review.save();

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const { id: reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: `No review with id ${reviewId}`
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        await review.remove();

        res.status(200).json({
            success: true,
            message: 'Success! Review removed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
