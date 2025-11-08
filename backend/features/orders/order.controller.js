// --- SDK de MercadoPago ---
import { MercadoPagoConfig, Preference, Payment, MerchantOrder } from 'mercadopago';

import mongoose from 'mongoose';
import Order from './order.model.js';
import Cart from '../cart/cart.model.js';
import Product from '../products/product.model.js'; 

// @desc    Crear una nueva orden (con lógica de stock)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { shippingAddress, paymentMethod, shippingCost } = req.body;
        const usuarioId = req.usuario.id;

        const cart = await Cart.findOne({ usuario: usuarioId }).populate('items.producto').session(session);
        
        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ msg: 'No hay productos en el carrito para crear una orden.' });
        }

        const productsToUpdate = [];
        let calculatedSubtotal = 0;

        for (const item of cart.items) {
            const product = item.producto;
            const stockDisponible = product.stock - product.stockComprometido;

            if (stockDisponible < item.cantidad) {
                throw new Error(`Stock insuficiente para ${product.nombre}. Solo quedan ${stockDisponible} unidades disponibles.`);
            }

            calculatedSubtotal += item.cantidad * item.precio;

            productsToUpdate.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $inc: {
                            stock: -item.cantidad,           
                            stockComprometido: item.cantidad 
                        }
                    }
                }
            });
        }
        
        const items = cart.items.map(item => ({
            nombre: item.producto.nombre,
            cantidad: item.cantidad,
            imagen: item.producto.imagen || '/images/sample.jpg',
            precio: item.precio,
            producto: item.producto._id
        }));

        const finalShippingCost = shippingCost || 0;
        const totalPrice = calculatedSubtotal + finalShippingCost;

        const order = new Order({
            usuario: usuarioId,
            items: items, 
            shippingAddress,
            paymentMethod,
            subtotal: calculatedSubtotal,
            shippingCost: finalShippingCost,
            totalPrice: totalPrice,
            status: 'pendiente', 
        });

        await Product.bulkWrite(productsToUpdate, { session });
        const createdOrder = await order.save({ session });
        cart.items = [];
        await cart.save({ session });
        await session.commitTransaction();

        res.status(201).json(createdOrder);

    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    
    } finally {
        session.endSession();
    }
};

// @desc    Obtener las órdenes paginadas del usuario logueado
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const pageSize = 10; 
        const page = Number(req.query.page) || Number(req.query.pageNumber) || 1;
        
        const count = await Order.countDocuments({ usuario: req.usuario.id });

        const orders = await Order.find({ usuario: req.usuario.id })
            .sort({ createdAt: -1 }) 
            .limit(pageSize) 
            .skip(pageSize * (page - 1)); 

        res.json({ 
            orders, 
            page, 
            totalPages: Math.ceil(count / pageSize) 
        });

    } catch (error) {
        console.error("Error en getMyOrders (paginado):", error);
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

// @desc    Actualizar una orden a 'pagada' (Webhook reemplazará esto)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.usuario.toString() !== req.usuario.id) {
                return res.status(401).json({ msg: 'No autorizado.' });
            }

            order.status = 'completada';
            order.paidAt = Date.now();
            order.paymentResult = { 
                id: req.body.id || 'TEST_ID_MANUAL',
                status: req.body.status || 'approved',
                update_time: req.body.update_time || Date.now(),
                email_address: req.body.email_address || 'test@example.com'
            };

            const productsToUpdate = order.items.map(item => ({
                updateOne: {
                    filter: { _id: item.producto },
                    update: {
                        $inc: { stockComprometido: -item.cantidad } 
                    }
                }
            }));
            await Product.bulkWrite(productsToUpdate);

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
export const createMercadoPagoPreference = async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const usuarioId = req.usuario.id;

        if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            console.error('ERROR: MERCADOPAGO_ACCESS_TOKEN no está definido en .env');
            return res.status(500).json({ msg: 'Error de configuración del servidor (MP Token).' });
        }

        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        const backendURL = process.env.BACKEND_URL || 'http://localhost:4000'; 

        const order = await Order.findById(orderId).populate('usuario', 'nombre email');
        
        if (!order) {
            return res.status(404).json({ msg: 'Orden no encontrada.' });
        }
        if (order.usuario._id.toString() !== usuarioId) {
            return res.status(401).json({ msg: 'No autorizado para acceder a esta orden.' });
        }
        if (order.status !== 'pendiente') {
            return res.status(400).json({ msg: 'Esta orden no está pendiente de pago.' });
        }
        if (order.paymentMethod !== 'MercadoPago') {
            return res.status(400).json({ msg: 'El método de pago de esta orden no es MercadoPago.' });
        }

        const client = new MercadoPagoConfig({ 
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
        });
        const preference = new Preference(client);

        const items = order.items.map(item => ({
            id: item.producto.toString(),
            title: item.nombre,
            quantity: item.cantidad,
            unit_price: item.precio,
            currency_id: 'ARS', 
            picture_url: item.imagen,
            description: item.nombre, 
        }));

        // Agregar costo de envío como item adicional si existe
        if (order.shippingCost > 0) {
            items.push({
                id: 'shipping',
                title: 'Costo de Envío',
                quantity: 1,
                unit_price: order.shippingCost,
                currency_id: 'ARS',
                description: 'Costo de envío'
            });
        }

        const preferenceBody = {
            items: items,
            payer: {
                name: "Test",
                surname:"User",
                email: 'TESTUSER7441100096875126960_@testuser.com',
            },
            back_urls: {
                success: `${frontendURL}/orden/${orderId}`, 
                failure: `${frontendURL}/orden/${orderId}`, 
                pending: `${frontendURL}/orden/${orderId}`  
            },
            // auto_return: 'approved', // Lo dejamos comentado, causaba conflicto
            external_reference: orderId, 
            notification_url: `${backendURL}/api/orders/webhook/mercadopago` 
        };

        console.log('Creando preferencia de MercadoPago...');
        const result = await preference.create({ body: preferenceBody });

        res.json({
            id: result.id, 
            init_point: result.init_point 
        });

    } catch (error) {
        console.error('Error al crear preferencia de MercadoPago:', error);
        if (error.response && error.response.data) {
            console.error('Detalle del error de MP:', error.response.data);
            return res.status(500).json({ 
                msg: 'Error del servidor de MercadoPago', 
                error: error.response.data 
            });
        }
        res.status(500).json({ 
            msg: 'Error en el servidor al crear preferencia', 
            error: error.message 
        });
    }
};

