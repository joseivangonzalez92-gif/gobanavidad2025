import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { DeviceProvider } from "./context/DeviceContext.jsx";
import PrivateLayout from "./components/PrivateLayout.jsx";
import PublicLanding from "./pages/PublicLanding.jsx";

import Home from "./pages/home.jsx";
import Calendario from "./pages/calendario.jsx";
import Challenges from "./pages/challenges.jsx";
import Fotos from "./pages/fotos.jsx";
import Votaciones from "./pages/votaciones.jsx";
import Admin from "./pages/admin.jsx";
import Login from "./pages/login.jsx";
import Navidad from './pages/navidad.jsx';
import Juegos from './pages/juegos.jsx';
import Rankings from './pages/rankings.jsx';
import Juegos2 from "./pages/juegos2.jsx";
import Perfil from "./pages/perfil.jsx";
import TiendaPage from './pages/tiendapage.jsx';
import Juegos3 from "./pages/juegos3.jsx";
import Snowline from "./pages/Snowline.jsx";
import MidnightDrag from "./pages/MidnightDrag.jsx";
import ArcadeHub from "./pages/ArcadeHub.jsx";

// 🧱 Componente para rutas privadas
function RutaPrivada({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuarioActual") || "null");
  return usuario ? children : <Navigate to="/login" replace />;
}

function App() {
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual') || "null");
    if (usuario && usuario.id && window.gobaService) {
      window.gobaService.iniciarTrackingTiempo(usuario.id);
      console.log("✅ Tracking iniciado para:", usuario.nombre);
    }

    const handleBeforeUnload = () => {
      const u = JSON.parse(localStorage.getItem('usuarioActual') || "null");
      if (u && u.id && window.gobaService) {
        window.gobaService.finalizarTrackingTiempo(u.id);
        console.log("✅ Tracking finalizado para:", u.nombre);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <DeviceProvider>
      <div className="min-h-screen bg-slate-950 text-white relative">
        <Routes>
          {/* 🌟 Página pública principal (adaptada para Compu Glassy y Celular) */}
          <Route path="/" element={<PublicLanding />} />

          {/* 🌈 LOGIN (adaptado para Compu Glassy y Celular) */}
          <Route path="/login" element={<Login />} />

          {/* 🔒 ÁREA PRIVADA (requiere login) */}
          <Route
            path="/*"
            element={
              <RutaPrivada>
                <PrivateLayout>
                  <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/calendario" element={<Calendario />} />
                    <Route path="/challenges" element={<Challenges />} />
                    <Route path="/fotos" element={<Fotos />} />
                    <Route path="/votaciones" element={<Votaciones />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/navidad" element={<Navidad />} />
                    <Route path="/juegos" element={<Juegos />} />
                    <Route path="/rankings" element={<Rankings />} />
                    <Route path="/juegos2" element={<Juegos2 />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/tienda" element={<TiendaPage />} />
                    <Route path="/juegos3" element={<Juegos3 />} />
                    <Route path="/snowline" element={<Snowline />} />
                    <Route path="/drag" element={<MidnightDrag />} />
                    <Route path="/arcade" element={<ArcadeHub />} />
                    
                    {/* ✅ Ruta por defecto para área privada */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </PrivateLayout>
              </RutaPrivada>
            }
          />
        </Routes>
      </div>
    </DeviceProvider>
  );
}

export default App;