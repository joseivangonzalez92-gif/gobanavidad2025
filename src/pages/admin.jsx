import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gobaService } from '../services/firebaseService';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firebaseUsers, setFirebaseUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [nominaciones, setNominaciones] = useState({});
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [pendingGalleryPhotos, setPendingGalleryPhotos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [activeSection, setActiveSection] = useState('solicitudes');
  
  const [mostrarFormularioEvento, setMostrarFormularioEvento] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [formEvento, setFormEvento] = useState({
    fecha: '',
    titulo: '',
    descripcion: '',
    icono: '🎂'
  });

  const auth = getAuth();

  const iconosDisponibles = ['🎂', '🎄', '🎁', '⭐', '🕯️', '🍪', '👶', '🎅', '🤶', '🦌', '❄️', '🔥', '🏆', '🎭', '🗳️', '📸', '🎮', '🍿', '🎵', '🎬'];

  // Verificar admin y cargar datos
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('usuarioActual'));
        
        if (currentUser && currentUser.esAdmin) {
          setIsAdmin(true);
          await loadAllData();
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error inicializando admin:", error);
      } finally {
        setLoading(false);
      }
    };

    const loadAllData = async () => {
      try {
        const [users, requests, allNominaciones, challengePhotos, galleryPhotos, eventosData] = await Promise.all([
          gobaService.obtenerTodosUsuarios(),
          gobaService.diagnosticarSolicitudes(),
          gobaService.obtenerTodasNominaciones(),
          gobaService.getPendingPhotos(),
          gobaService.getPendingGalleryPhotos(),
          gobaService.obtenerTodosEventos()
        ]);
        
        // Cargar pedidos por separado para evitar que falle todo si hay error
        let pedidosData = [];
        try {
          pedidosData = await gobaService.tiendaService.obtenerTodosPedidos();
        } catch (error) {
          console.log("⚠️ Pedidos no disponibles aún:", error);
        }
        
        setFirebaseUsers(users);
        setPendingRequests(requests);
        setNominaciones(allNominaciones);
        setPendingPhotos(challengePhotos);
        setPendingGalleryPhotos(galleryPhotos);
        setEventos(eventosData);
        setPedidos(pedidosData);
        
        console.log("✅ Datos cargados:", {
          usuarios: users.length,
          solicitudes: requests.length,
          nominaciones: Object.keys(allNominaciones).length,
          fotosChallengePendientes: challengePhotos.length,
          fotosGaleriaPendientes: galleryPhotos.length,
          eventos: eventosData.length,
          pedidos: pedidosData.length
        });
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    initializeAdmin();
  }, []);

  // Función para manejar pedidos
  const manejarPedido = async (pedidoId, accion) => {
    try {
      if (accion === 'entregado') {
        await gobaService.tiendaService.marcarEntregado(pedidoId);
        alert('✅ Pedido marcado como entregado');
      } else if (accion === 'preparando') {
        await gobaService.tiendaService.marcarPreparando(pedidoId);
        alert('👨‍🍳 Pedido en preparación');
      } else if (accion === 'cancelar') {
        if (confirm('¿Cancelar este pedido?')) {
          await gobaService.tiendaService.cancelarPedido(pedidoId);
          alert('❌ Pedido cancelado');
        }
      }
      
      // Recargar pedidos
      const pedidosActualizados = await gobaService.tiendaService.obtenerTodosPedidos();
      setPedidos(pedidosActualizados);
    } catch (error) {
      console.error('Error manejando pedido:', error);
      alert('❌ Error al procesar pedido');
    }
  };

  // Función para obtener estadísticas de pedidos
  const obtenerEstadisticasPedidos = () => {
    const total = pedidos.length;
    const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
    const preparando = pedidos.filter(p => p.estado === 'preparando').length;
    const entregados = pedidos.filter(p => p.estado === 'entregado').length;
    const puntosCanjeados = pedidos
      .filter(p => p.estado !== 'cancelado')
      .reduce((total, pedido) => total + (pedido.puntosCoste || 0), 0);

    return { total, pendientes, preparando, entregados, puntosCanjeados };
  };

  // FUNCIONES PARA GESTIÓN DE EVENTOS
  const handleInputChangeEvento = (e) => {
    const { name, value } = e.target;
    setFormEvento(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const crearEvento = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await gobaService.crearEvento(formEvento);
      alert('✅ Evento creado exitosamente');
      setFormEvento({ fecha: '', titulo: '', descripcion: '', icono: '🎂' });
      setMostrarFormularioEvento(false);
      const eventosData = await gobaService.obtenerTodosEventos();
      setEventos(eventosData);
    } catch (error) {
      console.error('Error creando evento:', error);
      alert('❌ Error al crear evento');
    } finally {
      setLoading(false);
    }
  };

  const editarEvento = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await gobaService.actualizarEvento(eventoEditando.id, formEvento);
      alert('✅ Evento actualizado exitosamente');
      setEventoEditando(null);
      setFormEvento({ fecha: '', titulo: '', descripcion: '', icono: '🎂' });
      setMostrarFormularioEvento(false);
      const eventosData = await gobaService.obtenerTodosEventos();
      setEventos(eventosData);
    } catch (error) {
      console.error('Error editando evento:', error);
      alert('❌ Error al editar evento');
    } finally {
      setLoading(false);
    }
  };

  const eliminarEvento = async (eventoId, titulo) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el evento "${titulo}"?`)) return;

    try {
      await gobaService.eliminarEvento(eventoId);
      alert('✅ Evento eliminado');
      const eventosData = await gobaService.obtenerTodosEventos();
      setEventos(eventosData);
    } catch (error) {
      console.error('Error eliminando evento:', error);
      alert('❌ Error al eliminar evento');
    }
  };

  const iniciarEdicionEvento = (evento) => {
    setEventoEditando(evento);
    setFormEvento({
      fecha: evento.fecha,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      icono: evento.icono
    });
    setMostrarFormularioEvento(true);
  };

  const cancelarEvento = () => {
    setMostrarFormularioEvento(false);
    setEventoEditando(null);
    setFormEvento({ fecha: '', titulo: '', descripcion: '', icono: '🎂' });
  };

  // Función para forzar login como admin (temporal)
  const forceAdminLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, 'joseivan@goba.com', 'admin123');
      const usuarioAdmin = {
        id: 'joseivan',
        nombre: "José Iván",
        codigoSecreto: "admin",
        esAdmin: true,
      };
      localStorage.setItem("usuarioActual", JSON.stringify(usuarioAdmin));
      setIsAdmin(true);
      window.location.reload();
    } catch (error) {
      console.error("Error forzando login admin:", error);
      alert("Error: " + error.message);
    }
  };

  // 🎨🎯 FUNCIÓN APROBAR SOLICITUD MODIFICADA - INCLUYE AVATAR, PAÍS Y FRASE
  const handleApproveRequest = async (request) => {
    const newUserId = generarIdDesdeNombre(request.nombreSolicitado);
    
    const newUser = {
      id: newUserId,
      nombre: request.nombreSolicitado,
      codigoSecreto: request.codigoSecretoSolicitado,
      avatar: request.avatar || '👤',
      pais: request.pais || 'República del Café de Mamá',
      frase: request.frase || "",
      puntos: 0,
      fechaRegistro: new Date().toISOString(),
      esAdmin: false,
    };

    const success = await gobaService.crearUsuarioAprobado(newUser);
    
    if (success) {
      await gobaService.actualizarSolicitudRegistro(request.id, {
        estado: 'aprobada',
        fechaAprobacion: new Date().toISOString()
      });
      alert(`✅ "${request.nombreSolicitado}" aprobado!\n\n🎨 Avatar: ${newUser.avatar}\n🗺️ País: ${newUser.pais}`);
      window.location.reload();
    } else {
      alert("❌ Error al aprobar usuario.");
    }
  };

  const obtenerPuntosUsuarios = () => {
    return firebaseUsers.map(usuario => ({
      id: usuario.id,
      nombre: usuario.nombre,
      avatar: usuario.avatar || '👤',
      puntos: usuario.puntos || 0,
      pais: usuario.pais || 'No asignado',
      fechaRegistro: usuario.fechaRegistro
    })).sort((a, b) => b.puntos - a.puntos);
  };


  // Rechazar solicitud
  const handleRejectRequest = async (requestId, nombreSolicitado) => {
    if (window.confirm(`¿Rechazar solicitud de ${nombreSolicitado}?`)) {
      await gobaService.actualizarSolicitudRegistro(requestId, { 
        estado: 'rechazada',
        fechaRechazo: new Date().toISOString() 
      });
      alert(`❌ Solicitud de "${nombreSolicitado}" rechazada.`);
      window.location.reload();
    }
  };

  // APROBAR FOTO DE CHALLENGE
  const handleApprovePhoto = async (photo) => {
    try {
      await gobaService.approvePhoto(photo.id, photo.userId);
      alert(`✅ Foto aprobada! +10 puntos para el usuario`);
      window.location.reload();
    } catch (error) {
      alert(`❌ Error aprobando foto: ${error.message}`);
    }
  };

  // RECHAZAR FOTO DE CHALLENGE
  const handleRejectPhoto = async (photo) => {
    const razon = prompt("¿Por qué rechazas esta foto?");
    if (razon) {
      try {
        await gobaService.rejectPhoto(photo.id, razon);
        alert(`❌ Foto rechazada`);
        window.location.reload();
      } catch (error) {
        alert(`❌ Error rechazando foto: ${error.message}`);
      }
    }
  };

  // APROBAR FOTO DE GALERÍA
  const handleApproveGalleryPhoto = async (foto) => {
    try {
      await gobaService.approveGalleryPhoto(foto.id);
      alert(`✅ Foto de galería aprobada y publicada!`);
      window.location.reload();
    } catch (error) {
      alert(`❌ Error aprobando foto de galería: ${error.message}`);
    }
  };

  // RECHAZAR FOTO DE GALERÍA
  const handleRejectGalleryPhoto = async (foto) => {
    const razon = prompt("¿Por qué rechazas esta foto de la galería?");
    if (razon) {
      try {
        await gobaService.rejectGalleryPhoto(foto.id, razon);
        alert(`❌ Foto de galería rechazada`);
        window.location.reload();
      } catch (error) {
        alert(`❌ Error rechazando foto de galería: ${error.message}`);
      }
    }
  };

  // ELIMINAR FOTO DE GALERÍA
  const handleDeleteGalleryPhoto = async (foto) => {
    if (window.confirm(`¿Eliminar permanentemente esta foto de la galería?`)) {
      try {
        await gobaService.deleteGalleryPhoto(foto.id);
        alert(`🗑️ Foto eliminada de la galería`);
        window.location.reload();
      } catch (error) {
        alert(`❌ Error eliminando foto: ${error.message}`);
      }
    }
  };

  // Eliminar usuario de Firebase
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`¿Eliminar usuario "${userName}" permanentemente?`)) {
      const success = await gobaService.eliminarUsuario(userId);
      if (success) {
        alert("✅ Usuario eliminado");
        window.location.reload();
      } else {
        alert("❌ Error eliminando usuario");
      }
    }
  };

  // Generar ID desde nombre
  const generarIdDesdeNombre = (nombre) => {
    return nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

  // Estadísticas CORREGIDAS
  const totalNominaciones = Object.values(nominaciones).reduce((total, userNominaciones) => {
    if (userNominaciones && userNominaciones.nominaciones) {
      return total + Object.values(userNominaciones.nominaciones).flat().length;
    }
    return total;
  }, 0);

  const usuariosConNominaciones = new Set(
    Object.keys(nominaciones).filter(userId => {
      const userNominaciones = nominaciones[userId];
      return userNominaciones && userNominaciones.nominaciones && 
             Object.values(userNominaciones.nominaciones).flat().length > 0;
    })
  ).size;

  // TOTAL FOTOS PENDIENTES
  const totalFotosPendientes = pendingPhotos.length + pendingGalleryPhotos.length;

  // Estadísticas de pedidos
  const statsPedidos = obtenerEstadisticasPedidos();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">🔒 Acceso Restringido</h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos de administrador para acceder a esta sección.
          </p>
          
          <button
            onClick={forceAdminLogin}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🛠️ Acceder como Administrador
          </button>
          
          <Link 
            to="/"
            className="inline-block mt-4 text-blue-500 hover:text-blue-700"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔥 Panel de Administración GOBA
          </h1>
          <p className="text-gray-600">Sistema Firebase - Desarrollo Activo</p>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-600">👥 Usuarios</h3>
            <p className="text-2xl font-bold">{firebaseUsers.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border-l-4 border-yellow-500">
            <h3 className="font-semibold text-gray-600">📝 Solicitudes</h3>
            <p className="text-2xl font-bold">{pendingRequests.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border-l-4 border-green-500">
            <h3 className="font-semibold text-gray-600">🗳️ Nominaciones</h3>
            <p className="text-2xl font-bold">{totalNominaciones}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border-l-4 border-purple-500">
            <h3 className="font-semibold text-gray-600">⭐ Participantes</h3>
            <p className="text-2xl font-bold">{usuariosConNominaciones}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border-l-4 border-pink-500">
            <h3 className="font-semibold text-gray-600">📸 Fotos Pendientes</h3>
            <p className="text-2xl font-bold">{totalFotosPendientes}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border-l-4 border-indigo-500">
            <h3 className="font-semibold text-gray-600">📅 Eventos</h3>
            <p className="text-2xl font-bold">{eventos.length}</p>
          </div>
          {/* Nueva estadística de pedidos */}
          <div className="bg-white rounded-xl p-4 shadow border-l-4 border-orange-500">
            <h3 className="font-semibold text-gray-600">🛒 Pedidos</h3>
            <p className="text-2xl font-bold">{statsPedidos.total}</p>
            <p className="text-xs text-orange-600">
              {statsPedidos.pendientes} pendientes
            </p>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex space-x-2 mb-6 bg-white rounded-lg p-1 shadow overflow-x-auto">
          {['solicitudes', 'usuarios', 'nominaciones','puntos_usuarios', 'fotos_challenges', 'fotos_galeria', 'eventos', 'pedidos', 'configuracion'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex-shrink-0 py-2 px-4 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeSection === section
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {section === 'solicitudes' && '📝 Solicitudes'}
              {section === 'usuarios' && '👥 Usuarios'}
              {section === 'nominaciones' && '🗳️ Nominaciones'}
              {section === 'puntos_usuarios' && '🏆 Puntos Usuarios'}
              {section === 'fotos_challenges' && '🎮 Fotos Challenges'}
              {section === 'fotos_galeria' && '📸 Fotos Galería'}
              {section === 'eventos' && '📅 Eventos'}
              {section === 'pedidos' && '🛒 Pedidos Tienda'}
              {section === 'configuracion' && '⚙️ Configuración'}
            </button>
          ))}
        </div>

        {/* Contenido Dinámico */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* SECCIÓN: SOLICITUDES PENDIENTES */}
          {activeSection === 'solicitudes' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📝 Solicitudes de Registro Pendientes</h2>
              
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No hay solicitudes pendientes
                  </h3>
                  <p className="text-gray-500">
                    Todas las solicitudes han sido procesadas.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border-2 border-yellow-300 rounded-xl p-4 bg-yellow-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{request.avatar || '👤'}</span>
                            <h3 className="font-bold text-lg text-gray-800">
                              {request.nombreSolicitado}
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                            <p><strong>🔒 Código:</strong> {request.codigoSecretoSolicitado}</p>
                            <p><strong>🗺️ País:</strong> {request.pais || 'Por asignar'}</p>
                            <p><strong>📅 Solicitado:</strong> {new Date(request.fechaSolicitud).toLocaleDateString()}</p>
                            <p><strong>🆔 ID:</strong> {request.id}</p>
                            {request.frase && (
                              <p className="col-span-2"><strong>💬 Frase:</strong> "{request.frase}"</p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApproveRequest(request)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            ✅ Aprobar
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id, request.nombreSolicitado)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN: USUARIOS */}
          {activeSection === 'usuarios' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">👥 Usuarios Registrados en Firebase</h2>
              
              {firebaseUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">😴</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No hay usuarios registrados
                  </h3>
                  <p className="text-gray-500">
                    Los usuarios aparecerán aquí cuando apruebes solicitudes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {firebaseUsers.map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{user.avatar || '👤'}</div>
                          <div>
                            <h3 className="font-bold text-lg">
                              {user.nombre}
                              {user.esAdmin && <span className="ml-2 text-red-600 text-sm">👑 ADMIN</span>}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>🔒 Código:</strong> {user.codigoSecreto}</p>
                              <p><strong>🗺️ País:</strong> {user.pais || 'No asignado'}</p>
                              {user.frase && (
                                <p><strong>💬 Frase:</strong> "{user.frase}"</p>
                              )}
                              <p><strong>🆔 ID:</strong> {user.id}</p>
                              <p className="text-xs text-gray-500">
                                📅 Registrado: {new Date(user.fechaRegistro).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!user.esAdmin && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.nombre)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              🗑️ Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN: NOMINACIONES */}
          {activeSection === 'nominaciones' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">🗳️ Nominaciones en Firebase</h2>
              
              {totalNominaciones === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No hay nominaciones aún
                  </h3>
                  <p className="text-gray-500">
                    Las nominaciones aparecerán aquí cuando los usuarios empiecen a votar.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">
                      <strong>Total nominaciones:</strong> {totalNominaciones} | 
                      <strong> Usuarios que nominaron:</strong> {usuariosConNominaciones}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(nominaciones).map(([userId, userData]) => (
                      <div key={userId} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-bold mb-3 text-lg">
                          Usuario: {userId}
                        </h3>
                        {userData && userData.nominaciones ? (
                          <div className="grid gap-2">
                            {Object.entries(userData.nominaciones).map(([categoriaId, nominados]) => (
                              <div key={categoriaId} className="text-sm">
                                <strong>Categoría {categoriaId}:</strong> {Array.isArray(nominados) ? nominados.join(', ') : 'Sin nominados'}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No tiene nominaciones</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN: FOTOS CHALLENGES PENDIENTES */}
          {activeSection === 'fotos_challenges' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">🎮 Fotos de Challenges Pendientes</h2>
              
              {pendingPhotos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No hay fotos pendientes de challenges
                  </h3>
                  <p className="text-gray-500">
                    Todas las fotos de challenges han sido revisadas y aprobadas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingPhotos.map((photo) => {
                    const usuario = firebaseUsers.find(user => user.id === photo.userId);
                    return (
                      <div key={photo.id} className="border-2 border-yellow-300 rounded-xl p-4 bg-yellow-50">
                        <div className="text-center mb-3">
                          <img 
                            src={photo.imageUrl} 
                            alt="Foto para aprobación" 
                            className="w-full h-48 object-cover rounded-lg mx-auto"
                          />
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{usuario?.avatar || '👤'}</span>
                            <p><strong>👤 Usuario:</strong> {usuario ? usuario.nombre : 'Usuario no encontrado'}</p>
                          </div>
                          <p><strong>📷 Reto:</strong> {photo.challengeId}</p>
                          <p><strong>📅 Fecha:</strong> {new Date(photo.timestamp?.toDate()).toLocaleString()}</p>
                          <p><strong>📏 Tamaño:</strong> {(photo.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprovePhoto(photo)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors"
                          >
                            ✅ Aprobar (+10pts)
                          </button>
                          <button
                            onClick={() => handleRejectPhoto(photo)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors"
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN: FOTOS GALERÍA PENDIENTES */}
          {activeSection === 'fotos_galeria' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📸 Fotos de Galería Pendientes</h2>
              
              {pendingGalleryPhotos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No hay fotos pendientes para la galería
                  </h3>
                  <p className="text-gray-500">
                    Todas las fotos de la galería han sido revisadas y aprobadas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingGalleryPhotos.map((foto) => {
                    const usuario = firebaseUsers.find(user => user.id === foto.userId);
                    return (
                      <div key={foto.id} className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50">
                        <div className="text-center mb-3">
                          <img 
                            src={foto.imageUrl} 
                            alt={foto.titulo} 
                            className="w-full h-48 object-cover rounded-lg mx-auto"
                          />
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{usuario?.avatar || '👤'}</span>
                            <p><strong>👤 Usuario:</strong> {usuario ? usuario.nombre : 'Usuario no encontrado'}</p>
                          </div>
                          <p><strong>📝 Título:</strong> {foto.titulo}</p>
                          <p><strong>📄 Descripción:</strong> {foto.descripcion || 'Sin descripción'}</p>
                          <p><strong>📅 Fecha:</strong> {new Date(foto.createdAt?.toDate()).toLocaleString()}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleApproveGalleryPhoto(foto)}
                            className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors"
                          >
                            ✅ Aprobar
                          </button>
                          <button
                            onClick={() => handleRejectGalleryPhoto(foto)}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors"
                          >
                            ❌ Rechazar
                          </button>
                          <button
                            onClick={() => handleDeleteGalleryPhoto(foto)}
                            className="col-span-2 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
                          >
                            🗑️ Eliminar Permanentemente
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN: EVENTOS */}
          {activeSection === 'eventos' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">📅 Gestión de Eventos del Calendario</h2>
                <button
                  onClick={() => setMostrarFormularioEvento(true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  + Nuevo Evento
                </button>
              </div>

              {/* Formulario de Evento */}
              {mostrarFormularioEvento && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6 border">
                  <h3 className="text-xl font-bold mb-4">
                    {eventoEditando ? '✏️ Editar Evento' : '➕ Crear Nuevo Evento'}
                  </h3>
                  
                  <form onSubmit={eventoEditando ? editarEvento : crearEvento} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha *
                        </label>
                        <input
                          type="date"
                          name="fecha"
                          value={formEvento.fecha}
                          onChange={handleInputChangeEvento}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Icono *
                        </label>
                        <select
                          name="icono"
                          value={formEvento.icono}
                          onChange={handleInputChangeEvento}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {iconosDisponibles.map(icono => (
                            <option key={icono} value={icono}>
                              {icono} {icono}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título *
                      </label>
                      <input
                        type="text"
                        name="titulo"
                        value={formEvento.titulo}
                        onChange={handleInputChangeEvento}
                        placeholder="Ej: Cumpleaños de María"
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        value={formEvento.descripcion}
                        onChange={handleInputChangeEvento}
                        placeholder="Ej: ¡Felicidades María! Celebración familiar"
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Guardando...' : (eventoEditando ? 'Actualizar' : 'Crear')}
                      </button>
                      <button
                        type="button"
                        onClick={cancelarEvento}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Lista de Eventos */}
              <div>
                <h3 className="text-xl font-bold mb-4">📋 Eventos Existentes ({eventos.length})</h3>
                
                {eventos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No hay eventos creados aún
                    </h3>
                    <p className="text-gray-500">
                      Crea el primer evento usando el botón "Nuevo Evento"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {eventos
                      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                      .map(evento => (
                        <div key={evento.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{evento.icono}</div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{evento.titulo}</h3>
                              <p className="text-sm text-gray-600">{evento.descripcion}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(evento.fecha).toLocaleDateString('es-ES', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => iniciarEdicionEvento(evento)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => eliminarEvento(evento.id, evento.titulo)}
                              className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NUEVA SECCIÓN: PEDIDOS DE LA TIENDA */}
          {activeSection === 'pedidos' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">🛒 Pedidos de la Tienda</h2>
              
              {/* Estadísticas de Pedidos */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{statsPedidos.total}</p>
                  <p className="text-blue-700 text-sm">Total</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">{statsPedidos.pendientes}</p>
                  <p className="text-yellow-700 text-sm">Pendientes</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-600">{statsPedidos.preparando}</p>
                  <p className="text-orange-700 text-sm">Preparando</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{statsPedidos.entregados}</p>
                  <p className="text-green-700 text-sm">Entregados</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{statsPedidos.puntosCanjeados}</p>
                  <p className="text-purple-700 text-sm">Puntos Canjeados</p>
                </div>
              </div>

              {pedidos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No hay pedidos aún
                  </h3>
                  <p className="text-gray-500">
                    Los pedidos aparecerán aquí cuando los usuarios canjeen puntos.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pedidos
                    .sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
                    .map(pedido => {
                      const usuario = firebaseUsers.find(user => user.id === pedido.usuarioId);
                      return (
                        <div key={pedido.id} className={`border-2 rounded-xl p-4 ${
                          pedido.estado === 'pendiente' ? 'border-yellow-300 bg-yellow-50' :
                          pedido.estado === 'preparando' ? 'border-orange-300 bg-orange-50' :
                          pedido.estado === 'entregado' ? 'border-green-300 bg-green-50' :
                          'border-red-300 bg-red-50'
                        }`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{usuario?.avatar || '👤'}</span>
                                <div>
                                  <h3 className="font-bold text-lg">{pedido.producto.nombre}</h3>
                                  <p className="text-gray-600">
                                    Cliente: {usuario ? usuario.nombre : 'Usuario no encontrado'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                <p><strong>💰 Coste:</strong> {pedido.puntosCoste} puntos</p>
                                <p><strong>📅 Pedido:</strong> {new Date(pedido.fechaPedido).toLocaleString()}</p>
                                <p><strong>🆔 ID:</strong> {pedido.id}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                pedido.estado === 'preparando' ? 'bg-orange-100 text-orange-700' :
                                pedido.estado === 'entregado' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {pedido.estado}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            {pedido.estado === 'pendiente' && (
                              <>
                                <button
                                  onClick={() => manejarPedido(pedido.id, 'preparando')}
                                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                  👨‍🍳 Preparando
                                </button>
                                <button
                                  onClick={() => manejarPedido(pedido.id, 'cancelar')}
                                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                  ❌ Cancelar
                                </button>
                              </>
                            )}
                            
                            {pedido.estado === 'preparando' && (
                              <button
                                onClick={() => manejarPedido(pedido.id, 'entregado')}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                              >
                                ✅ Marcar Entregado
                              </button>
                            )}
                            
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                              📞 Contactar
                            </button>
                            
                            {pedido.estado === 'entregado' && (
                              <span className="bg-green-100 text-green-700 px-3 py-2 rounded-lg font-medium">
                                🎉 Entregado
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
{activeSection === 'puntos_usuarios' && (
  <div>
    <h2 className="text-2xl font-bold mb-6">🏆 Puntos de Usuarios</h2>
    
    {/* Estadísticas rápidas */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-yellow-50 p-4 rounded-xl text-center border-l-4 border-yellow-500">
        <p className="text-2xl font-bold text-yellow-600">
          {firebaseUsers.filter(u => (u.puntos || 0) > 0).length}
        </p>
        <p className="text-yellow-700 text-sm">Usuarios con puntos</p>
      </div>
      <div className="bg-green-50 p-4 rounded-xl text-center border-l-4 border-green-500">
        <p className="text-2xl font-bold text-green-600">
          {firebaseUsers.reduce((total, user) => total + (user.puntos || 0), 0)}
        </p>
        <p className="text-green-700 text-sm">Puntos totales</p>
      </div>
      <div className="bg-blue-50 p-4 rounded-xl text-center border-l-4 border-blue-500">
        <p className="text-2xl font-bold text-blue-600">
          {Math.max(...firebaseUsers.map(u => u.puntos || 0))}
        </p>
        <p className="text-blue-700 text-sm">Máximo puntos</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-xl text-center border-l-4 border-purple-500">
        <p className="text-2xl font-bold text-purple-600">
          {Math.round(firebaseUsers.reduce((total, user) => total + (user.puntos || 0), 0) / Math.max(firebaseUsers.length, 1))}
        </p>
        <p className="text-purple-700 text-sm">Promedio por usuario</p>
      </div>
    </div>
{/* Tabla de usuarios */}
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Usuario
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          País
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Puntos
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {obtenerPuntosUsuarios().map((usuario, index) => (
        <tr key={usuario.id} className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="text-2xl mr-3">{usuario.avatar}</div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {usuario.nombre}
                  {index === 0 && <span className="ml-2 text-yellow-500">👑</span>}
                  {index === 1 && <span className="ml-2 text-gray-400">🥈</span>}
                  {index === 2 && <span className="ml-2 text-orange-500">🥉</span>}
                </div>
                <div className="text-sm text-gray-500">ID: {usuario.id}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{usuario.pais}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-bold text-green-600">{usuario.puntos} pts</div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
   

    {/* Leyenda */}
    <div className="mt-4 text-sm text-gray-600">
      <p>🎯 <strong>Equivalencia:</strong> 1 punto = L. 1.00</p>
      <p>💰 <strong>Presupuesto total: L.1,000.00</strong> </p>
    </div>
  </div>
)}
          {/* SECCIÓN: CONFIGURACIÓN */}
          {activeSection === 'configuracion' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">⚙️ Configuración del Sistema</h2>
              
              <div className="grid gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-bold mb-2">🔐 Estado de Autenticación</h3>
                  <p className="text-sm text-gray-600">
                    Admin autenticado correctamente en Firebase
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-bold mb-2">📊 Estadísticas del Sistema</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Usuarios registrados: {firebaseUsers.length}</p>
                    <p>• Solicitudes pendientes: {pendingRequests.length}</p>
                    <p>• Fotos challenges pendientes: {pendingPhotos.length}</p>
                    <p>• Fotos galería pendientes: {pendingGalleryPhotos.length}</p>
                    <p>• Eventos del calendario: {eventos.length}</p>
                    <p>• Total nominaciones: {totalNominaciones}</p>
                    <p>• Pedidos tienda: {statsPedidos.total} (📦{statsPedidos.pendientes} pendientes)</p>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-bold mb-4 text-lg">🎮 Control de Concursos y Juegos</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CONTROL JUEGOS */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 text-purple-800">🎪 Juegos Navideños</h4>
                      <div className="space-y-2">
                        <button
                          onClick={async () => {
                            if (window.confirm('¿REINICIAR TODOS LOS PUNTAJES DE JUEGOS?\n\n⚠️ Esta acción eliminará todos los rankings y sesiones de juego. NO SE PUEDE DESHACER.')) {
                              try {
                                setLoading(true);
                                const resultado = await gobaService.reiniciarTodosLosPuntajes();
                                alert(resultado.message);
                              } catch (error) {
                                alert('❌ Error reiniciando puntajes: ' + error.message);
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
                        >
                          🗑️ Reiniciar Todos los Puntajes
                        </button>
                        
                        <button
                          onClick={async () => {
                            try {
                              setLoading(true);
                              const stats = await gobaService.obtenerEstadisticasJuegos();
                              alert(`📊 Estadísticas de Juegos:\n\n• Rankings: ${stats.totalRankings}\n• Sesiones: ${stats.totalSessions}\n• Juegos únicos: ${stats.juegosUnicos}\n\nPor juego: ${JSON.stringify(stats.porJuego, null, 2)}`);
                            } catch (error) {
                              alert('❌ Error obteniendo estadísticas: ' + error.message);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded transition-colors"
                        >
                          📊 Ver Estadísticas
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-bold mb-2">🗑️ Acciones Peligrosas</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        if (window.confirm('¿ELIMINAR TODOS LOS USUARIOS? Esto no se puede deshacer.')) {
                          alert('Función en desarrollo...');
                        }
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
                    >
                      🚨 Eliminar Todos los Usuarios
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('¿ELIMINAR TODAS LAS NOMINACIONES?')) {
                          alert('Función en desarrollo...');
                        }
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition-colors"
                    >
                      🗑️ Eliminar Todas las Nominaciones
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('¿ELIMINAR TODAS LAS FOTOS PENDIENTES?')) {
                          alert('Función en desarrollo...');
                        }
                      }}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded transition-colors"
                    >
                      🗑️ Eliminar Todas las Fotos Pendientes
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('¿ELIMINAR TODOS LOS EVENTOS?')) {
                          alert('Función en desarrollo...');
                        }
                      }}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded transition-colors"
                    >
                      🗑️ Eliminar Todos los Eventos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navegación Inferior */}
        <div className="text-center mt-8">
          <Link 
            to="/" 
            className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            ← Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}