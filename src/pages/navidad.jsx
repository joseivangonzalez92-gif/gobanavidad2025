import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gobaService } from '../services/firebaseService';

export default function Navidad() {
  const navigate = useNavigate();
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [diaAdvientoActual, setDiaAdvientoActual] = useState(null);
  const [villancicoSeleccionado, setVillancicoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contenidoAdviento, setContenidoAdviento] = useState([]);
  const [reflexionesAdviento, setReflexionesAdviento] = useState([]);
  const [diaExpandido, setDiaExpandido] = useState(null);
  const [mostrarCalendarioCompleto, setMostrarCalendarioCompleto] = useState(false);

  // Villancicos con acordes (siempre disponibles)
  const villancicos = [
    {
      id: 1,
      titulo: "Noche de Paz",
      acordes: "C - G - C - G\nC - G - Am - Em\nF - C - F - C\nG - C - G - C",
      letra: `Noche de paz, noche de amor
Todo duerme en derredor
Entre los astros que esparcen su luz
Bella anunciando al niñito Jesús
Brilla la estrella de paz
Brilla la estrella de paz`,
      nivel: "Fácil",
      color: "blue",
      icono: "⭐"
    },
    {
      id: 2,
      titulo: "Campana sobre Campana",
      acordes: "G - D7 - G - Em\nAm - D7 - G - G7\nC - G - Am - D7\nG - C - G - G",
      letra: `Campana sobre campana
Y sobre campana una
Asómate a la ventana
Verás al Niño en la cuna

Belén, campanas de Belén
Que los pastores quieren oír
Belén, campanas de Belén
Que los pastores quieren oír`,
      nivel: "Intermedio",
      color: "green",
      icono: "🔔"
    },
    {
      id: 3,
      titulo: "Los Peces en el Río",
      acordes: "Am - G - C - F\nC - G - Am - E7\nAm - G - C - F\nC - E7 - Am - Am",
      letra: `Pero mira cómo beben
Los peces en el río
Pero mira cómo beben
Por ver al Dios nacido

Beben y beben
Y vuelven a beber
Los peces en el río
Por ver a Dios nacer`,
      nivel: "Fácil",
      color: "teal",
      icono: "🐟"
    },
    {
      id: 4,
      titulo: "Arre Borriquito",
      acordes: "C - F - C - G7\nC - F - C - G7\nC - C7 - F - F\nC - G7 - C - C",
      letra: `Arre borriquito
Vamos a Belén
Que mañana es fiesta
Y al otro también

Arre borriquito
Vamos a Belén
Que mañana es fiesta
Y al otro también`,
      nivel: "Muy Fácil",
      color: "orange",
      icono: "🐴"
    },
    {
      id: 5,
      titulo: "El Tamborilero",
      acordes: "Dm - C - Bb - F\nC - Dm - Am - Gm\nDm - C - Bb - F\nC - Dm - Am - Dm",
      letra: `El camino que lleva a Belén
Baja hasta el valle que la nieve cubrió
Los pastorcillos quieren ver a su Rey
Le traen regalos en su humilde zurrón

Ropompom pom pom, ropompom pom pom
Ha nacido en un portal de Belén el Niño Dios`,
      nivel: "Intermedio",
      color: "red",
      icono: "🥁"
    }
  ];

  // FUNCIÓN CORREGIDA: Crear fecha en zona horaria local
  const crearFechaLocal = (año, mes, dia) => {
    return new Date(año, mes, dia, 12, 0, 0);
  };

  // GENERAR LAS FECHAS REALES DEL ADVIENTO (30 Nov - 25 Dic) CORREGIDO
  const generarFechasAdviento = () => {
    const fechas = [];
    
    const inicio = crearFechaLocal(2025, 10, 30);
    const fin = crearFechaLocal(2025, 11, 25);
    
    const fechaActual = new Date(inicio);
    
    while (fechaActual <= fin) {
      const fechaCopia = new Date(fechaActual);
      fechas.push(fechaCopia);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    return fechas;
  };

  // Eventos litúrgicos importantes
  const eventosLiturgicosAdviento = {
    "2025-11-30": "1er Domingo de Adviento - Esperanza",
    "2025-12-07": "2do Domingo de Adviento - Paz", 
    "2025-12-08": "Inmaculada Concepción de María",
    "2025-12-12": "Nuestra Señora de Guadalupe",
    "2025-12-14": "3er Domingo de Adviento - Gozo",
    "2025-12-21": "4to Domingo de Adviento - Amor",
    "2025-12-24": "Nochebuena - Misa de Gallo",
    "2025-12-25": "Navidad del Señor"
  };

  useEffect(() => {
    const initializeAdviento = async () => {
      try {
        setLoading(true);
        
        // Verificar usuario
        const usuarioRaw = localStorage.getItem('usuarioActual');
        if (!usuarioRaw) {
          navigate("/login");
          return;
        }
        
        let usuario;
        try {
          usuario = JSON.parse(usuarioRaw);
        } catch (error) {
          navigate("/login");
          return;
        }
        
        if (!usuario.id || !usuario.nombre || !usuario.codigoSecreto) {
          alert("Error: Tu usuario no está completamente configurado.");
          navigate("/login");
          return;
        }

        setUsuarioActual(usuario);
        
        // Calcular día actual de Adviento
        const hoy = new Date();
        const hoyNormalizado = crearFechaLocal(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        
        const inicioAdviento = crearFechaLocal(2025, 10, 30);
        const finAdviento = crearFechaLocal(2025, 11, 25);
        
        // Si hoy es antes del 30 de Nov, no mostrar día actual
        if (hoyNormalizado < inicioAdviento) {
          setDiaAdvientoActual(null);
        } else if (hoyNormalizado > finAdviento) {
          setDiaAdvientoActual(26);
        } else {
          const diffTiempo = hoyNormalizado - inicioAdviento;
          const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24)) + 1;
          setDiaAdvientoActual(diffDias);
          setDiaExpandido(diffDias); // Expandir el día actual automáticamente
        }
        
        // Cargar contenido automático
        await cargarContenidoAutomatico();
        
      } catch (error) {
        console.error("Error inicializando Adviento:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAdviento();
  }, [navigate]);

  // GENERAR CONTENIDO CON FECHAS REALES
  const generarContenidoAdviento = (evangelioHoy) => {
    const diasAdviento = [];
    const fechas = generarFechasAdviento();
    
    // Temas para cada día del Adviento
    const temasAdviento = [
      "1er Domingo de Adviento - Esperanza", 
      "La Luz que Viene al Mundo",
      "Preparad el Camino del Señor", 
      "El Amor se Hizo Carne",
      "Paz en la Tierra", 
      "El Mejor Regalo",
      "La Anunciación a María",
      "2do Domingo de Adviento - Paz",
      "Inmaculada Concepción",
      "La Estrella de Belén", 
      "Alabanza y Gozo",
      "Hogar y Familia", 
      "Nuestra Señora de Guadalupe",
      "3er Domingo de Adviento - Gozo",
      "Jesús, Rey Humilde", 
      "Los Ángeles Cantores",
      "Las Profecías se Cumplen", 
      "Caridad y Solidaridad",
      "4to Domingo de Adviento - Amor",
      "La Noche más Santa", 
      "Sagrada Familia",
      "Los Regalos de los Magos", 
      "Esperanza Cumplida",
      "Nochebuena", 
      "El Salvador Nace",
      "Feliz Navidad"
    ];
    
    // Acciones para cada día
    const accionesAdviento = [
      "Enciende la primera vela de tu corona de Adviento",
      "Sé luz para alguien con un acto de bondad",
      "Haz un examen de conciencia y prepárate para la confesión",
      "Muestra amor hoy a un familiar con quien tengas dificultades",
      "Haz las paces con alguien hoy",
      "Agradece a Dios por tres bendiciones específicas hoy",
      "Imita el 'sí' de María en algo que Dios te pida hoy",
      "Enciende la segunda vela de tu corona de Adviento",
      "Reza un Ave María con especial devoción",
      "Sé una 'estrella' que guíe a otros hacia Cristo",
      "Canta o escucha un villancico con el corazón",
      "Haz algo especial por tu familia hoy",
      "Encomienda tu familia a la protección de María",
      "Enciende la tercera vela (rosa) de tu corona de Adviento",
      "Practica la humildad en alguna situación hoy",
      "Alaba a Dios con tus propias palabras hoy",
      "Confía en una promesa de Dios para tu vida",
      "Haz una obra de caridad concreta hoy",
      "Enciende la cuarta vela de tu corona de Adviento",
      "Comparte la alegría de la Navidad con alguien",
      "Reza por tu familia y por todas las familias",
      "Ofrece a Jesús un don espiritual hoy",
      "Renueva tu esperanza en las promesas de Dios",
      "Asiste a Misa de Gallo y recibe a Jesús en tu corazón",
      "Celebra el nacimiento de nuestro Salvador",
      "Da gracias a Dios por el don de su Hijo"
    ];

    fechas.forEach((fecha, index) => {
      const fechaStr = fecha.toISOString().split('T')[0];
      const diaNumero = index + 1;
      const esHoy = diaAdvientoActual === diaNumero;
      
      const contenidoDia = esHoy && evangelioHoy ? evangelioHoy : {
        lectura: "Velad, pues, porque no sabéis el día ni la hora.",
        reflexion: "El Adviento nos invita a preparar nuestros corazones para la venida del Salvador.",
        referencia: "Mateo 25, 13"
      };

      const esDomingo = fecha.getDay() === 0;
      
      diasAdviento.push({
        id: `dia_${diaNumero}`,
        dia: diaNumero,
        fecha: fechaStr,
        fechaObj: fecha,
        mensaje: temasAdviento[index],
        versiculo: contenidoDia.referencia,
        textoVersiculo: contenidoDia.lectura,
        reflexion: contenidoDia.reflexion,
        accion: accionesAdviento[index],
        tipo: "adviento",
        esDomingo: esDomingo,
        esFestividad: eventosLiturgicosAdviento[fechaStr],
        eventoLiturgico: eventosLiturgicosAdviento[fechaStr]
      });
    });
    
    return diasAdviento;
  };

  // CARGAR CONTENIDO AUTOMÁTICO
  const cargarContenidoAutomatico = async () => {
    try {
      let evangelioHoy = null;
      if (diaAdvientoActual) {
        evangelioHoy = await gobaService.obtenerEvangelioDelDia();
      }
      
      const contenidoGenerado = generarContenidoAdviento(evangelioHoy);
      setContenidoAdviento(contenidoGenerado);
      
      await cargarReflexionesAutomaticas();
      
    } catch (error) {
      console.error("❌ Error cargando contenido automático:", error);
      const contenidoPorDefecto = generarContenidoAdviento(null);
      setContenidoAdviento(contenidoPorDefecto);
    }
  };

  const cargarReflexionesAutomaticas = async () => {
    try {
      const reflexionesPorDefecto = [
        {
          titulo: "El Verdadero Sentido del Adviento",
          contenido: "El Adviento es tiempo de espera gozosa. Preparamos nuestros corazones no solo para recordar el nacimiento de Jesús, sino para recibirlo en nuestro presente.",
          referencia: "Isaías 9:6"
        },
        {
          titulo: "Espera Activa",
          contenido: "La espera del Adviento no es pasiva. Es un tiempo de conversión, de preparación interior, de renovar nuestro encuentro con Cristo.",
          referencia: "Mateo 3:3"
        },
        {
          titulo: "María en el Adviento",
          contenido: "María es modelo de espera y disponibilidad. Su 'sí' a Dios nos enseña a abrir nuestros corazones al Salvador.",
          referencia: "Lucas 1:38"
        }
      ];
      
      setReflexionesAdviento(reflexionesPorDefecto);
    } catch (error) {
      console.error("Error cargando reflexiones:", error);
    }
  };

  // OBTENER DÍA DEL MES
  const getDiaDelMes = (fecha) => {
    return fecha.getDate();
  };

  // OBTENER TEXTO PARA TOOLTIP - VERSIÓN SIN DÍA DE ADVIENTO
  const getTooltipText = (dia) => {
    const fecha = dia.fechaObj;
    const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
    const diaMes = getDiaDelMes(fecha);
    const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
    
    if (dia.eventoLiturgico) {
      return `${diaSemana} ${diaMes} de ${mes}\n${dia.eventoLiturgico}`;
    } else if (dia.esDomingo) {
      return `${diaSemana} ${diaMes} de ${mes}\nDomingo de Adviento`;
    } else {
      return `${diaSemana} ${diaMes} de ${mes}`;
    }
  };

  // OBTENER FECHA FORMATEADA
  const getFechaFormateada = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
    const diaMes = fecha.getDate();
    const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
    return `${diaSemana} ${diaMes} de ${mes}`;
  };

  // Función para expandir/contraer día
  const toggleDiaExpandido = (diaNumero) => {
    if (diaExpandido === diaNumero) {
      setDiaExpandido(null);
    } else {
      setDiaExpandido(diaNumero);
    }
  };

  // Obtener el día actual del Adviento
  const diaActual = contenidoAdviento.find(dia => dia.dia === diaAdvientoActual);

  // Función para obtener clase de color según el día
  const getColorClase = (dia) => {
    if (dia.dia === diaAdvientoActual) return 'from-purple-500 to-blue-500';
    if (dia.dia < diaAdvientoActual) {
      if (dia.esDomingo) return 'from-yellow-400 to-orange-400';
      if (dia.esFestividad) return 'from-red-400 to-pink-400';
      return 'from-green-400 to-emerald-400';
    }
    return 'from-gray-300 to-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando el Adviento...</p>
        </div>
      </div>
    );
  }

  if (!usuarioActual) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error de acceso</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder al Adviento</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Mejorado */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-purple-600 via-blue-500 to-green-600 bg-clip-text text-transparent">
            Adviento 2025
          </h1>
          <p className="text-xl text-gray-600 mb-2 font-light">Del 30 de Noviembre al 25 de Diciembre</p>
          {diaAdvientoActual && (
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-purple-200">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-purple-700 font-medium">
                {getFechaFormateada(diaActual.fecha)} - Día {diaAdvientoActual} de 26
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12">
          
          {/* Calendario de Adviento - Ocupa 3 columnas */}
          <div className="xl:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-purple-200 hover:shadow-3xl transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-purple-700">
                  Calendario de Adviento
                </h2>
                <button 
                  onClick={() => setMostrarCalendarioCompleto(!mostrarCalendarioCompleto)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  {mostrarCalendarioCompleto ? "Ocultar" : "Ver Todos los Días"}
                </button>
              </div>
              
              {/* Día Actual Expandido */}
              {diaActual && (
                <div className={`bg-gradient-to-br rounded-2xl p-6 mb-6 border-2 transform transition-all duration-500 ${
                  diaActual.esDomingo 
                    ? 'from-yellow-200 to-orange-200 border-yellow-400 hover:shadow-lg' 
                    : diaActual.esFestividad
                    ? 'from-red-200 to-pink-200 border-red-400 hover:shadow-lg'
                    : 'from-blue-200 to-purple-200 border-blue-400 hover:shadow-lg'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">{diaActual.mensaje}</h3>
                      <div className="flex gap-2">
                        {diaActual.esDomingo && (
                          <span className="inline-block bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Domingo de Adviento
                          </span>
                        )}
                        {diaActual.esFestividad && (
                          <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {diaActual.esFestividad.split(' - ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-purple-700 border border-purple-300">
                      {getFechaFormateada(diaActual.fecha)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-blue-500 hover:scale-105 transition-transform duration-300">
                      <h4 className="font-bold text-blue-700 mb-2">{diaActual.versiculo}</h4>
                      <p className="text-gray-700 italic text-sm">"{diaActual.textoVersiculo}"</p>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-green-500 hover:scale-105 transition-transform duration-300">
                      <h4 className="font-bold text-green-700 mb-2">Reflexión</h4>
                      <p className="text-gray-700 text-sm">{diaActual.reflexion}</p>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-orange-500 hover:scale-105 transition-transform duration-300">
                      <h4 className="font-bold text-orange-700 mb-2">Acción del Día</h4>
                      <p className="text-gray-700 text-sm">{diaActual.accion}</p>
                    </div>
                  </div>
                </div>
              )}

              {!diaActual && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-8 border-2 border-yellow-300 text-center mb-6 transform hover:scale-105 transition-all duration-300">
                  <h3 className="text-2xl font-bold text-yellow-700 mb-3">El Adviento aún no comienza</h3>
                  <p className="text-yellow-600 text-lg">
                    El tiempo de Adviento comenzará el <strong className="text-yellow-800">domingo 30 de Noviembre de 2025</strong>. 
                    <br />Mientras tanto, puedes preparar tu corazón rezando y reflexionando.
                  </p>
                </div>
              )}

              {/* Grid de días del Adviento - SOLO FECHAS DEL MES */}
              <div className={`grid gap-3 transition-all duration-500 ${
                mostrarCalendarioCompleto ? 'grid-cols-6' : 'grid-cols-6'
              }`}>
                {contenidoAdviento.slice(0, mostrarCalendarioCompleto ? 26 : 24).map((dia) => (
                  <div
                    key={dia.dia}
                    onClick={() => toggleDiaExpandido(dia.dia)}
                    className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                      dia.dia === diaAdvientoActual
                        ? `bg-gradient-to-br ${getColorClase(dia)} text-white border-white shadow-2xl transform scale-105 hover:scale-110`
                        : dia.dia < diaAdvientoActual
                        ? `bg-gradient-to-br ${getColorClase(dia)} text-white border-white shadow-lg hover:shadow-xl hover:scale-105`
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={getTooltipText(dia)}
                  >
                    {/* SOLO FECHA DEL MES - Sin número de día de Adviento */}
                    <span className="text-xl font-bold transform group-hover:scale-125 transition-transform duration-300">
                      {getDiaDelMes(dia.fechaObj)}
                    </span>
                    
                    {/* Indicadores con puntos de color */}
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      {dia.esDomingo && <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>}
                      {dia.eventoLiturgico && !dia.esDomingo && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                      {dia.dia === diaAdvientoActual && (
                        <span className="w-2 h-2 bg-white rounded-full animate-ping absolute -top-1 -right-1"></span>
                      )}
                    </div>

                    {/* Efecto de brillo al hover */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
                  </div>
                ))}
              </div>

              {/* Botón para mostrar más/menos */}
              {!mostrarCalendarioCompleto && contenidoAdviento.length > 24 && (
                <div className="text-center mt-6">
                  <button 
                    onClick={() => setMostrarCalendarioCompleto(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Ver días 25-26 (Navidad) ↓
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Ocupa 1 columna */}
          <div className="space-y-6">
            {/* Villancicos Mejorados */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-red-200 hover:shadow-3xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-red-700 mb-4">
                Villancicos Navideños
              </h2>
              
              <div className="space-y-3">
                {villancicos.map(villancico => (
                  <button
                    key={villancico.id}
                    onClick={() => setVillancicoSeleccionado(villancico)}
                    className="w-full text-left bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 rounded-xl p-4 transition-all duration-300 border border-red-200 hover:border-red-300 transform hover:scale-105 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl transform group-hover:scale-110 transition-transform duration-300">
                        {villancico.icono}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-red-800">{villancico.titulo}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            villancico.nivel === "Muy Fácil" ? "bg-green-100 text-green-700" :
                            villancico.nivel === "Fácil" ? "bg-blue-100 text-blue-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            {villancico.nivel}
                          </span>
                        </div>
                        <div className="text-xs text-red-600 opacity-75">
                          Haz clic para ver acordes y letra
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reflexiones del Adviento Mejoradas */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-green-200 hover:shadow-3xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-green-700 mb-4">
                Reflexiones del Adviento
              </h2>
              
              <div className="space-y-4">
                {reflexionesAdviento.map((reflexion, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-l-4 border-green-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  >
                    <h3 className="font-bold text-green-800 mb-2">{reflexion.titulo}</h3>
                    <p className="text-sm text-gray-700 mb-2 leading-relaxed">{reflexion.contenido}</p>
                    <span className="text-xs text-green-600 font-medium">{reflexion.referencia}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progreso del Adviento */}
            {diaAdvientoActual && (
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white shadow-2xl">
                <h3 className="text-lg font-bold mb-3 text-center">Progreso del Adviento</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Días completados</span>
                    <span>{diaAdvientoActual - 1}/26</span>
                  </div>
                  <div className="w-full bg-purple-300 rounded-full h-3">
                    <div 
                      className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${((diaAdvientoActual - 1) / 26) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm opacity-90 mt-2">
                    {26 - (diaAdvientoActual - 1)} días restantes
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Villancico MEJORADO */}
        {villancicoSeleccionado && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform animate-scaleIn">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{villancicoSeleccionado.icono}</div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">{villancicoSeleccionado.titulo}</h2>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                        villancicoSeleccionado.nivel === "Muy Fácil" ? "bg-green-100 text-green-700" :
                        villancicoSeleccionado.nivel === "Fácil" ? "bg-blue-100 text-blue-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>
                        Nivel: {villancicoSeleccionado.nivel}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setVillancicoSeleccionado(null)}
                    className="bg-gray-100 hover:bg-gray-200 rounded-full p-3 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-700">Acordes</h3>
                    <div className="bg-gray-100 rounded-xl p-6 font-mono text-lg leading-relaxed whitespace-pre-line border-2 border-gray-200">
                      {villancicoSeleccionado.acordes}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-700">Letra</h3>
                    <div className="bg-gray-100 rounded-xl p-6 text-lg leading-relaxed whitespace-pre-line border-2 border-gray-200">
                      {villancicoSeleccionado.letra}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-1">Tip para practicar</h4>
                  <p className="text-yellow-700">
                    Practica los acordes lentamente y canta con el corazón. 
                    ¡La música es una hermosa forma de alabar a Dios en esta Navidad!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional MEJORADA */}
        <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-600 rounded-3xl p-10 text-white text-center shadow-2xl mb-8 transform hover:scale-105 transition-all duration-500">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">El Sentido del Adviento</h2>
            <p className="text-xl opacity-95 leading-relaxed">
              Del 30 de Noviembre al 25 de Diciembre preparamos nuestros corazones para recibir a Jesús, 
              recordando su venida histórica en Belén, esperando su venida gloriosa al final de los tiempos, 
              y acogiéndolo en nuestro presente a través de los sacramentos y la caridad.
            </p>
          </div>
        </div>

        {/* Navegación MEJORADA */}
        <div className="text-center">
          <Link 
            to="/home" 
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
          >
            <span>←</span>
            Volver al Home Familiar
          </Link>
        </div>
      </div>

      {/* Estilos CSS para animaciones personalizadas */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .hover-shadow-3xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}