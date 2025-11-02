// src/services/cartService.js

// 1. Importamos nuestro 'cerebro' centralizado de Axios
import api from '../api/axios';

/**
 * Obtiene el carrito del usuario logueado.
 */
export const getCart = async () => {
    const res = await api.get('/cart');
    return res.data;
};

/**
 * Añade un item al carrito.
 */
export const addItemToCart = async (productoId, cantidad) => {
    const res = await api.post('/cart', { productoId, cantidad });
    return res.data;
};

/**
 * Elimina un item del carrito.
 */
export const removeItemFromCart = async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    return res.data;
};

/**
 * Actualiza la cantidad de un item en el carrito.
 */
export const updateCartItemQuantity = async (productId, quantity) => {
    const res = await api.put('/cart', { productId, quantity });
    return res.data;
};