# Sonett 프론트엔드 개선방안

## 1. 컴포넌트 구조 개선

### 1-1. EditorContainer 분리 (현재 1,466줄 단일 파일)

**현재 문제:** `EditorContainer.tsx`에 15개 섹션의 UI + 로직 + 스타일이 모두 포함되어 유지보수가 어려움

**개선안:**
```
components/Editor/
├── EditorContainer.tsx          # 레이아웃 + 사이드바만 담당
├── sections/
│   ├── ThemeSection.tsx          # 테마 선택
│   ├── DesignSection.tsx         # 디자인/스타일 설정
│   ├── BasicInfoSection.tsx      # 기본 정보 (신랑/신부/일시)
│   ├── GreetingSection.tsx       # 인사말
│   ├── MessageSection.tsx        # 신랑/신부 한마디
│   ├── InterviewSection.tsx      # 인터뷰 Q&A
│   ├── PhotosSection.tsx         # 갤러리 관리
│   ├── TimelineSection.tsx       # 타임라인
│   ├── LocationSection.tsx       # 장소/교통
│   ├── RSVPSection.tsx           # 참석의사
│   ├── AccountsSection.tsx       # 계좌 정보
│   ├── MusicSection.tsx          # 배경음악
│   ├── OrderSection.tsx          # 순서 관리
│   └── ShareSection.tsx          # 공유 설정
└── hooks/
    ├── useEditorScroll.ts        # 스크롤/네비게이션 로직
    └── useEditorSections.ts      # 섹션 토글/확장 상태 관리
```

**기대 효과:** 각 섹션 독립 수정 가능, 코드 리뷰 용이, 재사용성 향상

---

### 1-2. App.tsx에서 프리뷰 로직 분리

**현재 문제:** `App.tsx`(557줄)에 배경 효과 렌더링, 음악 재생 로직, 프리뷰 레이아웃이 혼재

**개선안:**
```
components/Preview/
├── PreviewContainer.tsx          # 프리뷰 래퍼 (테마 클래스, 폰트 적용)
├── BackgroundEffects.tsx         # 파티클 효과 (벚꽃, 눈 등) 분리
├── MusicPlayer.tsx               # 배경음악 재생/정지 로직 분리
└── SectionRenderer.tsx           # sectionOrder에 따른 섹션 렌더링
```

**예시 - BackgroundEffects 분리:**
```tsx
// 현재: App.tsx에 7개 효과가 각각 20~30줄씩 나열
// 개선: 단일 컴포넌트로 추출
const BackgroundEffects: React.FC<{ effect: string }> = ({ effect }) => {
  const config = EFFECT_CONFIG[effect]; // 파티클 수, 클래스, 스타일 등
  if (!config) return null;
  return (
    <div className="effect-layer">
      {Array.from({ length: config.count }).map((_, i) => (
        <div key={i} className={`particle ${config.className}`}
             style={config.getStyle(i)} />
      ))}
    </div>
  );
};
```

---

### 1-3. ViewPage와 App.tsx 간 프리뷰 코드 중복 제거

**현재 문제:** `App.tsx`와 `ViewPage.tsx`에 동일한 배경 효과, 음악 재생, 섹션 렌더링 코드가 중복

**개선안:** 공통 프리뷰 컴포넌트를 만들어 양쪽에서 재사용
```tsx
// components/Preview/InvitationView.tsx
const InvitationView: React.FC<{ data: InvitationData }> = ({ data }) => {
  // 배경 효과 + 음악 + 섹션 렌더링 통합
  return (
    <div className={`preview-wrapper texture-${data.bgTexture}`}>
      <BackgroundEffects effect={data.bgEffect} />
      <MusicPlayer url={data.bgMusicUrl} />
      <Hero data={data} />
      {sectionOrder.map((id, i) => (
        <ScrollReveal key={id} effect={data.scrollEffect} delay={...}>
          <SectionComponent id={id} data={data} />
        </ScrollReveal>
      ))}
    </div>
  );
};
```

---

## 2. 상태 관리 개선

### 2-1. Context API 또는 Zustand 도입

**현재 문제:** `InvitationData`가 `App.tsx` → `EditorContainer` → 각 섹션으로 props drilling

**개선안:**
```tsx
// stores/useInvitationStore.ts (Zustand 예시)
const useInvitationStore = create<InvitationStore>((set) => ({
  data: initialData,
  updateField: (field, value) =>
    set((state) => ({ data: { ...state.data, [field]: value } })),
  updateContact: (index, field, value) =>
    set((state) => { /* ... */ }),
  updateAccount: (index, field, value) =>
    set((state) => { /* ... */ }),
}));
```

