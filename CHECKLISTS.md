# Checklists de Implementación y Despliegue

## 📋 Checklist: Implementación de MercadoPago

### Pre-requisitos
- [ ] Crear cuenta en MercadoPago Developers (https://www.mercadopago.com.ar/developers)
- [ ] Crear una aplicación en MercadoPago y obtener tus credenciales
- [ ] Obtener tu `ACCESS_TOKEN` (token de acceso para hacer operaciones desde el servidor)
- [ ] Decidir si usar modo producción o modo sandbox (recomendado empezar con sandbox)

### Backend - Instalación y Configuración

- [ ] Instalar el SDK de MercadoPago:
  ```bash
  cd backend
  npm install mercadopago
  ```

- [ ] Añadir variables de entorno al archivo `.env`:
  ```env
  MERCADOPAGO_ACCESS_TOKEN=tu_access_token_aqui
  FRONTEND_URL=http://localhost:5173
  BACKEND_URL=http://localhost:4000
  ```

- [ ] Actualizar `backend/features/orders/order.controller.js`:
  - [ ] Importar el SDK de MercadoPago
  - [ ] Configurar el cliente de MercadoPago con el ACCESS_TOKEN
  - [ ] Reemplazar el código placeholder en `createMercadoPagoPreference`
  - [ ] Implementar la creación de la preferencia con:
    - Items (productos de la orden)
    - Back URLs (success, failure, pending)
    - External reference (ID de la orden)
    - Notification URL (webhook)

### Backend - Webhook de MercadoPago

- [ ] Crear endpoint para recibir notificaciones de MercadoPago:
  - [ ] Archivo: `backend/features/orders/mercadopago.controller.js`
  - [ ] Función para manejar webhooks
  - [ ] Validar que la notificación viene de MercadoPago
  - [ ] Actualizar el estado de la orden cuando se confirme el pago

- [ ] Añadir ruta en `backend/features/orders/order.routes.js`:
  ```javascript
  router.post('/mercadopago/webhook', handleMercadoPagoWebhook);
  ```

### Modelo de Orden - Actualización

- [ ] Actualizar `backend/features/orders/order.model.js`:
  - [ ] Añadir campo `paymentResult` para guardar datos de MercadoPago:
    ```javascript
    paymentResult: {
      id: String,
      status: String,
      payment_method_id: String,
      transaction_amount: Number,
      // otros campos que necesites
    }
    ```

### Frontend - Integración

- [ ] Actualizar `frontend/src/pages/CheckoutPage.jsx`:
  - [ ] Después de crear la orden, verificar si el método de pago es MercadoPago
  - [ ] Si es MercadoPago, llamar a `createMercadoPagoPreference(orderId)`
  - [ ] Obtener el `init_point` de la respuesta
  - [ ] Redirigir al usuario a `init_point` usando `window.location.href`

- [ ] Actualizar `frontend/src/pages/OrderDetailPage.jsx`:
  - [ ] Verificar parámetros de URL (`?status=success/failure/pending`)
  - [ ] Mostrar mensaje apropiado según el estado del pago
  - [ ] Si viene de MercadoPago exitosamente, opcionalmente refrescar los datos de la orden

### Testing

- [ ] Probar el flujo completo en modo sandbox:
  - [ ] Crear orden con MercadoPago
  - [ ] Ser redirigido a MercadoPago
  - [ ] Completar pago en modo sandbox
  - [ ] Verificar redirección de vuelta a la aplicación
  - [ ] Verificar que la orden se actualizó como pagada

- [ ] Probar webhooks:
  - [ ] Usar herramienta de testing de MercadoPago (o ngrok para desarrollo local)
  - [ ] Verificar que las notificaciones se reciben correctamente
  - [ ] Verificar que las órdenes se actualizan automáticamente

### Producción

- [ ] Cambiar a ACCESS_TOKEN de producción
- [ ] Actualizar URLs en variables de entorno (FRONTEND_URL y BACKEND_URL)
- [ ] Configurar webhook en el panel de MercadoPago con la URL de producción
- [ ] Probar el flujo completo en producción con montos pequeños
- [ ] Configurar manejo de errores y logs

---

## 🚀 Checklist: Desplegar Backend en Render

### Pre-requisitos
- [ ] Crear cuenta en Render (https://render.com)
- [ ] Tener tu código en un repositorio Git (GitHub, GitLab, o Bitbucket)
- [ ] Tener MongoDB Atlas configurado o una base de datos MongoDB disponible

### Preparación del Proyecto

- [ ] Verificar que `backend/package.json` tiene:
  - [ ] Script `"start"` configurado (ej: `"start": "node server.js"`)
  - [ ] Todas las dependencias listadas correctamente

- [ ] Crear archivo `backend/.env.example` con todas las variables necesarias:
  ```env
  PORT=4000
  MONGO_URI=tu_mongodb_uri
  JWT_SECRET=tu_jwt_secret
  MERCADOPAGO_ACCESS_TOKEN=tu_token
  FRONTEND_URL=https://tu-frontend.vercel.app
  BACKEND_URL=https://tu-backend.onrender.com
  ```

### Configuración en Render

- [ ] En el dashboard de Render, crear un nuevo "Web Service"
- [ ] Conectar tu repositorio Git
- [ ] Configurar:
  - [ ] **Name**: nombre del servicio (ej: `nutrite-api`)
  - [ ] **Environment**: `Node`
  - [ ] **Build Command**: `cd backend && npm install`
  - [ ] **Start Command**: `cd backend && npm start`
  - [ ] **Root Directory**: `backend` (si tu repo tiene frontend y backend)

### Variables de Entorno en Render

- [ ] En la sección "Environment" del servicio, añadir todas las variables:
  - [ ] `PORT` (Render puede asignarlo automáticamente, pero puedes usar `process.env.PORT || 4000`)
  - [ ] `MONGO_URI` (tu string de conexión de MongoDB Atlas)
  - [ ] `JWT_SECRET` (una cadena secreta fuerte)
  - [ ] `MERCADOPAGO_ACCESS_TOKEN` (tu token de MercadoPago)
  - [ ] `FRONTEND_URL` (URL de tu frontend en Vercel)
  - [ ] `BACKEND_URL` (URL que Render te asignará, ej: `https://tu-api.onrender.com`)

### CORS y Configuración del Servidor

- [ ] Verificar que `backend/server.js` permite CORS desde tu dominio frontend:
  ```javascript
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));
  ```

- [ ] Asegurar que el servidor escucha en el puerto correcto:
  ```javascript
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor en puerto ${PORT}`);
  });
  ```

### Despliegue

- [ ] Guardar configuración y esperar a que Render despliegue
- [ ] Verificar logs en Render para asegurar que no hay errores
- [ ] Probar el endpoint de health check si tienes uno: `https://tu-api.onrender.com/api/products`
- [ ] Copiar la URL del backend (ej: `https://tu-api.onrender.com`)

