// RUTA: web/src/api/axios.js

import axios from 'axios';

const api = axios.create({
    // La URL base de tu API se leerá de una variable de entorno.
    // Esto nos permite cambiarla fácilmente entre desarrollo y producción.
    baseURL: import.meta.env.VITE_API_URL
});

/* INTERCEPTOR (Opcional pero RECOMENDADO):
  Esto intercepta cada petición para añadir el token de autenticación
  automáticamente si existe. Así no tenemos que repetirlo en cada servicio.
*/
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;