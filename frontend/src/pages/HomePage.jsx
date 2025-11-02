import React from 'react';
import { useAuth } from '../hooks/useAuth';

// Importamos las TRES posibles páginas de inicio
import AdminHomePage from './AdminHomePage';
import ClientHomePage from './ClientHomePage';
import GuestHomePage from './GuestHomePage';
import  Spinner  from '../components/ui/Spinner'

const HomePage = () => {
    const { usuario, cargando } = useAuth();

    if (cargando) {
        return <Spinner />;
    }

    // Lógica de despacho de tres vías
    if (usuario?.rol === 'admin') {
        return <AdminHomePage />;
    }
    
    if (usuario?.rol === 'cliente') {
        return <ClientHomePage />;
    }
    
    // Si no es admin ni cliente, entonces es un invitado
    return <GuestHomePage />;
};

export default HomePage;