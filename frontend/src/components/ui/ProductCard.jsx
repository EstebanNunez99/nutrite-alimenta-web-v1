// src/components/ui/ProductCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import Button from './Button';

const ProductCard = ({ product }) => {
    return (
        <div className={styles.card}>
            <Link to={`/producto/${product._id}`} className={styles.imageContainer}>
                <img 
                    src={product.imagen || '/placeholder-image.png'} 
                    alt={product.nombre} 
                    className={styles.cardImage}
                />
            </Link>
            <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>
                    <Link to={`/producto/${product._id}`}>{product.nombre}</Link>
                </h3>
                <p className={styles.cardPrice}>${product.precio.toFixed(2)}</p>
                <Link to={`/producto/${product._id}`}>
                    <Button variant="secondary" >Ver Detalles</Button>
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;