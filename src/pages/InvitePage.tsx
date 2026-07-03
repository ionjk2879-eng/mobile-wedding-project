import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { lookupInviteCode, InviteLookupResult } from '../services/guestService';
import ViewPage from './ViewPage';

const SITE_ORIGIN = 'https://sonett.kr';

const InviteFallback: React.FC = () => (
  <div
    className="view-error"
    role="alert"
    style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", color: '#6B7280', textAlign: 'center', padding: 20, boxSizing: 'border-box' }}
  >
    <h2 style={{ color: '#1F2937', marginBottom: 8 }}>유효하지 않은 초대 링크입니다</h2>
    <p>링크를 다시 확인해주세요.</p>
    <a href={SITE_ORIGIN} style={{ marginTop: 20, display: 'inline-block', color: '#B07A8E', fontWeight: 600, textDecoration: 'none' }}>
      Sonett 홈으로
    </a>
  </div>
);

// code가 없거나(/invite 단독 접근) 유효하지 않으면 슬러그를 알 수 없어 특정 청첩장을 보여줄 수 없으므로,
// 안전한 안내 화면으로 폴백한다. code가 유효하면 해당 청첩장을 개인화된 오프닝 문구로 렌더링한다.
const InvitePage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [result, setResult] = useState<InviteLookupResult | null | 'loading'>('loading');

  useEffect(() => {
    if (!code) { setResult(null); return; }
    let cancelled = false;
    setResult('loading');
    lookupInviteCode(code).then((r) => { if (!cancelled) setResult(r); });
    return () => { cancelled = true; };
  }, [code]);

  if (result === 'loading') return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", color: '#9CA3AF' }}>
      <p>불러오는 중...</p>
    </div>
  );

  if (!result) return <InviteFallback />;

  return <ViewPage slugOverride={result.slug} guestName={result.name} guestRelation={result.relation} />;
};

export default InvitePage;
