import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderById, payOrder } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import useDocumentTitle from '../hooks/useDocumentTitle'


const OrderDetailPage = () => {
    useDocumentTitle('Detalle del pedido')
    const { id: orderId } = useParams();
    const { usuario } = useAuth(); // Para verificar si el que ve es el dueño

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const data = await getOrderById(orderId);
                setOrder(data);
            } catch (err) {
                setError('Orden no encontrada o no tienes permiso para verla.');
                console.error("Error al cargar la orden:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handlePayment = async () => {
        try {
            const updatedOrder = await payOrder(orderId);
            setOrder(updatedOrder); // Actualizamos el estado local para que la UI reaccione
            toast.success('¡Pago realizado con éxito!');
        } catch (err) {
            toast.error('Hubo un error al procesar el pago.');
            console.error("Error en el pago:", err);
        }
    };

    if (loading) return <Spinner />;
    if (error) return <h2>{error}</h2>;

    // Solo para asegurarnos que la orden cargó antes de intentar acceder a sus propiedades
    if (!order) return <h2>Orden no encontrada.</h2>;

    const formattedTotal = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(order.totalPrice);

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: 'var(--sombra-suave)' }}>
            <h2>Detalle de la Orden #{order._id.substring(0, 10)}...</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Fecha: {new Date(order.createdAt).toLocaleDateString('es-AR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </p>
            
            <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Resumen del Pedido</h4>
            <div style={{ marginBottom: '1.5rem' }}>
                {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item, index) => (
                        <div 
                            key={index} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '1rem', 
                                borderBottom: '1px solid #eee',
                                gap: '1rem'
                            }}
                        >
                            <img 
                                src={item.imagen || 'https://via.placeholder.com/80'} 
                                alt={item.nombre} 
                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <div style={{ flex: 1 }}>
                                <h5 style={{ margin: '0 0 0.5rem 0' }}>{item.nombre}</h5>
                                <p style={{ margin: '0', color: '#666' }}>
                                    Cantidad: {item.cantidad} x ${item.precio.toFixed(2)}
                                </p>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                ${(item.cantidad * item.precio).toFixed(2)}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No hay items en esta orden.</p>
                )}
            </div>
            <hr />

            <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Dirección de Envío</h4>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <p style={{ margin: '0.5rem 0' }}><strong>Dirección:</strong> {order.shippingAddress.address}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Ciudad:</strong> {order.shippingAddress.city}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Código Postal:</strong> {order.shippingAddress.postalCode}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>País:</strong> {order.shippingAddress.country}</p>
            </div>
            <hr />

            <div style={{ textAlign: 'right', marginTop: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0 }}>Total: {formattedTotal}</h3>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>
                    Método de pago: {order.paymentMethod || 'No especificado'}
                </p>
            </div>
            
            {/* --- SECCIÓN DE PAGO DINÁMICA --- */}
            <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h4 style={{ marginTop: 0 }}>Estado del Pago</h4>
                {order.isPaid ? (
                    <div>
                        <p style={{ color: 'var(--color-exito, #28a745)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            ✓ Pagado el {new Date(order.paidAt).toLocaleDateString('es-AR', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                        {order.isDelivered ? (
                            <p style={{ color: 'var(--color-exito, #28a745)', marginTop: '0.5rem' }}>
                                ✓ Entregado el {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('es-AR') : 'N/A'}
                            </p>
                        ) : (
                            <p style={{ color: '#666', marginTop: '0.5rem' }}>
                                En proceso de envío
                            </p>
                        )}
                    </div>
                ) : (
                    <div>
                        <p style={{ color: 'var(--color-peligro, #dc3545)', fontWeight: 'bold', marginBottom: '1rem' }}>
                            ⚠ Pendiente de Pago
                        </p>
                        {/* El botón de pago solo lo ve el dueño de la orden */}
                        {usuario && (usuario._id === order.usuario?._id || usuario._id === order.usuario?.toString()) && (
                            <Button onClick={handlePayment} variant="primary">
                                Pagar Ahora (Simulado)
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPage;