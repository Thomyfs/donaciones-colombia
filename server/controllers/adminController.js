// Importamos la conexión a PostgreSQL en Render
const pool = require('../config/db');


// 1. CREAR UN REPORTE SOBRE UNA PUBLICACIÓN
const reportarPublicacion = async (req, res) => {
    try {
        const { id_donacion, motivo } = req.body;
        const id_usuario_reportante = req.usuario.id_usuario;

        if (!id_donacion || !motivo) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debes indicar el motivo del reporte.'
            });
        }

        //Insertar reporte
        await pool.query(
            `INSERT INTO reportes (id_donacion, id_usuario_reportante, motivo)
             VALUES ($1, $2, $3)`,
            [id_donacion, id_usuario_reportante, motivo]
        );

        res.status(201).json({
            ok: true,
            mensaje: 'Publicación reportada. El administrador la revisará.'
        });
    } catch (error) {
        console.error('Error en reportarPublicacion:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error al enviar el reporte.' });
    }
};

// 2. OBTENER INDICADORES Y PUBLICACIONES REPORTADAS
const obtenerPanelAdmin = async (req, res) => {
    try {
        // 1. Conteo de entregas exitosas
        const entregasRes = await pool.query(
            "SELECT COUNT(*) FROM donaciones WHERE estado_donacion = 'ENTREGADO'"
        );

        // 2. Conteo de familias beneficiarias únicas que han recibido una donación
        const familiasRes = await pool.query(
            "SELECT COUNT(DISTINCT id_usuario_beneficiario) FROM solicitudes WHERE estado_solicitud = 'FINALIZADA'"
        );

        // 3. Conteo de reportes pendientes sin resolver
        const pendientesRes = await pool.query(
            "SELECT COUNT(*) FROM reportes WHERE resuelto = FALSE"
        );

        // 4. Lista agrupada de publicaciones reportadas
        const reportadasRes = await pool.query(
            `SELECT 
                d.id_donacion,
                d.titulo,
                d.url_foto,
                d.id_usuario_donante,
                u.nombre_completo AS nombre_donante,
                COUNT(r.id_reporte) AS total_reportes,
                MAX(r.motivo) AS ultimo_motivo
             FROM reportes r
             JOIN donaciones d ON r.id_donacion = d.id_donacion
             JOIN usuarios u ON d.id_usuario_donante = u.id_usuario
             WHERE r.resuelto = FALSE
             GROUP BY d.id_donacion, u.nombre_completo
             ORDER BY total_reportes DESC`
        );

        // 5. Lista general de usuarios
        const usuariosRes = await pool.query(
            `SELECT id_usuario, nombre_completo, correo_telefono, rol, municipio, activo 
             FROM usuarios ORDER BY id_usuario DESC`
        );

        res.status(200).json({
            ok: true,
            indicadores: {
                entregas_exitosas: parseInt(entregasRes.rows[0].count),
                familias_impactadas: parseInt(familiasRes.rows[0].count),
                reportes_pendientes: parseInt(pendientesRes.rows[0].count)
            },
            publicaciones_reportadas: reportadasRes.rows,
            usuarios: usuariosRes.rows
        });
    } catch (error) {
        console.error('Error en obtenerPanelAdmin:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error al cargar el panel de administración.' });
    }
};

// 3. MODERAR PUBLICACIÓN
const moderarPublicacion = async (req, res) => {
    try {
        const { id_donacion } = req.params;
        const { decision } = req.body; // 'MANTENER' o 'DAR_DE_BAJA'

        if (decision === 'MANTENER') {
            // Marcar los reportes de esta donación como resueltos y conservar publicación
            await pool.query(
                'UPDATE reportes SET resuelto = TRUE WHERE id_donacion = $1',
                [id_donacion]
            );
            return res.status(200).json({
                ok: true,
                mensaje: 'Publicación mantenida y reportes descartados.'
            });
        }

        if (decision === 'DAR_DE_BAJA') {
            // Eliminar publicación inapropiada o engañosa
            await pool.query('DELETE FROM donaciones WHERE id_donacion = $1', [id_donacion]);
            return res.status(200).json({
                ok: true,
                mensaje: 'Publicación dada de baja exitosamente.'
            });
        }

        res.status(400).json({ ok: false, mensaje: 'Decisión de moderación no válida.' });
    } catch (error) {
        console.error('Error en moderarPublicacion:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error al moderar la publicación.' });
    }
};

// 4. SUSPENDER O REACTIVAR UN USUARIO
const cambiarEstadoUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const { activo } = req.body; // false para suspender, true para reactivar

        // Desactivar al usuario en la tabla
        await pool.query(
            'UPDATE usuarios SET activo = $1 WHERE id_usuario = $2',
            [activo, id_usuario]
        );

        // Dar de baja publicaciones del usuario suspendido
        if (!activo) {
            await pool.query(
                'UPDATE reportes SET resuelto = TRUE WHERE id_donacion IN (SELECT id_donacion FROM donaciones WHERE id_usuario_donante = $1)',
                [id_usuario]
            );
        }

        res.status(200).json({
            ok: true,
            mensaje: activo ? 'Usuario reactivado.' : 'Usuario suspendido por moderación.'
        });
    } catch (error) {
        console.error('Error en cambiarEstadoUsuario:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error al cambiar el estado del usuario.' });
    }
};

module.exports = {
    reportarPublicacion,
    obtenerPanelAdmin,
    moderarPublicacion,
    cambiarEstadoUsuario
};