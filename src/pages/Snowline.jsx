import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

// =========================================================================
// 🎵 WEB AUDIO SYNTHESIZER (MINICLIP RETRO SOUNDS)
// =========================================================================
class SnowAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playPresent() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Arpeggio chime: C6 -> E6 -> G6 -> C7
      const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.36);
      });
    } catch {
      /* ignore audio error */
    }
  }

  playWin() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chords = [
        { f: 523.25, t: 0.0 }, // C5
        { f: 659.25, t: 0.1 }, // E5
        { f: 783.99, t: 0.2 }, // G5
        { f: 1046.5, t: 0.35 }, // C6
        { f: 1318.5, t: 0.5 }, // E6
      ];
      chords.forEach(({ f, t }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, now + t);
        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.25, now + t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.85);
      });
    } catch {
      /* ignore */
    }
  }

  playDraw() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450 + Math.random() * 120, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      /* ignore */
    }
  }

  playJump() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      /* ignore */
    }
  }

  playFail() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.45);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.52);
    } catch {
      /* ignore */
    }
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      /* ignore */
    }
  }
}

const snowAudio = new SnowAudio();

// =========================================================================
// 🏔️ DEFINICIÓN DE LOS 10 NIVELES DE SNOWLINE
// =========================================================================
const NIVELES_SNOWLINE = [
  {
    id: 1,
    nombre: "Nivel 1: Primer Descenso",
    maxInk: 850,
    start: { x: 80, y: 160 },
    flag: { x: 840, y: 500 },
    platforms: [
      { x: 30, y: 175, w: 110, h: 25 }, // Inicio
      { x: 790, y: 515, w: 120, h: 30 }, // Meta
    ],
    presents: [
      { id: 1, x: 360, y: 290, color: "#ef4444", ribbon: "#22c55e" },
      { id: 2, x: 620, y: 410, color: "#3b82f6", ribbon: "#fbbf24" },
    ],
    cliffs: [
      { x: 20, y: 190, w: 130, h: 420 },
      { x: 780, y: 530, w: 140, h: 90 },
    ],
    reindeer: { x: 830, y: 480 },
    pines: [
      { x: 50, y: 140, s: 0.8 },
      { x: 880, y: 480, s: 0.9 },
    ],
  },
  {
    id: 2,
    nombre: "Nivel 2: El Salto de los Pilares",
    maxInk: 1150,
    start: { x: 75, y: 150 },
    flag: { x: 870, y: 420 },
    platforms: [
      { x: 35, y: 165, w: 90, h: 25 },
      { x: 230, y: 340, w: 170, h: 25 },
      { x: 500, y: 460, w: 140, h: 25 },
      { x: 820, y: 435, w: 110, h: 30 },
    ],
    presents: [
      { id: 1, x: 190, y: 260, color: "#10b981", ribbon: "#ef4444" },
      { id: 2, x: 450, y: 390, color: "#06b6d4", ribbon: "#f43f5e" },
      { id: 3, x: 720, y: 340, color: "#ec4899", ribbon: "#3b82f6" },
    ],
    cliffs: [
      { x: 25, y: 180, w: 110, h: 430 },
      { x: 210, y: 355, w: 210, h: 260 },
      { x: 490, y: 475, w: 160, h: 140 },
      { x: 800, y: 450, w: 130, h: 160 },
    ],
    reindeer: { x: 310, y: 305 },
    pines: [
      { x: 50, y: 130, s: 0.7 },
      { x: 250, y: 305, s: 0.9 },
      { x: 570, y: 425, s: 0.8 },
    ],
  },
  {
    id: 3,
    nombre: "Nivel 3: El Cañón del Reno",
    maxInk: 1250,
    start: { x: 80, y: 130 },
    flag: { x: 850, y: 320 },
    platforms: [
      { x: 30, y: 145, w: 100, h: 25 },
      { x: 800, y: 335, w: 120, h: 30 },
    ],
    presents: [
      { id: 1, x: 280, y: 440, color: "#ef4444", ribbon: "#fbbf24" },
      { id: 2, x: 500, y: 460, color: "#8b5cf6", ribbon: "#10b981" },
      { id: 3, x: 690, y: 310, color: "#f59e0b", ribbon: "#3b82f6" },
    ],
    cliffs: [
      { x: 20, y: 160, w: 120, h: 450 },
      { x: 780, y: 350, w: 140, h: 260 },
    ],
    reindeer: { x: 860, y: 285 },
    pines: [
      { x: 55, y: 110, s: 0.8 },
      { x: 810, y: 300, s: 0.85 },
    ],
  },
  {
    id: 4,
    nombre: "Nivel 4: Looping Navideño",
    maxInk: 1400,
    start: { x: 90, y: 120 },
    flag: { x: 840, y: 480 },
    platforms: [
      { x: 40, y: 135, w: 100, h: 25 },
      { x: 370, y: 280, w: 150, h: 25 },
      { x: 790, y: 495, w: 120, h: 30 },
    ],
    presents: [
      { id: 1, x: 260, y: 220, color: "#06b6d4", ribbon: "#f59e0b" },
      { id: 2, x: 570, y: 240, color: "#ec4899", ribbon: "#22c55e" },
      { id: 3, x: 670, y: 400, color: "#eab308", ribbon: "#ef4444" },
    ],
    cliffs: [
      { x: 30, y: 150, w: 120, h: 460 },
      { x: 350, y: 295, w: 190, h: 320 },
      { x: 770, y: 510, w: 140, h: 100 },
    ],
    reindeer: { x: 440, y: 245 },
    pines: [
      { x: 60, y: 100, s: 0.8 },
      { x: 390, y: 245, s: 0.8 },
    ],
  },
  {
    id: 5,
    nombre: "Nivel 5: Islas de Hielo",
    maxInk: 1500,
    start: { x: 80, y: 120 },
    flag: { x: 860, y: 450 },
    platforms: [
      { x: 30, y: 135, w: 90, h: 25 },
      { x: 260, y: 240, w: 90, h: 25 },
      { x: 520, y: 350, w: 90, h: 25 },
      { x: 810, y: 465, w: 110, h: 30 },
    ],
    presents: [
      { id: 1, x: 180, y: 200, color: "#ef4444", ribbon: "#ffffff" },
      { id: 2, x: 420, y: 300, color: "#3b82f6", ribbon: "#fbbf24" },
      { id: 3, x: 680, y: 410, color: "#10b981", ribbon: "#f43f5e" },
      { id: 4, x: 740, y: 280, color: "#a855f7", ribbon: "#38bdf8" },
    ],
    cliffs: [
      { x: 20, y: 150, w: 110, h: 460 },
      { x: 250, y: 255, w: 110, h: 360 },
      { x: 510, y: 365, w: 110, h: 250 },
      { x: 790, y: 480, w: 140, h: 130 },
    ],
    reindeer: { x: 290, y: 205 },
    pines: [
      { x: 50, y: 100, s: 0.8 },
      { x: 550, y: 315, s: 0.75 },
    ],
  },
  {
    id: 6,
    nombre: "Nivel 6: El Gran Lanzamiento",
    maxInk: 1300,
    start: { x: 90, y: 130 },
    flag: { x: 830, y: 200 },
    platforms: [
      { x: 40, y: 145, w: 110, h: 25 },
      { x: 770, y: 215, w: 130, h: 30 },
    ],
    presents: [
      { id: 1, x: 320, y: 460, color: "#f97316", ribbon: "#22c55e" },
      { id: 2, x: 520, y: 480, color: "#3b82f6", ribbon: "#f43f5e" },
      { id: 3, x: 670, y: 320, color: "#ef4444", ribbon: "#fbbf24" },
    ],
    cliffs: [
      { x: 30, y: 160, w: 130, h: 450 },
      { x: 750, y: 230, w: 160, h: 380 },
    ],
    reindeer: { x: 840, y: 165 },
    pines: [
      { x: 60, y: 110, s: 0.8 },
      { x: 780, y: 180, s: 0.85 },
    ],
  },
  {
    id: 7,
    nombre: "Nivel 7: Zig-Zag en la Tormenta",
    maxInk: 1600,
    start: { x: 80, y: 100 },
    flag: { x: 120, y: 520 },
    platforms: [
      { x: 30, y: 115, w: 110, h: 25 },
      { x: 780, y: 280, w: 140, h: 25 },
      { x: 60, y: 535, w: 130, h: 30 },
    ],
    presents: [
      { id: 1, x: 450, y: 190, color: "#14b8a6", ribbon: "#ffffff" },
      { id: 2, x: 830, y: 230, color: "#ec4899", ribbon: "#fbbf24" },
      { id: 3, x: 460, y: 420, color: "#8b5cf6", ribbon: "#22c55e" },
    ],
    cliffs: [
      { x: 20, y: 130, w: 130, h: 300 },
      { x: 760, y: 295, w: 160, h: 320 },
      { x: 50, y: 550, w: 150, h: 60 },
    ],
    reindeer: { x: 840, y: 245 },
    pines: [
      { x: 50, y: 80, s: 0.75 },
      { x: 790, y: 245, s: 0.8 },
    ],
  },
  {
    id: 8,
    nombre: "Nivel 8: Vuelo de Santa",
    maxInk: 1500,
    start: { x: 90, y: 110 },
    flag: { x: 850, y: 380 },
    platforms: [
      { x: 40, y: 125, w: 100, h: 25 },
      { x: 410, y: 480, w: 140, h: 25 },
      { x: 800, y: 395, w: 110, h: 30 },
    ],
    presents: [
      { id: 1, x: 250, y: 310, color: "#ef4444", ribbon: "#22c55e" },
      { id: 2, x: 470, y: 260, color: "#eab308", ribbon: "#3b82f6" },
      { id: 3, x: 670, y: 270, color: "#ec4899", ribbon: "#10b981" },
      { id: 4, x: 730, y: 420, color: "#06b6d4", ribbon: "#f43f5e" },
    ],
    cliffs: [
      { x: 30, y: 140, w: 120, h: 470 },
      { x: 390, y: 495, w: 170, h: 120 },
      { x: 780, y: 410, w: 140, h: 200 },
    ],
    reindeer: { x: 480, y: 445 },
    pines: [{ x: 60, y: 90, s: 0.8 }],
  },
  {
    id: 9,
    nombre: "Nivel 9: Cimas Extremas",
    maxInk: 1700,
    start: { x: 80, y: 120 },
    flag: { x: 860, y: 180 },
    platforms: [
      { x: 30, y: 135, w: 100, h: 25 },
      { x: 280, y: 380, w: 110, h: 25 },
      { x: 570, y: 460, w: 120, h: 25 },
      { x: 800, y: 195, w: 130, h: 30 },
    ],
    presents: [
      { id: 1, x: 200, y: 280, color: "#f43f5e", ribbon: "#ffffff" },
      { id: 2, x: 440, y: 420, color: "#10b981", ribbon: "#fbbf24" },
      { id: 3, x: 680, y: 350, color: "#3b82f6", ribbon: "#f43f5e" },
      { id: 4, x: 740, y: 190, color: "#eab308", ribbon: "#ef4444" },
    ],
    cliffs: [
      { x: 20, y: 150, w: 120, h: 460 },
      { x: 270, y: 395, w: 130, h: 220 },
      { x: 550, y: 475, w: 150, h: 140 },
      { x: 780, y: 210, w: 160, h: 400 },
    ],
    reindeer: { x: 860, y: 145 },
    pines: [
      { x: 50, y: 100, s: 0.8 },
      { x: 310, y: 345, s: 0.8 },
    ],
  },
  {
    id: 10,
    nombre: "Nivel 10: La Gran Nochebuena",
    maxInk: 2000,
    start: { x: 75, y: 100 },
    flag: { x: 870, y: 460 },
    platforms: [
      { x: 25, y: 115, w: 100, h: 25 },
      { x: 220, y: 280, w: 110, h: 25 },
      { x: 470, y: 420, w: 120, h: 25 },
      { x: 680, y: 280, w: 110, h: 25 },
      { x: 820, y: 475, w: 110, h: 30 },
    ],
    presents: [
      { id: 1, x: 170, y: 210, color: "#ef4444", ribbon: "#22c55e" },
      { id: 2, x: 370, y: 370, color: "#eab308", ribbon: "#3b82f6" },
      { id: 3, x: 580, y: 360, color: "#ec4899", ribbon: "#ffffff" },
      { id: 4, x: 730, y: 220, color: "#06b6d4", ribbon: "#fbbf24" },
      { id: 5, x: 790, y: 410, color: "#8b5cf6", ribbon: "#10b981" },
    ],
    cliffs: [
      { x: 15, y: 130, w: 120, h: 480 },
      { x: 210, y: 295, w: 130, h: 320 },
      { x: 450, y: 435, w: 150, h: 180 },
      { x: 670, y: 295, w: 130, h: 320 },
      { x: 800, y: 490, w: 140, h: 120 },
    ],
    reindeer: { x: 870, y: 425 },
    pines: [
      { x: 45, y: 80, s: 0.8 },
      { x: 250, y: 245, s: 0.8 },
      { x: 700, y: 245, s: 0.8 },
    ],
  },
];

