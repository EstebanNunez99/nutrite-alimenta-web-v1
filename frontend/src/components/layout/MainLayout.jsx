// src/components/layout/MainLayout.jsx

import React, { Suspense } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import styles from './MainLayout.module.css'; // Importamos sus propios estilos

// Componentes
import Header from './Header';
import Footer from './Footer';
import Spinner from '../ui/Spinner';
import CartModal from '../../features/cart/CartModal';
import AppRouter from '../../router/AppRouter';

// Notificaciones
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const MainLayout = () => {
    const { cargando } = useAuth();
    const { isCartOpen } = useCart();

    // El chequeo de carga inicial del Auth se queda aquí
    if (cargando) {
        return <Spinner />;
    }

    return (
        <div className={styles.layout}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            
            <Header />
            
            <main className={styles.mainContent}>
                <Suspense fallback={<Spinner />}>
                    <AppRouter />
                </Suspense>
            </main>
            
            <Footer />
            
            {isCartOpen && <CartModal />}
        </div>
    );
};

export default MainLayout;