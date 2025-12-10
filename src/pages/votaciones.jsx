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
  const [modalNominacionAbierto, setModalNominacionAbierto] = useState(false);
  const [categoriaNominando, setCategoriaNominando] = useState(null);
  const [opcionesDropdown, setOpcionesDropdown] = useState([]);
  const [votosRealizados, setVotosRealizados] = useState({});

  // 25 Categorías divertidas para los GOBA Awards
  const categoriasGOBA = [
    { id: 1, nombre: "😴 El más dormilón del año", descripcion: "Si no le despiertan seguiria durmiendo" },
    { id: 2, nombre: "👩‍🍳 Chef Oficial de la Familia", descripcion: "El rey/reina de la cocina" },
    { id: 3, nombre: "🗣️ El que más habla", descripcion: "Siempre tiene algo que decir" },
    { id: 4, nombre: "💉 Panadol?", descripcion: "QUien más se enfermó en el año" },
    { id: 5, nombre: "🎮 Adicto a los Videojuegos", descripcion: "No suelta el control ni para comer" },
    { id: 6, nombre: "☕ Dependiente del Café", descripcion: "Sin su taza matutina no es persona" },
    { id: 7, nombre: "🫔 Devorador de Baleadas", descripcion: "Comió más baleadas que todos" },
    { id: 8, nombre: "💧 Ahorrando agua", descripcion: "Se baña cada 3 días" },
    { id: 9, nombre: "🤝 Ayudante de todos", descripcion: "Más colaborad@r de la familia" },
    { id: 10, nombre: "🛋️ Dueño/a del Control Remoto", descripcion: "Decide qué vemos en la TV" },
    { id: 11, nombre: "😂 El Bromas del año", descripcion: "Siempre nos hace reír" },
    { id: 12, nombre: "📱 Adicto al Celular", descripcion: "Pegado al teléfono 24/7" },
    { id: 13, nombre: "🛌 Rey/Reina de la Siesta", descripcion: "Maestro del descanso estratégico" },
    { id: 14, nombre: "🍫 Goloso/a Empedernido/a", descripcion: "Debilidades por los dulces" },
    { id: 15, nombre: "🥳 Espíritu Fiesta Todo el Año", descripcion: "Siempre en modo festivo" },
    { id: 16, nombre: "😄 Siempre Alegre", descripcion: "Quien menos se enoja" },
    { id: 17, nombre: "🚗 Piloto Familiar", descripcion: "Voy por ellos" },
    { id: 18, nombre: "🥤 Adict@ al refresco", descripcion: "Agua? no gracias Pepsi o Coca" },
    { id: 19, nombre: "🎭 Dramático/a por Excelencia", descripcion: "Convive todo en una telenovela" },
    { id: 20, nombre: "🏆 Competitivo/a Nato/a", descripcion: "Hasta en juegos de mesa es intenso" },
    { id: 21, nombre: "🧘‍♂️ Más callad@", descripcion: "Tiene personalidad relajada y silenciosa" },
    { id: 22, nombre: "🎵 DJ Familiar", descripcion: "Músicologo" },
    { id: 23, nombre: "✅ Chambeao y luego Existo", descripcion: "Persona más chambeadora del año" },
    { id: 24, nombre: "🌅 Madrugador Incansable", descripcion: "Productivo desde el amanecer" },
    { id: 25, nombre: "⛔ El o la más Trabada del año", descripcion: "Hoy no le hablo a nadie" }
  ];

  // Lista de nombres de familia
  const nombresFamilia = [
    "Montserrat", "José Manuel", "Raquel", "Luisa", "Andrés", 
    "José Iván", "Mariana", "Ruth", "Reny", "Gabriela", 
    "Olivia", "Rafael", "Paolo", "Isabella", "Camila", 
    "Santiago", "Mateo", "Valeria", "Sebastián", "Abuelita"
  ];

  // Función para normalizar nombres
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

  // Función para cargar votos del usuario
  const cargarVotosUsuario = async () => {
    if (!usuarioActual) return;
    
    try {
      const votos = await gobaService.obtenerVotosUsuario(usuarioActual.id);
      setVotosRealizados(votos || {});
    } catch (error) {
      console.error("Error cargando votos:", error);
      setVotosRealizados({});
    }
  };

  // Generar opciones aleatorias para dropdown
  const generarOpcionesDropdown = (categoriaId) => {
    if (!usuarioActual) return [];
    
    const nominacionesCategoria = nominaciones[categoriaId] || [];
    const misNominacionesEnCategoria = nominacionesCategoria.filter(n => 
      n && n.nominador && normalizarNombre(n.nominador) === normalizarNombre(usuarioActual.nombre)
    );

    // Filtrar nombres que ya nominé en esta categoría
    const nombresYaNominados = new Set(
      misNominacionesEnCategoria.map(n => normalizarNombre(n.persona))
    );

    // Mezclar aleatoriamente todas las opciones disponibles
    const opcionesDisponibles = nombresFamilia
      .filter(nombre => !nombresYaNominados.has(normalizarNombre(nombre)))
      .sort(() => Math.random() - 0.5);

    return opcionesDisponibles;
  };

  // Abrir modal de nominación con dropdown
  const abrirModalNominacion = (categoria) => {
    if (!usuarioActual) {
      alert("❌ Debes iniciar sesión para nominar");
      return;
    }

    const nominacionesCategoria = nominaciones[categoria.id] || [];
    const misNominacionesEnCategoria = nominacionesCategoria.filter(n => 
      n && n.nominador && normalizarNombre(n.nominador) === normalizarNombre(usuarioActual.nombre)
    );

    if (misNominacionesEnCategoria.length >= 3) {
      alert("❌ Ya has nominado a 3 personas en esta categoría");
      return;
    }

    const opciones = generarOpcionesDropdown(categoria.id);
    
    if (opciones.length === 0) {
      alert("❌ No hay más personas disponibles para nominar en esta categoría");
      return;
    }

    setCategoriaNominando(categoria);
    setOpcionesDropdown(opciones);
    setModalNominacionAbierto(true);
  };

  // Nominar desde dropdown
  const nominarDesdeDropdown = async (personaSeleccionada) => {
    if (!personaSeleccionada || !categoriaNominando) return;

    await nominarPersona(categoriaNominando.id, personaSeleccionada);
    setModalNominacionAbierto(false);
  };

  // Componente: Modal de Nominación con Dropdown
  const ModalNominacionDropdown = () => {
    if (!modalNominacionAbierto || !categoriaNominando) return null;

    const nominacionesCategoria = nominaciones[categoriaNominando.id] || [];
    const misNominacionesEnCategoria = nominacionesCategoria.filter(n => 
      n && n.nominador && normalizarNombre(n.nominador) === normalizarNombre(usuarioActual.nombre)
    );
    const nominacionesRestantes = 3 - misNominacionesEnCategoria.length;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🎭 Nominar</h2>
            <h3 className="text-xl text-purple-600 font-semibold">{categoriaNominando.nombre}</h3>
            <p className="text-gray-600 mt-2">Selecciona a quien quieres nominar</p>
            <p className="text-sm text-green-600 mt-1">
              Te quedan {nominacionesRestantes} nominación(es) en esta categoría
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Elige un familiar:
            </label>
            <select 
              className="w-full p-3 border border-green-400 rounded-lg bg-white text-green-800 focus:ring-2 focus:ring-green-300 focus:border-green-500"
              defaultValue=""
            >
              <option value="" disabled>Selecciona un familiar...</option>
              {opcionesDropdown.map((nombre, index) => (
                <option key={index} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              🎲 Todas las opciones disponibles - Orden aleatorio cada vez
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-700 text-center">
              🎯 Estrategia: Elige sabiamente para que tu favorito llegue a la final
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                const select = document.querySelector('select');
                const selectedValue = select?.value;
                if (selectedValue) {
                  nominarDesdeDropdown(selectedValue);
                } else {
                  alert("Por favor selecciona un familiar");
                }
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              ✅ Confirmar Nominación
            </button>
            <button
              onClick={() => setModalNominacionAbierto(false)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

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
        await cargarVotosUsuario();
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

  // Función para procesar y combinar nominaciones
  const procesarNominacionesCombinadas = (nominacionesDeFirebase) => {
    const todasNominacionesCombinadas = {};
    
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

  // Cargar todas las nominaciones desde Firebase
  const cargarTodasNominaciones = async () => {
    try {
      const todasNominaciones = await gobaService.obtenerTodasNominaciones();
      console.log("📥 Nominaciones cargadas desde Firebase:", todasNominaciones);
      procesarNominacionesCombinadas(todasNominaciones);
    } catch (error) {
      console.error('Error cargando nominaciones:', error);
      const nominacionesGuardadas = JSON.parse(localStorage.getItem('nominacionesGOBA') || '{}');
      setNominaciones(nominacionesGuardadas);
    }
  };

  // Fechas automáticas
  const determinarFaseActual = () => {
    const hoy = new Date();
    
    const fechaFinNominaciones = new Date('2025-12-07T20:00:00');
    const fechaInicioVotaciones = new Date('2025-12-10T00:00:00');
    const fechaFinVotaciones = new Date('2025-12-21T20:00:00');

    if (hoy < fechaFinNominaciones) {
      setFaseActual("nominaciones");
    } else if (hoy >= fechaInicioVotaciones && hoy <= fechaFinVotaciones) {
      setFaseActual("votacion");
    } else if (hoy >= fechaFinNominaciones && hoy < fechaInicioVotaciones) {
      setFaseActual("espera");
    } else {
      setFaseActual("resultados");
    }
  };

  // Reemplazar la función nominarMultiplesPersonas
  const nominarMultiplesPersonas = (categoriaId, categoriaNombre) => {
    abrirModalNominacion({ id: categoriaId, nombre: categoriaNombre });
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

    // Validación de nombres permitidos
    if (!normalizedAllowedNames.has(nombreNormalizado)) {
      alert(`❌ ¡"${nombreOriginal}" no es un nombre válido para nominar! Por favor, usa un nombre de la lista familiar.`);
      return;
    }

    try {
      const todasNominaciones = await gobaService.obtenerTodasNominaciones();
      const miDocumento = todasNominaciones[usuarioId];
      
      let nominacionesUsuarioActual = {};
      if (miDocumento && miDocumento.nominaciones) {
        nominacionesUsuarioActual = limpiarDatosParaFirebase(miDocumento.nominaciones);
      }

      if (!nominacionesUsuarioActual[categoriaId]) {
        nominacionesUsuarioActual[categoriaId] = [];
      }
      
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

      const nuevaNominacion = {
        persona: nombreParaMostrar,
        personaNormalizada: nombreNormalizado,
        nominador: usuarioActual.nombre,
        fecha: new Date().toISOString(),
        usuarioId: usuarioId
      };

      nominacionesUsuarioActual[categoriaId].push(nuevaNominacion);

      const nominacionesLimpias = limpiarDatosParaFirebase(nominacionesUsuarioActual);

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

  // Función para contar nominaciones (solo para fase de nominaciones)
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

  // Obtener finalistas para votación (TOP 3) - MODIFICADA: sin mostrar conteos
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

  // Función: Abrir modal de votación secreta
  const abrirModalVotacion = (categoria) => {
    // Verificar si ya votó en esta categoría
    if (votosRealizados[categoria.id]) {
      alert("❌ Ya has votado en esta categoría. Solo puedes votar una vez por categoría.");
      return;
    }

    const finalistas = obtenerFinalistas(categoria.id);
    
    if (finalistas.length === 0) {
      alert("❌ Esta categoría no tiene finalistas para votar");
      return;
    }

    setCategoriaVotando(categoria);
    setFinalistasVotando(finalistas);
    setModalVotacionAbierto(true);
  };

  // Función: Realizar voto secreto
  const realizarVotoSecreto = async (finalista) => {
    if (!usuarioActual || !categoriaVotando) return;

    // Confirmar el voto
    const confirmacion = window.confirm(
      `¿Estás seguro de votar por "${finalista.persona}" en la categoría:\n"${categoriaVotando.nombre}"?\n\n⚠️ Solo podrás votar UNA vez en esta categoría.`
    );
    
    if (!confirmacion) {
      return;
    }

    // GUARDAR VOTO EN FIREBASE
    try {
      const exito = await gobaService.guardarVoto(usuarioActual.id, categoriaVotando.id, finalista.persona);
      
      if (exito) {
        // Actualizar estado local
        setVotosRealizados(prev => ({
          ...prev,
          [categoriaVotando.id]: true
        }));
        
        alert(`✅ ¡Voto SECRETO registrado!\n\nLos resultados se revelarán en la Gran Gala 🎭`);
        setModalVotacionAbierto(false);
      } else {
        alert("❌ Error al guardar voto. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error guardando voto:", error);
      alert("❌ Error al guardar voto. Intenta nuevamente.");
    }
  };

  // Componente: Modal de Votación Secreta
  const ModalVotacionSecreta = () => {
    if (!modalVotacionAbierto || !categoriaVotando) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🗳️ Votación Secreta</h2>
            <h3 className="text-xl text-purple-600 font-semibold">{categoriaVotando.nombre}</h3>
            <p className="text-gray-600 mt-2">Tu voto es 100% anónimo y secreto</p>
            <p className="text-sm text-red-600 font-semibold mt-1">
              ⚠️ Solo puedes votar UNA vez en esta categoría
            </p>
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
                  </div>
                  <span className="text-2xl">
                    {index === 0 ? "" : index === 1 ? "" : ""}
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
    <div className="max-w-6xl mx-auto px-3 md:px-4 py-6 md:py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">🗳️ GOBA Awards 2025</h1>
        
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
            ? "Lo más destacado y divertido de la familia" 
            : "🔒 Votación Secreta - Los resultados son sorpresa"}
        </p>
        
        {/* Stats - SOLO PARA FASE DE NOMINACIONES */}
        {faseActual === "nominaciones" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white shadow-lg">
              <h2 className="text-lg font-bold mb-2">🏆 Categorías</h2>
              <p className="text-2xl font-bold">{categoriasGOBA.length}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-4 text-white shadow-lg">
              <h2 className="text-lg font-bold mb-2">⭐ Mis Nominaciones</h2>
              <p className="text-2xl font-bold">
                {misNominacionesTotales || 0}/{maxNominacionesPosibles}
              </p>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
              <h2 className="text-lg font-bold mb-2">⏰ Fecha Límite</h2>
              <p className="text-lg font-bold">7 Dic 2025 (8:00 PM)</p>
            </div>
          </div>
        )}
        
        {/* Stats - PARA FASE DE VOTACIÓN (MUY LIMITADOS) */}
        {faseActual === "votacion" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white shadow-lg">
              <h2 className="text-lg font-bold mb-2">🏆 Categorías</h2>
              <p className="text-2xl font-bold">{categoriasGOBA.length}</p>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
              <h2 className="text-lg font-bold mb-2">⏰ Fecha Límite</h2>
              <p className="text-lg font-bold">21 Dic 2025 (8:00 PM)</p>
            </div>
          </div>
        )}
      </div>

      {/* FASE DE NOMINACIONES */}
      {faseActual === "nominaciones" && (
        <>
          {/* Información importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-yellow-800 mb-3">📝 Nominaciones cierran Domingo 7 Dic 8:00 PM</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-700">
              <div>
                <p className="font-semibold">🎯 Sistema de Nominaciones</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Máximo <strong>3 nominados por categoría</strong> por persona</li>
                  <li>• No puedes nominar a la misma persona dos veces</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Próxima Fase: Votación Secreta (10-21 Dic)</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Los 3 más nominados pasan a la final</li>
                  <li>• Ganadores se revelan en la Gran Gala</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lista de Categorías para Nominaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriasGOBA.map((categoria) => {
              const misNominacionesEnCategoria = getMisNominacionesPorCategoria(categoria.id);
              const yaNomineTodas = misNominacionesEnCategoria.length >= 3;
              
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
          
          {/* Progreso SOLO en fase de nominaciones */}
          <div className="mt-8 bg-white border-2 border-blue-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Tu Progreso en Nominaciones</h2>
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
        </>
      )}

      {/* FASE DE VOTACIÓN SECRETA - SIN PROGRESO VISIBLE */}
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
                  <li>• Elige a tu favorito entre los 3 finalistas</li>
                  <li>• ¡Tu voto es 100% anónimo!</li>
                  <li>• <strong>Solo 1 voto por categoría</strong></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">🎭 Misterio Navideño:</p>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Los resultados son SECRETOS TOTALES</strong></li>
                  <li>• Ganadores se revelan en la Gran Gala</li>
                  <li>• ¡Sorpresa garantizada para todos!</li>
                  <li>• Votaciones cierran: <strong>21 Dic 8:00 PM</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lista de Categorías para Votación SECRETA */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriasGOBA.map((categoria) => {
              const finalistas = obtenerFinalistas(categoria.id);
              const tieneFinalistas = finalistas.length > 0;
              const yaVoto = votosRealizados[categoria.id];
              
              return (
                <div key={categoria.id} className="bg-white border-2 border-purple-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{categoria.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-4">{categoria.descripcion}</p>
                  
                  {/* Estado de voto */}
                  {yaVoto ? (
                    <div className="mb-4">
                      <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-center text-sm">
                        ✅ Ya votaste en esta categoría
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        🔒 Tu voto es secreto
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <p className="text-xs text-blue-700">
                          🎭 3 finalistas - Elige a tu favorito
                        </p>
                      </div>
                      
                      {tieneFinalistas ? (
                        <button
                          onClick={() => abrirModalVotacion(categoria)}
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm text-center mt-3"
                        >
                          🔒 Votar Secreto
                        </button>
                      ) : (
                        <div className="text-center mt-3">
                          <p className="text-xs text-gray-400">No hay finalistas</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* NOTA IMPORTANTE: Sin progreso visible en votación */}
          <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">⚠️ Votación 100% Secreta</h2>
            <p className="text-gray-700 mb-3">
              <strong>No se mostrará ningún progreso ni resultados durante la fase de votación.</strong>
            </p>
            <p className="text-sm text-gray-600">
              Todos los votos son anónimos y los resultados se mantendrán en secreto hasta la Gran Gala Navideña. 
              Esta es una votación de sorpresa donde nadie sabrá quién va ganando hasta el momento de la revelación.
            </p>
          </div>
        </>
      )}

      {/* PERIODO DE ESPERA ENTRE FECHAS */}
      {faseActual === "espera" && (
        <div className="text-center py-12">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">⏳ Periodo de Espera</h2>
            <p className="text-lg text-gray-700 mb-4">
              Las nominaciones han cerrado. Estamos preparando los finalistas para la votación.
            </p>
            <p className="text-blue-600 font-semibold">
              🗳️ La votación secreta comenzará el <strong>10 de Diciembre</strong>
            </p>
            <div className="mt-6">
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                📅 Fechas importantes:
                <ul className="text-sm mt-2 text-left">
                  <li>• Nominaciones cerradas: 7 Dic 8:00 PM</li>
                  <li>• Votación abre: 10 Dic 12:00 AM</li>
                  <li>• Votación cierra: 21 Dic 8:00 PM</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="text-center mt-12">
        <Link 
          to="/home" 
          className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          ← Volver a Home
        </Link>
      </div>

      {/* Modal de Nominación con Dropdown */}
      <ModalNominacionDropdown />

      {/* Modal de Votación Secreta */}
      <ModalVotacionSecreta />
    </div>
  );
}