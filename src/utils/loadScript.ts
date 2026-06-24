const loaded = new Map<string, Promise<void>>();

export function loadScript(src: string): Promise<void> {
  const existing = loaded.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const el = document.querySelector(`script[src="${src}"]`);
    if (el) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(script);
  });

  loaded.set(src, promise);
  return promise;
}

const KAKAO_JS_KEY = '5a920b742f037d8e9cb29865ca00c909';

export async function loadKakaoSDK(): Promise<void> {
  await loadScript('https://t1.kakaocdn.net/kakao_js_sdk/2.4.0/kakao.min.js');
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY);
  }
}

export async function loadKakaoMaps(): Promise<void> {
  await loadScript(`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`);
  await new Promise<void>((resolve) => window.kakao.maps.load(resolve));
}

export async function loadDaumPostcode(): Promise<void> {
  await loadScript('//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js');
}
