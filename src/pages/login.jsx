import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gobaService } from '../services/firebaseService.jsx';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useDevice } from '../context/DeviceContext';
import DeviceModeToggle from '../components/DeviceModeToggle';

export default function Login() {
  const navigate = useNavigate();
  const { isDesktop } = useDevice();
  const [formData, setFormData] = useState({
    nombre: "",
    codigoSecreto: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [userAuth, setUserAuth] = useState(null);

  const auth = getAuth();

  // 🎨🎯 LISTAS DE AVATARES Y PAÍSES FICTICIOS
  const avatares = ['🎅', '🤶', '🦌', '🧝', '🎄', '🎁', '❄️', '🌟','🧑‍🎄','🔥','🐧','⛷️','😎','💫','❤️','🥰','🥁','🎵','🍷','🐻', '🐻‍❄️', '🦊', '🦉', '🐰', '🐦', '🐈','🎀','🍪',];

  const paisesFicticios = [
    "República del Café de Mamá",
    "Imperio del Asado Perfecto", 
    "Reino de las Siestas Largas",
    "Reino de los pasteles",
    "Reino de los Renos",
    "República de Tik Tok",
    "Imperio de las Imperiales",
    "Polo Norte",
    "Polo Sur",
    "Reino de la Amistad",
    "Chocolate Land",
    "Isla de los Pinos de Navidad",
    "El Taller de Santa",
    "El País de las Baleadas",
    "Una Galaxia Lejana",
    "Republica de Genovia",
    "Un lugar que no cae Nieve",
    "República de Comayagua",
    "San Fuego Sula",
    "Cerrucigalpa",
    "Jacintooooo",
    "Salvavida Land",
    "Corea del Oeste",
    "JaJaPon",
    "Coca Cola Land", 
    "Pepsi Land",
    "Jumanji",
  ];

  // 🔥 FUNCIÓN TEMPORAL PARA CREAR ADMIN (eliminar después)
  const crearAdminTemporal = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        'joseivan@goba.com',
        'admin123'
      );
      const uid = userCredential.user.uid;
      alert(`✅ ADMIN CREADO\nUID: ${uid}\n\n🔑 GUARDA ESTE UID PARA LAS REGLAS DE SEGURIDAD!`);
      console.log('🔑 UID DEL ADMIN:', uid);
      
      // Crear también el usuario admin en Firestore
      const usuarioAdmin = {
        id: 'joseivan',
        uid: uid,
        nombre: "José Iván",
        codigoSecreto: "admin",
        esAdmin: true,
        fechaRegistro: new Date().toISOString(),
      };
      
      await gobaService.crearUsuarioAprobado(usuarioAdmin);
      console.log("✅ Usuario admin creado en Firestore");
      
      return uid;
    } catch (error) {
      console.error('Error:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('⚠️ El email ya está registrado. Revisa Firebase Console para obtener el UID.');
      }
      return null;
    }
  };

  // Verificar si ya hay sesión de Firebase Auth (solo internamente)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("✅ Usuario autenticado en Firebase:", user.uid);
        setUserAuth(user);
      } else {
        console.log("❌ No hay usuario autenticado en Firebase");
        setUserAuth(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const generarIdDesdeNombre = (nombre) => {
    return nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

  const handleLogin = async () => {
    const { nombre, codigoSecreto } = formData;

    // Validaciones básicas
    if (!nombre.trim() || !codigoSecreto.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    // ✅ Validación corregida - permitir 4 o 5 caracteres
    if (codigoSecreto.length < 4 || codigoSecreto.length > 5) {
      setError("El código secreto debe tener 4 o 5 caracteres.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      // 1. BUSCAR USUARIO APROBADO en Firestore
      let usuarioAprobado = await gobaService.obtenerUsuarioPorCredenciales(nombre, codigoSecreto);

      // 👑 Reconocimiento directo para Administrador José Iván (evita bloqueos si la base está vacía o sin auth)
      const nombreNorm = nombre.trim().toLowerCase();
      const esAdminMaster = (nombreNorm === 'josé iván' || nombreNorm === 'jose ivan' || nombreNorm === 'admin') && codigoSecreto === 'admin';

      if (!usuarioAprobado && esAdminMaster) {
        console.log("⚡ Acceso directo concedido para Administrador José Iván");
        const usuarioAdmin = {
          id: 'joseivan',
          uid: userAuth ? userAuth.uid : 'qhaGMlTBelQ2e75vwEyDzaFH6ia2',
          nombre: "José Iván",
          codigoSecreto: "admin",
          esAdmin: true,
          avatar: '🎅',
          pais: 'HN',
          puntos: 100
        };
        try {
          await gobaService.crearUsuarioAprobado(usuarioAdmin);
        } catch (e) {
          console.warn("Aviso guardando admin en Firestore:", e);
        }
        usuarioAprobado = usuarioAdmin;
      }

      if (usuarioAprobado) {
        // ✅ USUARIO APROBADO - INICIAR SESIÓN
        
        // Si es el admin, intentar autenticar con Firebase Auth pero sin bloquear si falla
        if (usuarioAprobado.esAdmin) {
          if (!userAuth || userAuth.email !== 'joseivan@goba.com') {
            try {
              await signInWithEmailAndPassword(auth, 'joseivan@goba.com', 'admin123');
              console.log("✅ Admin autenticado en Firebase Auth");
            } catch (authError) {
              console.warn("Aviso de Firebase Auth (continuando con sesión Firestore):", authError);
            }
          }
        }

        let usuarioFinal = {
          id: usuarioAprobado.id || 'usr_' + Date.now(),
          uid: userAuth ? userAuth.uid : usuarioAprobado.uid || (usuarioAprobado.esAdmin ? 'qhaGMlTBelQ2e75vwEyDzaFH6ia2' : 'auth-local'),
          nombre: usuarioAprobado.nombre || nombre.trim(),
          codigoSecreto: usuarioAprobado.codigoSecreto || codigoSecreto,
          esAdmin: usuarioAprobado.esAdmin || false,
          avatar: usuarioAprobado.avatar || '🎅',
          pais: usuarioAprobado.pais || 'HN',
          puntos: usuarioAprobado.puntos || 0
        };

        localStorage.setItem("usuarioActual", JSON.stringify(usuarioFinal));
        console.log("✅ Usuario APROBADO logueado:", usuarioFinal);
        
        // Redirigir
        if (usuarioFinal.esAdmin) {
          navigate("/admin");
        } else {
          navigate("/home");
        }

      } else {
        // ❌ USUARIO NO ENCONTRADO - ENVIAR SOLICITUD DE REGISTRO
        
        // Verificar si ya tiene una solicitud pendiente
        const solicitudExistente = await gobaService.obtenerSolicitudPendientePorNombre(nombre);
        if (solicitudExistente) {
          setError(`⏳ Ya existe una solicitud pendiente para "${nombre}". Espera la aprobación de José Iván.`);
          setCargando(false);
          return;
        }

        const solicitudId = generarIdDesdeNombre(nombre) + '_' + Date.now();
        
        // 🎨🎯 AGREGAR AVATAR Y PAÍS ALEATORIOS
        const avatarAleatorio = avatares[Math.floor(Math.random() * avatares.length)];
        const paisAleatorio = paisesFicticios[Math.floor(Math.random() * paisesFicticios.length)];

        const solicitud = {
          id: solicitudId,
          nombreSolicitado: nombre.trim(),
          codigoSecretoSolicitado: codigoSecreto,
          avatar: avatarAleatorio,
          pais: paisAleatorio,
          frase: "", // vacío por defecto, luego pueden agregar en su perfil
          fechaSolicitud: new Date().toISOString(),
          estado: 'pendiente',
          uid: userAuth ? userAuth.uid : 'anonymous-' + Date.now()
        };

        const exitoSolicitud = await gobaService.crearSolicitudRegistro(solicitud);
        if (exitoSolicitud) {
          setError(`✅ Solicitud enviada para "${nombre.trim()}". ¡Avisa a José Iván para que la apruebe!`);
          // Limpiar formulario
          setFormData({ nombre: "", codigoSecreto: "" });
        } else {
          setError("❌ Error al enviar solicitud. Intenta de nuevo.");
        }
      }

    } catch (error) {
      console.error("❌ Error en login:", error);
      setError("Error al conectar con el servidor. Revisa tu conexión.");
    } finally {
      setCargando(false);
    }
  };

  // Función para limpiar localStorage (solo para debugging)
  const limpiarStorage = () => {
    localStorage.removeItem("usuarios");
    localStorage.removeItem("usuarioActual");
    // Cerrar sesión de Firebase Auth también
    auth.signOut();
    alert("Storage limpiado. Puedes registrarte de nuevo.");
  };

  if (isDesktop) {
    return (
      <div 
        className="min-h-screen text-white relative font-sans flex flex-col justify-between selection:bg-red-500 selection:text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.74), rgba(10, 15, 29, 0.86)), url('/assets/aistudio/image_3908db64.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <header className="px-8 py-4 flex items-center justify-between z-10 backdrop-blur-md bg-black/20 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-red-400 transition-colors">
            <span className="text-2xl">🎄</span>
            <span className="font-extrabold text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-200 to-emerald-400">
              NAVIDAD 2026
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <DeviceModeToggle />
            <Link to="/" className="text-xs text-white/70 hover:text-white px-3 py-1 rounded-full bg-white/10">
              ← Inicio
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 z-10">
          <div className="w-full max-w-md backdrop-blur-2xl bg-black/50 border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="text-center mb-6">
              <div className="text-5xl mb-2 animate-bounce" style={{ animationDuration: '3s' }}>
                🎮🎄🕹️
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Acceso al Arcade 2026
              </h1>
              <p className="text-xs text-white/60 mt-1">
                Ingresa con tu nombre y código secreto para jugar
              </p>
            </div>

            {error && (
              <div className={`p-3 mb-5 rounded-2xl text-center text-xs font-medium border ${
                error.includes('✅') ? 'bg-emerald-900/60 border-emerald-500/40 text-emerald-200' : 
                error.includes('⏳') ? 'bg-blue-900/60 border-blue-500/40 text-blue-200' :
                'bg-red-900/60 border-red-500/40 text-red-200'
              }`}>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/75 mb-1.5 flex items-center gap-2">
                  <span>👤</span>
                  <span>Tu nombre o apodo:</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => {
                    setFormData({ ...formData, nombre: e.target.value });
                    setError("");
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:border-red-400 focus:bg-black/40 focus:outline-none transition-all"
                  placeholder="Ej: 'El Rey del Asado'"
                  disabled={cargando}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/75 mb-1.5 flex items-center gap-2">
                  <span>🔒</span>
                  <span>Tu código secreto (4-5 car.):</span>
                </label>
                <input
                  type="password"
                  value={formData.codigoSecreto}
                  onChange={(e) => {
                    setFormData({ ...formData, codigoSecreto: e.target.value.slice(0, 5) });
                    setError("");
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:border-red-400 focus:bg-black/40 focus:outline-none transition-all tracking-widest font-mono"
                  placeholder="•••••"
                  maxLength={5}
                  disabled={cargando}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={cargando || !formData.nombre.trim() || !formData.codigoSecreto.trim()}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-red-900/40 hover:scale-[1.02] mt-6 flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verificando...</span>
                </>
              ) : (
                '🎮 Entrar al Arcade'
              )}
            </button>

            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-[11px] text-white/40">
                Si aún no tienes usuario aprobado, se enviará una solicitud al ingresar.
              </p>
            </div>
          </div>
        </main>

        <footer className="py-3 text-center text-xs text-white/40 border-t border-white/10 backdrop-blur-md bg-black/20">
          Arcade Navideño 2026 · Versión Computadora
        </footer>
      </div>
    );
  }

  // Mobile Version
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-emerald-50 relative overflow-hidden flex flex-col justify-between">
      <div className="p-3 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <Link to="/" className="text-xs font-bold text-gray-700 flex items-center gap-1">
          <span>←</span>
          <span>Inicio</span>
        </Link>
        <DeviceModeToggle />
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 py-6 flex-1">
        <div className="w-full max-w-sm">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-red-500 to-indigo-600 rounded-3xl shadow-xl p-6 text-center mb-6">
            <div className="text-5xl mb-2">🎮🎄🕹️</div>
            <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
              Arcade Navideño 2026
            </h1>
            <p className="text-white/90 text-xs">
              14 Minijuegos · Rankings & Récords
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-green-200">
            <h2 className="text-lg font-bold text-center mb-4 text-gray-800">
              Acceso de Jugador
            </h2>

            {error && (
              <div className={`p-2.5 mb-3 rounded-xl text-center text-xs font-medium ${
                error.includes('✅') ? 'bg-green-100 text-green-700' : 
                error.includes('⏳') ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1.5 text-xs font-semibold flex items-center gap-1.5">
                  <span>👤</span>
                  <span>Tu nombre o apodo:</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => {
                    setFormData({ ...formData, nombre: e.target.value });
                    setError("");
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none transition-all"
                  placeholder="Ej: 'El Rey del Asado'"
                  disabled={cargando}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1.5 text-xs font-semibold flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>Tu código secreto:</span>
                </label>
                <input
                  type="password"
                  value={formData.codigoSecreto}
                  onChange={(e) => {
                    setFormData({ ...formData, codigoSecreto: e.target.value.slice(0,5)});
                    setError("");
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none transition-all"
                  placeholder="Código (4 o 5 caracteres)"
                  maxLength="5"
                  disabled={cargando}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={cargando || !formData.nombre.trim() || !formData.codigoSecreto.trim()}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md mt-5 flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Conectando...</span>
                </>
              ) : (
                '🎮 Entrar a Jugar'
              )}
            </button>
          </div>
        </div>
      </div>

      <footer className="py-3 text-center text-[11px] text-gray-400 border-t border-gray-200">
        Arcade Navideño 2026 · Versión Celular
      </footer>
    </div>
  );
}