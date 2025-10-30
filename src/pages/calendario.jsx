import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gobaService } from '../services/firebaseService';

export default function Calendario() {
  const navigate = useNavigate();
  const [mesActual, setMesActual] = useState(11);
  const [añoActual, setAñoActual] = useState(2025);
  const [countdownGOBA, setCountdownGOBA] = useState("");
  const [countdownRetos, setCountdownRetos] = useState("");
  const [countdownProximaActividad, setCountdownProximaActividad] = useState("");
  const [numeroSemanaRetos, setNumeroSemanaRetos] = useState(1);
  const [eventosFamiliares, setEventosFamiliares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState({});
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Fases GOBA Awards
  const fasesGOBA = [
    { 
      nombre: "Nominaciones", 
      fechaFin: "2025-12-10T23:59:59-06:00",
      activa: true,
      siguiente: "Votaciones"
    },
    { 
      nombre: "Votaciones", 
      fechaFin: "2025-12-22T23:59:59-06:00", 
      activa: false,
      siguiente: "Premiación"
    },
    { 
      nombre: "Premiación", 
      fechaFin: "2025-12-31T20:00:00-06:00",
      activa: false,
      siguiente: "Finalizado"
    }
  ];

  // Fechas de cierre de retos por semana (domingos a las 6:00 PM)
  const fechasRetos = [
    "2025-11-09T18:00:00-06:00", // Semana 1
    "2025-11-16T18:00:00-06:00", // Semana 2
    "2025-11-23T18:00:00-06:00", // Semana 3
    "2025-11-30T18:00:00-06:00", // Semana 4
    "2025-12-07T18:00:00-06:00", // Semana 5
    "2025-12-14T18:00:00-06:00", // Semana 6
    "2025-12-21T18:00:00-06:00", // Semana 7
    "2025-12-28T18:00:00-06:00"  // Semana 8
  ];

  // 🔧 FUNCIÓN CORREGIDA: Formatear fecha en hora de Honduras
  const formatearFechaHonduras = (fechaStr) => {
    const fecha = new Date(fechaStr + 'T06:00:00-06:00');
    return fecha.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long' 
    });
  };

  // 🔧 FUNCIÓN CORREGIDA: Para countdowns (mantiene la hora específica)
  const formatearFechaParaCountdown = (fechaStr, hora = "19:00:00") => {
    return new Date(fechaStr + `T${hora}-06:00`);
  };

  // Mostrar tooltip al hacer hover
  const mostrarTooltip = (event, diaInfo) => {
    if (!diaInfo || !diaInfo.evento) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    
    setTooltipContent({
      titulo: diaInfo.evento.titulo,
      descripcion: diaInfo.evento.descripcion,
      fecha: formatearFechaHonduras(diaInfo.fecha),
      icono: diaInfo.evento.icono
    });
    
    setTooltipVisible(true);
  };

  // Ocultar tooltip
  const ocultarTooltip = () => {
    setTooltipVisible(false);
  };

  // Verificar y preparar usuario actual
  const prepararUsuarioActual = (usuarioRaw) => {
    console.log("👤 [CALENDARIO] Preparando usuario...");
    
    if (!usuarioRaw) {
      console.log("❌ [CALENDARIO] No hay usuario en localStorage");
      navigate("/login");
      return null;
    }
    
    let usuario;
    try {
      usuario = JSON.parse(usuarioRaw);
      console.log("✅ [CALENDARIO] Usuario parseado:", usuario);
    } catch (error) {
      console.error("❌ [CALENDARIO] Error parseando usuario:", error);
      navigate("/login");
      return null;
    }
    
    if (!usuario.id) {
      console.error("❌ [CALENDARIO] Usuario sin ID válido:", usuario);
      alert("Error: Tu usuario no tiene identificación válida. Contacta al administrador.");
      navigate("/login");
      return null;
    }

    if (!usuario.nombre || !usuario.codigoSecreto) {
      console.error("❌ [CALENDARIO] Usuario no aprobado o datos incompletos:", usuario);
      alert("Error: Tu usuario no está completamente configurado. Contacta al administrador.");
      navigate("/login");
      return null;
    }

    console.log("✅ [CALENDARIO] Usuario válido:", usuario.nombre);
    return usuario;
  };

  // Cargar eventos desde Firebase - VERSIÓN MEJORADA CON DEBUG
  const cargarEventos = async () => {
    try {
      console.log("🔍 [CALENDARIO] Intentando cargar eventos desde Firebase...");
      
      const eventos = await gobaService.obtenerTodosEventos();
      console.log("✅ [CALENDARIO] Eventos cargados:", eventos);
      console.log("📊 [CALENDARIO] Número de eventos:", eventos.length);
      
      if (!eventos || eventos.length === 0) {
        console.warn("⚠️ [CALENDARIO] No se encontraron eventos en Firebase");
        console.log("🔄 [CALENDARIO] Usando eventos por defecto...");
        
        const eventosPorDefecto = [
          { fecha: "2025-11-12", titulo: "🎂 Cumpleaños de Reny", descripcion: "¡Felicidades Reny!", icono: "🎂" },
          { fecha: "2025-11-29", titulo: "🎂 Cumpleaños de Isabella", descripcion: "¡Felicidades Isabella!", icono: "🎂" },
          { fecha: "2025-11-30", titulo: "🕯️ 1er Domingo de Adviento", descripcion: "Inicio del tiempo de adviento", icono: "🕯️" },
          { fecha: "2025-12-01", titulo: "🎂 Cumpleaños de Paolo", descripcion: "¡Felicidades Paolo!", icono: "🎂" },
          { fecha: "2025-12-10", titulo: "🎭 Cierre Nominaciones GOBA", descripcion: "Último día para nominar", icono: "🎭" },
          { fecha: "2025-12-22", titulo: "🗳️ Cierre Votaciones GOBA", descripcion: "Último día para votar", icono: "🗳️" },
          { fecha: "2025-12-21", titulo: "🍪 Galletas Navideñas", descripcion: "Día de hornear galletas familiares", icono: "🍪" },
          { fecha: "2025-12-25", titulo: "👶 Navidad", descripcion: "¡Feliz Navidad!", icono: "👶" },
          { fecha: "2025-12-31", titulo: "🏆 Premiación GOBA Awards", descripcion: "Gran gala de premiación", icono: "🏆" }
        ];
        
        setEventosFamiliares(eventosPorDefecto);
        return;
      }
      
      console.log("🎉 [CALENDARIO] Eventos establecidos en estado");
      setEventosFamiliares(eventos);
      
    } catch (error) {
      console.error('❌ [CALENDARIO] Error CRÍTICO cargando eventos:', error);
      console.error('🔍 [CALENDARIO] Detalles del error:', {
        mensaje: error.message,
        stack: error.stack
      });
      
      // Fallback a eventos por defecto
      const eventosPorDefecto = [
        { fecha: "2025-11-12", titulo: "🎂 Cumpleaños de Reny", descripcion: "¡Felicidades Reny!", icono: "🎂" },
        { fecha: "2025-11-29", titulo: "🎂 Cumpleaños de Isabella", descripcion: "¡Felicidades Isabella!", icono: "🎂" },
        { fecha: "2025-11-30", titulo: "🕯️ 1er Domingo de Adviento", descripcion: "Inicio del tiempo de adviento", icono: "🕯️" },
        { fecha: "2025-12-01", titulo: "🎂 Cumpleaños de Paolo", descripcion: "¡Felicidades Paolo!", icono: "🎂" },
        { fecha: "2025-12-10", titulo: "🎭 Cierre Nominaciones GOBA", descripcion: "Último día para nominar", icono: "🎭" },
        { fecha: "2025-12-22", titulo: "🗳️ Cierre Votaciones GOBA", descripcion: "Último día para votar", icono: "🗳️" },
        { fecha: "2025-12-21", titulo: "🍪 Galletas Navideñas", descripcion: "Día de hornear galletas familiares", icono: "🍪" },
        { fecha: "2025-12-25", titulo: "👶 Navidad", descripcion: "¡Feliz Navidad!", icono: "👶" },
        { fecha: "2025-12-31", titulo: "🏆 Premiación GOBA Awards", descripcion: "Gran gala de premiación", icono: "🏆" }
      ];
      setEventosFamiliares(eventosPorDefecto);
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    const initializeCalendario = async () => {
      try {
        console.log("🚀 [CALENDARIO] Inicializando calendario...");
        setLoading(true);
        
        const usuarioRaw = localStorage.getItem('usuarioActual');
        console.log("📝 [CALENDARIO] Usuario en localStorage:", usuarioRaw);
        
        const usuario = prepararUsuarioActual(usuarioRaw);
        
        if (!usuario) {
          console.log("❌ [CALENDARIO] Usuario no válido, saliendo...");
          return;
        }

        console.log("✅ [CALENDARIO] Usuario establecido:", usuario.nombre);
        setUsuarioActual(usuario);
        
        await cargarEventos();

        // Escuchar cambios en tiempo real
        console.log("👂 [CALENDARIO] Configurando listener en tiempo real...");
        const unsubscribeEventos = gobaService.escucharEventos((nuevosEventos) => {
          console.log("🔄 [CALENDARIO] Actualización en tiempo real de eventos:", nuevosEventos);
          console.log("📊 [CALENDARIO] Número de eventos (real-time):", nuevosEventos.length);
          setEventosFamiliares(nuevosEventos);
        });

        return () => {
          console.log("🧹 [CALENDARIO] Limpiando listener...");
          if (unsubscribeEventos) {
            unsubscribeEventos();
          }
        };
      } catch (error) {
        console.error("❌ [CALENDARIO] Error inicializando calendario:", error);
        alert("Error al cargar el calendario. Recarga la página.");
      } finally {
        console.log("✅ [CALENDARIO] Carga completada");
        setLoading(false);
      }
    };

    initializeCalendario();
  }, [navigate]);

  // Calcular número de semana actual y fecha de cierre
  const calcularSemanaRetos = () => {
    const hoy = new Date();
    
    // Encontrar la próxima fecha de reto que no haya pasado
    const proximaFechaReto = fechasRetos.find(fecha => new Date(fecha) > hoy);
    
    if (!proximaFechaReto) {
      return { numeroSemana: 8, fechaCierre: fechasRetos[7] }; // Última semana
    }
    
    const numeroSemana = fechasRetos.indexOf(proximaFechaReto) + 1;
    return { numeroSemana, fechaCierre: proximaFechaReto };
  };

  // Encontrar próxima actividad (7:00 PM del día programado)
  const getProximaActividad = () => {
    const hoy = new Date();
    const actividadesFuturas = eventosFamiliares
      .filter(evento => {
        const fechaEvento = formatearFechaParaCountdown(evento.fecha, "19:00:00");
        return fechaEvento > hoy;
      })
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    return actividadesFuturas.length > 0 ? actividadesFuturas[0] : null;
  };

  // Countdown formateado
  const calcularCountdown = (fechaObjetivo) => {
    const hoy = new Date();
    const objetivo = new Date(fechaObjetivo);
    const diferencia = objetivo - hoy;
    
    if (diferencia <= 0) return "¡Finalizado!";
    
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
    
    if (dias > 0) return `${dias}d ${horas}h`;
    if (horas > 0) return `${horas}h ${minutos}m`;
    if (minutos > 0) return `${minutos}m ${segundos}s`;
    return `${segundos}s`;
  };

  // Actualizar countdowns en tiempo real
  useEffect(() => {
    if (eventosFamiliares.length === 0) {
      console.log("⏳ [CALENDARIO] No hay eventos para calcular countdowns");
      return;
    }

    console.log("🔄 [CALENDARIO] Configurando countdowns con", eventosFamiliares.length, "eventos");

    const actualizarCountdowns = () => {
      // Countdown GOBA (fase actual)
      const faseActual = fasesGOBA.find(fase => fase.activa) || fasesGOBA[0];
      setCountdownGOBA(calcularCountdown(faseActual.fechaFin));

      // Countdown Retos (semana actual)
      const { numeroSemana, fechaCierre } = calcularSemanaRetos();
      setNumeroSemanaRetos(numeroSemana);
      setCountdownRetos(calcularCountdown(fechaCierre));

      // Countdown Próxima Actividad (7:00 PM)
      const proximaActividad = getProximaActividad();
      if (proximaActividad) {
        const fechaActividad = formatearFechaParaCountdown(proximaActividad.fecha, "19:00:00");
        setCountdownProximaActividad(calcularCountdown(fechaActividad));
      } else {
        setCountdownProximaActividad("No hay actividades");
      }
    };

    actualizarCountdowns();
    const interval = setInterval(actualizarCountdowns, 1000);

    return () => {
      console.log("🧹 [CALENDARIO] Limpiando interval de countdowns");
      clearInterval(interval);
    };
  }, [eventosFamiliares]);

  // Generar calendario para un mes específico
  const generarCalendario = (mes, año) => {
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    
    let primerDiaSemana = primerDia.getDay() - 1;
    if (primerDiaSemana < 0) primerDiaSemana = 6;

    const calendario = [];
    
    for (let i = 0; i < primerDiaSemana; i++) {
      calendario.push(null);
    }
    
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaStr = `${año}-${(mes + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
      const eventoHoy = eventosFamiliares.find(e => e.fecha === fechaStr);
      const esHoy = new Date().toISOString().split('T')[0] === fechaStr;
      
      calendario.push({
        dia,
        fecha: fechaStr,
        evento: eventoHoy,
        esHoy
      });
    }
    
    return calendario;
  };

  const calendarioNoviembre = generarCalendario(10, 2025);
  const calendarioDiciembre = generarCalendario(11, 2025);

  const faseActualGOBA = fasesGOBA.find(fase => fase.activa) || fasesGOBA[0];
  const proximaActividad = getProximaActividad();

  console.log("📊 [CALENDARIO] Estado actual:", {
    loading,
    usuarioActual: usuarioActual?.nombre,
    eventosCount: eventosFamiliares.length,
    calendarioNoviembre: calendarioNoviembre.length,
    calendarioDiciembre: calendarioDiciembre.length
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-red-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  if (!usuarioActual) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-red-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Error de acceso</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder al calendario</p>
          <Link 
            to="/login" 
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Volver a Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-red-50 to-white py-8 px-4">
      
      {/* Tooltip flotante */}
      {tooltipVisible && (
        <div 
          className="fixed z-50 bg-white border-2 border-blue-300 rounded-xl shadow-2xl p-4 max-w-xs transform -translate-x-1/2 -translate-y-full transition-all duration-300 animate-fadeIn"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`
          }}
        >
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-4 h-4 bg-white border-r-2 border-b-2 border-blue-300 rotate-45"></div>
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">{tooltipContent.icono}</div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">{tooltipContent.titulo}</h4>
              <p className="text-gray-600 text-xs mb-2">{tooltipContent.descripcion}</p>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-600 text-xs">{tooltipContent.fecha}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        
        {/* Header con animación sutil */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-green-600 via-red-500 to-green-600 bg-clip-text text-transparent animate-pulse">
            🎄 Calendario Navideño 2025
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-light animate-fadeIn">Tu guía para la magia navideña familiar</p>
        </div>

        {/* Calendarios Noviembre y Diciembre con animaciones balanceadas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          
          {/* Noviembre 2025 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-amber-200 hover:shadow-2xl transition-all duration-500 animate-slideInLeft">
            <h2 className="text-3xl font-bold text-amber-700 mb-6 text-center flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:text-amber-800">
              🍂 Noviembre 2025
            </h2>
            
            <div className="grid grid-cols-7 gap-2 mb-4 text-center font-bold text-gray-600 text-sm">
              {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map(dia => (
                <div key={dia} className="py-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">{dia}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarioNoviembre.map((diaInfo, index) => (
                <div 
                  key={index}
                  onMouseEnter={(e) => mostrarTooltip(e, diaInfo)}
                  onMouseLeave={ocultarTooltip}
                  className={`min-h-16 flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300 p-2 group cursor-pointer ${
                    !diaInfo 
                      ? 'bg-transparent border-transparent' 
                      : diaInfo.evento 
                      ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300 text-red-700 hover:from-red-100 hover:to-pink-100 hover:shadow-lg hover:scale-105 transform' 
                      : diaInfo.esHoy
                      ? 'bg-gradient-to-br from-green-200 to-emerald-200 border-green-400 text-green-800 shadow-lg transform scale-105'
                      : 'bg-gradient-to-br from-white to-amber-50 border-amber-100 text-gray-700 hover:bg-amber-100 hover:border-amber-200 hover:shadow-md hover:scale-105 transform'
                  }`}
                >
                  {diaInfo && (
                    <>
                      <div className={`font-bold text-lg transition-all duration-300 ${
                        diaInfo.esHoy 
                          ? 'text-green-700' 
                          : diaInfo.evento 
                          ? 'text-red-800 group-hover:text-red-900' 
                          : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {diaInfo.dia}
                      </div>
                      {diaInfo.evento && (
                        <div className="text-lg transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" 
                             title={diaInfo.evento.titulo}>
                          {diaInfo.evento.icono}
                        </div>
                      )}
                      {!diaInfo.evento && diaInfo.esHoy && (
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1 group-hover:animate-ping"></div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Diciembre 2025 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-green-200 hover:shadow-2xl transition-all duration-500 animate-slideInRight">
            <h2 className="text-3xl font-bold text-green-700 mb-6 text-center flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:text-green-800">
              ❄️ Diciembre 2025
            </h2>
            
            <div className="grid grid-cols-7 gap-2 mb-4 text-center font-bold text-gray-600 text-sm">
              {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map(dia => (
                <div key={dia} className="py-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">{dia}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarioDiciembre.map((diaInfo, index) => (
                <div 
                  key={index}
                  onMouseEnter={(e) => mostrarTooltip(e, diaInfo)}
                  onMouseLeave={ocultarTooltip}
                  className={`min-h-16 flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300 p-2 group cursor-pointer ${
                    !diaInfo 
                      ? 'bg-transparent border-transparent' 
                      : diaInfo.evento 
                      ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300 text-red-700 hover:from-red-100 hover:to-pink-100 hover:shadow-lg hover:scale-105 transform' 
                      : diaInfo.esHoy
                      ? 'bg-gradient-to-br from-green-200 to-emerald-200 border-green-400 text-green-800 shadow-lg transform scale-105'
                      : 'bg-gradient-to-br from-white to-green-50 border-green-100 text-gray-700 hover:bg-green-100 hover:border-green-200 hover:shadow-md hover:scale-105 transform'
                  }`}
                >
                  {diaInfo && (
                    <>
                      <div className={`font-bold text-lg transition-all duration-300 ${
                        diaInfo.esHoy 
                          ? 'text-green-700' 
                          : diaInfo.evento 
                          ? 'text-red-800 group-hover:text-red-900' 
                          : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {diaInfo.dia}
                      </div>
                      {diaInfo.evento && (
                        <div className="text-lg transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" 
                             title={diaInfo.evento.titulo}>
                          {diaInfo.evento.icono}
                        </div>
                      )}
                      {!diaInfo.evento && diaInfo.esHoy && (
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1 group-hover:animate-ping"></div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline de Eventos con animaciones al hover */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-blue-200 mb-8 hover:shadow-2xl transition-all duration-500">
          <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center flex items-center justify-center gap-3 animate-fadeIn">
            📅 Timeline de Eventos Importantes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFamiliares
              .filter(evento => new Date(evento.fecha) >= new Date())
              .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
              .map((evento, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105 transform animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0 transition-all duration-300 hover:animate-bounce">{evento.icono}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{evento.titulo}</h3>
                      <p className="text-gray-600 text-sm mb-2">{evento.descripcion}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-blue-600">
                          {formatearFechaHonduras(evento.fecha)}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {calcularCountdown(formatearFechaParaCountdown(evento.fecha, "19:00:00"))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Leyenda Mejorada con animaciones al hover */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 mb-8 hover:shadow-xl transition-all duration-300">
          <h3 className="font-bold text-gray-800 mb-4 text-center animate-fadeIn">📋 Leyenda del Calendario</h3>
          <div className="flex justify-center gap-8 text-sm flex-wrap">
            <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-lg hover:scale-105 transform transition-all duration-300">
              <div className="w-6 h-6 bg-red-300 rounded-full flex items-center justify-center text-xs transition-all duration-300 hover:animate-pulse">🎂</div>
              <span className="font-medium text-red-700">Evento Familiar</span>
            </div>
            <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg hover:scale-105 transform transition-all duration-300">
              <div className="w-6 h-6 bg-green-400 rounded-full"></div>
              <span className="font-medium text-green-700">Hoy</span>
            </div>
            <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-lg hover:scale-105 transform transition-all duration-300">
              <div className="w-6 h-6 bg-amber-200 rounded-full hover:bg-amber-300 transition-colors"></div>
              <span className="font-medium text-amber-700">Día normal</span>
            </div>
          </div>
        </div>

        {/* Navegación con animación al hover */}
        <div className="text-center">
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-red-500 hover:from-green-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:animate-bounce"
          >
            ← Volver al Home
          </Link>
        </div>
      </div>

      {/* Estilos CSS para animaciones personalizadas */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.6s ease-out; }
      `}</style>
    </div>
  );
}