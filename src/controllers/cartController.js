const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Add item to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addToCart = async (req, res) => {
    try {
        const { productId, amount } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Product not found with id of ${productId}`
            });
        }

        const { name, price, image } = product;
        const cartItem = {
            name,
            image: image[0], // Assuming image is an array
            price,
            amount,
            product: productId
        };

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            // Create new cart
            cart = await Cart.create({
                cartItems: [cartItem],
                numItemsInCart: amount,
                cartTotal: price * amount,
                user: req.user.id
            });
        } else {
            // Update existing cart
            const existingItemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);

            if (existingItemIndex > -1) {
                // Item exists, update amount
                const existingItem = cart.cartItems[existingItemIndex];
                existingItem.amount += amount;
            } else {
                // Add new item
                cart.cartItems.push(cartItem);
            }

            // Recalculate totals
            cart.numItemsInCart = cart.cartItems.reduce((acc, item) => acc + item.amount, 0);
            cart.cartTotal = cart.cartItems.reduce((acc, item) => acc + item.price * item.amount, 0);

            await cart.save();
        }

        res.status(200).json({
            success: true,
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE http://localhost:5000/api/v1/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.cartItems.splice(itemIndex, 1);

            // Recalculate totals
            cart.numItemsInCart = cart.cartItems.reduce((acc, item) => acc + item.amount, 0);
            cart.cartTotal = cart.cartItems.reduce((acc, item) => acc + item.price * item.amount, 0);

            await cart.save();

            res.status(200).json({
                success: true,
                data: cart
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update item quantity in cart
// @route   PATCH /api/v1/cart/:productId
// @access  Private
exports.updateCartItemQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { amount } = req.body;

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            const existingItem = cart.cartItems[itemIndex];

            if (amount <= 0) {
                // Remove item if amount is 0 or less
                cart.cartItems.splice(itemIndex, 1);
            } else {
                existingItem.amount = amount;
            }

            // Recalculate totals
            cart.numItemsInCart = cart.cartItems.reduce((acc, item) => acc + item.amount, 0);
            cart.cartTotal = cart.cartItems.reduce((acc, item) => acc + item.price * item.amount, 0);

            await cart.save();

            res.status(200).json({
                success: true,
                data: cart
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// @desc    Clear user cart (Internal Helper)
exports.clearCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
        cart.cartItems = [];
        cart.numItemsInCart = 0;
        cart.cartTotal = 0;
        await cart.save();
    }
};

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    cartItems: [],
                    numItemsInCart: 0,
                    cartTotal: 0
                }
            });
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
