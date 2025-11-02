import Order from './order.model.js';
import Cart from '../cart/cart.model.js';

// @desc    Crear una nueva orden
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;
        const usuarioId = req.usuario.id;

        // 1. Buscar el carrito del usuario
        const cart = await Cart.findOne({ usuario: usuarioId }).populate('items.producto');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ msg: 'No hay productos en el carrito para crear una orden.' });
        }

        // 2. Mapear los items del carrito al formato de orderItems
        const orderItems = cart.items.map(item => ({
            nombre: item.producto.nombre,
            cantidad: item.cantidad,
            imagen: item.producto.imagen || '/images/sample.jpg',
            precio: item.precio,
            producto: item.producto._id
        }));

        // 3. Calcular el precio total
        const totalPrice = cart.items.reduce((acc, item) => acc + item.cantidad * item.precio, 0);

        // 4. Crear la nueva orden
        const order = new Order({
            usuario: usuarioId,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice
        });

        const createdOrder = await order.save();

        // 5. Limpiar el carrito del usuario
        cart.items = [];
        await cart.save();

        res.status(201).json(createdOrder);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// @desc    Obtener las órdenes del usuario logueado
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ usuario: req.usuario.id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

// @desc    Obtener una orden por su ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('usuario', 'nombre email');
        
        if (order) {
            // Verificación de seguridad: solo el dueño de la orden o un admin pueden verla
            if (order.usuario._id.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
                return res.status(401).json({ msg: 'No autorizado para ver esta orden.' });
            }
            res.json(order);
        } else {
            res.status(404).json({ msg: 'Orden no encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

// @desc    Actualizar una orden a 'pagada'
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // Verificamos que el usuario que paga sea el dueño de la orden
            if (order.usuario.toString() !== req.usuario.id) {
                return res.status(401).json({ msg: 'No autorizado.' });
            }

            order.isPaid = true;
            order.paidAt = Date.now();
            
            // En una implementación real, aquí guardaríamos info de la pasarela de pago
            // order.paymentResult = { ...datos de MercadoPago... };

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ msg: 'Orden no encontrada.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// @desc    Crear preferencia de pago de MercadoPago
// @route   POST /api/orders/:id/create-payment-preference
// @access  Private
// NOTA: Este es un placeholder. Aquí deberás integrar el SDK de MercadoPago cuando estés listo.
export const createMercadoPagoPreference = async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const usuarioId = req.usuario.id;

        // Buscar la orden
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ msg: 'Orden no encontrada.' });
        }

        // Verificar que la orden pertenece al usuario
        if (order.usuario.toString() !== usuarioId) {
            return res.status(401).json({ msg: 'No autorizado para acceder a esta orden.' });
        }

        // Verificar que la orden no esté ya pagada
        if (order.isPaid) {
            return res.status(400).json({ msg: 'Esta orden ya ha sido pagada.' });
        }

        // Verificar que el método de pago sea MercadoPago
        if (order.paymentMethod !== 'MercadoPago') {
            return res.status(400).json({ msg: 'El método de pago de esta orden no es MercadoPago.' });
        }

        // ============================================
        // PLACEHOLDER: Aquí irá la lógica de MercadoPago
        // ============================================
        // 
        // Ejemplo de estructura esperada:
        // 
        // const { MercadoPago } = require('mercadopago');
        // const client = new MercadoPago({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
        // 
        // const preference = {
        //     items: order.orderItems.map(item => ({
        //         title: item.nombre,
        //         quantity: item.cantidad,
        //         unit_price: item.precio,
        //         picture_url: item.imagen
        //     })),
        //     back_urls: {
        //         success: `${process.env.FRONTEND_URL}/orden/${orderId}?status=success`,
        //         failure: `${process.env.FRONTEND_URL}/orden/${orderId}?status=failure`,
        //         pending: `${process.env.FRONTEND_URL}/orden/${orderId}?status=pending`
        //     },
        //     auto_return: 'approved',
        //     external_reference: orderId,
        //     notification_url: `${process.env.BACKEND_URL}/api/orders/mercadopago/webhook`
        // };
        // 
        // const response = await client.preferences.create(preference);
        // return res.json({ init_point: response.init_point, preference_id: response.id });
        //

        // Por ahora, devolvemos una respuesta placeholder
        res.json({
            message: 'Endpoint listo para integración con MercadoPago',
            orderId: order._id,
            total: order.totalPrice,
            init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=PLACEHOLDER_${order._id}`,
            preference_id: `PLACEHOLDER_${order._id}`,
            note: 'Este es un endpoint placeholder. Implementa la integración con el SDK de MercadoPago para generar la preferencia real.'
        });

    } catch (error) {
        console.error('Error al crear preferencia de MercadoPago:', error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};