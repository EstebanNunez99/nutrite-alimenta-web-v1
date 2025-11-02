// backend/config/db.js
import mongoose from "mongoose";

const conectarDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI no está definida en las variables de entorno');
            throw new Error('MONGO_URI no configurada');
        }

        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB conectado correctamente');
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        process.exit(1); // Detener la app si no se puede conectar
    }
};

export default conectarDB;