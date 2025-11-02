import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios'; 
import { AuthContext } from './AuthContext.js';

const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [cargando, setCargando] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUsuario(null);
        setIsAuthenticated(false);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // El interceptor ya sabe del token, solo necesitamos pedir el perfil.
            api.get('/users/profile')
                .then(res => {
                    setUsuario(res.data);
                    setIsAuthenticated(true);
                })
                .catch(() => logout()) // Si el token es inválido, el backend dará error y cerramos sesión.
                .finally(() => setCargando(false));
        } else {
            setCargando(false);
        }
    }, [logout]);

    const login = async (email, password) => {
        const res = await api.post('/users/login', { email, password });
        localStorage.setItem('token', res.data.token);
        const perfilRes = await api.get('/users/profile');
        setUsuario(perfilRes.data);
        setIsAuthenticated(true);
    };

    const registro = async (nombre, email, password) => {
        const res = await api.post('/users/register', { nombre, email, password });
        localStorage.setItem('token', res.data.token);
        const perfilRes = await api.get('/users/profile');
        setUsuario(perfilRes.data);
        setIsAuthenticated(true);
    };

    const updateUserContext = (newUserData) => {
        setUsuario(prevUsuario => ({ ...prevUsuario, ...newUserData }));
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated, usuario, cargando,
            login, registro, logout, updateUserContext
        }}>
            {!cargando && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;