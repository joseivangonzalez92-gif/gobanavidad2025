import React from "react";
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";


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

// 🧱 Componente para rutas privadas
function RutaPrivada({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuarioActual") || "null");
  return usuario ? children : <Navigate to="/login" replace />;
}

function App() {
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem("usuarioActual") || "null");

  // Tracking simple sin React
document.addEventListener('DOMContentLoaded', function() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
  if (usuario && usuario.id && window.gobaService) {
    window.gobaService.iniciarTrackingTiempo(usuario.id);
    console.log("✅ Tracking iniciado para:", usuario.nombre);
  }
});

window.addEventListener('beforeunload', function() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
  if (usuario && usuario.id && window.gobaService) {
    window.gobaService.finalizarTrackingTiempo(usuario.id);
    console.log("✅ Tracking finalizado para:", usuario.nombre);
  }
});

  return (
    <div className="min-h-screen bg-white relative">
      <Routes>
        {/* 🌟 Página pública principal */}
        <Route
          path="/"
          element={
            <div>
              <header className="bg-gradient-to-br from-green-50 to-red-50 py-16 px-4 text-center border-b-4 border-red-200 min-h-screen flex items-center justify-center">
                <div className="max-w-4xl mx-auto">
                  <div className="text-8xl mb-6">✨</div>
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                    Navidad Familiar 2025
                  </h1>
                  <p className="text-2xl md:text-3xl text-gray-600 mb-8">
                    La IA te observa portarte bien...
                  </p>

                  <div className="flex justify-center gap-6 mb-10 flex-wrap">
                    <span className="bg-white/80 px-6 py-3 rounded-full shadow-lg text-lg font-semibold text-gray-700">
                      🎁 Diversión
                    </span>
                    <span className="bg-white/80 px-6 py-3 rounded-full shadow-lg text-lg font-semibold text-gray-700">
                      🏆 Competencia
                    </span>
                    <span className="bg-white/80 px-6 py-3 rounded-full shadow-lg text-lg font-semibold text-gray-700">
                      ❤️ Familia
                    </span>
                  </div>

                  <Link
                    to="/login"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-xl py-5 px-12 rounded-lg transition-colors shadow-lg transform hover:scale-105 duration-200"
                  >
                    🎄 Entrar 🎄
                  </Link>

                  <div className="mt-12 bg-white/60 rounded-xl p-6 max-w-2xl mx-auto">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      ¿Qué hay para este año?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                      <div className="text-center">
                        <div className="text-3xl mb-2">🏆</div>
                        <p>GOBA Awards</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-2">🤩</div>
                        <p>Actividades y Retos</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-2">📸</div>
                        <p>Recuerdos Familiares</p>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              <footer className="bg-white border-t border-gray-200 py-8 text-center">
                <p className="text-gray-600">
                  Hecho con <span className="text-red-500">❤️</span> para la familia
                </p>
              </footer>
            </div>
          }
        />

        {/* 🌈 LOGIN (sin navbar) */}
        <Route path="/login" element={<Login />} />

        {/* 🔒 ÁREA PRIVADA (requiere login) */}
        <Route
          path="/*"
          element={
            <RutaPrivada>
              <main className="container mx-auto px-4 py-8 max-w-5xl">
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
                  
                  {/* ✅ Ruta por defecto para área privada */}
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </main>

              {/* Footer */}
              <footer className="bg-white border-t border-gray-200 py-6 text-center mt-12">
                <p className="text-gray-600">
                  Hecho con <span className="text-red-500">❤️</span> para la familia
                </p>
              </footer>

           
          
            </RutaPrivada>
          }
        />
      </Routes>
    </div>
  );
}

export default App;