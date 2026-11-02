// src/components/juegos/SantaSnake.jsx
import React, { useState, useEffect, useRef } from "react";

// Web Audio Synthesizer for Snake Game
const SnakeAudio = (() => {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  };

  return {
    eat: () => {
      try {
        const c = getCtx();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, c.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, c.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.11);
      } catch (e) {}
    },
    specialEat: () => {
      try {
        const c = getCtx();
        if (!c) return;
        [523, 659, 784, 1046].forEach((f, i) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, c.currentTime + i * 0.05);
          gain.gain.setValueAtTime(0.18, c.currentTime + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.05 + 0.12);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(c.currentTime + i * 0.05);
          osc.stop(c.currentTime + i * 0.05 + 0.13);
        });
      } catch (e) {}
    },
    die: () => {
      try {
        const c = getCtx();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.35);
        gain.gain.setValueAtTime(0.25, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.36);
      } catch (e) {}
    }
  };
})();

export default function SantaSnake({ volverASeleccion, guardarEnRanking }) {
  const GRID_SIZE = 20;
  const [snake, setSnake] = useState([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 10, type: 'gift', emoji: '🎁', points: 10 });
  const [specialFood, setSpecialFood] = useState(null); // { x, y, emoji: '⭐', points: 30, timer }
  const [direction, setDirection] = useState('RIGHT');
  const [puntuacion, setPuntuacion] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState([]); // { id, text, x, y }

  const nextDirectionRef = useRef('RIGHT');
  const touchStartRef = useRef(null);

  const getRandomPos = (occupiedCells) => {
    let pos;
    let attempts = 0;
    while (attempts < 200) {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      const occupied = occupiedCells.some(c => c.x === pos.x && c.y === pos.y);
      if (!occupied) return pos;
      attempts++;
    }
    return { x: 5, y: 5 };
  };

  const spawnFood = (currentSnake) => {
    const pos = getRandomPos(currentSnake);
    const types = [
      { type: 'gift', emoji: '🎁', points: 10 },
      { type: 'candy', emoji: '🍬', points: 15 },
      { type: 'bell', emoji: '🔔', points: 20 }
    ];
    const picked = types[Math.floor(Math.random() * types.length)];
    setFood({ ...pos, ...picked });
  };

  const triggerFloat = (text, x, y) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, x, y }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, 800);
  };

  const iniciarJuego = () => {
    const initialSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    setSnake(initialSnake);
    setDirection('RIGHT');
    nextDirectionRef.current = 'RIGHT';
    setPuntuacion(0);
    setGameOver(false);
    setGameActive(true);
    setSpecialFood(null);
    spawnFood(initialSnake);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!gameActive || gameOver) return;

    const manejarTecla = (e) => {
      const key = e.key.toLowerCase();
      const cur = nextDirectionRef.current;
      if ((key === 'arrowup' || key === 'w') && cur !== 'DOWN') {
        nextDirectionRef.current = 'UP';
        setDirection('UP');
        e.preventDefault();
      } else if ((key === 'arrowdown' || key === 's') && cur !== 'UP') {
        nextDirectionRef.current = 'DOWN';
        setDirection('DOWN');
        e.preventDefault();
      } else if ((key === 'arrowleft' || key === 'a') && cur !== 'RIGHT') {
        nextDirectionRef.current = 'LEFT';
        setDirection('LEFT');
        e.preventDefault();
      } else if ((key === 'arrowright' || key === 'd') && cur !== 'LEFT') {
        nextDirectionRef.current = 'RIGHT';
        setDirection('RIGHT');
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [gameActive, gameOver]);

  // Touch Swipe on game board
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    if (t) {
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || !gameActive || gameOver) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 25) {
      const cur = nextDirectionRef.current;
      if (absX > absY) {
        if (dx > 0 && cur !== 'LEFT') {
          nextDirectionRef.current = 'RIGHT';
          setDirection('RIGHT');
        } else if (dx < 0 && cur !== 'RIGHT') {
          nextDirectionRef.current = 'LEFT';
          setDirection('LEFT');
        }
      } else {
        if (dy > 0 && cur !== 'UP') {
          nextDirectionRef.current = 'DOWN';
          setDirection('DOWN');
        } else if (dy < 0 && cur !== 'DOWN') {
          nextDirectionRef.current = 'UP';
          setDirection('UP');
        }
      }
    }
    touchStartRef.current = null;
  };

  const changeDir = (newDir) => {
    if (!gameActive || gameOver) return;
    const cur = nextDirectionRef.current;
    if (newDir === 'UP' && cur !== 'DOWN') {
      nextDirectionRef.current = 'UP';
      setDirection('UP');
    } else if (newDir === 'DOWN' && cur !== 'UP') {
      nextDirectionRef.current = 'DOWN';
      setDirection('DOWN');
    } else if (newDir === 'LEFT' && cur !== 'RIGHT') {
      nextDirectionRef.current = 'LEFT';
      setDirection('LEFT');
    } else if (newDir === 'RIGHT' && cur !== 'LEFT') {
      nextDirectionRef.current = 'RIGHT';
      setDirection('RIGHT');
    }
  };

  // Main Loop
  useEffect(() => {
    if (!gameActive || gameOver) return;

    // Speed increases as score goes up (from 160ms down to 80ms)
    const tickRate = Math.max(80, 160 - Math.floor(puntuacion / 40) * 8);

    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const curDir = nextDirectionRef.current;

        switch (curDir) {
          case 'UP': head.y--; break;
          case 'DOWN': head.y++; break;
          case 'LEFT': head.x--; break;
          case 'RIGHT': head.x++; break;
          default: break;
        }

        // Wall Collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          handleGameOver(puntuacion, prevSnake.length);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
          handleGameOver(puntuacion, prevSnake.length);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat standard food
        if (head.x === food.x && head.y === food.y) {
          const earned = food.points;
          setPuntuacion(p => p + earned);
          triggerFloat(`+${earned}`, head.x, head.y);
          if (soundEnabled) SnakeAudio.eat();
          spawnFood(newSnake);

          // 20% chance to spawn Golden Star if not active
          if (!specialFood && Math.random() < 0.25) {
            const starPos = getRandomPos(newSnake);
            setSpecialFood({ ...starPos, emoji: '⭐', points: 35 });
          }
        } 
        // Eat Special Star food
        else if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
          const earned = specialFood.points;
          setPuntuacion(p => p + earned);
          triggerFloat(`+${earned} ⭐`, head.x, head.y);
          if (soundEnabled) SnakeAudio.specialEat();
          setSpecialFood(null);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, tickRate);

    return () => clearInterval(interval);
  }, [gameActive, gameOver, food, specialFood, puntuacion, soundEnabled]);

  const handleGameOver = (finalScore, length) => {
    setGameOver(true);
    setGameActive(false);
    if (soundEnabled) SnakeAudio.die();
    if (finalScore > highScore) setHighScore(finalScore);

    guardarEnRanking("snake", finalScore, {
      longitud: length,
      puntuacion: finalScore
    });
  };

  return (
    <div className="max-w-md mx-auto px-2 select-none">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3 mb-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce">🎅🐍</span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-rose-300">
              Santa's Express Snake
            </h2>
            <div className="text-[11px] text-emerald-300 font-medium">
              Navidad 2026 Edition
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-emerald-500/30 text-white flex items-center justify-center text-sm hover:bg-slate-700 transition"
            title="Activar/Desactivar sonido"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={volverASeleccion}
            className="text-xs px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-gray-300 font-semibold border border-slate-700 transition"
          >
            ← Salir
          </button>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gradient-to-b from-emerald-950/80 to-slate-900/90 border border-emerald-500/40 rounded-xl p-2.5 text-center shadow">
          <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">PUNTOS</span>
          <span className="text-2xl font-black text-white">{puntuacion}</span>
        </div>
        <div className="bg-gradient-to-b from-rose-950/80 to-slate-900/90 border border-rose-500/40 rounded-xl p-2.5 text-center shadow">
          <span className="text-[10px] uppercase font-bold text-rose-300 tracking-wider block">VAGONES</span>
          <span className="text-2xl font-black text-white">{snake.length}</span>
        </div>
      </div>

      {/* GRID BOARD CONTAINER */}
      <div
        className="relative bg-slate-950 rounded-2xl p-2 border-2 border-emerald-500/40 shadow-2xl overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="grid gap-[2px] bg-slate-900/90 rounded-xl p-1.5"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            aspectRatio: '1 / 1'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);

            const isHead = snake[0].x === x && snake[0].y === y;
            const snakeSegmentIndex = snake.findIndex(seg => seg.x === x && seg.y === y);
            const isSnake = snakeSegmentIndex > 0;
            const isFood = food.x === x && food.y === y;
            const isStar = specialFood && specialFood.x === x && specialFood.y === y;

            return (
              <div
                key={idx}
                className={`relative flex items-center justify-center rounded-[3px] text-[10px] transition-all duration-75 ${
                  isHead
                    ? 'bg-rose-600 shadow-[0_0_8px_#f43f5e] z-10'
                    : isSnake
                    ? snakeSegmentIndex % 2 === 0
                      ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]'
                      : 'bg-rose-400'
                    : isFood || isStar
                    ? 'bg-slate-800/80 animate-pulse'
                    : (x + y) % 2 === 0
                    ? 'bg-slate-900/40'
                    : 'bg-slate-900/70'
                }`}
              >
                {isHead && <span className="scale-125 select-none pointer-events-none">🎅</span>}
                {!isHead && isFood && <span className="scale-110 select-none pointer-events-none">{food.emoji}</span>}
                {!isHead && isStar && <span className="scale-125 select-none pointer-events-none animate-spin">⭐</span>}
              </div>
            );
          })}
        </div>

        {/* Floating +10 / +35 points popups */}
        {floatingTexts.map(f => (
          <div
            key={f.id}
            className="absolute text-xs font-black text-amber-300 drop-shadow-[0_0_6px_#f59e0b] animate-bounce pointer-events-none"
            style={{
              left: `${(f.x / GRID_SIZE) * 90 + 5}%`,
              top: `${(f.y / GRID_SIZE) * 90 + 5}%`
            }}
          >
            {f.text}
          </div>
        ))}

        {/* Start Game Overlay */}
        {!gameActive && !gameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
            <span className="text-5xl mb-3 animate-bounce">🎅🎁</span>
            <h3 className="text-xl font-black text-white mb-1">SANTA'S EXPRESS SNAKE</h3>
            <p className="text-xs text-emerald-200/80 max-w-xs mb-4">
              Guía a Santa para recoger todos los regalos navideños y estrellas doradas sin chocar contra las paredes ni tu trineo.
            </p>
            <button
              onClick={iniciarJuego}
              className="w-full max-w-xs bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition"
            >
              🚀 COMENZAR JUEGO
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
            <span className="text-5xl mb-2">💥</span>
            <h3 className="text-2xl font-black text-rose-400 mb-1">¡CHOQUE NAVIDEÑO!</h3>
            <p className="text-xs text-gray-300 mb-3">Has completado una gran carrera</p>

            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl px-5 py-3 mb-4 shadow-inner">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Puntuación Final</span>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                {puntuacion} pts
              </span>
            </div>

            <button
              onClick={iniciarJuego}
              className="w-full max-w-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-3 rounded-xl shadow-lg active:scale-95 transition"
            >
              🔄 JUGAR OTRA VEZ
            </button>
          </div>
        )}
      </div>

      {/* SYMMETRICAL RESPONSIVE MOBILE D-PAD (EXACT SAME SIZES) */}
      <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2 px-1">
          <span>📱 Controles táctiles D-Pad o desliza</span>
          <span className="hidden sm:inline">⌨️ Teclas: W / A / S / D o Flechas</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 max-w-[210px] mx-auto">
          {/* Fila 1: Arriba */}
          <div></div>
          <button
            onClick={() => changeDir('UP')}
            className="w-14 h-14 mx-auto flex items-center justify-center bg-gradient-to-b from-emerald-600 to-teal-700 active:from-emerald-700 active:to-teal-800 text-white text-2xl font-black rounded-2xl shadow-lg border-2 border-emerald-400/40 select-none active:scale-95 transition-transform"
            title="Arriba"
          >
            ▲
          </button>
          <div></div>

          {/* Fila 2: Izquierda, Abajo, Derecha */}
          <button
            onClick={() => changeDir('LEFT')}
            className="w-14 h-14 mx-auto flex items-center justify-center bg-gradient-to-b from-emerald-600 to-teal-700 active:from-emerald-700 active:to-teal-800 text-white text-2xl font-black rounded-2xl shadow-lg border-2 border-emerald-400/40 select-none active:scale-95 transition-transform"
            title="Izquierda"
          >
            ◀
          </button>
          <button
            onClick={() => changeDir('DOWN')}
            className="w-14 h-14 mx-auto flex items-center justify-center bg-gradient-to-b from-emerald-600 to-teal-700 active:from-emerald-700 active:to-teal-800 text-white text-2xl font-black rounded-2xl shadow-lg border-2 border-emerald-400/40 select-none active:scale-95 transition-transform"
            title="Abajo"
          >
            ▼
          </button>
          <button
            onClick={() => changeDir('RIGHT')}
            className="w-14 h-14 mx-auto flex items-center justify-center bg-gradient-to-b from-emerald-600 to-teal-700 active:from-emerald-700 active:to-teal-800 text-white text-2xl font-black rounded-2xl shadow-lg border-2 border-emerald-400/40 select-none active:scale-95 transition-transform"
            title="Derecha"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
