import express from 'express';
import { 
    createOrder, 
    getMyOrders, 
    getOrderById, 
    updateOrderToPaid, 
    createMercadoPagoPreference,
    receiveMercadoPagoWebhook,
    triggerOrderCleanup,
    getAllOrders,
    updateDeliveryStatus,
    createManualOrder
} from './order.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../shared/middlewares/adminMiddleware.js';

const router = express.Router();


// Endpoint para cron job - debe estar antes del middleware de autenticación
router.get('/trigger-cron', triggerOrderCleanup);

// Ruta pública para el Webhook de MercadoPago
router.post('/webhook/mercadopago', receiveMercadoPagoWebhook);

// --- Todas las siguientes rutas son PRIVADAS ---
router.use(authMiddleware);

// Rutas específicas primero (antes de las dinámicas)
router.post('/', createOrder);
router.get('/myorders', getMyOrders);

// --- Rutas de Admin (deben estar antes de /:id para evitar conflictos) ---
// authMiddleware ya está aplicado arriba, solo agregamos adminMiddleware
router.get('/', adminMiddleware, getAllOrders);
router.post('/manual', adminMiddleware, createManualOrder);

// Rutas dinámicas (deben ir después de las rutas específicas)
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);
router.post('/:id/create-payment-preference', createMercadoPagoPreference);

// Rutas de Admin que usan parámetros dinámicos
router.put('/:id/delivery', adminMiddleware, updateDeliveryStatus);

export default router;