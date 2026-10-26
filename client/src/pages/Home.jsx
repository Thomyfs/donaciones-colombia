import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import api, { BACKEND_URL } from '../services/api';

function Home() {
  // almacenar donaciones y filtros
  const [donaciones, setDonaciones] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerPorCategoria = async () => {
      try {
        // Consultar usando categoría y texto de busqueda
        const respuesta = await api.get('/donations', {
          params: {
            categoria: categoriaActiva,
            busqueda: busqueda
          }
        });
        setDonaciones(respuesta.data.donaciones);
      } catch (error) {
        console.error('Error al cargar catálogo:', error);
      } finally {
        // Quitar estado de carfa
        setCargando(false);
      }
    };

    obtenerPorCategoria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaActiva]);

  // Función para buscar
  const manejarBusqueda = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const respuesta = await api.get('/donations', {
        params: {
          categoria: categoriaActiva,
          busqueda: busqueda
        }
      });
      setDonaciones(respuesta.data.donaciones);
    } catch (error) {
      console.error('Error al buscar donaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  // Formateadores, mostrar etiquetas
  const formatearCategoria = (cat) => {
    if (cat === 'ALIMENTOS') return 'Alimentos';
    if (cat === 'ROPA') return 'Ropa';
    if (cat === 'UTILES_ESCOLARES') return 'Útiles';
    return 'Otro';
  };

  const formatearEstado = (est) => {
    if (est === 'NUEVO') return 'Nuevo';
    if (est === 'BUEN_ESTADO') return 'Buen estado';
    return 'Usado';
  };

  return (
    <div className="app-container">
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Inicio</h1>

      {/* Barra de búsqueda por palabra clave (RF-23) */}
      <form
        onSubmit={manejarBusqueda}
        style={{ position: 'relative', marginBottom: '14px' }}
      >
        <Search
          size={18}
          color="#555"
          style={{ position: 'absolute', left: '14px', top: '14px' }}
        />
        <input
          type="text"
          className="form-input"
          style={{ width: '100%', paddingLeft: '40px', borderRadius: '22px' }}
          placeholder="Buscar donaciones"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </form>

      {/* Botones de filtro por categoría (Figura 9) */}
      <div className="chip-group">
        {[
          { id: 'TODAS', label: 'Todas' },
          { id: 'ALIMENTOS', label: 'Alimentos' },
          { id: 'ROPA', label: 'Ropa' },
          { id: 'UTILES_ESCOLARES', label: 'Útiles' }
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`chip-btn ${categoriaActiva === cat.id ? 'active' : ''}`}
            onClick={() => {
              setCargando(true);
              setCategoriaActiva(cat.id);
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Listado de tarjetas de donación */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {cargando ? (
          <p style={{ color: '#555', textAlign: 'center', marginTop: '30px' }}>Cargando recursos...</p>
        ) : donaciones.length === 0 ? (
          <p style={{ color: '#555', textAlign: 'center', marginTop: '30px' }}>
            No hay donaciones disponibles en esta categoría. ¡Sé el primero en publicar en la pestaña "Donar"!
          </p>
        ) : (
          donaciones.map((item) => (
            <div
              key={item.id_donacion}
              className="donation-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/donacion/${item.id_donacion}`)}
            >
              {/* Fotografía comprimida o cuadro verde claro por defecto */}
              {item.url_foto ? (
                <img
                  src={`${BACKEND_URL}${item.url_foto}`}
                  alt={item.titulo}
                  className="donation-thumb"
                />
              ) : (
                <div className="donation-thumb" />
              )}

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>
                  {item.titulo}
                </h3>
                <div>
                  <span className="badge">{formatearCategoria(item.categoria)}</span>
                  <span className="badge">{formatearEstado(item.estado_articulo)}</span>
                </div>
                <p className="helper-text" style={{ marginTop: '6px' }}>
                  {item.municipio || 'Colombia'} {item.vereda ? `· ${item.vereda}` : ''}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Barra de navegación inferior */}
      <Navbar />
    </div>
  );
}

export default Home;