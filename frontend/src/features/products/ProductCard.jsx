// src/features/products/ProductCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import Button from '../../components/ui/Button'; // Asegúrate de que la ruta sea correcta

const ProductCard = ({ product }) => {
    // URL de imagen por defecto si el producto no tiene una
    // Usamos una imagen más genérica y profesional como fallback
    const imageUrl = product.imagen || 'https://via.placeholder.com/400x400/f0f0f0/cccccc?text=Producto+Sin+Imagen';

    // Formateador para mostrar el precio con formato de moneda local
    const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2, // Asegura dos decimales
        maximumFractionDigits: 2,
    }).format(product.precio);

    return (
        <div className={styles.card}>
            {/* 1. La imagen ahora es un link y tiene su propio contenedor para efectos */}
            <Link to={`/producto/${product._id}`} className={styles.imageContainer}>
                <img src={imageUrl} alt={product.nombre} className={styles.cardImage} />
            </Link>

            <div className={styles.cardBody}>
                {/* 2. El título también es un link */}
                <h3 className={styles.cardTitle}>
                    <Link to={`/producto/${product._id}`}>{product.nombre}</Link>
                </h3>
                
                {/* 3. Estilo de precio */}
                <p className={styles.cardPrice}>{formattedPrice}</p>
                
                {/* 4. El botón ahora tiene la clase correcta para el estilo */}
                <Link to={`/producto/${product._id}`}>
                    <Button variant='primary' >Ver Detalles</Button>
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;