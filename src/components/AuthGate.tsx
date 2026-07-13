import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { signInWithGoogle, initiateKakaoLogin, initiateNaverLogin } from '../services/auth';

function isInAppBrowser(): boolean {
  const ua = navigator.userAgent;
  if (/KAKAOTALK|kakaotalk/i.test(ua)) return true;
  if (/NaverApp/i.test(ua)) return true;
  if (/Instagram|FBAN|FBAV/i.test(ua)) return true;
  if (/Line\//i.test(ua)) return true;
  if (/MicroMessenger/i.test(ua)) return true;
  if (/Android/.test(ua) && /wv\b/.test(ua)) return true;
  if (/iPhone|iPad|iPod/.test(ua) && /AppleWebKit/.test(ua) && !/Safari/.test(ua)) return true;
  return false;
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const inApp = isInAppBrowser();
  const android = isAndroid();

  if (import.meta.env.DEV) return <>{children}</>;

  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", color: '#9CA3AF' }}>
        <p>인증 확인 중...</p>
      </div>
    );
  }

  if (!user) {
    // Android 인앱 브라우저: 사용자가 직접 탭하는 <a> 태그로 브라우저 선택 유도
    // (window.location.href 방식은 KakaoTalk WebView에서 차단됨)
    if (inApp && android) {
      const currentUrl = window.location.href;
      const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`;
      return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", gap: '16px', textAlign: 'center', padding: '0 32px', boxSizing: 'border-box' }}>
          <h1 style={{ color: '#D4A5C6', letterSpacing: '3px', margin: 0, fontSize: '2rem' }}>Sonett</h1>
          <p style={{ color: '#374151', margin: 0, fontSize: '1rem', fontWeight: 600 }}>외부 브라우저에서 열어주세요</p>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
            아래 버튼을 눌러 브라우저를 선택하면<br />Google 로그인도 사용할 수 있습니다.
          </p>
          <a
            href={intentUrl}
            style={{ display: 'inline-block', background: '#B07A8E', color: 'white', textDecoration: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit', marginTop: '8px' }}
          >
            브라우저 선택하여 열기
          </a>
          <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.75rem' }}>Chrome · 삼성 인터넷 · 네이버 등 선택 가능</p>
        </div>
      );
    }

    // iOS 인앱 브라우저: 수동 안내 배너 + 로그인 버튼
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", gap: '20px', textAlign: 'center' }}>
        {inApp && !android && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#FFF7ED', borderBottom: '1px solid #FED7AA', padding: '12px 20px', fontSize: '0.8rem', color: '#92400E', lineHeight: 1.5, zIndex: 100 }}>
            <strong>외부 브라우저로 열어주세요</strong><br />
            화면 하단 <strong>···</strong> 메뉴 → <strong>기본 브라우저로 열기</strong>를 눌러야 Google 로그인이 가능합니다.
          </div>
        )}
        <h1 style={{ color: '#D4A5C6', letterSpacing: '3px', margin: 0, fontSize: '2rem' }}>Sonett</h1>
        <p style={{ color: '#6B7280', margin: 0 }}>소네트 모바일 청첩장</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', width: '280px' }}>
          <button
            onClick={() => initiateKakaoLogin()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#FEE500', color: '#191919', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C5.03 2 1 5.13 1 8.97c0 2.48 1.65 4.66 4.13 5.88-.18.67-.66 2.42-.75 2.8-.12.47.17.46.36.34.15-.1 2.37-1.61 3.33-2.27.3.04.61.06.93.06 4.97 0 9-3.13 9-6.97C19 5.13 14.97 2 10 2Z" fill="#191919"/></svg>
            카카오로 로그인
          </button>
          <button
            onClick={() => initiateNaverLogin()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#03C75A', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13.56 10.7 6.15 3H3v14h3.44V9.3L13.85 17H17V3h-3.44v7.7Z" fill="white"/></svg>
            네이버로 로그인
          </button>
          <button
            onClick={() => inApp ? undefined : signInWithGoogle()}
            disabled={inApp && !android}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: inApp ? '#9CA3AF' : '#4285F4', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: inApp ? 'not-allowed' : 'pointer', fontFamily: 'inherit', width: '100%', opacity: inApp ? 0.7 : 1 }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M19.6 10.23c0-.68-.06-1.36-.17-2.01H10v3.8h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.73 2.98-4.3 2.98-7.31Z" fill="white"/><path d="M10 20c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.58-4.12H1.08v2.58A9.99 9.99 0 0 0 10 20Z" fill="white"/><path d="M4.42 11.9a6.02 6.02 0 0 1 0-3.82V5.5H1.08a10 10 0 0 0 0 8.98l3.34-2.58Z" fill="white"/><path d="M10 3.96c1.47 0 2.78.5 3.82 1.5l2.86-2.87A10 10 0 0 0 1.08 5.5l3.34 2.58c.78-2.36 2.98-4.12 5.58-4.12Z" fill="white"/></svg>
            Google로 로그인
          </button>
          {inApp && !android && (
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#9CA3AF', lineHeight: 1.5 }}>
              Google 로그인은 외부 브라우저에서만 가능합니다.<br />카카오·네이버 로그인을 이용해주세요.
            </p>
          )}
        </div>
        <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '20px', lineHeight: 1.6 }}>
          로그인 시 <Link to="/terms" style={{ color: '#6B7280', textDecoration: 'underline' }}>이용약관</Link> 및 <Link to="/privacy" style={{ color: '#6B7280', textDecoration: 'underline', fontWeight: 700 }}>개인정보처리방침</Link>에 동의하게 됩니다.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
