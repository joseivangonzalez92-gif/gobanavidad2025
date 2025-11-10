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
  const [puertaAbierta, setPuertaAbierta] = useState(null);
  const [diasAbiertos, setDiasAbiertos] = useState(new Set());

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
      acordes: "Prueba en canción",
      letra: `C                 G
En el nombre del Cielo,
G         C
Os pido posada,
C7               F
Pues no puede andar
C     G   C G C
Mi Esposa amada...
 
C            G
Aqui no es meson,
G        C
Sigan adelante,
C7          F
Yo no debo abrir,
C      G     C G C
No sea algun tunante
 
C          G
No seas inhumano,
G          C
Tennos caridad,
C7                 F
Que el Dios de los Cielos,
C     G  C G C
Os lo premiaria...
 
C            G
Ya se pueden ir,
G        C
Y no molestar,
C7             F
Porque si me enfado,
C   G    C G C
Os voy a apalear
 
C            G
Mi esposa es Maria,
G            C
Es Reina del Cielo,
C7             F
Y Madre va a ser
C   G      C G C
Del Divino Verbo...
 
C        G
Eres tu, Jose?
G            C
Tu Esposa es Maria?
C7           F
Entren, Peregrinos,
C      G  C G C
No los conocia
 
C           G
Dios pague, senores,
G           C
Vuestra caridad,
C7            F
Y os colme el Cielo
C  G     C G C
De Felicidad...
 
C          G
Dichosa la casa
G                C
Que alberga este dia
C7          F
A la Virgen Pura,
C  G       C G C
La Hermosa Maria
 
C
Entren, Santos Peregrinos, Peregrinos,
G            C
Reciban este rincon...
C
Que aunque es pobra la morada, la morada,
G            C
Os la doy de Corazon
C
Cantemos con alegria, alegria
G               C
Todos al considerar
C
Que Jesus, Jose, y Maria (y Maria)
G                     C
Nos Vinieron hoy a honrar`,
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

  // ORACIONES PARA CADA DÍA DEL ADVIENTO
  const oracionesAdviento = {
    1: `Señor Jesús, en este primer día de Adviento,\nencendemos la antorcha de la esperanza.\nIlumina nuestros corazones para prepararnos\nde manera digna para tu venida. Amén.`,
    2: `Ven, Luz del mundo,\ndisipa las tinieblas de nuestro corazón\ny guíanos por el camino de la verdad.\nQue tu luz brille en nuestras vidas. Amén.`,
    3: `María, enséñanos a decir "sí"\ncomo tú lo hiciste,\npara que Cristo pueda nacer\nen nuestros corazones cada día. Amén.`,
    4: `Jesús, ayúdanos a preparar el camino\nen nuestros corazones y en nuestro mundo.\nQue seamos instrumentos de tu paz. Amén.`,
    5: `Señor de la paz,\ntranquiliza nuestros corazones agitados\ny danos la serenidad que solo Tú puedes dar\nen medio de las tormentas. Amén.`,
    6: `Dios de amor, enséñanos a amar\ncomo Tú nos amas.\nQue nuestro corazón sea un pesebre\nlisto para recibirte. Amén.`,
    7: `Espíritu Santo, ilumina nuestra fe\ncomo iluminaste a María.\nDanos la gracia de reconocer a Jesús\nen los más necesitados. Amén.`,
    8: `Jesús, Príncipe de la Paz,\nven a reinar en nuestros corazones.\nTransforma nuestras guerras interiores\nen oasis de tu amor. Amén.`,
    9: `María Inmaculada, purifica nuestros corazones\ncomo el tuyo fue purificado.\nPrepáranos para recibir a tu Hijo. Amén.`,
    10: `Estrella de Belén, guíanos\nhacia el verdadero tesoro:\nJesús Eucaristía, nuestro Salvador. Amén.`,
    11: `Señor, llena nuestros labios de alabanza\ny nuestros corazones de gratitud.\nQue todo nuestro ser te glorifique. Amén.`,
    12: `Jesús, bendice nuestras familias.\nQue nuestro hogar sea un pequeño Belén\ndonde Tú puedas nacer cada día. Amén.`,
    13: `Dios de la alegría, inunda nuestro espíritu\nde gozo verdadero que nace de tu amor.\nQue seamos testigos de tu alegría. Amén.`,
    14: `Cristo Rey humilde, enséñanos\nla verdadera humildad del pesebre.\nQue busquemos servir y no ser servidos. Amén.`,
    15: `Ángeles del cielo, unid vuestros cantos\na nuestras oraciones.\nLlevad nuestro amor al Niño Dios. Amén.`,
    16: `Señor, fortalece nuestra esperanza\nen tus promesas.\nQue confiemos plenamente en tu Palabra. Amén.`,
    17: `Jesús, despierta en nosotros\nel deseo de la caridad.\nQue veamos tu rostro en los pobres. Amén.`,
    18: `Dios de amor infinito, expande\nnuestra capacidad de amar.\nQue amemos como Tú nos amas. Amén.`,
    19: `Niño Jesús, en estos días previos\na tu nacimiento, prepara nuestro corazón\npara ser tu morada. Amén.`,
    20: `Sagrada Familia, bendice nuestros hogares.\nDanos la unidad, el amor y la paz\nque caracterizaron vuestra casa. Amén.`,
    21: `Señor, acepta nuestros dones espirituales\ncomo los pastores te ofrecieron\nsu sencillez y amor. Amén.`,
    22: `Dios de la esperanza, renueva\nnuestra confianza en Ti.\nQue esperemos con gozo tu venida. Amén.`,
    23: `En esta Nochebuena, Jesús,\nace en lo más profundo de nuestro ser.\nTransforma nuestra oscuridad en luz. Amén.`,
    24: `¡Niño Dios! Hoy naces para nosotros.\nGracias por el don de tu vida.\nQue nuestro corazón sea tu pesebre. Amén.`,
    25: `¡Gloria a Dios en el cielo!\nY en la tierra paz a los hombres.\nGracias, Jesús, por nacer para salvarnos.\nQue esta Navidad transforme nuestras vidas. Amén.`
  };

  // FRASES CORTAS DE ADVIENTO
  const frasesAdviento = {
    1: "La esperanza es la vela que ilumina nuestro camino hacia Belén.",
    2: "Cada día nos acerca al misterio del Amor que se hizo carne.",
    3: "Preparad el camino del Señor, allanad sus senderos.",
    4: "El Adviento es el tiempo de la espera gozosa.",
    5: "La paz de Cristo reine en nuestros corazones.",
    6: "Dios prepara un corazón puro para nacer en él.",
    7: "María nos enseña a esperar con corazón disponible.",
    8: "La paz comienza con una sonrisa y un corazón reconciliado.",
    9: "Purifica nuestro corazón, Señor, para recibte.",
    10: "Como la estrella, seamos luz que guía hacia Jesús.",
    11: "Alabemos al Señor que viene a salvarnos.",
    12: "La familia es el primer pesebre donde nace Jesús.",
    13: "El gozo del Señor es nuestra fortaleza.",
    14: "Jesús viene como Rey humilde y servidor.",
    15: "Gloria a Dios en el cielo y en la tierra paz.",
    16: "Confiemos en las promesas del Señor.",
    17: "La caridad es el camino excelente hacia Belén.",
    18: "Dios es amor, y quien permanece en el amor permanece en Dios.",
    19: "¡Ya casi está aquí! Preparemos el corazón.",
    20: "La Sagrada Familia, modelo de amor y entrega.",
    21: "Ofrezcamos a Jesús lo mejor de nosotros mismos.",
    22: "Mantengamos viva la llama de la esperanza.",
    23: "¡Feliz Nochebuena! El Salvador ya está aquí.",
    24: "Hoy nos ha nacido un Salvador: el Mesías, el Señor.",
    25: "¡Feliz Navidad! Hoy nos ha nacido el Salvador."
  };

  // FUNCIÓN MEJORADA: Crear fecha en zona horaria de Honduras (UTC-6)
  const crearFechaLocal = (año, mes, dia) => {
    // Honduras está en UTC-6, creamos la fecha ajustada
    const fecha = new Date(año, mes, dia, 12, 0, 0); // Medio día para evitar problemas de zona horaria
    return fecha;
  };

  // GENERAR LAS FECHAS REALES DEL ADVIENTO (30 Nov - 25 Dic)
  const generarFechasAdviento = () => {
    const fechas = [];
    const inicio = crearFechaLocal(2025, 10, 30); // Noviembre es mes 10 (0-indexed)
    const fin = crearFechaLocal(2025, 11, 25);    // Diciembre es mes 11
    
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

  // Función para manejar la apertura de puertas
  const abrirPuerta = (dia) => {
    if (dia <= diaAdvientoActual) {
      setPuertaAbierta(dia);
      setDiasAbiertos(prev => {
        const nuevoSet = new Set(prev);
        nuevoSet.add(dia);
        return nuevoSet;
      });
    }
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
        
        // Calcular día actual de Adviento con zona horaria Honduras
        const hoy = new Date();
        // Ajustar a zona horaria de Honduras (UTC-6)
        const hoyHonduras = new Date(hoy.getTime() - (6 * 60 * 60 * 1000));
        const hoyNormalizado = crearFechaLocal(hoyHonduras.getFullYear(), hoyHonduras.getMonth(), hoyHonduras.getDate());
        
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
    const opciones = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      timeZone: 'America/Tegucigalpa'
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  };

  // Obtener el día actual del Adviento
  const diaActual = contenidoAdviento.find(dia => dia.dia === diaAdvientoActual);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando el Advierto...</p>
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

              {/* NUEVO GRID DE PUERTAS DEL CALENDARIO */}
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                {contenidoAdviento.map((dia) => {
                  const estaAbierto = diasAbiertos.has(dia.dia);
                  const puedeAbrir = dia.dia <= diaAdvientoActual;
                  
                  return (
                    <div
                      key={dia.dia}
                      className={`aspect-square rounded-lg sm:rounded-xl border-2 transition-all duration-500 cursor-pointer ${
                        puedeAbrir 
                          ? 'hover:scale-105 hover:shadow-lg' 
                          : 'cursor-not-allowed opacity-60'
                      } ${
                        dia.dia === diaAdvientoActual
                          ? 'bg-gradient-to-br from-purple-500 to-blue-500 border-white shadow-lg'
                          : dia.dia < diaAdvientoActual
                          ? dia.esDomingo
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-400 border-white'
                            : dia.eventoLiturgico
                            ? 'bg-gradient-to-br from-red-400 to-pink-400 border-white'
                            : 'bg-gradient-to-br from-green-400 to-emerald-400 border-white'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300'
                      }`}
                      onClick={() => abrirPuerta(dia.dia)}
                    >
                      {/* PUERTA DEL CALENDARIO */}
                      <div className={`relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden ${
                        estaAbierto ? 'puerta-abierta' : 'puerta-cerrada'
                      }`}>
                        
                        {/* LADO FRONTAL - PUERTA CERRADA */}
                        {!estaAbierto && (
                          <div className="w-full h-full flex flex-col items-center justify-center p-1">
                            {/* Número del día */}
                            <span className={`text-lg sm:text-xl font-bold ${
                              puedeAbrir ? 'text-white' : 'text-gray-400'
                            }`}>
                              {getDiaDelMes(dia.fechaObj)}
                            </span>
                            
                            {/* Decoración navideña pequeña */}
                            {puedeAbrir && (
                              <div className="text-white opacity-80 mt-1 text-xs">
                                {dia.dia % 3 === 0 ? '🎄' : 
                                 dia.dia % 3 === 1 ? '⭐' : '🕯️'}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* LADO INTERIOR - CONTENIDO AL ABRIR */}
                        {estaAbierto && (
                          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-yellow-100 p-2 overflow-y-auto">
                            <div className="text-center">
                              {/* Número del día */}
                              <div className="text-xs text-amber-600 font-bold mb-1">
                                Día {dia.dia}
                              </div>
                              
                              {/* Frase del día */}
                              <p className="text-xs text-amber-800 italic leading-tight mb-2">
                                "{frasesAdviento[dia.dia] || 'Ven, Señor Jesús, no tardes.'}"
                              </p>
                              
                              {/* Oración */}
                              <div className="bg-white/70 rounded p-1 mb-1">
                                <p className="text-[10px] leading-tight text-amber-900 whitespace-pre-line">
                                  {oracionesAdviento[dia.dia] || 'Ven, Señor Jesús.'}
                                </p>
                              </div>
                              
                              {/* Acción del día mini */}
                              <div className="bg-green-50 rounded p-1 border-l-2 border-green-400">
                                <p className="text-[9px] leading-tight text-green-800">
                                  {dia.accion}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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

        {/* NUEVO MODAL PARA PUERTAS ABIERTAS */}
        {puertaAbierta && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-amber-100 to-yellow-200 rounded-2xl max-w-md w-full max-h-[80vh] overflow-auto border-4 border-amber-300 shadow-2xl">
              
              {/* Encabezado del modal con estilo navideño */}
              <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Día {puertaAbierta}</h2>
                    <p className="text-amber-200 text-sm">
                      {getFechaFormateada(contenidoAdviento[puertaAbierta-1]?.fecha)}
                    </p>
                  </div>
                  <button 
                    onClick={() => setPuertaAbierta(null)}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {/* Contenido del modal */}
              <div className="p-6">
                {/* Frase destacada */}
                <div className="bg-white/80 rounded-xl p-4 mb-4 border-l-4 border-amber-500">
                  <p className="text-lg italic text-amber-800 text-center">
                    "{frasesAdviento[puertaAbierta]}"
                  </p>
                </div>
                
                {/* Oración */}
                <div className="bg-amber-50 rounded-xl p-4 mb-4 border-2 border-amber-200">
                  <h3 className="font-bold text-amber-700 mb-2 text-center">Oración del Día</h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed text-center">
                    {oracionesAdviento[puertaAbierta]}
                  </p>
                </div>
                
                {/* Acción del día */}
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <h3 className="font-bold text-green-700 mb-2 text-center">💝 Acción para Hoy</h3>
                  <p className="text-gray-700 text-center">
                    {contenidoAdviento[puertaAbierta-1]?.accion}
                  </p>
                </div>
                
                {/* Decoración navideña */}
                <div className="text-center mt-4 text-2xl">
                  {puertaAbierta % 4 === 0 ? '🎁' : 
                   puertaAbierta % 4 === 1 ? '🌟' :
                   puertaAbierta % 4 === 2 ? '🕊️' : '❤️'}
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