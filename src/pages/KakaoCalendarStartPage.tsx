import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { initiateKakaoCalendarLogin } from '../services/auth';

// 청첩장 공유 메시지의 "일정 등록" 버튼이 여는 페이지. 진입하자마자 카카오 로그인
// (talk_calendar 동의)으로 넘어가고, 돌아온 뒤 결과는 AuthCallbackPage가 보여준다.
const KakaoCalendarStartPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    if (slug) initiateKakaoCalendarLogin(slug);
  }, [slug]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", color: '#9CA3AF' }}>
      <p>카카오 로그인으로 이동 중...</p>
    </div>
  );
};

export default KakaoCalendarStartPage;
