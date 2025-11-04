import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart.js';
import styles from './CartModal.module.css';
import Button from '../../components/ui/Button';

const CartModal = () => {
    // 1. OBTENEMOS LAS NUEVAS FUNCIONES Y ESTADOS QUE NECESITAMOS
    const { cart, removeItem, itemCount, isCartOpen, closeCart,updateItemQuantity } = useCart();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isCartOpen) {
            // Cuando 'isCartOpen' es true, el overlay (fondo negro) empieza su 'fade-in'.
            // Esperamos 10ms antes de activar el 'slide-in' del modal.
            const timer = setTimeout(() => {
                setShow(true);
            }, 10); // 10ms es suficiente para forzar el reflow
            
            return () => clearTimeout(timer);
        } else {
            // Cuando cerramos, ocultamos el modal inmediatamente
            // para que su animación 'slide-out' comience.
            setShow(false);
        }
    }, [isCartOpen]); // Este efecto depende de 'isCartOpen' del context

    const handleConfirmPurchase = () => {
        closeCart(); // Cierra el modal
        navigate('/carrito'); // Navega a la página detallada del carrito
    };

    const cartTotal = cart?.items.reduce((total, item) => total + item.cantidad * item.precio, 0) || 0;
    const formattedTotal = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(cartTotal);

    return (
        <div className={`${styles.overlay} ${isCartOpen ? styles.isOpen : ''}`} onClick={closeCart}>
            <div className={`${styles.modal} ${show ? styles.isOpen : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Tu Carrito ({itemCount})</h3>
                    {/* El botón "X" ahora usa la función closeCart del contexto */}
                    <Button onClick={closeCart} variant="secondary">X</Button>
                </div>

                <div className={styles.modalContent}>
                    {(!cart || itemCount === 0) ? (
                        <p>Tu carrito está vacío.</p>
                    ) : (
                        cart.items.map(item => (
                            <div key={item.producto._id} className={styles.cartItem}>
                                <img src={item.producto.imagen || 'https://via.placeholder.com/50'} alt={item.producto.nombre} style={{ width: '50px', marginRight: '10px' }} />
                                <div style={{ flexGrow: 1 }}>
                                    <p>{item.producto.nombre} x {item.cantidad}</p>
                                    <p>${item.precio}</p>
                                </div>
                                <div className={styles.modalControl}>
                                    <div className={styles.quantityControl}>
                                        {/* ANTES: <button> */}
                                        <Button
                                            variant="quantity" // Usamos nuestra nueva variante
                                            onClick={() =>
                                                updateItemQuantity(item.producto._id, item.cantidad - 1)
                                            }
                                            disabled={item.cantidad <= 1}
                                        >
                                            -
                                        </Button>
                                        <span className={styles.quantityDisplay}>
                                            {item.cantidad}
                                        </span>
                                        {/* ANTES: <button> */}
                                        <Button
                                            variant="quantity" // Usamos nuestra nueva variante
                                            onClick={() =>
                                                updateItemQuantity(item.producto._id, item.cantidad + 1)
                                            }
                                        >
                                            +
                                        </Button>
                                    </div>
                                    <Button variant="danger" onClick={() => removeItem(item.producto._id)} style={{padding:2}}>
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart && itemCount > 0 && (
                    <div className={styles.modalFooter}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <span>Total:</span>
                            <span>{formattedTotal}</span>
                        </div>

                        {/* --- 2. NUEVOS BOTONES --- */}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                            <Button variant="secondary" onClick={closeCart} style={{ width: '100%' }}>
                                Seguir Comprando
                            </Button>
                            <Button variant="primary" onClick={handleConfirmPurchase} style={{ width: '100%' }}>
                                Confirmar Compra
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;