import {
  getAuth,
  signInWithPopup,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  updateProfile,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  deleteUser,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { app } from './index';

let _auth: Auth | null = null;
const getAuthInstance = (): Auth => {
  if (!_auth) _auth = getAuth(app);
  return _auth;
};

const API_BASE = import.meta.env.VITE_FUNCTIONS_URL
  || 'https://sonett.ionjk2879.workers.dev';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = () => signInWithPopup(getAuthInstance(), googleProvider);

export const initiateKakaoLogin = (returnUrl: string = '/manage') => {
  const nonce = crypto.randomUUID();
  const state = JSON.stringify({ provider: 'kakao', returnUrl, nonce });
  sessionStorage.setItem('oauth_nonce', nonce);

  const params = new URLSearchParams({
    client_id: '7edc2c74f346bfad9c9006cd26d04e3c',
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: 'code',
    state,
  });

  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params}`;
};

export const initiateNaverLogin = (returnUrl: string = '/manage') => {
  const nonce = crypto.randomUUID();
  const state = JSON.stringify({ provider: 'naver', returnUrl, nonce });
  sessionStorage.setItem('oauth_nonce', nonce);

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_NAVER_CLIENT_ID || '',
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: 'code',
    state,
  });

  window.location.href = `https://nid.naver.com/oauth2.0/authorize?${params}`;
};

export interface SocialAuthResult {
  customToken: string;
  displayName: string;
  photoURL: string;
  email: string;
}

export const exchangeCodeForToken = async (
  provider: 'kakao' | 'naver',
  code: string,
  state?: string,
): Promise<SocialAuthResult> => {
  const endpoint = provider === 'kakao' ? 'api/auth/kakao' : 'api/auth/naver';
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      redirectUri: `${window.location.origin}/auth/callback`,
      ...(state && { state }),
    }),
  });

  if (!res.ok) throw new Error('로그인 처리에 실패했습니다.');
  return await res.json();
};

export const signInWithSocialToken = async (result: SocialAuthResult) => {
  const credential = await firebaseSignInWithCustomToken(getAuthInstance(), result.customToken);
  if (result.displayName || result.photoURL) {
    await updateProfile(credential.user, {
      displayName: result.displayName || null,
      photoURL: result.photoURL || null,
    });
  }
  return credential;
};

export const signOut = () => firebaseSignOut(getAuthInstance());

export const getCurrentUser = (): User | null => getAuthInstance().currentUser;

export const deleteAccount = async () => {
  const user = getAuthInstance().currentUser;
  if (user) await deleteUser(user);
};

export const onAuthChanged = (callback: (user: User | null) => void) =>
  onAuthStateChanged(getAuthInstance(), callback);
