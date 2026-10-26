const pool = require('../config/db');

// 1. OBTENER MENSAJES
const obtenerMensajes = async (req, res) => {
    try {
        const { id_solicitud } = req.params;

        const resultado = await pool.query(
            `SELECT m.*, u.nombre_completo AS remitente
             FROM mensajes_chat m
             JOIN usuarios u ON m.id_usuario_remitente = u.id_usuario
             WHERE m.id_solicitud = $1
             ORDER BY m.fecha_envio ASC`,
            [id_solicitud]
        );

        res.status(200).json({
            ok: true,
            mensajes: resultado.rows
        });
    } catch (error) {
        console.error('Error en obtenerMensajes:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error al cargar los mensajes del chat.' });
    }
};

// 2. ENVIAR UN MENSAJE
const enviarMensaje = async (req, res) => {
    try {
        const { id_solicitud } = req.params;
        const { mensaje } = req.body;
        const id_usuario_remitente = req.usuario.id_usuario;

        if (!mensaje || mensaje.trim() === '') {
            return res.status(400).json({ ok: false, mensaje: 'El mensaje no puede estar vacío.' });
        }

        const nuevoMensaje = await pool.query(
            `INSERT INTO mensajes_chat (id_solicitud, id_usuario_remitente, mensaje)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [id_solicitud, id_usuario_remitente, mensaje.trim()]
        );

        res.status(201).json({
            ok: true,
            mensaje: nuevoMensaje.rows[0]
        });
    } catch (error) {
        console.error('Error en enviarMensaje:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error al enviar el mensaje.' });
    }
};

module.exports = {
    obtenerMensajes,
    enviarMensaje
};