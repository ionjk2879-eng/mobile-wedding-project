import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { kakaoAuthHandler } from './kakaoAuth';
import { naverAuthHandler } from './naverAuth';
import admin from './firebaseAdmin';

const kakaoRestApiKey = defineSecret('KAKAO_REST_API_KEY');
const kakaoClientSecret = defineSecret('KAKAO_CLIENT_SECRET');
const naverClientId = defineSecret('NAVER_CLIENT_ID');
const naverClientSecret = defineSecret('NAVER_CLIENT_SECRET');

export const authKakao = onRequest(
  {
    cors: true,
    region: 'asia-northeast3',
    secrets: [kakaoRestApiKey, kakaoClientSecret],
  },
  kakaoAuthHandler,
);

export const authNaver = onRequest(
  {
    cors: true,
    region: 'asia-northeast3',
    secrets: [naverClientId, naverClientSecret],
  },
  naverAuthHandler,
);

// 매일 오전 3시 (KST) 만료된 청첩장 자동 삭제
export const deleteExpiredInvitations = onSchedule(
  { schedule: '0 18 * * *', timeZone: 'UTC', region: 'asia-northeast3' },
  async () => {
    const db = admin.firestore();
    const now = new Date().toISOString();

    const snap = await db.collection('invitations')
      .where('expiresAt', '<=', now)
      .get();

    if (snap.empty) return;

    const batch = db.batch();
    for (const docSnap of snap.docs) {
      // 서브컬렉션(guestbook, rsvp)은 별도 삭제
      const gbSnap = await docSnap.ref.collection('guestbook').get();
      gbSnap.docs.forEach(d => batch.delete(d.ref));
      const rsvpSnap = await docSnap.ref.collection('rsvp').get();
      rsvpSnap.docs.forEach(d => batch.delete(d.ref));
      batch.delete(docSnap.ref);
    }

    await batch.commit();
    console.log(`만료 청첩장 ${snap.size}개 삭제 완료`);
  }
);
