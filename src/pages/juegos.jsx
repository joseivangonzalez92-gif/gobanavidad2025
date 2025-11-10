// src/components/Juegos.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

const JuegoSimple = ({ 
  juegoId, 
  usuarioActual, 
  volverASeleccion,
  guardarEnRanking,
  obtenerMejorPuntuacionPersonal 
}) => {
  const [estado, setEstado] = useState("jugando");
  const [puntuacion, setPuntuacion] = useState(0);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [rachas, setRachas] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [puntosGanados, setPuntosGanados] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [preguntasSession, setPreguntasSession] = useState([]);
  const tiempoRespuestaRef = useRef(null);

  const [mejorPuntuacion, setMejorPuntuacion] = useState(0);
  const [mejorPuntuacionCargada, setMejorPuntuacionCargada] = useState(false);
  const [juegoHoyJugado, setJuegoHoyJugado] = useState(false);

  // REGLA: Verificar si ya jugó hoy - SOLO PARA JUEGOS DE PREGUNTAS
  useEffect(() => {
    const verificarJuegoHoy = () => {
      // Memory no tiene restricción
      if (juegoId === "memory") return false;
      
      const hoy = new Date().toLocaleDateString('es-HN');
      const juegosHoy = JSON.parse(localStorage.getItem('juegosHoy') || '{}');
      return juegosHoy[juegoId] === hoy;
    };
    
    setJuegoHoyJugado(verificarJuegoHoy());
  }, [juegoId]);

  // Cargar mejor puntuación al iniciar
  useEffect(() => {
    const cargarMejorPuntuacion = async () => {
      const mejor = await obtenerMejorPuntuacionPersonal(juegoId);
      setMejorPuntuacion(mejor);
      setMejorPuntuacionCargada(true);
    };
    cargarMejorPuntuacion();
  }, [juegoId]);

  // Banco grande de preguntas (25 por juego)
  const getBancoGrande = () => {
    const bancos = {
      peliculas: {
        titulo: "🎬 Adivina la Película",
        preguntas: [
          { pregunta: "🦁👑🌅", opciones: ["El Rey León", "Aladdin", "La Bella y la Bestia", "El Libro de la Selva"], respuesta: "El Rey León" },
          { pregunta: "🚀👨‍🚀🌌", opciones: ["Interestelar", "Gravedad", "Marte", "Apollo 13"], respuesta: "Interestelar" },
          { pregunta: "🏰👸🐸", opciones: ["La Princesa y el Sapo", "Shrek", "Encantada", "Enredados"], respuesta: "La Princesa y el Sapo" },
          { pregunta: "🎭🕴️🔫", opciones: ["Matrix", "John Wick", "James Bond", "Misión Imposible"], respuesta: "Matrix" },
          { pregunta: "🧙‍♂️⚡👓", opciones: ["Harry Potter", "El Señor de los Anillos", "Las Crónicas de Narnia", "Percy Jackson"], respuesta: "Harry Potter" },
          { pregunta: "🚗🌇🏁", opciones: ["Rápidos y Furiosos", "The Fast and the Furious: Tokyo Drift", "Need for Speed", "Gone in 60 Seconds"], respuesta: "Rápidos y Furiosos" },
          { pregunta: "🦇🏙️🤡", opciones: ["El Caballero Oscuro", "Batman Inicia", "Joker", "The Batman"], respuesta: "El Caballero Oscuro" },
          { pregunta: "👽📞🏠", opciones: ["E.T.", "Encuentros Cercanos", "Arrival", "El Día que la Tierra se Detuvo"], respuesta: "E.T." },
          { pregunta: "🚢❤️🌊", opciones: ["Titanic", "La Aventura del Poseidón", "La Tormenta Perfecta", "El Abismo"], respuesta: "Titanic" },
          { pregunta: "🔍🕵️‍♂️🔫", opciones: ["Sherlock Holmes", "El Código Da Vinci", "Tesoro Nacional", "Identidad Bourne"], respuesta: "Sherlock Holmes" },
          { pregunta: "🎵🎤🎹", opciones: ["La La Land", "Nace una Estrella", "Bohemian Rhapsody", "El Gran Showman"], respuesta: "La La Land" },
          { pregunta: "👻🏠👦", opciones: ["Casper", "La Mansión Encantada", "El Horror de Amityville", "Poltergeist"], respuesta: "Casper" },
          { pregunta: "🦕🏝️🔬", opciones: ["Parque Jurásico", "El Mundo Perdido", "King Kong", "Godzilla"], respuesta: "Parque Jurásico" },
          { pregunta: "👗👠💼", opciones: ["El Diablo viste de Prada", "Legalmente Rubia", "Working Girl", "13 Going on 30"], respuesta: "El Diablo viste de Prada" },
          { pregunta: "🚀🤖👦", opciones: ["Big Hero 6", "Astro Boy", "Robots", "El Gigante de Hierro"], respuesta: "Big Hero 6" },
          { pregunta: "👦🕷️🕸️", opciones: ["Spider-Man: Into the Spider-Verse", "Spider-Man", "The Amazing Spider-Man", "Spider-Man: Homecoming"], respuesta: "Spider-Man: Into the Spider-Verse" },
          { pregunta: "👧🔥🏹", opciones: ["Los Juegos del Hambre", "Valiente", "Divergente", "El Corredor del Laberinto"], respuesta: "Los Juegos del Hambre" },
          { pregunta: "🤖💙👦", opciones: ["El Gigante de Hierro", "Big Hero 6", "Astro Boy", "Robots"], respuesta: "El Gigante de Hierro" },
          { pregunta: "👻📱😱", opciones: ["The Ring", "The Grudge", "Poltergeist", "Actividad Paranormal"], respuesta: "The Ring" },
          { pregunta: "🚗🌍🏎️", opciones: ["Cars", "Speed Racer", "Talladega Nights", "Rush"], respuesta: "Cars" },
          { pregunta: "👸❄️💖", opciones: ["Frozen", "Blancanieves", "La Reina de las Nieves", "Ice Princess"], respuesta: "Frozen" },
          { pregunta: "🦇🌃🤡", opciones: ["Joker", "El Caballero Oscuro", "Batman Inicia", "The Batman"], respuesta: "Joker" },
          { pregunta: "👽🔫🌎", opciones: ["Día de la Independencia", "La Guerra de los Mundos", "Battle: Los Angeles", "Arrival"], respuesta: "Día de la Independencia" },
          { pregunta: "🎭🎪🎶", opciones: ["Moulin Rouge!", "El Gran Showman", "Chicago", "Burlesque"], respuesta: "Moulin Rouge!" },
          { pregunta: "🐉🏯👦", opciones: ["Mulan", "Kung Fu Panda", "El Último Maestro del Aire", "Tigre y Dragón"], respuesta: "Mulan" }
        ]
      },
      canciones: {
        titulo: "🎵 Completa la Canción",
        preguntas: [
          { pregunta: "Feliz Navidad, Feliz Navidad, ____", opciones: ["Feliz Navidad", "te deseo yo", "con amor", "y prosperidad"], respuesta: "Feliz Navidad" },
          { pregunta: "Noche de paz, noche de ____", opciones: ["amor", "sueño", "alegría", "fe"], respuesta: "amor" },
          { pregunta: "Campana sobre campana, y sobre campana ____", opciones: ["una", "dos", "tres", "cuatro"], respuesta: "una" },
          { pregunta: "Mi burrito sabanero, vamos a ____", opciones: ["Belén", "la fiesta", "cantar", "pasear"], respuesta: "Belén" },
          { pregunta: "Los peces en el río, pero mira cómo ____", opciones: ["beben", "nadan", "saltan", "juegan"], respuesta: "beben" },
          { pregunta: "Arre borriquito, vamos a ____", opciones: ["Belén", "cantar", "bailar", "correr"], respuesta: "Belén" },
          { pregunta: "Blanca Navidad, yo ____ soñé", opciones: ["la", "te", "se", "me"], respuesta: "la" },
          { pregunta: "Ven a ____ casa, es Navidad", opciones: ["mi", "tu", "nuestra", "la"], respuesta: "mi" },
          { pregunta: "Navidad, Navidad, dulce ____", opciones: ["Navidad", "momentos", "fiesta", "alegría"], respuesta: "Navidad" },
          { pregunta: "Los ____ pasan, llevan flores", opciones: ["pastores", "reyes", "niños", "ángeles"], respuesta: "pastores" },
          { pregunta: "Ande, ande, ande, la ____", opciones: ["marimorena", "navidad", "fiesta", "alegría"], respuesta: "marimorena" },
          { pregunta: "En el portal de ____", opciones: ["Belén", "Jerusalén", "Nazaret", "Galilea"], respuesta: "Belén" },
          { pregunta: "____, campana sobre campana", opciones: ["Campana", "Suena", "Brilla", "Canta"], respuesta: "Campana" },
          { pregunta: "Vamos, vamos, ____", opciones: ["pastores", "amigos", "hermanos", "niños"], respuesta: "pastores" },
          { pregunta: "La ____ está en el portal", opciones: ["Virgen", "Madre", "Señora", "Reina"], respuesta: "Virgen" },
          { pregunta: "____, José con el niño", opciones: ["María", "La Virgen", "Santa", "Madre"], respuesta: "María" },
          { pregunta: "Ya ____ la Navidad", opciones: ["llegó", "vino", "está", "viene"], respuesta: "llegó" },
          { pregunta: "Con mi ____ cantaré", opciones: ["burrito", "caballo", "perrito", "gatito"], respuesta: "burrito" },
          { pregunta: "A ____ me voy", opciones: ["Belén", "casa", "la fiesta", "la iglesia"], respuesta: "Belén" },
          { pregunta: "____ de la rosa", opciones: ["Flor", "Rey", "Canto", "Belleza"], respuesta: "Flor" },
          { pregunta: "____, qué noche tan linda", opciones: ["Navidad", "Amigos", "Fiesta", "Alegría"], respuesta: "Navidad" },
          { pregunta: "Vuela, vuela, vuela, la ____", opciones: ["mariposa", "campana", "estrella", "paloma"], respuesta: "campana" },
          { pregunta: "____, José, no te dé cuidado", opciones: ["María", "Mujer", "Esposa", "Querida"], respuesta: "María" },
          { pregunta: "El ____ al niño le trae", opciones: ["burrito", "pastor", "rey", "ángel"], respuesta: "burrito" },
          { pregunta: "I'm dreaming of a white ____", opciones: ["Christmas", "holiday", "winter", "snow"], respuesta: "Christmas" }
        ]
      },
      quiz: {
        titulo: "❓ Trivia Familiar Goba",
        preguntas: [
          { pregunta: "¿Es la película favorita navideña de Olivia?", opciones: ["El regaldo prometido", "santaclausula", "mi pobre angelito", "Story Bots de Navidad"], respuesta: "Story Bots de Navidad" },
          { pregunta: "¿Es la comida favorita Navideña de Montserrat", opciones: ["Recalentado de cerdo", "Galletas Navideñas", "Montucas", "Tamal"], respuesta: "Recalentado de cerdo" },
          { pregunta: "¿Comida favorita de Valeria?", opciones: ["Costilla agridulce", "Tamales", "Cerdo Horneado", "Montucas"], respuesta: "Tamales" },
          { pregunta: "¿Cuando come tamales José Iván?", opciones: ["Solo en Navidad", "En fechas especiales", "Cuando le invitan", "Cualquier día del año"], respuesta: "Solo en Navidad" },
          { pregunta: "¿Canción navideña favorita de Valeria?", opciones: ["Piano Merengue", "Navidad sin tí", "Feliz Navidad", "Aquellos Diciembres"], respuesta: "Piano Merengue" },
          { pregunta: "¿Costumbre navideña de navidades pasadas de valeria?", opciones: ["Pijamada con primas", "Volar Cometas", "Ir al mercado", "Ver películas todo el día"], respuesta: "Pijamada con primas" },
          { pregunta: "¿Película favorita de Valeria?", opciones: ["Los fantasmas de scrooge", "Jingle All the way", "Intercambio de princesas", "Home Alone"], respuesta: "Los fantasmas de scrooge" },
          { pregunta: "¿Comida navideña favorita de Andrés?", opciones: ["Recalentado de Cerdo", "Pavo Horneado", "Tamalitos", "Gallina Rellena"], respuesta: "Recalentado de Cerdo" },
          { pregunta: "¿Canción navideña favorita de Andrés?", opciones: ["Cantares de Navidad", "El Tamborilero", "Pitorro de Coco", "Navidad sin tí"], respuesta: "Cantares de Navidad" },
          { pregunta: "¿Costumbre de navidades pasadas de Andrés?", opciones: ["Amanecer con los sobrevivientes", "Hacer galletas", "Cocina Pierna Horneada", "Comer"], respuesta: "Amanecer con los sobrevivientes" },
          { pregunta: "¿Costumbre de navidades pasadas de Raquel?", opciones: ["Bailar toda la noche", "Kareokear", "Cocina la pierna de cerdo", "Decorar la casa"], respuesta: "Bailar toda la noche" },
          { pregunta: "¿Postre favorito de José Iván", opciones: ["Cheese Cake", "Pastel de chocolate", "Tiramisu", "Torrejas"], respuesta: "Cheese Cake" },
          { pregunta: "¿Costumbre de navidades pasdadas de José Iván?", opciones: ["Reventar cohetes", "Ver tele todo el día", "ir a la playa", "Ayudar a cocinar"], respuesta: "Reventar cohetes" },
          { pregunta: "¿Película navideña favorita de Raquel?", opciones: ["Una navidad de locos", "Intercambio de princesas 3", "Mickey en navidad", "Estrella navideña"], respuesta: "Una navidad de locos" },
          { pregunta: "¿Canción navideña favorita de Olivia?", opciones: ["Navidad Rock", "Cascabel", "El año viejo", "Peces en el rio"], respuesta: "Navidad Rock" },
          { pregunta: "¿Canción navideña favorita de Raquel?", opciones: ["El año viejo", "Campana sobre campana", "Mi Burrito Sabanero", "Los Peces en el Río"], respuesta: "El año viejo" },
          { pregunta: "¿Comida navideña favorita de Raquel?", opciones: ["Cerdo Horneado", "Gallina Rellena", "Tamales", "Costilla Horneada"], respuesta: "Cerdo Horneado " },
          { pregunta: "¿Los mejores complementos para el cerdo horneado para Mariana?", opciones: ["Ensalada de papa y Arroz", "Ensalda y Arroz", "Pure y Arroz", "Arroz y Tamal"], respuesta: "Ensalada de papa y Arroz" },
          { pregunta: "¿Película favorita de Mariana?", opciones: ["El grinch", "Home Alone", "Navidad Catracha", "Navidad con los Miller"], respuesta: "El grinch" },
          { pregunta: "¿Canción navideña favorita de Mariana?", opciones: ["La Marimorena", "Ven a cantar", "El Tamborilero", "Aquellos Diciembres"], respuesta: "La Marimorena" },
          { pregunta: "¿Película favorita de Montserrat?", opciones: ["Mickey descubre la navidad", "Expresso Polar", "Elf", "Mi pobre angelito"], respuesta: "Mickey descubre la navidad" },
          { pregunta: "¿Canción navideña favorita de Montserrat?", opciones: ["Noche de Paz", "Navidad Rock", "Dulce navidad", "Santa Claus"], respuesta: "Noche de Paz" },
          { pregunta: "¿Comida favorita de JP?", opciones: ["Pollo en salsa de hongos", "Pavo horneado", "Lasagna", "Costillas BBQ"], respuesta: "Pollo en salsa de hongos" },
          { pregunta: "¿Costumbre navideña de JP?", opciones: ["Sandwich de pollo de abuela", "Abrir regalos a media noche", "Ver luces navideñas", "Cantar villancicos"], respuesta: "Sandwich de pollo de abuela" },
          { pregunta: "¿Costumbre de navidades pasadas de Ruth?", opciones: ["Amanecer bailando", "Cocinar tamales", "Ver películas", "Hacer galletas"], respuesta: "Amanecer bailando" }
        ]
      },
      familia: {
        titulo: "Completa el Refrán!!",
        preguntas: [
          { pregunta: "Al que madruga...", opciones: ["Dios le ayuda", "le caen las manzanas", "nadie le ve", "le sale el sol"], respuesta: "Dios le ayuda" },
          { pregunta: "No por mucho madrugar...", opciones: ["se duerme más", "se amanece más temprano", "se hace más rico", "se vive mejor"], respuesta: "se amanece más temprano" },
          { pregunta: "A quien le pica...", opciones: ["se rasca", "se aguanta", "se queja", "se cura"], respuesta: "se rasca" },
          { pregunta: "Más vale pájaro en mano...", opciones: ["que dos volando", "que cien en el suelo", "que diez en el nido", "que ciento volando"], respuesta: "que ciento volando" },
          { pregunta: "Ojos que no ven...", opciones: ["boca que no come", "manos que no trabajan", "corazón que no siente", "oídos que no escuchan"], respuesta: "corazón que no siente" },
          { pregunta: "Cuando el río suena...", opciones: ["piedras lleva", "agua lleva", "peces lleva", "arena lleva"], respuesta: "piedras lleva" },
          { pregunta: "En boca cerrada...", opciones: ["no hay dolor", "no hay risa", "no entran moscas", "no salen palabras"], respuesta: "no entran moscas" },
          { pregunta: "Dime con quién andas...", opciones: ["y te diré quién eres", "y te diré adónde vas", "y te diré qué haces", "y te diré cómo estás"], respuesta: "y te diré quién eres" },
          { pregunta: "Camarón que se duerme...", opciones: ["se lo come el pez", "se lo lleva la corriente", "se despierta tarde", "no desayuna"], respuesta: "se lo lleva la corriente" },
          { pregunta: "A lo hecho...", opciones: ["pecho", "derecho", "hecho", "techo"], respuesta: "pecho" },
          { pregunta: "Más vale maña...", opciones: ["que belleza", "que dinero", "que fuerza", "que fama"], respuesta: "que fuerza" },
          { pregunta: "El que mucho abarca...", opciones: ["poco aprieta", "poco alcanza", "poco entiende", "poco disfruta"], respuesta: "poco aprieta" },
          { pregunta: "No hay mal que por bien...", opciones: ["no venga", "no vaya", "venga", "no salga"], respuesta: "no venga" },
          { pregunta: "Al no haber pan...", opciones: ["Tortillas", "buenas son galletas", "bueno es el arroz", "buenas son las frutas"], respuesta: "Tortillas" },
          { pregunta: "Donde hay humo...", opciones: ["hay fuego", "hay calor", "hay gente", "hay cocina"], respuesta: "hay fuego" },
          { pregunta: "Perro que ladra...", opciones: ["no duerme", "no come", "no muerde", "no juega"], respuesta: "no muerde" },
          { pregunta: "A buen entendedor...", opciones: ["pocas palabras", "muchas palabras", "buen hablador", "mejor oyente"], respuesta: "pocas palabras" },
          { pregunta: "El que ríe último...", opciones: ["ríe mejor", "más fuerte ríe", "más tarde ríe", "más feliz es"], respuesta: "ríe mejor" },
          { pregunta: "A caballo regalado...", opciones: ["no se le ve el colmillo", "no se le busca lado", "no se le cambia", "no se le vende"], respuesta: "no se le busca lado" },
          { pregunta: "Del árbol caído...", opciones: ["todos hacen leña", "todos recogen frutas", "todos se alejan", "todos tienen sombra"], respuesta: "todos hacen leña" },
          { pregunta: "Cría cuervos...", opciones: ["y te sacarán los ojos", "y te comerán el pan", "y te quitarán el sueño", "y te robarán el alma"], respuesta: "y te sacarán los ojos" },
          { pregunta: "La curiosidad mató...", opciones: ["al ratón", "al gato", "al perro", "al pájaro"], respuesta: "al gato" },
          { pregunta: "No dejes para mañana...", opciones: ["lo que puedes hacer hoy", "lo que puedes hacer después", "lo que puedes hacer nunca", "lo que puedes hacer pronto"], respuesta: "lo que puedes hacer hoy" },
          { pregunta: "Agua que no has de beber...", opciones: ["déjala correr", "tírala al mar", "guárdala bien", "ofrécesela a otro"], respuesta: "déjala correr" },
          { pregunta: "Dios aprieta...", opciones: ["pero no ahorca", "pero no castiga", "pero no olvida", "pero no abandona"], respuesta: "pero no ahorca" }
        ]
      }
    };

    return bancos[juegoId] || { titulo: "Juego", preguntas: [] };
  };

  // Función para mezclar opciones manteniendo la respuesta correcta
  const mezclarOpciones = (pregunta) => {
    const opcionesMezcladas = [...pregunta.opciones].sort(() => Math.random() - 0.5);
    return {
      ...pregunta,
      opciones: opcionesMezcladas
    };
  };

  // Obtener 10 preguntas aleatorias únicas por sesión
  const obtenerPreguntasAleatorias = (juegoId) => {
    const banco = getBancoGrande();
    const todasPreguntas = [...banco.preguntas];
    
    const mezcladas = [...todasPreguntas]
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5);
    
    const seleccionadas = mezcladas.slice(0, 10).map(p => mezclarOpciones(p));
    
    return seleccionadas;
  };

  // REGLA: Marcar juego como jugado hoy - SOLO PARA JUEGOS DE PREGUNTAS
  const marcarJuegoComoJugadoHoy = () => {
    // Memory no tiene restricción
    if (juegoId === "memory") return;
    
    const hoy = new Date().toLocaleDateString('es-HN');
    const juegosHoy = JSON.parse(localStorage.getItem('juegosHoy') || '{}');
    juegosHoy[juegoId] = hoy;
    localStorage.setItem('juegosHoy', JSON.stringify(juegosHoy));
    setJuegoHoyJugado(true);
  };

  // Inicializar preguntas de la sesión
  useEffect(() => {
    if (preguntasSession.length === 0 && !juegoHoyJugado) {
      const nuevasPreguntas = obtenerPreguntasAleatorias(juegoId);
      setPreguntasSession(nuevasPreguntas);
    }
  }, [juegoId, juegoHoyJugado]);

  // Iniciar timer cuando aparece una nueva pregunta
  useEffect(() => {
    if (estado === "jugando" && !mostrarResultado && preguntasSession.length > 0) {
      setTiempoInicio(Date.now());
    }
  }, [preguntaActual, estado, mostrarResultado, preguntasSession]);

  const calcularPuntos = (esCorrecta, tiempoRespuesta, rachaActual) => {
    if (!esCorrecta) return 0;

    let puntos = 15;
    
    const bonoVelocidad = 
      tiempoRespuesta < 1500 ? 6 :
      tiempoRespuesta < 2500 ? 4 :
      tiempoRespuesta < 4000 ? 2 :
      0;
    puntos += bonoVelocidad;
    
    const bonoRacha = 
      rachaActual >= 7 ? 7 :
      rachaActual >= 5 ? 5 :
      rachaActual >= 3 ? 3 :
      rachaActual >= 2 ? 2 :
      0;
    puntos += bonoRacha;

    return puntos;
  };

  const manejarRespuesta = (opcion) => {
    if (mostrarResultado || preguntasSession.length === 0 || juegoHoyJugado) return;
    
    const tiempoFin = Date.now();
    const tiempoRespuesta = tiempoFin - tiempoInicio;
    tiempoRespuestaRef.current = tiempoRespuesta;
    
    setOpcionSeleccionada(opcion);
    setMostrarResultado(true);

    const pregunta = preguntasSession[preguntaActual];
    const esCorrecta = opcion === pregunta.respuesta;
    
    if (esCorrecta) {
      const puntos = calcularPuntos(true, tiempoRespuesta, rachas);
      setPuntosGanados(puntos);
      setPuntuacion(prev => prev + puntos);
      
      const nuevaRacha = rachas + 1;
      setRachas(nuevaRacha);
      if (nuevaRacha > mejorRacha) {
        setMejorRacha(nuevaRacha);
      }
    } else {
      setPuntosGanados(0);
      setRachas(0);
    }

    setTimeout(() => {
      if (preguntaActual < preguntasSession.length - 1) {
        setPreguntaActual(prev => prev + 1);
        setMostrarResultado(false);
        setOpcionSeleccionada(null);
        setPuntosGanados(0);
      } else {
        // Juego terminado - marcar como jugado hoy
        marcarJuegoComoJugadoHoy();
        
        const datosSession = {
          mejorRacha: mejorRacha,
          preguntasRespondidas: preguntasSession.length,
          duracion: Date.now() - tiempoInicio,
          detalles: {
            rachaMaxima: mejorRacha,
            preguntasCorrectas: Math.round(puntuacion / 10)
          }
        };
        guardarEnRanking(juegoId, puntuacion, datosSession);
        setEstado("terminado");
      }
    }, 2000);
  };

  const reiniciarJuego = () => {
    if (juegoHoyJugado) return;
    
    const nuevasPreguntas = obtenerPreguntasAleatorias(juegoId);
    setPreguntasSession(nuevasPreguntas);
    
    setEstado("jugando");
    setPuntuacion(0);
    setPreguntaActual(0);
    setOpcionSeleccionada(null);
    setMostrarResultado(false);
    setRachas(0);
    setMejorRacha(0);
    setPuntosGanados(0);
  };


  // PANTALLA DE "YA JUGADO HOY" - SOLO PARA JUEGOS DE PREGUNTAS
  if (juegoHoyJugado && juegoId !== "memory") {
    return (
      <div className="text-center">
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
          <div className="text-4xl mb-4">⏰</div>
          <h3 className="text-2xl font-bold text-yellow-800 mb-2">¡Ya jugaste hoy!</h3>
          <p className="text-yellow-700 mb-4">
            Los juegos de preguntas solo se pueden jugar <strong>1 vez al día</strong>.
          </p>
          <p className="text-yellow-600 text-sm">
            Podrás volver a jugar mañana.
          </p>
          <p className="text-yellow-500 text-xs mt-2">
            💡 El juego Memory no tiene esta restricción
          </p>
        </div>
        <button
          onClick={volverASeleccion}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          Volver a Juegos
        </button>
      </div>
    );
  }

  if (preguntasSession.length === 0) {
    return <div className="text-center">Cargando preguntas...</div>;
  }

  if (estado === "terminado") {
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">¡Juego Terminado! 🎉</h3>
        <div className="bg-white/90 rounded-2xl p-6 shadow-lg mb-6">
          <div className="text-3xl font-bold text-green-600 mb-4">
            {puntuacion} puntos
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Mejor racha</div>
              <div className="text-lg font-bold text-blue-600">{mejorRacha} seguidos</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Tu récord</div>
              <div className="text-lg font-bold text-purple-600">
                {mejorPuntuacionCargada ? mejorPuntuacion : "..."} pts
              </div>
            </div>
          </div>
          
          {mejorPuntuacionCargada && puntuacion > mejorPuntuacion && mejorPuntuacion > 0 && (
            <div className="text-xl font-bold text-yellow-600 mb-4">
              🏆 ¡Nuevo récord personal!
            </div>
          )}
          
          {mejorPuntuacionCargada && mejorPuntuacion === 0 && (
            <div className="text-xl font-bold text-blue-600 mb-4">
              ⭐ ¡Primera puntuación registrada!
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={reiniciarJuego}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
          >
            🔄 Jugar Otra Vez
          </button>
          <button
            onClick={volverASeleccion}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Volver a Juegos
          </button>
        </div>
      </div>
    );
  }

  const pregunta = preguntasSession[preguntaActual];
  const datosJuego = getBancoGrande();

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-6">{datosJuego.titulo}</h3>
      
      {/* BARRA DE ESTADÍSTICAS */}
      <div className="grid grid-cols-4 gap-4 mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4">
        <div className="text-center">
          <div className="text-sm text-blue-600">Pregunta</div>
          <div className="text-lg font-bold text-blue-700">{preguntaActual + 1}/{preguntasSession.length}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-green-600">Puntos</div>
          <div className="text-lg font-bold text-green-700">{puntuacion}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-orange-600">Racha</div>
          <div className="text-lg font-bold text-orange-700">{rachas} {rachas > 1 ? '🔥' : ''}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-purple-600">Mejor</div>
          <div className="text-lg font-bold text-purple-700">
            {mejorPuntuacionCargada ? mejorPuntuacion : "..."}
          </div>
        </div>
      </div>

      {/* PREGUNTA ACTUAL */}
      <div className="bg-white/90 rounded-2xl p-6 shadow-lg mb-6">
        <p className="text-xl font-semibold mb-6">
          {pregunta.pregunta}
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          {pregunta.opciones.map((opcion, index) => (
            <button
              key={index}
              onClick={() => manejarRespuesta(opcion)}
              disabled={mostrarResultado}
              className={`p-4 rounded-xl font-medium transition-all transform ${
                mostrarResultado 
                  ? opcion === pregunta.respuesta
                    ? 'bg-green-500 text-white scale-105 shadow-lg'
                    : opcion === opcionSeleccionada
                    ? 'bg-red-500 text-white opacity-70'
                    : 'bg-gray-200 text-gray-500'
                  : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 hover:shadow-md'
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTADO CON DESGLOSE DE PUNTOS */}
      {mostrarResultado && (
        <div className="bg-white/90 rounded-2xl p-6 shadow-lg mb-6">
          <div className={`text-xl font-bold mb-4 ${
            opcionSeleccionada === pregunta.respuesta ? 'text-green-600' : 'text-red-600'
          }`}>
            {opcionSeleccionada === pregunta.respuesta ? (
              <div>
                <div>✅ ¡Correcto! +{puntosGanados} puntos</div>
                <div className="text-sm text-gray-600 mt-2">
                  <div>Base: 15 puntos</div>
                  {tiempoRespuestaRef.current < 1500 && <div>Velocidad: +6 puntos ⚡</div>}
                  {tiempoRespuestaRef.current < 2500 && tiempoRespuestaRef.current >= 1500 && <div>Velocidad: +4 puntos 🔥</div>}
                  {tiempoRespuestaRef.current < 4000 && tiempoRespuestaRef.current >= 2500 && <div>Velocidad: +2 puntos ✅</div>}
                  {rachas >= 7 && <div>Racha: +7 puntos 🏆</div>}
                  {rachas >= 5 && rachas < 7 && <div>Racha: +5 puntos ⭐</div>}
                  {rachas >= 3 && rachas < 5 && <div>Racha: +3 puntos 🔥</div>}
                  {rachas === 2 && <div>Racha: +2 puntos 👍</div>}
                </div>
              </div>
            ) : (
              <div>
                <div>❌ Incorrecto</div>
                <div className="text-sm text-gray-600 mt-1">
                  Respuesta correcta: <strong>{pregunta.respuesta}</strong>
                </div>
                <div className="text-sm text-red-500 mt-1">
                  Racha reiniciada 💔
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTÓN VOLVER */}
      <button
        onClick={volverASeleccion}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all mt-4"
      >
        Volver a Juegos
      </button>
    </div>
  );
};

// MEMORY GAME MEJORADO - 10 PARES Y SISTEMA DE PUNTOS MEJORADO
const MemoryGame = ({ 
  usuarioActual, 
  volverASeleccion, 
  guardarEnRanking, 
  obtenerMejorPuntuacionPersonal 
}) => {
  // CAMBIO 1: Aumentar de 8 a 10 pares
  const cartasMemory = [
    "🎅", "🎅", "🎄", "🎄", "🎁", "🎁", "❄️", "❄️",
    "🌟", "🌟", "🦌", "🦌", "🍪", "🍪", "🔔", "🔔",
    "🕯️", "🕯️", "🎀", "🎀"  // NUEVOS PARES AÑADIDOS
  ];

  const [cartas, setCartas] = useState([]);
  const [cartasVolteadas, setCartasVolteadas] = useState([]);
  const [paresEncontrados, setParesEncontrados] = useState(0);
  const [movimientos, setMovimientos] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [bloquearClics, setBloquearClics] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [mejorPuntuacion, setMejorPuntuacion] = useState(0);
  const [mejorPuntuacionCargada, setMejorPuntuacionCargada] = useState(false);

  // Cargar mejor puntuación al iniciar
  useEffect(() => {
    const cargarMejorPuntuacion = async () => {
      const mejor = await obtenerMejorPuntuacionPersonal("memory");
      setMejorPuntuacion(mejor);
      setMejorPuntuacionCargada(true);
    };
    cargarMejorPuntuacion();
  }, []);

  // CAMBIO 2: SISTEMA DE PUNTOS MEJORADO PARA 10 PARES
  const calcularPuntuacionMemory = (totalMovimientos) => {
    const base = 100;
    let bonus = 0;
    const m = totalMovimientos;

    // Sistema mejorado basado en movimientos para 10 pares
    if (m <= 20) bonus = 150;        // Perfecto (mínimo teórico)
    else if (m <= 22) bonus = 130;   // Elite
    else if (m <= 24) bonus = 110;   // Excelente
    else if (m <= 26) bonus = 90;    // Muy bueno
    else if (m <= 28) bonus = 70;    // Bueno
    else if (m <= 30) bonus = 50;    // Regular
    else if (m <= 32) bonus = 30;    // Normal
    else if (m <= 34) bonus = 20;    // Básico
    else if (m <= 36) bonus = 10;    // Principiante
    else bonus = 0;                  // Sin bonus

    const final = base + bonus;
    return Math.max(100, final);
  };

  useEffect(() => {
    iniciarJuego();
  }, []);

  const iniciarJuego = () => {
    const cartasMezcladas = [...cartasMemory]
      .map((emoji, index) => ({ id: index, emoji, volteada: false, encontrada: false }))
      .sort(() => Math.random() - 0.5);
    
    setCartas(cartasMezcladas);
    setParesEncontrados(0);
    setMovimientos(0);
    setCartasVolteadas([]);
    setJuegoTerminado(false);
    setBloquearClics(false);
    setPuntuacion(0);
  };

  const voltearCarta = (index) => {
    if (bloquearClics || juegoTerminado || cartas[index].encontrada || cartas[index].volteada) return;

    const nuevasCartas = [...cartas];
    nuevasCartas[index].volteada = true;
    setCartas(nuevasCartas);

    const nuevasVolteadas = [...cartasVolteadas, index];
    setCartasVolteadas(nuevasVolteadas);

    if (nuevasVolteadas.length === 2) {
      const nuevosMovimientos = movimientos + 1;
      setMovimientos(nuevosMovimientos);
      setBloquearClics(true);
      
      setTimeout(() => {
        const [primeraIndex, segundaIndex] = nuevasVolteadas;
        if (cartas[primeraIndex].emoji === cartas[segundaIndex].emoji) {
          nuevasCartas[primeraIndex].encontrada = true;
          nuevasCartas[segundaIndex].encontrada = true;
          
          setParesEncontrados(prev => {
            const nuevosPares = prev + 1;
            if (nuevosPares === 10) { // CAMBIO: 8 → 10 pares
              setJuegoTerminado(true);
              const totalMovimientos = nuevosMovimientos;
              const puntuacionFinal = calcularPuntuacionMemory(totalMovimientos);
              setPuntuacion(puntuacionFinal);
              
              const datosSession = {
                paresEncontrados: 10, // CAMBIO: 8 → 10
                movimientos: totalMovimientos,
                duracion: 0,
                detalles: {
                  eficiencia: totalMovimientos <= 20 ? "perfecto" : 
                            totalMovimientos <= 24 ? "excelente" :
                            totalMovimientos <= 28 ? "muy bueno" : 
                            totalMovimientos <= 32 ? "bueno" : "normal",
                  movimientosRealizados: totalMovimientos 
                }
              };
              
              guardarEnRanking("memory", puntuacionFinal, datosSession);
            }
            return nuevosPares;
          });
        } else {
          nuevasCartas[primeraIndex].volteada = false;
          nuevasCartas[segundaIndex].volteada = false;
        }
        
        setCartas([...nuevasCartas]);
        setCartasVolteadas([]);
        setBloquearClics(false);
      }, 1000);
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-4">🧠 Memory Navideño</h3>
      
      <div className="grid grid-cols-4 gap-4 mb-6 bg-purple-100 rounded-xl p-4">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-700">{paresEncontrados}/10</div> {/* CAMBIO: 8 → 10 */}
          <div className="text-sm text-purple-600">Pares</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-700">{movimientos}</div>
          <div className="text-sm text-purple-600">Movimientos</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-700">{puntuacion}</div>
          <div className="text-sm text-purple-600">Puntos</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-700">
            {mejorPuntuacionCargada ? mejorPuntuacion : "..."}
          </div>
          <div className="text-sm text-purple-600">Mejor</div>
        </div>
      </div>

      {/* CAMBIO: Grid de 5x4 para 20 cartas (10 pares) */}
      <div className="grid grid-cols-5 gap-3 mb-6 max-w-md mx-auto"> {/* CAMBIO: 4 → 5 columnas */}
        {cartas.map((carta, index) => (
          <button
            key={carta.id}
            onClick={() => voltearCarta(index)}
            disabled={carta.encontrada || bloquearClics}
            className={`w-14 h-14 text-xl rounded-xl transition-all duration-300 transform ${
              carta.volteada || carta.encontrada 
                ? 'bg-white border-2 border-purple-500 scale-105' 
                : 'bg-purple-500 hover:bg-purple-600 text-white hover:scale-105'
            } ${carta.encontrada ? 'ring-2 ring-green-500' : ''}`}
          >
            {(carta.volteada || carta.encontrada) ? carta.emoji : "?"}
          </button>
        ))}
      </div>

      {juegoTerminado && (
        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 mb-4">
          <div className="text-2xl mb-2">🎉 ¡Felicidades!</div>
          <p className="text-green-700">
            Completaste el memory en <strong>{movimientos} movimientos</strong>
          </p>
          <p className="text-green-600">
            Puntos obtenidos: <strong>{puntuacion}</strong>
          </p>
          
          {mejorPuntuacionCargada && puntuacion > mejorPuntuacion && mejorPuntuacion > 0 && (
            <p className="text-green-800 font-bold mt-2">
              🏆 ¡Nuevo récord personal!
            </p>
          )}
          
          {mejorPuntuacionCargada && mejorPuntuacion === 0 && (
            <p className="text-blue-600 font-bold mt-2">
              ⭐ ¡Primera puntuación registrada!
            </p>
          )}
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={iniciarJuego}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
            >
              🔄 Jugar Otra Vez
            </button>
            <button
              onClick={volverASeleccion}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
            >
              Volver a Juegos
            </button>
          </div>
        </div>
      )}

      {!juegoTerminado && (
        <button
          onClick={volverASeleccion}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all mt-4"
        >
          Volver a Juegos
        </button>
      )}
    </div>
  );
};

// COMPONENTE PRINCIPAL MEJORADO
export default function Juegos() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [juegoActivo, setJuegoActivo] = useState(null);
  const [rankingGlobal, setRankingGlobal] = useState({});
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const juegos = [
    {
      id: "memory",
      nombre: "🧠 Memory Navideño",
      descripcion: "Encuentra las parejas de emojis navideños",
      icono: "🧠",
      color: "from-purple-500 to-pink-500",
      dificultad: "Fácil"
    },
    {
      id: "peliculas",
      nombre: "🎬 Adivina la Película",
      descripcion: "Descubre la película por emojis",
      icono: "🎬",
      color: "from-blue-500 to-cyan-500",
      dificultad: "Media"
    },
    {
      id: "canciones",
      nombre: "🎵 Completa la Canción",
      descripcion: "Termina la letra del villancico",
      icono: "🎵",
      color: "from-green-500 to-emerald-500",
      dificultad: "Fácil"
    },
    {
      id: "quiz",
      nombre: "❓ Trivia Familiar",
      descripcion: "Preguntas sobre nuestra familia Goba",
      icono: "❓",
      color: "from-orange-500 to-red-500",
      dificultad: "Media"
    },
    {
      id: "familia",
      nombre: "🔤 Refranes",
      descripcion: "Adivina el refrán",
      icono: "🔤",
      color: "from-yellow-500 to-amber-500",
      dificultad: "Difícil"
    }
  ];

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) {
      window.location.href = "/login";
      return;
    }
    setUsuarioActual(usuario);
    cargarRankings();
  }, []);

  // FUNCIÓN MEJORADA PARA CARGAR RANKINGS
  const cargarRankings = async () => {
    try {
      setCargando(true);
      setMensaje("🔄 Cargando rankings desde Firebase...");
      
      const nuevoRankingGlobal = {};
      
      for (const juego of juegos) {
        try {
          const rankingJuego = await gobaService.obtenerRankingJuego(juego.id);
          nuevoRankingGlobal[juego.id] = {};
          
          rankingJuego.forEach(jugador => {
            nuevoRankingGlobal[juego.id][jugador.usuarioId] = {
              nombre: jugador.nombre,
              puntuacion: jugador.mejorPuntuacion,
              fecha: jugador.fechaUltimoIntento,
              avatar: jugador.avatar
            };
          });
        } catch (error) {
          console.log(`⚠️ Error cargando ranking de ${juego.id}:`, error);
          nuevoRankingGlobal[juego.id] = {};
        }
      }
      
      setRankingGlobal(nuevoRankingGlobal);
      localStorage.setItem('rankingGlobal', JSON.stringify(nuevoRankingGlobal));
      setMensaje("✅ Rankings cargados desde Firebase");
      
    } catch (error) {
      console.log('❌ Error cargando rankings de Firebase:', error);
      setMensaje("⚠️ Error cargando rankings");
      const rankingLocal = JSON.parse(localStorage.getItem('rankingGlobal')) || {};
      setRankingGlobal(rankingLocal);
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  // FUNCIÓN MEJORADA PARA GUARDAR EN RANKING
  const guardarEnRanking = async (juegoId, puntuacion, datosSession = {}) => {
    try {
      setMensaje("📡 Guardando puntuación...");
      
      const resultado = await gobaService.guardarPuntuacionJuego(
        usuarioActual.id,
        juegoId,
        puntuacion,
        datosSession
      );
      
      if (resultado.esNuevoRecord) {
        setMensaje("🎉 ¡Nuevo récord personal!");
      } else {
        setMensaje("✅ Puntuación guardada");
      }
      
      cargarRankings();
      
    } catch (error) {
      console.log('❌ Error guardando en Firebase:', error);
      setMensaje("⚠️ Error guardando puntuación");
      
      const usuarioKey = usuarioActual.nombre;
      setRankingGlobal(prev => {
        const nuevoRanking = { ...prev };
        
        if (!nuevoRanking[juegoId]) {
          nuevoRanking[juegoId] = {};
        }
        
        const puntuacionActual = nuevoRanking[juegoId][usuarioKey]?.puntuacion || 0;
        if (puntuacion > puntuacionActual) {
          nuevoRanking[juegoId][usuarioKey] = {
            nombre: usuarioActual.nombre,
            puntuacion: puntuacion,
            fecha: new Date().toISOString(),
            avatar: usuarioActual.avatar || "👤"
          };
          
          localStorage.setItem('rankingGlobal', JSON.stringify(nuevoRanking));
        }
        
        return nuevoRanking;
      });
    } finally {
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const obtenerMejorPuntuacionPersonal = async (juegoId) => {
    if (!usuarioActual) return 0;
    
    try {
      const mejor = await gobaService.obtenerMejorPuntuacionPersonal(
        usuarioActual.id, 
        juegoId
      );
      return mejor;
    } catch (error) {
      console.log('Error obteniendo mejor puntuación:', error);
      return 0;
    }
  };

  const obtenerRankingJuego = (juegoId) => {
    if (!rankingGlobal[juegoId]) return [];
    
    return Object.values(rankingGlobal[juegoId])
      .sort((a, b) => b.puntuacion - a.puntuacion)
      .slice(0, 10);
  };

  const iniciarJuego = (juegoId) => {
    setJuegoActivo(juegoId);
  };

  const volverASeleccion = () => {
    setJuegoActivo(null);
  };

  // COMPONENTE RANKING MEJORADO
  const RankingJuego = ({ juegoId, juegoNombre }) => {
    const ranking = obtenerRankingJuego(juegoId);
    const [mejorPuntuacion, setMejorPuntuacion] = useState(0);
    const [mejorPuntuacionCargada, setMejorPuntuacionCargada] = useState(false);

    useEffect(() => {
      const cargarMejorPuntuacion = async () => {
        const mejor = await obtenerMejorPuntuacionPersonal(juegoId);
        setMejorPuntuacion(mejor);
        setMejorPuntuacionCargada(true);
      };
      cargarMejorPuntuacion();
    }, [juegoId]);

    if (cargando) {
      return (
        <div className="bg-white/90 rounded-2xl p-6 shadow-lg mb-6">
          <h4 className="text-xl font-bold mb-4 text-center">🏆 {juegoNombre}</h4>
          <div className="text-center text-gray-500 py-4">
            Cargando rankings...
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white/90 rounded-2xl p-6 shadow-lg mb-6">
        <h4 className="text-xl font-bold mb-4 text-center">🏆 {juegoNombre}</h4>
        
        {ranking.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            Aún no hay puntuaciones registradas
          </div>
        ) : (
          <div className="space-y-3">
            {ranking.map((jugador, index) => (
              <div 
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  jugador.nombre === usuarioActual?.nombre 
                    ? 'bg-yellow-100 border-2 border-yellow-400' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-400' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                  } text-white`}>
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{jugador.avatar}</span>
                    <span className={`font-medium ${
                      jugador.nombre === usuarioActual?.nombre ? 'text-yellow-700' : 'text-gray-700'
                    }`}>
                      {jugador.nombre}
                    </span>
                  </div>
                </div>
                <div className="font-bold text-gray-800">{jugador.puntuacion} pts</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-center">
            <p className="text-blue-700 font-semibold">
              Tu mejor puntuación: <strong>
                {mejorPuntuacionCargada ? mejorPuntuacion : "..."} pts
              </strong>
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!usuarioActual) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            🎮 Zona de Juegos Navideños
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-light">
            Competitividad mejorada. ¡Supera tus propios récords!
          </p>
          <p className="text-xl text-gray-600 mb-8 font-light">
           ⭐ "Premios para Líderes de rankings los Domingos"
          </p>
          
          {mensaje && (
            <div className={`inline-block px-4 py-2 rounded-lg mb-4 ${
              mensaje.includes('✅') || mensaje.includes('🎉') ? 'bg-green-100 text-green-700 border border-green-300' :
              mensaje.includes('⚠️') ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
              'bg-blue-100 text-blue-700 border border-blue-300'
            }`}>
              {mensaje}
            </div>
          )}
          
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 inline-block">
            <p className="text-yellow-700 text-sm">
              ⏰ <strong>Regla:</strong> Los juegos de preguntas solo se pueden jugar 1 vez al día
            </p>
          </div>
        </div>

        {!juegoActivo ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {juegos.map((juego) => (
                <div
                  key={juego.id}
                  className={`bg-gradient-to-br ${juego.color} rounded-2xl p-6 text-white text-center shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                  onClick={() => iniciarJuego(juego.id)}
                >
                  <div className="text-5xl mb-4">{juego.icono}</div>
                  <h3 className="text-xl font-bold mb-2">{juego.nombre}</h3>
                  <p className="text-white/90 mb-3">{juego.descripcion}</p>
                  <div className="bg-white/20 rounded-full px-3 py-1 text-sm inline-block mb-2">
                    {juego.dificultad}
                  </div>
                  <div className="mt-2 bg-white/30 rounded-full px-3 py-1 text-sm">
                    Mejor: {rankingGlobal[juego.id]?.[usuarioActual.id]?.puntuacion || 0} pts
                  </div>
                </div>
              ))}
            </div>

            {/* RANKINGS */}
            <div className="bg-white/90 rounded-2xl p-8 shadow-2xl border-2 border-purple-200 mb-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">🏆 Rankings Globales</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={cargarRankings}
                    disabled={cargando}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    {cargando ? '🔄 Actualizando...' : '🔄 Actualizar'}
                  </button>
                </div>
              </div>
              
              {mensaje && (
                <div className="mb-4 text-center">
                  <span className="text-sm text-gray-600">{mensaje}</span>
                </div>
              )}
              
              {cargando ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Cargando rankings globales...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {juegos.map((juego) => (
                    <RankingJuego 
                      key={juego.id} 
                      juegoId={juego.id} 
                      juegoNombre={juego.nombre} 
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-purple-200 max-w-2xl mx-auto">
            {juegoActivo === "memory" ? (
              <MemoryGame 
                usuarioActual={usuarioActual}
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRanking}
                obtenerMejorPuntuacionPersonal={obtenerMejorPuntuacionPersonal}
              />
            ) : (
              <JuegoSimple 
                juegoId={juegoActivo}
                usuarioActual={usuarioActual}
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRanking}
                obtenerMejorPuntuacionPersonal={obtenerMejorPuntuacionPersonal}
              />
            )}
          </div>
        )}

        {usuarioActual?.esAdmin && !juegoActivo && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mt-8">
            <h3 className="text-2xl font-bold mb-4 text-yellow-800 text-center">
              👑 Panel de Administración - Juegos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={async () => {
                  if (window.confirm('¿REINICIAR TODOS LOS PUNTAJES?\n\n⚠️ Esta acción eliminará TODOS los rankings y sesiones de juego. Es irreversible.')) {
                    try {
                      setMensaje("🗑️ Reiniciando puntajes...");
                      const resultado = await gobaService.reiniciarTodosLosPuntajes();
                      setMensaje(resultado.message);
                      cargarRankings();
                    } catch (error) {
                      setMensaje("❌ Error: " + error.message);
                    }
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105"
              >
                🗑️ Reiniciar Todos los Puntajes
              </button>
              
              <Link 
                to="/concurso-rapido"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 text-center flex items-center justify-center"
              >
                ⚡ Ir al Concurso Rápido
              </Link>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-yellow-700 text-sm">
                💡 <strong>Acciones de administrador:</strong> Solo visible para usuarios admin
              </p>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ← Volver al Home
          </Link>
        </div>
      </div>
    </div>
  );
}