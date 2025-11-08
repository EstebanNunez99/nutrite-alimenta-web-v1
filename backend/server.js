import express from 'express';
import cors from 'cors'; 
import dotenv from 'dotenv';

// --- INICIO CAMBIO: Eliminamos las importaciones de node-cron ---
// import cron from 'node-cron'; // ELIMINADO
// import mongoose from 'mongoose'; // ELIMINADO
// import Order from './features/orders/order.model.js'; // ELIMINADO
// import Product from './features/products/product.model.js'; // ELIMINADO
// --- FIN CAMBIO ---

// --- Carga de Rutas y Configuración ---
import conectarDB from './config/db.js'; 

import userRoutes from './features/users/user.routes.js';
import productRoutes from './features/products/product.routes.js'
import cartRoutes from './features/cart/cart.routes.js'; 
import orderRoutes from './features/orders/order.routes.js';
import shippingRoutes from './features/shipping/shipping.routes.js';

// 1. Cargar Variables de Entorno
dotenv.config();

// Verificar variables críticas al inicio
if (!process.env.MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI no está definida en el archivo .env');
    console.error('   Por favor, crea un archivo .env en la carpeta backend/ con:');
    console.error('   MONGO_URI=tu_string_de_conexion_mongodb');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('❌ ERROR: JWT_SECRET no está definida en el archivo .env');
    console.error('   Por favor, añade en tu archivo .env:');
    console.error('   JWT_SECRET=tu_secret_key_segura_aqui');
    process.exit(1);
}

// 2. Crear la App de Express
const app = express();

// 3. Conectar a la Base de Datos
conectarDB();

// 4. Middlewares
// Configurar CORS para permitir peticiones desde el frontend
app.use(cors({
    // --- INICIO CAMBIO: Preparamos CORS para Producción ---
    // Le decimos a CORS que acepte la URL de Vercel (que pondremos en .env)
    // o la de localhost si esa variable no existe.
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    // --- FIN CAMBIO ---
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json({ extended: true })); // Para poder leer JSON en el body

// 5. Definir el Puerto
const PORT = process.env.PORT || 4000;

// 6. Health Check Endpoint (para evitar que servicios se duerman)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'backend'
    });
});

// 7. Cargar Módulos de Rutas
console.log('Cargando ruta de usuarios en /api/users');
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes); 

// 8. Iniciar el Servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`El servidor está funcionando en el puerto ${PORT}`);
});