/**
 * Sube un archivo a Cloudinary.
 * 
 * @param {File} file - El archivo a subir.
 * @returns {Promise<string>} - La URL segura de la imagen subida.
 */
export const uploadImage = async (file) => {
    // --- ESTA ES LA PARTE QUE DEBES CONFIGURAR ---
    // 1. Obtén tu "Cloud Name" y "Upload Preset" de tu cuenta de Cloudinary.
    // 2. Crea un archivo .env en la carpeta frontend/ y añade estas variables:
    //    VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
    //    VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        console.error("Cloudinary no está configurado. Revisa tus variables de entorno.");
        throw new Error("El servicio de subida de imágenes no está configurado.");
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Error al subir la imagen.');
        }

        const data = await response.json();
        return data.secure_url; // Devuelve la URL segura de la imagen
    } catch (error) {
        console.error("Error en uploadImage:", error);
        throw error;
    }
};