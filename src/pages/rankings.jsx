import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

// =========================================================================
// 🎮 CATÁLOGO DE JUEGOS PARA RANKINGS
// =========================================================================
const JUEGOS_CATALOGO = [
  { id: "global", nombre: "🏆 Clasificación Global", icono: "👑", ruta: "/home", sala: "General" },
  { id: "drag-race", nombre: "Midnight Drag 1 KM", icono: "🏎️", ruta: "/drag", sala: "Velocidad" },
  { id: "snowline", nombre: "Snowline (Santa Ride)", icono: "🎿", ruta: "/snowline", sala: "Especial" },
  { id: "carrera-trineo", nombre: "Carrera de Ski Pro", icono: "⛷️", ruta: "/juegos2", sala: "Sala 2" },
  { id: "santa-gifts", nombre: "Santa's Night Drop", icono: "🎅", ruta: "/juegos3", sala: "Sala 3" },
  { id: "territory-wars", nombre: "Territory Wars", icono: "🏰", ruta: "/juegos3", sala: "Sala 3" },
  { id: "wordle-navideno", nombre: "Wordle Navideño", icono: "🔤", ruta: "/juegos2", sala: "Sala 2" },
  { id: "pong", nombre: "Pong Clásico", icono: "🏓", ruta: "/juegos3", sala: "Sala 3" },
  { id: "sopa-letras", nombre: "Sopa de Letras", icono: "🧩", ruta: "/juegos3", sala: "Sala 3" },
  { id: "snake", nombre: "Snake Navideño", icono: "🐍", ruta: "/juegos3", sala: "Sala 3" },
  { id: "click-reaccion", nombre: "Click Reacción", icono: "⚡", ruta: "/juegos2", sala: "Sala 2" },
  { id: "simon-dice", nombre: "Simón Dice", icono: "🎮", ruta: "/juegos2", sala: "Sala 2" },
  { id: "memory-avanzado", nombre: "Memory Avanzado", icono: "🧠", ruta: "/juegos2", sala: "Sala 2" },
  { id: "memory", nombre: "Memory Navideño", icono: "🃏", ruta: "/juegos", sala: "Sala 1" },
  { id: "peliculas", nombre: "Adivina la Película", icono: "🎬", ruta: "/juegos", sala: "Sala 1" },
  { id: "canciones", nombre: "Completa la Canción", icono: "🎵", ruta: "/juegos", sala: "Sala 1" },
  { id: "refranes", nombre: "Refranes Populares", icono: "📖", ruta: "/juegos", sala: "Sala 1" },
];

