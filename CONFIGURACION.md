# 🔧 Guía de Configuración - Variables de Entorno

## 📋 Checklist de Configuración Inicial

### 1. Backend - Archivo `.env`

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
PORT=4000
MONGO_URI=tu_string_de_conexion_mongodb_aqui
JWT_SECRET=tu_secret_key_segura_aqui
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:4000
```

### 2. Frontend - Archivo `.env` (Opcional en desarrollo)

En desarrollo, el proxy de Vite funciona automáticamente. Para producción, crea `.env` en `frontend/`:

```env
VITE_API_URL=http://localhost:4000/api
```

---

## 🔑 Datos que DEBES Reemplazar

### ✅ Backend - `.env`

| Variable | Descripción | Ejemplo | Dónde obtenerlo |
|----------|-------------|---------|-----------------|
| `MONGO_URI` | **REQUERIDO** - String de conexión a MongoDB | `mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority` | MongoDB Atlas → Connect → Connect your application |
| `JWT_SECRET` | **REQUERIDO** - Clave secreta para tokens JWT | `mi_clave_super_secreta_123456` | Generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT` | Puerto del servidor (opcional) | `4000` | Por defecto es 4000 |
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:5173` | Tu URL de Vercel en producción |
| `BACKEND_URL` | URL del backend (opcional) | `http://localhost:4000` | Tu URL de Render en producción |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de MercadoPago (opcional) | `APP_USR-...` | Panel de MercadoPago Developers |

---

## 📝 Pasos Detallados

### Paso 1: MongoDB Atlas

1. **Crear cuenta**: Ve a https://www.mongodb.com/cloud/atlas
2. **Crear un cluster** (el gratuito funciona bien)
3. **Configurar acceso**:
   - En "Database Access", crea un usuario y contraseña
   - En "Network Access", añade `0.0.0.0/0` para permitir conexiones desde cualquier IP (o tu IP específica)
4. **Obtener connection string**:
   - Click en "Connect" → "Connect your application"
   - Copia el string que aparece
   - Reemplaza `<password>` con tu contraseña real
   - Reemplaza `<dbname>` con el nombre de tu base de datos (ej: `nutrite_db`)

**Ejemplo de MONGO_URI:**
```
mongodb+srv://usuario:miPassword123@cluster0.xxxxx.mongodb.net/nutrite_db?retryWrites=true&w=majority
```

### Paso 2: JWT_SECRET

**Opción 1 - Generar automáticamente:**
```bash
cd backend
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Opción 2 - Crear manualmente:**
Crea una cadena aleatoria de al menos 32 caracteres. Por ejemplo:
```
mi_clave_secreta_super_segura_para_jwt_2024_abc123xyz
```

⚠️ **IMPORTANTE**: En producción, usa una clave MUY segura y diferente.

### Paso 3: Crear archivo `.env`

1. Ve a la carpeta `backend/`
2. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
3. Abre `.env` con un editor de texto
4. Reemplaza TODOS los valores con tus datos reales:
   - `MONGO_URI` ← Tu string de MongoDB
   - `JWT_SECRET` ← Tu clave secreta generada
   - `FRONTEND_URL` ← Para desarrollo: `http://localhost:5173`
   - `BACKEND_URL` ← Para desarrollo: `http://localhost:4000`

### Paso 4: Verificar que Funciona

1. **Inicia el backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Verifica los mensajes**:
   - ✅ Debería decir: "✅ MongoDB conectado correctamente"
   - ✅ Debería decir: "El servidor está funcionando en el puerto 4000"
   - ❌ Si ves errores sobre variables faltantes, revisa tu `.env`

3. **Prueba registrar un usuario** en el frontend

---

## 🚀 Para Producción

### Backend en Render

Cuando despliegues en Render, añade estas variables de entorno en el dashboard:
- `MONGO_URI` ← Tu string de MongoDB Atlas (el mismo)
- `JWT_SECRET` ← Tu clave secreta (usa una DIFERENTE en producción)
- `FRONTEND_URL` ← `https://tu-app.vercel.app`
- `BACKEND_URL` ← `https://tu-api.onrender.com`
- `PORT` ← Render lo asigna automáticamente (no es necesario)

### Frontend en Vercel

Cuando despliegues en Vercel, añade esta variable de entorno:
- `VITE_API_URL` ← `https://tu-api.onrender.com/api`

---

## ⚠️ Errores Comunes

### "MONGO_URI no está definida"
- ✅ Verifica que el archivo `.env` existe en `backend/`
- ✅ Verifica que `MONGO_URI` está escrita correctamente (sin espacios)
- ✅ Reinicia el servidor después de crear/modificar `.env`

### "JWT_SECRET no está configurado"
- ✅ Verifica que `JWT_SECRET` está en tu `.env`
- ✅ Verifica que no tiene espacios o comillas innecesarias
- ✅ Reinicia el servidor

### "Cannot connect to MongoDB"
- ✅ Verifica que tu `MONGO_URI` es correcta
- ✅ Verifica que reemplazaste `<password>` y `<dbname>` en el string
- ✅ Verifica que MongoDB Atlas permite conexiones desde tu IP (`0.0.0.0/0`)

### "500 Internal Server Error" al registrar
- ✅ Verifica que MongoDB está conectado (mira los logs del backend)
- ✅ Verifica que `JWT_SECRET` está configurado
- ✅ Verifica la consola del backend para ver el error específico

---

## 📌 Resumen - Qué Reemplazar

1. **Backend `.env`**:
   - ⚠️ `MONGO_URI` ← **OBLIGATORIO** - Tu connection string de MongoDB
   - ⚠️ `JWT_SECRET` ← **OBLIGATORIO** - Genera una clave segura
   - `FRONTEND_URL` ← `http://localhost:5173` (o tu dominio en producción)
   - `BACKEND_URL` ← `http://localhost:4000` (o tu dominio en producción)

2. **Frontend `.env`** (solo para producción):
   - `VITE_API_URL` ← URL completa del backend con `/api`

¡Eso es todo! Una vez configurado, tu aplicación debería funcionar correctamente.

