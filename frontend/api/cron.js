// Este archivo es una Serverless Function de Vercel.
// Es un pequeño backend de Node.js que vive en tu frontend.

export default async function handler(request, response) {
    // 1. Leemos las variables de entorno de Vercel
    const backendUrl = process.env.BACKEND_RENDER_URL; // La URL completa de Render
    const cronSecret = process.env.CRON_SECRET;        // El secreto que compartimos

    if (!backendUrl || !cronSecret) {
        console.error("[Vercel Cron] Variables de entorno (URL o Secreto) no configuradas.");
        return response.status(500).json({ 
            message: "Error de configuración del Cron Job de Vercel." 
        });
    }

    try {
        console.log(`[Vercel Cron] Despertando al backend en: ${backendUrl}`);

        // 2. Hacemos la llamada 'fetch' a tu backend en Render
        const backendResponse = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                // 3. ¡Agregamos el header de seguridad!
                // Esto prueba a Render que la llamada es legítima.
                'x-cron-secret': cronSecret,
            },
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            // Si el backend (Render) falló, lo reportamos
            console.error("[Vercel Cron] El backend de Render respondió con un error:", data);
            return response.status(backendResponse.status).json({ 
                message: "El backend de Render falló al limpiar las órdenes.",
                error: data 
            });
        }

        // 4. ¡Éxito!
        console.log("[Vercel Cron] El backend de Render respondió:", data);
        response.status(200).json({ 
            message: "El Cron Job de Vercel se ejecutó con éxito.",
            backendResponse: data 
        });

    } catch (error) {
        console.error("[Vercel Cron] Error al llamar al backend de Render:", error.message);
        response.status(500).json({ 
            message: "Error interno del Cron Job de Vercel.",
            error: error.message 
        });
    }
}