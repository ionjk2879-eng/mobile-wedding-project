import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForToken, signInWithSocialToken } from '../services/auth';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const stateStr = searchParams.get('state');

    if (!code || !stateStr) {
      setError('로그인 정보가 유효하지 않습니다.');
      return;
    }

    let parsed: { provider: 'kakao' | 'naver'; returnUrl: string; nonce: string };
    try {
      parsed = JSON.parse(stateStr);
    } catch {
      setError('로그인 상태 정보가 올바르지 않습니다.');
      return;
    }

    const savedNonce = sessionStorage.getItem('oauth_nonce');
    if (!savedNonce || savedNonce !== parsed.nonce) {
      setError('보안 검증에 실패했습니다. 다시 시도해주세요.');
      return;
    }
    sessionStorage.removeItem('oauth_nonce');

    (async () => {
      try {
        const result = await exchangeCodeForToken(parsed.provider, code, stateStr);
        await signInWithSocialToken(result);
        navigate(parsed.returnUrl || '/manage', { replace: true });
      } catch {
        setError('로그인 처리에 실패했습니다. 다시 시도해주세요.');
      }
    })();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", gap: '16px' }}>
        <p style={{ color: '#DC2626', fontSize: '1rem' }}>{error}</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          style={{ background: '#B07A8E', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", color: '#9CA3AF' }}>
      <p>로그인 처리 중...</p>
    </div>
  );
};

export default AuthCallbackPage;
