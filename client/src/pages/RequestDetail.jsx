import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Star, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import api, { BACKEND_URL } from '../services/api';

function RequestDetail() {
  const { id } = useParams(); // ID de la donación en la URL
  const navigate = useNavigate();
  const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Estados de la donación y la solicitud asociada
  const [donacion, setDonacion] = useState(null);
  const [solicitud, setSolicitud] = useState(null);
  const [mensajeJustificativo, setMensajeJustificativo] = useState('');
  const [mostrarPuntos, setMostrarPuntos] = useState(false);
  const [calificacion, setCalificacion] = useState(0);
  const [calificacionEnviada, setCalificacionEnviada] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  // Directorio de Puntos de Entrega Neutrales sugeridos (RF-25)
  const puntosEntregaNeutrales = [
    'Parque Principal del Municipio (Frente a la Alcaldía)',
    'Salón Comunal de la Junta de Acción Comunal (JAC)',
    'Parroquia Central / Casa Curatal',
    'Escuela Rural de la Vereda (Entrada principal)'
  ];

  useEffect(() => {
    const obtenerDetalleInicial = async () => {
      try {
        const res = await api.get(`/requests/donacion/${id}`);
        setDonacion(res.data.donacion);
        setSolicitud(res.data.solicitud);
      } catch (err) {
        console.error('Error al cargar detalle:', err);
        setError('No se pudo cargar la información del recurso.');
      } finally {
        setCargando(false);
      }
    };

    obtenerDetalleInicial();
  }, [id]);

  // Función auxiliar para refrescar los datos después de hacer clic en un botón
  const recargarDatos = async () => {
    try {
      const res = await api.get(`/requests/donacion/${id}`);
      setDonacion(res.data.donacion);
      setSolicitud(res.data.solicitud);
    } catch (err) {
      console.error('Error al recargar datos:', err);
    }
  };

  // Enviar solicitud como Beneficiario
  const manejarSolicitar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/requests', {
        id_donacion: donacion.id_donacion,
        mensaje_justificativo: mensajeJustificativo
      });
      await recargarDatos(); // Recarga para pasar a la vista de Seguimiento
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al solicitar el recurso.');
    }
  };

  // Aprobar o rechazar solicitud como Donante
  const manejarRespuestaDonante = async (accion) => {
    try {
      await api.put(`/requests/${solicitud.id_solicitud}/responder`, { accion });
      await recargarDatos();
    } catch (err) {
      console.error('Error al responder solicitud:', err);
      setError('Error al procesar la solicitud.');
    }
  };

  // Confirmar entrega con ventana de prevención de errores
  const manejarConfirmarEntrega = async () => {
    if (!window.confirm('¿Confirmas que el recurso ya fue entregado satisfactoriamente?')) return;
    try {
      await api.put(`/requests/${solicitud.id_solicitud}/confirmar`);
      await recargarDatos();
    } catch (err) {
      console.error('Error al confirmar entrega:', err);
      setError('Error al confirmar la entrega.');
    }
  };

  // Cancelar solicitud con confirmación previa
  const manejarCancelar = async () => {
    if (!window.confirm('¿Estás seguro de cancelar esta solicitud? El recurso quedará disponible para otra familia.')) return;
    try {
      await api.put(`/requests/${solicitud.id_solicitud}/cancelar`);
      navigate('/inicio');
    } catch (err) {
      console.error('Error al cancelar solicitud:', err);
      setError('Error al cancelar la solicitud.');
    }
  };

  const formatearCategoria = (cat) => {
    if (cat === 'ALIMENTOS') return 'Alimentos';
    if (cat === 'ROPA') return 'Ropa';
    if (cat === 'UTILES_ESCOLARES') return 'Útiles';
    return 'Otro';
  };

  const formatearEstadoArticulo = (est) => {
    if (est === 'NUEVO') return 'Nuevo';
    if (est === 'BUEN_ESTADO') return 'Buen estado';
    return 'Usado';
  };

  if (cargando) {
    return (
      <div className="app-container">
        <p style={{ textAlign: 'center', marginTop: '40px' }}>Cargando detalle...</p>
      </div>
    );
  }

  if (!donacion) {
    return (
      <div className="app-container">
        <p style={{ textAlign: 'center', marginTop: '40px' }}>Recurso no encontrado.</p>
        <Navbar />
      </div>
    );
  }

  // Función para reportar una publicación sospechosa o engañosa (RF-14)
  const manejarReporte = async () => {
    const motivo = window.prompt(
      'Indica el motivo del reporte (ej: publicación engañosa, contenido inapropiado):',
      'publicación engañosa'
    );
    if (!motivo) return;
    try {
      await api.post('/admin/reportar', {
      id_donacion: donacion.id_donacion,
      motivo
      });
      window.alert('Reporte enviado al panel de administración.');
    } catch (err) {
      console.error('Error al reportar:', err);
    }
  };
  const esDonanteDueno = donacion.id_usuario_donante === usuarioActual.id_usuario;

  return (
    <div className="app-container">
      {/* Encabezado con botón volver */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Link to="/inicio" style={{ color: 'var(--color-texto)', display: 'flex' }}>
          <ChevronLeft size={24} />
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
          {donacion.estado_donacion === 'DISPONIBLE'
            ? 'Solicitar donación'
            : donacion.estado_donacion === 'ENTREGADO'
            ? 'Detalle de la donación'
            : 'Seguimiento'}
        </h1>
      </div>

      {/* =========================================================
          VISTA 1: RECURSO DISPONIBLE PARA SOLICITAR (Figura 6 derecha)
         ========================================================= */}
      {donacion.estado_donacion === 'DISPONIBLE' && (
        <div style={{ flex: 1 }}>
          {/* Foto del recurso */}
          {donacion.url_foto ? (
            <img
              src={`${BACKEND_URL}${donacion.url_foto}`}
              alt={donacion.titulo}
              style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', marginBottom: '14px' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '160px',
              backgroundColor: 'var(--color-primario-claro)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#555',
              marginBottom: '14px'
            }}>
              Foto del recurso
            </div>
          )}

          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>{donacion.titulo}</h2>
          <div style={{ marginBottom: '10px' }}>
            <span className="badge">{formatearCategoria(donacion.categoria)}</span>
            <span className="badge">{formatearEstadoArticulo(donacion.estado_articulo)}</span>
          </div>
          <p style={{ fontSize: '14px', color: '#555', marginBottom: '16px' }}>
            Ubicación: {donacion.municipio || 'Colombia'} {donacion.vereda ? `· ${donacion.vereda}` : ''}
          </p>

          {esDonanteDueno ? (
            <div style={{ padding: '14px', backgroundColor: 'var(--color-primario-claro)', borderRadius: '10px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500' }}>
                Esta es tu publicación. Está visible en el catálogo esperando solicitudes de beneficiarios.
              </p>
            </div>
          ) : (
            <form onSubmit={manejarSolicitar}>
              <div className="form-group">
                <label className="form-label">¿Por qué lo necesitas?</label>
                <textarea
                  className="form-input"
                  style={{ height: '95px', padding: '12px', resize: 'none' }}
                  placeholder="Escribe un mensaje para el donante"
                  value={mensajeJustificativo}
                  onChange={(e) => setMensajeJustificativo(e.target.value)}
                  required
                />
                <span className="helper-text">
                  El recurso queda reservado mientras el donante responde.
                </span>
              </div>

              {error && <p className="error-text" style={{ marginBottom: '8px' }}>{error}</p>}

              <button type="submit" className="btn-primary">
                Solicitar
              </button>
            </form>
          )}
        </div>
      )}

      {/* =========================================================
          VISTA 2: SEGUIMIENTO EN PROCESO (Figura 7 izquierda)
         ========================================================= */}
      {donacion.estado_donacion === 'EN_PROCESO' && solicitud && (
        <div style={{ flex: 1 }}>
          {/* Resumen superior del recurso */}
          <div style={{
            backgroundColor: 'var(--color-primario-claro)',
            padding: '14px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: '700' }}>{donacion.titulo}</h2>
            <p style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>
              {formatearCategoria(donacion.categoria)} · {donacion.municipio || 'Colombia'}
            </p>
          </div>

          {/* Línea de estados de la donación (Figura 7 izquierda) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
            {[
              { etiqueta: 'Disponible', completado: true, actual: false },
              {
                etiqueta: 'Pendiente de aprobación',
                completado: true,
                actual: solicitud.estado_solicitud === 'PENDIENTE'
              },
              {
                etiqueta: 'En proceso de entrega',
                completado: solicitud.estado_solicitud === 'APROBADA',
                actual: solicitud.estado_solicitud === 'APROBADA'
              },
              { etiqueta: 'Entregado', completado: false, actual: false }
            ].map((paso, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid var(--color-primario)',
                  backgroundColor: paso.completado ? 'var(--color-primario)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {paso.actual && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFF' }} />
                  )}
                </div>
                <span style={{
                  fontSize: '15px',
                  fontWeight: paso.actual ? '700' : '400',
                  color: paso.completado ? 'var(--color-texto)' : '#777'
                }}>
                  {paso.etiqueta}
                </span>
              </div>
            ))}
          </div>

          {/* Si el usuario actual es el DONANTE y la solicitud está PENDIENTE, puede Aprobar o Rechazar (RF-06) */}
          {esDonanteDueno && solicitud.estado_solicitud === 'PENDIENTE' && (
            <div style={{
              border: '1px solid var(--color-primario)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#F9FCFC'
            }}>
              <p style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                Solicitud de {solicitud.nombre_beneficiario}:
              </p>
              <p style={{ fontSize: '14px', color: '#333', marginBottom: '12px', fontStyle: 'italic' }}>
                "{solicitud.mensaje_justificativo}"
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: 0, height: '40px', fontSize: '14px' }}
                  onClick={() => manejarRespuestaDonante('APROBAR')}
                >
                  Aprobar entrega
                </button>
                <button
                  type="button"
                  style={{
                    height: '40px',
                    width: '100%',
                    borderRadius: '10px',
                    border: '1.5px solid var(--color-error)',
                    background: 'none',
                    color: 'var(--color-error)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onClick={() => manejarRespuestaDonante('RECHAZAR')}
                >
                  Rechazar
                </button>
              </div>
            </div>
          )}

          {/* Botones de acción de Seguimiento (Figura 7 izquierda) */}
          <button
            type="button"
            onClick={() => navigate(`/chat/${solicitud.id_solicitud}`)}
            style={{
              height: '46px',
              width: '100%',
              borderRadius: '10px',
              border: '1.5px solid var(--color-primario)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-primario)',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Abrir chat
          </button>

          <button
            type="button"
            onClick={() => setMostrarPuntos(!mostrarPuntos)}
            style={{
              height: '46px',
              width: '100%',
              borderRadius: '10px',
              border: '1.5px solid var(--color-primario)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-primario)',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            {mostrarPuntos ? 'Ocultar puntos de entrega' : 'Ver puntos de entrega'}
          </button>

          {/* Lista desplegable de Puntos de Entrega Neutrales (RF-25) */}
          {mostrarPuntos && (
            <div style={{
              backgroundColor: '#F4F9F9',
              padding: '12px',
              borderRadius: '10px',
              marginBottom: '12px',
              fontSize: '13px'
            }}>
              <p style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--color-primario)' }}>
                Puntos seguros sugeridos en tu municipio:
              </p>
              {puntosEntregaNeutrales.map((punto, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <MapPin size={14} color="var(--color-primario)" />
                  <span>{punto}</span>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: 0 }}
            onClick={manejarConfirmarEntrega}
          >
            Confirmar entrega
          </button>

          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <button
              type="button"
              onClick={manejarCancelar}
              style={{
                background: 'none',
                border: 'none',
                color: '#555',
                textDecoration: 'underline',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancelar solicitud
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          VISTA 3: DONACIÓN ENTREGADA Y CALIFICACIÓN (Figura 8 derecha)
         ========================================================= */}
      {donacion.estado_donacion === 'ENTREGADO' && (
        <div style={{ flex: 1 }}>
          {donacion.url_foto ? (
            <img
              src={`${BACKEND_URL}${donacion.url_foto}`}
              alt={donacion.titulo}
              style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', marginBottom: '14px' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '160px',
              backgroundColor: 'var(--color-primario-claro)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#555',
              marginBottom: '14px'
            }}>
              Foto del recurso
            </div>
          )}

          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>{donacion.titulo}</h2>
          <div style={{ marginBottom: '10px' }}>
            <span className="badge">{formatearCategoria(donacion.categoria)}</span>
            <span className="badge">{formatearEstadoArticulo(donacion.estado_articulo)}</span>
            <span className="badge">Entregado</span>
          </div>
          <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px' }}>
            Entregada · {donacion.municipio || 'Colombia'}
          </p>

          {/* Calificación de 1 a 5 estrellas (RF-16 y Figura 8 derecha) */}
          <p style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>
            Califica al {esDonanteDueno ? 'beneficiario' : 'donante'}
          </p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            {[1, 2, 3, 4, 5].map((estrella) => (
              <button
                key={estrella}
                type="button"
                onClick={() => setCalificacion(estrella)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Star
                  size={30}
                  color="var(--color-primario)"
                  fill={estrella <= calificacion ? 'var(--color-primario)' : 'none'}
                />
              </button>
            ))}
          </div>

          {calificacionEnviada ? (
            <p style={{ color: 'var(--color-primario)', fontWeight: '700' }}>
              ¡Gracias por calificar la experiencia de entrega!
            </p>
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={calificacion === 0}
              onClick={() => setCalificacionEnviada(true)}
            >
              Enviar calificación
            </button>
          )}
        </div>
      )}
      {/* Botón para reportar publicación al administrador */}
      {!esDonanteDueno && (
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <button
            type="button"
            onClick={manejarReporte}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-error)',
              fontSize: '13px',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Reportar publicación sospechosa
          </button>
        </div>
      )}
      <Navbar />
    </div>
  );
}

export default RequestDetail;