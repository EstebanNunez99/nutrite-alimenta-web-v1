import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, deleteProduct } from '../services/productService';
import Paginate from '../components/ui/Paginate';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import styles from './styles/AdminShared.module.css'
import Spinner from '../components/ui/Spinner';
import useDocumentTitle from '../hooks/useDocumentTitle';

const AdminProductsPage = () => {
    useDocumentTitle('Admin - Gestión de Productoos')
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllProducts(page);
            setProducts(data.products); // <-- 3. CORRECCIÓN CLAVE: usamos data.products
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('No se pudieron cargar los productos.');
            console.log(err.status)
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await deleteProduct(id);
                toast.success('Producto eliminado con éxito');
                fetchProducts(); // 4. Recargamos la lista de productos después de eliminar
            } catch (err) {
                toast.error('Error al eliminar el producto.');
                console.log(err.status)

            }
        }
    };
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };
    if (loading) return <Spinner/>;
    if (error) return <div><p>{error}</p></div>;

    return (
        <div className={styles.container}>
            <p className={styles.aviso}>Pronto mas acciones disponibles</p>
            <h2>Gestión de Productos</h2>

            <div className={styles.controlsContainer}>
                <Link to="/admin/products/create">
                    <Button variant='primary'>Crear Nuevo Producto</Button>
                </Link>
            </div>

            {/* --- 2. APLICAMOS LA ESTRUCTURA RESPONSIVA Y LAS CLASES UNIFICADAS --- */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead className={styles.tableHead}>
                        <tr>
                            <th>ID producto</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product._id} className={styles.tableRow}>
                                <td className={styles.tableCell}>{product._id}</td>
                                <td className={styles.tableCell}>{product.nombre}</td>
                                <td className={styles.tableCell}>${product.precio}</td>
                                <td className={styles.tableCell}>{product.stock}</td>
                                <td className={styles.tableCell}>{product.categoria}</td>
                                <td className={`${styles.tableCell} ${styles.actionsCell}`}>
                                    <Link to={`/admin/products/edit/${product._id}`}>
                                        <Button variant='secondary'>Editar</Button>
                                    </Link>
                                    <Button onClick={() => handleDelete(product._id)} variant='danger'>
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

export default AdminProductsPage;