// src/ui/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBl0GGJM0mZK_MtQNCS0GpkhvtpuDPIfMA",
  authDomain: "bj-alert.firebaseapp.com",
  projectId: "bj-alert",
  storageBucket: "bj-alert.firebasestorage.app",
  messagingSenderId: "149339289115",
  appId: "1:149339289115:web:c04ee30fb04ba45ca62abe",
  measurementId: "G-Q46L8KYW5E",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
