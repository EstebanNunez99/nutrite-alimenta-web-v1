import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import styles from './styles/CheckoutPage.module.css';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { calculateShippingCost } from '../services/shippingService.js';


const CheckoutPage = () => {
    useDocumentTitle('Checkout')
    // 1. OBTENEMOS el estado 'loading' de nuestro hook
    const { cart, itemCount, checkout, loading } = useCart(); 
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: 'Argentina' // Valor por defecto
    });

    const [paymentMethod, setPaymentMethod] = useState('MercadoPago');
    const [isProcessing, setIsProcessing] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingDistance, setShippingDistance] = useState(0);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [shippingMessage, setShippingMessage] = useState('');

    const onChange = (e) => {
        setShippingAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const calculateShipping = useCallback(async (address) => {
        if (!address.address || !address.city || !address.postalCode) {
            return;
        }
        
        setIsCalculatingShipping(true);
        try {
            const cartTotal = cart.items.reduce((total, item) => total + item.cantidad * item.precio, 0);
            const result = await calculateShippingCost(address, cartTotal);
            
            if (result.freeShipping) {
                setShippingCost(0);
                setShippingDistance(result.distance || 0);
                setShippingMessage(result.message || 'Envío gratuito');
            } else {
                setShippingCost(result.cost || 0);
                setShippingDistance(result.distance || 0);
                setShippingMessage(result.estimated ? 'Costo estimado' : '');
            }
        } catch (error) {
            console.error('Error al calcular envío:', error);
            if (error.response?.status === 400) {
                toast.error(error.response.data.msg || 'La dirección está fuera del área de cobertura');
                setShippingCost(0);
                setShippingMessage('');
            } else {
                // Si hay error, usar costo mínimo como fallback
                setShippingCost(500);
                setShippingMessage('No se pudo calcular. Se aplicará costo mínimo.');
            }
        } finally {
            setIsCalculatingShipping(false);
        }
    }, [cart.items]);

    // Recalcular envío cuando cambian los items del carrito o la dirección
    useEffect(() => {
        if (shippingAddress.address && shippingAddress.city && shippingAddress.postalCode) {
            const timer = setTimeout(() => {
                calculateShipping(shippingAddress);
            }, 500); // Debounce
            
            return () => clearTimeout(timer);
        }
    }, [cart.items, shippingAddress, calculateShipping]);

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        
        try {
            const orderData = {
                shippingAddress,
                paymentMethod: paymentMethod,
                shippingCost: shippingCost
            };
            
            const createdOrder = await checkout(orderData);
            toast.success('¡Orden creada con éxito!');
            
            // Si es MercadoPago, redirigir a la página de la orden donde se genera el link de pago
            navigate(`/orden/${createdOrder._id}`);
        } catch (error) {
            console.error('Error al crear la orden:', error);
            toast.error(error.response?.data?.msg || 'Hubo un error al procesar tu orden.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Si todavía está cargando la información inicial del carrito, mostramos un Spinner.
    if (loading) {
        return <Spinner />;
    }

    // 2. AÑADIMOS una doble verificación: si el carrito no existe O si está vacío, no continuamos.
    if (!cart || itemCount === 0) {
        return (
            <div className={styles.pageContainer} style={{ textAlign: 'center' }}>
                <h2>Checkout</h2>
                <p>Tu carrito está vacío. No puedes proceder al pago.</p>
            </div>
        );
    }

    // Si llegamos aquí, estamos 100% seguros de que 'cart' es un objeto y tiene items.
    const cartSubtotal = cart.items.reduce((total, item) => total + item.cantidad * item.precio, 0);
    const total = cartSubtotal + shippingCost;

    const formattedSubtotal = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(cartSubtotal);

    const formattedShipping = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(shippingCost);

    const formattedTotal = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(total);

    return (
        <div className={styles.pageContainer}>
            <h2>Finalizar Compra</h2>
            <div className={styles.checkoutGrid}>
                <div className={styles.shippingForm}>
                    <h3>Información de Envío</h3>
                    <form onSubmit={handlePlaceOrder} className={styles.form}>
                        <Input 
                            label="Dirección" 
                            type="text" 
                            name="address" 
                            value={shippingAddress.address}
                            onChange={onChange} 
                            required 
                            placeholder="Calle y número"
                        />
                        <Input 
                            label="Ciudad" 
                            type="text" 
                            name="city" 
                            value={shippingAddress.city}
                            onChange={onChange} 
                            required 
                            placeholder="Ciudad"
                        />
                        <Input 
                            label="Código Postal" 
                            type="text" 
                            name="postalCode" 
                            value={shippingAddress.postalCode}
                            onChange={onChange} 
                            required 
                            placeholder="CP"
                        />
                        <Input 
                            label="País" 
                            type="text" 
                            name="country" 
                            value={shippingAddress.country}
                            onChange={onChange} 
                            required 
                            placeholder="País"
                        />
                        {isCalculatingShipping && (
                            <p className={styles.aviso} style={{ color: '#007bff' }}>
                                Calculando costo de envío...
                            </p>
                        )}
                        {shippingMessage && !isCalculatingShipping && (
                            <p className={styles.aviso} style={{ color: shippingCost === 0 ? '#28a745' : '#666' }}>
                                {shippingMessage}
                                {shippingDistance > 0 && ` (Distancia: ${shippingDistance} km)`}
                            </p>
                        )}
                        
                        <div className={styles.paymentMethodSection}>
                            <label htmlFor="paymentMethod" className={styles.selectLabel}>
                                Método de Pago
                            </label>
                            <select 
                                id="paymentMethod"
                                value={paymentMethod} 
                                onChange={handlePaymentMethodChange}
                                className={styles.selectInput}
                                required
                            >
                                <option value="MercadoPago">MercadoPago</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia Bancaria</option>
                            </select>
                            {paymentMethod === 'MercadoPago' && (
                                <p className={styles.paymentNote}>
                                    Serás redirigido a MercadoPago para completar el pago de forma segura.
                                </p>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            variant='primary' 
                            disabled={isProcessing}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
                        </Button>
                    </form>
                </div>
                <div className={styles.orderSummary}>
                    <h3>Resumen de la Orden</h3>
                    <div className={styles.summaryItemList}>
                        {cart.items.map(item => (
                            <div key={item.producto._id} className={styles.summaryItem}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <img 
                                        src={item.producto.imagen || 'https://via.placeholder.com/50'} 
                                        alt={item.producto.nombre}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <span style={{ display: 'block', fontWeight: '500' }}>{item.producto.nombre}</span>
                                        <span style={{ fontSize: '0.875rem', color: '#666' }}>
                                            {item.cantidad} x {new Intl.NumberFormat("es-AR", {
                                                style: "currency",
                                                currency: "ARS",
                                            }).format(item.precio)}
                                        </span>
                                    </div>
                                </div>
                                <span style={{ fontWeight: 'bold' }}>
                                    {new Intl.NumberFormat("es-AR", {
                                        style: "currency",
                                        currency: "ARS",
                                    }).format(item.precio * item.cantidad)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <hr className={styles.summaryDivider} />
                    <div className={styles.summaryRow}>
                        <span>Subtotal:</span>
                        <span>{formattedSubtotal}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Envío:</span>
                        <span>
                            {isCalculatingShipping ? 'Calculando...' : formattedShipping}
                        </span>
                    </div>
                    <hr className={styles.summaryDivider} />
                    <div className={styles.summaryTotal}>
                        <span>Total:</span>
                        <span>{formattedTotal}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;