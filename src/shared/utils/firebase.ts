// ⚠️ CONFIGURACIÓN DE FIREBASE PARA EL FRONTEND (REACT)
// Los programadores usarán este archivo para acceder a Firestore desde la web.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // Descomentar si se usará autenticación

// 👉 REEMPLAZAR ESTOS VALORES CON LA CONFIGURACIÓN DEL CLIENTE (Desde Firebase Console)
// Esto es público y es seguro ponerlo en variables de entorno VITE_*
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyXXXXXXXXXXXXXXX",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "asistencias-9b073.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "asistencias-9b073",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "asistencias-9b073.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
// export const auth = getAuth(app);
