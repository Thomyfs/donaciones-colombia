import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import api from '../services/api';

function Chat() {
  const { id_solicitud } = useParams();
  const navigate = useNavigate();
  const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');

  // Efecto para cargar los mensajes inicialmente y consultar cada 4 segundos
  useEffect(() => {
    const obtenerHistorialChat = async () => {
      try {
        const res = await api.get(`/requests/${id_solicitud}/chat`);
        setMensajes(res.data.mensajes);
      } catch (error) {
        console.error('Error al cargar el chat:', error);
      }
    };

    obtenerHistorialChat();
    const intervalo = setInterval(obtenerHistorialChat, 4000);
    return () => clearInterval(intervalo);
  }, [id_solicitud]);

  // Enviar mensaje de texto ligero (sin archivos pesados según RF-07)
  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;

    try {
      await api.post(`/requests/${id_solicitud}/chat`, { mensaje: texto });
      setTexto('');
      // Recargamos la lista inmediatamente tras enviar
      const res = await api.get(`/requests/${id_solicitud}/chat`);
      setMensajes(res.data.mensajes);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '16px' }}>
      {/* Barra superior del chat (Figura 8 izquierda) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        paddingBottom: '14px',
        borderBottom: '1px solid #E0E0E0',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: '700' }}>Chat con el donante</h1>
      </div>

      {/* Contenedor de burbujas de mensajes */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {mensajes.length === 0 ? (
          <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginTop: '30px' }}>
            Acuerda por aquí el punto de encuentro y la hora para la entrega.
          </p>
        ) : (
          mensajes.map((msg) => {
            const esMio = msg.id_usuario_remitente === usuarioActual.id_usuario;
            return (
              <div
                key={msg.id_mensaje}
                style={{
                  alignSelf: esMio ? 'flex-end' : 'flex-start',
                  backgroundColor: esMio ? 'var(--color-primario)' : 'var(--color-primario-claro)',
                  color: esMio ? '#FFFFFF' : 'var(--color-texto)',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  maxWidth: '78%',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}
              >
                {msg.mensaje}
              </div>
            );
          })
        )}
      </div>

      {/* Barra inferior para escribir mensaje (Figura 8 izquierda) */}
      <form
        onSubmit={manejarEnvio}
        style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}
      >
        <input
          type="text"
          className="form-input"
          style={{ flex: 1, borderRadius: '24px' }}
          placeholder="Escribe un mensaje"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button
          type="submit"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primario)',
            color: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
}

export default Chat;