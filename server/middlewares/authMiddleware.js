// Importar librería jsonwebtoken para verificar sesión del usuario
const jwt = require('jsonwebtoken');

// Middleware que protege rutas privadas verificando el token enviado desde React
const verificarToken = (req, res, next) => {
    // Obtener el encabezado Authorization (formato: "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Si no envía token, niega el acceso con código 401 (No autorizado)
    if (!token) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Acceso denegado. Debes iniciar sesión.'
        });
    }

    try {
        // Verificar valiz del token usando clave secreta del .env
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // Guardar datos del usuario dentro de req.usuario
        req.usuario = decodificado;
        
        next();
    } catch (error) {
        return res.status(403).json({
            ok: false,
            mensaje: 'Token inválido o sesión expirada.'
        });
    }
};

module.exports = verificarToken;