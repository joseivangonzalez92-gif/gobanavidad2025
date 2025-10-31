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

  // Villancicos con acordes y letras COMPLETAS
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
Brilla la estrella de paz

Noche de paz, noche de amor
Todo duerme en derredor
Sólo velan en la oscuridad
Los pastores que en el campo están
Y la estrella de Belén
Y la estrella de Belén

Noche de paz, noche de amor
Todo duerme en derredor
Sobre el santo niño Jesús
Una estrella esparce su luz
Brilla sobre el Rey
Brilla sobre el Rey

Noche de paz, noche de amor
Todo duerme en derredor
Fieles velando allí en Belén
Los pastores, la madre también
Y la estrella de paz
Y la estrella de paz`,
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
Que los pastores quieren oír

Campana sobre campana
Y sobre campana dos
Asómate a la ventana
Verás al Niño en la cuna

Belén, campanas de Belén
Que los pastores quieren oír
Belén, campanas de Belén
Que los pastores quieren oír

Campana sobre campana
Y sobre campana tres
En una cruz a esta hora
El Niño va a padecer

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
Por ver a Dios nacer

La Virgen se está peinando
Entre cortina y cortina
Los cabellos son de oro
Y el peine de plata fina

Pero mira cómo beben
Los peces en el río
Pero mira cómo beben
Por ver al Dios nacido

Beben y beben
Y vuelven a beber
Los peces en el río
Por ver a Dios nacer

Estando la Virgen sola
En su cuarto y muy segura
Un ángel del cielo entró
Y le dice: "Dios te salve, María"

Pero mira cómo beben
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
Y al otro también

Si me ven, si me ven
Que me voy de camino
Si me ven, si me ven
Voy a ver al Niño

Arre borriquito
Vamos a Belén
Que mañana es fiesta
Y al otro también

Llevo la chocolata
Que la madre me dio
Llevo la chocolata
Que la madre me dio

Arre borriquito
Vamos a Belén
Que mañana es fiesta
Y al otro también

Si me ven, si me ven
Que me voy de camino
Si me ven, si me ven
Voy a ver al Niño

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
Ha nacido en un portal de Belén el Niño Dios

Yo quisiera poner a tus pies
Algún presente que te agrade Señor
Mas tú ya sabes que soy pobre también
Y no poseo más que un viejo tambor

Ropompom pom pom, ropompom pom pom
En tu honor frente al portal tocaré con mi tambor

El niño Dios me sonríe tocando
Se duerme mi niño, duérmete ya
Y el ronco tambor en la noche caliente
No cesa de llamar con su son al Niño Jesús

Ropompom pom pom, ropompom pom pom
El niño Dios está soñando y yo sigo tocando`,
      nivel: "Intermedio"
    },
    {
      id: 6,
      titulo: "Las Posadas",
      acordes: "C - G7 - C - F\nC - G7 - C - C\nF - C - G7 - C\nC - F - C - G7 - C",
      letra: `Venid, venid, pastores
Venid, venid, pastores
Venid a Belén
Venid a Belén
A ver a nuestro Rey
A ver a nuestro Rey
Al Niño Jesús
Al Niño Jesús

En el portal de Belén
En el portal de Belén
Hace frío a la noche
Hace frío a la noche
La Virgen y San José
La Virgen y San José
Lo abrigan con amor
Lo abrigan con amor

Los bueyes con su aliento
Los bueyes con su aliento
Lo están calentando
Lo están calentando
Y el niño está llorando
Y el niño está llorando
Por tanta oscuridad
Por tanta oscuridad

Venid, venid, pastores
Venid, venid, pastores
Venid a Belén
Venid a Belén
A ver a nuestro Rey
A ver a nuestro Rey
Al Niño Jesús
Al Niño Jesús`,
      nivel: "Fácil"
    },
    {
      id: 7,
      titulo: "La Marimorena",
      acordes: "C - G7 - C - C\nF - C - G7 - C\nC - F - C - G7\nC - G7 - C - C",
      letra: `Ande, ande, ande, la marimorena
Ande, ande, ande, que es la Nochebuena
En el portal de Belén
Han entrado los pastores
Han entrado con la pata coja
Y la Virgen se sonríe
Y San José se enoja

Ande, ande, ande, la marimorena
Ande, ande, ande, que es la Nochebuena
En el portal de Belén
Hay estrellas, sol y luna
La Virgen y San José
Y el niño que está en la cuna

Ande, ande, ande, la marimorena
Ande, ande, ande, que es la Nochebuena
Los pastores con sus zurrones
Le llevan al Niño
Quesos, turrones y mantecados
Y el niño está contento
Y el niño está callado

Ande, ande, ande, la marimorena
Ande, ande, ande, que es la Nochebuena
La Virgen está lavando
Y San José tendiendo
Y el niño está llorando
Por ver a los pasteles correr

Ande, ande, ande, la marimorena
Ande, ande, ande, que es la Nochebuena
En el portal de Belén
Gitanillos han entrado
Y le han roto los pañales
Al Niño que ha nacido

Ande, ande, ande, la marimorena
Ande, ande, ande, que es la Nochebuena`,
      nivel: "Intermedio"
    },
    {
      id: 8,
      titulo: "Mi Burrito Sabanero",
      acordes: "G - C - G - D7\nG - C - G - G\nC - G - D7 - G\nG - C - G - D7 - G",
      letra: `Con mi burrito sabanero
Voy camino de Belén
Con mi burrito sabanero
Voy camino de Belén

Si me ven, si me ven
Voy camino de Belén
Si me ven, si me ven
Voy camino de Belén

El lucerito mañanero
Ilumina mi sendero
El lucerito mañanero
Ilumina mi sendero

Si me ven, si me ven
Voy camino de Belén
Si me ven, si me ven
Voy camino de Belén

Con mi cuatrico voy cantando
Mi burrito va trotando
Con mi cuatrico voy cantando
Mi burrito va trotando

Si me ven, si me ven
Voy camino de Belén
Si me ven, si me ven
Voy camino de Belén

Tuki tuki tuki tuki
Tuki tuki tuki ta
Apúrate mi burrito
Que ya vamos a llegar
Tuki tuki tuki tuki
Tuki tuki tuki ta
Apúrate mi burrito
Que ya vamos a llegar

Con mi burrito sabanero
Voy camino de Belén
Con mi burrito sabanero
Voy camino de Belén

Si me ven, si me ven
Voy camino de Belén
Si me ven, si me ven
Voy camino de Belén`,
      nivel: "Fácil"
    }
  ];

  // FUNCIÓN CORREGIDA: Crear fecha en zona horaria local
  const crearFechaLocal = (año, mes, dia) => {
    return new Date(año, mes, dia, 12, 0, 0);
  };

  // GENERAR LAS FECHAS REALES DEL ADVIENTO (30 Nov - 25 Dic)
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
        
        if (hoyNormalizado < inicioAdviento) {
          setDiaAdvientoActual(null);
        } else if (hoyNormalizado > finAdviento) {
          setDiaAdvientoActual(26);
        } else {
          const diffTiempo = hoyNormalizado - inicioAdviento;
          const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24)) + 1;
          setDiaAdvientoActual(diffDias);
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
    
    const temasAdviento = [
      "1er Domingo de Adviento - Esperanza", "La Luz que Viene al Mundo",
      "Preparad el Camino del Señor", "El Amor se Hizo Carne", "Paz en la Tierra",
      "El Mejor Regalo", "La Anunciación a María", "2do Domingo de Adviento - Paz",
      "Inmaculada Concepción", "La Estrella de Belén", "Alabanza y Gozo", "Hogar y Familia",
      "3er Domingo de Adviento - Gozo", "Jesús, Rey Humilde", "Los Ángeles Cantores",
      "Las Profecías se Cumplen", "Caridad y Solidaridad", "4to Domingo de Adviento - Amor",
      "La Noche más Santa", "Sagrada Familia", "Los Regalos de los Magos", "Esperanza Cumplida",
      "Nochebuena", "El Salvador Nace", "Feliz Navidad"
    ];
    
    const accionesAdviento = [
      "Enciende la primera vela de tu corona de Adviento", "Sé luz para alguien con un acto de bondad",
      "Haz un examen de conciencia y prepárate para la confesión", "Muestra amor hoy a un familiar",
      "Haz las paces con alguien hoy", "Agradece a Dios por tres bendiciones específicas hoy",
      "Imita el 'sí' de María en algo que Dios te pida hoy", "Enciende la segunda vela de tu corona",
      "Reza un Ave María con especial devoción", "Sé una 'estrella' que guíe a otros hacia Cristo",
      "Canta o escucha un villancico con el corazón", "Haz algo especial por tu familia hoy",
      "Enciende la tercera vela (rosa) de tu corona", "Practica la humildad en alguna situación hoy",
      "Alaba a Dios con tus propias palabras hoy", "Confía en una promesa de Dios para tu vida",
      "Haz una obra de caridad concreta hoy", "Enciende la cuarta vela de tu corona",
      "Comparte la alegría de la Navidad con alguien", "Reza por tu familia y por todas las familias",
      "Ofrece a Jesús un don espiritual hoy", "Renueva tu esperanza en las promesas de Dios",
      "Asiste a Misa de Gallo y recibe a Jesús en tu corazón", "Celebra el nacimiento de nuestro Salvador",
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
        esDomingo: esDomingo,
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
      
      // Cargar reflexiones por defecto
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
        }
      ];
      
      setReflexionesAdviento(reflexionesPorDefecto);
      
    } catch (error) {
      console.error("❌ Error cargando contenido automático:", error);
      const contenidoPorDefecto = generarContenidoAdviento(null);
      setContenidoAdviento(contenidoPorDefecto);
    }
  };

  // OBTENER DÍA DEL MES
  const getDiaDelMes = (fecha) => {
    return fecha.getDate();
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-4 px-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-purple-600 via-blue-500 to-green-600 bg-clip-text text-transparent">
            Adviento 2025
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-2 font-light">Del 30 de Noviembre al 25 de Diciembre</p>
          {diaAdvientoActual && (
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg border border-purple-200">
              <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm sm:text-base text-purple-700 font-medium">
                {getFechaFormateada(diaActual.fecha)} - Día {diaAdvientoActual} de 26
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
          
          {/* Calendario de Adviento - Ocupa 3 columnas en desktop */}
          <div className="lg:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-purple-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-4 sm:mb-6">
                Calendario de Adviento
              </h2>
              
              {/* Día Actual Expandido */}
              {diaActual && (
                <div className={`bg-gradient-to-br rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 ${
                  diaActual.esDomingo 
                    ? 'from-yellow-200 to-orange-200 border-yellow-400' 
                    : diaActual.eventoLiturgico
                    ? 'from-red-200 to-pink-200 border-red-400'
                    : 'from-blue-200 to-purple-200 border-blue-400'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{diaActual.mensaje}</h3>
                      <div className="flex flex-wrap gap-2">
                        {diaActual.esDomingo && (
                          <span className="inline-block bg-yellow-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                            Domingo de Adviento
                          </span>
                        )}
                        {diaActual.eventoLiturgico && (
                          <span className="inline-block bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                            {diaActual.eventoLiturgico.split(' - ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-purple-700 border border-purple-300 self-start">
                      {getFechaFormateada(diaActual.fecha)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border-l-4 border-blue-500">
                      <h4 className="font-bold text-blue-700 mb-1 text-sm sm:text-base">{diaActual.versiculo}</h4>
                      <p className="text-gray-700 italic text-xs sm:text-sm">"{diaActual.textoVersiculo}"</p>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border-l-4 border-green-500">
                      <h4 className="font-bold text-green-700 mb-1 text-sm sm:text-base">Reflexión</h4>
                      <p className="text-gray-700 text-xs sm:text-sm">{diaActual.reflexion}</p>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border-l-4 border-orange-500">
                      <h4 className="font-bold text-orange-700 mb-1 text-sm sm:text-base">Acción del Día</h4>
                      <p className="text-gray-700 text-xs sm:text-sm">{diaActual.accion}</p>
                    </div>
                  </div>
                </div>
              )}

              {!diaActual && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl sm:rounded-2xl p-6 border-2 border-yellow-300 text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-yellow-700 mb-3">El Adviento aún no comienza</h3>
                  <p className="text-yellow-600 text-sm sm:text-base">
                    El tiempo de Adviento comenzará el <strong className="text-yellow-800">domingo 30 de Noviembre de 2025</strong>.
                  </p>
                </div>
              )}

              {/* Grid de días del Adviento - RESPONSIVE */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                {contenidoAdviento.map((dia) => (
                  <div
                    key={dia.dia}
                    className={`aspect-square rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                      dia.dia === diaAdvientoActual
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white border-white shadow-lg transform scale-105'
                        : dia.dia < diaAdvientoActual
                        ? dia.esDomingo
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white border-white'
                          : dia.eventoLiturgico
                          ? 'bg-gradient-to-br from-red-400 to-pink-400 text-white border-white'
                          : 'bg-gradient-to-br from-green-400 to-emerald-400 text-white border-white'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 text-gray-400'
                    }`}
                    title={`${getFechaFormateada(dia.fecha)}${dia.eventoLiturgico ? '\n' + dia.eventoLiturgico : ''}`}
                  >
                    <span className="text-base sm:text-lg font-bold">
                      {getDiaDelMes(dia.fechaObj)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Ocupa 1 columna en desktop */}
          <div className="space-y-4 sm:space-y-6">
            {/* Villancicos COMPLETOS */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-red-200">
              <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-3 sm:mb-4">
                Villancicos Navideños
              </h2>
              
              <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {villancicos.map(villancico => (
                  <button
                    key={villancico.id}
                    onClick={() => setVillancicoSeleccionado(villancico)}
                    className="w-full text-left bg-red-50 hover:bg-red-100 rounded-lg p-3 transition-all border border-red-200 hover:border-red-300"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-red-800 text-sm sm:text-base">{villancico.titulo}</span>
                      <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded-full">
                        {villancico.nivel}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reflexiones del Adviento */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-green-200">
              <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-3 sm:mb-4">
                Reflexiones
              </h2>
              
              <div className="space-y-3 sm:space-y-4">
                {reflexionesAdviento.map((reflexion, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                    <h3 className="font-bold text-green-800 mb-1 text-sm sm:text-base">{reflexion.titulo}</h3>
                    <p className="text-xs sm:text-sm text-gray-700 mb-2">{reflexion.contenido}</p>
                    <span className="text-xs text-green-600">{reflexion.referencia}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progreso del Adviento */}
            {diaAdvientoActual && (
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-3 text-center">Progreso</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Días completados</span>
                    <span>{diaAdvientoActual - 1}/26</span>
                  </div>
                  <div className="w-full bg-purple-300 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${((diaAdvientoActual - 1) / 26) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm opacity-90">
                    {26 - (diaAdvientoActual - 1)} días restantes
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Villancico */}
        {villancicoSeleccionado && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{villancicoSeleccionado.titulo}</h2>
                  <button 
                    onClick={() => setVillancicoSeleccionado(null)}
                    className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2 sm:mb-3">Acordes</h3>
                    <div className="bg-gray-100 rounded-lg p-3 sm:p-4 font-mono text-sm whitespace-pre-line">
                      {villancicoSeleccionado.acordes}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2 sm:mb-3">Letra Completa</h3>
                    <div className="bg-gray-100 rounded-lg p-3 sm:p-4 text-sm whitespace-pre-line leading-relaxed">
                      {villancicoSeleccionado.letra}
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs sm:text-sm text-yellow-800">
                    <span className="font-bold">Tip:</span> {villancicoSeleccionado.nivel === "Muy Fácil" 
                      ? "Perfecto para principiantes. Practica los acordes básicos." 
                      : villancicoSeleccionado.nivel === "Fácil"
                      ? "Ideal para practicar. Ve lento y disfruta el proceso."
                      : "Desafío intermedio. Perfecto para mejorar tu técnica."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="text-center mt-6 sm:mt-8">
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ← Volver al Home
          </Link>
        </div>
      </div>
    </div>
  );
}