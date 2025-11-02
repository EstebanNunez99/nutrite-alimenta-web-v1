import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner  from '../ui/Spinner.jsx'
const AdminRoute = () => {
    const { isAuthenticated, usuario, cargando } = useAuth();

    if (cargando) {
        return <Spinner />;
    }

    // Si está autenticado y su rol es 'admin', permite el acceso.
    // Si no, lo redirige a la página principal.
    return (isAuthenticated && usuario?.rol === 'admin') ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;