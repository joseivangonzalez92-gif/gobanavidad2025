import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

export default function Fotos() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [mostrarReacciones, setMostrarReacciones] = useState(null);
  const [comentario, setComentario] = useState("");
  const [imagenesCargadas, setImagenesCargadas] = useState({});
  
  // 🆕 ESTADOS PARA SUBIDA DE FOTOS (igual que en Challenges)
  const [imagenSubida, setImagenSubida] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [mostrarFormSubida, setMostrarFormSubida] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: ""
  });

  const reaccionesDisponibles = ["❤️", "😂", "😮", "🎄", "✨", "👏", "😊"];

  // Fotos de ejemplo (solo como fallback)
  const fotosEjemplo = [
    {
      id: "ejemplo_1",
      url: "https://images.unsplash.com/photo-1574359411659-619d8d13a0f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      titulo: "Navidad 2020 - Primera reunión familiar",
      descripcion: "¡Nuestra primera navidad todos juntos!",
      fecha: "24 Dic 2020",
      reacciones: { "❤️": 5, "😂": 3, "🎄": 8 },
      comentarios: [
        { usuario: "Mamá", texto: "¡Qué recuerdo tan especial!", fecha: "2020-12-25" },
        { usuario: "Papá", texto: "El mejor pavo de la historia 😉", fecha: "2020-12-25" }
      ],
      usuario: "Admin"
    }
  ];

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) {
      window.location.href = "/login";
      return;
    }
    setUsuarioActual(usuario);
    cargarFotos();
    
    // 🆕 ESCUCHAR CAMBIOS EN TIEMPO REAL
    const unsubscribe = gobaService.escucharGaleria((nuevasFotos) => {
      console.log("🔄 Actualización en tiempo real:", nuevasFotos.length);
      setFotos(nuevasFotos);
    });
    
    return () => unsubscribe();
  }, []);

  // 🆕 FUNCIÓN ACTUALIZADA - CARGAR DESDE FIREBASE
  const cargarFotos = async () => {
    try {
      console.log("📸 Cargando fotos desde Firebase...");
      const fotosFirebase = await gobaService.getApprovedGalleryPhotos();
      
      if (fotosFirebase.length > 0) {
        console.log(`✅ ${fotosFirebase.length} fotos cargadas desde Firebase`);
        setFotos(fotosFirebase);
      } else {
        // Si no hay fotos en Firebase, usar las de ejemplo
        console.log("ℹ️ No hay fotos en Firebase, usando ejemplos");
        setFotos(fotosEjemplo);
      }
    } catch (error) {
      console.error("❌ Error cargando fotos:", error);
      // En caso de error, usar ejemplos
      setFotos(fotosEjemplo);
    }
  };

  // 🆕 FUNCIÓN PARA SUBIR FOTO (igual que en Challenges)
  const manejarSubidaFoto = async (e) => {
    e.preventDefault();
    
    if (!imagenSubida) {
      alert("❌ Por favor selecciona una foto primero");
      return;
    }

    if (!formData.titulo.trim()) {
      alert("❌ Por favor agrega un título a la foto");
      return;
    }

    if (imagenSubida.size > 10 * 1024 * 1024) {
      alert("❌ La imagen es muy grande. Elige una menor a 10MB");
      return;
    }

    setSubiendoFoto(true);
    
    try {
      const resultado = await gobaService.uploadGalleryPhoto(
        usuarioActual.id, 
        formData.titulo,
        formData.descripcion,
        imagenSubida
      );
      
      alert(`✅ ${resultado.message}`);
      
      // Limpiar formulario
      setImagenSubida(null);
      setFormData({ titulo: "", descripcion: "" });
      setMostrarFormSubida(false);
      
      // Recargar fotos después de subir
      setTimeout(() => {
        cargarFotos();
      }, 2000);
      
    } catch (error) {
      console.error("Error detallado:", error);
      alert(`❌ Error al subir foto: ${error.message}`);
    } finally {
      setSubiendoFoto(false);
    }
  };

  // 🆕 FUNCIONES ACTUALIZADAS PARA REACCIONES Y COMENTARIOS
  const agregarReaccion = async (fotoId, reaccion) => {
    try {
      await gobaService.addGalleryReaction(fotoId, usuarioActual.id, reaccion);
      
      // Actualizar estado local
      const fotosActualizadas = fotos.map(foto => {
        if (foto.id === fotoId) {
          const nuevasReacciones = { ...foto.reacciones };
          nuevasReacciones[reaccion] = (nuevasReacciones[reaccion] || 0) + 1;
          return { ...foto, reacciones: nuevasReacciones };
        }
        return foto;
      });
      setFotos(fotosActualizadas);
      
    } catch (error) {
      alert(`❌ Error al reaccionar: ${error.message}`);
    }
  };

  const agregarComentario = async (fotoId) => {
    if (!comentario.trim()) return;

    try {
      await gobaService.addGalleryComment(fotoId, usuarioActual.id, comentario);
      
      // Actualizar estado local
      const fotosActualizadas = fotos.map(foto => {
        if (foto.id === fotoId) {
          const nuevoComentario = {
            usuario: usuarioActual.nombre,
            texto: comentario,
            fecha: new Date().toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })
          };
          return {
            ...foto,
            comentarios: [...foto.comentarios, nuevoComentario]
          };
        }
        return foto;
      });
      setFotos(fotosActualizadas);
      
      setComentario("");
      
    } catch (error) {
      alert(`❌ Error al comentar: ${error.message}`);
    }
  };

  const manejarCargaImagen = (fotoId) => {
    setImagenesCargadas(prev => ({
      ...prev,
      [fotoId]: true
    }));
  };

  const manejarErrorImagen = (fotoId) => {
    setImagenesCargadas(prev => ({
      ...prev,
      [fotoId]: false
    }));
  };

  if (!usuarioActual) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-red-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header - CON BOTÓN DE SUBIR */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-green-600 via-red-500 to-green-600 bg-clip-text text-transparent">
            📸 Galería de Recuerdos Familiares
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 font-light">
            Revive la magia de nuestras navidades a través del tiempo
          </p>
          
          {/* 🆕 BOTÓN PARA SUBIR FOTO */}
          <button
            onClick={() => setMostrarFormSubida(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg mb-6"
          >
            📤 Subir Foto a la Galería
          </button>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-red-200">
              <div className="text-red-500 text-xl md:text-2xl mb-2">📷</div>
              <h2 className="font-bold text-gray-800 mb-1 text-sm md:text-base">Fotos</h2>
              <p className="text-xl md:text-2xl font-bold text-red-600">{fotos.length}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-green-200">
              <div className="text-green-500 text-xl md:text-2xl mb-2">❤️</div>
              <h2 className="font-bold text-gray-800 mb-1 text-sm md:text-base">Reacciones</h2>
              <p className="text-xl md:text-2xl font-bold text-green-600">
                {fotos.reduce((total, foto) => total + Object.values(foto.reacciones).reduce((a, b) => a + b, 0), 0)}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-blue-200">
              <div className="text-blue-500 text-xl md:text-2xl mb-2">🎄</div>
              <h2 className="font-bold text-gray-800 mb-1 text-sm md:text-base">Navidad</h2>
              <p className="text-xl md:text-2xl font-bold text-blue-600">2025</p>
            </div>
          </div>
        </div>

        {/* 🆕 MODAL DE SUBIDA DE FOTO */}
        {mostrarFormSubida && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">📤 Subir Foto a la Galería</h3>
              
              <form onSubmit={manejarSubidaFoto} className="space-y-4">
                {/* Input título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título de la foto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({...prev, titulo: e.target.value}))}
                    placeholder="Ej: Navidad 2025 - Familia completa"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none"
                  />
                </div>
                
                {/* Input descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({...prev, descripcion: e.target.value}))}
                    placeholder="Comparte el recuerdo especial de esta foto..."
                    rows="3"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none"
                  />
                </div>
                
                {/* Preview y selección de imagen (igual que Challenges) */}
                {imagenSubida && (
                  <div className="text-center bg-gray-50 p-4 rounded-lg border-2 border-green-300">
                    <p className="text-sm text-green-600 font-medium mb-2">Vista previa:</p>
                    <img 
                      src={URL.createObjectURL(imagenSubida)} 
                      alt="Tu foto para la galería" 
                      className="max-h-40 mx-auto rounded-lg shadow-md"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {imagenSubida.name} - {(imagenSubida.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                  </div>
                )}

                {/* Input archivo */}
                <label className="block cursor-pointer">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar foto *
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setImagenSubida(e.target.files[0])}
                    disabled={subiendoFoto}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 disabled:opacity-50"
                  />
                </label>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormSubida(false);
                      setImagenSubida(null);
                      setFormData({ titulo: "", descripcion: "" });
                    }}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!imagenSubida || !formData.titulo.trim() || subiendoFoto}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      !imagenSubida || !formData.titulo.trim() || subiendoFoto
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {subiendoFoto ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Subiendo...
                      </span>
                    ) : (
                      '📤 Subir a Galería'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grid de Fotos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
          {fotos.map((foto, index) => (
            <div 
              key={foto.id}
              className={`
                bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden 
                hover:shadow-2xl transition-all duration-300 cursor-pointer 
                transform hover:scale-105 border-2 border-white
                ${index === 0 ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : ''}
              `}
              onClick={() => setFotoSeleccionada(foto)}
            >
              <div className={`
                relative overflow-hidden bg-gray-100
                ${index === 0 ? 'aspect-[4/3]' : 'aspect-square'}
              `}>
                {!imagenesCargadas[foto.id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="animate-pulse text-gray-400">📸</div>
                  </div>
                )}
                <img 
                  src={foto.url || foto.imageUrl} 
                  alt={foto.titulo}
                  className={`
                    w-full h-full transition-transform duration-500 hover:scale-105
                    ${imagenesCargadas[foto.id] ? 'object-cover' : 'opacity-0'}
                  `}
                  onLoad={() => manejarCargaImagen(foto.id)}
                  onError={() => manejarErrorImagen(foto.id)}
                />
              </div>
              
              <div className="p-3 md:p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-1 flex-1">
                    {foto.titulo}
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
                    por {foto.usuario || foto.userName}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-tight">
                  {foto.descripcion}
                </p>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">{foto.fecha}</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {Object.entries(foto.reacciones)
                      .slice(0, 2)
                      .map(([reaccion, count]) => (
                        <span key={reaccion} className="text-xs bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                          {reaccion} {count}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMostrarReacciones(mostrarReacciones === foto.id ? null : foto.id);
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-red-500 text-white text-xs font-medium py-2 px-3 rounded-lg hover:from-green-600 hover:to-red-600 transition-all"
                  >
                    💬 Reaccionar
                  </button>

                  {mostrarReacciones === foto.id && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-2xl border-2 border-green-200 p-3 z-10">
                      <div className="grid grid-cols-4 gap-1 mb-3">
                        {reaccionesDisponibles.map(reaccion => (
                          <button
                            key={reaccion}
                            onClick={(e) => {
                              e.stopPropagation();
                              agregarReaccion(foto.id, reaccion);
                              setMostrarReacciones(null);
                            }}
                            className="text-xl hover:scale-125 transition-transform duration-200 p-1 rounded-lg hover:bg-gray-100"
                          >
                            {reaccion}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Comentario..."
                          className="flex-1 text-xs p-2 border border-gray-300 rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setComentario(e.target.value)}
                          value={comentario}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            agregarComentario(foto.id);
                          }}
                          className="bg-blue-500 text-white text-xs px-3 rounded-lg hover:bg-blue-600"
                        >
                          ➤
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Si no hay fotos */}
        {fotos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No hay fotos aún</h2>
            <p className="text-gray-500">¡Sé el primero en subir una foto a nuestra galería familiar!</p>
            <button
              onClick={() => setMostrarFormSubida(true)}
              className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              📤 Subir Primera Foto
            </button>
          </div>
        )}

        {/* Modal para ver foto en grande */}
        {fotoSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <button
                  onClick={() => setFotoSeleccionada(null)}
                  className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center z-10 hover:bg-red-600"
                >
                  ✕
                </button>
                <img 
                  src={fotoSeleccionada.url || fotoSeleccionada.imageUrl} 
                  alt={fotoSeleccionada.titulo}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{fotoSeleccionada.titulo}</h3>
                <p className="text-gray-600 mb-4">{fotoSeleccionada.descripcion}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>Por {fotoSeleccionada.usuario || fotoSeleccionada.userName}</span>
                  <span>{fotoSeleccionada.fecha}</span>
                </div>
                
                {/* Reacciones en modal */}
                <div className="flex gap-2 mb-4">
                  {Object.entries(fotoSeleccionada.reacciones).map(([reaccion, count]) => (
                    <span key={reaccion} className="bg-gray-100 px-3 py-1 rounded-full">
                      {reaccion} {count}
                    </span>
                  ))}
                </div>
                
                {/* Comentarios en modal */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Comentarios</h4>
                  {fotoSeleccionada.comentarios && fotoSeleccionada.comentarios.length > 0 ? (
                    <div className="space-y-3">
                      {fotoSeleccionada.comentarios.map((coment, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-gray-800">{coment.usuario}</span>
                            <span className="text-xs text-gray-500">{coment.fecha}</span>
                          </div>
                          <p className="text-gray-600 mt-1">{coment.texto}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay comentarios aún</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="text-center">
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ← Volver al Home
          </Link>
        </div>
      </div>
    </div>
  );
}