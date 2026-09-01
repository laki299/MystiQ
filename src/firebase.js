import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBKvBV_DUOtbkBd6LHWgXBJ24oCwfmsopU",
  authDomain: "mystiq-b1a8c.firebaseapp.com",
  projectId: "mystiq-b1a8c",
  storageBucket: "mystiq-b1a8c.firebasestorage.app",
  messagingSenderId: "664320867996",
  appId: "1:664320867996:web:328009badd11aa0dbef759",
  measurementId: "G-K2NQ6MZR5P"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
