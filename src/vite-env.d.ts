/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FB_SENDER_ID: string;
  readonly VITE_FB_APP_ID: string;
  readonly VITE_KAKAO_REST_API_KEY: string;
  readonly VITE_NAVER_CLIENT_ID: string;
  readonly VITE_FUNCTIONS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}