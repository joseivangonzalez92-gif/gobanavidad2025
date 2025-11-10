// components/Tienda.jsx - VERSIÓN CON CÓDIGOS DE REGALO
import React, { useState, useEffect } from 'react';
import { gobaService } from '../services/firebaseService.jsx';
import { Link } from 'react-router-dom';

const Tienda = () => {
  const [usuario, setUsuario] = useState(null);
  const [puntosReales, setPuntosReales] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [codigoInput, setCodigoInput] = useState('');
  const [procesandoCodigo, setProcesandoCodigo] = useState(false);
  
  // 🎁 PRODUCTOS - SOLO IMPORTAN LOS PUNTOS
  const productos = [
    { id: 1, nombre: "🍫 Chocolate Familiar", precio: 5, categoria: "dulces" },
    { id: 2, nombre: "🌯 Churro con Chocolate", precio: 3, categoria: "dulces" },
    { id: 3, nombre: "🥤 Refresco 2L", precio: 2, categoria: "bebidas" },
    { id: 4, nombre: "🍕 Pizza Familiar", precio: 15, categoria: "comida" },
    { id: 5, nombre: "🥩 Carne Asada (1kg)", precio: 25, categoria: "comida" },
    { id: 6, nombre: "🍿 Pop Corn", precio: 4, categoria: "snacks" },
    { id: 7, nombre: "🍪 Galletas Navideñas", precio: 6, categoria: "dulces" },
    { id: 8, nombre: "☕ Café Especial", precio: 3, categoria: "bebidas" },
    { id: 9, nombre: "🎂 Pastel Individual", precio: 8, categoria: "dulces" },
    { id: 10, nombre: "🌭 Hot Dog Especial", precio: 4, categoria: "comida" }
  ];

  // 🎯 CÓDIGOS DE REGALO
  const codigosRegalo = {
    // CÓDIGOS GENERALES (1 vez por usuario)
    general: {
      'OLIRAF': { puntos: 5, tipo: 'general' },
      'PECHOCHO': { puntos: 5, tipo: 'general' },
      'NAVI2025': { puntos: 5, tipo: 'general' },
      'FELIZAÑONUEVO': { puntos: 5, tipo: 'general' },
      'JOLU': { puntos: 5, tipo: 'general' },
      'FELIZNAVIDAD': { puntos: 5, tipo: 'general' }
    },
    // CÓDIGOS PREMIOS (1 vez entre todos los usuarios)
    premios: {
      'GANADOR#1': { puntos: 25, tipo: 'premio' },
      'GANAR2': { puntos: 25, tipo: 'premio' },
      'GOBA01': { puntos: 25, tipo: 'premio' },
      'GOBA#002': { puntos: 25, tipo: 'premio' },
      'ELCODIGO': { puntos: 25, tipo: 'premio' }
    }
  };

  useEffect(() => {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (usuarioActual) {
      setUsuario(usuarioActual);
      cargarPuntosReales(usuarioActual.id);
      cargarMisPedidos(usuarioActual.id);
    }
  }, []);

  const cargarPuntosReales = async (usuarioId) => {
    const puntos = await gobaService.puntosService.obtenerPuntosReales(usuarioId);
    setPuntosReales(puntos);
  };

  const cargarMisPedidos = async (usuarioId) => {
    // Escuchar pedidos en tiempo real
    const unsubscribe = gobaService.tiendaService.escucharPedidos((pedidos) => {
      const misPedidos = pedidos.filter(pedido => pedido.usuarioId === usuarioId);
      setPedidos(misPedidos);
    });
    return unsubscribe;
  };

  // 🎯 FUNCIÓN PARA CANJEAR CÓDIGOS
  const canjearCodigo = async () => {
    if (!usuario) {
      alert('❌ Inicia sesión primero');
      return;
    }

    if (!codigoInput.trim()) {
      alert('❌ Ingresa un código');
      return;
    }

    const codigo = codigoInput.trim().toUpperCase();
    setProcesandoCodigo(true);

    try {
      // Verificar si el código ya fue canjeado
      const codigoCanjeado = await gobaService.codigosService.verificarCodigoCanjeado(usuario.id, codigo);
      
      if (codigoCanjeado) {
        alert('❌ Este código ya fue canjeado');
        setCodigoInput('');
        return;
      }

      // Buscar código en generales
      if (codigosRegalo.general[codigo]) {
        const { puntos, tipo } = codigosRegalo.general[codigo];
        
        // Añadir puntos
        await gobaService.puntosService.ganarPuntos(usuario.id, puntos, `codigo_${tipo}`);
        
        // Marcar código como canjeado
        await gobaService.codigosService.marcarCodigoCanjeado(usuario.id, codigo, puntos, tipo);
        
        // Actualizar puntos en pantalla
        const nuevosPuntos = puntosReales + puntos;
        setPuntosReales(nuevosPuntos);
        
        // Actualizar localStorage
        const usuarioActualizado = { ...usuario, puntos: nuevosPuntos };
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
        setUsuario(usuarioActualizado);
        
        alert(`🎉 ¡Código canjeado!\n\n💰 Ganaste: ${puntos} puntos\n\n💰 Puntos totales: ${nuevosPuntos}`);
        setCodigoInput('');
        setMostrarCodigo(false);
        
      } 
      // Buscar código en premios
      else if (codigosRegalo.premios[codigo]) {
        const { puntos, tipo } = codigosRegalo.premios[codigo];
        
        // Verificar si el premio ya fue canjeado por alguien
        const premioCanjeado = await gobaService.codigosService.verificarPremioCanjeado(codigo);
        
        if (premioCanjeado) {
          alert('❌ Este premio ya fue canjeado por otro usuario');
          setCodigoInput('');
          return;
        }
        
        // Añadir puntos
        await gobaService.puntosService.ganarPuntos(usuario.id, puntos, `codigo_${tipo}`);
        
        // Marcar premio como canjeado
        await gobaService.codigosService.marcarPremioCanjeado(usuario.id, codigo, puntos);
        
        // Actualizar puntos en pantalla
        const nuevosPuntos = puntosReales + puntos;
        setPuntosReales(nuevosPuntos);
        
        // Actualizar localStorage
        const usuarioActualizado = { ...usuario, puntos: nuevosPuntos };
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
        setUsuario(usuarioActualizado);
        
        alert(`🎊 ¡FELICIDADES! Premio canjeado\n\n💰 Ganaste: ${puntos} puntos\n\n💰 Puntos totales: ${nuevosPuntos}`);
        setCodigoInput('');
        setMostrarCodigo(false);
        
      } else {
        alert('❌ Código inválido');
        setCodigoInput('');
      }
      
    } catch (error) {
      console.error('Error canjeando código:', error);
      alert('❌ Error al canjear código');
    } finally {
      setProcesandoCodigo(false);
    }
  };

  const comprarProducto = async (producto) => {
    if (!usuario) {
      alert('❌ Inicia sesión primero');
      return;
    }

    // ✅ VALIDAR PUNTOS SUFICIENTES
    if (puntosReales < producto.precio) {
      alert(`❌ Puntos insuficientes. Tienes: ${puntosReales}, Necesitas: ${producto.precio}`);
      return;
    }

    const puntosRestantes = puntosReales - producto.precio;
    
    if (confirm(`¿Gastar ${producto.precio} puntos por "${producto.nombre}"?\n\n💰 Te quedarán: ${puntosRestantes} puntos\n\n📱 Te contactaremos por WhatsApp para coordinar la entrega.`)) {
      setCargando(true);
      
      try {
        // ✅ REBAJAR PUNTOS EN FIREBASE
        const resultado = await gobaService.puntosService.gastarPuntosConValidacion(
          usuario.id, 
          producto.precio, 
          producto
        );

        if (resultado.success) {
          // ✅ ACTUALIZAR PUNTOS EN PANTALLA
          setPuntosReales(resultado.nuevosPuntos);
          
          // ✅ ACTUALIZAR LOCALSTORAGE
          const usuarioActualizado = { 
            ...usuario, 
            puntos: resultado.nuevosPuntos
          };
          localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
          setUsuario(usuarioActualizado);
          
          alert(`✅ ¡Pedido realizado!\n\n📦 ${producto.nombre}\n💰 Puntos restantes: ${resultado.nuevosPuntos}\n\n📞 Te contactaremos pronto vía WhatsApp`);
        } else {
          alert(`❌ ${resultado.message}`);
        }
      } catch (error) {
        alert(`❌ Error: ${error.message}`);
      } finally {
        setCargando(false);
      }
    }
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      dulces: 'from-pink-500 to-pink-600',
      bebidas: 'from-blue-500 to-blue-600',
      comida: 'from-orange-500 to-orange-600',
      snacks: 'from-purple-500 to-purple-600'
    };
    return colores[categoria] || 'from-gray-500 to-gray-600';
  };

  if (!usuario) {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
        <p className="text-yellow-700 text-lg">Inicia sesión para usar la tienda</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER CON PUNTOS */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white text-center shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">🏪 Tienda Navideña GOBA</h1>
        <p className="text-green-100 mb-4">Canjea tus puntos por deliciosos productos familiares</p>
        
        <div className="bg-white/20 rounded-xl p-4 inline-block">
          <p className="text-lg font-semibold">Tus puntos disponibles</p>
          <p className="text-4xl font-bold my-2">⭐ {puntosReales}</p>
          <button 
            onClick={() => cargarPuntosReales(usuario.id)}
            disabled={cargando}
            className="text-sm text-green-100 hover:text-white disabled:opacity-50"
          >
            {cargando ? '🔄 Actualizando...' : '🔄 Actualizar puntos'}
          </button>
        </div>

        {/* BOTÓN PARA CÓDIGOS DE REGALO */}
        <div className="mt-4">
          <button
            onClick={() => setMostrarCodigo(!mostrarCodigo)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            🎁 Canjear Código de Regalo
          </button>
        </div>
      </div>

      {/* FORMULARIO DE CÓDIGO DE REGALO */}
      {mostrarCodigo && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300">
          <h3 className="text-xl font-bold text-yellow-800 mb-4">🎁 Canjear Código de Regalo</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value)}
              placeholder="Ingresa tu código aquí..."
              className="flex-1 p-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              onKeyPress={(e) => e.key === 'Enter' && canjearCodigo()}
            />
            <button
              onClick={canjearCodigo}
              disabled={procesandoCodigo || !codigoInput.trim()}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {procesandoCodigo ? '⏳' : '🎁 Canjear'}
            </button>
          </div>
        
        </div>
      )}

      {/* MIS PEDIDOS ACTIVOS */}
      {pedidos.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📦 Mis Pedidos Activos</h2>
          <div className="space-y-3">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-blue-100">
                <div>
                  <p className="font-semibold">{pedido.producto.nombre}</p>
                  <p className="text-sm text-gray-600">
                    Estado: <span className={`font-semibold ${
                      pedido.estado === 'entregado' ? 'text-green-600' : 
                      pedido.estado === 'preparando' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {pedido.estado}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Pedido: {new Date(pedido.fecha?.toDate()).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">-{pedido.producto.precio}⭐</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTOS POR CATEGORÍA */}
      <div className="space-y-8">
        {['dulces', 'bebidas', 'comida', 'snacks'].map(categoria => {
          const productosCategoria = productos.filter(p => p.categoria === categoria);
          if (productosCategoria.length === 0) return null;
          
          return (
            <div key={categoria} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 capitalize">
                {categoria === 'dulces' ? '🍫 Dulces y Postres' :
                 categoria === 'bebidas' ? '🥤 Bebidas' :
                 categoria === 'comida' ? '🍕 Comida' : '🍿 Snacks'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productosCategoria.map(producto => (
                  <div key={producto.id} className="bg-white rounded-2xl p-4 border-2 border-gray-200 hover:border-green-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{producto.nombre.split(' ')[0]}</span>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{producto.nombre}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-medium">
                              ⭐ {producto.precio} puntos
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => comprarProducto(producto)}
                      disabled={puntosReales < producto.precio || cargando}
                      className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                        puntosReales >= producto.precio && !cargando
                          ? 'bg-green-500 hover:bg-green-600 shadow hover:shadow-md transform hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {cargando ? '⏳ Procesando...' : 
                       puntosReales < producto.precio ? `❌ Te faltan ${producto.precio - puntosReales} puntos` : 
                       '🛒 Canjear Ahora'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* INFORMACIÓN IMPORTANTE */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Información de Entrega</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-semibold text-green-700">📞 Contacto WhatsApp</p>
            <p>Te contactaremos para coordinar día y hora de entrega</p>
          </div>
          <div>
            <p className="font-semibold text-blue-700">🏠 Entrega a Domicilio</p>
            <p>Entregamos en tu domicilio dentro de la zona familiar</p>
          </div>
          <div>
            <p className="font-semibold text-purple-700">⏰ Tiempo de Entrega</p>
            <p>24-48 horas después de confirmado el pedido</p>
          </div>
          <div>
            <p className="font-semibold text-orange-700">💰 Puntos Reales</p>
            <p>Tus puntos se descuentan automáticamente al hacer pedidos</p>
          </div>
        </div>
      </div>

      {/* BOTÓN VOLVER A HOME */}
      <div className="text-center mt-8">
        <Link 
          to="/home" 
          className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          ← Volver a Home
        </Link>
      </div>
    </div>
  );
};

export default Tienda;