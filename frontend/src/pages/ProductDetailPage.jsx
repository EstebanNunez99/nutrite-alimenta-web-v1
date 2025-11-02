// import React, { useState, useEffect } from 'react';
// import { getAllProducts } from '../services/productService';
// import ProductCard from '../features/products/ProductCard';

// const containerStyles = {
//     display: 'flex',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
// };

// const ProductsPage = () => {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 const data = await getAllProducts();
//                 setProducts(data);
//             } catch (err) {
//                 setError('No se pudieron cargar los productos.', err.status);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchProducts();
//     }, []);

//     if (loading) return <div>Cargando productos...</div>;
//     if (error) return <div>{error}</div>;

//     return (
//         <div>
//             <h2>Nuestro Catálogo</h2>
//             <div style={containerStyles}>
//                 {products.length > 0 ? (
//                     products.map(product => (
//                         <ProductCard key={product._id} product={product} />
//                     ))
//                 ) : (
//                     <p>No hay productos disponibles en este momento.</p>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ProductsPage;
// Ubicación: web/src/pages/ProductDetailPage.jsx (VERSIÓN DE DIAGNÓSTICO)

//----------------Este codigo de arriba no anda por que maneja mal el fetch--------------

//---------------Este codigo que sigue se hizo para aislar los componentes y probar uno por uno----------
// import React from 'react';
// import { useParams, Link } from 'react-router-dom';

// const ProductDetailPage = () => {
//     // useParams debería darnos el ID de la URL
//     const { id } = useParams();

//     // No hacemos llamadas a la API. Solo mostramos el ID para confirmar que la ruta funciona.
//     return (
//         <div style={{ padding: '20px', backgroundColor: 'lightgreen' }}>
//             <h1>Página de Detalle de Producto (Modo de Prueba)</h1>
//             <p style={{ fontSize: '24px', color: 'red', fontWeight: 'bold' }}>
//                 El ID del producto es: {id}
//             </p>
//             <p>Si ves esto, la ruta está funcionando correctamente. El problema estaba en la llamada a la API o en el manejo de datos.</p>
//             <Link to="/productos">
//                 <button>Volver al Catálogo</button>
//             </Link>
//         </div>
//     );
// };

// export default ProductDetailPage;

//------------ESte es el codigo final-------------
// RUTA: src/pages/ProductDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../hooks/useCart';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import styles from './styles/ProductDetailPage.module.css'; // <-- Necesitaremos un nuevo archivo de estilos

const ProductDetailPage = () => {
    const { id } = useParams();
    const { addItem } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);

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
                        Estado: <span>{product.stock > 0 ? 'En Stock' : 'Agotado'}</span>
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