export default function Rankings() {
  const usuarioActual = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuarioActual") || "null");
    } catch {
      return null;
    }
  }, []);

  const [juegoSeleccionado, setJuegoSeleccionado] = useState("global");
  const [rankingData, setRankingData] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroSala, setFiltroSala] = useState("todos");

  // Cargar puntuaciones del juego seleccionado o globales
  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      setCargando(true);
      try {
        if (juegoSeleccionado === "global") {
          // Obtener rankings de todos los juegos y sumar totales por jugador
          const juegosIds = JUEGOS_CATALOGO.filter(j => j.id !== "global").map(j => j.id);
          const resultados = await Promise.allSettled(
            juegosIds.map(id => gobaService.obtenerRankingJuego(id, 50))
          );

          const mapaJugadores = {};

          resultados.forEach((res, index) => {
            if (res.status === "fulfilled" && Array.isArray(res.value)) {
              const jId = juegosIds[index];
              res.value.forEach(item => {
                const uId = item.usuarioId || item.id;
                if (!uId) return;

                if (!mapaJugadores[uId]) {
                  mapaJugadores[uId] = {
                    usuarioId: uId,
                    nombre: item.nombre || "Jugador",
                    avatar: item.avatar || "👤",
                    puntosTotales: 0,
                    juegosJugados: 0,
                    medallasOro: 0,
                    mejorJuego: "",
                    mejorPuntos: 0,
                  };
                }

                const pts = Number(item.mejorPuntuacion || item.puntuacion || 0);
                mapaJugadores[uId].puntosTotales += pts;
                mapaJugadores[uId].juegosJugados += 1;

                if (pts > mapaJugadores[uId].mejorPuntos) {
                  mapaJugadores[uId].mejorPuntos = pts;
                  const jObj = JUEGOS_CATALOGO.find(j => j.id === jId);
                  mapaJugadores[uId].mejorJuego = jObj ? jObj.nombre : jId;
                }
              });
            }
          });

          const listaGlobal = Object.values(mapaJugadores)
            .sort((a, b) => b.puntosTotales - a.puntosTotales)
            .map((item, idx) => ({ ...item, posicion: idx + 1 }));

          if (activo) {
            setRankingData(listaGlobal);
          }
        } else {
          // Ranking de un juego específico
          const datos = await gobaService.obtenerRankingJuego(juegoSeleccionado, 50);
          if (activo) {
            const ordenada = (datos || [])
              .sort((a, b) => (Number(b.mejorPuntuacion || 0)) - (Number(a.mejorPuntuacion || 0)))
              .map((item, idx) => ({
                usuarioId: item.usuarioId || item.id,
                nombre: item.nombre || "Jugador",
                avatar: item.avatar || "👤",
                mejorPuntuacion: Number(item.mejorPuntuacion || item.puntuacion || 0),
                totalIntentos: item.totalIntentos || 1,
                rachaMaxima: item.rachaMaxima || 0,
                movimientos: item.movimientos || 0,
                fechaUltimoIntento: item.fechaUltimoIntento,
                posicion: idx + 1,
              }));
            setRankingData(ordenada);
          }
        }
      } catch (err) {
        console.error("Error al cargar rankings:", err);
        if (activo) setRankingData([]);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, [juegoSeleccionado]);

  // Filtrar por término de búsqueda
  const listaFiltrada = useMemo(() => {
    if (!busqueda.trim()) return rankingData;
    const q = busqueda.toLowerCase().trim();
    return rankingData.filter(j => (j.nombre || "").toLowerCase().includes(q));
  }, [rankingData, busqueda]);

  // Juego actual seleccionado
  const juegoActual = JUEGOS_CATALOGO.find(j => j.id === juegoSeleccionado) || JUEGOS_CATALOGO[0];

  // Datos del usuario actual en este ranking
  const miRegistro = useMemo(() => {
    if (!usuarioActual) return null;
    return rankingData.find(j => j.usuarioId === usuarioActual.id);
  }, [rankingData, usuarioActual]);

  // Top 3 del ranking actual
  const top1 = listaFiltrada[0];
  const top2 = listaFiltrada[1];
  const top3 = listaFiltrada[2];

  return (
    <div className="min-h-screen text-white select-none pb-16">
      
      {/* =========================================================================
          👑 ENCABEZADO PRINCIPAL DE RANKINGS ARCADE
          ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-2 border-amber-400/40 rounded-3xl p-5 sm:p-8 shadow-2xl mb-6">
        <div className="absolute -right-8 -bottom-8 text-9xl opacity-10 pointer-events-none">🏆</div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
              <span>⭐</span>
              <span>Hall of Fame Navidad 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 tracking-tight">
              TABLA DE CLASIFICACIÓN
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Descubre quiénes lideran los récords en cada juego navideño. ¡Compite con amigos y sube a lo más alto del podio!
            </p>
          </div>

          {/* Tarjeta de estado del usuario logueado */}
          {usuarioActual && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3 shrink-0 shadow-lg">
              <span className="text-3xl">{usuarioActual.avatar || "👤"}</span>
              <div className="text-left">
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Tu Perfil</div>
                <div className="text-sm font-black text-white">{usuarioActual.nombre}</div>
                <div className="text-xs text-slate-300">
                  {miRegistro ? (
                    <span className="text-emerald-300 font-bold">
                      #{miRegistro.posicion} en la tabla ({juegoSeleccionado === "global" ? `${miRegistro.puntosTotales} pts totales` : `${miRegistro.mejorPuntuacion} pts`})
                    </span>
                  ) : (
                    <span className="text-amber-200">Sin récord aún en este juego</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          🕹️ SELECTOR DE JUEGOS Y SALAS
          ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 mb-6 shadow-xl backdrop-blur-md">
        
        {/* Filtro por sala */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold mr-1">Filtrar:</span>
            {[
              { id: "todos", label: "Todos los Juegos" },
              { id: "Especial", label: "Snowline" },
              { id: "Sala 2", label: "Sala 2 (Minijuegos)" },
              { id: "Sala 3", label: "Sala 3 (Conquista)" },
              { id: "Sala 1", label: "Sala 1 (Clásicos)" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFiltroSala(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  filtroSala === tab.id
                    ? "bg-amber-400 text-slate-950 shadow"
                    : "bg-white/5 hover:bg-white/10 text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Buscador de jugador */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✖
              </button>
            )}
          </div>
        </div>

        {/* Grilla de botones de juegos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {JUEGOS_CATALOGO.filter(j => filtroSala === "todos" || j.sala === filtroSala || j.id === "global").map(juego => {
            const activo = juegoSeleccionado === juego.id;
            return (
              <button
                key={juego.id}
                onClick={() => setJuegoSeleccionado(juego.id)}
                className={`p-2.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all transform active:scale-95 border-2 ${
                  activo
                    ? "bg-gradient-to-b from-amber-400 to-yellow-500 text-slate-950 font-black border-amber-300 shadow-lg scale-105 z-10"
                    : "bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-600"
                }`}
              >
                <span className="text-2xl mb-1">{juego.icono}</span>
                <span className="text-[11px] leading-tight font-bold line-clamp-2">
                  {juego.nombre.replace(/^\W+\s*/, "")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          🥇 PODIO DE LOS TOP 3 (ORO, PLATA, BRONCE)
          ========================================================================= */}
      {!cargando && listaFiltrada.length >= 2 && (
        <div className="mb-8">
          <div className="text-center mb-4">
            <h3 className="text-lg font-black text-amber-300 flex items-center justify-center gap-2">
              <span>🌟</span>
              <span>PODIO DE HONOR · {juegoActual.nombre.toUpperCase()}</span>
              <span>🌟</span>
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto items-end pt-4">
            
            {/* 🥈 SEGUNDO LUGAR (PLATA) */}
            {top2 && (
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-400/50 rounded-2xl p-3 text-center shadow-lg relative transform hover:scale-105 transition-transform flex flex-col items-center">
                <span className="absolute -top-4 text-3xl">🥈</span>
                <div className="text-3xl mt-2 mb-1">{top2.avatar || "👤"}</div>
                <div className="text-xs sm:text-sm font-black text-white truncate w-full">{top2.nombre}</div>
                <div className="text-base sm:text-xl font-black text-slate-200 mt-1">
                  {juegoSeleccionado === "global" ? `${top2.puntosTotales}` : `${top2.mejorPuntuacion}`}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">pts</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">2º Lugar</div>
              </div>
            )}

            {/* 🥇 PRIMER LUGAR (ORO) */}
            {top1 && (
              <div className="bg-gradient-to-b from-amber-950 via-yellow-950 to-slate-900 border-2 border-amber-400 rounded-3xl p-4 text-center shadow-2xl relative transform hover:scale-105 transition-transform flex flex-col items-center z-10 -translate-y-2">
                <span className="absolute -top-6 text-4xl animate-bounce">👑</span>
                <div className="text-4xl mt-2 mb-1">{top1.avatar || "👤"}</div>
                <div className="text-sm sm:text-base font-black text-amber-300 truncate w-full">{top1.nombre}</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                  {juegoSeleccionado === "global" ? `${top1.puntosTotales}` : `${top1.mejorPuntuacion}`}
                  <span className="text-xs text-amber-200/80 font-normal ml-1">pts</span>
                </div>
                <div className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase mt-1 shadow">
                  1º Campeón
                </div>
              </div>
            )}

            {/* 🥉 TERCER LUGAR (BRONCE) */}
            {top3 && (
              <div className="bg-gradient-to-b from-amber-950/40 to-slate-900 border-2 border-amber-700/60 rounded-2xl p-3 text-center shadow-lg relative transform hover:scale-105 transition-transform flex flex-col items-center">
                <span className="absolute -top-4 text-3xl">🥉</span>
                <div className="text-3xl mt-2 mb-1">{top3.avatar || "👤"}</div>
                <div className="text-xs sm:text-sm font-black text-white truncate w-full">{top3.nombre}</div>
                <div className="text-base sm:text-xl font-black text-amber-300 mt-1">
                  {juegoSeleccionado === "global" ? `${top3.puntosTotales}` : `${top3.mejorPuntuacion}`}
                  <span className="text-[10px] text-amber-400/60 font-normal ml-1">pts</span>
                </div>
                <div className="text-[10px] text-amber-500 font-bold uppercase mt-1">3º Lugar</div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* =========================================================================
          📋 TABLA COMPLETA DE POSICIONES
          ========================================================================= */}
      <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Cabecera de la tabla */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{juegoActual.icono}</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {juegoActual.nombre}
              </h2>
              <p className="text-[11px] text-slate-400">
                {listaFiltrada.length} jugador{listaFiltrada.length !== 1 ? "es" : ""} registrado{listaFiltrada.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {juegoActual.ruta && juegoActual.id !== "global" && (
            <Link
              to={juegoActual.ruta}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs py-2 px-4 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <span>🎮</span>
              <span>¡Jugar ahora!</span>
            </Link>
          )}
        </div>

        {/* Estado de Carga */}
        {cargando && (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-amber-400 border-t-transparent mb-3"></div>
            <p className="text-slate-400 text-sm font-bold">Cargando puntuaciones de Firebase...</p>
          </div>
        )}

        {/* Sin datos */}
        {!cargando && listaFiltrada.length === 0 && (
          <div className="py-16 text-center px-4">
            <div className="text-5xl mb-3">🎯</div>
            <h3 className="text-lg font-black text-white">Aún no hay récords registrados</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Sé el primer jugador en probar este juego y asegurar tu puesto en el #1 del podio navideño.
            </p>
            {juegoActual.ruta && juegoActual.id !== "global" && (
              <Link
                to={juegoActual.ruta}
                className="mt-4 inline-block bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm py-2.5 px-6 rounded-2xl shadow-lg transition-transform active:scale-95"
              >
                🚀 ¡JUGAR ESTE JUEGO!
              </Link>
            )}
          </div>
        )}

        {/* Filas del ranking */}
        {!cargando && listaFiltrada.length > 0 && (
          <div className="divide-y divide-slate-800">
            {listaFiltrada.map((jugador) => {
              const esMiFila = usuarioActual && jugador.usuarioId === usuarioActual.id;
              const pos = jugador.posicion;

              return (
                <div
                  key={jugador.usuarioId || pos}
                  className={`flex items-center justify-between p-3 sm:p-4 transition-colors ${
                    esMiFila
                      ? "bg-amber-400/10 border-l-4 border-amber-400"
                      : pos === 1
                      ? "bg-yellow-500/5 hover:bg-yellow-500/10"
                      : "hover:bg-slate-800/40"
                  }`}
                >
                  {/* Posición, Avatar y Nombre */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Badge de posición */}
                    <div
                      className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow ${
                        pos === 1
                          ? "bg-amber-400 text-slate-950"
                          : pos === 2
                          ? "bg-slate-300 text-slate-950"
                          : pos === 3
                          ? "bg-amber-700 text-white"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : pos}
                    </div>

                    {/* Avatar */}
                    <span className="text-2xl shrink-0">{jugador.avatar || "👤"}</span>

                    {/* Nombre y detalles */}
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm sm:text-base font-black truncate ${esMiFila ? "text-amber-300" : "text-white"}`}>
                          {jugador.nombre}
                        </span>
                        {esMiFila && (
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                        {juegoSeleccionado === "global" ? (
                          <>
                            <span>🎮 {jugador.juegosJugados} juegos jugados</span>
                            {jugador.mejorJuego && <span>· Mejor en: {jugador.mejorJuego}</span>}
                          </>
                        ) : (
                          <>
                            {jugador.totalIntentos && <span>🎯 {jugador.totalIntentos} intentos</span>}
                            {jugador.rachaMaxima > 0 && <span>· 🔥 Racha: {jugador.rachaMaxima}</span>}
                            {jugador.movimientos > 0 && <span>· ⏱️ {jugador.movimientos} movs</span>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Puntuación */}
                  <div className="text-right shrink-0 pl-3">
                    <div className="text-lg sm:text-2xl font-black text-amber-300">
                      {juegoSeleccionado === "global"
                        ? jugador.puntosTotales?.toLocaleString()
                        : jugador.mejorPuntuacion?.toLocaleString()}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Puntos</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}