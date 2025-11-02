import User from './user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


// Registrar un nuevo usuario
export const register = async (req, res) => {
    const { nombre, email, password } = req.body;
    
    // Validaciones
    if (!nombre || !email || !password) {
        return res.status(400).json({ msg: 'Por favor, complete todos los campos.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe con este email.' });
        }
        
        user = new User({ nombre, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        
        const payload = { usuario: { id: user.id, rol: user.rol } };
        
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET no está configurado en las variables de entorno');
            return res.status(500).json({ msg: 'Error de configuración del servidor.' });
        }
        
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) {
                console.error('Error al generar token:', err);
                return res.status(500).json({ msg: 'Error al generar el token de autenticación.' });
            }
            res.status(201).json({ token });
        });
    } catch (error) {
        console.error('Error en registro:', error.message);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// Iniciar sesión
export const login = async (req, res) => {
    const { email, password } = req.body;
    
    // Validaciones
    if (!email || !password) {
        return res.status(400).json({ msg: 'Por favor, ingrese email y contraseña.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas.' });
        }
        
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET no está configurado en las variables de entorno');
            return res.status(500).json({ msg: 'Error de configuración del servidor.' });
        }
        
        const payload = { usuario: { id: user.id, rol: user.rol } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) {
                console.error('Error al generar token:', err);
                return res.status(500).json({ msg: 'Error al generar el token de autenticación.' });
            }
            res.json({ token });
        });
    } catch (error) {
        console.error('Error en login:', error.message);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// Obtener el perfil del usuario autenticado
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.usuario.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error en el servidor');
    }
};

// @desc    Obtener todos los usuarios (solo para admins, con paginación)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const pageSize = 5; // Mostraremos 10 usuarios por página
        const page = Number(req.query.pageNumber) || 1;

        const count = await User.countDocuments({});
        const users = await User.find({})
            .select('-password') // Nunca devolver la contraseña
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            users,
            page,
            totalPages: Math.ceil(count / pageSize)
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error en el servidor');
    }
};

// @desc    Actualizar el perfil de un usuario (nombre, email, telefono, fotoURL)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        // Obtenemos el usuario desde la base de datos usando el ID del token
        const user = await User.findById(req.usuario.id);

        if (user) {
            user.nombre = req.body.nombre || user.nombre;
            user.email = req.body.email || user.email;
            if (req.body.telefono !== undefined) {
                user.telefono = req.body.telefono;
            }
            if (req.body.fotoURL !== undefined) {
                user.fotoURL = req.body.fotoURL;
            }

            const updatedUser = await user.save();

            // Devolvemos los datos actualizados (sin la contraseña)
            res.json({
                _id: updatedUser._id,
                nombre: updatedUser.nombre,
                email: updatedUser.email,
                rol: updatedUser.rol,
                telefono: updatedUser.telefono || '',
                fotoURL: updatedUser.fotoURL || '',
            });
        } else {
            res.status(404).json({ msg: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// @desc    Actualizar la contraseña de un usuario
// @route   PUT /api/users/profile/password
// @access  Private
export const updateUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ msg: 'Por favor, provea la contraseña actual y la nueva.' });
        }

        const user = await User.findById(req.usuario.id);

        if (user) {
            // Comparamos la contraseña actual que nos envía con la de la BD
            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                return res.status(401).json({ msg: 'La contraseña actual es incorrecta.' });
            }

            // Si coincide, hasheamos y guardamos la nueva contraseña
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

            await user.save();

            res.json({ msg: 'Contraseña actualizada con éxito.' });
        } else {
            res.status(404).json({ msg: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};