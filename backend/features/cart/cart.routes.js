import express from 'express';
import { getCart, addItemToCart, removeItemFromCart, updateCartItemQuantity } from './cart.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas aquí requieren que el usuario esté autenticado.
router.use(authMiddleware);

router.get('/', getCart);
router.post('/', addItemToCart);
router.put('/', updateCartItemQuantity);
router.delete('/:productId', removeItemFromCart);

export default router;