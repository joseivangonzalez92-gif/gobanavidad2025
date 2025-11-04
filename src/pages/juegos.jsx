// src/components/Juegos.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

// COMPONENTE BASE CON SISTEMA KAHOOT MEJORADO
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

  // Cargar mejor puntuación al iniciar - MEJORADO
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
          { pregunta: "🎅👶🌟", opciones: ["Elf", "Santa Claus", "The Grinch", "Polar Express"], respuesta: "Elf" },
          { pregunta: "🏠🔌🎄", opciones: ["Home Alone", "Christmas Vacation", "The Holiday", "Deck the Halls"], respuesta: "Home Alone" },
          { pregunta: "👦👦🚂🎅", opciones: ["Polar Express", "The Santa Clause", "Arthur Christmas", "Fred Claus"], respuesta: "Polar Express" },
          { pregunta: "🔴👃🦌", opciones: ["Rudolph", "Frosty", "Santa", "Jack Frost"], respuesta: "Rudolph" },
          { pregunta: "👻🎄🎁", opciones: ["The Grinch", "Scrooge", "Nightmare Before Christmas", "Ghosts of Girlfriends Past"], respuesta: "The Grinch" },
          { pregunta: "👨‍👩‍👧‍👦✈️🎄", opciones: ["The Family Stone", "Home for the Holidays", "Four Christmases", "Christmas with the Kranks"], respuesta: "The Family Stone" },
          { pregunta: "🎄👦🎁", opciones: ["A Christmas Story", "The Santa Clause", "Jingle All the Way", "Deck the Halls"], respuesta: "A Christmas Story" },
          { pregunta: "👨💼🎄", opciones: ["Scrooged", "The Family Man", "Christmas with the Kranks", "The Holiday"], respuesta: "Scrooged" },
          { pregunta: "🎅🏢🛷", opciones: ["The Santa Clause", "Miracle on 34th Street", "Santa Claus: The Movie", "Fred Claus"], respuesta: "The Santa Clause" },
          { pregunta: "👦🔫🎄", opciones: ["Home Alone", "Die Hard", "The Ref", "Bad Santa"], respuesta: "Home Alone" },
          { pregunta: "❄️👸👗", opciones: ["Frozen", "Snow Queen", "The Nutcracker", "Ice Princess"], respuesta: "Frozen" },
          { pregunta: "🎄👻👦", opciones: ["The Nightmare Before Christmas", "Casper", "Beetlejuice", "Ghostbusters"], respuesta: "The Nightmare Before Christmas" },
          { pregunta: "🦌🔴🌟", opciones: ["Rudolph the Red-Nosed Reindeer", "Prancer", "The Year Without a Santa Claus", "Santa's Apprentice"], respuesta: "Rudolph the Red-Nosed Reindeer" },
          { pregunta: "🎅🎁👶", opciones: ["Santa Baby", "The Santa Clause", "Elf", "Jingle All the Way"], respuesta: "Santa Baby" },
          { pregunta: "🏠🎄👨‍👩‍👧‍👦", opciones: ["National Lampoon's Christmas Vacation", "The Family Stone", "Home for the Holidays", "Four Christmases"], respuesta: "National Lampoon's Christmas Vacation" },
          { pregunta: "🎄✨👦", opciones: ["The Polar Express", "A Christmas Carol", "The Little Boy", "The Christmas Star"], respuesta: "The Polar Express" },
          { pregunta: "👨‍💻🎅🤖", opciones: ["The Santa Clause", "Jingle All the Way", "Santa Claus: The Movie", "The Christmas Chronicles"], respuesta: "The Santa Clause" },
          { pregunta: "🎄🏆👦", opciones: ["Jingle All the Way", "The Santa Clause", "Deck the Halls", "Christmas with the Kranks"], respuesta: "Jingle All the Way" },
          { pregunta: "❄️🎩🐧", opciones: ["Happy Feet", "March of the Penguins", "Surf's Up", "Arctic Tale"], respuesta: "Happy Feet" },
          { pregunta: "🎄👮‍♂️💍", opciones: ["Die Hard", "Lethal Weapon", "Bad Boys", "Rush Hour"], respuesta: "Die Hard" },
          { pregunta: "👻📖🎄", opciones: ["A Christmas Carol", "The Nightmare Before Christmas", "Scrooged", "Ghosts of Girlfriends Past"], respuesta: "A Christmas Carol" },
          { pregunta: "🎅🤴👸", opciones: ["The Princess Switch", "A Christmas Prince", "The Royal Treatment", "The Knight Before Christmas"], respuesta: "A Christmas Prince" },
          { pregunta: "🏠🎄🔥", opciones: ["The Holiday", "Home Alone", "The Family Stone", "Christmas with the Kranks"], respuesta: "The Holiday" },
          { pregunta: "🎄👦🦸", opciones: ["The Christmas Chronicles", "The Santa Clause", "Elf", "Jingle All the Way"], respuesta: "The Christmas Chronicles" },
          { pregunta: "❄️👑🔍", opciones: ["Frozen", "Snow White", "The Snow Queen", "Ice Princess"], respuesta: "Frozen" },
          { pregunta: "🦁👑🌅", opciones: ["The Lion King", "Aladdin", "Beauty and the Beast", "The Jungle Book"], respuesta: "The Lion King" },
{ pregunta: "🚀👨‍🚀🌌", opciones: ["Interstellar", "Gravity", "The Martian", "Apollo 13"], respuesta: "Interstellar" },
{ pregunta: "🏰👸🐸", opciones: ["The Princess and the Frog", "Shrek", "Enchanted", "Tangled"], respuesta: "The Princess and the Frog" },
{ pregunta: "🎭🕴️🔫", opciones: ["The Matrix", "John Wick", "James Bond", "Mission Impossible"], respuesta: "The Matrix" },
{ pregunta: "🧙‍♂️⚡👓", opciones: ["Harry Potter", "The Lord of the Rings", "The Chronicles of Narnia", "Percy Jackson"], respuesta: "Harry Potter" },
{ pregunta: "🚗🌇🏁", opciones: ["Fast and Furious", "The Fast and the Furious: Tokyo Drift", "Need for Speed", "Gone in 60 Seconds"], respuesta: "Fast and Furious" },
{ pregunta: "🦇🏙️🤡", opciones: ["The Dark Knight", "Batman Begins", "Joker", "The Batman"], respuesta: "The Dark Knight" },
{ pregunta: "👽📞🏠", opciones: ["E.T. the Extra-Terrestrial", "Close Encounters of the Third Kind", "Arrival", "The Day the Earth Stood Still"], respuesta: "E.T. the Extra-Terrestrial" },
{ pregunta: "🚢❤️🌊", opciones: ["Titanic", "The Poseidon Adventure", "A Perfect Storm", "The Abyss"], respuesta: "Titanic" },
{ pregunta: "🔍🕵️‍♂️🔫", opciones: ["Sherlock Holmes", "The Da Vinci Code", "National Treasure", "The Bourne Identity"], respuesta: "Sherlock Holmes" },
{ pregunta: "🎵🎤🎹", opciones: ["La La Land", "A Star is Born", "Bohemian Rhapsody", "The Greatest Showman"], respuesta: "La La Land" },
{ pregunta: "👻🏠👦", opciones: ["Casper", "The Haunting", "The Amityville Horror", "Poltergeist"], respuesta: "Casper" },
{ pregunta: "🦕🏝️🔬", opciones: ["Jurassic Park", "The Lost World", "King Kong", "Godzilla"], respuesta: "Jurassic Park" },
{ pregunta: "👗👠💼", opciones: ["The Devil Wears Prada", "Legally Blonde", "Working Girl", "13 Going on 30"], respuesta: "The Devil Wears Prada" },
{ pregunta: "🚀🤖👦", opciones: ["Big Hero 6", "Astro Boy", "Robots", "The Iron Giant"], respuesta: "Big Hero 6" },
{ pregunta: "👦🕷️🕸️", opciones: ["Spider-Man: Into the Spider-Verse", "Spider-Man", "The Amazing Spider-Man", "Spider-Man: Homecoming"], respuesta: "Spider-Man: Into the Spider-Verse" },
{ pregunta: "👧🔥🏹", opciones: ["The Hunger Games", "Brave", "Divergent", "The Maze Runner"], respuesta: "The Hunger Games" },
{ pregunta: "🤖💙👦", opciones: ["The Iron Giant", "Big Hero 6", "Astro Boy", "Robots"], respuesta: "The Iron Giant" },
{ pregunta: "👻📱😱", opciones: ["The Ring", "The Grudge", "Poltergeist", "Paranormal Activity"], respuesta: "The Ring" },
{ pregunta: "🚗🌍🏎️", opciones: ["Cars", "Speed Racer", "Talladega Nights", "Rush"], respuesta: "Cars" },
{ pregunta: "👸❄️💖", opciones: ["Frozen", "Snow White", "The Snow Queen", "Ice Princess"], respuesta: "Frozen" },
{ pregunta: "🦇🌃🤡", opciones: ["Joker", "The Dark Knight", "Batman Begins", "The Batman"], respuesta: "Joker" },
{ pregunta: "👽🔫🌎", opciones: ["Independence Day", "War of the Worlds", "Battle: Los Angeles", "Arrival"], respuesta: "Independence Day" },
{ pregunta: "🎭🎪🎶", opciones: ["Moulin Rouge!", "The Greatest Showman", "Chicago", "Burlesque"], respuesta: "Moulin Rouge!" },
{ pregunta: "🐉🏯👦", opciones: ["Mulan", "Kung Fu Panda", "The Last Airbender", "Crouching Tiger Hidden Dragon"], respuesta: "Mulan" },
{ pregunta: "🧙‍♂️⚡🏰", opciones: ["Harry Potter and the Sorcerer's Stone", "The Lord of the Rings", "The Chronicles of Narnia", "Percy Jackson"], respuesta: "Harry Potter and the Sorcerer's Stone" },
{ pregunta: "🚀👨‍🚀🪐", opciones: ["The Martian", "Interstellar", "Gravity", "Apollo 13"], respuesta: "The Martian" },
{ pregunta: "👻🔍🏠", opciones: ["The Conjuring", "Insidious", "The Amityville Horror", "Sinister"], respuesta: "The Conjuring" },
{ pregunta: "🦸‍♂️🛡️🇺🇸", opciones: ["Captain America: The First Avenger", "Superman", "Iron Man", "The Avengers"], respuesta: "Captain America: The First Avenger" },
{ pregunta: "🐠🔍👨", opciones: ["Finding Nemo", "Finding Dory", "The Little Mermaid", "Shark Tale"], respuesta: "Finding Nemo" },
{ pregunta: "👧🐰🎩", opciones: ["Alice in Wonderland", "Pan's Labyrinth", "Coraline", "The Wizard of Oz"], respuesta: "Alice in Wonderland" },
{ pregunta: "🚗💨🌉", opciones: ["The Fast and the Furious: Tokyo Drift", "The Fast and the Furious", "Need for Speed", "Baby Driver"], respuesta: "The Fast and the Furious: Tokyo Drift" },
{ pregunta: "👻👻📞", opciones: ["Ghostbusters: Afterlife", "Ghostbusters", "The Ghost and Mr. Chicken", "Beetlejuice"], respuesta: "Ghostbusters: Afterlife" },
{ pregunta: "🦁👑🌄", opciones: ["The Lion King (2019)", "The Lion King", "The Jungle Book", "Tarzan"], respuesta: "The Lion King (2019)" },
{ pregunta: "🎵🎤🌟", opciones: ["A Star is Born", "La La Land", "The Voice", "American Idol"], respuesta: "A Star is Born" }
        ]
      },
      canciones: {
        titulo: "🎵 Completa la Canción",
        preguntas: [
  { pregunta: "Noche de ____, noche de amor", opciones: ["paz", "alegría", "magia", "ensueño"], respuesta: "paz" },
  { pregunta: "Campana sobre campana, y sobre campana ____", opciones: ["una", "dos", "tres", "cuatro"], respuesta: "una" },
  { pregunta: "Mi burrito sabanero, vamos a ____", opciones: ["Belén", "la fiesta", "cantar", "pasear"], respuesta: "Belén" },
  { pregunta: "Los peces en el río, pero mira cómo ____", opciones: ["beben", "nadan", "saltan", "juegan"], respuesta: "beben" },
  { pregunta: "Arre borriquito, vamos a ____", opciones: ["Belén", "cantar", "bailar", "correr"], respuesta: "Belén" },
  { pregunta: "Ya viene la vieja, con el ____", opciones: ["aguinaldo", "regalo", "pavo", "chocolate"], respuesta: "aguinaldo" },
  { pregunta: "Blanca Navidad, yo ____ soñé", opciones: ["la", "te", "se", "me"], respuesta: "la" },
  { pregunta: "Ven a ____ casa, es Navidad", opciones: ["mi", "tu", "nuestra", "la"], respuesta: "mi" },
  { pregunta: "Navidad, Navidad, dulce ____", opciones: ["Navidad", "momentos", "fiesta", "alegría"], respuesta: "Navidad" },
  { pregunta: "Los ____ pasan, llevan flores", opciones: ["pastores", "reyes", "niños", "ángeles"], respuesta: "pastores" },
  { pregunta: "Ande, ande, ande, la ____", opciones: ["marimorena", "navidad", "fiesta", "alegría"], respuesta: "marimorena" },
  { pregunta: "En el portal de ____", opciones: ["Belén", "Jerusalén", "Nazaret", "Galilea"], respuesta: "Belén" },
  { pregunta: "____, campana sobre campana", opciones: ["Campana", "Suena", "Brilla", "Canta"], respuesta: "Campana" },
  { pregunta: "Vamos, vamos, ____", opciones: ["pastores", "amigos", "hermanos", "niños"], respuesta: "pastores" },
  { pregunta: "La ____ está en el portal", opciones: ["Virgen", "Madre", "Señora", "Reina"], respuesta: "Virgen" },
  { pregunta: "____, José con el niño", opciones: ["María", "La Virgen", "Santa", "Madre"], respuesta: "María" },
  { pregunta: "Ya ____ la Navidad", opciones: ["llegó", "vino", "está", "viene"], respuesta: "llegó" },
  { pregunta: "Con mi ____ cantaré", opciones: ["burrito", "caballo", "perrito", "gatito"], respuesta: "burrito" },
  { pregunta: "A ____ me voy", opciones: ["Belén", "casa", "la fiesta", "la iglesia"], respuesta: "Belén" },
  { pregunta: "____ de la rosa", opciones: ["Flor", "Rey", "Canto", "Belleza"], respuesta: "Flor" },
  { pregunta: "____, qué noche tan linda", opciones: ["Navidad", "Amigos", "Fiesta", "Alegría"], respuesta: "Navidad" },
  { pregunta: "Vuela, vuela, vuela, la ____", opciones: ["mariposa", "campana", "estrella", "paloma"], respuesta: "campana" },
  { pregunta: "____, José, no te dé cuidado", opciones: ["María", "Mujer", "Esposa", "Querida"], respuesta: "María" },
  { pregunta: "El ____ al niño le trae", opciones: ["burrito", "pastor", "rey", "ángel"], respuesta: "burrito" },
  { pregunta: "I'm dreaming of a white ____", opciones: ["Christmas", "holiday", "winter", "snow"], respuesta: "Christmas" },
  { pregunta: "Jingle bells, jingle bells, jingle all the ____", opciones: ["way", "night", "day", "time"], respuesta: "way" },
  { pregunta: "Last Christmas I gave you my ____", opciones: ["heart", "love", "soul", "gift"], respuesta: "heart" },
  { pregunta: "All I want for Christmas is ____", opciones: ["you", "love", "joy", "peace"], respuesta: "you" },
  { pregunta: "Santa Claus is coming to ____", opciones: ["town", "you", "home", "us"], respuesta: "town" },
  { pregunta: "Feliz Navidad, Feliz Navidad, ____", opciones: ["Feliz Navidad", "te deseo yo", "con amor", "y prosperidad"], respuesta: "Feliz Navidad" },
  { pregunta: "It's the most wonderful ____ of the year", opciones: ["time", "day", "night", "season"], respuesta: "time" },
  { pregunta: "Let it snow, let it snow, let it ____", opciones: ["snow", "go", "flow", "glow"], respuesta: "snow" },
  { pregunta: "Rockin' around the Christmas ____", opciones: ["tree", "time", "night", "world"], respuesta: "tree" },
  { pregunta: "Noche de paz, noche de ____", opciones: ["amor", "sueño", "alegría", "fe"], respuesta: "amor" },
  { pregunta: "Have yourself a merry little ____", opciones: ["Christmas", "holiday", "winter", "night"], respuesta: "Christmas" },
  { pregunta: "Los ____ de la noche son tan fríos", opciones: ["vientos", "aires", "cantos", "sueños"], respuesta: "vientos" },
  { pregunta: "Santa baby, just slip a ____ under the tree", opciones: ["sable", "diamond", "ring", "car"], respuesta: "sable" },
  { pregunta: "Ven a cantar, ven a ____", opciones: ["cantar", "reír", "bailar", "amar"], respuesta: "cantar" },
  { pregunta: "It's beginning to look a lot like ____", opciones: ["Christmas", "winter", "holidays", "snow"], respuesta: "Christmas" },
  { pregunta: "Esta ____ es para ti", opciones: ["Navidad", "noche", "canción", "alegría"], respuesta: "Navidad" },
  { pregunta: "Do you hear what I ____?", opciones: ["hear", "see", "feel", "know"], respuesta: "hear" },
  { pregunta: "En Navidad, yo quiero ____", opciones: ["amor", "paz", "alegría", "felicidad"], respuesta: "amor" },
  { pregunta: "You're a mean one, Mr. ____", opciones: ["Grinch", "Scrooge", "Santa", "Frost"], respuesta: "Grinch" },
  { pregunta: "Blanca Navidad de ____ y amor", opciones: ["paz", "nieve", "alegría", "fe"], respuesta: "paz" },
  // NUEVAS PREGUNTAS AÑADIDAS
  { pregunta: "Aquellos Diciembres que nunca ____", opciones: ["volverán", "llegarán", "terminarán", "olvidaré"], respuesta: "volverán" },
  { pregunta: "Mele Kalikimaka is the thing to say on a bright Hawaiian ____", opciones: ["Christmas Day", "New Year's Eve", "holy night", "summer day"], respuesta: "Christmas Day" },
  { pregunta: "Frosty the Snowman, was a ____ soul", opciones: ["jolly happy", "merry happy", "happy jolly", "cheerful happy"], respuesta: "jolly happy" },
  { pregunta: "Naranjas y limas, ____", opciones: ["limas y limones", "limones y limas", "dulces canciones", "verdes limoneros"], respuesta: "limas y limones" },
  { pregunta: "Just hear those sleigh bells ____", opciones: ["jingling", "ringing", "singing", "dancing"], respuesta: "jingling" },
  { pregunta: "Have a holly jolly Christmas, it's the ____ time of the year", opciones: ["best", "most wonderful", "happiest", "brightest"], respuesta: "best" },
  { pregunta: "Run, run Rudolph, Santa's got to ____ tonight", opciones: ["make it", "get there", "run fast", "fly high"], respuesta: "make it" },
  { pregunta: "Baby, it's cold ____", opciones: ["outside", "in here", "tonight", "everywhere"], respuesta: "outside" },
  { pregunta: "But it doesn't show signs of stopping, and I've bought some ____ for the ice", opciones: ["corn", "salt", "bags", "wood"], respuesta: "corn" },
  { pregunta: "Año nuevo, ____ nueva", opciones: ["vida", "vieja nueva", "villa", "meta"], respuesta: "vida" },
  { pregunta: "Faltan ____ para las doce", opciones: ["cinco", "tres", "diez", "veinte"], respuesta: "cinco" },
  { pregunta: "Si quieres gozar, reír y cantar, toca el ____", opciones: ["piano merengue", "acordeón", "güiro y tambor", "violín"], respuesta: "piano merengue" },
  { pregunta: "Arbolito lindo de Navidad, ¿qué me ____?", opciones: ["vas a dar", "quieres dar", "traes hoy", "vas a contar"], respuesta: "vas a dar" },
  { pregunta: "Arre, ____, arre burro, arre", opciones: ["borriquito", "caballito", "burrito", "cielito"], respuesta: "borriquito" },
  { pregunta: "Por eso y muchas cosas más, ____", opciones: ["ven a mi casa esta Navidad", "te deseo feliz Navidad", "hoy te quiero cantar", "contigo quiero estar"], respuesta: "ven a mi casa esta Navidad" },
  { pregunta: "Yo no olvido al ____", opciones: ["año viejo", "año pasado", "viejo año", "tiempo ido"], respuesta: "año viejo" },
  { pregunta: "Baby, it's cold ____", opciones: ["outside", "in here", "tonight", "everywhere"], respuesta: "outside" },
  { pregunta: "But it doesn't ____ like Christmas at all", opciones: ["feel", "look", "sound", "smell"], respuesta: "feel" },
  { pregunta: "El ____ que lleva a Belén", opciones: ["camino", "sendero", "portal", "rey"], respuesta: "camino" },
  { pregunta: "I really can't ____", opciones: ["stay", "go", "leave", "wait"], respuesta: "stay" },
  { pregunta: "Navidad que vuelve, ____ del año", opciones: ["tradición", "alegría", "emoción", "ilusión"], respuesta: "tradición" },
  { pregunta: "Santa Claus is coming to ___", opciones: ["town", "you", "home", "us"], respuesta: "town" },
{ pregunta: "Let it snow, let it snow, let it ___", opciones: ["snow", "go", "flow", "glow"], respuesta: "snow" },
{ pregunta: "Rockin' around the Christmas ___", opciones: ["tree", "time", "night", "world"], respuesta: "tree" },
{ pregunta: "Have yourself a merry little ___", opciones: ["Christmas", "holiday", "winter", "night"], respuesta: "Christmas" },
{ pregunta: "It's beginning to look a lot like ___", opciones: ["Christmas", "winter", "holidays", "snow"], respuesta: "Christmas" },
{ pregunta: "Do you hear what I ___?", opciones: ["hear", "see", "feel", "know"], respuesta: "hear" },
{ pregunta: "You're a mean one, Mr. ___", opciones: ["Grinch", "Scrooge", "Santa", "Frost"], respuesta: "Grinch" },
{ pregunta: "Frosty the Snowman, was a ___ soul", opciones: ["jolly happy", "merry happy", "happy jolly", "cheerful happy"], respuesta: "jolly happy" },
{ pregunta: "Mele Kalikimaka is the thing to say on a bright Hawaiian ___", opciones: ["Christmas Day", "New Year's Eve", "holy night", "summer day"], respuesta: "Christmas Day" },
{ pregunta: "Just hear those sleigh bells ___", opciones: ["jingling", "ringing", "singing", "dancing"], respuesta: "jingling" },
{ pregunta: "Have a holly jolly Christmas, it's the ___ time of the year", opciones: ["best", "most wonderful", "happiest", "brightest"], respuesta: "best" },
{ pregunta: "Run, run Rudolph, Santa's got to ___ tonight", opciones: ["make it", "get there", "run fast", "fly high"], respuesta: "make it" },
{ pregunta: "Baby, it's cold ___", opciones: ["outside", "in here", "tonight", "everywhere"], respuesta: "outside" },
{ pregunta: "But it doesn't show signs of stopping, and I've bought some ___ for the ice", opciones: ["corn", "salt", "bags", "wood"], respuesta: "corn" },
{ pregunta: "I really can't ___", opciones: ["stay", "go", "leave", "wait"], respuesta: "stay" },
{ pregunta: "But it doesn't ___ like Christmas at all", opciones: ["feel", "look", "sound", "smell"], respuesta: "feel" },
{ pregunta: "The ___ that leads to Bethlehem", opciones: ["road", "path", "way", "star"], respuesta: "road" },
{ pregunta: "O come, all ye ___", opciones: ["faithful", "people", "children", "sinners"], respuesta: "faithful" },
{ pregunta: "We three kings of ___ are", opciones: ["Orient", "the East", "the world", "Israel"], respuesta: "Orient" },
{ pregunta: "What child is this, who laid to ___", opciones: ["rest", "sleep", "bed", "peace"], respuesta: "rest" }
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
          { pregunta: "¿Quién hace la mejor salsa navideña?", opciones: ["La abuela", "Mamá", "La tía", "Papá"], respuesta: "La abuela" },
          { pregunta: "¿Qué tradición tienen el 25 por la mañana?", opciones: ["Desayuno especial", "Abrir regalos", "Ir a misa", "Llamar a familiares"], respuesta: "Desayuno especial" },
          { pregunta: "¿Quién siempre olvida comprar algún regalo?", opciones: ["Papá", "Mamá", "Los niños", "El tío"], respuesta: "Papá" },
           { pregunta: "¿Comida favorita de JP?", opciones: ["Pollo en salsa de hongos", "Pavo horneado", "Lasagna", "Costillas BBQ"], respuesta: "Pollo en salsa de hongos" },
  { pregunta: "¿Costumbre navideña de JP?", opciones: ["Sandwich de pollo de abuela", "Abrir regalos a media noche", "Ver luces navideñas", "Cantar villancicos"], respuesta: "Sandwich de pollo de abuela" },
  { pregunta: "¿Costumbre de navidades pasadas de Ruth?", opciones: ["Amanecer bailando", "Cocinar tamales", "Ver películas", "Hacer galletas"], respuesta: "Amanecer bailando" },
  { pregunta: "¿Película navideña favorita de Ruth?", opciones: ["Santa Clause", "El Grinch", "Home Alone", "Love Actually"], respuesta: "Santa Clause" },
  { pregunta: "¿Comida navideña favorita de Camila?", opciones: ["Tamales", "Pierna horneada", "Roscas navideñas", "Pavo relleno"], respuesta: "Tamales" },
  { pregunta: "¿Canción navideña favorita de Isabella?", opciones: ["Christmas Evel", "All I Want for Christmas", "Last Christmas", "Jingle Bell Rock"], respuesta: "Christmas Evel" },
  { pregunta: "¿Canción navideña favorita de Paolo?", opciones: ["Navidad sin tí", "Feliz Navidad", "Noche de Paz", "Mi Burrito Sabanero"], respuesta: "Navidad sin tí" },
  { pregunta: "¿Canción navideña favorita de Santiago?", opciones: ["Navidad sin tí", "Los Peces en el Río", "Campana sobre campana", "El Año Viejo"], respuesta: "Navidad sin tí" },
  { pregunta: "¿Canción navideña favorita de Mateo?", opciones: ["Feliz Navidad", "Blanca Navidad", "Jingle Bells", "Noche de Paz"], respuesta: "Feliz Navidad" },
  { pregunta: "¿Costumbre de navidades pasadas de Santiago?", opciones: ["Reventar diablillos", "Jugar con fuegos artificiales", "Hacer una fogata", "Tocar música"], respuesta: "Reventar diablillos" },
  { pregunta: "¿Costumbre de navidades pasadas de Mateo?", opciones: ["Estar en familia", "Abrir regalos temprano", "Ver películas navideñas", "Cenar con amigos"], respuesta: "Estar en familia" }
        ]
      },
      familia: {
        titulo: "Completa el Refran!!",
        preguntas: [
          { pregunta: "Al que madruga...", opciones: ["Dios le ayuda", "le caen las manzanas", "nadie le ve", "le sale el sol"], respuesta: "Dios le ayuda" },
{ pregunta: "No por mucho madrugar...", opciones: ["se duerme más", "se amanece más temprano", "se hace más rico", "se vive mejor"], respuesta: "se amanece más temprano" },
{ pregunta: "A quien le pica...", opciones: ["se rasca", "se aguanta", "se queja", "se cura"], respuesta: "se rasca" },
{ pregunta: "Más vale pájaro en mano...", opciones: ["que dos volando", "que cien en el suelo", "que diez en el nido", "que ciento volando"], respuesta: "que ciento volando" },
{ pregunta: "Ojos que no ven...", opciones: ["boca que no come", "manos que no trabajan", "corazón que no siente", "oídos que no escuchan"], respuesta: "corazón que no siente" },
{ pregunta: "Cuando el río suena...", opciones: ["piedras lleva", "agua lleva", "peces lleva", "arena lleva"], respuesta: "piedras lleva" },
{ pregunta: "En boca cerrada...", opciones: ["no hay dolor", "no hay risa", "no entran moscas", "no salen palabras"], respuesta: "no entran moscas" },
{ pregunta: "Dime con quién andas...", opciones: ["y te diré quién eres", "y te diré adónde vas", "y te diré qué haces", "y te diré cómo estás"], respuesta: "y te diré quién eres" },
{ pregunta: "Camarón que se duerme...", opciones: ["se lo come el pez", "se lo lleva la corriente", "se despierta tarde", "no desayuna"], respuesta: "se lo lleva la corriente" },
{ pregunta: "A lo hecho...", opciones: ["pecho", "derecho", "hecho", "techo"], respuesta: "pecho" },
{ pregunta: "Más vale maña...", opciones: ["que belleza", "que dinero", "que fuerza", "que fama"], respuesta: "que fuerza" },
{ pregunta: "El que mucho abarca...", opciones: ["poco aprieta", "poco alcanza", "poco entiende", "poco disfruta"], respuesta: "poco aprieta" },
{ pregunta: "No hay mal que por bien...", opciones: ["no venga", "no vaya", "venga", "no salga"], respuesta: "no venga" },
{ pregunta: "Al no haber pan...", opciones: ["Tortillas", "buenas son galletas", "bueno es el arroz", "buenas son las frutas"], respuesta: "Tortillas" },
{ pregunta: "Donde hay humo...", opciones: ["hay fuego", "hay calor", "hay gente", "hay cocina"], respuesta: "hay fuego" },
{ pregunta: "Perro que ladra...", opciones: ["no duerme", "no come", "no muerde", "no juega"], respuesta: "no muerde" },
{ pregunta: "A buen entendedor...", opciones: ["pocas palabras", "muchas palabras", "buen hablador", "mejor oyente"], respuesta: "pocas palabras" },
{ pregunta: "El que ríe último...", opciones: ["ríe mejor", "más fuerte ríe", "más tarde ríe", "más feliz es"], respuesta: "ríe mejor" },
{ pregunta: "A caballo regalado...", opciones: ["no se le ve el colmillo", "no se le busca lado", "no se le cambia", "no se le vende"], respuesta: "no se le busca lado" },
{ pregunta: "Del árbol caído...", opciones: ["todos hacen leña", "todos recogen frutas", "todos se alejan", "todos tienen sombra"], respuesta: "todos hacen leña" },
{ pregunta: "Cría cuervos...", opciones: ["y te sacarán los ojos", "y te comerán el pan", "y te quitarán el sueño", "y te robarán el alma"], respuesta: "y te sacarán los ojos" },
{ pregunta: "La curiosidad mató...", opciones: ["al ratón", "al gato", "al perro", "al pájaro"], respuesta: "al gato" },
{ pregunta: "No dejes para mañana...", opciones: ["lo que puedes hacer hoy", "lo que puedes hacer después", "lo que puedes hacer nunca", "lo que puedes hacer pronto"], respuesta: "lo que puedes hacer hoy" },
{ pregunta: "Agua que no has de beber...", opciones: ["déjala correr", "tírala al mar", "guárdala bien", "ofrécesela a otro"], respuesta: "déjala correr" },
{ pregunta: "Dios aprieta...", opciones: ["pero no ahorca", "pero no castiga", "pero no olvida", "pero no abandona"], respuesta: "pero no ahorca" },
{ pregunta: "A palabras necias...", opciones: ["oídos sordos", "mente cerrada", "boca cerrada", "corazón duro"], respuesta: "oídos sordos" },
{ pregunta: "No hay peor ciego...", opciones: ["que el que no quiere ver", "que el que perdió la vista", "que el que se hace el ciego", "que el que no mira"], respuesta: "que el que no quiere ver" },
{ pregunta: "El que tiene boca...", opciones: ["se equivoca", "puede hablar", "puede comer", "puede cantar"], respuesta: "se equivoca" },
{ pregunta: "Cada oveja...", opciones: ["con su pareja", "en su corral", "con su cordero", "en su lugar"], respuesta: "con su pareja" },
{ pregunta: "El que se fue a Sevilla...", opciones: ["perdió su silla", "encontró su camino", "volvió contento", "se quedó allí"], respuesta: "perdió su silla" },
{ pregunta: "A mal tiempo...", opciones: ["buena cara", "paciencia", "resignación", "esperanza"], respuesta: "buena cara" },
{ pregunta: "El que mucho duerme...", opciones: ["poco aprende", "poco trabaja", "poco vive", "poco sueña"], respuesta: "poco aprende" },
{ pregunta: "A rey muerto...", opciones: ["rey puesto", "luto puesto", "corona nueva", "sucesor listo"], respuesta: "rey puesto" },
{ pregunta: "El que no arriesga...", opciones: ["no gana", "no pierde", "no vive", "no aprende"], respuesta: "no gana" },
{ pregunta: "A la cama no te irás...", opciones: ["sin saber una cosa más", "sin cenar", "sin rezar", "sin descansar"], respuesta: "sin saber una cosa más" },
{ pregunta: "El que siembra vientos...", opciones: ["cosecha tempestades", "recoge aire", "siembra tormentas", "cosecha nada"], respuesta: "cosecha tempestades" },
{ pregunta: "A falta de pan...", opciones: ["buenas son tortillas", "bueno es el arroz", "buenas son galletas", "buenas son frutas"], respuesta: "buenas son tortillas" },
{ pregunta: "El que con niños se acuesta...", opciones: ["mojado amanece", "cansado amanece", "feliz amanece", "temprano amanece"], respuesta: "mojado amanece" },
{ pregunta: "A cada cerdo...", opciones: ["le llega su San Martín", "le llega su día", "le llega su comida", "le llega su dueño"], respuesta: "le llega su San Martín" },
{ pregunta: "El que guarda...", opciones: ["siempre tiene", "nunca pierde", "siempre encuentra", "nunca falta"], respuesta: "siempre tiene" },
{ pregunta: "A Dios rogando...", opciones: ["y con el mazo dando", "y con fe esperando", "y con paciencia orando", "y con amor trabajando"], respuesta: "y con el mazo dando" },
{ pregunta: "El que nace para tamal...", opciones: ["del cielo le caen las hojas", "siempre será tamal", "nunca será tortilla", "siempre será comida"], respuesta: "del cielo le caen las hojas" },
{ pregunta: "A buen hambre...", opciones: ["no hay pan duro", "no hay mala comida", "no hay horario", "no hay mal sabor"], respuesta: "no hay pan duro" },
{ pregunta: "El que persevera...", opciones: ["alcanza", "triunfa", "logra", "consigue"], respuesta: "alcanza" },
{ pregunta: "A enemigo que huye...", opciones: ["puente de plata", "puerta abierta", "camino libre", "adios para siempre"], respuesta: "puente de plata" }
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
  
  // ✅ CAMBIO: 6 → 10 preguntas + mejor mezcla
  const mezcladas = [...todasPreguntas]
    .sort(() => Math.random() - 0.5)
    .sort(() => Math.random() - 0.5); // Doble mezcla
  
  const seleccionadas = mezcladas.slice(0, 10).map(p => mezclarOpciones(p)); // 6 → 10
  
  return seleccionadas;
};

  // Inicializar preguntas de la sesión
  useEffect(() => {
    if (preguntasSession.length === 0) {
      const nuevasPreguntas = obtenerPreguntasAleatorias(juegoId);
      setPreguntasSession(nuevasPreguntas);
    }
  }, [juegoId]);

  // Iniciar timer cuando aparece una nueva pregunta
  useEffect(() => {
    if (estado === "jugando" && !mostrarResultado && preguntasSession.length > 0) {
      setTiempoInicio(Date.now());
    }
  }, [preguntaActual, estado, mostrarResultado, preguntasSession]);

 const calcularPuntos = (esCorrecta, tiempoRespuesta, rachaActual) => {
  if (!esCorrecta) return 0;

  // ✅ CAMBIO: Puntos base aumentados
  let puntos = 15; // 10 → 15 puntos base
  
  // ✅ CAMBIO: Bono velocidad mejorado
  const bonoVelocidad = 
    tiempoRespuesta < 1500 ? 6 :  // ⚡ Súper rápido: +6
    tiempoRespuesta < 2500 ? 4 :  // 🔥 Rápido: +4
    tiempoRespuesta < 4000 ? 2 :  // ✅ Normal: +2
    0;
  puntos += bonoVelocidad;
  
  // ✅ CAMBIO: Bono racha mejorado y progresivo
  const bonoRacha = 
    rachaActual >= 7 ? 7 :  // 🏆 7+ seguidos: +7
    rachaActual >= 5 ? 5 :  // ⭐ 5-6 seguidos: +5
    rachaActual >= 3 ? 3 :  // 🔥 3-4 seguidos: +3
    rachaActual >= 2 ? 2 :  // 👍 2 seguidos: +2
    0;                      // 0-1 seguidos: 0
  puntos += bonoRacha;

  return puntos;
};
  const manejarRespuesta = (opcion) => {
    if (mostrarResultado || preguntasSession.length === 0) return;
    
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
      
      // Manejar rachas - incrementar racha actual
      const nuevaRacha = rachas + 1;
      setRachas(nuevaRacha);
      if (nuevaRacha > mejorRacha) {
        setMejorRacha(nuevaRacha);
      }
    } else {
      setPuntosGanados(0);
      setRachas(0); // Reset racha
    }

    // Siguiente pregunta después de un delay
    setTimeout(() => {
      if (preguntaActual < preguntasSession.length - 1) {
        setPreguntaActual(prev => prev + 1);
        setMostrarResultado(false);
        setOpcionSeleccionada(null);
        setPuntosGanados(0);
      } else {
        // Juego terminado
        const datosSession = {
          mejorRacha: mejorRacha,
          preguntasRespondidas: preguntasSession.length,
          duracion: Date.now() - tiempoInicio,
          detalles: {
            rachaMaxima: mejorRacha,
            preguntasCorrectas: Math.round(puntuacion / 10) // MEJORADO: cálculo más preciso
          }
        };
        guardarEnRanking(juegoId, puntuacion, datosSession);
        setEstado("terminado");
      }
    }, 2000);
  };

  const reiniciarJuego = () => {
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
          
          {/* MEJORADO: Solo mostrar nuevo récord cuando realmente lo sea */}
          {mejorPuntuacionCargada && puntuacion > mejorPuntuacion && mejorPuntuacion > 0 && (
            <div className="text-xl font-bold text-yellow-600 mb-4">
              🏆 ¡Nuevo récord personal!
            </div>
          )}
          
          {/* MEJORADO: Mensaje para primer juego */}
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
      
      {/* BARRA DE ESTADÍSTICAS MEJORADA */}
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

// MEMORY GAME MEJORADO - SISTEMA DE PUNTOS MÁS VARIADO
const MemoryGame = ({ 
  usuarioActual, 
  volverASeleccion, 
  guardarEnRanking, 
  obtenerMejorPuntuacionPersonal 
}) => {
  const cartasMemory = [
    "🎅", "🎅", "🎄", "🎄", "🎁", "🎁", "❄️", "❄️",
    "🌟", "🌟", "🦌", "🦌", "🍪", "🍪", "🔔", "🔔"
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

  // Cargar mejor puntuación al iniciar - CORREGIDO
  useEffect(() => {
    const cargarMejorPuntuacion = async () => {
      const mejor = await obtenerMejorPuntuacionPersonal("memory");
      setMejorPuntuacion(mejor);
      setMejorPuntuacionCargada(true);
    };
    cargarMejorPuntuacion();
  }, []);

// SISTEMA DE PUNTOS MEMORY MEJORADO - CORREGIDO
const calcularPuntuacionMemory = (totalMovimientos) => {
  const base = 50;
  let bonus = 0;
  const m = totalMovimientos;

  if (m <= 16) bonus = 150;        // Perfecto
  else if (m === 17) bonus = 135;  // Elite
  else if (m === 18) bonus = 125;  // Excelente+
  else if (m === 19) bonus = 115;  // Excelente
  else if (m === 20) bonus = 105;  // Muy bueno+
  else if (m === 21) bonus = 95;   // Muy bueno
  else if (m === 22) bonus = 85;   // Bueno+
  else if (m === 23) bonus = 75;   // Bueno
  else if (m === 24) bonus = 65;   // Regular+
  else if (m === 25) bonus = 55;   // Regular
  else if (m === 26) bonus = 45;   // Normal+
  else if (m === 27) bonus = 35;   // Normal
  else if (m === 28) bonus = 25;   // Básico+
  else if (m === 29) bonus = 20;   // Básico
  else if (m <= 32) bonus = 10;    // Principiante
  else bonus = 0;                  // Sin bonus

  const final = base + bonus;
  return Math.max(50, final);
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
            if (nuevosPares === 8) {
              setJuegoTerminado(true);
              // CALCULAR PUNTUACIÓN FINAL - SISTEMA MEJORADO
              const totalMovimientos = nuevosMovimientos;
              const puntuacionFinal = calcularPuntuacionMemory(totalMovimientos);
              setPuntuacion(puntuacionFinal);
              
              const datosSession = {
                paresEncontrados: 8,
                movimientos: totalMovimientos,
                duracion: 0,
                detalles: {
                  eficiencia: totalMovimientos <= 16 ? "perfecto" : 
                            totalMovimientos <= 20 ? "excelente" :
                            totalMovimientos <= 24 ? "muy bueno" : 
                            totalMovimientos <= 28 ? "bueno" : "normal",
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
          <div className="text-lg font-bold text-purple-700">{paresEncontrados}/8</div>
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

      <div className="grid grid-cols-4 gap-3 mb-6 max-w-md mx-auto">
        {cartas.map((carta, index) => (
          <button
            key={carta.id}
            onClick={() => voltearCarta(index)}
            disabled={carta.encontrada || bloquearClics}
            className={`w-16 h-16 text-2xl rounded-xl transition-all duration-300 transform ${
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
          
          {/* CORRECCIÓN: Solo mostrar "Nuevo récord" cuando realmente lo sea */}
          {mejorPuntuacionCargada && puntuacion > mejorPuntuacion && mejorPuntuacion > 0 && (
            <p className="text-green-800 font-bold mt-2">
              🏆 ¡Nuevo récord personal!
            </p>
          )}
          
          {/* Mostrar mensaje diferente para primer juego */}
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
      descripcion: "Descubre la película navideña por emojis",
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
      descripcion: "Adivina el refran",
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
            🎮 Zona de Juegos Navideños
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-light">
            Competitividad mejorada. ¡Supera tus propios récords!
          </p>
           <p className="text-xl text-gray-600 mb-8 font-light">
           ⭐ "Premios para Líderes de rankings los Domingos"
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
          
          <div className="bg-green-100 border border-green-400 rounded-lg p-3 inline-block">
            <p className="text-green-700 text-sm">
              🔥 <strong>Sistema en tiempo real:</strong> Los rankings se actualizan automáticamente
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