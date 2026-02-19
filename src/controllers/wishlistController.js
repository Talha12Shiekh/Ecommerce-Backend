const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/v1/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user.id, products: [] });
        }

        res.status(200).json({
            success: true,
            count: wishlist.products.length,
            data: wishlist.products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Private
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: `No product with id : ${productId}`,
            });
        }

        let wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user.id,
                products: [productId],
            });
        } else {
            // Check if product already exists
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }

        // Re-fetch to populate or just return success
        // For simplicity, returning the updated list of IDs or the added product
        res.status(200).json({
            success: true,
            message: 'Product added to wishlist',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user.id });

        if (wishlist) {
            wishlist.products = wishlist.products.filter(
                (id) => id.toString() !== productId
            );
            await wishlist.save();
        }

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
