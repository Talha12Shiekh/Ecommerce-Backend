const mongoose = require('mongoose');

const clientCartItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
    },
});

const cartSchema = new mongoose.Schema(
    {
        cartItems: [clientCartItemSchema],
        numItemsInCart: {
            type: Number,
            default: 0,
        },
        cartTotal: {
            type: Number,
            default: 0,
        },
        shippingFee: {
            type: Number,
            default: 0,
        },
        tax: {
            type: Number,
            default: 0,
        },
        orderTotal: {
            type: Number,
            default: 0,
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
