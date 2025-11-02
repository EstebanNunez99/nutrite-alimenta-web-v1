import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import useDocumentTitle from '../hooks/useDocumentTitle'
const notFoundStyles = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    height: '60vh', // Ocupa una buena parte de la pantalla
};

const NotFoundPage = () => {
    useDocumentTitle('Error 404 - Página no encontrada')
    return (
        <div style={notFoundStyles}>
            <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
            <h2 style={{ margin: '0 0 20px 0' }}>Página No Encontrada</h2>
            <p>Lo sentimos, la página que estás buscando no existe.</p>
            <Link to="/">
                <Button variant='primary'>Volver al Inicio</Button>
            </Link>
        </div>
    );
};

export default NotFoundPage;