import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../features/products/ProductForm';
import { createProduct } from '../services/productService';
import { toast } from 'react-toastify';

// --- CAMBIO 1: Importamos el archivo CSS que YA EXISTE ---
import styles from './styles/EditProductPage.module.css';

const CreateProductPage = () => {
    const navigate = useNavigate();

    const handleCreate = async (productData) => {
        try {
            await createProduct(productData);
            toast.success('Producto creado con éxito');
            navigate('/admin/products');
        } 
        catch (error) {
            if (error.response?.data?.msg === 'Ya existe un producto con este nombre.') {
                toast.error('Ya existe un producto con este nombre');
            } else {
                toast.error('Error al crear el producto');
            }
            console.error(error);
        }

    };

    return (
        // --- CAMBIO 2: Aplicamos las clases para el contenedor y el título ---
        <div className={styles.container}>
            <h2 className={styles.title}>Crear Nuevo Producto</h2>
            <ProductForm onSubmit={handleCreate} />
        </div>
    );
};

export default CreateProductPage;