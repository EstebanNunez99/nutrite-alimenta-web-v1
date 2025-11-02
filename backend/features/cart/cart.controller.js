import Cart from './cart.model.js';
import Product from '../products/product.model.js';

// Obtener el carrito del usuario logueado
export const getCart = async (req, res) => {
    try {
        // Buscamos un carrito que pertenezca al usuario del token
        // y "poblamos" los datos de los productos para tener la info completa.
        let cart = await Cart.findOne({ usuario: req.usuario.id }).populate('items.producto', 'nombre imagen stock');
        
        if (!cart) {
            // Si no existe, creamos uno nuevo y vacío para este usuario
            cart = await Cart.create({ usuario: req.usuario.id, items: [] });
        }
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// Añadir un item al carrito
export const addItemToCart = async (req, res) => {
    const { productoId, cantidad } = req.body;
    const usuarioId = req.usuario.id;

    try {
        const product = await Product.findById(productoId);
        if (!product) {
            return res.status(404).json({ msg: 'Producto no encontrado.' });
        }

        let cart = await Cart.findOne({ usuario: usuarioId });
        if (!cart) {
            cart = await Cart.create({ usuario: usuarioId, items: [] });
        }

        // Revisar si el producto ya está en el carrito
        const itemIndex = cart.items.findIndex(item => item.producto.toString() === productoId);

        if (itemIndex > -1) {
            // Si ya existe, actualizamos la cantidad
            cart.items[itemIndex].cantidad += cantidad;
        } else {
            // Si no existe, lo añadimos al array
            cart.items.push({ 
                producto: productoId, 
                cantidad: cantidad,
                precio: product.precio // Guardamos el precio actual del producto
            });
        }

        await cart.save();
        // Volvemos a popular para devolver el carrito actualizado con toda la info
        const updatedCart = await Cart.findOne({ usuario: req.usuario.id }).populate('items.producto', 'nombre imagen stock');
        res.json(updatedCart);

    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// Actualizar la cantidad de un item en el carrito
export const updateCartItemQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    const usuarioId = req.usuario.id;

    // Validar que la cantidad sea un número válido
    if (isNaN(quantity) || Number(quantity) < 1) {
        return res.status(400).json({ msg: 'La cantidad debe ser un número mayor a 0.' });
    }

    try {
        let cart = await Cart.findOne({ usuario: usuarioId });
        if (!cart) {
            return res.status(404).json({ msg: 'Carrito no encontrado.' });
        }

        // Buscar el item en el carrito
        const itemIndex = cart.items.findIndex(item => item.producto.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ msg: 'Producto no encontrado en el carrito.' });
        }

        // Actualizar la cantidad
        cart.items[itemIndex].cantidad = Number(quantity);
        
        await cart.save();
        
        // Devolver el carrito actualizado con toda la información
        const updatedCart = await Cart.findOne({ usuario: req.usuario.id }).populate('items.producto', 'nombre imagen stock');
        res.json(updatedCart);

    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un item del carrito
export const removeItemFromCart = async (req, res) => {
    const { productId } = req.params;
    const usuarioId = req.usuario.id;

    try {
        let cart = await Cart.findOne({ usuario: usuarioId });
        if (!cart) {
            return res.status(404).json({ msg: 'Carrito no encontrado.' });
        }

        // Filtramos el array de items para quitar el producto
        cart.items = cart.items.filter(item => item.producto.toString() !== productId);
        
        await cart.save();
        const updatedCart = await Cart.findOne({ usuario: req.usuario.id }).populate('items.producto', 'nombre imagen stock');
        res.json(updatedCart);

    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};