import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { InvitationData } from '../types';
import InvitationView from '../components/Preview/InvitationView';
import ToastContainer from '../components/Toast';
import { ScrollRootContext } from '../components/Preview/ScrollReveal';
import { loadFont } from '../utils/loadFont';
import { loadInvitationPublic } from '../services/publicLoad';
import '../styles/effects.css';

const SITE_ORIGIN = 'https://sonett.ionjk2879.workers.dev';

const Watermark: React.FC = () => (
  <a href={SITE_ORIGIN} target="_blank" rel="noopener noreferrer" className="wm-banner">
    <span className="wm-logo">Sonett</span>
    <span className="wm-text">소네트로 만든 모바일 청첩장</span>
    <span className="wm-cta">나도 만들기 &rsaquo;</span>
  </a>
);

const ViewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  if (loading) return null;
  if (error || !data) return <div className="view-error" role="alert"><h2>청첩장을 찾을 수 없습니다</h2><p>주소를 다시 확인해주세요.</p></div>;

  const isExpired = data.expiresAt && new Date(data.expiresAt) < new Date();
  if (isExpired) return (
    <div className="view-error" role="alert">
      <p className="view-expired-icon">🕊️</p>
      <h2>보관 기간이 종료되었습니다</h2>
      <p>이 청첩장의 보관 기간이 만료되었습니다.<br />청첩장 제작자에게 문의해 주세요.</p>
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

  return (
    <div className="view-container" style={{ fontFamily: data.fontFamily }} ref={scrollRef}>
      <ToastContainer />
      <div className={`invitation-page theme-${data.theme || 'blush'}`} style={{ fontSize: getBaseFontSize(), ...(data.customBgColor ? { '--wedding-bg': data.customBgColor } as React.CSSProperties : {}), ...(data.customAccentColor ? { '--wedding-main': data.customAccentColor, '--wedding-accent': data.customAccentColor } as React.CSSProperties : {}) }}>
        <ScrollRootContext.Provider value={scrollRef}>
          <InvitationView data={data} showOpening shareEnabled={!!data.isPaid} />
        </ScrollRootContext.Provider>
        {showWatermark && <Watermark />}
      </div>

      <style>{`
        .view-container { width: 100vw; height: 100vh; background: #ffffff; display: flex; justify-content: center; overflow-y: scroll; }
        .view-container .invitation-page { width: 100%; max-width: 430px; background-color: var(--wedding-bg); min-height: 100%; }
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
