import { apiFetch, setSession, clearSession, getStoredUser, type AuthUser } from './api';

type AuthListener = (user: AuthUser | null) => void;
const listeners: AuthListener[] = [];

function notify(user: AuthUser | null): void {
  listeners.forEach(fn => fn(user));
}

export function getCurrentUser(): AuthUser | null {
  return getStoredUser();
}

export function onAuthChanged(callback: AuthListener): () => void {
  listeners.push(callback);
  // Use queueMicrotask so the callback fires after Zustand store is fully initialized
  queueMicrotask(() => callback(getStoredUser()));
  return () => {
    const i = listeners.indexOf(callback);
    if (i !== -1) listeners.splice(i, 1);
  };
}

function encodeState(data: object): string {
  return btoa(JSON.stringify(data));
}

export function decodeState(encoded: string): { provider: 'google' | 'kakao' | 'naver' | 'kakao-calendar'; returnUrl: string; nonce: string; slug?: string } {
  return JSON.parse(atob(encoded));
}

async function handleAuthResult(result: { token: string; uid: string; name: string; email: string; photo: string }): Promise<void> {
  const user: AuthUser = { uid: result.uid, name: result.name, email: result.email, photo: result.photo };
  setSession(result.token, user);
  notify(user);
}

export const signOut = (): void => {
  clearSession();
  notify(null);
};

export const deleteAccount = async (): Promise<void> => {
  clearSession();
  notify(null);
};

// Google
export const initiateGoogleLogin = (returnUrl = '/manage'): void => {
  const clientId = '584343413565-h8ukuqrrnravndmocei20kr9t3inkkjn.apps.googleusercontent.com';
  const nonce = crypto.randomUUID();
  sessionStorage.setItem('oauth_nonce', nonce);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state: encodeState({ provider: 'google', returnUrl, nonce }),
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

export const signInWithGoogle = initiateGoogleLogin;

// Kakao
export const initiateKakaoLogin = (returnUrl = '/manage'): void => {
  const nonce = crypto.randomUUID();
  sessionStorage.setItem('oauth_nonce', nonce);
  const params = new URLSearchParams({
    client_id: '7edc2c74f346bfad9c9006cd26d04e3c',
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: 'code',
    state: encodeState({ provider: 'kakao', returnUrl, nonce }),
  });
  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params}`;
};

// 하객이 청첩장 공유 메시지의 "일정 등록" 버튼으로 들어와 본인 톡캘린더에 예식 일정을
// 바로 추가하는 흐름 — 청첩장 소유자 로그인(위 initiateKakaoLogin)과는 별개의 1회성 동작.
export const initiateKakaoCalendarLogin = (slug: string): void => {
  const nonce = crypto.randomUUID();
  sessionStorage.setItem('oauth_nonce', nonce);
  const params = new URLSearchParams({
    client_id: '7edc2c74f346bfad9c9006cd26d04e3c',
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: 'code',
    scope: 'talk_calendar',
    state: encodeState({ provider: 'kakao-calendar', returnUrl: '', nonce, slug }),
  });
  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params}`;
};

export const addWeddingToKakaoCalendar = async (code: string, redirectUri: string, slug: string): Promise<{ ok: boolean; message: string }> => {
  return apiFetch('/api/calendar/kakao-add', {
    method: 'POST',
    body: JSON.stringify({ code, redirectUri, slug }),
  }) as Promise<{ ok: boolean; message: string }>;
};

// Naver
export const initiateNaverLogin = (returnUrl = '/manage'): void => {
  const nonce = crypto.randomUUID();
  sessionStorage.setItem('oauth_nonce', nonce);
  const params = new URLSearchParams({
    client_id: 'IIdKMJXjUkWkNqPv92KX',
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: 'code',
    state: encodeState({ provider: 'naver', returnUrl, nonce }),
  });
  window.location.href = `https://nid.naver.com/oauth2.0/authorize?${params}`;
};

export const exchangeCodeForToken = async (
  provider: 'google' | 'kakao' | 'naver',
  code: string,
  state?: string,
): Promise<{ token: string; uid: string; name: string; email: string; photo: string }> => {
  return apiFetch(`/api/auth/${provider}`, {
    method: 'POST',
    body: JSON.stringify({ code, redirectUri: `${window.location.origin}/auth/callback`, ...(state && { state }) }),
  }) as Promise<{ token: string; uid: string; name: string; email: string; photo: string }>;
};

export const signInWithSocialToken = async (result: { token: string; uid: string; name: string; email: string; photo: string }): Promise<void> => {
  await handleAuthResult(result);
};
