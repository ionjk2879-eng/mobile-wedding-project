import { collection, addDoc, getDocs, setDoc, doc, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db } from './index';
import { RSVPResponse } from '../types';

export const submitRSVP = async (slug: string, formData: Omit<RSVPResponse, 'id' | 'createdAt'>) => {
  const rsvpRef = collection(db, `invitations/${slug}/rsvp`);
  const existing = await getDocs(query(rsvpRef, where('guestName', '==', formData.guestName)));
  if (!existing.empty) {
    const existingDoc = existing.docs[0];
    await setDoc(doc(db, `invitations/${slug}/rsvp`, existingDoc.id), {
      ...formData,
      createdAt: existingDoc.data().createdAt,
      updatedAt: serverTimestamp(),
    });
    return 'updated';
  }
  await addDoc(rsvpRef, { ...formData, createdAt: serverTimestamp() });
  return 'created';
};

export const fetchRSVPResponses = async (slug: string): Promise<RSVPResponse[]> => {
  const q = query(collection(db, `invitations/${slug}/rsvp`), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RSVPResponse));
};
