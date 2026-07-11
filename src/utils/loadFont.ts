const loadedFonts = new Set<string>();
// 폰트별 "사용 가능해질 때까지"를 나타내는 프라미스. loadFont를 여러 번 호출해도
// 실제 네트워크 요청/대기는 한 번만 하고 같은 프라미스를 재사용한다.
const readyPromises = new Map<string, Promise<void>>();

type FontSource =
  | { type: 'google'; params: string }
  | { type: 'custom'; face: string };

const FONT_MAP: Record<string, FontSource> = {
  'Cormorant Garamond': { type: 'google', params: 'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300' },
  'Playfair Display': { type: 'google', params: 'family=Playfair+Display:ital,wght@0,400;0,600;1,400' },
  'Gowun Batang': { type: 'google', params: 'family=Gowun+Batang' },
  'Gowun Dodum': { type: 'google', params: 'family=Gowun+Dodum' },
  'Nanum Myeongjo': { type: 'google', params: 'family=Nanum+Myeongjo:wght@400;700' },
  'Dancing Script': { type: 'google', params: 'family=Dancing+Script' },
  // 아래는 눈누(noonnu.cc)에서 상업적 이용이 가능한(라이선스 확인 완료) 한글 폰트.
  // Google Fonts에 없어 CDN(@font-face)으로 직접 로드한다.
  MaruBuri: { type: 'custom', face: "@font-face{font-family:'MaruBuri';src:url(https://hangeul.pstatic.net/hangeul_static/webfont/MaruBuri/MaruBuri-Regular.woff2) format('woff2');font-weight:400;font-display:swap;}" },
  SUIT: { type: 'custom', face: "@font-face{font-family:'SUIT';src:url(https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-Regular.woff2) format('woff2');font-weight:400;font-display:swap;}" },
  Ridibatang: { type: 'custom', face: "@font-face{font-family:'Ridibatang';src:url(https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.0/RIDIBatang.woff) format('woff');font-weight:400;font-display:swap;}" },
};

// font-display: swap이라 폰트가 늦게 도착하면 폴백 글꼴 → 커스텀 글꼴로 화면이 바뀌면서
// 텍스트 줄높이/폭이 변해 레이아웃이 밀리는 문제가 있었다(메인화면 높이가 바뀌며 바로
// 아래 섹션이 밀리는 것처럼 보임). 이를 막기 위해 "실제로 쓸 수 있게 됐다"를 Font Loading
// API로 확인한 뒤에야 화면을 보여주도록, 로딩 완료를 기다릴 수 있는 프라미스를 반환한다.
// 네트워크 문제 등으로 영영 끝나지 않는 상황을 막기 위해 최대 2.5초까지만 기다린다.
function waitUntilReady(key: string): Promise<void> {
  const check = document.fonts
    ? document.fonts.load(`700 1em "${key}"`).then(() => {}).catch(() => {})
    : Promise.resolve();
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 2500));
  return Promise.race([check, timeout]);
}

function registerFont(key: string, onRegistered: () => void): void {
  const src = FONT_MAP[key];
  if (src.type === 'google') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${src.params}&display=swap`;
    link.onload = onRegistered;
    link.onerror = onRegistered;
    document.head.appendChild(link);
  } else {
    const style = document.createElement('style');
    style.textContent = src.face;
    document.head.appendChild(style);
    onRegistered();
  }
}

// fontFamily 문자열(예: "'MaruBuri', serif")에서 필요한 폰트를 찾아 로드하고, 실제로
// 그려낼 수 있게 될 때까지(또는 타임아웃까지) 기다리는 프라미스를 반환한다. 호출부에서
// 이 프라미스를 기다린 뒤 화면을 보여주면 폰트 교체로 인한 레이아웃 밀림을 피할 수 있다.
export function loadFont(fontFamily: string): Promise<void> {
  const key = Object.keys(FONT_MAP).find((k) => fontFamily.includes(k));
  if (!key) return Promise.resolve();
  const existing = readyPromises.get(key);
  if (existing) return existing;
  loadedFonts.add(key);
  const attempt = new Promise<void>((resolve) => {
    registerFont(key, () => { waitUntilReady(key).then(resolve); });
  });
  // <link>가 로드 자체를 영영 안 끝내는(connection hang 등) 극단적인 상황까지 대비해,
  // waitUntilReady 내부 타임아웃과 별개로 전체 과정에 상한선을 하나 더 둔다 — 이게 없으면
  // onload/onerror가 아예 안 불려서 waitUntilReady 타임아웃조차 시작되지 못할 수 있다.
  const hardCeiling = new Promise<void>((resolve) => setTimeout(resolve, 4000));
  const promise = Promise.race([attempt, hardCeiling]);
  readyPromises.set(key, promise);
  return promise;
}

// 에디터에서 글꼴 선택 즉시 미리보기 되도록 모든 후보 폰트를 백그라운드로 미리 받아둔다.
// 화면을 가리지 않는 워밍업 용도라 완료를 기다리지 않는다(fire-and-forget).
export function loadAllFonts(): void {
  Object.keys(FONT_MAP).forEach((key) => {
    if (loadedFonts.has(key)) return;
    loadFont(key);
  });
}
