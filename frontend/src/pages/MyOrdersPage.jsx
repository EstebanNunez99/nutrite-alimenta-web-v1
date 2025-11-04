import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/orderService";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import Paginate from "../components/ui/Paginate"; // Asegúrate que la ruta a Paginate.jsx sea correcta
import styles from "./styles/MyOrdersPage.module.css";
import useDocumentTitle from '../hooks/useDocumentTitle'


const MyOrdersPage = () => {
    useDocumentTitle('Mis pedidos')
    const [orders, setOrders] = useState([]); // <-- El estado inicial es un array vacío (correcto)
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await getMyOrders(page);
                
                // --- INICIO DEL CAMBIO (SAFETY CHECK) ---
                // Nos aseguramos de que 'data.orders' exista; si no, usamos un array vacío.
                setOrders(data.orders || []); 
                // Nos aseguramos de que 'page' y 'totalPages' tengan valores por defecto.
                setPage(data.page || 1);
                setTotalPages(data.totalPages || 0);
                // --- FIN DEL CAMBIO ---

            } catch (error) {
                console.error("Error al cargar las órdenes:", error);
                // --- INICIO DEL CAMBIO (FALLBACK EN ERROR) ---
                // Si la API falla, seteamos 'orders' a un array vacío para que no crashee.
                setOrders([]);
                // --- FIN DEL CAMBIO ---
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'completada':
                return { text: 'Pagado', className: styles.statusPaid };
            case 'pendiente':
                return { text: 'Pendiente', className: styles.statusPending };
            case 'cancelada':
                return { text: 'Cancelada', className: styles.statusCancelled };
            default:
                return { text: status, className: styles.statusPending };
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>Historial de Compras</h2>
            
           {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Aún no has realizado ningún pedido.</p>
                    <Link to="/productos">
                        <Button variant="primary">Explorar Catálogo</Button>
                    </Link>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead className={styles.tableHead}>
                            <tr>
                                <th>ID de Orden</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const statusInfo = getStatusInfo(order.status);
                                return (
                                <tr key={order._id} className={styles.tableRow}>
                                    <td className={styles.tableCell}>{order._id.substring(0, 10)}...</td>
                                    <td className={styles.tableCell}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className={styles.tableCell}>
                                        ${order.totalPrice.toFixed(2)}
                                    </td>
                                    <td className={styles.tableCell}>
                                        <span className={`${styles.statusBadge} ${statusInfo.className}`}>
                                            {statusInfo.text}
                                        </span>
                                    </td>
                                    <td className={styles.tableCell}>

                                        <Button to={`/orden/${order._id}`} variant="secondary">
                                            Ver Detalles
                                        </Button>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <div className={styles.paginationContainer}>
                <Paginate pages={totalPages} page={page} onPageChange={handlePageChange} />
            </div>
        </div>
    );
};

export default MyOrdersPage;