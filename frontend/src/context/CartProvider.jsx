// src/context/CartProvider.jsx

// --- ÚNICO CAMBIO AQUÍ: Eliminamos 'createContext' porque ya no se usa en este archivo ---
import React, { useState, useEffect } from 'react';
import { CartContext } from './CartContext.js';
import { getCart, addItemToCart, removeItemFromCart, updateCartItemQuantity } from '../services/cartService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { createOrder } from '../services/orderService'; 
const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const loadCart = async () => {
            if (isAuthenticated) {
                try {
                    setLoading(true);
                    const cartData = await getCart();
                    setCart(cartData);
                } catch (error) {
                    console.error("Error al cargar el carrito:", error);
                    setCart({ items: [] });
                } finally {
                    setLoading(false);
                }
            } else {
                setCart(null);
                setLoading(false);
            }
        };
        loadCart();
    }, [isAuthenticated]);
const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const addItem = async (productId, quantity) => {
        try {
            const updatedCart = await addItemToCart(productId, quantity);
            setCart(updatedCart);
            // toast.success("Producto añadido al carrito!");
            openCart();
        } catch (error) {
            toast.error("No se pudo añadir el producto.", error.status);
        }
    };

    const removeItem = async (productId) => {
        try {
            const updatedCart = await removeItemFromCart(productId);
            setCart(updatedCart);
            toast.info("Producto eliminado del carrito.");
        } catch (error) {
            toast.error("No se pudo eliminar el producto.", error.status);
        }
    };

    const updateItemQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            return removeItem(productId);
        }
        
        const originalCart = cart;
        try {
            const updatedItems = cart.items.map(item =>
                item.producto._id === productId ? { ...item, cantidad: newQuantity } : item
            );
            setCart({ ...cart, items: updatedItems });

            const updatedCartFromServer = await updateCartItemQuantity(productId, newQuantity);
            setCart(updatedCartFromServer);
        } catch (error) {
            console.error("Error al actualizar cantidad, revirtiendo.", error);
            setCart(originalCart);
            toast.error("No se pudo actualizar la cantidad.");
        }
    };
    
    const clearCart = async () => {
        // Recargar el carrito desde el servidor para asegurarnos de que está vacío
        if (isAuthenticated) {
            try {
                const cartData = await getCart();
                setCart(cartData);
            } catch (error) {
                console.error("Error al recargar el carrito:", error);
                setCart({ items: [] });
            }
        } else {
            setCart(null);
        }
    };

    const itemCount = cart ? cart.items.reduce((sum, item) => sum + item.cantidad, 0) : 0;

    const checkout = async (orderData) => {
        try {
            const newOrder = await createOrder(orderData);
            // Después de crear la orden con éxito, recargamos el carrito vacío
            await clearCart(); 
            return newOrder; // Devolvemos la orden creada para que la página pueda redirigir
        } catch (error) {
            // Si hay un error, lo relanzamos para que el componente que llamó a checkout (CheckoutPage) lo pueda atrapar
            console.error("Error en el proceso de checkout:", error);
            throw error;
        }
    };


    return (
        <CartContext.Provider 
            value={{ 
                cart, 
                loading, 
                addItem, 
                removeItem, 
                updateItemQuantity, 
                clearCart, 
                itemCount,
                isCartOpen,
                openCart,
                closeCart,
                
                // 3. AÑADIMOS 'checkout' al 'value' del Provider
                checkout,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;