import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBF8Y-hTTk2HVwXynlPtk12s_s5b0glcsY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sonett-app-2026-b79e5.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sonett-app-2026-b79e5',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sonett-app-2026-b79e5.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FB_SENDER_ID || '584343413565',
  appId: import.meta.env.VITE_FB_APP_ID || '1:584343413565:web:cb4ddbafd7c24a4f001b54',
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
