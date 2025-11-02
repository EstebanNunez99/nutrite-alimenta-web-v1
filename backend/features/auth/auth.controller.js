// backend/controllers/authController.js
import Usuario from '../models/Usuario.js'; // <-- CAMBIO AQUÍ (.js)
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Función para registrar un nuevo usuario
export const registrarUsuario = async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        // 1. Verificar si el usuario ya existe
        let usuario = await Usuario.findOne({ email });
        if (usuario) {
            return res.status(400).json({ msg: 'El correo electrónico ya está registrado.' });
        }

        // 2. Crear el nuevo usuario
        usuario = new Usuario({ nombre, email, password });

        // 3. Hashear la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(password, salt);

        // 4. Guardar el usuario en la base de datos
        await usuario.save();
        
        // 5. Crear y firmar el JWT (payload)
        const payload = {
            usuario: {
                id: usuario.id,
                rol: usuario.rol
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d' // El token expira en 7 días
        }, (error, token) => {
            if (error) throw error;
            res.json({ token });
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error en el servidor.');
    }
};

// Función para iniciar sesión
export const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Verificar si el usuario existe
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ msg: 'Credenciales inválidas.' });
        }

        // 2. Comparar la contraseña ingresada con la hasheada en la BD
        const esCorrecta = await bcrypt.compare(password, usuario.password);
        if (!esCorrecta) {
            return res.status(400).json({ msg: 'Credenciales inválidas.' });
        }

        // 3. Si todo es correcto, crear y firmar el JWT
        const payload = {
            usuario: {
                id: usuario.id,
                rol: usuario.rol
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d'
        }, (error, token) => {
            if (error) throw error;
            res.json({
                token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                }
});
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error en el servidor.');
    }
};
//funcion para obtener el perfil del usuario autenticado
export const obtenerPerfilUsuario = async (req, res) => {
    try {
        // El ID del usuario viene del middleware (req.usuario.id)
        // Buscamos al usuario pero excluimos la contraseña de la respuesta
        const usuario = await Usuario.findById(req.usuario.id).select('-password');
        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error en el servidor.');
    }
};

//  función para que un admin obtenga todos los usuarios
export const obtenerTodosLosUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-password'); // Trae todos los usuarios sin la contraseña
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error en el servidor.');
    }
};