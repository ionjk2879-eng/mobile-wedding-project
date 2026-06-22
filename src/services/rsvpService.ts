import { collection, getDocs, setDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './index';
import { RSVPResponse } from '../types';

export const submitRSVP = async (slug: string, formData: Omit<RSVPResponse, 'id' | 'createdAt'>) => {
  const docId = formData.guestName.trim().replace(/\s+/g, '_');
  const ref = doc(db, `invitations/${slug}/rsvp`, docId);
  await setDoc(ref, { ...formData, createdAt: serverTimestamp() }, { merge: true });
};

export const fetchRSVPResponses = async (slug: string): Promise<RSVPResponse[]> => {
  const q = query(collection(db, `invitations/${slug}/rsvp`), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RSVPResponse));
};
