# Sonett 백엔드 개선방안

## 현재 백엔드 구조 요약

```
firebase.ts          # Firebase 초기화 + CRUD 함수 (31줄)
├── saveInvitation()   # Firestore에 청첩장 데이터 저장
├── loadInvitation()   # slug로 청첩장 데이터 조회
├── checkSlugAvailable() # slug 중복 확인 (미사용)
└── db, collection, addDoc, getDocs 등 re-export

RSVPForm.tsx         # 클라이언트에서 직접 Firestore에 RSVP 쓰기
AdminPage.tsx        # 클라이언트에서 직접 Firestore RSVP 서브컬렉션 읽기
Dashboard.tsx        # 클라이언트에서 직접 Firestore 'rsvp' 컬렉션 읽기
```

---

## 1. 보안 취약점 개선

### 1-1. Firebase API 키 하드코딩 제거

**현재 문제:** `firebase.ts`에 API 키, 프로젝트 ID 등이 소스코드에 직접 노출
```ts
// 현재 코드 (위험)
const firebaseConfig = {
  apiKey: "AIzaSyCBePNVNVFELc5YGEX8iuwRbSygr08efr8",
  authDomain: "sonett-23064.firebaseapp.com",
  // ...
};
```

**개선안:** 환경 변수 사용
```ts
// .env (Git에서 제외)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=sonett-23064.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sonett-23064
VITE_FIREBASE_STORAGE_BUCKET=sonett-23064.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=425141601057
VITE_FIREBASE_APP_ID=1:425141601057:web:fe9329aa77cb96e6b83460

// firebase.ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

추가 조치:
- `.gitignore`에 `.env` 추가
- `.env.example` 파일 생성 (키 값은 비워두고 변수명만 기재)
- Firebase 콘솔에서 API 키에 **HTTP Referrer 제한** 설정
- 기존 노출된 키는 Firebase 콘솔에서 **로테이션** 권장

---

### 1-2. Firestore Security Rules 설정

**현재 문제:** Security Rules가 미설정이거나 `allow read, write: if true;` 상태일 가능성 높음. 누구나 모든 청첩장 데이터를 읽고 쓸 수 있음.

**개선안:**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 청첩장 데이터: 누구나 읽기 가능, 쓰기는 인증된 사용자만
    match /invitations/{slug} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
                            && request.auth.uid == resource.data.ownerUid;
    }

    // RSVP 응답: 누구나 쓰기 가능 (하객), 읽기는 소유자만
    match /invitations/{slug}/rsvp/{docId} {
      allow create: if true
                    && request.resource.data.guestName is string
                    && request.resource.data.guestName.size() > 0
                    && request.resource.data.guestName.size() < 50;
      allow read: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

---

### 1-3. RSVP 스팸 방지

**현재 문제:** 누구나 무제한으로 RSVP를 제출할 수 있음 (봇 공격, 중복 제출 가능)

**개선안:**

방법 1: Rate Limiting (Firestore Rules)
```javascript
// 같은 IP/기기에서 5분 내 중복 제출 방지 (클라이언트 fingerprint 저장)
match /invitations/{slug}/rsvp/{docId} {
  allow create: if request.resource.data.keys().hasAll(['guestName', 'isAttending', 'createdAt'])
                && request.resource.data.guestName.size() > 0
                && request.resource.data.guestName.size() < 50
                && request.resource.data.message.size() < 500;
}
```

방법 2: Cloud Functions로 서버사이드 검증
```ts
// functions/src/index.ts
export const submitRSVP = onCall(async (request) => {
  const { slug, guestName, isAttending, totalGuests, wantsMeal, relation, message } = request.data;

  // 유효성 검사
  if (!guestName || guestName.length > 50) throw new HttpsError('invalid-argument', '이름을 확인해주세요.');
  if (totalGuests < 1 || totalGuests > 10) throw new HttpsError('invalid-argument', '인원수를 확인해주세요.');
  if (message && message.length > 500) throw new HttpsError('invalid-argument', '메시지가 너무 깁니다.');

  // 중복 체크 (같은 이름으로 이미 제출한 경우)
  const existing = await db.collection(`invitations/${slug}/rsvp`)
    .where('guestName', '==', guestName).limit(1).get();
  if (!existing.empty) throw new HttpsError('already-exists', '이미 응답하셨습니다.');

  await db.collection(`invitations/${slug}/rsvp`).add({
    guestName, isAttending, totalGuests, wantsMeal, relation, message,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});
```

---

## 2. 데이터 구조 개선

### 2-1. Firestore 컬렉션 구조 재설계

**현재 문제:**
- `Dashboard.tsx`는 `collection(db, 'rsvp')`에서 읽고 (최상위 컬렉션)
- `AdminPage.tsx`는 `collection(db, 'invitations/${slug}/rsvp')`에서 읽음 (서브컬렉션)
- 두 컴포넌트가 서로 다른 경로를 바라보고 있어 Dashboard에서 데이터가 안 보일 수 있음

**개선안:** 서브컬렉션으로 통일
```
invitations/
└── {slug}/
    ├── data: InvitationData    # 청첩장 데이터
    ├── ownerUid: string        # 소유자 인증 정보
    ├── createdAt: timestamp
    ├── updatedAt: timestamp
    └── rsvp/ (서브컬렉션)
        └── {docId}/
            ├── guestName: string
            ├── isAttending: boolean
            ├── totalGuests: number
            ├── wantsMeal: boolean
            ├── relation: 'groom' | 'bride'
            ├── message: string
            └── createdAt: timestamp (서버 타임스탬프)
```

---

### 2-2. 서버 타임스탬프 사용

**현재 문제:** `createdAt`을 클라이언트 시간(`new Date().toISOString()`)으로 저장 → 시간 조작 가능, 시간대 불일치

**개선안:**
```ts
import { serverTimestamp } from 'firebase/firestore';

// RSVP 저장 시
await addDoc(collection(db, `invitations/${slug}/rsvp`), {
  ...formData,
  createdAt: serverTimestamp(), // Firebase 서버 시간 사용
});

// 청첩장 저장 시
await setDoc(doc(db, 'invitations', slug), {
  ...data,
  updatedAt: serverTimestamp(),
});
```

---

### 2-3. 데이터 크기 제한

**현재 문제:** 이미지가 Base64로 Firestore 문서에 저장됨
- Firestore 문서 최대 크기: 1MB
- 사진 여러 장 업로드 시 쉽게 한계 도달
- Firestore 읽기 비용이 문서 크기에 비례하여 증가

**개선안:** Firebase Storage 분리
```ts
// services/storage.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

export const uploadImage = async (slug: string, file: File, type: string): Promise<string> => {
  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `invitations/${slug}/${type}/${fileName}`);

  // 리사이징 후 업로드
  const resized = await resizeImage(file, 1200);
  await uploadBytes(storageRef, resized);

  return getDownloadURL(storageRef);
};

export const uploadHeroPhoto = (slug: string, file: File) =>
  uploadImage(slug, file, 'hero');

export const uploadGalleryPhoto = (slug: string, file: File) =>
  uploadImage(slug, file, 'gallery');
```

Storage Rules:
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /invitations/{slug}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024  // 5MB 제한
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 3. 인증(Authentication) 도입

### 3-1. Firebase Auth 연동

**현재 문제:** 인증 없이 누구나 청첩장 생성/수정/삭제 가능. 관리자 페이지도 URL만 알면 접근 가능.

**개선안:**
```ts
// services/auth.ts
import { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const auth = getAuth();

// 방법 1: 익명 인증 (가장 간편)
export const signInAnon = () => signInAnonymously(auth);

// 방법 2: Google 로그인
export const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());

// 현재 사용자
export const getCurrentUser = () => auth.currentUser;
```

**적용 범위:**
| 기능 | 인증 필요 | 방식 |
|------|-----------|------|
| 청첩장 열람 (`/w/:slug`) | X | 공개 |
| RSVP 제출 | X | 공개 (rate limit만) |
| 청첩장 생성/편집 (`/`) | O | Google 또는 이메일 |
| 관리자 페이지 (`/admin/:slug`) | O | 소유자만 접근 |

---

### 3-2. 관리자 페이지 접근 제어

**현재 문제:** `/admin/{slug}` URL을 아는 사람은 누구나 RSVP 응답 목록 조회 가능

**개선안:**
```tsx
// pages/AdminPage.tsx
const AdminPage: React.FC = () => {
  const { slug } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && slug) {
        const invitation = await loadInvitation(slug);
        setAuthorized(invitation?.ownerUid === u.uid);
      }
    });
    return unsubscribe;
  }, [slug]);

  if (!user) return <LoginPrompt />;
  if (!authorized) return <Unauthorized />;

  // 기존 관리 화면 렌더링
};
```

---

## 4. Firebase 서비스 계층 분리

### 4-1. API 모듈 구조화

**현재 문제:** `firebase.ts`에 초기화 + CRUD가 혼재. 컴포넌트에서 `db`, `collection`, `addDoc`을 직접 import하여 사용.

**개선안:**
```
services/
├── firebase.ts              # Firebase 앱 초기화만 담당
├── auth.ts                  # 인증 관련 함수
├── invitationService.ts     # 청첩장 CRUD
├── rsvpService.ts           # RSVP CRUD
└── storageService.ts        # 이미지 업로드/삭제
```

```ts
// services/invitationService.ts
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { InvitationData } from '../types';

