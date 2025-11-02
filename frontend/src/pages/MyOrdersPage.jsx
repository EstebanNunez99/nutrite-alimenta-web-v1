import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/orderService";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import styles from "./styles/MyOrdersPage.module.css";
import useDocumentTitle from '../hooks/useDocumentTitle'


const MyOrdersPage = () => {
    useDocumentTitle('Mis pedidos')
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getMyOrders();
                setOrders(data);
            } catch (error) {
                console.error("Error al cargar las órdenes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

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
                            {orders.map((order) => (
                                <tr key={order._id} className={styles.tableRow}>
                                    <td className={styles.tableCell}>{order._id.substring(0, 10)}...</td>
                                    <td className={styles.tableCell}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className={styles.tableCell}>
                                        ${order.totalPrice.toFixed(2)}
                                    </td>
                                    <td className={styles.tableCell}>
                                        <span className={`${styles.statusBadge} ${order.isPaid ? styles.statusPaid : styles.statusPending}`}>
                                            {order.isPaid ? 'Pagado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <Button to={`/orden/${order._id}`} variant="secondary">
                                            Ver Detalles
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;