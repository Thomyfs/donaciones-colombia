# Documentación técnica Plataforma Web para la Gestión de Donación de Recursos en Municipios y Veredas de Colombia

El objetivo del presente documento es describir la arquitectura utilizada para el desarrollo del MVP del proyecto de la plataforma. El sistema se desarrollo de forma óptima con el objetivo de que consuma la menor cantidad de recursos posibles, teniendo en cuenta el limitado acceso a tecnologías e internet avanzado que existen en algunas veredas y municipios del país. Además la interfaz de desarrollo para dispositivos móviles de gama baja aunque puede también usarse desde un computador con total normalidad.

# Arquitectura

Para el desarrollo de este sistema se utilizó una arquitectura cliente-servidor, lo que permite separar la interfaz o vistas de la lógica de negocios y la persistencia de datos.

[ Cliente / Frontend (React 18 + Vite) ]
             │
             │  (Peticiones HTTP REST con Tokens JWT Bearer)
             ▼
[ Servidor / Backend (Node.js + Express.js) ]
             │
             │  (Consultas SQL con Pool de Conexiones asíncrono)
             ▼
[ Base de Datos (PostgreSQL en Render con SSL) ]
-------------------------------------------------------------------------------------------
Dentro de server y client nos encontramos con una arquitectura por capas
[ client/ ]
    |
    |-- components (Ruta de navegación (inicio, donar, mis donaciones, perfil))
    |
    |-- pages (Vista de cada pantalla de la página)
    |
    |-- services (conecta al backend)
[ server/ ]
    |
    |-- config (Conecta backend con la base de datos)
    |
    |-- controllers (Métodos y funciones)
    |
    |-- middlewares
    |
    |--routes (rutas)

* Capa de Cliente (Frontend): Desarrollada como una Single Page Application (SPA) optimizada para navegadores móviles y de escritorio. Se comunica con el backend mediante peticiones asíncronas con Axios.

* Capa de Servidor (Backend): Construida sobre Node.js y Express.js bajo un modelo asíncrono que facilita el manejo de múltiples conexiones concurrentes. Implementa un patrón modular organizado en rutas, controladores y middlewares de seguridad.

* Capa de Persistencia (Base de Datos): Gestionada en PostgreSQL, asegurando integridad referencial estricta mediante restricciones de clave foránea, borrado en cascada y transacciones seguras.

Para el despliegue de la aplicación se utilizó render y vercel, en render se almacenó la base de datos en PostgresSQL y el backend, mientras que en vercel se almacenó el frontend de la aplicación.

# Tecnologías
* Frontend:

React 18 + Vite: El framework para construir interfaces de usuario modulares, además de usar vite para reducir el tamaño de carga de la página.

React Router DOM: Manejo de enrutamiento del lado del cliente.

Axios: Cliente HTTP

Lucide React: Biblioteca de iconos vectoriales ligeros

CSS3 Puro: Implementación de colores y fondos

* Backend (Lógica y API)

Node.js + Express.js: Entorno de ejecución y framework minimalista para la creación de endpoints RESTful.

pg (node-postgres): Driver oficial para la conexión asíncrona mediante un Pool hacia la base de datos PostgreSQL.

Bcryptjs: Librería de criptografía utilizada para aplicar un hash seguro a las contraseñas de los usuarios antes de su almacenamiento.

JsonWebToken (JWT): Estándar RFC 7519 para la emisión de tokens de acceso firmados digitalmente.

Multer + Sharp: Middleware para la interceptación de archivos y motor de procesamiento de imágenes para la compresión automática en tiempo de ejecución.

Cors & Dotenv: Configuración de políticas de intercambio de recursos de origen cruzado y gestión de variables de entorno

* Base de Datos e Infraestructura

PostgreSQL: Sistema de Gestión de Bases de Datos Relacional.

Vercel: Plataforma de despliegue global en el borde.

Render: Plataforma de orquestación en la nube para el despliegue del servidor Node.js y la base de datos PostgreSQL.

GitHub: Control de versiones y fuente de verdad para el despliegue continuo (CI/CD).

# Detalles de Implementación

* Optimización de Imágenes y Bajo Consumo

Para mitigar el consumo de datos de las familias en zonas rurales, el backend implementa un pipeline de compresión usando la librería sharp. Cuando un usuario sube una foto desde su celular:

multer captura la imagen en memoria RAM temporal.

sharp la redimensiona a un ancho máximo de 800px.

Se recodifica a formato JPEG con una calidad del 70%, forzando su peso a ≤ 300 KB.

Solo después de la compresión, el archivo se guarda en el disco del servidor (/uploads).

* Privacidad

El sistema no recopila direcciones exactas ni coordenadas GPS. En la etapa de registro, el usuario selecciona una ubicación genérica (Municipio - Vereda). Al momento de acordar una entrega, el sistema sugiere un directorio de Puntos de Entrega Neutrales (parques, juntas de acción comunal, parroquias) para garantizar transacciones seguras sin revelar la dirección domiciliaria del beneficiario o donante.

* Prevención de Duplicidad

Para evitar que un recurso sea prometido a múltiples familias, el controlador requestController.js implementa un bloqueo de estado. Al crear una solicitud, la donación pasa inmediatamente del estado DISPONIBLE a EN_PROCESO.
Adicionalmente, se valida mediante SQL que el beneficiario no posea más de 3 solicitudes en estado PENDIENTE o APROBADA simultáneamente, promoviendo una distribución equitativa de los recursos en la comunidad.

* Diseño Centrado en Móviles

Toda la UI está encapsulada en la clase .app-container, la cual simula un viewport de 360 x 800 px. Se ha utilizado la tipografía DM Sans y se garantiza un alto contraste utilizando un verde azulado sobre fondos claros, con elementos interactivos táctiles.