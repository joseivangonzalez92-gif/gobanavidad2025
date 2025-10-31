import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gobaService } from '../services/firebaseService';

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [ranking, setRanking] = useState([]); // 🆕 AGREGAMOS RANKING
  const [formData, setFormData] = useState({
    pais: "",
    avatar: "",
    frase: ""
  });

  // 🎨 LISTA COMPLETA DE AVATARES (28 emojis)
  const avatares = [
    '🎅', '🤶', '🦌', '🧝', '🎄', '🎁', '❄️', '🌟', '🧑‍🎄', '🔥', 
    '🐧', '⛷️', '😎', '💫', '❤️', '🥰', '🥁', '🎵', '🍷', '🐻', 
    '🐻‍❄️', '🦊', '🦉', '🐰', '🐦', '🐈', '🎀', '🍪'
  ];

  // 🗺️ LISTA COMPLETA DE PAÍSES FICTICIOS (27 países)
  const paisesFicticios = [
    "República del Café de Mamá",
    "Imperio del Asado Perfecto", 
    "Reino de las Siestas Largas",
    "Reino de los pasteles",
    "Reino de los Renos",
    "República de Tik Tok",
    "Imperio de las Imperiales",
    "Polo Norte",
    "Polo Sur",
    "Reino de la Amistad",
    "Chocolate Land",
    "Isla de los Pinos de Navidad",
    "El Taller de Santa",
    "El País de las Baleadas",
    "Una Galaxia Lejana",
    "Republica de Genovia",
    "Un lugar que no cae Nieve",
    "República de Comayagua",
    "San Fuego Sula",
    "Cerrucigalpa",
    "Jacintooooo",
    "Salvavida Land",
    "Corea del Oeste",
    "JaJaPon",
    "Coca Cola Land", 
    "Pepsi Land",
    "Jumanji"
  ];

  // 🆕 FUNCIÓN PARA OBTENER MIS PUNTOS DESDE EL RANKING
  const obtenerMisPuntos = () => {
    if (!usuario || !ranking.length) return 0;
    
    const miRanking = ranking.find(jugador => jugador.userId === usuario.id);
    return miRanking?.puntosTotales || usuario.puntos || 0;
  };

  // Cargar datos del usuario Y ranking
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuarioRaw = localStorage.getItem('usuarioActual');
        if (!usuarioRaw) {
          navigate("/login");
          return;
        }

        const usuarioLocal = JSON.parse(usuarioRaw);
        setUsuario(usuarioLocal);
        
        // 🆕 CARGAR RANKING PARA OBTENER PUNTOS ACTUALIZADOS
        const rankingData = await gobaService.getRanking();
        setRanking(rankingData);
        
        // Cargar datos actualizados de Firebase
        const usuarioFirebase = await gobaService.obtenerUsuario(usuarioLocal.id);
        if (usuarioFirebase) {
          setUsuario(usuarioFirebase);
          setFormData({
            pais: usuarioFirebase.pais || "",
            avatar: usuarioFirebase.avatar || "👤",
            frase: usuarioFirebase.frase || ""
          });
        } else {
          setFormData({
            pais: usuarioLocal.pais || "",
            avatar: usuarioLocal.avatar || "👤",
            frase: usuarioLocal.frase || ""
          });
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };

    cargarDatos();
  }, [navigate]);

  // Guardar cambios en el perfil
  const guardarCambios = async () => {
    if (!usuario) return;

    setGuardando(true);
    try {
      const exito = await gobaService.actualizarUsuario(usuario.id, {
        pais: formData.pais,
        avatar: formData.avatar,
        frase: formData.frase
      });

      if (exito) {
        const usuarioActualizado = {
          ...usuario,
          pais: formData.pais,
          avatar: formData.avatar,
          frase: formData.frase
        };
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
        setUsuario(usuarioActualizado);
        setEditando(false);
        alert("✅ Perfil actualizado correctamente");
      } else {
        alert("❌ Error al guardar los cambios");
      }
    } catch (error) {
      console.error("Error guardando perfil:", error);
      alert("❌ Error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setFormData({
      pais: usuario?.pais || "",
      avatar: usuario?.avatar || "👤",
      frase: usuario?.frase || ""
    });
    setEditando(false);
  };

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // 🆕 CALCULAR PUNTOS ACTUALES
  const misPuntos = obtenerMisPuntos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-emerald-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">👤 Mi Perfil</h1>
          <p className="text-xl text-gray-600">Personaliza tu identidad navideña</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna 1: Vista previa del perfil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-green-200 sticky top-8">
              <div className="text-center">
                <div className="text-8xl mb-4">{usuario.avatar || "👤"}</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{usuario.nombre}</h2>
                <p className="text-lg text-green-600 font-semibold mb-1">{usuario.pais || "Sin territorio"}</p>
                {usuario.frase && (
                  <p className="text-gray-600 italic mb-4">"{usuario.frase}"</p>
                )}
                
                {/* 🆕 PUNTOS DESDE RANKING - IGUAL QUE EN CHALLENGES */}
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 mt-4 text-center border-2 border-green-200">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-4xl font-bold text-green-600 mb-2">{misPuntos}</p>
                    <p className="text-lg font-semibold text-gray-700">⭐ Puntos de Retos</p>
                    <p className="text-sm text-gray-500 mt-1">Acumulados en challenges</p>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <p className="text-sm text-yellow-700 text-center">
                    💡 Tu código secreto: <strong>{usuario.codigoSecreto}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* El resto de tu código permanece igual */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-blue-200">
              
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editando ? "✏️ Editando Perfil" : "📋 Información Personal"}
                </h2>
                {!editando ? (
                  <button
                    onClick={() => setEditando(true)}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    ✏️ Editar Perfil
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={guardarCambios}
                      disabled={guardando}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {guardando ? "💾 Guardando..." : "✅ Guardar"}
                    </button>
                    <button
                      onClick={cancelarEdicion}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">👤 Nombre</label>
                  <p className="text-gray-800 font-medium">{usuario.nombre}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">🔒 Código Secreto</label>
                  <p className="text-gray-800 font-medium">{usuario.codigoSecreto}</p>
                </div>
              </div>

              {editando && (
                <div className="space-y-6">
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-purple-800 mb-4">🎨 Elige tu Avatar</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
                      {avatares.map((avatar, index) => (
                        <button
                          key={index}
                          onClick={() => setFormData({...formData, avatar})}
                          className={`text-3xl p-3 rounded-xl transition-all ${
                            formData.avatar === avatar 
                              ? 'bg-purple-500 text-white scale-110 border-2 border-purple-600' 
                              : 'bg-white hover:bg-purple-100 border-2 border-purple-100'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                    {formData.avatar && (
                      <p className="text-center mt-4 text-purple-700 font-semibold">
                        Avatar seleccionado: {formData.avatar}
                      </p>
                    )}
                  </div>

                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-green-800 mb-4">🗺️ Tu Territorio Familiar</h3>
                    <select
                      value={formData.pais}
                      onChange={(e) => setFormData({...formData, pais: e.target.value})}
                      className="w-full p-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    >
                      <option value="">Selecciona tu territorio...</option>
                      {paisesFicticios.map((pais, index) => (
                        <option key={index} value={pais}>
                          {pais}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-green-600 mt-2">
                      💡 Este es tu territorio ficticio en el universo GOBA
                    </p>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-800 mb-4">💬 Tu Frase Célebre</h3>
                    <textarea
                      value={formData.frase}
                      onChange={(e) => setFormData({...formData, frase: e.target.value})}
                      placeholder="Ej: 'Eso no se hace así' o tu frase del año..."
                      className="w-full p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows="3"
                      maxLength="100"
                    />
                    <p className="text-sm text-blue-600 mt-2">
                      ✨ {formData.frase.length}/100 caracteres - Esta frase te identifica en la familia
                    </p>
                  </div>
                </div>
              )}

              {!editando && (
                <div className="space-y-6">
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-purple-800 mb-2">🎨 Avatar Actual</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{usuario.avatar || "👤"}</span>
                      <p className="text-gray-700">{usuario.avatar || "Avatar por defecto"}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-green-800 mb-2">🗺️ Territorio Actual</h3>
                    <p className="text-gray-700 text-lg">{usuario.pais || "Aún no tienes territorio asignado"}</p>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-800 mb-2">💬 Frase Personal</h3>
                    <p className="text-gray-700 italic">
                      {usuario.frase || "Aún no tienes una frase célebre..."}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">💡 ¿Cómo funciona?</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Tu avatar y territorio aparecerán en tu perfil público</li>
                  <li>• La frase célebre es opcional pero muy divertida</li>
                  <li>• Los cambios se guardan automáticamente en todos tus dispositivos</li>
                  <li>• ¡Sé creativo y diviértete personalizando tu perfil!</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-center shadow-xl">
              <Link 
                to="/home" 
                className="inline-block bg-white text-purple-600 hover:bg-purple-50 font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 text-lg"
              >
                🏠 Volver al Home Navideño
              </Link>
              <p className="text-white text-sm mt-3 opacity-90">
                Regresa a la diversión familiar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}