### Notas Importantes

- ⚠️ Render pone los servicios gratuitos a "dormir" después de 15 minutos de inactividad
- ⚠️ El primer request después de dormir puede tardar hasta 50 segundos
- 💡 Considera usar un plan pago si necesitas que el servicio esté siempre activo
- 💡 Puedes configurar un "Health Check" para mantener el servicio activo

---

## 🌐 Checklist: Desplegar Frontend en Vercel

### Pre-requisitos
- [ ] Crear cuenta en Vercel (https://vercel.com)
- [ ] Tener tu código frontend en un repositorio Git
- [ ] Tener el backend desplegado y funcionando

### Preparación del Proyecto

- [ ] Verificar que `frontend/package.json` tiene scripts correctos:
  - [ ] `"build"`: comando para construir la app (ej: `"build": "vite build"`)
  - [ ] `"dev"`: comando de desarrollo

- [ ] Verificar que existe archivo `frontend/vite.config.js` o similar con configuración correcta

- [ ] Crear archivo `frontend/.env.example`:
  ```env
  VITE_API_URL=http://localhost:4000/api
  ```

### Variables de Entorno en Vercel

- [ ] En Vercel, ir a tu proyecto → Settings → Environment Variables
- [ ] Añadir variable de entorno:
  - [ ] `VITE_API_URL`: URL de tu backend en Render (ej: `https://tu-api.onrender.com/api`)

### Configuración de Axios

- [ ] Verificar que `frontend/src/api/axios.js` usa la variable de entorno:
  ```javascript
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  ```

### Despliegue en Vercel

- [ ] En Vercel, crear nuevo proyecto
- [ ] Importar tu repositorio Git
- [ ] Configurar:
  - [ ] **Framework Preset**: Vite (o el que uses)
  - [ ] **Root Directory**: `frontend` (si tu repo tiene frontend y backend)
  - [ ] **Build Command**: `npm run build`
  - [ ] **Output Directory**: `dist` (para Vite) o el que corresponda
  - [ ] **Install Command**: `npm install`

### Despliegue

- [ ] Hacer clic en "Deploy"
- [ ] Esperar a que Vercel construya y despliegue
- [ ] Verificar que el build fue exitoso
- [ ] Copiar la URL que Vercel te asignó (ej: `https://tu-app.vercel.app`)

### Actualizar URLs

- [ ] Actualizar `FRONTEND_URL` en las variables de entorno del backend (Render)
- [ ] Actualizar `VITE_API_URL` en Vercel con la URL final del backend

### Configuración Adicional (Opcional)

- [ ] Configurar dominio personalizado si lo deseas
- [ ] Configurar redirecciones si es necesario en `vercel.json`
- [ ] Verificar que las rutas de React Router funcionan correctamente (SPA)

### Testing Post-Despliegue

- [ ] Probar la aplicación en la URL de Vercel
- [ ] Verificar que las llamadas al API funcionan (revisar Network en DevTools)
- [ ] Probar el flujo de autenticación
- [ ] Probar el flujo de compra completo
- [ ] Verificar que no hay errores de CORS

### Notas Importantes

- ✅ Vercel despliega automáticamente en cada push a la rama principal
- ✅ Vercel crea preview deployments para cada pull request
- ✅ Los archivos `.env` locales NO se usan en Vercel, usa Environment Variables del dashboard
- 💡 Vercel tiene un plan gratuito muy generoso

---

## 📝 Checklist Final: Verificación Post-Despliegue

### Backend (Render)
- [ ] Servidor responde en la URL de Render
- [ ] MongoDB se conecta correctamente
- [ ] Endpoints de productos funcionan
- [ ] Endpoints de autenticación funcionan
- [ ] Endpoints de carrito funcionan
- [ ] Endpoints de órdenes funcionan
- [ ] CORS permite requests desde Vercel

### Frontend (Vercel)
- [ ] Aplicación carga correctamente
- [ ] Puede comunicarse con el backend
- [ ] Autenticación funciona
- [ ] Catálogo de productos se muestra
- [ ] Carrito funciona
- [ ] Checkout funciona
- [ ] Redirección después de compra funciona

### Integración MercadoPago (si ya está implementado)
- [ ] Preferencias se crean correctamente
- [ ] Redirección a MercadoPago funciona
- [ ] Webhooks se reciben correctamente
- [ ] Órdenes se actualizan después del pago

---

## 🆘 Troubleshooting Común

### Backend no responde
- Verificar logs en Render
- Verificar variables de entorno
- Verificar que MongoDB Atlas permite conexiones desde cualquier IP (0.0.0.0/0)

### CORS errors
- Verificar que `FRONTEND_URL` en backend tiene la URL correcta de Vercel
- Verificar configuración de CORS en `server.js`

### Frontend no puede conectar al backend
- Verificar `VITE_API_URL` en Vercel
- Verificar que el backend está desplegado y funcionando
- Verificar que la URL del backend no tiene `/api` duplicado

### Variables de entorno no funcionan
- En Vite, las variables deben empezar con `VITE_`
- Reiniciar el servicio después de cambiar variables de entorno
- Verificar que se usan `import.meta.env.VITE_*` en el código

