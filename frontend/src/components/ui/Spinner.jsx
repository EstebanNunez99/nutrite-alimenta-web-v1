import React from 'react';

// Estilos en formato de objeto JavaScript (CSS-in-JS)
const spinnerContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '50px',
};

// Keyframes de la animación (no se pueden hacer directamente en inline-styles)
// Por eso añadimos un tag <style> al componente. Es una forma sencilla de hacerlo
// sin añadir librerías de CSS-in-JS más complejas.
const keyframes = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const spinnerStyles = {
    border: '8px solid #f3f3f3', // El círculo gris claro
    borderTop: '8px solid #3498db', // El trozo azul que gira
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite', // Nombre, duración, tipo y repetición
};


const Spinner = () => {
    return (
        <div style={spinnerContainerStyles}>
            <style>{keyframes}</style>
            <div style={spinnerStyles}></div>
        </div>
    );
};

export default Spinner;