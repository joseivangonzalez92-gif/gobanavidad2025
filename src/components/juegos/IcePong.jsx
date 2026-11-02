// src/components/juegos/IcePong.jsx
import React, { useState, useEffect, useRef } from "react";

// Web Audio Synthesizer for Arctic Sound Effects (no external asset dependencies)
const PongAudio = (() => {
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
    hitPaddle: () => {
      try {
        const c = getCtx();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(420, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, c.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.09);
      } catch (e) {}
    },
    hitWall: () => {
      try {
        const c = getCtx();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(260, c.currentTime);
        gain.gain.setValueAtTime(0.12, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.07);
      } catch (e) {}
    },
    powerup: () => {
      try {
        const c = getCtx();
        if (!c) return;
        [523, 659, 784, 1046].forEach((f, i) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, c.currentTime + i * 0.05);
          gain.gain.setValueAtTime(0.15, c.currentTime + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.05 + 0.12);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(c.currentTime + i * 0.05);
          osc.stop(c.currentTime + i * 0.05 + 0.13);
        });
      } catch (e) {}
    },
    goal: (isPlayer) => {
      try {
        const c = getCtx();
        if (!c) return;
        const notes = isPlayer ? [523, 659, 784, 1046, 1318] : [392, 349, 311, 261];
        notes.forEach((f, i) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = isPlayer ? "triangle" : "sawtooth";
          osc.frequency.setValueAtTime(f, c.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.18, c.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.08 + 0.18);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(c.currentTime + i * 0.08);
          osc.stop(c.currentTime + i * 0.08 + 0.2);
        });
      } catch (e) {}
    }
  };
})();

