import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import DeviceModeToggle from './DeviceModeToggle';

export default function GlassyNavbar({ usuario }) {
  const location = useLocation();

  // 🎮 MODO EXCLUSIVO PLATAFORMA DE JUEGOS 2026 (Secciones no-juegos comentadas para reusar el próximo año)
  const links = [
    { to: '/home', label: 'Arcade Hub', icon: '🏠' },
    { to: '/snowline', label: 'Snowline', icon: '🎿' },
    { to: '/juegos', label: 'Clásicos 1', icon: '🎮' },
    { to: '/juegos2', label: 'Minijuegos 2', icon: '🕹️' },
    { to: '/juegos3', label: 'Conquista 3', icon: '🎯' },
    { to: '/rankings', label: 'Rankings', icon: '🏆' },
    /* --- SECCIONES COMENTADAS PARA ACTIVAR EL PRÓXIMO AÑO ---
    { to: '/votaciones', label: 'GOBA Awards', icon: '🏆' },
    { to: '/challenges', label: 'Retos', icon: '🥇' },
    { to: '/fotos', label: 'Fotos', icon: '📸' },
    { to: '/tienda', label: 'Tienda', icon: '🛍️' },
    { to: '/navidad', label: 'Adviento', icon: '🕯️' },
    { to: '/calendario', label: 'Calendario', icon: '📅' },
    --------------------------------------------------------- */
  ];

  if (usuario?.rol === 'admin') {
    links.push({ to: '/admin', label: 'Admin', icon: '⚙️' });
  }

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 py-2.5 backdrop-blur-xl bg-slate-950/80 border-b border-white/15 text-white shadow-xl flex items-center justify-between gap-4">
      {/* Zone 1: Brand & Back to Home */}
      <div className="flex items-center gap-3 shrink-0">
        <Link 
          to="/home" 
          className="flex items-center gap-2 group text-white hover:text-red-400 transition-colors"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🎄</span>
          <span className="font-extrabold tracking-tight text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-200 to-emerald-400">
            NAVIDAD 2026 · ARCADE
          </span>
        </Link>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/15 backdrop-blur-md overflow-x-auto max-w-2xl">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-900/50'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Zone 3: User & Device Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <DeviceModeToggle />

        <Link
          to="/perfil"
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white transition-colors"
        >
          <span className="text-sm">{usuario?.avatar || '👤'}</span>
          <span className="font-semibold max-w-[90px] truncate hidden md:inline">{usuario?.nombre || 'Perfil'}</span>
          <span className="text-amber-300 font-bold ml-0.5">{usuario?.puntos || 0} pts</span>
        </Link>

        <Link
          to="/home"
          className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-xs text-white border border-white/20 font-medium transition-colors"
        >
          ← Inicio
        </Link>
      </div>
    </header>
  );
}
