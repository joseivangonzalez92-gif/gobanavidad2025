import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileBottomNav() {
  const location = useLocation();

  // 🎮 MODO EXCLUSIVO PLATAFORMA DE JUEGOS 2026 (Secciones no-juegos comentadas para reusar el próximo año)
  const navItems = [
    { to: '/home', label: 'Inicio', icon: '🏠' },
    { to: '/drag', label: 'Drag 1KM', icon: '🏎️' },
    { to: '/snowline', label: 'Snowline', icon: '🎿' },
    { to: '/arcade', label: 'Arcade', icon: '🕹️' },
    { to: '/rankings', label: 'Rankings', icon: '🏆' },
    { to: '/perfil', label: 'Perfil', icon: '👤' },
    /* --- SECCIONES COMENTADAS PARA ACTIVAR EL PRÓXIMO AÑO ---
    { to: '/votaciones', label: 'GOBA', icon: '🏆' },
    { to: '/challenges', label: 'Retos', icon: '🥇' },
    { to: '/fotos', label: 'Fotos', icon: '📸' },
    --------------------------------------------------------- */
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-2 py-1 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[50px] min-h-[44px] ${
                isActive
                  ? 'text-red-600 font-bold scale-105'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="text-lg leading-none mb-0.5">{item.icon}</span>
              <span className="text-[10px] leading-tight tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-0.5"></span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
