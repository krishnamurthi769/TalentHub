// client/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔑 Always resolve from Vite env (client-side only)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "default_key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "default.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "default-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "default.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "default-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
