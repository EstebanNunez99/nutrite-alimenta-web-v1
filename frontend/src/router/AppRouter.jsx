import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- ANTES: Importábamos todo directamente ---
/*
import AuthPage from '../pages/AuthPage';
import HomePage from '../pages/HomePage';
... etc ...
*/

// --- DESPUÉS: Usamos React.lazy para cada página ---
// Esto divide el código en pequeños trozos que se cargan solo cuando se necesitan.
const AuthPage = React.lazy(() => import('../pages/AuthPage'));
const HomePage = React.lazy(() => import('../pages/HomePage'));
const ProductsPage = React.lazy(() => import('../pages/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('../pages/ProductDetailPage'));
const AdminDashboardPage = React.lazy(() => import('../pages/AdminDashboardPage'));
const AdminProductsPage = React.lazy(() => import('../pages/AdminProductsPage'));
const AdminSalesHistoryPage = React.lazy(() => import('../pages/AdminSalesHistoryPage'));
const AdminShippingConfigPage = React.lazy(() => import('../pages/AdminShippingConfigPage'));
const AdminCreateManualOrderPage = React.lazy(() => import('../pages/AdminCreateManualOrderPage'));
const AdminUsersPage = React.lazy(() => import('../pages/AdminUsersPage'));
const CreateProductPage = React.lazy(() => import('../pages/CreateProductPage'));
const EditProductPage = React.lazy(() => import('../pages/EditProductPage'));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage'));
const CartPage = React.lazy(() => import('../pages/CartPage'));
const OrderDetailPage = React.lazy(() => import('../pages/OrderDetailPage'));
const CheckoutPage = React.lazy(() => import('../pages/CheckoutPage'));
const MyOrdersPage = React.lazy(() => import('../pages/MyOrdersPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

// Los componentes de ruteo (guardianes) se importan directamente porque son pequeños
// y necesarios para la lógica del router de inmediato.
import GuestRoute from '../components/routing/GuestRoute';
import PrivateRoute from '../components/routing/PrivateRoute';
import AdminRoute from '../components/routing/AdminRoute';

const AppRouter = () => {
    // El resto del componente no necesita NINGÚN cambio.
    // La estructura de rutas sigue siendo la misma.
    return (
        <Routes>
            {/* --- Rutas Públicas (accesibles por todos) --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            
            {/* --- Rutas solo para Invitados (no logueados) --- */}
            <Route element={<GuestRoute />}>
                <Route path="/auth" element={<AuthPage />} />
            </Route>

            {/* --- Rutas Privadas (solo para usuarios logueados) --- */}
            <Route element={<PrivateRoute />}>
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/carrito" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orden/:id" element={<OrderDetailPage />} />
                <Route path="/mis-pedidos" element={<MyOrdersPage />} />

                {/* Rutas de Admin */}
                <Route path="/admin" element={<AdminRoute />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="products/create" element={<CreateProductPage />} />
                    <Route path="products/edit/:id" element={<EditProductPage />} />
                    <Route path="sales-history" element={<AdminSalesHistoryPage />} />
                    <Route path="shipping-config" element={<AdminShippingConfigPage />} />
                    <Route path="orders/manual" element={<AdminCreateManualOrderPage />} />
                </Route>
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRouter;