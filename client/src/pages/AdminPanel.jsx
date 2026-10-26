import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { BACKEND_URL } from '../services/api';

function AdminPanel() {
  const navigate = useNavigate();

  const [indicadores, setIndicadores] = useState({
    entregas_exitosas: 0,
    familias_impactadas: 0,
    reportes_pendientes: 0
  });
  const [reportadas, setReportadas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [pestanaActiva, setPestanaActiva] = useState('REPORTADAS');
  const [cargando, setCargando] = useState(true);

  // Carga inicial
  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setIndicadores(res.data.indicadores);
        setReportadas(res.data.publicaciones_reportadas);
        setUsuarios(res.data.usuarios);
      } catch (err) {
        console.error('Error al cargar panel admin:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, []);

  // Refrescar panel
  const recargarPanel = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setIndicadores(res.data.indicadores);
      setReportadas(res.data.publicaciones_reportadas);
      setUsuarios(res.data.usuarios);
    } catch (err) {
      console.error('Error al recargar panel:', err);
    }
  };

  // Mantener o dar de baja una publicación
  const manejarModeracion = async (id_donacion, decision) => {
    if (
      decision === 'DAR_DE_BAJA' &&
      !window.confirm('¿Confirmas que deseas dar de baja y eliminar esta publicación?')
    ) {
      return;
    }

    try {
      await api.put(`/admin/publicacion/${id_donacion}`, { decision });
      await recargarPanel();
    } catch (err) {
      console.error('Error al moderar:', err);
    }
  };

  // Suspender o reactivar usuario
  const manejarSuspensionUsuario = async (id_usuario, estadoActual) => {
    const nuevoEstado = !estadoActual;
    const accionTexto = nuevoEstado ? 'reactivar' : 'suspender';
    if (!window.confirm(`¿Deseas ${accionTexto} la cuenta de este usuario?`)) return;

    try {
      await api.put(`/admin/usuario/${id_usuario}`, { activo: nuevoEstado });
      await recargarPanel();
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
    }
  };

  const formatearDosDigitos = (num) => String(num).padStart(2, '0');

  return (
    <div className="app-container">
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
        Panel de administración
      </h1>

      {/* Tarjetas superiores de indicadores (Figura 5 - RF-18) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px',
          marginBottom: '18px'
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--color-primario-claro)',
            padding: '12px 10px',
            borderRadius: '12px'
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primario)' }}>
            {formatearDosDigitos(indicadores.entregas_exitosas)}
          </div>
          <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.2', marginTop: '4px' }}>
            Entregas exitosas
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-primario-claro)',
            padding: '12px 10px',
            borderRadius: '12px'
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primario)' }}>
            {formatearDosDigitos(indicadores.familias_impactadas)}
          </div>
          <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.2', marginTop: '4px' }}>
            Familias impactadas
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-primario-claro)',
            padding: '12px 10px',
            borderRadius: '12px'
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primario)' }}>
            {formatearDosDigitos(indicadores.reportes_pendientes)}
          </div>
          <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.2', marginTop: '4px' }}>
            Reportes pendientes
          </div>
        </div>
      </div>

      {/* Selector de pestañas (Reportadas | Usuarios | Estadísticas) (Figura 5) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          backgroundColor: 'var(--color-primario-claro)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '18px'
        }}
      >
        {[
          { id: 'REPORTADAS', label: 'Reportadas' },
          { id: 'USUARIOS', label: 'Usuarios' },
          { id: 'ESTADISTICAS', label: 'Estadísticas' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPestanaActiva(tab.id)}
            style={{
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: pestanaActiva === tab.id ? 'var(--color-primario)' : 'transparent',
              color: pestanaActiva === tab.id ? '#FFFFFF' : 'var(--color-texto)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido principal según pestaña seleccionada */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {cargando ? (
          <p style={{ textAlign: 'center', color: '#555', marginTop: '30px' }}>Cargando datos...</p>
        ) : pestanaActiva === 'REPORTADAS' ? (
          <>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
              Publicaciones reportadas
            </h2>

            {reportadas.length === 0 ? (
              <p style={{ color: '#555', fontSize: '14px', textAlign: 'center', marginTop: '24px' }}>
                No hay publicaciones reportadas pendientes de revisión.
              </p>
            ) : (
              reportadas.map((item) => (
                <div
                  key={item.id_donacion}
                  style={{
                    border: '1px solid #DCDCDC',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '14px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    {item.url_foto ? (
                      <img
                        src={`${BACKEND_URL}${item.url_foto}`}
                        alt={item.titulo}
                        className="donation-thumb"
                        style={{ width: '58px', height: '58px' }}
                      />
                    ) : (
                      <div className="donation-thumb" style={{ width: '58px', height: '58px' }} />
                    )}

                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700' }}>{item.titulo}</h3>
                      <p style={{ fontSize: '13px', color: '#555', margin: '2px 0 6px' }}>
                        Motivo: {item.ultimo_motivo}
                      </p>
                      <span
                        style={{
                          backgroundColor: '#FDECEC',
                          color: 'var(--color-error)',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        {item.total_reportes} { parseInt(item.total_reportes) === 1 ? 'reporte' : 'reportes' }
                      </span>
                    </div>
                  </div>

                  {/* Botones Mantener y Dar de baja (Figura 5) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => manejarModeracion(item.id_donacion, 'MANTENER')}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--color-primario)',
                        backgroundColor: '#FFFFFF',
                        color: 'var(--color-primario)',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Mantener
                    </button>

                    <button
                      type="button"
                      onClick={() => manejarModeracion(item.id_donacion, 'DAR_DE_BAJA')}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#B81D13',
                        color: '#FFFFFF',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Dar de baja
                    </button>
                  </div>

                  {/* Botón Suspender usuario (Figura 5) */}
                  <button
                    type="button"
                    onClick={() => manejarSuspensionUsuario(item.id_usuario_donante, true)}
                    style={{
                      height: '40px',
                      width: '100%',
                      borderRadius: '8px',
                      border: '1.5px solid #444',
                      backgroundColor: '#FFFFFF',
                      color: '#222',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Suspender usuario
                  </button>
                </div>
              ))
            )}
          </>
        ) : pestanaActiva === 'USUARIOS' ? (
          <>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
              Gestión de usuarios
            </h2>
            {usuarios.map((u) => (
              <div
                key={u.id_usuario}
                className="donation-card"
                style={{ justifyContent: 'space-between' }}
              >
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700' }}>{u.nombre_completo}</h3>
                  <p className="helper-text" style={{ marginTop: '2px' }}>
                    {u.rol} · {u.activo ? 'Activo' : 'Suspendido'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => manejarSuspensionUsuario(u.id_usuario, u.activo)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-error)',
                    background: u.activo ? '#FFF' : 'var(--color-primario)',
                    color: u.activo ? 'var(--color-error)' : '#FFF',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {u.activo ? 'Suspender' : 'Reactivar'}
                </button>
              </div>
            ))}
          </>
        ) : (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
              Resumen de impacto comunitario
            </h2>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.5' }}>
              A través de la plataforma se han completado{' '}
              <strong>{indicadores.entregas_exitosas} entregas</strong> directas familia a familia,
              beneficiando a <strong>{indicadores.familias_impactadas} hogares</strong> en municipios
              y veredas de Colombia.
            </p>
          </div>
        )}
      </div>

      {/* Barra inferior de administración (Figura 5) */}
      <nav className="bottom-nav">
        <button
          onClick={() => setPestanaActiva('REPORTADAS')}
          className={`nav-item ${pestanaActiva === 'REPORTADAS' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Moderación
        </button>
        <button
          onClick={() => setPestanaActiva('USUARIOS')}
          className={`nav-item ${pestanaActiva === 'USUARIOS' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Usuarios
        </button>
        <button
          onClick={() => setPestanaActiva('ESTADISTICAS')}
          className={`nav-item ${pestanaActiva === 'ESTADISTICAS' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Estadísticas
        </button>
        <button
          onClick={() => navigate('/perfil')}
          className="nav-item"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Perfil
        </button>
      </nav>
    </div>
  );
}

export default AdminPanel;