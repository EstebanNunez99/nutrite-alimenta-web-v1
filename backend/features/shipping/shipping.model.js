import mongoose from 'mongoose';

const shippingConfigSchema = new mongoose.Schema({
    // Dirección de referencia (desde donde se envía)
    referenceAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true, default: 'Argentina' },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    // Tarifas de envío
    shippingRates: {
        // Costo por kilómetro
        costPerKm: { type: Number, required: true, default: 100 },
        // Costo mínimo de envío
        minimumCost: { type: Number, required: true, default: 500 },
        // Costo máximo de envío
        maximumCost: { type: Number, required: true, default: 5000 },
        // Distancia máxima para envío gratuito (en km)
        freeShippingDistance: { type: Number, default: 0 },
        // Monto mínimo para envío gratuito
        freeShippingAmount: { type: Number, default: 0 }
    },
    // Configuración adicional
    settings: {
        // Radio máximo de envío (en km)
        maxDeliveryRadius: { type: Number, default: 50 },
        // Tiempo estimado de entrega (en días)
        estimatedDeliveryDays: { type: Number, default: 3 },
        // Habilitar/deshabilitar envío
        isEnabled: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

// Solo permitir un documento de configuración
shippingConfigSchema.statics.getConfig = async function() {
    let config = await this.findOne();
    if (!config) {
        // Crear configuración por defecto
        config = await this.create({
            referenceAddress: {
                address: 'Calle Falsa 123',
                city: 'Buenos Aires',
                postalCode: '1000',
                country: 'Argentina'
            },
            shippingRates: {
                costPerKm: 100,
                minimumCost: 500,
                maximumCost: 5000,
                freeShippingDistance: 0,
                freeShippingAmount: 0
            },
            settings: {
                maxDeliveryRadius: 50,
                estimatedDeliveryDays: 3,
                isEnabled: true
            }
        });
    }
    return config;
};

const ShippingConfig = mongoose.model('ShippingConfig', shippingConfigSchema);
export default ShippingConfig;

