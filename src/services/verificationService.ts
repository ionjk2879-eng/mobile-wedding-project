import {
  collection, addDoc, getDocs, query, where, orderBy,
  serverTimestamp, doc, updateDoc, Timestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from './index';

export interface VerificationRequest {
  id: string;
  slug: string;
  orderNumber: string;
  ownerUid: string;
  ownerEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp | null;
  processedAt?: Timestamp | null;
  weddingDateISO: string;
  groomName: string;
  brideName: string;
}

export const submitVerificationRequest = async (params: {
  slug: string;
  orderNumber: string;
  weddingDateISO?: string;
  groomName?: string;
  brideName?: string;
}): Promise<void> => {
  const user = getAuth().currentUser;
  if (!user) throw new Error('로그인이 필요합니다.');

  const trimmed = params.orderNumber.trim();
  if (!trimmed) throw new Error('주문번호를 입력해주세요.');

  const dupSnap = await getDocs(
    query(collection(db, 'verificationRequests'), where('orderNumber', '==', trimmed))
  );
  if (!dupSnap.empty) throw new Error('이미 사용된 주문번호입니다.');

  const pendingSnap = await getDocs(
    query(
      collection(db, 'verificationRequests'),
      where('slug', '==', params.slug),
      where('ownerUid', '==', user.uid),
      where('status', '==', 'pending'),
    )
  );
  if (!pendingSnap.empty) throw new Error('이미 검토 중인 요청이 있습니다.');

  await addDoc(collection(db, 'verificationRequests'), {
    slug: params.slug,
    orderNumber: trimmed,
    ownerUid: user.uid,
    ownerEmail: user.email || '',
    status: 'pending',
    submittedAt: serverTimestamp(),
    weddingDateISO: params.weddingDateISO || '',
    groomName: params.groomName || '',
    brideName: params.brideName || '',
  });
};

export const fetchMyVerificationRequests = async (): Promise<VerificationRequest[]> => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) return [];
  const snap = await getDocs(
    query(collection(db, 'verificationRequests'), where('ownerUid', '==', uid))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as VerificationRequest));
};

export const fetchAllVerificationRequests = async (): Promise<VerificationRequest[]> => {
  const snap = await getDocs(
    query(collection(db, 'verificationRequests'), orderBy('submittedAt', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as VerificationRequest));
};

export const approveVerificationRequest = async (
  requestId: string,
  slug: string,
  weddingDateISO: string,
): Promise<void> => {
  const expiry = new Date(weddingDateISO || new Date().toISOString());
  expiry.setFullYear(expiry.getFullYear() + 1);

  await updateDoc(doc(db, 'invitations', slug), {
    isPaid: true,
    expiresAt: expiry.toISOString(),
  });

  await updateDoc(doc(db, 'verificationRequests', requestId), {
    status: 'approved',
    processedAt: serverTimestamp(),
  });
};

export const rejectVerificationRequest = async (requestId: string): Promise<void> => {
  await updateDoc(doc(db, 'verificationRequests', requestId), {
    status: 'rejected',
    processedAt: serverTimestamp(),
  });
};