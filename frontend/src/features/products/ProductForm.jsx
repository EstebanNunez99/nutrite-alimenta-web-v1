// ProductForm.jsx

import React, { useState, useEffect, useRef } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import styles from '../../pages/styles/EditProductPage.module.css';

const ProductForm = ({ onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState({
        nombre: '', descripcion: '', precio: '', stock: '', categoria: '', imagen: ''
    });

    const { nombre, descripcion, precio, stock, categoria, imagen } = initialData || {};

    useEffect(() => {
        setFormData({
            nombre: nombre || '', descripcion: descripcion || '', precio: precio || '', stock: stock || '', categoria: categoria || '', imagen: imagen || ''
        });
    }, [nombre, descripcion, precio, stock, categoria, imagen]);
    
    const textareaRef = useRef(null);
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [formData.descripcion]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
                <label htmlFor="nombre" className={styles.formLabel}>Nombre del Producto</label>
                <Input id="nombre" type="text" name="nombre" value={formData.nombre} onChange={onChange} required className={styles.formInput} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="descripcion" className={styles.formLabel}>Descripción</label>
                <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={onChange} required className={styles.formInput} ref={textareaRef} rows={1} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="precio" className={styles.formLabel}>Precio</label>
                <Input id="precio" type="number" name="precio" value={formData.precio} onChange={onChange} required className={styles.formInput} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="stock" className={styles.formLabel}>Stock</label>
                <Input id="stock" type="number" name="stock" value={formData.stock} onChange={onChange} required className={styles.formInput} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="categoria" className={styles.formLabel}>Categoría</label>
                <Input id="categoria" type="text" name="categoria" value={formData.categoria} onChange={onChange} className={styles.formInput} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="imagen" className={styles.formLabel}>URL de la Imagen</label>
                <Input id="imagen" type="text" name="imagen" value={formData.imagen} onChange={onChange} className={styles.formInput} />
            </div>

            <div className={styles.formActions}>
                <Button type="submit" variant='primary'>
                    {initialData._id ? 'Guardar Cambios' : 'Crear Producto'}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;