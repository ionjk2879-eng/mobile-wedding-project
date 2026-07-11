import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForToken, signInWithSocialToken, decodeState, addWeddingToKakaoCalendar } from '../services/auth';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  // 하객이 "일정 등록" 버튼으로 들어온 톡캘린더 등록 흐름은 청첩장 소유자 로그인과
  // 화면이 달라야 해서(리디렉션 없이 결과만 보여줌) 별도 상태로 분리한다.
  const [calendarResult, setCalendarResult] = useState<{ ok: boolean; message: string; slug: string } | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const stateStr = searchParams.get('state');

    if (!code || !stateStr) {
      setError('로그인 정보가 유효하지 않습니다.');
      return;
    }

    let parsed: { provider: 'google' | 'kakao' | 'naver' | 'kakao-calendar'; returnUrl: string; nonce: string; slug?: string };
    try {
      parsed = decodeState(stateStr);
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

    if (parsed.provider === 'kakao-calendar') {
      const slug = parsed.slug || '';
      (async () => {
        try {
          const result = await addWeddingToKakaoCalendar(code, `${window.location.origin}/auth/callback`, slug);
          setCalendarResult({ ok: result.ok, message: result.message, slug });
        } catch (e: any) {
          setCalendarResult({ ok: false, message: e?.message || '캘린더 등록에 실패했습니다.', slug });
        }
      })();
      return;
    }

    (async () => {
      try {
        const result = await exchangeCodeForToken(parsed.provider as 'google' | 'kakao' | 'naver', code, stateStr);
        await signInWithSocialToken(result);
        navigate(parsed.returnUrl || '/manage', { replace: true });
      } catch (e: any) {
        setError(e?.message || '로그인 처리에 실패했습니다. 다시 시도해주세요.');
      }
    })();
  }, [searchParams, navigate]);

  if (calendarResult) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", gap: '16px', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: calendarResult.ok ? '#1F2937' : '#DC2626', fontSize: '1rem', lineHeight: 1.6 }}>{calendarResult.message}</p>
        {!calendarResult.ok && calendarResult.slug && (
          <a
            href={`${window.location.origin}/calendar/${calendarResult.slug}`}
            style={{ color: '#B07A8E', fontSize: '0.85rem', textDecoration: 'underline' }}
          >
            대신 기본 캘린더 앱으로 등록하기
          </a>
        )}
        <button
          onClick={() => navigate(calendarResult.slug ? `/${calendarResult.slug}` : '/', { replace: true })}
          style={{ background: '#B07A8E', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          청첩장으로 돌아가기
        </button>
      </div>
    );
  }

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
      <p>처리 중...</p>
    </div>
  );
};

export default AuthCallbackPage;
