
const pool = require('../config/db');


// 1. OBTENER DETALLE DE DONACIÓN Y SU SOLICITUD ACTIVA
const obtenerDetalleDonacion = async (req, res) => {
    try {
        const { id_donacion } = req.params;

        // Consultar datos de donación junto con el nombre y ubicación del donante
        const donacionRes = await pool.query(
            `SELECT d.*, u.nombre_completo AS nombre_donante, u.municipio, u.vereda
             FROM donaciones d
             JOIN usuarios u ON d.id_usuario_donante = u.id_usuario
             WHERE d.id_donacion = $1`,
            [id_donacion]
        );

        if (donacionRes.rows.length === 0) {
            return res.status(404).json({ ok: false, mensaje: 'Donación no encontrada.' });
        }

        // Buscar solicitudes activas para la donación
        const solicitudRes = await pool.query(
            `SELECT s.*, u.nombre_completo AS nombre_beneficiario
             FROM solicitudes s
             JOIN usuarios u ON s.id_usuario_beneficiario = u.id_usuario
             WHERE s.id_donacion = $1 AND s.estado_solicitud NOT IN ('RECHAZADA', 'CANCELADA')
             ORDER BY s.fecha_solicitud DESC LIMIT 1`,
            [id_donacion]
        );

        res.status(200).json({
            ok: true,
            donacion: donacionRes.rows[0],
            solicitud: solicitudRes.rows[0] || null
        });
    } catch (error) {
        console.error('Error en obtenerDetalleDonacion:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener el detalle.' });
    }
};

// 2. CREAR UNA SOLICITUD
const crearSolicitud = async (req, res) => {
    try {
        const { id_donacion, mensaje_justificativo } = req.body;
        const id_usuario_beneficiario = req.usuario.id_usuario;

        if (!mensaje_justificativo || mensaje_justificativo.trim() === '') {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debes escribir un mensaje explicando por qué necesitas el recurso.'
            });
        }

        // Límite de máximo 3 solicitudes activas simultáneas
        const conteoActivas = await pool.query(
            `SELECT COUNT(*) FROM solicitudes 
             WHERE id_usuario_beneficiario = $1 AND estado_solicitud IN ('PENDIENTE', 'APROBADA')`,
            [id_usuario_beneficiario]
        );

        if (parseInt(conteoActivas.rows[0].count) >= 3) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Has alcanzado el límite máximo de 3 solicitudes activas al mismo tiempo.'
            });
        }

        // Verificar disponibilidad
        const donacionRes = await pool.query(
            'SELECT * FROM donaciones WHERE id_donacion = $1',
            [id_donacion]
        );

        if (donacionRes.rows.length === 0 || donacionRes.rows[0].estado_donacion !== 'DISPONIBLE') {
            return res.status(400).json({
                ok: false,
                mensaje: 'Este recurso ya se encuentra reservado o no está disponible.'
            });
        }

        if (donacionRes.rows[0].id_usuario_donante === id_usuario_beneficiario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No puedes solicitar una donación publicada por ti mismo.'
            });
        }

        // Insertar la solicitud en estado PENDIENTE
        const nuevaSolicitud = await pool.query(
            `INSERT INTO solicitudes (id_donacion, id_usuario_beneficiario, mensaje_justificativo, estado_solicitud)
             VALUES ($1, $2, $3, 'PENDIENTE')
             RETURNING *`,
            [id_donacion, id_usuario_beneficiario, mensaje_justificativo]
        );

        // Bloqueo temporal de la donación
        await pool.query(
            `UPDATE donaciones SET estado_donacion = 'EN_PROCESO' WHERE id_donacion = $1`,
            [id_donacion]
        );

        res.status(201).json({
            ok: true,
            mensaje: 'Solicitud enviada. El recurso ha quedado reservado.',
            solicitud: nuevaSolicitud.rows[0]
        });
    } catch (error) {
        console.error('Error en crearSolicitud:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error al procesar la solicitud.' });
    }
};

// 3. APROBAR O RECHAZAR SOLICITUD
const responderSolicitud = async (req, res) => {
    try {
        const { id_solicitud } = req.params;
        const { accion } = req.body; // 'APROBAR' o 'RECHAZAR'

        const solRes = await pool.query('SELECT * FROM solicitudes WHERE id_solicitud = $1', [id_solicitud]);
        if (solRes.rows.length === 0) {
            return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada.' });
        }

        const solicitud = solRes.rows[0];

        if (accion === 'APROBAR') {
            // Aprobada
            await pool.query(
                `UPDATE solicitudes SET estado_solicitud = 'APROBADA' WHERE id_solicitud = $1`,
                [id_solicitud]
            );
            res.status(200).json({ ok: true, mensaje: 'Solicitud aprobada. Ya pueden coordinar por chat.' });
        } else {
            // Rechazar y volver a disponible
            await pool.query(
                `UPDATE solicitudes SET estado_solicitud = 'RECHAZADA' WHERE id_solicitud = $1`,
                [id_solicitud]
            );
            await pool.query(
                `UPDATE donaciones SET estado_donacion = 'DISPONIBLE' WHERE id_donacion = $1`,
                [solicitud.id_donacion]
            );
            res.status(200).json({ ok: true, mensaje: 'Solicitud rechazada. El recurso vuelve a estar disponible.' });
        }
    } catch (error) {
        console.error('Error en responderSolicitud:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error al responder la solicitud.' });
    }
};

// 4. CONFIRMAR ENTREGA
const confirmarEntrega = async (req, res) => {
    try {
        const { id_solicitud } = req.params;

        const solRes = await pool.query('SELECT * FROM solicitudes WHERE id_solicitud = $1', [id_solicitud]);
        if (solRes.rows.length === 0) {
            return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada.' });
        }

        const solicitud = solRes.rows[0];

        // Actualizamos la solicitud a FINALIZADA y la donación a ENTREGADO
        await pool.query(
            `UPDATE solicitudes SET estado_solicitud = 'FINALIZADA' WHERE id_solicitud = $1`,
            [id_solicitud]
        );
        await pool.query(
            `UPDATE donaciones SET estado_donacion = 'ENTREGADO' WHERE id_donacion = $1`,
            [solicitud.id_donacion]
        );

        res.status(200).json({
            ok: true,
            mensaje: '¡Entrega confirmada exitosamente!'
        });
    } catch (error) {
        console.error('Error en confirmarEntrega:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error al confirmar la entrega.' });
    }
};

// 5. CANCELAR SOLICITUD
const cancelarSolicitud = async (req, res) => {
    try {
        const { id_solicitud } = req.params;

        const solRes = await pool.query('SELECT * FROM solicitudes WHERE id_solicitud = $1', [id_solicitud]);
        if (solRes.rows.length === 0) {
            return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada.' });
        }

        const solicitud = solRes.rows[0];

        // Cambiar solicitud a CANCELADA y liberar donacion
        await pool.query(
            `UPDATE solicitudes SET estado_solicitud = 'CANCELADA' WHERE id_solicitud = $1`,
            [id_solicitud]
        );
        await pool.query(
            `UPDATE donaciones SET estado_donacion = 'DISPONIBLE' WHERE id_donacion = $1`,
            [solicitud.id_donacion]
        );

        res.status(200).json({
            ok: true,
            mensaje: 'Solicitud cancelada. El recurso ha sido liberado.'
        });
    } catch (error) {
        console.error('Error en cancelarSolicitud:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error al cancelar la solicitud.' });
    }
};

module.exports = {
    obtenerDetalleDonacion,
    crearSolicitud,
    responderSolicitud,
    confirmarEntrega,
    cancelarSolicitud
};