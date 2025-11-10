// src/components/Juegos.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

const JuegoSimple = ({ 
  juegoId, 
  usuarioActual, 
  volverASeleccion,
  guardarEnRanking,
  obtenerMejorPuntuacionPersonal 
}) => {
  const [estado, setEstado] = useState("jugando");
  const [puntuacion, setPuntuacion] = useState(0);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [rachas, setRachas] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [puntosGanados, setPuntosGanados] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [preguntasSession, setPreguntasSession] = useState([]);
  const tiempoRespuestaRef = useRef(null);

  const [mejorPuntuacion, setMejorPuntuacion] = useState(0);
  const [mejorPuntuacionCargada, setMejorPuntuacionCargada] = useState(false);
  const [juegoHoyJugado, setJuegoHoyJugado] = useState(false);

  // REGLA: Verificar si ya jugó hoy - SOLO PARA JUEGOS DE PREGUNTAS
  useEffect(() => {
    const verificarJuegoHoy = () => {
      // Memory no tiene restricción
      if (juegoId === "memory") return false;
      
      const hoy = new Date().toLocaleDateString('es-HN');
      const juegosHoy = JSON.parse(localStorage.getItem('juegosHoy') || '{}');
      return juegosHoy[juegoId] === hoy;
    };
    
    setJuegoHoyJugado(verificarJuegoHoy());
  }, [juegoId]);

  // Cargar mejor puntuación al iniciar
  useEffect(() => {
    const cargarMejorPuntuacion = async () => {
      const mejor = await obtenerMejorPuntuacionPersonal(juegoId);
      setMejorPuntuacion(mejor);
      setMejorPuntuacionCargada(true);
    };
    cargarMejorPuntuacion();
  }, [juegoId]);

  // Banco grande de preguntas (25 por juego)
  const getBancoGrande = () => {
    const bancos = {
      peliculas: {
        titulo: "🎬 Adivina la Película",
        preguntas: [
       [
  { pregunta: "🐭🐱🏃‍♂️💥", opciones: ["Tom y Jerry", "Pinky y Cerebro", "Sylvester y Tweety", "Itchy y Scratchy"], respuesta: "Tom y Jerry" },
  { pregunta: "👧🎒🦊🗺️", opciones: ["Dora la Exploradora", "Go Diego Go", "Maya la Abeja", "Las Tres Mellizas"], respuesta: "Dora la Exploradora" },
  { pregunta: "🍌👕🛏️🎵", opciones: ["Bananas en Pijamas", "Los Backyardigans", "Los Teletubbies", "Barney y sus amigos"], respuesta: "Bananas en Pijamas" },
  { pregunta: "👦⌚🦸‍♂️💚", opciones: ["Ben 10", "Danny Phantom", "Static Shock", "Los Jóvenes Titanes"], respuesta: "Ben 10" },
  { pregunta: "🐶💜😨👵👴", opciones: ["Coraje el Perro Cobarde", "Scooby-Doo", "Pluto", "Goofy"], respuesta: "Coraje el Perro Cobarde" },
  { pregunta: "👦🏽🍂🏙️🏈", opciones: ["Hey Arnold", "Doug", "As Told by Ginger", "Recess"], respuesta: "Hey Arnold" },
  { pregunta: "👨‍🏫📚🎨🏫", opciones: ["Zona Tiza", "El Club de los Tigritos", "La Banda del Patio", "Los Simpson"], respuesta: "Zona Tiza" },
  { pregunta: "👶👶👶🚼", opciones: ["Rugrats", "Los Picapiedra", "Los Supersónicos", "Los Thornberrys"], respuesta: "Rugrats" },
  { pregunta: "🐻🏠🔵🌳", opciones: ["El Oso y la Casa Azul", "Winnie the Pooh", "Yogi Bear", "Los Picapiedra"], respuesta: "El Oso y la Casa Azul" },
  { pregunta: "🤖🔴🌀🏠", opciones: ["Rolie Polie Olie", "Los Robots", "Astro Boy", "Megaman"], respuesta: "Rolie Polie Olie" },
  { pregunta: "🌈📺👶🍼", opciones: ["Teletubbies", "Barney", "Los Backyardigans", "Pocoyó"], respuesta: "Teletubbies" },
  { pregunta: "💪🔴🏃‍♂️🍎", opciones: ["Lazy Town", "Los Deportivos", "Los Campeones", "Rocket Power"], respuesta: "Lazy Town" },
  { pregunta: "👧🏼🎓📱🏰", opciones: ["Zoey 101", "iCarly", "Hannah Montana", "Lizzie McGuire"], respuesta: "Zoey 101" },
  { pregunta: "👦👦🏨🎪", opciones: ["Zack y Cody", "Drake & Josh", "Los Hermanos Hardy", "Kenan & Kel"], respuesta: "Zack y Cody" },
  { pregunta: "👦🧠🚀💡", opciones: ["Jimmy Neutrón", "Dexter's Laboratory", "Phineas y Ferb", "Los Sustitutos"], respuesta: "Jimmy Neutrón" },
  { pregunta: "💪👓💇‍♂️😎", opciones: ["Johnny Bravo", "He-Man", "Thor", "Superman"], respuesta: "Johnny Bravo" },
  { pregunta: "👧📹🌐🎬", opciones: ["iCarly", "Hannah Montana", "Lizzie McGuire", "Drake & Josh"], respuesta: "iCarly" },
  { pregunta: "👦👦🔺🔧🎢", opciones: ["Phineas y Ferb", "Jimmy Neutrón", "Los Sustitutos", "Dexter's Laboratory"], respuesta: "Phineas y Ferb" },
  { pregunta: "🐕🔍👣💙", opciones: ["Pistas de Blue", "Paw Patrol", "Go Diego Go", "Dora la Exploradora"], respuesta: "Pistas de Blue" },
  { pregunta: "👦🤖👽🦍👧", opciones: ["Jóvenes Titanes", "Los Vengadores", "Liga de la Justicia", "X-Men"], respuesta: "Jóvenes Titanes" },
  { pregunta: "🏀👦🏙️🎵", opciones: ["Chicos del Barrio", "Los Fresh Prince", "Kenan & Kel", "Moesha"], respuesta: "Chicos del Barrio" },
  { pregunta: "👦👧💀😈", opciones: ["Billy y Mandy", "Scooby-Doo", "Casper", "Los Cazafantasmas"], respuesta: "Billy y Mandy" },
  { pregunta: "👦👧🔬🧪💥", opciones: ["Dexter's Laboratory", "Jimmy Neutrón", "Phineas y Ferb", "Los Sustitutos"], respuesta: "Dexter's Laboratory" },
{ pregunta: "👧👧👧🎀💖", opciones: ["Las Winx", "W.I.T.C.H.", "Lolirock", "Sailor Moon"], respuesta: "Las Winx" },
{ pregunta: "👦🦇🌃🦸‍♂️", opciones: ["Batman", "Spiderman", "Superman", "Iron Man"], respuesta: "Batman" },
{ pregunta: "👦👦🎤🎸🎵", opciones: ["Drake & Josh", "Kenan & Kel", "The Hardy Boys", "Zack & Cody"], respuesta: "Drake & Josh" },
{ pregunta: "👧👑🏰🐸💋", opciones: ["La Princesa y el Sapo", "Shrek", "Frozen", "Cenicienta"], respuesta: "La Princesa y el Sapo" },
  { pregunta: "🟢🔴🧚‍♂️✨", opciones: ["Los Padrinos Mágicos", "Fairy OddParents", "Sabrina", "Hechiceras"], respuesta: "Los Padrinos Mágicos" },
  { pregunta: "👧👧👧💪", opciones: ["Las Chicas Superpoderosas", "Las Winx", "W.I.T.C.H.", "Lolirock"], respuesta: "Las Chicas Superpoderosas" },
  { pregunta: "🧽🍍🏠🌊", opciones: ["Bob Esponja", "Los Padrinos Mágicos", "La Vida Moderna de Rocko", "Los Simpson"], respuesta: "Bob Esponja" },
  { pregunta: "🦛🦌🐧🎵", opciones: ["Los Backyardigans", "Los Backyardigans", "Wonder Pets", "Little Einsteins"], respuesta: "Los Backyardigans" },
  { pregunta: "👦🛹🚲🏄‍♂️🌊", opciones: ["Rocket Power", "Sk8", "Rocket Power", "Los Deportivos"], respuesta: "Rocket Power" },
  { pregunta: "👦🔵⬆️🌪️", opciones: ["Avatar: La Leyenda de Aang", "Dragon Ball", "Naruto", "One Piece"], respuesta: "Avatar: La Leyenda de Aang" }
]
        ]
      },
      canciones: {
        titulo: "🎵 Completa la Canción",
        preguntas: [
         { pregunta: "Feliz año nuevo a todos, pero no tan ____", opciones: ["feliz", "alegre", "bueno", "festejado"], respuesta: "feliz" },
  { pregunta: "¿Te digo la verdad? Te extraño el ____ y en la navidad", opciones: ["14", "24", "31", "1ero"], respuesta: "14" },
  { pregunta: "Te dieron un ____ a las 12 y no fui yo quien te lo di", opciones: ["beso", "abrazo", "regalo", "anillo"], respuesta: "beso" },
  { pregunta: "Año nuevo, ____", opciones: ["vida nueva", "vieja nueva", "suerte nueva", "casa nueva"], respuesta: "vida nueva" },
  { pregunta: "Feliz, feliz navidad, te deseo de ____", opciones: ["corazón", "amor", "alma", "verdad"], respuesta: "corazón" },
  { pregunta: "Mi burrito sabanero va camino de ____", opciones: ["Belén", "la sierra", "la arena", "la loma"], respuesta: "Belén" },
  { pregunta: "Campana sobre campana, y sobre campana una, ¿asómate a la ____?", opciones: ["ventana", "reja", "esquina", "puerta"], respuesta: "ventana" },
  { pregunta: "Navidad, qué bonito es, todo el mundo con su ____", opciones: ["amor", "verdad", "dolor", "fe"], respuesta: "dolor" },
  { pregunta: "¡Ande, Ande, Ande  la ____!", opciones: ["fiesta", "calle", "noche", "marimorena"], respuesta: "marimorena" },
  { pregunta: "Ven a mi casa esta navidad, que ya está todo ____", opciones: ["preparado", "cocinado", "helado", "iluminado"], respuesta: "preparado" },
  { pregunta: "Pero mira cómo beben los peces en el ____", opciones: ["río", "mar", "lago", "charco"], respuesta: "río" },
  { pregunta: "Esta noche es navidad, vamos a ____", opciones: ["rockear", "gritar", "llorar", "gozar"], respuesta: "rockear" },
  { pregunta: "Navidad sin ti, no es ____", opciones: ["navidad", "nada", "feliz", "igual"], respuesta: "navidad" },
  { pregunta: "Yo soy un pobre tamborilero, toco el ____", opciones: ["tambor", "bombo", "piano", "acordeón"], respuesta: "tambor" },
  { pregunta: "Esta noche es de ____, vamos a celebrar", opciones: ["navidad", "alegría", "amor", "fiesta"], respuesta: "navidad" },
  { pregunta: "Noche de paz, noche de ____", opciones: ["amor", "fe", "alegría", "silencio"], respuesta: "amor" },
  { pregunta: "En estas navidades quiero ____", opciones: ["bailar", "cantar", "reír", "amar"], respuesta: "bailar" },
  { pregunta: "¡Ay, Dios! No hay cama pa' tanta ____", opciones: ["gente", "cosa", "felicidad", "persona"], respuesta: "gente" },
  { pregunta: "El año viejo se nos va, llega el año ____", opciones: ["nuevo", "feliz", "bueno", "lindo"], respuesta: "nuevo" },
  { pregunta: "Esta noche es nochebuena, mañana será ____", opciones: ["navidad", "año nuevo", "día", "fiesta"], respuesta: "navidad" },
  { pregunta: "Diciembre me gustó para que te ____", opciones: ["vayas", "vengas", "quedes", "rías"], respuesta: "vayas" },
  { pregunta: "Arbolito lindo de navidad,  ____", opciones: ["Qué me vas a dar", "Dame mucha paz", "Regalos me traeras", "Brilla sin cesar"], respuesta: "Qué me vas a dar" },
  { pregunta: "Los pastores a Belén corren ____", opciones: ["presurosos", "alegres", "cantando", "dormidos"], respuesta: "presurosos" },
  { pregunta: "Faltan cinco pa' las doce,  ____", opciones: ["llega navidad", "e año va a terminar", "a brindar", "a cenar"], respuesta: "el año va a terminar" },
  { pregunta: "Triste navidad, sin ____", opciones: ["ti", "amor", "alegría", "regalos"], respuesta: "ti" },
  { pregunta: "Quiero pasar la navidad con mi ____", opciones: ["gente", "amor", "familia", "pareja"], respuesta: "gente" },
  { pregunta: "Feliz navidad, feliz navidad, te deseo de ____", opciones: ["corazón", "alma", "amor", "verdad"], respuesta: "corazón" },
  { pregunta: "Esta noche Santa Claus va a ____", opciones: ["bailar", "reír", "cantar", "dormir"], respuesta: "bailar" },
  { pregunta: "Veinticuatro de diciembre, noche de ____", opciones: ["alegría", "amor", "paz", "fiesta"], respuesta: "alegría" },
  { pregunta: "Jingle bells, jingle bells, jingle all the ____", opciones: ["way", "day", "night", "time"], respuesta: "way" },
   { pregunta: "Naranjas y Limas,  ____", opciones: ["Limas y Limones", "Fresas y Melones", "Tamales y Ronpopo", "Fresco y Chicharrones"], respuesta: "Limas y Limones" },
  { pregunta: "Tú serás mi ____", opciones: ["navidad", "verdad", "felicidad", "realidad"], respuesta: "navidad" }
        ]
      },
      quiz: {
        titulo: "❓ Trivia Familiar Goba",
        preguntas: [
          { pregunta: "¿Es la película favorita navideña de Olivia?", opciones: ["El regaldo prometido", "santaclausula", "mi pobre angelito", "Story Bots de Navidad"], respuesta: "Story Bots de Navidad" },
          { pregunta: "¿Es la comida favorita Navideña de Montserrat", opciones: ["Recalentado de cerdo", "Galletas Navideñas", "Montucas", "Tamal"], respuesta: "Recalentado de cerdo" },
          { pregunta: "¿Comida favorita de Valeria?", opciones: ["Costilla agridulce", "Tamales", "Cerdo Horneado", "Montucas"], respuesta: "Tamales" },
          { pregunta: "¿Cuando come tamales José Iván?", opciones: ["Solo en Navidad", "En fechas especiales", "Cuando le invitan", "Cualquier día del año"], respuesta: "Solo en Navidad" },
          { pregunta: "¿Canción navideña favorita de Valeria?", opciones: ["Piano Merengue", "Navidad sin tí", "Feliz Navidad", "Aquellos Diciembres"], respuesta: "Piano Merengue" },
          { pregunta: "¿Costumbre navideña de navidades pasadas de valeria?", opciones: ["Pijamada con primas", "Volar Cometas", "Ir al mercado", "Ver películas todo el día"], respuesta: "Pijamada con primas" },
          { pregunta: "¿Película favorita de Valeria?", opciones: ["Los fantasmas de scrooge", "Jingle All the way", "Intercambio de princesas", "Home Alone"], respuesta: "Los fantasmas de scrooge" },
          { pregunta: "¿Comida navideña favorita de Andrés?", opciones: ["Recalentado de Cerdo", "Pavo Horneado", "Tamalitos", "Gallina Rellena"], respuesta: "Recalentado de Cerdo" },
          { pregunta: "¿Canción navideña favorita de Andrés?", opciones: ["Cantares de Navidad", "El Tamborilero", "Pitorro de Coco", "Navidad sin tí"], respuesta: "Cantares de Navidad" },
          { pregunta: "¿Costumbre de navidades pasadas de Andrés?", opciones: ["Amanecer con los sobrevivientes", "Hacer galletas", "Cocina Pierna Horneada", "Comer"], respuesta: "Amanecer con los sobrevivientes" },
          { pregunta: "¿Costumbre de navidades pasadas de Raquel?", opciones: ["Bailar toda la noche", "Kareokear", "Cocina la pierna de cerdo", "Decorar la casa"], respuesta: "Bailar toda la noche" },
          { pregunta: "¿Postre favorito de José Iván", opciones: ["Cheese Cake", "Pastel de chocolate", "Tiramisu", "Torrejas"], respuesta: "Cheese Cake" },
          { pregunta: "¿Costumbre de navidades pasdadas de José Iván?", opciones: ["Reventar cohetes", "Ver tele todo el día", "ir a la playa", "Ayudar a cocinar"], respuesta: "Reventar cohetes" },
          { pregunta: "¿Película navideña favorita de Raquel?", opciones: ["Una navidad de locos", "Intercambio de princesas 3", "Mickey en navidad", "Estrella navideña"], respuesta: "Una navidad de locos" },
          { pregunta: "¿Canción navideña favorita de Olivia?", opciones: ["Navidad Rock", "Cascabel", "El año viejo", "Peces en el rio"], respuesta: "Navidad Rock" },
          { pregunta: "¿Canción navideña favorita de Raquel?", opciones: ["El año viejo", "Campana sobre campana", "Mi Burrito Sabanero", "Los Peces en el Río"], respuesta: "El año viejo" },
          { pregunta: "¿Comida navideña favorita de Raquel?", opciones: ["Cerdo Horneado", "Gallina Rellena", "Tamales", "Costilla Horneada"], respuesta: "Cerdo Horneado " },
          { pregunta: "¿Los mejores complementos para el cerdo horneado para Mariana?", opciones: ["Ensalada de papa y Arroz", "Ensalda y Arroz", "Pure y Arroz", "Arroz y Tamal"], respuesta: "Ensalada de papa y Arroz" },
          { pregunta: "¿Película favorita de Mariana?", opciones: ["El grinch", "Home Alone", "Navidad Catracha", "Navidad con los Miller"], respuesta: "El grinch" },
          { pregunta: "¿Canción navideña favorita de Mariana?", opciones: ["La Marimorena", "Ven a cantar", "El Tamborilero", "Aquellos Diciembres"], respuesta: "La Marimorena" },
          { pregunta: "¿Película favorita de Montserrat?", opciones: ["Mickey descubre la navidad", "Expresso Polar", "Elf", "Mi pobre angelito"], respuesta: "Mickey descubre la navidad" },
          { pregunta: "¿Canción navideña favorita de Montserrat?", opciones: ["Noche de Paz", "Navidad Rock", "Dulce navidad", "Santa Claus"], respuesta: "Noche de Paz" },
          { pregunta: "¿Comida favorita de JP?", opciones: ["Pollo en salsa de hongos", "Pavo horneado", "Lasagna", "Costillas BBQ"], respuesta: "Pollo en salsa de hongos" },
          { pregunta: "¿Costumbre navideña de JP?", opciones: ["Sandwich de pollo de abuela", "Abrir regalos a media noche", "Ver luces navideñas", "Cantar villancicos"], respuesta: "Sandwich de pollo de abuela" },
          { pregunta: "¿Costumbre de navidades pasadas de Ruth?", opciones: ["Amanecer bailando", "Cocinar tamales", "Ver películas", "Hacer galletas"], respuesta: "Amanecer bailando" }
        ]
      },
      familia: {
        titulo: "Completa el Refrán!!",
        preguntas: [
          { pregunta: "Camarón que se duerme...", opciones: ["Se lo lleva la corriente", "Se lo come el pez", "Se despierta tarde", "No desayuna"], respuesta: "Se lo lleva la corriente" },
  { pregunta: "Al mal tiempo...", opciones: ["Buena cara", "Paciencia", "Resignación", "Esperanza"], respuesta: "Buena cara" },
  { pregunta: "Dime con quien andas...", opciones: ["Y te diré quién eres", "Y te diré adónde vas", "Y te diré qué haces", "Y te diré cómo estás"], respuesta: "Y te diré quién eres" },
  { pregunta: "Arbol que nace torcido...", opciones: ["Jamás su rama endereza", "Siempre será torcido", "Nunca dará frutos", "Crecerá inclinado"], respuesta: "Jamás su rama endereza" },
  { pregunta: "Aprendiz de mucho...", opciones: ["Maestro de nada", "Sabe de todo", "Nunca aprende", "Mucho trabaja"], respuesta: "Maestro de nada" },
  { pregunta: "El que tiene vergüenza...", opciones: ["Ni come, ni almuerza", "No progresa", "Siempre pierde", "Nunca gana"], respuesta: "Ni come, ni almuerza" },
  { pregunta: "El que sabe sabe...", opciones: ["Y el que no inventa", "Y el que no calla", "Y el que no aprende", "Y el que no entiende"], respuesta: "Y el que no inventa" },
  { pregunta: "Gallo que no canta...", opciones: ["Algo tiene en la garganta", "No es gallo", "Está enfermo", "No tiene dueño"], respuesta: "Algo tiene en la garganta" },
  { pregunta: "No hay que dure 100 años...", opciones: ["Ni cuerpo que lo aguante", "Ni vida eterna", "Ni juventud perpetua", "Ni salud completa"], respuesta: "Ni cuerpo que lo aguante" },
  { pregunta: "Quien da pan a perro ajeno...", opciones: ["Pierde el pan y el perro", "Gana un amigo", "Pierde su tiempo", "No tiene perro"], respuesta: "Pierde el pan y el perro" },
  { pregunta: "Pa dar una vuelta...", opciones: ["Cualquier bicicleta es buena", "Cualquier camino sirve", "Cualquier día es bueno", "Cualquier hora vale"], respuesta: "Cualquier bicicleta es buena" },
  { pregunta: "La ropa sucia...", opciones: ["Se lava en casa", "No se muestra", "Se esconde bien", "Se tira lejos"], respuesta: "Se lava en casa" },
  { pregunta: "Tropezando y cayendo...", opciones: ["Se va aprendiendo", "Se hace camino", "Se conoce la vida", "Se gana experiencia"], respuesta: "Se va aprendiendo" },
  { pregunta: "A Dios rogando...", opciones: ["Y con el mazo dando", "Y con fe esperando", "Y con paciencia orando", "Y con amor trabajando"], respuesta: "Y con el mazo dando" },
  { pregunta: "Al no haber pan...", opciones: ["Tortillas", "Buenas son galletas", "Bueno es el arroz", "Buenas son frutas"], respuesta: "Tortillas" },
  { pregunta: "El que tenga tienda...", opciones: ["Que la atienda, o sino que la venda", "Que la cuide bien", "Que no la descuide", "Que la mantenga"], respuesta: "Que la atienda, o sino que la venda" },
  { pregunta: "Cría cuervos...", opciones: ["Y te sacarán los ojos", "Y te comerán el pan", "Y te quitarán el sueño", "Y te robarán el alma"], respuesta: "Y te sacarán los ojos" },
  { pregunta: "El que quiera comer pescado...", opciones: ["Que se moje el", "Que vaya al mar", "Que aprenda a pescar", "Que compre fresco"], respuesta: "Que se moje el" },
  { pregunta: "Haz el bien...", opciones: ["Y no mires a quien", "Sin esperar nada", "Con todo corazón", "Siempre y cuando"], respuesta: "Y no mires a quien" },
  { pregunta: "Lo que Juan dice de Pedro...", opciones: ["Dice más de Juan que de Pedro", "Habla mal de ambos", "No tiene importancia", "Es puro chisme"], respuesta: "Dice más de Juan que de Pedro" },
  { pregunta: "De las aguas mansas...", opciones: ["Líbreme señor, que de las turbias me libro yo", "Cuidado con ellas", "No te confíes", "Son peligrosas"], respuesta: "Líbreme señor, que de las turbias me libro yo" },
  { pregunta: "En tiempos de guerra...", opciones: ["Cualquier agujero es trinchera", "Todo vale", "No hay reglas", "Se improvisa"], respuesta: "Cualquier agujero es trinchera" },
  { pregunta: "El que no conoce a Dios...", opciones: ["A cualquier santo le reza", "En cualquier cosa cree", "No tiene fe", "Busca respuestas"], respuesta: "A cualquier santo le reza" },
  { pregunta: "De lo que escuches nada...", opciones: ["Y de lo que veas la mitad", "Y de lo que hables poco", "Y de lo que creas menos", "Y de lo que sepas todo"], respuesta: "Y de lo que veas la mitad" },
  { pregunta: "De poeta y locos...", opciones: ["Todos tenemos un poco", "Nadie se salva", "El mundo está lleno", "Es difícil distinguir"], respuesta: "Todos tenemos un poco" },
  { pregunta: "Del árbol caído...", opciones: ["Todos hacen leña", "Todos recogen frutas", "Todos se alejan", "Todos tienen sombra"], respuesta: "Todos hacen leña" },
  { pregunta: "En boca cerrada...", opciones: ["No entran moscas", "No hay dolor", "No hay risa", "No salen palabras"], respuesta: "No entran moscas" },
  { pregunta: "Muerto el perro...", opciones: ["Se acaba la rabia", "Se acabó el problema", "Todo termina", "Ya no hay peligro"], respuesta: "Se acaba la rabia" },
  { pregunta: "En el país de los ciegos...", opciones: ["El tuerto es el rey", "El que ve manda", "Todos son iguales", "No hay diferencias"], respuesta: "El tuerto es el rey" },
  { pregunta: "Al perro que no conozcas...", opciones: ["No le toques las orejas", "No lo molestes", "Aléjate de él", "Ten cuidado"], respuesta: "No le toques las orejas" }
        ]
      }
    };

    return bancos[juegoId] || { titulo: "Juego", preguntas: [] };
  };

  // Función para mezclar opciones manteniendo la respuesta correcta
  const mezclarOpciones = (pregunta) => {
    const opcionesMezcladas = [...pregunta.opciones].sort(() => Math.random() - 0.5);
    return {
      ...pregunta,
      opciones: opcionesMezcladas
    };
  };

  // Obtener 10 preguntas aleatorias únicas por sesión
  const obtenerPreguntasAleatorias = (juegoId) => {
    const banco = getBancoGrande();
    const todasPreguntas = [...banco.preguntas];
    
    const mezcladas = [...todasPreguntas]
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5);
    
    const seleccionadas = mezcladas.slice(0, 10).map(p => mezclarOpciones(p));
    
    return seleccionadas;
  };

  // REGLA: Marcar juego como jugado hoy - SOLO PARA JUEGOS DE PREGUNTAS
  const marcarJuegoComoJugadoHoy = () => {
    // Memory no tiene restricción
    if (juegoId === "memory") return;
    
    const hoy = new Date().toLocaleDateString('es-HN');
    const juegosHoy = JSON.parse(localStorage.getItem('juegosHoy') || '{}');
    juegosHoy[juegoId] = hoy;
    localStorage.setItem('juegosHoy', JSON.stringify(juegosHoy));
    setJuegoHoyJugado(true);
  };

  // Inicializar preguntas de la sesión
  useEffect(() => {
    if (preguntasSession.length === 0 && !juegoHoyJugado) {
      const nuevasPreguntas = obtenerPreguntasAleatorias(juegoId);
      setPreguntasSession(nuevasPreguntas);
    }
  }, [juegoId, juegoHoyJugado]);

  // Iniciar timer cuando aparece una nueva pregunta
  useEffect(() => {
    if (estado === "jugando" && !mostrarResultado && preguntasSession.length > 0) {
      setTiempoInicio(Date.now());
    }
  }, [preguntaActual, estado, mostrarResultado, preguntasSession]);

  const calcularPuntos = (esCorrecta, tiempoRespuesta, rachaActual) => {
    if (!esCorrecta) return 0;

    let puntos = 15;
    
    const bonoVelocidad = 
      tiempoRespuesta < 1500 ? 6 :
      tiempoRespuesta < 2500 ? 4 :
      tiempoRespuesta < 4000 ? 2 :
      0;
    puntos += bonoVelocidad;
    
    const bonoRacha = 
      rachaActual >= 7 ? 7 :
      rachaActual >= 5 ? 5 :
      rachaActual >= 3 ? 3 :
      rachaActual >= 2 ? 2 :
      0;
    puntos += bonoRacha;

    return puntos;
  };

  const manejarRespuesta = (opcion) => {
    if (mostrarResultado || preguntasSession.length === 0 || juegoHoyJugado) return;
    
    const tiempoFin = Date.now();
    const tiempoRespuesta = tiempoFin - tiempoInicio;
    tiempoRespuestaRef.current = tiempoRespuesta;
    
    setOpcionSeleccionada(opcion);
    setMostrarResultado(true);

    const pregunta = preguntasSession[preguntaActual];
    const esCorrecta = opcion === pregunta.respuesta;
    
    if (esCorrecta) {
      const puntos = calcularPuntos(true, tiempoRespuesta, rachas);
      setPuntosGanados(puntos);
      setPuntuacion(prev => prev + puntos);
      
      const nuevaRacha = rachas + 1;
      setRachas(nuevaRacha);
      if (nuevaRacha > mejorRacha) {
        setMejorRacha(nuevaRacha);
      }
    } else {
      setPuntosGanados(0);
      setRachas(0);
    }

    setTimeout(() => {
      if (preguntaActual < preguntasSession.length - 1) {
        setPreguntaActual(prev => prev + 1);
        setMostrarResultado(false);
        setOpcionSeleccionada(null);
        setPuntosGanados(0);
      } else {
        // Juego terminado - marcar como jugado hoy
        marcarJuegoComoJugadoHoy();
        
        const datosSession = {
          mejorRacha: mejorRacha,
          preguntasRespondidas: preguntasSession.length,
          duracion: Date.now() - tiempoInicio,
          detalles: {
            rachaMaxima: mejorRacha,
            preguntasCorrectas: Math.round(puntuacion / 10)
          }
        };
        guardarEnRanking(juegoId, puntuacion, datosSession);
        setEstado("terminado");
      }
    }, 2000);
  };

  const reiniciarJuego = () => {
    if (juegoHoyJugado) return;
    
    const nuevasPreguntas = obtenerPreguntasAleatorias(juegoId);
    setPreguntasSession(nuevasPreguntas);
    
    setEstado("jugando");
    setPuntuacion(0);
    setPreguntaActual(0);
    setOpcionSeleccionada(null);
    setMostrarResultado(false);
    setRachas(0);
    setMejorRacha(0);
    setPuntosGanados(0);
  };


  // PANTALLA DE "YA JUGADO HOY" - SOLO PARA JUEGOS DE PREGUNTAS
  if (juegoHoyJugado && juegoId !== "memory") {
    return (
      <div className="text-center">
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
          <div className="text-4xl mb-4">⏰</div>
          <h3 className="text-2xl font-bold text-yellow-800 mb-2">¡Ya jugaste hoy!</h3>
          <p className="text-yellow-700 mb-4">
            Los juegos de preguntas solo se pueden jugar <strong>1 vez al día</strong>.
          </p>
          <p className="text-yellow-600 text-sm">
            Podrás volver a jugar mañana.
          </p>
          <p className="text-yellow-500 text-xs mt-2">
            💡 El juego Memory no tiene esta restricción
          </p>
        </div>
        <button
          onClick={volverASeleccion}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          Volver a Juegos
        </button>
      </div>
    );
  }

  if (preguntasSession.length === 0) {
    return <div className="text-center">Cargando preguntas...</div>;
  }

  if (estado === "terminado") {
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">¡Juego Terminado! 🎉</h3>
        <div className="bg-white/90 rounded-2xl p-6 shadow-lg mb-6">
          <div className="text-3xl font-bold text-green-600 mb-4">
            {puntuacion} puntos
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Mejor racha</div>
              <div className="text-lg font-bold text-blue-600">{mejorRacha} seguidos</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Tu récord</div>
              <div className="text-lg font-bold text-purple-600">
                {mejorPuntuacionCargada ? mejorPuntuacion : "..."} pts
              </div>
            </div>
          </div>
          
          {mejorPuntuacionCargada && puntuacion > mejorPuntuacion && mejorPuntuacion > 0 && (
            <div className="text-xl font-bold text-yellow-600 mb-4">
              🏆 ¡Nuevo récord personal!
            </div>
          )}
          
          {mejorPuntuacionCargada && mejorPuntuacion === 0 && (
            <div className="text-xl font-bold text-blue-600 mb-4">
              ⭐ ¡Primera puntuación registrada!
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={reiniciarJuego}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
          >
            🔄 Jugar Otra Vez
          </button>
          <button
            onClick={volverASeleccion}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Volver a Juegos
          </button>
        </div>
      </div>
    );
  }

  const pregunta = preguntasSession[preguntaActual];
  const datosJuego = getBancoGrande();

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-6">{datosJuego.titulo}</h3>
      
      {/* BARRA DE ESTADÍSTICAS */}
      <div className="grid grid-cols-4 gap-4 mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4">
        <div className="text-center">
          <div className="text-sm text-blue-600">Pregunta</div>
          <div className="text-lg font-bold text-blue-700">{preguntaActual + 1}/{preguntasSession.length}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-green-600">Puntos</div>
          <div className="text-lg font-bold text-green-700">{puntuacion}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-orange-600">Racha</div>
          <div className="text-lg font-bold text-orange-700">{rachas} {rachas > 1 ? '🔥' : ''}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-purple-600">Mejor</div>
          <div className="text-lg font-bold text-purple-700">
            {mejorPuntuacionCargada ? mejorPuntuacion : "..."}
          </div>
        </div>
      </div>

      {/* PREGUNTA ACTUAL */}
      <div className="bg-white/90 rounded-2xl p-6 shadow-lg mb-6">
        <p className="text-xl font-semibold mb-6">
          {pregunta.pregunta}
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          {pregunta.opciones.map((opcion, index) => (
            <button
              key={index}
              onClick={() => manejarRespuesta(opcion)}
              disabled={mostrarResultado}
              className={`p-4 rounded-xl font-medium transition-all transform ${
                mostrarResultado 
                  ? opcion === pregunta.respuesta
                    ? 'bg-green-500 text-white scale-105 shadow-lg'
                    : opcion === opcionSeleccionada
                    ? 'bg-red-500 text-white opacity-70'
                    : 'bg-gray-200 text-gray-500'
                  : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 hover:shadow-md'
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTADO CON DESGLOSE DE PUNTOS */}
      {mostrarResultado && (
        <div className="bg-white/90 rounded-2xl p-6 shadow-lg mb-6">
          <div className={`text-xl font-bold mb-4 ${
            opcionSeleccionada === pregunta.respuesta ? 'text-green-600' : 'text-red-600'
          }`}>
            {opcionSeleccionada === pregunta.respuesta ? (
              <div>
                <div>✅ ¡Correcto! +{puntosGanados} puntos</div>
                <div className="text-sm text-gray-600 mt-2">
                  <div>Base: 15 puntos</div>
                  {tiempoRespuestaRef.current < 1500 && <div>Velocidad: +6 puntos ⚡</div>}
                  {tiempoRespuestaRef.current < 2500 && tiempoRespuestaRef.current >= 1500 && <div>Velocidad: +4 puntos 🔥</div>}
                  {tiempoRespuestaRef.current < 4000 && tiempoRespuestaRef.current >= 2500 && <div>Velocidad: +2 puntos ✅</div>}
                  {rachas >= 7 && <div>Racha: +7 puntos 🏆</div>}
                  {rachas >= 5 && rachas < 7 && <div>Racha: +5 puntos ⭐</div>}
                  {rachas >= 3 && rachas < 5 && <div>Racha: +3 puntos 🔥</div>}
                  {rachas === 2 && <div>Racha: +2 puntos 👍</div>}
                </div>
              </div>
            ) : (
              <div>
                <div>❌ Incorrecto</div>
                <div className="text-sm text-gray-600 mt-1">
                  Respuesta correcta: <strong>{pregunta.respuesta}</strong>
                </div>
                <div className="text-sm text-red-500 mt-1">
                  Racha reiniciada 💔
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTÓN VOLVER */}
      <button
        onClick={volverASeleccion}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all mt-4"
      >
        Volver a Juegos
      </button>
    </div>
  );
};

// MEMORY GAME MEJORADO - 10 PARES Y SISTEMA DE PUNTOS MEJORADO
const MemoryGame = ({ 
  usuarioActual, 
  volverASeleccion, 
  guardarEnRanking, 
  obtenerMejorPuntuacionPersonal 
}) => {
  // CAMBIO 1: Aumentar de 8 a 10 pares
  const cartasMemory = [
    "🎅", "🎅", "🎄", "🎄", "🎁", "🎁", "❄️", "❄️",
    "🌟", "🌟", "🦌", "🦌", "🍪", "🍪", "🔔", "🔔",
    "🕯️", "🕯️", "🎀", "🎀"  // NUEVOS PARES AÑADIDOS
  ];

  const [cartas, setCartas] = useState([]);
  const [cartasVolteadas, setCartasVolteadas] = useState([]);
  const [paresEncontrados, setParesEncontrados] = useState(0);
  const [movimientos, setMovimientos] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [bloquearClics, setBloquearClics] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [mejorPuntuacion, setMejorPuntuacion] = useState(0);
  const [mejorPuntuacionCargada, setMejorPuntuacionCargada] = useState(false);

  // Cargar mejor puntuación al iniciar
  useEffect(() => {
    const cargarMejorPuntuacion = async () => {
      const mejor = await obtenerMejorPuntuacionPersonal("memory");
      setMejorPuntuacion(mejor);
      setMejorPuntuacionCargada(true);
    };
    cargarMejorPuntuacion();
  }, []);

  // CAMBIO 2: SISTEMA DE PUNTOS MEJORADO PARA 10 PARES
  const calcularPuntuacionMemory = (totalMovimientos) => {
    const base = 100;
    let bonus = 0;
    const m = totalMovimientos;

    // Sistema mejorado basado en movimientos para 10 pares
    if (m <= 20) bonus = 150;        // Perfecto (mínimo teórico)
    else if (m <= 22) bonus = 130;   // Elite
    else if (m <= 24) bonus = 110;   // Excelente
    else if (m <= 26) bonus = 90;    // Muy bueno
    else if (m <= 28) bonus = 70;    // Bueno
    else if (m <= 30) bonus = 50;    // Regular
    else if (m <= 32) bonus = 30;    // Normal
    else if (m <= 34) bonus = 20;    // Básico
    else if (m <= 36) bonus = 10;    // Principiante
    else bonus = 0;                  // Sin bonus

    const final = base + bonus;
    return Math.max(100, final);
  };

  useEffect(() => {
    iniciarJuego();
  }, []);

  const iniciarJuego = () => {
    const cartasMezcladas = [...cartasMemory]
      .map((emoji, index) => ({ id: index, emoji, volteada: false, encontrada: false }))
      .sort(() => Math.random() - 0.5);
    
    setCartas(cartasMezcladas);
    setParesEncontrados(0);
    setMovimientos(0);
    setCartasVolteadas([]);
    setJuegoTerminado(false);
    setBloquearClics(false);
    setPuntuacion(0);
  };

  const voltearCarta = (index) => {
    if (bloquearClics || juegoTerminado || cartas[index].encontrada || cartas[index].volteada) return;

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
            if (nuevosPares === 10) { // CAMBIO: 8 → 10 pares
              setJuegoTerminado(true);
              const totalMovimientos = nuevosMovimientos;
              const puntuacionFinal = calcularPuntuacionMemory(totalMovimientos);
              setPuntuacion(puntuacionFinal);
              
              const datosSession = {
                paresEncontrados: 10, // CAMBIO: 8 → 10
                movimientos: totalMovimientos,
                duracion: 0,
                detalles: {
                  eficiencia: totalMovimientos <= 20 ? "perfecto" : 
                            totalMovimientos <= 24 ? "excelente" :
                            totalMovimientos <= 28 ? "muy bueno" : 
                            totalMovimientos <= 32 ? "bueno" : "normal",
                  movimientosRealizados: totalMovimientos 
                }
              };
              
              guardarEnRanking("memory", puntuacionFinal, datosSession);
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
      }, 1000);
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-4">🧠 Memory Navideño</h3>
      
      <div className="grid grid-cols-4 gap-4 mb-6 bg-purple-100 rounded-xl p-4">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-700">{paresEncontrados}/10</div> {/* CAMBIO: 8 → 10 */}
          <div className="text-sm text-purple-600">Pares</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-700">{movimientos}</div>
          <div className="text-sm text-purple-600">Movimientos</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-700">{puntuacion}</div>
          <div className="text-sm text-purple-600">Puntos</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-700">
            {mejorPuntuacionCargada ? mejorPuntuacion : "..."}
          </div>
          <div className="text-sm text-purple-600">Mejor</div>
        </div>
      </div>

      {/* CAMBIO: Grid de 5x4 para 20 cartas (10 pares) */}
      <div className="grid grid-cols-5 gap-3 mb-6 max-w-md mx-auto"> {/* CAMBIO: 4 → 5 columnas */}
        {cartas.map((carta, index) => (
          <button
            key={carta.id}
            onClick={() => voltearCarta(index)}
            disabled={carta.encontrada || bloquearClics}
            className={`w-14 h-14 text-xl rounded-xl transition-all duration-300 transform ${
              carta.volteada || carta.encontrada 
                ? 'bg-white border-2 border-purple-500 scale-105' 
                : 'bg-purple-500 hover:bg-purple-600 text-white hover:scale-105'
            } ${carta.encontrada ? 'ring-2 ring-green-500' : ''}`}
          >
            {(carta.volteada || carta.encontrada) ? carta.emoji : "?"}
          </button>
        ))}
      </div>

      {juegoTerminado && (
        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 mb-4">
          <div className="text-2xl mb-2">🎉 ¡Felicidades!</div>
          <p className="text-green-700">
            Completaste el memory en <strong>{movimientos} movimientos</strong>
          </p>
          <p className="text-green-600">
            Puntos obtenidos: <strong>{puntuacion}</strong>
          </p>
          
          {mejorPuntuacionCargada && puntuacion > mejorPuntuacion && mejorPuntuacion > 0 && (
            <p className="text-green-800 font-bold mt-2">
              🏆 ¡Nuevo récord personal!
            </p>
          )}
          
          {mejorPuntuacionCargada && mejorPuntuacion === 0 && (
            <p className="text-blue-600 font-bold mt-2">
              ⭐ ¡Primera puntuación registrada!
            </p>
          )}
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={iniciarJuego}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
            >
              🔄 Jugar Otra Vez
            </button>
            <button
              onClick={volverASeleccion}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
            >
              Volver a Juegos
            </button>
          </div>
        </div>
      )}

      {!juegoTerminado && (
        <button
          onClick={volverASeleccion}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all mt-4"
        >
          Volver a Juegos
        </button>
      )}
    </div>
  );
};

// COMPONENTE PRINCIPAL MEJORADO
export default function Juegos() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [juegoActivo, setJuegoActivo] = useState(null);
  const [rankingGlobal, setRankingGlobal] = useState({});
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const juegos = [
    {
      id: "memory",
      nombre: "🧠 Memory Navideño",
      descripcion: "Encuentra las parejas de emojis navideños",
      icono: "🧠",
      color: "from-purple-500 to-pink-500",
      dificultad: "Fácil"
    },
    {
      id: "peliculas",
      nombre: "🎬 Adivina la Película",
      descripcion: "Descubre la película por emojis",
      icono: "🎬",
      color: "from-blue-500 to-cyan-500",
      dificultad: "Media"
    },
    {
      id: "canciones",
      nombre: "🎵 Completa la Canción",
      descripcion: "Termina la letra del villancico",
      icono: "🎵",
      color: "from-green-500 to-emerald-500",
      dificultad: "Fácil"
    },
    {
      id: "quiz",
      nombre: "❓ Trivia Familiar",
      descripcion: "Preguntas sobre nuestra familia Goba",
      icono: "❓",
      color: "from-orange-500 to-red-500",
      dificultad: "Media"
    },
    {
      id: "familia",
      nombre: "🔤 Refranes",
      descripcion: "Adivina el refrán",
      icono: "🔤",
      color: "from-yellow-500 to-amber-500",
      dificultad: "Difícil"
    }
  ];

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) {
      window.location.href = "/login";
      return;
    }
    setUsuarioActual(usuario);
    cargarRankings();
  }, []);

  // FUNCIÓN MEJORADA PARA CARGAR RANKINGS
  const cargarRankings = async () => {
    try {
      setCargando(true);
      setMensaje("🔄 Cargando rankings desde Firebase...");
      
      const nuevoRankingGlobal = {};
      
      for (const juego of juegos) {
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
          console.log(`⚠️ Error cargando ranking de ${juego.id}:`, error);
          nuevoRankingGlobal[juego.id] = {};
        }
      }
      
      setRankingGlobal(nuevoRankingGlobal);
      localStorage.setItem('rankingGlobal', JSON.stringify(nuevoRankingGlobal));
      setMensaje("✅ Rankings cargados desde Firebase");
      
    } catch (error) {
      console.log('❌ Error cargando rankings de Firebase:', error);
      setMensaje("⚠️ Error cargando rankings");
      const rankingLocal = JSON.parse(localStorage.getItem('rankingGlobal')) || {};
      setRankingGlobal(rankingLocal);
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  // FUNCIÓN MEJORADA PARA GUARDAR EN RANKING
  const guardarEnRanking = async (juegoId, puntuacion, datosSession = {}) => {
    try {
      setMensaje("📡 Guardando puntuación...");
      
      const resultado = await gobaService.guardarPuntuacionJuego(
        usuarioActual.id,
        juegoId,
        puntuacion,
        datosSession
      );
      
      if (resultado.esNuevoRecord) {
        setMensaje("🎉 ¡Nuevo récord personal!");
      } else {
        setMensaje("✅ Puntuación guardada");
      }
      
      cargarRankings();
      
    } catch (error) {
      console.log('❌ Error guardando en Firebase:', error);
      setMensaje("⚠️ Error guardando puntuación");
      
      const usuarioKey = usuarioActual.nombre;
      setRankingGlobal(prev => {
        const nuevoRanking = { ...prev };
        
        if (!nuevoRanking[juegoId]) {
          nuevoRanking[juegoId] = {};
        }
        
        const puntuacionActual = nuevoRanking[juegoId][usuarioKey]?.puntuacion || 0;
        if (puntuacion > puntuacionActual) {
          nuevoRanking[juegoId][usuarioKey] = {
            nombre: usuarioActual.nombre,
            puntuacion: puntuacion,
            fecha: new Date().toISOString(),
            avatar: usuarioActual.avatar || "👤"
          };
          
          localStorage.setItem('rankingGlobal', JSON.stringify(nuevoRanking));
        }
        
        return nuevoRanking;
      });
    } finally {
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const obtenerMejorPuntuacionPersonal = async (juegoId) => {
    if (!usuarioActual) return 0;
    
    try {
      const mejor = await gobaService.obtenerMejorPuntuacionPersonal(
        usuarioActual.id, 
        juegoId
      );
      return mejor;
    } catch (error) {
      console.log('Error obteniendo mejor puntuación:', error);
      return 0;
    }
  };

  const obtenerRankingJuego = (juegoId) => {
    if (!rankingGlobal[juegoId]) return [];
    
    return Object.values(rankingGlobal[juegoId])
      .sort((a, b) => b.puntuacion - a.puntuacion)
      .slice(0, 10);
  };

  const iniciarJuego = (juegoId) => {
    setJuegoActivo(juegoId);
  };

  const volverASeleccion = () => {
    setJuegoActivo(null);
  };

  // COMPONENTE RANKING MEJORADO
  const RankingJuego = ({ juegoId, juegoNombre }) => {
    const ranking = obtenerRankingJuego(juegoId);
    const [mejorPuntuacion, setMejorPuntuacion] = useState(0);
    const [mejorPuntuacionCargada, setMejorPuntuacionCargada] = useState(false);

    useEffect(() => {
      const cargarMejorPuntuacion = async () => {
        const mejor = await obtenerMejorPuntuacionPersonal(juegoId);
        setMejorPuntuacion(mejor);
        setMejorPuntuacionCargada(true);
      };
      cargarMejorPuntuacion();
    }, [juegoId]);

    if (cargando) {
      return (
        <div className="bg-white/90 rounded-2xl p-6 shadow-lg mb-6">
          <h4 className="text-xl font-bold mb-4 text-center">🏆 {juegoNombre}</h4>
          <div className="text-center text-gray-500 py-4">
            Cargando rankings...
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white/90 rounded-2xl p-6 shadow-lg mb-6">
        <h4 className="text-xl font-bold mb-4 text-center">🏆 {juegoNombre}</h4>
        
        {ranking.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            Aún no hay puntuaciones registradas
          </div>
        ) : (
          <div className="space-y-3">
            {ranking.map((jugador, index) => (
              <div 
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  jugador.nombre === usuarioActual?.nombre 
                    ? 'bg-yellow-100 border-2 border-yellow-400' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-400' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                  } text-white`}>
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{jugador.avatar}</span>
                    <span className={`font-medium ${
                      jugador.nombre === usuarioActual?.nombre ? 'text-yellow-700' : 'text-gray-700'
                    }`}>
                      {jugador.nombre}
                    </span>
                  </div>
                </div>
                <div className="font-bold text-gray-800">{jugador.puntuacion} pts</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-center">
            <p className="text-blue-700 font-semibold">
              Tu mejor puntuación: <strong>
                {mejorPuntuacionCargada ? mejorPuntuacion : "..."} pts
              </strong>
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!usuarioActual) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            🎮 Zona de Juegos 1
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-light">
           ¡Supera tus propios récords!
          </p>
          <p className="text-xl text-gray-600 mb-8 font-light">
           ⭐ "Premios para 1er lugar de cada rankings"
          </p>
          
          {mensaje && (
            <div className={`inline-block px-4 py-2 rounded-lg mb-4 ${
              mensaje.includes('✅') || mensaje.includes('🎉') ? 'bg-green-100 text-green-700 border border-green-300' :
              mensaje.includes('⚠️') ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
              'bg-blue-100 text-blue-700 border border-blue-300'
            }`}>
              {mensaje}
            </div>
          )}
          
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 inline-block">
            <p className="text-yellow-700 text-sm">
              ⏰ Rankings se reinician semanalmente
            </p>
          </div>
        </div>

        {!juegoActivo ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {juegos.map((juego) => (
                <div
                  key={juego.id}
                  className={`bg-gradient-to-br ${juego.color} rounded-2xl p-6 text-white text-center shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                  onClick={() => iniciarJuego(juego.id)}
                >
                  <div className="text-5xl mb-4">{juego.icono}</div>
                  <h3 className="text-xl font-bold mb-2">{juego.nombre}</h3>
                  <p className="text-white/90 mb-3">{juego.descripcion}</p>
                  <div className="bg-white/20 rounded-full px-3 py-1 text-sm inline-block mb-2">
                    {juego.dificultad}
                  </div>
                  <div className="mt-2 bg-white/30 rounded-full px-3 py-1 text-sm">
                    Mejor: {rankingGlobal[juego.id]?.[usuarioActual.id]?.puntuacion || 0} pts
                  </div>
                </div>
              ))}
            </div>

            {/* RANKINGS */}
            <div className="bg-white/90 rounded-2xl p-8 shadow-2xl border-2 border-purple-200 mb-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">🏆 Rankings Globales</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={cargarRankings}
                    disabled={cargando}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    {cargando ? '🔄 Actualizando...' : '🔄 Actualizar'}
                  </button>
                </div>
              </div>
              
              {mensaje && (
                <div className="mb-4 text-center">
                  <span className="text-sm text-gray-600">{mensaje}</span>
                </div>
              )}
              
              {cargando ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Cargando rankings globales...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {juegos.map((juego) => (
                    <RankingJuego 
                      key={juego.id} 
                      juegoId={juego.id} 
                      juegoNombre={juego.nombre} 
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-purple-200 max-w-2xl mx-auto">
            {juegoActivo === "memory" ? (
              <MemoryGame 
                usuarioActual={usuarioActual}
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRanking}
                obtenerMejorPuntuacionPersonal={obtenerMejorPuntuacionPersonal}
              />
            ) : (
              <JuegoSimple 
                juegoId={juegoActivo}
                usuarioActual={usuarioActual}
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRanking}
                obtenerMejorPuntuacionPersonal={obtenerMejorPuntuacionPersonal}
              />
            )}
          </div>
        )}

        {usuarioActual?.esAdmin && !juegoActivo && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mt-8">
            <h3 className="text-2xl font-bold mb-4 text-yellow-800 text-center">
              👑 Panel de Administración - Juegos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={async () => {
                  if (window.confirm('¿REINICIAR TODOS LOS PUNTAJES?\n\n⚠️ Esta acción eliminará TODOS los rankings y sesiones de juego. Es irreversible.')) {
                    try {
                      setMensaje("🗑️ Reiniciando puntajes...");
                      const resultado = await gobaService.reiniciarTodosLosPuntajes();
                      setMensaje(resultado.message);
                      cargarRankings();
                    } catch (error) {
                      setMensaje("❌ Error: " + error.message);
                    }
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105"
              >
                🗑️ Reiniciar Todos los Puntajes
              </button>
              
              <Link 
                to="/concurso-rapido"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 text-center flex items-center justify-center"
              >
                ⚡ Ir al Concurso Rápido
              </Link>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-yellow-700 text-sm">
                💡 <strong>Acciones de administrador:</strong> Solo visible para usuarios admin
              </p>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ← Volver al Home
          </Link>
        </div>
      </div>
    </div>
  );
}