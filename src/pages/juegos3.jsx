// src/pages/juegos3.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gobaService } from "../services/firebaseService";

// =============================================
// 1. 🎨 ZE GEOMETRIC - JUEGO DE BLOQUES GEOMÉTRICOS (CORREGIDO)
// =============================================
const ZeGeometric = ({ volverASeleccion, guardarEnRanking }) => {
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [figurasUtilizadas, setFigurasUtilizadas] = useState(0);
  const [selectedShapeOnBoard, setSelectedShapeOnBoard] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const boardRef = useRef(null);

  // Más figuras geométricas
  const availableShapes = [
    { id: 'square', name: 'Cuadrado', type: 'square', color: '#f87171' },
    { id: 'circle', name: 'Círculo', type: 'circle', color: '#60a5fa' },
    { id: 'triangle', name: 'Triángulo', type: 'triangle', color: '#34d399' },
    { id: 'rectangle', name: 'Rectángulo', type: 'rectangle', color: '#fbbf24' },
    { id: 'pentagon', name: 'Pentágono', type: 'pentagon', color: '#a78bfa' },
    { id: 'star', name: 'Estrella', type: 'star', color: '#f472b6' },
    { id: 'hexagon', name: 'Hexágono', type: 'hexagon', color: '#f59e0b' },
    { id: 'diamond', name: 'Diamante', type: 'diamond', color: '#ec4899' },
    { id: 'heart', name: 'Corazón', type: 'heart', color: '#ef4444' },
    { id: 'cloud', name: 'Nube', type: 'cloud', color: '#94a3b8' }
  ];

  // Tamaños disponibles con dimensiones específicas
  const sizes = [
    { id: 'small', name: 'Pequeño', scale: 0.7, baseSize: 35 },
    { id: 'medium', name: 'Mediano', scale: 1, baseSize: 50 },
    { id: 'large', name: 'Grande', scale: 1.3, baseSize: 65 }
  ];

  // Colores disponibles
  const colors = [
    '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399',
    '#22d3ee', '#60a5fa', '#a78bfa', '#e879f9', '#f472b6'
  ];

  const handleShapeSelect = (shape) => {
    setSelectedShape(shape);
    setSelectedSize('medium');
  };

  const handleDragStart = (e, shape) => {
    if (!selectedShape) return;
    
    setIsDragging(true);
    e.dataTransfer.setData('application/json', JSON.stringify({
      shape: selectedShape,
      size: selectedSize
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (!data.shape) return;

      const boardRect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - boardRect.left - 25;
      const y = e.clientY - boardRect.top - 25;

      const selectedSizeObj = sizes.find(s => s.id === data.size) || sizes[1]; // Default a mediano

      const newShape = {
        id: Date.now().toString(),
        type: data.shape.type,
        color: data.shape.color,
        x: Math.max(0, x),
        y: Math.max(0, y),
        rotation: 0,
        scale: selectedSizeObj.scale,
        size: data.size,
        baseSize: selectedSizeObj.baseSize
      };

      setShapes(prev => [...prev, newShape]);
      setFigurasUtilizadas(prev => prev + 1);
      setSelectedShape(null);
    } catch (error) {
      console.log('Error al soltar figura:', error);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleBoardClick = (e) => {
    // Solo deseleccionar si se hace click directamente en el tablero (no en una figura)
    if (e.target === boardRef.current) {
      setSelectedShapeOnBoard(null);
    }
  };

  const rotateShape = (shapeId) => {
    setShapes(prev => prev.map(shape => 
      shape.id === shapeId 
        ? { ...shape, rotation: (shape.rotation + 45) % 360 }
        : shape
    ));
  };

  const removeShape = (shapeId) => {
    setShapes(prev => prev.filter(shape => shape.id !== shapeId));
    setSelectedShapeOnBoard(null);
  };

  const changeColor = (shapeId) => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setShapes(prev => prev.map(shape => 
      shape.id === shapeId 
        ? { ...shape, color: randomColor }
        : shape
    ));
  };

  const moveShape = (shapeId, direction) => {
    setShapes(prev => prev.map(shape => {
      if (shape.id === shapeId) {
        const moveAmount = 10;
        switch(direction) {
          case 'up': return { ...shape, y: Math.max(0, shape.y - moveAmount) };
          case 'down': return { ...shape, y: shape.y + moveAmount };
          case 'left': return { ...shape, x: Math.max(0, shape.x - moveAmount) };
          case 'right': return { ...shape, x: shape.x + moveAmount };
          default: return shape;
        }
      }
      return shape;
    }));
  };

  const clearBoard = () => {
    setShapes([]);
    setFigurasUtilizadas(0);
    setSelectedShapeOnBoard(null);
  };

  const guardarCreacion = () => {
    guardarEnRanking("ze-geometric", figurasUtilizadas, {
      figurasCreadas: shapes.length,
      complejidad: shapes.length
    });
  };

  const handleShapeClick = (shape, e) => {
    e.stopPropagation(); // Prevenir que el click llegue al tablero
    setSelectedShapeOnBoard(shape.id === selectedShapeOnBoard ? null : shape.id);
  };

  // Función para obtener las dimensiones reales de cada figura
  const getShapeDimensions = (shape) => {
    const baseSize = shape.baseSize || 50;
    
    switch(shape.type) {
      case 'square':
        return { width: baseSize, height: baseSize };
      case 'circle':
        return { width: baseSize, height: baseSize };
      case 'triangle':
        return { width: baseSize, height: baseSize };
      case 'rectangle':
        return { width: baseSize * 1.6, height: baseSize * 0.8 };
      case 'pentagon':
        return { width: baseSize, height: baseSize };
      case 'star':
        return { width: baseSize, height: baseSize };
      case 'hexagon':
        return { width: baseSize, height: baseSize };
      case 'diamond':
        return { width: baseSize, height: baseSize };
      case 'heart':
        return { width: baseSize, height: baseSize };
      case 'cloud':
        return { width: baseSize * 1.2, height: baseSize * 0.8 };
      default:
        return { width: baseSize, height: baseSize };
    }
  };

  // Función para renderizar la vista previa de cada figura
  const renderShapePreview = (shape) => {
    const style = {
      backgroundColor: shape.color,
      width: '30px',
      height: '30px'
    };

    switch(shape.type) {
      case 'square':
        return <div className="rounded-md" style={style} />;
      case 'circle':
        return <div className="rounded-full" style={style} />;
      case 'triangle':
        return <div className="triangle-preview" style={{...style, backgroundColor: 'transparent', borderBottom: `30px solid ${shape.color}`}} />;
      case 'rectangle':
        return <div className="rounded-md" style={{...style, width: '40px', height: '20px'}} />;
      case 'pentagon':
        return <div className="pentagon-preview" style={style} />;
      case 'star':
        return <div className="star-preview" style={style} />;
      case 'hexagon':
        return <div className="hexagon-preview" style={style} />;
      case 'diamond':
        return <div className="diamond-preview" style={style} />;
      case 'heart':
        return <div className="heart-preview" style={style} />;
      case 'cloud':
        return <div className="cloud-preview" style={style} />;
      default:
        return <div className="rounded-md" style={style} />;
    }
  };

  return (
    <div className="text-center max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">🎨 Ze Geometric Blocks</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel de figuras y controles */}
        <div className="space-y-6">
          {/* Contador de figuras */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="text-2xl font-bold text-purple-600">{figurasUtilizadas}</div>
            <div className="text-sm text-gray-600">Figuras utilizadas</div>
          </div>

          {/* Selección de figuras */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h3 className="font-bold mb-4 text-gray-800">Figuras Disponibles</h3>
            <div className="grid grid-cols-2 gap-3">
              {availableShapes.map(shape => (
                <div
                  key={shape.id}
                  draggable={!!selectedShape && selectedShape.id === shape.id}
                  onDragStart={(e) => handleDragStart(e, shape)}
                  onDragEnd={handleDragEnd}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedShape?.id === shape.id 
                      ? 'border-purple-500 bg-purple-50 scale-105' 
                      : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                  } ${selectedShape?.id === shape.id ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  onClick={() => handleShapeSelect(shape)}
                >
                  <div className="flex justify-center mb-2">
                    {renderShapePreview(shape)}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{shape.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selección de tamaño */}
          {selectedShape && (
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="font-bold mb-3 text-gray-800">Tamaño</h3>
              <div className="space-y-2">
                {sizes.map(size => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={`w-full py-2 rounded-lg border transition-all ${
                      selectedSize === size.id 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {isDragging ? "➡️ Arrastra al tablero..." : `Tamaño seleccionado: ${sizes.find(s => s.id === selectedSize)?.name}`}
              </p>
            </div>
          )}

          {/* Controles generales */}
          <div className="space-y-3">
            <button
              onClick={clearBoard}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all"
            >
              🗑️ Limpiar Todo
            </button>
            <button
              onClick={guardarCreacion}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all"
            >
              💾 Guardar Creación
            </button>
          </div>
        </div>

        {/* Área de trabajo */}
        <div className="lg:col-span-3">
          <div 
            ref={boardRef}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-[600px] border-2 border-dashed border-gray-300 relative overflow-hidden cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleBoardClick}
          >
            {shapes.map(shape => {
              const dimensions = getShapeDimensions(shape);
              return (
                <div
                  key={shape.id}
                  className={`absolute transition-all ${
                    selectedShapeOnBoard === shape.id ? 'z-10 ring-2 ring-blue-400' : 'z-0'
                  }`}
                  style={{
                    left: `${shape.x}px`,
                    top: `${shape.y}px`,
                    transform: `rotate(${shape.rotation}deg) scale(${shape.scale})`,
                    width: `${dimensions.width}px`,
                    height: `${dimensions.height}px`
                  }}
                  onClick={(e) => handleShapeClick(shape, e)}
                >
                  <div 
                    className={`shape ${shape.type} w-full h-full`}
                    style={{ backgroundColor: shape.color }}
                  >
                    {/* Controles de forma seleccionada */}
                    {selectedShapeOnBoard === shape.id && (
                      <div className="shape-controls">
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); rotateShape(shape.id); }}
                            className="w-8 h-8 bg-white rounded-full text-xs flex items-center justify-center shadow-md hover:scale-110 transition-all"
                            title="Rotar"
                          >
                            🔄
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); changeColor(shape.id); }}
                            className="w-8 h-8 bg-white rounded-full text-xs flex items-center justify-center shadow-md hover:scale-110 transition-all"
                            title="Cambiar color"
                          >
                            🎨
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeShape(shape.id); }}
                            className="w-8 h-8 bg-white rounded-full text-xs flex items-center justify-center shadow-md hover:scale-110 transition-all"
                            title="Eliminar"
                          >
                            ❌
                          </button>
                        </div>
                        <div className="flex gap-1 mt-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveShape(shape.id, 'up'); }}
                            className="w-6 h-6 bg-white rounded text-xs flex items-center justify-center shadow-md hover:scale-110 transition-all"
                            title="Mover arriba"
                          >
                            ↑
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveShape(shape.id, 'left'); }}
                            className="w-6 h-6 bg-white rounded text-xs flex items-center justify-center shadow-md hover:scale-110 transition-all"
                            title="Mover izquierda"
                          >
                            ←
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveShape(shape.id, 'right'); }}
                            className="w-6 h-6 bg-white rounded text-xs flex items-center justify-center shadow-md hover:scale-110 transition-all"
                            title="Mover derecha"
                          >
                            →
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveShape(shape.id, 'down'); }}
                            className="w-6 h-6 bg-white rounded text-xs flex items-center justify-center shadow-md hover:scale-110 transition-all"
                            title="Mover abajo"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {shapes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎨</div>
                  <p className="text-lg">Selecciona una figura y arrástrala aquí</p>
                  <p className="text-sm mt-2">Haz clic en las figuras para editarlas</p>
                  <p className="text-sm mt-1">Clic en el área vacía para deseleccionar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={volverASeleccion}
        className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
      >
        ← Volver a Juegos 3
      </button>

      <style jsx>{`
        .shape {
          position: relative;
          transition: all 0.3s ease;
        }
        .shape:hover {
          filter: brightness(1.1);
        }
        .shape-controls {
          position: absolute;
          top: -45px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .triangle-preview {
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-bottom: 30px solid;
          background: transparent !important;
        }
        .pentagon-preview {
          clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        }
        .star-preview {
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        }
        .hexagon-preview {
          clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
        }
        .diamond-preview {
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        .heart-preview {
          clip-path: path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
        }
        .cloud-preview {
          clip-path: path('M20 35c-5.5 0-10-4.5-10-10 0-4 2.5-7.5 6-9 1-5.5 5.5-10 11-10 6 0 10.5 4.5 11 10 3.5 1.5 6 5 6 9 0 5.5-4.5 10-10 10H20z');
        }
        .square { border-radius: 8px; }
        .circle { border-radius: 50%; }
        .triangle { 
          background: transparent !important;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
        .rectangle { border-radius: 8px; }
        .pentagon {
          background: transparent !important;
          clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        }
        .star {
          background: transparent !important;
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        }
        .hexagon {
          background: transparent !important;
          clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
        }
        .diamond {
          background: transparent !important;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        .heart {
          background: transparent !important;
          clip-path: path('M20 35c-5.5 0-10-4.5-10-10 0-4 2.5-7.5 6-9 1-5.5 5.5-10 11-10 6 0 10.5 4.5 11 10 3.5 1.5 6 5 6 9 0 5.5-4.5 10-10 10H20z');
        }
        .cloud {
          background: transparent !important;
          clip-path: path('M20 35c-5.5 0-10-4.5-10-10 0-4 2.5-7.5 6-9 1-5.5 5.5-10 11-10 6 0 10.5 4.5 11 10 3.5 1.5 6 5 6 9 0 5.5-4.5 10-10 10H20z');
        }
      `}</style>
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
  const [gameSpeed, setGameSpeed] = useState(1);

  const gameStateRef = useRef({
    ball: { x: 400, y: 300, dx: 5, dy: 5, radius: 8 },
    player: { x: 30, y: 250, width: 10, height: 80, dy: 0 },
    computer: { x: 760, y: 250, width: 10, height: 80, speed: 5 },
    keys: {}
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameStateRef.current.keys[e.key] = true;
    };

    const handleKeyUp = (e) => {
      gameStateRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startGame = () => {
    const state = gameStateRef.current;
    state.ball = { x: 400, y: 300, dx: 5 * gameSpeed, dy: 5 * gameSpeed, radius: 8 };
    state.player = { x: 30, y: 250, width: 10, height: 80, dy: 0 };
    state.computer = { x: 760, y: 250, width: 10, height: 80, speed: 5 * gameSpeed };
    setScore({ player: 0, computer: 0 });
    setGameState('playing');
    gameLoop();
  };

  const gameLoop = () => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    // Limpiar canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mover jugador
    if (state.keys['ArrowUp'] || state.keys['w']) {
      state.player.y = Math.max(0, state.player.y - 8);
    }
    if (state.keys['ArrowDown'] || state.keys['s']) {
      state.player.y = Math.min(canvas.height - state.player.height, state.player.y + 8);
    }

    // IA simple
    const computerCenter = state.computer.y + state.computer.height / 2;
    if (computerCenter < state.ball.y - 10) {
      state.computer.y += state.computer.speed;
    } else if (computerCenter > state.ball.y + 10) {
      state.computer.y -= state.computer.speed;
    }
    state.computer.y = Math.max(0, Math.min(canvas.height - state.computer.height, state.computer.y));

    // Mover pelota
    state.ball.x += state.ball.dx;
    state.ball.y += state.ball.dy;

    // Colisiones
    if (state.ball.y - state.ball.radius <= 0 || state.ball.y + state.ball.radius >= canvas.height) {
      state.ball.dy = -state.ball.dy;
    }

    // Colisión con paletas
    if (state.ball.x - state.ball.radius <= state.player.x + state.player.width &&
        state.ball.y >= state.player.y && state.ball.y <= state.player.y + state.player.height) {
      state.ball.dx = Math.abs(state.ball.dx);
    }

    if (state.ball.x + state.ball.radius >= state.computer.x &&
        state.ball.y >= state.computer.y && state.ball.y <= state.computer.y + state.computer.height) {
      state.ball.dx = -Math.abs(state.ball.dx);
    }

    // Puntuación
    if (state.ball.x < 0) {
      setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
      resetBall();
    } else if (state.ball.x > canvas.width) {
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
      resetBall();
    }

    // Dibujar
    ctx.fillStyle = '#fff';
    ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
    ctx.fillRect(state.computer.x, state.computer.y, state.computer.width, state.computer.height);
    
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Línea central
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.setLineDash([]);

    // Verificar fin del juego
    if (score.player >= 5 || score.computer >= 5) {
      setGameState('gameOver');
      guardarEnRanking("pong", score.player * 100, {
        puntosPlayer: score.player,
        puntosComputer: score.computer
      });
      return;
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const resetBall = () => {
    const state = gameStateRef.current;
    state.ball.x = 400;
    state.ball.y = 300;
    state.ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5 * gameSpeed;
    state.ball.dy = (Math.random() * 2 - 1) * 5 * gameSpeed;
  };

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6">🎮 Pong</h2>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4 text-white">
          <div className="text-2xl font-bold">{score.player}</div>
          <div className="text-lg">VS</div>
          <div className="text-2xl font-bold">{score.computer}</div>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-64 bg-black rounded-lg"
        />
      </div>

      {gameState === 'menu' && (
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="text-4xl mb-4">🎮</div>
          <button
            onClick={startGame}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all"
          >
            Comenzar Juego
          </button>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
          <div className="text-2xl font-bold mb-2">
            {score.player >= 5 ? '🎉 ¡Ganaste!' : '💀 Game Over'}
          </div>
          <p className="mb-4">Puntuación: {score.player} - {score.computer}</p>
          <button
            onClick={startGame}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all"
          >
            🔄 Jugar Otra Vez
          </button>
        </div>
      )}

      <button
        onClick={volverASeleccion}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
      >
        ← Volver a Juegos 3
      </button>
    </div>
  );
};

// =============================================
// 3. ❄️ CORTADOR DE COPOS DE NIEVE (FRUIT NINJA)
// =============================================
const CortadorCopos = ({ volverASeleccion, guardarEnRanking }) => {
  const [copos, setCopos] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [jugando, setJugando] = useState(false);
  const [combo, setCombo] = useState(0);
  const gameAreaRef = useRef(null);

  useEffect(() => {
    if (!jugando) return;

    const timer = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          setJugando(false);
          guardarEnRanking("cortador-copos", puntuacion, {
            tiempo: 60,
            comboMaximo: combo,
            vidasRestantes: vidas
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const generarCopo = () => {
      const tipos = [
        { emoji: "❄️", puntos: 10, velocidad: 3, esBomba: false },
        { emoji: "⭐", puntos: 20, velocidad: 4, esBomba: false },
        { emoji: "💎", puntos: 50, velocidad: 5, esBomba: false },
        { emoji: "💣", puntos: -100, velocidad: 2, esBomba: true }
      ];

      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const direccion = Math.random() > 0.5 ? 1 : -1;
      
      setCopos(prev => [...prev, {
        id: Date.now() + Math.random(),
        x: direccion > 0 ? -50 : 150,
        y: Math.random() * 80 + 10,
        tipo: tipo,
        velocidadX: tipo.velocidad * direccion,
        velocidadY: (Math.random() - 0.5) * 2,
        cortado: false
      }]);
    };

    const moverCopos = setInterval(() => {
      setCopos(prev => {
        return prev.map(copo => ({
          ...copo,
          x: copo.x + copo.velocidadX,
          y: copo.y + copo.velocidadY
        })).filter(copo => 
          copo.x > -100 && copo.x < 200 && copo.y > -20 && copo.y < 120
        );
      });
    }, 50);

    const generador = setInterval(generarCopo, 800);

    return () => {
      clearInterval(timer);
      clearInterval(moverCopos);
      clearInterval(generador);
    };
  }, [jugando, puntuacion, combo, vidas]);

  const manejarCorte = (copoId, esBomba) => {
    if (!jugando) return;

    if (esBomba) {
      setVidas(prev => {
        const nuevasVidas = prev - 1;
        if (nuevasVidas <= 0) {
          setJugando(false);
          guardarEnRanking("cortador-copos", puntuacion, {
            tiempoRestante: tiempoRestante,
            comboMaximo: combo
          });
        }
        return nuevasVidas;
      });
      setCombo(0);
    } else {
      setPuntuacion(prev => prev + 10 * (combo + 1));
      setCombo(prev => prev + 1);
    }

    setCopos(prev => prev.map(c => 
      c.id === copoId ? { ...c, cortado: true } : c
    ));

    setTimeout(() => {
      setCopos(prev => prev.filter(c => c.id !== copoId));
    }, 200);
  };

  const iniciarJuego = () => {
    setCopos([]);
    setPuntuacion(0);
    setVidas(3);
    setTiempoRestante(60);
    setCombo(0);
    setJugando(true);
  };

  const manejarTouchMove = (e) => {
    if (!jugando) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    // Detectar colisión con copos
    copos.forEach(copo => {
      const distancia = Math.sqrt(Math.pow(copo.x - x, 2) + Math.pow(copo.y - y, 2));
      if (distancia < 10 && !copo.cortado) {
        manejarCorte(copo.id, copo.tipo.esBomba);
      }
    });
  };

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6">❄️ Cortador de Copos</h2>
      
      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-3">
            <div className="text-xl font-bold text-blue-600">{puntuacion}</div>
            <div className="text-sm text-gray-600">Puntos</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <div className={`text-xl font-bold ${
              tiempoRestante <= 10 ? "text-red-500 animate-pulse" : "text-green-600"
            }`}>
              {tiempoRestante}s
            </div>
            <div className="text-sm text-gray-600">Tiempo</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <div className="text-xl font-bold text-red-500">{vidas} ❤️</div>
            <div className="text-sm text-gray-600">Vidas</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <div className="text-xl font-bold text-purple-600">x{combo}</div>
            <div className="text-sm text-gray-600">Combo</div>
          </div>
        </div>
      </div>

      <div 
        ref={gameAreaRef}
        onTouchMove={manejarTouchMove}
        className="relative bg-gradient-to-b from-blue-200 to-purple-200 rounded-2xl h-96 mb-6 border-2 border-blue-400 overflow-hidden touch-none"
      >
        {copos.map(copo => (
          <div
            key={copo.id}
            className={`absolute text-3xl transition-all duration-150 ${
              copo.cortado ? 'opacity-0 scale-150' : 'opacity-100'
            } ${copo.tipo.esBomba ? 'animate-pulse' : 'animate-bounce'}`}
            style={{
              left: `${copo.x}%`,
              top: `${copo.y}%`,
              transform: 'translate(-50%, -50%)',
              filter: copo.cortado ? 'blur(5px)' : 'none'
            }}
          >
            {copo.tipo.emoji}
          </div>
        ))}
        
        {!jugando && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-2xl">
            <div className="text-center p-6">
              {tiempoRestante === 0 || vidas === 0 ? (
                <>
                  <div className="text-3xl font-bold mb-2 text-red-600">
                    {vidas === 0 ? '💥 Game Over' : '⏰ ¡Tiempo!'}
                  </div>
                  <p className="text-gray-700 mb-4">Puntuación: {puntuacion}</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-4">⚔️</div>
                  <p className="text-gray-700 mb-4">Corta los copos, evita las bombas</p>
                </>
              )}
              <button
                onClick={iniciarJuego}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all"
              >
                🎮 Comenzar
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={volverASeleccion}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
      >
        ← Volver a Juegos 3
      </button>
    </div>
  );
};

// =============================================
// 4. 🧩 LABERINTO
// =============================================
const Laberinto = ({ volverASeleccion, guardarEnRanking }) => {
  const [laberinto, setLaberinto] = useState([]);
  const [posicion, setPosicion] = useState({ x: 1, y: 1 });
  const [meta, setMeta] = useState({ x: 8, y: 8 });
  const [movimientos, setMovimientos] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [completado, setCompletado] = useState(false);

  const generarLaberinto = (nivel) => {
    const tamaño = 5 + nivel * 2;
    const grid = Array(tamaño).fill().map(() => Array(tamaño).fill(1));
    
    // Crear camino básico
    for (let i = 1; i < tamaño - 1; i++) {
      for (let j = 1; j < tamaño - 1; j++) {
        if (Math.random() > 0.3) grid[i][j] = 0;
      }
    }
    
    // Asegurar camino de inicio a meta
    grid[1][1] = 0; // Inicio
    grid[tamaño-2][tamaño-2] = 0; // Meta
    
    return grid;
  };

  useEffect(() => {
    const nuevoLaberinto = generarLaberinto(nivel);
    setLaberinto(nuevoLaberinto);
    setPosicion({ x: 1, y: 1 });
    setMeta({ x: nuevoLaberinto.length-2, y: nuevoLaberinto[0].length-2 });
    setMovimientos(0);
    setCompletado(false);
  }, [nivel]);

  const manejarTecla = (e) => {
    if (completado) return;
    
    const { x, y } = posicion;
    let nuevaX = x, nuevaY = y;

    switch(e.key) {
      case 'ArrowUp': nuevaY--; break;
      case 'ArrowDown': nuevaY++; break;
      case 'ArrowLeft': nuevaX--; break;
      case 'ArrowRight': nuevaX++; break;
      default: return;
    }

    if (nuevaX >= 0 && nuevaX < laberinto[0].length && 
        nuevaY >= 0 && nuevaY < laberinto.length &&
        laberinto[nuevaY][nuevaX] === 0) {
      setPosicion({ x: nuevaX, y: nuevaY });
      setMovimientos(prev => prev + 1);
      
      if (nuevaX === meta.x && nuevaY === meta.y) {
        setCompletado(true);
        const puntuacion = calcularPuntuacionLaberinto(movimientos + 1, nivel);
        guardarEnRanking("laberinto", puntuacion, {
          nivel: nivel,
          movimientos: movimientos + 1,
          tamaño: laberinto.length
        });
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [laberinto, posicion, completado]);

  const calcularPuntuacionLaberinto = (movimientos, nivel) => {
    const base = nivel * 100;
    const bonus = Math.max(0, 500 - movimientos * 10);
    return base + bonus;
  };

  const siguienteNivel = () => {
    setNivel(prev => prev + 1);
  };

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6">🧩 Laberinto</h2>
      
      <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-3">
            <div className="text-xl font-bold text-green-600">Nvl {nivel}</div>
            <div className="text-sm text-gray-600">Nivel</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <div className="text-xl font-bold text-blue-600">{movimientos}</div>
            <div className="text-sm text-gray-600">Movimientos</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <div className="text-xl font-bold text-purple-600">
              {laberinto.length}x{laberinto[0]?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Tamaño</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-gray-300">
        <div className="inline-grid gap-1 p-4 bg-gray-100 rounded-lg">
          {laberinto.map((fila, y) => (
            <div key={y} className="flex gap-1">
              {fila.map((celda, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`w-6 h-6 rounded-sm ${
                    celda === 1 ? 'bg-gray-800' : 
                    x === posicion.x && y === posicion.y ? 'bg-green-500 animate-pulse' :
                    x === meta.x && y === meta.y ? 'bg-red-500' : 'bg-white'
                  } border border-gray-300`}
                >
                  {x === posicion.x && y === posicion.y && '🎅'}
                  {x === meta.x && y === meta.y && posicion.x !== x && posicion.y !== y && '🎁'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {completado && (
        <div className="bg-green-100 border-2 border-green-400 rounded-2xl p-6 mb-6">
          <div className="text-2xl font-bold text-green-700 mb-2">🎉 ¡Nivel Completado!</div>
          <p className="text-green-600 mb-4">
            Puntuación: {calcularPuntuacionLaberinto(movimientos, nivel)}
          </p>
          <button
            onClick={siguienteNivel}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all"
          >
            ➡️ Siguiente Nivel
          </button>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setNivel(1)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all"
        >
          🔄 Reiniciar
        </button>
        <button
          onClick={() => setNivel(prev => Math.max(1, prev - 1))}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-all"
        >
          ⬅️ Anterior
        </button>
        <button
          onClick={() => setNivel(prev => prev + 1)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-all"
        >
          Siguiente ➡️
        </button>
      </div>

      <button
        onClick={volverASeleccion}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
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
  const [velocidad, setVelocidad] = useState(150);
  const gameAreaRef = useRef(null);

  const generarComida = () => {
    const x = Math.floor(Math.random() * 20);
    const y = Math.floor(Math.random() * 20);
    setComida({ x, y });
  };

  useEffect(() => {
    if (gameOver) return;

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
  }, [direccion, gameOver]);

  useEffect(() => {
    if (gameOver) return;

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
            longitud: prevSnake.length,
            velocidad: velocidad
          });
          return prevSnake;
        }

        // Colisión consigo mismo
        if (prevSnake.some(segmento => segmento.x === cabeza.x && segmento.y === cabeza.y)) {
          setGameOver(true);
          guardarEnRanking("snake", puntuacion, {
            longitud: prevSnake.length,
            velocidad: velocidad
          });
          return prevSnake;
        }

        const nuevoSnake = [cabeza, ...prevSnake];

        // Comer comida
        if (cabeza.x === comida.x && cabeza.y === comida.y) {
          setPuntuacion(prev => {
            const nuevaPuntuacion = prev + 10;
            if (nuevaPuntuacion % 50 === 0) {
              setVelocidad(prevVel => Math.max(50, prevVel - 10));
            }
            return nuevaPuntuacion;
          });
          generarComida();
        } else {
          nuevoSnake.pop();
        }

        return nuevoSnake;
      });
    }, velocidad);

    return () => clearInterval(gameLoop);
  }, [direccion, comida, gameOver, velocidad, puntuacion]);

  const reiniciarJuego = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDireccion('RIGHT');
    setPuntuacion(0);
    setGameOver(false);
    setVelocidad(150);
    generarComida();
  };

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6">🐍 Snake</h2>
      
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-3">
            <div className="text-xl font-bold text-green-600">{puntuacion}</div>
            <div className="text-sm text-gray-600">Puntos</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <div className="text-xl font-bold text-blue-600">{snake.length}</div>
            <div className="text-sm text-gray-600">Longitud</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <div className="text-xl font-bold text-purple-600">{velocidad}ms</div>
            <div className="text-sm text-gray-600">Velocidad</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-4 mb-6">
        <div 
          ref={gameAreaRef}
          className="grid grid-cols-20 grid-rows-20 gap-1 w-80 h-80 mx-auto bg-gray-900 rounded-lg p-2"
        >
          {Array.from({ length: 20 }).map((_, y) =>
            Array.from({ length: 20 }).map((_, x) => {
              const esSnake = snake.some(segmento => segmento.x === x && segmento.y === y);
              const esCabeza = snake[0].x === x && snake[0].y === y;
              const esComida = comida.x === x && comida.y === y;
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={`w-3 h-3 rounded-sm ${
                    esCabeza ? 'bg-green-500 animate-pulse' :
                    esSnake ? 'bg-green-400' :
                    esComida ? 'bg-red-500 animate-bounce' : 'bg-gray-700'
                  }`}
                />
              );
            })
          )}
        </div>
      </div>

      {gameOver && (
        <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-6 mb-6">
          <div className="text-2xl font-bold text-red-700 mb-2">💀 Game Over</div>
          <p className="text-red-600 mb-4">Puntuación: {puntuacion}</p>
          <button
            onClick={reiniciarJuego}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all"
          >
            🔄 Jugar Otra Vez
          </button>
        </div>
      )}

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
// 🏆 COMPONENTE RANKING PARA JUEGOS 3
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
      default: return "🔹";
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
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                jugador.esUsuarioActual ? 'bg-blue-50 ring-2 ring-blue-400' : 'bg-gray-50'
              }`}
            >
              <span className="text-sm font-bold w-6 text-center">
                {obtenerEmojiPosicion(jugador.posicion)}
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {jugador.nombre?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className={`text-sm font-medium truncate flex-1 ${
                jugador.esUsuarioActual ? 'text-blue-600 font-bold' : 'text-gray-700'
              }`}>
                {jugador.esUsuarioActual ? "TÚ" : jugador.nombre}
              </span>
              <span className="text-sm font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {jugador.mejorPuntuacion}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🏆</div>
            <p className="text-gray-500 text-sm">Sin datos aún</p>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================
// 🎯 COMPONENTE PRINCIPAL JUEGOS 3
// =============================================
export default function Juegos3() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [juegoActivo, setJuegoActivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [rankingGlobal, setRankingGlobal] = useState({});

  const juegos3 = [
    {
      id: "ze-geometric",
      nombre: "🎨 Ze Geometric",
      descripcion: "Crea con bloques geométricos",
      icono: "🎨",
      color: "from-purple-500 to-pink-500",
      dificultad: "Creativo",
      edad: "3+"
    },
    {
      id: "pong",
      nombre: "🎮 Pong",
      descripcion: "Clásico juego de paletas",
      icono: "🎮",
      color: "from-green-500 to-blue-500",
      dificultad: "Medio",
      edad: "6+"
    },
    {
      id: "cortador-copos",
      nombre: "❄️ Cortador de Copos",
      descripcion: "Fruit Ninja navideño",
      icono: "❄️",
      color: "from-blue-500 to-cyan-500",
      dificultad: "Difícil",
      edad: "8+"
    },
    {
      id: "laberinto",
      nombre: "🧩 Laberinto",
      descripcion: "Encuentra la salida",
      icono: "🧩",
      color: "from-yellow-500 to-orange-500",
      dificultad: "Medio",
      edad: "7+"
    },
    {
      id: "snake",
      nombre: "🐍 Snake",
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
              fecha: jugador.fechaUltimoIntento,
              avatar: jugador.avatar
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
    return <div className="text-center py-8">Cargando Juegos 3...</div>;
  }

  if (!usuarioActual) {
    return <div className="text-center py-8">Redirigiendo al login...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent">
            🎮 Juegos 3 - Clásicos
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-light">
            Juegos clásicos reinventados con ranking en tiempo real
          </p>
          
          {mensaje && (
            <div className={`inline-block px-4 py-2 rounded-lg mb-4 ${
              mensaje.includes('✅') || mensaje.includes('🎉') ? 'bg-green-100 text-green-700 border border-green-300' :
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
                  className={`bg-gradient-to-br ${juego.color} rounded-2xl p-6 text-white text-center shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
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
                  <div className="mt-2 bg-white/30 rounded-full px-3 py-1 text-sm">
                    Mejor: {rankingGlobal[juego.id]?.[usuarioActual.id]?.puntuacion || 0} pts
                  </div>
                </div>
              ))}
            </div>

            {/* SECCIÓN DE RANKINGS */}
            <div className="bg-white/90 rounded-2xl p-8 shadow-2xl border-2 border-green-200 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">🏆 Rankings - 5 Juegos Clásicos</h2>
                <button 
                  onClick={cargarRankingsJuegos3}
                  disabled={cargando}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {cargando ? '🔄' : '🔄 Actualizar'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {juegos3.map((juego) => (
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
          </>
        ) : (
          /* ÁREA DE JUEGO ACTIVO */
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-green-200 max-w-4xl mx-auto">
            {juegoActivo === "ze-geometric" && (
              <ZeGeometric 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos3}
              />
            )}
            {juegoActivo === "pong" && (
              <Pong 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos3}
              />
            )}
            {juegoActivo === "cortador-copos" && (
              <CortadorCopos 
                volverASeleccion={volverASeleccion}
                guardarEnRanking={guardarEnRankingJuegos3}
              />
            )}
            {juegoActivo === "laberinto" && (
              <Laberinto 
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
        <div className="text-center space-y-4">
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg mx-2"
          >
            🏠 Volver al Home
          </Link>
        </div>
      </div>
    </div>
  );
}