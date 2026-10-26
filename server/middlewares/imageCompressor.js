const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Guardar foto de forma temporal para luego comprimir
const almacenamientoMemoria = multer.memoryStorage();

const upload = multer({
    storage: almacenamientoMemoria,
    limits: { fileSize: 10 * 1024 * 1024 } // Permite subir fotos de celular de hasta 10 MB para luego comprimirlas
});

// Comprimir imagen
const comprimirImagen = async (req, res, next) => {
    // Si no hay foto
    if (!req.file) {
        return next();
    }

    try {
        // Generar un nombre único para el archivo basado en la fecha actual
        const nombreArchivo = `donacion_${Date.now()}.jpg`;
        const carpetaUploads = path.join(__dirname, '../uploads');

        // Crear carpeta uploads
        if (!fs.existsSync(carpetaUploads)) {
            fs.mkdirSync(carpetaUploads, { recursive: true });
        }

        const rutaDestino = path.join(carpetaUploads, nombreArchivo);

        // redimensionar imagen y nitidez
        await sharp(req.file.buffer)
            .resize({ width: 800, withoutEnlargement: true })
            .jpeg({ quality: 70, mozjpeg: true })
            .toFile(rutaDestino);

        // Guardar ruta de imagen
        req.url_foto = `/uploads/${nombreArchivo}`;
        next();
    } catch (error) {
        console.error('Error al comprimir la imagen:', error.message);
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al procesar y comprimir la fotografía.'
        });
    }
};

module.exports = { upload, comprimirImagen };