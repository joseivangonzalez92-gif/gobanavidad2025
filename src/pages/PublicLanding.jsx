import React from 'react';
import { Link } from 'react-router-dom';
import { useDevice } from '../context/DeviceContext';
import DeviceModeToggle from '../components/DeviceModeToggle';

export default function PublicLanding() {
  const { isDesktop } = useDevice();

  if (isDesktop) {
    return (
      <div 
        className="min-h-screen text-white relative font-sans flex flex-col justify-between overflow-x-hidden selection:bg-red-500 selection:text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.74), rgba(10, 15, 29, 0.84)), url('/assets/aistudio/image_3908db64.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Top bar */}
        <header className="px-8 py-5 flex items-center justify-between z-10 backdrop-blur-md bg-black/20 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎮</span>
            <div>
              <span className="font-extrabold tracking-wider text-base text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-200 to-emerald-400">
                ARCADE NAVIDEÑO 2026
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DeviceModeToggle />
            <Link
              to="/login"
              className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:scale-105"
            >
              Iniciar Sesión
            </Link>
          </div>
        </header>

        {/* Center Hero Card */}
        <main className="flex-1 flex items-center justify-center p-6 z-10">
          <div className="max-w-3xl w-full backdrop-blur-2xl bg-black/45 border border-white/20 rounded-3xl p-10 shadow-2xl text-center relative overflow-hidden">
            <div className="text-7xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
              🕹️🎄🎮
            </div>

            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-4">
              Arcade Navideño 2026
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-8 font-light leading-relaxed">
              La plataforma definitiva de juegos navideños para amigos y competidores: <strong className="text-yellow-400 font-semibold">14 minijuegos</strong>, retos diarios, marcadores en tiempo real y premios semanales.
            </p>

            <div className="flex justify-center gap-3 mb-8 flex-wrap">
              <span className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-xs font-semibold text-white border border-white/15">
                🎮 3 Salas de Juegos
              </span>
              <span className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-xs font-semibold text-white border border-white/15">
                🧩 Sopa de Letras 3 Niveles
              </span>
              <span className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-xs font-semibold text-white border border-white/15">
                🏆 Tabla de Récords
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base py-4 px-10 rounded-2xl transition-all shadow-xl shadow-red-900/40 transform hover:scale-105"
              >
                🎮 Entrar a Jugar ➔
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/10 text-left">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="text-2xl mb-1">🎮</div>
                <h4 className="text-xs font-bold text-white">Sala 1: Clásicos</h4>
                <p className="text-[11px] text-white/60 mt-0.5">Memory, Canción, Películas</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="text-2xl mb-1">🕹️</div>
                <h4 className="text-xs font-bold text-white">Sala 2: Minijuegos</h4>
                <p className="text-[11px] text-white/60 mt-0.5">Wordle, Trineo y Reflejos</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="text-2xl mb-1">🎯</div>
                <h4 className="text-xs font-bold text-white">Sala 3: Acción</h4>
                <p className="text-[11px] text-white/60 mt-0.5">Sopa de Letras, Pong, Snake</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-white/50 border-t border-white/10 backdrop-blur-md bg-black/20">
          Arcade Navideño 2026 · Plataforma de Minijuegos y Competición
        </footer>
      </div>
    );
  }

  // Mobile Version
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex flex-col justify-between text-gray-800">
      <div className="p-4 flex items-center justify-between border-b border-red-100 bg-white/80 backdrop-blur-md">
        <span className="font-bold text-sm text-red-600 flex items-center gap-1.5">
          <span>🎮</span>
          <span>Arcade Navideño 2026</span>
        </span>
        <DeviceModeToggle />
      </div>

      <header className="py-12 px-5 text-center flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="text-7xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>🕹️</div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Arcade Navideño 2026
          </h1>
          <p className="text-base text-gray-600 mb-6">
            14 Minijuegos para amigos y retadores. ¡Compite por el podio de campeones!
          </p>

          <div className="flex justify-center gap-2 mb-8 flex-wrap text-xs">
            <span className="bg-white px-3.5 py-1.5 rounded-full shadow-sm font-semibold text-gray-700 border border-gray-100">
              🎮 14 Minijuegos
            </span>
            <span className="bg-white px-3.5 py-1.5 rounded-full shadow-sm font-semibold text-gray-700 border border-gray-100">
              🏆 Rankings
            </span>
            <span className="bg-white px-3.5 py-1.5 rounded-full shadow-sm font-semibold text-gray-700 border border-gray-100">
              ⚡ Diversión
            </span>
          </div>

          <Link
            to="/login"
            className="w-full block bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 px-8 rounded-2xl transition-transform shadow-lg shadow-red-200 active:scale-95"
          >
            🎮 Entrar a Jugar ➔
          </Link>

          <div className="mt-8 bg-white/90 rounded-2xl p-5 border border-red-100 text-left space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Salas de Juego
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                <div className="text-2xl mb-1">🎮</div>
                <p className="font-semibold text-gray-800">Clásicos 1</p>
              </div>
              <div className="bg-pink-50 p-2.5 rounded-xl border border-pink-100">
                <div className="text-2xl mb-1">🕹️</div>
                <p className="font-semibold text-gray-800">Minijuegos 2</p>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                <div className="text-2xl mb-1">🎯</div>
                <p className="font-semibold text-gray-800">Conquista 3</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        Arcade Navideño 2026 · Compite con Amigos
      </footer>
    </div>
  );
}
