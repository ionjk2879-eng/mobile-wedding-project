import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { InvitationData } from '../types';
import InvitationView from '../components/Preview/InvitationView';
import ToastContainer from '../components/Toast';
import { ScrollRootContext } from '../components/Preview/ScrollReveal';
import { loadFont } from '../utils/loadFont';
import { loadInvitationPublic } from '../services/publicLoad';
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

const ViewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
  const anniversaryMode = data.isPaid && searchParams.get('mode') === 'anniversary';

  return (
    <div className="view-container" style={{ fontFamily: data.fontFamily }}>
      <ToastContainer />
      <div className={`invitation-page theme-${data.theme || 'blush'}`} style={{ fontSize: getBaseFontSize(), ...(data.customBgColor ? { '--wedding-bg': data.customBgColor } as React.CSSProperties : {}), ...(data.customAccentColor ? { '--wedding-main': data.customAccentColor, '--wedding-accent': data.customAccentColor } as React.CSSProperties : {}) }}>
        <ScrollRootContext.Provider value={null}>
          <InvitationView data={data} showOpening shareEnabled={!!data.isPaid} forceAnniversaryMode={anniversaryMode} />
        </ScrollRootContext.Provider>
        {showWatermark && <Watermark />}
        {showWatermark && <PromoSection />}
      </div>

      <style>{`
        .view-container { width: 100%; min-height: 100svh; background: #EBEBEB; display: flex; justify-content: center; overflow-anchor: none; }
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