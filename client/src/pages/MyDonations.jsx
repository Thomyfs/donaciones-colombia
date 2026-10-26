import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { BACKEND_URL } from '../services/api';

function MyDonations() {
  // Estados
  const [misDonaciones, setMisDonaciones] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('TODAS');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // Consultar endpoint
  useEffect(() => {
    const cargarMisDonaciones = async () => {
      try {
        // Esta ruta usa el Token JWT para filtrar por id_usuario_donante en PostgreSQL
        const respuesta = await api.get('/donations/mis-donaciones');
        setMisDonaciones(respuesta.data.donaciones);
      } catch (error) {
        console.error('Error al cargar mis donaciones:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarMisDonaciones();
  }, []);

  // # donaciones entregado
  const totalEntregadas = misDonaciones.filter(
    (d) => d.estado_donacion === 'ENTREGADO'
  ).length;

  // Filtrar
  const donacionesFiltradas = misDonaciones.filter((d) => {
    if (filtroEstado === 'TODAS') return true;
    return d.estado_donacion === filtroEstado;
  });

  // Formateador visual
  const formatearEstadoDonacion = (estado) => {
    if (estado === 'DISPONIBLE') return 'Disponible';
    if (estado === 'EN_PROCESO') return 'En proceso';
    if (estado === 'ENTREGADO') return 'Entregado';
    if (estado === 'CANCELADO') return 'Cancelada';
    return estado;
  };

  // Formateador de fecha
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="app-container">
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '14px' }}>
        Historial de donaciones
      </h1>

      {/* Banner verde azulado con contador de entregas completadas (Figura 7 derecha) */}
      <div
        style={{
          backgroundColor: 'var(--color-primario)',
          color: '#FFFFFF',
          padding: '14px 16px',
          borderRadius: '10px',
          fontWeight: '700',
          fontSize: '15px',
          marginBottom: '14px'
        }}
      >
        {totalEntregadas} entregas completadas
      </div>

      {/* Filtros por estado de la donación (Todas, Entregado, En proceso) */}
      <div className="chip-group">
        {[
          { id: 'TODAS', label: 'Todas' },
          { id: 'ENTREGADO', label: 'Entregado' },
          { id: 'EN_PROCESO', label: 'En proceso' }
        ].map((est) => (
          <button
            key={est.id}
            type="button"
            className={`chip-btn ${filtroEstado === est.id ? 'active' : ''}`}
            onClick={() => setFiltroEstado(est.id)}
          >
            {est.label}
          </button>
        ))}
      </div>

      {/* Lista de donaciones publicadas únicamente por este usuario */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {cargando ? (
          <p style={{ color: '#555', textAlign: 'center', marginTop: '30px' }}>
            Cargando tu historial...
          </p>
        ) : donacionesFiltradas.length === 0 ? (
          <p style={{ color: '#555', textAlign: 'center', marginTop: '30px' }}>
            No tienes donaciones registradas en este estado.
          </p>
        ) : (
          donacionesFiltradas.map((item) => (
            <div
              key={item.id_donacion}
              className="donation-card"
              style={{ justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => navigate(`/donacion/${item.id_donacion}`)}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {item.url_foto ? (
                  <img
                    src={`${BACKEND_URL}${item.url_foto}`}
                    alt={item.titulo}
                    className="donation-thumb"
                    style={{ width: '56px', height: '56px' }}
                  />
                ) : (
                  <div
                    className="donation-thumb"
                    style={{ width: '56px', height: '56px' }}
                  />
                )}

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
                    {item.titulo}
                  </h3>
                  <p className="helper-text" style={{ marginTop: 0 }}>
                    {formatearFecha(item.fecha_publicacion)}
                  </p>
                </div>
              </div>

              {/* Etiqueta a la derecha indicando el estado actual */}
              <span className="badge" style={{ margin: 0, flexShrink: 0 }}>
                {formatearEstadoDonacion(item.estado_donacion)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Barra de navegación inferior */}
      <Navbar />
    </div>
  );
}

export default MyDonations;