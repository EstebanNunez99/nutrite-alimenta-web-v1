import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './styles/AdminHomePage.module.css'
import Button from '../components/ui/Button';
import useDocumentTitle from '../hooks/useDocumentTitle';
const AdminHomePage = () => {
    // Este componente ahora obtiene los datos que necesita por sí mismo.
    const { usuario, logout} = useAuth();
    useDocumentTitle('Admin - Inicio')

    return (
        <div className={styles.dashboard}>
            <p className={styles.aviso}>Aclaración: Todos los datos, imagenes e informacion que se encuentra en este sitio web son puramente de un entorno de desarrollo y pruebas. Excepto los links de redes y canales de contacto</p>
            
            <div className={styles.welcome}>
                <h2>Bienvenido administrador: {usuario.nombre}.</h2>
                <p>¿Qué accion desea realizar?</p>
            </div>
            <ul className={styles.navList}>
                <li className={styles.navItem}>
                    <Link to="/admin"><Button variant='primary'>Panel de administracion</Button></Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/perfil"><Button variant='primary'>Mi perfil</Button></Link>
                </li>
                {/* Aquí podríamos añadir más enlaces a futuro */}
            </ul>

            <Button onClick={logout} variant='danger'>Cerrar Sesión</Button>
        </div>
    );
};

export default AdminHomePage;