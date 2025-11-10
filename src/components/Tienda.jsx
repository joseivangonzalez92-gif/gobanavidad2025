// components/Tienda.jsx - CORREGIDO
import React, { useState, useEffect } from 'react';
import { gobaService } from '../services/firebaseService.jsx';

const Tienda = () => {
  const [usuario, setUsuario] = useState(null);
  const [puntosReales, setPuntosReales] = useState(0);
  const [cargando, setCargando] = useState(false);
  
  // 🎯 PRODUCTOS DE LA TIENDA - AHORA DESDE EL SERVICIO
  const productos = gobaService.tiendaService.productos;

  useEffect(() => {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (usuarioActual) {
      setUsuario(usuarioActual);
      // 🎯 SINCRONIZAR PUNTOS AL CARGAR
      cargarPuntosReales(usuarioActual.id);
    }
  }, []);

  const cargarPuntosReales = async (usuarioId) => {
    const puntos = await gobaService.puntosService.obtenerPuntosReales(usuarioId);
    setPuntosReales(puntos);
  };

  const comprarProducto = async (producto) => {
    if (!usuario) {
      alert('❌ Inicia sesión primero');
      return;
    }

    // 🎯 VALIDACIÓN CLIENTE (rápida)
    if (puntosReales < producto.precio) {
      alert(`❌ Puntos insuficientes. Tienes: ${puntosReales}, Necesitas: ${producto.precio}`);
      return;
    }

    if (confirm(`¿Cambiar ${producto.precio} puntos por ${producto.nombre}?`)) {
      setCargando(true);
      
      // 🎯 VALIDACIÓN SERVER (segura)
      const resultado = await gobaService.puntosService.gastarPuntosConValidacion(
        usuario.id, 
        producto.precio, 
        producto
      );

      if (resultado.success) {
        alert(`✅ ${resultado.message}\n\n📱 Te llegará un WhatsApp cuando esté listo tu pedido.`);
        
        // 🎯 ACTUALIZAR INTERFAZ
        setPuntosReales(resultado.nuevosPuntos);
        
        // Actualizar localStorage
        const usuarioActualizado = { ...usuario, puntos: resultado.nuevosPuntos };
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
        setUsuario(usuarioActualizado);
      } else {
        alert(`❌ ${resultado.message}`);
      }
      
      setCargando(false);
    }
  };

  if (!usuario) {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-xl border-2 border-yellow-200">
        <p className="text-yellow-700 text-lg">Inicia sesión para usar la tienda</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">🏪 Tienda Navideña</h2>
      
      {/* TARJETA DE PUNTOS */}
      <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl p-4 mb-6 text-center border-2 border-yellow-300">
        <p className="text-lg font-semibold text-yellow-800">Tus puntos disponibles</p>
        <p className="text-3xl font-bold text-yellow-700 my-2">⭐ {puntosReales}</p>
        <button 
          onClick={() => cargarPuntosReales(usuario.id)}
          disabled={cargando}
          className="text-sm text-yellow-600 hover:text-yellow-700 disabled:opacity-50"
        >
          {cargando ? '🔄 Actualizando...' : '🔄 Actualizar puntos'}
        </button>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <div className="space-y-3">
        {productos.map(producto => (
          <div key={producto.id} className="flex justify-between items-center p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{producto.nombre}</span>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-medium">
                ⭐ {producto.precio}
              </span>
            </div>
            <button
              onClick={() => comprarProducto(producto)}
              disabled={puntosReales < producto.precio || cargando}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                puntosReales >= producto.precio && !cargando
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow hover:shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {cargando ? '⏳' : 'Canjear'}
            </button>
          </div>
        ))}
      </div>

      {/* INFORMACIÓN IMPORTANTE */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Canjea tus puntos</strong> - Te contactaremos por WhatsApp para coordinar la entrega
        </p>
      </div>
    </div>
  );
};

export default Tienda;