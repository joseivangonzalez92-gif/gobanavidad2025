// src/firebase.jsx
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase - DIRECTAMENTE en el código (seguro para Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyALru5iCwREf8eux1t0BrsJWADRSrIy5VI",
  authDomain: "goba-navidad-2025.firebaseapp.com",
  projectId: "goba-navidad-2025",
  storageBucket: "goba-navidad-2025.firebasestorage.app",
  messagingSenderId: "778535579035",
  appId: "1:778535579035:web:235e5d86e2a698bf2e453e"
};

console.log("🚀 INICIANDO CONFIGURACIÓN FIREBASE...");

// Verificar configuración
if (!firebaseConfig.apiKey) {
  console.error("❌ FALTA apiKey en Firebase config");
}
if (!firebaseConfig.projectId) {
  console.error("❌ FALTA projectId en Firebase config");
}

// Declarar variables
let app;
let db;
let auth;

try {
  // Inicializar Firebase
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase app inicializada:", app.name);
  
  // Inicializar Firestore
  db = getFirestore(app);
  console.log("✅ Firestore inicializado:", db ? "SÍ" : "NO");
  
  // Inicializar Auth
  auth = getAuth(app);
  console.log("✅ Auth inicializado:", auth ? "SÍ" : "NO");
  
  console.log("🎉 FIREBASE CONFIGURADO EXITOSAMENTE");
  
} catch (error) {
  console.error("💥 ERROR CRÍTICO INICIALIZANDO FIREBASE:", error);
  throw error;
}

// Exportar servicios
export { db, auth };