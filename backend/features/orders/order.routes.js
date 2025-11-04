import express from 'express';
import { 
    createOrder, 
    getMyOrders, 
    getOrderById, 
    updateOrderToPaid, 
    createMercadoPagoPreference,
    receiveMercadoPagoWebhook 
} from './order.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const router = express.Router();



router.post('/webhook/mercadopago', receiveMercadoPagoWebhook);

router.use(authMiddleware);

router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);

// Ruta para crear preferencia de MercadoPago
router.post('/:id/create-payment-preference', createMercadoPagoPreference);

export default router;