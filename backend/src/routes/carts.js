// backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { getCart, addItemToCart, removeItemFromCart, updateCartItem } = require('../controllers/cartController'); 
const { protect } = require('../middleware/authMiddleware');

// Rutas que probablemente ya tenés
router.get('/', protect, getCart);
router.post('/', protect, addItemToCart);
router.delete('/:productId', protect, removeItemFromCart);

// --- ESTA ES LA LÍNEA QUE TE FALTA Y CAUSA EL 404 ---
router.put('/', protect, updateCartItem);

module.exports = router;