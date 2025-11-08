import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import styles from './styles/AdminDashboardPage.module.css'
import useDocumentTitle from '../hooks/useDocumentTitle';

const AdminDashboardPage = () => {
    useDocumentTitle('Admin - Panel de Administración')
    return (
        <div className={styles.dashboard}>
            <h2>Panel de Administración</h2>
            <p>Bienvenido al panel de control. Selecciona una opción para continuar.</p>
            <nav >
                <ul className={styles.navList}>
                    <li >
                        <Link to="/admin/products" className={styles.navItem}>
                            <Button variant='primary'>Gestionar Productos</Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="" className={styles.navItem}>
                            <Button variant='primary'>Ver historial ventas</Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="" className={styles.navItem}>
                            <Button variant='primary'>Ver Compras en curso</Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="" className={styles.navItem}>
                            <Button variant='primary'>Cambiar tarifa de envio</Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/users" className={styles.navItem}>
                            <Button variant='primary'>Gestionar Usuarios</Button>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default AdminDashboardPage;