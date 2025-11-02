import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  precio: { type: Number, required: true },
  imagen: String,
  stock: { type: Number, default: 0 },
  categoria: String
}, { timestamps: true });

const Producto = mongoose.model('Producto', productoSchema);
export default Producto;
