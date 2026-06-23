import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBF8Y-hTTk2HVwXynlPtk12s_s5b0glcsY',
  authDomain: 'sonett-app-2026-b79e5.firebaseapp.com',
  projectId: 'sonett-app-2026-b79e5',
  storageBucket: 'sonett-app-2026-b79e5.firebasestorage.app',
  messagingSenderId: '584343413565',
  appId: '1:584343413565:web:cb4ddbafd7c24a4f001b54',
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
