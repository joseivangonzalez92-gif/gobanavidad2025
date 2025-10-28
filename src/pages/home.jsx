import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  // Obtener usuario actual para personalizar
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual") || "{}");

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuarioActual');
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-green-50">
      {/* Hero Section */}
      <div className="text-center py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-8xl mb-6">🎄✨</div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            ¡Hola {usuarioActual.nombre || "Familia"}!
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Diversión, Competencia y Experiencia Familiar unica!!!!                                          Cerremos con todo este 2025!
          </p>
          
          {/* Stats rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">25</div>
              <div className="text-sm text-gray-600">Categorías</div>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">25</div>
              <div className="text-sm text-gray-600">Retos Activos</div>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Diversión</div>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">Familiar</div>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones de la App */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          🎁 Explora Todas las Secciones
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* GOBA Awards */}
          <Link 
            to="/votaciones" 
            className="group"
          >
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-8 text-white text-center shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-full flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold mb-3">GOBA Awards 2025</h3>
                <p className="text-white/90 mb-4">
                  Vota y nominá en las 25 categorías más divertidas de la familia
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mt-4">
                <p className="text-sm font-semibold">🎭 Fase de Nominaciones Activa</p>
              </div>
            </div>
          </Link>

          {/* Retos Familiares */}
          <Link 
            to="/challenges" 
            className="group"
          >
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 text-white text-center shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-full flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold mb-3">Retos Familiares</h3>
                <p className="text-white/90 mb-4">
                  Completa desafíos divertidos y gana puntos para el ranking familiar
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mt-4">
                <p className="text-sm font-semibold">⭐ {usuarioActual.puntos || 0} puntos acumulados</p>
              </div>
            </div>
          </Link>

          {/* Calendario y Actividades */}
          <Link 
            to="/calendario" 
            className="group"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white text-center shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-full flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-2xl font-bold mb-3">Calendario y Actividades</h3>
                <p className="text-white/90 mb-4">
                  No te pierdas ninguna fecha especial en Nov y Dic. 
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mt-4">
                <p className="text-sm font-semibold">🎄 Fechas importantes</p>
              </div>
            </div>
          </Link>

          {/* Galería de Recuerdos */}
          <Link 
            to="/fotos" 
            className="group"
          >
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 text-white text-center shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-full flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-4">📸</div>
                <h3 className="text-2xl font-bold mb-3">Galería de Recuerdos</h3>
                <p className="text-white/90 mb-4">
                  Revive los mejores momentos familiares de navidades pasadas
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mt-4">
                <p className="text-sm font-semibold">❤️ Momentos especiales</p>
              </div>
            </div>
          </Link>

          {/* Ranking Familiar */}
          <Link to="/rankings" className="group">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-8 text-white text-center shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-full flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold mb-3">Ranking Familiar</h3>
                <p className="text-white/90 mb-4">
                  Mira quién lidera la diversión navideña en la familia
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mt-4">
                <p className="text-sm font-semibold">🎖️ Badges y premios</p>
              </div>
            </div>
          </Link>

          {/* Adviento 2025 */}
          <Link 
            to="/navidad" 
            className="group"
          >
            <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl p-8 text-white text-center shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-full flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-4">🎄</div>
                <h3 className="text-2xl font-bold mb-3">Adviento2025</h3>
                <p className="text-white/90 mb-4">
                  Calendario de Adviento, villancicos y reflexiones
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mt-4">
                <p className="text-sm font-semibold">✨2025✨</p>
              </div>
            </div>
          </Link>

          {/* Zona de Juegos */}
          <Link to="/juegos" className="group">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white text-center shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-full flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold mb-3">Zona de Juegos</h3>
                <p className="text-white/90 mb-4">
                  5 juegos navideños divertidos para competir en familia
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mt-4">
                <p className="text-sm font-semibold">🏆 Ranking familiar</p>
              </div>
            </div>
          </Link>

          {/* Mi Perfil - AHORA ES UN LINK */}
          <Link 
            to="/perfil" 
            className="group"
          >
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white text-center shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-full flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-4">{usuarioActual.avatar || "👤"}</div>
                <h3 className="text-2xl font-bold mb-3">Mi Perfil</h3>
                <div className="space-y-2 text-white/90 text-left">
                  <p><strong>Nombre:</strong> {usuarioActual.nombre || "Invitado"}</p>
                  <p><strong>Territorio:</strong> {usuarioActual.pais || "Por asignar"}</p>
                  <p><strong>Puntos:</strong> {usuarioActual.puntos || 0} ⭐</p>
                  {usuarioActual.frase && (
                    <p><strong>Frase:</strong> "{usuarioActual.frase}"</p>
                  )}
                </div>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mt-4">
                <p className="text-sm font-semibold">✨ Personalizar perfil</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Información adicional */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-2xl border-2 border-green-200">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">📢 Información Importante</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-green-600">🗳️ GOBA Awards</h4>
              <ul className="space-y-2">
                <li>• Fase de Nominaciones: Hasta 10 Dic</li>
                <li>• Fase de Votación: 12-20 Dic</li>
                <li>• Gran Gala: 31 Dic</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-blue-600">🎮 Retos Activos</h4>
              <ul className="space-y-2">
                <li>• Retos disponibles todas las semanas </li>
                <li>• Puntos por completar</li>
                <li>• Ranking familiar en tiempo real</li>
                <li>• ¡Gana premios y sorpresas!</li>
              </ul>
            </div>
          </div>

          {/* BOTÓN DE CERRAR SESIÓN */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <button 
              onClick={handleCerrarSesion}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-base"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}