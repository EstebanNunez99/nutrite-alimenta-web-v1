import axios from 'axios';

// En desarrollo, usa el proxy de Vite. En producción, usa la variable de entorno.
let baseURL;
if (import.meta.env.VITE_API_URL) {
    baseURL = import.meta.env.VITE_API_URL;
} else if (import.meta.env.DEV) {
    // En desarrollo, usar el proxy de Vite que redirige /api a localhost:4000
    baseURL = '/api';
} else {
    // En producción, fallback a localhost (cambiar según tu configuración)
    baseURL = 'http://localhost:4000/api';
}


const api = axios.create({
    baseURL: baseURL,
    timeout: 10000, // 10 segundos de timeout
});

// Interceptor para requests
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

// Interceptor para responses (para mejor manejo de errores)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si es un error 401, limpiar token y redirigir
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Solo redirigir si no estamos ya en /auth
            if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default api;