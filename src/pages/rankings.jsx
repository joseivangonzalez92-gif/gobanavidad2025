import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Rankings() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [rankingActivo, setRankingActivo] = useState("general");
  const [usuarios, setUsuarios] = useState([]);

  // Categorías de ranking (sin GOBA)
  const categoriasRanking = [
    {
      id: "general",
      nombre: "🏆 Ranking General",
      descripcion: "Puntuación total en toda la plataforma",
      icono: "🏆",
      color: "from-yellow-500 to-amber-500"
    },
    {
      id: "retos",
      nombre: "🎮 Rey de los Retos", 
      descripcion: "Más puntos en retos familiares",
      icono: "🎮",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "juegos",
      nombre: "🎯 Máster de Juegos",
      descripcion: "Mejores puntuaciones en juegos",
      icono: "🎯",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "actividad",
      nombre: "⭐ Más Activo",
      descripcion: "Mayor participación en la plataforma",
      icono: "⭐",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  // Badges y premios disponibles (sin premios GOBA)
  const badges = [
    { id: "rey_retos", nombre: "👑 Rey de los Retos", descripcion: "Top 1 en retos familiares", rareza: "legendario" },
    { id: "master_juegos", nombre: "🎯 Máster de Juegos", descripcion: "Top 1 en juegos navideños", rareza: "legendario" },
    { id: "activo", nombre: "⚡ Más Activo", descripcion: "Mayor participación general", rareza: "épico" },
    { id: "memory", nombre: "🧠 Memory Master", descripcion: "Completó memory en menos de 12 movimientos", rareza: "raro" },
    { id: "villancico", nombre: "🎵 Rey del Villancico", descripcion: "100% en completar canciones", rareza: "raro" },
    { id: "cinéfilo", nombre: "🎬 Cinéfilo Navideño", descripcion: "Adivinó todas las películas", rareza: "raro" },
    { id: "iniciador", nombre: "🚀 Iniciador", descripcion: "Primer usuario en registrarse", rareza: "común" },
    { id: "participante", nombre: "👍 Participante", descripcion: "Completó al menos 5 retos", rareza: "común" }
  ];

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) {
      window.location.href = "/login";
      return;
    }
    setUsuarioActual(usuario);
    cargarRankings();
  }, []);

  const cargarRankings = () => {
    // Cargar usuarios desde localStorage
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    // Simular datos de ranking (sin puntosVotaciones)
    const usuariosConPuntos = usuariosGuardados.map(usuario => ({
      ...usuario,
      puntosRetos: Math.floor(Math.random() * 200) + 50,
      puntosJuegos: Math.floor(Math.random() * 150) + 30,
      actividad: Math.floor(Math.random() * 50) + 5,
      badges: generarBadgesAleatorios()
    }));

    setUsuarios(usuariosConPuntos);
  };

  const generarBadgesAleatorios = () => {
    const numBadges = Math.floor(Math.random() * 3) + 1;
    const badgesUsuario = [];
    const disponibles = [...badges];
    
    for (let i = 0; i < numBadges; i++) {
      if (disponibles.length > 0) {
        const randomIndex = Math.floor(Math.random() * disponibles.length);
        badgesUsuario.push(disponibles[randomIndex]);
        disponibles.splice(randomIndex, 1);
      }
    }
    
    return badgesUsuario;
  };

  const getRankingData = () => {
    switch (rankingActivo) {
      case "retos":
        return usuarios.sort((a, b) => b.puntosRetos - a.puntosRetos);
      case "juegos":
        return usuarios.sort((a, b) => b.puntosJuegos - a.puntosJuegos);
      case "actividad":
        return usuarios.sort((a, b) => b.actividad - a.actividad);
      case "general":
      default:
        return usuarios.sort((a, b) => 
          (b.puntosRetos + b.puntosJuegos) - 
          (a.puntosRetos + a.puntosJuegos)
        );
    }
  };

  const getPuntosUsuario = (usuario) => {
    switch (rankingActivo) {
      case "retos": return usuario.puntosRetos;
      case "juegos": return usuario.puntosJuegos;
      case "actividad": return usuario.actividad;
      case "general": 
      default:
        return usuario.puntosRetos + usuario.puntosJuegos;
    }
  };

  const getIconoPuesto = (puesto) => {
    switch (puesto) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${puesto}`;
    }
  };

  const getColorPuesto = (puesto) => {
    switch (puesto) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2: return "bg-gradient-to-r from-gray-400 to-gray-600";
      case 3: return "bg-gradient-to-r from-amber-600 to-amber-800";
      default: return "bg-white";
    }
  };

  if (!usuarioActual) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  const rankingData = getRankingData();
  const categoriaActual = categoriasRanking.find(cat => cat.id === rankingActivo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-yellow-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            🏆 Ranking Familiar 2025
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-light">
            Descubre quiénes lideran la diversión navideña en la familia
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Categorías */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-amber-200 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 Categorías
              </h2>
              
              <div className="space-y-2">
                {categoriasRanking.map((categoria) => (
                  <button
                    key={categoria.id}
                    onClick={() => setRankingActivo(categoria.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      rankingActivo === categoria.id
                        ? `bg-gradient-to-r ${categoria.color} text-white shadow-lg transform scale-105`
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{categoria.icono}</span>
                      <div>
                        <div className="font-semibold">{categoria.nombre}</div>
                        <div className="text-sm opacity-80">{categoria.descripcion}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Stats del usuario actual */}
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="font-bold text-amber-800 mb-2">Tu Posición</h3>
                {usuarioActual && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {rankingData.findIndex(user => user.nombre === usuarioActual.nombre) + 1 || "?"}
                    </div>
                    <div className="text-sm text-amber-700">de {rankingData.length} participantes</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Ranking */}
          <div className="lg:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-amber-200">
              
              {/* Header del Ranking */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    {categoriaActual?.icono} {categoriaActual?.nombre}
                  </h2>
                  <p className="text-gray-600">{categoriaActual?.descripcion}</p>
                </div>
                <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-semibold mt-2 md:mt-0">
                  {rankingData.length} Familiares
                </div>
              </div>

              {/* Lista del Ranking */}
              <div className="space-y-3">
                {rankingData.map((usuario, index) => {
                  const puesto = index + 1;
                  const puntos = getPuntosUsuario(usuario);
                  const esUsuarioActual = usuario.nombre === usuarioActual.nombre;
                  
                  return (
                    <div
                      key={usuario.nombre}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        esUsuarioActual 
                          ? 'border-amber-400 bg-amber-50 shadow-lg transform scale-105' 
                          : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                      } ${getColorPuesto(puesto)}`}
                    >
                      {/* Puesto */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                        puesto <= 3 
                          ? 'text-white bg-opacity-90' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {getIconoPuesto(puesto)}
                      </div>

                      {/* Avatar y Nombre */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-2xl">{usuario.avatar}</div>
                        <div>
                          <div className="font-semibold text-gray-800 flex items-center gap-2">
                            {usuario.nombre}
                            {esUsuarioActual && <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">Tú</span>}
                          </div>
                          <div className="text-sm text-gray-600">{usuario.pais}</div>
                        </div>
                      </div>

                      {/* Puntos */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">{puntos} pts</div>
                        <div className="text-sm text-gray-600">
                          {rankingActivo === "general" && "Total"}
                          {rankingActivo === "retos" && "Retos"}
                          {rankingActivo === "juegos" && "Juegos"}
                          {rankingActivo === "actividad" && "Actividad"}
                        </div>
                      </div>

                      {/* Badges */}
                      {usuario.badges.length > 0 && (
                        <div className="flex gap-1">
                          {usuario.badges.slice(0, 2).map((badge, badgeIndex) => (
                            <div
                              key={badgeIndex}
                              className="text-xl"
                              title={`${badge.nombre}: ${badge.descripcion}`}
                            >
                              {badge.nombre.split(' ')[0]} {/* Solo el emoji */}
                            </div>
                          ))}
                          {usuario.badges.length > 2 && (
                            <div className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                              +{usuario.badges.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sección de Badges */}
            <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                🎖️ Badges y Premios
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => {
                  const tieneBadge = usuarios.find(u => 
                    u.nombre === usuarioActual.nombre && 
                    u.badges.some(b => b.id === badge.id)
                  );
                  
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        tieneBadge
                          ? 'border-purple-400 bg-purple-50 shadow-lg'
                          : 'border-gray-200 bg-gray-100 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{badge.nombre.split(' ')[0]}</span>
                        <div>
                          <div className="font-semibold text-gray-800">{badge.nombre}</div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            badge.rareza === 'legendario' ? 'bg-yellow-100 text-yellow-800' :
                            badge.rareza === 'épico' ? 'bg-purple-100 text-purple-800' :
                            badge.rareza === 'raro' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {badge.rareza}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{badge.descripcion}</p>
                      {tieneBadge && (
                        <div className="mt-2 text-xs text-green-600 font-semibold">
                          ✅ Obtenido
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="mt-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-8 text-white text-center shadow-2xl">
          <h2 className="text-2xl font-bold mb-3">📈 ¿Cómo subir en el ranking?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <h3 className="font-bold mb-2">🎮 Juega Más</h3>
              <p className="text-white/90">Cada juego te da puntos. ¡Mejora tus puntuaciones!</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">🏆 Completa Retos</h3>
              <p className="text-white/90">Los retos semanales dan muchos puntos.</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="text-center mt-12">
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ← Volver al Home Navideño
          </Link>
        </div>
      </div>
    </div>
  );
}