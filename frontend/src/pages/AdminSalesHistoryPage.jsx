import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllOrders, updateDeliveryStatus } from '../services/orderService';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useDocumentTitle from '../hooks/useDocumentTitle';
import styles from './styles/AdminSalesHistoryPage.module.css';

const AdminSalesHistoryPage = () => {
    useDocumentTitle('Admin - Historial de Ventas');
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    
    // Filtros
    const [filters, setFilters] = useState({
        status: '',
        deliveryStatus: '',
        startDate: '',
        endDate: '',
        customerName: '',
        productName: ''
    });

    useEffect(() => {
        loadOrders();
    }, [page, filters]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await getAllOrders({ ...filters, page });
            setOrders(data.orders);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
            toast.error('Error al cargar el historial de ventas');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(1); // Resetear a la primera página al filtrar
    };

    const handleDeliveryStatusChange = async (orderId, newStatus) => {
        try {
            await updateDeliveryStatus(orderId, newStatus);
            toast.success('Estado de entrega actualizado');
            loadOrders();
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            toast.error('Error al actualizar el estado de entrega');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pendiente: { label: 'Pendiente', class: styles.badgeWarning },
            completada: { label: 'Completada', class: styles.badgeSuccess },
            cancelada: { label: 'Cancelada', class: styles.badgeDanger }
        };
        return badges[status] || { label: status, class: styles.badgeDefault };
    };

    const getDeliveryStatusBadge = (deliveryStatus) => {
        const badges = {
            no_enviado: { label: 'No Enviado', class: styles.badgeDefault },
            enviado: { label: 'Enviado', class: styles.badgeWarning },
            entregado: { label: 'Entregado', class: styles.badgeSuccess }
        };
        return badges[deliveryStatus] || { label: deliveryStatus, class: styles.badgeDefault };
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
        }).format(amount);
    };

    if (loading && orders.length === 0) {
        return <Spinner />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Historial de Ventas</h2>
                <Button onClick={() => navigate('/admin/orders/manual')} variant="primary">
                    Crear Venta Manual
                </Button>
            </div>

            {/* Filtros */}
            <div className={styles.filters}>
                <h3>Filtros</h3>
                <div className={styles.filterGrid}>
                    <div>
                        <label>Estado de Pago</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>

                    <div>
                        <label>Estado de Entrega</label>
                        <select
                            value={filters.deliveryStatus}
                            onChange={(e) => handleFilterChange('deliveryStatus', e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="no_enviado">No Enviado</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregado">Entregado</option>
                        </select>
                    </div>

                    <div>
                        <label>Fecha Desde</label>
                        <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Fecha Hasta</label>
                        <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Nombre del Cliente</label>
                        <Input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={filters.customerName}
                            onChange={(e) => handleFilterChange('customerName', e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Producto</label>
                        <Input
                            type="text"
                            placeholder="Buscar por producto..."
                            value={filters.productName}
                            onChange={(e) => handleFilterChange('productName', e.target.value)}
                        />
                    </div>
                </div>

                <Button
                    onClick={() => {
                        setFilters({
                            status: '',
                            deliveryStatus: '',
                            startDate: '',
                            endDate: '',
                            customerName: '',
                            productName: ''
                        });
                        setPage(1);
                    }}
                    variant="secondary"
                >
                    Limpiar Filtros
                </Button>
            </div>

            {/* Resumen */}
            <div className={styles.summary}>
                <p>Total de órdenes: <strong>{total}</strong></p>
            </div>

            {/* Tabla de órdenes */}
            <div className={styles.tableContainer}>
                {orders.length === 0 ? (
                    <p className={styles.noData}>No se encontraron órdenes</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Productos</th>
                                <th>Total</th>
                                <th>Estado Pago</th>
                                <th>Estado Entrega</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const statusBadge = getStatusBadge(order.status);
                                const deliveryBadge = getDeliveryStatusBadge(order.deliveryStatus);
                                
                                return (
                                    <tr key={order._id}>
                                        <td>
                                            <button
                                                className={styles.orderLink}
                                                onClick={() => navigate(`/orden/${order._id}`)}
                                            >
                                                {order._id.substring(0, 8)}...
                                            </button>
                                        </td>
                                        <td>
                                            {order.usuario?.nombre || 'N/A'}
                                            <br />
                                            <small>{order.usuario?.email || ''}</small>
                                        </td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>
                                            {order.items.length} item(s)
                                            <br />
                                            <small>
                                                {order.items.slice(0, 2).map(item => item.nombre).join(', ')}
                                                {order.items.length > 2 && '...'}
                                            </small>
                                        </td>
                                        <td>{formatCurrency(order.totalPrice)}</td>
                                        <td>
                                            <span className={`${styles.badge} ${statusBadge.class}`}>
                                                {statusBadge.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${deliveryBadge.class}`}>
                                                {deliveryBadge.label}
                                            </span>
                                            {order.status === 'completada' && (
                                                <select
                                                    className={styles.statusSelect}
                                                    value={order.deliveryStatus}
                                                    onChange={(e) => handleDeliveryStatusChange(order._id, e.target.value)}
                                                >
                                                    <option value="no_enviado">No Enviado</option>
                                                    <option value="enviado">Enviado</option>
                                                    <option value="entregado">Entregado</option>
                                                </select>
                                            )}
                                        </td>
                                        <td>
                                            <Button
                                                variant="secondary"
                                                onClick={() => navigate(`/orden/${order._id}`)}
                                            >
                                                Ver Detalle
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <Button
                        variant="secondary"
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                    >
                        Anterior
                    </Button>
                    <span>Página {page} de {totalPages}</span>
                    <Button
                        variant="secondary"
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages}
                    >
                        Siguiente
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AdminSalesHistoryPage;

