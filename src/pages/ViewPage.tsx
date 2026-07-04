import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Heart, FileHeart } from 'lucide-react';
import { InvitationData, GuestRelation } from '../types';
import InvitationView from '../components/Preview/InvitationView';
import ToastContainer from '../components/Toast';
import { ScrollRootContext } from '../components/Preview/ScrollReveal';
import { loadFont } from '../utils/loadFont';
import { loadInvitationPublic } from '../services/publicLoad';
import useAuthStore from '../stores/useAuthStore';
import '../styles/effects.css';

const SITE_ORIGIN = 'https://sonett.kr';

const Watermark: React.FC = () => (
  <a href={SITE_ORIGIN} target="_blank" rel="noopener noreferrer" className="wm-banner">
    <span className="wm-logo">Sonett</span>
    <span className="wm-text">지금 바로 모바일 청첩장</span>
    <span className="wm-cta">지금 만들기 &rsaquo;</span>
  </a>
);

const PromoSection: React.FC = () => (
  <div className="promo-section">
    <p className="promo-brand">Sonett</p>
    <p className="promo-title">나만의 모바일 청첩장</p>
    <p className="promo-desc">워터마크 없이, 더 아름답게.<br />지금 Sonett에서 직접 만들어보세요.</p>
    <a href={SITE_ORIGIN} target="_blank" rel="noopener noreferrer" className="promo-cta">
      워터마크 제거하기 &rsaquo;
    </a>
  </div>
);

interface ViewPageProps {
  slugOverride?: string;
  guestName?: string;
  guestRelation?: GuestRelation;
  guestCode?: string;
  guestMessageIndex?: number | null;
}

