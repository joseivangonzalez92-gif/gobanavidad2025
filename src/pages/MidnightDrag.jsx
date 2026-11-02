// src/pages/MidnightDrag.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";
import SpeedometerCluster from "../components/juegos/SpeedometerCluster";

// =========================================================================
// 🚗 CATÁLOGO DE 5 VEHÍCULOS CON DISTINTOS COMPUESTOS Y CARACTERÍSTICAS
// =========================================================================
export const CAR_CATALOG = [
  {
    id: "skyline",
    name: "Skyline GT-R R34",
    nickname: "Godzilla JDM",
    category: "AWD Twin-Turbo",
    primaryColor: "#0284c7",
    accentColor: "#38bdf8",
    stripeColor: "#ffffff",
    neonColor: "#06b6d4",
    flameColor: "#38bdf8",
    exhaustCount: 2,
    redlineRPM: 8600,
    optimalShiftRPM: [7200, 8300],
    topSpeedKmh: 345,
    accelMultiplier: 0.95,
    nitroMultiplier: 1.0,
    handlingAgility: 14,
    soundFreq: 75,
    spoiler: "high",
    specs: { accel: 85, topSpeed: 90, nitro: 85, control: 90 },
    compounds: "Compuesto Semi-Slick blando · Tracción integral ATTESA E-TS · Turbos gemelos equilibrados"
  },
  {
    id: "supra",
    name: "Supra MK4 2JZ",
    nickname: "Highway King",
    category: "Single Turbo Monster",
    primaryColor: "#f59e0b",
    accentColor: "#fbbf24",
    stripeColor: "#1e293b",
    neonColor: "#ec4899",
    flameColor: "#f43f5e",
    exhaustCount: 1,
    redlineRPM: 8800,
    optimalShiftRPM: [7400, 8500],
    topSpeedKmh: 368,
    accelMultiplier: 1.02,
    nitroMultiplier: 1.15,
    handlingAgility: 12,
    soundFreq: 82,
    spoiler: "hoop",
    specs: { accel: 82, topSpeed: 98, nitro: 90, control: 78 },
    compounds: "Compuesto duro de alta velocidad · Intercooler masivo · Empuje turbo brutal en 3ª a 6ª marcha"
  },
  {
    id: "rx7",
    name: "RX-7 FD3S Spirit",
    nickname: "Rotary Screamer",
    category: "Twin-Rotor 13B",
    primaryColor: "#eab308",
    accentColor: "#fde047",
    stripeColor: "#0f172a",
    neonColor: "#10b981",
    flameColor: "#10b981",
    exhaustCount: 1,
    redlineRPM: 9400,
    optimalShiftRPM: [7800, 9100],
    topSpeedKmh: 330,
    accelMultiplier: 0.98,
    nitroMultiplier: 0.95,
    handlingAgility: 19,
    soundFreq: 115,
    spoiler: "ducktail",
    specs: { accel: 88, topSpeed: 82, nitro: 82, control: 98 },
    compounds: "Chasis aligerado 1,180 kg · Relaciones de marcha cerradas · Cambios de carril instantáneos"
  },
  {
    id: "mustang",
    name: "Mustang GT 5.0 V8",
    nickname: "Street Boss",
    category: "American Muscle",
    primaryColor: "#dc2626",
    accentColor: "#ef4444",
    stripeColor: "#111827",
    neonColor: "#ef4444",
    flameColor: "#f97316",
    exhaustCount: 4,
    redlineRPM: 7800,
    optimalShiftRPM: [6600, 7600],
    topSpeedKmh: 320,
    accelMultiplier: 1.12,
    nitroMultiplier: 0.9,
    handlingAgility: 11,
    soundFreq: 58,
    spoiler: "lip",
    specs: { accel: 96, topSpeed: 80, nitro: 80, control: 72 },
    compounds: "Compuesto Drag Radial trasero ancho · Par motor bestial desde parado · Salida explosiva de 0 a 100"
  },
  {
    id: "porsche",
    name: "911 GT3 RS",
    nickname: "Precision Weapon",
    category: "Flat-6 Atmospheric",
    primaryColor: "#f8fafc",
    accentColor: "#84cc16",
    stripeColor: "#84cc16",
    neonColor: "#84cc16",
    flameColor: "#38bdf8",
    exhaustCount: 2,
    redlineRPM: 9000,
    optimalShiftRPM: [7600, 8700],
    topSpeedKmh: 352,
    accelMultiplier: 1.05,
    nitroMultiplier: 1.25,
    handlingAgility: 17,
    soundFreq: 92,
    spoiler: "gtwing",
    specs: { accel: 91, topSpeed: 92, nitro: 95, control: 94 },
    compounds: "Neumáticos Michelin Cup 2R · Caja secuencial PDK de doble embrague · Inyección de Nitro ultraeficiente"
  }
];