export const saveInvitation = async (slug: string, data: InvitationData, uid: string) => {
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
  return !snap.exists();
};
```

```ts
// services/rsvpService.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { RSVPResponse } from '../types';

export const submitRSVP = async (slug: string, data: Omit<RSVPResponse, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, `invitations/${slug}/rsvp`), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getRSVPResponses = async (slug: string): Promise<RSVPResponse[]> => {
  const q = query(collection(db, `invitations/${slug}/rsvp`), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RSVPResponse));
};
```

---

## 5. 실시간 데이터 & 오프라인 지원

### 5-1. 실시간 리스너 적용

**현재 문제:** AdminPage에서 `getDocs`로 1회성 조회 → 새 RSVP가 들어와도 수동 새로고침 필요

**개선안:**
```ts
import { onSnapshot } from 'firebase/firestore';

// services/rsvpService.ts
export const subscribeRSVP = (
  slug: string,
  callback: (responses: RSVPResponse[]) => void
) => {
  const q = query(collection(db, `invitations/${slug}/rsvp`), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RSVPResponse));
    callback(data);
  });
};

// pages/AdminPage.tsx
useEffect(() => {
  if (!slug) return;
  const unsubscribe = subscribeRSVP(slug, (data) => {
    setResponses(data);
    setLoading(false);
  });
  return unsubscribe;
}, [slug]);
```

**효과:** 하객이 RSVP 제출하면 관리자 페이지에 즉시 반영 (새로고침 불필요)

---

### 5-2. Firestore 오프라인 캐시

**개선안:**
```ts
// services/firebase.ts
import { enableIndexedDbPersistence } from 'firebase/firestore';

