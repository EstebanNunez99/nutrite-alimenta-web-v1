import api from '../api/axios';

/**
 * Calcular costo de envío
 */
export const calculateShippingCost = async (shippingAddress, orderTotal = 0) => {
    const res = await api.post('/shipping/calculate', {
        shippingAddress,
        orderTotal
    });
    return res.data;
};

/**
 * Obtener configuración de envío (Admin)
 */
export const getShippingConfig = async () => {
    const res = await api.get('/shipping/config');
    return res.data;
};

/**
 * Actualizar configuración de envío (Admin)
 */
export const updateShippingConfig = async (configData) => {
    const res = await api.put('/shipping/config', configData);
    return res.data;
};

