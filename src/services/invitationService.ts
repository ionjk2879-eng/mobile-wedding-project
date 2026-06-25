import { getDoc, setDoc, deleteDoc, doc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './index';
import { InvitationData } from '../types';
import { getCurrentUser } from './auth';

export const changeSlug = async (oldSlug: string, newSlug: string): Promise<void> => {
  const uid = getCurrentUser()?.uid;
  if (!uid) throw new Error('로그인이 필요합니다.');

  const newSnap = await getDoc(doc(db, 'invitations', newSlug));
  if (newSnap.exists()) throw new Error('이미 사용 중인 주소입니다.');

  const oldSnap = await getDoc(doc(db, 'invitations', oldSlug));
  if (!oldSnap.exists()) throw new Error('청첩장을 찾을 수 없습니다.');

  const data = oldSnap.data();
  await setDoc(doc(db, 'invitations', newSlug), { ...data, slug: newSlug, updatedAt: serverTimestamp() });

  const gbSnap = await getDocs(collection(db, `invitations/${oldSlug}/guestbook`));
  for (const d of gbSnap.docs) {
    await setDoc(doc(db, `invitations/${newSlug}/guestbook`, d.id), d.data());
    await deleteDoc(doc(db, `invitations/${oldSlug}/guestbook`, d.id));
  }

  const rsvpSnap = await getDocs(collection(db, `invitations/${oldSlug}/rsvp`));
  for (const d of rsvpSnap.docs) {
    await setDoc(doc(db, `invitations/${newSlug}/rsvp`, d.id), d.data());
    await deleteDoc(doc(db, `invitations/${oldSlug}/rsvp`, d.id));
  }

  await deleteDoc(doc(db, 'invitations', oldSlug));
};

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