**기대 효과:** props 전달 없이 어디서든 데이터 접근/수정 가능, 불필요한 리렌더링 감소

---

### 2-2. 이미지 데이터 최적화

**현재 문제:** 사진이 Base64로 `InvitationData` 상태에 저장됨 → 상태 객체 비대화, 리렌더링 시 성능 저하

**개선안:**
- 이미지 업로드 시 Firebase Storage에 저장하고 URL만 상태에 보관
- 업로드 중 로딩 표시 추가
- 이미지 리사이징 (max 1200px) 후 업로드

```tsx
const uploadImage = async (file: File): Promise<string> => {
  const resized = await resizeImage(file, 1200);
  const ref = storageRef(storage, `images/${Date.now()}_${file.name}`);
  await uploadBytes(ref, resized);
  return getDownloadURL(ref);
};
```

---

## 3. 스타일링 개선

### 3-1. CSS-in-JSX를 CSS Modules 또는 파일로 분리

**현재 문제:** `EditorContainer.tsx`에 약 200줄의 인라인 `<style>` 태그가 포함. `App.tsx`에도 약 100줄.

**개선안:**
```
styles/
├── editor.module.css             # 에디터 전용 스타일
├── preview.module.css            # 프리뷰 전용 스타일
├── effects.css                   # 파티클 애니메이션
└── themes.css                    # 테마 변수 (현재 index.css)
```

**장점:** IDE 자동완성, 스타일 충돌 방지, 빌드 시 최적화, 파일 탐색 용이

---

### 3-2. 반응형 대응 강화

**현재 문제:** 에디터가 데스크탑 고정 레이아웃(700px + 450px)으로 태블릿/모바일에서 사용 불가

**개선안:**
```css
/* 태블릿 (1024px 이하) */
@media (max-width: 1024px) {
  .builder-main-container {
    flex-direction: column;
  }
  .editor-panel { flex: 1; max-height: 50vh; }
  .preview-panel { flex: 1; }
}

/* 모바일 (768px 이하) */
@media (max-width: 768px) {
  .builder-main-container {
    flex-direction: column;
  }
  .editor-panel, .preview-panel { width: 100%; }
  /* 탭 전환으로 에디터/프리뷰 표시 */
}
```

---

## 4. 성능 최적화

### 4-1. 불필요한 리렌더링 방지

**현재 문제:** `onChange(setData)`가 호출될 때마다 `InvitationData` 전체가 새 객체로 교체되어 모든 Preview 컴포넌트가 리렌더링

**개선안:**
```tsx
// 각 Preview 컴포넌트에 React.memo 적용
const Greeting = React.memo<PreviewProps>(({ data }) => {
  // ...
}, (prev, next) => {
  // 해당 섹션에 필요한 필드만 비교
  return prev.data.greetingTitle === next.data.greetingTitle
      && prev.data.greetingContent === next.data.greetingContent;
});
```

또는 Zustand selector로 필요한 데이터만 구독:
```tsx
const Greeting = () => {
  const { greetingTitle, greetingContent } = useInvitationStore(
    (s) => ({ greetingTitle: s.data.greetingTitle, greetingContent: s.data.greetingContent }),
    shallow
  );
  // ...
};
```

---

### 4-2. 이미지 Lazy Loading

**현재 문제:** 갤러리 사진이 한 번에 모두 로드됨

**개선안:**
```tsx
<img
  src={photo}
  alt=""
  loading="lazy"
  decoding="async"
/>
```

또는 `IntersectionObserver` 기반 커스텀 Lazy Load 적용 (ScrollReveal과 유사한 패턴 활용)

---

### 4-3. 코드 스플리팅

**개선안:** 라우트별 코드 분할로 초기 로딩 속도 개선
```tsx
// main.tsx
const App = React.lazy(() => import('./App'));
const ViewPage = React.lazy(() => import('./pages/ViewPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/w/:slug" element={<ViewPage />} />
    <Route path="/admin/:slug" element={<AdminPage />} />
  </Routes>
</Suspense>
```

**효과:** 하객(`/w/:slug`)은 에디터 코드를 다운로드하지 않아 로딩 속도 크게 개선

---

## 5. 타입 안정성 강화

### 5-1. any 타입 제거

**현재 문제:**
- `Location.tsx`: `window.kakao: any`
- `EditorContainer.tsx`: `window.daum: any`, `updatedData: any`, `searchData: any`

