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

/**
 * Obtener todas las órdenes (Admin)
 */
export const getAllOrders = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.deliveryStatus) queryParams.append('deliveryStatus', filters.deliveryStatus);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.customerName) queryParams.append('customerName', filters.customerName);
    if (filters.productName) queryParams.append('productName', filters.productName);

    const res = await api.get(`/orders?${queryParams.toString()}`);
    return res.data;
};

/**
 * Actualizar estado de entrega de una orden (Admin)
 */
export const updateDeliveryStatus = async (orderId, deliveryStatus) => {
    const res = await api.put(`/orders/${orderId}/delivery`, { deliveryStatus });
    return res.data;
};

/**
 * Crear orden manual (Admin)
 */
export const createManualOrder = async (orderData) => {
    const res = await api.post('/orders/manual', orderData);
    return res.data;
};