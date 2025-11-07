# Versión 1.1 Nutrirte Alimenta Store
# Documentación del Proyecto: Tienda tipo E-commerce MERN Stack

Este documento detalla la arquitectura, características y configuración de la aplicación full-stack de e-commerce "Nutrite Alimenta".

El proyecto implementa un stack MERN (MongoDB, Express, React, Node.js) y pone especial énfasis en un sistema robusto de gestión de stock y una integración completa con MercadoPago (incluyendo pagos y webhooks).

## 1. Stack Tecnológico

Frontend (Desplegado en Vercel):

Framework: React (Vite)

Gestión de Estado: React Context API (useContext, useAuth, useCart)

Routing: react-router-dom

Llamadas API: axios (con interceptores para JWT)

Notificaciones: react-toastify

Cron Jobs: Servicio de Cron Jobs de Vercel + Serverless Function (api/cron.js)

Backend (Desplegado en Render):

Framework: Node.js + Express

Base de Datos: MongoDB (con Mongoose)

Autenticación: JSON Web Tokens (JWT)

Pagos: MercadoPago SDK (mercadopago)

Seguridad: cors, dotenv

## 2. Arquitectura de Deploy (Vercel + Render)

El proyecto está dividido en dos servicios independientes que se comunican por API, optimizados para un deploy gratuito y escalable.

* Frontend (Vercel):

Sirve la aplicación de React estática.

Todas las llamadas a la API (/api/...) apuntan a la URL pública del backend en Render (configurado vía VITE_API_URL).

Maneja el Cron Job: Utiliza el servicio "Cron Jobs" de Vercel para ejecutar una tarea programada.

* Backend (Render):

Es un "Web Service" de Node.js que expone la API REST.

Se conecta a la base de datos de MongoDB Atlas.

Se duerme (Sleeps): El plan gratuito de Render "duerme" tras 20 minutos de inactividad. No puede ejecutar node-cron internamente.

Endpoint de Cron: Expone un endpoint público (GET /api/orders/trigger-cron) que, al ser llamado, ejecuta la limpieza de órdenes pendientes.

* El "Despertador": Vercel Cron Job

Para solucionar el problema del "servidor dormido" de Render, usamos Vercel como un despertador externo:

Vercel (vercel.json): Tiene una regla "schedule": "*/20 * * * *" que "llama" al archivo api/cron.js cada 20 minutos.

Vercel (api/cron.js): Esta Serverless Function (un mini-backend en Vercel) se despierta.

Llamada (Fetch): api/cron.js hace un fetch a la URL del backend en Render (https://...onrender.com/api/orders/trigger-cron).


## 3. Flujo Central: Gestión de Stock y Pago (El Corazón de la App)

Este es el flujo más complejo del sistema. Se diseñó para ser transaccional y resiliente, asegurando que el stock nunca se corrompa, incluso si un usuario abandona el pago.

El Schema: El modelo Product tiene dos campos clave:

stock: El inventario físico total.

stockComprometido: Unidades reservadas en órdenes pendientes (aún no pagadas).

El "Stock Disponible Real" para un nuevo cliente siempre se calcula como stock - stockComprometido.

- Paso 1: Creación de Orden (Congelamiento de Stock)

Cuando el usuario hace clic en "Confirmar Pedido" (CheckoutPage.jsx):

Llamada: El frontend llama a POST /api/orders (función createOrder).

Transacción: El backend inicia una transacción de MongoDB.

Verificación: Comprueba si hay stock disponible (stock - stockComprometido >= cantidadPedida) para cada producto.

Congelamiento: Si hay stock, actualiza la base de datos:

stock se reduce (- item.cantidad).

stockComprometido aumenta (+ item.cantidad).

Creación: Se crea una nueva Order con status: 'pendiente' y un expiresAt (fecha de expiración, ej. 20 minutos en el futuro).

Limpieza: Se vacía el Cart del usuario.

Commit: Se confirma la transacción.

Respuesta: El frontend recibe la orden creada y redirige a OrderDetailPage.jsx.

- Paso 2: El Pago (MercadoPago)

Llamada: El usuario está en OrderDetailPage.jsx. Ve que la orden está "Pendiente" y hace clic en "Pagar".

Preferencia: El frontend llama a POST /api/orders/:id/create-payment-preference.

Corrección de Sandbox (IMPORTANTE): Para evitar los errores del sandbox de MercadoPago ("una de las partes es de prueba"), el backend fuerza que el payer sea un usuario de prueba, usando el email TESTUSER..._@testuser.com.

Respuesta: El backend devuelve el init_point (URL de pago).

Redirección: El frontend hace window.location.href = init_point y el usuario es redirigido a MercadoPago.

- Paso 3: El Resultado (Los Dos Caminos)

Camino A: Pago Exitoso (Webhook)

El usuario paga con éxito.

MercadoPago envía dos notificaciones (un type: 'payment' y un topic: 'merchant_order') al endpoint público: POST /api/orders/webhook/mercadopago.

Lógica Robusta: La función receiveMercadoPagoWebhook está diseñada para manejar ambos tipos de notificación:

Busca los detalles del pago (paymentDetails).

Extrae la external_reference (que es nuestra orderId).

Verifica que el paymentStatus sea 'approved'.

Validación Anti-Duplicados: El código comprueba si la orden en la BD ya está completada. Si es así (porque el segundo webhook llegó tarde), lo ignora (ver logs Orden ... ya estaba 'completada'. Ignorando.).

Liberación de Stock: Si la orden está pendiente, el backend:

Actualiza la orden: status: 'completada', paidAt: Date.now(), etc.

Actualiza el producto: stockComprometido se reduce (- item.cantidad).

(El stock físico no se toca, porque ya se había descontado en el Paso 1).

Resultado: El stock es correcto y la orden está pagada.

Camino B: Abandono o Falla (Cron Job)

El usuario cierra la pestaña de MercadoPago o el pago falla, y pasan 20 minutos.

Vercel Cron (*/20 * * * *): Se activa el "despertador" (api/cron.js).

Llamada al Backend: Vercel llama a GET /api/orders/trigger-cron en Render (con el x-cron-secret).

Lógica de Limpieza: La función triggerOrderCleanup en el backend se ejecuta:

Busca en la BD todas las órdenes con status: 'pendiente' Y expiresAt <= Date.now().

Devolución de Stock: Por cada orden expirada, el backend (en una transacción):

Actualiza la orden: status: 'cancelada'.

Actualiza el producto:

stock aumenta (+ item.cantidad).

stockComprometido se reduce (- item.cantidad).

Resultado: El stock "congelado" se devuelve al inventario físico, quedando disponible para otros clientes.

## 4. Configuración: Variables de Entorno
>>> Ver archivos 
>>> Pasos para integrar en producción MercadoPago **CHECKLIST.md** 
>>> Pasos para configuarar en modo desarrollo **CONFIGURACIÓN.md**

## 5. Próximos Pasos (Mejoras Futuras)

Marcar como "Entregado": Implementar la lógica de "En proceso de envío" y "Entregado" que ya está visible en OrderDetailPage.jsx. Esto requerirá:

Un panel de Administrador.

Una nueva ruta protegida (ej. PUT /api/orders/:id/deliver) que un admin pueda llamar.

Pasar a Producción: Para recibir pagos reales, el único paso sería:

Activar las credenciales de Producción en MercadoPago (requiere CUIT, etc.).

Cambiar la variable MERCADOPAGO_ACCESS_TOKEN en Render por el nuevo token (APP_PROD-...).

Cambiar el payer.email en createMercadoPagoPreference para que use el email real del cliente (order.usuario.email).