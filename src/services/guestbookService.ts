import { collection, addDoc, getDocs, getDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './index';
import { GuestMessage } from '../types';

export const submitGuestMessage = async (slug: string, data: { name: string; content: string; password: string; side: 'groom' | 'bride' }) => {
  const ref = collection(db, `invitations/${slug}/guestbook`);
  await addDoc(ref, { ...data, createdAt: serverTimestamp() });
};

export const fetchGuestMessages = async (slug: string): Promise<GuestMessage[]> => {
  const q = query(collection(db, `invitations/${slug}/guestbook`), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => {
    const { password: _, ...rest } = d.data();
    return { id: d.id, ...rest } as GuestMessage;
  });
};

export const deleteGuestMessage = async (slug: string, messageId: string, inputPassword: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, `invitations/${slug}/guestbook`, messageId));
  if (!snap.exists()) return false;
  const stored = snap.data().password as string;
  if (stored !== inputPassword) return false;
  await deleteDoc(doc(db, `invitations/${slug}/guestbook`, messageId));
  return true;
};
