import { getDoc, setDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './index';
import { InvitationData } from '../types';

export const saveInvitation = async (slug: string, data: InvitationData) => {
  let uid: string | undefined;
  try { const { getCurrentUser } = await import('./auth'); uid = getCurrentUser()?.uid; } catch { /* auth not loaded */ }
  await setDoc(doc(db, 'invitations', slug), {
    ...data,
    ...(uid ? { ownerUid: uid } : {}),
    updatedAt: serverTimestamp(),
  });
};

export const loadInvitation = async (slug: string): Promise<InvitationData | null> => {
  const snap = await getDoc(doc(db, 'invitations', slug));
  return snap.exists() ? (snap.data() as InvitationData) : null;
};

export const checkSlugAvailable = async (slug: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, 'invitations', slug));
  return !snap.exists();
};

export const deleteInvitation = async (slug: string): Promise<void> => {
  await deleteDoc(doc(db, 'invitations', slug));
};
