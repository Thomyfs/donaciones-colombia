const pool = require('../config/db');

// Publicar donación
const crearDonacion = async (req, res) => {
    try {
        // Extraer información
        const { titulo, descripcion, categoria, estado_articulo } = req.body;
        const id_usuario_donante = req.usuario.id_usuario; // Obtenido del token JWT
        const url_foto = req.url_foto || null; // Ruta generada por el compresor de imágenes

        // Validar de campos
        if (!descripcion || !categoria || !estado_articulo) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debes seleccionar la categoría, el estado del artículo y escribir una descripción.'
            });
        }

        // Usar titulo, o descripción si no hay titulo
        const tituloFinal = titulo || descripcion.substring(0, 60);

        // Insertar en tanla
        const resultado = await pool.query(
            `INSERT INTO donaciones (id_usuario_donante, titulo, descripcion, categoria, estado_articulo, url_foto)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [id_usuario_donante, tituloFinal, descripcion, categoria, estado_articulo, url_foto]
        );

        res.status(201).json({
            ok: true,
            mensaje: 'Donación publicada exitosamente',
            donacion: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error en crearDonacion:', error.message);
        res.status(500).json({
            ok: false,
            mensaje: 'Error interno al publicar la donación.'
        });
    }
};

//listar y filtrar
const obtenerDonaciones = async (req, res) => {
    try {
        // filtros opcionales
        const { categoria, busqueda } = req.query;

        // Consulta donaciones disponibles
        let query = `
            SELECT d.*, u.nombre_completo AS nombre_donante, u.municipio, u.vereda
            FROM donaciones d
            JOIN usuarios u ON d.id_usuario_donante = u.id_usuario
            WHERE d.estado_donacion = 'DISPONIBLE'
        `;
        const valores = [];

        // Filtro por categoría
        if (categoria && categoria !== 'TODAS') {
            valores.push(categoria);
            query += ` AND d.categoria = $${valores.length}`;
        }

        // Filtro por palabra clave
        if (busqueda && busqueda.trim() !== '') {
            valores.push(`%${busqueda.trim()}%`);
            query += ` AND (d.titulo ILIKE $${valores.length} OR d.descripcion ILIKE $${valores.length})`;
        }

        // Ordenar por más reciente
        query += ' ORDER BY d.fecha_publicacion DESC';

        const resultado = await pool.query(query, valores);

        res.status(200).json({
            ok: true,
            donaciones: resultado.rows
        });
    } catch (error) {
        console.error('Error en obtenerDonaciones:', error.message);
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener el catálogo de donaciones.'
        });
    }
};

// Historial de mis donaciones
const obtenerMisDonaciones = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        // Donaciones propias y solicitudes
        const resultado = await pool.query(
            `SELECT DISTINCT d.* 
             FROM donaciones d
             LEFT JOIN solicitudes s ON d.id_donacion = s.id_donacion
             WHERE d.id_usuario_donante = $1 OR s.id_usuario_beneficiario = $1
             ORDER BY d.fecha_publicacion DESC`,
            [id_usuario]
        );

        res.status(200).json({
            ok: true,
            donaciones: resultado.rows
        });
    } catch (error) {
        console.error('Error en obtenerMisDonaciones:', error.message);
        res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar el historial de donaciones.'
        });
    }
};

module.exports = {
    crearDonacion,
    obtenerDonaciones,
    obtenerMisDonaciones
};