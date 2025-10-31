// src/services/firebaseService.jsx
import { db } from './firebase.jsx';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  updateDoc,
  addDoc,
  increment,
  limit
} from 'firebase/firestore';

console.log("🔧 firebaseService - db:", db ? "✅ DEFINIDO" : "❌ UNDEFINED");

// 🗳️ SERVICIO PARA GOBA AWARDS
export const gobaService = {
  async guardarNominaciones(usuarioId, nominaciones) {
    try {
      console.log("🔧 Intentando guardar en Firebase...", { 
        usuarioId,
        nominacionesRecibidas: nominaciones,
        db: db ? "✅ DEFINIDO" : "❌ UNDEFINED"
      });
      
      // ✅ VALIDACIONES ROBUSTAS
      if (!db) {
        console.error("❌ ERROR: db es undefined");
        throw new Error("Firebase no está inicializado");
      }
      
      if (!usuarioId) {
        console.error("❌ ERROR: usuarioId es requerido");
        throw new Error("ID de usuario es requerido");
      }

      const nominacionesFinales = nominaciones || {};
      
      console.log("📝 Guardando datos finales:", {
        usuarioId,
        nominaciones: nominacionesFinales,
      });
      
      await setDoc(doc(db, "nominaciones", usuarioId), {
        usuarioId,
        nominaciones: nominacionesFinales,
        timestamp: serverTimestamp(), 
        fechaActualizacion: new Date().toISOString()
      });
      
      console.log("✅ Nominaciones guardadas exitosamente en Firebase");
      return true;
      
    } catch (error) {
      console.error("❌ Error CRÍTICO guardando nominaciones:", error);
      console.error("🔍 Detalles del error:", {
        mensaje: error.message,
        stack: error.stack
      });
      throw error; 
    }
  },

  // 🆕 FUNCIÓN PARA OBTENER EVANGELIO DEL DÍA DESDE VATICAN NEWS
  async obtenerEvangelioDelDia() {
    try {
      console.log("📖 Obteniendo Evangelio del día desde Vatican News...");
      
      // Usar CORS proxy para evitar problemas de CORS
      const proxyUrl = 'https://corsproxy.io/?';
      const targetUrl = 'https://www.vaticannews.va/es/evangelio-de-hoy.html';
      
      const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const html = await response.text();
      console.log("✅ HTML obtenido de Vatican News");
      
      // Parsear el HTML para extraer el Evangelio
      return this.extraerEvangelioDelHTML(html);
      
    } catch (error) {
      console.error("❌ Error obteniendo Evangelio:", error);
      
      // Fallback: Evangelio por defecto
      return {
        lectura: "En aquel tiempo, Jesús dijo a sus discípulos: 'Velad, pues, porque no sabéis qué día vendrá vuestro Señor.'",
        reflexion: "Mantengámonos vigilantes en este tiempo de Adviento, preparando nuestros corazones para la venida del Señor.",
        referencia: "Mateo 24, 42",
        fuente: "Evangelio por defecto"
      };
    }
  },

  // 🆕 FUNCIÓN PARA EXTRAER EVANGELIO DEL HTML
  extraerEvangelioDelHTML(html) {
    try {
      console.log("🔍 Extrayendo Evangelio del HTML...");
      
      // Crear un parser de HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Buscar el contenido del Evangelio en Vatican News
      const selectoresPosibles = [
        '.article-body',
        '.content-article',
        '.entry-content',
        '[class*="evangelio"]',
        '[class*="lectura"]',
        '.text'
      ];
      
      let contenidoEvangelio = '';
      let referencia = '';
      
      // Intentar con cada selector
      for (const selector of selectoresPosibles) {
        const elementos = doc.querySelectorAll(selector);
        if (elementos.length > 0) {
          // Tomar el primer párrafo que tenga contenido significativo
          for (let elemento of elementos) {
            const texto = elemento.textContent.trim();
            if (texto.length > 100 && texto.includes('Jesús') || texto.includes('Evangelio')) {
              contenidoEvangelio = texto.substring(0, 500) + '...'; // Limitar longitud
              console.log("✅ Evangelio encontrado con selector:", selector);
              break;
            }
          }
          if (contenidoEvangelio) break;
        }
      }
      
      // Buscar título o referencia
      const tituloSelectores = [
        'h1', 'h2', '.entry-title', '.article-title', '.title'
      ];
      
      for (const selector of tituloSelectores) {
        const elemento = doc.querySelector(selector);
        if (elemento) {
          referencia = elemento.textContent.trim();
          break;
        }
      }
      
      // Si no se encontró contenido, usar valores por defecto
      if (!contenidoEvangelio) {
        console.log("⚠️ No se pudo extraer Evangelio, usando contenido por defecto");
        return {
          lectura: "En aquel tiempo, Jesús dijo a sus discípulos: 'Velad, pues, porque no sabéis qué día vendrá vuestro Señor.'",
          reflexion: "El Adviento nos llama a la vigilancia y la conversión. Preparemos nuestros corazones para recibir al Salvador.",
          referencia: referencia || "Mateo 24, 42",
          fuente: "Evangelio por defecto"
        };
      }
      
      // Generar reflexión basada en el Evangelio
      const reflexion = this.generarReflexionDesdeEvangelio(contenidoEvangelio);
      
      return {
        lectura: contenidoEvangelio,
        reflexion: reflexion,
        referencia: referencia || "Evangelio del día",
        fuente: "Vatican News"
      };
      
    } catch (error) {
      console.error("❌ Error extrayendo Evangelio del HTML:", error);
      return {
        lectura: "En aquel tiempo, Jesús dijo a sus discípulos: 'Velad, pues, porque no sabéis qué día vendrá vuestro Señor.'",
        reflexion: "Mantengámonos vigilantes en este tiempo de Adviento.",
        referencia: "Mateo 24, 42",
        fuente: "Error en extracción"
      };
    }
  },

  // 🆕 GENERAR REFLEXIÓN AUTOMÁTICA
  generarReflexionDesdeEvangelio(evangelioTexto) {
    const reflexionesAdviento = [
      "En este Adviento, dejemos que la Palabra de Dios transforme nuestros corazones y nos prepare para recibir al Salvador.",
      "María nos enseña a decir 'sí' a Dios con humildad y confianza. Sigamos su ejemplo en este tiempo de espera.",
      "La espera del Adviento no es pasiva. Es un tiempo activo de conversión, oración y preparación interior.",
      "Jesús viene a nosotros de manera humilde. Preparemos el camino en nuestros corazones con sencillez y amor.",
      "La luz de Cristo quiere disipar nuestras tinieblas. Abrámosle la puerta de nuestro corazón en este Adviento.",
      "Dios cumple siempre sus promesas. Confiemos en su amor y misericordia mientras esperamos su venida.",
      "El Adviento nos invita a la vigilancia espiritual. Mantengámonos despiertos y atentos a los signos de Dios.",
      "Como Juan Bautista, seamos voces que preparan el camino del Señor en el desierto de este mundo.",
      "La esperanza cristiana no defrauda. En medio de las dificultades, confiamos en la venida del Salvador.",
      "Dios se hace pequeño para que podamos acogerlo. Hagámonos pequeños en la humildad para recibirlo."
    ];
    
    // Elegir reflexión basada en palabras clave del Evangelio
    const textoLower = evangelioTexto.toLowerCase();
    
    if (textoLower.includes('maría') || textoLower.includes('virgen')) {
      return reflexionesAdviento[1];
    } else if (textoLower.includes('luz') || textoLower.includes('tinieblas')) {
      return reflexionesAdviento[4];
    } else if (textoLower.includes('espera') || textoLower.includes('velad')) {
      return reflexionesAdviento[6];
    } else if (textoLower.includes('camino') || textoLower.includes('preparad')) {
      return reflexionesAdviento[7];
    } else if (textoLower.includes('esperanza') || textoLower.includes('promesa')) {
      return reflexionesAdviento[8];
    } else if (textoLower.includes('humild') || textoLower.includes('pequeño')) {
      return reflexionesAdviento[9];
    }
    
    // Reflexión aleatoria por defecto
    const indiceAleatorio = Math.floor(Math.random() * reflexionesAdviento.length);
    return reflexionesAdviento[indiceAleatorio];
  },

  // 🔥 NUEVAS FUNCIONES PARA EL SISTEMA DE LOGIN

  // 1. Obtener usuario por credenciales (nombre y código)
  async obtenerUsuarioPorCredenciales(nombre, codigoSecreto) {
    try {
      console.log("🔍 Buscando usuario:", nombre, codigoSecreto);
      
      const q = query(
        collection(db, "usuarios"),
        where("nombre", "==", nombre.trim()),
        where("codigoSecreto", "==", codigoSecreto)
      );
      
      const querySnapshot = await getDocs(q);
      console.log("📊 Resultados encontrados:", querySnapshot.size);
      
      if (!querySnapshot.empty) {
        const userData = { 
          id: querySnapshot.docs[0].id, 
          ...querySnapshot.docs[0].data() 
        };
        console.log("✅ Usuario encontrado:", userData);
        return userData;
      }
      
      console.log("❌ Usuario no encontrado");
      return null;
    } catch (error) {
      console.error("❌ Error buscando usuario:", error);
      return null;
    }
  },

  // 2. Crear solicitud de registro
  async crearSolicitudRegistro(solicitudData) {
    try {
      console.log("📝 Creando solicitud:", solicitudData);
      
      await setDoc(doc(db, "solicitudesRegistro", solicitudData.id), {
        ...solicitudData,
        fechaSolicitud: new Date().toISOString(), // ← TIMESTAMP LOCAL
        estado: "pendiente" // ← ASEGURAR que siempre tenga estado
      });
      
      console.log("✅ Solicitud creada con ID:", solicitudData.id);
      return true;
    } catch (error) {
      console.error("❌ Error creando solicitud:", error);
      return false;
    }
  },

  // 3. Obtener solicitud pendiente por nombre (para evitar duplicados)
  async obtenerSolicitudPendientePorNombre(nombre) {
    try {
      console.log("🔍 Buscando solicitudes pendientes para:", nombre);
      
      const q = query(
        collection(db, "solicitudesRegistro"),
        where("nombreSolicitado", "==", nombre.trim()),
        where("estado", "==", "pendiente")
      );
      
      const querySnapshot = await getDocs(q);
      console.log("📊 Solicitudes pendientes encontradas:", querySnapshot.size);
      
      if (!querySnapshot.empty) {
        const solicitud = { 
          id: querySnapshot.docs[0].id, 
          ...querySnapshot.docs[0].data() 
        };
        console.log("✅ Solicitud pendiente encontrada:", solicitud);
        return solicitud;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error buscando solicitudes:", error);
      return null;
    }
  },

  // 4. Obtener todas las solicitudes de registro (para admin)
  async obtenerTodasSolicitudesRegistro() {
    try {
      console.log("📋 Obteniendo todas las solicitudes...");
      
      const q = query(
        collection(db, "solicitudesRegistro"), 
        where("estado", "==", "pendiente")
      );
      
      const querySnapshot = await getDocs(q);
      const solicitudes = [];
      
      querySnapshot.forEach((doc) => {
        solicitudes.push({ id: doc.id, ...doc.data() });
      });
      
      console.log("✅ Solicitudes obtenidas:", solicitudes.length);
      return solicitudes;
    } catch (error) {
      console.error("❌ Error obteniendo solicitudes:", error);
      return [];
    }
  },

  // 5. Actualizar solicitud de registro (aprobación/rechazo)
  async actualizarSolicitudRegistro(solicitudId, newData) {
    try {
      console.log("📝 Actualizando solicitud:", solicitudId, newData);
      
      await setDoc(doc(db, "solicitudesRegistro", solicitudId), {
        ...newData,
        fechaActualizacion: serverTimestamp(),
      }, { merge: true });
      
      console.log("✅ Solicitud actualizada:", solicitudId);
      return true;
    } catch (error) {
      console.error("❌ Error actualizando solicitud:", error);
      return false;
    }
  },

  // 6. Crear usuario aprobado
  async crearUsuarioAprobado(userData) {
    try {
      console.log("👤 Creando usuario aprobado:", userData);
      
      if (!userData.id) {
        console.error("❌ ERROR: ID de usuario es requerido");
        return false;
      }
      
      // ✅ AGREGAR CAMPOS POR DEFECTO PARA EVITAR UNDEFINED
      const usuarioConDefaults = {
        avatar: '👤',
        pais: 'HN',
        puntos: 0,
        esAdmin: false,
        ...userData
      };
      
      await setDoc(doc(db, "usuarios", userData.id), {
        ...usuarioConDefaults,
        fechaRegistro: serverTimestamp(),
      });
      
      console.log("✅ Usuario creado/aprobado:", userData.id);
      return true;
    } catch (error) {
      console.error("❌ Error creando usuario aprobado:", error);
      return false;
    }
  },

  // 7. Obtener todos los usuarios (para admin)
  async obtenerTodosUsuarios() {
    try {
      console.log("👥 Obteniendo todos los usuarios...");
      
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const todosUsuarios = [];
      
      querySnapshot.forEach((doc) => {
        todosUsuarios.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log("✅ Usuarios obtenidos:", todosUsuarios.length);
      return todosUsuarios;
    } catch (error) {
      console.error("❌ Error obteniendo usuarios:", error);
      return [];
    }
  },

  // 8. Eliminar usuario (para admin)
  async eliminarUsuario(usuarioId) {
    try {
      console.log("🗑️ Eliminando usuario:", usuarioId);
      
      await deleteDoc(doc(db, "usuarios", usuarioId));
      console.log("✅ Usuario eliminado:", usuarioId);
      return true;
    } catch (error) {
      console.error("❌ Error eliminando usuario:", error);
      return false;
    }
  },

  // 9. Obtener todas las nominaciones (para admin)
  async obtenerTodasNominaciones() {
    try {
      console.log("🗳️ Obteniendo todas las nominaciones...");
      
      const querySnapshot = await getDocs(collection(db, "nominaciones"));
      const todasNominaciones = {};
      
      querySnapshot.forEach((doc) => {
        todasNominaciones[doc.id] = doc.data();
      });
      
      console.log("✅ Nominaciones obtenidas:", Object.keys(todasNominaciones).length);
      return todasNominaciones;
    } catch (error) {
      console.error("❌ Error obteniendo nominaciones:", error);
      return {};
    }
  },

  // 🔍 FUNCIÓN TEMPORAL DE DIAGNÓSTICO
  async diagnosticarSolicitudes() {
    try {
      console.log("🩺 INICIANDO DIAGNÓSTICO DE SOLICITUDES...");
      
      // 1. Obtener TODAS las solicitudes sin filtro
      const querySnapshot = await getDocs(collection(db, "solicitudesRegistro"));
      const todasSolicitudes = [];
      
      querySnapshot.forEach((doc) => {
        todasSolicitudes.push({ 
          id: doc.id, 
          ...doc.data() 
        });
      });
      
      console.log("📋 TODAS las solicitudes en la colección:", todasSolicitudes);
      
      // 2. Verificar campos de cada solicitud
      todasSolicitudes.forEach((solicitud, index) => {
        console.log(`📄 Solicitud ${index + 1}:`, {
          id: solicitud.id,
          nombre: solicitud.nombreSolicitado,
          estado: solicitud.estado,
          tieneEstado: !!solicitud.estado,
          fecha: solicitud.fechaSolicitud
        });
      });
      
      // 3. Filtrar manualmente las pendientes
      const pendientesManual = todasSolicitudes.filter(s => s.estado === 'pendiente');
      console.log("✅ Solicitudes pendientes (filtro manual):", pendientesManual);
      
      return pendientesManual;
    } catch (error) {
      console.error("❌ Error en diagnóstico:", error);
      return [];
    }
  },

  // 10. Registrar usuario (función existente - mantener compatibilidad)
  async registrarUsuario(userData) {
    try {
      console.log("📝 Registrando usuario (compatibilidad):", userData);
      
      if (!userData.id) {
        console.error("❌ ERROR: ID de usuario es requerido");
        return false;
      }
      
      await setDoc(doc(db, "usuarios", userData.id), {
        ...userData,
        fechaRegistro: serverTimestamp(),
      }, { merge: true });
      
      console.log("✅ Usuario registrado:", userData.id);
      return true;
    } catch (error) {
      console.error("❌ Error registrando usuario:", error);
      return false;
    }
  },

  // 🆕 CALENDARIO - EVENTOS
  async obtenerTodosEventos() {
    try {
      console.log("📅 Obteniendo todos los eventos...");
      
      const querySnapshot = await getDocs(collection(db, "eventos"));
      const eventos = [];
      
      querySnapshot.forEach((doc) => {
        eventos.push({ 
          id: doc.id, 
          ...doc.data() 
        });
      });
      
      console.log("✅ Eventos obtenidos:", eventos.length);
      return eventos;
    } catch (error) {
      console.error("❌ Error obteniendo eventos:", error);
      return [];
    }
  },

  async crearEvento(eventoData) {
    try {
      console.log("📝 Creando evento:", eventoData);
      
      const docRef = doc(collection(db, "eventos"));
      await setDoc(docRef, {
        ...eventoData,
        fechaCreacion: serverTimestamp()
      });
      
      console.log("✅ Evento creado con ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error creando evento:", error);
      return false;
    }
  },

  async actualizarEvento(eventoId, nuevosDatos) {
    try {
      console.log("📝 Actualizando evento:", eventoId, nuevosDatos);
      
      await setDoc(doc(db, "eventos", eventoId), nuevosDatos, { merge: true });
      console.log("✅ Evento actualizado:", eventoId);
      return true;
    } catch (error) {
      console.error("❌ Error actualizando evento:", error);
      return false;
    }
  },

  async eliminarEvento(eventoId) {
    try {
      console.log("🗑️ Eliminando evento:", eventoId);
      
      await deleteDoc(doc(db, "eventos", eventoId));
      console.log("✅ Evento eliminado:", eventoId);
      return true;
    } catch (error) {
      console.error("❌ Error eliminando evento:", error);
      return false;
    }
  },

  // 🆕 VOTOS
  async guardarVoto(usuarioId, categoriaId, finalista) {
    try {
      console.log("🗳️ Guardando voto:", { usuarioId, categoriaId, finalista });
      
      const votoRef = doc(db, "votos", `${usuarioId}_${categoriaId}`);
      
      await setDoc(votoRef, {
        usuarioId: usuarioId,
        categoriaId: categoriaId,
        finalistaVotado: finalista,
        fechaVoto: new Date().toISOString(),
        ultimaModificacion: new Date().toISOString()
      }, { merge: true });
      
      console.log("✅ Voto guardado:", votoRef.id);
      return true;
    } catch (error) {
      console.error("❌ Error guardando voto:", error);
      return false;
    }
  },

  async obtenerVotoUsuario(usuarioId, categoriaId) {
    try {
      console.log("🔍 Obteniendo voto del usuario:", { usuarioId, categoriaId });
      
      const docRef = doc(db, "votos", `${usuarioId}_${categoriaId}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const voto = docSnap.data();
        console.log("✅ Voto encontrado:", voto);
        return voto;
      }
      
      console.log("ℹ️ No se encontró voto para este usuario y categoría");
      return null;
    } catch (error) {
      console.error("❌ Error obteniendo voto:", error);
      return null;
    }
  },

  async obtenerVotosPorCategoria(categoriaId) {
    try {
      console.log("📊 Obteniendo votos por categoría:", categoriaId);
      
      const q = query(
        collection(db, "votos"),
        where("categoriaId", "==", categoriaId)
      );
      const querySnapshot = await getDocs(q);
      const votos = [];
      
      querySnapshot.forEach((doc) => {
        votos.push({ id: doc.id, ...doc.data() });
      });
      
      console.log("✅ Votos obtenidos:", votos.length);
      return votos;
    } catch (error) {
      console.error("❌ Error obteniendo votos:", error);
      return [];
    }
  },

  async obtenerTodosVotos() {
    try {
      console.log("📋 Obteniendo todos los votos...");
      
      const querySnapshot = await getDocs(collection(db, "votos"));
      const votos = [];
      
      querySnapshot.forEach((doc) => {
        votos.push({ id: doc.id, ...doc.data() });
      });
      
      console.log("✅ Todos los votos obtenidos:", votos.length);
      return votos;
    } catch (error) {
      console.error("❌ Error obteniendo todos los votos:", error);
      return [];
    }
  },

  // Escuchar cambios en tiempo real en las nominaciones
  escucharNominaciones(callback) {
    if (!db) {
      console.error("❌ DB no inicializado para escuchar nominaciones");
      return () => {};
    }
    
    return onSnapshot(collection(db, "nominaciones"), (snapshot) => {
      const nominaciones = [];
      snapshot.forEach((doc) => {
        nominaciones.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(nominaciones);
    }, (error) => {
      console.error("Error en listener de nominaciones:", error);
    });
  },

  // 🆕 Escuchar cambios en tiempo real en eventos
  escucharEventos(callback) {
    if (!db) {
      console.error("❌ DB no inicializado para escuchar eventos");
      return () => {};
    }
    
    return onSnapshot(collection(db, "eventos"), (snapshot) => {
      const eventos = [];
      snapshot.forEach((doc) => {
        eventos.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(eventos);
    }, (error) => {
      console.error("Error en listener de eventos:", error);
    });
  },

  // 🆕 Escuchar cambios en tiempo real en votos
  escucharVotos(callback) {
    if (!db) {
      console.error("❌ DB no inicializado para escuchar votos");
      return () => {};
    }
    
    return onSnapshot(collection(db, "votos"), (snapshot) => {
      const votos = [];
      snapshot.forEach((doc) => {
        votos.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(votos);
    }, (error) => {
      console.error("Error en listener de votos:", error);
    });
  },

  // 🎯 SISTEMA DE CHALLENGES Y FOTOS
  async uploadChallengePhoto(userId, challengeId, file) {
    try {
      console.log("🚀 Iniciando subida de foto para challenge...", {
        usuario: userId,
        reto: challengeId,
        archivo: file.name,
        tamaño: (file.size / 1024 / 1024).toFixed(2) + "MB"
      });

      // 1. Subir a ImgBB
      const imageUrl = await this.uploadToImgBB(file);
      
      // 2. Guardar en Firestore
      const photoData = {
        userId: userId,
        challengeId: challengeId,
        imageUrl: imageUrl,
        timestamp: new Date(),
        approved: false,
        pointsAwarded: 0,
        fileName: file.name,
        fileSize: file.size,
        status: "pending"
      };
      
      const docRef = await addDoc(collection(db, 'challengePhotos'), photoData);
      console.log("✅ Foto guardada en Firestore:", docRef.id);
      
      return { 
        success: true, 
        imageUrl: imageUrl,
        docId: docRef.id,
        message: "Foto subida exitosamente. Espera aprobación del admin."
      };
      
    } catch (error) {
      console.error("❌ Error en uploadChallengePhoto:", error);
      throw error;
    }
  },

  async uploadToImgBB(file) {
    try {
      console.log("📤 Subiendo imagen a ImgBB...");
      
      const formData = new FormData();
      formData.append('image', file);
      
      // Usar la API key del archivo .env.local
      const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
      
      if (!IMGBB_API_KEY) {
        throw new Error("API Key de ImgBB no configurada");
      }
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Imagen subida exitosamente a ImgBB:", data.data.url);
        return data.data.url;
      } else {
        throw new Error(data.error.message || "Error subiendo imagen a ImgBB");
      }
    } catch (error) {
      console.error("❌ Error subiendo a ImgBB:", error);
      throw error;
    }
  },

  // Obtener fotos pendientes de aprobación - CORREGIDA
  async getPendingPhotos() {
    try {
      console.log("🔍 Buscando fotos pendientes...");
      
      const q = query(
        collection(db, 'challengePhotos'),
        where('approved', '==', false),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      const photos = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestampFormatted: doc.data().timestamp?.toDate?.() || new Date()
      }));
      
      console.log("✅ Fotos pendientes obtenidas:", photos.length);
      console.log("📸 Detalles fotos:", photos);
      return photos;
    } catch (error) {
      console.error("❌ Error obteniendo fotos pendientes:", error);
      return [];
    }
  },

  // Aprobar foto (admin)
  async approvePhoto(photoId, userId) {
    try {
      const photoRef = doc(db, 'challengePhotos', photoId);
      await updateDoc(photoRef, {
        approved: true,
        pointsAwarded: 10,
        approvedAt: new Date(),
        status: "approved"
      });

      // Actualizar puntos del usuario
      await this.updateUserPoints(userId, 10);
      
      console.log("✅ Foto aprobada y puntos asignados");
      return { success: true, message: "Foto aprobada y puntos asignados" };
    } catch (error) {
      console.error("❌ Error aprobando foto:", error);
      throw error;
    }
  },

  // Rechazar foto (admin)
  async rejectPhoto(photoId, reason = "No cumple con los requisitos") {
    try {
      const photoRef = doc(db, 'challengePhotos', photoId);
      await updateDoc(photoRef, {
        approved: false,
        rejected: true,
        rejectionReason: reason,
        rejectedAt: new Date(),
        status: "rejected"
      });
      
      console.log("✅ Foto rechazada");
      return { success: true, message: "Foto rechazada" };
    } catch (error) {
      console.error("❌ Error rechazando foto:", error);
      throw error;
    }
  },

  // Obtener fotos aprobadas para galería
  async getApprovedPhotos() {
    try {
      const q = query(
        collection(db, 'challengePhotos'),
        where('approved', '==', true),
        orderBy('approvedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log("✅ Fotos aprobadas obtenidas:", photos.length);
      return photos;
    } catch (error) {
      console.error("❌ Error obteniendo fotos aprobadas:", error);
      return [];
    }
  },

  // Actualizar puntos usuario - CORREGIDA
  async updateUserPoints(userId, puntos) {
    try {
      // ✅ VERIFICAR que userId no sea undefined
      if (!userId) {
        console.error("❌ ERROR: userId es undefined en updateUserPoints");
        throw new Error("ID de usuario es requerido");
      }

      console.log("🎯 Actualizando puntos para:", userId, "Puntos:", puntos);

      const userPointsRef = doc(db, 'userPoints', userId);
      const userPointsSnap = await getDoc(userPointsRef);
      
      if (userPointsSnap.exists()) {
        const currentData = userPointsSnap.data();
        const currentPoints = currentData.puntosTotales || 0;
        
        await updateDoc(userPointsRef, {
          puntosTotales: currentPoints + puntos,
          ultimaActualizacion: new Date()
        });
        
        console.log("✅ Puntos incrementados:", currentPoints, "→", currentPoints + puntos);
      } else {
        // Obtener datos del usuario
        const userDoc = await getDoc(doc(db, 'usuarios', userId));
        
        if (!userDoc.exists()) {
          throw new Error(`Usuario ${userId} no encontrado en la base de datos`);
        }

        const userData = userDoc.data();
        
        // ✅ DATOS CON VALORES POR DEFECTO ROBUSTOS
        const userPointsData = {
          userId: userId,
          nombre: userData.nombre || 'Usuario',
          avatar: userData.avatar || '👤', // ✅ VALOR POR DEFECTO
          pais: userData.pais || 'HN',
          puntosTotales: puntos,
          fechaCreacion: new Date(),
          ultimaActualizacion: new Date()
        };

        console.log("📝 Creando nuevo registro en userPoints:", userPointsData);
        await setDoc(userPointsRef, userPointsData);
        console.log("✅ Nuevo registro creado para usuario:", userId);
      }
      
    } catch (error) {
      console.error("❌ Error crítico actualizando puntos:", error);
      throw error;
    }
  },

  // Obtener ranking
  async getRanking() {
    try {
      const q = query(collection(db, 'userPoints'), orderBy('puntosTotales', 'desc'));
      const snapshot = await getDocs(q);
      const ranking = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log("✅ Ranking obtenido:", ranking.length);
      return ranking;
    } catch (error) {
      console.error("❌ Error obteniendo ranking:", error);
      return [];
    }
  },

  // Obtener retos completados por usuario - CORREGIDA
  async getUserCompletedChallenges(userId) {
    try {
      // ✅ VERIFICAR que userId no sea undefined
      if (!userId) {
        console.log("⚠️ userId es undefined, retornando array vacío");
        return [];
      }
      
      console.log("🔍 Buscando retos completados para usuario:", userId);
      
      const q = query(
        collection(db, 'challengePhotos'),
        where('userId', '==', userId),
        where('approved', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const completed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log("✅ Retos completados obtenidos:", completed.length);
      return completed;
    } catch (error) {
      console.error("❌ Error obteniendo retos completados:", error);
      return [];
    }
  },

  // Completar reto de pregunta/tesoro - MODIFICADA PARA PUNTOS PERSONALIZADOS
  async completeChallenge(userId, challengeId, respuesta = null, puntosPersonalizados = null) {
    try {
      console.log("🎯 Completando reto:", { userId, challengeId, respuesta, puntosPersonalizados });

      // ✅ VERIFICAR que userId no sea undefined
      if (!userId) {
        throw new Error('ID de usuario es requerido');
      }

      // 🚨 CORRECCIÓN: Solo verificar en challengeCompletions
      const completadosQuery = query(
        collection(db, 'challengeCompletions'),
        where('userId', '==', userId),
        where('challengeId', '==', challengeId)
      );
      
      const existente = await getDocs(completadosQuery);
      
      // 🚨 CORRECCIÓN: Verificar si realmente existe
      if (!existente.empty) {
        console.log("⚠️ Reto ya completado en challengeCompletions:", existente.docs[0].data());
        throw new Error('Ya completaste este reto');
      }

      console.log("✅ Reto NO completado, procediendo...");

      // DETERMINAR PUNTOS - MODIFICADO PARA ACEPTAR PUNTOS PERSONALIZADOS
      let puntos = puntosPersonalizados;
      
      // Si no se especifican puntos personalizados, usar la lógica original
      if (puntos === null) {
        if (challengeId.startsWith('pregunta_')) {
          puntos = 5;
        } else if (challengeId.startsWith('tesoro_')) {
          puntos = 15;
        } else {
          puntos = 0; // Por defecto 0 si no se reconoce
        }
      }

      console.log("💰 Puntos a asignar:", puntos);

      // Registrar completado
      await addDoc(collection(db, 'challengeCompletions'), {
        userId,
        challengeId,
        completado: true,
        fechaCompletado: new Date(),
        puntosObtenidos: puntos,
        respuestaUsuario: respuesta,
        aprobado: true
      });

      // Actualizar puntos del usuario SOLO si ganó puntos
      if (puntos > 0) {
        await this.updateUserPoints(userId, puntos);
      }

      console.log("✅ Reto completado exitosamente, puntos asignados:", puntos);
      return puntos;
      
    } catch (error) {
      console.error("❌ Error completando reto:", error);
      throw error;
    }
  },

  // 🆕 Obtener retos de preguntas/tesoros completados por usuario
  async getCompletedQuestions(userId) {
    try {
      if (!userId) {
        console.log("⚠️ userId es undefined, retornando array vacío");
        return [];
      }
      
      console.log("🔍 Buscando preguntas/tesoros completados para usuario:", userId);
      
      const q = query(
        collection(db, 'challengeCompletions'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const completed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log("✅ Preguntas/tesoros completados obtenidos:", completed.length);
      return completed;
    } catch (error) {
      console.error("❌ Error obteniendo preguntas completadas:", error);
      return [];
    }
  },

  // =============================================
  // 🆕 GALERÍA DE FOTOS - FUNCIONES ESPECÍFICAS
  // =============================================

  async uploadGalleryPhoto(userId, titulo, descripcion, imageFile) {
    try {
      console.log("📤 Subiendo foto a galería...", { 
        userId, 
        titulo,
        descripcion: descripcion ? "Con descripción" : "Sin descripción"
      });
      
      // 1. Subir imagen a ImgBB (usando la misma función probada)
      const imageUrl = await this.uploadToImgBB(imageFile);
      
      // 2. Guardar datos en Firestore - colección específica para galería
      const fotoData = {
        userId,
        userName: await this.getUserName(userId),
        titulo: titulo.trim(),
        descripcion: descripcion?.trim() || "",
        imageUrl,
        fecha: new Date().toISOString(),
        estado: 'pendiente', // pendiente → aprobada → rechazada
        reacciones: {},
        comentarios: [],
        createdAt: new Date(),
        tipo: 'galeria' // Para diferenciar de fotos de challenges
      };
      
      const docRef = await addDoc(collection(db, 'fotos'), fotoData);
      console.log("✅ Foto subida a galería:", docRef.id);
      
      return {
        success: true,
        message: "✅ Foto subida para revisión del admin",
        fotoId: docRef.id,
        imageUrl
      };
      
    } catch (error) {
      console.error("❌ Error subiendo foto a galería:", error);
      throw new Error(`Error al subir foto: ${error.message}`);
    }
  },

  // 🆕 OBTENER FOTOS APROBADAS PARA GALERÍA
  async getApprovedGalleryPhotos() {
    try {
      console.log("🖼️ Obteniendo fotos aprobadas de la galería...");
      
      const q = query(
        collection(db, 'fotos'),
        where('estado', '==', 'aprobada'),
        where('tipo', '==', 'galeria'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fotos = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fotos.push({
          id: doc.id,
          ...data,
          // Mantener compatibilidad con estructura existente
          url: data.imageUrl,
          usuario: data.userName,
          reacciones: data.reacciones || {},
          comentarios: data.comentarios || []
        });
      });
      
      console.log("✅ Fotos de galería obtenidas:", fotos.length);
      return fotos;
    } catch (error) {
      console.error("❌ Error obteniendo fotos de galería:", error);
      return [];
    }
  },

  // 🆕 OBTENER FOTOS PENDIENTES DE GALERÍA (SOLO ADMIN)
  async getPendingGalleryPhotos() {
    try {
      console.log("⏳ Obteniendo fotos pendientes de galería...");
      
      const q = query(
        collection(db, 'fotos'),
        where('estado', '==', 'pendiente'),
        where('tipo', '==', 'galeria'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fotos = [];
      
      querySnapshot.forEach((doc) => {
        fotos.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log("✅ Fotos pendientes obtenidas:", fotos.length);
      return fotos;
    } catch (error) {
      console.error("❌ Error obteniendo fotos pendientes:", error);
      return [];
    }
  },

  // 🆕 APROBAR FOTO DE GALERÍA (ADMIN)
  async approveGalleryPhoto(fotoId) {
    try {
      console.log("✅ Aprobando foto de galería:", fotoId);
      
      await updateDoc(doc(db, 'fotos', fotoId), {
        estado: 'aprobada',
        fechaAprobacion: new Date().toISOString(),
        reviewedAt: new Date()
      });
      
      console.log("✅ Foto de galería aprobada:", fotoId);
      return { 
        success: true, 
        message: "✅ Foto aprobada y publicada en la galería" 
      };
      
    } catch (error) {
      console.error("❌ Error aprobando foto de galería:", error);
      throw new Error(`Error al aprobar foto: ${error.message}`);
    }
  },

  // 🆕 RECHAZAR FOTO DE GALERÍA (ADMIN)
  async rejectGalleryPhoto(fotoId, motivo = "No cumple con los requisitos de la galería") {
    try {
      console.log("❌ Rechazando foto de galería:", fotoId);
      
      await updateDoc(doc(db, 'fotos', fotoId), {
        estado: 'rechazada',
        motivoRechazo: motivo,
        fechaRechazo: new Date().toISOString(),
        reviewedAt: new Date()
      });
      
      console.log("✅ Foto de galería rechazada:", fotoId);
      return { 
        success: true, 
        message: "✅ Foto rechazada de la galería" 
      };
      
    } catch (error) {
      console.error("❌ Error rechazando foto de galería:", error);
      throw new Error(`Error al rechazar foto: ${error.message}`);
    }
  },

  // 🆕 AGREGAR REACCIÓN A FOTO DE GALERÍA
  async addGalleryReaction(fotoId, userId, reaccion) {
    try {
      console.log("❤️ Agregando reacción a foto:", { fotoId, userId, reaccion });
      
      const fotoRef = doc(db, 'fotos', fotoId);
      const fotoDoc = await getDoc(fotoRef);
      
      if (!fotoDoc.exists()) {
        throw new Error('Foto no encontrada en la galería');
      }
      
      const fotoData = fotoDoc.data();
      const nuevasReacciones = { ...fotoData.reacciones };
      nuevasReacciones[reaccion] = (nuevasReacciones[reaccion] || 0) + 1;
      
      await updateDoc(fotoRef, {
        reacciones: nuevasReacciones
      });
      
      console.log("✅ Reacción agregada:", nuevasReacciones);
      return nuevasReacciones;
      
    } catch (error) {
      console.error("❌ Error agregando reacción:", error);
      throw new Error(`Error al reaccionar: ${error.message}`);
    }
  },

  // 🆕 AGREGAR COMENTARIO A FOTO DE GALERÍA
  async addGalleryComment(fotoId, userId, comentarioTexto) {
    try {
      console.log("💬 Agregando comentario a foto:", { fotoId, userId });
      
      const fotoRef = doc(db, 'fotos', fotoId);
      const fotoDoc = await getDoc(fotoRef);
      
      if (!fotoDoc.exists()) {
        throw new Error('Foto no encontrada en la galería');
      }
      
      const fotoData = fotoDoc.data();
      const userName = await this.getUserName(userId);
      
      const nuevoComentario = {
        userId,
        userName: userName,
        texto: comentarioTexto,
        fecha: new Date().toISOString(),
        fechaFormateada: new Date().toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })
      };
      
      const comentariosActualizados = [...(fotoData.comentarios || []), nuevoComentario];
      
      await updateDoc(fotoRef, {
        comentarios: comentariosActualizados
      });
      
      console.log("✅ Comentario agregado. Total:", comentariosActualizados.length);
      return comentariosActualizados;
      
    } catch (error) {
      console.error("❌ Error agregando comentario:", error);
      throw new Error(`Error al comentar: ${error.message}`);
    }
  },

  // 🆕 ELIMINAR FOTO DE GALERÍA (ADMIN)
  async deleteGalleryPhoto(fotoId) {
    try {
      console.log("🗑️ Eliminando foto de galería:", fotoId);
      
      await deleteDoc(doc(db, 'fotos', fotoId));
      console.log("✅ Foto eliminada de galería:", fotoId);
      return { 
        success: true, 
        message: "✅ Foto eliminada de la galería" 
      };
      
    } catch (error) {
      console.error("❌ Error eliminando foto:", error);
      throw new Error(`Error al eliminar foto: ${error.message}`);
    }
  },

  // 🆕 FUNCIÓN AUXILIAR: OBTENER NOMBRE DE USUARIO
  async getUserName(userId) {
    try {
      if (!userId) return 'Usuario';
      
      const userDoc = await getDoc(doc(db, 'usuarios', userId));
      if (userDoc.exists()) {
        return userDoc.data().nombre || 'Usuario';
      }
      return 'Usuario';
    } catch (error) {
      console.error("❌ Error obteniendo nombre de usuario:", error);
      return 'Usuario';
    }
  },

  // 🆕 ESCUCHAR CAMBIOS EN TIEMPO REAL DE GALERÍA
  escucharGaleria(callback) {
    if (!db) {
      console.error("❌ DB no inicializado para escuchar galería");
      return () => {};
    }
    
    const q = query(
      collection(db, 'fotos'),
      where('estado', '==', 'aprobada'),
      where('tipo', '==', 'galeria'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const fotos = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fotos.push({
          id: doc.id,
          ...data,
          // Mantener compatibilidad
          url: data.imageUrl,
          usuario: data.userName
        });
      });
      callback(fotos);
    }, (error) => {
      console.error("Error en listener de galería:", error);
    });
  },
// =============================================
// 🆕 NAVIVIBES - MURO NAVIDEÑO INTERACTIVO
// =============================================

// 🎄 OBTENER TODOS LOS POSTS DE NAVIVIBES
async getNaviVibesPosts() {
  try {
    console.log("📝 Obteniendo posts de NaviVibes...");
    
    const q = query(
      collection(db, 'navivibes_posts'),
      orderBy('fecha', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({ 
        id: doc.id, 
        ...doc.data() 
      });
    });
    
    console.log("✅ Posts de NaviVibes obtenidos:", posts.length);
    return posts;
  } catch (error) {
    console.error("❌ Error obteniendo posts de NaviVibes:", error);
    return [];
  }
},

// 🎄 ESCUCHAR CAMBIOS EN TIEMPO REAL DE NAVIVIBES
escucharNaviVibesPosts(callback) {
  if (!db) {
    console.error("❌ DB no inicializado para escuchar NaviVibes");
    return () => {};
  }
  
  const q = query(
    collection(db, 'navivibes_posts'),
    orderBy('fecha', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const posts = [];
    snapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(posts);
  }, (error) => {
    console.error("Error en listener de NaviVibes:", error);
  });
},

// 🎄 CREAR POST DE TEXTO
async crearPostTexto(usuarioId, titulo, contenido, categoria) {
  try {
    console.log("📝 Creando post de texto en NaviVibes...", { 
      usuarioId, 
      titulo,
      categoria 
    });
    
    const postsRef = collection(db, 'navivibes_posts');
    const nuevoPost = {
      tipo: 'texto',
      usuarioId: usuarioId,
      usuario: await this.getUserName(usuarioId),
      titulo: titulo.trim(),
      contenido: contenido?.trim() || "",
      categoria: categoria || 'general',
      fecha: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      reacciones: {},
      comentarios: [],
      createdAt: new Date()
    };
    
    const docRef = await addDoc(postsRef, nuevoPost);
    console.log("✅ Post de texto creado:", docRef.id);
    
    return {
      success: true,
      message: "✅ Publicación creada exitosamente",
      postId: docRef.id
    };
    
  } catch (error) {
    console.error("❌ Error creando post de texto:", error);
    throw new Error(`Error al crear publicación: ${error.message}`);
  }
},

// 🎄 CREAR POST CON IMAGEN
async crearPostImagen(usuarioId, titulo, contenido, categoria, imagenFile) {
  try {
    console.log("🖼️ Creando post con imagen en NaviVibes...");
    
    // 1. Subir imagen a ImgBB (usando la misma función de galería)
    const imageUrl = await this.uploadToImgBB(imagenFile);
    
    // 2. Guardar en Firestore
    const postsRef = collection(db, 'navivibes_posts');
    const nuevoPost = {
      tipo: 'imagen',
      usuarioId: usuarioId,
      usuario: await this.getUserName(usuarioId),
      titulo: titulo.trim(),
      contenido: contenido?.trim() || "",
      categoria: categoria || 'general',
      imagenUrl: imageUrl,
      fecha: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      reacciones: {},
      comentarios: [],
      createdAt: new Date()
    };
    
    await addDoc(postsRef, nuevoPost);
    console.log("✅ Post con imagen creado");
    
    return {
      success: true,
      message: "✅ Publicación con imagen creada exitosamente"
    };
    
  } catch (error) {
    console.error("❌ Error creando post con imagen:", error);
    throw new Error(`Error al crear publicación con imagen: ${error.message}`);
  }
},

// 🎄 CREAR POST DE PELÍCULA
async crearPostPelicula(usuarioId, titulo, contenido, categoria, pelicula) {
  try {
    console.log("🎬 Creando post de película en NaviVibes...");
    
    const postsRef = collection(db, 'navivibes_posts');
    const nuevoPost = {
      tipo: 'pelicula',
      usuarioId: usuarioId,
      usuario: await this.getUserName(usuarioId),
      titulo: titulo.trim(),
      contenido: contenido?.trim() || "",
      categoria: categoria || 'peliculas',
      pelicula: pelicula?.trim() || "",
      fecha: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      reacciones: {},
      comentarios: [],
      createdAt: new Date()
    };
    
    await addDoc(postsRef, nuevoPost);
    console.log("✅ Post de película creado");
    
    return {
      success: true,
      message: "✅ Recomendación de película publicada"
    };
    
  } catch (error) {
    console.error("❌ Error creando post de película:", error);
    throw new Error(`Error al publicar recomendación: ${error.message}`);
  }
},

// 🎄 CREAR ENCUESTA (POLL)
async crearPostPoll(usuarioId, titulo, contenido, categoria, opciones) {
  try {
    console.log("📊 Creando encuesta en NaviVibes...");
    
    const postsRef = collection(db, 'navivibes_posts');
    const nuevoPost = {
      tipo: 'poll',
      usuarioId: usuarioId,
      usuario: await this.getUserName(usuarioId),
      titulo: titulo.trim(),
      contenido: contenido?.trim() || "",
      categoria: categoria || 'general',
      opciones: opciones.map(opcion => ({ 
        texto: opcion.trim(), 
        votos: 0 
      })),
      fecha: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      reacciones: {},
      comentarios: [],
      createdAt: new Date()
    };
    
    await addDoc(postsRef, nuevoPost);
    console.log("✅ Encuesta creada");
    
    return {
      success: true,
      message: "✅ Encuesta creada exitosamente"
    };
    
  } catch (error) {
    console.error("❌ Error creando encuesta:", error);
    throw new Error(`Error al crear encuesta: ${error.message}`);
  }
},

// 🎄 AGREGAR REACCIÓN A POST
async addNaviVibesReaction(postId, usuarioId, reaccion) {
  try {
    console.log("❤️ Agregando reacción a post:", { postId, usuarioId, reaccion });
    
    const postRef = doc(db, 'navivibes_posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post no encontrado');
    }
    
    const postData = postDoc.data();
    const nuevasReacciones = { ...postData.reacciones };
    nuevasReacciones[reaccion] = (nuevasReacciones[reaccion] || 0) + 1;
    
    await updateDoc(postRef, {
      reacciones: nuevasReacciones
    });
    
    console.log("✅ Reacción agregada:", nuevasReacciones);
    return nuevasReacciones;
    
  } catch (error) {
    console.error("❌ Error agregando reacción:", error);
    throw new Error(`Error al reaccionar: ${error.message}`);
  }
},

// 🎄 AGREGAR COMENTARIO A POST
async addNaviVibesComment(postId, usuarioId, comentarioTexto) {
  try {
    console.log("💬 Agregando comentario a post:", { postId, usuarioId });
    
    const postRef = doc(db, 'navivibes_posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post no encontrado');
    }
    
    const postData = postDoc.data();
    const userName = await this.getUserName(usuarioId);
    
    const nuevoComentario = {
      usuarioId: usuarioId,
      usuario: userName,
      texto: comentarioTexto.trim(),
      fecha: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })
    };
    
    const comentariosActualizados = [...(postData.comentarios || []), nuevoComentario];
    
    await updateDoc(postRef, {
      comentarios: comentariosActualizados
    });
    
    console.log("✅ Comentario agregado. Total:", comentariosActualizados.length);
    return comentariosActualizados;
    
  } catch (error) {
    console.error("❌ Error agregando comentario:", error);
    throw new Error(`Error al comentar: ${error.message}`);
  }
},

// 🎄 VOTAR EN ENCUESTA
async votarEnPoll(postId, usuarioId, opcionIndex) {
  try {
    console.log("🗳️ Votando en encuesta:", { postId, usuarioId, opcionIndex });
    
    const postRef = doc(db, 'navivibes_posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists() || postDoc.data().tipo !== 'poll') {
      throw new Error('Encuesta no encontrada');
    }
    
    const postData = postDoc.data();
    const opcionesActualizadas = [...postData.opciones];
    
    // Verificar que el índice sea válido
    if (opcionIndex < 0 || opcionIndex >= opcionesActualizadas.length) {
      throw new Error('Opción de encuesta no válida');
    }
    
    // Incrementar votos
    opcionesActualizadas[opcionIndex].votos += 1;
    
    await updateDoc(postRef, {
      opciones: opcionesActualizadas
    });
    
    console.log("✅ Voto registrado en opción:", opcionIndex);
    return opcionesActualizadas;
    
  } catch (error) {
    console.error("❌ Error votando en encuesta:", error);
    throw new Error(`Error al votar: ${error.message}`);
  }
},

// 🎄 ELIMINAR POST (ADMIN)
async eliminarPostNaviVibes(postId) {
  try {
    console.log("🗑️ Eliminando post de NaviVibes:", postId);
    
    await deleteDoc(doc(db, 'navivibes_posts', postId));
    console.log("✅ Post eliminado:", postId);
    
    return {
      success: true,
      message: "✅ Publicación eliminada exitosamente"
    };
    
  } catch (error) {
    console.error("❌ Error eliminando post:", error);
    throw new Error(`Error al eliminar publicación: ${error.message}`);
  }
},

// 🎄 OBTENER ESTADÍSTICAS DE NAVIVIBES
async obtenerEstadisticasNaviVibes() {
  try {
    console.log("📊 Obteniendo estadísticas de NaviVibes...");
    
    const [postsSnapshot, usuariosSnapshot] = await Promise.all([
      getDocs(collection(db, 'navivibes_posts')),
      getDocs(collection(db, 'usuarios'))
    ]);
    
    const totalPosts = postsSnapshot.size;
    const totalUsuarios = usuariosSnapshot.size;
    
    // Contar por tipo de post
    const tiposCount = {};
    postsSnapshot.forEach(doc => {
      const data = doc.data();
      const tipo = data.tipo || 'texto';
      tiposCount[tipo] = (tiposCount[tipo] || 0) + 1;
    });
    
    // Contar por categoría
    const categoriasCount = {};
    postsSnapshot.forEach(doc => {
      const data = doc.data();
      const categoria = data.categoria || 'general';
      categoriasCount[categoria] = (categoriasCount[categoria] || 0) + 1;
    });
    
    const estadisticas = {
      totalPosts,
      totalUsuarios,
      porTipo: tiposCount,
      porCategoria: categoriasCount,
      postsPorUsuario: totalUsuarios > 0 ? (totalPosts / totalUsuarios).toFixed(1) : 0
    };
    
    console.log("✅ Estadísticas de NaviVibes:", estadisticas);
    return estadisticas;
    
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    return {
      totalPosts: 0,
      totalUsuarios: 0,
      porTipo: {},
      porCategoria: {},
      postsPorUsuario: 0
    };
  }
},

  // =============================================
  // 🎮 SISTEMA DE JUEGOS - FUNCIONES CORREGIDAS
  // =============================================

  // ✅ FUNCIÓN CORREGIDA: GUARDAR PUNTUACIÓN CON ESTRUCTURA PLANA
  async guardarPuntuacionJuego(usuarioId, juegoId, puntuacion, datosSession = {}) {
    try {
      console.log("🎯 Guardando puntuación de juego:", {
        usuarioId,
        juegoId,
        puntuacion,
        datosSession
      });

      // ✅ VERIFICACIONES CRÍTICAS
      if (!usuarioId) {
        throw new Error('ID de usuario es requerido');
      }

      if (!juegoId) {
        throw new Error('ID de juego es requerido');
      }

      // 1. OBTENER DATOS DEL USUARIO
      const userDoc = await getDoc(doc(db, 'usuarios', usuarioId));
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userDoc.data();
      const userName = userData.nombre || 'Usuario';
      const userAvatar = userData.avatar || '👤';

      // 2. CREAR ID ÚNICO PARA EL REGISTRO
      const docId = `${juegoId}_${usuarioId}`;
      
      // 3. BUSCAR REGISTRO EXISTENTE
      const docExistente = await getDoc(doc(db, 'juegosRankings', docId));
      const ahora = new Date();
      
      let datosRanking = {
        usuarioId: usuarioId,
        juegoId: juegoId,
        nombre: userName,
        avatar: userAvatar,
        mejorPuntuacion: puntuacion,
        ultimaPuntuacion: puntuacion,
        fechaUltimoIntento: ahora,
        totalIntentos: 1,
        rachaMaxima: datosSession.mejorRacha || 0,
        ultimaActualizacion: ahora
      };

      // 4. ACTUALIZAR O CREAR REGISTRO
      if (docExistente.exists()) {
        const dataActual = docExistente.data();
        const mejorActual = dataActual.mejorPuntuacion || 0;
        
        datosRanking.mejorPuntuacion = Math.max(mejorActual, puntuacion);
        datosRanking.totalIntentos = (dataActual.totalIntentos || 0) + 1;
        datosRanking.rachaMaxima = Math.max(dataActual.rachaMaxima || 0, datosSession.mejorRacha || 0);
        
        console.log("✅ Actualizando puntuación existente:", docId);
      } else {
        console.log("✅ Creando nueva puntuación:", docId);
      }

      await setDoc(doc(db, 'juegosRankings', docId), datosRanking);

      // 5. GUARDAR SESIÓN DE JUEGO
      const sessionData = {
        usuarioId: usuarioId,
        juegoId: juegoId,
        puntuacionFinal: puntuacion,
        rachaMaxima: datosSession.mejorRacha || 0,
        preguntasRespondidas: datosSession.preguntasRespondidas || 0,
        fechaSession: ahora,
        duracion: datosSession.duracion || 0,
        detalles: datosSession.detalles || {}
      };

      await addDoc(collection(db, 'juegosSessions'), sessionData);

      console.log("✅ Puntuación guardada exitosamente para juego:", juegoId);
      return { 
        success: true, 
        mejorPuntuacion: datosRanking.mejorPuntuacion,
        esNuevoRecord: !docExistente.exists() || puntuacion > dataActual.mejorPuntuacion
      };

    } catch (error) {
      console.error("❌ Error guardando puntuación de juego:", error);
      throw error;
    }
  },

  // ✅ FUNCIÓN CORREGIDA: OBTENER RANKING CON CONSULTA SIMPLE
  async obtenerRankingJuego(juegoId, limite = 10) {
    try {
      console.log("🏆 Obteniendo ranking para juego:", juegoId);
      
      const q = query(
        collection(db, 'juegosRankings'),
        where('juegoId', '==', juegoId),
        orderBy('mejorPuntuacion', 'desc'),
        limit(limite)
      );
      
      const querySnapshot = await getDocs(q);
      const ranking = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("✅ Ranking obtenido:", ranking.length, "jugadores");
      return ranking;
    } catch (error) {
      console.error("❌ Error obteniendo ranking de juego:", error);
      return [];
    }
  },

  // ✅ FUNCIÓN CORREGIDA: OBTENER MEJOR PUNTUACIÓN PERSONAL
  async obtenerMejorPuntuacionPersonal(usuarioId, juegoId) {
    try {
      console.log("🔍 Obteniendo mejor puntuación personal:", { usuarioId, juegoId });
      
      if (!usuarioId || !juegoId) {
        return 0;
      }
      
      const docId = `${juegoId}_${usuarioId}`;
      const docSnap = await getDoc(doc(db, 'juegosRankings', docId));
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("✅ Mejor puntuación encontrada:", data.mejorPuntuacion);
        return data.mejorPuntuacion || 0;
      }
      
      console.log("ℹ️ No se encontró puntuación para este juego");
      return 0;
    } catch (error) {
      console.error("❌ Error obteniendo mejor puntuación:", error);
      return 0;
    }
  },

  // ✅ FUNCIÓN CORREGIDA: OBTENER ESTADÍSTICAS
  async obtenerEstadisticasJuego(usuarioId, juegoId) {
    try {
      console.log("📊 Obteniendo estadísticas de juego:", { usuarioId, juegoId });
      
      if (!usuarioId || !juegoId) {
        return null;
      }
      
      // Obtener datos del ranking
      const docId = `${juegoId}_${usuarioId}`;
      const rankingSnap = await getDoc(doc(db, 'juegosRankings', docId));
      
      if (!rankingSnap.exists()) {
        return null;
      }
      
      const rankingData = rankingSnap.data();
      
      // Obtener sesiones recientes
      const q = query(
        collection(db, 'juegosSessions'),
        where('usuarioId', '==', usuarioId),
        where('juegoId', '==', juegoId),
        orderBy('fechaSession', 'desc'),
        limit(5)
      );
      
      const sessionsSnapshot = await getDocs(q);
      const sesionesRecientes = [];
      
      sessionsSnapshot.forEach((doc) => {
        sesionesRecientes.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      const estadisticas = {
        ...rankingData,
        sesionesRecientes: sesionesRecientes,
        promedioPuntuacion: this.calcularPromedio(sesionesRecientes),
        mejoraReciente: this.calcularMejora(sesionesRecientes)
      };
      
      console.log("✅ Estadísticas obtenidas:", estadisticas);
      return estadisticas;
      
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas:", error);
      return null;
    }
  },

  // FUNCIONES AUXILIARES PARA ESTADÍSTICAS
  calcularPromedio(sesiones) {
    if (sesiones.length === 0) return 0;
    const total = sesiones.reduce((sum, session) => sum + (session.puntuacionFinal || 0), 0);
    return Math.round(total / sesiones.length);
  },

  calcularMejora(sesiones) {
    if (sesiones.length < 2) return 0;
    const ultima = sesiones[0].puntuacionFinal || 0;
    const anterior = sesiones[1].puntuacionFinal || 0;
    return ultima - anterior;
  },

  // ✅ FUNCIÓN CORREGIDA: ESCUCHAR RANKING EN TIEMPO REAL
  escucharRankingJuego(juegoId, callback) {
    if (!db) {
      console.error("❌ DB no inicializado para escuchar ranking");
      return () => {};
    }
    
    const q = query(
      collection(db, 'juegosRankings'),
      where('juegoId', '==', juegoId),
      orderBy('mejorPuntuacion', 'desc'),
      limit(10)
    );
    
    return onSnapshot(q, (snapshot) => {
      const ranking = [];
      snapshot.forEach((doc) => {
        ranking.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(ranking);
    }, (error) => {
      console.error("Error en listener de ranking:", error);
    });
  },
// =============================================
// 🏆 SISTEMA DE CONCURSOS EN TIEMPO REAL - CON PREGUNTAS
// =============================================

async crearConcursoRapido(concursoId, nombre = "Concurso Navideño") {
  try {
    await setDoc(doc(db, 'concursos', concursoId), {
      nombre: nombre,
      estado: 'esperando',
      participantes: {},
      timestampCreacion: new Date(),
      tipo: 'rapido',
      preguntaActual: '', // NUEVO: Para almacenar la pregunta
      rondaActiva: false, // NUEVO: Control de ronda
      timestampInicioRonda: null // NUEVO: Para calcular tiempos
    });
    console.log('✅ Concurso rápido creado:', concursoId);
    return true;
  } catch (error) {
    console.error('❌ Error creando concurso:', error);
    throw error;
  }
},

// 🆕 INICIAR CONCURSO CON PREGUNTA
async iniciarConcursoConPregunta(concursoId, pregunta = '') {
  try {
    await updateDoc(doc(db, 'concursos', concursoId), {
      estado: 'contando', // NUEVO ESTADO: contando -> activo
      preguntaActual: pregunta,
      participantes: {}, // LIMPIAR participantes anteriores
      timestampInicioRonda: new Date(), // NUEVO: Marcar inicio de ronda
      rondaActiva: true,
      timestampInicio: new Date(),
      timestampFin: null,
      ganador: null
    });
    console.log('✅ Concurso con pregunta iniciado:', concursoId, pregunta);
    return true;
  } catch (error) {
    console.error('❌ Error iniciando concurso con pregunta:', error);
    throw error;
  }
},

// 🆕 ACTIVAR CONCURSO (después de cuenta regresiva)
async activarConcurso(concursoId) {
  try {
    await updateDoc(doc(db, 'concursos', concursoId), {
      estado: 'activo',
      timestampInicioRonda: new Date() // Reiniciar timestamp para nueva ronda
    });
    console.log('✅ Concurso activado para respuestas:', concursoId);
    return true;
  } catch (error) {
    console.error('❌ Error activando concurso:', error);
    throw error;
  }
},

async participarEnConcurso(concursoId, usuario, tiempoReaccion) {
  try {
    // VERIFICAR que el concurso esté activo
    const concursoDoc = await getDoc(doc(db, 'concursos', concursoId));
    if (!concursoDoc.exists() || concursoDoc.data().estado !== 'activo') {
      throw new Error('El concurso no está activo');
    }

    const participanteData = {
      usuarioId: usuario.id,
      nombre: usuario.nombre,
      avatar: usuario.avatar || '👤',
      timestamp: new Date(),
      tiempoReaccion: tiempoReaccion,
      preguntaActual: concursoDoc.data().preguntaActual // NUEVO: Guardar pregunta
    };

    await updateDoc(doc(db, 'concursos', concursoId), {
      [`participantes.${usuario.id}`]: participanteData
    });

    console.log('✅ Participación registrada:', usuario.nombre, tiempoReaccion + 'ms');
    return true;
  } catch (error) {
    console.error('❌ Error registrando participación:', error);
    throw error;
  }
},

// 🆕 REINICIAR SOLO LA RONDA ACTUAL
async reiniciarRonda(concursoId) {
  try {
    await updateDoc(doc(db, 'concursos', concursoId), {
      estado: 'esperando',
      participantes: {},
      preguntaActual: '', // Limpiar pregunta
      rondaActiva: false,
      timestampInicioRonda: null
    });
    console.log('✅ Ronda reiniciada:', concursoId);
    return true;
  } catch (error) {
    console.error('❌ Error reiniciando ronda:', error);
    throw error;
  }
},

async reiniciarConcurso(concursoId) {
  try {
    await updateDoc(doc(db, 'concursos', concursoId), {
      estado: 'esperando',
      participantes: {},
      preguntaActual: '', // NUEVO: Limpiar pregunta también
      rondaActiva: false, // NUEVO: Desactivar ronda
      timestampInicio: null,
      timestampFin: null,
      ganador: null
    });
    console.log('✅ Concurso completamente reiniciado:', concursoId);
    return true;
  } catch (error) {
    console.error('❌ Error reiniciando concurso:', error);
    throw error;
  }
},

// 🆕 FINALIZAR RONDA AUTOMÁTICAMENTE
async finalizarRonda(concursoId) {
  try {
    const concursoDoc = await getDoc(doc(db, 'concursos', concursoId));
    const concursoData = concursoDoc.data();
    
    // Encontrar ganador
    const participantes = Object.values(concursoData.participantes || {});
    const ganador = participantes.sort((a, b) => a.tiempoReaccion - b.tiempoReaccion)[0];
    
    await updateDoc(doc(db, 'concursos', concursoId), {
      estado: 'mostrando_resultados',
      ganador: ganador || null,
      timestampFin: new Date()
    });
    
    console.log('✅ Ronda finalizada. Ganador:', ganador?.nombre);
    return true;
  } catch (error) {
    console.error('❌ Error finalizando ronda:', error);
    throw error;
  }
},

escucharConcurso(concursoId, callback) {
  return onSnapshot(doc(db, 'concursos', concursoId), (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      
      // Lógica automática: Si hay participantes y está activo, programar finalización
      if (data.estado === 'activo' && Object.keys(data.participantes || {}).length > 0) {
        // Programar finalización automática en 15 segundos
        setTimeout(async () => {
          try {
            await this.finalizarRonda(concursoId);
            
            // Programar reinicio automático después de mostrar resultados
            setTimeout(async () => {
              await this.reiniciarRonda(concursoId);
            }, 5000); // 5 segundos para mostrar resultados
            
          } catch (error) {
            console.error('Error en finalización automática:', error);
          }
        }, 15000); // 15 segundos para responder
      }
      
      callback({ id: doc.id, ...data });
    } else {
      // Si no existe, crearlo automáticamente
      this.crearConcursoRapido(concursoId);
      callback(null);
    }
  }, (error) => {
    console.error('❌ Error escuchando concurso:', error);
  });
},

// 🆕 OBTENER HISTORIAL DE PREGUNTAS
async obtenerHistorialPreguntas(concursoId, limite = 10) {
  try {
    // Podrías crear una subcolección para el historial si lo necesitas
    const concursoDoc = await getDoc(doc(db, 'concursos', concursoId));
    if (concursoDoc.exists()) {
      return concursoDoc.data().preguntaActual ? [concursoDoc.data().preguntaActual] : [];
    }
    return [];
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    return [];
  }
},
 
   async reiniciarTodosLosPuntajes() {
    try {
      console.log('🗑️ Iniciando reinicio de todos los puntajes...');
      
      // 1. Eliminar todos los documentos de juegosRankings
      const rankingsSnapshot = await getDocs(collection(db, 'juegosRankings'));
      const deleteRankingsPromises = rankingsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      // 2. Eliminar todos los documentos de juegosSessions
      const sessionsSnapshot = await getDocs(collection(db, 'juegosSessions'));
      const deleteSessionsPromises = sessionsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      // Ejecutar todas las eliminaciones
      await Promise.all([...deleteRankingsPromises, ...deleteSessionsPromises]);
      
      console.log('✅ Todos los puntajes reiniciados:', {
        rankings: rankingsSnapshot.size,
        sessions: sessionsSnapshot.size
      });
      
      return {
        success: true,
        message: `✅ Reiniciados ${rankingsSnapshot.size} rankings y ${sessionsSnapshot.size} sesiones`,
        detalles: {
          rankingsEliminados: rankingsSnapshot.size,
          sesionesEliminadas: sessionsSnapshot.size
        }
      };
    } catch (error) {
      console.error('❌ Error reiniciando puntajes:', error);
      throw error;
    }
  },

  // OBTENER ESTADÍSTICAS DE CONCURSO
  async obtenerEstadisticasConcurso(concursoId = 'navidad_rapido') {
    try {
      const concursoDoc = await getDoc(doc(db, 'concursos', concursoId));
      
      if (!concursoDoc.exists()) {
        return {
          estado: 'no_existe',
          participantes: 0,
          ganador: null
        };
      }
      
      const concursoData = concursoDoc.data();
      const participantes = Object.values(concursoData.participantes || {});
      
      return {
        estado: concursoData.estado || 'esperando',
        participantes: participantes.length,
        ganador: participantes.sort((a, b) => a.tiempoReaccion - b.tiempoReaccion)[0] || null,
        timestampInicio: concursoData.timestampInicio,
        timestampFin: concursoData.timestampFin
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de concurso:', error);
      throw error;
    }
  },
// INICIAR CONCURSO (sin pregunta específica)
async iniciarConcurso(concursoId = 'navidad_rapido') {
  try {
    const concursoRef = doc(db, 'concursos', concursoId);
    
    await updateDoc(concursoRef, {
      estado: 'contando',
      timestampInicio: serverTimestamp(),
      participantes: {}, // Reiniciar participantes
      preguntaActual: '' // Limpiar pregunta anterior
    });
    
    console.log('✅ Concurso iniciado en estado contando');
  } catch (error) {
    console.error('❌ Error iniciando concurso:', error);
    throw error;
  }
},
// CONCURSO RÁPIDO - VERSIÓN SIMPLE Y FUNCIONAL
async iniciarConcursoSimple(concursoId = 'navidad_rapido') {
  try {
    const concursoRef = doc(db, 'concursos', concursoId);
    
    // 1. Primero poner en "contando" 
    await updateDoc(concursoRef, {
      estado: 'contando',
      participantes: {},
      preguntaActual: '', // Limpiar pregunta anterior
      timestampInicio: serverTimestamp(),
      rondaActiva: true
    });
    
    console.log('✅ Concurso en modo contando - countdown empezó');
    
    // 2. Después de 5 segundos, poner en "activo" automáticamente
    setTimeout(async () => {
      try {
        await updateDoc(concursoRef, {
          estado: 'activo',
          timestampInicioRonda: new Date()
        });
        console.log('✅ Concurso activado - listo para participar');
      } catch (error) {
        console.error('❌ Error activando concurso:', error);
      }
    }, 5000);
    
  } catch (error) {
    console.error('❌ Error iniciando concurso:', error);
    throw error;
  }
},

  // OBTENER ESTADÍSTICAS DE JUEGOS
  async obtenerEstadisticasJuegos() {
    try {
      const [rankingsSnapshot, sessionsSnapshot] = await Promise.all([
        getDocs(collection(db, 'juegosRankings')),
        getDocs(collection(db, 'juegosSessions'))
      ]);
      
      const totalRankings = rankingsSnapshot.size;
      const totalSessions = sessionsSnapshot.size;
      
      // Contar por juego
      const juegosCount = {};
      rankingsSnapshot.forEach(doc => {
        const data = doc.data();
        const juegoId = data.juegoId;
        juegosCount[juegoId] = (juegosCount[juegoId] || 0) + 1;
      });
      
      return {
        totalRankings,
        totalSessions,
        porJuego: juegosCount,
        juegosUnicos: Object.keys(juegosCount).length
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de juegos:', error);
      throw error;
    }
  },

  // 🆕 OBTENER USUARIO POR ID
  async obtenerUsuario(userId) {
    try {
      const docRef = doc(db, 'usuarios', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log("❌ Usuario no encontrado en Firestore:", userId);
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      return null;
    }
  },

  // 🆕 ACTUALIZAR USUARIO
  async actualizarUsuario(userId, nuevosDatos) {
    try {
      const docRef = doc(db, 'usuarios', userId);
      await updateDoc(docRef, nuevosDatos);
      console.log("✅ Usuario actualizado en Firestore:", userId, nuevosDatos);
      return true;
    } catch (error) {
      console.error("❌ Error actualizando usuario:", error);
      return false;
    }
  }
};
