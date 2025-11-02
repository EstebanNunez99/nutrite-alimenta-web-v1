import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../features/products/ProductForm';
import { getProductById, updateProduct } from '../services/productService';
import { toast } from 'react-toastify';
import styles from './styles/EditProductPage.module.css'; // <-- 1. IMPORTA LOS ESTILOS
import Spinner from '../components/ui/Spinner';

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductById(id);
                setProduct(data);
            } catch (err) {
                setError('No se pudo cargar el producto para editar.', err.status);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleUpdate = async (productData) => {
        try {
            await updateProduct(id, productData);
            toast.success('Producto actualizado con éxito');
            navigate('/admin/products');
        } catch (error) {
            toast.error('Error al actualizar el producto');
            console.error(error);
        }
    };

    if (loading) return <Spinner/>;
    if (error) return <div>{error}</div>;

    return (
        // 2. APLICA LA CLASE DEL CONTENEDOR Y EL TÍTULO
        <div className={styles.container}>
            <h2 className={styles.title}>Editar Producto</h2>
            <ProductForm onSubmit={handleUpdate} initialData={product} />
        </div>
    );
};

export default EditProductPage;