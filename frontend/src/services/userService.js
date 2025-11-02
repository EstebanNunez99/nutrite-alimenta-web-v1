// src/services/userService.js

// 1. Importamos nuestro 'cerebro' centralizado de Axios
import api from '../api/axios';

// --- SERVICIOS DE USUARIO ---

/**
 * Obtiene todos los usuarios, con paginación y búsqueda.
 */
export const getAllUsers = async (page = 1, search = '') => {
    const response = await api.get(`/users?page=${page}&search=${search}`);
    return response.data;
};

/**
 * Obtiene los datos de un usuario por su ID.
 */
export const getUserById = async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

/**
 * Actualiza el perfil del usuario logueado (nombre, email).
 */
export const updateUserProfile = async (userData) => {
    const response = await api.put('/users/profile', userData);
    // Ya no necesitamos actualizar localStorage aquí, es mejor centralizar esa lógica en el AuthContext si es necesario
    return response.data;
};

/**
 * Actualiza la contraseña del usuario logueado.
 */
export const updateUserPassword = async (passwordData) => {
    const response = await api.put('/users/profile/password', passwordData);
    return response.data;
};

// --- FUNCIONES PARA EL PANEL DE ADMIN ---

/**
 * Actualiza el rol de un usuario específico.
 */
export const updateUserRole = async (userId, roleData) => {
    const response = await api.put(`/users/role/${userId}`, roleData);
    return response.data;
};

/**
 * Elimina un usuario por su ID.
 */
export const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};