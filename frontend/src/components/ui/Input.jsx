// src/components/ui/Input.jsx

import React from 'react';
import styles from './Input.module.css';

const Input = ({ label, name, icon, className, ...rest }) => {
    
    // Si nos pasan un ícono, añadimos una clase extra al input para el padding.
    const inputClasses = `${styles.input} ${icon ? styles.withIcon : ''}`;

    return (
        // El div contenedor ahora acepta una clase externa para el layout
        <div className={`${styles.inputWrapper} ${className || ''}`}>
            
            {/* Lógica condicional: Si hay un ícono, mostralo. Si no, mostrá el label. */}
            {icon && <div className={styles.icon}>{icon}</div>}
            
            {label && !icon && (
                <label htmlFor={name} className={styles.label}>
                    {label}
                </label>
            )}

            <input
                id={name}
                name={name}
                className={inputClasses}
                {...rest}
            />
        </div>
    );
};

export default Input;