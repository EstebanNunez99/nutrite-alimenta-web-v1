// src/services/productService.js

// 1. Importamos nuestro 'cerebro' centralizado de Axios
import api from '../api/axios';

// --- SERVICIOS DE PRODUCTOS ---

/**
 * [MODIFICADA] Obtiene todos los productos. Ahora usa 'api' y la ruta es más simple.
 */
export const getAllProducts = async (page = 1, sort = '', category = '', search = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    if (sort) params.append('sort', sort);
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    // Usamos 'api' y la ruta ya no necesita '/api'
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
};

/**
 * Obtiene una lista de todas las categorías de productos.
 */
export const getAllCategories = async () => {
    const response = await api.get('/products/categories');
    return response.data;
};

/**
 * Obtiene un producto por su ID.
 */
export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

// --- Acciones de Admin (el token se añade automáticamente por el interceptor en api/axios.js) ---

/**
 * Crea un nuevo producto.
 */
export const createProduct = async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
};

/**
 * Actualiza un producto existente.
 */
export const updateProduct = async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
};

/**
 * Elimina un producto.
 */
export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};