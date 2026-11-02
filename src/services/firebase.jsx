// src/firebase.jsx
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase - DIRECTAMENTE en el código (seguro para Firebase)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyALru5iCwREf8eux1t0BrsJWADRSrIy5VI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "goba-navidad-2025.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "goba-navidad-2025",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "goba-navidad-2025.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "778535579035",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:778535579035:web:235e5d86e2a698bf2e453e"
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