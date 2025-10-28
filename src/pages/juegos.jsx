// src/components/Juegos.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

// COMPONENTE BASE CON SISTEMA KAHOOT MEJORADO
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

  // Cargar mejor puntuación al iniciar
  useEffect(() => {
    const cargarMejorPuntuacion = async () => {
      const mejor = await obtenerMejorPuntuacionPersonal(juegoId);
      setMejorPuntuacion(mejor);
    };
    cargarMejorPuntuacion();
  }, [juegoId]);

  // Banco grande de preguntas (25 por juego)
  const getBancoGrande = () => {
    const bancos = {
      peliculas: {
        titulo: "🎬 Adivina la Película",
        preguntas: [
          { pregunta: "🎅👶🌟", opciones: ["Elf", "Santa Claus", "The Grinch", "Polar Express"], respuesta: "Elf" },
          { pregunta: "🏠🔌🎄", opciones: ["Home Alone", "Christmas Vacation", "The Holiday", "Deck the Halls"], respuesta: "Home Alone" },
          { pregunta: "👦👦🚂🎅", opciones: ["Polar Express", "The Santa Clause", "Arthur Christmas", "Fred Claus"], respuesta: "Polar Express" },
          { pregunta: "🔴👃🦌", opciones: ["Rudolph", "Frosty", "Santa", "Jack Frost"], respuesta: "Rudolph" },
          { pregunta: "👻🎄🎁", opciones: ["The Grinch", "Scrooge", "Nightmare Before Christmas", "Ghosts of Girlfriends Past"], respuesta: "The Grinch" },
          { pregunta: "👨‍👩‍👧‍👦✈️🎄", opciones: ["The Family Stone", "Home for the Holidays", "Four Christmases", "Christmas with the Kranks"], respuesta: "The Family Stone" },
          { pregunta: "🎄👦🎁", opciones: ["A Christmas Story", "The Santa Clause", "Jingle All the Way", "Deck the Halls"], respuesta: "A Christmas Story" },
          { pregunta: "👨💼🎄", opciones: ["Scrooged", "The Family Man", "Christmas with the Kranks", "The Holiday"], respuesta: "Scrooged" },
          { pregunta: "🎅🏢🛷", opciones: ["The Santa Clause", "Miracle on 34th Street", "Santa Claus: The Movie", "Fred Claus"], respuesta: "The Santa Clause" },
          { pregunta: "👦🔫🎄", opciones: ["Home Alone", "Die Hard", "The Ref", "Bad Santa"], respuesta: "Home Alone" },
          { pregunta: "❄️👸👗", opciones: ["Frozen", "Snow Queen", "The Nutcracker", "Ice Princess"], respuesta: "Frozen" },
          { pregunta: "🎄👻👦", opciones: ["The Nightmare Before Christmas", "Casper", "Beetlejuice", "Ghostbusters"], respuesta: "The Nightmare Before Christmas" },
          { pregunta: "🦌🔴🌟", opciones: ["Rudolph the Red-Nosed Reindeer", "Prancer", "The Year Without a Santa Claus", "Santa's Apprentice"], respuesta: "Rudolph the Red-Nosed Reindeer" },
          { pregunta: "🎅🎁👶", opciones: ["Santa Baby", "The Santa Clause", "Elf", "Jingle All the Way"], respuesta: "Santa Baby" },
          { pregunta: "🏠🎄👨‍👩‍👧‍👦", opciones: ["National Lampoon's Christmas Vacation", "The Family Stone", "Home for the Holidays", "Four Christmases"], respuesta: "National Lampoon's Christmas Vacation" },
          { pregunta: "🎄✨👦", opciones: ["The Polar Express", "A Christmas Carol", "The Little Boy", "The Christmas Star"], respuesta: "The Polar Express" },
          { pregunta: "👨‍💻🎅🤖", opciones: ["The Santa Clause", "Jingle All the Way", "Santa Claus: The Movie", "The Christmas Chronicles"], respuesta: "The Santa Clause" },
          { pregunta: "🎄🏆👦", opciones: ["Jingle All the Way", "The Santa Clause", "Deck the Halls", "Christmas with the Kranks"], respuesta: "Jingle All the Way" },
          { pregunta: "❄️🎩🐧", opciones: ["Happy Feet", "March of the Penguins", "Surf's Up", "Arctic Tale"], respuesta: "Happy Feet" },
          { pregunta: "🎄👮‍♂️💍", opciones: ["Die Hard", "Lethal Weapon", "Bad Boys", "Rush Hour"], respuesta: "Die Hard" },
          { pregunta: "👻📖🎄", opciones: ["A Christmas Carol", "The Nightmare Before Christmas", "Scrooged", "Ghosts of Girlfriends Past"], respuesta: "A Christmas Carol" },
          { pregunta: "🎅🤴👸", opciones: ["The Princess Switch", "A Christmas Prince", "The Royal Treatment", "The Knight Before Christmas"], respuesta: "A Christmas Prince" },
          { pregunta: "🏠🎄🔥", opciones: ["The Holiday", "Home Alone", "The Family Stone", "Christmas with the Kranks"], respuesta: "The Holiday" },
          { pregunta: "🎄👦🦸", opciones: ["The Christmas Chronicles", "The Santa Clause", "Elf", "Jingle All the Way"], respuesta: "The Christmas Chronicles" },
          { pregunta: "❄️👑🔍", opciones: ["Frozen", "Snow White", "The Snow Queen", "Ice Princess"], respuesta: "Frozen" }
        ]
      },
      canciones: {
        titulo: "🎵 Completa la Canción",
        preguntas: [
          { pregunta: "Noche de ____, noche de amor", opciones: ["paz", "alegría", "magia", "ensueño"], respuesta: "paz" },
          { pregunta: "Campana sobre campana, y sobre campana ____", opciones: ["una", "dos", "tres", "cuatro"], respuesta: "una" },
          { pregunta: "Mi burrito sabanero, vamos a ____", opciones: ["Belén", "la fiesta", "cantar", "pasear"], respuesta: "Belén" },
          { pregunta: "Los peces en el río, pero mira cómo ____", opciones: ["beben", "nadan", "saltan", "juegan"], respuesta: "beben" },
          { pregunta: "Arre borriquito, vamos a ____", opciones: ["Belén", "cantar", "bailar", "correr"], respuesta: "Belén" },
          { pregunta: "Ya viene la vieja, con el ____", opciones: ["aguinaldo", "regalo", "pavo", "chocolate"], respuesta: "aguinaldo" },
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
          { pregunta: "Noche de ____, noche de amor", opciones: ["paz", "alegría", "magia", "ensueño"], respuesta: "paz" },
          { pregunta: "Con mi ____ cantaré", opciones: ["burrito", "caballo", "perrito", "gatito"], respuesta: "burrito" },
          { pregunta: "A ____ me voy", opciones: ["Belén", "casa", "la fiesta", "la iglesia"], respuesta: "Belén" },
          { pregunta: "____ de la rosa", opciones: ["Flor", "Rey", "Canto", "Belleza"], respuesta: "Flor" },
          { pregunta: "____, qué noche tan linda", opciones: ["Navidad", "Amigos", "Fiesta", "Alegría"], respuesta: "Navidad" },
          { pregunta: "Vuela, vuela, vuela, la ____", opciones: ["mariposa", "campana", "estrella", "paloma"], respuesta: "campana" },
          { pregunta: "____, José, no te dé cuidado", opciones: ["María", "Mujer", "Esposa", "Querida"], respuesta: "María" },
          { pregunta: "El ____ al niño le trae", opciones: ["burrito", "pastor", "rey", "ángel"], respuesta: "burrito" }
        ]
      },
      quiz: {
        titulo: "❓ Trivia Familiar Goba",
        preguntas: [
          { pregunta: "¿Quién hace el mejor pavo en Navidad?", opciones: ["Mamá", "Papá", "La abuela", "La tía"], respuesta: "Mamá" },
          { pregunta: "¿Qué tradición familiar empezó en 2020?", opciones: ["Intercambio de regalos", "Cena temática", "Fotos familiares", "Juegos después de cenar"], respuesta: "Intercambio de regalos" },
          { pregunta: "¿Quién siempre se queda dormido primero en Nochebuena?", opciones: ["El abuelo", "El primo", "La tía", "El sobrino"], respuesta: "El abuelo" },
          { pregunta: "¿Cuál es el postre favorito de la familia en Navidad?", opciones: ["Torta de chocolate", "Pie de manzana", "Flan", "Galletas decoradas"], respuesta: "Torta de chocolate" },
          { pregunta: "¿Quién organiza la decoración navideña cada año?", opciones: ["Los niños", "Mamá", "Papá", "Todos juntos"], respuesta: "Los niños" },
          { pregunta: "¿Qué película navideña ven siempre juntos?", opciones: ["Home Alone", "The Grinch", "Elf", "Polar Express"], respuesta: "Home Alone" },
          { pregunta: "¿Quién siempre llega tarde a la cena familiar?", opciones: ["El tío Carlos", "La prima Ana", "El abuelo", "La tía María"], respuesta: "El tío Carlos" },
          { pregunta: "¿Qué juego familiar es el favorito en Navidad?", opciones: ["Uno", "Monopoly", "Cartas", "Juegos de mesa"], respuesta: "Uno" },
          { pregunta: "¿Quién canta mejor los villancicos?", opciones: ["La abuela", "Mamá", "Los niños", "Papá"], respuesta: "La abuela" },
          { pregunta: "¿Qué postre navideño es el más esperado?", opciones: ["Galletas de jengibre", "Pie de manzana", "Torta de chocolate", "Flan"], respuesta: "Galletas de jengibre" },
          { pregunta: "¿Quién siempre toma fotos de todos?", opciones: ["La hija mayor", "Mamá", "Papá", "El primo"], respuesta: "La hija mayor" },
          { pregunta: "¿Qué bebida caliente prefieren en Navidad?", opciones: ["Chocolate caliente", "Ponche", "Café", "Té"], respuesta: "Chocolate caliente" },
          { pregunta: "¿Quién cuenta los chistes más graciosos?", opciones: ["Papá", "El tío", "El abuelo", "Los primos"], respuesta: "Papá" },
          { pregunta: "¿Qué adornos navideños son los favoritos?", opciones: ["Las esferas brillantes", "Las luces", "El pesebre", "La estrella"], respuesta: "Las esferas brillantes" },
          { pregunta: "¿Quién siempre gana en los juegos de mesa?", opciones: ["El primo mayor", "La abuela", "Los niños", "Mamá"], respuesta: "El primo mayor" },
          { pregunta: "¿Qué canción navideña cantan todos juntos?", opciones: ["Noche de Paz", "Campana sobre campana", "Mi Burrito Sabanero", "Los Peces en el Río"], respuesta: "Noche de Paz" },
          { pregunta: "¿Quién organiza el intercambio de regalos?", opciones: ["Mamá", "Papá", "Los niños", "Todos juntos"], respuesta: "Mamá" },
          { pregunta: "¿Qué comida nunca falta en la cena?", opciones: ["Pavo", "Tamales", "Pierna", "Lomo"], respuesta: "Pavo" },
          { pregunta: "¿Quién decora mejor el árbol?", opciones: ["Los niños", "Mamá", "Papá", "La abuela"], respuesta: "Los niños" },
          { pregunta: "¿Qué momento prefieren de la Navidad?", opciones: ["Abrir regalos", "La cena", "Cantar villancicos", "Jugar juegos"], respuesta: "Abrir regalos" },
          { pregunta: "¿Quién siempre pide el mismo regalo?", opciones: ["El más pequeño", "El abuelo", "Mamá", "Papá"], respuesta: "El más pequeño" },
          { pregunta: "¿Qué película ven el 24 de diciembre?", opciones: ["Home Alone", "The Grinch", "Elf", "Polar Express"], respuesta: "Home Alone" },
          { pregunta: "¿Quién hace la mejor salsa navideña?", opciones: ["La abuela", "Mamá", "La tía", "Papá"], respuesta: "La abuela" },
          { pregunta: "¿Qué tradición tienen el 25 por la mañana?", opciones: ["Desayuno especial", "Abrir regalos", "Ir a misa", "Llamar a familiares"], respuesta: "Desayuno especial" },
          { pregunta: "¿Quién siempre olvida comprar algún regalo?", opciones: ["Papá", "Mamá", "Los niños", "El tío"], respuesta: "Papá" }
        ]
      },
      familia: {
        titulo: "👨‍👩‍👧‍👦 Adivina el Familiar",
        preguntas: [
          { pregunta: "Esta persona siempre organiza los juegos familiares", opciones: ["María", "Juan", "Carlos", "Ana"], respuesta: "María" },
          { pregunta: "Sabe todas las letras de los villancicos de memoria", opciones: ["La abuela", "El niño", "Papá", "La tía"], respuesta: "La abuela" },
          { pregunta: "Siempre llega tarde a la cena navideña", opciones: ["El tío", "La prima", "Mamá", "El abuelo"], respuesta: "El tío" },
          { pregunta: "Es el mejor contando chistes malos", opciones: ["Papá", "El primo", "La tía", "El sobrino"], respuesta: "Papá" },
          { pregunta: "Nunca se olvida de comprar los regalos", opciones: ["Mamá", "Papá", "La abuela", "El hijo mayor"], respuesta: "Mamá" },
          { pregunta: "Siempre toma fotos de todos los momentos", opciones: ["La hija", "El abuelo", "La tía", "El primo"], respuesta: "La hija" },
          { pregunta: "Tiene la risa más contagiosa de la familia", opciones: ["El primo pequeño", "La abuela", "Mamá", "El tío"], respuesta: "El primo pequeño" },
          { pregunta: "Siempre gana en los juegos de cartas", opciones: ["El abuelo", "Papá", "La tía", "El sobrino"], respuesta: "El abuelo" },
          { pregunta: "Prepara el mejor ponche navideño", opciones: ["La tía", "Mamá", "La abuela", "Papá"], respuesta: "La tía" },
          { pregunta: "Siempre pide el mismo postre cada año", opciones: ["El hijo menor", "El abuelo", "Mamá", "La prima"], respuesta: "El hijo menor" },
          { pregunta: "Organiza la decoración del árbol", opciones: ["Los niños", "Mamá", "Papá", "La abuela"], respuesta: "Los niños" },
          { pregunta: "Siempre cuenta historias del pasado", opciones: ["El abuelo", "La tía", "Papá", "Mamá"], respuesta: "El abuelo" },
          { pregunta: "Es el más emocionado con los regalos", opciones: ["El más pequeño", "La hija", "El primo", "El sobrino"], respuesta: "El más pequeño" },
          { pregunta: "Siempre trae el pavo", opciones: ["Papá", "Mamá", "El tío", "La abuela"], respuesta: "Papá" },
          { pregunta: "Coordina el intercambio de regalos", opciones: ["Mamá", "Papá", "La hija mayor", "El abuelo"], respuesta: "Mamá" },
          { pregunta: "Tiene una colección de adornos navideños", opciones: ["La abuela", "Mamá", "La tía", "Los niños"], respuesta: "La abuela" },
          { pregunta: "Siempre se duerme primero después de la cena", opciones: ["El abuelo", "El primo", "La tía", "El sobrino"], respuesta: "El abuelo" },
          { pregunta: "Es el experto en armar las luces navideñas", opciones: ["Papá", "El tío", "El primo mayor", "El abuelo"], respuesta: "Papá" },
          { pregunta: "Siempre pide pizza el 25 de diciembre", opciones: ["Los jóvenes", "Los niños", "Los adultos", "Todos"], respuesta: "Los jóvenes" },
          { pregunta: "Guarda todos los recuerdos navideños", opciones: ["Mamá", "La hija", "La abuela", "Papá"], respuesta: "Mamá" },
          { pregunta: "Siempre llega con regalos extras", opciones: ["La tía", "El tío", "Los primos", "Los abuelos"], respuesta: "La tía" },
          { pregunta: "Es el primero en probar toda la comida", opciones: ["Papá", "El abuelo", "Los niños", "Mamá"], respuesta: "Papá" },
          { pregunta: "Siempre sugiere ver la misma película", opciones: ["El hijo menor", "La abuela", "Mamá", "El primo"], respuesta: "El hijo menor" },
          { pregunta: "Coordina la hora de la cena", opciones: ["Mamá", "Papá", "La abuela", "La tía"], respuesta: "Mamá" },
          { pregunta: "Siempre se ofrece para lavar los platos", opciones: ["La hija mayor", "El primo", "El tío", "Papá"], respuesta: "La hija mayor" }
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

  // Obtener 6 preguntas aleatorias únicas por sesión
  const obtenerPreguntasAleatorias = (juegoId) => {
    const banco = getBancoGrande();
    const todasPreguntas = [...banco.preguntas];
    
    // Mezclar y tomar 6 únicas
    const mezcladas = [...todasPreguntas].sort(() => Math.random() - 0.5);
    const seleccionadas = mezcladas.slice(0, 6).map(p => mezclarOpciones(p));
    
    return seleccionadas;
  };

  // Inicializar preguntas de la sesión
  useEffect(() => {
    if (preguntasSession.length === 0) {
      const nuevasPreguntas = obtenerPreguntasAleatorias(juegoId);
      setPreguntasSession(nuevasPreguntas);
    }
  }, [juegoId]);

  // Iniciar timer cuando aparece una nueva pregunta
  useEffect(() => {
    if (estado === "jugando" && !mostrarResultado && preguntasSession.length > 0) {
      setTiempoInicio(Date.now());
    }
  }, [preguntaActual, estado, mostrarResultado, preguntasSession]);

  const calcularPuntos = (esCorrecta, tiempoRespuesta) => {
    if (!esCorrecta) return 0;

    let puntos = 10; // Puntos base
    
    // Bono por velocidad (máximo 3 puntos)
    const bonoVelocidad = tiempoRespuesta < 3000 ? 3 : 0; // Menos de 3 segundos
    puntos += bonoVelocidad;
    
    // Bono por racha (solo a partir de 2 respuestas correctas consecutivas)
    const bonoRacha = rachas >= 2 ? 3 : 0; // +3 puntos por racha (a partir de 2 correctas)
    puntos += bonoRacha;

    return puntos;
  };

  const manejarRespuesta = (opcion) => {
    if (mostrarResultado || preguntasSession.length === 0) return;
    
    const tiempoFin = Date.now();
    const tiempoRespuesta = tiempoFin - tiempoInicio;
    tiempoRespuestaRef.current = tiempoRespuesta;
    
    setOpcionSeleccionada(opcion);
    setMostrarResultado(true);

    const pregunta = preguntasSession[preguntaActual];
    const esCorrecta = opcion === pregunta.respuesta;
    
    if (esCorrecta) {
      const puntos = calcularPuntos(true, tiempoRespuesta);
      setPuntosGanados(puntos);
      setPuntuacion(prev => prev + puntos);
      
      // Manejar rachas - incrementar racha actual
      const nuevaRacha = rachas + 1;
      setRachas(nuevaRacha);
      if (nuevaRacha > mejorRacha) {
        setMejorRacha(nuevaRacha);
      }
    } else {
      setPuntosGanados(0);
      setRachas(0); // Reset racha
    }

    // Siguiente pregunta después de un delay
    setTimeout(() => {
      if (preguntaActual < preguntasSession.length - 1) {
        setPreguntaActual(prev => prev + 1);
        setMostrarResultado(false);
        setOpcionSeleccionada(null);
        setPuntosGanados(0);
      } else {
        // Juego terminado
        const datosSession = {
          mejorRacha: mejorRacha,
          preguntasRespondidas: preguntasSession.length,
          duracion: Date.now() - tiempoInicio,
          detalles: {
            rachaMaxima: mejorRacha,
            preguntasCorrectas: puntuacion / 10 // Estimación
          }
        };
        guardarEnRanking(juegoId, puntuacion, datosSession);
        setEstado("terminado");
      }
    }, 2000);
  };

  const reiniciarJuego = () => {
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
              <div className="text-lg font-bold text-purple-600">{mejorPuntuacion} pts</div>
            </div>
          </div>
          {puntuacion > mejorPuntuacion && (
            <div className="text-xl font-bold text-yellow-600 mb-4">
              🏆 ¡Nuevo récord personal!
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
      
      {/* BARRA DE ESTADÍSTICAS MEJORADA */}
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
          <div className="text-lg font-bold text-purple-700">{mejorPuntuacion}</div>
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
                  <div>Base: 10 puntos</div>
                  {tiempoRespuestaRef.current < 3000 && <div>Velocidad: +3 puntos ⚡</div>}
                  {rachas >= 2 && <div>Racha: +3 puntos 🔥</div>}
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

// MEMORY GAME CORREGIDO - PUNTOS POSITIVOS
const MemoryGame = ({ 
  usuarioActual, 
  volverASeleccion, 
  guardarEnRanking, 
  obtenerMejorPuntuacionPersonal 
}) => {
  const cartasMemory = [
    "🎅", "🎅", "🎄", "🎄", "🎁", "🎁", "❄️", "❄️",
    "🌟", "🌟", "🦌", "🦌", "🍪", "🍪", "🔔", "🔔"
  ];

  const [cartas, setCartas] = useState([]);
  const [cartasVolteadas, setCartasVolteadas] = useState([]);
  const [paresEncontrados, setParesEncontrados] = useState(0);
  const [movimientos, setMovimientos] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [bloquearClics, setBloquearClics] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [mejorPuntuacion, setMejorPuntuacion] = useState(0);

  // Cargar mejor puntuación al iniciar
  useEffect(() => {
    const cargarMejorPuntuacion = async () => {
      const mejor = await obtenerMejorPuntuacionPersonal("memory");
      setMejorPuntuacion(mejor);
    };
    cargarMejorPuntuacion();
  }, []);

  // SISTEMA SIMPLE DE PUNTOS - CORREGIDO
  const calcularPuntuacionMemory = (totalMovimientos) => {
    // Puntuación base por completar el juego
    let puntuacionBase = 100;
    
    // Bonificación por eficiencia (menos movimientos = más puntos)
    if (totalMovimientos <= 20) return puntuacionBase + 80;      // 180 puntos
    if (totalMovimientos <= 24) return puntuacionBase + 60;      // 160 puntos  
    if (totalMovimientos <= 28) return puntuacionBase + 40;      // 140 puntos
    if (totalMovimientos <= 32) return puntuacionBase + 20;      // 120 puntos
    if (totalMovimientos <= 36) return puntuacionBase;           // 100 puntos
    if (totalMovimientos <= 40) return puntuacionBase - 20;      // 80 puntos
    return puntuacionBase - 40;                                  // 60 puntos (mínimo)
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
            if (nuevosPares === 8) {
              setJuegoTerminado(true);
              // CALCULAR PUNTUACIÓN FINAL - CORREGIDO: usar nuevosMovimientos + 1
              const totalMovimientos = nuevosMovimientos;
              const puntuacionFinal = calcularPuntuacionMemory(totalMovimientos);
              setPuntuacion(puntuacionFinal);
              const datosSession = {
                paresEncontrados: 8,
                movimientos: totalMovimientos,
                duracion: 0, // Podrías agregar un timer
                detalles: {
                  eficiencia: totalMovimientos <= 20 ? "excelente" : totalMovimientos <= 28 ? "buena" : "normal"
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
          <div className="text-lg font-bold text-purple-700">{paresEncontrados}/8</div>
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
          <div className="text-lg font-bold text-purple-700">{mejorPuntuacion}</div>
          <div className="text-sm text-purple-600">Mejor</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6 max-w-md mx-auto">
        {cartas.map((carta, index) => (
          <button
            key={carta.id}
            onClick={() => voltearCarta(index)}
            disabled={carta.encontrada || bloquearClics}
            className={`w-16 h-16 text-2xl rounded-xl transition-all duration-300 transform ${
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
          {puntuacion > mejorPuntuacion && (
            <p className="text-green-800 font-bold mt-2">
              🏆 ¡Nuevo récord personal!
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

// COMPONENTE PRINCIPAL CORREGIDO - SISTEMA FIREBASE
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
      descripcion: "Descubre la película navideña por emojis",
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
      nombre: "👨‍👩‍👧‍👦 Adivina el Familiar",
      descripcion: "¿Quién es quién en la familia?",
      icono: "👨‍👩‍👧‍👦",
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

  // FUNCIÓN ACTUALIZADA PARA CARGAR RANKINGS DESDE FIREBASE
  const cargarRankings = async () => {
    try {
      setCargando(true);
      setMensaje("🔄 Cargando rankings desde Firebase...");
      console.log('🔍 Cargando rankings desde Firebase...');
      
      const nuevoRankingGlobal = {};
      
      // Cargar rankings de cada juego
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
          
          console.log(`✅ Ranking de ${juego.nombre}:`, rankingJuego.length, 'jugadores');
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
      // Intentar cargar desde localStorage como fallback
      const rankingLocal = JSON.parse(localStorage.getItem('rankingGlobal')) || {};
      setRankingGlobal(rankingLocal);
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  // FUNCIÓN ACTUALIZADA PARA GUARDAR EN RANKING CON FIREBASE
  const guardarEnRanking = async (juegoId, puntuacion, datosSession = {}) => {
    try {
      console.log('💾 Guardando puntuación en Firebase:', { 
        juegoId, 
        puntuacion, 
        usuario: usuarioActual.nombre,
        datosSession 
      });
      
      setMensaje("📡 Guardando puntuación...");
      
      const resultado = await gobaService.guardarPuntuacionJuego(
        usuarioActual.id,
        juegoId,
        puntuacion,
        datosSession
      );
      
      console.log('✅ Puntuación guardada en Firebase:', resultado);
      
      if (resultado.esNuevoRecord) {
        setMensaje("🎉 ¡Nuevo récord personal!");
      } else {
        setMensaje("✅ Puntuación guardada");
      }
      
      // Actualizar rankings locales
      cargarRankings();
      
    } catch (error) {
      console.log('❌ Error guardando en Firebase:', error);
      setMensaje("⚠️ Error guardando puntuación");
      
      // Fallback a localStorage
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

  // COMPONENTE RANKING
  const RankingJuego = ({ juegoId, juegoNombre }) => {
    const ranking = obtenerRankingJuego(juegoId);
    const [mejorPuntuacion, setMejorPuntuacion] = useState(0);

    useEffect(() => {
      const cargarMejorPuntuacion = async () => {
        const mejor = await obtenerMejorPuntuacionPersonal(juegoId);
        setMejorPuntuacion(mejor);
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
              Tu mejor puntuación: <strong>{mejorPuntuacion} pts</strong>
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
            Compite por la mejor marca personal. ¡Supera tus propios récords!
          </p>
          
          {/* MENSAJE DE ESTADO */}
          {mensaje && (
            <div className={`inline-block px-4 py-2 rounded-lg mb-4 ${
              mensaje.includes('✅') || mensaje.includes('🎉') ? 'bg-green-100 text-green-700 border border-green-300' :
              mensaje.includes('⚠️') ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
              'bg-blue-100 text-blue-700 border border-blue-300'
            }`}>
              {mensaje}
            </div>
          )}
          
          <div className="bg-green-100 border border-green-400 rounded-lg p-3 inline-block">
            <p className="text-green-700 text-sm">
              🔥 <strong>Sistema en tiempo real:</strong> Los rankings se actualizan automáticamente
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
              // Recargar rankings
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