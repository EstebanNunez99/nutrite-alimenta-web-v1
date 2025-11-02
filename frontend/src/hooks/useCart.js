
import { useContext } from 'react';
import { CartContext } from '../context/CartContext.js'; // <-- Asegúrate que la ruta sea correcta

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};