export default function IcePong({ volverASeleccion, guardarEnRanking }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [timeLeft, setTimeLeft] = useState(120);
  const [difficulty, setDifficulty] = useState('medio'); // facil, medio, pro
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [puntosAcumulados, setPuntosAcumulados] = useState(0);
  const [serveCountdown, setServeCountdown] = useState(0);
  const moveHoldInterval = useRef(null);

  const VIRTUAL_WIDTH = 800;
  const VIRTUAL_HEIGHT = 500;

  const stateRef = useRef({
    ball: { x: 400, y: 250, vx: 5, vy: 3, radius: 9 },
    player: { x: 30, y: 210, width: 14, height: 80, speed: 8 },
    computer: { x: 756, y: 210, width: 14, height: 80, speed: 4.8 },
    particles: [],
    powerUpOnField: null,
    inPlay: false,
    playerScore: 0,
    compScore: 0,
    bonusPoints: 0,
    freezeCompUntil: 0,
    megaPaddleUntil: 0,
    fireBallUntil: 0
  });

  const diffConfigs = {
    facil: { name: 'Muñeco de Nieve (Fácil)', compSpeed: 3.5, baseSpeed: 5 },
    medio: { name: 'Duende Ártico (Normal)', compSpeed: 4.8, baseSpeed: 6.2 },
    pro: { name: 'Grinch Ártico (Difícil)', compSpeed: 6.3, baseSpeed: 7.5 }
  };

  const spawnPowerUp = () => {
    const types = [
      { type: 'freeze', emoji: '❄️', label: 'Rival Congelado' },
      { type: 'mega', emoji: '🛡️', label: 'Pala Gigante' },
      { type: 'fire', emoji: '⚡', label: 'Bola Sónica' },
      { type: 'bonus', emoji: '🎁', label: '+30 Puntos' }
    ];
    const picked = types[Math.floor(Math.random() * types.length)];
    stateRef.current.powerUpOnField = {
      x: 320 + Math.random() * 160,
      y: 80 + Math.random() * 340,
      radius: 16,
      ...picked
    };
  };

  const startServe = (toPlayer = true) => {
    const cfg = diffConfigs[difficulty];
    const s = stateRef.current;
    s.ball.x = VIRTUAL_WIDTH / 2;
    s.ball.y = VIRTUAL_HEIGHT / 2;
    const dir = toPlayer ? -1 : 1;
    const angle = (Math.random() * 0.8 - 0.4);
    s.ball.vx = dir * cfg.baseSpeed * Math.cos(angle);
    s.ball.vy = cfg.baseSpeed * Math.sin(angle);
    s.inPlay = false;
    setServeCountdown(2);

    let count = 2;
    const serveInt = setInterval(() => {
      count -= 1;
      setServeCountdown(count);
      if (count <= 0) {
        clearInterval(serveInt);
        s.inPlay = true;
      }
    }, 700);
  };

  const startGame = () => {
    const cfg = diffConfigs[difficulty];
    const s = stateRef.current;
    s.playerScore = 0;
    s.compScore = 0;
    s.bonusPoints = 0;
    s.freezeCompUntil = 0;
    s.megaPaddleUntil = 0;
    s.fireBallUntil = 0;
    s.particles = [];
    s.computer.speed = cfg.compSpeed;
    s.player.height = 80;
    setScore({ player: 0, computer: 0 });
    setTimeLeft(120);
    setPuntosAcumulados(0);
    setActivePowerUp(null);
    setGameState('playing');
    startServe(Math.random() > 0.5);

    setTimeout(spawnPowerUp, 7000);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const s = stateRef.current;
      const pHeight = Date.now() < s.megaPaddleUntil ? 120 : 80;
      if (key === 'arrowup' || key === 'w') {
        s.player.y = Math.max(10, s.player.y - 25);
      } else if (key === 'arrowdown' || key === 's') {
        s.player.y = Math.min(VIRTUAL_HEIGHT - pHeight - 10, s.player.y + 25);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const startMovingPlayer = (delta) => {
    if (gameState !== 'playing') return;
    const move = () => {
      const s = stateRef.current;
      const pHeight = Date.now() < s.megaPaddleUntil ? 120 : 80;
      s.player.y = Math.max(10, Math.min(VIRTUAL_HEIGHT - pHeight - 10, s.player.y + delta));
    };
    move();
    clearInterval(moveHoldInterval.current);
    moveHoldInterval.current = setInterval(move, 40);
  };

  const stopMovingPlayer = () => {
    if (moveHoldInterval.current) {
      clearInterval(moveHoldInterval.current);
      moveHoldInterval.current = null;
    }
  };

  const handleTouchCanvas = (e) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    const touchY = touch.clientY - rect.top;
    const scaleY = VIRTUAL_HEIGHT / rect.height;
    const targetY = touchY * scaleY;
    const s = stateRef.current;
    const pHeight = Date.now() < s.megaPaddleUntil ? 120 : 80;
    s.player.y = Math.max(10, Math.min(VIRTUAL_HEIGHT - pHeight - 10, targetY - pHeight / 2));
  };

  const finishGame = () => {
    const s = stateRef.current;
    s.inPlay = false;
    const won = s.playerScore > s.compScore;
    const basePts = s.playerScore * 25;
    const winBonus = won ? 150 : 0;
    const diffBonus = difficulty === 'pro' ? 80 : difficulty === 'medio' ? 40 : 10;
    const finalScore = basePts + winBonus + diffBonus + s.bonusPoints;

    setPuntosAcumulados(finalScore);
    setGameState('gameOver');
    if (soundEnabled) PongAudio.goal(won);

    guardarEnRanking("pong", finalScore, {
      playerGoals: s.playerScore,
      compGoals: s.compScore,
      dificultad: difficulty,
      victoria: won
    });
  };

  // Canvas render & physics loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;

    const loop = () => {
      const s = stateRef.current;
      const now = Date.now();

      if (now < s.megaPaddleUntil) {
        s.player.height = 125;
      } else {
        s.player.height = 80;
      }

      const compFrozen = now < s.freezeCompUntil;
      const isFireBall = now < s.fireBallUntil;

      if (s.inPlay) {
        const speedMult = isFireBall ? 1.35 : 1.0;
        s.ball.x += s.ball.vx * speedMult;
        s.ball.y += s.ball.vy * speedMult;

        if (Math.random() < 0.7 || isFireBall) {
          s.particles.push({
            x: s.ball.x,
            y: s.ball.y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            radius: isFireBall ? 4 + Math.random() * 3 : 2 + Math.random() * 2,
            alpha: 1,
            color: isFireBall ? '#f59e0b' : '#38bdf8'
          });
        }

        if (s.ball.y - s.ball.radius <= 10) {
          s.ball.y = 10 + s.ball.radius;
          s.ball.vy = Math.abs(s.ball.vy);
          if (soundEnabled) PongAudio.hitWall();
        } else if (s.ball.y + s.ball.radius >= VIRTUAL_HEIGHT - 10) {
          s.ball.y = VIRTUAL_HEIGHT - 10 - s.ball.radius;
          s.ball.vy = -Math.abs(s.ball.vy);
          if (soundEnabled) PongAudio.hitWall();
        }

        const compTargetY = s.ball.y - s.computer.height / 2;
        const cSpeed = compFrozen ? 1.6 : s.computer.speed;
        if (s.computer.y < compTargetY - 4) {
          s.computer.y += Math.min(cSpeed, compTargetY - s.computer.y);
        } else if (s.computer.y > compTargetY + 4) {
          s.computer.y -= Math.min(cSpeed, s.computer.y - compTargetY);
        }
        s.computer.y = Math.max(10, Math.min(VIRTUAL_HEIGHT - s.computer.height - 10, s.computer.y));

        // Player paddle collision
        if (
          s.ball.x - s.ball.radius <= s.player.x + s.player.width &&
          s.ball.x + s.ball.radius >= s.player.x &&
          s.ball.y >= s.player.y &&
          s.ball.y <= s.player.y + s.player.height &&
          s.ball.vx < 0
        ) {
          s.ball.x = s.player.x + s.player.width + s.ball.radius;
          const hitOffset = (s.ball.y - (s.player.y + s.player.height / 2)) / (s.player.height / 2);
          const currentSpd = Math.sqrt(s.ball.vx * s.ball.vx + s.ball.vy * s.ball.vy);
          const newSpd = Math.min(currentSpd * 1.04, 15);
          const maxAngle = Math.PI * 0.35;
          const returnAngle = hitOffset * maxAngle;
          s.ball.vx = Math.abs(newSpd * Math.cos(returnAngle));
          s.ball.vy = newSpd * Math.sin(returnAngle);
          if (soundEnabled) PongAudio.hitPaddle();
        }

        // Computer paddle collision
        if (
          s.ball.x + s.ball.radius >= s.computer.x &&
          s.ball.x - s.ball.radius <= s.computer.x + s.computer.width &&
          s.ball.y >= s.computer.y &&
          s.ball.y <= s.computer.y + s.computer.height &&
          s.ball.vx > 0
        ) {
          s.ball.x = s.computer.x - s.ball.radius;
          const hitOffset = (s.ball.y - (s.computer.y + s.computer.height / 2)) / (s.computer.height / 2);
          const currentSpd = Math.sqrt(s.ball.vx * s.ball.vx + s.ball.vy * s.ball.vy);
          const newSpd = Math.min(currentSpd * 1.03, 14);
          const maxAngle = Math.PI * 0.35;
          const returnAngle = hitOffset * maxAngle;
          s.ball.vx = -Math.abs(newSpd * Math.cos(returnAngle));
          s.ball.vy = newSpd * Math.sin(returnAngle);
          if (soundEnabled) PongAudio.hitPaddle();
        }

        // Power-Up field collision
        if (s.powerUpOnField) {
          const p = s.powerUpOnField;
          const dist = Math.hypot(s.ball.x - p.x, s.ball.y - p.y);
          if (dist < s.ball.radius + p.radius) {
            const isPlayerBeneficiary = s.ball.vx > 0;
            if (isPlayerBeneficiary) {
              if (p.type === 'freeze') {
                s.freezeCompUntil = now + 5000;
                setActivePowerUp({ type: 'freeze', label: '❄️ ¡Rival Congelado! (5s)' });
              } else if (p.type === 'mega') {
                s.megaPaddleUntil = now + 6500;
                setActivePowerUp({ type: 'mega', label: '🛡️ ¡Pala Gigante Ártica! (6s)' });
              } else if (p.type === 'fire') {
                s.fireBallUntil = now + 5000;
                setActivePowerUp({ type: 'fire', label: '⚡ ¡Bola Sónica!' });
              } else if (p.type === 'bonus') {
                s.bonusPoints += 30;
                setActivePowerUp({ type: 'bonus', label: '🎁 ¡+30 Puntos Extra!' });
              }
            }
            if (soundEnabled) PongAudio.powerup();
            s.powerUpOnField = null;
            setTimeout(spawnPowerUp, 9000);
          }
        }

        // Goal Check
        if (s.ball.x < 0) {
          s.compScore += 1;
          setScore({ player: s.playerScore, computer: s.compScore });
          if (soundEnabled) PongAudio.goal(false);
          if (s.compScore >= 10) {
            finishGame();
            return;
          }
          startServe(true);
        } else if (s.ball.x > VIRTUAL_WIDTH) {
          s.playerScore += 1;
          setScore({ player: s.playerScore, computer: s.compScore });
          if (soundEnabled) PongAudio.goal(true);
          if (s.playerScore >= 10) {
            finishGame();
            return;
          }
          startServe(false);
        }
      }

      // Update particles
      s.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
      });
      s.particles = s.particles.filter(p => p.alpha > 0);

      // Render
      ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      const iceGrad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
      iceGrad.addColorStop(0, '#0f172a');
      iceGrad.addColorStop(0.5, '#0b1d3a');
      iceGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = iceGrad;
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Glow borders
      ctx.strokeStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.strokeRect(8, 8, VIRTUAL_WIDTH - 16, VIRTUAL_HEIGHT - 16);
      ctx.shadowBlur = 0;

      // Center court
      ctx.setLineDash([8, 10]);
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(VIRTUAL_WIDTH / 2, 10);
      ctx.lineTo(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2, 60, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('❄️', VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 8);

      // Power up
      if (s.powerUpOnField) {
        const p = s.powerUpOnField;
        ctx.save();
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 14;
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, p.x, p.y);
        ctx.restore();
      }

      // Particles
      s.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Player paddle
      ctx.save();
      const pGrad = ctx.createLinearGradient(s.player.x, 0, s.player.x + s.player.width, 0);
      pGrad.addColorStop(0, '#38bdf8');
      pGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = pGrad;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(s.player.x, s.player.y, s.player.width, s.player.height, 6);
      ctx.fill();
      ctx.restore();

      // Computer paddle
      ctx.save();
      const cGrad = ctx.createLinearGradient(s.computer.x, 0, s.computer.x + s.computer.width, 0);
      if (compFrozen) {
        cGrad.addColorStop(0, '#93c5fd');
        cGrad.addColorStop(1, '#60a5fa');
        ctx.shadowColor = '#60a5fa';
      } else {
        cGrad.addColorStop(0, '#f87171');
        cGrad.addColorStop(1, '#dc2626');
        ctx.shadowColor = '#ef4444';
      }
      ctx.fillStyle = cGrad;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(s.computer.x, s.computer.y, s.computer.width, s.computer.height, 6);
      ctx.fill();
      ctx.restore();

      // Ball
      ctx.save();
      ctx.shadowColor = isFireBall ? '#f59e0b' : '#38bdf8';
      ctx.shadowBlur = 16;
      const ballGrad = ctx.createRadialGradient(
        s.ball.x - 3, s.ball.y - 3, 2,
        s.ball.x, s.ball.y, s.ball.radius
      );
      if (isFireBall) {
        ballGrad.addColorStop(0, '#fef08a');
        ballGrad.addColorStop(1, '#f97316');
      } else {
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(0.6, '#bae6fd');
        ballGrad.addColorStop(1, '#38bdf8');
      }
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, s.ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, difficulty, soundEnabled]);

  return (
    <div className="max-w-2xl mx-auto px-2 select-none">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 mb-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">❄️</span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-emerald-300">
              Ice Pong Ártico 2026
            </h2>
            <div className="text-[11px] text-cyan-300 font-medium">
              Modo: <span className="font-bold capitalize text-white">{difficulty}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-cyan-500/30 text-white flex items-center justify-center text-sm hover:bg-slate-700 transition"
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

      {/* SCOREBOARD BAR */}
      {gameState === 'playing' && (
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-gradient-to-b from-sky-950/80 to-slate-900/90 border border-cyan-500/40 rounded-xl p-2 shadow">
            <span className="text-[10px] tracking-wider uppercase text-cyan-300 font-bold block">TÚ (AZUL)</span>
            <span className="text-2xl sm:text-3xl font-black text-white">{score.player}</span>
          </div>

          <div className="bg-gradient-to-b from-slate-950/90 to-slate-900/90 border border-slate-700 rounded-xl p-2 flex flex-col justify-center items-center shadow">
            <span className="text-[10px] uppercase text-gray-400 font-bold">TIEMPO</span>
            <span className={`text-xl font-black ${timeLeft <= 20 ? 'text-red-400 animate-ping' : 'text-amber-300'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="bg-gradient-to-b from-rose-950/80 to-slate-900/90 border border-rose-500/40 rounded-xl p-2 shadow">
            <span className="text-[10px] tracking-wider uppercase text-rose-300 font-bold block">RIVAL (ROJO)</span>
            <span className="text-2xl sm:text-3xl font-black text-white">{score.computer}</span>
          </div>
        </div>
      )}

      {/* ACTIVE POWERUP BANNER */}
      {activePowerUp && gameState === 'playing' && (
        <div className="mb-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/50 rounded-xl py-1.5 px-3 text-center text-xs font-black text-amber-200 animate-pulse shadow-md">
          {activePowerUp.label}
        </div>
      )}

      {/* CANVAS CONTAINER */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl bg-slate-950 aspect-[16/10] w-full touch-none">
        <canvas
          ref={canvasRef}
          width={VIRTUAL_WIDTH}
          height={VIRTUAL_HEIGHT}
          onTouchMove={handleTouchCanvas}
          onTouchStart={handleTouchCanvas}
          className="w-full h-full block cursor-pointer"
        />

        {gameState === 'playing' && serveCountdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none">
            <div className="text-center">
              <span className="text-5xl font-black text-cyan-300 drop-shadow-[0_0_15px_#38bdf8] animate-bounce block">
                {serveCountdown}
              </span>
              <span className="text-xs uppercase tracking-widest text-white/90 font-bold mt-1 block">
                ¡Prepárate!
              </span>
            </div>
          </div>
        )}

        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
            <div className="text-5xl mb-2 animate-bounce">🏓</div>
            <h3 className="text-2xl font-black text-white mb-1">
              ICE PONG ÁRTICO
            </h3>
            <p className="text-xs text-cyan-200/80 max-w-sm mb-4">
              Defiende tu portería de hielo, recoge orbes de poder ❄️⚡🛡️ y vence al rival ártico antes de que expire el tiempo.
            </p>

            <div className="flex gap-2 mb-5">
              {['facil', 'medio', 'pro'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`text-xs px-3 py-2 rounded-xl font-bold uppercase transition ${
                    difficulty === d
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg ring-2 ring-cyan-300'
                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <button
              onClick={startGame}
              className="w-full max-w-xs bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-3.5 rounded-xl font-black text-base shadow-lg shadow-emerald-500/25 active:scale-95 transition"
            >
              🚀 COMENZAR PARTIDA
            </button>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
            <div className="text-5xl mb-2">
              {score.player > score.computer ? '🏆' : '❄️'}
            </div>
            <h3 className="text-2xl font-black text-white mb-1">
              {score.player > score.computer ? '¡VICTORIA ÉPICA!' : '¡PARTIDA FINALIZADA!'}
            </h3>
            <p className="text-xs text-gray-300 mb-3">
              Marcador: <span className="font-bold text-cyan-300">{score.player}</span> vs <span className="font-bold text-rose-300">{score.computer}</span>
            </p>

            <div className="bg-slate-900 border border-cyan-500/30 rounded-xl px-5 py-3 mb-4 shadow-inner">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Puntuación Final</span>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                {puntosAcumulados} pts
              </span>
            </div>

            <div className="flex gap-3 w-full max-w-xs">
              <button
                onClick={startGame}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition"
              >
                🔄 Revancha
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-200 py-3 rounded-xl font-bold text-sm border border-slate-700 transition"
              >
                📋 Menú
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Symmetrical mobile controls with equal sizes */}
      {gameState === 'playing' && (
        <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2 px-1">
            <span>📱 Desliza en pantalla o pulsa los botones</span>
            <span className="hidden sm:inline">⌨️ Teclas: W / S o Flechas ↑ / ↓</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              onMouseDown={() => startMovingPlayer(-18)}
              onMouseUp={stopMovingPlayer}
              onMouseLeave={stopMovingPlayer}
              onTouchStart={(e) => { e.preventDefault(); startMovingPlayer(-18); }}
              onTouchEnd={(e) => { e.preventDefault(); stopMovingPlayer(); }}
              className="h-16 flex items-center justify-center gap-2 bg-gradient-to-b from-sky-600 to-blue-700 active:from-sky-700 active:to-blue-800 text-white font-black text-lg rounded-2xl shadow-lg border-2 border-sky-400/50 select-none active:scale-95 transition-transform"
            >
              <span className="text-2xl">▲</span>
              <span className="text-sm font-bold tracking-wider">ARRIBA</span>
            </button>

            <button
              onMouseDown={() => startMovingPlayer(18)}
              onMouseUp={stopMovingPlayer}
              onMouseLeave={stopMovingPlayer}
              onTouchStart={(e) => { e.preventDefault(); startMovingPlayer(18); }}
              onTouchEnd={(e) => { e.preventDefault(); stopMovingPlayer(); }}
              className="h-16 flex items-center justify-center gap-2 bg-gradient-to-b from-sky-600 to-blue-700 active:from-sky-700 active:to-blue-800 text-white font-black text-lg rounded-2xl shadow-lg border-2 border-sky-400/50 select-none active:scale-95 transition-transform"
            >
              <span className="text-2xl">▼</span>
              <span className="text-sm font-bold tracking-wider">ABAJO</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
