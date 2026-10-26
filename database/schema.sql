

-- 1. Tabla de Usuarios (Donantes, Beneficiarios y Admin)
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(120) NOT NULL,
    correo_telefono VARCHAR(120) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('DONANTE', 'BENEFICIARIO', 'ADMINISTRADOR')) NOT NULL,
    municipio VARCHAR(100),
    vereda VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Donaciones
CREATE TABLE IF NOT EXISTS donaciones (
    id_donacion SERIAL PRIMARY KEY,
    id_usuario_donante INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(30) CHECK (categoria IN ('ALIMENTOS', 'ROPA', 'UTILES_ESCOLARES', 'OTRO')) NOT NULL,
    estado_articulo VARCHAR(20) CHECK (estado_articulo IN ('NUEVO', 'BUEN_ESTADO', 'USADO')) NOT NULL,
    estado_donacion VARCHAR(20) CHECK (estado_donacion IN ('DISPONIBLE', 'EN_PROCESO', 'ENTREGADO', 'CANCELADO')) DEFAULT 'DISPONIBLE',
    url_foto VARCHAR(255),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
    id_solicitud SERIAL PRIMARY KEY,
    id_donacion INT NOT NULL REFERENCES donaciones(id_donacion) ON DELETE CASCADE,
    id_usuario_beneficiario INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    mensaje_justificativo TEXT NOT NULL,
    estado_solicitud VARCHAR(20) CHECK (estado_solicitud IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'FINALIZADA', 'CANCELADA')) DEFAULT 'PENDIENTE',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Mensajes del Chat Interno
CREATE TABLE IF NOT EXISTS mensajes_chat (
    id_mensaje SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL REFERENCES solicitudes(id_solicitud) ON DELETE CASCADE,
    id_usuario_remitente INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Reportes
CREATE TABLE IF NOT EXISTS reportes (
    id_reporte SERIAL PRIMARY KEY,
    id_donacion INT NOT NULL REFERENCES donaciones(id_donacion) ON DELETE CASCADE,
    id_usuario_reportante INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    motivo VARCHAR(150) NOT NULL,
    resuelto BOOLEAN DEFAULT FALSE,
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- En caso de agregar un administrador el equipo le da permisos desde la bd, no desde la página, para evitar que cualquiera se registre como administrador
--los pasos para admin, son:
-- 1. registrarse en la página (Ben o Don)
-- 2. Un mienbro del equipo de TI le otorga los permisos ejecutando:
-- UPDATE usuarios SET rol = 'ADMINISTRADOR' WHERE id_usuario = 1;