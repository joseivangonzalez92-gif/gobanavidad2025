import React from 'react';
import { useLocation } from 'react-router-dom';
import { useDevice } from '../context/DeviceContext';
import GlassyNavbar from './GlassyNavbar';
import MobileBottomNav from './MobileBottomNav';

export default function PrivateLayout({ children }) {
  const { isDesktop } = useDevice();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  const isHome = location.pathname === '/home';

  if (isHome) {
    return (
      <div className="relative">
        {children}
        {!isDesktop && <MobileBottomNav />}
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div 
        className="min-h-screen text-white relative font-sans antialiased overflow-x-hidden selection:bg-red-500 selection:text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.76), rgba(10, 15, 29, 0.86)), url('/assets/aistudio/image_3908db64.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <GlassyNavbar usuario={usuario} />
        <main className="desktop-view-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    );
  }

  // Mobile layout for other views (optimizado para arcade y sin barras blancas en los juegos)
  const isGameRoute = ['/snowline', '/juegos', '/juegos2', '/juegos3'].includes(location.pathname);
  const isSnowline = location.pathname === '/snowline';

  return (
    <div className={`min-h-screen ${isGameRoute ? 'bg-slate-950 text-white' : 'bg-slate-50 text-gray-900'} pb-20 relative`}>
      <main className={isSnowline ? 'w-full px-0 py-0' : 'container mx-auto px-2 sm:px-3 py-2 sm:py-4 max-w-xl'}>
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
