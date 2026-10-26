const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');

const {
    reportarPublicacion,
    obtenerPanelAdmin,
    moderarPublicacion,
    cambiarEstadoUsuario
} = require('../controllers/adminController');

// Crear un reporte
router.post('/reportar', verificarToken, reportarPublicacion);

// Obtener contadores y lista de publicaciones reportadas
router.get('/dashboard', verificarToken, obtenerPanelAdmin);

// Mantener o dar de baja una publicación
router.put('/publicacion/:id_donacion', verificarToken, moderarPublicacion);

// Suspender o reactivar cuenta de usuario
router.put('/usuario/:id_usuario', verificarToken, cambiarEstadoUsuario);

module.exports = router;