// =========================================================================
// 🎅 COMPONENTE PRINCIPAL SNOWLINE
// =========================================================================
export default function Snowline() {
  const navigate = useNavigate();
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual") || "null");

  // Estados de navegación
  const [screen, setScreen] = useState("menu"); // 'menu' | 'levels' | 'help' | 'scores' | 'game'
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [levelStars, setLevelStars] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("snowline_stars") || "{}");
    } catch {
      return {};
    }
  });

  // Estados del juego activo
  const [gameState, setGameState] = useState("draw"); // 'draw' | 'run' | 'won' | 'fail'
  const [soundOn, setSoundOn] = useState(true);
  const [lines, setLines] = useState([]); // Array de trazos [[{x,y}, ...], ...]
  const [currentStroke, setCurrentStroke] = useState([]);
  const [inkUsed, setInkUsed] = useState(0);
  const [presents, setPresents] = useState([]);
  const [presentsCount, setPresentsCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [failReason, setFailReason] = useState("");
  const [rankings, setRankings] = useState([]);
  const [loadingRankings, setLoadingRankings] = useState(false);

  // Referencias canvas y animación
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const isDrawingRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0, active: false });

  // Estado mutable del trineo de Santa para física rápida de 60fps
  const santaRef = useRef({
    x: 80,
    y: 160,
    vx: 0,
    vy: 0,
    angle: 0,
    onGround: false,
    particles: [],
    speed: 0,
  });

  const level = NIVELES_SNOWLINE[currentLevelIndex] || NIVELES_SNOWLINE[0];

  // Iniciar sonido al interactuar
  useEffect(() => {
    snowAudio.enabled = soundOn;
  }, [soundOn]);

  // Cargar rankings desde Firebase
  const cargarRankingsSnowline = async () => {
    try {
      setLoadingRankings(true);
      const data = await gobaService.obtenerRankingJuego("snowline");
      setRankings(data || []);
    } catch (e) {
      console.log("Aviso cargando rankings de Snowline:", e);
    } finally {
      setLoadingRankings(false);
    }
  };

  // Inicializar nivel
  const resetLevel = useCallback((lvlIndex = currentLevelIndex) => {
    const lvl = NIVELES_SNOWLINE[lvlIndex];
    if (!lvl) return;

    setLines([]);
    setCurrentStroke([]);
    setInkUsed(0);
    setGameState("draw");
    setFailReason("");

    // Inicializar regalos
    setPresents(lvl.presents.map(p => ({ ...p, collected: false })));
    setPresentsCount(0);

    // Inicializar Santa
    santaRef.current = {
      x: lvl.start.x,
      y: lvl.start.y,
      vx: 0,
      vy: 0,
      angle: 0,
      onGround: true,
      particles: [],
      speed: 0,
    };
  }, [currentLevelIndex]);

  // Cambiar a nivel específico
  const startLevel = (idx) => {
    snowAudio.init();
    snowAudio.playClick();
    setCurrentLevelIndex(idx);
    resetLevel(idx);
    setScreen("game");
  };

  // Botón Play / Pause en el panel flotante
  const togglePlay = () => {
    snowAudio.init();
    if (gameState === "draw") {
      snowAudio.playClick();
      setGameState("run");
      // Impulso inicial suave hacia adelante al deslizar
      santaRef.current.vx = 2.0;
      santaRef.current.vy = 0.1;
      santaRef.current.speed = 2.0;
    } else {
      // Regresar Santa al punto de inicio sin borrar las líneas
      snowAudio.playClick();
      setGameState("draw");
      const lvl = NIVELES_SNOWLINE[currentLevelIndex];
      santaRef.current = {
        x: lvl.start.x,
        y: lvl.start.y,
        vx: 0,
        vy: 0,
        angle: 0,
        onGround: true,
        particles: [],
        speed: 0,
      };
      // Restaurar regalos para volver a intentar
      setPresents(lvl.presents.map(p => ({ ...p, collected: false })));
      setPresentsCount(0);
      setFailReason("");
    }
  };

  // Undo (deshacer último trazo)
  const handleUndo = () => {
    snowAudio.init();
    snowAudio.playClick();
    if (lines.length === 0) return;
    const last = lines[lines.length - 1];
    let len = 0;
    for (let i = 1; i < last.length; i++) {
      const dx = last[i].x - last[i - 1].x;
      const dy = last[i].y - last[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    setInkUsed(prev => Math.max(0, prev - len));
    setLines(prev => prev.slice(0, -1));
  };

  // Reset/Clear (borrar todas las líneas)
  const handleClear = () => {
    snowAudio.init();
    snowAudio.playClick();
    setLines([]);
    setCurrentStroke([]);
    setInkUsed(0);
    // Reiniciar Santa también
    const lvl = NIVELES_SNOWLINE[currentLevelIndex];
    santaRef.current = {
      x: lvl.start.x,
      y: lvl.start.y,
      vx: 0,
      vy: 0,
      angle: 0,
      onGround: true,
      particles: [],
      speed: 0,
    };
    setPresents(lvl.presents.map(p => ({ ...p, collected: false })));
    setPresentsCount(0);
    setGameState("draw");
    setFailReason("");
  };

  // Cálculo de distancia de punto a segmento de línea con normal upward y tangente forward
  const distToSegment = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) {
      return { d: Math.hypot(px - x1, py - y1), nx: 0, ny: -1, tx: 1, ty: 0, cx: x1, cy: y1 };
    }
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const cx = x1 + t * dx;
    const cy = y1 + t * dy;
    const d = Math.hypot(px - cx, py - cy);
    const len = Math.sqrt(l2);

    // Normal unitaria apuntando hacia arriba (cielo = ny <= 0)
    let nx = -dy / len;
    let ny = dx / len;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }

    // Tangente unitaria siempre orientada hacia adelante en el sentido de la pista (tx >= 0)
    let tx = -ny;
    let ty = nx;

    return { d, nx, ny, tx, ty, cx, cy };
  };

  // =========================================================================
  // 🎮 MOTOR DE FÍSICA Y RENDERIZADO CANVAS (60 FPS)
  // =========================================================================
  useEffect(() => {
    if (screen !== "game") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let isRunning = true;
    const SLED_RADIUS = 13;
    const GRAVITY = 0.20; // Gravedad suave para descenso visualmente agradable
    const MAX_SPEED = 5.8; // Velocidad máxima controlada para que no vaya demasiado rápido

    const gameLoop = () => {
      if (!isRunning) return;

      // 1. ACTUALIZAR FÍSICA SI SANTA ESTÁ CORRIENDO
      if (gameState === "run") {
        const s = santaRef.current;
        const wasOnGround = s.onGround;

        // Si estaba en el aire, aplicar gravedad y resistencia suave
        if (!wasOnGround) {
          s.vy = Math.min(s.vy + GRAVITY, 7.2);
          s.vx *= 0.998;
        }

        // Posición potencial de avance
        let nextX = s.x + s.vx;
        let nextY = s.y + s.vy;

        // Detección de colisión con líneas de nieve dibujadas
        let closestContact = null;
        let minD = 9999;

        lines.forEach(stroke => {
          for (let i = 0; i < stroke.length - 1; i++) {
            const p1 = stroke[i];
            const p2 = stroke[i + 1];
            const info = distToSegment(nextX, nextY, p1.x, p1.y, p2.x, p2.y);
            if (info.d < SLED_RADIUS + 5 && info.d < minD) {
              minD = info.d;
              closestContact = info;
            }
          }
        });

        // Detección con plataformas sólidas del nivel (hielo inicial y meta)
        level.platforms.forEach(plat => {
          if (nextX >= plat.x - 6 && nextX <= plat.x + plat.w + 6) {
            const d = Math.abs(nextY - plat.y);
            if (d < SLED_RADIUS + 5 && nextY <= plat.y + 14) {
              if (d < minD) {
                minD = d;
                closestContact = {
                  d,
                  nx: 0,
                  ny: -1,
                  tx: 1,
                  ty: 0,
                  cx: nextX,
                  cy: plat.y,
                };
              }
            }
          }
        });

        if (closestContact && minD < SLED_RADIUS + 4) {
          const contact = closestContact;

          // Resolver penetración a lo largo de la normal sin bloquear o tirar a Santa hacia atrás
          const penetration = SLED_RADIUS - contact.d;
          s.x = nextX;
          s.y = nextY;
          if (penetration > 0) {
            s.x += contact.nx * penetration;
            s.y += contact.ny * penetration;
          }

          // Transferencia y conservación de inercia
          // Si venía cayendo del aire, convertir la energía cinética total de caída en impulso hacia adelante
          const incomingSpeed = Math.hypot(s.vx, s.vy);

          if (!wasOnGround) {
            // Aterrizaje sobre la nieve: la velocidad entrante (incluida la caída vertical)
            // se redirige a lo largo de la rampa para poder subir cualquier montañita dibujada
            s.speed = Math.max(s.speed || 0, incomingSpeed * 0.94);
            s.speed = Math.max(s.speed, 2.0); // deslizamiento mínimo
            s.onGround = true;
          } else {
            // Ya estaba sobre la nieve: acelerar en bajada (ty > 0) o desacelerar por gravedad en subida (ty < 0)
            const slopeAccel = GRAVITY * contact.ty * 0.82;
            const friction = 0.996; // baja fricción sobre nieve
            s.speed = (s.speed + slopeAccel) * friction;
          }

          // Limitar velocidad máxima para que Santa se desplace de forma suave y controlada
          s.speed = Math.min(s.speed, MAX_SPEED);

          // Si Santa tiene suficiente inercia, sube la montañita con soltura
          if (s.speed > 0.15) {
            s.vx = contact.tx * s.speed;
            s.vy = contact.ty * s.speed;
          } else {
            // Si la pendiente es muy empinada o se agota el impulso, frenado suave
            s.speed = Math.max(-0.8, s.speed);
            s.vx = contact.tx * s.speed;
            s.vy = contact.ty * s.speed;
          }

          // Suavizado del ángulo del trineo siguiendo la curvatura de la nieve
          const targetAngle = Math.atan2(contact.ty, contact.tx);
          s.angle += (targetAngle - s.angle) * 0.22;

          // Partículas de nieve levantadas por el trineo
          if (Math.abs(s.speed) > 1.0 && Math.random() < 0.5) {
            s.particles.push({
              x: s.x - contact.tx * 10,
              y: s.y - contact.ty * 10 + 4,
              vx: -contact.tx * (Math.random() * 1.5) + (Math.random() - 0.5),
              vy: -Math.random() * 1.5 - 0.3,
              alpha: 0.9,
              size: 2 + Math.random() * 2.5,
            });
          }
        } else {
          // En el aire (saltando una montañita o en vuelo libre)
          if (wasOnGround && s.speed > 2.8 && s.vy < -0.8) {
            snowAudio.playJump();
          }
          s.onGround = false;
          s.x = nextX;
          s.y = nextY;
          s.speed = Math.hypot(s.vx, s.vy);

          // Inclinar trineo en la dirección de la trayectoria de vuelo
          const airAngle = Math.atan2(s.vy, Math.max(0.5, s.vx));
          s.angle += (airAngle - s.angle) * 0.12;
        }

        // 2. VERIFICAR COLISIÓN CON REGALOS
        presents.forEach((p, idx) => {
          if (!p.collected) {
            const dist = Math.hypot(s.x - p.x, s.y - p.y);
            if (dist < 28) {
              p.collected = true;
              setPresentsCount(prev => prev + 1);
              snowAudio.playPresent();

              // Partículas doradas de regalo
              for (let i = 0; i < 12; i++) {
                s.particles.push({
                  x: p.x,
                  y: p.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  alpha: 1,
                  size: 3 + Math.random() * 3,
                  color: p.color,
                });
              }
            }
          }
        });

        // 3. VERIFICAR LLEGADA A LA META (BANDERA)
        const distFlag = Math.hypot(s.x - level.flag.x, s.y - level.flag.y);
        if (distFlag < 40) {
          const todosRecogidos = presents.every(p => p.collected);
          if (todosRecogidos) {
            // 🎉 ¡NIVEL COMPLETADO!
            setGameState("won");
            snowAudio.playWin();

            // Calcular puntuación
            const inkBonus = Math.floor((level.maxInk - inkUsed) * 2);
            const presentsPts = presents.length * 1000;
            const ptsLevel = 2000 + presentsPts + Math.max(0, inkBonus);
            setLevelScore(ptsLevel);
            setTotalScore(prev => prev + ptsLevel);

            // Guardar estrellas
            const stars = inkBonus > 400 ? 3 : inkBonus > 150 ? 2 : 1;
            setLevelStars(prev => {
              const updated = { ...prev, [currentLevelIndex]: Math.max(prev[currentLevelIndex] || 0, stars) };
              localStorage.setItem("snowline_stars", JSON.stringify(updated));
              return updated;
            });

            // Guardar en ranking global de Firebase si está logueado
            if (usuarioActual && usuarioActual.id) {
              gobaService.guardarPuntuacionJuego(
                usuarioActual.id,
                "snowline",
                ptsLevel,
                { nivel: currentLevelIndex + 1, estrellas: stars, inkSobra: level.maxInk - inkUsed }
              );
            }
          } else {
            // Llegó a la bandera pero sin todos los regalos
            setGameState("fail");
            setFailReason("¡Debes recoger todos los regalos para ganar!");
            snowAudio.playFail();
          }
        }

        // 4. VERIFICAR SI CAYÓ AL VACÍO
        if (s.y > canvas.height + 60) {
          setGameState("fail");
          setFailReason("¡Santa cayó al vacío! Ajusta las líneas de nieve.");
          snowAudio.playFail();
        }
      }

      // 5. RENDERIZADO VISUAL
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // A) CIELO Y FONDO (GRADIENTE INVERNAL MINICLIP)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#38bdf8");
      skyGrad.addColorStop(0.65, "#bae6fd");
      skyGrad.addColorStop(1, "#e0f2fe");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // B) MONTAÑAS LEJANAS CON NIEVE
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.beginPath();
      ctx.moveTo(0, H * 0.7);
      ctx.lineTo(W * 0.2, H * 0.45);
      ctx.lineTo(W * 0.45, H * 0.65);
      ctx.lineTo(W * 0.75, H * 0.4);
      ctx.lineTo(W, H * 0.6);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // C) ACANTILADOS ROCOSOS CON NIEVE (MINICLIP STYLE)
      level.cliffs.forEach(cliff => {
        // Cuerpo de roca gris
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.roundRect(cliff.x, cliff.y, cliff.w, cliff.h, [8, 8, 0, 0]);
        ctx.fill();

        // Estrías y sombras de roca
        ctx.fillStyle = "#475569";
        for (let i = cliff.y + 20; i < cliff.y + cliff.h; i += 30) {
          ctx.fillRect(cliff.x + 8, i, cliff.w - 16, 4);
        }

        // Capa de nieve superior gruesa
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(cliff.x - 4, cliff.y - 12, cliff.w + 8, 18, 10);
        ctx.fill();

        // Carámbanos de hielo colgando
        ctx.fillStyle = "#e0f2fe";
        for (let ic = cliff.x + 10; ic < cliff.x + cliff.w - 10; ic += 22) {
          ctx.beginPath();
          ctx.moveTo(ic, cliff.y + 6);
          ctx.lineTo(ic + 6, cliff.y + 18);
          ctx.lineTo(ic + 12, cliff.y + 6);
          ctx.closePath();
          ctx.fill();
        }
      });

      // D) PINOS CON NIEVE
      if (level.pines) {
        level.pines.forEach(pine => {
          ctx.save();
          ctx.translate(pine.x, pine.y);
          ctx.scale(pine.s || 1, pine.s || 1);

          // Tronco
          ctx.fillStyle = "#78350f";
          ctx.fillRect(-4, 0, 8, 18);

          // 3 capas de pino
          const layers = [
            { y: 0, w: 26, h: 20 },
            { y: -14, w: 20, h: 18 },
            { y: -26, w: 14, h: 14 },
          ];
          layers.forEach(l => {
            ctx.fillStyle = "#16a34a";
            ctx.beginPath();
            ctx.moveTo(0, l.y - l.h);
            ctx.lineTo(-l.w, l.y);
            ctx.lineTo(l.w, l.y);
            ctx.closePath();
            ctx.fill();

            // Nieve en la rama
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse(0, l.y, l.w * 0.9, 4, 0, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        });
      }

      // E) RENO DECORATIVO MINICLIP
      if (level.reindeer) {
        ctx.save();
        ctx.translate(level.reindeer.x, level.reindeer.y);
        ctx.scale(0.85, 0.85);

        // Cuerpo
        ctx.fillStyle = "#92400e";
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cuello y cabeza
        ctx.beginPath();
        ctx.ellipse(-14, -14, 8, 10, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Patas
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#78350f";
        ctx.beginPath();
        ctx.moveTo(-10, 8); ctx.lineTo(-10, 24);
        ctx.moveTo(-4, 8); ctx.lineTo(-4, 24);
        ctx.moveTo(8, 8); ctx.lineTo(8, 24);
        ctx.moveTo(14, 8); ctx.lineTo(14, 24);
        ctx.stroke();

        // Cornamenta
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#451a03";
        ctx.beginPath();
        ctx.moveTo(-16, -20); ctx.lineTo(-20, -32);
        ctx.lineTo(-26, -34);
        ctx.moveTo(-20, -32); ctx.lineTo(-18, -38);
        ctx.stroke();

        // Nariz roja de reno
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(-22, -14, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // F) REGALOS FLOTANTES
      presents.forEach(p => {
        if (!p.collected) {
          ctx.save();
          // Efecto de flotación suave
          const bob = Math.sin(Date.now() * 0.005 + p.id) * 4;
          ctx.translate(p.x, p.y + bob);

          // Caja
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.roundRect(-14, -14, 28, 28, 4);
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Cinta vertical
          ctx.fillStyle = p.ribbon;
          ctx.fillRect(-3.5, -14, 7, 28);
          // Cinta horizontal
          ctx.fillRect(-14, -3.5, 28, 7);

          // Moño
          ctx.beginPath();
          ctx.arc(-4, -16, 5, 0, Math.PI * 2);
          ctx.arc(4, -16, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      // G) BANDERA DE META (CHECKERED FLAG)
      ctx.save();
      ctx.translate(level.flag.x, level.flag.y);

      // Asta
      ctx.fillStyle = "#334155";
      ctx.fillRect(-2, -36, 4, 38);

      // Bandera a cuadros ondeando
      const wave = Math.sin(Date.now() * 0.008) * 3;
      const cols = 4;
      const rows = 3;
      const cellW = 7;
      const cellH = 7;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? "#ffffff" : "#0f172a";
          ctx.fillRect(c * cellW + wave * (c / cols), -36 + r * cellH, cellW, cellH);
        }
      }

      // Base nevada de la bandera
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(0, 2, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // H) DIBUJAR LÍNEAS DE NIEVE DIBUJADAS POR EL JUGADOR
      const drawStroke = (pts) => {
        if (!pts || pts.length < 2) return;

        // Borde exterior suave celeste de nieve
        ctx.strokeStyle = "#bae6fd";
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();

        // Núcleo blanco brillante de nieve compacta
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
      };

      lines.forEach(stroke => drawStroke(stroke));
      if (currentStroke.length > 1) {
        drawStroke(currentStroke);
      }

      // I) PARTÍCULAS DE NIEVE Y POLVO
      const s = santaRef.current;
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.025;
        if (pt.alpha <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = pt.color
          ? pt.color
          : `rgba(255, 255, 255, ${pt.alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // J) RENDERIZAR A SANTA CLAUS EN SU TRINEO
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      // Trineo de madera tradicional
      ctx.fillStyle = "#854d0e";
      ctx.beginPath();
      // Base curva del trineo
      ctx.roundRect(-20, 4, 38, 5, 2);
      ctx.fill();
      // Curva frontal levantada del trineo
      ctx.beginPath();
      ctx.arc(18, 0, 6, Math.PI * 0.5, Math.PI * 1.5, true);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#713f12";
      ctx.stroke();

      // Soportes del trineo
      ctx.fillStyle = "#a16207";
      ctx.fillRect(-12, -2, 4, 7);
      ctx.fillRect(8, -2, 4, 7);

      // Asiento
      ctx.fillStyle = "#b91c1c";
      ctx.fillRect(-16, -6, 26, 4);

      // Santa Claus:
      // Cuerpo rojo
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.ellipse(-4, -14, 11, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cinturón negro con hebilla dorada
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-13, -13, 20, 3.5);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(-5, -14, 6, 5);

      // Cabeza
      ctx.fillStyle = "#fed7aa";
      ctx.beginPath();
      ctx.arc(2, -25, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // Barba blanca esponjosa
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(4, -22, 6, 0, Math.PI);
      ctx.arc(-2, -21, 5, 0, Math.PI);
      ctx.fill();

      // Bigote
      ctx.beginPath();
      ctx.ellipse(3, -24, 4, 2, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Ojo y nariz
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(4, -26, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f87171";
      ctx.beginPath();
      ctx.arc(6, -24, 2, 0, Math.PI * 2);
      ctx.fill();

      // Gorro de Santa
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(-4, -29);
      ctx.lineTo(6, -29);
      ctx.lineTo(-14, -36);
      ctx.closePath();
      ctx.fill();
      // Ribete blanco del gorro
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(-5, -31, 12, 3.5, 2);
      ctx.fill();
      // Pompón
      ctx.beginPath();
      ctx.arc(-14, -36, 3, 0, Math.PI * 2);
      ctx.fill();

      // Guantes verdes
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.arc(6, -11, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // K) DIBUJAR LÁPIZ DE NIEVE EN EL CURSOR SI ESTÁ DIBUJANDO
      if (mousePosRef.current.active && gameState === "draw") {
        const mx = mousePosRef.current.x;
        const my = mousePosRef.current.y;

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(-0.4);

        // Punta del lápiz
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-6, -14);
        ctx.lineTo(6, -14);
        ctx.closePath();
        ctx.fill();

        // Cuerpo cilíndrico del lápiz de nieve
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(-6, -42, 12, 28);

        // Copo de nieve en el lápiz
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("❄", 0, -24);

        // Extremo superior
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(0, -42, 6, Math.PI, 0);
        ctx.fill();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [screen, gameState, lines, currentStroke, presents, currentLevelIndex, inkUsed, level]);

  // =========================================================================
  // ✍️ MANEJO DE RATÓN Y TOQUE PARA DIBUJAR NIEVE
  // =========================================================================
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e) => {
    if (gameState !== "draw") return;
    snowAudio.init();
    isDrawingRef.current = true;
    const pt = getCanvasCoords(e);
    mousePosRef.current = { x: pt.x, y: pt.y, active: true };
    setCurrentStroke([pt]);
  };

  const handlePointerMove = (e) => {
    const pt = getCanvasCoords(e);
    mousePosRef.current = { x: pt.x, y: pt.y, active: true };

    if (!isDrawingRef.current || gameState !== "draw") return;

    setCurrentStroke(prev => {
      if (prev.length === 0) return [pt];
      const last = prev[prev.length - 1];
      const dist = Math.hypot(pt.x - last.x, pt.y - last.y);

      // Solo agregar si se movió al menos 4px
      if (dist >= 4) {
        // Verificar si queda tinta
        if (inkUsed + dist > level.maxInk) {
          // Sin tinta restante
          return prev;
        }
        setInkUsed(used => used + dist);
        snowAudio.playDraw();
        return [...prev, pt];
      }
      return prev;
    });
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    mousePosRef.current.active = false;

    if (currentStroke.length > 1) {
      setLines(prev => [...prev, currentStroke]);
    }
    setCurrentStroke([]);
  };

  const handlePointerLeave = () => {
    mousePosRef.current.active = false;
    handlePointerUp();
  };

  // Porcentaje de tinta restante para el lápiz
  const inkPercentage = Math.max(0, Math.min(100, Math.round(((level.maxInk - inkUsed) / level.maxInk) * 100)));

  // =========================================================================
  // 🎨 PANTALLAS: MENÚ PRINCIPAL (MINICLIP REPLICA)
  // =========================================================================
  if (screen === "menu") {
    return (
      <div className="relative min-h-screen bg-slate-900 flex items-center justify-center p-4 select-none">
        {/* Marco de juego estilo Miniclip */}
        <div className="relative w-full max-w-4xl bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700 aspect-[4/3] flex flex-col justify-between">
          {/* Fondo original de Snowline */}
          <img
            src="/assets/aistudio/image_93200d76.png"
            alt="Miniclip Snowline Title"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Botón de Sonido arriba a la derecha */}
          <button
            onClick={() => {
              snowAudio.init();
              setSoundOn(s => !s);
            }}
            className="absolute top-6 right-8 w-12 h-12 rounded-full bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-bold text-2xl shadow-lg border-2 border-yellow-200 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-20"
            title="Activar/Desactivar sonido"
          >
            {soundOn ? "🔊" : "🔇"}
          </button>

          {/* Postes de madera interactivos: START, HELP, SCORES */}
          <div className="absolute right-10 md:right-16 top-1/2 -translate-y-8 flex flex-col gap-4 z-20 w-52 md:w-64">
            <button
              onClick={() => {
                snowAudio.init();
                snowAudio.playClick();
                setScreen("levels");
              }}
              className="group relative bg-[#fef08a] hover:bg-[#fde047] text-[#78350f] font-black text-2xl md:text-3xl py-3.5 px-6 rounded-xl border-4 border-[#854d0e] shadow-2xl transform hover:scale-105 active:scale-95 transition-all text-center tracking-wider"
              style={{
                clipPath: "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)",
              }}
            >
              <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">START ▶</span>
            </button>

            <button
              onClick={() => {
                snowAudio.init();
                snowAudio.playClick();
                setScreen("help");
              }}
              className="group relative bg-[#fef08a] hover:bg-[#fde047] text-[#78350f] font-black text-2xl md:text-3xl py-3.5 px-6 rounded-xl border-4 border-[#854d0e] shadow-2xl transform hover:scale-105 active:scale-95 transition-all text-center tracking-wider"
              style={{
                clipPath: "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)",
              }}
            >
              <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">HELP ❓</span>
            </button>

            <button
              onClick={() => {
                snowAudio.init();
                snowAudio.playClick();
                cargarRankingsSnowline();
                setScreen("scores");
              }}
              className="group relative bg-[#fef08a] hover:bg-[#fde047] text-[#78350f] font-black text-2xl md:text-3xl py-3.5 px-6 rounded-xl border-4 border-[#854d0e] shadow-2xl transform hover:scale-105 active:scale-95 transition-all text-center tracking-wider"
              style={{
                clipPath: "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)",
              }}
            >
              <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">SCORES 🏆</span>
            </button>
          </div>

          {/* Barra inferior de navegación de vuelta a Arcade */}
          <div className="absolute bottom-4 left-6 z-20 flex items-center gap-3">
            <Link
              to="/home"
              className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white font-bold text-xs py-2 px-4 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span>🏠</span>
              <span>Arcade Hub</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 📖 PANTALLA DE AYUDA (HELP)
  // =========================================================================
  if (screen === "help") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-b from-sky-100 to-sky-200 border-4 border-sky-400 rounded-3xl p-8 max-w-lg w-full text-slate-800 shadow-2xl relative">
          <div className="text-4xl text-center mb-2">❄️✏️🎅</div>
          <h2 className="text-3xl font-black text-center text-sky-900 mb-4 tracking-tight">
            ¿Cómo Jugar Snowline?
          </h2>

          <div className="space-y-3 text-sm font-medium leading-relaxed mb-6">
            <p className="flex items-start gap-2.5">
              <span className="text-xl">1️⃣</span>
              <span><strong>Dibuja rampas de nieve:</strong> Haz clic o desliza el dedo en la pantalla para trazar caminos blancos de nieve.</span>
            </p>
            <p className="flex items-start gap-2.5">
              <span className="text-xl">2️⃣</span>
              <span><strong>Cuida tu lápiz de nieve:</strong> El lápiz arriba a la derecha muestra tu nieve disponible. Si se agota, no podrás dibujar más.</span>
            </p>
            <p className="flex items-start gap-2.5">
              <span className="text-xl">3️⃣</span>
              <span><strong>Recoge todos los regalos:</strong> Santa debe recoger cada paquete navideño flotante antes de cruzar la meta.</span>
            </p>
            <p className="flex items-start gap-2.5">
              <span className="text-xl">4️⃣</span>
              <span><strong>Presiona Play ▶️:</strong> Santa comenzará a deslizarse con física real. Acelera en las bajadas y lánzate por rampas.</span>
            </p>
            <p className="flex items-start gap-2.5">
              <span className="text-xl">5️⃣</span>
              <span><strong>Llega a la bandera 🏁:</strong> Llega a salvo a la meta con todos los regalos para pasar de nivel y conseguir 3 estrellas.</span>
            </p>
          </div>

          <button
            onClick={() => {
              snowAudio.init();
              snowAudio.playClick();
              setScreen("menu");
            }}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg py-3 rounded-2xl shadow-lg transition-transform hover:scale-105"
          >
            ¡Entendido, a jugar!
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 🏆 PANTALLA DE PUNTUACIONES (SCORES)
  // =========================================================================
  if (screen === "scores") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-b from-sky-50 to-indigo-100 border-4 border-sky-400 rounded-3xl p-8 max-w-lg w-full text-slate-800 shadow-2xl relative">
          <div className="text-4xl text-center mb-2">🏆❄️</div>
          <h2 className="text-3xl font-black text-center text-sky-950 mb-2">
            Récords de Snowline
          </h2>
          <p className="text-center text-xs text-sky-700 mb-6 font-medium">
            Los mejores pilotos de trineo del Polo Norte
          </p>

          <div className="space-y-2 mb-6 max-h-72 overflow-y-auto pr-1">
            {loadingRankings ? (
              <div className="text-center py-8 text-sky-600 font-bold">Cargando récords...</div>
            ) : rankings.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                Aún no hay puntuaciones registradas en Firebase. ¡Sé el primero en completar los niveles!
              </div>
            ) : (
              rankings.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-sky-200 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-sky-500 text-white font-black text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-bold text-sm text-slate-800">{r.nombre}</span>
                  </div>
                  <span className="font-black text-sky-600">{r.mejorPuntuacion || r.puntuacion} pts</span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => {
              snowAudio.init();
              snowAudio.playClick();
              setScreen("menu");
            }}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black text-base py-3 rounded-2xl shadow-lg transition-transform hover:scale-105"
          >
            ← Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 🗺️ PANTALLA DE SELECCIÓN DE NIVELES (LEVEL SELECT)
  // =========================================================================
  if (screen === "levels") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-b from-sky-100 to-sky-200 border-4 border-sky-400 rounded-3xl p-8 max-w-2xl w-full text-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-sky-950">Selecciona Nivel</h2>
              <p className="text-xs text-sky-700 font-medium">10 Niveles con física de Miniclip Snowline</p>
            </div>
            <button
              onClick={() => {
                snowAudio.init();
                snowAudio.playClick();
                setScreen("menu");
              }}
              className="bg-white/80 hover:bg-white text-slate-700 font-bold text-xs py-2 px-4 rounded-xl border border-sky-300 shadow"
            >
              ← Menú
            </button>
          </div>

          {/* Grilla de 10 niveles */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-6">
            {NIVELES_SNOWLINE.map((lvl, idx) => {
              const stars = levelStars[idx] || 0;
              return (
                <button
                  key={lvl.id}
                  onClick={() => startLevel(idx)}
                  className="p-4 rounded-2xl bg-white hover:bg-yellow-50 border-2 border-sky-300 hover:border-yellow-400 shadow-md hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-between text-center group"
                >
                  <span className="text-2xl mb-1 group-hover:scale-125 transition-transform">
                    {idx === 0 ? "🎿" : idx === 9 ? "👑" : "❄️"}
                  </span>
                  <span className="font-black text-lg text-slate-800">
                    Nivel {lvl.id}
                  </span>
                  <div className="flex gap-0.5 text-xs mt-1">
                    {[1, 2, 3].map(s => (
                      <span key={s} className={s <= stars ? "text-amber-400" : "text-slate-300"}>
                        ★
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => startLevel(0)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black text-lg py-3.5 rounded-2xl shadow-lg transition-transform hover:scale-105"
          >
            Comenzar Campaña (Nivel 1) ▶
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 🕹️ PANTALLA PRINCIPAL DE JUEGO (GAMEPLAY EXACTO DE MINICLIP)
  // =========================================================================
  return (
    <div className="w-full bg-slate-950 text-white flex flex-col items-center justify-start p-1 sm:p-4 pb-12 select-none">
      
      {/* Contenedor responsivo del canvas */}
      <div className="relative w-full max-w-5xl bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-slate-700 flex flex-col">
        
        {/* =========================================================================
            📱 BARRA SUPERIOR EXCLUSIVA PARA MÓVIL (EVITA COLISIONES Y SOLAPAMIENTOS)
            ========================================================================= */}
        <div className="md:hidden flex items-center justify-between p-2 bg-gradient-to-r from-slate-950 via-sky-950 to-slate-950 border-b border-sky-400/20 gap-2 z-20">
          {/* Nivel y regalos */}
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => {
                snowAudio.init();
                snowAudio.playClick();
                setScreen("levels");
              }}
              className="w-8 h-8 rounded-lg bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow"
              title="Ver niveles"
            >
              📋
            </button>
            <div className="truncate">
              <div className="text-[11px] font-black text-white truncate">
                {level.nombre.replace(/^Nivel\s*\d+:\s*/i, "") || `Nivel ${level.id}`}
              </div>
              <div className="text-[10px] text-amber-300 font-bold leading-none">
                🎁 {presentsCount}/{presents.length}
              </div>
            </div>
          </div>

          {/* Controles centrales compactos con hitboxes perfectamente iguales */}
          <div className="flex items-center gap-1.5 shrink-0 bg-white/10 px-1.5 py-1 rounded-xl border border-white/15">
            <button
              onClick={togglePlay}
              title={gameState === "run" ? "Pausar" : "Lanzar trineo"}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow transition-transform active:scale-95 ${
                gameState === "run"
                  ? "bg-amber-500 text-white"
                  : "bg-emerald-500 text-white"
              }`}
            >
              {gameState === "run" ? "⏸️" : "▶️"}
            </button>

            <button
              onClick={handleUndo}
              disabled={lines.length === 0 || gameState === "run"}
              title="Deshacer trazo"
              className="w-8 h-8 rounded-lg bg-blue-600 disabled:opacity-40 text-white flex items-center justify-center text-sm font-bold active:scale-95 shadow"
            >
              ↩️
            </button>

            <button
              onClick={handleClear}
              disabled={lines.length === 0}
              title="Borrar todo"
              className="w-8 h-8 rounded-lg bg-red-600 disabled:opacity-40 text-white flex items-center justify-center text-sm font-bold active:scale-95 shadow"
            >
              ✖️
            </button>

            <button
              onClick={() => {
                snowAudio.init();
                setSoundOn(s => !s);
              }}
              title="Sonido"
              className="w-8 h-8 rounded-lg bg-yellow-400 text-yellow-950 flex items-center justify-center text-sm font-bold active:scale-95 shadow"
            >
              {soundOn ? "🔊" : "🔇"}
            </button>
          </div>

          {/* Medidor de nieve compacto */}
          <div className="flex items-center gap-1 shrink-0 bg-sky-950/90 px-2 py-1 rounded-xl border border-sky-400/40 text-right shadow-inner">
            <span className="text-xs">❄️</span>
            <span className={`text-xs font-black ${inkPercentage < 20 ? "text-red-400 animate-pulse" : "text-sky-200"}`}>
              {inkPercentage}%
            </span>
          </div>
        </div>

        {/* =========================================================================
            🖥️ HUD CLÁSICO FLOTANTE DE TÉMPANO (SOLO VISIBLE EN TABLETS Y PC - md+)
            ========================================================================= */}
        {/* PANEL FLOTANTE SUPERIOR ESTILO TÉMPANO DE HIELO MINICLIP */}
        <div className="hidden md:flex absolute top-3 left-1/2 -translate-x-1/2 z-30 items-center gap-2 bg-gradient-to-b from-white/95 to-sky-100/90 backdrop-blur-md px-5 py-2 rounded-2xl border-2 border-sky-300 shadow-xl"
             style={{
               clipPath: "polygon(5% 0%, 95% 0%, 100% 85%, 90% 100%, 10% 100%, 0% 85%)",
             }}>
          
          {/* Botón PLAY / PAUSE */}
          <button
            onClick={togglePlay}
            title={gameState === "run" ? "Pausar y reajustar trineo" : "Lanzar a Santa por la nieve"}
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold shadow-md transition-transform hover:scale-110 active:scale-95 ${
              gameState === "run"
                ? "bg-amber-500 hover:bg-amber-400 text-white"
                : "bg-emerald-500 hover:bg-emerald-400 text-white"
            }`}
          >
            {gameState === "run" ? "⏸️" : "▶️"}
          </button>

          {/* Botón UNDO (Deshacer trazo) */}
          <button
            onClick={handleUndo}
            disabled={lines.length === 0 || gameState === "run"}
            title="Deshacer último trazo de nieve"
            className="w-11 h-11 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:bg-slate-300 disabled:opacity-50 text-white flex items-center justify-center text-xl font-bold shadow-md transition-transform hover:scale-110 active:scale-95"
          >
            ↩️
          </button>

          {/* Botón CLEAR (Borrar todo) */}
          <button
            onClick={handleClear}
            disabled={lines.length === 0}
            title="Borrar todas las líneas de nieve"
            className="w-11 h-11 rounded-xl bg-red-500 hover:bg-red-400 disabled:bg-slate-300 disabled:opacity-50 text-white flex items-center justify-center text-xl font-bold shadow-md transition-transform hover:scale-110 active:scale-95"
          >
            ✖️
          </button>

          {/* Botón AUDIO */}
          <button
            onClick={() => {
              snowAudio.init();
              setSoundOn(s => !s);
            }}
            title="Activar/Desactivar sonido"
            className="w-11 h-11 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-yellow-950 flex items-center justify-center text-xl font-bold shadow-md transition-transform hover:scale-110 active:scale-95"
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
        </div>

        {/* MEDIDOR DE TINTA DE NIEVE (LÁPIZ DE NIEVE EN LA ESQUINA SUPERIOR DERECHA) */}
        <div className="hidden md:flex absolute top-4 right-4 z-30 items-center gap-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 shadow-lg">
          {/* Lápiz vertical medidor */}
          <div className="relative w-8 h-20 bg-slate-800 rounded-full border-2 border-white/50 overflow-hidden flex flex-col justify-end p-0.5 shadow-inner">
            <div
              className="w-full bg-gradient-to-t from-sky-400 to-white rounded-full transition-all duration-150"
              style={{ height: `${inkPercentage}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-900 pointer-events-none drop-shadow">
              ❄
            </span>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-200">Nieve</div>
            <div className={`text-base font-black ${inkPercentage < 20 ? "text-red-400 animate-pulse" : "text-white"}`}>
              {inkPercentage}%
            </div>
          </div>
        </div>

        {/* INFORMACIÓN SUPERIOR IZQUIERDA: NIVEL Y REGALOS */}
        <div className="hidden md:flex absolute top-4 left-4 z-30 items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-lg">
          <button
            onClick={() => {
              snowAudio.init();
              snowAudio.playClick();
              setScreen("levels");
            }}
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold"
            title="Ver niveles"
          >
            📋
          </button>

          <div>
            <div className="text-xs font-black text-white">{level.nombre}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-bold mt-0.5">
              <span>🎁 Regalos:</span>
              <span>{presentsCount} / {presents.length}</span>
            </div>
          </div>
        </div>

        {/* CANVAS DE JUEGO */}
        <canvas
          ref={canvasRef}
          width={960}
          height={620}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerLeave}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="w-full h-auto cursor-crosshair touch-none"
        />

        {/* MODAL DE VICTORIA (LEVEL WON) */}
        {gameState === "won" && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-sky-50 to-emerald-50 border-4 border-emerald-400 rounded-3xl p-8 max-w-md w-full text-center text-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="text-5xl mb-2">🎉🎅🏁</div>
              <h3 className="text-3xl font-black text-emerald-800 mb-1">¡Nivel Completado!</h3>
              <p className="text-xs text-slate-600 mb-4 font-semibold">
                Santa recogió todos los regalos y llegó a la meta con éxito
              </p>

              {/* Puntuación y desglose */}
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 mb-5 shadow-inner">
                <div className="text-3xl font-black text-emerald-600 mb-2">
                  +{levelScore} pts
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                  <div>🎁 Regalos: <strong>{presents.length * 1000} pts</strong></div>
                  <div>❄️ Nieve sobrante: <strong>+{Math.floor((level.maxInk - inkUsed) * 2)} pts</strong></div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={() => resetLevel(currentLevelIndex)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-all"
                >
                  🔄 Reintentar
                </button>
                {currentLevelIndex < NIVELES_SNOWLINE.length - 1 ? (
                  <button
                    onClick={() => startLevel(currentLevelIndex + 1)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
                  >
                    Siguiente ▶
                  </button>
                ) : (
                  <button
                    onClick={() => setScreen("scores")}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-black py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
                  >
                    Ver Récords 🏆
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICACIÓN / MODAL DE FALLO */}
        {gameState === "fail" && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-sky-50 to-red-50 border-4 border-red-400 rounded-3xl p-8 max-w-sm w-full text-center text-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="text-5xl mb-2">💥🎿</div>
              <h3 className="text-2xl font-black text-red-700 mb-1">¡Intenta de Nuevo!</h3>
              <p className="text-xs text-slate-600 mb-5 font-medium">
                {failReason || "Santa no pudo llegar a la meta. Modifica o agrega nuevas líneas de nieve."}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Solo reiniciar la posición de Santa para que el jugador ajuste sus líneas
                    snowAudio.init();
                    snowAudio.playClick();
                    setGameState("draw");
                    const lvl = NIVELES_SNOWLINE[currentLevelIndex];
                    santaRef.current = {
                      x: lvl.start.x,
                      y: lvl.start.y,
                      vx: 0,
                      vy: 0,
                      angle: 0,
                      onGround: true,
                      particles: [],
                      speed: 0,
                    };
                    setPresents(lvl.presents.map(p => ({ ...p, collected: false })));
                    setPresentsCount(0);
                    setFailReason("");
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  ✏️ Ajustar Líneas
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-all"
                >
                  Borrar Todo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BARRA INFERIOR DE ACCESOS RÁPIDOS Y AYUDA */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">💡 Consejo:</span>
            <span>Dibuja bajadas suaves para ganar velocidad y rampas ascendentes para saltar precipicios.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                snowAudio.init();
                snowAudio.playClick();
                setScreen("help");
              }}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>❓</span>
              <span>Ayuda</span>
            </button>
            <span>·</span>
            <button
              onClick={() => {
                snowAudio.init();
                snowAudio.playClick();
                setScreen("menu");
              }}
              className="hover:text-white transition-colors"
            >
              Menú Principal
            </button>
            <span>·</span>
            <Link to="/home" className="hover:text-white transition-colors">
              Salir al Hub
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