// =========================================================================
// 🔊 MOTOR DE AUDIO SINTETIZADO (WEB AUDIO API - CERO DEPENDENCIAS EXTERNAS)
// =========================================================================
const DragAudio = (() => {
  let ctx = null;
  let engineOsc = null;
  let engineGain = null;
  let currentBaseFreq = 75;
  let isMuted = false;

  const getCtx = () => {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  };

  return {
    setMuted: (muted) => { isMuted = muted; },
    getMuted: () => isMuted,

    startEngine: (baseFreq = 75) => {
      if (isMuted) return;
      try {
        const c = getCtx();
        if (!c) return;
        currentBaseFreq = baseFreq;
        if (engineOsc) {
          try { engineOsc.stop(); } catch (e) { /* ignore */ }
        }
        engineOsc = c.createOscillator();
        engineGain = c.createGain();
        engineOsc.type = "sawtooth";
        engineOsc.frequency.setValueAtTime(baseFreq, c.currentTime);
        engineGain.gain.setValueAtTime(0.08, c.currentTime);

        const filter = c.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, c.currentTime);

        engineOsc.connect(filter);
        filter.connect(engineGain);
        engineGain.connect(c.destination);
        engineOsc.start();
      } catch (e) { /* ignore */ }
    },

    updateRPM: (rpm, maxRPM = 9000) => {
      if (isMuted || !engineOsc || !ctx) return;
      try {
        const ratio = Math.max(0, Math.min(1, rpm / maxRPM));
        const freq = currentBaseFreq + ratio * 320;
        engineOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
      } catch (e) { /* ignore */ }
    },

    stopEngine: () => {
      try {
        if (engineOsc) {
          engineOsc.stop();
          engineOsc = null;
        }
      } catch (e) { /* ignore */ }
    },

    shiftBlowOff: () => {
      if (isMuted) return;
      try {
        const c = getCtx();
        if (!c) return;
        const bufferSize = c.sampleRate * 0.25;
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.06));
        }
        const noise = c.createBufferSource();
        noise.buffer = buffer;
        const filter = c.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(3200, c.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.22);

        const gain = c.createGain();
        gain.gain.setValueAtTime(0.25, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(c.destination);
        noise.start();
      } catch (e) { /* ignore */ }
    },

    nitroSound: () => {
      if (isMuted) return;
      try {
        const c = getCtx();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(500, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(950, c.currentTime + 0.3);
        gain.gain.setValueAtTime(0.18, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.32);
      } catch (e) { /* ignore */ }
    },

    nearMiss: () => {
      if (isMuted) return;
      try {
        const c = getCtx();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, c.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.19);
      } catch (e) { /* ignore */ }
    },

    crash: () => {
      if (isMuted) return;
      try {
        const c = getCtx();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.28);
        gain.gain.setValueAtTime(0.35, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.3);
      } catch (e) { /* ignore */ }
    },

    countdownBeep: (isGo = false) => {
      if (isMuted) return;
      try {
        const c = getCtx();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(isGo ? 920 : 480, c.currentTime);
        gain.gain.setValueAtTime(0.28, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + (isGo ? 0.35 : 0.18));
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + (isGo ? 0.36 : 0.19));
      } catch (e) { /* ignore */ }
    },

    victoryFanfare: () => {
      if (isMuted) return;
      try {
        const c = getCtx();
        if (!c) return;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, c.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.25, c.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + idx * 0.1 + 0.28);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(c.currentTime + idx * 0.1);
          osc.stop(c.currentTime + idx * 0.1 + 0.3);
        });
      } catch (e) { /* ignore */ }
    }
  };
})();

