import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  // Obtener usuario actual para personalizar
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual") || "{}");

  // 🆕 NUEVO: Función para calcular días hasta Navidad y Año Nuevo
  const getInfoFechas = () => {
    const ahora = new Date();
    
    // Configurar hora de Honduras (UTC-6)
    const opcionesHonduras = {
      timeZone: 'America/Tegucigalpa',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    
    const fechaHonduras = ahora.toLocaleDateString('es-ES', opcionesHonduras);
    const horaHonduras = ahora.toLocaleTimeString('es-ES', {
      timeZone: 'America/Tegucigalpa',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Calcular días hasta Navidad
    const navidad = new Date(ahora.getFullYear(), 11, 25); // 25 de diciembre
    const diasHastaNavidad = Math.ceil((navidad - ahora) / (1000 * 60 * 60 * 24));
    
    // Calcular días hasta Año Nuevo
    const añoNuevo = new Date(ahora.getFullYear() + 1, 0, 1); // 1 de enero del próximo año
    const diasHastaAñoNuevo = Math.ceil((añoNuevo - ahora) / (1000 * 60 * 60 * 24));

    return {
      fechaFormateada: fechaHonduras,
      hora: horaHonduras,
      diasNavidad: diasHastaNavidad,
      diasAñoNuevo: diasHastaAñoNuevo
    };
  };

  const infoFechas = getInfoFechas();

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
            Diversión, Competencia y Amor!                                         
          </p>
           <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Cerremos con todo este 2025!                                         
          </p>
          
          {/* Stats rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">25</div>
              <div className="text-sm text-gray-600">Categorías</div>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">10 Dic</div>
              <div className="text-sm text-gray-600">Abren Votaciones</div>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">21 Dic</div>
              <div className="text-sm text-gray-600">Cierre votaciones</div>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">30 Dic.</div>
              <div className="text-sm text-gray-600">GOBA Awards</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 NUEVO: Información de fechas */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-gradient-to-r from-green-500 via-red-500 to-purple-500 rounded-2xl p-1 shadow-2xl">
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              
              {/* Fecha actual */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Hoy es</p>
                <p className="font-bold text-gray-800 text-lg leading-tight">
                  {infoFechas.fechaFormateada}
                </p>
              </div>

              {/* Días hasta Navidad */}
              <div className="text-center">
                <div className="text-3xl mb-2">🎄</div>
                <p className="font-bold text-red-600 text-2xl">
                  {infoFechas.diasNavidad} día{infoFechas.diasNavidad !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-gray-600 mb-1">Faltan para Navidad</p>
              </div>

              {/* Días hasta Año Nuevo */}
              <div className="text-center">
                <div className="text-3xl mb-2">🎆</div>
                <p className="font-bold text-purple-600 text-2xl">
                  {infoFechas.diasAñoNuevo} día{infoFechas.diasAñoNuevo !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-gray-600 mb-1">Faltan para Año Nuevo</p>
              </div>

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
                <div className="text-5xl mb-4">🥇</div>
                <h3 className="text-2xl font-bold mb-3">Retos Familiares</h3>
                <p className="text-white/90 mb-4">
                  Completa desafíos divertidos y gana puntos para el ranking familiar
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mt-4">
                <p className="text-sm font-semibold">⭐ Retos semanales</p>
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
                <div className="text-5xl mb-4">🫂</div>
                <h3 className="text-2xl font-bold mb-3">NaviVibes</h3>
                <p className="text-white/90 mb-4">
                  Fotos, Recuerdos y vibra navideña 
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mt-4">
                <p className="text-sm font-semibold">🤗 Nuestra red social privada</p>
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

          {/* Mi Perfil */}
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

          {/* 🎮 JUEGOS 3 - ¡ACTIVADO! */}
          <Link to="/juegos3" className="group">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-8 text-white text-center shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl h-full flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold mb-3">Juegos 3</h3>
                <p className="text-white/90 mb-4">
                  Clásicos reinventados: Pong, Snake, Sopa de Letras y más
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mt-4">
                <p className="text-sm font-semibold">✨ ¡Activo y disponible!</p>
              </div>
            </div>
          </Link>

      

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