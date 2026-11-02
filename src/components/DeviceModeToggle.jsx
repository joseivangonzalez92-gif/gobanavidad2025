import React from 'react';
import { useDevice } from '../context/DeviceContext';

export default function DeviceModeToggle({ className = '' }) {
  const { deviceMode, changeDeviceMode, isDesktop } = useDevice();

  return (
    <div className={`inline-flex items-center gap-1 p-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20 shadow-lg text-xs font-medium text-white/80 ${className}`}>
      <button
        onClick={() => changeDeviceMode('desktop')}
        title="Modo Computadora"
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 ${
          deviceMode === 'desktop' || (deviceMode === 'auto' && isDesktop)
            ? 'bg-red-600/90 text-white font-semibold shadow-md shadow-red-900/50 backdrop-blur-md border border-red-400/40'
            : 'hover:text-white hover:bg-white/10'
        }`}
      >
        <span>💻</span>
        <span className="hidden sm:inline">Computadora</span>
        <span className="sm:hidden">Compu</span>
      </button>

      <button
        onClick={() => changeDeviceMode('mobile')}
        title="Modo Celular (Optimizado para móvil)"
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 ${
          deviceMode === 'mobile' || (deviceMode === 'auto' && !isDesktop)
            ? 'bg-emerald-600/90 text-white font-semibold shadow-md shadow-emerald-900/50 backdrop-blur-md border border-emerald-400/40'
            : 'hover:text-white hover:bg-white/10'
        }`}
      >
        <span>📱</span>
        <span className="hidden sm:inline">Celular</span>
        <span className="sm:hidden">Móvil</span>
      </button>

      <button
        onClick={() => changeDeviceMode('auto')}
        title="Modo Automático según tamaño de pantalla"
        className={`px-2.5 py-1 rounded-full transition-all duration-200 text-[11px] ${
          deviceMode === 'auto'
            ? 'bg-white/20 text-white border border-white/30'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        Auto
      </button>
    </div>
  );
}
