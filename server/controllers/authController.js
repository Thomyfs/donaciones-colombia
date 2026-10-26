const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Formulario registro
const registrarUsuario = async (req, res) => {
    try {
        // Extraer datos
        const { nombre_completo, correo_telefono, contrasena, rol, municipio, vereda } = req.body;

        // Verificar campos
        if (!nombre_completo || !correo_telefono || !contrasena || !rol) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Todos los campos principales son obligatorios.'
            });
        }

        // Si el rol es BENEFICIARIO, validamos que haya seleccionado su ubicación (RF-02)
        if (rol === 'BENEFICIARIO' && !municipio) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Debes seleccionar tu municipio o vereda.'
            });
        }

        // Verificar que no existe duplicidad de correo o telefono
        const usuarioExistente = await pool.query(
            'SELECT * FROM usuarios WHERE correo_telefono = $1',
            [correo_telefono]
        );

        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Este correo o número de teléfono ya está registrado.'
            });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

        // Insertar usuario en la bd
        const nuevoUsuario = await pool.query(
            `INSERT INTO usuarios (nombre_completo, correo_telefono, contrasena, rol, municipio, vereda)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id_usuario, nombre_completo, correo_telefono, rol, municipio, vereda`,
            [
                nombre_completo,
                correo_telefono,
                contrasenaEncriptada,
                rol,
                rol === 'BENEFICIARIO' ? municipio : null,
                rol === 'BENEFICIARIO' ? vereda : null
            ]
        );

        // Generar token para abrir sesión
        const token = jwt.sign(
            { id_usuario: nuevoUsuario.rows[0].id_usuario, rol: nuevoUsuario.rows[0].rol },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // La sesión dura 7 días
        );

        // Respuesta
        res.status(201).json({
            ok: true,
            mensaje: 'Cuenta creada exitosamente',
            usuario: nuevoUsuario.rows[0],
            token
        });

    } catch (error) {
        console.error('Error en registrarUsuario:', error.message);
        res.status(500).json({
            ok: false,
            mensaje: 'Error interno del servidor al registrar el usuario.'
        });
    }
};

//Iniciar sesión
const iniciarSesion = async (req, res) => {
    try {
        // Extraer correo/teléfono y contraseña
        const { correo_telefono, contrasena } = req.body;

        // Buscar usuario
        const resultado = await pool.query(
            'SELECT * FROM usuarios WHERE correo_telefono = $1',
            [correo_telefono]
        );

        // Si no existe
        if (resultado.rows.length === 0) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Datos incorrectos, intenta de nuevo'
            });
        }

        const usuario = resultado.rows[0];

        // Verificar cuenta
        if (!usuario.activo) {
            return res.status(403).json({
                ok: false,
                mensaje: 'Esta cuenta se encuentra suspendida por moderación.'
            });
        }

        // Verificar contraseña
        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!contrasenaValida) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Datos incorrectos, intenta de nuevo'
            });
        }

        // Generar token
        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Mostrar datos en frontend
        res.status(200).json({
            ok: true,
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre_completo: usuario.nombre_completo,
                correo_telefono: usuario.correo_telefono,
                rol: usuario.rol,
                municipio: usuario.municipio,
                vereda: usuario.vereda
            },
            token
        });

    } catch (error) {
        console.error('Error en iniciarSesion:', error.message);
        res.status(500).json({
            ok: false,
            mensaje: 'Error interno al iniciar sesión.'
        });
    }
};

module.exports = {
    registrarUsuario,
    iniciarSesion
};