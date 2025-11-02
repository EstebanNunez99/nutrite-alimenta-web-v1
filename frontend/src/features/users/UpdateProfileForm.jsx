import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/userService';
import styles from './UserForms.module.css'; // <-- Usa el nuevo estilo
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const UpdateProfileForm = () => {
    const { usuario, updateUserContext } = useAuth();
    const [formData, setFormData] = useState({ 
        nombre: usuario?.nombre || '', 
        email: usuario?.email || '',
        telefono: usuario?.telefono || ''
    });
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ message: '', type: '' });
        try {
            const updatedUser = await updateUserProfile(formData);
            updateUserContext(updatedUser);
            setFeedback({ message: '¡Perfil actualizado con éxito!', type: 'success' });
        } catch (error) {
            setFeedback({ message: 'Error al actualizar el perfil.', type: 'error' });
            console.error(error);
        }
    };

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <h4>Actualizar Datos</h4>
            <Input label="Nombre" name="nombre" value={formData.nombre} onChange={onChange} required className={styles.fullWidth} />
            <Input label="Email" type="email" name="email" value={formData.email} onChange={onChange} required className={styles.fullWidth}/>
            <Input label="Teléfono" type="tel" name="telefono" value={formData.telefono} onChange={onChange} placeholder="+54 9 11 1234-5678" className={styles.fullWidth}/>
            <Button type="submit">Guardar Cambios</Button>
            {feedback.message && (
                <p className={`${styles.message} ${styles[feedback.type]}`}>{feedback.message}</p>
            )}
        </form>
    );
};

export default UpdateProfileForm;