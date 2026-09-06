import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBKvBV_DUOtbkBd6LHWgXBJ24oCwfmsopU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mystiq-b1a8c.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://mystiq-b1a8c-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mystiq-b1a8c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mystiq-b1a8c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "664320867996",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:664320867996:web:328009badd11aa0dbef759",
  measurementId: "G-K2NQ6MZR5P"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

export default app;
  
