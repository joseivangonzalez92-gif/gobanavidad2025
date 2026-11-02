import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DeviceModeToggle from './DeviceModeToggle';

export default function MobileDashboard({ usuario, infoFechas, onLogout }) {
  // Mobile Quick To-Do de Juegos
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('goba_glassy_todos');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      { id: 1, text: 'Encontrar las 6 palabras en la Sopa de Letras', completed: false },
      { id: 2, text: 'Vencer a la máquina en Pong Navideño', completed: true },
      { id: 3, text: 'Esquivar obstáculos en Carrera de Trineo', completed: false },
    ];
  });

  const toggleTodo = (id) => {
    const updated = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTodos(updated);
    localStorage.setItem('goba_glassy_todos', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-green-50 pb-24 text-gray-800">
      
      {/* Mobile Top App Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link to="/perfil" className="text-2xl p-1 bg-red-100 rounded-full border border-red-200">
            {usuario?.avatar || '👤'}
          </Link>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">
              ¡Hola, {usuario?.nombre?.split(' ')[0] || 'Jugador'}!
            </h1>
            <p className="text-[11px] text-gray-500 flex items-center gap-1">
              <span>{usuario?.pais || 'Honduras'}</span>
              <span>·</span>
              <span className="text-amber-600 font-bold">{usuario?.puntos || 0} pts</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DeviceModeToggle />
        </div>
      </div>

      {/* Main Mobile Content */}
      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">

        {/* Hero Countdown Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 pointer-events-none">
            🎮
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-white/80 bg-white/20 px-2.5 py-0.5 rounded-full">
                Arcade Navideño 2026
              </span>
              <span className="text-xs text-white/90 font-medium">
                {infoFechas?.fechaFormateada}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20 text-center">
                <div className="text-2xl mb-0.5">🎄</div>
                <div className="text-2xl font-black">{infoFechas?.diasNavidad ?? 0}</div>
                <div className="text-[10px] text-white/80 uppercase tracking-wide">Días para Navidad</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20 text-center">
                <div className="text-2xl mb-0.5">🏆</div>
                <div className="text-2xl font-black">14</div>
                <div className="text-[10px] text-white/80 uppercase tracking-wide">Juegos Listos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Horizontal Carousel of Modules */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Salas de Juegos
            </h2>
            <span className="text-[11px] text-gray-400">Desliza 👉</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
            <Link
              to="/drag"
              className="flex-shrink-0 w-28 bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl p-3 text-center border-2 border-amber-400 shadow-md active:scale-95 transition-transform relative"
            >
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full shadow">
                NUEVO
              </span>
              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-red-500 text-white flex items-center justify-center text-xl mb-1.5 shadow-sm">
                🏎️
              </div>
              <div className="text-xs font-black text-amber-950 truncate">Drag 1KM</div>
              <div className="text-[10px] text-orange-700 font-bold">NFS Style</div>
            </Link>

            <Link
              to="/arcade"
              className="flex-shrink-0 w-28 bg-gradient-to-b from-purple-50 to-indigo-50 rounded-2xl p-3 text-center border-2 border-purple-400 shadow-md active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xl mb-1.5 shadow-sm">
                🕹️
              </div>
              <div className="text-xs font-black text-purple-950 truncate">Catálogo Hub</div>
              <div className="text-[10px] text-purple-700 font-bold">16 Juegos</div>
            </Link>

            <Link
              to="/snowline"
              className="flex-shrink-0 w-28 bg-gradient-to-b from-sky-50 to-cyan-50 rounded-2xl p-3 text-center border-2 border-cyan-300 shadow-md active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500 text-white flex items-center justify-center text-xl mb-1.5 shadow-sm">
                🎿
              </div>
              <div className="text-xs font-black text-cyan-900 truncate">Snowline</div>
              <div className="text-[10px] text-cyan-700 font-bold">Miniclip Clásico</div>
            </Link>

            <Link
              to="/juegos"
              className="flex-shrink-0 w-28 bg-white rounded-2xl p-3 text-center border border-purple-100 shadow-md active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl mb-1.5 shadow-inner">
                🎮
              </div>
              <div className="text-xs font-bold text-gray-800 truncate">Clásicos 1</div>
              <div className="text-[10px] text-purple-600 font-medium">Memory/Canción</div>
            </Link>

            <Link
              to="/juegos2"
              className="flex-shrink-0 w-28 bg-white rounded-2xl p-3 text-center border border-pink-100 shadow-md active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl mb-1.5 shadow-inner">
                🕹️
              </div>
              <div className="text-xs font-bold text-gray-800 truncate">Minijuegos 2</div>
              <div className="text-[10px] text-pink-600 font-medium">Wordle/Trineo</div>
            </Link>

            <Link
              to="/juegos3"
              className="flex-shrink-0 w-28 bg-white rounded-2xl p-3 text-center border border-blue-100 shadow-md active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-1.5 shadow-inner">
                🎯
              </div>
              <div className="text-xs font-bold text-gray-800 truncate">Conquista 3</div>
              <div className="text-[10px] text-blue-600 font-medium">Sopa/Pong/Snake</div>
            </Link>

            <Link
              to="/juegos3"
              className="flex-shrink-0 w-28 bg-white rounded-2xl p-3 text-center border border-green-100 shadow-md active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl mb-1.5 shadow-inner">
                🧩
              </div>
              <div className="text-xs font-bold text-gray-800 truncate">Sopa Letras</div>
              <div className="text-[10px] text-green-600 font-medium">3 Niveles</div>
            </Link>

            <Link
              to="/rankings"
              className="flex-shrink-0 w-28 bg-white rounded-2xl p-3 text-center border border-amber-100 shadow-md active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl mb-1.5 shadow-inner">
                🏆
              </div>
              <div className="text-xs font-bold text-gray-800 truncate">Rankings</div>
              <div className="text-[10px] text-amber-600 font-medium">Puntuaciones</div>
            </Link>

            <Link
              to="/perfil"
              className="flex-shrink-0 w-28 bg-white rounded-2xl p-3 text-center border border-indigo-100 shadow-md active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl mb-1.5 shadow-inner">
                👤
              </div>
              <div className="text-xs font-bold text-gray-800 truncate">Perfil</div>
              <div className="text-[10px] text-indigo-600 font-medium">Tus Puntos</div>
            </Link>

            {/* SECCIONES COMENTADAS PARA EL PRÓXIMO AÑO:
            <Link to="/votaciones">GOBA</Link>
            <Link to="/challenges">Retos</Link>
            <Link to="/fotos">Fotos</Link>
            <Link to="/navidad">Adviento</Link>
            <Link to="/calendario">Calendario</Link>
            <Link to="/tienda">Tienda</Link>
            */}
          </div>
        </div>

        {/* Featured Big Cards - SALAS DE JUEGOS */}
        <div className="space-y-3">
          {/* 🌟 JUEGO ESTRELLA: SNOWLINE MINICLIP */}
          <Link
            to="/snowline"
            className="block bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 rounded-3xl p-5 text-white shadow-xl active:scale-[0.99] transition-transform relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase bg-white/25 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  ★ Miniclip Clásico Oficial
                </span>
                <h3 className="text-xl font-black leading-snug flex items-center gap-2">
                  <span>🎿 Snowline</span>
                  <span className="text-xs bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-bold">10 Niveles</span>
                </h3>
                <p className="text-xs text-white/90 mt-1">
                  Dibuja la nieve con el lápiz para guiar el trineo de Santa, recoge regalos y llega a la meta.
                </p>
              </div>
              <span className="text-3xl ml-3">➔</span>
            </div>
          </Link>

          {/* 1. Sala 1 - Clásicos */}
          <Link
            to="/juegos"
            className="block bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl mb-1 inline-block">🎮</span>
                <h3 className="text-lg font-bold leading-snug">Sala 1: Juegos Clásicos</h3>
                <p className="text-xs text-white/80 mt-1">
                  Memory Navideño, Adivina la Película, Canciones y Refranes
                </p>
              </div>
              <span className="text-xl text-white/60">➔</span>
            </div>
          </Link>

          {/* 2. Sala 2 - Minijuegos & Reflejos */}
          <Link
            to="/juegos2"
            className="block bg-gradient-to-br from-pink-600 to-rose-700 rounded-3xl p-5 text-white shadow-lg active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl mb-1 inline-block">🕹️</span>
                <h3 className="text-lg font-bold leading-snug">Sala 2: Minijuegos & Reflejos</h3>
                <p className="text-xs text-white/80 mt-1">
                  Wordle Navideño, Simón Dice, Carrera de Trineo y Reflejos
                </p>
              </div>
              <span className="text-xl text-white/60">➔</span>
            </div>
          </Link>

          {/* 3. Sala 3 - Conquista & Acción */}
          <Link
            to="/juegos3"
            className="block bg-gradient-to-br from-blue-600 to-cyan-700 rounded-3xl p-5 text-white shadow-lg active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl mb-1 inline-block">🎯</span>
                <h3 className="text-lg font-bold leading-snug">Sala 3: Conquista & Acción</h3>
                <p className="text-xs text-white/80 mt-1">
                  Sopa de Letras 3 Niveles, Pong Navideño, Snake y Santa Gifts
                </p>
              </div>
              <span className="text-xl text-white/60">➔</span>
            </div>
          </Link>

          {/* 4. Tabla de Récords y Rankings */}
          <Link
            to="/rankings"
            className="block bg-gradient-to-br from-amber-600 to-orange-700 rounded-3xl p-5 text-white shadow-lg active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl mb-1 inline-block">🏆</span>
                <h3 className="text-lg font-bold leading-snug">Tabla de Récords & Rankings</h3>
                <p className="text-xs text-white/80 mt-1">
                  Descubre quién va en 1er lugar y compite por la corona
                </p>
              </div>
              <span className="text-xl text-white/60">➔</span>
            </div>
          </Link>

          {/* SECCIONES COMENTADAS PARA EL PRÓXIMO AÑO:
          <Link to="/votaciones">GOBA Awards</Link>
          <Link to="/challenges">Retos</Link>
          <Link to="/fotos">Galería de Fotos</Link>
          <Link to="/navidad">Adviento</Link>
          <Link to="/calendario">Calendario</Link>
          <Link to="/tienda">Tienda</Link>
          */}
        </div>

        {/* Mobile To-Do section */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <span>📋</span>
              <span>Retos Pendientes</span>
            </h3>
            <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              {todos.filter(t => !t.completed).length} pendientes
            </span>
          </div>

          <div className="space-y-2">
            {todos.map(todo => (
              <div
                key={todo.id}
                onClick={() => toggleTodo(todo.id)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                  todo.completed
                    ? 'bg-gray-50 border-gray-200 text-gray-400 line-through'
                    : 'bg-white border-gray-200 text-gray-800 shadow-sm active:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => {}}
                  className="accent-red-600 w-4 h-4 rounded cursor-pointer"
                />
                <span className="flex-1">{todo.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout button */}
        <div className="pt-2 pb-6 text-center">
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-2xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </div>
    </div>
  );
}
