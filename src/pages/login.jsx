import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gobaService } from '../services/firebaseService';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const navigate = useNavigate();
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
      const usuarioAprobado = await gobaService.obtenerUsuarioPorCredenciales(nombre, codigoSecreto);

      if (usuarioAprobado) {
        // ✅ USUARIO APROBADO - INICIAR SESIÓN
        
        // Si es el admin, asegurarse de que esté autenticado con Firebase Auth
        if (usuarioAprobado.esAdmin) {
          if (!userAuth || userAuth.email !== 'joseivan@goba.com') {
            try {
              await signInWithEmailAndPassword(auth, 'joseivan@goba.com', 'admin123');
              console.log("✅ Admin autenticado en Firebase Auth");
            } catch (authError) {
              console.error("Error autenticando admin:", authError);
              setError("❌ Error de autenticación admin. Contacta al desarrollador.");
              setCargando(false);
              return;
            }
          }
        }

        let usuarioFinal = {
          id: usuarioAprobado.id,
          uid: userAuth ? userAuth.uid : usuarioAprobado.uid || 'no-auth',
          nombre: usuarioAprobado.nombre,
          codigoSecreto: usuarioAprobado.codigoSecreto,
          esAdmin: usuarioAprobado.esAdmin || false,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-emerald-50 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl">🎄</div>
        <div className="absolute top-40 right-12 text-4xl">⭐</div>
        <div className="absolute bottom-40 left-12 text-5xl">🎁</div>
        <div className="absolute bottom-20 right-16 text-3xl">🔔</div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-red-500 to-green-600 rounded-3xl shadow-xl p-8 text-center mb-8">
            <div className="text-6xl mb-4">🎄🥳✨</div>
            <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
              Navidad Familiar 2025
            </h1>
            <p className="text-white/90 text-lg">
              La IA te observa portarte bien...
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-green-200">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Entrar o pedir acceso
            </h2>

            {error && (
              <div className={`p-3 mb-4 rounded-xl text-center font-medium ${
                error.includes('✅') ? 'bg-green-100 text-green-700' : 
                error.includes('⏳') ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-3 font-semibold flex items-center gap-2">
                  <span>👤</span>
                  <span>Tu nombre o apodo:</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => {
                    setFormData({ ...formData, nombre: e.target.value });
                    setError(""); // Limpiar error al escribir
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="Ej: 'El Rey del Asado'"
                  disabled={cargando}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-3 font-semibold flex items-center gap-2">
                  <span>🔒</span>
                  <span>Tu código secreto:</span>
                </label>
                <input
                  type="password"
                  value={formData.codigoSecreto}
                  onChange={(e) => {
                    setFormData({ ...formData, codigoSecreto: e.target.value.slice(0,5)});
                    setError(""); // Limpiar error al escribir
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="Ingresa tu código (4 o 5 caracteres)"
                  maxLength="5"
                  disabled={cargando}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={cargando || !formData.nombre.trim() || !formData.codigoSecreto.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none mt-6 flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Conectando...
                </>
              ) : (
                ' "Entrar" '
              )}
            </button>
          </div>

          {/* DEBUG: Botón para limpiar storage */}
          <div className="text-center mt-4">
            <button 
              onClick={limpiarStorage}
              className="text-xs text-gray-500 underline"
              disabled={cargando}
            >
              ¿Problemas? Limpiar datos y cerrar sesión
            </button>
          </div>

          {/* Seguridad */}
          <div className="mt-6 bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <span>🔒</span>
              <span>Seguridad Familiar</span>
            </h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Sistema de aprobación activado</li>
              <li>• Solo usuarios autorizados</li>
              <li>• Espera aprobación si es tu primera vez</li>
            </ul>
          </div>

          {/* Info Firebase */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}