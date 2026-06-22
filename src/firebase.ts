import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, getDoc, setDoc, doc, query, orderBy, where, deleteDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { InvitationData, RSVPResponse } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const resizeImage = (file: File, maxSize: number): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxSize && height <= maxSize) {
        resolve(file);
        return;
      }
      if (width > height) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });
};

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const resized = await resizeImage(file, 1200);
  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, resized);
  return getDownloadURL(fileRef);
};

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};

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

export const submitRSVP = async (slug: string, formData: Omit<RSVPResponse, 'id' | 'createdAt'>) => {
  const rsvpRef = collection(db, `invitations/${slug}/rsvp`);
  const existing = await getDocs(query(rsvpRef, where('guestName', '==', formData.guestName)));
  if (!existing.empty) {
    const existingDoc = existing.docs[0];
    await setDoc(doc(db, `invitations/${slug}/rsvp`, existingDoc.id), {
      ...formData,
      createdAt: existingDoc.data().createdAt,
      updatedAt: new Date().toISOString(),
    });
    return 'updated';
  }
  await addDoc(rsvpRef, { ...formData, createdAt: new Date().toISOString() });
  return 'created';
};

export { db, collection, addDoc, getDocs, query, orderBy, doc, where, deleteDoc };