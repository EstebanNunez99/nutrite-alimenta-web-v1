// src/App.jsx

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import AuthProvider from './context/AuthProvider.jsx';
import CartProvider from './context/CartProvider.jsx';

// El componente de Layout
import MainLayout from './components/layout/MainLayout.jsx';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <MainLayout />
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;