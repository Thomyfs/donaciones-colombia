const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');

const {
    obtenerDetalleDonacion,
    crearSolicitud,
    responderSolicitud,
    confirmarEntrega,
    cancelarSolicitud
} = require('../controllers/requestController');

const {
    obtenerMensajes,
    enviarMensaje
} = require('../controllers/chatController');

// Detalle de una donación y su estado de seguimiento
router.get('/donacion/:id_donacion', verificarToken, obtenerDetalleDonacion);

// Crear solicitud
router.post('/', verificarToken, crearSolicitud);

// Aprobar o rechazar solicitud
router.put('/:id_solicitud/responder', verificarToken, responderSolicitud);

// Confirmar entrega
router.put('/:id_solicitud/confirmar', verificarToken, confirmarEntrega);

// Cancelar solicitud
router.put('/:id_solicitud/cancelar', verificarToken, cancelarSolicitud);

// Rutas del Chat Interno por solicitud
router.get('/:id_solicitud/chat', verificarToken, obtenerMensajes);
router.post('/:id_solicitud/chat', verificarToken, enviarMensaje);

module.exports = router;