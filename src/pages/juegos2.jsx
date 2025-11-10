// src/pages/juegos2.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

// =============================================
// 🔤 1. COMPONENTE WORDLE NAVIDEÑO - 5 PALABRAS POR SESIÓN (CORREGIDO)
// =============================================
const WordleNavideno = ({ volverASeleccion, guardarEnRanking }) => {
  const PALABRAS = [
    "NIEVE", "REGALO", "PAZ", "AMOR", "BELEN", "CAMPANA", "ESTRELLA", 
    "RENOS", "FAMILIA", "LUNA", "CORONA", "VELA", "TRINEO", "DUENDE",
    "GORRO", "PAPA", "NOEL", "ANGEL", "INVIERNO", "DICIEMBRE"
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

  // Timer
  useEffect(() => {
    let intervalo;
    if (tiempoInicio && !juegoTerminado && !sesionTerminada) {
      intervalo = setInterval(() => {
        setTiempoTranscurrido(Date.now() - tiempoInicio);
      }, 100);
    }
    return () => clearInterval(intervalo);
  }, [tiempoInicio, juegoTerminado, sesionTerminada]);

  // Inicializar juego
  useEffect(() => {
    iniciarSesion();
  }, []);

  // CORRECCIÓN: Efecto para cambiar de palabra cuando se incrementa palabrasResueltas
  useEffect(() => {
    if (palabrasResueltas > 0 && palabrasResueltas < 5) {
      const timer = setTimeout(() => {
        iniciarNuevaPalabra();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (palabrasResueltas >= 5) {
      // CORRECCIÓN: Terminar sesión inmediatamente cuando llegue a 5
      setSesionTerminada(true);
      guardarEnRanking("wordle-navideno", puntuacionAcumulada, {
        palabrasResueltas: palabrasResueltas,
        mejorRacha: mejorRacha,
        sesionCompleta: true
      });
    }
  }, [palabrasResueltas]);

  const obtenerPalabraAleatoria = () => {
    const palabrasDisponibles = PALABRAS.filter(palabra => !palabrasUsadas.includes(palabra));
    if (palabrasDisponibles.length === 0) {
      return PALABRAS[Math.floor(Math.random() * PALABRAS.length)];
    }
    return palabrasDisponibles[Math.floor(Math.random() * palabrasDisponibles.length)];
  };

  const iniciarSesion = () => {
    setPalabrasResueltas(0);
    setPuntuacionAcumulada(0);
    setRachaActual(0);
    setMejorRacha(0);
    setPalabrasUsadas([]);
    setSesionTerminada(false);
    iniciarNuevaPalabra();
  };

  const iniciarNuevaPalabra = () => {
    // CORRECCIÓN: Removí la verificación aquí porque ahora está en el useEffect
    const nuevaPalabra = obtenerPalabraAleatoria();
    setPalabraSecreta(nuevaPalabra);
    
    const letrasArray = nuevaPalabra.split("");
    const letrasMezcladas = [...letrasArray]
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

  const manejarClickLetra = (letra, index) => {
    if (juegoTerminado || sesionTerminada || letra === "") return;

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
          const puntuacionPalabra = calcularPuntuacion(nuevosIntentos, tiempoSegundos);
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
            // CORRECCIÓN: Solo incrementar si no hemos llegado a 5
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
              // CORRECCIÓN: Solo incrementar si no hemos llegado a 5
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
    if (juegoTerminado || sesionTerminada) return;

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

  const calcularBonusTiempo = (tiempoSegundos) => {
    if (tiempoSegundos <= 5) return 30;
    if (tiempoSegundos <= 10) return 20;
    if (tiempoSegundos <= 15) return 10;
    if (tiempoSegundos <= 20) return 5;
    return 0;
  };

  const calcularPuntuacion = (intentosUsados, tiempoSegundos) => {
    const puntuacionesBase = [100, 80, 60];
    const puntosBase = puntuacionesBase[intentosUsados - 1] || 0;
    const bonusTiempo = calcularBonusTiempo(tiempoSegundos);
    return puntosBase + bonusTiempo;
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

  // CORRECCIÓN: Función para obtener el texto de la palabra actual
  const obtenerTextoPalabraActual = () => {
    if (sesionTerminada) return "Sesión completada";
    return `Palabra ${palabrasResueltas + 1} de 5`;
  };

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6">🔤 Wordle Navideño</h2>
      
      <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-4 gap-2 text-sm mb-3">
          <div>
            <div className="font-bold">{palabrasResueltas}/5</div>
            <div>Completadas</div>
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

        {!sesionTerminada && (
          <div className="text-center">
            <div className="font-bold text-lg">{formatearTiempo(tiempoTranscurrido)}</div>
            <div className="text-gray-600 text-sm">
              {/* CORRECCIÓN: Usar la función helper para el texto */}
              {obtenerTextoPalabraActual()}
            </div>
          </div>
        )}
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
                  disabled={juegoTerminado || letra === ""}
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
              disabled={juegoTerminado || intentoActual.every(letra => letra === "")}
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
              disabled={juegoTerminado || palabrasResueltas >= 5}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              🔄 Saltar
            </button>
          </div>

          {juegoTerminado && ganado && (
            <div className="bg-green-100 border-2 border-green-400 rounded-2xl p-4 mb-6">
              <div className="text-xl font-bold text-green-700 mb-2">✅ ¡Correcto!</div>
              <p className="text-green-600">
                +{calcularPuntuacion(intentos, Math.floor(tiempoTranscurrido / 1000))} puntos
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

          <button
            onClick={iniciarSesion}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all w-full"
          >
            🔄 Nueva Sesión (5 Palabras)
          </button>
        </div>
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
// 🎮 2. COMPONENTE SIMÓN DICE MEJORADO (CON BONUS POR VELOCIDAD)
// =============================================
const SimonDice = ({ volverASeleccion, guardarEnRanking }) => {
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

  // Timer para mostrar tiempo en tiempo real
  useEffect(() => {
    let intervalo;
    if (jugando && tiempoInicioNivel && !gameOver) {
      intervalo = setInterval(() => {
        setTiempoActual(Date.now() - tiempoInicioNivel);
      }, 100);
    }
    return () => clearInterval(intervalo);
  }, [jugando, tiempoInicioNivel, gameOver]);

  // NUEVO: Función para calcular puntuación con bonus
  const calcularPuntuacion = (nivel, tiempoTotalSegundos) => {
    const puntosBase = nivel * 10;
    
    // Bonus por velocidad (más rápido = más bonus)
    // Tiempo promedio por nivel en segundos
    const tiempoPromedioPorNivel = tiempoTotalSegundos / nivel;
    
    // Bonus escala: menos de 3s por nivel = máximo bonus, más de 8s = mínimo bonus
   
     let bonusPorNivel = 0;
  if (tiempoPromedioPorNivel <= 3) bonusPorNivel = 5;
  else if (tiempoPromedioPorNivel <= 5) bonusPorNivel = 3;
  else if (tiempoPromedioPorNivel <= 7) bonusPorNivel = 2;
  else if (tiempoPromedioPorNivel <= 10) bonusPorNivel = 1;
  // Más de 10 segundos por nivel = 0 bonus
  
  const bonusTotal = bonusPorNivel * nivel;
  
  return puntosBase + bonusTotal;
};

  const iniciarJuego = () => {
    setNivel(1);
    setSecuencia([]);
    setJugadorSecuencia([]);
    setGameOver(false);
    setTiemposPorNivel([]);
    setTiempoTotal(0);
    setTiempoActual(0);
    siguienteNivel();
  };

  const siguienteNivel = () => {
    setJugando(false);
    setMostrandoSecuencia(true);
    
    // Agregar nuevo color a la secuencia
    const nuevoColor = Math.floor(Math.random() * colores.length);
    const nuevaSecuencia = [...secuencia, nuevoColor];
    setSecuencia(nuevaSecuencia);
    
    // Iniciar timer del nivel
    setTiempoInicioNivel(Date.now());
    setTiempoActual(0);
    
    // Mostrar secuencia con mejor animación
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
          }, 200);
        }, 600);
      } else {
        setMostrandoSecuencia(false);
        setJugando(true);
        setJugadorSecuencia([]);
      }
    };
    
    setTimeout(() => {
      mostrarSiguienteColor();
    }, 500);
  };

  const manejarClickColor = (colorIndex) => {
    if (!jugando || mostrandoSecuencia) return;

    // Animación al hacer click
    setBotonActivo(colorIndex);
    setTimeout(() => setBotonActivo(null), 300);

    const nuevaJugadorSecuencia = [...jugadorSecuencia, colorIndex];
    setJugadorSecuencia(nuevaJugadorSecuencia);

    // Verificar si es correcto
    if (nuevaJugadorSecuencia[nuevaJugadorSecuencia.length - 1] !== 
        secuencia[nuevaJugadorSecuencia.length - 1]) {
      // Error - NUEVO: Calcular puntuación con bonus
      const tiempoTotalSegundos = Math.floor(tiempoTotal / 1000);
      const puntuacionFinal = calcularPuntuacion(nivel, tiempoTotalSegundos);
      
      setGameOver(true);
      guardarEnRanking("simon-dice", puntuacionFinal, {
        nivelAlcanzado: nivel,
        secuenciaMaxima: secuencia.length,
        tiempoTotal: tiempoTotal,
        tiempoPromedioPorNivel: tiempoTotal / nivel,
        bonusVelocidad: puntuacionFinal - (nivel * 10)
      });
      return;
    }

    // Secuencia completa correcta - Guardar tiempo del nivel
    if (nuevaJugadorSecuencia.length === secuencia.length) {
      const tiempoNivel = Date.now() - tiempoInicioNivel;
      setTiemposPorNivel(prev => [...prev, tiempoNivel]);
      setTiempoTotal(prev => prev + tiempoNivel);
      
      setJugando(false);
      setTimeout(() => {
        setNivel(nivel + 1);
        setTimeout(siguienteNivel, 800);
      }, 1000);
    }
  };

  useEffect(() => {
    iniciarJuego();
  }, []);

  const obtenerClaseBoton = (index) => {
    const baseClase = "w-14 h-14 text-xl rounded-full transition-all duration-300 transform flex items-center justify-center border-2 border-white border-opacity-30 ";
    
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
      {/* Árbol de Navidad de fondo */}
      <div className="absolute top-4 right-4 pointer-events-none opacity-30">
        <div className="relative">
          <div className="text-4xl">🎄</div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-md mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-3 text-white drop-shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            🎮 Simón Dice
          </h2>
          <p className="text-white text-md opacity-90">
            Memoria y reflejos navideños
          </p>
        </div>

        {/* Panel de información */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 mb-8 border-4 border-yellow-400 shadow-lg">
          <div className="text-4xl font-bold text-white mb-3 drop-shadow-md">
            Nivel {nivel}
          </div>
          <div className="text-white text-lg font-semibold mb-2">
            {mostrandoSecuencia ? "🎄 Observa..." : 
             gameOver ? "💥 ¡Game Over!" : 
             "🎅 Tu turno"}
          </div>
          <div className="text-white text-sm opacity-90 mb-2">
            Secuencia: {secuencia.length} colores
          </div>
          {/* Mostrar tiempo del nivel actual */}
          {jugando && (
            <div className="text-yellow-300 text-sm font-bold">
              ⏱ Tiempo: {formatearTiempo(tiempoActual)}
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
                disabled={!jugando || mostrandoSecuencia || gameOver}
                className={obtenerClaseBoton(index)}
                style={{
                  backgroundColor: botonActivo === index ? 
                    getColorBackground(index, true) : 
                    getColorBackground(index, false),
                  opacity: (!jugando || mostrandoSecuencia || gameOver) && botonActivo !== index ? 0.5 : 1,
                }}
              >
                <span className={botonActivo === index ? 'animate-bounce' : ''}>
                  {color}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Game Over - NUEVO: Con sistema de puntos mejorado */}
        {gameOver && (
          <div className="bg-gradient-to-br from-red-600 to-pink-700 border-4 border-red-300 rounded-2xl p-6 mb-6">
            <p className="text-2xl font-bold text-white mb-3 drop-shadow-md">
              🎯 Nivel {nivel} - {secuencia.length} colores
            </p>
            <div className="text-white text-sm mb-4 space-y-2">
              <div>⏱ Tiempo total: {formatearTiempo(tiempoTotal)}</div>
              <div>📊 Promedio por nivel: {formatearTiempo(tiempoTotal / Math.max(1, tiemposPorNivel.length))}</div>
              <div>🏅 Puntos base: {nivel * 10}</div>
              <div>⚡ Bonus velocidad: +{calcularPuntuacion(nivel, Math.floor(tiempoTotal / 1000)) - (nivel * 10)}</div>
              <div className="text-yellow-300 font-bold text-lg">
                🏆 Puntuación total: {calcularPuntuacion(nivel, Math.floor(tiempoTotal / 1000))} pts
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={iniciarJuego}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🔄 Jugar Otra Vez
              </button>
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={iniciarJuego}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
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

        {/* Instrucciones - NUEVO: Con sistema de puntos explicado */}
       <div className="bg-white bg-opacity-15 rounded-xl p-4 text-white backdrop-blur-sm">
  <p className="font-bold text-lg mb-3 text-yellow-300">🎯 Sistema de Puntos:</p>
  <div className="space-y-1 text-left text-sm">
    <p>✅ <strong>+10 puntos</strong> por nivel completado</p>
    <p>⚡ <strong>+5 bonus por nivel</strong> si promedio {"<"} 3s</p>
    <p>⚡ <strong>+3 bonus por nivel</strong> si promedio {"<"} 5s</p>
    <p>⚡ <strong>+2 bonus por nivel</strong> si promedio {"<"} 7s</p>
    <p>⚡ <strong>+1 bonus por nivel</strong> si promedio {"<"} 10s</p>
    <p>🎯 <strong>Nivel alto + velocidad = Máxima puntuación</strong></p>
  </div>
</div>
      </div>

      {/* Decoraciones adicionales */}
      <div className="absolute bottom-4 left-4 text-2xl opacity-20">🎁</div>
      <div className="absolute bottom-4 right-4 text-2xl opacity-20">🌟</div>
    </div>
  );
};

// Función helper para colores de fondo
const getColorBackground = (index, isActive) => {
  const colors = [
    isActive ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.7)', // Rojo
    isActive ? 'rgba(34, 197, 94, 0.9)' : 'rgba(34, 197, 94, 0.7)', // Verde
    isActive ? 'rgba(234, 179, 8, 0.9)' : 'rgba(234, 179, 8, 0.7)', // Amarillo
    isActive ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.7)', // Azul
    isActive ? 'rgba(168, 85, 247, 0.9)' : 'rgba(168, 85, 247, 0.7)', // Violeta
    isActive ? 'rgba(249, 115, 22, 0.9)' : 'rgba(249, 115, 22, 0.7)', // Naranja
    isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)', // Blanco
    isActive ? 'rgba(139, 69, 19, 0.9)' : 'rgba(139, 69, 19, 0.7)'  // Marrón
  ];
  return colors[index % colors.length];
};

// Función MEJORADA para generar obstáculos - COMBINADA
const generarObstaculos = () => {
  const posicionActual = posicionRef.current;
  
  // Determinar cuántos obstáculos poner (1 o 2)
  const numObstaculos = Math.random() < 0.6 ? 1 : 2;
  
  if (numObstaculos === 1) {
    // Un solo obstáculo - 70% de probabilidad en la posición actual del jugador
    const enPosicionJugador = Math.random() < 0.7;
    const carrilObstaculo = enPosicionJugador ? posicionActual : Math.floor(Math.random() * 3);
    
    return [{
      id: Date.now() + Math.random(),
      carril: carrilObstaculo,
      y: 5,
      icono: emojis[Math.floor(Math.random() * emojis.length)],
    }];
  } else {
    // Dos obstáculos - UNO de ellos en la posición del jugador
    const carrilVacio = Math.floor(Math.random() * 3); // 0, 1 o 2
    
    // Si el carril vacío es donde está el jugador, elegir otro carril vacío
    let carrilVacioFinal = carrilVacio;
    if (carrilVacio === posicionActual) {
      carrilVacioFinal = (posicionActual + 1 + Math.floor(Math.random() * 2)) % 3;
    }
    
    const obstaculosLinea = [];
    
    // Agregar obstáculos en los otros dos carriles (uno será donde está el jugador)
    for (let carril = 0; carril < 3; carril++) {
      if (carril !== carrilVacioFinal) {
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

// =============================================
// ⚡ 3. CARRERA-TRINEO - CÓDIGO BASE FUNCIONANDO
// =============================================
const CarreraTrineo = ({ volverASeleccion, guardarEnRanking }) => {
  const [posicion, setPosicion] = useState(1);
  const [direccion, setDireccion] = useState("left");
  const [obstaculos, setObstaculos] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const posicionRef = useRef(posicion);
  const gameOverRef = useRef(gameOver);
  const puntuacionRef = useRef(puntuacion);
  const dificultadRef = useRef(1);
  const ultimaGeneracionRef = useRef(0);

  const emojis = ["🐻", "🌲", "🌳", "🪨", "🦊"];

  useEffect(() => { posicionRef.current = posicion; }, [posicion]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { puntuacionRef.current = puntuacion; }, [puntuacion]);

  // Función ORIGINAL que estaba funcionando
  const generarObstaculos = () => {
    // Determinar cuántos obstáculos poner (1 o 2)
    const numObstaculos = Math.random() < 0.6 ? 1 : 2;
    
    if (numObstaculos === 1) {
      // Un solo obstáculo en cualquier carril
      return [{
        id: Date.now() + Math.random(),
        carril: Math.floor(Math.random() * 3),
        y: 5,
        icono: emojis[Math.floor(Math.random() * emojis.length)],
      }];
    } else {
      // Dos obstáculos - elegir QUÉ CARRIL DEJAR VACÍO
      const carrilVacio = Math.floor(Math.random() * 3); // 0, 1 o 2
      const obstaculosLinea = [];
      
      // Agregar obstáculos en los otros dos carriles
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

  // Verificación simplificada
  const esPatronJugable = (obstaculosLinea) => {
    return true;
  };

  useEffect(() => {
    if (gameOverRef.current) return;

    let tick = 0;
    const interval = setInterval(() => {
      if (gameOverRef.current) return;

      tick++;
      
      // Aumentar dificultad progresivamente
      if (tick % 500 === 0) {
        dificultadRef.current = Math.min(3, dificultadRef.current + 0.1);
      }

      // Mover obstáculos hacia abajo
      setObstaculos(prev => {
        const velocidad = 0.04 * dificultadRef.current;
        const nuevos = prev
          .map(o => ({ ...o, y: o.y - velocidad }))
          .filter(o => o.y > -1);

        // Colisión cuando el obstáculo llega al snowboarder (línea 0)
        const colision = nuevos.some(o =>
          o.y <= 1 && o.y >= 0.5 && o.carril === posicionRef.current
        );

        if (colision) {
          setGameOver(true);
          guardarEnRanking("carrera-trineo", puntuacionRef.current, {
            distancia: puntuacionRef.current,
            dificultad: dificultadRef.current,
          });
        }

        return nuevos;
      });

      // GENERACIÓN CONTROLADA POR TIEMPO
      const probAparicion = 0.03 * dificultadRef.current;
      const tiempoDesdeUltimaGeneracion = tick - ultimaGeneracionRef.current;
      
      // Generar obstáculos cada ~60-100 ticks
      const frecuenciaGeneracion = Math.max(60, 100 - (dificultadRef.current * 15));
      
      if (tiempoDesdeUltimaGeneracion >= frecuenciaGeneracion && Math.random() < probAparicion) {
        const obstaculosLinea = generarObstaculos();
        if (obstaculosLinea.length > 0) {
          setObstaculos(prev => [...prev, ...obstaculosLinea]);
          ultimaGeneracionRef.current = tick;
        }
      }

      setPuntuacion(p => p + 1);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const mover = (dir) => {
    if (gameOverRef.current) return;
    
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
  }, []);

  const reiniciar = () => {
    setPosicion(1);
    setDireccion("left");
    setObstaculos([]);
    setPuntuacion(0);
    setGameOver(false);
    dificultadRef.current = 1;
    ultimaGeneracionRef.current = 0;
  };

  const tieneObstaculo = (fila, carril) => {
    return obstaculos.some(o => 
      Math.floor(o.y) === fila && o.carril === carril
    );
  };

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-green-800">🏔️ Carrera del Bosque</h2>
      <div className="text-xl mb-3 text-gray-700">Distancia: {puntuacion}</div>

      <div className="relative bg-gradient-to-b from-blue-50 to-blue-100 rounded-2xl p-3 mx-auto h-80 overflow-hidden border-2 border-blue-300 shadow-lg">
        {[0, 1, 2, 3, 4, 5].map(fila => (
          <div key={fila} className="flex justify-center gap-8 h-1/6">
            {[0, 1, 2].map(carril => {
              const tieneObs = tieneObstaculo(fila, carril);
              const esSnowboarder = fila === 0 && carril === posicion;
              
              return (
                <div key={carril} className="w-12 h-full flex items-center justify-center">
                  {esSnowboarder ? (
                    <span className={`text-3xl transition-transform duration-200 ${
                      direccion === "right" ? "scale-x-[-1]" : ""
                    }`}>
                      🏂
                    </span>
                  ) : (
                    tieneObs && (
                      <span className="text-2xl animate-pulse">
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

      <div className="flex justify-center gap-6 mt-6 mb-4">
        <button
          onClick={() => mover("izq")}
          className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-md active:scale-95 transition-all flex items-center justify-center text-xl font-bold"
        >
          ←
        </button>
        <button
          onClick={() => mover("der")}
          className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-md active:scale-95 transition-all flex items-center justify-center text-xl font-bold"
        >
          →
        </button>
      </div>

      {gameOver && (
        <div className="mt-4 bg-red-100 border-2 border-red-400 rounded-xl p-4">
          <p className="text-red-700 font-bold mb-2 text-lg">💥 ¡Te estrellaste!</p>
          <p className="text-gray-700 mb-3">Distancia: {puntuacion}</p>
          <div className="flex gap-3">
            <button
              onClick={reiniciar}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
            >
              🔄 Jugar Otra Vez
            </button>
            <button
              onClick={volverASeleccion}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
            >
              ← Volver
            </button>
          </div>
        </div>
      )}

      {!gameOver && (
        <button
          onClick={volverASeleccion}
          className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          ← Volver a Juegos
        </button>
      )}
    </div>
  );
};

// =============================================
// 🎄4. CLICK REACCIÓN - MEJORADO
// =============================================
const ClickReaccion = ({ volverASeleccion, guardarEnRanking }) => {
  const [objetivos, setObjetivos] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(30);
  const [jugando, setJugando] = useState(false);
  const [efectos, setEfectos] = useState([]);

  // 🕒 Control del tiempo
  useEffect(() => {
    if (!jugando) return;

    const timer = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          setJugando(false);
          guardarEnRanking("click-reaccion", puntuacion, {
            tiempo: 30,
            precision: puntuacion / (objetivos.length || 1),
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [jugando, puntuacion]);

  // 🌟 Generar objetivos aleatorios - MEJORADO
  useEffect(() => {
    if (!jugando) return;

    const generarObjetivo = () => {
      // AUMENTAMOS probabilidad al 60% y mejoramos distribución
      if (Math.random() < 0.6) {
        const tipos = [
          { emoji: "🎁", duracion: 1000, puntos: 3, prob: 0.25 },    // 25%
          { emoji: "⭐", duracion: 2000, puntos: 2, prob: 0.25 },    // 25%  
          { emoji: "🎄", duracion: 2500, puntos: 1, prob: 0.30 },    // 30% (más comunes)
          { emoji: "❄️", duracion: 500, puntos: 5, prob: 0.20 }      // 20% (más copos)
        ];
        
        // Selección ponderada
        let rand = Math.random();
        let tipoSeleccionado = tipos[0];
        
        for (let tipo of tipos) {
          if (rand < tipo.prob) {
            tipoSeleccionado = tipo;
            break;
          }
          rand -= tipo.prob;
        }
        
        // Generar posición que no se superponga (más permisivo)
        let nuevaPosicion;
        let intentos = 0;
        const maxIntentos = 15; // Menos intentos = más objetivos
        
        do {
          nuevaPosicion = {
            x: Math.random() * 80 + 10, // Más área disponible
            y: Math.random() * 55 + 20,
          };
          intentos++;
        } while (
          objetivos.some(obj => 
            Math.abs(obj.x - nuevaPosicion.x) < 12 && // Menor distancia requerida
            Math.abs(obj.y - nuevaPosicion.y) < 12
          ) && intentos < maxIntentos
        );

        // Si no encontramos posición buena después de intentos, usar la última
        if (intentos >= maxIntentos) {
          nuevaPosicion = {
            x: Math.random() * 80 + 10,
            y: Math.random() * 55 + 20,
          };
        }

        const nuevoObjetivo = {
          id: Date.now() + Math.random(),
          x: nuevaPosicion.x,
          y: nuevaPosicion.y,
          tipo: tipoSeleccionado.emoji,
          puntos: tipoSeleccionado.puntos,
          duracion: tipoSeleccionado.duracion,
          tamaño: tipoSeleccionado.emoji === "🎄" ? 26 : 
                 tipoSeleccionado.emoji === "❄️" ? 22 : 30
        };

        setObjetivos(prev => [...prev, nuevoObjetivo]);

        // Eliminar automáticamente después de su duración
        setTimeout(() => {
          setObjetivos(prev => prev.filter(o => o.id !== nuevoObjetivo.id));
        }, tipoSeleccionado.duracion);
      }
    };

    // MÁS FRECUENTE: 500ms en lugar de 600ms
    const intervaloGenerar = setInterval(generarObjetivo, 500);

    return () => clearInterval(intervaloGenerar);
  }, [jugando, objetivos]);

  // 🚀 Iniciar o reiniciar el juego
  const iniciarJuego = () => {
    setObjetivos([]);
    setPuntuacion(0);
    setTiempoRestante(30);
    setJugando(true);
    setEfectos([]);
  };

  // 🖱️ Lógica de puntuación y efectos
  const manejarClickObjetivo = (id, tipo, puntos) => {
    if (!jugando) return;
    
    setObjetivos(prev => prev.filter(o => o.id !== id));
    setPuntuacion(prev => prev + puntos);

    // Efecto visual simple
    const objetivo = objetivos.find(o => o.id === id);
    setEfectos(prev => [
      ...prev,
      { 
        id: Date.now(), 
        x: objetivo.x, 
        y: objetivo.y, 
        texto: `+${puntos}`,
        color: puntos >= 5 ? "text-blue-600 font-bold" : 
               puntos >= 3 ? "text-green-600 font-bold" : 
               puntos >= 2 ? "text-yellow-600 font-bold" : "text-red-600 font-bold"
      },
    ]);

    // Limpiar efectos después de 800ms
    setTimeout(() => {
      setEfectos(prev => prev.filter(e => Date.now() - e.id < 1000));
    }, 800);
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-500 to-red-500 bg-clip-text text-transparent">
        🎄 Click Reacción
      </h2>

      {/* HUD */}
      <div className="bg-gradient-to-br from-green-50 via-red-50 to-green-100 rounded-2xl p-6 mb-6 shadow-lg border-2 border-green-200">
        <div className="grid grid-cols-2 gap-4 text-gray-800">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-2xl font-bold text-green-700">{puntuacion} pts</div>
            <div className="text-sm text-gray-600">Puntuación</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div
              className={`text-2xl font-bold ${
                tiempoRestante <= 10 ? "text-red-500 animate-pulse" : "text-green-600"
              }`}
            >
              {tiempoRestante}s
            </div>
            <div className="text-sm text-gray-600">Tiempo</div>
          </div>
        </div>
      </div>

      {/* 🌲 Área de juego */}
      <div className="relative bg-gradient-to-b from-green-100 via-green-50 to-red-100 rounded-2xl p-4 mb-6 mx-auto max-w-md h-64 border-2 border-green-300 shadow-inner overflow-hidden">
        {/* Objetivos */}
        {objetivos.map(objetivo => (
          <button
            key={objetivo.id}
            onClick={() => manejarClickObjetivo(objetivo.id, objetivo.tipo, objetivo.puntos)}
            className="absolute transition-all duration-150 transform hover:scale-110 active:scale-95 animate-bounce"
            style={{
              left: `${objetivo.x}%`,
              top: `${objetivo.y}%`,
              transform: "translate(-50%, -50%)",
              fontSize: `${objetivo.tamaño}px`,
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
            }}
          >
            {objetivo.tipo}
          </button>
        ))}

        {/* Efectos de puntos */}
        {efectos.map(efecto => (
          <div
            key={efecto.id}
            className={`absolute text-lg font-bold animate-pulse ${efecto.color}`}
            style={{
              left: `${efecto.x}%`,
              top: `${efecto.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {efecto.texto}
          </div>
        ))}

        {/* Pantalla inicial o final */}
        {!jugando && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-2xl backdrop-blur-sm">
            {tiempoRestante === 0 ? (
              <div className="text-center p-6">
                <div className="text-3xl font-bold mb-2 text-green-600">¡Tiempo!</div>
                <div className="text-xl text-gray-700 mb-4">
                  Puntuación: <span className="font-bold text-red-600">{puntuacion}</span>
                </div>
                <button
                  onClick={iniciarJuego}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
                >
                  🔄 Jugar Otra Vez
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <button
                  onClick={iniciarJuego}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  Iniciar Juego
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={volverASeleccion}
        className="w-full bg-gradient-to-r from-red-500 to-green-600 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
      >
        ← Volver a Juegos 2.0
      </button>
    </div>
  );
};

// =============================================
// 5. 🧠 MEMORY AVANZADO - 20 PARES NAVIDEÑOS
// =============================================
const MemoryAvanzado = ({ volverASeleccion, guardarEnRanking }) => {
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
    if (bloquearClics || juegoTerminado || cartas[index].encontrada || cartas[index].volteada) return;

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
        if (cartas[primeraIndex].emoji === cartas[segundaIndex].emoji) {
          nuevasCartas[primeraIndex].encontrada = true;
          nuevasCartas[segundaIndex].encontrada = true;
          
          setParesEncontrados(prev => {
            const nuevosPares = prev + 1;
            if (nuevosPares === emojisNavidenos.length) {
              setJuegoTerminado(true);
              const puntuacion = calcularPuntuacionMemory(nuevosMovimientos);
              guardarEnRanking("memory-avanzado", puntuacion, {
                movimientos: nuevosMovimientos,
                pares: emojisNavidenos.length,
                eficiencia: (emojisNavidenos.length / nuevosMovimientos).toFixed(2)
              });
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
      
      {/* Información del juego */}
      <div className="grid grid-cols-4 gap-3 mb-6 bg-gradient-to-br from-green-100 to-red-100 rounded-2xl p-4 shadow-lg border-2 border-green-200">
        <div className="text-center bg-white rounded-xl p-3 shadow-sm">
          <div className="text-lg font-bold text-green-700">{paresEncontrados}/20</div>
          <div className="text-sm text-green-600">Pares</div>
        </div>
        <div className="text-center bg-white rounded-xl p-3 shadow-sm">
          <div className="text-lg font-bold text-blue-700">{movimientos}</div>
          <div className="text-sm text-blue-600">Movimientos</div>
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
          <div className="text-sm text-orange-600">Eficiencia</div>
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
              disabled={carta.encontrada || bloquearClics}
              className={`w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl rounded-lg transition-all duration-300 transform ${
                efectoGiro === index ? 'animate-flip' : ''
              } ${
                carta.volteada || carta.encontrada 
                  ? 'bg-white border-2 border-green-500 shadow-md scale-105' 
                  : 'bg-gradient-to-br from-green-500 to-red-500 hover:from-green-600 hover:to-red-600 text-white shadow-lg hover:scale-105'
              } ${carta.encontrada ? 'ring-2 ring-green-500 shadow-lg animate-pulse' : ''}`}
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
        <div className="bg-gradient-to-br from-green-100 to-red-100 border-2 border-green-400 rounded-2xl p-6 mb-4 shadow-lg">
          <div className="text-4xl mb-3">🎉 ¡Feliz Navidad!</div>
          <div className={`text-2xl font-bold mb-2 ${nivel.color}`}>
            {nivel.texto}
          </div>
          <p className="text-gray-700 mb-2 text-lg">
            Completaste los <strong className="text-green-600">20 pares</strong> en 
          </p>
          <p className="text-xl font-bold text-blue-600 mb-2">
            {movimientos} movimientos
          </p>
          <p className="text-gray-600 mb-4">
            Puntuación final: <strong className="text-purple-600 text-xl">{calcularPuntuacionMemory(movimientos)} puntos</strong>
          </p>
          <div className="flex gap-3 flex-col sm:flex-row">
            <button
              onClick={iniciarJuego}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              🎄 Jugar Otra Vez
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
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            🔄 Reiniciar
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
        .animate-flip { animation: flip 0.6s ease-in-out; }
      `}</style>
    </div>
  );
};

// =============================================
// 🏆 COMPONENTE RANKING JUEGO 2 (ORIGINAL CON FIREBASE Y AVATARES)
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
      
      // Obtener el ranking específico del juego desde Firebase
      const rankingJuego = await gobaService.obtenerRankingJuego(juegoId);
      
      // Ordenar por puntuación y tomar top 5
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

  const obtenerEmojiPosicion = (posicion) => {
    switch(posicion) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      case 4: return "4️⃣";
      case 5: return "5️⃣";
      default: return "🔹";
    }
  };

  const obtenerClasePosicion = (posicion) => {
    switch(posicion) {
      case 1: return "bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300";
      case 2: return "bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300";
      case 3: return "bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300";
      default: return "bg-white border border-gray-200";
    }
  };

  if (cargando) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200">
        <h3 className="font-bold text-gray-800 mb-3 text-center">{juegoNombre}</h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 text-sm mt-2">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-purple-200">
      <h3 className="font-bold text-gray-800 mb-3 text-center text-sm bg-purple-50 rounded-lg py-2 border border-purple-100">
        {juegoNombre}
      </h3>
      
      <div className="space-y-2 mb-3">
        {rankingCompleto.length > 0 ? (
          rankingCompleto.map((jugador) => (
            <div 
              key={jugador.usuarioId}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                obtenerClasePosicion(jugador.posicion)
              } ${jugador.esUsuarioActual ? 'ring-2 ring-blue-400 shadow-md' : ''}`}
            >
              {/* Avatar y posición */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm font-bold w-6 text-center">
                  {obtenerEmojiPosicion(jugador.posicion)}
                </span>
                
                {/* Avatar del usuario */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {jugador.avatar ? (
                    <img 
                      src={jugador.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    jugador.nombre?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
                
                {/* Nombre del jugador */}
                <span className={`text-sm font-medium truncate flex-1 ${
                  jugador.esUsuarioActual ? 'text-blue-600 font-bold' : 'text-gray-700'
                }`}>
                  {jugador.esUsuarioActual ? "TÚ" : jugador.nombre}
                </span>
              </div>
              
              {/* Puntuación */}
              <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                jugador.posicion === 1 ? 'bg-yellow-100 text-yellow-700' :
                jugador.posicion === 2 ? 'bg-gray-100 text-gray-700' :
                jugador.posicion === 3 ? 'bg-orange-100 text-orange-700' :
                'bg-blue-50 text-blue-600'
              }`}>
                {jugador.mejorPuntuacion}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl mb-2">🏆</div>
            <p className="text-gray-500 text-sm">Sin datos aún</p>
            <p className="text-gray-400 text-xs mt-1">Sé el primero en jugar!</p>
          </div>
        )}
      </div>
      
      {/* Información del usuario actual */}
      {usuarioActual && (
        <div className="border-t border-gray-200 pt-3 mt-2">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2 border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {usuarioActual.nombre?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="text-xs font-semibold text-blue-700">Tu mejor:</span>
            </div>
            <span className="font-bold text-green-600 bg-white px-2 py-1 rounded-full border border-green-300 text-sm">
              {rankingGlobal[juegoId]?.[usuarioActual.id]?.puntuacion || 0} pts
            </span>
          </div>
        </div>
      )}
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

  // =============================================
  // 📋 LISTA DE JUEGOS 2.0
  // =============================================
  const juegos2 = [
      {
    id: "wordle-navideno",  // 🆕 NUEVO ID
    nombre: "🔤 Wordle Navideño",
    descripcion: "Adivina palabras navideñas",
    icono: "🔤",
    color: "from-blue-500 to-purple-500",  // 🆕 Nuevos colores
    dificultad: "Medio",
    edad: "8+"
  },
    {
      id: "simon-dice",
      nombre: "🎮 Simón Dice",
      descripcion: "Memoriza secuencias de luces",
      icono: "🎮",
      color: "from-green-500 to-blue-500",
      dificultad: "Medio",
      edad: "5+"
    },
    {
      id: "carrera-trineo",
      nombre: "🦌 Carrera de Trineo", 
      descripcion: "Esquiva obstáculos con el trineo",
      icono: "🦌",
      color: "from-red-500 to-orange-500",
      dificultad: "Difícil",
      edad: "7+"
    },
    {
      id: "click-reaccion",
      nombre: "⚡ Click Reacción",
      descripcion: "Test de reflejos y velocidad",
      icono: "⚡",
      color: "from-yellow-500 to-amber-500",
      dificultad: "Medio", 
      edad: "6+"
    },
    {
      id: "memory-avanzado",
      nombre: "🧠 Memory Avanzado",
      descripcion: "20 pares con sistema de puntos mejorado",
      icono: "🧠",
      color: "from-indigo-500 to-purple-600",
      dificultad: "Desafiante",
      edad: "8+"
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
    cargarRankingsJuegos2();
  }, []);

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
            🎮 Juegos 2.0 
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-light">
            Juegos completamente nuevos con ranking en tiempo real
          </p>
          
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
              {juegos2.map((juego) => (
                <div
                  key={juego.id}
                  className={`bg-gradient-to-br ${juego.color} rounded-2xl p-6 text-white text-center shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                  onClick={() => iniciarJuego(juego.id)}
                >
                  <div className="text-5xl mb-4">{juego.icono}</div>
                  <h3 className="text-xl font-bold mb-2">{juego.nombre}</h3>
                  <p className="text-white/90 mb-3">{juego.descripcion}</p>
                  <div className="flex justify-center gap-2 mb-2">
                    <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                      {juego.dificultad}
                    </div>
                    <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                      Edad: {juego.edad}
                    </div>
                  </div>
                  <div className="mt-2 bg-white/30 rounded-full px-3 py-1 text-sm">
                    Mejor: {rankingGlobal[juego.id]?.[usuarioActual.id]?.puntuacion || 0} pts
                  </div>
                </div>
              ))}
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
    />
            )}
            {juegoActivo === "simon-dice" && (
              <SimonDice 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos2}
              />
            )}
            {juegoActivo === "carrera-trineo" && (
              <CarreraTrineo 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos2}
              />
            )}
            {juegoActivo === "click-reaccion" && (
              <ClickReaccion 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos2}
              />
            )}
            {juegoActivo === "memory-avanzado" && (
              <MemoryAvanzado 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos2}
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