**개선안:**
```tsx
// types/kakao.d.ts
declare namespace kakao.maps {
  class Map { constructor(container: HTMLElement, options: MapOptions); setCenter(latlng: LatLng): void; }
  class LatLng { constructor(lat: number, lng: number); }
  class Marker { constructor(options: { map: Map; position: LatLng }); }
  namespace services {
    class Geocoder { addressSearch(address: string, callback: GeocoderCallback): void; }
    class Places { keywordSearch(keyword: string, callback: PlacesCallback, options?: PlacesOptions): void; }
    const Status: { OK: string };
    const SortBy: { DISTANCE: string };
  }
}
```

---

### 5-2. InvitationData 타입 세분화

**현재 문제:** `InvitationData`에 30개 이상의 필드가 flat하게 나열

**개선안:**
```tsx
interface InvitationData {
  // 기본 정보
  basic: BasicInfo;
  // 디자인
  design: DesignConfig;
  // 콘텐츠
  content: ContentData;
  // 기능 설정
  features: FeatureConfig;
  // 공유/배포
  sharing: SharingConfig;
}

interface DesignConfig {
  theme: ThemeType;
  bgTexture: TextureType;
  bgEffect: EffectType;
  scrollEffect: ScrollEffectType;
  heroStyle: HeroStyleType;
  fontFamily: string;
  fontSize: FontSizeType;
}
```

---

## 6. 접근성(A11y) 개선

### 6-1. 시맨틱 HTML

**현재 문제:** 대부분 `<div>`로 구성, `<section>`, `<nav>`, `<main>`, `<article>` 미사용

**개선안:**
```tsx
// 에디터 사이드바
<nav className="editor-sidebar" aria-label="에디터 섹션 네비게이션">
  {navItems.map(item => (
    <button aria-current={activeSection === item.id ? 'true' : undefined}>
      {item.name}
    </button>
  ))}
</nav>

// 프리뷰 각 섹션
<section aria-label="인사말">
  <Greeting data={data} />
</section>
```

---

### 6-2. 키보드 네비게이션

**현재 문제:** 갤러리 라이트박스에 키보드 지원이 있으나, 에디터 섹션 간 이동, 순서 관리 등은 키보드 접근 불가

**개선안:**
- 섹션 순서 관리에 `aria-label` 및 키보드 핸들러 추가
- 포커스 트랩: 모달/팝업 열릴 때 포커스 가두기
- 색상 대비: WCAG AA 기준 충족 검토

---

## 7. 에러 처리 및 UX 개선

### 7-1. Firebase 에러 처리 강화

**현재 문제:** 저장 실패 시 `alert('저장에 실패했습니다.')` 만 표시

**개선안:**
- 토스트 알림 컴포넌트 도입
- 네트워크 에러 vs 권한 에러 구분 메시지
- 자동 재시도 로직 (exponential backoff)
- 저장 중 로딩 상태 표시

```tsx
const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
```

---

### 7-2. 폼 유효성 검사

**현재 문제:** slug, 연락처, 계좌번호 등에 입력 유효성 검사 없음

**개선안:**
- slug: 영문/숫자/하이픈만 허용, 중복 체크 (`checkSlugAvailable` 함수 이미 존재)
- 연락처: 전화번호 포맷 자동 변환 (010-0000-0000)
- 날짜: 과거 날짜 경고

---

### 7-3. 자동 저장 (Auto Save)

**개선안:**
```tsx
useEffect(() => {
  if (!data.slug) return;
  const timer = setTimeout(() => {
    saveInvitation(data.slug, data);
  }, 3000); // 3초 디바운스
  return () => clearTimeout(timer);
}, [data]);
```

---

## 8. 개선 우선순위

| 순위 | 항목 | 난이도 | 효과 |
|------|------|--------|------|
| 1 | ViewPage/App 프리뷰 코드 중복 제거 | 중 | 유지보수성 대폭 향상 |
| 2 | 이미지 Base64 → Storage 전환 | 중 | 성능 + 데이터 크기 개선 |
| 3 | EditorContainer 섹션별 분리 | 중 | 유지보수성 + 협업 |
| 4 | React.lazy 코드 스플리팅 | 하 | 하객 페이지 로딩 속도 |
| 5 | CSS 파일 분리 | 하 | 코드 가독성 |
| 6 | Zustand 상태 관리 도입 | 중 | 리렌더링 최적화 |
| 7 | any 타입 제거 + 타입 세분화 | 하 | 타입 안정성 |
| 8 | 접근성 개선 | 중 | 사용자 경험 |
| 9 | 반응형 에디터 | 상 | 모바일 에디터 지원 |
| 10 | 자동 저장 + 에러 처리 | 중 | 사용자 신뢰도 |
