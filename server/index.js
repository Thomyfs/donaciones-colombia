// Importaciones
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const pool = require('./config/db');

// Inicializar express
const app = express();

// Puerto de conección
const PORT = process.env.PORT || 4000;

// Rutas
const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use(cors()); // Inicia cors
app.use(express.json()); // Entender formato Json

// Carpeta uploads para fotos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
// ==========================================
// RUTAS BASE Y DE PRUEBA
// ==========================================

// 1. Ruta raíz
app.get('/', (req, res) => {
    res.status(200).json({
        ok: true,
        proyecto: 'Plataforma Web de Gestión de Donaciones en Colombia (MVP)',
        estado: 'API en línea. Visita /api/health para verificar la base de datos.'
    });
});

// 2. Comprobar postgress
app.get('/api/health', async (req, res) => {
    try {
        // Cuenta cuantos usuarios hay
        const result = await pool.query('SELECT COUNT(*) FROM usuarios');
        
        // Respuesta
        res.status(200).json({
            ok: true,
            mensaje: 'Servidor MVP activo y conectado a Render exitosamente',
            total_usuarios_registrados: result.rows[0].count
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar la base de datos',
            error: error.message
        });
    }
});

// INICIializar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});