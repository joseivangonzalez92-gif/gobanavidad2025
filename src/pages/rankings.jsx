import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

export default function Rankings() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postSeleccionado, setPostSeleccionado] = useState(null);
  const [mostrarReacciones, setMostrarReacciones] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [tipoPost, setTipoPost] = useState("texto");
  const [cargando, setCargando] = useState(true);
  
  // Estados para usuarios
  const [usuariosData, setUsuariosData] = useState({});
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  
  // Estados para crear posts
  const [mostrarFormPost, setMostrarFormPost] = useState(false);
  const [subiendoContenido, setSubiendoContenido] = useState(false);
  const [imagenSubida, setImagenSubida] = useState(null);
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    categoria: "general"
  });
  
  // Estados específicos para polls
  const [opcionesPoll, setOpcionesPoll] = useState(["", ""]);
  const [peliculaSugerida, setPeliculaSugerida] = useState("");

  // 🆕 NUEVO: Estado para imagen ampliada
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  // 🆕 MEJORADO: Emojis con mejor espaciado y 2 nuevos emojis
  const reaccionesDisponibles = ["❤️", "😂", "😮", "🎄", "✨", "👏", "🔥", "🎁", "🤗", "😊", "🥰"];
  const categorias = ["general", "peliculas", "musica", "recuerdos", "divertido", "reflexiones"];

  // Función para cargar datos de usuarios
  const cargarDatosUsuarios = async () => {
    try {
      console.log("👥 Cargando datos de usuarios...");
      // 🆕 CORRECCIÓN: Usar obtenerTodosUsuarios en lugar de getUsuarios
      const usuarios = await gobaService.obtenerTodosUsuarios();
      
      const usuariosMap = {};
      usuarios.forEach(usuario => {
        usuariosMap[usuario.id] = {
          avatar: usuario.avatar,
          pais: usuario.pais,
          nombre: usuario.nombre
        };
      });
      
      setUsuariosData(usuariosMap);
      console.log(`✅ Datos de ${usuarios.length} usuarios cargados`);
    } catch (error) {
      console.error("❌ Error cargando datos de usuarios:", error);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  // Función para obtener datos actualizados del usuario
  const getDatosUsuario = (usuarioId) => {
    const datosBase = usuariosData[usuarioId] || {
      avatar: "👤",
      pais: "Sin territorio", 
      nombre: "Usuario"
    };
    
    // 🆕 AGREGADO: "de" antes del territorio
    return {
      ...datosBase,
      pais: `de ${datosBase.pais}`
    };
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) {
      window.location.href = "/login";
      return;
    }
    setUsuarioActual(usuario);
    
    // Cargar posts y usuarios en paralelo
    Promise.all([cargarPosts(), cargarDatosUsuarios()])
      .finally(() => {
        setCargando(false);
      });
  }, []);

  const cargarPosts = async () => {
    try {
      setCargando(true);
      console.log("📝 Cargando posts de Firebase...");
      const postsFirebase = await gobaService.getNaviVibesPosts();
      
      if (postsFirebase && postsFirebase.length > 0) {
        console.log(`✅ ${postsFirebase.length} posts cargados desde Firebase`);
        setPosts(postsFirebase);
      } else {
        console.log("ℹ️ No hay posts en Firebase");
        setPosts([]);
      }
    } catch (error) {
      console.error("❌ Error cargando posts:", error);
      setPosts([]);
    }
  };

  // FUNCIÓN PARA CREAR POST
  const crearPost = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      alert("❌ Por favor agrega un título a tu publicación");
      return;
    }

    if (tipoPost === "poll") {
      const opcionesValidas = opcionesPoll.filter(op => op.trim() !== "");
      if (opcionesValidas.length < 2) {
        alert("❌ La encuesta necesita al menos 2 opciones");
        return;
      }
    }

    setSubiendoContenido(true);
    
    try {
      let resultado;
      
      switch (tipoPost) {
        case "texto":
          resultado = await gobaService.crearPostTexto(
            usuarioActual.id,
            formData.titulo,
            formData.contenido,
            formData.categoria
          );
          break;
          
        case "imagen":
          if (!imagenSubida) {
            alert("❌ Por favor selecciona una imagen");
            setSubiendoContenido(false);
            return;
          }
          resultado = await gobaService.crearPostImagen(
            usuarioActual.id,
            formData.titulo,
            formData.contenido,
            formData.categoria,
            imagenSubida
          );
          break;
          
        case "pelicula":
          resultado = await gobaService.crearPostPelicula(
            usuarioActual.id,
            formData.titulo,
            formData.contenido,
            formData.categoria,
            peliculaSugerida
          );
          break;
          
        case "poll":
          const opcionesValidas = opcionesPoll.filter(op => op.trim() !== "");
          resultado = await gobaService.crearPostPoll(
            usuarioActual.id,
            formData.titulo,
            formData.contenido,
            formData.categoria,
            opcionesValidas
          );
          break;
          
        default:
          throw new Error("Tipo de post no válido");
      }

      alert(resultado.message || "✅ ¡Publicación creada exitosamente!");
      
      // Recargar posts
      await cargarPosts();
      
      // Limpiar formulario
      setFormData({ titulo: "", contenido: "", categoria: "general" });
      setImagenSubida(null);
      setPeliculaSugerida("");
      setOpcionesPoll(["", ""]);
      setMostrarFormPost(false);
      
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al crear publicación: " + error.message);
    } finally {
      setSubiendoContenido(false);
    }
  };

  // FUNCIONES PARA INTERACTUAR
  const agregarReaccion = async (postId, reaccion) => {
    try {
      await gobaService.addNaviVibesReaction(postId, usuarioActual.id, reaccion);
      
      // Actualizar localmente
      const postsActualizados = posts.map(post => {
        if (post.id === postId) {
          const nuevasReacciones = { ...post.reacciones };
          nuevasReacciones[reaccion] = (nuevasReacciones[reaccion] || 0) + 1;
          return { ...post, reacciones: nuevasReacciones };
        }
        return post;
      });
      setPosts(postsActualizados);
      
    } catch (error) {
      console.error("Error al reaccionar:", error);
    }
  };

  const agregarComentario = async (postId) => {
    const comentarioTexto = comentarios[postId] || "";
    
    if (!comentarioTexto.trim()) return;

    try {
      await gobaService.addNaviVibesComment(postId, usuarioActual.id, comentarioTexto);
      
      // Actualizar localmente
      const postsActualizados = posts.map(post => {
        if (post.id === postId) {
          const nuevoComentario = {
            usuarioId: usuarioActual.id,
            usuario: usuarioActual.nombre,
            usuarioAvatar: usuarioActual.avatar,
            usuarioPais: usuarioActual.pais,
            texto: comentarioTexto,
            fecha: new Date().toISOString(),
            fechaFormateada: new Date().toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })
          };
          return {
            ...post,
            comentarios: [...(post.comentarios || []), nuevoComentario]
          };
        }
        return post;
      });
      setPosts(postsActualizados);
      
      // Limpiar solo el comentario de este post
      setComentarios(prev => ({ ...prev, [postId]: "" }));
      
    } catch (error) {
      console.error("Error al comentar:", error);
    }
  };

  const votarEnPoll = async (postId, opcionIndex) => {
    try {
      await gobaService.votarEnPoll(postId, usuarioActual.id, opcionIndex);
      
      // Actualizar localmente
      const postsActualizados = posts.map(post => {
        if (post.id === postId && post.tipo === "poll") {
          const nuevasOpciones = [...post.opciones];
          nuevasOpciones[opcionIndex].votos = (nuevasOpciones[opcionIndex].votos || 0) + 1;
          return { ...post, opciones: nuevasOpciones };
        }
        return post;
      });
      setPosts(postsActualizados);
      
    } catch (error) {
      console.error("Error al votar:", error);
    }
  };

  // FUNCIÓN PARA ELIMINAR POST
  const eliminarPost = async (postId, postUsuarioId) => {
    if (!usuarioActual) return;
    
    // Solo admin puede eliminar cualquier post, usuarios solo pueden eliminar sus propios posts
    if (usuarioActual.rol !== "admin" && usuarioActual.id !== postUsuarioId) {
      alert("❌ Solo puedes eliminar tus propias publicaciones");
      return;
    }

    const confirmar = window.confirm(
      "¿Estás seguro de que quieres eliminar esta publicación?"
    );

    if (confirmar) {
      try {
        await gobaService.eliminarPostNaviVibes(postId);
        alert("✅ Publicación eliminada exitosamente");
        
        // Recargar posts
        await cargarPosts();
      } catch (error) {
        alert("❌ Error al eliminar publicación: " + error.message);
      }
    }
  };

  // 🆕 NUEVO: Función para abrir imagen en grande
  const abrirImagenAmpliada = (imagenUrl, titulo) => {
    setImagenAmpliada({ url: imagenUrl, titulo });
  };

  // 🆕 NUEVO: Función para cerrar imagen ampliada
  const cerrarImagenAmpliada = (e) => {
    if (e.target === e.currentTarget) {
      setImagenAmpliada(null);
    }
  };

  // FUNCIONES AUXILIARES
  const agregarOpcionPoll = () => {
    if (opcionesPoll.length < 6) {
      setOpcionesPoll([...opcionesPoll, ""]);
    }
  };

  const actualizarOpcionPoll = (index, valor) => {
    const nuevasOpciones = [...opcionesPoll];
    nuevasOpciones[index] = valor;
    setOpcionesPoll(nuevasOpciones);
  };

  const eliminarOpcionPoll = (index) => {
    if (opcionesPoll.length > 2) {
      setOpcionesPoll(opcionesPoll.filter((_, i) => i !== index));
    }
  };

  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case "texto": return "📝";
      case "imagen": return "🖼️";
      case "pelicula": return "🎬";
      case "poll": return "📊";
      default: return "💬";
    }
  };

  const getColorCategoria = (categoria) => {
    const colores = {
      general: "bg-blue-100 text-blue-700",
      peliculas: "bg-purple-100 text-purple-700",
      musica: "bg-green-100 text-green-700",
      recuerdos: "bg-yellow-100 text-yellow-700",
      divertido: "bg-pink-100 text-pink-700",
      reflexiones: "bg-indigo-100 text-indigo-700"
    };
    return colores[categoria] || "bg-gray-100 text-gray-700";
  };

  if (!usuarioActual || cargandoUsuarios) {
    return <div className="text-center py-8">Cargando NaviVibes...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-red-600 via-green-500 to-blue-600 bg-clip-text text-transparent">
            🎄 NaviVibes
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 font-light">
            El muro navideño de la familia - Comparte, recomienda y diviértete
          </p>
          
          {/* Botón para crear post */}
          <button
            onClick={() => setMostrarFormPost(true)}
            className="bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg mb-6"
          >
            ✨ Crear Publicación
          </button>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-red-200">
              <div className="text-red-500 text-2xl mb-2">💬</div>
              <h2 className="font-bold text-gray-800 mb-1 text-sm">Publicaciones</h2>
              <p className="text-xl font-bold text-red-600">{posts.length}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-green-200">
              <div className="text-green-500 text-2xl mb-2">❤️</div>
              <h2 className="font-bold text-gray-800 mb-1 text-sm">Reacciones</h2>
              <p className="text-xl font-bold text-green-600">
                {posts.reduce((total, post) => total + Object.values(post.reacciones || {}).reduce((a, b) => a + b, 0), 0)}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-blue-200">
              <div className="text-blue-500 text-2xl mb-2">🎬</div>
              <h2 className="font-bold text-gray-800 mb-1 text-sm">Películas</h2>
              <p className="text-xl font-bold text-blue-600">
                {posts.filter(post => post.tipo === "pelicula").length}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-purple-200">
              <div className="text-purple-500 text-2xl mb-2">📊</div>
              <h2 className="font-bold text-gray-800 mb-1 text-sm">Encuestas</h2>
              <p className="text-xl font-bold text-purple-600">
                {posts.filter(post => post.tipo === "poll").length}
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {cargando && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando publicaciones...</p>
          </div>
        )}

        {/* Lista de Posts */}
        {!cargando && (
          <div className="space-y-6 mb-12">
            {posts.map((post) => (
              <div 
                key={post.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-white"
              >
                {/* Header del post - VERSIÓN ACTUALIZADA */}
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* AVATAR ACTUALIZADO */}
                      <div className="text-2xl">{getDatosUsuario(post.usuarioId).avatar}</div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{post.titulo}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm text-gray-600">
                            por {getDatosUsuario(post.usuarioId).nombre}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          {/* PAÍS ACTUALIZADO CON "de" */}
                          <span className="text-sm text-green-600 font-medium">
                            {getDatosUsuario(post.usuarioId).pais}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-sm text-gray-500">
                            {post.fechaFormateada || post.fecha}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${getColorCategoria(post.categoria)}`}>
                        {post.categoria}
                      </span>
                      
                      {/* Botón eliminar (solo admin o autor) */}
                      {(usuarioActual.rol === "admin" || usuarioActual.id === post.usuarioId) && (
                        <button
                          onClick={() => eliminarPost(post.id, post.usuarioId)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium p-1"
                          title="Eliminar publicación"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {post.contenido}
                  </p>
                  
                  {/* Información específica del tipo */}
                  {post.tipo === "pelicula" && post.pelicula && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <span className="font-semibold">🎬 Película:</span> {post.pelicula}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contenido específico */}
                {post.tipo === "poll" && post.opciones && (
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="space-y-2">
                      {post.opciones.map((opcion, index) => {
                        const totalVotos = post.opciones.reduce((sum, op) => sum + (op.votos || 0), 0);
                        const porcentaje = totalVotos > 0 ? Math.round((opcion.votos / totalVotos) * 100) : 0;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => votarEnPoll(post.id, index)}
                            className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="break-words flex-1 mr-2">{opcion.texto}</span>
                              <span className="text-sm text-gray-500 whitespace-nowrap">
                                {opcion.votos || 0} votos ({porcentaje}%)
                              </span>
                            </div>
                            {totalVotos > 0 && (
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${porcentaje}%` }}
                                ></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {post.opciones.reduce((sum, op) => sum + (op.votos || 0), 0)} votos totales
                    </p>
                  </div>
                )}

                {post.tipo === "imagen" && post.imagenUrl && (
                  <div className="border-b p-4">
                    {/* 🆕 MEJORADO: Imagen clickeable con mejor estilo */}
                    <div 
                      className="cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all duration-300 transform hover:scale-[1.02]"
                      onClick={() => abrirImagenAmpliada(post.imagenUrl, post.titulo)}
                    >
                      <img 
                        src={post.imagenUrl} 
                        alt={post.titulo}
                        className="w-full h-auto max-h-96 object-contain bg-gray-50"
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      👆 Haz clic en la imagen para verla en grande
                    </p>
                  </div>
                )}

                {/* Reacciones y comentarios */}
                <div className="p-4">
                  {/* Reacciones existentes */}
                  {Object.keys(post.reacciones || {}).length > 0 && (
                    <div className="flex gap-1 mb-3 flex-wrap">
                      {Object.entries(post.reacciones).map(([reaccion, count]) => (
                        <span key={reaccion} className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                          {reaccion} {count}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Botones de interacción */}
                  <div className="flex gap-4 border-t pt-3">
                    <div className="relative">
                      <button
                        onClick={() => setMostrarReacciones(mostrarReacciones === post.id ? null : post.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <span className="text-lg">😊</span>
                        <span className="text-sm">Reaccionar</span>
                      </button>

                      {mostrarReacciones === post.id && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-2xl border-2 border-green-200 p-3 z-10 min-w-[200px]">
                          {/* 🆕 MEJORADO: Grid con mejor espaciado */}
                          <div className="grid grid-cols-4 gap-3">
                            {reaccionesDisponibles.map(reaccion => (
                              <button
                                key={reaccion}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  agregarReaccion(post.id, reaccion);
                                  setMostrarReacciones(null);
                                }}
                                className="text-2xl hover:scale-125 transition-transform duration-200 p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                                title={reaccion}
                              >
                                {reaccion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Escribe un comentario..."
                        className="flex-1 text-sm p-2 border border-gray-300 rounded-lg focus:border-green-400 focus:outline-none"
                        value={comentarios[post.id] || ""}
                        onChange={(e) => setComentarios(prev => ({ 
                          ...prev, 
                          [post.id]: e.target.value 
                        }))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            agregarComentario(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => agregarComentario(post.id)}
                        className="bg-green-500 text-white px-4 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        ➤
                      </button>
                    </div>
                  </div>

                  {/* 🆕 MEJORADO: Comentarios mejor organizados */}
                  {post.comentarios && post.comentarios.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {post.comentarios.slice(-3).map((coment, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="text-lg flex-shrink-0">
                              {getDatosUsuario(coment.usuarioId).avatar}
                            </div>
                            
                            {/* Contenido del comentario */}
                            <div className="flex-1 min-w-0">
                              {/* Header del comentario */}
                              <div className="flex flex-wrap items-baseline gap-1 mb-1">
                                <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">
                                  {getDatosUsuario(coment.usuarioId).nombre}
                                </span>
                                <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                                  {getDatosUsuario(coment.usuarioId).pais}
                                </span>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {coment.fechaFormateada || coment.fecha}
                                </span>
                              </div>
                              
                              {/* Texto del comentario */}
                              <p className="text-gray-600 text-sm break-words leading-relaxed">
                                {coment.texto}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {post.comentarios.length > 3 && (
                        <button
                          onClick={() => setPostSeleccionado(post)}
                          className="text-green-600 text-sm font-medium hover:text-green-700 w-full text-center py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Ver todos los comentarios ({post.comentarios.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Si no hay posts */}
        {!cargando && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No hay publicaciones aún</h2>
            <p className="text-gray-500">¡Sé el primero en compartir algo en NaviVibes!</p>
            <button
              onClick={() => setMostrarFormPost(true)}
              className="mt-4 bg-gradient-to-r from-red-500 to-green-500 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ✨ Crear Primera Publicación
            </button>
          </div>
        )}

        {/* 🆕 NUEVO: Modal para imagen ampliada */}
        {imagenAmpliada && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 cursor-zoom-out"
            onClick={cerrarImagenAmpliada}
          >
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setImagenAmpliada(null)}
                className="absolute -top-12 right-0 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-600 z-10"
              >
                ✕
              </button>
              
              <div className="bg-white rounded-lg overflow-hidden">
                <img 
                  src={imagenAmpliada.url} 
                  alt={imagenAmpliada.titulo}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                {imagenAmpliada.titulo && (
                  <div className="p-4 bg-white border-t">
                    <p className="text-gray-800 font-semibold text-center">
                      {imagenAmpliada.titulo}
                    </p>
                  </div>
                )}
              </div>
              
              <p className="text-white text-center mt-4 text-sm">
                Haz clic fuera de la imagen para cerrar
              </p>
            </div>
          </div>
        )}

        {/* MODAL PARA CREAR POST */}
        {mostrarFormPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">✨ Crear Publicación</h3>
              
              {/* Selector de tipo */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { tipo: "texto", icono: "📝", label: "Texto" },
                  { tipo: "imagen", icono: "🖼️", label: "Imagen" },
                  { tipo: "pelicula", icono: "🎬", label: "Película" },
                  { tipo: "poll", icono: "📊", label: "Encuesta" }
                ].map((item) => (
                  <button
                    key={item.tipo}
                    type="button"
                    onClick={() => setTipoPost(item.tipo)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      tipoPost === item.tipo 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg">{item.icono}</div>
                    <div className="text-xs mt-1">{item.label}</div>
                  </button>
                ))}
              </div>
              
              <form onSubmit={crearPost} className="space-y-4">
                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({...prev, categoria: e.target.value}))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none"
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({...prev, titulo: e.target.value}))}
                    placeholder={
                      tipoPost === "pelicula" ? "Ej: Recomendación: Home Alone" :
                      tipoPost === "poll" ? "Ej: ¿Cuál es su comida navideña favorita?" :
                      "Título de tu publicación"
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none"
                  />
                </div>

                {/* Contenido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tipoPost === "poll" ? "Descripción (opcional)" : "Contenido *"}
                  </label>
                  <textarea
                    value={formData.contenido}
                    onChange={(e) => setFormData(prev => ({...prev, contenido: e.target.value}))}
                    placeholder={
                      tipoPost === "pelicula" ? "¿Por qué recomiendas esta película?" :
                      tipoPost === "poll" ? "Explica tu encuesta..." :
                      "Comparte tus pensamientos, recuerdos o ideas..."
                    }
                    rows="3"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none"
                  />
                </div>

                {/* Campos específicos por tipo */}
                {tipoPost === "imagen" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar imagen
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImagenSubida(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                    />
                    {imagenSubida && (
                      <div className="mt-2 text-center bg-gray-50 p-3 rounded-lg border-2 border-green-300">
                        <p className="text-sm text-green-600 font-medium">Vista previa:</p>
                        <img 
                          src={URL.createObjectURL(imagenSubida)} 
                          alt="Preview" 
                          className="max-h-32 mx-auto rounded-lg shadow-md mt-2 cursor-pointer"
                          onClick={() => abrirImagenAmpliada(URL.createObjectURL(imagenSubida), "Vista previa")}
                        />
                      </div>
                    )}
                  </div>
                )}

                {tipoPost === "pelicula" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Película que recomiendas
                    </label>
                    <input
                      type="text"
                      value={peliculaSugerida}
                      onChange={(e) => setPeliculaSugerida(e.target.value)}
                      placeholder="Ej: Home Alone, Elf, The Grinch..."
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none"
                    />
                  </div>
                )}

                {tipoPost === "poll" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opciones de la encuesta *
                    </label>
                    <div className="space-y-2">
                      {opcionesPoll.map((opcion, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={opcion}
                            onChange={(e) => actualizarOpcionPoll(index, e.target.value)}
                            placeholder={`Opción ${index + 1}`}
                            className="flex-1 p-2 border border-gray-300 rounded-lg"
                          />
                          {opcionesPoll.length > 2 && (
                            <button
                              type="button"
                              onClick={() => eliminarOpcionPoll(index)}
                              className="bg-red-500 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-600"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {opcionesPoll.length < 6 && (
                        <button
                          type="button"
                          onClick={agregarOpcionPoll}
                          className="text-green-600 text-sm font-medium hover:text-green-700"
                        >
                          + Agregar otra opción
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormPost(false);
                      setFormData({ titulo: "", contenido: "", categoria: "general" });
                      setImagenSubida(null);
                      setPeliculaSugerida("");
                      setOpcionesPoll(["", ""]);
                    }}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.titulo.trim() || subiendoContenido}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      !formData.titulo.trim() || subiendoContenido
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {subiendoContenido ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Publicando...
                      </span>
                    ) : (
                      `📤 Publicar ${tipoPost === "pelicula" ? "Recomendación" : tipoPost === "poll" ? "Encuesta" : ""}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL PARA VER POST COMPLETO */}
        {postSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <button
                  onClick={() => setPostSeleccionado(null)}
                  className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  ✕
                </button>
                
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">{getDatosUsuario(postSeleccionado.usuarioId).avatar}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{postSeleccionado.titulo}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-600">
                        por {getDatosUsuario(postSeleccionado.usuarioId).nombre}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-green-600 font-medium">
                        {getDatosUsuario(postSeleccionado.usuarioId).pais}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {postSeleccionado.fechaFormateada || postSeleccionado.fecha}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 text-lg mb-6 whitespace-pre-wrap break-words">
                  {postSeleccionado.contenido}
                </p>

                {/* Contenido específico en modal */}
                {postSeleccionado.tipo === "poll" && postSeleccionado.opciones && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Resultados:</h4>
                    <div className="space-y-3">
                      {postSeleccionado.opciones.map((opcion, index) => {
                        const totalVotos = postSeleccionado.opciones.reduce((sum, op) => sum + (op.votos || 0), 0);
                        const porcentaje = totalVotos > 0 ? Math.round((opcion.votos / totalVotos) * 100) : 0;
                        
                        return (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium break-words flex-1 mr-2">{opcion.texto}</span>
                              <span className="text-sm text-gray-600 whitespace-nowrap">
                                {opcion.votos || 0} votos ({porcentaje}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${porcentaje}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 🆕 MEJORADO: Comentarios en modal mejor organizados */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Comentarios ({postSeleccionado.comentarios?.length || 0})
                  </h4>
                  {postSeleccionado.comentarios && postSeleccionado.comentarios.length > 0 ? (
                    <div className="space-y-4">
                      {postSeleccionado.comentarios.map((coment, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="text-xl flex-shrink-0">
                              {getDatosUsuario(coment.usuarioId).avatar}
                            </div>
                            
                            {/* Contenido */}
                            <div className="flex-1 min-w-0">
                              {/* Header */}
                              <div className="flex flex-wrap items-baseline gap-2 mb-2">
                                <span className="font-semibold text-gray-800">
                                  {getDatosUsuario(coment.usuarioId).nombre}
                                </span>
                                <span className="text-sm text-green-600 font-medium">
                                  {getDatosUsuario(coment.usuarioId).pais}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {coment.fechaFormateada || coment.fecha}
                                </span>
                              </div>
                              
                              {/* Texto del comentario */}
                              <p className="text-gray-600 break-words leading-relaxed">
                                {coment.texto}
                              </p>
                            </div>
                          </div>
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