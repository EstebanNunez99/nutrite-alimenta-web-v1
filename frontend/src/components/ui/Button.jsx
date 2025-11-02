import React from 'react';
import { NavLink } from 'react-router-dom'; // <-- 1. IMPORTA NavLink en lugar de Link
import styles from './Button.module.css';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    type = 'button',
    disabled = false,
    isActive = false, // Para botones no-link como la paginación
    to, // La prop que lo convierte en un enlace de navegación
    ...props
}) => {
    
    // Función auxiliar para construir las clases dinámicamente
    const getButtonClasses = (isLinkActive = false) => {
        let classes = `${styles.btn} ${styles[variant]}`;
        
        // Aplica la clase activa para la variante 'link' (navegación)
        if (isLinkActive && variant === 'link') {
            classes += ` ${styles.linkActive}`;
        }
        
        // Aplica la clase activa para otras variantes (paginación)
        if (isActive && variant !== 'link') {
            classes += ` ${styles.active}`;
        }

        return classes;
    };

    // Si el botón tiene una prop 'to', se renderiza como un NavLink
    if (to) {
        return (
            <NavLink
                to={to}
                // La prop 'end' es crucial. Le dice a NavLink que la ruta "/" solo
                // debe estar activa si la URL es EXACTAMENTE "/", y no en sub-rutas.
                end={to === '/'} 
                className={({ isActive: isLinkActive }) => getButtonClasses(isLinkActive)}
                onClick={onClick}
                {...props}
            >
                {children}
            </NavLink>
        );
    }

    // Si no, se renderiza como un botón normal
    return (
        <button
            className={getButtonClasses()}
            onClick={onClick}
            type={type}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;