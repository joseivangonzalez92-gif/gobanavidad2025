import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DeviceModeToggle from './DeviceModeToggle';

export default function GlassyDesktopDashboard({ usuario, infoFechas, onLogout }) {
  const navigate = useNavigate();

  // 1. Clock state
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const fechaFormateada = useMemo(() => {
    return time.toLocaleDateString('es-ES', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
  }, [time]);

  // Greeting
  const saludo = useMemo(() => {
    const h = time.getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }, [time]);

  // 2. Search state
  const [searchQuery, setSearchQuery] = useState('');

  // 3. To-Do state with localStorage
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('goba_glassy_todos');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      { id: 1, text: 'Encontrar las 6 palabras en la Sopa de Letras', completed: false, tag: 'Sopa' },
      { id: 2, text: 'Completar 1 partida de Pong contra la IA', completed: true, tag: 'Pong' },
      { id: 3, text: 'Superar 100 puntos en Carrera de Trineo', completed: false, tag: 'Trineo' },
      { id: 4, text: 'Resolver las 5 palabras del Wordle Navideño', completed: false, tag: 'Wordle' },
      { id: 5, text: 'Encontrar los 10 pares en Memory Navideño', completed: false, tag: 'Memory' },
    ];
  });
  const [newTodoText, setNewTodoText] = useState('');

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: newTodoText.trim(),
      completed: false,
      tag: 'Personal'
    };
    const updated = [newTodo, ...todos];
    setTodos(updated);
    localStorage.setItem('goba_glassy_todos', JSON.stringify(updated));
    setNewTodoText('');
  };

  const toggleTodo = (id) => {
    const updated = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTodos(updated);
    localStorage.setItem('goba_glassy_todos', JSON.stringify(updated));
  };

  const clearCompletedTodos = () => {
    const updated = todos.filter(t => !t.completed);
    setTodos(updated);
    localStorage.setItem('goba_glassy_todos', JSON.stringify(updated));
  };

  const pendingCount = todos.filter(t => !t.completed).length;

  // 4. Notes state with localStorage
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem('goba_glassy_notes') || 
      '🎮 Estrategias del Arcade 2026:\n- En Sopa de Letras buscar palabras largas primero.\n- En Trineo usar flechas o A/D para esquivar pinos.\n- ¡Que gane el mejor en los rankings de juegos!';
  });

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem('goba_glassy_notes', val);
  };

  const clearNotes = () => {
    if (window.confirm('¿Deseas borrar tus notas?')) {
      setNotes('');
      localStorage.removeItem('goba_glassy_notes');
    }
  };

  // 5. Pomodoro / Festive timer
  const [pomodoroMode, setPomodoroMode] = useState('focus'); // focus (25), short (5), long (15)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (pomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setPomodoroRunning(false);
      playFestiveChime();
    }
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroTime]);

  const setPomoMode = (mode, minutes) => {
    setPomodoroMode(mode);
    setPomodoroTime(minutes * 60);
    setPomodoroRunning(false);
  };

  const formatPomoTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 6. Christmas Chime Sound Synthesizer (Web Audio API)
  const playFestiveChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notesFreq = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notesFreq.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.9);
      });
    } catch {
      // Audio might be blocked before first user interaction
    }
  };

  // Navigation search items para el Arcade de Juegos 2026
  const allSections = [
    { title: 'Midnight Drag 1 KM (NFS Style)', to: '/drag', icon: '🏎️', cat: 'Velocidad', desc: 'Carrera de aceleración 1 km, 6 marchas manuales, nitro y esquiva de tráfico nocturno' },
    { title: 'Catálogo Completo Arcade', to: '/arcade', icon: '🕹️', cat: 'Catálogo', desc: 'Todos los 16 juegos organizados por categorías con acceso directo' },
    { title: 'Snowline (Miniclip Oficial)', to: '/snowline', icon: '🎿', cat: 'Destacado', desc: 'Dibuja pendientes de nieve con física real para Santa en 10 niveles' },
    { title: 'Sala 1 - Juegos Clásicos', to: '/juegos', icon: '🎮', cat: 'Arcade 1', desc: 'Memory, Adivina Película, Canciones, Refranes' },
    { title: 'Sala 2 - Minijuegos & Reflejos', to: '/juegos2', icon: '🕹️', cat: 'Arcade 2', desc: 'Wordle Navideño, Simón Dice, Trineo, Reflejos' },
    { title: 'Sala 3 - Conquista & Acción', to: '/juegos3', icon: '🎯', cat: 'Arcade 3', desc: 'Sopa de Letras, Pong, Snake, Santa Gifts, Tablero' },
    { title: 'Sopa de Letras Navideña', to: '/juegos3', icon: '🧩', cat: 'Juegos', desc: '3 niveles con palabras navideñas en español' },
    { title: 'Pong Navideño', to: '/juegos3', icon: '🏓', cat: 'Juegos', desc: 'Compite contra la IA en la pista de hielo' },
    { title: 'Snake Navideño', to: '/juegos3', icon: '🐍', cat: 'Juegos', desc: 'Clásica serpiente en el polo norte' },
    { title: 'Santa Gifts Trineo', to: '/juegos3', icon: '🎅', cat: 'Juegos', desc: 'Entrega regalos en las chimeneas' },
    { title: 'Wordle Navideño', to: '/juegos2', icon: '🔤', cat: 'Juegos', desc: '5 palabras navideñas por sesión' },
    { title: 'Carrera de Trineo', to: '/juegos2', icon: '🎿', cat: 'Juegos', desc: 'Esquiva pinos a toda velocidad' },
    { title: 'Memory Navideño', to: '/juegos', icon: '🧠', cat: 'Juegos', desc: '10 parejas de emojis festivos' },
    { title: 'Tabla de Récords & Rankings', to: '/rankings', icon: '🏆', cat: 'Rankings', desc: 'Líderes de cada juego y puntuaciones' },
    { title: 'Mi Perfil de Jugador', to: '/perfil', icon: usuario?.avatar || '👤', cat: 'Perfil', desc: 'Tus puntos acumulados y territorio' },
    /* --- SECCIONES NO-JUEGOS COMENTADAS PARA REUTILIZAR EL PRÓXIMO AÑO ---
    { title: 'GOBA Awards 2026', to: '/votaciones', icon: '🏆', cat: 'Votaciones', desc: 'Vota en 25 categorías' },
    { title: 'Retos Familiares', to: '/challenges', icon: '🥇', cat: 'Retos', desc: 'Desafíos semanales y puntos' },
    { title: 'Galería de Recuerdos', to: '/fotos', icon: '📸', cat: 'Fotos', desc: 'Momentos y fotos familiares' },
    { title: 'Adviento 2026', to: '/navidad', icon: '🕯️', cat: 'Adviento', desc: 'Evangelios, villancicos y reflexiones' },
    { title: 'Calendario & Actividades', to: '/calendario', icon: '📅', cat: 'Eventos', desc: 'Fechas importantes y actividades' },
    { title: 'Tienda de Premios', to: '/tienda', icon: '🛍️', cat: 'Premios', desc: 'Canjea puntos por recompensas' },
    ---------------------------------------------------------------------- */
    { title: 'Panel de Administración', to: '/admin', icon: '⚙️', cat: 'Admin', desc: 'Gestión y moderación' },
  ];

  const filteredSections = searchQuery.trim()
    ? allSections.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div 
      className="relative min-h-screen text-white font-sans antialiased overflow-x-hidden select-none pb-20"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.72), rgba(10, 15, 29, 0.82)), url('/assets/aistudio/image_3908db64.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Top Floating Header */}
      <header className="sticky top-0 z-40 px-6 py-3 backdrop-blur-xl bg-black/35 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🎄</span>
          <div>
            <span className="font-extrabold tracking-wider text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-200 to-emerald-400">
              NAVIDAD 2026 · ARCADE DE JUEGOS
            </span>
          </div>
        </div>

        {/* Center quick links */}
        <nav className="hidden lg:flex items-center gap-3 text-xs font-medium text-white/70">
          <Link to="/home" className="text-white hover:text-white transition-colors bg-white/15 px-3 py-1 rounded-full font-bold">Arcade Hub</Link>
          <Link to="/drag" className="text-amber-300 hover:text-white transition-colors px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 font-bold hover:bg-amber-500/30">🏎️ Drag 1KM</Link>
          <Link to="/snowline" className="text-cyan-300 hover:text-white transition-colors px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 font-bold hover:bg-cyan-500/30">🎿 Snowline</Link>
          <Link to="/arcade" className="text-purple-300 hover:text-white transition-colors px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 font-bold hover:bg-purple-500/30">🕹️ Catálogo (16)</Link>
          <Link to="/juegos" className="hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-white/10">🎮 Clásicos</Link>
          <Link to="/juegos2" className="hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-white/10">🕹️ Minijuegos</Link>
          <Link to="/juegos3" className="hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-white/10">🎯 Conquista</Link>
          <Link to="/rankings" className="hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-white/10">🏆 Rankings</Link>
          <Link to="/perfil" className="hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-white/10">👤 Mi Perfil</Link>
          {/* Enlaces no-juegos comentados para reactivar el próximo año:
          <Link to="/votaciones">GOBA Awards</Link>
          <Link to="/challenges">Retos</Link>
          <Link to="/fotos">Galería</Link>
          <Link to="/tienda">Tienda</Link>
          <Link to="/calendario">Calendario</Link>
          */}
        </nav>

        {/* Right User & Mode Switcher */}
        <div className="flex items-center gap-3">
          <DeviceModeToggle />

          <button 
            onClick={playFestiveChime}
            title="Tocar campanitas navideñas"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-sm transition-all hover:scale-110"
          >
            🔔
          </button>

          <Link 
            to="/perfil" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs"
          >
            <span className="text-base">{usuario?.avatar || '👤'}</span>
            <span className="font-semibold text-white/90 max-w-[120px] truncate">
              {usuario?.nombre || 'Invitado'}
            </span>
          </Link>

          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="px-3 py-1.5 rounded-full bg-red-600/70 hover:bg-red-600 text-xs text-white border border-red-400/30 transition-all font-medium"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main Glassy Dashboard Canvas */}
      <main className="max-w-[1520px] mx-auto px-6 pt-6 pb-12">

        {/* SEARCH OVERLAY IF QUERY IS ACTIVE */}
        {searchQuery.trim() && (
          <div className="mb-6 p-4 rounded-3xl backdrop-blur-2xl bg-black/60 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs uppercase tracking-wider text-white/60">
                Resultados para "{searchQuery}" ({filteredSections.length})
              </span>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-white/60 hover:text-white px-2 py-0.5 rounded bg-white/10"
              >
                Cerrar ✕
              </button>
            </div>
            {filteredSections.length === 0 ? (
              <p className="text-sm text-white/50 py-4 text-center">No se encontraron secciones para "{searchQuery}"</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filteredSections.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.to}
                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center gap-3 group"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <p className="text-xs text-white/60">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TOP ROW OF GLASS CARDS (Matching image_cc9d9344.png) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

          {/* 1. CLOCK WIDGET (Left ~3 cols) */}
          <div className="lg:col-span-3 rounded-3xl p-6 backdrop-blur-xl bg-black/40 border border-white/15 shadow-2xl flex flex-col items-center justify-between relative overflow-hidden group hover:border-white/25 transition-all">
            {/* Background subtle ring */}
            <div className="w-52 h-52 rounded-full border border-red-500/20 absolute -top-4 -left-4 pointer-events-none opacity-40 group-hover:scale-105 transition-transform duration-700"></div>

            {/* Top status */}
            <div className="w-full flex justify-between items-center text-xs text-white/60">
              <span className="tracking-widest uppercase text-[11px] font-semibold text-red-400">Hora Oficial</span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                UTC-6
              </span>
            </div>

            {/* Stylized Giant Digits (Hour over Minute as in reference image) */}
            <div className="my-3 flex flex-col items-center justify-center relative z-10">
              <div className="w-48 h-48 rounded-full border border-red-500/30 flex flex-col items-center justify-center bg-black/20 shadow-inner backdrop-blur-md">
                <div className="text-7xl font-light tracking-tighter text-red-300/90 leading-none filter drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                  {hours}
                </div>
                <div className="text-7xl font-bold tracking-tighter text-red-400/90 leading-none filter drop-shadow-[0_0_16px_rgba(239,68,68,0.6)]">
                  {minutes}
                </div>
              </div>
            </div>

            {/* Date and Greeting */}
            <div className="text-center w-full z-10 pt-2 border-t border-white/10">
              <div className="text-xs font-semibold tracking-wider text-white/80">
                {fechaFormateada}
              </div>
              <div className="text-xs text-white/60 mt-1 flex items-center justify-center gap-1.5">
                <span>❄️</span>
                <span>{saludo}, {usuario?.nombre?.split(' ')[0] || 'Familia'}</span>
              </div>
            </div>
          </div>

          {/* 2. CENTRAL ARCADE HUB (Center ~6 cols) */}
          <div className="lg:col-span-6 rounded-3xl p-8 backdrop-blur-xl bg-black/40 border border-white/15 shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-white/25 transition-all">
            {/* Top row: Brand & User indicator */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>ARCADE</span>
                  <span className="text-red-400 text-2xl font-light">2026</span>
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Plataforma de Juegos Navideños 2026 · Desafía a tus Amigos
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/15 text-xs">
                <span>{usuario?.nombre || 'Jugador'}</span>
                <span>🎮</span>
              </div>
            </div>

            {/* Quick Search bar */}
            <div className="relative my-4">
              <div className="flex items-center bg-white/10 rounded-2xl border border-white/20 px-4 py-3 focus-within:border-red-400/60 focus-within:bg-black/50 transition-all shadow-lg">
                <span className="text-white/50 text-sm mr-3">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar juegos: Sopa de Letras, Pong, Wordle, Trineo, Memory, Snake..."
                  className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {}}
                  className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-md ml-2 shrink-0"
                >
                  ➔
                </button>
              </div>
            </div>

            {/* Quick circular icon dock - JUEGOS Y SALAS */}
            <div className="mt-2 pt-4 border-t border-white/10">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-3 text-center">
                Acceso Rápido a Minijuegos
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {[
                  { icon: '🎿', title: 'Snowline', to: '/snowline', color: 'hover:bg-cyan-500/40 border-cyan-400/50 bg-cyan-900/30' },
                  { icon: '🎮', title: 'Clásicos 1', to: '/juegos', color: 'hover:bg-purple-500/30' },
                  { icon: '🕹️', title: 'Minijuegos 2', to: '/juegos2', color: 'hover:bg-pink-500/30' },
                  { icon: '🎯', title: 'Conquista 3', to: '/juegos3', color: 'hover:bg-red-500/30' },
                  { icon: '🧩', title: 'Sopa Letras', to: '/juegos3', color: 'hover:bg-blue-500/30' },
                  { icon: '🏓', title: 'Pong', to: '/juegos3', color: 'hover:bg-green-500/30' },
                  { icon: '🐍', title: 'Snake', to: '/juegos3', color: 'hover:bg-emerald-500/30' },
                  { icon: '🔤', title: 'Wordle', to: '/juegos2', color: 'hover:bg-amber-500/30' },
                  { icon: '🏆', title: 'Rankings', to: '/rankings', color: 'hover:bg-yellow-500/30' },
                  { icon: '👤', title: 'Mi Perfil', to: '/perfil', color: 'hover:bg-indigo-500/30' },
                ].map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl bg-white/10 border border-white/10 ${item.color} transition-all transform hover:scale-105 group text-center`}
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform duration-200">{item.icon}</span>
                    <span className="text-[10px] text-white/70 mt-1 font-medium group-hover:text-white truncate w-full">
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 3. WEATHER & COUNTDOWN CARD (Right ~3 cols) */}
          <div className="lg:col-span-3 rounded-3xl p-6 backdrop-blur-xl bg-black/40 border border-white/15 shadow-2xl flex flex-col justify-between group hover:border-white/25 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Arcade 2026</h3>
                <p className="text-[11px] text-white/50">Temporada Navideña</p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold">
                ● En Línea
              </span>
            </div>

            {/* Central Weather/Temperature Display */}
            <div className="flex items-center justify-between my-4 px-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-red-500/20 border border-white/20 flex items-center justify-center text-3xl shadow-lg">
                🕹️
              </div>
              <div className="text-right">
                <div className="text-4xl font-extrabold text-white flex items-start justify-end">
                  <span>14</span>
                  <span className="text-base text-red-400 font-medium ml-1">Juegos</span>
                </div>
                <div className="flex items-center gap-1 justify-end mt-1 text-[11px] text-emerald-400 font-semibold">
                  <span>3 Salas Disponibles</span>
                </div>
              </div>
            </div>

            {/* 3 Metrics */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-center">
              <div className="bg-white/5 p-2 rounded-xl">
                <div className="text-red-400 text-xs mb-0.5">🎄</div>
                <div className="text-sm font-bold text-white">{infoFechas?.diasNavidad ?? 0}</div>
                <div className="text-[9px] text-white/50 uppercase">Días Nav.</div>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <div className="text-emerald-400 text-xs mb-0.5">🎆</div>
                <div className="text-sm font-bold text-white">{infoFechas?.diasAñoNuevo ?? 0}</div>
                <div className="text-[9px] text-white/50 uppercase">Año Nuevo</div>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <div className="text-amber-400 text-xs mb-0.5">⭐</div>
                <div className="text-sm font-bold text-white">{usuario?.puntos || 0}</div>
                <div className="text-[9px] text-white/50 uppercase">Tus Puntos</div>
              </div>
            </div>

            {/* Mini festive highlights */}
            <div className="pt-3 flex items-center justify-between text-xs text-white/70">
              <div className="flex items-center gap-2">
                <span className="text-base">🏆</span>
                <span>Compite por el #1 semanal</span>
              </div>
              <Link to="/rankings" className="text-red-400 hover:text-red-300 font-semibold">
                Rankings →
              </Link>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: SALAS DEL ARCADE, TO-DO RETOS Y NOTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* CARD 1: SALAS DEL ARCADE 2026 (Left ~4 cols) */}
          <div className="lg:col-span-4 rounded-3xl p-6 backdrop-blur-xl bg-black/40 border border-white/15 shadow-2xl flex flex-col justify-between group hover:border-white/25 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                <span className="text-yellow-400">⚡</span>
                <span>SALAS DEL ARCADE 2026</span>
              </h3>
              <Link 
                to="/rankings" 
                title="Ver Récords"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white/70"
              >
                🏆
              </Link>
            </div>

            {/* DESTACADO ESTRELLA: SNOWLINE MINICLIP */}
            <Link 
              to="/snowline"
              className="mb-3 block p-3 rounded-2xl bg-gradient-to-r from-sky-600/40 via-blue-600/40 to-cyan-500/30 border border-cyan-400/40 hover:border-cyan-300 transition-all shadow-lg hover:shadow-cyan-500/20 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-cyan-500 text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    🎿
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white group-hover:text-cyan-200">SNOWLINE</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-400/30 text-cyan-200 border border-cyan-300/40">MINICLIP CLÁSICO</span>
                    </div>
                    <p className="text-xs text-white/70">Dibuja la nieve para guiar el trineo de Santa · 10 Niveles</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-cyan-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Jugar</span>
                  <span>➔</span>
                </div>
              </div>
            </Link>

            {/* App Tiles Grid - 3 Salas principales y juegos estrella */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Link 
                to="/juegos"
                className="p-4 rounded-2xl bg-gradient-to-br from-purple-600/30 to-purple-900/30 hover:from-purple-600/50 hover:to-purple-900/50 border border-purple-500/30 flex flex-col items-center justify-center text-center transition-all transform hover:scale-105 group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-2xl shadow-lg mb-2 group-hover:scale-110 transition-transform">
                  🎮
                </div>
                <span className="text-xs font-semibold text-white">Clásicos 1</span>
                <span className="text-[10px] text-purple-300">Memory & Canción</span>
              </Link>

              <Link 
                to="/juegos2"
                className="p-4 rounded-2xl bg-gradient-to-br from-pink-600/30 to-pink-900/30 hover:from-pink-600/50 hover:to-pink-900/50 border border-pink-500/30 flex flex-col items-center justify-center text-center transition-all transform hover:scale-105 group"
              >
                <div className="w-12 h-12 rounded-xl bg-pink-600 flex items-center justify-center text-2xl shadow-lg mb-2 group-hover:scale-110 transition-transform">
                  🕹️
                </div>
                <span className="text-xs font-semibold text-white">Minijuegos 2</span>
                <span className="text-[10px] text-pink-300">Wordle & Trineo</span>
              </Link>

              <Link 
                to="/juegos3"
                className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/30 to-blue-900/30 hover:from-blue-600/50 hover:to-blue-900/50 border border-blue-500/30 flex flex-col items-center justify-center text-center transition-all transform hover:scale-105 group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-2xl shadow-lg mb-2 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <span className="text-xs font-semibold text-white">Conquista 3</span>
                <span className="text-[10px] text-blue-300">Sopa, Pong, Snake</span>
              </Link>

              <Link 
                to="/juegos3"
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600/30 to-emerald-900/30 hover:from-emerald-600/50 hover:to-emerald-900/50 border border-emerald-500/30 flex flex-col items-center justify-center text-center transition-all transform hover:scale-105 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-2xl shadow-lg mb-2 group-hover:scale-110 transition-transform">
                  🧩
                </div>
                <span className="text-xs font-semibold text-white">Sopa Letras</span>
                <span className="text-[10px] text-emerald-300">3 Niveles</span>
              </Link>

              <Link 
                to="/juegos3"
                className="p-4 rounded-2xl bg-gradient-to-br from-cyan-600/30 to-cyan-900/30 hover:from-cyan-600/50 hover:to-cyan-900/50 border border-cyan-500/30 flex flex-col items-center justify-center text-center transition-all transform hover:scale-105 group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center text-2xl shadow-lg mb-2 group-hover:scale-110 transition-transform">
                  🏓
                </div>
                <span className="text-xs font-semibold text-white">Pong 2026</span>
                <span className="text-[10px] text-cyan-300">Pista Helada</span>
              </Link>

              <Link 
                to="/rankings"
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-600/30 to-amber-900/30 hover:from-amber-600/50 hover:to-amber-900/50 border border-amber-500/30 flex flex-col items-center justify-center text-center transition-all transform hover:scale-105 group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center text-2xl shadow-lg mb-2 group-hover:scale-110 transition-transform">
                  🏆
                </div>
                <span className="text-xs font-semibold text-white">Rankings</span>
                <span className="text-[10px] text-amber-300">Tabla de Puntos</span>
              </Link>
            </div>

            <div className="pt-2 text-[11px] text-white/50 text-center">
              Elige una sala o juego para comenzar a sumar puntos
            </div>

            {/* SECCIONES COMENTADAS PARA EL PRÓXIMO AÑO:
            <Link to="/votaciones">GOBA Awards</Link>
            <Link to="/challenges">Retos Familiares</Link>
            <Link to="/fotos">Galería de Recuerdos</Link>
            <Link to="/tienda">Tienda de Premios</Link>
            */}
          </div>

          {/* CARD 2: TO-DO (Center ~4 cols) */}
          <div className="lg:col-span-4 rounded-3xl p-6 backdrop-blur-xl bg-black/40 border border-white/15 shadow-2xl flex flex-col justify-between group hover:border-white/25 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                  <span className="text-red-400">🎯</span>
                  <span>RETOS DE JUGADOR</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-600/60 text-white text-[11px] font-bold">
                  {pendingCount}
                </span>
              </div>

              {/* Add Todo input */}
              <form onSubmit={handleAddTodo} className="mb-4">
                <div className="flex items-center bg-white/10 rounded-2xl border border-white/15 px-3 py-2 focus-within:border-white/40">
                  <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Añadir nuevo objetivo de juego..."
                    className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs flex items-center justify-center shrink-0 ml-1"
                  >
                    +
                  </button>
                </div>
              </form>

              {/* Todo List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {todos.map(todo => (
                  <div
                    key={todo.id}
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      todo.completed
                        ? 'bg-white/5 border-white/5 text-white/40 line-through'
                        : 'bg-white/10 border-white/10 text-white/90 hover:bg-white/15'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => {}}
                      className="mt-0.5 accent-red-500 rounded cursor-pointer"
                    />
                    <span className="text-xs flex-1">{todo.text}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                      {todo.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clear completed */}
            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={clearCompletedTodos}
                className="text-[11px] text-white/50 hover:text-white transition-colors"
              >
                Limpiar completadas
              </button>
            </div>
          </div>

          {/* CARD 3: NOTES (Right ~4 cols) */}
          <div className="lg:col-span-4 rounded-3xl p-6 backdrop-blur-xl bg-black/40 border border-white/15 shadow-2xl flex flex-col justify-between group hover:border-white/25 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                  <span className="text-purple-400">📝</span>
                  <span>NOTAS & ESTRATEGIAS</span>
                </h3>
                <button
                  onClick={clearNotes}
                  title="Borrar nota"
                  className="text-white/40 hover:text-red-400 text-xs transition-colors"
                >
                  🗑️
                </button>
              </div>

              {/* Textarea matching reference notes */}
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Escribe aquí cualquier pensamiento, recuerdo o deseo para la familia... Se guarda automáticamente."
                rows={8}
                className="w-full bg-white/10 border border-white/15 rounded-2xl p-3.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
              <span>Guardado en tiempo real</span>
              <span>{notes.length} caracteres</span>
            </div>
          </div>

        </div>

        {/* BOTTOM WIDGET BAR: POMODORO & AMBIANCE (Matching bottom bar in reference) */}
        <div className="mt-6 rounded-3xl p-4 backdrop-blur-xl bg-black/45 border border-white/15 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          
          {/* Pomodoro controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <span>⏱️</span>
              <span>TEMPORIZADOR:</span>
            </span>

            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs">
              <button
                onClick={() => setPomoMode('focus', 25)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  pomodoroMode === 'focus' ? 'bg-red-600 text-white font-semibold' : 'text-white/70 hover:text-white'
                }`}
              >
                Enfoque (25m)
              </button>
              <button
                onClick={() => setPomoMode('short', 5)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  pomodoroMode === 'short' ? 'bg-red-600 text-white font-semibold' : 'text-white/70 hover:text-white'
                }`}
              >
                Corto (5m)
              </button>
              <button
                onClick={() => setPomoMode('long', 15)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  pomodoroMode === 'long' ? 'bg-red-600 text-white font-semibold' : 'text-white/70 hover:text-white'
                }`}
              >
                Largo (15m)
              </button>
            </div>

            {/* Timer countdown display & Start/Pause */}
            <div className="flex items-center gap-2 pl-2">
              <span className="font-mono text-base font-bold tracking-wider text-red-400 bg-black/40 px-3 py-1 rounded-lg border border-red-500/20">
                {formatPomoTime(pomodoroTime)}
              </span>
              <button
                onClick={() => setPomodoroRunning(!pomodoroRunning)}
                className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white border border-white/20 transition-all"
              >
                {pomodoroRunning ? 'Pausar ⏸️' : 'Iniciar ▶️'}
              </button>
            </div>
          </div>

          {/* Festive Inspiration quote & sound */}
          <div className="flex items-center gap-4 text-xs text-white/70">
            <div className="hidden md:flex items-center gap-2">
              <span>“</span>
              <span className="italic">¡Compite con tus amigos, supera los récords y conquista el Arcade Navideño 2026!</span>
              <span>”</span>
            </div>

            <button
              onClick={playFestiveChime}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-bold hover:scale-105 transition-transform shadow-lg"
            >
              <span>🔔</span>
              <span>Campanadas</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
