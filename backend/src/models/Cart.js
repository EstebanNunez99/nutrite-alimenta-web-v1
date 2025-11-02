// RUTA CORRECTA: backend/models/Cart.js

const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1,
    },
    precio: {
        type: Number,
        required: true,
    }
});

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    items: [CartItemSchema],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Cart', CartSchema);