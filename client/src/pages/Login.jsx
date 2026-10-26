import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, EyeOff } from 'lucide-react'; 
import api from '../services/api';

function Login() {
  // Estados para almacenar los datos del formulario y errores
  const [correoTelefono, setCorreoTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  // Función iniciar sesión
  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Enviar credenciales al endpoint
      const respuesta = await api.post('/auth/login', {
        correo_telefono: correoTelefono,
        contrasena
      });

      // Guardar información del usuario en el navegador
      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));

      // Redirigir según el rol
      if (respuesta.data.usuario.rol === 'ADMINISTRADOR') {
        navigate('/admin');
      } else {
        navigate('/inicio');
      }
    } catch (err) {
      // Mostrar error si falla credenciales
      setError(err.response?.data?.mensaje || 'Datos incorrectos, intenta de nuevo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'space-between' }}>
      <div style={{ marginTop: '30px' }}>
        {/* Encabezado con el ícono de corazón verde azulado (Figura 5) */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primario)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px'
          }}>
            <Heart color="#FFFFFF" size={34} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px' }}>Bienvenido</h1>
          <p style={{ color: 'var(--color-texto-secundario)', fontSize: '15px' }}>
            Dona y recibe cerca de ti
          </p>
        </div>

        {/* Formulario de inicio de sesión */}
        <form onSubmit={manejarLogin}>
          <div className="form-group">
            <label className="form-label">Correo o teléfono</label>
            <input
              type="text"
              className="form-input"
              placeholder="nombre@correo.com o 300 000 0000"
              value={correoTelefono}
              onChange={(e) => setCorreoTelefono(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                className={`form-input ${error ? 'input-error' : ''}`}
                style={{ width: '100%', paddingRight: '42px' }}
                placeholder="Tu contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              {/* Botón de ojo para mostrar/ocultar contraseña */}
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '11px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#555'
                }}
              >
                {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {/* Mensaje de error en rojo si los datos son incorrectos */}
            {error && <span className="error-text">{error}</span>}
          </div>

          <div style={{ textAlign: 'right', marginBottom: '18px' }}>
            <span style={{ color: 'var(--color-primario)', fontSize: '14px', fontWeight: '500' }}>
              ¿Olvidaste tu contraseña?
            </span>
          </div>

          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>

      {/* Pie de página para ir al registro */}
      <div style={{ textAlign: 'center', paddingBottom: '12px', fontSize: '14px' }}>
        <span style={{ color: 'var(--color-texto-secundario)' }}>¿No tienes cuenta? </span>
        <Link to="/registro" style={{ color: 'var(--color-primario)', fontWeight: '700', textDecoration: 'none' }}>
          Regístrate
        </Link>
      </div>
    </div>
  );
}

export default Login;