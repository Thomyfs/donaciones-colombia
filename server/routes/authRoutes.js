const express = require('express');
const router = express.Router();

// Importar funciones
const { registrarUsuario, iniciarSesion } = require('../controllers/authController');

// Ruta POST para registro (/api/auth/register)
router.post('/register', registrarUsuario);

// Ruta POST para iniciar sesión (/api/auth/login)
router.post('/login', iniciarSesion);

module.exports = router;