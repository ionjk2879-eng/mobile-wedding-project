const loadedFonts = new Set<string>();

const FONT_MAP: Record<string, string> = {
  'Cormorant Garamond': 'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300',
  'Playfair Display': 'family=Playfair+Display:ital,wght@0,400;0,600;1,400',
  'Gowun Batang': 'family=Gowun+Batang',
  'Gowun Dodum': 'family=Gowun+Dodum',
  'Nanum Myeongjo': 'family=Nanum+Myeongjo:wght@400;700',
  'Dancing Script': 'family=Dancing+Script',
};

export function loadFont(fontFamily: string): void {
  const key = Object.keys(FONT_MAP).find((k) => fontFamily.includes(k));
  if (!key || loadedFonts.has(key)) return;
  loadedFonts.add(key);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${FONT_MAP[key]}&display=swap`;
  document.head.appendChild(link);
}

export function loadAllFonts(): void {
  Object.keys(FONT_MAP).forEach((key) => {
    if (loadedFonts.has(key)) return;
    loadedFonts.add(key);
  });
  const params = Object.values(FONT_MAP).join('&');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
  document.head.appendChild(link);
}
