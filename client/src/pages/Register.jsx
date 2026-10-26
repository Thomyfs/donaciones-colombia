import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

function Register() {
  // Estados del formulario de registro
  const [rol, setRol] = useState('DONANTE');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correoTelefono, setCorreoTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [municipioVereda, setMunicipioVereda] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  // Lista inicial de municipios y veredas
  const ubicacionesColombia = [
    'Chipaque - Vereda Munar',
    'Cáqueza - Vereda Rionegro',
    'Ubaque - Vereda Sabanilla',
    'Fusagasugá - Vereda Chinauta',
    'Chocontá - Vereda Tilatá',
    'Turmequé - Vereda Juratena',
    'Lebrija - Vereda Vanegas'
  ];

  // Función para enviar los datos de registro al Backend
  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Separar el municipio y la vereda si el usuario es Beneficiario
      let municipio = null;
      let vereda = null;
      if (rol === 'BENEFICIARIO' && municipioVereda) {
        const partes = municipioVereda.split(' - ');
        municipio = partes[0];
        vereda = partes[1] || '';
      }

      // Petición POST a /api/auth/register
      const respuesta = await api.post('/auth/register', {
        nombre_completo: nombreCompleto,
        correo_telefono: correoTelefono,
        contrasena,
        rol,
        municipio,
        vereda
      });

      // Guardar sesión y redirigir a la pantalla de inicio
      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
      navigate('/inicio');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear la cuenta.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'space-between' }}>
      <div>
        {/* Barra superior con botón para regresar (Figura 5) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
          <Link to="/" style={{ color: 'var(--color-texto)', display: 'flex' }}>
            <ChevronLeft size={24} />
          </Link>
          <h1 style={{ fontSize: '20px', fontWeight: '700' }}>Crear cuenta</h1>
        </div>

        {/* Selector de Rol: Donante o Beneficiario */}
        <p className="form-label" style={{ marginBottom: '10px' }}>Quiero registrarme como</p>
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${rol === 'DONANTE' ? 'active' : ''}`}
            onClick={() => setRol('DONANTE')}
          >
            Donante
          </button>
          <button
            type="button"
            className={`role-btn ${rol === 'BENEFICIARIO' ? 'active' : ''}`}
            onClick={() => setRol('BENEFICIARIO')}
          >
            Beneficiario
          </button>
        </div>

        {/* Formulario de datos básicos (máximo 4 campos según RF-01) */}
        <form onSubmit={manejarRegistro}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-input"
              placeholder="Tu nombre completo"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              required
            />
          </div>

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
                className="form-input"
                style={{ width: '100%', paddingRight: '42px' }}
                placeholder="Crea una contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
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
          </div>

          {/* Campo adicional exclusivo para Beneficiarios (RF-02 y RNF-03 de Privacidad) */}
          {rol === 'BENEFICIARIO' && (
            <div className="form-group">
              <label className="form-label">Municipio o vereda</label>
              <select
                className="form-input"
                value={municipioVereda}
                onChange={(e) => setMunicipioVereda(e.target.value)}
                required
              >
                <option value="">Selecciona tu municipio o vereda</option>
                {ubicacionesColombia.map((ubicacion, index) => (
                  <option key={index} value={ubicacion}>{ubicacion}</option>
                ))}
              </select>
              <span className="helper-text">
                Solo se mostrará tu municipio o vereda, nunca tu dirección exacta.
              </span>
            </div>
          )}

          {error && <p className="error-text" style={{ marginBottom: '10px' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>
      </div>

      {/* Enlace inferior para volver al Login */}
      <div style={{ textAlign: 'center', paddingBottom: '12px', fontSize: '14px' }}>
        <span style={{ color: 'var(--color-texto-secundario)' }}>¿Ya tienes cuenta? </span>
        <Link to="/" style={{ color: 'var(--color-primario)', fontWeight: '700', textDecoration: 'none' }}>
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}

export default Register;