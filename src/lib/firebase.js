// src/lib/firebase.js

import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCbT7uxIhdXFKzR32IJTCC8A5YF8C_okIQ",
  authDomain: "photoapi-57629.firebaseapp.com",
  projectId: "photoapi-57629",
  storageBucket: "photoapi-57629.firebasestorage.app",
  messagingSenderId: "510166413875",
  appId: "1:510166413875:web:c86b9eef3fd767a3fc6946",
  measurementId: "G-QWGCKCBZPY"
};

const app = initializeApp(firebaseConfig);

// initialize Firebase Auth
export const auth = getAuth(app);

// optional analytics
export const analytics = getAnalytics(app);