import React, { useState, useEffect, useCallback } from 'react';
import { getAllProducts, getAllCategories } from '../services/productService'; // Asumimos una nueva función
import ProductCard from '../features/products/ProductCard';
import Paginate from '../components/ui/Paginate'; 
import Spinner from '../components/ui/Spinner';
import styles from './styles/ProductsPage.module.css';
import useDocumentTitle from '../hooks/useDocumentTitle'

const ProductsPage = () => {
    useDocumentTitle('Catálogo')
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- NUEVOS ESTADOS PARA ORDENAR Y FILTRAR ---
    const [sort, setSort] = useState('createdAt_desc'); // Por defecto: más nuevos primero
    const [categories, setCategories] = useState([]);
    const [filterCategory, setFilterCategory] = useState(''); // Por defecto: todas

    // --- USEEFFECT PARA CARGAR CATEGORÍAS (SOLO UNA VEZ) ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getAllCategories();
                // Asegurarnos de que siempre sea un array
                setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : []);
            } catch (err) {
                console.error("No se pudieron cargar las categorías:", err);
                // Si hay error, mantener categories como array vacío
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // --- USEEFFECT MEJORADO PARA CARGAR PRODUCTOS ---
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllProducts(page, sort, filterCategory);
            setProducts(data.products);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('No se pudieron cargar los productos.', err.status);
        } finally {
            setLoading(false);
        }
    }, [page, sort, filterCategory]); // Se vuelve a ejecutar si cambia la pág, el orden o la categoría

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);
    
    const handlePageChange = (newPage) => setPage(newPage);
    const handleSortChange = (e) => setPage(1) & setSort(e.target.value); // Resetea a pág 1 al cambiar orden
    const handleCategoryChange = (e) => setPage(1) & setFilterCategory(e.target.value); // Resetea a pág 1 al filtrar

    if (loading && products.length === 0) return <Spinner />;
    if (error) return <div className={styles.message}>{error}</div>;

    return (
        
        <div className={styles.pageContainer}>
            <p className={styles.aviso}>Aclaración: Todos los datos, imagenes e informacion que se encuentra en este sitio web. Son puramente de un entorno de desarrollo y pruebas Excepto los links de redes y canales de contacto </p>

            <header className={styles.pageHeader}>
                <h1>Nuestro Catálogo</h1>
            </header>

            {/* --- BARRA DE CONTROLES --- */}
            <div className={styles.controlsBar}>
                <div className={styles.controlGroup}>
                    <label htmlFor="category-filter">Filtrar por:</label>
                    <select id="category-filter" className={styles.selectControl} onChange={handleCategoryChange} value={filterCategory}>
                        <option value="">Todas las categorías</option>
                        {Array.isArray(categories) && categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.controlGroup}>
                    <label htmlFor="sort-order">Ordenar por:</label>
                    <select id="sort-order" className={styles.selectControl} onChange={handleSortChange} value={sort}>
                        <option value="createdAt_desc">Más Nuevos</option>
                        <option value="precio_asc">Precio: Menor a Mayor</option>
                        <option value="precio_desc">Precio: Mayor a Menor</option>
                        <option value="nombre_asc">Nombre: A-Z</option>
                        <option value="nombre_desc">Nombre: Z-A</option>
                    </select>
                </div>
            </div>
            
            {/* --- GRILLA DE PRODUCTOS --- */}
            {loading ? <Spinner /> : (
                products.length > 0 ? (
                    <div className={styles.productsGrid}>
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className={styles.message}>No se encontraron productos con esos criterios.</p>
                )
            )}
            
            {/* --- PAGINACIÓN --- */}
            {totalPages > 1 && (
                 <div className={styles.paginationContainer}>
                    <Paginate pages={totalPages} page={page} onPageChange={handlePageChange} />
                </div>
            )}
        </div>
    );
};

export default ProductsPage;