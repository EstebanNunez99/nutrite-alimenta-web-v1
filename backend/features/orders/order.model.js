import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // 1. Renombrado para coherencia con 'Cart'
    items: [ 
        {
            nombre: { type: String, required: true },
            cantidad: { type: Number, required: true },
            imagen: { type: String, required: true },
            precio: { type: Number, required: true },
            producto: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            }
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'MercadoPago' // Actualizado a tu elección
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingCost: {
        type: Number,
        required: true,
        default: 0.0
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0.0
    },

    // --- INICIO DE CAMBIOS ---

    // 2. 'isPaid' se reemplaza por 'status' para más control
    status: {
        type: String,
        required: true,
        enum: ['pendiente', 'completada', 'cancelada'], // Estados clave del flujo
        default: 'pendiente'
    },

    // 3. 'paymentResult' guarda la info de la pasarela (MercadoPago)
    paymentResult: {
        id: { type: String },
        status: { type: String }, // ej: "approved", "rejected"
        update_time: { type: String },
        email_address: { type: String }
    },

    paidAt: { // Lo mantenemos, se actualiza cuando status es 'completada'
        type: Date
    },

    // 4. 'isDelivered' se puede manejar con un status de envío
    deliveryStatus: {
        type: String,
        required: true,
        enum: ['no_enviado', 'enviado', 'entregado'],
        default: 'no_enviado'
    },

    deliveredAt: { // Lo mantenemos
        type: Date
    },

    // 5. Campo CRÍTICO para la "Tarea Programada" (Camino B)
    expiresAt: {
        type: Date,
        // Seteamos una expiración (ej. 15 minutos) al crear la orden
        default: () => new Date(Date.now() + 20 * 60 * 1000),
        // Creamos un índice para que la BD busque rápido las órdenes expiradas
        index: true 
    }
    
    // --- FIN DE CAMBIOS ---

}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;