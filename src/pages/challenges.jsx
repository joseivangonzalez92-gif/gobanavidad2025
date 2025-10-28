import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

export default function Challenges() {
  const navigate = useNavigate();
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [retosActivos, setRetosActivos] = useState([]);
  const [retosProximos, setRetosProximos] = useState([]);
  const [retosSemanaActual, setRetosSemanaActual] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [imagenSubida, setImagenSubida] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [retosCompletados, setRetosCompletados] = useState([]);
  const [preguntasCompletadas, setPreguntasCompletadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respuestasTesoro, setRespuestasTesoro] = useState({});
  const [intentosPreguntas, setIntentosPreguntas] = useState({});

  // Configuración de zona horaria de Honduras (UTC-6)
  const ZONA_HORARIA = -6;

  // 8 RETOS SEMANALES DE FOTOS (Lunes a Domingo)
  const retosSemanales = [
    { id: "foto_1", titulo: "Reto Semanal #1", descripcion: "📸 ¡Sube tu foto con un gorro navideño!", tipo: "foto", puntos: 10 },
    { id: "foto_2", titulo: "Reto Semanal #2", descripcion: "📸 ¡Sube tu foto con vibes navideñas!", tipo: "foto", puntos: 10 },
    { id: "foto_3", titulo: "Reto Semanal #3", descripcion: "📸 ¡Sube tu foto con vibes navideñas!", tipo: "foto", puntos: 10 },
    { id: "foto_4", titulo: "Reto Semanal #4", descripcion: "📸 ¡Sube tu foto con vibes navideñas!", tipo: "foto", puntos: 10 },
    { id: "foto_5", titulo: "Reto Semanal #5", descripcion: "📸 ¡Sube tu foto con vibes navideñas!", tipo: "foto", puntos: 10 },
    { id: "foto_6", titulo: "Reto Semanal #6", descripcion: "📸 ¡Sube tu foto con vibes navideñas!", tipo: "foto", puntos: 10 },
    { id: "foto_7", titulo: "Reto Semanal #7", descripcion: "📸 ¡Sube tu foto con vibes navideñas!", tipo: "foto", puntos: 10 },
    { id: "foto_8", titulo: "Reto Semanal #8", descripcion: "📸 ¡Sube tu foto con vibes navideñas!", tipo: "foto", puntos: 10 }
  ];

  // FECHAS DE APERTURA SEMANALES CORREGIDAS (Semana 1: 20-26 Oct 2025)
const fechasSemanales = [
  new Date(2025, 9, 27, 6, 0, 0),   // 27 Oct 2025 (Lunes) - Semana 1 ✅ ACTIVA para apruebas 
  new Date(2025, 10, 3, 6, 0, 0),   // 3 Nov 2025 (Lunes) - Semana 2
  new Date(2025, 10, 10, 6, 0, 0),  // 10 Nov 2025 (Lunes) - Semana 3
  new Date(2025, 10, 17, 6, 0, 0),  // 17 Nov 2025 (Lunes) - Semana 4
  new Date(2025, 10, 24, 6, 0, 0),  // 24 Nov 2025 (Lunes) - Semana 5
  new Date(2025, 11, 1, 6, 0, 0),   // 1 Dic 2025 (Lunes) - Semana 6
  new Date(2025, 11, 8, 6, 0, 0),   // 8 Dic 2025 (Lunes) - Semana 7
  new Date(2025, 11, 15, 6, 0, 0)   // 15 Dic 2025 (Lunes) - Semana 8
];

  // 14 PREGUNTAS MIÉRCOLES Y VIERNES CON 4 OPCIONES
  const preguntasMiercolesViernes = [
    // Semana 1
    { 
      id: "pregunta_1", 
      titulo: "🎄 Pregunta Miércoles #1", 
      descripcion: "¿Cuál es el mejor momento para abrir regalos de Navidad?",
      tipo: "pregunta",
      respuestaCorrecta: "Nochebuena",
      opciones: [
        "Nochebuena",
        "Navidad en la mañana", 
        "Año Nuevo",
        "Día de Reyes"
      ],
      puntos: 5
    },
    { 
      id: "pregunta_2", 
      titulo: "🎅 Pregunta Viernes #1", 
      descripcion: "¿Qué color de ropa lleva tradicionalmente Santa Claus?",
      tipo: "pregunta",
      respuestaCorrecta: "Rojo",
      opciones: [
        "Rojo",
        "Verde",
        "Azul",
        "Blanco"
      ],
      puntos: 5
    },
    // Semana 2
    { 
      id: "pregunta_3", 
      titulo: "🌟 Pregunta Miércoles #2", 
      descripcion: "¿En qué ciudad vive Santa Claus según la tradición?",
      tipo: "pregunta",
      respuestaCorrecta: "Polo Norte",
      opciones: [
        "Polo Norte",
        "New York",
        "Laponia",
        "Alaska"
      ],
      puntos: 5
    },
    { 
      id: "pregunta_4", 
      titulo: "❄️ Pregunta Viernes #2", 
      descripcion: "¿Qué se coloca tradicionalmente en la punta del árbol de Navidad?",
      tipo: "pregunta",
      respuestaCorrecta: "Una estrella",
      opciones: [
        "Una estrella",
        "Un ángel",
        "Una campana",
        "Un muñeco de nieve"
      ],
      puntos: 5
    },
    // Semana 3
    { 
      id: "pregunta_5", 
      titulo: "🎁 Pregunta Miércoles #3", 
      descripcion: "¿Cuántos renos tira del trineo de Santa?",
      tipo: "pregunta",
      respuestaCorrecta: "9",
      opciones: [
        "9",
        "8",
        "10", 
        "12"
      ],
      puntos: 5
    },
    { 
      id: "pregunta_6", 
      titulo: "🦌 Pregunta Viernes #3", 
      descripcion: "¿Cómo se llama el reno con la nariz roja?",
      tipo: "pregunta",
      respuestaCorrecta: "Rodolfo",
      opciones: [
        "Rodolfo",
        "Cometa",
        "Bailarín",
        "Trueno"
      ],
      puntos: 5
    },
    // Semana 4
    { 
      id: "pregunta_7", 
      titulo: "🍪 Pregunta Miércoles #4", 
      descripcion: "¿Qué se le deja a Santa para que coma cuando visita las casas?",
      tipo: "pregunta",
      respuestaCorrecta: "Leche y galletas",
      opciones: [
        "Leche y galletas",
        "Chocolate caliente",
        "Ponche de frutas",
        "Pastel de carne"
      ],
      puntos: 5
    },
    { 
      id: "pregunta_8", 
      titulo: "🔥 Pregunta Viernes #4", 
      descripcion: "¿En qué mes se celebra la Navidad?",
      tipo: "pregunta", 
      respuestaCorrecta: "Diciembre",
      opciones: [
        "Diciembre",
        "Noviembre",
        "Enero",
        "Febrero"
      ],
      puntos: 5
    },
    // Semana 5
    { 
      id: "pregunta_9", 
      titulo: "🎵 Pregunta Miércoles #5", 
      descripcion: "¿Cuál de estos es un villancico tradicional?",
      tipo: "pregunta",
      respuestaCorrecta: "Noche de Paz",
      opciones: [
        "Noche de Paz",
        "Feliz Cumpleaños",
        "Cumpleaños Feliz", 
        "Las Mañanitas"
      ],
      puntos: 5
    },
    { 
      id: "pregunta_10", 
      titulo: "🤶 Pregunta Viernes #5", 
      descripcion: "¿Cómo se llama la esposa de Santa Claus?",
      tipo: "pregunta",
      respuestaCorrecta: "Señora Claus",
      opciones: [
        "Señora Claus",
        "Mamá Noel",
        "Abuela Navidad",
        "Reina Invierno"
      ],
      puntos: 5
    },
    // Semana 6
    { 
      id: "pregunta_11", 
      titulo: "🧦 Pregunta Miércoles #6", 
      descripcion: "¿Dónde se cuelgan los calcetines para los regalos?",
      tipo: "pregunta",
      respuestaCorrecta: "En la chimenea",
      opciones: [
        "En la chimenea",
        "En la ventana",
        "En la puerta",
        "En el árbol"
      ],
      puntos: 5
    },
    { 
      id: "pregunta_12", 
      titulo: "⛄ Pregunta Viernes #6", 
      descripcion: "¿De qué están hechos tradicionalmente los muñecos de nieve?",
      tipo: "pregunta",
      respuestaCorrecta: "Nieve",
      opciones: [
        "Nieve",
        "Algodón",
        "Espuma",
        "Plástico"
      ],
      puntos: 5
    },
    // Semana 7
    { 
      id: "pregunta_13", 
      titulo: "🎀 Pregunta Miércoles #7", 
      descripcion: "¿Qué adornos se usan para decorar el árbol de Navidad?",
      tipo: "pregunta",
      respuestaCorrecta: "Esferas y luces",
      opciones: [
        "Esferas y luces",
        "Flores y hojas",
        "Cintas y lazos",
        "Figuras de animales"
      ],
      puntos: 5
    },
    { 
      id: "pregunta_14", 
      titulo: "🐧 Pregunta Viernes #7", 
      descripcion: "¿Qué animal NO está asociado tradicionalmente con la Navidad?",
      tipo: "pregunta",
      respuestaCorrecta: "Pingüino",
      opciones: [
        "Pingüino",
        "Reno",
        "Oso polar",
        "Búho nevado"
      ],
      puntos: 5
    }
  ];

  // 4 PREGUNTAS DE BÚSQUEDA DEL TESORO (PERMANENTES) - MODIFICADAS PARA INPUT TEXTO
  const preguntasTesoro = [
    { 
      id: "tesoro_1", 
      titulo: "🔍 Búsqueda del Tesoro #1", 
      descripcion: "Encuentra el número secreto escondido en el ✨sitio✨",
      tipo: "tesoro",
      respuestaCorrecta: "2025",
      puntos: 15
    },
    { 
      id: "tesoro_2", 
      titulo: "💝 Búsqueda del Tesoro #2", 
      descripcion: "¿Cuál es la palabra mágica que dice el Bot?",
      tipo: "tesoro", 
      respuestaCorrecta: "AMOR",
      puntos: 15
    },
    { 
      id: "tesoro_3", 
      titulo: "🎯 Búsqueda del Tesoro #3", 
      descripcion: "Encuentra el código secreto en los recuerdos",
      tipo: "tesoro",
      respuestaCorrecta: "El Pechocho",
      puntos: 15
    },
    { 
      id: "tesoro_4", 
      titulo: "🏠 Búsqueda del Tesoro #4", 
      descripcion: "La respuesta está en casa Goba - ¿Cuál es el secreto familiar?",
      tipo: "tesoro",
      respuestaCorrecta: "OliRaf",
      puntos: 15
    }
  ];

  // Función para obtener fecha actual en hora de Honduras
  const getFechaHonduras = () => {
    const ahora = new Date();
    const offset = ahora.getTimezoneOffset() * 60000;
    const localTime = ahora.getTime();
    const hondurasTime = localTime + (offset + (ZONA_HORARIA * 3600000));
    return new Date(hondurasTime);
  };

 // Función para obtener la semana actual (0-7) - MODIFICADA PARA PRUEBAS
const getSemanaActual = () => {
  // ⚠️ TEMPORAL: Forzar semana 1 durante pruebas
  return 0; // Semana 1 (27 Oct-2 Nov)
  
  // ⚠️ COMENTA EL CÓDIGO ORIGINAL:
  // const ahora = getFechaHonduras();
  // const inicioTemporada = new Date(2025, 9, 19, 0, 0, 0); // 19 de Oct 2025 ✅
  
  // const diferenciaTiempo = ahora.getTime() - inicioTemporada.getTime();
  // const diferenciaSemanas = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24 * 7));
  
  // return Math.max(0, Math.min(7, diferenciaSemanas));
};

  // Función para verificar estado de un reto
const getEstadoReto = (reto, index, tipo) => {
  const ahora = getFechaHonduras();
  const semanaActual = getSemanaActual();
  
  if (tipo === "foto") {
    const semanaReto = index;
    if (semanaReto !== semanaActual) return "proxima_semana";
    
    const fechaApertura = fechasSemanales[index];
    const fechaCierre = new Date(fechaApertura);
    fechaCierre.setDate(fechaCierre.getDate() + 6);
    fechaCierre.setHours(18, 0, 0, 0);
    
    if (ahora < fechaApertura) return "proximo";
    if (ahora > fechaCierre) return "cerrado";
    return "activo";
  }
  
  if (tipo === "pregunta") {
    const semanaReto = Math.floor(index / 2);
    if (semanaReto !== semanaActual) return "proxima_semana";
    
    // ⚠️ TEMPORAL: Forzar preguntas activas durante testing
    return "activo";
    
    // ⚠️ COMENTAR TEMPORALMENTE EL CÓDIGO ORIGINAL:
    /*
    const fechaBase = fechasSemanales[semanaReto];
    const fechaApertura = new Date(fechaBase);
    const diasExtra = index % 2 === 0 ? 2 : 4;
    fechaApertura.setDate(fechaBase.getDate() + diasExtra);
    fechaApertura.setHours(6, 0, 0, 0);
    
    const fechaCierre = new Date(fechaBase);
    fechaCierre.setDate(fechaBase.getDate() + 6);
    fechaCierre.setHours(18, 0, 0, 0);
    
    if (ahora < fechaApertura) return "proximo";
    if (ahora > fechaCierre) return "cerrado";
    return "activo";
    */
  }
  
  if (tipo === "tesoro") {
    return "activo";
  }
  
  return "proxima_semana";
};

  // Función para obtener retos de la semana actual (en cualquier estado)
  const getRetosSemanaActual = () => {
    const semanaActual = getSemanaActual();
    const retosSemana = [];
    
    // Reto de foto de la semana actual
    if (semanaActual < retosSemanales.length) {
      const estado = getEstadoReto(retosSemanales[semanaActual], semanaActual, "foto");
      retosSemana.push({
        ...retosSemanales[semanaActual],
        estado: estado,
        fechaApertura: fechasSemanales[semanaActual],
        horario: "Lunes 6:00am"
      });
    }
    
    // Preguntas de la semana actual
    const preguntasSemana = preguntasMiercolesViernes.slice(semanaActual * 2, (semanaActual * 2) + 2);
    preguntasSemana.forEach((pregunta, index) => {
      const indiceGlobal = (semanaActual * 2) + index;
      const estado = getEstadoReto(pregunta, indiceGlobal, "pregunta");
      retosSemana.push({
        ...pregunta,
        estado: estado,
        horario: index === 0 ? "Miércoles 6:00am" : "Viernes 6:00am"
      });
    });
    
    return retosSemana;
  };

  // Función para obtener retos activos (solo los que se pueden completar)
  const getRetosActivos = () => {
    const retos = [];
    const semanaActual = getSemanaActual();
    
    // Agregar tesoros (siempre activos)
    preguntasTesoro.forEach(reto => {
      retos.push({
        ...reto,
        estado: "activo"
      });
    });
    
    // Agregar retos de la semana actual que estén activos
    const retosSemana = getRetosSemanaActual();
    retosSemana.forEach(reto => {
      if (reto.estado === "activo") {
        retos.push(reto);
      }
    });
    
    return retos;
  };

  // Función para calcular retos de la próxima semana
  const getRetosProximaSemana = () => {
    const semanaActual = getSemanaActual();
    const proximos = [];
    
    if (semanaActual < 7) {
      const proximaSemana = semanaActual + 1;
      
      // Reto de foto de la próxima semana
      proximos.push({
        ...retosSemanales[proximaSemana],
        estado: "proxima_semana",
        horario: "Lunes 6:00am"
      });
      
      // Preguntas de la próxima semana (sin revelar la pregunta)
      const preguntasSemana = preguntasMiercolesViernes.slice(proximaSemana * 2, (proximaSemana * 2) + 2);
      preguntasSemana.forEach((pregunta, index) => {
        proximos.push({
          id: pregunta.id,
          titulo: pregunta.titulo,
          descripcion: "❓ La pregunta se revelará el día del reto",
          tipo: "pregunta",
          puntos: 5,
          estado: "proxima_semana",
          horario: index === 0 ? "Miércoles 6:00am" : "Viernes 6:00am",
          opciones: []
        });
      });
    }
    
    return proximos;
  };

  // Cargar usuario y datos al iniciar
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) {
      navigate("/login");
      return;
    }
    setUsuarioActual(usuario);
    loadChallengesData();
  }, [navigate]);

