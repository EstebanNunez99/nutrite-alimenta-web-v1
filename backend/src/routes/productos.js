import express from 'express';
import { crearProducto, obtenerProductos } from '../controllers/productosController.js';
import { verificarToken, soloAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verificarToken, soloAdmin, crearProducto); // Solo admin puede crear
router.get('/', obtenerProductos); // Público

export default router;
