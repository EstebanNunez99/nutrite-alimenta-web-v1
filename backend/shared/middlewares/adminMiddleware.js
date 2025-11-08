export const adminMiddleware = (req, res, next) => {
    // Verificar que el usuario esté autenticado (req.usuario debería estar disponible por authMiddleware)
    if (req.usuario && req.usuario.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};
