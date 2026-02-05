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