const loadChallengesData = async () => {
  try {
    setLoading(true);

    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    
    if (!usuarioActual || !usuarioActual.id) {
      console.log("⚠️ Usuario no disponible en challenges, buscando en localStorage...");
      
      const currentUser = JSON.parse(localStorage.getItem('usuarioActual'));
      if (!currentUser) {
        console.log("❌ No hay usuario logueado en loadChallengesData");
        return;
      }
      
      console.log("✅ Usuario recuperado:", currentUser);
      setUsuarioActual(currentUser);
    }
    
    console.log("🔍 Cargando datos para usuario:", usuarioActual.nombre);
    
    // 🆕 ACTUALIZAR USUARIO DESDE FIREBASE PRIMERO
    const usuarioFirebase = await gobaService.obtenerUsuario(usuarioActual.id);
    if (usuarioFirebase) {
      localStorage.setItem('usuarioActual', JSON.stringify(usuarioFirebase));
      setUsuarioActual(usuarioFirebase);
      console.log("🔄 Usuario actualizado desde Firebase:", usuarioFirebase.puntos);
    }
    
    const [rankingData, completadosData, preguntasData] = await Promise.all([
      gobaService.getRanking(),
      gobaService.getUserCompletedChallenges(usuarioActual.id),
      gobaService.getCompletedQuestions(usuarioActual.id)
    ]);

    setRanking(rankingData);
    setRetosCompletados(completadosData);
    setPreguntasCompletadas(preguntasData);
    
    // 🆕 RE-CALCULAR RETOS MANUALMENTE (en lugar de calcularRetos())
    setRetosActivos(getRetosActivos());
    setRetosSemanaActual(getRetosSemanaActual());
    setRetosProximos(getRetosProximaSemana());

  } catch (error) {
    console.error("❌ Error cargando datos de challenges:", error);
  } finally {
    setLoading(false);
  }
};

  // 🆕 FUNCIÓN PARA VALIDAR RESPUESTAS
  const validarRespuesta = (retoId, respuestaUsuario) => {
    let pregunta = preguntasMiercolesViernes.find(p => p.id === retoId);
    
    if (!pregunta) {
      pregunta = preguntasTesoro.find(t => t.id === retoId);
    }
    
    if (!pregunta) {
      console.error("❌ Pregunta no encontrada:", retoId);
      return false;
    }
    
    const esCorrecta = respuestaUsuario.trim().toLowerCase() === pregunta.respuestaCorrecta.toLowerCase();
    console.log("🔍 Validación respuesta:", {
      retoId,
      respuestaUsuario,
      correcta: pregunta.respuestaCorrecta,
      esCorrecta
    });
    
    return esCorrecta;
  };

  // 🆕 FUNCIÓN CORREGIDA PARA COMPLETAR PREGUNTAS SEMANALES
