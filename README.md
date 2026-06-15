a# 💍 데이터 분석 기반 프리미엄 모바일 청첩장 빌더 (Mobile Wedding Invitation Builder & Analytics)

> **"단순한 청첩장을 넘어, 하객 관리까지 완벽하게"**  
> 기간 제한 없는 영구 보관 서비스는 물론, 하객들의 참석 응답(RSVP)을 수집하고 실시간으로 통계를 분석해주는 데이터 중심의 웨딩 솔루션입니다.

---

## 🌟 프로젝트 개요 (Project Overview)

- **목적**: 영구 소장용 모바일 청첩장 제작 및 하객 참석 데이터 통합 관리 시스템 구축
- **주요 타겟**: 효율적인 예식 준비(식수 인원 파악 등)와 영구 보관을 원하는 스마트한 예비 부부
- **핵심 가치**: **영구적 데이터 보존**, **실시간 RSVP 수집**, **데이터 시각화 분석**

---

## 🛠 기술 스택 (Tech Stack)

- **Frontend**: `React 18`, `TypeScript`, `Vite`
- **Analytics**: `Recharts` (데이터 시각화/차트 엔진)
- **Styling**: `Vanilla CSS`, `Framer Motion` (애니메이션)
- **Icons**: `Lucide React`
- **API**: `Daum Postcode API` (주소 검색)
- **Architecture**: `Component-Based Architecture (CBA)`

---

## ✨ 핵심 기능 (Key Features)

### 1. 실시간 라이브 프리뷰 & 스토리텔링 에디터
- **WYSIWYG 환경**: 왼쪽 에디터에서 내용을 수정하면 오른쪽 모바일 프레임에 즉시 반영.
- **Narrative Sync**: 인사말 -> 개인 메시지 -> 사진 -> 장소 -> RSVP -> 계좌로 이어지는 청첩장의 감성적인 흐름에 맞춰 에디터 순서 배치.

### 2. 하객 관리 & RSVP 시스템
- **참석 의사 제출**: 성함, 신랑/신부측 구분, 동반 인원, 식사 여부, 축화 메시지 수집.
- **개인 메시지 카드**: 신랑·신부의 진솔한 한마디를 강조하는 감성적인 카드 레이아웃.

### 3. 관리자 분석 대시보드 (Guest Analytics)
- **데이터 시각화**: `Recharts`를 활용해 총 참석 인원, 측별 비중, 식사 선호도를 차트로 분석.
- **실시간 리포트**: 수집된 하객 명단과 메시지를 테이블 형태로 한눈에 관리.

### 4. 고품격 웨딩 에스테틱
- **디자인 테마**: 샴페인 아이보리, 뮤트 샌드 컬러 조합으로 프리미엄 무드 연출.
- **사용자 경험**: 에디터와 프리뷰의 독립적 스크롤, 해상도 대응 스마트 스케일링 적용.

---

## 📐 시스템 아키텍처 (Architecture)

```text
src/
├── components/
│   ├── Editor/
│   │   └── EditorContainer.tsx (스토리텔링 기반 입력 제어)
│   ├── Preview/
│   │   ├── RSVPForm.tsx        (하객 응답 수집 폼)
│   │   ├── PersonalMessage.tsx (신랑/신부 개별 메시지)
│   │   └── ... (기타 프리뷰 컴포넌트)
│   └── Admin/
│       └── Dashboard.tsx       (Recharts 기반 데이터 분석 도구)
├── types.ts                    (InvitationData & RSVPResponse 타입 정의)
├── App.tsx                     (중앙 상태 및 대시보드 모달 제어)
└── index.css                   (글로벌 테마 시스템)
```

---

## 💡 엔지니어링 포인트 (Engineering Note)

- **데이터 분석 로직**: `Mock Data`와 `Reduce` 고차 함수를 활용해 원시 데이터를 의미 있는 통계 지표로 가공하는 로직 구현.
- **컴포넌트 추상화**: 모든 프리뷰 컴포넌트가 하나의 `data` 객체를 공유하도록 설계하여 단방향 데이터 흐름(Unidirectional Data Flow)을 엄격히 준수.
- **UI/UX 차별화**: 에디터와 프리뷰 영역의 시각적 분리(샴페인 아이보리 vs 크림 화이트)를 통해 작업 집중도를 높이는 인터페이스 설계.

---

## 🚀 실행 및 배포 (Setup & Deployment)

1. **로컬 실행**
   ```bash
   npm install
   npm run dev
   ```
2. **배포**: 생성된 `dist` 폴더를 GitHub Pages 등에 업로드하여 평생 무료 호스팅.

---

## 📜 라이선스 (License)
본 프로젝트는 개인 포트폴리오 및 실제 청첩장 제작 용도로 자유롭게 사용 가능합니다.