const ViewPage: React.FC<ViewPageProps> = ({ slugOverride, guestName, guestRelation, guestCode, guestMessageIndex }) => {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugOverride || slugParam;
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // 세션 동안만 유지되는 임시 미리보기 전환 — 새로고침하면 기본값(URL 파라미터 또는
  // 서버가 계산한 예식일+24시간 경과 여부)으로 되돌아간다.
  const [modeOverride, setModeOverride] = useState<'invitation' | 'anniversary' | null>(null);
  const authUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!slug) return;
    loadInvitationPublic(slug).then(d => {
      if (d) {
        setData(d);
        loadFont(d.fontFamily);
      }
      else setError(true);
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", color: '#9CA3AF' }}>
      <p>불러오는 중...</p>
    </div>
  );
  if (error || !data) return <div className="view-error" role="alert"><h2>청첩장을 찾을 수 없습니다</h2><p>주소를 다시 확인해주세요.</p></div>;

  const isExpired = !data.isPaid && data.expiresAt && new Date(data.expiresAt) < new Date();
  if (isExpired) return (
    <div className="view-error" role="alert">
      <p className="view-expired-icon">⏰</p>
      <h2>공유 기간이 만료되었습니다</h2>
      <p>이 청첩장의 공유 기간이 만료되었습니다.<br />새로운 청첩장 시작에 대해 문의해주세요.</p>
      <a href={SITE_ORIGIN} className="view-expired-link">Sonett에서 청첩장 만들기</a>
      <style>{`
        .view-expired-icon { font-size: 2.5rem; margin: 0 0 12px; }
        .view-expired-link {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 28px;
          background: #B07A8E;
          color: white;
          border-radius: 30px;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'Pretendard', sans-serif;
        }
      `}</style>
    </div>
  );

  const getBaseFontSize = () => {
    switch (data.fontSize) { case 'small': return '13px'; case 'large': return '16px'; default: return '14.5px'; }
  };

  const showWatermark = !data.isPaid;

  // 기념일 모드 전환 로직.
  // - ?mode= URL 파라미터가 있으면(공유 링크 등에서 명시적으로 강제) 그 값을 기본으로 삼는다.
  // - 없으면 서버가 계산해 내려준 예식일+24시간 경과 여부(isPastAnniversaryThreshold)로 기본값을 정한다.
  // - modeOverride는 화면에서 토글 버튼을 눌렀을 때만 채워지는 세션 한정 임시 상태다.
  const canAnniversaryMode = !!data.isPaid;
  const isPastAnniversaryThreshold = !!data.isPastAnniversaryThreshold;
  // ownerUid는 공개 응답에도 항상 포함되는 값이라(민감 정보 아님) 클라이언트에서 비교해도 안전하다 —
  // 관리자 API들처럼 서버가 매번 로그인 헤더로 소유권을 재확인하는 대신, 이미 내려온 값과 현재
  // 로그인 사용자를 비교하는 방식. 실제 데이터 마스킹(계좌/RSVP)은 이 값과 무관하게 서버가
  // Authorization 헤더 기준으로 별도 판단하므로, 여기서의 비교는 토글 버튼 노출 여부에만 영향을 준다.
  const isOwner = !!authUser && !!data.ownerUid && authUser.uid === data.ownerUid;

  const urlMode = searchParams.get('mode');
  const forcedMode: 'invitation' | 'anniversary' | null = urlMode === 'anniversary' ? 'anniversary' : urlMode === 'invitation' ? 'invitation' : null;
  const defaultMode: 'invitation' | 'anniversary' = isPastAnniversaryThreshold ? 'anniversary' : 'invitation';
  const currentMode: 'invitation' | 'anniversary' = canAnniversaryMode ? (modeOverride ?? forcedMode ?? defaultMode) : 'invitation';
  const anniversaryMode = currentMode === 'anniversary';

  // 예식일+24시간 이전엔 소유자만 토글이 보인다(자기 청첩장 미리보기 목적).
  // 이후엔 누구나 토글로 오갈 수 있다.
  const showModeToggle = canAnniversaryMode && (isPastAnniversaryThreshold || isOwner);
  // 예식 전엔 기본이 청첩장 모드라서, 되돌아가는 방향은 "다른 모드로 전환"이 아니라
  // "미리보기 종료" 뉘앙스가 자연스럽다. 예식 후엔 둘 다 정식 모드라 "OO 모드로 보기"로 대칭.
  const modeToggleLabel = !isPastAnniversaryThreshold
    ? (currentMode === 'invitation' ? '기념일 모드 미리보기' : '미리보기 종료')
    : (currentMode === 'anniversary' ? '청첩장 모드로 보기' : '기념일 모드로 보기');
  const handleToggleMode = () => setModeOverride(currentMode === 'anniversary' ? 'invitation' : 'anniversary');

  return (
    <div className="view-container" style={{ fontFamily: data.fontFamily }}>
      <ToastContainer />
      <div className={`invitation-page theme-${data.theme || 'blush'}`} style={{ fontSize: getBaseFontSize(), ...(data.customBgColor ? { '--wedding-bg': data.customBgColor } as React.CSSProperties : {}), ...(data.customAccentColor ? { '--wedding-main': data.customAccentColor, '--wedding-accent': data.customAccentColor } as React.CSSProperties : {}) }}>
        <ScrollRootContext.Provider value={null}>
          <InvitationView data={data} showOpening shareEnabled={!!data.isPaid} forceAnniversaryMode={anniversaryMode} guestName={guestName} guestRelation={guestRelation} guestCode={guestCode} guestMessageIndex={guestMessageIndex} />
        </ScrollRootContext.Provider>
        {showWatermark && <Watermark />}
        {showWatermark && <PromoSection />}
      </div>

      {showModeToggle && (
        <button type="button" className="view-mode-toggle-fab" onClick={handleToggleMode}>
          {currentMode === 'anniversary' ? <FileHeart size={16} /> : <Heart size={16} />}
          {modeToggleLabel}
        </button>
      )}

      <style>{`
        .view-container { width: 100%; min-height: 100svh; background: #EBEBEB; display: flex; justify-content: center; overflow-anchor: none; }
        .view-mode-toggle-fab {
          position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%); z-index: 500;
          display: flex; align-items: center; gap: 6px;
          padding: 10px 18px; border: none; border-radius: 30px;
          background: rgba(31,41,55,0.88); color: white; backdrop-filter: blur(6px);
          font-family: 'Pretendard', sans-serif; font-size: 0.82rem; font-weight: 600;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18); cursor: pointer; transition: opacity 0.2s;
        }
        .view-mode-toggle-fab:hover { opacity: 0.85; }
        .view-container .invitation-page { width: 100%; max-width: 430px; background-color: var(--wedding-bg); min-height: 100svh; overflow-anchor: none; }
        .view-loading, .view-error { width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Pretendard', sans-serif; color: #6B7280; text-align: center; padding: 20px; box-sizing: border-box; }
        .view-error h2 { color: #1F2937; margin-bottom: 8px; }

        .wm-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
          color: white;
          text-decoration: none;
          font-family: 'Pretendard', sans-serif;
          transition: opacity 0.2s;
        }
        .wm-banner:hover { opacity: 0.9; }
        .wm-logo {
          font-size: 0.9em;
          font-weight: 700;
          letter-spacing: 1px;
          color: #D4A5C6;
        }
        .wm-text {
          font-size: 0.75em;
          color: rgba(255,255,255,0.7);
        }
        .wm-cta {
          font-size: 0.75em;
          font-weight: 600;
          color: #D4A5C6;
          margin-left: 4px;
        }

        .promo-section {
          padding: 36px 24px 40px;
          text-align: center;
          background: linear-gradient(180deg, #F9F3F6 0%, #FDF6F9 100%);
          border-top: 1px solid rgba(176,122,142,0.15);
          font-family: 'Pretendard', sans-serif;
        }
        .promo-brand {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 3px;
          color: #B07A8E;
          margin: 0 0 8px;
        }
        .promo-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1F2937;
          margin: 0 0 10px;
        }
        .promo-desc {
          font-size: 0.82rem;
          color: #6B7280;
          line-height: 1.65;
          margin: 0 0 20px;
        }
        .promo-cta {
          display: inline-block;
          padding: 11px 28px;
          background: #B07A8E;
          color: white;
          border-radius: 30px;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: opacity 0.2s;
        }
        .promo-cta:hover { opacity: 0.85; }

        @media (max-width: 480px) {
          .view-container { background: var(--wedding-bg); }
          .view-container .invitation-page { max-width: 100%; }
          .wm-banner { padding: 12px 16px; gap: 6px; }
          .wm-logo { font-size: 0.82em; }
          .wm-text { font-size: 0.7em; }
          .wm-cta { font-size: 0.7em; }
        }
      `}</style>
    </div>
  );
};

export default ViewPage;