const db = getFirestore(app);

// 오프라인 캐시 활성화
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // 다중 탭 사용 시 하나의 탭에서만 활성화 가능
  } else if (err.code === 'unimplemented') {
    // 브라우저 미지원
  }
});
```

**효과:** 하객이 네트워크 불안정한 환경에서도 청첩장 열람 가능

---

## 6. Cloud Functions 활용

### 6-1. 서버사이드 로직 분리

현재 모든 비즈니스 로직이 클라이언트에서 실행됨. 민감한 로직은 Cloud Functions로 이전.

```
functions/
├── src/
│   ├── index.ts
│   ├── rsvp.ts              # RSVP 제출 검증
│   ├── invitation.ts        # slug 생성/검증
│   ├── notifications.ts     # 새 RSVP 알림
│   └── cleanup.ts           # 오래된 데이터 정리
└── package.json
```

---

### 6-2. RSVP 알림 기능

**개선안:** 새 RSVP 제출 시 제작자에게 알림
```ts
// functions/src/notifications.ts
export const onNewRSVP = onDocumentCreated(
  'invitations/{slug}/rsvp/{docId}',
  async (event) => {
    const slug = event.params.slug;
    const rsvpData = event.data?.data();

    // 청첩장 소유자 정보 조회
    const invitation = await db.doc(`invitations/${slug}`).get();
    const ownerEmail = invitation.data()?.ownerEmail;

    if (ownerEmail && rsvpData) {
      // 이메일 알림 발송
      await sendEmail(ownerEmail, {
        subject: `[Sonett] 새로운 참석 응답 - ${rsvpData.guestName}`,
        body: `${rsvpData.guestName}님이 ${rsvpData.isAttending ? '참석' : '불참'} 응답을 보냈습니다.`,
      });
    }
  }
);
```

---

### 6-3. OG 메타 태그 동적 생성 (SSR)

**현재 문제:** SPA이므로 카카오톡/SNS 공유 시 OG 메타 태그가 적용되지 않음

**개선안:** Cloud Functions로 `/w/:slug` 요청 시 HTML을 동적 생성
```ts
// functions/src/ogRenderer.ts
export const renderOG = onRequest(async (req, res) => {
  const slug = req.path.split('/w/')[1];
  if (!slug) { res.redirect('/'); return; }

  const doc = await db.doc(`invitations/${slug}`).get();
  if (!doc.exists) { res.status(404).send('Not found'); return; }

  const data = doc.data() as InvitationData;
  const title = data.shareTitle || `${data.groomName} ♡ ${data.brideName} 결혼합니다`;
  const description = data.shareDescription || `${data.date} ${data.time} ${data.venueName}`;

  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${data.heroPhoto || ''}" />
  <meta property="og:type" content="website" />
  <meta name="robots" content="noindex" />
  <script>window.location.href = '/#/w/${slug}';</script>
</head>
<body></body>
</html>`);
});
```

---

## 7. 에러 처리 및 모니터링

### 7-1. 에러 로깅

**현재 문제:** 에러 시 `console.error`만 호출 → 프로덕션에서 에러 추적 불가

**개선안:**
```ts
// services/errorTracking.ts
import { getAnalytics, logEvent } from 'firebase/analytics';

export const trackError = (context: string, error: unknown) => {
  console.error(`[${context}]`, error);

  // Firebase Analytics에 에러 이벤트 기록
  const analytics = getAnalytics();
  logEvent(analytics, 'error', {
    context,
    message: error instanceof Error ? error.message : String(error),
  });
};
```

사용:
```ts
try {
  await saveInvitation(slug, data);
} catch (err) {
  trackError('saveInvitation', err);
  // 사용자에게 토스트 알림 표시
}
```

---

### 7-2. Firestore 사용량 모니터링

Firebase 콘솔에서 설정:
- **읽기/쓰기 할당량 알림** 설정 (무료 Spark 플랜: 일일 읽기 50K, 쓰기 20K)
- **Budget Alert** 설정 (Blaze 플랜 전환 시)
- Cloud Monitoring으로 Firestore 지연시간 추적

---

## 8. 배포 파이프라인

### 8-1. Firebase Hosting 설정

```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      }
    ]
  }
}
```

### 8-2. GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
```

---

## 9. 개선 우선순위

| 순위 | 항목 | 난이도 | 위험도 | 효과 |
|------|------|--------|--------|------|
| 1 | API 키 환경변수화 + 키 로테이션 | 하 | **높음** | 보안 필수 |
| 2 | Firestore Security Rules 설정 | 하 | **높음** | 데이터 보호 필수 |
| 3 | RSVP 컬렉션 경로 통일 (Dashboard 버그) | 하 | 중 | 기능 정상화 |
| 4 | 서버 타임스탬프 전환 | 하 | 낮음 | 데이터 정합성 |
| 5 | 이미지 Storage 전환 | 중 | 중 | 성능 + 비용 절감 |
| 6 | 서비스 계층 분리 | 중 | 낮음 | 유지보수성 |
| 7 | Firebase Auth 도입 | 중 | 중 | 관리자 보안 |
| 8 | 실시간 리스너 (onSnapshot) | 하 | 낮음 | 사용자 경험 |
| 9 | Cloud Functions (RSVP 검증, 알림) | 상 | 중 | 서버 검증 |
| 10 | OG 메타 태그 동적 생성 | 상 | 낮음 | SNS 공유 개선 |
| 11 | CI/CD 파이프라인 | 중 | 낮음 | 배포 자동화 |
| 12 | 에러 모니터링 | 중 | 낮음 | 운영 안정성 |

> **1~2번은 즉시 조치 필요.** 현재 Firebase 키가 GitHub에 노출되어 있고, Security Rules 미설정 시 누구나 데이터를 읽고 쓸 수 있습니다.