// =========================================================================
// 🏁 COMPONENTE PRINCIPAL: MIDNIGHT DRAG UNDERGROUND (1 KM TIME ATTACK)
// =========================================================================
export default function MidnightDrag() {
  const canvasRef = useRef(null);
  const usuarioActual = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuarioActual") || "null");
    } catch {
      return null;
    }
  }, []);

  // Selección de vehículo actual
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const currentCar = CAR_CATALOG[selectedCarIndex] || CAR_CATALOG[0];

  // Estados de partida: "garage", "staging", "racing", "finished"
  const [gameState, setGameState] = useState("garage");
  const [stagingLight, setStagingLight] = useState(0);
  const [soundMuted, setSoundMuted] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [cargandoRanking, setCargandoRanking] = useState(false);
  const [personalBest, setPersonalBest] = useState(null);

  // HUD & Telemetría en tiempo real
  const [hudSpeed, setHudSpeed] = useState(0);
  const [hudRPM, setHudRPM] = useState(1000);
  const [hudGear, setHudGear] = useState(1);
  const [hudDistance, setHudDistance] = useState(0);
  const [hudTime, setHudTime] = useState(0);
  const [hudNitro, setHudNitro] = useState(100);
  const [hudNitroActive, setHudNitroActive] = useState(false);
  const [shiftFeedback, setShiftFeedback] = useState(null);
  const [nearMissCount, setNearMissCount] = useState(0);

  // Configuración de 6 marchas progresiva y equilibrada
  const GEAR_CONFIG = useMemo(() => [
    { gear: 1, minKmh: 0,   maxKmh: 75,  accel: 28 },
    { gear: 2, minKmh: 42,  maxKmh: 125, accel: 24 },
    { gear: 3, minKmh: 90,  maxKmh: 180, accel: 20 },
    { gear: 4, minKmh: 140, maxKmh: 240, accel: 16 },
    { gear: 5, minKmh: 195, maxKmh: 300, accel: 12 },
    { gear: 6, minKmh: 250, maxKmh: 368, accel: 9  },
  ], []);

  // Referencia física mutable a 60 FPS
  const stateRef = useRef({
    distanceMetros: 0,
    speedKmh: 0,
    rpm: 1000,
    gear: 1,
    lane: 1,
    laneProgress: 1,
    nitro: 100,
    nitroActive: false,
    startTime: 0,
    finalTime: 0,
    maxSpeedReached: 0,
    perfectShifts: 0,
    goodShifts: 0,
    badShifts: 0,
    traffic: [],
    sceneryOffset: 0,
    cameraShake: 0,
    crashCooldown: 0,
    stagingRPM: 1200,
    isRevving: false,
    launchBoost: false
  });

  // Cargar Ranking de Firebase
  const cargarRanking = async () => {
    setCargandoRanking(true);
    try {
      const data = await gobaService.obtenerRankingJuego("drag-race", 25);
      if (data && Array.isArray(data)) {
        const ordenado = data
          .map(d => ({
            ...d,
            tiempoSeg: Number(d.sessionData?.tiempoSegundos || d.tiempo || (d.mejorPuntuacion ? 9999 - d.mejorPuntuacion : 99.99))
          }))
          .sort((a, b) => a.tiempoSeg - b.tiempoSeg);
        setRanking(ordenado);

        if (usuarioActual) {
          const pb = ordenado.find(p => (p.usuarioId === usuarioActual.id || p.nombre === usuarioActual.nombre));
          if (pb) setPersonalBest(pb.tiempoSeg);
        }
      }
    } catch (e) {
      console.log("Error cargando ranking drag:", e);
    } finally {
      setCargandoRanking(false);
    }
  };

  useEffect(() => {
    cargarRanking();
  }, [usuarioActual]);

  const toggleAudio = () => {
    const nuevo = !soundMuted;
    setSoundMuted(nuevo);
    DragAudio.setMuted(nuevo);
  };

  // =========================================================================
  // 🕹️ CONTROLES: CAMBIO DE MARCHAS, CARRILES & NITRO
  // =========================================================================
  const cambiarCarril = (delta) => {
    if (gameState !== "racing") return;
    const s = stateRef.current;
    const nuevo = Math.max(0, Math.min(3, s.lane + delta));
    s.lane = nuevo;
  };

  const subirMarcha = () => {
    if (gameState !== "racing") return;
    const s = stateRef.current;
    if (s.gear >= 6) return;

    const rpmActual = s.rpm;
    const [optMin, optMax] = currentCar.optimalShiftRPM;
    let feedback = "";
    let tipo = "";

    if (rpmActual >= optMin && rpmActual <= optMax) {
      feedback = "¡CAMBIO PERFECTO! 🚀";
      tipo = "perfect";
      s.perfectShifts += 1;
      s.nitro = Math.min(100, s.nitro + 12);
      s.speedKmh += 7;
    } else if (rpmActual >= optMin - 1200 && rpmActual < optMin) {
      feedback = "BUEN CAMBIO 👍";
      tipo = "good";
      s.goodShifts += 1;
    } else if (rpmActual < optMin - 1200) {
      feedback = "MUY TEMPRANO ⚠️ (AHOGADO)";
      tipo = "bad";
      s.badShifts += 1;
      s.speedKmh = Math.max(20, s.speedKmh - 5);
    } else {
      feedback = "¡CORTE DE INYECCIÓN! 💥";
      tipo = "bad";
      s.badShifts += 1;
    }

    DragAudio.shiftBlowOff();
    s.gear += 1;
    s.rpm = Math.max(2400, Math.floor(rpmActual * 0.70));

    setShiftFeedback({ text: feedback, type: tipo, id: Date.now() });
    setTimeout(() => {
      setShiftFeedback(prev => (prev?.id ? null : prev));
    }, 1100);
  };

  const bajarMarcha = () => {
    if (gameState !== "racing") return;
    const s = stateRef.current;
    if (s.gear <= 1) return;
    s.gear -= 1;
    s.rpm = Math.min(currentCar.redlineRPM, Math.floor(s.rpm * 1.3));
    DragAudio.shiftBlowOff();
  };

  const activarNitro = (activar) => {
    const s = stateRef.current;
    if (activar && s.nitro > 5 && gameState === "racing") {
      if (!s.nitroActive) DragAudio.nitroSound();
      s.nitroActive = true;
      setHudNitroActive(true);
    } else {
      s.nitroActive = false;
      setHudNitroActive(false);
    }
  };

  const acelerarPreStart = (presionado) => {
    stateRef.current.isRevving = presionado;
  };

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (gameState === "racing") {
        if (key === "arrowleft" || key === "a") {
          cambiarCarril(-1);
          e.preventDefault();
        } else if (key === "arrowright" || key === "d") {
          cambiarCarril(1);
          e.preventDefault();
        } else if (key === "arrowup" || key === "w") {
          subirMarcha();
          e.preventDefault();
        } else if (key === "arrowdown" || key === "s") {
          bajarMarcha();
          e.preventDefault();
        } else if (key === " " || key === "spacebar") {
          activarNitro(true);
          e.preventDefault();
        }
      } else if (gameState === "staging" || gameState === "garage") {
        if (key === " " || key === "arrowup" || key === "w") {
          acelerarPreStart(true);
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === " " || key === "spacebar") {
        activarNitro(false);
      }
      if (key === " " || key === "arrowup" || key === "w") {
        acelerarPreStart(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, currentCar]);

  // =========================================================================
  // 🚦 ARRANQUE EN PISTA CON SEMÁFORO DE DRAG ("CHRISTMAS TREE")
  // =========================================================================
  const iniciarStagingYCarrera = () => {
    const s = stateRef.current;
    s.distanceMetros = 0;
    s.speedKmh = 0;
    s.rpm = 1200;
    s.gear = 1;
    s.lane = 1;
    s.laneProgress = 1;
    s.nitro = 100;
    s.nitroActive = false;
    s.maxSpeedReached = 0;
    s.perfectShifts = 0;
    s.goodShifts = 0;
    s.badShifts = 0;
    s.sceneryOffset = 0;
    s.cameraShake = 0;
    s.crashCooldown = 0;
    s.launchBoost = false;
    setHudNitroActive(false);

    // Tráfico limpio sin badges numéricas
    const trafficCars = [];
    const carColors = ["#ef4444", "#3b82f6", "#eab308", "#10b981", "#f97316", "#a855f7", "#ec4899", "#06b6d4"];
    for (let i = 0; i < 22; i++) {
      const lane = Math.floor(Math.random() * 4);
      const speeds = [85, 95, 105, 115, 125, 135];
      const speedKmh = speeds[Math.floor(Math.random() * speeds.length)];
      trafficCars.push({
        id: i + 1,
        lane,
        distanceY: 75 + i * 44 + Math.random() * 20,
        speedKmh,
        color: carColors[i % carColors.length],
        passed: false
      });
    }
    s.traffic = trafficCars;

    setNearMissCount(0);
    setGameState("staging");
    setStagingLight(1);
    DragAudio.startEngine(currentCar.soundFreq);
    DragAudio.countdownBeep(false);

    setTimeout(() => {
      setStagingLight(2);
      DragAudio.countdownBeep(false);
    }, 800);

    setTimeout(() => {
      setStagingLight(3);
      DragAudio.countdownBeep(false);
    }, 1600);

    setTimeout(() => {
      setStagingLight(4);
      DragAudio.countdownBeep(true);

      const launchRPM = s.rpm;
      if (launchRPM >= 4500 && launchRPM <= 6800) {
        s.speedKmh = 45;
        s.nitro = Math.min(100, s.nitro + 10);
        setShiftFeedback({ text: "¡SALIDA PERFECTA! 🚀", type: "perfect", id: Date.now() });
      } else if (launchRPM > 6800) {
        s.speedKmh = 20;
        setShiftFeedback({ text: "¡PATINAJE DE RUEDAS! 💨", type: "bad", id: Date.now() });
      } else {
        s.speedKmh = 25;
      }

      s.startTime = performance.now();
      setGameState("racing");
    }, 2400);
  };

  const finalizarCarrera = async () => {
    const s = stateRef.current;
    DragAudio.stopEngine();
    DragAudio.victoryFanfare();

    const tiempoSegundos = Number(((performance.now() - s.startTime) / 1000).toFixed(2));
    s.finalTime = tiempoSegundos;
    setHudTime(tiempoSegundos);
    setGameState("finished");

    if (!personalBest || tiempoSegundos < personalBest) {
      setPersonalBest(tiempoSegundos);
    }

    const timeScore = Math.max(100, Math.floor(10000 - (tiempoSegundos * 100) + (s.perfectShifts * 250)));

    if (usuarioActual?.id) {
      try {
        await gobaService.guardarPuntuacionJuego(
          usuarioActual.id,
          "drag-race",
          timeScore,
          {
            tiempoSegundos,
            velocidadMax: Math.round(s.maxSpeedReached),
            cambiosPerfectos: s.perfectShifts,
            buenosCambios: s.goodShifts,
            vehiculo: currentCar.name,
            fecha: new Date().toISOString()
          }
        );
        cargarRanking();
      } catch (e) {
        console.log("Error guardando record:", e);
      }
    }
  };

  // =========================================================================
  // 🏎️ LOOP PRINCIPAL DE CANVAS A 60 FPS
  // =========================================================================
  // Posición del jugador calibrada a 0.63 para dejar espacio a los controles justo abajito
  const PLAYER_PROGRESS = 0.63;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let lastTimestamp = performance.now();

    const loop = (timestamp) => {
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;
      const s = stateRef.current;

      // 1. ESTADO GARAGE O STAGING
      if (gameState === "garage" || gameState === "staging") {
        if (s.isRevving) {
          s.rpm = Math.min(currentCar.redlineRPM, s.rpm + dt * 5500);
          DragAudio.updateRPM(s.rpm, currentCar.redlineRPM);
        } else {
          s.rpm = Math.max(1200, s.rpm - dt * 4200);
          DragAudio.updateRPM(s.rpm, currentCar.redlineRPM);
        }
        setHudRPM(Math.round(s.rpm));
        setHudSpeed(0);
        setHudGear(1);
        setHudDistance(0);
        setHudTime(0);
      }

      // 2. ESTADO RACING
      if (gameState === "racing") {
        const curCfg = GEAR_CONFIG[s.gear - 1];
        const isNitro = s.nitroActive && s.nitro > 0;
        if (isNitro) {
          s.nitro = Math.max(0, s.nitro - (dt * 22) / currentCar.nitroMultiplier);
          if (s.nitro <= 0) {
            s.nitroActive = false;
            setHudNitroActive(false);
          }
        }

        const nitroBoost = isNitro ? 1.40 : 1.0;
        const rpmGrowth = (curCfg.accel * 75 * nitroBoost * currentCar.accelMultiplier) * dt;

        if (s.rpm < currentCar.redlineRPM) {
          s.rpm = Math.min(currentCar.redlineRPM, s.rpm + rpmGrowth);
        } else {
          s.rpm = (currentCar.redlineRPM - 250) + (Math.random() * 200 - 100);
          s.cameraShake = Math.max(s.cameraShake, 3);
        }

        const maxKmhForCar = Math.min(currentCar.topSpeedKmh, curCfg.maxKmh);
        const targetKmh = curCfg.minKmh + ((s.rpm - 1000) / (currentCar.redlineRPM - 1000)) * (maxKmhForCar - curCfg.minKmh);
        s.speedKmh += (targetKmh - s.speedKmh) * Math.min(1, dt * 5);

        if (s.speedKmh > s.maxSpeedReached) {
          s.maxSpeedReached = s.speedKmh;
        }

        const speedMps = (s.speedKmh * 1000) / 3600;
        s.distanceMetros += speedMps * dt;
        s.sceneryOffset += speedMps * dt * 8;

        DragAudio.updateRPM(s.rpm, currentCar.redlineRPM);

        s.laneProgress += (s.lane - s.laneProgress) * Math.min(1, dt * currentCar.handlingAgility);

        if (s.cameraShake > 0) s.cameraShake = Math.max(0, s.cameraShake - dt * 10);
        if (s.crashCooldown > 0) s.crashCooldown = Math.max(0, s.crashCooldown - dt);

        s.traffic.forEach(t => {
          const tSpeedMps = (t.speedKmh * 1000) / 3600;
          t.distanceY -= (speedMps - tSpeedMps) * dt;

          const inSameLane = Math.abs(t.lane - s.laneProgress) < 0.45;
          const distanceDiff = t.distanceY;

          if (inSameLane && distanceDiff >= -2 && distanceDiff <= 4 && s.crashCooldown <= 0) {
            DragAudio.crash();
            s.cameraShake = 14;
            s.crashCooldown = 1.2;
            s.speedKmh = Math.max(40, s.speedKmh * 0.55);
            s.rpm = Math.max(2200, s.rpm * 0.65);
            setShiftFeedback({ text: "¡IMPACTO! -Velocidad 💥", type: "bad", id: Date.now() });
          }

          const isNearLane = Math.abs(t.lane - s.laneProgress) >= 0.5 && Math.abs(t.lane - s.laneProgress) <= 1.1;
          if (isNearLane && distanceDiff >= -2 && distanceDiff <= 2 && !t.passed) {
            t.passed = true;
            DragAudio.nearMiss();
            s.nitro = Math.min(100, s.nitro + 12);
            setNearMissCount(prev => prev + 1);
            setShiftFeedback({ text: "¡ROZANDO! +12% Nitro ⚡", type: "perfect", id: Date.now() });
          }
        });

        s.nitro = Math.min(100, s.nitro + dt * 1.5);

        setHudSpeed(Math.round(s.speedKmh));
        setHudRPM(Math.round(s.rpm));
        setHudGear(s.gear);
        setHudDistance(Math.min(1000, Math.round(s.distanceMetros)));
        setHudNitro(Math.round(s.nitro));
        setHudTime(Number(((performance.now() - s.startTime) / 1000).toFixed(2)));

        if (s.distanceMetros >= 1000) {
          finalizarCarrera();
          return;
        }
      }

      // =========================================================================
      // 🎨 RENDERIZADO DEL ESCENARIO
      // =========================================================================
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      if (s.cameraShake > 0) {
        ctx.translate(
          (Math.random() - 0.5) * s.cameraShake * 2,
          (Math.random() - 0.5) * s.cameraShake * 2
        );
      }

      // Fondo cielo azul noche
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#080c1d");
      skyGrad.addColorStop(0.5, "#0d1330");
      skyGrad.addColorStop(1, "#111827");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Siluetas de edificios laterales
      const drawCitySilhouettes = (leftSide) => {
        const startX = leftSide ? 0 : W * 0.76;
        const width = W * 0.24;
        ctx.fillStyle = "#090d21";
        ctx.fillRect(startX, 0, width, H);

        for (let row = 0; row < 18; row++) {
          const y = ((row * 42 + s.sceneryOffset * 0.3) % H);
          for (let col = 0; col < 3; col++) {
            const x = startX + 10 + col * 18;
            if ((row + col) % 3 === 0) {
              ctx.fillStyle = "#facc15";
              ctx.globalAlpha = 0.5 + Math.sin(row * 2 + timestamp * 0.002) * 0.2;
              ctx.fillRect(x, y, 7, 10);
            }
          }
        }
        ctx.globalAlpha = 1.0;
      };
      drawCitySilhouettes(true);
      drawCitySilhouettes(false);

      // AUTOPISTA CON PERSPECTIVA
      const roadTopLeft = W * 0.24;
      const roadTopRight = W * 0.76;
      const roadBottomLeft = W * 0.16;
      const roadBottomRight = W * 0.84;

      ctx.beginPath();
      ctx.moveTo(roadTopLeft, 0);
      ctx.lineTo(roadTopRight, 0);
      ctx.lineTo(roadBottomRight, H);
      ctx.lineTo(roadBottomLeft, H);
      ctx.closePath();
      const roadGrad = ctx.createLinearGradient(0, 0, 0, H);
      roadGrad.addColorStop(0, "#1e293b");
      roadGrad.addColorStop(1, "#0f172a");
      ctx.fillStyle = roadGrad;
      ctx.fill();

      // Guardarraíles cian
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(roadTopLeft, 0);
      ctx.lineTo(roadBottomLeft, H);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(roadTopRight, 0);
      ctx.lineTo(roadBottomRight, H);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Carriles
      const numLanes = 4;
      for (let l = 1; l < numLanes; l++) {
        const topX = roadTopLeft + ((roadTopRight - roadTopLeft) / numLanes) * l;
        const bottomX = roadBottomLeft + ((roadBottomRight - roadBottomLeft) / numLanes) * l;

        ctx.setLineDash([20, 22]);
        ctx.lineDashOffset = -s.sceneryOffset;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(topX, 0);
        ctx.lineTo(bottomX, H);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const getPositionOnRoad = (laneIndex, progressY) => {
        const topWidth = roadTopRight - roadTopLeft;
        const bottomWidth = roadBottomRight - roadBottomLeft;
        const currentWidth = topWidth + (bottomWidth - topWidth) * progressY;
        const currentLeft = roadTopLeft + (roadBottomLeft - roadTopLeft) * progressY;
        const laneWidth = currentWidth / numLanes;
        const x = currentLeft + laneWidth * (laneIndex + 0.5);
        const y = progressY * H;
        const scale = 0.65 + progressY * 0.45;
        return { x, y, scale, laneWidth };
      };

      // Línea de salida en el asfalto
      if (s.distanceMetros < 50) {
        const startLineProgress = PLAYER_PROGRESS + 0.05 + (s.distanceMetros / 50) * 0.3;
        if (startLineProgress <= 1.1) {
          const y = startLineProgress * H;
          const leftAtY = roadTopLeft + (roadBottomLeft - roadTopLeft) * startLineProgress;
          const widthAtY = (roadTopRight - roadTopLeft) + ((roadBottomRight - roadBottomLeft) - (roadTopRight - roadTopLeft)) * startLineProgress;
          ctx.save();
          const cols = 12;
          const cellW = widthAtY / cols;
          for (let c = 0; c < cols; c++) {
            ctx.fillStyle = c % 2 === 0 ? "#ffffff" : "#0f172a";
            ctx.fillRect(leftAtY + c * cellW, y - 4, cellW, 8);
          }
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2;
          ctx.strokeRect(leftAtY, y - 4, widthAtY, 8);
          ctx.restore();
        }
      }

      // Línea de meta
      if (s.distanceMetros >= 920) {
        const finishProgress = 1 - (1000 - s.distanceMetros) / 80;
        if (finishProgress >= 0 && finishProgress <= 1.2) {
          const y = finishProgress * H;
          ctx.save();
          const cols = 16;
          const leftAtY = roadTopLeft + (roadBottomLeft - roadTopLeft) * finishProgress;
          const widthAtY = (roadTopRight - roadTopLeft) + ((roadBottomRight - roadBottomLeft) - (roadTopRight - roadTopLeft)) * finishProgress;
          const cellW = widthAtY / cols;
          for (let c = 0; c < cols; c++) {
            ctx.fillStyle = c % 2 === 0 ? "#ffffff" : "#000000";
            ctx.fillRect(leftAtY + c * cellW, y - 8, cellW, 16);
          }
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 3;
          ctx.strokeRect(leftAtY, y - 8, widthAtY, 16);
          ctx.restore();
        }
      }

      // DIBUJAR COCHES DE TRÁFICO
      if (gameState === "racing" || gameState === "finished") {
        s.traffic.forEach(t => {
          const screenProgress = PLAYER_PROGRESS - (t.distanceY / 130);
          if (screenProgress >= -0.1 && screenProgress <= 1.1) {
            const { x, y, scale } = getPositionOnRoad(t.lane, screenProgress);

            ctx.save();
            const beamLength = 95 * scale;
            const beamWidth = 42 * scale;
            const headlightGrad = ctx.createLinearGradient(x, y - 10, x, y - beamLength);
            headlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
            headlightGrad.addColorStop(0.5, "rgba(224, 242, 254, 0.2)");
            headlightGrad.addColorStop(1, "rgba(224, 242, 254, 0)");
            ctx.fillStyle = headlightGrad;
            ctx.beginPath();
            ctx.moveTo(x - 8 * scale, y - 8 * scale);
            ctx.lineTo(x - beamWidth / 2, y - beamLength);
            ctx.lineTo(x + beamWidth / 2, y - beamLength);
            ctx.lineTo(x + 8 * scale, y - 8 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scale, scale);

            ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
            ctx.beginPath();
            ctx.roundRect(-15, -24, 30, 48, 6);
            ctx.fill();

            ctx.fillStyle = t.color;
            ctx.beginPath();
            ctx.roundRect(-13, -22, 26, 44, 7);
            ctx.fill();

            ctx.fillStyle = "#1e293b";
            ctx.beginPath();
            ctx.roundRect(-10, -10, 20, 20, 4);
            ctx.fill();

            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(-8, -16, 16, 5);

            ctx.fillStyle = "#64748b";
            ctx.fillRect(-8, 11, 16, 4);

            ctx.fillStyle = "#ef4444";
            ctx.shadowColor = "#ef4444";
            ctx.shadowBlur = 8;
            ctx.fillRect(-11, 20, 6, 2.5);
            ctx.fillRect(5, 20, 6, 2.5);
            ctx.shadowBlur = 0;

            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = 10;
            ctx.fillRect(-11, -22, 5, 2.5);
            ctx.fillRect(6, -22, 5, 2.5);
            ctx.shadowBlur = 0;

            ctx.restore();
          }
        });
      }

      // =========================================================================
      // 🏎️ DIBUJAR COCHE DEL JUGADOR
      // =========================================================================
      const playerPos = getPositionOnRoad(s.laneProgress, PLAYER_PROGRESS);

      ctx.save();
      const pBeamLength = 140;
      const pBeamWidth = 65;
      const pHeadlightGrad = ctx.createLinearGradient(playerPos.x, playerPos.y - 15, playerPos.x, playerPos.y - pBeamLength);
      pHeadlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      pHeadlightGrad.addColorStop(0.4, "rgba(224, 242, 254, 0.35)");
      pHeadlightGrad.addColorStop(1, "rgba(224, 242, 254, 0)");
      ctx.fillStyle = pHeadlightGrad;
      ctx.beginPath();
      ctx.moveTo(playerPos.x - 10, playerPos.y - 12);
      ctx.lineTo(playerPos.x - pBeamWidth / 2, playerPos.y - pBeamLength);
      ctx.lineTo(playerPos.x + pBeamWidth / 2, playerPos.y - pBeamLength);
      ctx.lineTo(playerPos.x + 10, playerPos.y - 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = s.nitroActive ? "#10b981" : currentCar.neonColor;
      ctx.shadowBlur = s.nitroActive ? 28 : 18;
      ctx.fillStyle = s.nitroActive ? "rgba(16, 185, 129, 0.45)" : `${currentCar.neonColor}55`;
      ctx.beginPath();
      ctx.ellipse(playerPos.x, playerPos.y + 2, 22, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (s.nitroActive || (s.isRevving && s.rpm > 6500)) {
        ctx.save();
        ctx.shadowColor = currentCar.flameColor;
        ctx.shadowBlur = 16;
        const flameGrad = ctx.createLinearGradient(playerPos.x, playerPos.y + 24, playerPos.x, playerPos.y + 44);
        flameGrad.addColorStop(0, "#ffffff");
        flameGrad.addColorStop(0.3, currentCar.flameColor);
        flameGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = flameGrad;

        const exhaustOffsets = currentCar.exhaustCount === 4
          ? [-10, -5, 5, 10]
          : currentCar.exhaustCount === 1
          ? [7]
          : [-7, 7];

        exhaustOffsets.forEach(xOff => {
          ctx.beginPath();
          ctx.moveTo(playerPos.x + xOff - 2.5, playerPos.y + 24);
          ctx.lineTo(playerPos.x + xOff + 2.5, playerPos.y + 24);
          ctx.lineTo(playerPos.x + xOff, playerPos.y + 24 + 18 + Math.random() * 8);
          ctx.closePath();
          ctx.fill();
        });
        ctx.restore();
      }

      ctx.save();
      ctx.translate(playerPos.x, playerPos.y);

      const tilt = (s.lane - s.laneProgress) * 0.18;
      ctx.rotate(tilt);

      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.beginPath();
      ctx.roundRect(-16, -26, 32, 52, 7);
      ctx.fill();

      const carGrad = ctx.createLinearGradient(-14, 0, 14, 0);
      carGrad.addColorStop(0, currentCar.primaryColor);
      carGrad.addColorStop(0.5, currentCar.accentColor);
      carGrad.addColorStop(1, currentCar.primaryColor);
      ctx.fillStyle = carGrad;
      ctx.beginPath();
      ctx.roundRect(-14, -24, 28, 48, 8);
      ctx.fill();

      if (currentCar.stripeColor) {
        ctx.fillStyle = currentCar.stripeColor;
        if (currentCar.id === "mustang") {
          ctx.fillRect(-7, -24, 4, 48);
          ctx.fillRect(3, -24, 4, 48);
        } else {
          ctx.fillRect(-2.5, -24, 5, 48);
        }
      }

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.roundRect(-11, -11, 22, 22, 4);
      ctx.fill();

      ctx.fillStyle = "#67e8f9";
      ctx.fillRect(-9, -17, 18, 5);

      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(-9, 12, 18, 4);

      ctx.fillStyle = "#0f172a";
      if (currentCar.spoiler === "high" || currentCar.spoiler === "gtwing") {
        ctx.fillRect(-15, 21, 30, 4);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(-9, 18, 2, 4);
        ctx.fillRect(7, 18, 2, 4);
      } else if (currentCar.spoiler === "hoop") {
        ctx.fillRect(-14, 21, 28, 3.5);
      } else {
        ctx.fillRect(-12, 22, 24, 2.5);
      }

      ctx.fillStyle = "#ef4444";
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 10;
      ctx.fillRect(-12, 22, 5, 2.5);
      ctx.fillRect(7, 22, 5, 2.5);
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 12;
      ctx.fillRect(-12, -24, 6, 3);
      ctx.fillRect(6, -24, 6, 3);
      ctx.shadowBlur = 0;

      ctx.restore();

      if (s.speedKmh > 180) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const sx = W * 0.18 + Math.random() * (W * 0.64);
          const sy = Math.random() * H;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx, sy + 35);
          ctx.stroke();
        }
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, currentCar, GEAR_CONFIG]);

  useEffect(() => {
    return () => {
      DragAudio.stopEngine();
    };
  }, []);

  // Manejador de toque directo en el canvas para mover el carro hacia los lados
  const handleCanvasTouch = (e) => {
    if (gameState !== "racing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    const clickX = touch.clientX - rect.left;
    if (clickX < rect.width * 0.45) {
      cambiarCarril(-1);
    } else if (clickX > rect.width * 0.55) {
      cambiarCarril(1);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-2 select-none text-white pb-6">
      {/* HEADER SUPERIOR */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-2.5 mb-1.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xl animate-pulse">🏎️</span>
          <div>
            <h1 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 leading-tight">
              Midnight Drag: 1 KM
            </h1>
            <div className="text-[10px] text-gray-400">
              {currentCar.name} · {currentCar.nickname}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleAudio}
            className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs hover:bg-slate-700 transition"
            title="Activar/Desactivar sonido"
          >
            {soundMuted ? "🔇" : "🔊"}
          </button>
          <Link
            to="/home"
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold border border-slate-700 transition"
          >
            ← Salir
          </Link>
        </div>
      </div>

      {/* =========================================================================
          🚗 VELOCÍMETRO ESTILO CARRO (UBICADO ARRIBA PARA VISIÓN PERFECTA EN CELULAR)
          ========================================================================= */}
      <div className="mb-1.5">
        <SpeedometerCluster
          speed={hudSpeed}
          rpm={hudRPM}
          gear={hudGear}
          nitro={hudNitro}
          nitroActive={hudNitroActive}
          distance={hudDistance}
          time={hudTime}
          maxRPM={currentCar.redlineRPM}
          optimalRPMMin={currentCar.optimalShiftRPM[0]}
          optimalRPMMax={currentCar.optimalShiftRPM[1]}
          carName={`${currentCar.name} (${currentCar.category})`}
        />
      </div>

      {/* =========================================================================
          🏁 CONTENEDOR DEL JUEGO: EL CARRO Y LOS CONTROLES JUSTO ABAJITO
          ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl bg-slate-950 aspect-[9/16] max-h-[520px] w-full mx-auto touch-none">
        <canvas
          ref={canvasRef}
          width={400}
          height={710}
          className="w-full h-full block cursor-pointer"
          onClick={handleCanvasTouch}
        />

        {/* FEEDBACK FLOTANTE DEL CAMBIO */}
        {shiftFeedback && (
          <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none z-30 animate-bounce">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black shadow-2xl border-2 uppercase tracking-wider ${
              shiftFeedback.type === "perfect"
                ? "bg-emerald-500 border-emerald-300 text-slate-950"
                : shiftFeedback.type === "good"
                ? "bg-sky-500 border-sky-300 text-white"
                : "bg-rose-600 border-rose-300 text-white"
            }`}>
              {shiftFeedback.text}
            </span>
          </div>
        )}

        {/* SEMÁFORO DE DRAG PROFESIONAL ("CHRISTMAS TREE") DURANTE EL STAGING */}
        {gameState === "staging" && (
          <div className="absolute top-3 inset-x-0 flex flex-col items-center pointer-events-none z-40">
            <div className="bg-slate-950/90 border-2 border-yellow-500/60 rounded-2xl px-3 py-2 shadow-[0_0_25px_rgba(234,179,8,0.35)] flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">
                DRAG TREE
              </span>
              
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                  stagingLight >= 1
                    ? "bg-amber-400 border-amber-200 shadow-[0_0_12px_#f59e0b]"
                    : "bg-slate-900 border-slate-700"
                }`} />
                <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                  stagingLight >= 2
                    ? "bg-amber-400 border-amber-200 shadow-[0_0_12px_#f59e0b]"
                    : "bg-slate-900 border-slate-700"
                }`} />
                <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                  stagingLight >= 3
                    ? "bg-amber-400 border-amber-200 shadow-[0_0_12px_#f59e0b]"
                    : "bg-slate-900 border-slate-700"
                }`} />
                <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                  stagingLight === 4
                    ? "bg-emerald-400 border-emerald-100 shadow-[0_0_20px_#10b981] animate-ping"
                    : "bg-slate-900 border-slate-700"
                }`} />
              </div>

              <div className="text-center font-bold text-[11px]">
                {stagingLight === 4 ? (
                  <span className="text-emerald-400 font-black tracking-widest animate-pulse">
                    ¡¡¡YA / GO!!!
                  </span>
                ) : (
                  <span className="text-amber-300">
                    Mantén acelerador abajo
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            🎯 CONTROLES TÁCTILES INTEGRADOS JUSTO ABAJITO DEL CARRO
            (DURANTE LA CARRERA - SIN TENER QUE BAJAR LA VISTA EN EL CELULAR)
            ===================================================================== */}
        {gameState === "racing" && (
          <div className="absolute inset-x-2 bottom-2 z-40 bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-2 shadow-2xl">
            <div className="grid grid-cols-4 gap-1.5">
              {/* 1. Mover a la Izquierda */}
              <button
                onClick={() => cambiarCarril(-1)}
                className="h-16 flex flex-col items-center justify-center bg-slate-900/90 active:bg-cyan-700 border-2 border-slate-700 active:border-cyan-400 rounded-xl active:scale-95 transition select-none shadow-md"
              >
                <span className="text-xl leading-none text-cyan-300">◀</span>
                <span className="text-[10px] font-black text-white mt-1">IZQ</span>
              </button>

              {/* 2. Mover a la Derecha */}
              <button
                onClick={() => cambiarCarril(1)}
                className="h-16 flex flex-col items-center justify-center bg-slate-900/90 active:bg-cyan-700 border-2 border-slate-700 active:border-cyan-400 rounded-xl active:scale-95 transition select-none shadow-md"
              >
                <span className="text-xl leading-none text-cyan-300">▶</span>
                <span className="text-[10px] font-black text-white mt-1">DER</span>
              </button>

              {/* 3. Subir Marcha (Iluminación pulsante verde en zona óptima) */}
              <button
                onClick={subirMarcha}
                className={`h-16 flex flex-col items-center justify-center rounded-xl border-2 active:scale-95 transition select-none shadow-lg ${
                  hudRPM >= currentCar.optimalShiftRPM[0] && hudRPM <= currentCar.optimalShiftRPM[1]
                    ? "bg-gradient-to-b from-emerald-500 to-green-600 border-emerald-200 text-slate-950 animate-pulse ring-4 ring-emerald-400/50"
                    : "bg-gradient-to-b from-sky-600 to-blue-700 border-sky-400/60 text-white"
                }`}
              >
                <span className="text-xl leading-none">⚙️▲</span>
                <span className="text-[9px] font-black leading-tight mt-0.5 uppercase">
                  {hudRPM >= currentCar.optimalShiftRPM[0] && hudRPM <= currentCar.optimalShiftRPM[1] ? "¡CAMBIA!" : "MARCHA"}
                </span>
              </button>

              {/* 4. Nitro (NOS) */}
              <button
                onMouseDown={() => activarNitro(true)}
                onMouseUp={() => activarNitro(false)}
                onTouchStart={(e) => { e.preventDefault(); activarNitro(true); }}
                onTouchEnd={(e) => { e.preventDefault(); activarNitro(false); }}
                className={`h-16 flex flex-col items-center justify-center rounded-xl border-2 active:scale-95 transition select-none shadow-lg ${
                  hudNitro > 0
                    ? "bg-gradient-to-b from-amber-500 to-orange-600 border-yellow-300 text-white shadow-amber-500/40"
                    : "bg-slate-800 border-slate-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span className="text-xl leading-none">⚡</span>
                <span className="text-[10px] font-black leading-tight mt-0.5">NOS</span>
              </button>
            </div>
          </div>
        )}

        {/* CONTROLES DURANTE EL STAGING: BOTÓN DE GAS JUSTO ABAJITO DEL CARRO */}
        {gameState === "staging" && (
          <div className="absolute inset-x-3 bottom-3 z-40">
            <button
              onMouseDown={() => acelerarPreStart(true)}
              onMouseUp={() => acelerarPreStart(false)}
              onTouchStart={(e) => { e.preventDefault(); acelerarPreStart(true); }}
              onTouchEnd={(e) => { e.preventDefault(); acelerarPreStart(false); }}
              className="w-full h-18 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 active:from-amber-600 active:to-orange-600 text-slate-950 font-black text-base rounded-2xl shadow-2xl border-2 border-yellow-200 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <span className="text-2xl animate-bounce">🔥</span>
              <span className="tracking-wide">MANTENER GAS (REV CONTROL)</span>
            </button>
          </div>
        )}

        {/* CONTROLES DURANTE EL GARAJE: SELECCIÓN Y ARRANQUE JUSTO ABAJITO DEL CARRO */}
        {gameState === "garage" && (
          <div className="absolute inset-x-2 bottom-2 z-40 bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-2.5 shadow-2xl">
            {/* Carrusel de vehículos */}
            <div className="flex items-center justify-between mb-1.5">
              <button
                onClick={() => setSelectedCarIndex(prev => (prev === 0 ? CAR_CATALOG.length - 1 : prev - 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-bold active:scale-95 transition"
              >
                ◀
              </button>
              
              <div className="text-center truncate px-2">
                <span className="text-xs font-black text-white block truncate">
                  {currentCar.name}
                </span>
                <span className="text-[9px] text-amber-300 font-bold block truncate">
                  {currentCar.nickname} · {currentCar.category}
                </span>
              </div>

              <button
                onClick={() => setSelectedCarIndex(prev => (prev === CAR_CATALOG.length - 1 ? 0 : prev + 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-bold active:scale-95 transition"
              >
                ▶
              </button>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onMouseDown={() => acelerarPreStart(true)}
                onMouseUp={() => acelerarPreStart(false)}
                onTouchStart={(e) => { e.preventDefault(); acelerarPreStart(true); }}
                onTouchEnd={(e) => { e.preventDefault(); acelerarPreStart(false); }}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl border border-slate-700 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition"
              >
                <span>🔊</span>
                <span>Gas</span>
              </button>
              <button
                onClick={iniciarStagingYCarrera}
                className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black py-2.5 rounded-xl text-xs sm:text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <span>🚦</span>
                <span>¡ARRANCAR 1 KM!</span>
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY DE RESULTADOS AL CRUZAR LA META */}
        {gameState === "finished" && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-50">
            <div className="text-5xl mb-1">🏁</div>
            <h2 className="text-xl font-black text-white mb-0.5">
              ¡CRUZASTE LA META!
            </h2>
            <p className="text-xs text-gray-300 mb-2">1,000 m en {currentCar.name}</p>

            <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-3 mb-3 w-full max-w-xs shadow-inner">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block">TIEMPO FINAL</span>
              <span className="text-3xl font-black text-amber-300 font-mono block my-1">
                {hudTime.toFixed(2)}s
              </span>

              <div className="grid grid-cols-3 gap-1 mt-2 text-left text-xs text-gray-300">
                <div className="bg-slate-800/80 p-1.5 rounded-xl text-center">
                  <span className="text-[8px] text-gray-400 block font-bold">VEL. MÁX</span>
                  <span className="font-bold text-white text-[11px]">{Math.round(stateRef.current.maxSpeedReached)} km/h</span>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded-xl text-center">
                  <span className="text-[8px] text-gray-400 block font-bold">PERFECTOS</span>
                  <span className="font-bold text-emerald-400 text-[11px]">{stateRef.current.perfectShifts}</span>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded-xl text-center">
                  <span className="text-[8px] text-gray-400 block font-bold">ROZADOS</span>
                  <span className="font-bold text-amber-400 text-[11px]">{nearMissCount}⚡</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full max-w-xs">
              <button
                onClick={iniciarStagingYCarrera}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md active:scale-95 transition"
              >
                🔄 Otra Carrera
              </button>
              <button
                onClick={() => setGameState("garage")}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-200 py-2.5 rounded-xl font-bold text-xs border border-slate-700 transition"
              >
                🚗 Garaje
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETALLES DE COMPUESTOS Y CARACTERÍSTICAS DEL VEHÍCULO SELECCIONADO */}
      <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-black text-cyan-300">
            🛠️ Compuestos de {currentCar.name}
          </span>
          <span className="text-[10px] text-gray-400">
            Vel. Máx: {currentCar.topSpeedKmh} km/h
          </span>
        </div>
        <p className="text-[11px] text-gray-300 leading-snug">
          {currentCar.compounds}
        </p>

        {/* Barras de estadísticas */}
        <div className="grid grid-cols-2 gap-2 text-[10px] mt-2">
          <div>
            <div className="flex justify-between text-gray-400 font-bold mb-0.5">
              <span>Aceleración</span>
              <span className="text-cyan-300">{currentCar.specs.accel}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400" style={{ width: `${currentCar.specs.accel}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-gray-400 font-bold mb-0.5">
              <span>Velocidad Máx</span>
              <span className="text-amber-300">{currentCar.specs.topSpeed}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${currentCar.specs.topSpeed}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE POSICIONES / RÉCORDS DE 1 KM */}
      <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🏆</span>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Récords 1 KM (Time Attack)
            </h3>
          </div>
          <button
            onClick={cargarRanking}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold"
          >
            🔄 Actualizar
          </button>
        </div>

        {cargandoRanking ? (
          <div className="text-center py-4 text-gray-400 text-xs animate-pulse">
            Cargando tiempos récord...
          </div>
        ) : ranking.length > 0 ? (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {ranking.slice(0, 10).map((jugador, idx) => (
              <div
                key={jugador.id || idx}
                className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                  idx === 0
                    ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 text-amber-200"
                    : idx === 1
                    ? "bg-gradient-to-r from-slate-400/20 to-slate-500/10 border border-slate-400/40 text-slate-200"
                    : idx === 2
                    ? "bg-gradient-to-r from-amber-700/20 to-orange-700/10 border border-amber-700/40 text-amber-300"
                    : "bg-slate-800/60 border border-slate-700/50 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold w-4 text-center">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                  </span>
                  <div className="truncate max-w-[130px]">
                    <span className="font-semibold block truncate">
                      {jugador.nombre || "Piloto"}
                    </span>
                    {jugador.sessionData?.vehiculo && (
                      <span className="text-[9px] text-gray-400 block truncate">
                        {jugador.sessionData.vehiculo}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-cyan-300">
                  {jugador.tiempoSeg ? `${jugador.tiempoSeg.toFixed(2)}s` : "--"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 text-xs">
            Sé el primero en marcar el récord de 1 KM 🏁
          </div>
        )}
      </div>
    </div>
  );
}