const completarPreguntaSemanal = async (retoId, respuesta) => {
  if (!usuarioActual) return;

  if (intentosPreguntas[retoId]) {
    alert("❌ Ya respondiste esta pregunta. Solo tienes un intento.");
    return;
  }

  try {
    const esCorrecta = validarRespuesta(retoId, respuesta);
    const puntos = esCorrecta ? 5 : 0;
    
    console.log("🔍 Enviando a Firebase:", { retoId, respuesta, esCorrecta, puntos });

    setIntentosPreguntas(prev => ({
      ...prev,
      [retoId]: true
    }));

    const puntosObtenidos = await gobaService.completeChallenge(
      usuarioActual.id, 
      retoId, 
      respuesta, 
      puntos
    );

    if (esCorrecta) {
      alert(`✅ ¡Correcto! Ganaste ${puntosObtenidos} puntos`);
    } else {
      const pregunta = preguntasMiercolesViernes.find(p => p.id === retoId);
      alert(`❌ Respuesta incorrecta. La respuesta correcta era: "${pregunta?.respuestaCorrecta}". No ganaste puntos.`);
    }

    loadChallengesData();
    
    // 🆕 ACTUALIZAR USUARIO EN LOCALSTORAGE
    const usuarioActualizado = await gobaService.obtenerUsuario(usuarioActual.id);
    if (usuarioActualizado) {
      localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
      setUsuarioActual(usuarioActualizado);
    }
    
  } catch (error) {
    setIntentosPreguntas(prev => ({
      ...prev,
      [retoId]: false
    }));
    alert(`❌ ${error.message}`);
  }
};

  // 🆕 FUNCIÓN PARA MANEJAR CAMBIO EN INPUTS INDIVIDUALES DE TESORO
  const manejarCambioRespuestaTesoro = (retoId, valor) => {
    setRespuestasTesoro(prev => ({
      ...prev,
      [retoId]: valor
    }));
  };

 // 🆕 FUNCIÓN PARA COMPLETAR TESORO CON INTENTOS ILIMITADOS
