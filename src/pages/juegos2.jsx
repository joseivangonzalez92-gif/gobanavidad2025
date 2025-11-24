// src/pages/juegos2.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

// =============================================
// 🔤 1. COMPONENTE WORDLE NAVIDEÑO - 5 PALABRAS POR SESIÓN (CORREGIDO)
// =============================================
const WordleNavideno = ({ volverASeleccion, guardarEnRanking, puedeJugar, onJuegoCompletado }) => {
  const PALABRAS = [
     "NACIMIENTO", "PESEBRE", "PASTORES", "REYES", "MAGOS", "ESTRELLA", "BELEN", 
  "JESUS", "MARIA", "JOSE", "ANGEL", "ARCANGEL", "SERAFIN", "MISAS", "IGLESIA", "PONCHE", "TAMALES", "BUÑUELOS", "ATOL", "ROMERITOS", "BACALAO", "PAVO",
  "PIÑATA", "DULCES", "GALLETAS", "CHOCOLATE", "TURRON", "POLVORONES","ESFERAS", "GUIRNALDAS", "CAMPANAS", "VELAS", "LUCES", "ESTRELLAS", "MOÑOS",
  "LISTONES", "CORONAS", "CALENDARIO", "ADVIENTO", "PORTAL", "PESEBRE", "SANTA", "DUENDES", "RENOS", "TRINEO", "CARROS", "REGALOS", "CARTAS",
  "CARBON", "ZAPATOS", "CHIMENEA", "NORTE", "POLO", "AURORA", "UVAS", "CAMPANADAS", "RELOL", "DOCE", "MEDIANOCHE", "BRINDIS", "COPAS",
  "FUEGOS", "ARTIFICIO", "PETARDOS", "SERENATA", "ABRAZOS", "BESOS",
  "PROPOSITOS", "METAS", "FELICIDAD", "SALUD", "PROSPERIDAD", "AMISTAD", "POSADAS", "PIÑATAS", "VILLANCICOS", "AGUINALDOS", "NOCHEBUENA", "NAVIDAD",
  "AÑONUEVO", "REYES", "CARROS", "CABALGATA", "OBSEQUIO", "SORPRESA", "ESPERANZA", "PAZ", "AMOR", "ALEGRIA", "FELICIDAD", "ILUSION", "MAGIA",
  "MILAGRO", "FE", "CARIDAD", "SOLIDARIDAD", "FAMILIA", "UNION", "COMPARTIR",   "NIEVE", "HIELO", "FRIO", "INVIERNO", "NEBLINA", "ESCARCHA", "COPO",
  "VENTISCA", "ABRIGO", "BUFANDA", "GUANTES", "GORRO", "BOTAS", "CHAMARRA",  "FELIZ", "PROSPERO", "BENDICION", "GRACIAS", "PERDON", "RENACER", "NUEVO",
  "COMIENZO", "CAMINO", "FUTURO", "SUEÑOS", "ESPERANZAS", "ILUSIONES"
  ];

  const [palabraSecreta, setPalabraSecreta] = useState("");
  const [letrasDesordenadas, setLetrasDesordenadas] = useState([]);
  const [intentoActual, setIntentoActual] = useState([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [ganado, setGanado] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  
  // Estado para sesión de 5 palabras
  const [palabrasResueltas, setPalabrasResueltas] = useState(0);
  const [puntuacionAcumulada, setPuntuacionAcumulada] = useState(0);
  const [rachaActual, setRachaActual] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [palabrasUsadas, setPalabrasUsadas] = useState([]);
  const [sesionTerminada, setSesionTerminada] = useState(false);
  const [juegoIniciado, setJuegoIniciado] = useState(false); // Nuevo estado para controlar inicio

  // Timer
  useEffect(() => {
    let intervalo;
    if (juegoIniciado && tiempoInicio && !juegoTerminado && !sesionTerminada) {
      intervalo = setInterval(() => {
        setTiempoTranscurrido(Date.now() - tiempoInicio);
      }, 100);
    }
    return () => clearInterval(intervalo);
  }, [juegoIniciado, tiempoInicio, juegoTerminado, sesionTerminada]);

  // CORRECCIÓN: Efecto para cambiar de palabra cuando se incrementa palabrasResueltas
  useEffect(() => {
    if (juegoIniciado && palabrasResueltas > 0 && palabrasResueltas < 5) {
      const timer = setTimeout(() => {
        iniciarNuevaPalabra();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (juegoIniciado && palabrasResueltas >= 5) {
      // CORRECCIÓN: Terminar sesión inmediatamente cuando llegue a 5
      setSesionTerminada(true);
      guardarEnRanking("wordle-navideno", puntuacionAcumulada, {
        palabrasResueltas: palabrasResueltas,
        mejorRacha: mejorRacha,
        sesionCompleta: true,
        timestamp: Date.now()
      });
      // Marcar juego como completado para el día
      onJuegoCompletado("wordle-navideno");
    }
  }, [palabrasResueltas, juegoIniciado]);

  // Función mejorada para obtener palabra aleatoria
  const obtenerPalabraAleatoria = () => {
    // Mezclar todo el array de palabras primero para mayor aleatoriedad
    const palabrasMezcladas = [...PALABRAS]
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5);
    
    const palabrasDisponibles = palabrasMezcladas.filter(palabra => 
      !palabrasUsadas.includes(palabra)
    );
    
    if (palabrasDisponibles.length === 0) {
      // Si ya se usaron todas, reiniciar y tomar cualquier palabra
      return palabrasMezcladas[0];
    }
    
    return palabrasDisponibles[0];
  };

  const iniciarJuego = () => {
    if (!puedeJugar) return;
    
    setJuegoIniciado(true);
    setPalabrasResueltas(0);
    setPuntuacionAcumulada(0);
    setRachaActual(0);
    setMejorRacha(0);
    setPalabrasUsadas([]);
    setSesionTerminada(false);
    iniciarNuevaPalabra();
  };

  const iniciarNuevaPalabra = () => {
    const nuevaPalabra = obtenerPalabraAleatoria();
    setPalabraSecreta(nuevaPalabra);
    
    // Mezclar las letras más veces para mayor aleatoriedad
    const letrasArray = nuevaPalabra.split("");
    const letrasMezcladas = [...letrasArray]
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5);
    
    setLetrasDesordenadas(letrasMezcladas);
    setIntentoActual(Array(nuevaPalabra.length).fill(""));
    setJuegoTerminado(false);
    setGanado(false);
    setIntentos(0);
    setTiempoInicio(Date.now());
    setTiempoTranscurrido(0);
  };

  // SISTEMA DE PUNTUACIÓN MEJORADO PARA EVITAR EMPATES
  const calcularBonusTiempo = (tiempoSegundos) => {
    if (tiempoSegundos <= 3) return 50;
    if (tiempoSegundos <= 6) return 40;
    if (tiempoSegundos <= 9) return 30;
    if (tiempoSegundos <= 12) return 20;
    if (tiempoSegundos <= 15) return 10;
    if (tiempoSegundos <= 18) return 5;
    return 0;
  };

  const calcularBonusRacha = (racha) => {
    if (racha >= 5) return 50;
    if (racha >= 4) return 30;
    if (racha >= 3) return 20;
    if (racha >= 2) return 10;
    return 0;
  };

  const calcularBonusDificultad = (longitudPalabra) => {
    if (longitudPalabra >= 7) return 25;
    if (longitudPalabra >= 6) return 15;
    if (longitudPalabra >= 5) return 10;
    return 5;
  };

  const calcularPuntuacion = (intentosUsados, tiempoSegundos, racha, longitudPalabra) => {
    const puntuacionesBase = [100, 80, 60]; // 1er, 2do, 3er intento
    const puntosBase = puntuacionesBase[intentosUsados - 1] || 0;
    
    const bonusTiempo = calcularBonusTiempo(tiempoSegundos);
    const bonusRacha = calcularBonusRacha(racha);
    const bonusDificultad = calcularBonusDificultad(longitudPalabra);
    
    // Puntuación única que incluye factores difíciles de replicar
    const factorUnico = Math.floor(Math.random() * 5) + 1; // 1-5 puntos aleatorios
    
    return puntosBase + bonusTiempo + bonusRacha + bonusDificultad + factorUnico;
  };

  const manejarClickLetra = (letra, index) => {
    if (!puedeJugar || !juegoIniciado || juegoTerminado || sesionTerminada || letra === "") return;

    const primeraPosicionVacia = intentoActual.findIndex(pos => pos === "");
    
    if (primeraPosicionVacia !== -1) {
      const nuevoIntento = [...intentoActual];
      nuevoIntento[primeraPosicionVacia] = letra;
      setIntentoActual(nuevoIntento);

      const nuevasLetras = [...letrasDesordenadas];
      nuevasLetras[index] = "";
      setLetrasDesordenadas(nuevasLetras);

      if (primeraPosicionVacia === palabraSecreta.length - 1) {
        const palabraFormada = nuevoIntento.join("");
        const nuevosIntentos = intentos + 1;
        setIntentos(nuevosIntentos);
        
        if (palabraFormada === palabraSecreta) {
          // Ganó
          setJuegoTerminado(true);
          setGanado(true);
          const tiempoSegundos = Math.floor(tiempoTranscurrido / 1000);
          const puntuacionPalabra = calcularPuntuacion(
            nuevosIntentos, 
            tiempoSegundos, 
            rachaActual, 
            palabraSecreta.length
          );
          const adivinoPrimera = nuevosIntentos === 1;
          
          setPuntuacionAcumulada(prev => prev + puntuacionPalabra);
          setPalabrasUsadas(prev => [...prev, palabraSecreta]);
          
          if (adivinoPrimera) {
            const nuevaRacha = rachaActual + 1;
            setRachaActual(nuevaRacha);
            if (nuevaRacha > mejorRacha) {
              setMejorRacha(nuevaRacha);
            }
          } else {
            setRachaActual(0);
          }

          setTimeout(() => {
            if (palabrasResueltas < 5) {
              setPalabrasResueltas(prev => prev + 1);
            }
          }, 1500);
        } else {
          // No acertó
          if (nuevosIntentos >= 3) {
            setJuegoTerminado(true);
            setGanado(false);
            setPalabrasUsadas(prev => [...prev, palabraSecreta]);
            setRachaActual(0);
            
            setTimeout(() => {
              if (palabrasResueltas < 5) {
                setPalabrasResueltas(prev => prev + 1);
              }
            }, 1500);
          } else {
            setTimeout(() => {
              reiniciarIntento();
            }, 1000);
          }
        }
      }
    }
  };

  const reiniciarIntento = () => {
    const letrasArray = palabraSecreta.split("");
    const letrasMezcladas = [...letrasArray]
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5);
    
    setLetrasDesordenadas(letrasMezcladas);
    setIntentoActual(Array(palabraSecreta.length).fill(""));
  };

  const manejarBorrar = () => {
    if (!puedeJugar || !juegoIniciado || juegoTerminado || sesionTerminada) return;

    const ultimaPosicionLlena = intentoActual.reduce((acc, letra, index) => {
      return letra !== "" ? index : acc;
    }, -1);

    if (ultimaPosicionLlena !== -1) {
      const letraABorrar = intentoActual[ultimaPosicionLlena];
      
      const nuevasLetras = [...letrasDesordenadas];
      const primeraPosicionVaciaTeclado = nuevasLetras.findIndex(l => l === "");
      if (primeraPosicionVaciaTeclado !== -1) {
        nuevasLetras[primeraPosicionVaciaTeclado] = letraABorrar;
        setLetrasDesordenadas(nuevasLetras);
      }

      const nuevoIntento = [...intentoActual];
      nuevoIntento[ultimaPosicionLlena] = "";
      setIntentoActual(nuevoIntento);
    }
  };

  const obtenerColorCasilla = (letra, index) => {
    if (!letra) return 'border-gray-300 bg-white';
    
    if (juegoTerminado) {
      return letra === palabraSecreta[index] 
        ? 'bg-green-500 text-white border-green-500' 
        : 'bg-red-500 text-white border-red-500';
    }
    
    return 'border-blue-500 bg-blue-50';
  };

  const formatearTiempo = (milisegundos) => {
    const segundos = Math.floor(milisegundos / 1000);
    return `${segundos}s`;
  };

  const obtenerTextoPalabraActual = () => {
    if (sesionTerminada) return "Sesión completada";
    if (!juegoIniciado) return "Presiona Iniciar Juego";
    return `Palabra ${palabrasResueltas + 1} de 5`;
  };

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6">🔤 Wordle Navideño</h2>
      
      {!puedeJugar && (
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
          <div className="text-2xl font-bold mb-2">⏰ Juego Completado</div>
          <p className="text-yellow-700 mb-4">Ya jugaste Wordle Navideño hoy. Vuelve mañana para jugar otra vez.</p>
        </div>
      )}
      
      {!juegoIniciado ? (
        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 mb-6">
          <div className="text-2xl font-bold mb-4">🎄 Wordle Navideño</div>
          <p className="text-gray-600 mb-2">• 5 palabras navideñas por sesión</p>
          <p className="text-gray-600 mb-2">• Máximo 3 intentos por palabra</p>
          <p className="text-gray-600 mb-4">• Puntos por velocidad y rachas</p>
          
          <button
            onClick={iniciarJuego}
            disabled={!puedeJugar}
            className={`${
              puedeJugar 
                ? 'bg-green-500 hover:bg-green-600 cursor-pointer' 
                : 'bg-gray-400 cursor-not-allowed'
            } text-white px-8 py-4 rounded-xl font-bold text-lg transition-all w-full`}
          >
            {puedeJugar ? '🎮 Iniciar Juego' : '⏰ Ya jugado hoy'}
          </button>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-4 mb-6">
            <div className="grid grid-cols-4 gap-2 text-sm mb-3">
              <div>
                <div className="font-bold">{palabrasResueltas}/5</div>
                <div>Palabras</div>
              </div>
              <div>
                <div className="font-bold">{puntuacionAcumulada}</div>
                <div>Puntos</div>
              </div>
              <div>
                <div className="font-bold">{rachaActual}</div>
                <div>Racha</div>
              </div>
              <div>
                <div className="font-bold">{mejorRacha}</div>
                <div>Mejor</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(palabrasResueltas / 5) * 100}%` }}
              ></div>
            </div>

            <div className="text-center">
              <div className="font-bold text-lg">{formatearTiempo(tiempoTranscurrido)}</div>
              <div className="text-gray-600 text-sm">
                {obtenerTextoPalabraActual()}
              </div>
            </div>
          </div>

          {!sesionTerminada ? (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <p className="text-sm text-gray-600 mb-4">Forma la palabra navideña:</p>
                
                <div className="flex justify-center gap-2 mb-6">
                  {intentoActual.map((letra, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 border-2 flex items-center justify-center text-xl font-bold rounded transition-all ${obtenerColorCasilla(letra, index)}`}
                    >
                      {letra}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-2 flex-wrap">
                  {letrasDesordenadas.map((letra, index) => (
                    <button
                      key={index}
                      onClick={() => manejarClickLetra(letra, index)}
                      disabled={!puedeJugar || juegoTerminado || letra === ""}
                      className={`w-10 h-10 text-lg font-bold rounded transition-all ${
                        letra === "" 
                          ? 'bg-gray-200 text-gray-200 cursor-default' 
                          : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800 hover:scale-110'
                      }`}
                    >
                      {letra}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={manejarBorrar}
                  disabled={!puedeJugar || juegoTerminado || intentoActual.every(letra => letra === "")}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  ⌫ Borrar
                </button>
                <button
                  onClick={() => {
                    if (palabrasResueltas < 5) {
                      setJuegoTerminado(true);
                      setGanado(false);
                      setPalabrasUsadas(prev => [...prev, palabraSecreta]);
                      setRachaActual(0);
                      setTimeout(() => {
                        setPalabrasResueltas(prev => prev + 1);
                      }, 500);
                    }
                  }}
                  disabled={!puedeJugar || juegoTerminado || palabrasResueltas >= 5}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  🔄 Saltar
                </button>
              </div>

              {juegoTerminado && ganado && (
                <div className="bg-green-100 border-2 border-green-400 rounded-2xl p-4 mb-6">
                  <div className="text-xl font-bold text-green-700 mb-2">✅ ¡Correcto!</div>
                  <p className="text-green-600">
                    +{calcularPuntuacion(intentos, Math.floor(tiempoTranscurrido / 1000), rachaActual, palabraSecreta.length)} puntos
                    {intentos === 1 && " 🏆 +1 Racha"}
                  </p>
                </div>
              )}

              {juegoTerminado && !ganado && (
                <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-4 mb-6">
                  <div className="text-xl font-bold text-red-700 mb-2">❌ Se acabaron los intentos</div>
                  <p className="text-red-600">La palabra era: <strong>{palabraSecreta}</strong></p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-6 mb-6">
              <div className="text-3xl font-bold mb-4">🎉 Sesión Completada</div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{puntuacionAcumulada}</div>
                  <div className="text-gray-600">Puntos Totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mejorRacha}</div>
                  <div className="text-gray-600">Mejor Racha</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{palabrasResueltas}/5</div>
                  <div className="text-gray-600">Palabras</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {palabrasResueltas > 0 ? Math.round(puntuacionAcumulada / palabrasResueltas) : 0}
                  </div>
                  <div className="text-gray-600">Promedio</div>
                </div>
              </div>

              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-4">
                <p className="text-yellow-700 font-bold">⏰ Juego completado por hoy</p>
                <p className="text-yellow-600 text-sm">Vuelve mañana para jugar otra vez</p>
              </div>
            </div>
          )}
        </>
      )}

      <button
        onClick={volverASeleccion}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
      >
        ← Volver a Juegos 2.0
      </button>
    </div>
  );
};

// =============================================
// 🎮 2. COMPONENTE SIMÓN DICE COMPLETO CON BOTÓN VOLVER
// =============================================
const SimonDice = ({ volverASeleccion, guardarEnRanking, puedeJugar, onJuegoCompletado }) => {
  const colores = ["🔴", "🟢", "🟡", "🔵", "🟣", "🟠", "⚪", "🟤"];
  const [secuencia, setSecuencia] = useState([]);
  const [jugadorSecuencia, setJugadorSecuencia] = useState([]);
  const [nivel, setNivel] = useState(1);
  const [jugando, setJugando] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [mostrandoSecuencia, setMostrandoSecuencia] = useState(false);
  const [botonActivo, setBotonActivo] = useState(null);
  
  // Estados para tiempo
  const [tiempoInicioNivel, setTiempoInicioNivel] = useState(null);
  const [tiemposPorNivel, setTiemposPorNivel] = useState([]);
  const [tiempoTotal, setTiempoTotal] = useState(0);
  const [tiempoActual, setTiempoActual] = useState(0);
  
  const [juegoIniciado, setJuegoIniciado] = useState(false);

  // Timer optimizado
  useEffect(() => {
    let intervalo;
    if (juegoIniciado && jugando && tiempoInicioNivel && !gameOver) {
      intervalo = setInterval(() => {
        setTiempoActual(Date.now() - tiempoInicioNivel);
      }, 100);
    }
    return () => clearInterval(intervalo);
  }, [juegoIniciado, jugando, tiempoInicioNivel, gameOver]);

  // ✅ SISTEMA DE PUNTUACIÓN MÁS BALANCEADO
  const calcularPuntuacion = (nivel, tiempoTotalSegundos, secuenciaCompleta) => {
    // Puntos base por nivel (más balanceado)
    const puntosBase = nivel * 12; // Reducido de 15 a 12
    
    // Bonus por longitud de secuencia 
    const bonusLongitud = secuenciaCompleta * 6; // Reducido de 8 a 6
    
    // ✅ BONUS DE VELOCIDAD MÁS AGRESIVO
    const tiempoPromedioPorNivel = tiempoTotalSegundos / Math.max(1, nivel);
    
    let bonusVelocidad = 0;
    if (tiempoPromedioPorNivel <= 1.5) bonusVelocidad = 25;    // Más bonus por ser muy rápido
    else if (tiempoPromedioPorNivel <= 2) bonusVelocidad = 20;
    else if (tiempoPromedioPorNivel <= 2.5) bonusVelocidad = 15;
    else if (tiempoPromedioPorNivel <= 3) bonusVelocidad = 10;
    else if (tiempoPromedioPorNivel <= 4) bonusVelocidad = 5;
    else if (tiempoPromedioPorNivel <= 5) bonusVelocidad = 2;
    
    // Factor único más conservador
    const factorUnico = Math.floor(Math.random() * 8) + 1; // 1-8 puntos
    
    // Bonus por consistencia 
    const nivelesRapidos = tiemposPorNivel.filter(t => t <= 3000).length; // Más estricto (3s)
    const bonusConsistencia = Math.floor(nivelesRapidos) * 2; // +2 por nivel rápido
    
    const puntuacionTotal = puntosBase + bonusLongitud + bonusVelocidad + factorUnico + bonusConsistencia;
    
    return {
      total: Math.max(10, puntuacionTotal), // Mínimo 10 puntos
      desglose: {
        puntosBase,
        bonusLongitud,
        bonusVelocidad,
        factorUnico,
        bonusConsistencia
      }
    };
  };

  const iniciarJuego = () => {
    if (!puedeJugar) return;
    
    setJuegoIniciado(true);
    setNivel(1);
    setSecuencia([]);
    setJugadorSecuencia([]);
    setGameOver(false);
    setTiemposPorNivel([]);
    setTiempoTotal(0);
    setTiempoActual(0);
    siguienteNivel();
  };

  // ✅ GENERACIÓN MÁS RÁPIDA Y VARIADA
  const generarSecuenciaAleatoria = (longitud) => {
    const nuevaSecuencia = [];
    
    for (let i = 0; i < longitud; i++) {
      // Secuencias más desafiantes pero justas
      let indiceColor;
      
      if (longitud <= 3) {
        // Niveles iniciales: más fáciles
        indiceColor = Math.floor(Math.random() * 4); // Solo primeros 4 colores
      } else if (longitud <= 6) {
        // Niveles medios: más variedad
        indiceColor = Math.floor(Math.random() * 6); // Primeros 6 colores
      } else {
        // Niveles altos: todos los colores
        indiceColor = Math.floor(Math.random() * colores.length);
      }
      
      nuevaSecuencia.push(indiceColor);
    }
    
    return nuevaSecuencia;
  };

  // ✅ SECUENCIA MÁS RÁPIDA
  const siguienteNivel = () => {
    setJugando(false);
    setMostrandoSecuencia(true);
    
    const nuevaSecuencia = generarSecuenciaAleatoria(secuencia.length + 1);
    setSecuencia(nuevaSecuencia);
    
    setTiempoInicioNivel(Date.now());
    setTiempoActual(0);
    
    // ✅ VELOCIDAD DE SECUENCIA AJUSTADA POR NIVEL
    const velocidadBase = 500; // ms entre colores
    const velocidadReduccion = Math.min(300, nivel * 50); // Más rápido en niveles altos
    const velocidadFinal = Math.max(200, velocidadBase - velocidadReduccion); // Mínimo 200ms
    
    let i = 0;
    const mostrarSiguienteColor = () => {
      if (i < nuevaSecuencia.length) {
        const colorIndex = nuevaSecuencia[i];
        setBotonActivo(colorIndex);
        
        setTimeout(() => {
          setBotonActivo(null);
          setTimeout(() => {
            i++;
            mostrarSiguienteColor();
          }, 150); // Pausa más corta entre colores
        }, velocidadFinal); // Tiempo que se muestra cada color
      } else {
        setMostrandoSecuencia(false);
        setJugando(true);
        setJugadorSecuencia([]);
      }
    };
    
    setTimeout(() => {
      mostrarSiguienteColor();
    }, 300); // Menos espera antes de empezar
  };

  const manejarClickColor = (colorIndex) => {
    if (!puedeJugar || !juegoIniciado || !jugando || mostrandoSecuencia) return;

    // Animación más rápida
    setBotonActivo(colorIndex);
    setTimeout(() => setBotonActivo(null), 200); // Reducido de 300ms

    const nuevaJugadorSecuencia = [...jugadorSecuencia, colorIndex];
    setJugadorSecuencia(nuevaJugadorSecuencia);

    // Verificación inmediata
    if (nuevaJugadorSecuencia[nuevaJugadorSecuencia.length - 1] !== 
        secuencia[nuevaJugadorSecuencia.length - 1]) {
      const tiempoTotalSegundos = Math.floor(tiempoTotal / 1000);
      const puntuacion = calcularPuntuacion(nivel, tiempoTotalSegundos, secuencia.length);
      
      setGameOver(true);
      
      guardarEnRanking("simon-dice", puntuacion.total, {
        nivelAlcanzado: nivel,
        secuenciaMaxima: secuencia.length,
        tiempoTotal: tiempoTotal,
        tiempoPromedioPorNivel: tiempoTotal / nivel,
        bonusVelocidad: puntuacion.desglose.bonusVelocidad,
        factorUnico: puntuacion.desglose.factorUnico,
        timestamp: Date.now(),
        desglosePuntos: puntuacion.desglose
      });
      
      // Marcar juego como completado para el día
      onJuegoCompletado("simon-dice");
      return;
    }

    // ✅ TRANSICIÓN MÁS RÁPIDA ENTRE NIVELES
    if (nuevaJugadorSecuencia.length === secuencia.length) {
      const tiempoNivel = Date.now() - tiempoInicioNivel;
      setTiemposPorNivel(prev => [...prev, tiempoNivel]);
      setTiempoTotal(prev => prev + tiempoNivel);
      
      setJugando(false);
      setTimeout(() => {
        setNivel(nivel + 1);
        setTimeout(siguienteNivel, 500); // Menos espera entre niveles
      }, 600); // Menos feedback time
    }
  };

  const obtenerClaseBoton = (index) => {
    const baseClase = "w-14 h-14 text-xl rounded-full transition-all duration-200 transform flex items-center justify-center border-2 border-white border-opacity-30 "; // Duración reducida
    
    if (botonActivo === index) {
      return baseClase + "scale-110 shadow-lg ring-2 ring-white ring-opacity-70 animate-pulse";
    }
    
    return baseClase + "shadow-md hover:shadow-lg hover:scale-105";
  };

  const formatearTiempo = (milisegundos) => {
    const segundos = Math.floor(milisegundos / 1000);
    const decimas = Math.floor((milisegundos % 1000) / 100);
    return `${segundos}.${decimas}s`;
  };

  return (
    <div className="text-center min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 relative overflow-hidden py-6">
      <div className="absolute top-4 right-4 pointer-events-none opacity-30">
        <div className="text-4xl">🎄</div>
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-3 text-white drop-shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            🎮 Simón Dice
          </h2>
          <p className="text-white text-md opacity-90">
            Memoria y reflejos navideños
          </p>
        </div>

        {!puedeJugar && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
            <div className="text-2xl font-bold mb-2 text-yellow-700">⏰ Juego Completado</div>
            <p className="text-yellow-600">Ya jugaste Simón Dice hoy. Vuelve mañana para jugar otra vez.</p>
          </div>
        )}

        {!juegoIniciado ? (
          // PANTALLA DE INICIO CON BOTÓN VOLVER
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 mb-6 border-4 border-yellow-400 shadow-lg">
            <div className="text-3xl font-bold text-white mb-6 drop-shadow-md">
              🎄 Simón Dice Navideño
            </div>
            
            <div className="text-white text-left mb-6 space-y-3">
              <p className="flex items-center">
                <span className="text-yellow-300 mr-2">🎯</span>
                Memoriza la secuencia de colores
              </p>
              <p className="flex items-center">
                <span className="text-yellow-300 mr-2">⚡</span>
                <strong>Secuencias aleatorias</strong> 
              </p>
              <p className="flex items-center">
                <span className="text-yellow-300 mr-2">🏆</span>
                Bonus por velocidad
              </p>
              <p className="flex items-center">
                <span className="text-yellow-300 mr-2">🔥</span>
                ¡Hasta que te equivoques!
              </p>
            </div>

            <button
              onClick={iniciarJuego}
              disabled={!puedeJugar}
              className={`w-full ${
                puedeJugar
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 cursor-pointer'
                  : 'bg-gray-500 cursor-not-allowed'
              } text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg mb-3`}
            >
              {puedeJugar ? '🎮 Iniciar Juego' : '⏰ Ya jugado hoy'}
            </button>

            {/* BOTÓN VOLVER A JUEGOS */}
            <button
              onClick={volverASeleccion}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              ← Volver a Juegos
            </button>
          </div>
        ) : (
          // JUEGO EN CURSO
          <>
            {/* Panel de información */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 mb-8 border-4 border-yellow-400 shadow-lg">
              <div className="text-4xl font-bold text-white mb-3 drop-shadow-md">
                Nivel {nivel}
              </div>
              <div className="text-white text-lg font-semibold mb-2">
                {mostrandoSecuencia ? "👀 Observa..." : 
                 gameOver ? "💥 ¡Game Over!" : 
                 "🎅 Tu turno"}
              </div>
              <div className="text-white text-sm opacity-90 mb-2">
                Secuencia: {secuencia.length} colores
              </div>
              {jugando && (
                <div className="text-yellow-300 text-sm font-bold">
                  ⏱ {formatearTiempo(tiempoActual)}
                </div>
              )}
            </div>

            {/* Tablero de juego */}
            <div className="bg-black bg-opacity-50 rounded-2xl p-6 mb-8 border-4 border-yellow-500 shadow-lg backdrop-blur-sm">
              <div className="grid grid-cols-4 gap-3 mx-auto">
                {colores.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => manejarClickColor(index)}
                    disabled={!puedeJugar || !jugando || mostrandoSecuencia || gameOver}
                    className={obtenerClaseBoton(index)}
                    style={{
                      backgroundColor: botonActivo === index ? 
                        getColorBackground(index, true) : 
                        getColorBackground(index, false),
                      opacity: (!puedeJugar || !jugando || mostrandoSecuencia || gameOver) && botonActivo !== index ? 0.5 : 1,
                    }}
                  >
                    <span className={botonActivo === index ? 'animate-bounce' : ''}>
                      {color}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel de Game Over */}
            {gameOver && (
              <div className="bg-gradient-to-br from-red-600 to-pink-700 border-4 border-red-300 rounded-2xl p-6 mb-6">
                <p className="text-2xl font-bold text-white mb-3 drop-shadow-md">
                  🎯 Nivel {nivel} - {secuencia.length} colores
                </p>
                <div className="text-white text-sm mb-4 space-y-2">
                  <div>⏱ Tiempo total: {formatearTiempo(tiempoTotal)}</div>
                  <div>📊 Promedio: {formatearTiempo(tiempoTotal / Math.max(1, tiemposPorNivel.length))}</div>
                  <div className="text-yellow-300 font-bold text-lg">
                    🏆 Puntuación: {calcularPuntuacion(nivel, Math.floor(tiempoTotal / 1000), secuencia.length).total} pts
                  </div>
                </div>
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-4">
                  <p className="text-yellow-700 font-bold">⏰ Juego completado por hoy</p>
                  <p className="text-yellow-600 text-sm">Vuelve mañana para jugar otra vez</p>
                </div>
              </div>
            )}

            {/* Controles */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={iniciarJuego}
                disabled={!puedeJugar}
                className={`flex-1 ${
                  puedeJugar
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 cursor-pointer'
                    : 'bg-gray-500 cursor-not-allowed'
                } text-white py-3 rounded-xl font-bold transition-all shadow-lg`}
              >
                🔁 Reiniciar
              </button>
              <button
                onClick={volverASeleccion}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
              >
                ← Volver
              </button>
            </div>
          </>
        )}

        {/* Instrucciones */}
        <div className="bg-white bg-opacity-15 rounded-xl p-4 text-white backdrop-blur-sm">
          <p className="font-bold text-lg mb-3 text-yellow-300">🎯 Sistema Mejorado:</p>
          <div className="space-y-1 text-left text-sm">
            <p>✅ <strong>+12 puntos</strong> por nivel</p>
            <p>📏 <strong>+6 puntos</strong> por color en secuencia</p>
            <p>⚡ <strong>Hasta +25 bonus</strong> por velocidad</p>
            <p>🎲 <strong>+1-8 puntos</strong> factor único</p>
            <p>🔥 <strong>+2 puntos</strong> por nivel rápido</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-2xl opacity-20">🎁</div>
      <div className="absolute bottom-4 right-4 text-2xl opacity-20">🌟</div>
    </div>
  );
};

// Función helper para colores de fondo
const getColorBackground = (index, isActive) => {
  const colors = [
    isActive ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.7)',
    isActive ? 'rgba(34, 197, 94, 0.9)' : 'rgba(34, 197, 94, 0.7)',
    isActive ? 'rgba(234, 179, 8, 0.9)' : 'rgba(234, 179, 8, 0.7)',
    isActive ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.7)',
    isActive ? 'rgba(168, 85, 247, 0.9)' : 'rgba(168, 85, 247, 0.7)',
    isActive ? 'rgba(249, 115, 22, 0.9)' : 'rgba(249, 115, 22, 0.7)',
    isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
    isActive ? 'rgba(139, 69, 19, 0.9)' : 'rgba(139, 69, 19, 0.7)'
  ];
  return colors[index % colors.length];
};

