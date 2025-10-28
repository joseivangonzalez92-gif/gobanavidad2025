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
      nivel: "Fácil"
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
      nivel: "Intermedio"
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
      nivel: "Fácil"
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
      nivel: "Muy Fácil"
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
      nivel: "Intermedio"
    }
  ];

  // FUNCIÓN CORREGIDA: Crear fecha en zona horaria local
  const crearFechaLocal = (año, mes, dia) => {
    // Crear fecha en zona horaria local (sin UTC)
    return new Date(año, mes, dia, 12, 0, 0); // Usar mediodía para evitar problemas de zona horaria
  };

  // GENERAR LAS FECHAS REALES DEL ADVIENTO (30 Nov - 25 Dic) CORREGIDO
  const generarFechasAdviento = () => {
    const fechas = [];
    
    // Crear fechas en zona horaria local
    const inicio = crearFechaLocal(2025, 10, 30); // Noviembre es 10 (0-indexed)
    const fin = crearFechaLocal(2025, 11, 25);    // Diciembre es 11
    
    const fechaActual = new Date(inicio);
    
    while (fechaActual <= fin) {
      // Crear copia de la fecha para no modificar la original
      const fechaCopia = new Date(fechaActual);
      fechas.push(fechaCopia);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    console.log("🌍 Zona horaria:", Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log("📅 Fechas generadas:", fechas.map(f => f.toISOString().split('T')[0]));
    console.log("📅 Primera fecha:", fechas[0]?.toLocaleDateString('es-ES'));
    console.log("📅 Última fecha:", fechas[fechas.length - 1]?.toLocaleDateString('es-ES'));
    
    return fechas;
  };

  // Eventos litúrgicos importantes
  const eventosLiturgicosAdviento = {
    "2025-11-30": "🕯️ 1er Domingo de Adviento - Esperanza",
    "2025-12-07": "🕯️ 2do Domingo de Adviento - Paz", 
    "2025-12-08": "🌟 Inmaculada Concepción de María",
    "2025-12-12": "🇲🇽 Nuestra Señora de Guadalupe",
    "2025-12-14": "🕯️ 3er Domingo de Adviento - Gozo",
    "2025-12-21": "🕯️ 4to Domingo de Adviento - Amor",
    "2025-12-24": "🎉 Nochebuena - Misa de Gallo",
    "2025-12-25": "👶 Navidad del Señor"
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
        
        // Calcular día actual de Adviento CORREGIDO (con zona horaria local)
        const hoy = new Date();
        const hoyNormalizado = crearFechaLocal(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        
        const inicioAdviento = crearFechaLocal(2025, 10, 30); // 30 Nov 2025
        const finAdviento = crearFechaLocal(2025, 11, 25);    // 25 Dic 2025
        
        console.log("🌍 Zona horaria del usuario:", Intl.DateTimeFormat().resolvedOptions().timeZone);
        console.log("📅 Fechas calculadas CORREGIDAS:", {
          hoy: hoyNormalizado.toLocaleDateString('es-ES'),
          inicio: inicioAdviento.toLocaleDateString('es-ES'),
          fin: finAdviento.toLocaleDateString('es-ES')
        });
        
        // Si hoy es antes del 30 de Nov, no mostrar día actual
        if (hoyNormalizado < inicioAdviento) {
          setDiaAdvientoActual(null);
          console.log("⏳ Aún no es Adviento");
        } else if (hoyNormalizado > finAdviento) {
          setDiaAdvientoActual(26); // Navidad
          console.log("🎄 Después de Navidad");
        } else {
          const diffTiempo = hoyNormalizado - inicioAdviento;
          const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24)) + 1;
          setDiaAdvientoActual(diffDias);
          console.log("📆 Día actual de Adviento:", diffDias);
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
      "¡Nochebuena!", 
      "El Salvador Nace",
      "¡Feliz Navidad!"
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
      "¡Celebra el nacimiento de nuestro Salvador!",
      "¡Da gracias a Dios por el don de su Hijo!"
    ];

    fechas.forEach((fecha, index) => {
      const fechaStr = fecha.toISOString().split('T')[0];
      const diaNumero = index + 1;
      const esHoy = diaAdvientoActual === diaNumero;
      
      // Usar Evangelio real para el día actual, contenido por defecto para otros días
      const contenidoDia = esHoy && evangelioHoy ? evangelioHoy : {
        lectura: "Velad, pues, porque no sabéis el día ni la hora.",
        reflexion: "El Adviento nos invita a preparar nuestros corazones para la venida del Salvador.",
        referencia: "Mateo 25, 13"
      };

      // Determinar si es domingo
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
    
    console.log("📋 Contenido generado:", diasAdviento.map(d => ({
      dia: d.dia,
      fecha: d.fecha,
      fechaLocal: d.fechaObj.toLocaleDateString('es-ES'),
      mensaje: d.mensaje,
      esDomingo: d.esDomingo
    })));
    
    return diasAdviento;
  };

  // CARGAR CONTENIDO AUTOMÁTICO
  const cargarContenidoAutomatico = async () => {
    try {
      console.log("🕯️ Cargando contenido automático de Adviento...");
      
      let evangelioHoy = null;
      if (diaAdvientoActual) {
        evangelioHoy = await gobaService.obtenerEvangelioDelDia();
        console.log("✅ Evangelio obtenido:", evangelioHoy);
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
          titulo: "🎄 El Verdadero Sentido del Adviento",
          contenido: "El Adviento es tiempo de espera gozosa. Preparamos nuestros corazones no solo para recordar el nacimiento de Jesús, sino para recibirlo en nuestro presente.",
          referencia: "Isaías 9:6"
        },
        {
          titulo: "🕯️ Espera Activa",
          contenido: "La espera del Adviento no es pasiva. Es un tiempo de conversión, de preparación interior, de renovar nuestro encuentro con Cristo.",
          referencia: "Mateo 3:3"
        },
        {
          titulo: "🌟 María en el Adviento",
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

  // OBTENER TEXTO PARA TOOLTIP
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
      return `${diaSemana} ${diaMes} de ${mes}\nDía ${dia.dia} de Adviento`;
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

  // Obtener el día actual del Adviento
  const diaActual = contenidoAdviento.find(dia => dia.dia === diaAdvientoActual);

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
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Error de acceso</h2>
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
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-purple-600 via-blue-500 to-green-600 bg-clip-text text-transparent">
            🕯️ Adviento 2025
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-light">Del 30 de Noviembre al 25 de Diciembre</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Calendario de Adviento */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-purple-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-purple-700 flex items-center gap-3">
                  📅 Calendario de Adviento
                </h2>
                {diaAdvientoActual && (
                  <span className="text-sm bg-purple-500 text-white px-3 py-1 rounded-full">
                    {getFechaFormateada(diaActual.fecha)} - Día {diaAdvientoActual} de 26
                  </span>
                )}
              </div>
              
              {diaActual ? (
                <div className={`bg-gradient-to-br rounded-xl p-6 mb-6 border-2 ${
                  diaActual.esDomingo 
                    ? 'from-yellow-100 to-orange-100 border-yellow-300' 
                    : diaActual.esFestividad
                    ? 'from-red-100 to-pink-100 border-red-300'
                    : 'from-blue-100 to-purple-100 border-blue-300'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{diaActual.mensaje}</h3>
                      {diaActual.esDomingo && (
                        <span className="inline-block mt-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
                          🕯️ Domingo de Adviento
                        </span>
                      )}
                      {diaActual.esFestividad && (
                        <span className="inline-block mt-1 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                          🎉 {diaActual.esFestividad}
                        </span>
                      )}
                    </div>
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-700">
                      {getFechaFormateada(diaActual.fecha)}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                      <h4 className="font-bold text-blue-700 mb-2">📖 {diaActual.versiculo}</h4>
                      <p className="text-gray-700 italic">"{diaActual.textoVersiculo}"</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                      <h4 className="font-bold text-green-700 mb-2">💭 Reflexión</h4>
                      <p className="text-gray-700">{diaActual.reflexion}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                      <h4 className="font-bold text-orange-700 mb-2">✨ Acción del Día</h4>
                      <p className="text-gray-700">{diaActual.accion}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-xl p-6 mb-6 border-2 border-yellow-300 text-center">
                  <h3 className="text-xl font-bold text-yellow-700 mb-2">⏳ El Adviento aún no comienza</h3>
                  <p className="text-yellow-600">
                    El tiempo de Adviento comenzará el <strong>domingo 30 de Noviembre de 2025</strong>. 
                    Mientras tanto, puedes preparar tu corazón rezando y reflexionando.
                  </p>
                </div>
              )}

              {/* Grid de días del Adviento CON FECHAS REALES */}
              <div className="grid grid-cols-6 gap-3">
                {contenidoAdviento.map((dia) => (
                  <div
                    key={dia.dia}
                    className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-1 text-center transition-all cursor-pointer ${
                      dia.dia === diaAdvientoActual
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white border-purple-600 scale-105 shadow-lg'
                        : dia.dia < diaAdvientoActual
                        ? dia.esDomingo
                          ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                          : dia.esFestividad
                          ? 'bg-red-100 border-red-300 text-red-700'
                          : 'bg-green-100 border-green-300 text-green-700'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                    title={getTooltipText(dia)}
                  >
                    <span className="text-lg font-bold">{getDiaDelMes(dia.fechaObj)}</span>
                    <div className="text-xs mt-1 flex flex-col gap-0.5">
                      {dia.esDomingo && <span>🕯️</span>}
                      {dia.eventoLiturgico && !dia.esDomingo && <span>⭐</span>}
                      {dia.dia === diaAdvientoActual && <span>Hoy</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Villancicos y Reflexiones */}
          <div className="space-y-6">
            {/* Villancicos */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-red-200">
              <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-2">
                🎵 Villancicos
              </h2>
              
              <div className="space-y-3">
                {villancicos.map(villancico => (
                  <button
                    key={villancico.id}
                    onClick={() => setVillancicoSeleccionado(villancico)}
                    className="w-full text-left bg-red-50 hover:bg-red-100 rounded-lg p-3 transition-all border border-red-200 hover:border-red-300"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-red-800">{villancico.titulo}</span>
                      <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded-full">
                        {villancico.nivel}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reflexiones del Adviento */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-green-200">
              <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                💭 Reflexiones del Adviento
              </h2>
              
              <div className="space-y-4">
                {reflexionesAdviento.map((reflexion, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                    <h3 className="font-bold text-green-800 mb-2">{reflexion.titulo}</h3>
                    <p className="text-sm text-gray-700 mb-2">{reflexion.contenido}</p>
                    <span className="text-xs text-green-600">{reflexion.referencia}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Villancico */}
        {villancicoSeleccionado && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{villancicoSeleccionado.titulo}</h2>
                  <button 
                    onClick={() => setVillancicoSeleccionado(null)}
                    className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-700 mb-3">🎶 Acordes</h3>
                    <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre-line">
                      {villancicoSeleccionado.acordes}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-700 mb-3">📝 Letra</h3>
                    <div className="bg-gray-100 rounded-lg p-4 text-sm whitespace-pre-line">
                      {villancicoSeleccionado.letra}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <span className="font-bold">Tip:</span> Practica los acordes lentamente y canta con el corazón. 
                    ¡La música es una hermosa forma de alabar a Dios!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-8 text-white text-center shadow-2xl mb-8">
          <h2 className="text-2xl font-bold mb-3">🕯️ El Sentido del Adviento</h2>
          <p className="text-lg opacity-90 mb-4">
            Del 30 de Noviembre al 24 de Diciembre preparamos nuestros corazones para recibir a Jesús, 
            recordando su venida histórica, esperando su venida gloriosa y acogiéndolo en nuestro presente.
          </p>
        </div>

        {/* Navegación */}
        <div className="text-center">
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ← Volver al Home 
          </Link>
        </div>
      </div>
    </div>
  );
}