const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

export const uploadToImgBB = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    console.log("📤 Subiendo imagen a ImgBB...");
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log("✅ Imagen subida exitosamente:", data.data.url);
      return data.data.url;
    } else {
      throw new Error(data.error.message || "Error subiendo imagen");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    throw new Error("No se pudo subir la imagen");
  }
};