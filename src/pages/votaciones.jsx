import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { gobaService } from '../services/firebaseService';

export default function Votaciones() {
  const navigate = useNavigate();
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [nominaciones, setNominaciones] = useState({});
  const [faseActual, setFaseActual] = useState("nominaciones");
  const [loading, setLoading] = useState(true);
  const [modalVotacionAbierto, setModalVotacionAbierto] = useState(false);
  const [categoriaVotando, setCategoriaVotando] = useState(null);
  const [finalistasVotando, setFinalistasVotando] = useState([]);

  // 25 Categorías divertidas para los GOBA Awards
  const categoriasGOBA = [
    { id: 1, nombre: "😴 El más dormilón del año", descripcion: "Quien aprovecha cualquier sillón o cama disponible" },
    { id: 2, nombre: "👩‍🍳 Chef Oficial de la Familia", descripcion: "El rey/reina de la cocina" },
    { id: 3, nombre: "🗣️ El que más habla de política", descripcion: "Siempre tiene opinión sobre todo" },
    { id: 4, nombre: "📸 Rey/Reina del Selfie", descripcion: "Siempre listo para la foto perfecta" },
    { id: 5, nombre: "🎮 Adicto a los Videojuegos", descripcion: "No suelta el control ni para comer" },
    { id: 6, nombre: "☕ Dependiente del Café", descripcion: "Sin su taza matutina no es persona" },
    { id: 7, nombre: "🐕 Mejor Amigo de las Mascotas", descripcion: "Todos los animales lo aman" },
    { id: 8, nombre: "📚 Sabiondo/Sabionda Familiar", descripcion: "Siempre tiene un dato curioso" },
    { id: 9, nombre: "🎤 Estrella del Karaoke", descripcion: "Domina el micrófono en las reuniones" },
    { id: 10, nombre: "🛋️ Dueño/a del Control Remoto", descripcion: "Decide qué vemos en la TV" },
    { id: 11, nombre: "😂 Payaso Oficial de la Familia", descripcion: "Siempre nos hace reír" },
    { id: 12, nombre: "📱 Adicto al Celular", descripcion: "Pegado al teléfono 24/7" },
    { id: 13, nombre: "🛌 Rey/Reina de la Siesta", descripcion: "Maestro del descanso estratégico" },
    { id: 14, nombre: "🍫 Goloso/a Empedernido/a", descripcion: "Debilidades por los dulces" },
    { id: 15, nombre: "🎄 Espíritu Navideño Todo el Año", descripcion: "Siempre en modo festivo" },
    { id: 16, nombre: "📅 Organizador/a Nato/a", descripcion: "Todo lo tiene planificado" },
    { id: 17, nombre: "🚗 Piloto Familiar", descripcion: "Siempre dispuesto a llevar a todos" },
    { id: 18, nombre: "💸 Prestamista No Oficial", descripcion: "Todos le piden prestado" },
    { id: 19, nombre: "🎭 Dramático/a por Excelencia", descripcion: "Convive todo en una telenovela" },
    { id: 20, nombre: "🏆 Competitivo/a Nato/a", descripcion: "Hasta en juegos de mesa es intenso" },
    { id: 21, nombre: "📖 Contador de Historias", descripcion: "Tiene anécdotas para todo" },
    { id: 22, nombre: "🎵 DJ Familiar No Oficial", descripcion: "Controla la música en reuniones" },
    { id: 23, nombre: "🍕 Devorador de Pizza", descripcion: "Récord en porciones consumidas" },
    { id: 24, nombre: "🌅 Madrugador Incansable", descripcion: "Productivo desde el amanecer" },
    { id: 25, nombre: "🎁 Mejor Dando Regalos", descripcion: "Siempre acierta con los detalles" }
  ];

  // Lista de nombres de familia para sugerencias
  const nombresFamilia = [
    "Montserrat", "José Manuel", "Raquel", "Luisa", "Andrés", 
    "José Iván", "Mariana", "Ruth", "Reny", "Gabriela", 
    "Olivia", "Rafael", "Paolo", "Isabella", "Camila", 
    "Santiago", "Mateo", "Valeria", "Sebastián", "Abuelita"
  ];

  // Función para normalizar nombres y evitar duplicados
  const normalizarNombre = (nombre) => {
    let nombreNormalizado = nombre
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, ' ')
      .replace(/[^a-záéíóúñ\s]/g, '');

    const mapeosApodos = {
      'montse': 'montserrat', 'monse': 'montserrat', 'montser': 'montserrat',
      'chema': 'josé manuel', 'jose manuel': 'josé manuel', 'josemanuel': 'josé manuel',
      'raque': 'raquel', 'lui': 'luisa', 'luis': 'luisa', 'andre': 'andrés',
      'jose ivan': 'josé iván', 'joseivan': 'josé iván', 'ivan': 'josé iván',
      'marian': 'mariana', 'mary': 'mariana', 'rut': 'ruth', 'reni': 'reny',
      'gaby': 'gabriela', 'gabriel': 'gabriela', 'rafa': 'rafael',
      'bella': 'isabella', 'isa': 'isabella', 'cami': 'camila', 'mila': 'camila',
      'santi': 'santiago', 'santo': 'santiago', 'mate': 'mateo', 'teo': 'mateo',
      'vale': 'valeria', 'valerie': 'valeria', 'sebas': 'sebastián', 'seba': 'sebastián',
    };

    const apodoEncontrado = Object.keys(mapeosApodos).find(apodo => nombreNormalizado === apodo);
    if (apodoEncontrado) {
      nombreNormalizado = mapeosApodos[apodoEncontrado];
    }

    return nombreNormalizado;
  };

  // Genera un Set de nombres permitidos normalizados
  const normalizedAllowedNames = useMemo(() => {
    const allowed = new Set();
    nombresFamilia.forEach(name => allowed.add(normalizarNombre(name)));
    return allowed;
  }, [nombresFamilia]);

  // Verificar y preparar usuario actual
  const prepararUsuarioActual = (usuarioRaw) => {
    if (!usuarioRaw) {
      navigate("/login");
      return null;
    }
    
    let usuario = JSON.parse(usuarioRaw);
    
    if (!usuario.id) {
      console.error("❌ Usuario sin ID válido:", usuario);
      alert("Error: Tu usuario no tiene identificación válida. Contacta al administrador.");
      navigate("/login");
      return null;
    }

    if (!usuario.nombre || !usuario.codigoSecreto) {
      console.error("❌ Usuario no aprobado o datos incompletos:", usuario);
      alert("Error: Tu usuario no está completamente configurado. Contacta al administrador.");
      navigate("/login");
      return null;
    }

    console.log("✅ Usuario preparado correctamente:", usuario);
    return usuario;
  };

  // Cargar datos al iniciar
  useEffect(() => {
    const initializeVotaciones = async () => {
      try {
        setLoading(true);
        const usuarioRaw = localStorage.getItem('usuarioActual');
        const usuario = prepararUsuarioActual(usuarioRaw);
        
        if (!usuario) return;

        setUsuarioActual(usuario);
        await cargarTodasNominaciones();
        determinarFaseActual();

        const unsubscribeNominaciones = gobaService.escucharNominaciones((nuevasNominaciones) => {
          console.log("🔄 Actualización en tiempo real:", nuevasNominaciones);
          procesarNominacionesCombinadas(nuevasNominaciones);
        });

        return () => {
          if (unsubscribeNominaciones) {
            unsubscribeNominaciones();
          }
        };
      } catch (error) {
        console.error("Error inicializando votaciones:", error);
        alert("Error al cargar las votaciones. Recarga la página.");
      } finally {
        setLoading(false);
      }
    };

    initializeVotaciones();
  }, [navigate]);

