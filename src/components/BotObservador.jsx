import React, { useState, useEffect } from 'react';

const BotObservador = () => {
  const [visible, setVisible] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [posicion, setPosicion] = useState('bottom-right');
  const [mostrarEstrellas, setMostrarEstrellas] = useState(false);
  const [posicionOjos, setPosicionOjos] = useState({ x: 0, y: 0 });

  // Mensajes inteligentes sobre la plataforma - CON SALUDOS PERSONALIZADOS
  const mensajes = [
    "👀 Veo que van {nominaciones} nominaciones en los GOBA Awards... interesante",
    "🎮 {usuario} va liderando los challenges con {puntos} puntos",
    "📅 ¡Faltan {diasNavidad} días para Navidad! ¿Ya están listos?",
    "🗳️ La categoría más reñida tiene {maxNominaciones} nominaciones",
    "🎄 {usuarioReciente} acaba de unirse a la fiesta familiar",
    "🏆 ¿Ya nominaste en todas las categorías? Hay {categoriasPendientes} por completar",
    "📸 La galería tiene {fotos} fotos llenas de recuerdos",
    "⏰ {eventoProximo} está a la vuelta de la esquina",
    "😂 Veo que {categoriaDivertida} es la categoría más votada",
    "❤️ La familia lleva {totalReacciones} reacciones en las fotos",
    "🛠️ Soy el duende ayudante de Santa... observando que todo funcione bien!",
    "🎁 ¿Listos para la Gran Gala del {fechaGala}?",
    "✨ La magia navideña está en cada rincón de la plataforma",
    "🧝 ¡Los duendes estamos trabajando en los premios!",
    "🌟 Que la alegría navideña llene sus corazones",
    "🎵 Escucho villancicos desde el taller de Santa...",
    "💤 {usuarioInactivo} lleva {diasInactivo} días sin visitarnos... ¡lo extrañamos!",
    "🎵 Ande, ande, ande la Marimorena...",
    "❤️ Veo mucho amor por este lugar!  Ay el AMOR",
    "❤️ Dicen que estuvo buena la Boda de Andres y Valeria", 
    "🎵 Otro año más se ha ido...",
    "🎁 Dicen que hay idas a la colocha de premio",
    "❤️ Aja y hay boda el otro año?...",
    "🎵 Arre borreguito, arre burro arre...",
    "🎵 Feliz Navidad a todos y año nuevo también...",
    "🌟 Que Jesus nazca en sus corazones",
    "❤️ Ganitas de una peli navideña...",
    "❤️ AMOR Ay el AMOR...",
    "👋 ¡Hola {usuarioActual}! ¡Qué bueno verte por aquí! 🎄",
    "🎅 ¡Hey {usuarioActual}! ¿Cómo va tu espíritu navideño?",
    "🌟 ¡{usuarioActual}! ¡La plataforma está más brillante con tu presencia!",
    "❄️ ¡Hola {usuarioActual}! ¿Listo para más diversión navideña?",
    "🎁 ¡{usuarioActual}! ¡Los regalos de la Gala se acercan!",
    "🦌 ¡Holaaa {usuarioActual}! Los renos te mandan saludos 🦌",
    "🍪 ¡{usuarioActual}! ¿Ya probaste las galletas virtuales? ¡Están deliciosas!",
    "🎄 ¡Hola {usuarioActual}! ¡Tu energía navideña se siente desde el Polo Norte!"
  ];

  // FUNCIÓN NUEVA: Obtener usuario más inactivo
  const obtenerUsuarioInactivo = () => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const sesiones = JSON.parse(localStorage.getItem('sesionesUsuarios') || '{}');
    
    let usuarioInactivo = 'Alguien de la familia';
    let diasInactivo = 0;

    usuarios.forEach(usuario => {
      const ultimaSesion = sesiones[usuario.nombre];
      if (ultimaSesion) {
        const dias = Math.floor((new Date() - new Date(ultimaSesion)) / (1000 * 60 * 60 * 24));
        if (dias > diasInactivo) {
          diasInactivo = dias;
          usuarioInactivo = usuario.nombre;
        }
      } else {
        // Si nunca ha iniciado sesión, considerar como muy inactivo
        if (diasInactivo === 0) {
          diasInactivo = 30; // Un mes aproximado
          usuarioInactivo = usuario.nombre;
        }
      }
    });

    return { usuarioInactivo, diasInactivo };
  };

  // Datos en tiempo real de la plataforma - ACTUALIZADA CON USUARIO ACTUAL
  const obtenerDatosPlataforma = () => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const nominaciones = JSON.parse(localStorage.getItem('nominacionesGOBA') || '{}');
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || 'null');
    
    const totalNominaciones = Object.values(nominaciones).reduce((total, noms) => total + noms.length, 0);
    const usuarioLider = usuarios.sort((a, b) => (b.puntos || 0) - (a.puntos || 0))[0];
    
    // Calcular días hasta navidad
    const hoy = new Date();
    const navidad = new Date(hoy.getFullYear(), 11, 25);
    const diasNavidad = Math.ceil((navidad - hoy) / (1000 * 60 * 60 * 24));
    
    // Encontrar categoría con más nominaciones
    let maxNominaciones = 0;
    Object.values(nominaciones).forEach(noms => {
      if (noms.length > maxNominaciones) maxNominaciones = noms.length;
    });

    // OBTENER DATOS DE INACTIVIDAD
    const datosInactivo = obtenerUsuarioInactivo();

    return {
      nominaciones: totalNominaciones,
      usuario: usuarioLider?.nombre || 'Alguien',
      puntos: usuarioLider?.puntos || 0,
      diasNavidad: diasNavidad > 0 ? diasNavidad : 0,
      maxNominaciones,
      usuarioReciente: usuarios[usuarios.length - 1]?.nombre || 'Un nuevo miembro',
      categoriasPendientes: 25 - (usuarioActual ? Object.keys(nominaciones).filter(id => 
        nominaciones[id]?.some(n => n.nominador === usuarioActual.nombre)
      ).length : 0),
      fotos: 6, // Por ahora fijo
      eventoProximo: "el cierre de votaciones",
      categoriaDivertida: "el más dormilón",
      totalReacciones: 87, // Ejemplo
      fechaGala: "28 de Diciembre",
      // NUEVOS DATOS PARA EL MENSAJE DE INACTIVIDAD
      usuarioInactivo: datosInactivo.usuarioInactivo,
      diasInactivo: datosInactivo.diasInactivo,
      // NUEVO: Usuario actual para saludos personalizados
      usuarioActual: usuarioActual?.nombre || 'amigo'
    };
  };

  const generarMensaje = () => {
    const datos = obtenerDatosPlataforma();
    
    // 30% de probabilidad de que sea un saludo personalizado si hay usuario logueado
    const usuarioLogueado = datos.usuarioActual !== 'amigo';
    let mensajeAleatorio;
    
    if (usuarioLogueado && Math.random() < 0.3) {
      // Filtrar solo mensajes de saludo personalizado
      const mensajesSaludo = mensajes.filter(msg => msg.includes('{usuarioActual}'));
      mensajeAleatorio = mensajesSaludo[Math.floor(Math.random() * mensajesSaludo.length)];
    } else {
      // Mensaje normal (excluyendo algunos saludos para variedad)
      const mensajesNormales = mensajes.filter(msg => !msg.includes('¡Hola {usuarioActual}') && !msg.includes('¡Hey {usuarioActual}'));
      mensajeAleatorio = mensajesNormales[Math.floor(Math.random() * mensajesNormales.length)];
    }
    
    // Reemplazar variables en el mensaje
    mensajeAleatorio = mensajeAleatorio.replace(/{(\w+)}/g, (match, key) => {
      return datos[key] !== undefined ? datos[key] : match;
    });
    
    return mensajeAleatorio;
  };

  // Función para mover los ojos
  const moverOjos = (e) => {
    if (!visible) return;
    
    const botElement = document.querySelector('.estrella-container');
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

  const aparecerConEstrellas = () => {
    setMensaje(generarMensaje());
    
    // Posición aleatoria
    const posiciones = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    setPosicion(posiciones[Math.floor(Math.random() * posiciones.length)]);
    
    // Resetear posición de ojos
    setPosicionOjos({ x: 0, y: 0 });
    
    // Mostrar efecto de estrellas primero
    setMostrarEstrellas(true);
    
    // Mostrar estrella después de breve delay
    setTimeout(() => {
      setVisible(true);
    }, 300);
    
    // AUTO-OCULTAR DESPUÉS DE 10 SEGUNDOS (AJUSTADO)
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setMostrarEstrellas(false);
      }, 1000);
    }, 10000); // 10 segundos
  };

  const ocultarBot = () => {
    setVisible(false);
    setTimeout(() => {
      setMostrarEstrellas(false);
    }, 1000);
  };

  useEffect(() => {
    // Aparecer aleatoriamente cada 2-5 minutos
    const intervalo = setInterval(() => {
      if (Math.random() > 0.6) { // 40% de probabilidad
        aparecerConEstrellas();
      }
    }, 120000); // Revisar cada 2 minutos

    // Agregar event listener para mover ojos
    document.addEventListener('mousemove', moverOjos);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener('mousemove', moverOjos);
    };
  }, [visible]);

  const posicionesCSS = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4', 
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Generar estrellas aleatorias
  const generarEstrellas = () => {
    return [...Array(12)].map((_, i) => {
      const size = 8 + Math.random() * 16;
      const duration = 1 + Math.random() * 2;
      const delay = Math.random() * 1.5;
      
      return (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            animation: `estrellaExplosion ${duration}s ease-out ${delay}s forwards`,
            background: 'gold',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))',
            opacity: 0,
            transform: 'scale(0)'
          }}
        />
      );
    });
  };

  return (
    <>
      {/* Efecto de estrellas */}
      {mostrarEstrellas && (
        <div 
          className={`fixed ${posicionesCSS[posicion]} z-40 pointer-events-none`}
          style={{ width: '200px', height: '200px', marginLeft: '-100px', marginTop: '-100px' }}
        >
          {generarEstrellas()}
        </div>
      )}

      {/* Estrella con ojos */}
      {visible && (
        <div className={`fixed ${posicionesCSS[posicion]} z-50 transition-all duration-500 estrella-container`}>
          {/* Burbuja de mensaje */}
          <div 
            className="bg-white rounded-2xl p-4 shadow-2xl border-2 border-yellow-400 max-w-xs mb-3 transform transition-transform duration-300 hover:scale-105 cursor-pointer"
            onClick={ocultarBot}
          >
            <p className="text-sm text-gray-800 font-medium">{mensaje}</p>
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-r-2 border-b-2 border-yellow-400 transform rotate-45"></div>
          </div>
          
          {/* Estrella con ojos animados - CLICK PARA CERRAR */}
          <div 
            className="w-16 h-16 relative cursor-pointer transform transition-transform duration-300 hover:scale-110 hover:rotate-12 estrella-container"
            onClick={ocultarBot}
          >
            {/* Cuerpo de la estrella */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-2xl border-4 border-yellow-600">
              {/* Efecto brillante */}
              <div className="absolute inset-0 rounded-full bg-yellow-200 opacity-30 animate-pulse"></div>
            </div>
            
            {/* Forma de estrella */}
            <div 
              className="absolute inset-0 bg-yellow-400"
              style={{
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
              }}
            ></div>
            
            {/* Ojos que siguen el cursor */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-3">
              {/* Ojo izquierdo */}
              <div className="relative w-4 h-4 bg-white rounded-full overflow-hidden">
                <div 
                  className="absolute w-2 h-2 bg-black rounded-full transition-all duration-150"
                  style={{
                    transform: `translate(${posicionOjos.x}px, ${posicionOjos.y}px)`
                  }}
                ></div>
              </div>
              
              {/* Ojo derecho */}
              <div className="relative w-4 h-4 bg-white rounded-full overflow-hidden">
                <div 
                  className="absolute w-2 h-2 bg-black rounded-full transition-all duration-150"
                  style={{
                    transform: `translate(${posicionOjos.x}px, ${posicionOjos.y}px)`
                  }}
                ></div>
              </div>
            </div>
            
            {/* Sonrisa */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-black rounded-full opacity-80"></div>
            
            {/* Mejillas sonrojadas */}
            <div className="absolute bottom-3 left-2 w-3 h-2 bg-pink-300 rounded-full opacity-60"></div>
            <div className="absolute bottom-3 right-2 w-3 h-2 bg-pink-300 rounded-full opacity-60"></div>
            
            {/* Efecto de brillo adicional */}
            <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping" style={{ animationDuration: '3s' }}></div>
          </div>
        </div>
      )}

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes estrellaExplosion {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes animacionEstrella {
          0% {
            transform: scale(0) rotate(-180deg);
          }
          70% {
            transform: scale(1.1) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        
        @keyframes brilloEstrella {
          0%, 100% { 
            filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
          }
          50% { 
            filter: drop-shadow(0 0 16px rgba(255, 215, 0, 0.9)) brightness(1.2);
          }
        }
        
        /* Aplicar animación de entrada a la estrella */
        .fixed.bottom-4.right-4 > div:last-child,
        .fixed.bottom-4.left-4 > div:last-child,
        .fixed.top-4.right-4 > div:last-child,
        .fixed.top-4.left-4 > div:last-child {
          animation: animacionEstrella 0.6s ease-out, brilloEstrella 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default BotObservador;