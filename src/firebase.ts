import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, getDoc, setDoc, doc, query, orderBy } from 'firebase/firestore';
import { InvitationData } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyCBePNVNVFELc5YGEX8iuwRbSygr08efr8",
  authDomain: "sonett-23064.firebaseapp.com",
  projectId: "sonett-23064",
  storageBucket: "sonett-23064.firebasestorage.app",
  messagingSenderId: "425141601057",
  appId: "1:425141601057:web:fe9329aa77cb96e6b83460"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const saveInvitation = async (slug: string, data: InvitationData) => {
  await setDoc(doc(db, 'invitations', slug), { ...data, updatedAt: new Date().toISOString() });
};

export const loadInvitation = async (slug: string): Promise<InvitationData | null> => {
  const snap = await getDoc(doc(db, 'invitations', slug));
  return snap.exists() ? (snap.data() as InvitationData) : null;
};

export const checkSlugAvailable = async (slug: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, 'invitations', slug));
  return !snap.exists();
};

export { db, collection, addDoc, getDocs, query, orderBy, doc };
