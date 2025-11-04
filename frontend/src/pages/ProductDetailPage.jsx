import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../hooks/useCart';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import styles from './styles/ProductDetailPage.module.css'; 

const ProductDetailPage = () => {
    const { id } = useParams();
    const { addItem } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [stockEngaged, setStockEngaged] = useState(1)

    // Título dinámico del documento
    useDocumentTitle(product ? product.nombre : 'Cargando producto...');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const data = await getProductById(id);
                setProduct(data);
            } catch (err) {
                setError('No se pudo encontrar el producto.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        addItem(product._id, quantity);
    };

    const handleStockEngaged = ()=>{
        
    }

    if (loading) return <Spinner />;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!product) return <div className={styles.error}>Producto no encontrado.</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.productGrid}>
                <div className={styles.imageContainer}>
                    <img src={product.imagen} alt={product.nombre} className={styles.productImage} />
                </div>
                <div className={styles.detailsContainer}>
                    <h1 className={styles.productTitle}>{product.nombre}</h1>
                    <p className={styles.productPrice}>${product.precio.toFixed(2)}</p>
                    <p className={styles.productDescription}>{product.descripcion}</p>

                    <div className={styles.stockInfo}>
                        Disponible: <span>{product.stock}</span>
                        
                    </div>

                    {product.stock > 0 && (
                        <div className={styles.actions}>
                            <div className={styles.quantityControl}>
                                <label htmlFor="quantity">Cantidad:</label>
                                <select 
                                    id="quantity" 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className={styles.quantitySelect}
                                >
                                    {[...Array(product.stock).keys()].slice(0, 10).map(x => (
                                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <Button variant="primary" onClick={handleAddToCart}>
                                Añadir al Carrito
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;