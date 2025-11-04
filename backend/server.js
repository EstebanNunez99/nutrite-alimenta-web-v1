import express from 'express';
import cors from 'cors'; 
import dotenv from 'dotenv';

// --- CAMBIO 1: Importamos node-cron y los modelos necesarios ---
import cron from 'node-cron';
import mongoose from 'mongoose';
import Order from './features/orders/order.model.js';
import Product from './features/products/product.model.js';
// ---------------------------------------------------------------

// --- Carga de Rutas y Configuración ---
import conectarDB from './config/db.js'; 

import userRoutes from './features/users/user.routes.js';
import productRoutes from './features/products/product.routes.js'
import cartRoutes from './features/cart/cart.routes.js'; 
import orderRoutes from './features/orders/order.routes.js';

// 1. Cargar Variables de Entorno
dotenv.config();

// Verificar variables críticas al inicio
if (!process.env.MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI no está definida en el archivo .env');
    console.error('   Por favor, crea un archivo .env en la carpeta backend/ con:');
    console.error('   MONGO_URI=tu_string_de_conexion_mongodb');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('❌ ERROR: JWT_SECRET no está definida en el archivo .env');
    console.error('   Por favor, añade en tu archivo .env:');
    console.error('   JWT_SECRET=tu_secret_key_segura_aqui');
    process.exit(1);
}

// 2. Crear la App de Express
const app = express();

// 3. Conectar a la Base de Datos
conectarDB();

// 4. Middlewares
// Configurar CORS para permitir peticiones desde el frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json({ extended: true })); // Para poder leer JSON en el body

// 5. Definir el Puerto
const PORT = process.env.PORT || 4000;

// 6. Cargar Módulos de Rutas
console.log('Cargando ruta de usuarios en /api/users');
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes); 

// --- CAMBIO 2: Lógica del "Camino B" (Tarea Programada) ---
// Esta tarea se ejecutará cada minuto ('* * * * *')
console.log('[CRON] Tarea de limpieza de órdenes programada para ejecutarse cada minuto.');

cron.schedule('* * * * *', async () => {
    console.log('[CRON] Ejecutando tarea: Buscando órdenes pendientes expiradas...');
    
    const now = new Date();
    
    // 1. Encontrar todas las órdenes que están 'pendientes' y cuya
    //    fecha de expiración ya pasó.
    const expiredOrders = await Order.find({
        status: 'pendiente',
        expiresAt: { $lte: now } 
    });

    if (expiredOrders.length === 0) {
        // console.log('[CRON] No se encontraron órdenes expiradas.');
        return;
    }

    console.log(`[CRON] Se encontraron ${expiredOrders.length} órdenes expiradas para cancelar.`);

    // 2. Procesar cada orden expirada
    for (const order of expiredOrders) {
        
        // Usamos una transacción para asegurar que la orden se cancele
        // Y el stock se devuelva, o no pase nada.
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 2a. Actualizar estado de la orden a 'cancelada'
            order.status = 'cancelada';
            await order.save({ session });

            // 2b. Preparar la devolución de stock
            const productsToUpdate = order.items.map(item => ({
                updateOne: {
                    filter: { _id: item.producto },
                    update: {
                        $inc: {
                            stock: item.cantidad,             // Devuelve al stock real
                            stockComprometido: -item.cantidad // Resta del comprometido
                        }
                    }
                }
            }));

            // 2c. Ejecutar la devolución de stock
            await Product.bulkWrite(productsToUpdate, { session });

            // 2d. Confirmar la transacción
            await session.commitTransaction();
            console.log(`[CRON] Orden ${order._id} cancelada y stock devuelto.`);

        } catch (error) {
            // Si algo falla, revertir los cambios
            await session.abortTransaction();
            console.error(`[CRON] Error al procesar orden ${order._id}:`, error.message);
        } finally {
            session.endSession();
        }
    }
});
// --- FIN CAMBIO 2 ---


// 7. Iniciar el Servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`El servidor está funcionando en el puerto ${PORT}`);
});