// Función para procesar y combinar nominaciones - CORREGIDA
const procesarNominacionesCombinadas = (nominacionesDeFirebase) => {
  const todasNominacionesCombinadas = {};
  
  // CORRECCIÓN: Convertir objeto Firebase a array
  const nominacionesArray = Array.isArray(nominacionesDeFirebase) 
    ? nominacionesDeFirebase 
    : Object.values(nominacionesDeFirebase || {});
  
  nominacionesArray.forEach(doc => {
    if (doc && doc.nominaciones) {
      if (typeof doc.nominaciones !== 'object' || Array.isArray(doc.nominaciones)) {
        console.warn(`Skipping invalid nominaciones type for doc ${doc.id}`);
        return;
      }

      Object.keys(doc.nominaciones).forEach(categoriaId => {
        if (!todasNominacionesCombinadas[categoriaId]) {
          todasNominacionesCombinadas[categoriaId] = [];
        }
        
        const nominacionesUsuarioEnCategoria = doc.nominaciones[categoriaId];
        if (Array.isArray(nominacionesUsuarioEnCategoria)) {
          nominacionesUsuarioEnCategoria.forEach(nominacion => {
            if (nominacion && nominacion.persona) {
              todasNominacionesCombinadas[categoriaId].push(nominacion);
            }
          });
        }
      });
    }
  });
  
  console.log("📊 Nominaciones combinadas:", todasNominacionesCombinadas);
  setNominaciones(todasNominacionesCombinadas);
};

