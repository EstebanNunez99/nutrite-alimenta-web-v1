import express from 'express';
import { 
    getShippingConfig, 
    updateShippingConfig, 
    calculateShippingCost 
} from './shipping.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../shared/middlewares/adminMiddleware.js';

const router = express.Router();

// Ruta pública para calcular costo de envío (se usa en checkout)
router.post('/calculate', calculateShippingCost);

// Rutas protegidas para admin
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/config', getShippingConfig);
router.put('/config', updateShippingConfig);

export default router;

