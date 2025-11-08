import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllUsers } from '../services/userService';
import { getAllProducts } from '../services/productService';
import { createManualOrder } from '../services/orderService';
import { calculateShippingCost } from '../services/shippingService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import styles from './styles/AdminCreateManualOrderPage.module.css';

const AdminCreateManualOrderPage = () => {
    useDocumentTitle('Admin - Crear Venta Manual');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [searchProduct, setSearchProduct] = useState('');

    const [orderData, setOrderData] = useState({
        usuarioId: '',
        items: [],
        shippingAddress: {
            address: '',
            city: '',
            postalCode: '',
            country: 'Argentina'
        },
        paymentMethod: 'Efectivo',
        shippingCost: 0,
        status: 'completada',
        deliveryStatus: 'no_enviado'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, productsData] = await Promise.all([
                getAllUsers(1, ''),
                getAllProducts(1, '', '', '')
            ]);
            setUsers(usersData.users || []);
            setProducts(productsData.products || []);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar usuarios y productos');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = (product) => {
        const existingItem = orderData.items.find(item => item.producto === product._id);
        if (existingItem) {
            setOrderData(prev => ({
                ...prev,
                items: prev.items.map(item =>
                    item.producto === product._id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                )
            }));
        } else {
            setOrderData(prev => ({
                ...prev,
                items: [
                    ...prev.items,
                    {
                        producto: product._id,
                        nombre: product.nombre,
                        cantidad: 1,
                        precio: product.precio,
                        imagen: product.imagen
                    }
                ]
            }));
        }
        setSearchProduct('');
    };

    const handleRemoveItem = (productId) => {
        setOrderData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.producto !== productId)
        }));
    };

    const handleUpdateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            handleRemoveItem(productId);
            return;
        }
        setOrderData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.producto === productId
                    ? { ...item, cantidad: quantity }
                    : item
            )
        }));
    };

    const handleAddressChange = async (field, value) => {
        const newAddress = { ...orderData.shippingAddress, [field]: value };
        setOrderData(prev => ({ ...prev, shippingAddress: newAddress }));

        // Calcular envío cuando se complete la dirección
        if (newAddress.address && newAddress.city && newAddress.postalCode) {
            try {
                const subtotal = orderData.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
                const result = await calculateShippingCost(newAddress, subtotal);
                setOrderData(prev => ({
                    ...prev,
                    shippingCost: result.freeShipping ? 0 : (result.cost || 0)
                }));
            } catch (error) {
                console.error('Error al calcular envío:', error);
            }
        }
    };

    const calculateSubtotal = () => {
        return orderData.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + (orderData.shippingCost || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!orderData.usuarioId) {
            toast.error('Debe seleccionar un usuario');
            return;
        }
        
        if (orderData.items.length === 0) {
            toast.error('Debe agregar al menos un producto');
            return;
        }

        setSaving(true);
        try {
            const createdOrder = await createManualOrder(orderData);
            toast.success('Venta creada exitosamente');
            navigate(`/orden/${createdOrder._id}`);
        } catch (error) {
            console.error('Error al crear venta:', error);
            toast.error(error.response?.data?.msg || 'Error al crear la venta');
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.nombre.toLowerCase().includes(searchUser.toLowerCase()) ||
        user.email.toLowerCase().includes(searchUser.toLowerCase())
    );

    const filteredProducts = products.filter(product =>
        product.nombre.toLowerCase().includes(searchProduct.toLowerCase())
    );

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className={styles.container}>
            <h2>Crear Venta Manual</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Selección de Usuario */}
                <div className={styles.section}>
                    <h3>Cliente</h3>
                    <Input
                        label="Buscar Usuario"
                        type="text"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        placeholder="Buscar por nombre o email..."
                    />
                    {searchUser && (
                        <div className={styles.dropdown}>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <div
                                        key={user._id}
                                        className={styles.dropdownItem}
                                        onClick={() => {
                                            setOrderData(prev => ({ ...prev, usuarioId: user._id }));
                                            setSearchUser(user.nombre);
                                        }}
                                    >
                                        {user.nombre} ({user.email})
                                    </div>
                                ))
                            ) : (
                                <div className={styles.dropdownItem}>No se encontraron usuarios</div>
                            )}
                        </div>
                    )}
                    {orderData.usuarioId && (
                        <p className={styles.selected}>
                            Usuario seleccionado: {users.find(u => u._id === orderData.usuarioId)?.nombre}
                        </p>
                    )}
                </div>

                {/* Agregar Productos */}
                <div className={styles.section}>
                    <h3>Productos</h3>
                    <Input
                        label="Buscar Producto"
                        type="text"
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                        placeholder="Buscar producto..."
                    />
                    {searchProduct && (
                        <div className={styles.dropdown}>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <div
                                        key={product._id}
                                        className={styles.dropdownItem}
                                        onClick={() => handleAddProduct(product)}
                                    >
                                        {product.nombre} - ${product.precio} (Stock: {product.stock})
                                    </div>
                                ))
                            ) : (
                                <div className={styles.dropdownItem}>No se encontraron productos</div>
                            )}
                        </div>
                    )}

                    {/* Lista de productos agregados */}
                    {orderData.items.length > 0 && (
                        <div className={styles.itemsList}>
                            <h4>Productos en la orden:</h4>
                            {orderData.items.map(item => {
                                const product = products.find(p => p._id === item.producto);
                                return (
                                    <div key={item.producto} className={styles.itemRow}>
                                        <div className={styles.itemInfo}>
                                            <span>{item.nombre}</span>
                                            <span>${item.precio} c/u</span>
                                        </div>
                                        <div className={styles.itemActions}>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.cantidad}
                                                onChange={(e) => handleUpdateQuantity(item.producto, parseInt(e.target.value) || 1)}
                                                style={{ width: '80px' }}
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => handleRemoveItem(item.producto)}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                        <div className={styles.itemTotal}>
                                            ${(item.precio * item.cantidad).toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Dirección de Envío */}
                <div className={styles.section}>
                    <h3>Dirección de Envío</h3>
                    <Input
                        label="Dirección"
                        type="text"
                        value={orderData.shippingAddress.address}
                        onChange={(e) => handleAddressChange('address', e.target.value)}
                        required
                    />
                    <Input
                        label="Ciudad"
                        type="text"
                        value={orderData.shippingAddress.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        required
                    />
                    <Input
                        label="Código Postal"
                        type="text"
                        value={orderData.shippingAddress.postalCode}
                        onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                        required
                    />
                    <Input
                        label="País"
                        type="text"
                        value={orderData.shippingAddress.country}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        required
                    />
                </div>

                {/* Método de Pago y Estados */}
                <div className={styles.section}>
                    <h3>Configuración</h3>
                    <div>
                        <label>Método de Pago</label>
                        <select
                            value={orderData.paymentMethod}
                            onChange={(e) => setOrderData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            className={styles.select}
                        >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia Bancaria</option>
                            <option value="MercadoPago">MercadoPago</option>
                        </select>
                    </div>
                    <div>
                        <label>Estado de Pago</label>
                        <select
                            value={orderData.status}
                            onChange={(e) => setOrderData(prev => ({ ...prev, status: e.target.value }))}
                            className={styles.select}
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>
                    <div>
                        <label>Estado de Entrega</label>
                        <select
                            value={orderData.deliveryStatus}
                            onChange={(e) => setOrderData(prev => ({ ...prev, deliveryStatus: e.target.value }))}
                            className={styles.select}
                        >
                            <option value="no_enviado">No Enviado</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregado">Entregado</option>
                        </select>
                    </div>
                </div>

                {/* Resumen */}
                <div className={styles.section}>
                    <h3>Resumen</h3>
                    <div className={styles.summary}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal:</span>
                            <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Envío:</span>
                            <span>${orderData.shippingCost.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <strong>Total:</strong>
                            <strong>${calculateTotal().toFixed(2)}</strong>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/admin/sales-history')}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? 'Creando...' : 'Crear Venta'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminCreateManualOrderPage;