// Cargar todas las nominaciones desde Firebase - MANTENER IGUAL
const cargarTodasNominaciones = async () => {
  try {
    const todasNominaciones = await gobaService.obtenerTodasNominaciones();
    console.log("📥 Nominaciones cargadas desde Firebase:", todasNominaciones);
    procesarNominacionesCombinadas(todasNominaciones); // ✅ Ahora funcionará
  } catch (error) {
    console.error('Error cargando nominaciones:', error);
    const nominacionesGuardadas = JSON.parse(localStorage.getItem('nominacionesGOBA') || '{}');
    setNominaciones(nominacionesGuardadas);
  }
};

  // FECHAS AUTOMÁTICAS
  const determinarFaseActual = () => {
    const hoy = new Date();
    const fechaFinNominaciones = new Date('2025-12-10T23:59:59');
    const fechaInicioVotaciones = new Date('2025-12-11T00:00:00');
    const fechaFinVotaciones = new Date('2025-12-22T23:59:59');

    if (hoy < fechaFinNominaciones) {
      setFaseActual("nominaciones");
    } else if (hoy >= fechaInicioVotaciones && hoy <= fechaFinVotaciones) {
      setFaseActual("votacion");
    } else {
      setFaseActual("resultados");
    }
  };

  // Nominar múltiples personas
  const nominarMultiplesPersonas = (categoriaId, categoriaNombre) => {
    if (!usuarioActual) {
      alert("❌ Debes iniciar sesión para nominar");
      return;
    }

    const nominacionesCategoria = nominaciones[categoriaId] || [];
    const misNominacionesEnCategoria = nominacionesCategoria.filter(n => 
      n && n.nominador && normalizarNombre(n.nominador) === normalizarNombre(usuarioActual.nombre)
    );

    if (misNominacionesEnCategoria.length >= 3) {
      alert("❌ Ya has nominado a 3 personas en esta categoría");
      return;
    }

    const nominacionesRestantes = 3 - misNominacionesEnCategoria.length;
    const sugerencias = nombresFamilia.join(', ');
    
    const persona = prompt(
      `¿A quién quieres nominar para "${categoriaNombre}"?\n\n` +
      `💡 Solo puedes nominar a personas de la lista familiar. Sugerencias: ${sugerencias}\n` +
      `📝 Puedes nominar hasta ${nominacionesRestantes} persona(s) más\n\n` +
      `(Los apodos y nombres con acentos se normalizan automáticamente)`
    );

    if (persona && persona.trim()) {
      nominarPersona(categoriaId, persona.trim());
    }
  };

  // Función principal para nominar persona
  const nominarPersona = async (categoriaId, personaNominada) => {
    if (!usuarioActual || !usuarioActual.id) {
      alert("❌ Error: No se pudo identificar tu usuario. Recarga la página o inicia sesión.");
      return;
    }

    const usuarioId = usuarioActual.id;
    
    if (!personaNominada || personaNominada.trim().length < 2) {
      alert("❌ Por favor ingresa un nombre válido (mínimo 2 caracteres)");
      return;
    }

    const nombreNormalizado = normalizarNombre(personaNominada);
    const nombreOriginal = personaNominada.trim();

    // Validación estricta de nombres permitidos
    if (!normalizedAllowedNames.has(nombreNormalizado)) {
      alert(`❌ ¡"${nombreOriginal}" no es un nombre válido para nominar! Por favor, usa un nombre de la lista familiar.`);
      return;
    }

    try {
      // 1. Obtener nominaciones actuales del usuario
      const todasNominaciones = await gobaService.obtenerTodasNominaciones();
      const miDocumento = todasNominaciones[usuarioId];
      
      let nominacionesUsuarioActual = {};
      if (miDocumento && miDocumento.nominaciones) {
        nominacionesUsuarioActual = limpiarDatosParaFirebase(miDocumento.nominaciones);
      }

      // 2. Inicializar estructura si no existe
      if (!nominacionesUsuarioActual[categoriaId]) {
        nominacionesUsuarioActual[categoriaId] = [];
      }
      
      // 3. Verificar límites y duplicados
      const misNominacionesEnCategoria = nominacionesUsuarioActual[categoriaId].filter(n => 
        n && n.nominador && normalizarNombre(n.nominador) === normalizarNombre(usuarioActual.nombre)
      );
      
      if (misNominacionesEnCategoria.length >= 3) {
        alert("❌ Ya has nominado a 3 personas en esta categoría");
        return;
      }

      const yaNominadoEstaPersona = misNominacionesEnCategoria.find(n => 
        n && n.persona && normalizarNombre(n.persona) === nombreNormalizado
      );
      
      if (yaNominadoEstaPersona) {
        alert("❌ Ya nominaste a esta persona en esta categoría");
        return;
      }

      // 4. Buscar nombre estandarizado en todas las nominaciones
      let nombreParaMostrar = nombreOriginal;
      for (const userId in todasNominaciones) {
        const doc = todasNominaciones[userId];
        if (doc.nominaciones && doc.nominaciones[categoriaId]) {
          const personaExistente = doc.nominaciones[categoriaId].find(n => 
            n && n.persona && normalizarNombre(n.persona) === nombreNormalizado
          );
          if (personaExistente) {
            nombreParaMostrar = personaExistente.persona;
            break;
          }
        }
      }

      // 5. Crear objeto de nominación
      const nuevaNominacion = {
        persona: nombreParaMostrar,
        personaNormalizada: nombreNormalizado,
        nominador: usuarioActual.nombre,
        fecha: new Date().toISOString(),
        usuarioId: usuarioId
      };

      nominacionesUsuarioActual[categoriaId].push(nuevaNominacion);

      // 6. Limpiar y guardar
      const nominacionesLimpias = limpiarDatosParaFirebase(nominacionesUsuarioActual);

      console.log("💾 Guardando nominaciones:", {
        usuarioId: usuarioId,
        usuarioNombre: usuarioActual.nombre,
        nominacionesAGuardar: nominacionesLimpias
      });

      const exito = await gobaService.guardarNominaciones(usuarioId, nominacionesLimpias);

      if (exito) {
        alert(`✅ ¡Nominación exitosa! Nominaste a "${nombreParaMostrar}"`);
        await cargarTodasNominaciones();
      } else {
        alert('❌ Error al guardar la nominación. Intenta nuevamente.');
      }
    } catch (error) {
      console.error("🔥 Error crítico al guardar nominaciones:", error);
      alert('❌ Error crítico al guardar. Revisa la consola para más detalles.');
    }
  };

  // Función para limpiar datos para Firebase
  const limpiarDatosParaFirebase = (datos) => {
    const limpiarObjeto = (obj) => {
      if (obj === null || obj === undefined) {
        return obj;
      }
      if (typeof obj !== 'object') {
        return obj;
      }
      if (obj instanceof Date) {
        return obj.toISOString();
      }
      if (Array.isArray(obj)) {
        return obj.map(item => 
          typeof item === 'object' && item !== null && !Array.isArray(item) ? limpiarObjeto(item) : item
        ).filter(item => item !== undefined && item !== null);
      }
      const limpio = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const valorLimpiado = limpiarObjeto(obj[key]);
          if (valorLimpiado !== undefined && valorLimpiado !== null) {
            limpio[key] = valorLimpiado;
          }
        }
      }
      return limpio;
    };
    return limpiarObjeto(datos);
  };

  // FUNCIÓN PARA CONTAR NOMINACIONES
  const getMisNominacionesTotales = () => {
    if (!usuarioActual) return 0;
    let count = 0;
    Object.values(nominaciones).forEach(noms => {
      if (noms && Array.isArray(noms)) {
        const misNoms = noms.filter(n => 
          n && n.nominador && normalizarNombre(n.nominador) === normalizarNombre(usuarioActual.nombre)
        );
        count += misNoms.length;
      }
    });
    return count;
  };

  // Obtener mis nominaciones por categoría
  const getMisNominacionesPorCategoria = (categoriaId) => {
    if (!usuarioActual) return [];
    const nominacionesCategoria = nominaciones[categoriaId] || [];
    return nominacionesCategoria.filter(n => 
      n && n.nominador && normalizarNombre(n.nominador) === normalizarNombre(usuarioActual.nombre)
    );
  };

  // Obtener finalistas para votación (TOP 3)
  const obtenerFinalistas = (categoriaId) => {
    const nominacionesCategoria = nominaciones[categoriaId] || [];
    
    const finalistas = [...nominacionesCategoria]
      .filter(nom => nom)
      .reduce((acc, nom) => {
        if (!nom.persona) return acc;

        const nombreNormalizado = normalizarNombre(nom.persona);
        if (!normalizedAllowedNames.has(nombreNormalizado)) {
          return acc;
        }

        const existente = acc.find(item => 
          item && item.personaNormalizada && item.personaNormalizada === nombreNormalizado
        );
        if (existente) {
          existente.votos++;
          if (nom.persona.length > existente.persona.length) {
            existente.persona = nom.persona;
          }
        } else {
          acc.push({ 
            persona: nom.persona, 
            votos: 1,
            personaNormalizada: nombreNormalizado
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.votos - a.votos)
      .slice(0, 3);

    return finalistas;
  };

  // 🆕 FUNCIÓN: Abrir modal de votación secreta
  const abrirModalVotacion = (categoria) => {
    const finalistas = obtenerFinalistas(categoria.id);
    
    if (finalistas.length === 0) {
      alert("❌ Esta categoría no tiene finalistas para votar");
      return;
    }

    setCategoriaVotando(categoria);
    setFinalistasVotando(finalistas);
    setModalVotacionAbierto(true);
  };

  // 🆕 FUNCIÓN: Realizar voto secreto
  const realizarVotoSecreto = async (finalista) => {
    if (!usuarioActual || !categoriaVotando) return;

    // Validar con código secreto
    const codigo = prompt(`🔒 ${usuarioActual.nombre}, ingresa tu código secreto para votar en:\n"${categoriaVotando.nombre}"`);
    
    if (!codigo) {
      alert("❌ Necesitas ingresar tu código secreto");
      return;
    }

    if (codigo !== usuarioActual.codigoSecreto) {
      alert("❌ Código secreto incorrecto");
      return;
    }

    // GUARDAR VOTO EN FIREBASE (secreto)
    try {
      await gobaService.guardarVoto(usuarioActual.id, categoriaVotando.id, finalista.persona);
      alert(`✅ ¡Voto SECRETO registrado para "${finalista.persona}"!\n\nLos resultados se revelarán en la Gran Gala 🎭`);
      setModalVotacionAbierto(false);
    } catch (error) {
      console.error("Error guardando voto:", error);
      alert("❌ Error al guardar voto. Intenta nuevamente.");
    }
  };

  // 🆕 COMPONENTE: Modal de Votación Secreta
  const ModalVotacionSecreta = () => {
    if (!modalVotacionAbierto || !categoriaVotando) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🗳️ Votación Secreta</h2>
            <h3 className="text-xl text-purple-600 font-semibold">{categoriaVotando.nombre}</h3>
            <p className="text-gray-600 mt-2">Tu voto es 100% anónimo y secreto</p>
          </div>

          <div className="space-y-3 mb-6">
            {finalistasVotando.map((finalista, index) => (
              <button
                key={index}
                onClick={() => realizarVotoSecreto(finalista)}
                className="w-full bg-white border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl p-4 text-left transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-800">{finalista.persona}</div>
                    <div className="text-sm text-gray-500">{finalista.votos} nominaciones</div>
                  </div>
                  <span className="text-2xl">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-purple-700 text-center">
              🔒 <strong>Voto Secreto:</strong> Nadie verá tu elección hasta la Gran Gala
            </p>
          </div>

          <button
            onClick={() => setModalVotacionAbierto(false)}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando votaciones...</p>
        </div>
      </div>
    );
  }

  if (!usuarioActual) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Error de acceso</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a las votaciones</p>
          <Link 
            to="/login" 
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Volver a Login
          </Link>
        </div>
      </div>
    );
  }

  const misNominacionesTotales = getMisNominacionesTotales();
  const maxNominacionesPosibles = categoriasGOBA.length * 3;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🗳️ GOBA Awards 2025</h1>
        
        {/* Indicador de Fase Automática */}
        <div className="flex justify-center mb-6">
          <div className="bg-white border-2 border-purple-200 rounded-xl p-3 inline-flex">
            <div className={`px-6 py-2 rounded-lg font-medium ${
              faseActual === "nominaciones" 
                ? "bg-purple-500 text-white" 
                : "bg-gray-200 text-gray-600"
            }`}>
              🎭 Fase de Nominaciones
            </div>
            <div className={`px-6 py-2 rounded-lg font-medium ${
              faseActual === "votacion" 
                ? "bg-purple-500 text-white" 
                : "bg-gray-200 text-gray-600"
            }`}>
              🗳️ Fase de Votación
            </div>
          </div>
        </div>

        <p className="text-xl text-gray-600 mb-6">
          {faseActual === "nominaciones" 
            ? "Premios a lo más destacado (y divertido) de la familia" 
            : "🔒 Votación Secreta - Los resultados son sorpresa"}
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white shadow-lg">
            <h2 className="text-lg font-bold mb-2">🏆 Categorías</h2>
            <p className="text-2xl font-bold">{categoriasGOBA.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-4 text-white shadow-lg">
            <h2 className="text-lg font-bold mb-2">
              {faseActual === "nominaciones" ? "⭐ Mis Nominaciones" : "✅ Listo para Votar"}
            </h2>
            <p className="text-2xl font-bold">
              {faseActual === "nominaciones" ? `${misNominacionesTotales || 0}/${maxNominacionesPosibles}` : "¡Ya!"}
            </p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
            <h2 className="text-lg font-bold mb-2">⏰ Fecha Límite</h2>
            <p className="text-lg font-bold">
              {faseActual === "nominaciones" ? "10 Dic 2025" : "22 Dic 2025"}
            </p>
          </div>
        </div>
      </div>

      {/* FASE DE NOMINACIONES */}
      {faseActual === "nominaciones" && (
        <>
          {/* Información importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-yellow-800 mb-3">📝 Cómo Funciona - Fase de Nominaciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-700">
              <div>
                <p className="font-semibold">Fase 1: Nominaciones (Hasta 10 Dic)</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Cada persona puede nominar hasta 3 personas por categoría</li>
                  <li>• No puedes nominar a la misma persona dos veces en una categoría</li>
                  <li>• Las 3 personas más nominadas pasan a votación final</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Próxima Fase: Votación Secreta (12-22 Dic)</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Votación 100% secreta y anónima</li>
                  <li>• Solo el admin ve los resultados</li>
                  <li>• Ganadores se revelan en la Gran Gala</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lista de Categorías para Nominaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriasGOBA.map((categoria) => {
              const nominacionesCategoria = nominaciones[categoria.id] || [];
              const misNominacionesEnCategoria = getMisNominacionesPorCategoria(categoria.id);
              const yaNomineTodas = misNominacionesEnCategoria.length >= 3;
              
              const topNominados = obtenerFinalistas(categoria.id);

              return (
                <div key={categoria.id} className="bg-white border-2 border-purple-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{categoria.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-4">{categoria.descripcion}</p>
                  
                  {/* Mis nominaciones en esta categoría */}
                  {misNominacionesEnCategoria.length > 0 && (
                    <div className="mb-3 p-2 bg-purple-50 rounded-lg">
                      <p className="text-xs font-semibold text-purple-700 mb-1">
                        Tus nominaciones ({misNominacionesEnCategoria.length}/3):
                      </p>
                      {misNominacionesEnCategoria.map((nom, index) => (
                        <div key={index} className="text-xs text-purple-600">
                          • {nom.persona}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nominaciones actuales */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      Top Nominados ({nominacionesCategoria.length} nominaciones)
                    </p>
                    {topNominados.length > 0 ? (
                      <div className="space-y-1">
                        {topNominados.map((nom, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{nom.persona}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-2">Aún no hay nominaciones</p>
                    )}
                  </div>

                  {/* Botón de nominar */}
                  {yaNomineTodas ? (
                    <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-center text-sm">
                      ✅ Completaste tus 3 nominaciones
                    </div>
                  ) : (
                    <button
                      onClick={() => nominarMultiplesPersonas(categoria.id, categoria.nombre)}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      🗳️ Nominar persona ({3 - misNominacionesEnCategoria.length} restantes)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* FASE DE VOTACIÓN SECRETA */}
      {faseActual === "votacion" && (
        <>
          {/* Información importante para votación SECRETA */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">🔒 Votación Secreta Activada</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-purple-700">
              <div>
                <p className="font-semibold mb-2">🗳️ Cómo votar:</p>
                <ul className="text-sm space-y-1">
                  <li>• Haz clic en "Votar" en cualquier categoría</li>
                  <li>• Ingresa tu código secreto para validar</li>
                  <li>• Elige a tu favorito entre los 3 finalistas</li>
                  <li>• ¡Tu voto es 100% anónimo!</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">🎭 Misterio Navideño:</p>
                <ul className="text-sm space-y-1">
                  <li>• Los resultados son SECRETOS</li>
                  <li>• Solo el admin puede ver los votos</li>
                  <li>• Ganadores se revelan en la Gran Gala</li>
                  <li>• ¡Sorpresa garantizada!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lista de Categorías para Votación SECRETA */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriasGOBA.map((categoria) => {
              const finalistas = obtenerFinalistas(categoria.id);
              const tieneFinalistas = finalistas.length > 0;
              
              return (
                <div key={categoria.id} className="bg-white border-2 border-purple-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{categoria.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-4">{categoria.descripcion}</p>
                  
                  {/* Finalistas */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      Finalistas para votar:
                    </p>
                    {tieneFinalistas ? (
                      <div className="space-y-2">
                        {finalistas.map((finalista, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{finalista.persona}</span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {finalista.votos} nominaciones
                            </span>
                          </div>
                        ))}
                        
                        <button
                          onClick={() => abrirModalVotacion(categoria)}
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm text-center mt-3"
                        >
                          🔒 Votar Secreto
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-xs text-gray-400 py-2">No hay finalistas</p>
                        <p className="text-xs text-gray-500">No hubo suficientes nominaciones</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Progreso */}
      <div className="mt-8 bg-white border-2 border-blue-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Tu Progreso</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${((misNominacionesTotales || 0) / maxNominacionesPosibles) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {(misNominacionesTotales || 0)}/{maxNominacionesPosibles} nominaciones ({Math.round(((misNominacionesTotales || 0) / maxNominacionesPosibles) * 100)}%)
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {misNominacionesTotales === maxNominacionesPosibles 
            ? "🎉 ¡Felicidades! Completaste todas las nominaciones posibles" 
            : "Nomina 1 persona por categoría (máximo 3 por categoría)"}
        </p>
      </div>

      {/* Navegación */}
      <div className="text-center mt-12">
        <Link 
          to="/home" 
          className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          ← Volver a Home
        </Link>
      </div>

      {/* Modal de Votación Secreta */}
      <ModalVotacionSecreta />
    </div>
  );
}