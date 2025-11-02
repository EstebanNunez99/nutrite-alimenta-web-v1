// backend/controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product'); // Necesitás el modelo de producto

// ...tus otros controladores (getCart, addItemToCart, removeItemFromCart)...

// --- NUEVO CONTROLADOR PARA ACTUALIZAR CANTIDAD ---
exports.updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Validamos que la cantidad sea un número válido
    if (isNaN(quantity) || Number(quantity) < 1) {
        return res.status(400).json({ msg: 'La cantidad debe ser un número mayor a 0.' });
    }

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ msg: 'Carrito no encontrado' });

        const itemIndex = cart.items.findIndex(item => item.producto.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ msg: 'Producto no encontrado en el carrito' });
        
        // Actualizamos la cantidad
        cart.items[itemIndex].cantidad = Number(quantity);

        await cart.save();
        res.json(cart);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del Servidor');
    }
};
exports.updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (isNaN(quantity) || Number(quantity) < 1) {
        return res.status(400).json({ msg: 'La cantidad debe ser un número mayor a 0.' });
    }

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ msg: 'Carrito no encontrado' });
        }

        const itemIndex = cart.items.findIndex(item => item.producto.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ msg: 'Producto no encontrado en el carrito' });
        }
        
        cart.items[itemIndex].cantidad = Number(quantity);
        await cart.save();
        
        // Populamos la info del producto antes de devolverlo, para que el frontend tenga todos los datos
        const populatedCart = await Cart.findById(cart._id).populate('items.producto');
        res.json(populatedCart);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del Servidor');
    }
};