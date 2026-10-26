const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const { upload, comprimirImagen } = require('../middlewares/imageCompressor');
const {
    crearDonacion,
    obtenerDonaciones,
    obtenerMisDonaciones
} = require('../controllers/donationController');

// Catalogo
router.get('/', verificarToken, obtenerDonaciones);

// Historial donaciones
router.get('/mis-donaciones', verificarToken, obtenerMisDonaciones);

// nueva donación
router.post('/', verificarToken, upload.single('foto'), comprimirImagen, crearDonacion);

module.exports = router;