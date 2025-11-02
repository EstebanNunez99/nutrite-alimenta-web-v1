import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getAllCategories
} from './product.controller.js';
import { authMiddleware, adminMiddleware } from '../../shared/middlewares/auth.middleware.js';

const router = express.Router();

// Rutas Públicas (para leer productos)
router.get('/categories', getAllCategories); // Esta ruta debe ir ANTES de /:id para evitar conflictos
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Rutas Privadas (solo para Admins, para crear, actualizar y eliminar)
const adminMiddlewares = [authMiddleware, adminMiddleware];

router.post('/', adminMiddlewares, createProduct);
router.put('/:id', adminMiddlewares, updateProduct);
router.delete('/:id', adminMiddlewares, deleteProduct);

export default router;