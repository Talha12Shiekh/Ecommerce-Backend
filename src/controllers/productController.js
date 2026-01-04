const Product = require('../models/Product');
const path = require('path');

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        req.body.user = req.user.id;

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update product
// @route   PATCH /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Product not found with id of ${req.params.id}`
            });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Product not found with id of ${req.params.id}`
            });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Product deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Upload product image
// @route   POST /api/v1/products/upload
// @access  Private/Admin
exports.uploadProductImage = async (req, res) => {
    try {
        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const productImages = req.files.image;
        const images = [].concat(productImages); // Ensure array
        const uploadedImagePaths = [];
        const maxSize = 1024 * 1024;

        for (const image of images) {
            if (!image.mimetype.startsWith('image')) {
                return res.status(400).json({
                    success: false,
                    message: `File ${image.name} is not an image`
                });
            }

            if (image.size > maxSize) {
                return res.status(400).json({
                    success: false,
                    message: `Image ${image.name} exceeds 1MB limit`
                });
            }

            const imagePath = path.join(__dirname, '../public/uploads/' + `${image.name}`);
            await image.mv(imagePath);
            uploadedImagePaths.push(`/uploads/${image.name}`);
        }

        res.status(200).json({
            success: true,
            message: 'Images uploaded',
            data: uploadedImagePaths
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get products by category
// @route   GET /api/v1/products/category/:id
// @access  Public
exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.id });
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
