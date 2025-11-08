import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { getShippingConfig, updateShippingConfig } from '../services/shippingService';
import useDocumentTitle from '../hooks/useDocumentTitle';
import styles from './styles/AdminShippingConfigPage.module.css';

const AdminShippingConfigPage = () => {
    useDocumentTitle('Admin - Configuración de Envío');
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        referenceAddress: {
            address: '',
            city: '',
            postalCode: '',
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

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const data = await getShippingConfig();
            // Normalizar los datos para asegurar que todos los valores sean correctos
            setConfig({
                referenceAddress: {
                    address: data.referenceAddress?.address || '',
                    city: data.referenceAddress?.city || '',
                    postalCode: data.referenceAddress?.postalCode || '',
                    country: data.referenceAddress?.country || 'Argentina'
                },
                shippingRates: {
                    costPerKm: data.shippingRates?.costPerKm || 100,
                    minimumCost: data.shippingRates?.minimumCost || 500,
                    maximumCost: data.shippingRates?.maximumCost || 5000,
                    freeShippingDistance: data.shippingRates?.freeShippingDistance || 0,
                    freeShippingAmount: data.shippingRates?.freeShippingAmount || 0
                },
                settings: {
                    maxDeliveryRadius: data.settings?.maxDeliveryRadius || 50,
                    estimatedDeliveryDays: data.settings?.estimatedDeliveryDays || 3,
                    isEnabled: data.settings?.isEnabled !== undefined ? data.settings.isEnabled : true
                }
            });
        } catch (error) {
            console.error('Error al cargar configuración:', error);
            toast.error('Error al cargar la configuración de envío');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            referenceAddress: {
                ...prev.referenceAddress,
                [field]: value
            }
        }));
    };

    const handleShippingRatesChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            shippingRates: {
                ...prev.shippingRates,
                [field]: value
            }
        }));
    };

    const handleSettingsChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateShippingConfig(config);
            toast.success('Configuración de envío actualizada exitosamente');
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            toast.error(error.response?.data?.msg || 'Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className={styles.container}>
            <h2>Configuración de Envío</h2>
            
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.section}>
                    <h3>Dirección de Referencia</h3>
                    <p className={styles.description}>
                        Dirección desde donde se realizan los envíos
                    </p>
                    
                    <Input
                        label="Dirección"
                        type="text"
                        name="address"
                        value={config.referenceAddress?.address || ''}
                        onChange={(e) => handleAddressChange('address', e.target.value)}
                        required
                        placeholder="Calle y número"
                    />
                    
                    <Input
                        label="Ciudad"
                        type="text"
                        name="city"
                        value={config.referenceAddress?.city || ''}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        required
                        placeholder="Ciudad"
                    />
                    
                    <Input
                        label="Código Postal"
                        type="text"
                        name="postalCode"
                        value={config.referenceAddress?.postalCode || ''}
                        onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                        required
                        placeholder="CP"
                    />
                    
                    <Input
                        label="País"
                        type="text"
                        name="country"
                        value={config.referenceAddress?.country || 'Argentina'}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        required
                        placeholder="País"
                    />
                </div>

                <div className={styles.section}>
                    <h3>Tarifas de Envío</h3>
                    <p className={styles.description}>
                        Configura los precios y condiciones de envío
                    </p>
                    
                    <Input
                        label="Costo por Kilómetro (ARS)"
                        type="number"
                        name="costPerKm"
                        min="0"
                        step="0.01"
                        value={config.shippingRates?.costPerKm || 100}
                        onChange={(e) => handleShippingRatesChange('costPerKm', parseFloat(e.target.value) || 0)}
                        required
                    />
                    
                    <Input
                        label="Costo Mínimo de Envío (ARS)"
                        type="number"
                        name="minimumCost"
                        min="0"
                        step="0.01"
                        value={config.shippingRates?.minimumCost || 500}
                        onChange={(e) => handleShippingRatesChange('minimumCost', parseFloat(e.target.value) || 0)}
                        required
                    />
                    
                    <Input
                        label="Costo Máximo de Envío (ARS)"
                        type="number"
                        name="maximumCost"
                        min="0"
                        step="0.01"
                        value={config.shippingRates?.maximumCost || 5000}
                        onChange={(e) => handleShippingRatesChange('maximumCost', parseFloat(e.target.value) || 0)}
                        required
                    />
                    
                    <Input
                        label="Distancia para Envío Gratuito (km) - 0 para desactivar"
                        type="number"
                        name="freeShippingDistance"
                        min="0"
                        step="0.1"
                        value={config.shippingRates?.freeShippingDistance || 0}
                        onChange={(e) => handleShippingRatesChange('freeShippingDistance', parseFloat(e.target.value) || 0)}
                    />
                    
                    <Input
                        label="Monto Mínimo para Envío Gratuito (ARS) - 0 para desactivar"
                        type="number"
                        name="freeShippingAmount"
                        min="0"
                        step="0.01"
                        value={config.shippingRates?.freeShippingAmount || 0}
                        onChange={(e) => handleShippingRatesChange('freeShippingAmount', parseFloat(e.target.value) || 0)}
                    />
                </div>

                <div className={styles.section}>
                    <h3>Configuración General</h3>
                    
                    <Input
                        label="Radio Máximo de Entrega (km)"
                        type="number"
                        name="maxDeliveryRadius"
                        min="0"
                        step="0.1"
                        value={config.settings?.maxDeliveryRadius || 50}
                        onChange={(e) => handleSettingsChange('maxDeliveryRadius', parseFloat(e.target.value) || 0)}
                        required
                    />
                    
                    <Input
                        label="Días Estimados de Entrega"
                        type="number"
                        name="estimatedDeliveryDays"
                        min="1"
                        value={config.settings?.estimatedDeliveryDays || 3}
                        onChange={(e) => handleSettingsChange('estimatedDeliveryDays', parseInt(e.target.value) || 1)}
                        required
                    />
                    
                    <div className={styles.checkboxGroup}>
                        <label>
                            <input
                                type="checkbox"
                                checked={config.settings?.isEnabled !== undefined ? config.settings.isEnabled : true}
                                onChange={(e) => handleSettingsChange('isEnabled', e.target.checked)}
                            />
                            <span>Habilitar envíos</span>
                        </label>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminShippingConfigPage;

