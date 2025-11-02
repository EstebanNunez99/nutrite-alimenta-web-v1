import React, { useState } from 'react';
import Login from '../features/auth/Login';
import Registro from '../features/auth/Registro';

const AuthPage = () => {
    const [showLogin, setShowLogin] = useState(true);

    if (showLogin) {
        return <Login onSwitchToRegister={() => setShowLogin(false)} />;
    } else {
        return <Registro onSwitchToLogin={() => setShowLogin(true)} />;
    }
};

export default AuthPage;