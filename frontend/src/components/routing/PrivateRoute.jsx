import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import  Spinner  from '../ui/Spinner.jsx'

const PrivateRoute = () => {
    const { isAuthenticated, cargando } = useAuth();

    if (cargando) return <Spinner />;

    // Si el usuario está autenticado, le permitimos ver el contenido.
    // Si no, lo redirigimos a la página de autenticación.
    return isAuthenticated ? <Outlet /> : <Navigate to="/auth" />;
};

export default PrivateRoute;