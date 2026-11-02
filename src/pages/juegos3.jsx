// src/pages/juegos3.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";
import IcePong from "../components/juegos/IcePong";
import SantaSnake from "../components/juegos/SantaSnake";

// =============================================
// 🗺️ TERRITORY WARS - POWER POR USUARIO / 
// =============================================
const TerritoryWars = ({ volverASeleccion, guardarEnRanking, usuarioActual }) => {
  // 🎯 CONFIGURACIÓN
  const EQUIPOS = {
    ROJO: { nombre: "Rojo", color: "bg-red-500", emoji: "🔴", maxJugadores: 5 },
    AZUL: { nombre: "Azul", color: "bg-blue-500", emoji: "🔵", maxJugadores: 5 },
    VERDE: { nombre: "Verde", color: "bg-green-500", emoji: "🟢", maxJugadores: 5 },
    AMARILLO: { nombre: "Amarillo", color: "bg-yellow-500", emoji: "🟡", maxJugadores: 5 }
  };

  // 🎯 SISTEMA DE POWER POR USUARIO (10 diarios a las 6 AM)
  const COSTOS_POWER = {
    construir: 3,
    atacar: 2,
    proteger: 4,
    powerDiario: 10,
    horaReset: 6 // 6 AM hora local
  };

  // 🎯 DURACIÓN DE PROTECCIÓN (4 horas)
  const DURACION_PROTECCION = 4 * 60 * 60 * 1000; // 4 horas en milisegundos

  // 📝 LIBRO DE REGISTRO DE ACCIONES
  const [libroAcciones, setLibroAcciones] = useState([]);

  // 🛡️ FUNCIÓN PARA VERIFICAR SI PROTECCIÓN SIGUE ACTIVA
  const estaProtegido = (terreno) => {
    if (!terreno || !terreno.protegido || !terreno.proteccionHasta) return false;
    
    const ahora = Date.now();
    return terreno.proteccionHasta > ahora;
  };

  // 🎯 CALCULAR FECHA DE CIERRE (Domingo 6:00 PM Honduras)
  const calcularCierre = () => {
    const ahora = new Date();
    const hoy = ahora.getDay();
    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    
    if (hoy === 0 && (horas < 18 || (horas === 18 && minutos === 0))) {
      const cierre = new Date(ahora);
      cierre.setHours(18, 0, 0, 0);
      return cierre;
    }
    
    const diasHastaDomingo = hoy === 0 ? 7 : 7 - hoy;
    const cierre = new Date(ahora);
    cierre.setDate(ahora.getDate() + diasHastaDomingo);
    cierre.setHours(18, 0, 0, 0);
    return cierre;
  };

  // 🎯 ESTADO PRINCIPAL
  const [miEquipo, setMiEquipo] = useState(null);
  const [tablero, setTablero] = useState([]);
  const [terrenoSeleccionado, setTerrenoSeleccionado] = useState(null);
  const [fechaCierre] = useState(calcularCierre());
  const [jugadoresPorEquipo, setJugadoresPorEquipo] = useState({
    ROJO: [], AZUL: [], VERDE: [], AMARILLO: []
  });
  
  // 🎯 POWER POR USUARIO - GUARDADO EN FIREBASE
  const [power, setPower] = useState(null);
  const [ultimoReset, setUltimoReset] = useState(null);

  // 📝 CARGAR LIBRO DE ACCIONES DESDE FIREBASE
  const cargarLibroAcciones = async () => {
    try {
      const accionesData = await gobaService.obtenerDocumentoTerritoryWars('libroAcciones');
      if (accionesData && Array.isArray(accionesData.acciones)) {
        // Mantener solo las últimas 50 acciones para no sobrecargar
        setLibroAcciones(accionesData.acciones.slice(0, 50));
      }
    } catch (error) {
      console.log('Error cargando libro de acciones:', error);
      setLibroAcciones([]);
    }
  };

  // 📝 GUARDAR ACCIÓN EN EL LIBRO DE REGISTRO
  const guardarAccionEnLibro = async (accion, detalles = {}) => {
    try {
      const nuevaAccion = {
        id: Date.now(),
        timestamp: Date.now(),
        fechaHora: new Date().toLocaleString('es-HN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit'
        }),
        jugador: usuarioActual.nombre || usuarioActual.usuario || 'Jugador',
        equipo: miEquipo ? EQUIPOS[miEquipo].nombre : 'Sin equipo',
        accion: accion,
        detalles: detalles,
        powerRestante: power
      };

      // Agregar al estado local (mostrar al principio)
      setLibroAcciones(prev => [nuevaAccion, ...prev.slice(0, 49)]);

      // Guardar en Firebase
      const accionesData = await gobaService.obtenerDocumentoTerritoryWars('libroAcciones');
      const accionesExistentes = accionesData?.acciones || [];
      const nuevasAcciones = [nuevaAccion, ...accionesExistentes].slice(0, 100); // Mantener últimas 100

      await gobaService.actualizarDocumentoTerritoryWars('libroAcciones', {
        acciones: nuevasAcciones,
        ultimaActualizacion: Date.now()
      });

    } catch (error) {
      console.log('Error guardando acción en libro:', error);
    }
  };

  // 👥 CARGAR JUGADORES POR EQUIPO DESDE FIREBASE
  const cargarJugadoresEquipos = async () => {
    try {
      const jugadoresData = await gobaService.obtenerDocumentoTerritoryWars('jugadoresEquipos');
      if (jugadoresData) {
        setJugadoresPorEquipo(jugadoresData);
      } else {
        await guardarJugadoresEquipos({ ROJO: [], AZUL: [], VERDE: [], AMARILLO: [] });
      }
    } catch (error) {
      console.log('Error cargando jugadores:', error);
      const jugadoresGuardados = localStorage.getItem('territoryWars_jugadoresEquipos');
      if (jugadoresGuardados) setJugadoresPorEquipo(JSON.parse(jugadoresGuardados));
    }
  };

  // 💾 GUARDAR JUGADORES POR EQUIPO EN FIREBASE
  const guardarJugadoresEquipos = async (nuevosJugadores) => {
    try {
      await gobaService.actualizarDocumentoTerritoryWars('jugadoresEquipos', nuevosJugadores);
      setJugadoresPorEquipo(nuevosJugadores);
    } catch (error) {
      console.log('Error guardando en Firebase:', error);
      setJugadoresPorEquipo(nuevosJugadores);
      localStorage.setItem('territoryWars_jugadoresEquipos', JSON.stringify(nuevosJugadores));
    }
  };

  // 🗺️ CONVERTIR OBJETO FIREBASE A ARRAY 7x7
  const convertirAArray = (tableroObjeto) => {
    const array = Array(7).fill().map(() => Array(7).fill(null));
    if (!tableroObjeto) return array;
    
    Object.entries(tableroObjeto).forEach(([clave, datos]) => {
      const [fila, columna] = clave.split('-').map(Number);
      if (fila >= 0 && fila < 7 && columna >= 0 && columna < 7) {
        array[fila][columna] = { ...datos, fila, columna, id: clave };
      }
    });
    
    return array;
  };

  // 🗺️ CARGAR TABLERO COMPARTIDO DESDE FIREBASE
  const cargarTableroCompartido = async () => {
    try {
      const data = await gobaService.obtenerDocumentoTerritoryWars('tableroActual');
      if (data && data.tablero) {
        const tableroArray = convertirAArray(data.tablero);
        setTablero(tableroArray);
        console.log('✅ Tablero cargado desde Firebase');
      } else {
        console.log('🆕 Creando nuevo tablero en Firebase');
        await inicializarTableroCompartido();
      }
    } catch (error) {
      console.log('Error cargando tablero:', error);
      inicializarTableroLocal();
    }
  };

  // 🗺️ INICIALIZAR TABLERO COMPARTIDO EN FIREBASE
  const inicializarTableroCompartido = async () => {
    const tableroObjeto = {};
    
    for (let fila = 0; fila < 7; fila++) {
      for (let columna = 0; columna < 7; columna++) {
        const clave = `${fila}-${columna}`;
        tableroObjeto[clave] = {
          equipo: null, 
          nivel: 1, 
          protegido: false, 
          proteccionHasta: null, 
          ultimaActualizacion: Date.now()
        };
      }
    }

    // Bases iniciales
    tableroObjeto['0-0'].equipo = "ROJO";
    tableroObjeto['0-6'].equipo = "AZUL";
    tableroObjeto['6-0'].equipo = "VERDE";
    tableroObjeto['6-6'].equipo = "AMARILLO";

    try {
      await gobaService.actualizarDocumentoTerritoryWars('tableroActual', {
        tablero: tableroObjeto,
        metadata: { 
          fechaCreacion: Date.now(), 
          fechaCierre: fechaCierre.getTime(), 
          version: "3.3" 
        }
      });
      
      const tableroArray = convertirAArray(tableroObjeto);
      setTablero(tableroArray);
      console.log('✅ Tablero inicializado en Firebase');
    } catch (error) {
      console.log('Error inicializando tablero:', error);
      inicializarTableroLocal();
    }
  };

  // 🗺️ INICIALIZAR TABLERO LOCAL (fallback)
  const inicializarTableroLocal = () => {
    const nuevoTablero = Array(7).fill().map((_, fila) => 
      Array(7).fill().map((_, columna) => ({
        id: `${fila}-${columna}`, 
        fila, 
        columna, 
        equipo: null, 
        nivel: 1, 
        protegido: false, 
        proteccionHasta: null
      }))
    );

    nuevoTablero[0][0].equipo = "ROJO";
    nuevoTablero[0][6].equipo = "AZUL";
    nuevoTablero[6][0].equipo = "VERDE";
    nuevoTablero[6][6].equipo = "AMARILLO";

    setTablero(nuevoTablero);
  };

  // 🔄 ESCUCHAR CAMBIOS EN EL TABLERO EN TIEMPO REAL
  useEffect(() => {
    const unsubscribe = gobaService.escucharDocumentoTerritoryWars('tableroActual', (data) => {
      if (data && data.tablero) {
        const tableroActualizado = convertirAArray(data.tablero);
        setTablero(tableroActualizado);
        console.log('🔄 Tablero actualizado en tiempo real');
      }
    });

    return () => unsubscribe();
  }, []);

  // 👤 ASIGNAR EQUIPO AL USUARIO
  const asignarEquipoUsuario = async () => {
    try {
      const data = await gobaService.obtenerDocumentoTerritoryWars('equiposUsuarios');
      if (data) {
        const equipoGuardado = data[usuarioActual.id];
        if (equipoGuardado && EQUIPOS[equipoGuardado]) {
          setMiEquipo(equipoGuardado);
          return;
        }
      }
    } catch (error) {
      console.log('Error cargando equipo:', error);
      const equipoGuardado = localStorage.getItem(`territoryWars_equipo_${usuarioActual.id}`);
      if (equipoGuardado && EQUIPOS[equipoGuardado]) {
        setMiEquipo(equipoGuardado);
        return;
      }
    }
    setMiEquipo(null);
  };

  // 🎯 ELEGIR EQUIPO CON LÍMITE
  const elegirEquipo = async (equipoElegido) => {
    const jugadoresEnEquipo = jugadoresPorEquipo[equipoElegido] || [];
    
    if (jugadoresEnEquipo.length >= EQUIPOS[equipoElegido].maxJugadores) {
      alert(`❌ El ${EQUIPOS[equipoElegido].nombre} ya está completo (5/5 jugadores)`);
      return;
    }

    const nuevosJugadores = { ...jugadoresPorEquipo };
    Object.keys(nuevosJugadores).forEach(equipo => {
      nuevosJugadores[equipo] = nuevosJugadores[equipo].filter(jugador => jugador.id !== usuarioActual.id);
    });

    const infoJugador = {
      id: usuarioActual.id,
      nombre: usuarioActual.nombre || usuarioActual.usuario || 'Jugador',
      fechaUnion: new Date().toISOString()
    };

    nuevosJugadores[equipoElegido] = [...(nuevosJugadores[equipoElegido] || []), infoJugador];
    
    await guardarJugadoresEquipos(nuevosJugadores);
    setMiEquipo(equipoElegido);
    
    try {
      await gobaService.actualizarDocumentoTerritoryWars('equiposUsuarios', {
        [usuarioActual.id]: equipoElegido
      });
    } catch (error) {
      localStorage.setItem(`territoryWars_equipo_${usuarioActual.id}`, equipoElegido);
    }
    
    guardarEnRanking("territory-wars", 0, {
      accion: "unirse_equipo", 
      equipo: equipoElegido, 
      jugadoresEnEquipo: nuevosJugadores[equipoElegido].length
    });

    // Registrar en libro de acciones
    guardarAccionEnLibro('unirse_equipo', {
      equipo: EQUIPOS[equipoElegido].nombre,
      jugadoresEnEquipo: nuevosJugadores[equipoElegido].length
    });
  };

  // ⚡ CARGAR POWER - CORRECCIÓN DEL BUG DE RESET
  const cargarPowerUsuario = async () => {
    try {
      console.log(`🔍 Cargando power para usuario: ${usuarioActual.id}`);
      
      // Intentar cargar desde Firebase
      const powerData = await gobaService.obtenerDocumentoTerritoryWars('powerUsuarios');
      const ahora = new Date();
      
      // Crear fecha de reset de HOY a las 6 AM
      const hoy6AM = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        COSTOS_POWER.horaReset, 0, 0, 0
      );
      const hoy6AMTime = hoy6AM.getTime();
      
      // Si son antes de las 6 AM, usar el reset de AYER a las 6 AM
      const resetComparar = ahora.getHours() < COSTOS_POWER.horaReset ? 
        hoy6AMTime - (24 * 60 * 60 * 1000) : // Ayer 6 AM
        hoy6AMTime; // Hoy 6 AM
      
      if (powerData && powerData[usuarioActual.id]) {
        const userPower = powerData[usuarioActual.id];
        console.log(`📊 Datos encontrados en Firebase:`, userPower);
        
        const ultimoResetGuardado = userPower.ultimoReset || 0;
        
        console.log(`🕒 Comparando reset:
          - Último reset guardado: ${new Date(ultimoResetGuardado).toLocaleString()}
          - Reset a comparar: ${new Date(resetComparar).toLocaleString()}
          - ¿Necesita reset? ${ultimoResetGuardado < resetComparar}
        `);
        
        // ✅ CORRECCIÓN DEL BUG: Resetear si el último reset fue ANTES del reset de hoy/ayer 6 AM
        if (ultimoResetGuardado < resetComparar) {
          console.log(`🔄 RESET NECESARIO para ${usuarioActual.nombre}`);
          
          const nuevoPower = COSTOS_POWER.powerDiario;
          const nuevoReset = resetComparar; // Usar el timestamp del reset (6 AM)
          
          setPower(nuevoPower);
          setUltimoReset(nuevoReset);
          
          await guardarPowerUsuarioFirebase(nuevoPower, nuevoReset);
          
          console.log(`✅ Power reseteado a ${nuevoPower}/10`);
        } else {
          // No necesita reset, usar valores guardados
          const nuevoPower = Math.min(userPower.power || COSTOS_POWER.powerDiario, COSTOS_POWER.powerDiario);
          const nuevoReset = ultimoResetGuardado;
          
          setPower(nuevoPower);
          setUltimoReset(nuevoReset);
          
          console.log(`✅ Power cargado: ${nuevoPower}/10`);
        }
        
      } else {
        // Primer inicio para este usuario
        console.log(`🆕 Primer inicio para usuario ${usuarioActual.id}`);
        
        const nuevoPower = COSTOS_POWER.powerDiario;
        const nuevoReset = resetComparar;
        
        setPower(nuevoPower);
        setUltimoReset(nuevoReset);
        
        await guardarPowerUsuarioFirebase(nuevoPower, nuevoReset);
        
        console.log(`✅ Power inicializado: ${nuevoPower}/10`);
      }
      
    } catch (error) {
      console.log('❌ Error cargando power desde Firebase:', error);
      
      // Fallback a localStorage
      const savedPower = localStorage.getItem(`territoryWars_power_${usuarioActual.id}`);
      const savedReset = localStorage.getItem(`territoryWars_reset_${usuarioActual.id}`);
      
      const ahora = new Date();
      const hoy6AM = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        COSTOS_POWER.horaReset, 0, 0, 0
      );
      const hoy6AMTime = hoy6AM.getTime();
      const resetComparar = ahora.getHours() < COSTOS_POWER.horaReset ? 
        hoy6AMTime - (24 * 60 * 60 * 1000) : hoy6AMTime;
      
      let nuevoPower = COSTOS_POWER.powerDiario;
      let nuevoReset = resetComparar;
      
      if (savedReset && savedPower) {
        const ultimoResetTime = parseInt(savedReset);
        const powerGuardado = parseInt(savedPower);
        
        // ✅ CORRECCIÓN: Misma lógica de reset
        if (ultimoResetTime < resetComparar) {
          console.log(`🔄 Reset necesario en localStorage`);
        } else {
          nuevoPower = Math.min(powerGuardado, COSTOS_POWER.powerDiario);
          nuevoReset = ultimoResetTime;
          console.log(`✅ Usando power guardado: ${nuevoPower}/10`);
        }
      }
      
      setPower(nuevoPower);
      setUltimoReset(nuevoReset);
      
      localStorage.setItem(`territoryWars_power_${usuarioActual.id}`, nuevoPower.toString());
      localStorage.setItem(`territoryWars_reset_${usuarioActual.id}`, nuevoReset.toString());
      
      console.log(`💾 Power guardado en localStorage: ${nuevoPower}/10`);
    }
  };

  // 💾 GUARDAR POWER POR USUARIO EN FIREBASE
  const guardarPowerUsuarioFirebase = async (nuevoPower, nuevoReset) => {
    try {
      console.log(`💾 Guardando power: ${nuevoPower}/10, reset: ${new Date(nuevoReset).toLocaleString()}`);
      
      const powerData = await gobaService.obtenerDocumentoTerritoryWars('powerUsuarios');
      const nuevosDatos = {
        ...(powerData || {}),
        [usuarioActual.id]: {
          power: nuevoPower,
          ultimoReset: nuevoReset,
          usuario: usuarioActual.nombre || usuarioActual.usuario,
          ultimaActualizacion: Date.now()
        }
      };
      
      await gobaService.actualizarDocumentoTerritoryWars('powerUsuarios', nuevosDatos);
      console.log(`✅ Power guardado en Firebase`);
      
      // También guardar en localStorage como backup
      localStorage.setItem(`territoryWars_power_${usuarioActual.id}`, nuevoPower.toString());
      localStorage.setItem(`territoryWars_reset_${usuarioActual.id}`, nuevoReset.toString());
      
    } catch (error) {
      console.log('❌ Error guardando power en Firebase:', error);
      // Fallback a localStorage
      localStorage.setItem(`territoryWars_power_${usuarioActual.id}`, nuevoPower.toString());
      localStorage.setItem(`territoryWars_reset_${usuarioActual.id}`, nuevoReset.toString());
    }
  };

  // 🎯 VERIFICAR RESET DIARIO - SIMPLIFICADO Y CORREGIDO
  const verificarResetDiario = async () => {
    if (power === null || ultimoReset === null) {
      console.log('⏳ Power no cargado todavía, omitiendo verificación');
      return false;
    }
    
    const ahora = new Date();
    
    // Crear fecha de reset de HOY a las 6 AM
    const hoy6AM = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      COSTOS_POWER.horaReset, 0, 0, 0
    );
    const hoy6AMTime = hoy6AM.getTime();
    
    // Determinar cuál es el reset que debería tener ahora
    const resetComparar = ahora.getHours() < COSTOS_POWER.horaReset ? 
      hoy6AMTime - (24 * 60 * 60 * 1000) : // Ayer 6 AM
      hoy6AMTime; // Hoy 6 AM
    
    console.log(`🕒 Verificando reset diario:
      - Power actual: ${power}
      - Último reset: ${new Date(ultimoReset).toLocaleString()}
      - Reset esperado: ${new Date(resetComparar).toLocaleString()}
      - Comparación: ${ultimoReset} < ${resetComparar} ? ${ultimoReset < resetComparar}
    `);
    
    // ✅ CORRECCIÓN: Solo resetear si el último reset fue ANTES del reset esperado (6 AM)
    if (ultimoReset < resetComparar) {
      console.log(`🔄 RESET DIARIO NECESARIO!`);
      
      const nuevoPower = COSTOS_POWER.powerDiario;
      const nuevoReset = resetComparar;
      
      setPower(nuevoPower);
      setUltimoReset(nuevoReset);
      
      await guardarPowerUsuarioFirebase(nuevoPower, nuevoReset);
      
      console.log(`✅ Power reseteado a ${nuevoPower}/10`);
      return true;
    }
    
    console.log(`⏳ No es hora de reset todavía`);
    return false;
  };

  // 💾 GASTAR POWER
  const gastarPower = async (costo, accion, detalles = {}) => {
    if (power === null) {
      console.log('❌ Power no cargado, no se puede gastar');
      return;
    }
    
    const nuevoPower = Math.max(0, power - costo);
    console.log(`💸 Gastando power: ${power} - ${costo} = ${nuevoPower}`);
    
    setPower(nuevoPower);
    
    await guardarPowerUsuarioFirebase(nuevoPower, ultimoReset);
    
    // Registrar acción en libro
    guardarAccionEnLibro(accion, {
      ...detalles,
      costoPower: costo,
      powerRestante: nuevoPower
    });
  };

  // 🔓 VERIFICAR Y LIBERAR PROTECCIONES CADUCADAS
  const verificarProtecciones = async () => {
    const ahora = Date.now();
    let necesitaActualizar = false;
    
    const nuevoTablero = tablero.map((fila, filaIndex) => 
      fila.map((terreno, columnaIndex) => {
        if (terreno && terreno.protegido && terreno.proteccionHasta) {
          if (terreno.proteccionHasta <= ahora) {
            console.log(`🛡️ Protección liberada en ${filaIndex}-${columnaIndex}`);
            
            necesitaActualizar = true;
            return {
              ...terreno,
              protegido: false,
              proteccionHasta: null,
              ultimaActualizacion: Date.now()
            };
          }
        }
        return terreno;
      })
    );
    
    if (necesitaActualizar) {
      console.log('🔄 Actualizando tablero después de liberar protecciones');
      setTablero(nuevoTablero);
      await actualizarTableroCompleto(nuevoTablero);
    }
  };

  // 💾 ACTUALIZAR TABLERO COMPLETO EN FIREBASE
  const actualizarTableroCompleto = async (nuevoTableroArray) => {
    try {
      const tableroObjeto = {};
      nuevoTableroArray.forEach((fila, filaIndex) => {
        fila.forEach((terreno, columnaIndex) => {
          if (terreno) {
            const clave = `${filaIndex}-${columnaIndex}`;
            tableroObjeto[clave] = {
              equipo: terreno.equipo,
              nivel: terreno.nivel || 1,
              protegido: terreno.protegido || false,
              proteccionHasta: terreno.proteccionHasta || null,
              ultimaActualizacion: Date.now()
            };
          }
        });
      });
      
      await gobaService.actualizarDocumentoTerritoryWars('tableroActual', {
        tablero: tableroObjeto,
        metadata: { 
          fechaCreacion: Date.now(), 
          fechaCierre: fechaCierre.getTime(), 
          version: "3.3",
          ultimaActualizacion: Date.now()
        }
      });
      
      setTablero(nuevoTableroArray);
      console.log('✅ Protecciones actualizadas en Firebase');
    } catch (error) {
      console.error('Error actualizando protecciones:', error);
    }
  };

  // 💾 ACTUALIZAR TERRENO EN FIREBASE
  const actualizarTerrenoEnFirebase = async (fila, columna, nuevosDatos) => {
    const clave = `${fila}-${columna}`;
    try {
      const documentoCompleto = await gobaService.obtenerDocumentoTerritoryWars('tableroActual');
      
      if (!documentoCompleto || !documentoCompleto.tablero) {
        alert('Error: No se pudo cargar el tablero.');
        return false;
      }

      const tableroActualizado = {
        ...documentoCompleto.tablero,
        [clave]: {
          ...documentoCompleto.tablero[clave],
          ...nuevosDatos,
          ultimaActualizacion: Date.now(),
          ultimoJugador: usuarioActual.id
        }
      };

      const exito = await gobaService.actualizarDocumentoTerritoryWars('tableroActual', {
        ...documentoCompleto,
        tablero: tableroActualizado,
        ultimaActualizacion: Date.now()
      });

      if (exito) {
        const nuevoTableroArray = convertirAArray(tableroActualizado);
        setTablero(nuevoTableroArray);
        return true;
      }
      return false;

    } catch (error) {
      console.error('Error actualizando terreno:', error);
      alert('Error de conexión. Intenta nuevamente.');
      return false;
    }
  };

  // 🏗️ CONSTRUIR - Costo: 3 power
  const construir = async () => {
    if (!terrenoSeleccionado || power === null || power < COSTOS_POWER.construir || !miEquipo) {
      console.log(`❌ No se puede construir: power=${power}, miEquipo=${miEquipo}`);
      return;
    }

    const { fila, columna } = terrenoSeleccionado;
    const terreno = tablero[fila][columna];

    if (terreno && terreno.equipo === null) {
      const nuevoTerreno = { 
        ...terreno, 
        equipo: miEquipo, 
        nivel: 1, 
        protegido: false 
      };
      
      const exito = await actualizarTerrenoEnFirebase(fila, columna, nuevoTerreno);
      
      if (exito) {
        await gastarPower(COSTOS_POWER.construir, 'construir', {
          territorio: `${fila}-${columna}`,
          equipo: EQUIPOS[miEquipo].nombre
        });
        
        guardarEnRanking("territory-wars", 10, { 
          accion: "construir", 
          equipo: miEquipo, 
          territorio: `${fila}-${columna}`,
          jugador: usuarioActual.nombre
        });
      }
    } else {
      alert('❌ Solo puedes construir en territorios neutrales');
    }
  };

  // ⚔️ ATACAR - Costo: 2 power
  const atacar = async () => {
    if (!terrenoSeleccionado || power === null || power < COSTOS_POWER.atacar || !miEquipo) {
      console.log(`❌ No se puede atacar: power=${power}, miEquipo=${miEquipo}`);
      return;
    }

    const { fila, columna } = terrenoSeleccionado;
    const terreno = tablero[fila][columna];

    if (terreno && terreno.equipo && terreno.equipo !== miEquipo && !estaProtegido(terreno)) {
      const nuevoTerreno = { 
        ...terreno, 
        equipo: null, 
        nivel: 1, 
        protegido: false 
      };
      
      const exito = await actualizarTerrenoEnFirebase(fila, columna, nuevoTerreno);
      
      if (exito) {
        await gastarPower(COSTOS_POWER.atacar, 'atacar', {
          territorio: `${fila}-${columna}`,
          equipoAtacante: EQUIPOS[miEquipo].nombre,
          equipoDefensor: EQUIPOS[terreno.equipo].nombre
        });
        
        guardarEnRanking("territory-wars", 15, { 
          accion: "atacar", 
          equipoAtacante: miEquipo, 
          equipoDefensor: terreno.equipo, 
          territorio: `${fila}-${columna}`,
          jugador: usuarioActual.nombre
        });
      }
    } else {
      if (estaProtegido(terreno)) {
        const ahora = Date.now();
        const tiempoRestante = terreno.proteccionHasta - ahora;
        const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
        const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        
        alert(`❌ Este territorio está protegido por ${horas}h ${minutos}m más`);
      } else {
        alert('❌ Solo puedes atacar territorios enemigos');
      }
    }
  };

  // 🛡️ PROTEGER - Costo: 4 power
  const proteger = async () => {
    if (!terrenoSeleccionado || power === null || power < COSTOS_POWER.proteger || !miEquipo) {
      console.log(`❌ No se puede proteger: power=${power}, miEquipo=${miEquipo}`);
      return;
    }

    const { fila, columna } = terrenoSeleccionado;
    const terreno = tablero[fila][columna];

    if (terreno && terreno.equipo === miEquipo && !estaProtegido(terreno)) {
      const proteccionHasta = Date.now() + DURACION_PROTECCION;
      const nuevoTerreno = { 
        ...terreno, 
        protegido: true, 
        proteccionHasta: proteccionHasta 
      };
      
      const exito = await actualizarTerrenoEnFirebase(fila, columna, nuevoTerreno);
      
      if (exito) {
        await gastarPower(COSTOS_POWER.proteger, 'proteger', {
          territorio: `${fila}-${columna}`,
          equipo: EQUIPOS[miEquipo].nombre,
          proteccionHasta: new Date(proteccionHasta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          duracionHoras: 4
        });
        
        guardarEnRanking("territory-wars", 5, { 
          accion: "proteger", 
          equipo: miEquipo, 
          territorio: `${fila}-${columna}`,
          proteccionHasta: proteccionHasta,
          duracionHoras: 4,
          jugador: usuarioActual.nombre
        });
      }
    } else {
      if (estaProtegido(terreno)) {
        const ahora = Date.now();
        const tiempoRestante = terreno.proteccionHasta - ahora;
        const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
        const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        
        alert(`❌ Este territorio ya está protegido por ${horas}h ${minutos}m más`);
      } else {
        alert('❌ Solo puedes proteger tus propios territorios');
      }
    }
  };

  // 🎯 SELECCIONAR TERRENO
  const seleccionarTerreno = (fila, columna) => {
    setTerrenoSeleccionado({ fila, columna });
  };

  // ⚡ VERIFICAR RESET CADA MINUTO
  useEffect(() => {
    if (power !== null && ultimoReset !== null) {
      const interval = setInterval(() => {
        verificarResetDiario();
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [power, ultimoReset]);

  // ⚡ INICIALIZAR Y CARGAR DATOS
  useEffect(() => {
    console.log(`🔍 INICIO - Cargando datos...`);
    
    cargarTableroCompartido();
    cargarPowerUsuario();
    cargarJugadoresEquipos();
    cargarLibroAcciones();
    asignarEquipoUsuario();
    
    const intervalProtecciones = setInterval(verificarProtecciones, 60000);
    return () => clearInterval(intervalProtecciones);
  }, []);

  // 📊 CALCULAR ESTADÍSTICAS
  const [estadisticas, setEstadisticas] = useState({
    ROJO: { territorios: 0, poder: 0 },
    AZUL: { territorios: 0, poder: 0 },
    VERDE: { territorios: 0, poder: 0 },
    AMARILLO: { territorios: 0, poder: 0 }
  });

  useEffect(() => {
    const calcular = () => {
      const nuevasStats = { 
        ROJO: { territorios: 0, poder: 0 }, 
        AZUL: { territorios: 0, poder: 0 }, 
        VERDE: { territorios: 0, poder: 0 }, 
        AMARILLO: { territorios: 0, poder: 0 } 
      };

      tablero.forEach(fila => {
        fila.forEach(terreno => {
          if (terreno && terreno.equipo) {
            nuevasStats[terreno.equipo].territorios++;
            nuevasStats[terreno.equipo].poder += terreno.nivel || 1;
          }
        });
      });

      setEstadisticas(nuevasStats);
    };

    if (tablero.length > 0) {
      calcular();
    }
  }, [tablero]);

  // ⏰ CALCULAR TIEMPO RESTANTE PARA CIERRE
  const calcularTiempoRestanteCierre = () => {
    const ahora = new Date();
    const diferencia = fechaCierre - ahora;
    
    if (diferencia <= 0) {
      return { dias: 0, horas: 0, minutos: 0, terminado: true };
    }
    
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return { dias, horas, minutos, terminado: false };
  };

  // ⏰ CALCULAR TIEMPO PARA PRÓXIMO RESET (6 AM)
  const calcularTiempoParaReset = () => {
    const ahora = new Date();
    const hoy6AM = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      COSTOS_POWER.horaReset, 0, 0, 0
    );
    
    if (ahora.getTime() >= hoy6AM.getTime()) {
      hoy6AM.setDate(hoy6AM.getDate() + 1);
    }
    
    const diferencia = hoy6AM - ahora;
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return { horas, minutos };
  };

  // 📝 RENDERIZAR LIBRO DE ACCIONES
  const renderLibroAcciones = () => {
    if (libroAcciones.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-200">
          <h3 className="font-bold mb-4 text-gray-800 text-center">📋 Registro de Acciones</h3>
          <div className="text-center py-4 text-gray-500">
            No hay acciones registradas aún
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-200">
        <h3 className="font-bold mb-4 text-gray-800 text-center">📋 Últimas Acciones</h3>
        
        <div className="max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {libroAcciones.slice(0, 10).map((accion) => {
              let colorFondo = 'bg-gray-50';
              let icono = '📝';
              
              switch(accion.accion) {
                case 'construir':
                  colorFondo = 'bg-green-50';
                  icono = '🏗️';
                  break;
                case 'atacar':
                  colorFondo = 'bg-red-50';
                  icono = '⚔️';
                  break;
                case 'proteger':
                  colorFondo = 'bg-blue-50';
                  icono = '🛡️';
                  break;
                case 'unirse_equipo':
                  colorFondo = 'bg-purple-50';
                  icono = '👥';
                  break;
              }
              
              return (
                <div 
                  key={accion.id} 
                  className={`${colorFondo} p-3 rounded-lg border border-gray-200 text-xs`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icono}</span>
                      <span className="font-bold text-gray-800">{accion.jugador}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{accion.fechaHora}</span>
                  </div>
                  
                  <div className="mb-1">
                    {accion.accion === 'construir' && (
                      <span className="text-gray-700">
                        Conquistó territorio <span className="font-bold">{accion.detalles.territorio}</span> para el equipo <span className="font-bold">{accion.detalles.equipo}</span>
                      </span>
                    )}
                    {accion.accion === 'atacar' && (
                      <span className="text-gray-700">
                        Atacó territorio <span className="font-bold">{accion.detalles.territorio}</span> de <span className="font-bold">{accion.detalles.equipoDefensor}</span>
                      </span>
                    )}
                    {accion.accion === 'proteger' && (
                      <span className="text-gray-700">
                        Protegió territorio <span className="font-bold">{accion.detalles.territorio}</span> hasta {accion.detalles.proteccionHasta}
                      </span>
                    )}
                    {accion.accion === 'unirse_equipo' && (
                      <span className="text-gray-700">
                        Se unió al equipo <span className="font-bold">{accion.detalles.equipo}</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-gray-500">
                    <span>⚡ Power: {accion.powerRestante}/10</span>
                    <span>Equipo: {accion.equipo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {libroAcciones.length > 10 && (
          <div className="text-center mt-3 text-xs text-gray-500">
            Mostrando 10 de {libroAcciones.length} acciones
          </div>
        )}
      </div>
    );
  };

  // 🎨 RENDERIZAR TABLERO MEJORADO (MAPA DEL REINO CON VISUAL 3D Y BARRAS DE DOMINANCIA)
  const renderTablero = () => {
    const tiempoRestante = calcularTiempoRestanteCierre();
    
    // Contar territorios para barra de dominancia
    let counts = { ROJO: 0, AZUL: 0, VERDE: 0, AMARILLO: 0, neutral: 0 };
    tablero.forEach(fila => {
      fila.forEach(t => {
        if (t && t.equipo && counts[t.equipo] !== undefined) {
          counts[t.equipo]++;
        } else {
          counts.neutral++;
        }
      });
    });

    return (
      <div className="bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-5 shadow-2xl border-2 border-purple-400/40 text-white">
        {/* Cabecera del Reino */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="text-left">
            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-cyan-300">
              🗺️ MAPA DEL REINO 2026
            </h3>
            <p className="text-[11px] text-white/60">Guerra de las 4 Facciones Navideñas</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
              {tiempoRestante.terminado ? "🎉 FINALIZADO" : `⏳ ${tiempoRestante.dias}d ${tiempoRestante.horas}h ${tiempoRestante.minutos}m`}
            </span>
          </div>
        </div>

        {/* BARRA DE DOMINANCIA DEL REINO */}
        <div className="mb-4 bg-black/40 p-2.5 rounded-2xl border border-white/10">
          <div className="flex justify-between text-[11px] font-bold mb-1.5 px-1">
            <span className="text-white/80">Control Territorial del Reino:</span>
            <span className="text-amber-300">{Math.round(((49 - counts.neutral) / 49) * 100)}% Reclamado</span>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div style={{ width: `${(counts.ROJO / 49) * 100}%` }} className="bg-red-500 transition-all duration-500" title={`Rojo: ${counts.ROJO}`} />
            <div style={{ width: `${(counts.AZUL / 49) * 100}%` }} className="bg-blue-500 transition-all duration-500" title={`Azul: ${counts.AZUL}`} />
            <div style={{ width: `${(counts.VERDE / 49) * 100}%` }} className="bg-emerald-500 transition-all duration-500" title={`Verde: ${counts.VERDE}`} />
            <div style={{ width: `${(counts.AMARILLO / 49) * 100}%` }} className="bg-yellow-400 transition-all duration-500" title={`Amarillo: ${counts.AMARILLO}`} />
            <div style={{ width: `${(counts.neutral / 49) * 100}%` }} className="bg-slate-700/60 transition-all duration-500" title={`Neutral: ${counts.neutral}`} />
          </div>
        </div>

        {/* GRID 7x7 DE TERRENO ESTILO TABLERO TÁCTICO */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/10 mx-auto max-w-sm shadow-inner">
          <div className="grid grid-cols-7 gap-1.5 mx-auto">
            {tablero.map((fila, filaIndex) =>
              fila.map((terreno, columnaIndex) => {
                const equipo = terreno ? EQUIPOS[terreno.equipo] : null;
                const estaSeleccionado = terrenoSeleccionado?.fila === filaIndex && terrenoSeleccionado?.columna === columnaIndex;
                const protegido = estaProtegido(terreno);

                // Estilo según facción
                let tileBg = "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 text-slate-400"; // Neutral
                let tileIcon = "❄️";

                if (terreno?.equipo === "ROJO") {
                  tileBg = "bg-gradient-to-br from-red-600 via-rose-600 to-red-800 border-red-400/60 text-white shadow-red-900/40";
                  tileIcon = "🏰";
                } else if (terreno?.equipo === "AZUL") {
                  tileBg = "bg-gradient-to-br from-blue-600 via-sky-600 to-blue-800 border-blue-400/60 text-white shadow-blue-900/40";
                  tileIcon = "🧊";
                } else if (terreno?.equipo === "VERDE") {
                  tileBg = "bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-800 border-emerald-400/60 text-white shadow-emerald-900/40";
                  tileIcon = "🌲";
                } else if (terreno?.equipo === "AMARILLO") {
                  tileBg = "bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-700 border-yellow-300/80 text-amber-950 shadow-amber-900/40";
                  tileIcon = "⭐";
                }

                return (
                  <button
                    key={`${filaIndex}-${columnaIndex}`}
                    onClick={() => seleccionarTerreno(filaIndex, columnaIndex)}
                    className={`
                      w-9 h-9 sm:w-11 sm:h-11 rounded-xl border-2 transition-all duration-150 relative flex items-center justify-center text-base sm:text-lg shadow-md select-none
                      ${tileBg}
                      ${estaSeleccionado ? 'scale-110 ring-4 ring-amber-400 z-20 shadow-xl' : 'hover:scale-105 active:scale-95'}
                      ${protegido ? 'ring-2 ring-cyan-300 ring-offset-1 ring-offset-slate-900' : ''}
                    `}
                    title={
                      protegido 
                        ? `Territorio ${filaIndex + 1}-${columnaIndex + 1} (${equipo?.nombre || 'Neutral'}) - Protegido hasta ${new Date(terreno.proteccionHasta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                        : `Territorio ${filaIndex + 1}-${columnaIndex + 1} (${equipo?.nombre || 'Neutral'})`
                    }
                  >
                    {protegido ? (
                      <span className="relative z-10 text-sm drop-shadow animate-pulse">🛡️</span>
                    ) : (
                      <span className="relative z-10 drop-shadow">{tileIcon}</span>
                    )}

                    {/* Aura de selección */}
                    {estaSeleccionado && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
        
        {/* LEYENDA DE FACCIONES */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 justify-center bg-red-950/60 border border-red-500/30 py-1.5 rounded-xl">
            <span>🏰</span>
            <span className="text-red-300">Rojo ({counts.ROJO})</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center bg-blue-950/60 border border-blue-500/30 py-1.5 rounded-xl">
            <span>🧊</span>
            <span className="text-blue-300">Azul ({counts.AZUL})</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center bg-emerald-950/60 border border-emerald-500/30 py-1.5 rounded-xl">
            <span>🌲</span>
            <span className="text-emerald-300">Verde ({counts.VERDE})</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center bg-amber-950/60 border border-amber-500/30 py-1.5 rounded-xl">
            <span>⭐</span>
            <span className="text-amber-300">Am. ({counts.AMARILLO})</span>
          </div>
        </div>
      </div>
    );
  };

  // 📊 RENDERIZAR ESTADÍSTICAS MEJORADO (PODIO Y SUPREMACÍA)
  const renderEstadisticas = () => {
    const equipoGanador = Object.entries(estadisticas).reduce((ganador, [equipo, stats]) => 
      stats.territorios > estadisticas[ganador].territorios ? equipo : ganador, "ROJO"
    );

    const tiempoRestante = calcularTiempoRestanteCierre();

    return (
      <div className="bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-5 shadow-2xl border-2 border-purple-400/40 text-white">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <h3 className="font-black text-sm uppercase tracking-wider text-purple-200 flex items-center gap-2">
            <span>🏆</span>
            <span>Clasificación</span>
          </h3>
          <span className="text-[10px] text-amber-300 font-bold">49 Territorios</span>
        </div>

        <div className="space-y-2.5">
          {Object.entries(EQUIPOS).map(([key, equipo]) => {
            const jugadoresEnEquipo = jugadoresPorEquipo[key] || [];
            const cantTerritorios = estadisticas[key]?.territorios || 0;
            const porcentaje = Math.round((cantTerritorios / 49) * 100);
            const esLider = key === equipoGanador && cantTerritorios > 0;

            let badgeColor = "bg-red-500";
            if (key === "AZUL") badgeColor = "bg-blue-500";
            if (key === "VERDE") badgeColor = "bg-emerald-500";
            if (key === "AMARILLO") badgeColor = "bg-yellow-400";

            return (
              <div
                key={key}
                className={`p-3 rounded-2xl border transition-all ${
                  key === miEquipo 
                    ? "bg-purple-600/25 border-purple-400 shadow-lg shadow-purple-900/30" 
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{equipo.emoji}</span>
                    <div className="text-left">
                      <div className="font-black text-xs flex items-center gap-1.5">
                        <span className="text-white">Equipo {equipo.nombre}</span>
                        {key === miEquipo && (
                          <span className="text-[9px] bg-purple-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                            TÚ
                          </span>
                        )}
                        {esLider && <span>👑</span>}
                      </div>
                      <div className="text-[10px] text-white/50">
                        {jugadoresEnEquipo.length}/5 jugadores
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-sm text-amber-300">{cantTerritorios}</div>
                    <div className="text-[9px] text-white/50">{porcentaje}%</div>
                  </div>
                </div>

                {/* Barra de progreso de la facción */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${badgeColor} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Estado de la competencia */}
        <div className={`mt-4 rounded-2xl p-3 text-center border ${
          tiempoRestante.terminado 
            ? 'bg-emerald-950/60 border-emerald-400/40 text-emerald-200'
            : 'bg-indigo-950/60 border-indigo-400/30 text-indigo-200'
        }`}>
          <div className="text-xs font-black">
            {tiempoRestante.terminado ? '🎉 COMPETICIÓN FINALIZADA' : '⚔️ EN GUERRA ABIERTA'}
          </div>
          <div className="text-[11px] text-white/70 mt-0.5">
            {tiempoRestante.terminado 
              ? `Facción Ganadora: Equipo ${EQUIPOS[equipoGanador].nombre}`
              : 'Cierre: Domingo 6:00 PM'
            }
          </div>
        </div>
      </div>
    );
  };

  // ⚡ RENDERIZAR PANEL DE POWER (BATERÍA DE ENERGÍA VISUAL)
  const renderPanelPower = () => {
    const tiempoParaReset = calcularTiempoParaReset();
    
    if (power === null) {
      return (
        <div className="bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-5 shadow-2xl border-2 border-purple-400/40 text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto my-4"></div>
          <p className="text-xs text-white/60">Cargando energía...</p>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-5 shadow-2xl border-2 border-purple-400/40 text-white">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <h3 className="font-black text-sm uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <span>⚡</span>
            <span>BATERÍA DE POWER</span>
          </h3>
          <span className="text-xs font-bold text-white/60">{power}/10</span>
        </div>
        
        {/* Iconos de Rayos (10 celdas de batería) */}
        <div className="grid grid-cols-5 gap-1.5 bg-black/40 p-2.5 rounded-2xl border border-white/10 mb-3">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-7 rounded-lg flex items-center justify-center text-xs transition-all ${
                i < power 
                  ? "bg-gradient-to-t from-amber-500 to-yellow-300 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-100" 
                  : "bg-slate-800 text-slate-600 opacity-40 scale-95"
              }`}
            >
              ⚡
            </div>
          ))}
        </div>

        {/* Barra de progreso y tiempo de recarga */}
        <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Recarga diaria (+10):</span>
            <span className="font-bold text-cyan-300">
              {tiempoParaReset.horas}h {tiempoParaReset.minutos}m
            </span>
          </div>
          <div className="text-[10px] text-white/50 text-center pt-1">
            Se reinicia automáticamente a las 6:00 AM
          </div>
        </div>
      </div>
    );
  };

  // 🎮 RENDERIZAR ACCIONES (CONSOLA TÁCTICA)
  const renderAcciones = () => {
    let terreno = null;
    if (terrenoSeleccionado && tablero[terrenoSeleccionado.fila]) {
      terreno = tablero[terrenoSeleccionado.fila][terrenoSeleccionado.columna];
    }
    
    const esDeMiEquipo = terreno?.equipo === miEquipo;
    const esDeOtroEquipo = terreno?.equipo && terreno.equipo !== miEquipo;
    const esNeutral = terreno?.equipo === null;
    const protegido = estaProtegido(terreno);
    const tiempoRestante = calcularTiempoRestanteCierre();
    
    return (
      <div className="bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-5 shadow-2xl border-2 border-purple-400/40 text-white">
        <h3 className="font-black text-sm uppercase tracking-wider text-cyan-300 mb-3 flex items-center gap-1.5">
          <span>🎯</span>
          <span>COMANDO DE GUERRA</span>
        </h3>
        
        {terreno ? (
          <div className="mb-4 p-3 bg-white/10 rounded-2xl border border-white/15 text-left text-xs space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-cyan-300 font-bold">
                Coordenadas [{terreno.fila + 1}, {terreno.columna + 1}]
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                protegido ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/30" : "bg-amber-500/20 text-amber-200 border border-amber-400/30"
              }`}>
                {protegido ? "🛡️ Inmune" : "⚔️ Vulnerable"}
              </span>
            </div>
            <div className="font-black text-white text-sm">
              {terreno.equipo ? `Controlado por: Equipo ${EQUIPOS[terreno.equipo].nombre}` : 'Territorio Salvaje (Neutral)'}
            </div>
            {protegido && terreno.proteccionHasta && (
              <div className="text-[10px] text-cyan-200">
                Protegido hasta {new Date(terreno.proteccionHasta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4 p-3 bg-white/5 rounded-2xl text-center border border-dashed border-white/20 text-xs text-white/60">
            Toca un territorio en el mapa 7x7 para actuar
          </div>
        )}

        {/* BOTONES DE ACCIÓN */}
        <div className="space-y-2">
          {/* Construir */}
          <button
            onClick={construir}
            disabled={!terreno || power < COSTOS_POWER.construir || !esNeutral || tiempoRestante.terminado || !miEquipo}
            className="w-full py-2.5 px-3 rounded-2xl font-black text-xs transition-all shadow flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
          >
            <span className="flex items-center gap-1.5">
              <span>🏗️</span>
              <span>Reclamar / Construir</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px]">3 ⚡</span>
          </button>

          {/* Atacar */}
          <button
            onClick={atacar}
            disabled={!terreno || power < COSTOS_POWER.atacar || !esDeOtroEquipo || protegido || tiempoRestante.terminado || !miEquipo}
            className="w-full py-2.5 px-3 rounded-2xl font-black text-xs transition-all shadow flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white"
          >
            <span className="flex items-center gap-1.5">
              <span>⚔️</span>
              <span>Asaltar Fortaleza</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px]">2 ⚡</span>
          </button>

          {/* Proteger */}
          <button
            onClick={proteger}
            disabled={!terreno || power < COSTOS_POWER.proteger || !esDeMiEquipo || protegido || tiempoRestante.terminado || !miEquipo}
            className="w-full py-2.5 px-3 rounded-2xl font-black text-xs transition-all shadow flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
          >
            <span className="flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Escudo Sagrado (4h)</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px]">4 ⚡</span>
          </button>
        </div>
      </div>
    );
  };

  // 🎯 RENDERIZAR SELECTOR DE EQUIPO
  const renderSelectorEquipo = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4 select-none">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 mb-2">
              🗺️ GUERRA DE TERRITORIOS 2026
            </h2>
            <p className="text-sm text-purple-200">Elige tu facción navideña y conquista el mapa</p>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 max-w-lg mx-auto text-center shadow-2xl border-2 border-purple-400/40 text-white">
            <h3 className="text-2xl font-black mb-2 text-white">Elige tu Estandarte</h3>
            <p className="text-xs text-white/70 mb-6">
              Únete a una de las 4 facciones del reino para la competencia semanal. (Máximo 5 jugadores por equipo).
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(EQUIPOS).map(([key, equipo]) => {
                const jugadoresEnEquipo = jugadoresPorEquipo[key] || [];
                const estaLleno = jugadoresEnEquipo.length >= equipo.maxJugadores;
                
                let teamStyle = "from-red-600 to-rose-700 border-red-400/40";
                if (key === "AZUL") teamStyle = "from-blue-600 to-sky-700 border-blue-400/40";
                if (key === "VERDE") teamStyle = "from-emerald-600 to-green-700 border-emerald-400/40";
                if (key === "AMARILLO") teamStyle = "from-amber-500 to-yellow-600 border-yellow-300/60";

                return (
                  <button
                    key={key}
                    onClick={() => !estaLleno && elegirEquipo(key)}
                    disabled={estaLleno}
                    className={`p-4 rounded-2xl border-2 bg-gradient-to-br ${teamStyle} transition-all transform hover:scale-[1.03] active:scale-95 shadow-xl relative overflow-hidden text-center ${
                      estaLleno ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <div className="text-3xl mb-1">{equipo.emoji}</div>
                    <div className="font-black text-sm">{equipo.nombre}</div>
                    <div className="text-xs text-white/80 mt-1 font-bold">
                      {jugadoresEnEquipo.length}/{equipo.maxJugadores} Miembros
                    </div>
                    {estaLleno && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-[10px] font-black bg-red-600 px-2 py-0.5 rounded-full text-white">
                          LLENO
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-3 mb-6 text-xs text-yellow-200">
              ⚠️ Una vez elegido tu equipo, defenderás sus colores hasta el cierre del Domingo a las 6:00 PM.
            </div>

            <button
              onClick={volverASeleccion}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl font-bold text-sm border border-white/20 transition-all"
            >
              ← Volver a Sala de Juegos 3
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Si el usuario no ha elegido equipo, mostrar selector
  if (!miEquipo) {
    return renderSelectorEquipo();
  }

  // Mostrar loading mientras se carga el power
  if (power === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto"></div>
          <p className="mt-4 text-xs text-white/70">Cargando Reino de Territorios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center max-w-6xl mx-auto p-2 select-none">
      {/* BANNER DE CABECERA CON EL EQUIPO ACTUAL DEL USUARIO */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 rounded-3xl mb-4 border-2 border-purple-400/40 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{EQUIPOS[miEquipo].emoji}</span>
          <div className="text-left">
            <div className="text-xs uppercase font-bold text-cyan-300">Tu Facción Activa</div>
            <div className="text-xl font-black text-white">
              {usuarioActual.nombre} · Equipo {EQUIPOS[miEquipo].nombre}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 font-bold">
            👥 {jugadoresPorEquipo[miEquipo]?.length || 0}/5 Aliados
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
            ⚡ {power}/10 Power
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-1 space-y-4">
          {renderPanelPower()}
          {renderAcciones()}
        </div>

        <div className="lg:col-span-2">
          {renderTablero()}
        </div>

        <div className="lg:col-span-1">
          {renderEstadisticas()}
        </div>

        <div className="lg:col-span-1">
          {renderLibroAcciones()}
        </div>
      </div>


      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6 border-2 border-green-200">
        <h3 className="font-bold mb-4 text-gray-800 text-center">🎯 Cómo Jugar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center bg-white p-4 rounded-xl border border-green-200">
            <div className="text-2xl mb-2">🏗️</div>
            <p className="text-gray-700 font-medium"><strong>Construir ({COSTOS_POWER.construir} power):</strong> Conquista territorio neutral</p>
          </div>
          <div className="text-center bg-white p-4 rounded-xl border border-red-200">
            <div className="text-2xl mb-2">⚔️</div>
            <p className="text-gray-700 font-medium"><strong>Atacar ({COSTOS_POWER.atacar} power):</strong> Convierte territorio enemigo en neutral</p>
          </div>
          <div className="text-center bg-white p-4 rounded-xl border border-blue-200">
            <div className="text-2xl mb-2">🛡️</div>
            <p className="text-gray-700 font-medium"><strong>Proteger ({COSTOS_POWER.proteger} power):</strong> Inmunidad de territorio por 4 horas</p>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600 bg-white/50 py-2 rounded-lg">
          ⚡ <strong>Power:</strong> 10 diarios (reset 6:00 AM) • ⏰ <strong>Finaliza:</strong> Domingo 6:00 PM Honduras
        </div>
      </div>

      <button
        onClick={volverASeleccion}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-2xl"
      >
  

        ← Volver a Juegos 3
      </button>
    </div>
  );
};

// =============================================
// 2. 🎮 PONG
// =============================================
const Pong = ({ volverASeleccion, guardarEnRanking }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [timeLeft, setTimeLeft] = useState(180);
  const [gameTime, setGameTime] = useState(0);
  const [touchStartY, setTouchStartY] = useState(null);
  const [playerY, setPlayerY] = useState(250);
  const [isServing, setIsServing] = useState(true);
  const [serveCountdown, setServeCountdown] = useState(3);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const [highScore, setHighScore] = useState(0);
  const serveTimerRef = useRef(null);

  const gameStateRef = useRef({
    ball: { x: 400, y: 300, dx: 0, dy: 0, radius: 8, visible: false },
    player: { x: 40, y: 250, width: 10, height: 80, dy: 0 },
    computer: { x: 750, y: 250, width: 10, height: 80, speed: 4.5 },
    keys: {},
    speedMultiplier: 1,
    gameOverTriggered: false,
    lastScorer: 'player',
    baseSpeed: 5
  });

  // Efecto para sincronizar playerY con gameStateRef
  useEffect(() => {
    gameStateRef.current.player.y = playerY;
  }, [playerY]);

  // Efecto para manejar el bucle del juego
  useEffect(() => {
    if (gameState === 'playing') {
      if (isServing) {
        startServeCountdown();
      } else {
        gameLoop();
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (serveTimerRef.current) {
        clearInterval(serveTimerRef.current);
      }
    };
  }, [gameState, isServing]);

  // Timer para el juego
  useEffect(() => {
    if (gameState === 'playing' && !isServing) {
      startTimeRef.current = Date.now();
      gameStateRef.current.gameOverTriggered = false;
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, isServing]);

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      gameStateRef.current.keys[key] = true;
      
      if (gameState === 'playing' && !isServing) {
        if (key === 'arrowup' || key === 'w') {
          setPlayerY(prev => Math.max(0, prev - 12));
        }
        if (key === 'arrowdown' || key === 's') {
          setPlayerY(prev => Math.min(520, prev + 12));
        }
      }
    };

    const handleKeyUp = (e) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, isServing]);

  // Controles táctiles para móvil
  const handleTouchStart = (e) => {
    e.preventDefault();
    if (gameState === 'playing' && !isServing) {
      const touch = e.touches[0];
      setTouchStartY(touch.clientY);
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (touchStartY !== null && gameState === 'playing' && !isServing) {
      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartY;
      setTouchStartY(touch.clientY);
      
      setPlayerY(prev => {
        const newY = prev + deltaY * 1.3;
        return Math.max(0, Math.min(520, newY));
      });
    }
  };

  const handleTouchEnd = () => {
    setTouchStartY(null);
  };

  const startServeCountdown = () => {
    setServeCountdown(3);
    serveTimerRef.current = setInterval(() => {
      setServeCountdown(prev => {
        if (prev <= 1) {
          clearInterval(serveTimerRef.current);
          serveBall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const serveBall = () => {
    const state = gameStateRef.current;
    state.ball.visible = true;
    state.ball.x = state.player.x + state.player.width + state.ball.radius;
    state.ball.y = state.player.y + state.player.height / 2;
    
    // Sacar hacia la derecha (hacia la IA)
    state.ball.dx = state.baseSpeed;
    state.ball.dy = (Math.random() - 0.5) * 3;
    
    setIsServing(false);
    gameLoop();
  };

  const startGame = () => {
    const state = gameStateRef.current;
    state.ball = { 
      x: 400, 
      y: 300, 
      dx: 0, 
      dy: 0, 
      radius: 8,
      visible: false 
    };
    state.player = { x: 40, y: 250, width: 10, height: 80, dy: 0 };
    state.computer = { x: 750, y: 250, width: 10, height: 80, speed: 4.5 };
    state.speedMultiplier = 1;
    state.baseSpeed = 5;
    state.lastScorer = 'player';
    setPlayerY(250);
    setScore({ player: 0, computer: 0 });
    setTimeLeft(180);
    setGameTime(0);
    setGameState('playing');
    setIsServing(true);
  };

  const endGame = () => {
    if (gameStateRef.current.gameOverTriggered) return;
    
    gameStateRef.current.gameOverTriggered = true;
    const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setGameTime(elapsedTime);
    
    // Calcular puntuación con escala más pequeña
    const baseScore = score.player * 10;
    const winBonus = score.player > score.computer ? 50 : 0;
    const diffBonus = Math.max(0, (score.player - score.computer) * 5);
    const timePenalty = Math.max(0, 30 - Math.floor(elapsedTime / 6));
    const efficiencyBonus = elapsedTime > 0 ? Math.floor((score.player * 60) / elapsedTime) : 0;
    
    const finalScore = baseScore + winBonus + diffBonus + timePenalty + efficiencyBonus;
    
    // Factores de desempate
    const tiebreakers = {
      puntosJugador: score.player,
      diferencia: score.player - score.computer,
      eficiencia: efficiencyBonus,
      tiempoRapido: timePenalty,
      victoria: score.player > score.computer ? 1 : 0
    };
    
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
    
    guardarEnRanking("pong", finalScore, {
      puntos: score.player,
      puntosIA: score.computer,
      tiempo: elapsedTime,
      tiempoFormato: `${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`,
      resultado: score.player > score.computer ? "Victoria" : "Derrota",
      diferencia: score.player - score.computer,
      eficiencia: efficiencyBonus,
      desempate_puntos: score.player,
      desempate_diferencia: score.player - score.computer,
      desempate_eficiencia: efficiencyBonus,
      desempate_tiempo: elapsedTime
    });
    
    setGameState('gameOver');
  };

  const gameLoop = () => {
    if (gameState !== 'playing' || isServing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    // Limpiar canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // IA ORIGINAL - Buena pero con errores
    const computerCenter = state.computer.y + state.computer.height / 2;
    
    // La IA original predecía la trayectoria con precisión pero con error ocasional
    const predictionError = Math.random() < 0.25 ? (Math.random() - 0.5) * 50 : 0;
    
    // Predecir donde llegará la pelota con la IA original
    const timeToReach = Math.abs(state.computer.x - state.ball.x) / Math.abs(state.ball.dx);
    let predictedY = state.ball.y + (state.ball.dy * timeToReach) + predictionError;
    
    // Ajustar predicción si rebota en paredes (como la IA original)
    while (predictedY < 0 || predictedY > canvas.height) {
      if (predictedY < 0) predictedY = -predictedY;
      if (predictedY > canvas.height) predictedY = 2 * canvas.height - predictedY;
    }
    
    const targetY = predictedY - state.computer.height / 2;
    const diff = targetY - computerCenter;
    
    // Movimiento suave de la IA original
    const moveSpeed = Math.min(state.computer.speed, Math.abs(diff) * 0.15);
    
    // La IA original tenía un 85% de precisión
    const isAccurate = Math.random() < 0.85;
    
    if (isAccurate) {
      if (diff > 8) {
        state.computer.y += moveSpeed;
      } else if (diff < -8) {
        state.computer.y -= moveSpeed;
      }
    } else {
      // Error ocasional - se mueve en dirección contraria o muy lento
      const mistakeDirection = Math.random() > 0.5 ? 1 : -1;
      const mistakeSpeed = state.computer.speed * 0.4;
      state.computer.y += mistakeDirection * mistakeSpeed;
    }
    
    // La IA original a veces era lenta en reaccionar
    if (Math.random() < 0.15) {
      state.computer.y += (Math.random() - 0.5) * state.computer.speed * 0.5;
    }
    
    // Limitar movimiento
    state.computer.y = Math.max(0, Math.min(canvas.height - state.computer.height, state.computer.y));

    // Mover pelota si es visible
    if (state.ball.visible) {
      state.ball.x += state.ball.dx * state.speedMultiplier;
      state.ball.y += state.ball.dy * state.speedMultiplier;
    }

    // Colisiones con top y bottom
    if (state.ball.y - state.ball.radius <= 0 || state.ball.y + state.ball.radius >= canvas.height) {
      state.ball.dy = -state.ball.dy;
    }

    // Colisión con paleta del jugador
    if (
      state.ball.visible &&
      state.ball.x - state.ball.radius <= state.player.x + state.player.width &&
      state.ball.x + state.ball.radius >= state.player.x &&
      state.ball.y >= state.player.y &&
      state.ball.y <= state.player.y + state.player.height
    ) {
      state.ball.dx = Math.abs(state.ball.dx);
      const hitPoint = (state.ball.y - state.player.y) / state.player.height;
      state.ball.dy = (hitPoint - 0.5) * 8;
      
      // ✅ Aumentar velocidad SOLO cuando se golpea (0.1 por golpe)
      state.speedMultiplier = Math.min(1.8, state.speedMultiplier + 0.1);
      
      // Aplicar la velocidad actualizada manteniendo dirección
      const currentSpeed = Math.sqrt(state.ball.dx * state.ball.dx + state.ball.dy * state.ball.dy);
      const angle = Math.atan2(state.ball.dy, state.ball.dx);
      state.ball.dx = Math.cos(angle) * state.baseSpeed * state.speedMultiplier;
      state.ball.dy = Math.sin(angle) * state.baseSpeed * state.speedMultiplier;
    }

    // Colisión con paleta de la computadora
    if (
      state.ball.visible &&
      state.ball.x + state.ball.radius >= state.computer.x &&
      state.ball.x - state.ball.radius <= state.computer.x + state.computer.width &&
      state.ball.y >= state.computer.y &&
      state.ball.y <= state.computer.y + state.computer.height
    ) {
      state.ball.dx = -Math.abs(state.ball.dx);
      const hitPoint = (state.ball.y - state.computer.y) / state.computer.height;
      state.ball.dy = (hitPoint - 0.5) * 8;
      
      // ✅ Aumentar velocidad SOLO cuando se golpea (0.1 por golpe)
      state.speedMultiplier = Math.min(1.8, state.speedMultiplier + 0.1);
      
      // Aplicar la velocidad actualizada manteniendo dirección
      const currentSpeed = Math.sqrt(state.ball.dx * state.ball.dx + state.ball.dy * state.ball.dy);
      const angle = Math.atan2(state.ball.dy, state.ball.dx);
      state.ball.dx = Math.cos(angle) * state.baseSpeed * state.speedMultiplier;
      state.ball.dy = Math.sin(angle) * state.baseSpeed * state.speedMultiplier;
    }

    // Puntuación
    if (state.ball.visible && state.ball.x < 0) {
      state.ball.visible = false;
      state.lastScorer = 'computer';
      setScore(prev => {
        const newScore = { ...prev, computer: prev.computer + 1 };
        if (newScore.computer >= 15 || newScore.player >= 15) {
          setTimeout(endGame, 800);
        } else {
          setIsServing(true);
          // Resetear velocidad al punto inicial cuando hay punto
          state.speedMultiplier = 1;
        }
        return newScore;
      });
    } else if (state.ball.visible && state.ball.x > canvas.width) {
      state.ball.visible = false;
      state.lastScorer = 'player';
      setScore(prev => {
        const newScore = { ...prev, player: prev.player + 1 };
        if (newScore.computer >= 15 || newScore.player >= 15) {
          setTimeout(endGame, 800);
        } else {
          setIsServing(true);
          // Resetear velocidad al punto inicial cuando hay punto
          state.speedMultiplier = 1;
        }
        return newScore;
      });
    }

    // Dibujar elementos del juego
    ctx.fillStyle = '#fff';
    
    // Paleta del jugador
    ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
    
    // Paleta de la computadora
    ctx.fillRect(state.computer.x, state.computer.y, state.computer.width, state.computer.height);
    
    // Pelota si es visible
    if (state.ball.visible) {
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Línea central punteada
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#666';
    ctx.stroke();
    ctx.setLineDash([]);

    // Mostrar información
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    ctx.fillText(`⏱️ ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, 25, 25);
    
    ctx.textAlign = 'right';
    ctx.fillText(`⚡ ${state.speedMultiplier.toFixed(1)}x`, canvas.width - 25, 25);
    
    ctx.textAlign = 'center';
    ctx.font = '16px Arial';
    ctx.fillText(`Gana con 15 puntos`, canvas.width / 2, 25);

    // Mostrar saque si está en modo saque
    if (isServing) {
      ctx.textAlign = 'center';
      ctx.font = '28px Arial';
      ctx.fillStyle = '#ffcc00';
      if (serveCountdown > 0) {
        ctx.fillText(`${serveCountdown}`, canvas.width / 2, canvas.height / 2);
      } else {
        ctx.fillText(`¡SACA!`, canvas.width / 2, canvas.height / 2);
      }
    }

    // Solo continuar el bucle si estamos jugando y no en saque
    if (gameState === 'playing' && !isServing) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  };

  // Inicializar el canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.strokeStyle = '#666';
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#fff';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('¡Presiona "Comenzar Juego"!', canvas.width / 2, canvas.height / 2);
    }
  }, []);

  return (
    <div className="text-center max-w-lg mx-auto">
      <h2 className="text-3xl font-bold mb-5">🎮 PONG CLÁSICO</h2>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 mb-5">
        <div className="flex justify-between items-center mb-4 text-white">
          <div className="text-center">
            <div className="text-xs text-gray-300 mb-1">JUGADOR</div>
            <div className="text-3xl font-bold text-blue-300">{score.player}</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold">VS</div>
            <div className="text-xs text-gray-300 mt-1">
              {timeLeft > 0 ? 
                `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 
                '0:00'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-300 mb-1">COMPUTADORA</div>
            <div className="text-3xl font-bold text-red-300">{score.computer}</div>
          </div>
        </div>

        {highScore > 0 && (
          <div className="mb-3 text-yellow-300 text-sm font-bold">
            🏆 Mejor: {highScore} puntos
          </div>
        )}

        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative"
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-80 bg-black rounded-lg border border-gray-600 touch-none"
          />
          
          {/* Indicador de controles para móvil - SIN W/S */}
          {gameState === 'playing' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
              <div className="text-white text-center text-xs">
                {isServing ? (
                  <div className="inline-block bg-black/70 px-3 py-1 rounded">
                    ⏳ SAQUE EN {serveCountdown > 0 ? serveCountdown : '...'}
                  </div>
                ) : (
                  <div className="inline-block bg-black/70 px-3 py-1 rounded">
                    📱 DESLIZA PARA MOVER
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-white text-xs">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-700/50 p-2 rounded">
              <p className="font-bold mb-1">🎯 OBJETIVO</p>
              <p className="text-gray-300">15 puntos o 3 min</p>
            </div>
            <div className="bg-gray-700/50 p-2 rounded">
              <p className="font-bold mb-1">⚡ VELOCIDAD</p>
              <p className="text-gray-300">+0.1x por golpe</p>
            </div>
          </div>
          <div className="bg-gray-700/50 p-2 rounded">
            <p className="font-bold mb-1">🏆 PUNTUACIÓN</p>
            <p className="text-gray-300">10 pts/gol + bonus victoria/diferencia</p>
          </div>
        </div>
      </div>

      {gameState === 'menu' && (
        <div className="bg-white rounded-xl p-5 mb-5 shadow">
          <div className="text-4xl mb-4">🏓</div>
          <h3 className="text-xl font-bold mb-2">PONG CLÁSICO</h3>
          <p className="text-gray-600 mb-4">
            Juego clásico de tenis de mesa. Controla tu paleta y anota puntos.
          </p>
          
          <div className="mb-4 p-3 bg-gray-100 rounded text-center">
            <p className="font-bold text-sm mb-1">📱 JUGAR EN MÓVIL</p>
            <p className="text-gray-600 text-xs">Desliza arriba/abajo en la pantalla</p>
          </div>
          
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-lg font-bold shadow"
          >
            🚀 COMENZAR JUEGO
          </button>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-300 rounded-xl p-5 mb-5 shadow">
          <div className="text-2xl font-bold mb-4">
            {score.player > score.computer ? '🏆 ¡VICTORIA!' : 'FIN DEL JUEGO'}
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-5">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`text-center p-3 rounded ${score.player > score.computer ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                <div className="text-xs text-gray-600 font-bold">TUS PUNTOS</div>
                <div className="text-3xl font-bold mt-1">{score.player}</div>
              </div>
              <div className={`text-center p-3 rounded ${score.computer > score.player ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                <div className="text-xs text-gray-600 font-bold">COMPUTADORA</div>
                <div className="text-3xl font-bold mt-1">{score.computer}</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold mb-2">RESUMEN</div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-700 font-bold text-xs">⏱️ TIEMPO</p>
                  <p className="text-sm">{Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-700 font-bold text-xs">📊 DIFERENCIA</p>
                  <p className="text-sm">{Math.abs(score.player - score.computer)}</p>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-300">
                <p className="text-green-800 font-bold">
                  PUNTUACIÓN: {score.player * 10 + (score.player > score.computer ? 50 : 0) + Math.max(0, (score.player - score.computer) * 5)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-lg font-bold"
            >
              🔄 JUGAR DE NUEVO
            </button>
            <button
              onClick={() => {
                setGameState('menu');
                setScore({ player: 0, computer: 0 });
                setTimeLeft(180);
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold"
            >
              📋 VOLVER AL MENÚ
            </button>
          </div>
        </div>
      )}

      <button
        onClick={volverASeleccion}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 shadow"
      >
        ← VOLVER A JUEGOS
      </button>
    </div>
  );
};

// =============================================
// 3. 🧩 SOPA DE LETRAS NAVIDEÑA - VERSIÓN DE 3 NIVELES
// =============================================
const SopaLetrasNavidenia = ({ volverASeleccion, guardarEnRanking }) => {
  const NIVELES = [
    {
      id: 1,
      nombre: "🎄 Nivel Fácil - Decoraciones Navideñas",
      tamaño: 8,
      palabras: ["CAMPANA", "LUCES", "VELA", "ESFERA", "ARBOL", "ESTRELLA"],
      tiempoLimite: 180,
      puntosBase: 100,
      direcciones: ["horizontal", "vertical"]
    },
    {
      id: 2, 
      nombre: "🍽️ Nivel Medio - Sabores Navideños",
      tamaño: 10,
      palabras: ["TAMALES", "PONCHE", "PAVO", "TURRON", "GALLETAS", "CHOCOLATE"],
      tiempoLimite: 240,
      puntosBase: 150,
      direcciones: ["horizontal", "vertical", "diagonal"]
    },
    {
      id: 3,
      nombre: "🎅 Nivel Difícil - Espíritu Navideño",
      tamaño: 12, 
      palabras: ["PESEBRE", "VILLANCICO", "NOCHEBUENA", "POLONORTE", "GUIRNALDA", "CASCABEL", "TRINEO"],
      tiempoLimite: 300,
      puntosBase: 200,
      direcciones: ["horizontal", "vertical", "diagonal", "inversa"]
    }
  ];

  // Estados del juego
  const [nivelActual, setNivelActual] = useState(0);
  const [grid, setGrid] = useState([]);
  const [seleccionActual, setSeleccionActual] = useState([]);
  const [palabrasEncontradas, setPalabrasEncontradas] = useState([]);
  const [posicionesEncontradas, setPosicionesEncontradas] = useState([]);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [juegoActivo, setJuegoActivo] = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [puntuacionTotal, setPuntuacionTotal] = useState(0);
  const [puntuacionNivel, setPuntuacionNivel] = useState(0);
  const [efectos, setEfectos] = useState([]);
  const [temporizadorActivo, setTemporizadorActivo] = useState(true);

  // Inicializar juego
  const iniciarJuego = () => {
    setNivelActual(0);
    setPuntuacionTotal(0);
    setJuegoActivo(true);
    setJuegoTerminado(false);
    setTemporizadorActivo(true);
    iniciarNivel(0);
  };

  const iniciarNivel = (nivelIndex) => {
    const nivel = NIVELES[nivelIndex];
    setTiempoRestante(nivel.tiempoLimite);
    setPalabrasEncontradas([]);
    setPosicionesEncontradas([]);
    setSeleccionActual([]);
    setPuntuacionNivel(0);
    setEfectos([]);
    
    // Generar grid para el nivel
    const nuevoGrid = generarSopaLetras(nivel);
    setGrid(nuevoGrid);
  };

  // 🎯 GENERADOR DE SOPA DE LETRAS
  const generarSopaLetras = (nivel) => {
    const tamaño = nivel.tamaño;
    // Crear grid vacío
    let grid = Array(tamaño).fill().map(() => Array(tamaño).fill(''));
    
    // Colocar palabras
    nivel.palabras.forEach(palabra => {
      colocarPalabraEnGrid(grid, palabra, nivel.direcciones, tamaño);
    });
    
    // Rellenar espacios vacíos con letras aleatorias
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < tamaño; i++) {
      for (let j = 0; j < tamaño; j++) {
        if (grid[i][j] === '') {
          grid[i][j] = letras[Math.floor(Math.random() * letras.length)];
        }
      }
    }
    
    return grid;
  };

  const colocarPalabraEnGrid = (grid, palabra, direcciones, tamaño) => {
    let colocada = false;
    let intentos = 0;
    
    while (!colocada && intentos < 100) {
      intentos++;
      const direccion = direcciones[Math.floor(Math.random() * direcciones.length)];
      const fila = Math.floor(Math.random() * tamaño);
      const columna = Math.floor(Math.random() * tamaño);
      
      if (puedeColocarPalabra(grid, palabra, fila, columna, direccion, tamaño)) {
        colocarPalabra(grid, palabra, fila, columna, direccion);
        colocada = true;
      }
    }
    
    return colocada;
  };

  const puedeColocarPalabra = (grid, palabra, fila, columna, direccion, tamaño) => {
    const longitud = palabra.length;
    
    switch (direccion) {
      case 'horizontal':
        if (columna + longitud > tamaño) return false;
        for (let i = 0; i < longitud; i++) {
          if (grid[fila][columna + i] !== '' && grid[fila][columna + i] !== palabra[i]) {
            return false;
          }
        }
        break;
        
      case 'vertical':
        if (fila + longitud > tamaño) return false;
        for (let i = 0; i < longitud; i++) {
          if (grid[fila + i][columna] !== '' && grid[fila + i][columna] !== palabra[i]) {
            return false;
          }
        }
        break;
        
      case 'diagonal':
        if (fila + longitud > tamaño || columna + longitud > tamaño) return false;
        for (let i = 0; i < longitud; i++) {
          if (grid[fila + i][columna + i] !== '' && grid[fila + i][columna + i] !== palabra[i]) {
            return false;
          }
        }
        break;
        
      case 'inversa':
        if (columna - longitud < -1) return false;
        for (let i = 0; i < longitud; i++) {
          if (grid[fila][columna - i] !== '' && grid[fila][columna - i] !== palabra[i]) {
            return false;
          }
        }
        break;
        
      case 'vertical-inversa':
        if (fila - longitud < -1) return false;
        for (let i = 0; i < longitud; i++) {
          if (grid[fila - i][columna] !== '' && grid[fila - i][columna] !== palabra[i]) {
            return false;
          }
        }
        break;
    }
    
    return true;
  };

  const colocarPalabra = (grid, palabra, fila, columna, direccion) => {
    for (let i = 0; i < palabra.length; i++) {
      switch (direccion) {
        case 'horizontal':
          grid[fila][columna + i] = palabra[i];
          break;
        case 'vertical':
          grid[fila + i][columna] = palabra[i];
          break;
        case 'diagonal':
          grid[fila + i][columna + i] = palabra[i];
          break;
        case 'inversa':
          grid[fila][columna - i] = palabra[i];
          break;
        case 'vertical-inversa':
          grid[fila - i][columna] = palabra[i];
          break;
      }
    }
  };

  // 🖱️ MANEJO DE SELECCIÓN DE LETRAS
  const manejarClickLetra = (fila, columna) => {
    if (!juegoActivo || juegoTerminado) return;
    
    // Verificar si ya está en la selección
    const yaSeleccionada = seleccionActual.some(
      pos => pos.fila === fila && pos.columna === columna
    );
    
    if (yaSeleccionada) {
      // Si es la última letra seleccionada, la deseleccionamos
      const ultima = seleccionActual[seleccionActual.length - 1];
      if (ultima.fila === fila && ultima.columna === columna) {
        setSeleccionActual(prev => prev.slice(0, -1));
      }
      return;
    }
    
    // Si no hay selección previa, empezar nueva selección
    if (seleccionActual.length === 0) {
      const letra = grid[fila][columna];
      setSeleccionActual([{ fila, columna, letra }]);
      return;
    }
    
    // Verificar si es adyacente a la última selección (horizontal, vertical o diagonal)
    const ultimaSeleccion = seleccionActual[seleccionActual.length - 1];
    const diffFila = Math.abs(fila - ultimaSeleccion.fila);
    const diffCol = Math.abs(columna - ultimaSeleccion.columna);
    
    const esAdyacente = (diffFila <= 1 && diffCol <= 1) && !(diffFila === 0 && diffCol === 0);
    
    if (!esAdyacente) {
      // Si no es adyacente, empezar nueva selección desde esta letra
      const letra = grid[fila][columna];
      setSeleccionActual([{ fila, columna, letra }]);
      return;
    }
    
    // Verificar que esté en línea recta con la selección actual
    if (seleccionActual.length >= 2) {
      const primera = seleccionActual[0];
      const segunda = seleccionActual[1];
      
      // Determinar la dirección actual
      const dirFila = segunda.fila - primera.fila;
      const dirCol = segunda.columna - primera.columna;
      
      // Si la dirección es 0,0 (misma celda), no es válida
      if (dirFila === 0 && dirCol === 0) {
        const letra = grid[fila][columna];
        setSeleccionActual([{ fila, columna, letra }]);
        return;
      }
      
      // Normalizar la dirección (solo -1, 0, 1)
      const pasoFila = dirFila === 0 ? 0 : (dirFila > 0 ? 1 : -1);
      const pasoCol = dirCol === 0 ? 0 : (dirCol > 0 ? 1 : -1);
      
      // Calcular posición esperada basada en la dirección
      const posicionEsperada = {
        fila: ultimaSeleccion.fila + pasoFila,
        columna: ultimaSeleccion.columna + pasoCol
      };
      
      // Verificar si la nueva posición mantiene la misma dirección
      if (fila !== posicionEsperada.fila || columna !== posicionEsperada.columna) {
        // No mantiene la dirección, no agregar
        return;
      }
    }
    
    // Agregar a la selección
    const letra = grid[fila][columna];
    const nuevaSeleccion = [...seleccionActual, { fila, columna, letra }];
    setSeleccionActual(nuevaSeleccion);
    
    // Verificar automáticamente si forma una palabra válida (3 o más letras)
    if (nuevaSeleccion.length >= 3) {
      verificarPalabraAutomatica(nuevaSeleccion);
    }
  };

  // Verificar palabra automáticamente
  const verificarPalabraAutomatica = (seleccion) => {
    const palabraFormada = seleccion.map(pos => pos.letra).join('');
    const palabraInversa = [...seleccion].reverse().map(pos => pos.letra).join('');
    
    const nivel = NIVELES[nivelActual];
    
    // Verificar si es una palabra del nivel
    if (nivel.palabras.includes(palabraFormada) && 
        !palabrasEncontradas.includes(palabraFormada)) {
      marcarPalabraEncontrada(palabraFormada, seleccion);
    } else if (nivel.palabras.includes(palabraInversa) && 
               !palabrasEncontradas.includes(palabraInversa)) {
      marcarPalabraEncontrada(palabraInversa, [...seleccion].reverse());
    }
    // Si no es válida, no hacer nada (la selección se mantiene)
  };

  // 🎯 CALCULAR PUNTOS
  const calcularPuntosPalabra = (palabra) => {
    const nivel = NIVELES[nivelActual];
    const basePorPalabra = nivel.puntosBase / nivel.palabras.length;
    const factorTiempo = tiempoRestante / nivel.tiempoLimite;
    const factorLongitud = 1 + (palabra.length / 10);
    
    const puntos = Math.max(
      10, 
      Math.floor(basePorPalabra * factorTiempo * factorLongitud)
    );
    
    return puntos;
  };

  const marcarPalabraEncontrada = (palabra, seleccion) => {
    setPalabrasEncontradas(prev => [...prev, palabra]);
    
    // Agregar posiciones
    const nuevasPosiciones = seleccion.map(p => ({fila: p.fila, columna: p.columna}));
    setPosicionesEncontradas(prev => [...prev, ...nuevasPosiciones]);
    
    // Limpiar selección
    setSeleccionActual([]);
    
    // Calcular puntos
    const puntosPalabra = calcularPuntosPalabra(palabra);
    setPuntuacionNivel(prev => prev + puntosPalabra);
    
    // Actualizar puntuación total inmediatamente
    setPuntuacionTotal(prev => prev + puntosPalabra);
    
    // Efecto visual
    const primeraPos = seleccion[0];
    setEfectos(prev => [...prev, {
      id: Date.now(),
      texto: `+${puntosPalabra}`,
      palabra: palabra,
      fila: primeraPos?.fila || 0,
      columna: primeraPos?.columna || 0
    }]);
    
    setTimeout(() => {
      setEfectos(prev => prev.filter(e => Date.now() - e.id < 1000));
    }, 1000);
    
    // Verificar si nivel completado
    const nivel = NIVELES[nivelActual];
    if (palabrasEncontradas.length + 1 === nivel.palabras.length) {
      setTimeout(() => {
        nivelCompletado();
      }, 500);
    }
  };

  const nivelCompletado = () => {
    const nivel = NIVELES[nivelActual];
    
    // Bonus por tiempo restante
    const bonusTiempo = Math.floor((tiempoRestante / nivel.tiempoLimite) * 50);
    const bonusCompletado = 25;
    
    // Sumar los bonos adicionales
    setPuntuacionTotal(prev => {
      const nuevaPuntuacion = prev + bonusTiempo + bonusCompletado;
      return nuevaPuntuacion;
    });
    
    // Efecto especial
    setEfectos(prev => [...prev, {
      id: Date.now() + 1,
      texto: `🎉 ¡Nivel ${nivelActual + 1} Completado!`,
      palabra: '',
      fila: Math.floor(nivel.tamaño / 2),
      columna: Math.floor(nivel.tamaño / 2)
    }]);
    
    // Guardar puntuación actual en el ranking (incluso si no se completan los 3 niveles)
    guardarEnRanking("sopa-letras", puntuacionTotal + bonusTiempo + bonusCompletado, {
      nivelesCompletados: nivelActual + 1,
      tiempoTotal: NIVELES.slice(0, nivelActual + 1).reduce((acc, n, idx) => 
        acc + (idx === nivelActual ? n.tiempoLimite - tiempoRestante : n.tiempoLimite), 0),
      palabrasTotales: NIVELES.slice(0, nivelActual + 1).reduce((acc, n) => acc + n.palabras.length, 0),
      fecha: new Date().toISOString()
    });
    
    // Verificar si es el último nivel
    if (nivelActual === NIVELES.length - 1) {
      setTimeout(() => {
        juegoCompletado();
      }, 2000);
    } else {
      setTimeout(() => {
        setNivelActual(prev => prev + 1);
        iniciarNivel(nivelActual + 1);
      }, 2000);
    }
  };

  const juegoCompletado = () => {
    setJuegoActivo(false);
    setJuegoTerminado(true);
    setTemporizadorActivo(false);
    
    // Bonus final por completar todos los niveles
    const bonusFinal = 100;
    const puntuacionFinal = puntuacionTotal + bonusFinal;
    
    guardarEnRanking("sopa-letras", puntuacionFinal, {
      nivelesCompletados: NIVELES.length,
      tiempoTotal: NIVELES.reduce((acc, nivel) => acc + nivel.tiempoLimite, 0) - tiempoRestante,
      palabrasTotales: NIVELES.reduce((acc, nivel) => acc + nivel.palabras.length, 0),
      completado: true,
      fecha: new Date().toISOString()
    });
  };

  // Función para salir manualmente
  const salirDelJuego = () => {
    setJuegoActivo(false);
    setTemporizadorActivo(false);
    
    // Guardar puntuación actual en el ranking incluso si salen
    guardarEnRanking("sopa-letras", puntuacionTotal, {
      nivelesCompletados: nivelActual + 1,
      tiempoTotal: NIVELES.slice(0, nivelActual + 1).reduce((acc, n, idx) => 
        acc + (idx === nivelActual ? n.tiempoLimite - tiempoRestante : n.tiempoLimite), 0),
      palabrasTotales: palabrasEncontradas.length,
      salioManualmente: true,
      fecha: new Date().toISOString()
    });
    
    volverASeleccion();
  };

  // ⏰ TIMER
  useEffect(() => {
    if (!juegoActivo || !temporizadorActivo || juegoTerminado) return;
    
    const timer = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          tiempoAgotado();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [juegoActivo, temporizadorActivo, juegoTerminado]);

  const tiempoAgotado = () => {
    setJuegoActivo(false);
    setJuegoTerminado(true);
    setTemporizadorActivo(false);
    
    // Guardar puntuación actual aunque el tiempo se agote
    guardarEnRanking("sopa-letras", puntuacionTotal, {
      nivelesCompletados: nivelActual + 1,
      tiempoAgotado: true,
      palabrasEncontradas: palabrasEncontradas.length,
      fecha: new Date().toISOString()
    });
  };

  // 🎨 RENDER DEL COMPONENTE - AJUSTADO PARA 3 NIVELES
  const nivel = NIVELES[nivelActual] || NIVELES[0];
  const progreso = nivel ? (palabrasEncontradas.length / nivel.palabras.length) * 100 : 0;
  const tamañoGrid = nivel?.tamaño || 8;

  // Calcular tamaño de celda según el grid - RESPONSIVE
  const getCellSize = () => {
    // Tamaños responsivos para móvil
    if (window.innerWidth < 640) { // móvil
      if (tamañoGrid === 8) return "w-8 h-8 text-sm";      // 2rem x 2rem
      if (tamañoGrid === 10) return "w-7 h-7 text-xs";     // 1.75rem x 1.75rem  
      if (tamañoGrid === 12) return "w-6 h-6 text-xs";     // 1.5rem x 1.5rem
    } else if (window.innerWidth < 768) { // tablet
      if (tamañoGrid === 8) return "w-10 h-10 text-base";  // 2.5rem x 2.5rem
      if (tamañoGrid === 10) return "w-9 h-9 text-sm";     // 2.25rem x 2.25rem  
      if (tamañoGrid === 12) return "w-7 h-7 text-xs";     // 1.75rem x 1.75rem
    }
    // desktop
    if (tamañoGrid === 8) return "w-12 h-12 text-lg";      // 3rem x 3rem
    if (tamañoGrid === 10) return "w-10 h-10 text-base";   // 2.5rem x 2.5rem  
    if (tamañoGrid === 12) return "w-8 h-8 text-sm";       // 2rem x 2rem
    return "w-10 h-10 text-base";
  };

  const getGridPadding = () => {
    if (window.innerWidth < 640) { // móvil
      return "p-2";
    }
    if (tamañoGrid === 8) return "p-4";
    if (tamañoGrid === 10) return "p-3";
    if (tamañoGrid === 12) return "p-2";
    return "p-4";
  };

  const cellSize = getCellSize();
  const gridPadding = getGridPadding();

  return (
    <div className="text-center max-w-4xl mx-auto p-4">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-green-500 to-red-500 bg-clip-text text-transparent">
         Sopa de Letras Navideña
      </h2>

      {!juegoActivo && !juegoTerminado ? (
        // PANTALLA DE INICIO
        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-6 md:p-8 mb-6">
          <div className="text-4xl mb-6">🔤</div>
          <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-4">Sopa de Letras Navideña</h3>
          <div className="text-left space-y-3 mb-6">
            <p className="flex items-center text-sm md:text-base">
              <span className="text-green-500 mr-2">🎯</span>
              3 niveles con dificultad progresiva
            </p>
            <p className="flex items-center text-sm md:text-base">
              <span className="text-green-500 mr-2">🔤</span>
              Selecciona letras contiguas en línea recta
            </p>
            <p className="flex items-center text-sm md:text-base">
              <span className="text-green-500 mr-2">⏱️</span>
              Tiempo límite por nivel
            </p>
            <p className="flex items-center text-sm md:text-base">
              <span className="text-green-500 mr-2">🏆</span>
              Puntos por velocidad y precisión
            </p>
            <p className="flex items-center text-sm md:text-base">
              <span className="text-green-500 mr-2">💡</span>
              Orientación Horizontal, Vertical, Diagonal e Inversa
            </p>
          </div>
          
          <button
            onClick={iniciarJuego}
            className="bg-green-500 hover:bg-green-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all w-full transform hover:scale-105 active:scale-95"
          >
            🎮 Comenzar Aventura
          </button>
        </div>
      ) : juegoTerminado ? (
        // PANTALLA DE FINAL
        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-6 md:p-8 mb-6">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-2">
            {nivelActual === NIVELES.length - 1 ? "¡Juego Completado!" : "¡Juego Terminado!"}
          </h3>
          <p className="text-gray-700 mb-4 text-lg md:text-xl">
            Puntuación final: <strong className="text-green-600">{puntuacionTotal} puntos</strong>
          </p>
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl p-3 md:p-4">
              <div className="text-xl md:text-2xl font-bold text-blue-600">{nivelActual + 1}/3</div>
              <div className="text-gray-600 text-sm">Niveles Completados</div>
            </div>
            <div className="bg-white rounded-xl p-3 md:p-4">
              <div className="text-xl md:text-2xl font-bold text-purple-600">{palabrasEncontradas.length}</div>
              <div className="text-gray-600 text-sm">Palabras Encontradas</div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={iniciarJuego}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95"
            >
              🔄 Jugar Otra Vez
            </button>
            <button
              onClick={volverASeleccion}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95"
            >
              ← Volver al Menú
            </button>
          </div>
        </div>
      ) : (
        // JUEGO EN CURSO
        <>
          {/* PANEL SUPERIOR */}
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-4 mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-3 gap-2">
              <div className="text-center md:text-left">
                <div className="font-bold text-base md:text-lg">{nivel.nombre}</div>
                <div className="text-sm text-gray-600">
                  Palabras: {palabrasEncontradas.length}/{nivel.palabras.length}
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="font-bold text-xl text-green-600">{puntuacionTotal}</div>
                <div className="text-sm text-gray-600">
                  Puntos (+{puntuacionNivel} este nivel)
                </div>
              </div>
            </div>
            
            {/* BARRA DE PROGRESO */}
            <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 mb-2">
              <div 
                className="bg-green-500 h-2 md:h-3 rounded-full transition-all duration-500"
                style={{ width: `${progreso}%` }}
              ></div>
            </div>
            
            {/* TIEMPO */}
            <div className="text-center">
              <div className={`font-bold text-lg ${
                tiempoRestante <= 30 ? 'text-red-500 animate-pulse' : 
                tiempoRestante <= 60 ? 'text-orange-500' : 'text-blue-500'
              }`}>
                ⏱️ {Math.floor(tiempoRestante / 60)}:{(tiempoRestante % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* LISTA DE PALABRAS */}
          <div className="bg-white rounded-2xl p-4 mb-4 md:mb-6 shadow-lg">
            <h4 className="font-bold mb-3 text-gray-700">Palabras a encontrar:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {nivel.palabras.map((palabra, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    palabrasEncontradas.includes(palabra)
                      ? 'bg-green-100 text-green-700 line-through'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {palabra}
                </div>
              ))}
            </div>
          </div>

          {/* GRID DE SOPA DE LETRAS - TAMAÑOS MEJORADOS Y RESPONSIVOS */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl mb-4 md:mb-6 border-2 border-blue-200 overflow-x-auto">
            <div className="inline-block min-w-min mx-auto">
              <div 
                className={`grid gap-0.5 md:gap-1 ${gridPadding} bg-white rounded-lg`}
                style={{
                  gridTemplateColumns: `repeat(${tamañoGrid}, minmax(0, 1fr))`
                }}
              >
                {grid.map((fila, filaIndex) => 
                  fila.map((letra, columnaIndex) => {
                    const estaSeleccionada = seleccionActual.some(
                      pos => pos.fila === filaIndex && pos.columna === columnaIndex
                    );
                    const estaEncontrada = posicionesEncontradas.some(
                      pos => pos.fila === filaIndex && pos.columna === columnaIndex
                    );
                    
                    return (
                      <button
                        key={`${filaIndex}-${columnaIndex}`}
                        onClick={() => manejarClickLetra(filaIndex, columnaIndex)}
                        className={`
                          ${cellSize}
                          flex items-center justify-center
                          font-bold transition-all
                          ${estaEncontrada
                            ? 'bg-green-300 text-green-800 hover:bg-green-400 border border-green-500'
                            : estaSeleccionada
                            ? 'bg-blue-500 text-white scale-105 hover:bg-blue-600 border border-blue-600'
                            : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                          }
                        `}
                      >
                        {letra}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* EFECTOS VISUALES */}
          <div className="relative h-0">
            {efectos.map((efecto, index) => {
              // Calcular posición basada en el tamaño de celda
              let cellWidth;
              if (window.innerWidth < 640) {
                if (tamañoGrid === 8) cellWidth = 34;
                else if (tamañoGrid === 10) cellWidth = 30;
                else cellWidth = 26;
              } else {
                if (tamañoGrid === 8) cellWidth = 52;
                else if (tamañoGrid === 10) cellWidth = 44;
                else cellWidth = 36;
              }
              
              return (
                <div
                  key={efecto.id}
                  className="absolute font-bold animate-bounce z-50 pointer-events-none"
                  style={{
                    left: `${(efecto.columna * cellWidth) + 15}px`,
                    top: `${(efecto.fila * cellWidth) + 15 + (index * 20)}px`,
                    color: efecto.palabra ? '#10b981' : '#8b5cf6',
                    fontSize: efecto.palabra ? '1rem' : '0.875rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {efecto.texto}
                </div>
              );
            })}
          </div>

          {/* CONTROLES */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex gap-3">
              <button
                onClick={() => setSeleccionActual([])}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 md:py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 text-sm md:text-base"
              >
                🔄 Limpiar
              </button>
              <button
                onClick={salirDelJuego}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 md:py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 text-sm md:text-base"
              >
                ← Salir
              </button>
            </div>
          </div>

          {/* INSTRUCCIONES RÁPIDAS */}
          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-xl">
            <p className="font-medium mb-1">💡 <strong>Cómo jugar:</strong></p>
            <p className="text-xs md:text-sm">Selecciona letras contiguas en línea recta (horizontal, vertical o diagonal)</p>
            <p className="text-xs md:text-sm mt-1">Palabra seleccionada: <span className="font-bold text-blue-600">{seleccionActual.map(pos => pos.letra).join('') || 'Ninguna'}</span></p>
            <p className="text-xs md:text-sm mt-1">La palabra se verifica automáticamente al seleccionar 3+ letras</p>
          </div>
        </>
      )}
    </div>
  );
};

// =============================================
// 🎅 SANTA GIFTS DELUXE - ROOFTOP NIGHT DROP (ARCADE UPGRADE)
// =============================================

// Web Audio synthesizer para efectos de Santa Gifts
class SantaAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playDrop() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch { /* noop */ }
  }

  playDelivery() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        gain.gain.setValueAtTime(0.15, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.25);
      });
    } catch { /* noop */ }
  }

  playGrinch() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch { /* noop */ }
  }
}

const santaAudio = new SantaAudioEngine();

const SantaGifts = ({ volverASeleccion, guardarEnRanking }) => {
  const CONFIG = {
    ROWS: 5,
    GIFTS_LIMIT: 10,
    GRAVITY: 3.5,
    SPEED_MULTIPLIERS: [1.0, 0.85, 0.75, 0.65, 0.5]
  };

  const [santaX, setSantaX] = useState(50);
  const [gifts, setGifts] = useState([]);
  const [children, setChildren] = useState([
    { id: 1, row: 0, x: 20, direction: 1, speed: 1.0, hit: false },
    { id: 2, row: 1, x: 80, direction: -1, speed: 0.85, hit: false },
    { id: 3, row: 2, x: 40, direction: 1, speed: 0.75, hit: false },
    { id: 4, row: 3, x: 60, direction: -1, speed: 0.65, hit: false },
    { id: 5, row: 4, x: 30, direction: 1, speed: 0.5, hit: false }
  ]);
  const [grinches, setGrinches] = useState([
    { id: 1, row: 0, x: 70, direction: -1, speed: 1.0 },
    { id: 2, row: 1, x: 30, direction: 1, speed: 0.85 },
    { id: 3, row: 2, x: 90, direction: -1, speed: 0.75 },
    { id: 4, row: 3, x: 10, direction: 1, speed: 0.65 },
    { id: 5, row: 4, x: 50, direction: -1, speed: 0.5 }
  ]);
  const [giftsLeft, setGiftsLeft] = useState(CONFIG.GIFTS_LIMIT);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [regalosQueGolpearonNiños, setRegalosQueGolpearonNiños] = useState(0);
  const [floatPopups, setFloatPopups] = useState([]);

  // Teclado para mover a Santa
  useEffect(() => {
    if (!gameActive) return;

    const handleKeyDown = (e) => {
      santaAudio.init();
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setSantaX(prev => Math.max(8, prev - 4.5));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setSantaX(prev => Math.min(92, prev + 4.5));
      } else if ((e.key === ' ' || e.key === 'ArrowDown' || e.key === 's') && giftsLeft > 0) {
        lanzarRegalo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive, giftsLeft, santaX]);

  const lanzarRegalo = () => {
    if (giftsLeft <= 0 || !gameActive || gameOver) return;
    santaAudio.init();
    santaAudio.playDrop();

    // Tipo de regalo visual
    const types = ["🎁", "⭐", "🎀", "🍭"];
    const giftType = types[Math.floor(Math.random() * types.length)];

    setGifts(prev => [...prev, { 
      id: Date.now() + Math.random(), 
      x: santaX, 
      y: 16,
      icon: giftType,
      rotation: 0
    }]);
    setGiftsLeft(prev => prev - 1);
  };

  // Game Loop de Físicas
  useEffect(() => {
    if (!gameActive || gameOver) return;

    const interval = setInterval(() => {
      // 1. Mover regalos
      setGifts(prevGifts => {
        const updatedGifts = prevGifts.map(gift => ({
          ...gift,
          y: gift.y + CONFIG.GRAVITY,
          rotation: (gift.rotation || 0) + 0.1
        })).filter(gift => gift.y < 95);

        const remainingGifts = [];
        updatedGifts.forEach(gift => {
          let regaloDestruido = false;
          const filaRegalo = Math.floor((gift.y - 28) / 14);

          if (filaRegalo < 0 || filaRegalo >= CONFIG.ROWS) {
            remainingGifts.push(gift);
            return;
          }

          // Colisión con niño en la fila
          const niñoEnFila = children.find(child => child.row === filaRegalo && !child.hit);
          if (niñoEnFila && Math.abs(gift.x - niñoEnFila.x) < 8.5) {
            setScore(prev => prev + 10);
            setRegalosQueGolpearonNiños(prev => prev + 1);
            setChildren(prev => prev.map(c => 
              c.id === niñoEnFila.id ? { ...c, hit: true } : c
            ));
            regaloDestruido = true;
            santaAudio.playDelivery();

            // Popup visual
            setFloatPopups(p => [...p, { id: Date.now(), x: gift.x, y: gift.y, text: "+10 🎉", color: "text-emerald-300" }]);
          }

          // Colisión con Grinch
          const grinchEnFila = grinches.find(grinch => grinch.row === filaRegalo);
          if (grinchEnFila && Math.abs(gift.x - grinchEnFila.x) < 8.5 && !regaloDestruido) {
            setScore(prev => Math.max(0, prev - 5));
            regaloDestruido = true;
            santaAudio.playGrinch();

            // Popup visual
            setFloatPopups(p => [...p, { id: Date.now(), x: gift.x, y: gift.y, text: "-5 🧌", color: "text-red-400" }]);
          }

          if (!regaloDestruido) {
            remainingGifts.push(gift);
          }
        });

        return remainingGifts;
      });

      // 2. Mover niños
      setChildren(prev => 
        prev.map(child => {
          let newX = child.x + (child.direction * child.speed);
          if (newX <= 5 || newX >= 95) {
            newX = Math.max(5, Math.min(95, newX));
            return { ...child, x: newX, direction: -child.direction };
          }
          return { ...child, x: newX };
        })
      );

      // 3. Mover Grinches
      setGrinches(prev => 
        prev.map(grinch => {
          let newX = grinch.x + (grinch.direction * grinch.speed);
          if (newX <= 5 || newX >= 95) {
            newX = Math.max(5, Math.min(95, newX));
            return { ...grinch, x: newX, direction: -grinch.direction };
          }
          return { ...grinch, x: newX };
        })
      );

      // Limpiar popups antiguos
      setFloatPopups(prev => prev.slice(-8));

    }, 50);

    return () => clearInterval(interval);
  }, [gameActive, gameOver, children, grinches]);

  // Cálculo de Puntuación Final
  const calcularPuntuacionFinal = () => {
    const niñosFelices = children.filter(c => c.hit).length;
    const todosFelices = niñosFelices === CONFIG.ROWS;
    const tiempoTranscurrido = startTime ? Date.now() - startTime : 0;
    
    let puntuacionFinal = score;
    const bonusTodosFelices = todosFelices ? 25 : 0;
    puntuacionFinal += bonusTodosFelices;
    
    const regalosUsados = CONFIG.GIFTS_LIMIT - giftsLeft;
    const regalosEfectivos = regalosQueGolpearonNiños;
    const bonusEficiencia = Math.max(0, (CONFIG.GIFTS_LIMIT - regalosEfectivos) * 5);
    puntuacionFinal += bonusEficiencia;
    
    return {
      puntuacion: Math.max(0, puntuacionFinal),
      tiempo: tiempoTranscurrido,
      regalosUsados: regalosUsados,
      regalosEfectivos: regalosEfectivos,
      niñosFelices: niñosFelices,
      todosFelices: todosFelices,
      bonusEficiencia: bonusEficiencia,
      bonusTodosFelices: bonusTodosFelices,
      puntosBase: score
    };
  };

  // Fin de Juego Automático
  useEffect(() => {
    if (!gameActive || gameOver) return;

    const niñosFelices = children.filter(c => c.hit).length;
    const todosFelices = niñosFelices === CONFIG.ROWS;
    
    const condicionFinJuego = (giftsLeft <= 0 && gifts.length === 0) || todosFelices;

    if (condicionFinJuego) {
      setGameOver(true);
      setGameActive(false);
      
      const resultado = calcularPuntuacionFinal();
      guardarEnRanking("santa-gifts", resultado.puntuacion, {
        tiempo: resultado.tiempo,
        regalosUsados: resultado.regalosUsados,
        regalosEfectivos: resultado.regalosEfectivos,
        niñosFelices: resultado.niñosFelices,
        todosFelices: resultado.todosFelices,
        bonusEficiencia: resultado.bonusEficiencia,
        bonusTodosFelices: resultado.bonusTodosFelices,
        puntosBase: resultado.puntosBase,
        _desempate: {
          puntos: resultado.puntuacion,
          tiempo: resultado.tiempo,
          eficiencia: resultado.regalosEfectivos
        }
      });
    }
  }, [giftsLeft, gifts.length, gameOver, gameActive, children]);

  const startGame = () => {
    santaAudio.init();
    setSantaX(50);
    setGifts([]);
    setRegalosQueGolpearonNiños(0);
    setChildren([
      { id: 1, row: 0, x: 20, direction: 1, speed: 1.0, hit: false },
      { id: 2, row: 1, x: 80, direction: -1, speed: 0.85, hit: false },
      { id: 3, row: 2, x: 40, direction: 1, speed: 0.75, hit: false },
      { id: 4, row: 3, x: 60, direction: -1, speed: 0.65, hit: false },
      { id: 5, row: 4, x: 30, direction: 1, speed: 0.5, hit: false }
    ]);
    setGrinches([
      { id: 1, row: 0, x: 70, direction: -1, speed: 1.0 },
      { id: 2, row: 1, x: 30, direction: 1, speed: 0.85 },
      { id: 3, row: 2, x: 90, direction: -1, speed: 0.75 },
      { id: 4, row: 3, x: 10, direction: 1, speed: 0.65 },
      { id: 5, row: 4, x: 50, direction: -1, speed: 0.5 }
    ]);
    setGiftsLeft(CONFIG.GIFTS_LIMIT);
    setScore(0);
    setGameActive(true);
    setGameOver(false);
    setStartTime(Date.now());
  };

  const getRowPosition = (row) => 28 + (row * 14);
  const niñosFelices = children.filter(c => c.hit).length;
  const resultado = gameOver ? calcularPuntuacionFinal() : null;

  return (
    <div className="text-center max-w-xl mx-auto px-2 select-none">
      {/* HEADER ARCADE */}
      <div className="flex items-center justify-between mb-3 bg-gradient-to-r from-red-950 via-slate-900 to-emerald-950 p-3 rounded-2xl text-white shadow-lg border border-red-500/30">
        <div className="flex items-center gap-2">
          <span className="text-3xl animate-bounce">🎅</span>
          <div className="text-left">
            <h2 className="text-lg font-black tracking-tight text-white leading-tight">SANTA'S NIGHT DROP</h2>
            <p className="text-[11px] text-red-200">Entrega de Regalos en los Tejados</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-red-600/40 text-red-200 border border-red-400/30 font-bold">
            🎁 {giftsLeft} Restantes
          </span>
        </div>
      </div>

      {/* TARJETA DEL JUEGO */}
      <div className="bg-gradient-to-b from-slate-950 via-indigo-950 to-blue-950 rounded-3xl p-4 mb-4 border-2 border-amber-400/40 shadow-2xl relative overflow-hidden">
        
        {/* HUD SUPERIOR */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/15">
            <div className="text-xl font-black text-amber-300">{score}</div>
            <div className="text-[10px] uppercase font-bold text-white/70">Puntos</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/15">
            <div className="text-xl font-black text-emerald-300">{giftsLeft}/10</div>
            <div className="text-[10px] uppercase font-bold text-white/70">Regalos</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/15">
            <div className="text-xl font-black text-pink-300">{niñosFelices}/5</div>
            <div className="text-[10px] uppercase font-bold text-white/70">Niños Felices</div>
          </div>
        </div>

        {/* ESCENARIO NOCTURNO DE TEJADOS */}
        <div className="relative rounded-2xl h-96 border border-cyan-400/30 overflow-hidden shadow-inner bg-gradient-to-b from-[#0a1128] via-[#101f42] to-[#1c2d5a]">
          
          {/* LUNA Y ESTRELLAS DE FONDO */}
          <div className="absolute top-3 right-6 w-12 h-12 rounded-full bg-amber-100 shadow-[0_0_25px_rgba(254,240,138,0.7)] pointer-events-none flex items-center justify-center text-xl">
            🌕
          </div>
          <div className="absolute top-6 left-10 text-xs opacity-50 pointer-events-none">✨</div>
          <div className="absolute top-12 left-40 text-xs opacity-40 pointer-events-none">⭐</div>
          <div className="absolute top-16 right-36 text-xs opacity-60 pointer-events-none">✨</div>

          {/* LÍNEA GUÍA DE APUNTADO (DESDE SANTA HACIA ABAJO) */}
          {gameActive && (
            <div 
              className="absolute top-12 bottom-0 w-0.5 border-l border-dashed border-cyan-300/40 pointer-events-none z-10"
              style={{ left: `${santaX}%` }}
            />
          )}

          {/* SANTA EN SU TRINEO VOLADOR */}
          <div 
            className="absolute top-2 z-20 transition-all duration-75 select-none"
            style={{ left: `${santaX}%`, transform: 'translateX(-50%)' }}
          >
            <div className="flex items-center gap-1 group">
              <span className="text-2xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">🦌</span>
              <span className="text-3xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">🛷</span>
              <span className="text-2xl -ml-4 -mt-2">🎅</span>
            </div>
            {/* Estela mágica dorada */}
            <div className="w-10 h-1 bg-gradient-to-r from-amber-400/0 via-amber-300/60 to-transparent -mt-1 mx-auto rounded-full blur-[1px]" />
          </div>

          {/* REGALOS CAYENDO */}
          {gifts.map(gift => (
            <div 
              key={gift.id} 
              className="absolute text-2xl z-20 pointer-events-none transition-transform duration-75"
              style={{
                left: `${gift.x}%`,
                top: `${gift.y}%`,
                transform: `translate(-50%, -50%) rotate(${gift.rotation || 0}rad)`,
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
              }}
            >
              {gift.icon || "🎁"}
            </div>
          ))}

          {/* POPUPS FLOTANTES DE PUNTOS */}
          {floatPopups.map(p => (
            <div
              key={p.id}
              className={`absolute text-sm font-black z-30 pointer-events-none animate-bounce ${p.color}`}
              style={{ left: `${p.x}%`, top: `${p.y - 4}%`, transform: "translate(-50%, -50%)" }}
            >
              {p.text}
            </div>
          ))}

          {/* 5 TEJADOS / BALCONES DE LA ALDEA */}
          {[...Array(CONFIG.ROWS)].map((_, row) => {
            const rowTop = getRowPosition(row);
            return (
              <div 
                key={row} 
                className="absolute left-0 right-0 h-14 pointer-events-none border-b border-cyan-500/20"
                style={{ top: `${rowTop}%` }}
              >
                {/* Silueta de tejado con nieve */}
                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 opacity-80 border-t-2 border-white/60" />

                {/* Chimenea con humo */}
                <div className="absolute bottom-3 left-6 text-xs opacity-60">🏠</div>
                <div className="absolute bottom-3 right-8 text-xs opacity-60">🏠</div>

                {/* NIÑO EN LA FILA */}
                {children.map(child => child.row === row && (
                  <div 
                    key={child.id}
                    className="absolute z-20 transition-all duration-75 flex flex-col items-center pointer-events-none"
                    style={{
                      left: `${child.x}%`,
                      bottom: '4px',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                      {child.hit ? '🥰' : '😢'}
                    </span>
                    <span className={`text-[9px] font-black px-1.5 rounded-full ${
                      child.hit ? "bg-emerald-500 text-white" : "bg-sky-500/80 text-white"
                    }`}>
                      {child.hit ? '¡Gracias!' : '¡Aquí!'}
                    </span>
                  </div>
                ))}

                {/* GRINCH / DUENDE LADRÓN */}
                {grinches.map(grinch => grinch.row === row && (
                  <div 
                    key={grinch.id}
                    className="absolute z-20 transition-all duration-75 flex flex-col items-center pointer-events-none"
                    style={{
                      left: `${grinch.x}%`,
                      bottom: '4px',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                      🧌
                    </span>
                    <span className="text-[8px] font-bold px-1 bg-red-600 text-white rounded">
                      ¡Roba!
                    </span>
                  </div>
                ))}
              </div>
            );
          })}

          {/* PANTALLA INICIAL ANTES DE COMENZAR */}
          {!gameActive && !gameOver && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-30">
              <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 text-white max-w-sm w-full text-center space-y-3 shadow-2xl">
                <div className="text-5xl">🎅🎁</div>
                <h3 className="text-2xl font-black text-amber-300">¡Noche de Reparto!</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Pilota el trineo de Santa en el cielo nocturno y suelta regalos en el tejado justo cuando los niños pasen por debajo. ¡Cuidado con los duendes que se los roban!
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/10 p-3 rounded-2xl text-left border border-white/10">
                  <div>😢 ➔ 🥰 : <strong>+10 pts</strong></div>
                  <div>🧌 intercepta : <strong>-5 pts</strong></div>
                  <div>Todos felices : <strong>+25 bonus</strong></div>
                  <div>Eficiencia : <strong>+5 x regalo</strong></div>
                </div>

                <button 
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-3.5 rounded-2xl font-black text-base shadow-lg transition-transform transform hover:scale-[1.02] active:scale-95"
                >
                  🚀 ¡COMENZAR MISIÓN!
                </button>
              </div>
            </div>
          )}

          {/* MODAL DE RESULTADOS GAME OVER */}
          {gameOver && resultado && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-amber-400 rounded-3xl p-6 text-white max-w-sm w-full text-center space-y-3 shadow-2xl">
                <div className="text-5xl">{resultado.todosFelices ? '🏆🎉' : '🎄🎅'}</div>
                <h3 className="text-2xl font-black text-amber-300">
                  {resultado.todosFelices ? '¡MISIÓN PERFECTA!' : '¡Misión Cumplida!'}
                </h3>
                
                <div className="space-y-1.5 text-left text-xs bg-white/10 p-3.5 rounded-2xl border border-white/15">
                  <div className="flex justify-between">
                    <span className="text-white/70">Puntos Base:</span>
                    <span className="font-bold text-white">{resultado.puntosBase}</span>
                  </div>
                  {resultado.bonusTodosFelices > 0 && (
                    <div className="flex justify-between text-emerald-300">
                      <span>Bonus Todos Felices:</span>
                      <span className="font-bold">+{resultado.bonusTodosFelices}</span>
                    </div>
                  )}
                  {resultado.bonusEficiencia > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <span>Bonus Ahorro de Regalos:</span>
                      <span className="font-bold">+{resultado.bonusEficiencia}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/20 pt-2 text-sm font-black">
                    <span className="text-white">PUNTAJE FINAL:</span>
                    <span className="text-yellow-300 text-xl font-black">{resultado.puntuacion}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={startGame}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black text-xs shadow-md transition-all"
                  >
                    🔄 Reintentar
                  </button>
                  <button 
                    onClick={volverASeleccion}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold text-xs border border-white/20 transition-all"
                  >
                    ← Salir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CONTROLES TÁCTILES Y DE RATÓN ERGONÓMICOS Y 100% SIMÉTRICOS */}
        {gameActive && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 items-stretch h-14 sm:h-16">
              <button
                onClick={() => { santaAudio.init(); setSantaX(prev => Math.max(8, prev - 8)); }}
                className="h-full flex items-center justify-center gap-1.5 bg-blue-700/80 hover:bg-blue-600 active:bg-blue-500 active:scale-95 text-white font-black text-sm sm:text-base rounded-2xl border-2 border-blue-400/50 shadow-lg select-none transition-transform"
                title="Mover a la izquierda"
              >
                <span className="text-lg">◀</span>
                <span>IZQ</span>
              </button>

              <button
                onClick={lanzarRegalo}
                disabled={giftsLeft <= 0}
                className={`h-full flex items-center justify-center gap-1.5 rounded-2xl font-black text-sm sm:text-base transition-transform active:scale-95 shadow-xl border-2 select-none ${
                  giftsLeft > 0 
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white border-amber-300 shadow-red-900/50' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600'
                }`}
                title="Soltar regalo"
              >
                <span className="text-lg">🎁</span>
                <span>SOLTAR</span>
              </button>

              <button
                onClick={() => { santaAudio.init(); setSantaX(prev => Math.min(92, prev + 8)); }}
                className="h-full flex items-center justify-center gap-1.5 bg-blue-700/80 hover:bg-blue-600 active:bg-blue-500 active:scale-95 text-white font-black text-sm sm:text-base rounded-2xl border-2 border-blue-400/50 shadow-lg select-none transition-transform"
                title="Mover a la derecha"
              >
                <span>DER</span>
                <span className="text-lg">▶</span>
              </button>
            </div>
            
            <div className="text-center text-white/60 text-xs">
              Usa las flechas <strong>← →</strong> o pulsa los botones para posicionar a Santa y <strong>Espacio</strong> para soltar.
            </div>
          </div>
        )}
      </div>

      <button
        onClick={volverASeleccion}
        className="text-xs text-gray-500 hover:text-gray-800 transition-colors py-2 px-4 rounded-xl hover:bg-gray-200/50"
      >
        ← Volver a Sala de Juegos 3
      </button>
    </div>
  );
};


// =============================================
// 5. 🐍 SNAKE
// =============================================
const Snake = ({ volverASeleccion, guardarEnRanking }) => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [comida, setComida] = useState({ x: 5, y: 5 });
  const [direccion, setDireccion] = useState('RIGHT');
  const [puntuacion, setPuntuacion] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameActive, setGameActive] = useState(false);

  const iniciarJuego = () => {
    setSnake([{ x: 10, y: 10 }]);
    setComida({ x: 5, y: 5 });
    setDireccion('RIGHT');
    setPuntuacion(0);
    setGameOver(false);
    setGameActive(true);
  };

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const manejarTecla = (e) => {
      const key = e.key.toLowerCase();
      if ((key === 'arrowup' || key === 'w') && direccion !== 'DOWN') setDireccion('UP');
      else if ((key === 'arrowdown' || key === 's') && direccion !== 'UP') setDireccion('DOWN');
      else if ((key === 'arrowleft' || key === 'a') && direccion !== 'RIGHT') setDireccion('LEFT');
      else if ((key === 'arrowright' || key === 'd') && direccion !== 'LEFT') setDireccion('RIGHT');
    };

    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [direccion, gameActive, gameOver]);

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        const cabeza = { ...prevSnake[0] };
        
        switch(direccion) {
          case 'UP': cabeza.y--; break;
          case 'DOWN': cabeza.y++; break;
          case 'LEFT': cabeza.x--; break;
          case 'RIGHT': cabeza.x++; break;
        }

        // Colisión con bordes
        if (cabeza.x < 0 || cabeza.x >= 20 || cabeza.y < 0 || cabeza.y >= 20) {
          setGameOver(true);
          guardarEnRanking("snake", puntuacion, {
            longitud: prevSnake.length
          });
          return prevSnake;
        }

        // Colisión consigo mismo
        if (prevSnake.some(segmento => segmento.x === cabeza.x && segmento.y === cabeza.y)) {
          setGameOver(true);
          guardarEnRanking("snake", puntuacion, {
            longitud: prevSnake.length
          });
          return prevSnake;
        }

        const nuevoSnake = [cabeza, ...prevSnake];

        // Comer comida
        if (cabeza.x === comida.x && cabeza.y === comida.y) {
          setPuntuacion(prev => prev + 10);
          setComida({
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
          });
        } else {
          nuevoSnake.pop();
        }

        return nuevoSnake;
      });
    }, 200);

    return () => clearInterval(gameLoop);
  }, [direccion, comida, gameActive, gameOver, puntuacion]);

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6">🐍 Snake</h2>
      
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-3">
            <div className="text-xl font-bold text-green-600">{puntuacion}</div>
            <div className="text-sm text-gray-600">Puntos</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <div className="text-xl font-bold text-blue-600">{snake.length}</div>
            <div className="text-sm text-gray-600">Longitud</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-4 mb-6">
        <div className="relative w-full" style={{ paddingBottom: '100%' }}>
          <div className="absolute inset-0 bg-gray-900 rounded-lg p-2">
            <div className="grid grid-cols-20 grid-rows-20 gap-1 w-full h-full">
              {Array.from({ length: 20 }).map((_, y) =>
                Array.from({ length: 20 }).map((_, x) => {
                  const esSnake = snake.some(segmento => segmento.x === x && segmento.y === y);
                  const esCabeza = snake[0].x === x && snake[0].y === y;
                  const esComida = comida.x === x && comida.y === y;
                  
                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`w-full h-full rounded-sm ${
                        esCabeza ? 'bg-green-500' :
                        esSnake ? 'bg-green-400' :
                        esComida ? 'bg-red-500' : 'bg-gray-700'
                      }`}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {!gameActive && !gameOver && (
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="text-4xl mb-4">🐍</div>
          <button
            onClick={iniciarJuego}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all"
          >
            Comenzar Juego
          </button>
        </div>
      )}

      {gameOver && (
        <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-6 mb-6">
          <div className="text-2xl font-bold text-red-700 mb-2"> Game Over</div>
          <p className="text-red-600 mb-4">Puntuación: {puntuacion}</p>
          <button
            onClick={iniciarJuego}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all"
          >
            🔄 Jugar Otra Vez
          </button>
        </div>
      )}

      {gameActive && (
        <div className="grid grid-cols-3 gap-2.5 max-w-[210px] mx-auto mb-6">
          <div></div>
          <button
            onClick={() => setDireccion('UP')}
            className="w-14 h-14 mx-auto flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 text-white text-2xl font-black rounded-2xl shadow-lg border-2 border-emerald-400/40 select-none active:scale-95 transition-transform"
            title="Arriba"
          >
            ▲
          </button>
          <div></div>
          <button
            onClick={() => setDireccion('LEFT')}
            className="w-14 h-14 mx-auto flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 text-white text-2xl font-black rounded-2xl shadow-lg border-2 border-emerald-400/40 select-none active:scale-95 transition-transform"
            title="Izquierda"
          >
            ◀
          </button>
          <button
            onClick={() => setDireccion('DOWN')}
            className="w-14 h-14 mx-auto flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 text-white text-2xl font-black rounded-2xl shadow-lg border-2 border-emerald-400/40 select-none active:scale-95 transition-transform"
            title="Abajo"
          >
            ▼
          </button>
          <button
            onClick={() => setDireccion('RIGHT')}
            className="w-14 h-14 mx-auto flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 text-white text-2xl font-black rounded-2xl shadow-lg border-2 border-emerald-400/40 select-none active:scale-95 transition-transform"
            title="Derecha"
          >
            ▶
          </button>
        </div>
      )}

      <button
        onClick={volverASeleccion}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
      >
      
        ← Volver a Juegos 3
      </button>

      <style jsx>{`
        .grid-cols-20 {
          grid-template-columns: repeat(20, minmax(0, 1fr));
        }
        .grid-rows-20 {
          grid-template-rows: repeat(20, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
};

// =============================================
// 🏆 COMPONENTE RANKING PARA JUEGOS 3 (SIN AVATAR, SIN TERRITORY WARS)
// =============================================
const RankingJuego3 = ({ juegoId, juegoNombre, rankingGlobal, usuarioActual }) => {
  const [rankingCompleto, setRankingCompleto] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarRankingCompleto();
  }, [rankingGlobal, juegoId]);

  const cargarRankingCompleto = async () => {
    try {
      setCargando(true);
      
      // ⚠️ EXCLUIR TERRITORY WARS DEL RANKING
      if (juegoId === "territory-wars") {
        setRankingCompleto([]);
        setCargando(false);
        return;
      }
      
      const rankingJuego = await gobaService.obtenerRankingJuego(juegoId);
      
      const topJugadores = rankingJuego
        .sort((a, b) => b.mejorPuntuacion - a.mejorPuntuacion)
        .slice(0, 5)
        .map((jugador, index) => ({
          ...jugador,
          posicion: index + 1,
          esUsuarioActual: jugador.usuarioId === usuarioActual?.id
        }));
      
      setRankingCompleto(topJugadores);
    } catch (error) {
      console.log(`Error cargando ranking para ${juegoId}:`, error);
      setRankingCompleto([]);
    } finally {
      setCargando(false);
    }
  };

  const obtenerEmojiPosicion = (posicion) => {
    switch(posicion) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `${posicion}º`; // Cambiado a número ordinal
    }
  };

  if (cargando) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200">
        <h3 className="font-bold text-gray-800 mb-3 text-center">{juegoNombre}</h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Si es Territory Wars, mostrar mensaje especial
  if (juegoId === "territory-wars") {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 shadow-lg border-2 border-purple-300">
        <h3 className="font-bold text-gray-800 mb-3 text-center text-sm bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg py-2">
          {juegoNombre} 🗺️
        </h3>
        <div className="text-center py-6 bg-white/50 rounded-lg">
          <div className="text-3xl mb-3">👥</div>
          <p className="text-gray-700 text-sm font-medium mb-2">Juego por Equipos</p>
          <p className="text-gray-500 text-xs">Sin ranking individual</p>
          <div className="mt-3 text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
            Solo ranking por equipo
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-blue-200">
      <h3 className="font-bold text-gray-800 mb-3 text-center text-sm bg-blue-50 rounded-lg py-2">
        {juegoNombre}
      </h3>
      
      <div className="space-y-2">
        {rankingCompleto.length > 0 ? (
          rankingCompleto.map((jugador) => (
            <div 
              key={jugador.usuarioId}
              className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                jugador.esUsuarioActual 
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300' 
                  : 'bg-gray-50 border border-gray-100'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* MEDALLITA O NÚMERO */}
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-gray-700 text-sm">
                    {obtenerEmojiPosicion(jugador.posicion)}
                  </span>
                </div>
                
                {/* SOLO NOMBRE (SIN AVATAR) */}
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium truncate ${
                    jugador.esUsuarioActual ? 'text-blue-600 font-bold' : 'text-gray-800'
                  }`}>
                    {jugador.nombre || 'Jugador'}
                    {jugador.esUsuarioActual && (
                      <span className="ml-1 text-xs text-blue-500"></span>
                    )}
                  </div>
                
                </div>
              </div>
              
              {/* PUNTUACIÓN */}
              <div className="text-right flex-shrink-0 ml-2">
                <div className="font-bold text-gray-800">
                  {jugador.mejorPuntuacion}
                </div>
                <div className="text-xs text-gray-500">pts</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🏆</div>
            <p className="text-gray-500 text-sm">Sin datos aún</p>
            <p className="text-gray-400 text-xs mt-1">Sé el primero en jugar</p>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================
// 🎯 COMPONENTE PRINCIPAL JUEGOS 3 - CORREGIDO
// =============================================
export default function Juegos3() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [juegoActivo, setJuegoActivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [rankingGlobal, setRankingGlobal] = useState({});

  const juegos3 = [
    {
      id: "territory-wars",
      nombre: " Territory Control", 
      descripcion: "Conquista territorios en este juego grupal de estrategia, Solo 1 equipo ganará",
      icono: "🗺️",
      color: "from-purple-500 to-indigo-500",
      dificultad: "Estratégico",
      edad: "10+"
    },
    {
      id: "pong",
      nombre: " Pong",
      descripcion: "Clásico juego de paletas",
      icono: "🎮",
      color: "from-green-500 to-blue-500",
      dificultad: "Medio",
      edad: "6+"
    },
    {
      id: "sopa-letras",
      nombre: " Sopa de Letras",
      descripcion: "Encuentra palabras navideñas",
      icono: "🧩",
      color: "from-blue-500 to-cyan-500",
      dificultad: "Medio",
      edad: "8+"
    },
    {
      id: "santa-gifts",
      nombre: " Santa Gifts",
      descripcion: "Lanza regalos desde el trineo",
      icono: "🎅",
      color: "from-red-500 to-orange-500",
      dificultad: "Fácil",
      edad: "7+"
    },
    {
      id: "snake",
      nombre: " Snake",
      descripcion: "Clásico juego de la serpiente",
      icono: "🐍",
      color: "from-emerald-500 to-green-500",
      dificultad: "Medio",
      edad: "6+"
    }
  ];

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) {
      window.location.href = "/login";
      return;
    }
    setUsuarioActual(usuario);
    cargarRankingsJuegos3();
  }, []);

  // 🎯 FUNCIÓN PARA CARGAR RANKINGS
  const cargarRankingsJuegos3 = async () => {
    try {
      setCargando(true);
      setMensaje("🔄 Cargando rankings Juegos 3...");
      
      const nuevoRankingGlobal = {};
      
      for (const juego of juegos3) {
        try {
          const rankingJuego = await gobaService.obtenerRankingJuego(juego.id);
          nuevoRankingGlobal[juego.id] = {};
          
          rankingJuego.forEach(jugador => {
            nuevoRankingGlobal[juego.id][jugador.usuarioId] = {
              nombre: jugador.nombre,
              puntuacion: jugador.mejorPuntuacion,
              fecha: jugador.fechaUltimoIntento
            };
          });
        } catch (error) {
          console.log(`⚠️ Juego ${juego.id} aún sin datos:`, error);
          nuevoRankingGlobal[juego.id] = {};
        }
      }
      
      setRankingGlobal(nuevoRankingGlobal);
      setMensaje("✅ Rankings Juegos 3 cargados");
      
    } catch (error) {
      console.log('❌ Error cargando rankings Juegos 3:', error);
      setMensaje("⚠️ Error cargando rankings");
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  // 🎯 FUNCIÓN PARA GUARDAR EN RANKING
  const guardarEnRankingJuegos3 = async (juegoId, puntuacion, datosSession = {}) => {
    try {
      setMensaje("📡 Guardando en Juegos 3...");
      
      const resultado = await gobaService.guardarPuntuacionJuego(
        usuarioActual.id,
        juegoId,
        puntuacion,
        datosSession
      );
      
      if (resultado.esNuevoRecord) {
        setMensaje("🎉 ¡Nuevo récord en Juegos 3!");
      } else {
        setMensaje("✅ Puntuación guardada en Juegos 3");
      }
      
      cargarRankingsJuegos3();
      
    } catch (error) {
      console.log('❌ Error guardando en Juegos 3:', error);
      setMensaje("⚠️ Error guardando puntuación");
    } finally {
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const iniciarJuego = (juegoId) => {
    setJuegoActivo(juegoId);
  };

  const volverASeleccion = () => {
    setJuegoActivo(null);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Cargando Juegos 3...</div>
        </div>
      </div>
    );
  }

  if (!usuarioActual) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">Redirigiendo al login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent">
            🎮 Juegos 3 - Clásicos & Estrategia
          </h1>
          {/* Navegación entre salas de juegos */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            <span className="px-4 py-2 rounded-full font-bold text-xs bg-purple-600 text-white shadow-md">
              🎯 Juegos 3 (Activo)
            </span>
            <Link to="/juegos2" className="px-4 py-2 rounded-full font-medium text-xs bg-white text-gray-700 hover:bg-gray-100 shadow border border-gray-200 transition-colors">
              🕹️ Minijuegos 2
            </Link>
            <Link to="/juegos" className="px-4 py-2 rounded-full font-medium text-xs bg-white text-gray-700 hover:bg-gray-100 shadow border border-gray-200 transition-colors">
              🎮 Juegos Clásicos 1
            </Link>
          </div>
        </div>

        {!juegoActivo ? (
          <>
            {/* 🌟 BANNER ESTRELLA: SNOWLINE */}
            <Link
              to="/snowline"
              className="block mb-8 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 rounded-3xl p-6 text-white shadow-2xl border-4 border-white/30 transform hover:scale-[1.01] transition-all group"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-400 text-slate-900 flex items-center justify-center text-4xl shadow-lg shrink-0 group-hover:rotate-6 transition-transform">
                    🎿
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <span className="text-2xl font-black tracking-tight text-white">MINICLIP SNOWLINE</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900">NUEVO 2026</span>
                    </div>
                    <p className="text-sm text-cyan-100 max-w-xl">
                      ¡Recreación exacta del clásico juego de Miniclip! Dibuja pistas de nieve con física realista, recoge regalos y lleva el trineo de Santa hasta la meta en 10 niveles desafiantes.
                    </p>
                  </div>
                </div>
                <div className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl font-black text-sm tracking-wide shrink-0 shadow flex items-center gap-2">
                  <span>JUGAR AHORA</span>
                  <span className="group-hover:translate-x-1 transition-transform">➔</span>
                </div>
              </div>
            </Link>

            {/* MENÚ PRINCIPAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {juegos3.map((juego) => (
                <div
                  key={juego.id}
                  className={`bg-gradient-to-br ${juego.color} rounded-2xl p-6 text-white text-center shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border-4 border-white/20`}
                  onClick={() => iniciarJuego(juego.id)}
                >
                  <div className="text-5xl mb-4">{juego.icono}</div>
                  <h3 className="text-xl font-bold mb-2">{juego.nombre}</h3>
                  <p className="text-white/90 mb-3">{juego.descripcion}</p>
                  <div className="flex justify-center gap-2 mb-2">
                    <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                      {juego.dificultad}
                    </div>
                    <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                      Edad: {juego.edad}
                    </div>
                  </div>
                  <div className="mt-2 bg-white/30 rounded-full px-3 py-1 text-sm font-semibold">
                    Mejor: {rankingGlobal[juego.id]?.[usuarioActual.id]?.puntuacion || 0} pts
                  </div>
                </div>
              ))}
            </div>

           {/* SECCIÓN DE RANKINGS */}
<div className="bg-white/90 rounded-2xl p-8 shadow-2xl border-2 border-purple-200 mb-8">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-3xl font-bold text-gray-800">🏆 Rankings Individuales</h2>
    <button 
      onClick={cargarRankingsJuegos3}
      disabled={cargando}
      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
    >
      {cargando ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Cargando...
        </>
      ) : (
        <>🔄 Actualizar</>
      )}
    </button>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* Filtra juegos para excluir territory-wars */}
    {juegos3
      .filter(juego => juego.id !== "territory-wars")  // EXCLUIR TERRITORY WARS
      .map((juego) => (
        <RankingJuego3 
          key={juego.id} 
          juegoId={juego.id} 
          juegoNombre={juego.nombre}
          rankingGlobal={rankingGlobal}
          usuarioActual={usuarioActual}
        />
      ))}
  </div>
</div>

            {/* INFORMACIÓN DE LOS JUEGOS */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 shadow-lg border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">ℹ️ Acerca de Juegos 3</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🗺️</div>
                  <h4 className="font-bold text-gray-800 mb-2">Territory Control</h4>
                  <p className="text-sm text-gray-600">
                    Competencia semanal entre 4 equipos. Conquista territorios hasta el domingo 6:00 PM.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl mb-2">🎮</div>
                  <h4 className="font-bold text-gray-800 mb-2">Pong Clásico</h4>
                  <p className="text-sm text-gray-600">
                    El clásico juego de paletas con IA desafiante.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl mb-2">🧩</div>
                  <h4 className="font-bold text-gray-800 mb-2">Sopa de Letras</h4>
                  <p className="text-sm text-gray-600">
                    Encuentra palabras navideñas escondidas en la grilla antes de que se acabe el tiempo.
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl mb-2">🎅</div>
                  <h4 className="font-bold text-gray-800 mb-2">Santa Gifts</h4>
                  <p className="text-sm text-gray-600">
                    Ayuda a Santa a entregar regalos, evita que los duendes te los roben. 
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl mb-2">🐍</div>
                  <h4 className="font-bold text-gray-800 mb-2">Snake</h4>
                  <p className="text-sm text-gray-600">
                    El clásico juego de la serpiente. Come la mayor cantidad de puntos sin chocar.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ÁREA DE JUEGO ACTIVO */
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-purple-200 max-w-6xl mx-auto">
            {juegoActivo === "territory-wars" && (
              <TerritoryWars 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos3}
                usuarioActual={usuarioActual}
              />
            )}
            {juegoActivo === "pong" && (
              <IcePong 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos3}
              />
            )}
            {juegoActivo === "sopa-letras" && (
              <SopaLetrasNavidenia 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos3}
              />
            )}
            {juegoActivo === "santa-gifts" && (
              <SantaGifts 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos3}
              />
            )}
            {juegoActivo === "snake" && (
              <SantaSnake 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos3}
              />
            )}
          </div>
        )}

        {/* NAVEGACIÓN */}
        <div className="text-center space-y-4 mt-8">
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg mx-2"
          >
            🏠 Volver al Home
          </Link>
          
          <div className="text-sm text-gray-500 mt-4">
            🎯 Juegos 3 - Clásicos & Estrategia | v2.0
          </div>
        </div>
      </div>
    </div>
  );
}
