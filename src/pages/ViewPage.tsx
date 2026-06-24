import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { loadInvitation } from '../firebase';
import { InvitationData } from '../types';
import InvitationView from '../components/Preview/InvitationView';
import ToastContainer from '../components/Toast';
import { ScrollRootContext } from '../components/Preview/ScrollReveal';
import '../styles/effects.css';

const ViewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    loadInvitation(slug).then(d => {
      if (d) setData(d);
      else setError(true);
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="view-loading" role="status" aria-live="polite"><p>청첩장을 불러오는 중...</p></div>;
  if (error || !data) return <div className="view-error" role="alert"><h2>청첩장을 찾을 수 없습니다</h2><p>주소를 다시 확인해주세요.</p></div>;

  const getBaseFontSize = () => {
    switch (data.fontSize) { case 'small': return '12px'; case 'large': return '16px'; default: return '13px'; }
  };

  return (
    <div className="view-container" style={{ fontFamily: data.fontFamily }} ref={scrollRef}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo:wght@400;700&family=Dancing+Script&display=swap" rel="stylesheet" />
      <ToastContainer />
      <div className={`invitation-page theme-${data.theme || 'blush'}`} style={{ fontSize: getBaseFontSize(), ...(data.customBgColor ? { '--wedding-bg': data.customBgColor } as React.CSSProperties : {}), ...(data.customAccentColor ? { '--wedding-main': data.customAccentColor, '--wedding-accent': data.customAccentColor } as React.CSSProperties : {}) }}>
        <ScrollRootContext.Provider value={scrollRef}>
          <InvitationView data={data} showOpening />
        </ScrollRootContext.Provider>
      </div>

      <style>{`
        .view-container { width: 100vw; min-height: 100vh; background: #ffffff; display: flex; justify-content: center; overflow-y: scroll; }
        .view-container .invitation-page { width: 100%; max-width: 480px; background-color: var(--wedding-bg); min-height: 100%; }
        .view-loading, .view-error { width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Pretendard', sans-serif; color: #6B7280; text-align: center; padding: 20px; box-sizing: border-box; }
        .view-error h2 { color: #1F2937; margin-bottom: 8px; }
        @media (max-width: 480px) {
          .view-container { background: var(--wedding-bg); }
          .view-container .invitation-page { max-width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ViewPage;
