import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';

function CreateDonation() {
  // Estados del formulario
  const [foto, setFoto] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [categoria, setCategoria] = useState('ALIMENTOS');
  const [estadoArticulo, setEstadoArticulo] = useState('BUEN_ESTADO');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const navigate = useNavigate();

  // Maneja la selección de foto desde el celular o computador
  const manejarSeleccionFoto = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setFoto(archivo);
      setVistaPrevia(URL.createObjectURL(archivo));
    }
  };

  // Comprimir y guardar formulario
  const manejarPublicacion = async (e) => {
    e.preventDefault();
    setError('');
    setSubiendo(true);

    try {
      const formData = new FormData();
      formData.append('categoria', categoria);
      formData.append('estado_articulo', estadoArticulo);
      formData.append('descripcion', descripcion);
      formData.append('titulo', descripcion);
      if (foto) {
        formData.append('foto', foto);
      }

      await api.post('/donations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Redirigir al catálogo principal tras publicar
      navigate('/inicio');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al publicar la donación.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="app-container">
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Subir donación</h1>

      <form onSubmit={manejarPublicacion} style={{ flex: 1 }}>
        {/* Paso 1: Agregar foto (Figura 6) */}
        <label className="upload-box">
          <input
            type="file"
            accept="image/*"
            onChange={manejarSeleccionFoto}
            style={{ display: 'none' }}
          />
          {vistaPrevia ? (
            <img
              src={vistaPrevia}
              alt="Vista previa"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <>
              <Plus size={28} color="var(--color-primario)" />
              <span style={{ fontSize: '14px', color: '#555', marginTop: '6px' }}>Agregar foto</span>
            </>
          )}
        </label>

        {/* Paso 2: Categoría */}
        <label className="form-label">Categoría</label>
        <div className="chip-group">
          {[
            { id: 'ALIMENTOS', label: 'Alimentos' },
            { id: 'ROPA', label: 'Ropa' },
            { id: 'UTILES_ESCOLARES', label: 'Útiles' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`chip-btn ${categoria === cat.id ? 'active' : ''}`}
              onClick={() => setCategoria(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Paso 3: Estado del artículo */}
        <label className="form-label">Estado del artículo</label>
        <div className="chip-group">
          {[
            { id: 'NUEVO', label: 'Nuevo' },
            { id: 'BUEN_ESTADO', label: 'Buen estado' },
            { id: 'USADO', label: 'Usado' }
          ].map((est) => (
            <button
              key={est.id}
              type="button"
              className={`chip-btn ${estadoArticulo === est.id ? 'active' : ''}`}
              onClick={() => setEstadoArticulo(est.id)}
            >
              {est.label}
            </button>
          ))}
        </div>

        {/* Paso 4: Descripción corta */}
        <div className="form-group">
          <label className="form-label">Descripción corta</label>
          <textarea
            className="form-input"
            style={{ height: '90px', padding: '12px', resize: 'none' }}
            placeholder="Ej: 3 cuadernos de 100 hojas"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>

        {error && <p className="error-text" style={{ marginBottom: '10px' }}>{error}</p>}

        <button type="submit" className="btn-primary" disabled={subiendo}>
          {subiendo ? 'Comprimiendo y publicando...' : 'Publicar donación'}
        </button>
      </form>

      <Navbar />
    </div>
  );
}

export default CreateDonation;