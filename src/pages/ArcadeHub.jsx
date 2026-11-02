// src/pages/ArcadeHub.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

export default function ArcadeHub() {
  const [categoria, setCategoria] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const juegos = useMemo(() => [
    {
      id: "drag",
      titulo: "Midnight Drag 1 KM",
      categoria: "velocidad",
      subtitulo: "Need for Speed Drag Style",
      descripcion: "Compite por el récord de tiempo en 1,000 metros. 6 marchas manuales, nitro y esquiva de tráfico.",
      icono: "🏎️",
      color: "from-amber-500 via-orange-600 to-red-600",
      borde: "border-amber-400/50",
      badge: "NUEVO",
      badgeColor: "bg-amber-500 text-slate-950",
      dificultad: "Pro",
      modo: "Time Attack 1v1",
      ruta: "/drag"
    },
    {
      id: "snowline",
      titulo: "Snowline (Santa Ride)",
      categoria: "arcade",
      subtitulo: "Miniclip Clásico de Física",
      descripcion: "Dibuja pistas de nieve con inercia real para guiar a Santa recogiendo regalos hasta la meta.",
      icono: "🎿",
      color: "from-sky-500 via-cyan-600 to-blue-700",
      borde: "border-cyan-400/50",
      badge: "POPULAR",
      badgeColor: "bg-cyan-500 text-white",
      dificultad: "Física",
      modo: "1 Jugador",
      ruta: "/snowline"
    },
    {
      id: "ski",
      titulo: "Carrera de Ski Pro",
      categoria: "velocidad",
      subtitulo: "Slalom & Velocidad en Nieve",
      descripcion: "Esquiva rocas, muñecos de nieve y pinos a más de 100 km/h con controles táctiles simétricos.",
      icono: "⛷️",
      color: "from-red-500 via-rose-600 to-pink-600",
      borde: "border-red-400/50",
      dificultad: "Media",
      modo: "Supervivencia",
      ruta: "/juegos2"
    },
    {
      id: "pong",
      titulo: "Ice Pong Ártico 2026",
      categoria: "arcade",
      subtitulo: "Tenis Neón sobre Hielo",
      descripcion: "Duelo de paletas con power-ups de congelación, bola sónica, sintetizador Web Audio y 3 dificultades.",
      icono: "🏓",
      color: "from-cyan-500 via-teal-600 to-emerald-600",
      borde: "border-cyan-400/50",
      dificultad: "Ajustable",
      modo: "vs Máquina",
      ruta: "/juegos3"
    },
    {
      id: "snake",
      titulo: "Santa's Express Snake",
      categoria: "arcade",
      subtitulo: "Tren Navideño de Caramelo",
      descripcion: "El clásico juego de la serpiente vestido de Navidad con estrellas de Belén, sonido armónico y D-pad móvil.",
      icono: "🐍",
      color: "from-emerald-500 via-green-600 to-teal-700",
      borde: "border-emerald-400/50",
      dificultad: "Progresiva",
      modo: "Clásico",
      ruta: "/juegos3"
    },
    {
      id: "santa-drop",
      titulo: "Santa's Night Drop",
      categoria: "arcade",
      subtitulo: "Lanzamiento de Regalos",
      descripcion: "Lanza regalos desde el trineo a las chimeneas esquivando los duendes ladrones.",
      icono: "🎅",
      color: "from-orange-500 via-red-600 to-rose-700",
      borde: "border-orange-400/50",
      dificultad: "Media",
      modo: "Puntos",
      ruta: "/juegos3"
    },
    {
      id: "territory",
      titulo: "Territory Wars",
      categoria: "estrategia",
      subtitulo: "Control y Conquista",
      descripcion: "Conquista parcelas territoriales y defiende tus sectores en el mapa táctico.",
      icono: "🗺️",
      color: "from-purple-600 via-indigo-700 to-blue-800",
      borde: "border-purple-400/50",
      dificultad: "Estratégico",
      modo: "Equipos",
      ruta: "/juegos3"
    },
    {
      id: "wordle",
      titulo: "Wordle Navideño",
      categoria: "puzzles",
      subtitulo: "5 Palabras por Sesión",
      descripcion: "Descifra palabras navideñas en español en un desafío de 6 intentos por palabra.",
      icono: "🔤",
      color: "from-blue-500 via-indigo-600 to-purple-600",
      borde: "border-blue-400/50",
      dificultad: "Desafiante",
      modo: "Léxico",
      ruta: "/juegos2"
    },
    {
      id: "sopa",
      titulo: "Sopa de Letras",
      categoria: "puzzles",
      subtitulo: "3 Niveles Navideños",
      descripcion: "Encuentra vocabulario navideño en cuadrículas de 8x8, 10x10 y 12x12 contra el reloj.",
      icono: "🧩",
      color: "from-teal-500 via-cyan-600 to-blue-600",
      borde: "border-teal-400/50",
      dificultad: "3 Niveles",
      modo: "Visual",
      ruta: "/juegos3"
    },
    {
      id: "click",
      titulo: "Click Reacción",
      categoria: "velocidad",
      subtitulo: "100 Objetivos Rápidos",
      descripcion: "Pon a prueba tu velocidad de reacción con sonido táctil dinámico y aceleración final.",
      icono: "⚡",
      color: "from-yellow-500 via-amber-600 to-orange-600",
      borde: "border-amber-400/50",
      dificultad: "Reflejos",
      modo: "30 Segundos",
      ruta: "/juegos2"
    },
    {
      id: "simon",
      titulo: "Simón Dice Musical",
      categoria: "puzzles",
      subtitulo: "Campanas Navideñas Afinadas",
      descripcion: "Memoriza secuencias de colores acompañadas de tonos de campana en escala armónica.",
      icono: "🎮",
      color: "from-green-500 via-emerald-600 to-teal-700",
      borde: "border-green-400/50",
      dificultad: "Memoria",
      modo: "Auditivo",
      ruta: "/juegos2"
    },
    {
      id: "memory-pro",
      titulo: "Memory Avanzado",
      categoria: "puzzles",
      subtitulo: "20 Pares de Cartas",
      descripcion: "Encuentra todos los pares idénticos minimizando fallos y tiempo de resolución.",
      icono: "🧠",
      color: "from-indigo-500 via-purple-600 to-pink-600",
      borde: "border-indigo-400/50",
      dificultad: "Avanzado",
      modo: "Memoria",
      ruta: "/juegos2"
    },
    {
      id: "memory-classic",
      titulo: "Memory Navideño",
      categoria: "puzzles",
      subtitulo: "Pares de Emojis Clásicos",
      descripcion: "Versión rápida de memoria con iconos temáticos navideños para calentar.",
      icono: "🃏",
      color: "from-purple-500 via-pink-600 to-rose-600",
      borde: "border-purple-400/50",
      dificultad: "Fácil",
      modo: "Casual",
      ruta: "/juegos"
    },
    {
      id: "peliculas",
      titulo: "Adivina la Película",
      categoria: "trivia",
      subtitulo: "Jeroglíficos con Emojis",
      descripcion: "Identifica grandes clásicos del cine a través de combinaciones creativas de emojis.",
      icono: "🎬",
      color: "from-blue-600 via-cyan-700 to-teal-800",
      borde: "border-blue-400/50",
      dificultad: "Cine",
      modo: "Individual",
      ruta: "/juegos"
    },
    {
      id: "canciones",
      titulo: "Completa la Canción",
      categoria: "trivia",
      subtitulo: "Letras de Villancicos",
      descripcion: "Pon a prueba tu oído navideño completando la estrofa correcta de canciones populares.",
      icono: "🎵",
      color: "from-emerald-600 via-green-700 to-teal-800",
      borde: "border-emerald-400/50",
      dificultad: "Musical",
      modo: "Individual",
      ruta: "/juegos"
    },
    {
      id: "refranes",
      titulo: "Refranes Populares",
      categoria: "trivia",
      subtitulo: "Dichos y Sabiduría Popular",
      descripcion: "Completa los refranes populares más conocidos en un divertido formato individual.",
      icono: "📖",
      color: "from-amber-600 via-orange-700 to-rose-800",
      borde: "border-amber-400/50",
      dificultad: "Cultura",
      modo: "Individual",
      ruta: "/juegos"
    }
  ], []);

  const categorias = [
    { id: "todos", label: "Todos (16)" },
    { id: "velocidad", label: "🏎️ Velocidad" },
    { id: "arcade", label: "🕹️ Arcade" },
    { id: "puzzles", label: "🧩 Puzzles" },
    { id: "trivia", label: "📖 Trivia" },
    { id: "estrategia", label: "🗺️ Estrategia" },
  ];

  const juegosFiltrados = useMemo(() => {
    return juegos.filter(j => {
      const matchCat = categoria === "todos" || j.categoria === categoria;
      const matchBusqueda =
        j.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.subtitulo.toLowerCase().includes(busqueda.toLowerCase());
      return matchCat && matchBusqueda;
    });
  }, [juegos, categoria, busqueda]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 text-white">
      {/* BANNER PRINCIPAL */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-amber-600 rounded-3xl p-6 mb-6 shadow-2xl border border-white/20 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 text-9xl opacity-15 pointer-events-none">
          🎮
        </div>
        <div className="relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            Plataforma de Minijuegos 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2">
            Catálogo Completo de Juegos Arcade
          </h1>
          <p className="text-sm text-white/90 max-w-xl">
            16 juegos individuales con rankings globales en tiempo real. Sin límites diarios: juega, practica y supera tus marcas personales.
          </p>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y CATEGORÍAS */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar juego (ej: Drag, Pong, Snowline, Wordle)..."
            className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl py-3 px-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition shadow-inner"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-3 text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Píldoras de Filtro */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoria(cat.id)}
              className={`text-xs px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition active:scale-95 ${
                categoria === cat.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-300/40"
                  : "bg-slate-900 border border-slate-800 text-gray-300 hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE JUEGOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {juegosFiltrados.map((juego) => (
          <div
            key={juego.id}
            className={`bg-slate-900/90 backdrop-blur-md border ${juego.borde} rounded-3xl p-5 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all relative overflow-hidden group`}
          >
            {/* Badge especial si tiene */}
            {juego.badge && (
              <span className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${juego.badgeColor} shadow-md`}>
                {juego.badge}
              </span>
            )}

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${juego.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {juego.icono}
                </div>
                <div>
                  <h3 className="font-black text-base text-white leading-tight">
                    {juego.titulo}
                  </h3>
                  <p className="text-[11px] text-cyan-300 font-semibold">
                    {juego.subtitulo}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                {juego.descripcion}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="bg-slate-800 px-2 py-0.5 rounded-md font-medium text-gray-300">
                  {juego.dificultad}
                </span>
                <span className="bg-slate-800 px-2 py-0.5 rounded-md font-medium text-gray-300">
                  {juego.modo}
                </span>
              </div>

              <Link
                to={juego.ruta}
                className={`bg-gradient-to-r ${juego.color} text-white text-xs font-black py-2 px-4 rounded-xl shadow-md active:scale-95 transition-transform hover:opacity-95`}
              >
                ¡JUGAR! ▶
              </Link>
            </div>
          </div>
        ))}
      </div>

      {juegosFiltrados.length === 0 && (
        <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800">
          <span className="text-4xl mb-2 block">🔍</span>
          <p className="text-gray-300 font-bold">No se encontraron juegos con ese criterio</p>
          <button
            onClick={() => { setCategoria("todos"); setBusqueda(""); }}
            className="mt-3 text-xs text-cyan-400 underline font-bold"
          >
            Ver todos los juegos
          </button>
        </div>
      )}
    </div>
  );
}
