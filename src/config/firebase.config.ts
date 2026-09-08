import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBKvBV_DUOtbkBd6LHWgXBJ24oCwfmsopU",
  authDomain: "mystiq-b1a8c.firebaseapp.com",
  databaseURL: "https://mystiq-b1a8c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mystiq-b1a8c",
  storageBucket: "mystiq-b1a8c.firebasestorage.app",
  messagingSenderId: "664320867996",
  appId: "1:664320867996:web:328009badd11aa0dbef759",
  measurementId: "G-K2NQ6MZR5P"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
export default app;