// @desc    Recibir notificaciones (Webhook) de MercadoPago
// @route   POST /api/orders/webhook/mercadopago
// @access  Público
export const receiveMercadoPagoWebhook = async (req, res) => {
    console.log('[MP Webhook] Notificación recibida.');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    try {
        const client = new MercadoPagoConfig({ 
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
        });

        let paymentDetails = null;
        let paymentId = null;

        if (req.body.type === 'payment') {
            paymentId = req.body.data.id;
            console.log(`[MP Webhook] Recibido 'type: payment' con ID: ${paymentId}`);
            
            const payment = new Payment(client);
            paymentDetails = await payment.get({ id: paymentId });
        
        } else if (req.body.topic === 'merchant_order') {
            const merchantOrderId = req.body.resource.split('/').pop();
            console.log(`[MP Webhook] Recibido 'topic: merchant_order' con ID: ${merchantOrderId}`);
            
            const merchantOrder = new MerchantOrder(client);
            const orderInfo = await merchantOrder.get({ merchantOrderId });

            if (orderInfo.payments && orderInfo.payments.length > 0) {
                const lastPaymentInfo = orderInfo.payments[orderInfo.payments.length - 1];
                paymentId = lastPaymentInfo.id;
                
                console.log(`[MP Webhook] MerchantOrder contenía Payment ID: ${paymentId}`);
                
                const payment = new Payment(client);
                paymentDetails = await payment.get({ id: paymentId });
            } else {
                console.log(`[MP Webhook] MerchantOrder ${merchantOrderId} no contenía pagos.`);
            }
        
        } else {
            console.log(`[MP Webhook] Evento ignorado: tipo '${req.body.type}' y tópico '${req.body.topic}' desconocidos.`);
            return res.status(200).send('Evento no reconocido.');
        }

        if (!paymentDetails) {
            console.log('[MP Webhook] No se pudieron obtener detalles del pago.');
            return res.status(200).send('Sin detalles de pago para procesar.');
        }

        console.log(`[MP Webhook] Estado del pago: ${paymentDetails.status}`);
        console.log(`[MP Webhook] External Reference (Order ID): ${paymentDetails.external_reference}`);
        
        const orderId = paymentDetails.external_reference;
        const paymentStatus = paymentDetails.status;

        if (!orderId) {
            console.log('[MP Webhook] Error: El pago no tiene external_reference (Order ID).');
            return res.status(400).send('Pago sin external_reference.');
        }

        const order = await Order.findById(orderId);
        if (!order) {
            console.log(`[MP Webhook] Error: Orden ${orderId} no encontrada en la BD.`);
            return res.status(404).send('Orden no encontrada.');
        }

        if (order.status === 'completada') {
            console.log(`[MP Webhook] Orden ${orderId} ya estaba 'completada'. Ignorando.`);
            return res.status(200).send('Orden ya procesada.');
        }

        if (paymentStatus === 'approved') {
            
            console.log(`[MP Webhook] Pago 'approved' para Orden ${orderId}. Actualizando stock...`);
            
            const productsToUpdate = order.items.map(item => ({
                updateOne: {
                    filter: { _id: item.producto },
                    update: { 
                        $inc: { stockComprometido: -item.cantidad } 
                    }
                }
            }));
            
            const session = await mongoose.startSession();
            session.startTransaction();
            
            try {
                await Product.bulkWrite(productsToUpdate, { session });
                
                order.status = 'completada';
                order.paidAt = new Date(paymentDetails.date_approved);
                order.paymentResult = { 
                    id: paymentDetails.id,
                    status: paymentDetails.status,
                    update_time: paymentDetails.date_updated,
                    email_address: paymentDetails.payer.email
                };
                
                await order.save({ session });
                await session.commitTransaction();
                
                console.log(`[MP Webhook] ¡ÉXITO! Orden ${orderId} actualizada a 'completada' y stock liberado.`);
                
            } catch (dbError) {
                await session.abortTransaction();
                console.error(`[MP Webhook] Error de BD al actualizar orden ${orderId}:`, dbError);
                return res.status(500).send('Error interno al actualizar la orden.');
            } finally {
                session.endSession();
            }

        } else {
            console.log(`[MP Webhook] Estado de pago no 'approved' (${paymentStatus}). No se actualiza orden.`);
        }

        res.status(200).send('Webhook recibido exitosamente.');

    } catch (error) {
        console.error('--- ERROR en Webhook de MercadoPago ---', error);
        if (error.response && error.response.data) {
            console.error('Detalle del error de API MP:', error.response.data);
        }
        res.status(500).json({ msg: 'Error en el servidor al procesar webhook', error: error.message });
    }
};


