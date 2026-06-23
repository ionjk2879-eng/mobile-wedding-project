import { getDoc, setDoc, deleteDoc, doc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './index';
import { InvitationData } from '../types';
import { getCurrentUser } from './auth';

export const saveInvitation = async (slug: string, data: InvitationData) => {
  const uid = getCurrentUser()?.uid;
  if (!uid) throw new Error('로그인이 필요합니다.');
  await setDoc(doc(db, 'invitations', slug), {
    ...data,
    ownerUid: uid,
    updatedAt: serverTimestamp(),
  });
};

export const loadInvitation = async (slug: string): Promise<InvitationData | null> => {
  const snap = await getDoc(doc(db, 'invitations', slug));
  return snap.exists() ? (snap.data() as InvitationData) : null;
};

export const checkSlugAvailable = async (slug: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, 'invitations', slug));
  if (!snap.exists()) return true;
  const ownerUid = snap.data()?.ownerUid;
  const uid = getCurrentUser()?.uid;
  return ownerUid === uid;
};

export const fetchMyInvitations = async (): Promise<{ slug: string; data: InvitationData }[]> => {
  const uid = getCurrentUser()?.uid;
  if (!uid) return [];
  const q = query(collection(db, 'invitations'), where('ownerUid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ slug: d.id, data: d.data() as InvitationData }));
};

export const deleteInvitation = async (slug: string): Promise<void> => {
  await deleteDoc(doc(db, 'invitations', slug));
};
