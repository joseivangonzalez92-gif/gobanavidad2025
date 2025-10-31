// src/components/ConcursoRapido.jsx - VERSIÓN SIMPLIFICADA Y FUNCIONAL
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gobaService } from '../services/firebaseService';

const ConcursoRapido = () => {
  const [estado, setEstado] = useState('esperando');
  const [contadorRegresivo, setContadorRegresivo] = useState(5);
  const [miPosicion, setMiPosicion] = useState(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [participantes, setParticipantes] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState('');
  const [nuevaPregunta, setNuevaPregunta] = useState('');

  const timerRef = useRef(null);
  const inicioConcursoRef = useRef(null);
  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));

  // Escuchar concurso en tiempo real - VERSIÓN SIMPLIFICADA
  useEffect(() => {
    const unsubscribe = gobaService.escucharConcurso('navidad_rapido', (concursoData) => {
      if (concursoData) {
        console.log('📡 Estado del concurso:', concursoData.estado);
        
        const nuevoEstado = concursoData.estado || 'esperando';
        setEstado(nuevoEstado);
        setPreguntaActual(concursoData.preguntaActual || '');
        
        // Manejar participantes
        const participantesArray = Object.values(concursoData.participantes || {})
          .sort((a, b) => a.tiempoReaccion - b.tiempoReaccion);
        setParticipantes(participantesArray);
        
        // Encontrar mi posición
        const miParticipacion = participantesArray.find(p => p.usuarioId === usuarioActual?.id);
        if (miParticipacion) {
          const posicion = participantesArray.findIndex(p => p.usuarioId === usuarioActual.id) + 1;
          setMiPosicion(posicion);
          setMostrarResultado(true);
        } else {
          setMiPosicion(null);
          setMostrarResultado(false);
        }

        // Si el estado cambia a "contando", iniciar cuenta regresiva
        if (nuevoEstado === 'contando' && estado !== 'contando') {
          iniciarCuentaRegresiva();
        }
        
        // Si el estado cambia a "activo", activar el botón
        if (nuevoEstado === 'activo') {
          inicioConcursoRef.current = Date.now();
          console.log('⏰ Concurso activo - listo para participar');
        }
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [usuarioActual, estado]);

  // CUENTA REGRESIVA LOCAL - VERSIÓN SIMPLE
  const iniciarCuentaRegresiva = () => {
    console.log('🔴 Iniciando cuenta regresiva...');
    setEstado('contando');
    setMiPosicion(null);
    setMostrarResultado(false);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    let contador = 5;
    setContadorRegresivo(contador);
    
    timerRef.current = setInterval(() => {
      contador--;
      setContadorRegresivo(contador);
      console.log('⏱️ Countdown:', contador);
      
      if (contador <= 0) {
        clearInterval(timerRef.current);
        console.log('✅ Countdown terminado');
      }
    }, 1000);
  };

  // PRESIONAR BOTÓN - VERSIÓN SIMPLE
  const presionarBoton = async () => {
    if (estado !== 'activo') {
      console.log('❌ Botón no activo, estado:', estado);
      return;
    }
    
    if (!inicioConcursoRef.current) {
      console.log('❌ No hay timestamp de inicio');
      return;
    }
    
    const tiempoReaccion = Date.now() - inicioConcursoRef.current;
    console.log('🎯 Tiempo de reacción:', tiempoReaccion, 'ms');
    
    try {
      await gobaService.participarEnConcurso('navidad_rapido', usuarioActual, tiempoReaccion);
    } catch (error) {
      console.error('❌ Error registrando participación:', error);
    }
  };

  // INICIAR NUEVA PREGUNTA (solo admin)
  const iniciarNuevaPregunta = async () => {
    if (!nuevaPregunta.trim()) {
      alert('Por favor escribe una pregunta');
      return;
    }
    
    try {
      await gobaService.iniciarConcursoConPregunta('navidad_rapido', nuevaPregunta);
      setNuevaPregunta('');
    } catch (error) {
      console.error('Error iniciando pregunta:', error);
      alert('Error: ' + error.message);
    }
  };

  // REINICIAR CONCURSO
  const reiniciarConcurso = async () => {
    try {
      await gobaService.reiniciarConcurso('navidad_rapido');
      setMiPosicion(null);
      setMostrarResultado(false);
    } catch (error) {
      console.error('❌ Error reiniciando:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <Link to="/home" className="inline-block mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all">
            ← Volver al Home
          </Link>
          
          <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            ⚡ Concurso de Velocidad
          </h1>
          
          {/* PREGUNTA ACTUAL */}
          {preguntaActual && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-purple-300 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">❓ Pregunta:</h2>
              <p className="text-2xl text-gray-700 font-semibold">{preguntaActual}</p>
            </div>
          )}
        </div>

        {/* BOTÓN GIGANTE */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <button
              onClick={presionarBoton}
              className={`text-8xl w-80 h-80 rounded-full transition-all duration-200 transform ${
                estado === 'activo' 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 cursor-pointer shadow-2xl animate-pulse' 
                  : estado === 'contando'
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-xl cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 cursor-not-allowed opacity-60'
              } text-white font-bold border-8 border-white`}
              disabled={estado !== 'activo'}
            >
              {estado === 'activo' ? '🎯' : 
               estado === 'contando' ? contadorRegresivo : 
               '⏸️'}
            </button>
            
            {estado === 'activo' && (
              <div className="absolute inset-0 rounded-full border-8 border-green-400 animate-ping pointer-events-none"></div>
            )}
          </div>
        </div>

        {/* MENSAJE DE ESTADO */}
        <div className="text-center mb-8">
          <div className={`text-3xl font-bold ${
            estado === 'esperando' ? 'text-gray-600' :
            estado === 'contando' ? 'text-orange-600 animate-bounce' :
            estado === 'activo' ? 'text-green-600 animate-pulse' : 
            'text-blue-600'
          }`}>
            {estado === 'esperando' && '⏳ Esperando nueva pregunta...'}
            {estado === 'contando' && `🎯 ¡Prepárate! ${contadorRegresivo}`}
            {estado === 'activo' && '🚀 ¡PRESIONA AHORA!'}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Estado: {estado} | Usuario: {usuarioActual?.nombre}
          </div>
        </div>

        {/* RESULTADOS */}
        {mostrarResultado && miPosicion && (
          <div className={`text-center mb-6 animate-bounce duration-1000 ${
            miPosicion === 1 ? 'scale-110' : 'scale-105'
          }`}>
            <div className={`inline-block rounded-2xl p-6 shadow-2xl border-4 ${
              miPosicion === 1 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-300 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-300 text-white'
            }`}>
              <div className="text-4xl font-bold mb-2">
                {miPosicion === 1 ? '🏆 ¡PRIMER LUGAR!' : `🎯 Posición #${miPosicion}`}
              </div>
              <div className="text-xl">
                Tiempo: {participantes.find(p => p.usuarioId === usuarioActual.id)?.tiempoReaccion}ms
              </div>
            </div>
          </div>
        )}

        {/* CONTROLES ADMIN */}
        {usuarioActual?.esAdmin && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-yellow-800 text-center">
              👑 Controles de Admin
            </h3>
            
            <div className="mb-4">
              <input
                type="text"
                value={nuevaPregunta}
                onChange={(e) => setNuevaPregunta(e.target.value)}
                placeholder="Escribe tu pregunta aquí..."
                className="w-full p-4 rounded-xl border-2 border-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                onKeyPress={(e) => e.key === 'Enter' && iniciarNuevaPregunta()}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={iniciarNuevaPregunta}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                🚀 Nueva Pregunta
              </button>
              
              <button
                onClick={reiniciarConcurso}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                🔄 Reiniciar
              </button>
            </div>
          </div>
        )}

        {/* TABLA DE PARTICIPANTES */}
        {participantes.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-purple-200">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
              🏅 Ranking
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {participantes.map((participante, index) => (
                <div
                  key={participante.usuarioId}
                  className={`flex justify-between items-center p-4 rounded-xl ${
                    index === 0 ? 'bg-yellow-100 border-2 border-yellow-300' :
                    index === 1 ? 'bg-gray-100 border-2 border-gray-300' :
                    index === 2 ? 'bg-orange-100 border-2 border-orange-300' :
                    'bg-gray-50'
                  } ${participante.usuarioId === usuarioActual?.id ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-500 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-semibold">
                      {participante.nombre}
                      {participante.usuarioId === usuarioActual?.id && (
                        <span className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          TÚ
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="font-bold">
                    {participante.tiempoReaccion}ms
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ConcursoRapido;