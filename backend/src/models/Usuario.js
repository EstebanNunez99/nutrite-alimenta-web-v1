// backend/models/Usuario.js
import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    email: {
        type: String,
        required: true,
        unique: true, // Asegura que no haya dos usuarios con el mismo email
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['cliente', 'admin'], // Solo permite estos dos valores
        default: 'cliente'
    }
}, {
    timestamps: true // Crea automáticamente los campos createdAt y updatedAt
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;