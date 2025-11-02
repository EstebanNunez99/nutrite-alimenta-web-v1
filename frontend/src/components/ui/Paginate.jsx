import React from 'react';
import Button from './Button'; // <-- 1. IMPORTA NUESTRO BOTÓN
import styles from './Paginate.module.css'; // <-- Importa sus propios estilos

const Paginate = ({ pages, page, onPageChange }) => {
    if (pages <= 1) {
        return null;
    }

    return (
        <nav className={styles.nav}>
            {[...Array(pages).keys()].map(x => (
                <Button
                    key={x + 1}
                    onClick={() => onPageChange(x + 1)}
                    variant="secondary" // Usamos la variante secundaria para los botones normales
                    isActive={page === x + 1} // <-- 2. ¡LA MAGIA OCURRE AQUÍ!
                >
                    {x + 1}
                </Button>
            ))}
        </nav>
    );
};

export default Paginate;