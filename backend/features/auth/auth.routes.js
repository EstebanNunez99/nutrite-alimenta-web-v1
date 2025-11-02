// backend/routes/auth.js
import express from 'express'
import { registrarUsuario, loginUsuario, obtenerPerfilUsuario, obtenerTodosLosUsuarios } from '../controllers/authController.js';
import authMiddleware, { adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
// Rutas publicas
router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario)

//Rutas protegidas
router.get('/perfil', authMiddleware ,obtenerPerfilUsuario)

//Ruta solo para admin
router.get('/usuarios', authMiddleware, adminMiddleware, obtenerTodosLosUsuarios);

export default router;