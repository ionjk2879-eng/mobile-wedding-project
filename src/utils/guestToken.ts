const STORAGE_KEY = 'sonett_rsvp_token';

// RSVP를 공개 링크(하객이 이름을 직접 입력)로 제출할 때, 같은 브라우저의 재제출은
// "수정"으로 취급하고 다른 브라우저에서 들어온 동명이인은 "별도 응답"으로 구분하기 위한
// 브라우저 고정 토큰. localStorage를 못 쓰는 환경(프라이빗 모드 등)에서는 빈 문자열을
// 반환해 기존 이름 기반 동작으로 자연스럽게 폴백한다.
export function getOrCreateGuestToken(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    localStorage.setItem(STORAGE_KEY, token);
    return token;
  } catch {
    return '';
  }
}
