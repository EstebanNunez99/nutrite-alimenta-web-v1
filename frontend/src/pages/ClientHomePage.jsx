import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAllProducts } from '../services/productService';
import styles from './styles/GuestHomePage.module.css';
import Button from '../components/ui/Button';
import ProductCard from '../features/products/ProductCard';
import Spinner from '../components/ui/Spinner';
import useDocumentTitle from '../hooks/useDocumentTitle'


// Importaciones de Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ClientHomePage = () => {
    useDocumentTitle('Inicio - Cliente')
    const { usuario, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Obtener más productos para tener carrusel y destacado
                const data = await getAllProducts(1, 'createdAt_desc', '', '');
                const allProducts = data.products || [];
                setProducts(allProducts);
            } catch (error) {
                console.error("Error al cargar productos:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Mostrar los primeros 7 productos en el carrusel
    const carouselProducts = products.length > 0 ? products.slice(0, Math.min(7, products.length)) : [];
    // El producto destacado es el 8vo o el último si hay menos de 8
    const spotlightProduct = products.length > 7 ? products[7] : (products.length > 0 ? products[products.length - 1] : null);

    return (
        <>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>¡Hola de nuevo, {usuario?.nombre}!</h1>
                    <p className={styles.subtitle}>La aventura de hoy te espera. ¿Qué vas a descubrir?</p>
                    <div className={styles.buttonContainer}>
                        <Link to="/productos">
                            <Button variant='primary'>Explorar Catálogo</Button>
                        </Link>
                        <Button onClick={logout} variant='secondary'>Cerrar Sesión</Button>
                    </div>
                </div>
            </section>

            {loading ? <Spinner /> : (
                <>
                    <section className={styles.carouselSection}>
                        <h2 className={styles.sectionTitle}>Novedades Para Vos</h2>
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={30}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                768: { slidesPerView: 3 },
                                1024: { slidesPerView: 4 },
                            }}
                        >
                            {carouselProducts.map(product => (
                                <SwiperSlide key={product._id}>
                                    <ProductCard product={product} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </section>
                    
                    {spotlightProduct && (
                        <section className={styles.spotlightSection}>
                            <div className={styles.spotlightGrid}>
                                <img src={spotlightProduct.imagen} alt={spotlightProduct.nombre} className={styles.spotlightImage} />
                                <div className={styles.spotlightContent}>
                                    <span className={styles.spotlightTag}>Destacado de la Semana</span>
                                    <h2 className={styles.spotlightTitle}>{spotlightProduct.nombre}</h2>
                                    <p className={styles.spotlightDescription}>{spotlightProduct.descripcion.substring(0, 150)}...</p>
                                    <Link to={`/producto/${spotlightProduct._id}`}>
                                        <Button variant="primary" size="large">Lo Quiero</Button>
                                    </Link>
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}
        </>
    );
};

export default ClientHomePage;