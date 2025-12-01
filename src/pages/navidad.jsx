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
  const [evangelioHoy, setEvangelioHoy] = useState(null);

  // Villancicos con letras COMPLETAS
  const villancicos = [
    {
      id: 1,
      titulo: "Noche de Paz",
      letra: `Noche de Paz, noche de amor
todo duerme en derredor,
entre los astros que expanden su luz,
brilla anunciando al niñito Jesús,
brilla la estrella de Paz [bis].

Noche de amor, noche de Paz,
Jesús nace en un portal,
llene la tierra la paz del Señor,
llene las almas la gracia de Dios,
porque nació el Redentor [bis].

Noche de Paz, noche de amor,
todo canta en derredor,
clara se escucha la voz celestial,
llamando al hombre al pobre portal,
Dios nos ofrece su amor [bis].`,
   
    },
    {
      id: 2,
      titulo: "Campana sobre Campana",
      letra: `La Virgen se está peinando
Entre cortina y cortina
Sus cabellos son de oro
Y el peine de plata fina

Pero mira cómo beben los peces en el río
Pero mira cómo beben por ver al Dios nacido
Beben y beben y vuelven a beber
Los peces en el río por ver a Dios nacer

La Virgen está lavando
Y tendiendo en el romero
Los angelitos cantando
Y el romero florecido

Pero mira cómo beben los peces en el río
Pero mira cómo beben por ver al Dios nacido
Beben y beben y vuelven a beber
Los peces en el río por ver a Dios nacer

La Virgen está lavando
Con muy poquito jabón
Se le picaron las manos
Manos de mi corazón

Pero mira cómo beben los peces en el río
Pero mira cómo beben por ver al Dios nacido
Beben y beben y vuelven a beber
Los peces en el río por ver a Dios nacer`,
 
    },
    {
      id: 4,
      titulo: "Arre Borriquito",
      letra: `Tengo puesto un nacimiento
En un rincón de mi casa
Con pastores y pastoras
Y un palacio en la montaña

Allí vive el rey Herodes
Allí viven sus soldados
Todos están esperando
Que lleguen Los Reyes Magos

Arre borriquito
Arre burro, arre
Anda más de prisa
Que llegamos tarde

Arre borriquito
Vamos a Belén
Que mañana es fiesta
Y al otro también

Arre borriquito
Arre burro, arre
Anda más de prisa
Que llegamos tarde

Arre borriquito
Vamos a Belén
Que mañana es fiesta
Y al otro también

En el cielo hay una estrella
Que a Los Reyes Magos guía
Hacia Belén para ver
A Dios, hijo de María

Cuando pasan los monarcas
Sale la gente al camino
Y alegres se van con ellos
Para ver al tierno niño

Arre borriquito
Arre burro, arre
Anda más de prisa
Que llegamos tarde

Arre borriquito
Vamos a Belén
Que mañana es fiesta
Y al otro también

Arre borriquito
Arre burro, arre
Anda más de prisa
Que llegamos tarde

Arre borriquito
Vamos a Belén
Que mañana es fiesta
Y al otro también

Hacia el portal de Belén
Se dirige un pastorcito
Cantando de esta manera
Para alegrar el camino

Ha nacido el niño Dios
En un portal miserable
Para enseñar a los hombres
La humildad de su linaje

Arre borriquito
Arre burro, arre
Anda más de prisa
Que llegamos tarde

Arre borriquito
Vamos a Belén
Que mañana es fiesta
Y al otro también

Arre borriquito
Arre burro, arre
Anda más de prisa
Que llegamos tarde

Arre borriquito
Vamos a Belén
Que mañana es fiesta
Y al otro también

Arre borriquito
Arre burro, arre
Anda más de prisa
Que llegamos tarde

Arre borriquito
Vamos a Belén
Que mañana es fiesta
Y al otro también`,
    
    },
    {
      id: 6,
      titulo: "Las Posadas",
      letra: ` A. En nombre del cielo
Os pido posada
Pues no puede andar
Mi esposa amada

D. Aquí no es mesón
Sigan adelante
Yo no debo abrir
No sea algún tunante

A. No seas inhumano
Dennos caridad
Que el Dios de los cielos
Os lo premiará

D. Ya se pueden ir
Y no molestar
Porque si me enfado
Los voy a apalear

A. Mi esposa es María
Es Reina del Cielo
Y madre va a ser
Del Divino Verbo

D. ¿Eres tú José?
¿Tu esposa es María?
Entren, peregrinos
No los conocía

A. Dios pague, señores
Vuestra caridad
Y os colme el cielo
De felicidad

Dichosa la casa
Que alegra este día
A la Virgen pura
La hermosa María

D. Entren, Santos Peregrinos, Peregrinos
Reciban este rincón
Aunque pobre la morada, la morada
Os la doy de corazón

T. Entren, Santos Peregrinos, Peregrinos
Reciban este rincón
Aunque pobre la morada, la morada
Os la doy de corazón`,
  
    },
    {
      id: 7,
      titulo: "La Marimorena",
      letra: `Ande, ande, ande, la marimorena
Ande, ande, ande que es la Nochebuena
Ande, ande, ande, la marimorena
Ande, ande, ande que es la Nochebuena

En el portal de Belén, hay estrellas, Sol y Luna
La Virgen y San José, y el Niño que está en la cuna
Todos le llevan al Niño, yo no tengo qué llevarle
Le llevo mi corazón, que en el mundo es lo que vale

Ande, ande, ande, la marimorena
Ande, ande, ande que es la Nochebuena
Ande, ande, ande, la marimorena
Ande, ande, ande que es la Nochebuena

Esta noche es Nochebuena y mañana es Navidad
Dame la bota, María, que me voy a emborrachar
Y si quieres comprar pan más blanco que la azucena
En el portal de Belén, La Virgen es panadera

Ande, ande, ande, la marimorena
Ande, ande, ande que es la Nochebuena
Ande, ande, ande, la marimorena
Ande, ande, ande que es la Nochebuena

Ande, ande, ande, la marimorena
Ande, ande, ande que es la Nochebuena
Ande, ande, ande, la marimorena
Ande, ande, ande que es la Nochebuena

En el portal de Belén, hay una piedra redonda
Donde Cristo puso el pie para subir a la gloria
Pastores, venid, venid, veréis lo que no habéis visto
En el portal de Belén, el nacimiento de Cristo

Ande, ande, ande, la marimorena
Ande, ande, ande que es la Nochebuena
Ande, ande, ande, la marimorena
Ande, ande, ande que es la Nochebuena

Ande, ande, ande, la marimorena
Ande, ande, ande que es la Nochebuena`,
  
    },
    {
      id: 8,
      titulo: "Mi Burrito Sabanero",
      letra: `Con mi burrito sabanero, voy camino de Belén
Con mi burrito sabanero, voy camino de Belén
Si me ven, si me ven, voy camino de Belén
Si me ven, si me ven, voy camino de Belén

El lucerito mañanero ilumina mi sendero
El lucerito mañanero ilumina mi sendero
Si me ven, si me ven, voy camino de Belén
Si me ven, si me ven, voy camino de Belén

Con mi cuatrico, voy cantando, mi burrito va trotando
Con mi cuatrico voy cantando, mi burrito va trotando
Si me ven, si me ven, voy camino de Belén
Si me ven, si me ven, voy camino de Belén

Tuki tuki tuki tuki, tuki tuki tuki ta
Apúrate, mi burrito, que ya vamos a llegar
Tuki tuki tuki tuki, tuki tuki tuki tu
Apúrate, mi burrito, vamos a ver a Jesús

Con mi burrito sabanero, voy camino de Belén
Con mi burrito sabanero, voy camino de Belén
Si me ven, si me ven, voy camino de Belén
Si me ven, si me ven, voy camino de Belén

El lucerito mañanero ilumina mi sendero
El lucerito mañanero ilumina mi sendero
Si me ven, si me ven, voy camino de Belén
Si me ven, si me ven, voy camino de Belén

Con mi cuatrico, voy cantando, mi burrito va trotando
Con mi cuatrico voy cantando, mi burrito va trotando
Si me ven, si me ven, voy camino de Belén
Si me ven, si me ven, voy camino de Belén

Tuki tuki tuki tuki, tuki tuki tuki ta
Apúrate, mi burrito, que ya vamos a llegar
Tuki tuki tuki tuki, tuki tuki tuki tu
Apúrate, mi burrito, vamos a ver a Jesús

Con mi burrito sabanero, voy camino de Belén
Con mi burrito sabanero, voy camino de Belén
Si me ven, si me ven, voy camino de Belén
Si me ven, si me ven, voy camino de Belén

Si me ven, si me ven, voy camino de Belén
Si me ven, si me ven, voy camino de Belén
Si me ven, si me ven, voy camino de Belén
Si me ven, si me ven, voy camino de Belén`,
   
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
    9: "Purifica nuestro corazón, Señor, para recibirte.",
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

  // EVANGELIOS DIARIOS REALES PARA DICIEMBRE 2025
  const evangeliosReales = {
    1: { // Lunes 1 de Diciembre
      lectura: "En aquel tiempo, al entrar Jesús en Cafarnaúm, se le acercó un oficial romano y le dijo: 'Señor, tengo en mi casa un criado que está en cama, paralítico, y sufre mucho'. Él le contestó: 'Voy a curarlo'. Pero el oficial le replicó: 'Señor, yo no soy digno de que entres en mi casa; con que digas una sola palabra, mi criado quedará sano...'",
      referencia: "Mateo 8, 5-11",
      reflexion: "La fe del centurión nos enseña humildad y confianza. En Adviento, reconozcamos que Jesús viene a sanar nuestras vidas con solo una palabra."
    },
    2: { // Martes 2 de Diciembre
      lectura: "En aquella misma hora, Jesús se llenó de júbilo en el Espíritu Santo y exclamó: '¡Yo te alabo, Padre, Señor del cielo y de la tierra, porque has escondido estas cosas a los sabios y a los entendidos, y las has revelado a la gente sencilla!...'",
      referencia: "Lucas 10, 21-24",
      reflexion: "Dios revela sus misterios a los sencillos de corazón. En Adviento, pidamos la gracia de un corazón humilde para acoger a Jesús."
    },
    3: { // Miércoles 3 de Diciembre
      lectura: "En aquel tiempo, llegó Jesús a la orilla del mar de Galilea, subió al monte y se sentó. Acudió a él mucha gente, que llevaba consigo tullidos, ciegos, lisiados, sordomudos y muchos otros enfermos... Jesús tomó los siete panes y los pescados, y habiendo dado gracias a Dios, los partió y los fue entregando...",
      referencia: "Mateo 15, 29-37",
      reflexion: "Jesús multiplica los panes por compasión. En Adviento, Él quiere saciar nuestro hambre espiritual y curar nuestras heridas."
    },
    4: { // Jueves 4 de Diciembre - Día de Santa Bárbara
      lectura: "Jesús dijo: 'No todo el que me diga: ¡Señor, Señor!, entrará en el Reino de los cielos, sino el que cumpla la voluntad de mi Padre, que está en los cielos'.",
      referencia: "Mateo 7, 21.24-27",
      reflexion: "Santa Bárbara, mártir de la fe, nos enseña a construir nuestra vida sobre la roca firme de la voluntad de Dios."
    },
    5: { // Viernes 5 de Diciembre
      lectura: "En aquel tiempo, dos ciegos siguieron a Jesús, gritando: '¡Ten compasión de nosotros, Hijo de David!'... Jesús les preguntó: '¿Creen que puedo hacerlo?' Ellos le contestaron: 'Sí, Señor'. Entonces les tocó los ojos, diciendo: 'Que se haga en ustedes conforme a su fe'.",
      referencia: "Mateo 9, 27-31",
      reflexion: "La fe nos abre los ojos para reconocer a Jesús que viene. En Adviento, gritemos con fe: '¡Ten compasión de nosotros!'"
    },
    6: { // Sábado 6 de Diciembre - Día de San Nicolás
      lectura: "Jesús dijo a la multitud: 'Yo soy la luz del mundo; el que me sigue no caminará en la oscuridad, sino que tendrá la luz de la vida'.",
      referencia: "Juan 8, 12",
      reflexion: "San Nicolás, modelo de caridad, reflejó la luz de Cristo. En Adviento, seamos luz para los que están en tinieblas."
    },
    7: { // Domingo 7 de Diciembre - 2do Domingo de Adviento
      lectura: "En aquel tiempo, Juan el Bautista predicaba en el desierto de Judea, diciendo: 'Conviértanse, porque ya está cerca el Reino de los cielos'... 'Preparen el camino del Señor, enderecen sus senderos'.",
      referencia: "Mateo 3, 1-12",
      reflexion: "Juan Bautista nos llama a preparar el camino para Jesús. Es tiempo de conversión y de allanar los obstáculos que impiden su venida."
    }
  };

  // FUNCIÓN: Obtener hora actual en Honduras (UTC-6)
  const obtenerHoraHonduras = () => {
    const ahora = new Date();
    // Honduras está en UTC-6 (sin horario de verano)
    const offsetHonduras = -6 * 60 * 60 * 1000; // -6 horas en milisegundos
    const horaHonduras = new Date(ahora.getTime() + offsetHonduras);
    return horaHonduras;
  };

  // FUNCIÓN CORREGIDA: Calcular día actual CORRECTO (30 Nov = día 1)
  const obtenerDiaAdvientoCorregido = () => {
    const hoyHonduras = obtenerHoraHonduras();
    const año = 2025;
    
    // Inicio del Adviento: 30 de Noviembre 2025, 00:00 Honduras (día 1)
    const inicioAdviento = new Date(Date.UTC(año, 10, 30, 6, 0, 0)); // 30 Nov 2025, 00:00 Honduras = 06:00 UTC
    
    // Si estamos antes del inicio del Adviento
    if (hoyHonduras < inicioAdviento) {
      return null;
    }
    
    // Fin del Adviento: 25 de Diciembre 2025
    const finAdviento = new Date(Date.UTC(año, 11, 25, 6, 0, 0)); // 25 Dic 2025, 00:00 Honduras
    
    // Si estamos después de Navidad
    if (hoyHonduras > finAdviento) {
      return 26;
    }
    
    // Calcular diferencia en días desde el 30 de Noviembre
    const diffTiempo = hoyHonduras.getTime() - inicioAdviento.getTime();
    const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDias;
  };

  // GENERAR LAS FECHAS REALES DEL ADVIENTO (30 Nov - 25 Dic) con hora Honduras
  const generarFechasAdviento = () => {
    const fechas = [];
    const año = 2025;
    
    // Comenzar el 30 de Noviembre (día 1) - 00:00 Honduras
    for (let i = 0; i < 26; i++) {
      const fecha = new Date(Date.UTC(año, 10, 30 + i, 6, 0, 0)); // 06:00 UTC = 00:00 Honduras
      fechas.push(fecha);
    }
    
    return fechas;
  };

  // Eventos litúrgicos importantes
  const eventosLiturgicosAdviento = {
    "2025-11-30": "1er Domingo de Adviento",
    "2025-12-07": "2do Domingo de Adviento", 
    "2025-12-08": "Inmaculada Concepción",
    "2025-12-14": "3er Domingo de Adviento",
    "2025-12-21": "4to Domingo de Adviento",
    "2025-12-24": "Nochebuena",
    "2025-12-25": "Navidad"
  };

  // Función para manejar la apertura de puertas
  const abrirPuerta = (dia) => {
    if (dia <= diaAdvientoActual) {
      setPuertaAbierta(dia);
    }
  };

  // FUNCIÓN PARA OBTENER EVANGELIO DE HOY
  const obtenerEvangelioHoy = async () => {
    try {
      const dia = obtenerDiaAdvientoCorregido();
      
      // Usar evangelios reales que me diste
      if (dia && evangeliosReales[dia]) {
        return evangeliosReales[dia];
      }
      
      // Fallback general para otros días
      return {
        lectura: "Velad, pues, porque no sabéis el día ni la hora.",
        referencia: "Mateo 25, 13",
        reflexion: "El Adviento nos invita a preparar nuestros corazones para la venida del Salvador."
      };
      
    } catch (error) {
      console.error("Error obteniendo evangelio:", error);
      return {
        lectura: "Estad siempre alegres en el Señor.",
        referencia: "Filipenses 4, 4",
        reflexion: "La alegría del Adviento nace de saber que Dios viene a nuestro encuentro."
      };
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
        
        // OBTENER DÍA CORREGIDO con hora Honduras
        const diaAdviento = obtenerDiaAdvientoCorregido();
        setDiaAdvientoActual(diaAdviento);
        
        // Obtener evangelio de hoy
        const evangelio = await obtenerEvangelioHoy();
        setEvangelioHoy(evangelio);
        
        // Cargar contenido automático
        await cargarContenidoAutomatico(evangelio);
        
      } catch (error) {
        console.error("Error inicializando Adviento:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAdviento();
  }, [navigate]);

  // GENERAR CONTENIDO CON EVANGELIO REAL
  const generarContenidoAdviento = (evangelio) => {
    const diasAdviento = [];
    const fechas = generarFechasAdviento();
    
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
    
    const accionesAdviento = [
      "Enciende la primera vela de tu corona de Adviento", 
      "Sé luz para alguien con un acto de bondad",
      "Haz un examen de conciencia y prepárate para la confesión", 
      "Muestra amor hoy a un familiar",
      "Haz las paces con alguien hoy", 
      "Agradece a Dios por tres bendiciones específicas hoy",
      "Imita el 'sí' de María en algo que Dios te pida hoy", 
      "Enciende la segunda vela de tu corona",
      "Reza un Ave María con especial devoción", 
      "Sé una 'estrella' que guíe a otros hacia Cristo",
      "Canta o escucha un villancico con el corazón", 
      "Haz algo especial por tu familia hoy",
      "Enciende la tercera vela (rosa) de tu corona", 
      "Practica la humildad en alguna situación hoy",
      "Alaba a Dios con tus propias palabras hoy", 
      "Confía en una promesa de Dios para tu vida",
      "Haz una obra de caridad concreta hoy", 
      "Enciende la cuarta vela de tu corona",
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
      
      // USAR EVANGELIO DE HOY SI ESTÁ DISPONIBLE
      let contenidoDia;
      if (esHoy && evangelio) {
        contenidoDia = {
          lectura: evangelio.lectura,
          reflexion: evangelio.reflexion,
          referencia: evangelio.referencia,
          fuente: "📖 Evangelio del Día"
        };
      } else {
        // Para días pasados o futuros
        contenidoDia = evangeliosReales[diaNumero] || {
          lectura: "Velad, pues, porque no sabéis el día ni la hora.",
          reflexion: "El Adviento nos invita a preparar nuestros corazones para la venida del Salvador.",
          referencia: "Mateo 25, 13",
          fuente: "Liturgia del Adviento"
        };
      }

      const esDomingo = fecha.getUTCDay() === 0;
      
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
        eventoLiturgico: eventosLiturgicosAdviento[fechaStr],
        fuente: contenidoDia.fuente
      });
    });
    
    return diasAdviento;
  };

  // CARGAR CONTENIDO AUTOMÁTICO
  const cargarContenidoAutomatico = async (evangelio) => {
    try {
      const contenidoGenerado = generarContenidoAdviento(evangelio);
      setContenidoAdviento(contenidoGenerado);
      
      // Cargar reflexiones
      if (evangelio) {
        const reflexiones = [
          {
            titulo: "Evangelio del Día",
            contenido: evangelio.reflexion,
            referencia: evangelio.referencia,
            fuente: "Palabra de Dios"
          }
        ];
        
        setReflexionesAdviento(reflexiones);
      } else {
        // Reflexiones por defecto
        const reflexionesPorDefecto = [
          {
            titulo: "El Verdadero Sentido del Adviento",
            contenido: "El Adviento es tiempo de espera gozosa. Preparamos nuestros corazones no solo para recordar el nacimiento de Jesús, sino para recibirlo en nuestro presente.",
            referencia: "Isaías 9:6",
            fuente: "Reflexión"
          }
        ];
        setReflexionesAdviento(reflexionesPorDefecto);
      }
      
    } catch (error) {
      console.error("Error cargando contenido:", error);
      const contenidoPorDefecto = generarContenidoAdviento(null);
      setContenidoAdviento(contenidoPorDefecto);
    }
  };

  // OBTENER DÍA DEL MES (corregido para fechas UTC)
  const getDiaDelMes = (fecha) => {
    return fecha.getUTCDate();
  };

  // OBTENER FECHA FORMATEADA (corregido)
  const getFechaFormateada = (fecha) => {
    const opciones = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long'
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
                {diaActual ? getFechaFormateada(diaActual.fechaObj) : "Cargando..."} - Día {diaAdvientoActual} de 26
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
          
          {/* Calendario de Adviento - Ocupa 3 columnas en desktop */}
          <div className="lg:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-purple-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-6">
                Calendario de Adviento
              </h2>
              
              {/* Día Actual Expandido */}
              {diaActual && (
                <div className={`bg-gradient-to-br rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 border-2 ${
                  diaActual.eventoLiturgico
                    ? 'from-red-200 to-pink-200 border-red-400'
                    : 'from-blue-200 to-purple-200 border-blue-400'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{diaActual.mensaje}</h3>
                      <div className="flex flex-wrap gap-2 items-center">
                        {diaActual.eventoLiturgico && (
                          <span className="inline-block bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                            {diaActual.eventoLiturgico}
                          </span>
                        )}
                        {diaActual.fuente && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                            {diaActual.fuente}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-purple-700 border border-purple-300">
                        {getFechaFormateada(diaActual.fechaObj)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-blue-700 text-sm sm:text-base">{diaActual.versiculo}</h4>
                        <span className="text-xs text-blue-500">📖</span>
                      </div>
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

              {!diaActual && diaAdvientoActual === null && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl sm:rounded-2xl p-6 border-2 border-yellow-300 text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-yellow-700 mb-3">El Adviento aún no comienza</h3>
                  <p className="text-yellow-600 text-sm sm:text-base">
                    El tiempo de Adviento comenzará el <strong className="text-yellow-800">domingo 30 de Noviembre de 2025</strong>.
                  </p>
                </div>
              )}

              {diaAdvientoActual === 26 && (
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl sm:rounded-2xl p-6 border-2 border-green-300 text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-green-700 mb-3">¡Feliz Navidad!</h3>
                  <p className="text-green-600 text-sm sm:text-base">
                    El tiempo de Adviento ha concluido. ¡Celebramos el nacimiento de nuestro Salvador!
                  </p>
                </div>
              )}

              {/* GRID DE PUERTAS DEL CALENDARIO */}
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                {contenidoAdviento.map((dia) => {
                  const puedeAbrir = dia.dia <= diaAdvientoActual;
                  
                  return (
                    <div
                      key={dia.dia}
                      className={`aspect-square rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                        puedeAbrir ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-not-allowed opacity-60'
                      } ${
                        dia.dia === diaAdvientoActual
                          ? 'bg-gradient-to-br from-purple-500 to-blue-500 border-white shadow-lg'
                          : dia.dia < diaAdvientoActual
                          ? dia.eventoLiturgico
                            ? 'bg-gradient-to-br from-red-400 to-pink-400 border-white'
                            : 'bg-gradient-to-br from-green-400 to-emerald-400 border-white'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300'
                      }`}
                      onClick={() => abrirPuerta(dia.dia)}
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center p-1">
                        {/* Número del día - SIEMPRE visible */}
                        <span className={`text-lg sm:text-xl font-bold ${
                          dia.dia <= diaAdvientoActual ? 'text-white' : 'text-gray-400'
                        }`}>
                          {getDiaDelMes(dia.fechaObj)}
                        </span>
                        
                        {/* Decoración navideña pequeña */}
                        {dia.dia <= diaAdvientoActual && (
                          <div className="text-white opacity-80 mt-1 text-xs">
                            {dia.dia % 3 === 0 ? '🎄' : 
                             dia.dia % 3 === 1 ? '⭐' : '🕯️'}
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
          <div className="space-y-6">
            {/* Villancicos COMPLETOS */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-red-200">
              <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-4">
                Villancicos Navideños
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {villancicos.map(villancico => (
                  <button
                    key={villancico.id}
                    onClick={() => setVillancicoSeleccionado(villancico)}
                    className="w-full text-left bg-red-50 hover:bg-red-100 rounded-lg p-3 transition-all border border-red-200 hover:border-red-300 hover:shadow-sm"
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
              <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-4">
                Reflexiones del Día
              </h2>
              
              <div className="space-y-4">
                {reflexionesAdviento.map((reflexion, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-green-800 text-sm sm:text-base">{reflexion.titulo}</h3>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                        {reflexion.fuente}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 mb-2">{reflexion.contenido}</p>
                    <span className="text-xs text-green-600">{reflexion.referencia}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progreso del Adviento */}
            {diaAdvientoActual && (
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl sm:rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-3 text-center">Progreso del Adviento</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Días completados</span>
                    <span>{Math.min(diaAdvientoActual - 1, 26)}/26</span>
                  </div>
                  <div className="w-full bg-purple-300 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(Math.min(diaAdvientoActual - 1, 26) / 26) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm opacity-90">
                    {Math.max(0, 26 - (diaAdvientoActual - 1))} días restantes
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
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{villancicoSeleccionado.titulo}</h2>
                  <button 
                    onClick={() => setVillancicoSeleccionado(null)}
                    className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-700 mb-3">Letra Completa</h3>
                    <div className="bg-gray-100 rounded-lg p-4 text-sm whitespace-pre-line leading-relaxed max-h-[60vh] overflow-y-auto">
                      {villancicoSeleccionado.letra}
                    </div>
                  </div>
                  
              
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PARA PUERTAS ABIERTAS */}
        {puertaAbierta && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-amber-100 to-purple-200 rounded-2xl max-w-md w-full max-h-[80vh] overflow-auto border-4 border-amber-300 shadow-2xl">
              
              {/* Encabezado del modal */}
              <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Día {puertaAbierta} de Adviento</h2>
                    <p className="text-amber-200 text-sm">
                      {contenidoAdviento[puertaAbierta-1] && getFechaFormateada(contenidoAdviento[puertaAbierta-1].fechaObj)}
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
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed text-center text-sm">
                    {oracionesAdviento[puertaAbierta]}
                  </p>
                </div>
                
                {/* Acción del día */}
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <h3 className="font-bold text-green-700 mb-2 text-center">Acción para Hoy</h3>
                  <p className="text-gray-700 text-center text-sm">
                    {contenidoAdviento[puertaAbierta-1]?.accion}
                  </p>
                </div>
                
                {/* Decoración navideña */}
                <div className="text-center mt-4 text-2xl animate-pulse">
                  {puertaAbierta % 4 === 0 ? '🎁' : 
                   puertaAbierta % 4 === 1 ? '🌟' :
                   puertaAbierta % 4 === 2 ? '🕊️' : '❤️'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="text-center mt-8">
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ← Volver al Home
          </Link>
        </div>
      </div>
    </div>
  );
}