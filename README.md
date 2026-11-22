# API REST Biblioteca
 
API REST para gestionar una biblioteca de libros, con registro y login de usuarios.
Hecha con Node.js, TypeScript, Express, MongoDB Atlas (Mongoose), Bcrypt y JWT.
 
## Estructura
 
```
src/
├── config/            # variables de entorno y conexión a la base
├── middlewares/       # autenticación JWT, roles y logging
├── utils/             # AppError, manejo de errores, helpers
├── components/
│   ├── user/          # modelo, repositorio, servicio, controlador y rutas de auth
│   └── book/          # modelo, repositorio, servicio, controlador y rutas de libros
├── app.ts
└── server.ts
```
 
Arquitectura en capas: **rutas → controlador → servicio → repositorio (acceso a datos)**.
 
## Instalación y ejecución
 
1. Clonar el repositorio e instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` a `.env` y completar los valores:
   ```
   MONGO_URI=<cadena de conexión de MongoDB Atlas>
   JWT_SECRET=<una clave secreta larga>
   PORT=3000
   ```
3. Ejecutar en desarrollo:
   ```bash
   npm run dev
   ```
4. O compilar y ejecutar en producción:
   ```bash
   npm run build
   npm start
   ```
 
## Endpoints
 
Base URL: `http://localhost:3000`
 
### Autenticación
 
| Método | Ruta | Protegida | Descripción |
|--------|------|-----------|-------------|
| POST | `/api/auth/register` | No | Registra un usuario (`name`, `email`, `password`) |
| POST | `/api/auth/login` | No | Devuelve un JWT (`email`, `password`) |
 
### Libros
 
| Método | Ruta | Protegida | Descripción |
|--------|------|-----------|-------------|
| GET | `/api/books` | No | Lista todos los libros. Filtros: `?genre=`, `?author=`, `?available=true\|false` |
| GET | `/api/books/:id` | No | Obtiene un libro por id |
| POST | `/api/books` | JWT | Crea un libro |
| PUT | `/api/books/:id` | JWT (creador o admin) | Modifica un libro |
| DELETE | `/api/books/:id` | JWT (solo admin) | Elimina un libro |
 
Las rutas protegidas requieren el header `Authorization: Bearer <token>`.
 
Body de ejemplo para crear/modificar un libro:
```json
{
  "title": "El Aleph",
  "author": "Jorge Luis Borges",
  "year": 1949,
  "genre": "Cuento",
  "available": true
}
```
 
### Códigos de estado
 
| Código | Cuándo |
|--------|--------|
| 200 | Consulta, modificación o eliminación correcta, login correcto |
| 201 | Recurso creado (registro, nuevo libro) |
| 400 | Datos inválidos, id mal formado, filtro inválido, duplicados |
| 401 | Token ausente/inválido o credenciales incorrectas |
| 403 | Sin permisos (eliminar sin ser admin, modificar un libro ajeno) |
| 404 | Libro o ruta inexistente |
| 500 | Error interno del servidor |
 
## Validaciones de negocio (capa de servicio)
 
- Título, autor y género obligatorios y no vacíos.
- El año debe ser un entero entre 1 y el año actual.
- `available` debe ser booleano.
- No puede haber dos libros con el mismo título y autor.
- Contraseña de al menos 6 caracteres y email válido y único.
 
## Extras implementados
 
- **Filtros** con `req.query` en `GET /api/books`.
- **Roles**: solo un usuario `admin` puede eliminar libros.
- **Relación entre modelos**: cada libro guarda el usuario que lo creó (`createdBy`); solo ese usuario o un admin puede modificarlo.
- **Logging**: middleware que imprime método y URL de cada petición.
 
## Cómo crear un usuario admin
 
El registro siempre crea usuarios con rol `user` (por seguridad, el rol no se puede elegir desde la API).
Para tener un admin: registrar el usuario, entrar a MongoDB Atlas → colección `users` y cambiar el campo `role` a `"admin"`. Después hacer login de nuevo para obtener un token con el rol actualizado.
 
## Pruebas en Thunder Client
 
Casos a probar (exportar la colección o sacar captura de cada uno):
 
| # | Petición | Resultado esperado |
|---|----------|--------------------|
| 1 | POST `/api/auth/register` con datos válidos | 201 |
| 2 | POST `/api/auth/register` con email repetido o password corta | 400 |
| 3 | POST `/api/auth/login` correcto | 200 + token |
| 4 | POST `/api/auth/login` con password incorrecta | 401 |
| 5 | GET `/api/books` | 200 |
| 6 | GET `/api/books?genre=Cuento&available=true` | 200 (filtrado) |
| 7 | GET `/api/books/:id` existente | 200 |
| 8 | GET `/api/books/000000000000000000000000` | 404 |
| 9 | GET `/api/books/abc` | 400 |
| 10 | POST `/api/books` con token y datos válidos | 201 |
| 11 | POST `/api/books` con año inválido (ej. 3000) | 400 |
| 12 | POST `/api/books` sin token | 401 |
| 13 | PUT `/api/books/:id` con token del creador | 200 |
| 14 | PUT `/api/books/:id` con token de otro usuario (no admin) | 403 |
| 15 | PUT `/api/books/<id inexistente>` con token | 404 |
| 16 | DELETE `/api/books/:id` con token de usuario común | 403 |
| 17 | DELETE `/api/books/:id` sin token | 401 |
| 18 | DELETE `/api/books/:id` con token de admin | 200 |
| 19 | DELETE `/api/books/<id ya borrado>` con token de admin | 404 |
| 20 | Detener la conexión a la base y hacer cualquier petición | 500 |