// src/pages/juegos3.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

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

  // 🎨 RENDERIZAR TABLERO
  const renderTablero = () => {
    const tiempoRestante = calcularTiempoRestanteCierre();
    
    return (
      <div className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-purple-200">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">🗺️ Tablero del Reino</h3>
          <p className="text-gray-600 text-sm">Construye, defiende y conquista para tu equipo</p>
        </div>

        <div className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
          <div className="text-sm font-bold">⏰ FINALIZA:</div>
          <div className="text-lg font-bold">
            {tiempoRestante.terminado ? "🎉 ¡COMPETICIÓN TERMINADA!" : `Domingo 6:00 PM • ${tiempoRestante.dias}d ${tiempoRestante.horas}h ${tiempoRestante.minutos}m`}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mx-auto max-w-xs border border-gray-200">
          <div className="grid grid-cols-7 gap-1 mx-auto">
            {tablero.map((fila, filaIndex) =>
              fila.map((terreno, columnaIndex) => {
                const equipo = terreno ? EQUIPOS[terreno.equipo] : null;
                const estaSeleccionado = terrenoSeleccionado?.fila === filaIndex && terrenoSeleccionado?.columna === columnaIndex;

                return (
                  <button
                    key={`${filaIndex}-${columnaIndex}`}
                    onClick={() => seleccionarTerreno(filaIndex, columnaIndex)}
                    className={`
                      w-8 h-8 rounded-md border transition-all duration-200 relative
                      ${equipo ? equipo.color : 'bg-gray-400'}
                      ${estaSeleccionado ? 'ring-2 ring-purple-500 scale-110' : 'hover:scale-105'}
                      ${estaProtegido(terreno) ? 'ring-1 ring-yellow-400 animate-pulse' : ''}
                      border-gray-300
                    `}
                    title={estaProtegido(terreno) ? `Protegido hasta ${new Date(terreno.proteccionHasta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ''}
                  />
                );
              })
            )}
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 justify-center bg-red-50 px-2 py-1 rounded">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-700 font-medium">Rojo</span>
          </div>
          <div className="flex items-center gap-2 justify-center bg-blue-50 px-2 py-1 rounded">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-700 font-medium">Azul</span>
          </div>
          <div className="flex items-center gap-2 justify-center bg-green-50 px-2 py-1 rounded">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-700 font-medium">Verde</span>
          </div>
          <div className="flex items-center gap-2 justify-center bg-yellow-50 px-2 py-1 rounded">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-700 font-medium">Amarillo</span>
          </div>
        </div>
      </div>
    );
  };

  // 📊 RENDERIZAR ESTADÍSTICAS
  const renderEstadisticas = () => {
    const equipoGanador = Object.entries(estadisticas).reduce((ganador, [equipo, stats]) => 
      stats.territorios > estadisticas[ganador].territorios ? equipo : ganador, "ROJO"
    );

    const tiempoRestante = calcularTiempoRestanteCierre();

    return (
      <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-200">
        <h3 className="font-bold mb-4 text-gray-800 text-center">🏆 Clasificación</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-3 px-2">
          <div className="text-left text-sm font-bold text-gray-600">Equipo</div>
          <div className="text-right text-sm font-bold text-gray-600">Territorios</div>
        </div>

        <div className="space-y-2">
          {Object.entries(EQUIPOS).map(([key, equipo]) => {
            const jugadoresEnEquipo = jugadoresPorEquipo[key] || [];
            
            return (
              <div
                key={key}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                  key === equipoGanador && tiempoRestante.terminado
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400' 
                    : 'bg-gray-50 border-gray-200'
                } ${key === miEquipo ? 'ring-1 ring-blue-400' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${equipo.color}`}></div>
                  <div className="min-w-0 flex-1">
                    <div className={`font-bold text-xs truncate ${key === miEquipo ? 'text-blue-600' : 'text-gray-700'}`}>
                      {key === miEquipo ? 'Mi Equipo' : `Equipo ${equipo.nombre}`}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {jugadoresEnEquipo.length} jugador{jugadoresEnEquipo.length !== 1 ? 'es' : ''}
                    </div>
                  </div>
                </div>
                
                <div className="text-right min-w-0 flex-shrink-0">
                  <div className="font-bold text-gray-800 text-sm whitespace-nowrap">
                    {estadisticas[key].territorios}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`mt-4 rounded-lg p-2 text-center ${
          tiempoRestante.terminado 
            ? 'bg-gradient-to-r from-green-100 to-green-200 border border-green-300'
            : 'bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300'
        }`}>
          <div className="text-xs font-bold mb-1 whitespace-nowrap">
            {tiempoRestante.terminado ? '🎉 COMPETICIÓN TERMINADA' : '⏰ EN CURSO'}
          </div>
          <div className="text-xs truncate">
            {tiempoRestante.terminado 
              ? `Ganador: ${EQUIPOS[equipoGanador].nombre}`
              : 'Domino 6:00 PM Honduras'
            }
          </div>
        </div>
      </div>
    );
  };

  // ⚡ RENDERIZAR PANEL DE POWER
  const renderPanelPower = () => {
    const tiempoParaReset = calcularTiempoParaReset();
    
    if (power === null) {
      return (
        <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-green-200">
          <h3 className="font-bold mb-4 text-gray-800 text-center">⚡ Power Diario</h3>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando power...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-green-200">
        <h3 className="font-bold mb-4 text-gray-800 text-center">⚡ Power Diario</h3>
        
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-purple-700">{power}/{COSTOS_POWER.powerDiario}</div>
          <div className="text-sm text-gray-600">
            {power === COSTOS_POWER.powerDiario ? "¡Completo! 🎉" : `${COSTOS_POWER.powerDiario - power} restantes`}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">Próximo reset:</span>
            <span className="text-xs font-bold text-blue-700">
              {tiempoParaReset.horas}h {tiempoParaReset.minutos}m
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(power / COSTOS_POWER.powerDiario) * 100}%` }}
            ></div>
          </div>
          
          <div className="text-xs text-center text-gray-500 mt-1">
            +10 power cada día a las 6:00 AM
          </div>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-xs font-bold text-yellow-700 mb-1">📝 Costos de Power</div>
          <div className="grid grid-cols-3 gap-1 text-xs">
            <div className="text-center">
              <div className="font-bold text-gray-800">🏗️ Construir</div>
              <div className="text-gray-600">{COSTOS_POWER.construir} power</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-800">⚔️ Atacar</div>
              <div className="text-gray-600">{COSTOS_POWER.atacar} power</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-800">🛡️ Proteger</div>
              <div className="text-gray-600">{COSTOS_POWER.proteger} power</div>
            </div>
          </div>
        </div>

        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div className="text-xs font-bold text-blue-700">🛡️ Protecciones</div>
          <div className="text-xs text-blue-600">
            🕒 Duración: <span className="font-bold">4 horas</span>
          </div>
        </div>

        <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-2">
          <div className="text-xs font-bold text-purple-700">💡Sin Trampas!</div>
          <div className="text-xs text-purple-600">
            ✅ Libro de registros de últimas acciones
          </div>
        </div>
      </div>
    );
  };

  // 🎮 RENDERIZAR ACCIONES
  const renderAcciones = () => {
    let terreno = null;
    if (terrenoSeleccionado && tablero[terrenoSeleccionado.fila]) {
      terreno = tablero[terrenoSeleccionado.fila][terrenoSeleccionado.columna];
    }
    
    const esDeMiEquipo = terreno?.equipo === miEquipo;
    const esDeOtroEquipo = terreno?.equipo && terreno.equipo !== miEquipo;
    const esNeutral = terreno?.equipo === null;
    const tiempoRestante = calcularTiempoRestanteCierre();
    
    if (power === null) {
      return (
        <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-200">
          <h3 className="font-bold mb-4 text-gray-800 text-center">🎮 Acciones</h3>
          <div className="text-center py-4">
            <p className="text-gray-600">Cargando power...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-200">
        <h3 className="font-bold mb-4 text-gray-800 text-center">🎮 Acciones</h3>
        
        {terreno ? (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700 font-medium mb-1">
              Terreno {terreno.fila + 1}-{terreno.columna + 1}
            </div>
            <div className="font-bold text-gray-800 text-sm mb-1">
              {terreno.equipo ? EQUIPOS[terreno.equipo].nombre : 'Territorio Neutral'}
            </div>
            <div className="text-xs text-gray-600">
              • {estaProtegido(terreno) ? '🛡️ Protegido' : '⚔️ Vulnerable'}
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-center border border-yellow-200">
            <div className="text-sm text-yellow-700 font-medium">
              {terrenoSeleccionado ? "❌ Error: Terreno no encontrado" : "Selecciona un territorio en el mapa"}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={construir}
            disabled={!terreno || power < COSTOS_POWER.construir || !esNeutral || tiempoRestante.terminado || !miEquipo}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed shadow-md"
          >
            🏗️ Construir ({COSTOS_POWER.construir} power)
          </button>

          <button
            onClick={atacar}
            disabled={!terreno || power < COSTOS_POWER.atacar || !esDeOtroEquipo || estaProtegido(terreno) || tiempoRestante.terminado || !miEquipo}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed shadow-md"
          >
            ⚔️ Atacar ({COSTOS_POWER.atacar} power)
          </button>

          <button
            onClick={proteger}
            disabled={!terreno || power < COSTOS_POWER.proteger || !esDeMiEquipo || estaProtegido(terreno) || tiempoRestante.terminado || !miEquipo}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed shadow-md"
          >
            🛡️ Proteger ({COSTOS_POWER.proteger} power)
          </button>
        </div>

        {tiempoRestante.terminado && (
          <div className="mt-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-3 text-center border border-green-300">
            <div className="text-green-700 font-bold text-sm">🏆 Competencia Finalizada</div>
            <div className="text-xs text-green-600">Espera la próxima semana</div>
          </div>
        )}
      </div>
    );
  };

  // 🎯 RENDERIZAR SELECTOR DE EQUIPO
  const renderSelectorEquipo = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <h2 className="text-4xl font-bold text-white mb-2">🗺️ Territory Control</h2>
            <p className="text-lg text-white/80"> - ¡Domina el mapa!</p>
          </div>

          <div className="bg-white rounded-2xl p-8 max-w-md mx-auto text-center shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">🎯 Elige tu Equipo</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Selecciona un equipo para unirte a la competencia semanal
              <br />
              <span className="text-xs text-orange-600 font-medium">Máximo 5 jugadores por equipo</span>
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {Object.entries(EQUIPOS).map(([key, equipo]) => {
                const jugadoresEnEquipo = jugadoresPorEquipo[key] || [];
                const estaLleno = jugadoresEnEquipo.length >= equipo.maxJugadores;
                const porcentajeLleno = (jugadoresEnEquipo.length / equipo.maxJugadores) * 100;
                
                return (
                  <button
                    key={key}
                    onClick={() => !estaLleno && elegirEquipo(key)}
                    disabled={estaLleno}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      estaLleno 
                        ? 'bg-gray-300 cursor-not-allowed opacity-60' 
                        : `${equipo.color} text-white hover:scale-105`
                    } border-white/30 relative overflow-hidden`}
                  >
                    <div 
                      className={`absolute top-0 left-0 h-1 ${
                        porcentajeLleno >= 80 ? 'bg-red-500' : 
                        porcentajeLleno >= 60 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${porcentajeLleno}%` }}
                    ></div>
                    
                    <div className="text-2xl mb-2">{equipo.emoji}</div>
                    <div className="font-bold text-sm">{equipo.nombre}</div>
                    <div className="text-xs mt-1">{jugadoresEnEquipo.length}/{equipo.maxJugadores}</div>
                    
                    {estaLleno && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                        <span className="text-white font-bold text-xs">🔒 COMPLETO</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-700 font-medium">
                ⚠️ Una vez elegido el equipo, no podrás cambiarlo durante esta competencia semanal
              </p>
            </div>



            <button
              onClick={volverASeleccion}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-2xl"
            >
 

              ← Volver a Juegos 3
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando Territory Wars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center max-w-6xl mx-auto p-4">
      <h2 className="text-4xl font-bold mb-2 text-gray-800">🗺️ Territory Control</h2>
      <p className="text-lg mb-6 text-gray-600">¡Domina el tablero!</p>

      <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 mb-6 border-2 border-blue-300">
        <div className="flex items-center justify-center gap-4">
          <span className="text-2xl">{EQUIPOS[miEquipo].emoji}</span>
          <div>
            <div className="font-bold text-lg text-blue-700">
              {usuarioActual.nombre} - {EQUIPOS[miEquipo].nombre}
            </div>
            <div className="text-sm text-gray-600">
              {jugadoresPorEquipo[miEquipo]?.length || 0}/5 jugadores en tu equipo
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-6">
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
          ⚡ <strong>Power:</strong> 10 diarios (reset 6:00 AM)  • ⏰ <strong>Finaliza:</strong> Domingo 6:00 PM Honduras
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
      nombre: "🎄 Nivel Fácil - Decoraciones",
      tamaño: 8,
      palabras: ["JOSE", "RENY", "LUISA", "RAFAEL", "GABRIELA", "OLIVIA"],
      tiempoLimite: 180,
      puntosBase: 100,
      direcciones: ["horizontal", "vertical"]
    },
    {
      id: 2, 
      nombre: "🍽️ Nivel Medio - Comidas Navideñas",
      tamaño: 10,
      palabras: ["MANUEL", "RUTH", "RAQUEL", "ANDRES", "VALERIA", "MARIANA"],
      tiempoLimite: 240,
      puntosBase: 150,
      direcciones: ["horizontal", "vertical", "diagonal"]
    },
    {
      id: 3,
      nombre: "🎅 Nivel Difícil - Tradiciones",
      tamaño: 12, 
      palabras: ["ISABELLA", "PAOLO", "SANTIAGO", "MATEO", "SEBASTIAN", "MONTSERRAT","CAMILA"],
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
// 🎅 SANTA GIFTS - VERSIÓN FINAL CON BONIFICACIONES
// =============================================
const SantaGifts = ({ volverASeleccion, guardarEnRanking }) => {
  const CONFIG = {
    ROWS: 5,
    GIFTS_LIMIT: 10,
    GRAVITY: 3,
    SPEED_MULTIPLIERS: [1.0, 0.8, 0.7, 0.6, 0.5]
  };

  const [santaX, setSantaX] = useState(50);
  const [gifts, setGifts] = useState([]);
  const [children, setChildren] = useState([
    { id: 1, row: 0, x: 20, direction: 1, speed: 1.0, hit: false },
    { id: 2, row: 1, x: 80, direction: -1, speed: 0.8, hit: false },
    { id: 3, row: 2, x: 40, direction: 1, speed: 0.7, hit: false },
    { id: 4, row: 3, x: 60, direction: -1, speed: 0.6, hit: false },
    { id: 5, row: 4, x: 30, direction: 1, speed: 0.5, hit: false }
  ]);
  const [grinches, setGrinches] = useState([
    { id: 1, row: 0, x: 70, direction: -1, speed: 1.0 },
    { id: 2, row: 1, x: 30, direction: 1, speed: 0.8 },
    { id: 3, row: 2, x: 90, direction: -1, speed: 0.7 },
    { id: 4, row: 3, x: 10, direction: 1, speed: 0.6 },
    { id: 5, row: 4, x: 50, direction: -1, speed: 0.5 }
  ]);
  const [giftsLeft, setGiftsLeft] = useState(CONFIG.GIFTS_LIMIT);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [regalosQueGolpearonNiños, setRegalosQueGolpearonNiños] = useState(0);

  // Mover Santa con teclado
  useEffect(() => {
    if (!gameActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && santaX > 5) {
        setSantaX(prev => prev - 5);
      } else if (e.key === 'ArrowRight' && santaX < 95) {
        setSantaX(prev => prev + 5);
      } else if (e.key === ' ' && giftsLeft > 0) {
        lanzarRegalo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [santaX, gameActive, giftsLeft]);

  const lanzarRegalo = () => {
    if (giftsLeft <= 0) return;
    setGifts(prev => [...prev, { 
      id: Date.now(), 
      x: santaX, 
      y: 15
    }]);
    setGiftsLeft(prev => prev - 1);
  };

  // Game loop principal
  useEffect(() => {
    if (!gameActive || gameOver) return;

    const gameLoop = setInterval(() => {
      // 1. Mover regalos hacia abajo
      setGifts(prevGifts => {
        const updatedGifts = prevGifts.map(gift => ({
          ...gift,
          y: gift.y + CONFIG.GRAVITY
        })).filter(gift => gift.y < 95);

        // Verificar colisiones
        const remainingGifts = [];
        updatedGifts.forEach(gift => {
          let regaloDestruido = false;
          const filaRegalo = Math.floor((gift.y - 30) / 13);

          // Solo verificar colisiones si la fila es válida
          if (filaRegalo < 0 || filaRegalo >= CONFIG.ROWS) {
            remainingGifts.push(gift);
            return;
          }

          // Colisión con niños (solo si NO están felices)
          const niñoEnFila = children.find(child => 
            child.row === filaRegalo && !child.hit
          );
          
          if (niñoEnFila && Math.abs(gift.x - niñoEnFila.x) < 10) {
            setScore(prev => prev + 10);
            setRegalosQueGolpearonNiños(prev => prev + 1);
            setChildren(prev => prev.map(c => 
              c.id === niñoEnFila.id ? { ...c, hit: true } : c
            ));
            regaloDestruido = true;
          }

          // Colisión con Grinches (siempre, sin importar niño)
          const grinchEnFila = grinches.find(grinch => grinch.row === filaRegalo);
          
          if (grinchEnFila && Math.abs(gift.x - grinchEnFila.x) < 10 && !regaloDestruido) {
            setScore(prev => Math.max(0, prev - 5));
            regaloDestruido = true;
          }

          if (!regaloDestruido) {
            remainingGifts.push(gift);
          }
        });

        return remainingGifts;
      });

      // 2. Mover niños (TODOS se mueven, felices o no)
      setChildren(prev => 
        prev.map(child => {
          let newX = child.x + (child.direction * child.speed);
          
          // Rebote en bordes
          if (newX <= 0 || newX >= 100) {
            newX = Math.max(0, Math.min(100, newX));
            return { ...child, x: newX, direction: -child.direction };
          }
          
          return { ...child, x: newX };
        })
      );

      // 3. Mover Grinches
      setGrinches(prev => 
        prev.map(grinch => {
          let newX = grinch.x + (grinch.direction * grinch.speed);
          
          // Rebote en bordes
          if (newX <= 0 || newX >= 100) {
            newX = Math.max(0, Math.min(100, newX));
            return { ...grinch, x: newX, direction: -grinch.direction };
          }
          
          return { ...grinch, x: newX };
        })
      );

    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameActive, gameOver, children, grinches]);

  // Calcular bonificaciones
  const calcularPuntuacionFinal = () => {
    const niñosFelices = children.filter(c => c.hit).length;
    const todosFelices = niñosFelices === CONFIG.ROWS;
    const tiempoTranscurrido = startTime ? Date.now() - startTime : 0;
    
    // Puntos base (score ya tiene +10 por niño, -5 por duende)
    let puntuacionFinal = score;
    
    // Bonus por todos felices
    const bonusTodosFelices = todosFelices ? 20 : 0;
    puntuacionFinal += bonusTodosFelices;
    
    // Bonus por eficiencia (menos regalos usados = más puntos)
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

  // Verificar fin del juego
  useEffect(() => {
    if (!gameActive || gameOver) return;

    const niñosFelices = children.filter(c => c.hit).length;
    const todosFelices = niñosFelices === CONFIG.ROWS;
    
    const condicionFinJuego = 
      (giftsLeft <= 0 && gifts.length === 0) || // Sin regalos y ninguno en el aire
      todosFelices; // Todos los niños felices

    if (condicionFinJuego) {
      setGameOver(true);
      setGameActive(false);
      
      const resultado = calcularPuntuacionFinal();
      
      // Guardar en ranking con datos para desempate
      guardarEnRanking("santa-gifts", resultado.puntuacion, {
        tiempo: resultado.tiempo,
        regalosUsados: resultado.regalosUsados,
        regalosEfectivos: resultado.regalosEfectivos,
        niñosFelices: resultado.niñosFelices,
        todosFelices: resultado.todosFelices,
        bonusEficiencia: resultado.bonusEficiencia,
        bonusTodosFelices: resultado.bonusTodosFelices,
        puntosBase: resultado.puntosBase,
        // Para desempates: primero puntos, luego tiempo, luego eficiencia
        _desempate: {
          puntos: resultado.puntuacion,
          tiempo: resultado.tiempo,
          eficiencia: resultado.regalosEfectivos
        }
      });
    }
  }, [giftsLeft, gifts.length, gameOver, gameActive, children]);

  const startGame = () => {
    setSantaX(50);
    setGifts([]);
    setRegalosQueGolpearonNiños(0);
    // Resetear niños y grinches
    setChildren([
      { id: 1, row: 0, x: 20, direction: 1, speed: 1.0, hit: false },
      { id: 2, row: 1, x: 80, direction: -1, speed: 0.8, hit: false },
      { id: 3, row: 2, x: 40, direction: 1, speed: 0.7, hit: false },
      { id: 4, row: 3, x: 60, direction: -1, speed: 0.6, hit: false },
      { id: 5, row: 4, x: 30, direction: 1, speed: 0.5, hit: false }
    ]);
    setGrinches([
      { id: 1, row: 0, x: 70, direction: -1, speed: 1.0 },
      { id: 2, row: 1, x: 30, direction: 1, speed: 0.8 },
      { id: 3, row: 2, x: 90, direction: -1, speed: 0.7 },
      { id: 4, row: 3, x: 10, direction: 1, speed: 0.6 },
      { id: 5, row: 4, x: 50, direction: -1, speed: 0.5 }
    ]);
    setGiftsLeft(CONFIG.GIFTS_LIMIT);
    setScore(0);
    setGameActive(true);
    setGameOver(false);
    setStartTime(Date.now());
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    
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
  };

  // Calcular posición vertical de cada fila
  const getRowPosition = (row) => {
    return 30 + (row * 13);
  };

  const niñosFelices = children.filter(c => c.hit).length;
  const todosFelices = niñosFelices === CONFIG.ROWS;
  const resultado = gameOver ? calcularPuntuacionFinal() : null;

  return (
    <div className="text-center max-w-md mx-auto px-4">
     

      <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl p-4 mb-6 border-2 border-yellow-400">
        {/* UI Superior */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-300">{score}</div>
            <div className="text-sm text-white/80">Puntos</div>
          </div>
          
          <div className="bg-blue-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{giftsLeft}</div>
            <div className="text-sm text-white/80">Regalos</div>
          </div>
          
          <div className="bg-blue-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-pink-400">{niñosFelices}/5</div>
            <div className="text-sm text-white/80">Felices</div>
          </div>
        </div>

        {/* Área de Juego */}
        <div className="relative bg-gradient-to-b from-blue-800/30 to-blue-900/20 rounded-xl h-80 border border-blue-400/20 overflow-hidden mb-4">
          {/* Santa */}
          <div 
            className="absolute top-4 text-4xl z-20 transition-all duration-100"
            style={{ left: `${santaX}%`, transform: 'translateX(-50%)' }}
          >
            🎅
          </div>
          
          {/* Regalos cayendo */}
          {gifts.map(gift => (
            <div 
              key={gift.id} 
              className="absolute text-2xl z-10 transition-all duration-50"
              style={{
                left: `${gift.x}%`,
                top: `${gift.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              🎁
            </div>
          ))}
          
          {/* Filas con líneas */}
          {[...Array(CONFIG.ROWS)].map((_, row) => (
            <div key={row} className="absolute left-0 right-0 h-px bg-blue-400/30"
                 style={{ top: `${getRowPosition(row)}%` }}>
              {/* Niño en esta fila */}
              {children.map(child => child.row === row && (
                <div 
                  key={child.id}
                  className="absolute text-2xl transition-all duration-100"
                  style={{
                    left: `${child.x}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: child.hit ? 0.7 : 1
                  }}
                >
                  {child.hit ? '😊' : '😢'}
                </div>
              ))}
              
              {/* Grinch en esta fila */}
              {grinches.map(grinch => grinch.row === row && (
                <div 
                  key={grinch.id}
                  className="absolute text-2xl transition-all duration-100"
                  style={{
                    left: `${grinch.x}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  🧌
                </div>
              ))}
            </div>
          ))}

          {/* Pantalla de inicio */}
          {!gameActive && !gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-xl">
              <div className="text-center text-white p-6">
      
                <h3 className="text-xl font-bold mb-2">¡Entrega regalos!</h3>
                <p className="mb-4 text-sm text-white/80">
                  • 10 regalos<br/>
                  • 😢 → 😊 = +10 puntos<br/>
                  • 🧌 intercepta = -5 puntos<br/>
                  • Bonus por eficiencia
                </p>
                <button 
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                >
                  Comenzar Juego
                </button>
              </div>
            </div>
          )}

          {/* Game Over */}
          {gameOver && resultado && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-xl">
              <div className="text-center text-white p-6 max-w-xs">
                <div className="text-3xl mb-4">.</div>
                <h3 className="text-xl font-bold mb-2">
                  {resultado.todosFelices ? '🎉 ¡Felicidades!' : '¡Juego Terminado!'}
                </h3>
                
                <div className="space-y-2 mb-4 text-left text-sm bg-white/10 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span>Puntos base:</span>
                    <span className="font-bold">{resultado.puntosBase}</span>
                  </div>
                  {resultado.bonusTodosFelices > 0 && (
                    <div className="flex justify-between text-green-300">
                      <span>Bonus todos felices:</span>
                      <span className="font-bold">+{resultado.bonusTodosFelices}</span>
                    </div>
                  )}
                  {resultado.bonusEficiencia > 0 && (
                    <div className="flex justify-between text-yellow-300">
                      <span>Bonus eficiencia:</span>
                      <span className="font-bold">+{resultado.bonusEficiencia}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/20 pt-2 mt-2">
                    <span className="font-bold">TOTAL:</span>
                    <span className="text-2xl font-bold text-yellow-300">{resultado.puntuacion}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={startGame}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
                  >
                    Jugar Otra Vez
                  </button>
                  <button 
                    onClick={volverASeleccion}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
                  >
                    Menú
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controles móviles */}
        {gameActive && (
          <div className="space-y-3">
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setSantaX(prev => Math.max(5, prev - 8))}
                className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full text-xl font-bold transition-all active:scale-95"
              >
                ←
              </button>
              <button
                onClick={lanzarRegalo}
                disabled={giftsLeft <= 0}
                className={`w-14 h-14 rounded-full text-xl font-bold transition-all active:scale-95 ${
                  giftsLeft > 0 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                🎁
              </button>
              <button
                onClick={() => setSantaX(prev => Math.min(95, prev + 8))}
                className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full text-xl font-bold transition-all active:scale-95"
              >
                →
              </button>
            </div>
            
            <div className="text-center text-white/70 text-sm">
              Regalos: {giftsLeft}/10 • Felices: {niñosFelices}/5
              {regalosQueGolpearonNiños > 0 && (
                <span> • Eficiencia: {regalosQueGolpearonNiños} regalos usados</span>
              )}
            </div>
          </div>
        )}

        {gameActive && !gameOver && (
          <button
            onClick={endGame}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold transition-all"
          >
            Terminar Juego
          </button>
        )}
      </div>

      <button
        onClick={volverASeleccion}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-all"
      >
        ← Volver a Juegos 3
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
      switch(e.key) {
        case 'ArrowUp': if (direccion !== 'DOWN') setDireccion('UP'); break;
        case 'ArrowDown': if (direccion !== 'UP') setDireccion('DOWN'); break;
        case 'ArrowLeft': if (direccion !== 'RIGHT') setDireccion('LEFT'); break;
        case 'ArrowRight': if (direccion !== 'LEFT') setDireccion('RIGHT'); break;
      }
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
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div></div>
          <button
            onClick={() => setDireccion('UP')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-all"
          >
            ↑
          </button>
          <div></div>
          <button
            onClick={() => setDireccion('LEFT')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-all"
          >
            ←
          </button>
          <button
            onClick={() => setDireccion('DOWN')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-all"
          >
            ↓
          </button>
          <button
            onClick={() => setDireccion('RIGHT')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-all"
          >
            →
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
          <p className="text-xl text-gray-600 mb-8 font-light">
      
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
        </div>

        {!juegoActivo ? (
          <>
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
              <Pong 
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
              <Snake 
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