// =============================================
// ⚡ 3. CARRERA-TRINEO - CON PANTALLA DE INICIO
// =============================================

const CarreraTrineo = ({ volverASeleccion, guardarEnRanking, puedeJugar, onJuegoCompletado }) => {
  const [posicion, setPosicion] = useState(1);
  const [direccion, setDireccion] = useState("left");
  const [obstaculos, setObstaculos] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [juegoIniciado, setJuegoIniciado] = useState(false);

  const posicionRef = useRef(posicion);
  const gameOverRef = useRef(gameOver);
  const puntuacionRef = useRef(puntuacion);
  const dificultadRef = useRef(1);
  const ultimaGeneracionRef = useRef(0);

  // =============================================
  // 🎯 AJUSTES: OBSTÁCULOS DISPONIBLES
  // =============================================
  // Modifica estos emojis para cambiar los obstáculos visuales
  const emojis = ["🌲", "🌳", "🪵"];

  useEffect(() => { posicionRef.current = posicion; }, [posicion]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { puntuacionRef.current = puntuacion; }, [puntuacion]);

  const generarObstaculos = () => {
    // =============================================
    // 🎯 AJUSTES: PROBABILIDAD DE OBSTÁCULOS MÚLTIPLES
    // =============================================
    // Cambia 0.7 para ajustar la probabilidad de 1 vs 2 obstáculos
    // 0.7 = 7% de probabilidad de 1 obstáculo, 30% de 2 obstáculos
    const numObstaculos = Math.random() < 0.79 ? 1 : 2;
    
    if (numObstaculos === 1) {
      return [{
        id: Date.now() + Math.random(),
        carril: Math.floor(Math.random() * 3),
        y: 5,
        icono: emojis[Math.floor(Math.random() * emojis.length)],
      }];
    } else {
      const carrilVacio = Math.floor(Math.random() * 3);
      const obstaculosLinea = [];
      
      for (let carril = 0; carril < 3; carril++) {
        if (carril !== carrilVacio) {
          obstaculosLinea.push({
            id: Date.now() + Math.random() + carril,
            carril: carril,
            y: 5,
            icono: emojis[Math.floor(Math.random() * emojis.length)],
          });
        }
      }
      return obstaculosLinea;
    }
  };

  useEffect(() => {
    if (!puedeJugar || !juegoIniciado || gameOverRef.current) return;

    let tick = 0;
    let lastTime = Date.now();
    
    const gameLoop = () => {
      if (gameOverRef.current) return;
      
      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;
      
      tick++;

      // =============================================
      // 🎯 AJUSTES: VELOCIDAD DE INCREMENTO DE DIFICULTAD
      // =============================================
      // Cambia 200 para ajustar cada cuántos ticks aumenta la dificultad
      // Cambia 0.2 para ajustar cuánto aumenta la dificultad cada vez
      // Cambia 4 para ajustar la dificultad máxima
      if (tick % 200 === 0) {
        dificultadRef.current = Math.min(3, dificultadRef.current + 0.1);
      }

      setObstaculos(prev => {
        // =============================================
        // 🎯 AJUSTES: VELOCIDAD BASE DE LOS OBSTÁCULOS
        // =============================================
        // Modifica 0.03 para cambiar la velocidad base del juego
        // Valores más altos = juego más rápido
        const velocidad = 0.015 * dificultadRef.current;
        const nuevos = prev
          .map(o => ({ ...o, y: o.y - velocidad }))
          .filter(o => o.y > -1);

        // =============================================
        // 🎯 AJUSTES: ZONA DE COLISIÓN
        // =============================================
        // Modifica estos valores (1.2 y 0.8) para ajustar la sensibilidad de colisión
        // Valores más cercanos = colisión más precisa
        const colision = nuevos.some(o =>
          o.y <= 1.1 && o.y >= 0.9 && o.carril === posicionRef.current
        );

        if (colision) {
          setGameOver(true);
          const puntuacionFinal = Math.floor(puntuacionRef.current / 10);
          guardarEnRanking("carrera-trineo", puntuacionFinal, {
            distancia: puntuacionRef.current,
            distanciaFinal: puntuacionFinal,
            dificultad: dificultadRef.current,
          });
          // Marcar juego como completado para el día
          onJuegoCompletado("carrera-trineo");
        }

        return nuevos;
      });

      // =============================================
      // 🎯 AJUSTES: FRECUENCIA DE GENERACIÓN DE OBSTÁCULOS
      // =============================================
      // Modifica 0.05 para cambiar la probabilidad base de aparición
      const probAparicion = 0.05 * dificultadRef.current;
      const tiempoDesdeUltimaGeneracion = tick - ultimaGeneracionRef.current;
      
      // =============================================
      // 🎯 AJUSTES: INTERVALO MÍNIMO ENTRE OBSTÁCULOS
      // =============================================
      // Modifica 40 (mínimo) y 20 (reducción por dificultad) para ajustar frecuencia
      const frecuenciaGeneracion = Math.max(40, 90 - (dificultadRef.current * 15));
      
      if (tiempoDesdeUltimaGeneracion >= frecuenciaGeneracion && Math.random() < probAparicion) {
        const obstaculosLinea = generarObstaculos();
        if (obstaculosLinea.length > 0) {
          setObstaculos(prev => [...prev, ...obstaculosLinea]);
          ultimaGeneracionRef.current = tick;
        }
      }

      if (tick % 2 === 0) {
        setPuntuacion(p => p + 1);
      }

      requestAnimationFrame(gameLoop);
    };

    const animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [juegoIniciado, puedeJugar]);

  // =============================================
  // 🎯 AJUSTES: CONFIGURACIÓN INICIAL DEL JUEGO
  // =============================================
  // Modifica los valores iniciales aquí si quieres cambiar la dificultad de inicio
  const iniciarJuego = () => {
    if (!puedeJugar) return;
    
    setJuegoIniciado(true);
    setGameOver(false);
    setPuntuacion(0);
    setObstaculos([]);
    setPosicion(1);
    dificultadRef.current = 1; // Dificultad inicial
    ultimaGeneracionRef.current = 0;
  };

  const mover = (dir) => {
    if (!puedeJugar || !juegoIniciado || gameOverRef.current) return;
    
    if (dir === "izq") {
      setPosicion(p => Math.max(0, p - 1));
      setDireccion("left");
    } else {
      setPosicion(p => Math.min(2, p + 1));
      setDireccion("right");
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") mover("izq");
      if (e.key === "ArrowRight") mover("der");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [juegoIniciado, puedeJugar]);

  const reiniciar = () => {
    if (!puedeJugar) return;
    
    setJuegoIniciado(true);
    setGameOver(false);
    setPuntuacion(0);
    setObstaculos([]);
    setPosicion(1);
    dificultadRef.current = 1;
    ultimaGeneracionRef.current = 0;
  };

  const tieneObstaculo = (fila, carril) => {
    return obstaculos.some(o => 
      Math.floor(o.y) === fila && o.carril === carril
    );
  };

  const puntuacionVisual = Math.floor(puntuacion / 10);

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-green-800">🎿 Carrera de Trineo</h2>
      
      {!puedeJugar && (
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
          <div className="text-2xl font-bold mb-2 text-yellow-700">⏰ Juego Completado</div>
          <p className="text-yellow-600">Ya jugaste Carrera de Trineo hoy. Vuelve mañana para jugar otra vez.</p>
        </div>
      )}
      
      {!juegoIniciado && !gameOver && (
        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 mb-6 border-2 border-green-300">
          <div className="text-4xl mb-4">🎿</div>
          <h3 className="text-2xl font-bold text-green-800 mb-4">Carrera de Trineo</h3>
          <p className="text-gray-700 mb-2">• Esquiva los obstáculos con ← →</p>
          <p className="text-gray-700 mb-2">• Más puntos por mayor distancia</p>
          <p className="text-gray-700 mb-4">• La velocidad aumenta progresivamente</p>
          
          <button
            onClick={iniciarJuego}
            disabled={!puedeJugar}
            className={`${
              puedeJugar
                ? 'bg-green-500 hover:bg-green-600 cursor-pointer transform hover:scale-105'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white px-8 py-4 rounded-xl font-bold text-lg transition-all w-full`}
          >
            {puedeJugar ? '🎮 Iniciar Carrera' : '⏰ Ya jugado hoy'}
          </button>
        </div>
      )}

      {(juegoIniciado || gameOver) && (
        <>
          <div className="text-xl mb-3 text-gray-700">Puntos: {puntuacionVisual}</div>

          {/* ============================================= */}
          {/* 🎯 AJUSTES: TAMAÑO DEL ÁREA DE JUEGO */}
          {/* ============================================= */}
          {/* Modifica h-64 para cambiar la altura del área de juego */}
          {/* Modifica gap-6 para cambiar el espacio entre carriles */}
          {/* Modifica w-10 para cambiar el ancho de cada carril */}
          <div className="relative bg-gradient-to-b from-blue-50 to-blue-100 rounded-2xl p-2 mx-auto h-80 overflow-hidden border-2 border-blue-300 shadow-lg">
            {[0, 1, 2, 3, 4].map(fila => (
              <div key={fila} className="flex justify-center gap-6 h-1/5">
                {[0, 1, 2].map(carril => {
                  const tieneObs = tieneObstaculo(fila, carril);
                  const esSnowboarder = fila === 0 && carril === posicion;
                  
                  return (
                    <div key={carril} className="w-10 h-full flex items-center justify-center">
                      {esSnowboarder ? (
                        <span className={`text-2xl transition-transform duration-150 ${
                          direccion === "right" ? "scale-x-[-1]" : ""
                        }`}>
                          🏂
                        </span>
                      ) : (
                        tieneObs && (
                          <span className="text-xl animate-pulse">
                            {obstaculos.find(o => 
                              Math.floor(o.y) === fila && o.carril === carril
                            )?.icono}
                          </span>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-8 mt-6 mb-4">
            <button
              onClick={() => mover("izq")}
              disabled={!puedeJugar}
              className={`${
                puedeJugar
                  ? 'bg-green-500 hover:bg-green-600 cursor-pointer active:scale-95'
                  : 'bg-gray-400 cursor-not-allowed'
              } text-white w-16 h-16 rounded-full shadow-lg transition-all flex items-center justify-center text-2xl font-bold`}
            >
              ←
            </button>
            <button
              onClick={() => mover("der")}
              disabled={!puedeJugar}
              className={`${
                puedeJugar
                  ? 'bg-green-500 hover:bg-green-600 cursor-pointer active:scale-95'
                  : 'bg-gray-400 cursor-not-allowed'
              } text-white w-16 h-16 rounded-full shadow-lg transition-all flex items-center justify-center text-2xl font-bold`}
            >
              →
            </button>
          </div>

          {gameOver && (
            <div className="mt-4 bg-red-100 border-2 border-red-400 rounded-xl p-4">
              <p className="text-red-700 font-bold mb-2 text-lg">💥 ¡Te estrellaste!</p>
              <p className="text-gray-700 mb-3">Puntuación final: <strong>{puntuacionVisual}</strong></p>
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-4">
                <p className="text-yellow-700 font-bold">⏰ Juego completado por hoy</p>
                <p className="text-yellow-600 text-sm">Vuelve mañana para jugar otra vez</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={reiniciar}
                  disabled={!puedeJugar}
                  className={`flex-1 ${
                    puedeJugar
                      ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                      : 'bg-gray-400 cursor-not-allowed'
                  } text-white px-4 py-3 rounded-lg font-bold transition-all`}
                >
                  🔄 Jugar Otra Vez
                </button>
                <button
                  onClick={volverASeleccion}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-bold transition-all"
                >
                  ← Volver
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {(!juegoIniciado || gameOver) && (
        <button
          onClick={volverASeleccion}
          className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          ← Volver a Juegos 2.0
        </button>
      )}
    </div>
  );
};

// =============================================
// 🎄4. CLICK REACCIÓN - 100 OBJETIVOS
// =============================================
const ClickReaccion = ({ volverASeleccion, guardarEnRanking, puedeJugar, onJuegoCompletado }) => {
  const [objetivos, setObjetivos] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(30);
  const [jugando, setJugando] = useState(false);
  const [efectos, setEfectos] = useState([]);
  const [clicksTotales, setClicksTotales] = useState(0);
  const [contadorObjetivos, setContadorObjetivos] = useState({ "🎁": 0, "⭐": 0, "🎄": 0, "❄️": 0 });
  const [faseAceleracion, setFaseAceleracion] = useState(false);
  const [objetivosGenerados, setObjetivosGenerados] = useState(0);

  // 🎯 100 OBJETIVOS EXACTOS
  const CANTIDADES = {
    "❄️": 25,  // Copos
    "🎁": 25,  // Regalos
    "⭐": 25,  // Estrellas  
    "🎄": 25   // Árboles
  };

  const CONFIG_OBJETIVOS = {
    "❄️": { puntos: 5, duracion: 600, tamaño: 20 },
    "🎁": { puntos: 3, duracion: 1000, tamaño: 24 },
    "⭐": { puntos: 2, duracion: 1200, tamaño: 22 },
    "🎄": { puntos: 1, duracion: 1500, tamaño: 26 }
  };

  const TOTAL_OBJETIVOS = 100; // 25 + 25 + 25 + 25

  // 🕒 TIMER EXACTO
  useEffect(() => {
    if (!puedeJugar || !jugando) return;

    const timer = setInterval(() => {
      setTiempoRestante(prev => {
        const nuevoTiempo = prev - 1;
        
        // 🚀 ACTIVAR ACELERACIÓN EN ÚLTIMOS 5 SEGUNDOS
        if (nuevoTiempo === 5 && !faseAceleracion) {
          setFaseAceleracion(true);
        }
        
        if (nuevoTiempo <= 0) {
          clearInterval(timer);
          setJugando(false);
          const precision = clicksTotales > 0 ? (puntuacion / clicksTotales * 100).toFixed(1) : 0;
          guardarEnRanking("click-reaccion", puntuacion, {
            tiempo: 30,
            precision: precision,
            clicksTotales: clicksTotales,
            efectividad: `${precision}%`,
            objetivosGenerados: contadorObjetivos
          });
          // Marcar juego como completado para el día
          onJuegoCompletado("click-reaccion");
          return 0;
        }
        return nuevoTiempo;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [jugando, faseAceleracion, puedeJugar]);

  // 🌟 GENERACIÓN CON 100 OBJETIVOS
  useEffect(() => {
    if (!puedeJugar || !jugando) return;

    // Calcular qué objetivos faltan por generar
    const obtenerSiguienteObjetivo = () => {
      const disponibles = [];
      
      Object.entries(CANTIDADES).forEach(([emoji, cantidad]) => {
        const generados = contadorObjetivos[emoji] || 0;
        if (generados < cantidad) {
          // En aceleración, priorizar los que faltan más
          const faltantes = cantidad - generados;
          for (let i = 0; i < faltantes; i++) {
            disponibles.push(emoji);
          }
        }
      });

      if (disponibles.length === 0) return null;
      
      // Mezclar aleatoriamente pero asegurar distribución
      return disponibles[Math.floor(Math.random() * disponibles.length)];
    };

    const generarObjetivo = () => {
      const emoji = obtenerSiguienteObjetivo();
      if (!emoji) return; // Ya se generaron todos

      // Ajustar en fase de aceleración
      const config = CONFIG_OBJETIVOS[emoji];
      const duracionFinal = faseAceleracion 
        ? Math.max(400, config.duracion * 0.6)
        : config.duracion;

      const tamañoFinal = faseAceleracion 
        ? Math.max(18, config.tamaño - 2)
        : config.tamaño;

      // 🎯 GENERAR POSICIÓN
      const nuevaPosicion = {
        x: Math.random() * 75 + 12,
        y: Math.random() * 60 + 15,
      };

      const nuevoObjetivo = {
        id: Date.now() + Math.random(),
        x: nuevaPosicion.x,
        y: nuevaPosicion.y,
        tipo: emoji,
        puntos: config.puntos,
        duracion: duracionFinal,
        tamaño: tamañoFinal,
        animacion: emoji === "❄️" ? "animate-spin" : 
                  emoji === "⭐" ? "animate-pulse" : "animate-bounce",
        sombra: faseAceleracion 
          ? "drop-shadow(0 0 8px rgba(255,100,100,0.6))" 
          : "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
        esAceleracion: faseAceleracion
      };

      setObjetivos(prev => [...prev, nuevoObjetivo]);
      setContadorObjetivos(prev => ({
        ...prev,
        [emoji]: (prev[emoji] || 0) + 1
      }));
      setObjetivosGenerados(prev => prev + 1);

      // Eliminar automáticamente
      setTimeout(() => {
        setObjetivos(prev => prev.filter(o => o.id !== nuevoObjetivo.id));
      }, duracionFinal);
    };

    // 🎯 VELOCIDAD DE GENERACIÓN INTELIGENTE
    const objetivosRestantes = TOTAL_OBJETIVOS - objetivosGenerados;
    const tiempoRestanteMs = tiempoRestante * 1000;
    
    let velocidad;
    if (faseAceleracion) {
      // En aceleración, generar más rápido los que quedan
      velocidad = Math.max(150, (tiempoRestanteMs / objetivosRestantes) * 0.6);
    } else {
      // Distribuir uniformemente en el tiempo restante
      velocidad = Math.max(300, tiempoRestanteMs / objetivosRestantes);
    }

    const intervalo = setInterval(generarObjetivo, velocidad);
    return () => clearInterval(intervalo);
  }, [jugando, tiempoRestante, faseAceleracion, contadorObjetivos, objetivosGenerados, puedeJugar]);

  // 🎮 INICIAR JUEGO
  const iniciarJuego = () => {
    if (!puedeJugar) return;
    
    setObjetivos([]);
    setPuntuacion(0);
    setTiempoRestante(30);
    setJugando(true);
    setEfectos([]);
    setClicksTotales(0);
    setContadorObjetivos({ "🎁": 0, "⭐": 0, "🎄": 0, "❄️": 0 });
    setFaseAceleracion(false);
    setObjetivosGenerados(0);
  };

  // 🖱️ MANEJAR CLICK
  const manejarClickObjetivo = (id, tipo, puntos, esAceleracion) => {
    if (!puedeJugar || !jugando) return;
    
    setClicksTotales(prev => prev + 1);
    setObjetivos(prev => prev.filter(o => o.id !== id));
    setPuntuacion(prev => prev + puntos);

    const objetivo = objetivos.find(o => o.id === id);
    if (objetivo) {
      setEfectos(prev => [
        ...prev,
        { 
          id: Date.now(), 
          x: objetivo.x, 
          y: objetivo.y, 
          texto: `+${puntos}${esAceleracion ? "⚡" : ""}`,
          color: esAceleracion 
            ? "text-red-600 font-bold text-lg" 
            : puntos >= 5 ? "text-blue-700 font-bold text-lg" : 
              puntos >= 3 ? "text-green-700 font-bold text-base" : "text-yellow-700 font-bold text-base",
        },
      ]);
    }

    setTimeout(() => {
      setEfectos(prev => prev.filter(e => Date.now() - e.id < 600));
    }, 600);
  };

  // 📊 CALCULAR ESTADÍSTICAS
  const precision = clicksTotales > 0 ? (puntuacion / clicksTotales * 100).toFixed(1) : 0;

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-500 to-red-500 bg-clip-text text-transparent">
        🎄 Click Reacción {faseAceleracion && "⚡"}
      </h2>

      {!puedeJugar && (
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
          <div className="text-2xl font-bold mb-2 text-yellow-700">⏰ Juego Completado</div>
          <p className="text-yellow-600">Ya jugaste Click Reacción hoy. Vuelve mañana para jugar otra vez.</p>
        </div>
      )}

      {/* HUD CON PROGRESO EXACTO */}
      <div className={`bg-gradient-to-br from-green-50 via-red-50 to-green-100 rounded-2xl p-4 mb-6 shadow-lg border-2 ${
        faseAceleracion ? "border-red-300 animate-pulse" : "border-green-200"
      }`}>
        
        {faseAceleracion && (
          <div className="mb-3 bg-red-100 border border-red-300 rounded-lg py-2">
            <div className="text-red-600 font-bold flex items-center justify-center gap-2 text-sm">
              ⚡ ACELERACIÓN - ÚLTIMOS {tiempoRestante}s ⚡
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-gray-800 mb-3">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-2xl font-bold text-green-700">{puntuacion}</div>
            <div className="text-xs text-gray-600">Puntos</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className={`text-2xl font-bold ${
              tiempoRestante <= 5 ? "text-red-500" : 
              tiempoRestante <= 10 ? "text-orange-500" : "text-green-600"
            }`}>
              {tiempoRestante}s
            </div>
            <div className="text-xs text-gray-600">Tiempo</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-xl font-bold text-blue-700">{precision}%</div>
            <div className="text-xs text-gray-600">Precisión</div>
          </div>
        </div>

        {/* CONTADOR EXACTO DE OBJETIVOS */}
        <div className="grid grid-cols-4 gap-1 mb-3 text-xs">
          <div className="text-center bg-blue-50 rounded p-1">
            <div className="font-semibold">❄️</div>
            <div>{contadorObjetivos["❄️"] || 0}/25</div>
          </div>
          <div className="text-center bg-green-50 rounded p-1">
            <div className="font-semibold">🎁</div>
            <div>{contadorObjetivos["🎁"] || 0}/25</div>
          </div>
          <div className="text-center bg-yellow-50 rounded p-1">
            <div className="font-semibold">⭐</div>
            <div>{contadorObjetivos["⭐"] || 0}/25</div>
          </div>
          <div className="text-center bg-red-50 rounded p-1">
            <div className="font-semibold">🎄</div>
            <div>{contadorObjetivos["🎄"] || 0}/25</div>
          </div>
        </div>

        {/* PROGRESO GENERAL */}
        <div className="text-xs text-gray-600 mb-2">
          Progreso: {objetivosGenerados}/{TOTAL_OBJETIVOS} objetivos
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              tiempoRestante <= 5 ? "bg-red-500" : 
              tiempoRestante <= 10 ? "bg-orange-500" : "bg-green-500"
            }`}
            style={{ width: `${(tiempoRestante / 30) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* ÁREA DE JUEGO */}
      <div className="relative bg-gradient-to-b from-green-100 to-green-50 rounded-2xl p-4 mb-6 mx-auto h-80 border-2 border-green-300 shadow-inner overflow-hidden">
        
        {objetivos.map(objetivo => (
          <button
            key={objetivo.id}
            onClick={() => manejarClickObjetivo(objetivo.id, objetivo.tipo, objetivo.puntos, objetivo.esAceleracion)}
            disabled={!puedeJugar}
            className={`absolute transition-all duration-150 transform hover:scale-110 active:scale-95 ${objetivo.animacion}`}
            style={{
              left: `${objetivo.x}%`,
              top: `${objetivo.y}%`,
              transform: "translate(-50%, -50%)",
              fontSize: `${objetivo.tamaño}px`,
              filter: objetivo.sombra,
              zIndex: 10
            }}
          >
            {objetivo.tipo}
          </button>
        ))}

        {efectos.map(efecto => (
          <div
            key={efecto.id}
            className={`absolute ${efecto.color} animate-bounce z-20`}
            style={{
              left: `${efecto.x}%`,
              top: `${efecto.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {efecto.texto}
          </div>
        ))}

        {!jugando && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 rounded-2xl backdrop-blur-sm z-30">
            {tiempoRestante === 0 ? (
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🎯</div>
                <div className="text-2xl font-bold mb-2 text-green-600">¡Tiempo!</div>
                <div className="text-lg text-gray-700 mb-2">
                  Puntos: <span className="font-bold text-red-600">{puntuacion}</span>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Precisión: <span className="font-bold">{precision}%</span>
                </div>
                <div className="text-xs text-gray-500 grid grid-cols-4 gap-2 mb-4">
                  <div>❄️: {contadorObjetivos["❄️"]}/25</div>
                  <div>🎁: {contadorObjetivos["🎁"]}/25</div>
                  <div>⭐: {contadorObjetivos["⭐"]}/25</div>
                  <div>🎄: {contadorObjetivos["🎄"]}/25</div>
                </div>
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-4">
                  <p className="text-yellow-700 font-bold">⏰ Juego completado por hoy</p>
                  <p className="text-yellow-600 text-sm">Vuelve mañana para jugar otra vez</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🎄</div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">Click Reacción</h3>
                <p className="text-gray-600 mb-2 text-sm">
                  <span className="font-bold">❄️  (5pts)</span> | 
                  <span className="font-bold"> 🎁  (3pts)</span>
                </p>
                <p className="text-gray-600 mb-2 text-sm">
                  <span className="font-bold">⭐  (2pts)</span> | 
                  <span className="font-bold"> 🎄  (1pt)</span>
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Total: 100 objetivos en 30 segundos
                </p>
                <button
                  onClick={iniciarJuego}
                  disabled={!puedeJugar}
                  className={`${
                    puedeJugar
                      ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                      : 'bg-gray-400 cursor-not-allowed'
                  } text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg`}
                >
                  {puedeJugar ? '🎮 Iniciar Juego' : '⏰ Ya jugado hoy'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={volverASeleccion}
        className="w-full bg-gradient-to-r from-red-500 to-green-600 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-green-700 transition-all"
      >
        ← Volver a Juegos 2.0
      </button>
    </div>
  );
};

// =============================================
// 5. 🧠 MEMORY AVANZADO - 20 PARES NAVIDEÑOS
// =============================================
const MemoryAvanzado = ({ volverASeleccion, guardarEnRanking, puedeJugar, onJuegoCompletado }) => {
  const [cartas, setCartas] = useState([]);
  const [cartasVolteadas, setCartasVolteadas] = useState([]);
  const [paresEncontrados, setParesEncontrados] = useState(0);
  const [movimientos, setMovimientos] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [bloquearClics, setBloquearClics] = useState(false);
  const [efectoGiro, setEfectoGiro] = useState(null);

  // 20 emojis navideños diferentes
  const emojisNavidenos = [
    "🎅", "🤶", "🦌", "🎄", "🎁", "❄️", "☃️", "🔔", "🕯️", "🌟",
    "🍪", "🥛", "🧦", "🛷", "⭐", "🌲", "🎶", "🕎", "✨", "🏠"
  ];

  useEffect(() => {
    iniciarJuego();
  }, []);

  const iniciarJuego = () => {
    if (!puedeJugar) return;
    
    // Crear 20 pares (40 cartas)
    const cartasEmojis = [...emojisNavidenos, ...emojisNavidenos]
      .map((emoji, index) => ({ 
        id: index, 
        emoji, 
        volteada: false, 
        encontrada: false 
      }))
      .sort(() => Math.random() - 0.5);
    
    setCartas(cartasEmojis);
    setParesEncontrados(0);
    setMovimientos(0);
    setCartasVolteadas([]);
    setJuegoTerminado(false);
    setBloquearClics(false);
    setEfectoGiro(null);
  };

  const voltearCarta = (index) => {
    if (!puedeJugar || bloquearClics || juegoTerminado || cartas[index].encontrada || cartas[index].volteada) return;

    setEfectoGiro(index);
    
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
        
        // Crear una nueva copia para evitar problemas de referencia
        const cartasActualizadas = [...cartas];
        
        if (cartasActualizadas[primeraIndex].emoji === cartasActualizadas[segundaIndex].emoji) {
          cartasActualizadas[primeraIndex].encontrada = true;
          cartasActualizadas[segundaIndex].encontrada = true;
          
          // Actualizar el estado de las cartas primero
          setCartas(cartasActualizadas);
          
          // Luego calcular los nuevos pares encontrados
          const nuevosPares = paresEncontrados + 1;
          setParesEncontrados(nuevosPares);
          
          // Verificar si el juego terminó
          if (nuevosPares === emojisNavidenos.length) {
            setTimeout(() => {
              setJuegoTerminado(true);
              const puntuacion = calcularPuntuacionMemory(nuevosMovimientos);
              guardarEnRanking("memory-avanzado", puntuacion, {
                movimientos: nuevosMovimientos,
                pares: emojisNavidenos.length,
                eficiencia: (emojisNavidenos.length / nuevosMovimientos).toFixed(2)
              });
              // Marcar juego como completado para el día
              onJuegoCompletado("memory-avanzado");
            }, 500);
          }
        } else {
          cartasActualizadas[primeraIndex].volteada = false;
          cartasActualizadas[segundaIndex].volteada = false;
          setCartas(cartasActualizadas);
        }
        
        setCartasVolteadas([]);
        setBloquearClics(false);
        setEfectoGiro(null);
      }, 1000);
    }
  };

  const calcularPuntuacionMemory = (totalMovimientos) => {
    const base = 100;
    let bonus = 0;
    const m = totalMovimientos;

    if (m <= 40) bonus = 200;
    else if (m <= 50) bonus = 150;
    else if (m <= 60) bonus = 100;
    else if (m <= 70) bonus = 50;
    else if (m <= 80) bonus = 25;
    else bonus = 0;

    return base + bonus;
  };

  const getNivelHabilidad = (movimientos) => {
    if (movimientos <= 40) return { texto: "🎯 ¡Experto!", color: "text-purple-600" };
    if (movimientos <= 50) return { texto: "⭐ ¡Excelente!", color: "text-blue-600" };
    if (movimientos <= 60) return { texto: "👍 ¡Muy bien!", color: "text-green-600" };
    if (movimientos <= 70) return { texto: "😊 ¡Bien hecho!", color: "text-emerald-600" };
    if (movimientos <= 80) return { texto: "🙂 ¡Buen trabajo!", color: "text-yellow-600" };
    return { texto: "💪 ¡Sigue practicando!", color: "text-orange-600" };
  };

  const nivel = getNivelHabilidad(movimientos);

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-500 to-red-500 bg-clip-text text-transparent">
        🧠 Memory Avanzado - 20 Pares
      </h2>
      
      {!puedeJugar && (
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
          <div className="text-2xl font-bold mb-2 text-yellow-700">⏰ Juego Completado</div>
          <p className="text-yellow-600">Ya jugaste Memory Avanzado hoy. Vuelve mañana para jugar otra vez.</p>
        </div>
      )}
      
      {/* Información del juego */}
      <div className="grid grid-cols-4 gap-3 mb-6 bg-gradient-to-br from-green-100 to-red-100 rounded-2xl p-4 shadow-lg border-2 border-green-200">
        <div className="text-center bg-white rounded-xl p-3 shadow-sm">
          <div className="text-lg font-bold text-green-700">{paresEncontrados}/20</div>
          <div className="text-sm text-green-600">Pares</div>
        </div>
        <div className="text-center bg-white rounded-xl p-3 shadow-sm">
          <div className="text-lg font-bold text-blue-700">{movimientos}</div>
          <div className="text-sm text-blue-600">Mov.</div>
        </div>
        <div className="text-center bg-white rounded-xl p-3 shadow-sm">
          <div className="text-lg font-bold text-purple-700">
            {calcularPuntuacionMemory(movimientos)}
          </div>
          <div className="text-sm text-purple-600">Puntos</div>
        </div>
        <div className="text-center bg-white rounded-xl p-3 shadow-sm">
          <div className="text-lg font-bold text-orange-700">
            {movimientos > 0 ? ((paresEncontrados / movimientos) * 100).toFixed(1) : "0"}%
          </div>
          <div className="text-sm text-orange-600">Ef.</div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6 max-w-md mx-auto">
        <div 
          className="bg-gradient-to-r from-green-500 to-red-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${(paresEncontrados / 20) * 100}%` }}
        ></div>
      </div>

      {/* Tablero de cartas - 5x8 para 40 cartas */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 mb-6 max-w-2xl mx-auto border-2 border-red-200 shadow-lg">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {cartas.map((carta, index) => (
            <button
              key={carta.id}
              onClick={() => voltearCarta(index)}
              disabled={!puedeJugar || carta.encontrada || bloquearClics || juegoTerminado}
              className={`w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl rounded-lg transition-all duration-300 transform ${
                efectoGiro === index ? 'animate-flip' : ''
              } ${
                carta.volteada || carta.encontrada 
                  ? 'bg-white border-2 border-green-500 shadow-md scale-105' 
                  : 'bg-gradient-to-br from-green-500 to-red-500 hover:from-green-600 hover:to-red-600 text-white shadow-lg hover:scale-105'
              } ${carta.encontrada ? 'ring-2 ring-green-500 shadow-lg' : ''} ${
                juegoTerminado && carta.encontrada ? 'animate-pulse' : ''
              }`}
            >
              <div className={`transition-all duration-300 ${
                carta.volteada || carta.encontrada ? 'opacity-100' : 'opacity-0'
              }`}>
                {(carta.volteada || carta.encontrada) ? carta.emoji : "?"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mensaje de juego terminado */}
      {juegoTerminado && (
        <div className="bg-gradient-to-br from-green-100 to-red-100 border-2 border-green-400 rounded-2xl p-6 mb-4 shadow-lg animate-fade-in">
          <div className="text-4xl mb-3">🎉 ¡Feliz Navidad!</div>
          <div className={`text-2xl font-bold mb-2 ${nivel.color}`}>
            {nivel.texto}
          </div>
          <p className="text-gray-700 mb-2 text-lg">
            Completaste los <strong className="text-green-600">20 pares</strong> en 
          </p>
          <p className="text-xl font-bold text-blue-600 mb-2">
            {movimientos} Movimientos
          </p>
          <p className="text-gray-600 mb-4">
            Puntuación final: <strong className="text-purple-600 text-xl">{calcularPuntuacionMemory(movimientos)} puntos</strong>
          </p>
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-4">
            <p className="text-yellow-700 font-bold">⏰ Juego completado por hoy</p>
            <p className="text-yellow-600 text-sm">Vuelve mañana para jugar otra vez</p>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row">
            <button
              onClick={iniciarJuego}
              disabled={!puedeJugar}
              className={`flex-1 ${
                puedeJugar
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 cursor-pointer transform hover:scale-105'
                  : 'bg-gray-400 cursor-not-allowed'
              } text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg`}
            >
              {puedeJugar ? '🎄 Jugar Otra Vez' : '⏰ Ya jugado hoy'}
            </button>
            <button
              onClick={volverASeleccion}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              🏠 Volver
            </button>
          </div>
        </div>
      )}

      {/* Controles cuando el juego está en curso */}
      {!juegoTerminado && (
        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={iniciarJuego}
            disabled={!puedeJugar}
            className={`flex-1 ${
              puedeJugar
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 cursor-pointer transform hover:scale-105'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg`}
          >
            {puedeJugar ? '🔄 Reiniciar' : '⏰ Ya jugado hoy'}
          </button>
          <button
            onClick={volverASeleccion}
            className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 shadow-lg"
          >
            ← Volver a Juegos
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes flip {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(90deg) scale(1.1); }
          100% { transform: rotateY(0deg) scale(1); }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-flip { animation: flip 0.6s ease-in-out; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
};

// =============================================
// 🏆 COMPONENTE RANKING CORREGIDO (ESPACIADO FIXED)
// =============================================
const RankingJuego2 = ({ juegoId, juegoNombre, rankingGlobal, usuarioActual, obtenerMejorPuntuacionPersonal }) => {
  const [rankingCompleto, setRankingCompleto] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarRankingCompleto();
  }, [rankingGlobal, juegoId]);

  const cargarRankingCompleto = async () => {
    try {
      setCargando(true);
      const rankingJuego = await gobaService.obtenerRankingJuego(juegoId);
      
      const topJugadores = rankingJuego
        .sort((a, b) => b.mejorPuntuacion - a.mejorPuntuacion)
        .slice(0, 5)
        .map((jugador, index) => ({
          ...jugador,
          posicion: index + 1,
          esUsuarioActual: jugador.usuarioId === usuarioActual?.id
        }));
      
      setRankingCompleto(topJugadores);
    } catch (error) {
      console.log(`Error cargando ranking para ${juegoId}:`, error);
      setRankingCompleto([]);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-200">
        <h4 className="text-lg font-bold mb-3 text-center">{juegoNombre}</h4>
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-200">
      <h4 className="text-lg font-bold mb-4 text-center text-gray-800">
        {juegoNombre}
      </h4>
      
      <div className="space-y-2">
        {rankingCompleto.length > 0 ? (
          rankingCompleto.map((jugador) => (
            <div 
              key={jugador.usuarioId}
              className={`flex items-center justify-between p-2 rounded-lg ${
                jugador.esUsuarioActual 
                  ? 'bg-blue-50 border border-blue-300' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {/* CONTENEDOR FLEXIBLE PARA NOMBRE COMPLETO */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  jugador.posicion === 1 ? 'bg-yellow-400 text-white' :
                  jugador.posicion === 2 ? 'bg-gray-400 text-white' :
                  jugador.posicion === 3 ? 'bg-orange-400 text-white' :
                  'bg-blue-400 text-white'
                }`}>
                  {jugador.posicion}
                </div>
                
                {/* NOMBRE COMPLETO CON ESPACIO ADECUADO */}
                <span className={`text-sm font-medium flex-1 min-w-0 ${
                  jugador.esUsuarioActual ? 'text-blue-600 font-semibold' : 'text-gray-700'
                }`}>
                  {jugador.nombre}
                </span>
              </div>
              
              {/* PUNTUACIÓN COMPACTA */}
              <span className="text-sm font-bold text-gray-800 whitespace-nowrap ml-2">
                {jugador.mejorPuntuacion}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">Sin datos aún</p>
            <p className="text-gray-400 text-xs mt-1">¡Sé el primero!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================
// 🎯 COMPONENTE PRINCIPAL JUEGOS 2.0
// =============================================
export default function Juegos2() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [juegoActivo, setJuegoActivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [rankingGlobal, setRankingGlobal] = useState({});
  const [juegosCompletadosHoy, setJuegosCompletadosHoy] = useState({});

  // =============================================
  // 📋 LISTA DE JUEGOS 2.0
  // =============================================
  const juegos2 = [
    {
      id: "wordle-navideno",
      nombre: " Wordle Navideño",
      descripcion: "Adivina palabras navideñas",
      icono: "🔤",
      color: "from-blue-500 to-purple-500",
      dificultad: "Desafiante"
    },
    {
      id: "simon-dice",
      nombre: "Simón Dice",
      descripcion: "Memoriza secuencias de luces",
      icono: "🎮",
      color: "from-green-500 to-blue-500",
      dificultad: "Medio",
    },
    {
      id: "carrera-trineo",
      nombre: " Carrera de ski", 
      descripcion: "Esquiva obstáculos con el Ski",
      icono: "🎿",
      color: "from-red-500 to-orange-500",
      dificultad: "Medio",
    },
    {
      id: "click-reaccion",
      nombre: "Click Reacción",
      descripcion: "Test de reflejos y velocidad",
      icono: "⚡",
      color: "from-yellow-500 to-amber-500",
      dificultad: "Medio", 
    },
    {
      id: "memory-avanzado",
      nombre: "Memory Avanzado",
      descripcion: "20 pares con sistema de puntos mejorado",
      icono: "🧠",
      color: "from-indigo-500 to-purple-600",
      dificultad: "Desafiante",
    }
  ];

  // =============================================
  // ⚡ EFECTOS Y FUNCIONES PRINCIPALES
  // =============================================
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) {
      window.location.href = "/login";
      return;
    }
    setUsuarioActual(usuario);
    cargarJuegosCompletadosHoy();
    cargarRankingsJuegos2();
  }, []);

  // Función para verificar si un juego fue completado hoy
  const cargarJuegosCompletadosHoy = () => {
    const hoy = new Date().toDateString();
    const juegosGuardados = JSON.parse(localStorage.getItem('juegosCompletadosHoy') || '{}');
    
    // Si es un nuevo día, limpiar los juegos completados
    if (juegosGuardados.fecha !== hoy) {
      localStorage.setItem('juegosCompletadosHoy', JSON.stringify({ fecha: hoy, juegos: {} }));
      setJuegosCompletadosHoy({});
    } else {
      setJuegosCompletadosHoy(juegosGuardados.juegos || {});
    }
  };

  // Función para marcar un juego como completado hoy
  const marcarJuegoCompletado = (juegoId) => {
    const hoy = new Date().toDateString();
    const juegosGuardados = JSON.parse(localStorage.getItem('juegosCompletadosHoy') || '{}');
    
    const nuevosJuegosCompletados = {
      ...juegosGuardados.juegos,
      [juegoId]: true
    };
    
    const nuevoEstado = {
      fecha: hoy,
      juegos: nuevosJuegosCompletados
    };
    
    localStorage.setItem('juegosCompletadosHoy', JSON.stringify(nuevoEstado));
    setJuegosCompletadosHoy(nuevosJuegosCompletados);
  };

  // Función para verificar si un juego puede ser jugado hoy
  const puedeJugarHoy = (juegoId) => {
    return !juegosCompletadosHoy[juegoId];
  };

  const cargarRankingsJuegos2 = async () => {
    try {
      setCargando(true);
      setMensaje("🔄 Cargando rankings Juegos 2.0...");
      
      const nuevoRankingGlobal = {};
      
      for (const juego of juegos2) {
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
          console.log(`⚠️ Juego ${juego.id} aún sin datos:`, error);
          nuevoRankingGlobal[juego.id] = {};
        }
      }
      
      setRankingGlobal(nuevoRankingGlobal);
      setMensaje("✅ Rankings Juegos 2.0 cargados");
      
    } catch (error) {
      console.log('❌ Error cargando rankings Juegos 2.0:', error);
      setMensaje("⚠️ Error cargando rankings");
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const guardarEnRankingJuegos2 = async (juegoId, puntuacion, datosSession = {}) => {
    try {
      setMensaje("📡 Guardando en Juegos 2.0...");
      
      const resultado = await gobaService.guardarPuntuacionJuego(
        usuarioActual.id,
        juegoId,
        puntuacion,
        datosSession
      );
      
      if (resultado.esNuevoRecord) {
        setMensaje("🎉 ¡Nuevo récord en Juegos 2.0!");
      } else {
        setMensaje("✅ Puntuación guardada en Juegos 2.0");
      }
      
      cargarRankingsJuegos2();
      
    } catch (error) {
      console.log('❌ Error guardando en Juegos 2.0:', error);
      setMensaje("⚠️ Error guardando puntuación");
    } finally {
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const obtenerMejorPuntuacionPersonalJuegos2 = async (juegoId) => {
    if (!usuarioActual) return 0;
    
    try {
      const mejor = await gobaService.obtenerMejorPuntuacionPersonal(
        usuarioActual.id, 
        juegoId
      );
      return mejor;
    } catch (error) {
      console.log('Error obteniendo mejor puntuación Juegos 2.0:', error);
      return 0;
    }
  };

  const iniciarJuego = (juegoId) => {
    setJuegoActivo(juegoId);
  };

  const volverASeleccion = () => {
    setJuegoActivo(null);
  };

  const manejarJuegoCompletado = (juegoId) => {
    marcarJuegoCompletado(juegoId);
  };

  // =============================================
  // 🎨 RENDER PRINCIPAL
  // =============================================
  if (cargando) {
    return <div className="text-center py-8">Cargando Juegos 2.0...</div>;
  }

  if (!usuarioActual) {
    return <div className="text-center py-8">Redirigiendo al login...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            🎮 Juegos 2 
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-light">
            Premios a líder de cada juego el Domingo a las 6pm! 
          </p>
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 max-w-md mx-auto mb-4">
            <p className="text-yellow-700 font-bold">⏰ Juegos Diarios</p>
            <p className="text-yellow-600 text-sm">Cada juego solo se puede jugar 1 vez al día</p>
          </div>
          
          {mensaje && (
            <div className={`inline-block px-4 py-2 rounded-lg mb-4 ${
              mensaje.includes('✅') || mensaje.includes('🎉') ? 'bg-green-100 text-green-700 border border-green-300' :
              mensaje.includes('⚠️') || mensaje.includes('Error') ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
              'bg-blue-100 text-blue-700 border border-blue-300'
            }`}>
              {mensaje}
            </div>
          )}
        </div>

        {!juegoActivo ? (
          <>
            {/* ============================================= */}
            {/* 🎯 MENÚ PRINCIPAL DE JUEGOS */}
            {/* ============================================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {juegos2.map((juego) => {
                const puedeJugar = puedeJugarHoy(juego.id);
                return (
                  <div
                    key={juego.id}
                    className={`bg-gradient-to-br ${juego.color} rounded-2xl p-6 text-white text-center shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                      !puedeJugar ? 'opacity-80' : ''
                    }`}
                    onClick={() => iniciarJuego(juego.id)}
                  >
                    <div className="text-5xl mb-4">{juego.icono}</div>
                    <h3 className="text-xl font-bold mb-2">{juego.nombre}</h3>
                    <p className="text-white/90 mb-3">{juego.descripcion}</p>
                    <div className="flex justify-center gap-2 mb-2">
                      <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                        {juego.dificultad}
                      </div>
                      {!puedeJugar && (
                        <div className="bg-yellow-500 rounded-full px-3 py-1 text-sm">
                          ⏰ Ya jugado
                        </div>
                      )}
                    </div>
                    <div className="mt-2 bg-white/30 rounded-full px-3 py-1 text-sm">
                      Mejor: {rankingGlobal[juego.id]?.[usuarioActual.id]?.puntuacion || 0} pts
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ============================================= */}
            {/* 🏆 SECCIÓN DE RANKINGS */}
            {/* ============================================= */}
            <div className="bg-white/90 rounded-2xl p-8 shadow-2xl border-2 border-purple-200 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">🏆 Rankings - 5 Juegos Nuevos</h2>
                <button 
                  onClick={cargarRankingsJuegos2}
                  disabled={cargando}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {cargando ? '🔄' : '🔄 Actualizar'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {juegos2.map((juego) => (
                  <RankingJuego2 
                    key={juego.id} 
                    juegoId={juego.id} 
                    juegoNombre={juego.nombre}
                    rankingGlobal={rankingGlobal}
                    usuarioActual={usuarioActual}
                    obtenerMejorPuntuacionPersonal={obtenerMejorPuntuacionPersonalJuegos2}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ============================================= */
          /* 🎮 ÁREA DE JUEGO ACTIVO */
          /* ============================================= */
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-purple-200 max-w-2xl mx-auto">
            {juegoActivo === "wordle-navideno" && (  
              <WordleNavideno 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos2}
                puedeJugar={puedeJugarHoy(juegoActivo)}
                onJuegoCompletado={manejarJuegoCompletado}
              />
            )}
            {juegoActivo === "simon-dice" && (
              <SimonDice 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos2}
                puedeJugar={puedeJugarHoy(juegoActivo)}
                onJuegoCompletado={manejarJuegoCompletado}
              />
            )}
            {juegoActivo === "carrera-trineo" && (
              <CarreraTrineo 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos2}
                puedeJugar={puedeJugarHoy(juegoActivo)}
                onJuegoCompletado={manejarJuegoCompletado}
              />
            )}
            {juegoActivo === "click-reaccion" && (
              <ClickReaccion 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos2}
                puedeJugar={puedeJugarHoy(juegoActivo)}
                onJuegoCompletado={manejarJuegoCompletado}
              />
            )}
            {juegoActivo === "memory-avanzado" && (
              <MemoryAvanzado 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos2}
                puedeJugar={puedeJugarHoy(juegoActivo)}
                onJuegoCompletado={manejarJuegoCompletado}
              />
            )}
          </div>
        )}

        {/* ============================================= */}
        {/* 🧭 NAVEGACIÓN */}
        {/* ============================================= */}
        <div className="text-center space-y-4">
         
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg mx-2"
          >
            🏠 Volver al Home
          </Link>
        </div>
      </div>
    </div>
  );
}