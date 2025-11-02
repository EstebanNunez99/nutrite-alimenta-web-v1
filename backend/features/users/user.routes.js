import express from 'express';
import { authMiddleware, adminMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { 
    register, 
    login, 
    getProfile, 
    getAllUsers,
    updateUserProfile,
    updateUserPassword
} from './user.controller.js';

const router = express.Router();

// --- Rutas Públicas ---
router.post('/register', register);
router.post('/login', login);

// --- Rutas para Usuarios Autenticados ---
router.get('/profile', authMiddleware, getProfile);
router.get('/', authMiddleware, adminMiddleware, getAllUsers);

//rutas privadas para cambair usario y contraseña
router.put('/profile', authMiddleware, updateUserProfile);
router.put('/profile/password', authMiddleware, updateUserPassword);

export default router;