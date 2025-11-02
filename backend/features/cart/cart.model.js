import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    // Guardamos el precio aquí para tener una "foto" del precio al momento de añadirlo.
    // Esto es útil si los precios de los productos cambian en el futuro.
    precio: {
        type: Number,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Cada usuario solo puede tener un carrito
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;