// src/services/orderService.js

// 1. Importamos nuestro 'cerebro' centralizado de Axios
import api from '../api/axios';

/**
 * Obtiene las órdenes del usuario logueado.
 */
export const getMyOrders = async (page = 1) => {
    // Enviamos el número de página como un query parameter
    const res = await api.get(`/orders/myorders?page=${page}`);
    // El backend ahora devolverá { orders, page, totalPages }
    return res.data;
};

/**
 * Obtiene una orden por su ID.
 */
export const getOrderById = async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
};

/**
 * Marca una orden como pagada.
 */
export const payOrder = async (orderId) => {
    const res = await api.put(`/orders/${orderId}/pay`);
    return res.data;
};

/**
 * Crea una nueva orden.
 */
export const createOrder = async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

/**
 * Crea una preferencia de pago de MercadoPago para una orden.
 * Esto devuelve la URL de pago a la que se debe redirigir al usuario.
 */
export const createMercadoPagoPreference = async (orderId) => {
    const response = await api.post(`/orders/${orderId}/create-payment-preference`);
    return response.data;
};