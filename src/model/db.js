import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBkhh1IxjVskHVvGaOZeSfRCfgBs2QZIIc",
  authDomain: "edukid-s.firebaseapp.com",
  projectId: "edukid-s",
  storageBucket: "edukid-s.appspot.com",
  messagingSenderId: "797959761292",
  appId: "1:797959761292:web:cdacbb8bac6e973714faa9",
  measurementId: "G-75LTM2R1JZ"
};

// ✅ Solo inicializa si no existe
const appFirebase = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export default appFirebase;
