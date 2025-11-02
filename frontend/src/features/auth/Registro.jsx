// Ubicación: web/src/features/auth/Registro.jsx

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input';
import styles from './AuthForm.module.css'; 

// 1. Importamos los íconos que vamos a usar
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const Registro = ({ onSwitchToLogin }) => {
    const { registro } = useAuth();
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: ''
    });

    const { nombre, email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (password.length < 6) {
            toast.info('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        try {
            await registro(nombre, email, password);
        } catch (error) {
            console.error(error.response ? error.response.data : error.message);
            toast.error(`Error: ${error.response ? error.response.data.msg : 'No se pudo conectar al servidor'}`);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>Registrarse</h2>
            <form onSubmit={onSubmit} className={styles.form}>
                <Input
                    icon={<FaUser />}
                    type="text"
                    placeholder="Nombre"
                    name="nombre"
                    value={nombre}
                    onChange={onChange}
                    required
                />
                <Input
                    icon={<FaEnvelope />}
                    type="email"
                    placeholder="Correo Electrónico"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                />
                <Input
                    icon={<FaLock />}
                    type="password"
                    placeholder="Contraseña (mínimo 6 caracteres)"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                />
                <Button variant='primary' type="submit" >
                    Registrar
                </Button>
            </form>
            <p className={styles.switchText}>
                ¿Ya tienes una cuenta?
                <Button variant='secondary' onClick={onSwitchToLogin}>
                    Inicia Sesión
                </Button>
            </p>
        </div>
    );
};

export default Registro;