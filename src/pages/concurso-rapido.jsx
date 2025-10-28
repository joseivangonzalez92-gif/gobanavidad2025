// src/components/ConcursoRapido.jsx - ARCHIVO NUEVO
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gobaService } from '../services/firebaseService';

const ConcursoRapido = () => {
  const [concurso, setConcurso] = useState(null);
  const [estado, setEstado] = useState('esperando');
  const [contadorRegresivo, setContadorRegresivo] = useState(5);
  const [miPosicion, setMiPosicion] = useState(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const timerRef = useRef(null);
  const inicioConcursoRef = useRef(null);
  const [participantes, setParticipantes] = useState([]);

  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));

  // Escuchar concurso en tiempo real
  useEffect(() => {
    const unsubscribe = gobaService.escucharConcurso('navidad_rapido', (concursoData) => {
      if (concursoData) {
        setConcurso(concursoData);
        setEstado(concursoData.estado);
        
        // Convertir participantes a array y ordenar
        const participantesArray = Object.values(concursoData.participantes || {})
          .sort((a, b) => a.tiempoReaccion - b.tiempoReaccion);
        setParticipantes(participantesArray);
        
        // Encontrar mi posición
        const miParticipacion = participantesArray.find(p => p.usuarioId === usuarioActual?.id);
        if (miParticipacion) {
          const posicion = participantesArray.findIndex(p => p.usuarioId === usuarioActual.id) + 1;
          setMiPosicion(posicion);
          setMostrarResultado(true);
        }
      }
    });

    return () => unsubscribe();
  }, [usuarioActual]);

  // Iniciar concurso (solo admin)
  const iniciarConcurso = async () => {
    try {
      setEstado('contando');
      setMiPosicion(null);
      setMostrarResultado(false);
      let contador = 5;
      
      timerRef.current = setInterval(() => {
        setContadorRegresivo(contador);
        contador--;
        
        if (contador < 0) {
          clearInterval(timerRef.current);
          setEstado('activo');
          inicioConcursoRef.current = Date.now();
          gobaService.iniciarConcurso('navidad_rapido');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error iniciando concurso:', error);
    }
  };

  // Presionar botón
  const presionarBoton = async () => {
    console.log('🖱️ Botón presionado. Estado actual:', estado);
    
    if (estado !== 'activo' || !inicioConcursoRef.current) {
      console.log('⏸️ No se puede registrar - Estado:', estado);
      return;
    }
    
    const tiempoReaccion = Date.now() - inicioConcursoRef.current;
    console.log('⏱️ Tiempo de reacción:', tiempoReaccion + 'ms');
    
    try {
      await gobaService.participarEnConcurso('navidad_rapido', usuarioActual, tiempoReaccion);
      console.log('✅ Participación registrada');
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  // Reiniciar concurso (solo admin)
  const reiniciarConcurso = async () => {
    try {
      await gobaService.reiniciarConcurso('navidad_rapido');
      setMiPosicion(null);
      setMostrarResultado(false);
      setParticipantes([]);
      setEstado('esperando');
      console.log('✅ Concurso reiniciado');
    } catch (error) {
      console.error('❌ Error reiniciando concurso:', error);
    }
  };

  // Efecto para ocultar resultado después de 5 segundos
  useEffect(() => {
    if (mostrarResultado) {
      const timer = setTimeout(() => {
        setMostrarResultado(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [mostrarResultado]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <Link 
            to="/home" 
            className="inline-block mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            ← Volver al Home
          </Link>
          
          <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            ⚡ Concurso del Más Rápido
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            ¡Presiona el botón tan pronto como se active!
          </p>
          <p className="text-lg text-gray-500">
            El primero en presionar gana. Los demás verán su posición.
          </p>
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
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-xl cursor-pointer opacity-80'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 cursor-pointer opacity-60'
              } text-white font-bold border-8 border-white`}
            >
              {estado === 'activo' ? '🎯' : 
               estado === 'contando' ? contadorRegresivo : 
               '⏸️'}
            </button>
            
            {/* ANILLO DE ACTIVACIÓN - CORREGIDO */}
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
            estado === 'activo' ? 'text-green-600 animate-pulse' : 'text-red-600'
          }`}>
            {estado === 'esperando' && '⏳ Esperando que el admin inicie...'}
            {estado === 'contando' && `🎯 ¡Prepárate! ${contadorRegresivo}`}
            {estado === 'activo' && '🚀 ¡PRESIONA AHORA!'}
            {estado === 'finalizado' && '✅ Concurso Finalizado'}
          </div>
        </div>
    
        {/* RESULTADO PERSONAL - TU IDEA GENIAL */}
        {mostrarResultado && miPosicion && (
          <div className={`text-center mb-6 animate-bounce duration-1000 ${
            miPosicion === 1 ? 'scale-110' : 'scale-105'
          }`}>
            <div className={`inline-block rounded-2xl p-6 shadow-2xl border-4 ${
              miPosicion === 1 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-300 text-white' 
                : 'bg-gradient-to-r from-red-500 to-pink-600 border-red-300 text-white'
            }`}>
              <div className="text-4xl font-bold mb-2">
                {miPosicion === 1 ? '🏆 ¡ERES EL PRIMERO!' : `🎯 Posición #${miPosicion}`}
              </div>
              <div className="text-xl">
                {miPosicion === 1 
                  ? '¡Felicidades! Eres el más rápido 🎉' 
                  : `Presionaste en ${miPosicion}° lugar`}
              </div>
              {miPosicion > 1 && (
                <div className="text-lg mt-2 opacity-90">
                  Tiempo: {participantes.find(p => p.usuarioId === usuarioActual.id)?.tiempoReaccion}ms
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTROLES ADMIN MEJORADOS */}
        {usuarioActual?.esAdmin && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-yellow-800 text-center">
              👑 Controles de Administrador
            </h3>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              {estado === 'esperando' && (
                <button
                  onClick={iniciarConcurso}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105"
                >
                  🚀 Iniciar Concurso
                </button>
              )}
              
              {(estado === 'finalizado' || estado === 'activo') && (
                <button
                  onClick={reiniciarConcurso}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105"
                >
                  🔄 Reiniciar Concurso
                </button>
              )}
              
              <button
                onClick={async () => {
                  try {
                    const stats = await gobaService.obtenerEstadisticasConcurso();
                    alert(`📊 Estadísticas del Concurso:\n\n• Estado: ${stats.estado}\n• Participantes: ${stats.participantes}\n• Ganador: ${stats.ganador ? stats.ganador.nombre + ' (' + stats.ganador.tiempoReaccion + 'ms)' : 'Ninguno'}`);
                  } catch (error) {
                    alert('❌ Error obteniendo estadísticas: ' + error.message);
                  }
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105"
              >
                📊 Ver Estadísticas
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-yellow-700 text-sm">
                Estado actual: <strong>{estado}</strong> | Participantes: <strong>{participantes.length}</strong>
              </p>
            </div>
          </div>
        )}

        {/* TABLA DE PARTICIPANTES */}
        {participantes.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-purple-200">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
              🏅 Ranking de Participantes
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {participantes.map((participante, index) => (
                <div
                  key={participante.usuarioId}
                  className={`flex justify-between items-center p-4 rounded-xl transition-all ${
                    index === 0 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white scale-105 shadow-lg' 
                      : index === 1 
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white scale-102' 
                      : index === 2 
                      ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white scale-101' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  } ${participante.usuarioId === usuarioActual?.id ? 'ring-4 ring-blue-400' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-white text-yellow-600' :
                      index === 1 ? 'bg-white text-gray-600' :
                      index === 2 ? 'bg-white text-orange-600' : 'bg-blue-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{participante.avatar}</span>
                      <span className={`font-semibold text-lg ${
                        index < 3 ? 'text-white' : 'text-gray-700'
                      }`}>
                        {participante.nombre}
                        {participante.usuarioId === usuarioActual?.id && (
                          <span className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-sm">
                            TÚ
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className={`font-bold text-lg ${
                    index < 3 ? 'text-white' : 'text-gray-800'
                  }`}>
                    {participante.tiempoReaccion}ms
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INSTRUCCIONES */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 mt-8">
          <h4 className="text-xl font-bold mb-3 text-blue-800">📋 ¿Cómo funciona?</h4>
          <ul className="text-blue-700 space-y-2">
            <li>• Solo el admin puede iniciar el concurso</li>
            <li>• Habrá una cuenta regresiva de 5 segundos</li>
            <li>• Cuando el botón se ponga verde, ¡presiona lo más rápido que puedas!</li>
            <li>• El primero en presionar será el ganador</li>
            <li>• Los demás verán en qué posición presionaron</li>
            <li>• Los resultados se muestran automáticamente</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default ConcursoRapido;