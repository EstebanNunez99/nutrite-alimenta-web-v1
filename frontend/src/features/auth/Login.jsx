// Ubicación: web/src/features/auth/Login.jsx

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input';
import styles from './AuthForm.module.css';

// 1. Importamos los íconos que vamos a usar
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = ({ onSwitchToRegister }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (error) {
            console.error(error.response ? error.response.data : error.message);
            toast.error(`Error: ${error.response ? error.response.data.msg : 'Credenciales inválidas'}`);
        }
    };

     return (
        <div className={styles.formContainer}>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={onSubmit} className={styles.form}>
                
                {/* MÁS SIMPLE: Ahora solo pasamos el ícono como prop */}
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
                    placeholder="Contraseña"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                />

                {/* Arreglamos el botón usando la prop 'variant' como debe ser */}
                <Button variant='secondary' type="submit" >
                    Iniciar Sesión
                </Button>
            </form>
            <p className={styles.switchText}>
                ¿No tienes una cuenta?
                <Button variant='primary' onClick={onSwitchToRegister}>
                    Regístrate
                </Button>
            </p>
        </div>
    );
};

export default Login;