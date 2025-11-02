import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, deleteUser, updateUserRole } from '../services/userService';
import Paginate from '../components/ui/Paginate';
import Input from '../components/ui/Input'; // Reutilizamos nuestro Input
import Button from '../components/ui/Button'; // Y nuestro Botón
import { toast } from 'react-toastify';
import styles from './styles/AdminShared.module.css';
import Spinner from '../components/ui/Spinner';
import useDocumentTitle from '../hooks/useDocumentTitle';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useDocumentTitle('Admin - Gestión de Usuarios')
    
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllUsers(page, searchTerm);
            setUsers(data.users);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('No se pudieron cargar los usuarios.', err.status);
            toast.error('No se pudieron cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]); // Se ejecuta si la página o el término de búsqueda cambian

    useEffect(() => {
        // Usamos un timeout para no hacer una petición en cada letra que se tipea (debounce)
        const debounceFetch = setTimeout(() => {
            fetchUsers();
        }, 500); // Espera 500ms después de la última letra antes de buscar

        return () => clearTimeout(debounceFetch); // Limpia el timeout si el componente se desmonta
    }, [fetchUsers]);

    const handleDelete = async (userId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
            try {
                await deleteUser(userId);
                toast.success('Usuario eliminado con éxito');
                fetchUsers(); // Recargamos la lista
            } catch (err) {
                toast.error('Error al eliminar el usuario.', err.status);
            }
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, { rol: newRole });
            toast.success('Rol de usuario actualizado.');
            // Actualizamos el estado localmente para una respuesta instantánea en la UI
            setUsers(users.map(user => user._id === userId ? { ...user, rol: newRole } : user));
        } catch (err) {
            toast.error('No se pudo actualizar el rol.', err.status);
        }
    };

    const handlePageChange = (newPage) => setPage(newPage);

    if (loading && !users.length) return <Spinner/>;
    if (error) return <div><p>{error}</p></div>;

    return (
        <div className={styles.container}>
            <p className={styles.aviso}>Pronto mas acciones disponibles</p>
            
            <h2>Gestión de Usuarios</h2>
            
            <div className={styles.controlsContainer}>
                <Input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead className={styles.tableHead}>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Fecha de Registro</th>
                        <th>Acciones</th>
                    </tr>
                 </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className={styles.tableRow}>
                            <td className={styles.tableCell}>{user.nombre}</td>
                            <td className={styles.tableCell}>{user.email}</td>
                            <td className={styles.tableCell}>
                                <select 
                                    value={user.rol} 
                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                    className={styles.roleSelect}
                                >
                                    <option value="cliente">Cliente</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td className={styles.tableCell}>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className={`${styles.tableCell} ${styles.actionsCell}`}>
                                <Button variant='danger' onClick={() => handleDelete(user._id)}>
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.paginationContainer}>
                <Paginate pages={totalPages} page={page} onPageChange={handlePageChange} />
            </div>
        </div>
    );
};

export default AdminUsersPage;