const completarTesoro = async (retoId) => {
  if (!usuarioActual || !respuestasTesoro[retoId]?.trim()) {
    alert("❌ Por favor escribe tu respuesta");
    return;
  }

  try {
    const respuestaUsuario = respuestasTesoro[retoId];
    const esCorrecta = validarRespuesta(retoId, respuestaUsuario);
    
    if (!esCorrecta) {
      alert(`❌ Respuesta incorrecta. ¡Sigue buscando!`);
      return;
    }
    
    // CORRECCIÓN: Pasar puntos explícitos para tesoros también
    const puntosObtenidos = await gobaService.completeChallenge(
      usuarioActual.id, 
      retoId, 
      respuestaUsuario, 
      15 // ← 15 puntos explícitos para tesoros
    );
    
    alert(`✅ ¡Correcto! Descubriste el tesoro y ganaste ${puntosObtenidos} puntos`);
    manejarCambioRespuestaTesoro(retoId, "");
    loadChallengesData();
    
    // 🆕 ACTUALIZAR USUARIO EN LOCALSTORAGE
    const usuarioActualizado = await gobaService.obtenerUsuario(usuarioActual.id);
    if (usuarioActualizado) {
      localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
      setUsuarioActual(usuarioActualizado);
    }
    
  } catch (error) {
    alert(`❌ ${error.message}`);
  }
};

  const getTextoEstado = (estado) => {
    const estados = {
      "proximo": "⏰ Próximo",
      "activo": "✅ Activo", 
      "cerrado": "❌ Cerrado",
      "proxima_semana": "📅 Próxima Semana"
    };
    return estados[estado] || estado;
  };

  const getColorEstado = (estado) => {
    const colores = {
      "proximo": "bg-blue-100 text-blue-800 border-blue-200",
      "activo": "bg-green-100 text-green-800 border-green-200",
      "cerrado": "bg-red-100 text-red-800 border-red-200",
      "proxima_semana": "bg-purple-100 text-purple-800 border-purple-200"
    };
    return colores[estado] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getTextoSemanaActual = () => {
    const semanaActual = getSemanaActual();
    const semanas = [
      "Semana 1 (27 Oct-2 Nov)", "Semana 2 (27 Oct-2 Nov)", "Semana 3 (3-9 Nov)", "Semana 4 (10-16 Nov)",
      "Semana 5 (17-23 Nov)", "Semana 6 (24-30 Nov)", "Semana 7 (1-7 Dic)", "Semana 8 (8-14 Dic)"
    ];
    return semanas[semanaActual] || "Fuera de temporada";
  };

  // 🆕 FUNCIÓN PARA VERIFICAR SI UN RETO ESTÁ COMPLETADO
  const estaCompletado = (retoId) => {
    const fotoCompletada = retosCompletados.find(r => r.challengeId === retoId);
    if (fotoCompletada) return fotoCompletada;
    
    const preguntaCompletada = preguntasCompletadas.find(p => p.challengeId === retoId);
    return preguntaCompletada;
  };

  // 🆕 FUNCIÓN PARA VERIFICAR SI UNA PREGUNTA YA FUE INTENTADA
  const fueIntentada = (retoId) => {
    return intentosPreguntas[retoId] || estaCompletado(retoId);
  };

  if (!usuarioActual) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando retos familiares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-4xl">{usuarioActual.avatar}</span>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">🎮 Retos Familiares</h1>
            <p className="text-xl text-gray-600">{usuarioActual.nombre} - {usuarioActual.pais}</p>
          </div>
        </div>
        <div className="mt-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 inline-block">
          <p className="font-semibold text-gray-800 text-lg">
            Puntos acumulados: <span className="text-3xl text-green-600">{usuarioActual.puntos || 0}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Columna Principal */}
        <div className="lg:col-span-3">
          {/* Retos Activos (solo los que se pueden completar) */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              🎯 Retos Activos
              <span className="text-sm bg-green-500 text-white px-3 py-1 rounded-full">
                {retosActivos.length} disponibles
              </span>
            </h2>
            
            {retosActivos.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                <p className="text-xl text-yellow-800 mb-4">
                  🕒 No hay retos activos en este momento
                </p>
                <p className="text-yellow-600">
                  Los retos se activan automáticamente según su programación. ¡Vuelve pronto!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {retosActivos.map((reto) => {
                  const completado = estaCompletado(reto.id);
                  const intentada = fueIntentada(reto.id);
                  
                  return (
                    <div key={reto.id} className={`bg-white border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                      reto.tipo === "tesoro" ? "border-yellow-300 bg-yellow-50" :
                      reto.tipo === "foto" ? "border-green-300" : "border-blue-300"
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">{reto.titulo}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reto.tipo === "tesoro" ? "bg-yellow-100 text-yellow-800" :
                              reto.tipo === "foto" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                            }`}>
                              {reto.tipo === "tesoro" ? "🔍 Tesoro" : 
                               reto.tipo === "foto" ? "📸 Foto" : "❓ Pregunta"}
                            </span>
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                              {reto.puntos} puntos
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 text-sm">{reto.descripcion}</p>

                      {/* FOTO - SUBIR O VER COMPLETADO */}
                      {reto.tipo === "foto" && !completado && (
                        <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                          {/* Vista previa */}
                          {imagenSubida && (
                            <div className="text-center bg-white p-3 rounded-lg border-2 border-green-300">
                              <p className="text-xs text-green-600 font-medium mb-2">Vista previa:</p>
                              <img 
                                src={URL.createObjectURL(imagenSubida)} 
                                alt="Tu foto para el reto" 
                                className="max-h-40 mx-auto rounded-lg shadow-md"
                              />
                              <p className="text-xs text-gray-500 mt-2">
                                {imagenSubida.name} - {(imagenSubida.size / 1024 / 1024).toFixed(2)}MB
                              </p>
                            </div>
                          )}

                          {/* Input de archivo */}
                          <label className="block cursor-pointer">
                            <span className="sr-only">Seleccionar foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setImagenSubida(e.target.files[0])}
                              disabled={subiendoFoto}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 disabled:opacity-50"
                            />
                          </label>

                          {/* Botón de subida */}
                          <button
                            onClick={() => manejarSubidaFoto(reto.id)}
                            disabled={!imagenSubida || subiendoFoto}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                              !imagenSubida || subiendoFoto
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                            }`}
                          >
                            {subiendoFoto ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Subiendo a ImgBB...
                              </span>
                            ) : (
                              '📤 Subir a Galería Familiar'
                            )}
                          </button>
                        </div>
                      )}

                      {/* PREGUNTAS SEMANALES - OPCIONES MÚLTIPLES (SOLO UN INTENTO) */}
                      {reto.tipo === "pregunta" && !completado && (
                        <div className="space-y-3">
                          <p className="font-medium text-gray-700 text-sm">Elige la respuesta correcta:</p>
                          <div className="grid grid-cols-1 gap-2">
                            {reto.opciones.map((opcion, index) => (
                              <button
                                key={index}
                                onClick={() => completarPreguntaSemanal(reto.id, opcion)}
                                disabled={intentada}
                                className={`w-full p-3 text-left rounded-lg transition-all duration-200 text-sm ${
                                  intentada
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                {opcion}
                                {intentada && (
                                  <span className="float-right text-xs text-gray-500">✓ Respondida</span>
                                )}
                              </button>
                            ))}
                          </div>
                          {intentada && !completado && (
                            <p className="text-xs text-orange-600 text-center">
                              ⚠️ Ya respondiste esta pregunta. Espera el resultado.
                            </p>
                          )}
                        </div>
                      )}

                      {/* TESOROS - INPUT TEXTO INDIVIDUAL (INTENTOS ILIMITADOS) */}
                      {reto.tipo === "tesoro" && !completado && (
                        <div className="space-y-3">
                          <p className="font-medium text-gray-700 text-sm">Escribe tu respuesta:</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={respuestasTesoro[reto.id] || ""}
                              onChange={(e) => manejarCambioRespuestaTesoro(reto.id, e.target.value)}
                              placeholder="Escribe aquí tu respuesta..."
                              className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none text-sm"
                            />
                            <button
                              onClick={() => completarTesoro(reto.id)}
                              disabled={!respuestasTesoro[reto.id]?.trim()}
                              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                            >
                              🔍 Verificar
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">
                            💡 Puedes intentar cuantas veces quieras hasta encontrar la respuesta correcta.
                          </p>
                        </div>
                      )}

                      {/* RETO COMPLETADO - VISUALIZACIÓN */}
                      {completado && (
                        <div className={`border-2 rounded-lg p-4 text-center ${
                          reto.tipo === "tesoro" || (completado.puntosObtenidos || completado.pointsAwarded) > 0 
                            ? 'bg-green-100 border-green-300' 
                            : 'bg-orange-100 border-orange-300'
                        }`}>
                          <div className={`font-semibold mb-2 ${
                            reto.tipo === "tesoro" || (completado.puntosObtenidos || completado.pointsAwarded) > 0 
                              ? 'text-green-700' 
                              : 'text-orange-700'
                          }`}>
                            {reto.tipo === "tesoro" || (completado.puntosObtenidos || completado.pointsAwarded) > 0 
                              ? '✅ ¡Reto Completado!' 
                              : '⚠️ Respuesta Incorrecta'
                            }
                          </div>
                          
                          {reto.tipo === "foto" && completado.imageUrl && (
                            <div className="mb-3">
                              <p className="text-sm text-green-600 mb-2">Tu foto aprobada:</p>
                              <img 
                                src={completado.imageUrl} 
                                alt="Foto aprobada" 
                                className="max-h-32 mx-auto rounded-lg shadow-md"
                              />
                            </div>
                          )}
                          
                          <div className={`text-lg font-bold ${
                            reto.tipo === "tesoro" || (completado.puntosObtenidos || completado.pointsAwarded) > 0 
                              ? 'text-green-800' 
                              : 'text-orange-800'
                          }`}>
                            +{(completado.puntosObtenidos || completado.pointsAwarded) || 0} puntos ganados
                          </div>
                          
                          {(reto.tipo === "pregunta" || reto.tipo === "tesoro") && (
                            <p className={`text-sm mt-1 ${
                              reto.tipo === "tesoro" || (completado.puntosObtenidos || completado.pointsAwarded) > 0 
                                ? 'text-green-600' 
                                : 'text-orange-600'
                            }`}>
                              {reto.tipo === "tesoro" 
                                ? `Tesoro descubierto: ${reto.respuestaCorrecta}`
                                : (completado.puntosObtenidos || completado.pointsAwarded) === 0 
                                  ? `Respuesta incorrecta. La correcta era: ${reto.respuestaCorrecta}`
                                  : `Respuesta correcta: ${reto.respuestaCorrecta}`
                              }
                            </p>
                          )}
                          
                          {reto.tipo === "foto" && (
                            <p className="text-sm text-green-600 mt-1">
                              Foto aprobada por el admin
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Retos de la Semana Actual (todos los estados) */}
          {retosSemanaActual.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📅 {getTextoSemanaActual()}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {retosSemanaActual.map((reto, index) => (
                  <div key={index} className={`bg-white border-2 rounded-xl p-4 ${getColorEstado(reto.estado)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-700 text-sm">{reto.titulo}</h4>
                      <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">
                        {reto.puntos} pts
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mb-2">{reto.descripcion}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getColorEstado(reto.estado)}`}>
                        {getTextoEstado(reto.estado)}
                      </span>
                      <span className="text-xs text-gray-500">{reto.horario}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retos Próxima Semana */}
          {retosProximos.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                🔮 Próxima Semana
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {retosProximos.map((reto, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-700 text-sm">{reto.titulo}</h4>
                      <span className="bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs">
                        {reto.puntos} pts
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mb-2">{reto.descripcion}</p>
                    <p className="text-xs text-blue-600 font-medium">
                      ⏰ {reto.horario}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna Lateral: Ranking */}
        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-purple-200 rounded-xl p-6 sticky top-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🏆 Ranking
              <span className="text-sm bg-purple-500 text-white px-2 py-1 rounded-full">
                {ranking.length} jugadores
              </span>
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ranking.slice(0, 10).map((jugador, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                  jugador.userId === usuarioActual.id 
                    ? 'bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200' 
                    : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{jugador.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate text-sm ${
                        jugador.userId === usuarioActual.id ? 'text-green-700' : 'text-gray-800'
                      }`}>
                        {jugador.nombre}
                      </p>
                      <p className="text-xs text-gray-600">{jugador.puntosTotales || 0} pts</p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-gray-500' : 
                    index === 2 ? 'text-orange-500' : 'text-gray-400'
                  }`}>
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 text-center">
                {ranking.findIndex(j => j.userId === usuarioActual.id) === -1 
                  ? "¡Completa tu primer reto para entrar al ranking!"
                  : `Estás en posición #${ranking.findIndex(j => j.userId === usuarioActual.id) + 1}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="text-center mt-12">
        <Link 
          to="/home" 
          className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-8 rounded-lg transition-colors"
        >
          ← Volver al Home
        </Link>
      </div>
    </div>
  );
}