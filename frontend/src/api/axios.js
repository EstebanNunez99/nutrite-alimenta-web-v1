import axios from 'axios';

// --- INICIO DEL CAMBIO ---
// Esta es la forma estándar de Vite.
// Lee VITE_API_URL del archivo .env correspondiente.
const baseURL = import.meta.env.VITE_API_URL;

// Damos un error si la variable no está definida al arrancar
if (!baseURL) {
    console.error(
        "Error: VITE_API_URL no está definida.",
        "Asegúrate de tener un .env.development (local) o variables de entorno (producción)."
    );
}
// --- FIN DEL CAMBIO ---

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