// @desc    Obtener todas las órdenes (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
    try {
        const pageSize = 20;
        const page = Number(req.query.page) || 1;
        
        // Filtros
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.deliveryStatus) filters.deliveryStatus = req.query.deliveryStatus;
        if (req.query.startDate || req.query.endDate) {
            filters.createdAt = {};
            if (req.query.startDate) filters.createdAt.$gte = new Date(req.query.startDate);
            if (req.query.endDate) filters.createdAt.$lte = new Date(req.query.endDate);
        }

        // Búsqueda por nombre de cliente
        if (req.query.customerName) {
            filters['usuario'] = await mongoose.model('User').findOne({
                nombre: { $regex: req.query.customerName, $options: 'i' }
            }).select('_id');
            if (filters['usuario']) {
                filters['usuario'] = filters['usuario']._id;
            } else {
                // Si no se encuentra el usuario, devolver array vacío
                return res.json({ orders: [], page, totalPages: 0, total: 0 });
            }
        }

        // Búsqueda por producto
        if (req.query.productName) {
            filters['items.nombre'] = { $regex: req.query.productName, $options: 'i' };
        }

        const count = await Order.countDocuments(filters);
        const orders = await Order.find(filters)
            .populate('usuario', 'nombre email')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            orders,
            page,
            totalPages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        console.error('Error en getAllOrders:', error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// @desc    Actualizar estado de entrega de una orden (Admin)
// @route   PUT /api/orders/:id/delivery
// @access  Private/Admin
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { deliveryStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Orden no encontrada.' });
        }

        if (!['no_enviado', 'enviado', 'entregado'].includes(deliveryStatus)) {
            return res.status(400).json({ msg: 'Estado de entrega inválido.' });
        }

        order.deliveryStatus = deliveryStatus;
        if (deliveryStatus === 'entregado') {
            order.deliveredAt = new Date();
        }

        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Error al actualizar estado de entrega:', error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// @desc    Crear orden manual (Admin)
// @route   POST /api/orders/manual
// @access  Private/Admin
export const createManualOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { usuarioId, items, shippingAddress, paymentMethod, shippingCost, status, deliveryStatus } = req.body;

        if (!usuarioId || !items || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ msg: 'Usuario y items son requeridos.' });
        }

        // Verificar que el usuario existe
        const User = mongoose.model('User');
        const user = await User.findById(usuarioId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        const productsToUpdate = [];
        let calculatedSubtotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.producto).session(session);
            if (!product) {
                throw new Error(`Producto ${item.producto} no encontrado.`);
            }

            const stockDisponible = product.stock - product.stockComprometido;
            if (stockDisponible < item.cantidad) {
                throw new Error(`Stock insuficiente para ${product.nombre}. Solo quedan ${stockDisponible} unidades disponibles.`);
            }

            calculatedSubtotal += item.cantidad * item.precio;

            productsToUpdate.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $inc: {
                            stock: -item.cantidad,
                            stockComprometido: item.cantidad
                        }
                    }
                }
            });
        }

        const finalShippingCost = shippingCost || 0;
        const totalPrice = calculatedSubtotal + finalShippingCost;

        const order = new Order({
            usuario: usuarioId,
            items: items.map(item => ({
                nombre: item.nombre,
                cantidad: item.cantidad,
                imagen: item.imagen || '/images/sample.jpg',
                precio: item.precio,
                producto: item.producto
            })),
            shippingAddress: shippingAddress || {},
            paymentMethod: paymentMethod || 'Efectivo',
            subtotal: calculatedSubtotal,
            shippingCost: finalShippingCost,
            totalPrice: totalPrice,
            status: status || 'completada',
            deliveryStatus: deliveryStatus || 'no_enviado'
        });

        if (status === 'completada') {
            order.paidAt = new Date();
            // Liberar stock comprometido ya que está pagada
            const productsToRelease = items.map(item => ({
                updateOne: {
                    filter: { _id: item.producto },
                    update: {
                        $inc: { stockComprometido: -item.cantidad }
                    }
                }
            }));
            await Product.bulkWrite(productsToRelease, { session });
        }

        await Product.bulkWrite(productsToUpdate, { session });
        const createdOrder = await order.save({ session });
        await session.commitTransaction();

        const populatedOrder = await Order.findById(createdOrder._id).populate('usuario', 'nombre email');
        res.status(201).json(populatedOrder);

    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    } finally {
        session.endSession();
    }
};

