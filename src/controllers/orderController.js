const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { clearCart } = require('./cartController');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {

        const tax = 0.1;
        const shippingFee = 200;

        // 1. Get cart items
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart || cart.cartItems.length < 1) {
            return res.status(400).json({
                success: false,
                message: 'No cart items found'
            });
        }

        const { cartItems } = cart;

        // 2. Calculate prices
        // Only accept tax and shippingFee from frontend for now, usually calculated on backend
        const subtotal = cart.cartTotal;
        const total = subtotal + tax + shippingFee;

        // 3. Create order
        const order = await Order.create({
            orderItems: cartItems,
            total,
            subtotal,
            tax,
            shippingFee,
            user: req.user.id,
            clientSecret: 'pending', // Placeholder until payment integration
        });

        // 4. Clear cart
        await clearCart(req.user.id);

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get current logged in user orders
// @route   GET /api/v1/orders/showAllMyOrders
// @access  Private
exports.getCurrentUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({});

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: `No order found with id: ${id}`
            });
        }

        // Check permissions: Admin or Order Owner
        if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order status
// @route   PATCH /api/v1/orders/:id
// @access  Private/Admin
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentIntentId, status } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: `No order found with id: ${id}`
            });
        }

        if (paymentIntentId) {
            order.paymentIntentId = paymentIntentId;
            order.isPaid = true;
            order.paidAt = Date.now();
        }
        if (status) {
            order.status = status;
            if (status === 'delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
        }

        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
