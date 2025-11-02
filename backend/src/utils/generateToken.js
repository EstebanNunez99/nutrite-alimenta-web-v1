import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET, // ¡Usar variable de entorno!
        { expiresIn: '30d' } // El token expira en 30 días (ejemplo)
    );
};

export default generateToken;