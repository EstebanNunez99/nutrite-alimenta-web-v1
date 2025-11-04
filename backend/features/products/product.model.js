import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio.'],
        trim: true,
        unique: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria.'],
        trim: true
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio.'],
        min: [0, 'El precio no puede ser negativo.']
    },
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio.'],
        min: [0, 'El stock no puede ser negativo.'],
        default: 0
    },
    
    stockComprometido: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'El stock comprometido no puede ser negativo.'],
        // Evitamos que comprometido supere al stock total
        validate: {
        validator: function (v) {
            // En updates directos (updateOne) esta validación puede no correr a menos que uses { runValidators: true }.
            return v <= this.stock;
        },
        message: 'El stock comprometido ({VALUE}) no puede superar el stock total.'
        }
    },

    categoria: {
        type: String,
        trim: true,
        default: 'General'
    },
    imagen: {
        type: String,
        trim: true
    },
    // Relacionamos el producto con el usuario (admin) que lo creó.
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Hace referencia a nuestro modelo 'User'
        required: true
    }
}, {
    timestamps: true // Crea automáticamente createdAt y updatedAt
});


productSchema.virtual('stockDisponible').get(function () {
  const total = this.stock ?? 0;
  const comprometido = this.stockComprometido ?? 0;
  const disponible = total - comprometido;
  return disponible < 0 ? 0 : disponible;
});


const Product = mongoose.model('Product', productSchema);
export default Product;