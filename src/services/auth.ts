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

export function decodeState(encoded: string): { provider: 'google' | 'kakao' | 'naver'; returnUrl: string; nonce: string } {
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
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) { alert('Google 로그인이 설정되지 않았습니다.'); return; }
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
