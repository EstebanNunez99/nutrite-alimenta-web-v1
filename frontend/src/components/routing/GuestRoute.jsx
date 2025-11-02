import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import  Spinner  from '../ui/Spinner.jsx'

const GuestRoute = () => {
    const { isAuthenticated, cargando } = useAuth();

    if (cargando) return <Spinner />;

    // Si el usuario está autenticado, no debe ver la página de login/registro.
    // Lo redirigimos a la página de inicio.
    return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
};

export default GuestRoute;