// @desc    Disparador manual para limpiar órdenes expiradas (para Cron Job)
// @route   GET /api/orders/trigger-cron
// @access  Público
export const triggerOrderCleanup = async (req, res) => {
    // --- (Opcional) Seguridad para el Cron Job ---
    // Para evitar que cualquiera llame a esta URL, podemos
    // agregar un "secret" que solo Render y nosotros sabemos.
    const cronSecret = req.headers['x-cron-secret'];
    if (cronSecret !== process.env.CRON_SECRET) {
        console.warn('[CRON] Intento de ejecución de Cron Job SIN secreto.');
        return res.status(401).json({ msg: 'No autorizado.' });
    }
    // ---------------------------------------------
    
    console.log('[CRON-ENDPOINT] Ejecutando tarea: Buscando órdenes pendientes expiradas...');
    const now = new Date();
    let ordersCancelledCount = 0;

    try {
        const expiredOrders = await Order.find({
            status: 'pendiente',
            expiresAt: { $lte: now } 
        });

        if (expiredOrders.length === 0) {
            console.log('[CRON-ENDPOINT] No se encontraron órdenes expiradas.');
            return res.status(200).json({ msg: 'No se encontraron órdenes expiradas.' });
        }

        console.log(`[CRON-ENDPOINT] Se encontraron ${expiredOrders.length} órdenes expiradas para cancelar.`);

        for (const order of expiredOrders) {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                order.status = 'cancelada';
                await order.save({ session });

                const productsToUpdate = order.items.map(item => ({
                    updateOne: {
                        filter: { _id: item.producto },
                        update: {
                            $inc: {
                                stock: item.cantidad,
                                stockComprometido: -item.cantidad 
                            }
                        }
                    }
                }));

                await Product.bulkWrite(productsToUpdate, { session });
                await session.commitTransaction();
                console.log(`[CRON-ENDPOINT] Orden ${order._id} cancelada y stock devuelto.`);
                ordersCancelledCount++;

            } catch (error) {
                await session.abortTransaction();
                console.error(`[CRON-ENDPOINT] Error al procesar orden ${order._id}:`, error.message);
            } finally {
                session.endSession();
            }
        }

        res.status(200).json({ 
            msg: 'Tarea de limpieza de órdenes completada.',
            cancelled: ordersCancelledCount
        });

    } catch (error) {
        console.error('[CRON-ENDPOINT] Error general al ejecutar la limpieza:', error);
        res.status(500).json({ msg: 'Error en el servidor durante la limpieza de órdenes.' });
    }
};
// --- FIN CAMBIO ---