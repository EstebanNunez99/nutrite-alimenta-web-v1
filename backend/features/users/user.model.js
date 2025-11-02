import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['cliente', 'admin'], default: 'cliente' },
    telefono: { type: String, trim: true, default: '' },
    fotoURL: { type: String, trim: true, default: '' }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;