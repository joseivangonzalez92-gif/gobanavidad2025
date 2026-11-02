// components/BotObservador.jsx - VERSIÓN CON FRANJAS HORARIAS
import React, { useState, useEffect } from 'react';
import { gobaService } from '../services/firebaseService.jsx';
import { useLocation } from 'react-router-dom';

const BotObservador = () => {
  const [visible, setVisible] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [posicion, setPosicion] = useState('bottom-right');
  const [mostrarEstrellas, setMostrarEstrellas] = useState(false);
  const [posicionOjos, setPosicionOjos] = useState({ x: 0, y: 0 });
  const [lluviaActiva, setLluviaActiva] = useState(false);
  const [estrellasLluvia, setEstrellasLluvia] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const location = useLocation();

  // 🎯 SISTEMA DE FRANJAS HORARIAS
  const [puntosFranjas, setPuntosFranjas] = useState({
    manana: 15,    // 6AM-12PM (30%)
    tarde: 15,     // 12PM-6PM (30%)
    noche: 20      // 6PM-12AM (40% base)
  });

  const [ultimaActualizacion, setUltimaActualizacion] = useState('');

  // 🚫 RUTAS DONDE NO DEBE APARECER
  const rutasProhibidas = [
    '/juegos',
    '/concurso-rapido', 
    '/admin'
  ];

  // ✅ RUTAS DONDE SÍ PUEDE APARECER
  const rutasPermitidas = [
    '/home',
    '/calendario',
    '/challenges',
    '/fotos', 
    '/votaciones',
    '/navidad',
    '/rankings',
    '/perfil',
    '/'
  ];

  // 🔍 DETECTAR SI PUEDE APARECER
  const puedeAparecer = () => {
    const rutaActual = location.pathname;
    
    if (rutasProhibidas.some(ruta => rutaActual.includes(ruta))) {
      return false;
    }
    
    return rutasPermitidas.some(ruta => rutaActual.includes(ruta));
  };

  // 🕒 SISTEMA DE FRANJAS HORARIAS
  const obtenerFranjaActual = () => {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) return 'manana';
    if (hora >= 12 && hora < 18) return 'tarde';
    return 'noche';
  };

  const obtenerProximaFranja = () => {
    const hora = new Date().getHours();
    if (hora < 6) return '6:00 AM';
    if (hora < 12) return '12:00 PM';
    if (hora < 18) return '6:00 PM';
    return '6:00 AM (mañana)';
  };

  const obtenerPuntosDisponibles = () => {
    const franja = obtenerFranjaActual();
    return puntosFranjas[franja];
  };

  const obtenerNombreFranja = () => {
    const franja = obtenerFranjaActual();
    const nombres = {
      manana: 'mañana (6AM-12PM)',
      tarde: 'tarde (12PM-6PM)', 
      noche: 'noche (6PM-12AM)'
    };
    return nombres[franja];
  };

  // 🔄 RESET DIARIO Y ROLLOVER
  const inicializarFranjasDelDia = () => {
    const hoy = new Date().toDateString();
    const almacenado = localStorage.getItem(`franjas_${hoy}`);
    
    if (almacenado) {
      const datos = JSON.parse(almacenado);
      setPuntosFranjas(datos.puntosFranjas);
      setUltimaActualizacion(datos.ultimaActualizacion);
    } else {
      // Nuevo día - reset con rollover
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const datosAyer = localStorage.getItem(`franjas_${ayer.toDateString()}`);
      
      let puntosBase = { manana: 15, tarde: 15, noche: 20 };
      
      if (datosAyer) {
        const { puntosFranjas: puntosAyer } = JSON.parse(datosAyer);
        const sobranteTotal = puntosAyer.manana + puntosAyer.tarde + puntosAyer.noche;
        if (sobranteTotal > 0) {
          puntosBase.noche += sobranteTotal;
        }
      }
      
      setPuntosFranjas(puntosBase);
      guardarEstadoFranjas(puntosBase);
    }
  };

  const guardarEstadoFranjas = (nuevosPuntos) => {
    const hoy = new Date().toDateString();
    const datos = {
      puntosFranjas: nuevosPuntos,
      ultimaActualizacion: new Date().toISOString()
    };
    localStorage.setItem(`franjas_${hoy}`, JSON.stringify(datos));
  };

  // Cargar puntos del usuario
  useEffect(() => {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || 'null');
    if (usuarioActual) {
      setPuntos(usuarioActual.puntos || 0);
    }
    inicializarFranjasDelDia();
  }, []);

  // Mensajes inteligentes con info de franjas
  const mensajes = [
    "👀 Veo que van {nominaciones} nominaciones en los GOBA Awards...",
    "🎮 {usuario} va liderando los challenges con {puntos} puntos",
    "📅 ¡Faltan {diasNavidad} días para Navidad!",
    "🎄 {usuarioReciente} acaba de unirse a la fiesta familiar",
    "🏆 ¿Ya nominaste en todas las categorías?",
    "⭐ ¡Atrapa las estrellas para ganar puntos!",
    "🎁 ¡Cada estrella vale puntos para la tienda!",
    "✨ ¡Mira! ¡Está lloviendo magia navideña!",
    "🏆 Llevas {puntosUsuario} puntos - ¡Sigue así!",
    "🌟 {usuarioActual} está en racha - ¡{puntosUsuario} puntos!",
    "🕒 Franja {franjaActual}: {puntosDisponibles} pts disponibles",
    "⚡ ¡{puntosDisponibles} puntos disponibles esta {franjaActual}!",
    "🎯 ¡No te quedes sin puntos! {puntosDisponibles} disponibles ahora",
    "💫 ¡Corre! Solo {puntosDisponibles} pts en franja {franjaActual}"
  ];

  // Datos en tiempo real
  const obtenerDatosPlataforma = () => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const nominaciones = JSON.parse(localStorage.getItem('nominacionesGOBA') || '{}');
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || 'null');
    
    const totalNominaciones = Object.values(nominaciones).reduce((total, noms) => total + noms.length, 0);
    const usuarioLider = usuarios.sort((a, b) => (b.puntos || 0) - (a.puntos || 0))[0];
    
    const hoy = new Date();
    const navidad = new Date(hoy.getFullYear(), 11, 25);
    const diasNavidad = Math.ceil((navidad - hoy) / (1000 * 60 * 60 * 24));
    
    return {
      nominaciones: totalNominaciones,
      usuario: usuarioLider?.nombre || 'Alguien',
      puntos: usuarioLider?.puntos || 0,
      diasNavidad: diasNavidad > 0 ? diasNavidad : 0,
      usuarioReciente: usuarios[usuarios.length - 1]?.nombre || 'Un nuevo miembro',
      categoriasPendientes: 25 - (usuarioActual ? Object.keys(nominaciones).filter(id => 
        nominaciones[id]?.some(n => n.nominador === usuarioActual.nombre)
      ).length : 0),
      fotos: 6,
      totalReacciones: 87,
      fechaGala: "31 de Diciembre",
      usuarioActual: usuarioActual?.nombre || 'amigo',
      puntosUsuario: puntos,
      franjaActual: obtenerNombreFranja(),
      puntosDisponibles: obtenerPuntosDisponibles()
    };
  };

  const generarMensaje = () => {
    const datos = obtenerDatosPlataforma();
    
    // Priorizar mensajes sobre puntos disponibles
    const puntosDisponibles = obtenerPuntosDisponibles();
    if (puntosDisponibles > 0 && Math.random() < 0.6) {
      const mensajesPuntos = mensajes.filter(msg => 
        msg.includes('puntosDisponibles') || msg.includes('franjaActual')
      );
      if (mensajesPuntos.length > 0) {
        let mensajeAleatorio = mensajesPuntos[Math.floor(Math.random() * mensajesPuntos.length)];
        return mensajeAleatorio.replace(/{(\w+)}/g, (match, key) => {
          return datos[key] !== undefined ? datos[key] : match;
        });
      }
    }
    
    const mensajeAleatorio = mensajes[Math.floor(Math.random() * mensajes.length)];
    return mensajeAleatorio.replace(/{(\w+)}/g, (match, key) => {
      return datos[key] !== undefined ? datos[key] : match;
    });
  };

  // Función para mover los ojos
  const moverOjos = (e) => {
    if (!visible) return;
    
    const botElement = document.querySelector('.arbolito-container');
    if (botElement) {
      const rect = botElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const distance = Math.min(4, Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)) / 50);
      
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      setPosicionOjos({ x, y });
    }
  };

  // ⭐ SISTEMA DE LLAVIA DE ESTRELLAS - VERSIÓN LENTA CON FRANJAS
  const iniciarLluviaEstrellas = () => {
    if (lluviaActiva || !puedeAparecer()) return;
    
    const puntosDisponibles = obtenerPuntosDisponibles();
    if (puntosDisponibles <= 0) {
      setMensaje(`¡Puntos agotados en franja ${obtenerNombreFranja()}! Siguiente: ${obtenerProximaFranja()} 🕒`);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
      return;
    }
    
    setLluviaActiva(true);
    setMensaje(`¡Lluvia de estrellas! ${puntosDisponibles} pts disponibles 🎁`);
    setVisible(true);
    
    // Crear estrellas - MÁS LENTAS Y DURADERAS
    const nuevasEstrellas = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      top: -10,
      left: Math.random() * 100,
      size: 25 + Math.random() * 25,
      velocidad: 0.5 + Math.random() * 0.5, // ✅ MÁS LENTAS
      tipo: Math.random() > 0.8 ? 'especial' : 'normal',
      capturada: false
    }));
    
    setEstrellasLluvia(nuevasEstrellas);
    
    // Duración: 20 segundos (más tiempo)
    setTimeout(() => {
      setLluviaActiva(false);
      setEstrellasLluvia([]);
      setVisible(false);
    }, 20000);
  };

  // Capturar estrella - CON SISTEMA DE FRANJAS
  const capturarEstrella = async (estrellaId) => {
    if (!lluviaActiva) return;
    
    const franja = obtenerFranjaActual();
    const puntosDisponibles = puntosFranjas[franja];
    
    if (puntosDisponibles <= 0) {
      setMensaje(`¡Puntos agotados! Siguiente franja: ${obtenerProximaFranja()} ⏳`);
      return;
    }
    
    setEstrellasLluvia(prev => 
      prev.map(est => 
        est.id === estrellaId ? { ...est, capturada: true } : est
      )
    );
    
    // Calcular puntos ganados
    const estrella = estrellasLluvia.find(e => e.id === estrellaId);
    const puntosGanados = estrella.tipo === 'especial' ? 3 : 1;
    const puntosFinales = Math.min(puntosGanados, puntosDisponibles);

    // Actualizar franja
    const nuevosPuntosFranjas = {
      ...puntosFranjas,
      [franja]: puntosFranjas[franja] - puntosFinales
    };
    
    setPuntosFranjas(nuevosPuntosFranjas);
    guardarEstadoFranjas(nuevosPuntosFranjas);

    // ✅ USAR SERVICIO DE PUNTOS
    try {
      const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || 'null');
      if (usuarioActual && usuarioActual.id) {
        await gobaService.puntosService.ganarPuntos(usuarioActual.id, puntosFinales, 'estrella');
        
        // Actualizar estado local
        setPuntos(prev => {
          const nuevosPuntos = prev + puntosFinales;
          usuarioActual.puntos = (usuarioActual.puntos || 0) + puntosFinales;
          localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
          return nuevosPuntos;
        });
        
        // Mensaje de éxito
        setMensaje(`¡+${puntosFinales} pts! ${estrella.tipo === 'especial' ? '⭐ Especial!' : ''} Quedan ${nuevosPuntosFranjas[franja]} pts`);
      }
    } catch (error) {
      console.error('Error guardando puntos:', error);
    }
  };

  // Animación de la lluvia de estrellas
  useEffect(() => {
    if (!lluviaActiva) return;
    
    const animarLluvia = () => {
      setEstrellasLluvia(prev => 
        prev.map(est => ({
          ...est,
          top: est.capturada ? est.top : est.top + est.velocidad
        })).filter(est => !est.capturada && est.top < 100)
      );
    };
    
    const intervalo = setInterval(animarLluvia, 50);
    return () => clearInterval(intervalo);
  }, [lluviaActiva]);

  // 🎯 LÓGICA PRINCIPAL DE APARICIÓN
  useEffect(() => {
    if (!puedeAparecer()) {
      setVisible(false);
      setLluviaActiva(false);
      return;
    }

    document.addEventListener('mousemove', moverOjos);

    // ✅ 60% probabilidad cada 2 minutos
    const intervalo = setInterval(() => {
      if (!visible && Math.random() < 0.6) {
        const puntosDisponibles = obtenerPuntosDisponibles();
        
        if (puntosDisponibles <= 0) {
          // Mostrar mensaje de puntos agotados
          setMensaje(`¡Puntos agotados! Siguiente franja: ${obtenerProximaFranja()} 🕒`);
          setPosicion(['bottom-right', 'bottom-left', 'top-right', 'top-left'][Math.floor(Math.random() * 4)]);
          setVisible(true);
          setTimeout(() => setVisible(false), 5000);
          return;
        }

        // 50% info, 50% estrellas
        if (Math.random() > 0.5) {
          setMensaje(generarMensaje());
          setPosicion(['bottom-right', 'bottom-left', 'top-right', 'top-left'][Math.floor(Math.random() * 4)]);
          setVisible(true);
          setTimeout(() => setVisible(false), 8000);
        } else {
          iniciarLluviaEstrellas();
        }
      }
    }, 120000); // 2 minutos

    return () => {
      clearInterval(intervalo);
      document.removeEventListener('mousemove', moverOjos);
    };
  }, [visible, location.pathname, puntosFranjas]);

  const ocultarBot = () => {
    setVisible(false);
    setLluviaActiva(false);
  };

  const posicionesCSS = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4', 
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Generar estrellas para efectos
  const generarEstrellas = () => {
    return [...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute pointer-events-none"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${8 + Math.random() * 12}px`,
          height: `${8 + Math.random() * 12}px`,
          animation: `estrellaExplosion ${1 + Math.random() * 2}s ease-out ${Math.random() * 1.5}s forwards`,
          background: 'gold',
          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))',
          opacity: 0,
          transform: 'scale(0)'
        }}
      />
    ));
  };

  return (
    <>
      {/* Lluvia de estrellas interactiva */}
      {lluviaActiva && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {estrellasLluvia.map(estrella => (
            <div
              key={estrella.id}
              className={`absolute cursor-pointer transition-all duration-200 ${
                estrella.capturada ? 'pointer-events-none opacity-0 scale-0' : 'pointer-events-auto hover:scale-125'
              }`}
              style={{
                top: `${estrella.top}%`,
                left: `${estrella.left}%`,
                width: `${estrella.size}px`,
                height: `${estrella.size}px`,
                transition: estrella.capturada ? 'all 0.3s ease-out' : 'transform 0.2s ease',
                filter: estrella.tipo === 'especial' 
                  ? 'drop-shadow(0 0 10px gold)' 
                  : 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))'
              }}
              onClick={() => !estrella.capturada && capturarEstrella(estrella.id)}
            >
              <div
                className={`w-full h-full ${
  estrella.tipo === 'especial' 
    ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 animate-pulse' 
    : 'bg-gradient-to-br from-yellow-300 to-yellow-500'
}`}
                style={{
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  animation: 'flotarEstrella 3s ease-in-out infinite' // ✅ MÁS LENTO
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Efecto de estrellas de entrada */}
      {mostrarEstrellas && !lluviaActiva && (
        <div 
          className={`fixed ${posicionesCSS[posicion]} z-40 pointer-events-none`}
          style={{ width: '200px', height: '200px', marginLeft: '-100px', marginTop: '-100px' }}
        >
          {generarEstrellas()}
        </div>
      )}
{/* Bot principal - ÁRBOLITO BAILARÍN PERFECCIONADO */}
{visible && (
  <div className={`fixed ${posicionesCSS[posicion]} z-50 transition-all duration-500 arbolito-container`}>
    {/* Burbuja de mensaje */}
    <div 
      className="bg-white rounded-2xl p-4 shadow-2xl border-2 border-green-400 max-w-xs mb-3 transform transition-transform duration-300 hover:scale-105 cursor-pointer"
      onClick={ocultarBot}
    >
      <p className="text-sm text-gray-800 font-medium">{mensaje}</p>
      <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-r-2 border-b-2 border-green-400 transform rotate-45"></div>
    </div>
    
    {/* Árbolito de Navidad perfeccionado */}
    <div 
      className="w-16 h-20 relative cursor-pointer transform transition-transform duration-300 hover:scale-110 hover:rotate-6 arbolito-container"
      onClick={ocultarBot}
    >
      {/* Base del árbol más ancha */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-yellow-900 rounded-full"></div>
      
      {/* Cuerpo del árbol con mejor proporción */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        {/* Capas del árbol mejor distribuidas */}
        <div className="w-10 h-3 bg-green-600 rounded-full mb-1 animate-bounce shadow-lg" style={{ animationDelay: '0s' }}></div>
        <div className="w-12 h-4 bg-green-700 rounded-full mb-1 animate-bounce shadow-lg" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-14 h-5 bg-green-800 rounded-full mb-1 animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
        
        {/* Efecto de brillo mejorado */}
        <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-pulse" style={{ animationDuration: '3s' }}></div>
        
        {/* Decoraciones mejor posicionadas */}
        <div className="absolute top-1 left-5 w-2 h-2 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-6 left-6 w-2 h-2 bg-yellow-500 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Estrella CENTRADA en la punta */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="text-yellow-300 text-2xl animate-bounce filter drop-shadow(0 0 8px gold)">
            ⭐
          </div>
        </div>
      </div>
      
      {/* Ojos que siguen el cursor - reposicionados */}
      <div className="absolute top-7 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2">
        <div className="relative w-2 h-2 bg-white rounded-full overflow-hidden">
          <div 
            className="absolute w-1 h-1 bg-black rounded-full transition-all duration-150"
            style={{
              transform: `translate(${posicionOjos.x}px, ${posicionOjos.y}px)`
            }}
          ></div>
        </div>
        <div className="relative w-2 h-2 bg-white rounded-full overflow-hidden">
          <div 
            className="absolute w-1 h-1 bg-black rounded-full transition-all duration-150"
            style={{
              transform: `translate(${posicionOjos.x}px, ${posicionOjos.y}px)`
            }}
          ></div>
        </div>
      </div>
      
      {/* Sonrisa reposicionada */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-black rounded-full opacity-80"></div>
    </div>
  </div>
)}

{/* Estilos CSS para animaciones */}
<style jsx>{`
  @keyframes flotarEstrella {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-5px) rotate(5deg); }
  }
  
  @keyframes estrellaExplosion {
    0% { transform: scale(0) rotate(0deg); opacity: 0; }
    50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
    100% { transform: scale(1) rotate(360deg); opacity: 0; }
  }
  
  @keyframes animacionArbolito {
    0% { transform: scale(0) rotate(-10deg); }
    70% { transform: scale(1.1) rotate(5deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
  
  @keyframes brilloArbolito {
    0%, 100% { filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6)); }
    50% { filter: drop-shadow(0 0 16px rgba(34, 197, 94, 0.9)) brightness(1.2); }
  }
  
  .fixed.bottom-4.right-4 > div:last-child,
  .fixed.bottom-4.left-4 > div:last-child,
  .fixed.top-4.right-4 > div:last-child,
  .fixed.top-4.left-4 > div:last-child {
    animation: animacionArbolito 0.6s ease-out, brilloArbolito 2s ease-in-out infinite;
  }
`}</style>
     
    </>
  );
};

export default BotObservador;