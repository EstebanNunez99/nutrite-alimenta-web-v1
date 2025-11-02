import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'
import axios from 'axios';
import Button from '../components/ui/Button';
import Input from '../../components/ui/Input'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function Login() {
  useDocumentTitle('Iniciar Sesión')
  const [form, setForm] = useState({ email: '', contraseña: '' });
  const navigate = useNavigate();
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
  e.preventDefault();
  try {
    const res = await axios.post('http://localhost:4000/api/usuarios/login', form);

    // Guardar datos en localStorage
    console.log(res)
    localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('rol', res.data.usuario.rol);
    localStorage.setItem('nombre', res.data.usuario.nombre);

    // Redirigir según el rol
    if (res.data.usuario.rol === 'admin') {
      navigate('/admin');
    } else {
      navigate('/catalogo');
    }
  } catch (err) {
    toast.error(`Error al iniciar sesión: ${err.response?.data?.error || 'Error desconocido'}`);
    ('Error al iniciar sesión', err.status);
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <Input name="email" placeholder="Email" onChange={handleChange} />
      <Input name="contraseña" type="password" placeholder="Contraseña" onChange={handleChange} />
      <Button type="submit" variant='primary'>Ingresar</Button>
    </form>
  );
}
