import React, { useState } from 'react';
import { updateUserPassword } from '../../services/userService';
import styles from './UserForms.module.css'; // <-- Reutiliza el mismo estilo
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const UpdatePasswordForm = () => {
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    const onChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ message: '', type: '' });
        if (passwords.newPassword !== passwords.confirmNewPassword) {
            setFeedback({ message: 'Las nuevas contraseñas no coinciden.', type: 'error' });
            return;
        }
        try {
            await updateUserPassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            });
            setFeedback({ message: '¡Contraseña actualizada con éxito!', type: 'success' });
            setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            setFeedback({ message: error.response?.data?.msg || 'Error al cambiar la contraseña.', type: 'error' });
            console.error(error);
        }
    };

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <h4>Cambiar Contraseña</h4>
            <Input label="Contraseña Actual" type="password" name="currentPassword" value={passwords.currentPassword} onChange={onChange} required className={styles.fullWidth} />
            <Input label="Nueva Contraseña" type="password" name="newPassword" value={passwords.newPassword} onChange={onChange} required className={styles.fullWidth} />
            <Input label="Confirmar Nueva Contraseña" type="password" name="confirmNewPassword" value={passwords.confirmNewPassword} onChange={onChange} required className={styles.fullWidth}/>
            <Button type="submit">Cambiar Contraseña</Button>
            {feedback.message && (
                <p className={`${styles.message} ${styles[feedback.type]}`}>{feedback.message}</p>
            )}
        </form>
    );
};

export default UpdatePasswordForm;