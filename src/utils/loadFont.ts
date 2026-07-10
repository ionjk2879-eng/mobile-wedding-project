const loadedFonts = new Set<string>();

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
  OngleipParkDahyeon: { type: 'custom', face: "@font-face{font-family:'OngleipParkDahyeon';src:url(https://cdn.jsdelivr.net/gh/projectnoonnu/2411-3@1.0/Ownglyph_ParkDaHyun.woff2) format('woff2');font-weight:400;font-display:swap;}" },
  Cafe24Anemone: { type: 'custom', face: "@font-face{font-family:'Cafe24Anemone';src:url(https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/Cafe24Ohsquare.woff) format('woff');font-weight:400;font-display:swap;}" },
};

function applyFont(key: string): void {
  const src = FONT_MAP[key];
  if (src.type === 'google') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${src.params}&display=swap`;
    document.head.appendChild(link);
  } else {
    const style = document.createElement('style');
    style.textContent = src.face;
    document.head.appendChild(style);
  }
}

export function loadFont(fontFamily: string): void {
  const key = Object.keys(FONT_MAP).find((k) => fontFamily.includes(k));
  if (!key || loadedFonts.has(key)) return;
  loadedFonts.add(key);
  applyFont(key);
}

export function loadAllFonts(): void {
  const googleParams: string[] = [];
  const customFaces: string[] = [];
  Object.entries(FONT_MAP).forEach(([key, src]) => {
    if (loadedFonts.has(key)) return;
    loadedFonts.add(key);
    if (src.type === 'google') googleParams.push(src.params);
    else customFaces.push(src.face);
  });
  if (googleParams.length) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${googleParams.join('&')}&display=swap`;
    document.head.appendChild(link);
  }
  if (customFaces.length) {
    const style = document.createElement('style');
    style.textContent = customFaces.join('\n');
    document.head.appendChild(style);
  }
}
