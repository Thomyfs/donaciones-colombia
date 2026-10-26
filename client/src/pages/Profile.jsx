import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';

function Profile() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [notificaciones, setNotificaciones] = useState(true);

  // Obtener la primera letra del nombre para el avatar
  const inicial = usuario.nombre_completo ? usuario.nombre_completo.charAt(0).toUpperCase() : 'U';

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <div className="app-container">
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '22px' }}>Perfil</h1>

      {/* Avatar circular e información del usuario */}
      <div style={{ marginBottom: '26px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primario-claro)',
          color: 'var(--color-primario)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '12px'
        }}>
          {inicial}
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{usuario.nombre_completo}</h2>
        <p style={{ color: 'var(--color-texto-secundario)', fontSize: '14px', marginTop: '2px' }}>
          {usuario.rol === 'BENEFICIARIO' ? 'Beneficiario' : 'Donante'}
          {usuario.municipio ? ` · ${usuario.municipio}` : ''}
        </p>
      </div>

      {/* Opciones del perfil (Figura 9) */}
      <div style={{ flex: 1 }}>
        <Link
          to="/mis-donaciones"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 0',
            borderBottom: '1px solid #E0E0E0',
            textDecoration: 'none',
            color: 'var(--color-texto)',
            fontSize: '15px'
          }}
        >
          <span>Mis donaciones</span>
          <ChevronRight size={20} color="#555" />
        </Link>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 0',
          borderBottom: '1px solid #E0E0E0',
          fontSize: '15px'
        }}>
          <span>Notificaciones</span>
          <input
            type="checkbox"
            checked={notificaciones}
            onChange={() => setNotificaciones(!notificaciones)}
            style={{ width: '20px', height: '20px', accentColor: 'var(--color-primario)' }}
          />
        </div>

        <button
          onClick={cerrarSesion}
          style={{
            marginTop: '28px',
            background: 'none',
            border: '1.5px solid var(--color-error)',
            color: 'var(--color-error)',
            borderRadius: '10px',
            height: '44px',
            width: '100%',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <Navbar />
    </div>
  );
}

export default Profile;