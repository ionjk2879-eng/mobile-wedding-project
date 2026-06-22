import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { loadInvitation } from '../firebase';
import { InvitationData } from '../types';
import InvitationView from '../components/Preview/InvitationView';
import { ScrollRootContext } from '../components/Preview/ScrollReveal';

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

  if (loading) return <div className="view-loading"><p>청첩장을 불러오는 중...</p></div>;
  if (error || !data) return <div className="view-error"><h2>청첩장을 찾을 수 없습니다</h2><p>주소를 다시 확인해주세요.</p></div>;

  const getBaseFontSize = () => {
    switch (data.fontSize) { case 'small': return '14px'; case 'large': return '19px'; default: return '16.5px'; }
  };

  return (
    <div className="view-container" style={{ fontFamily: data.fontFamily }} ref={scrollRef}>
      <div className={`invitation-page theme-${data.theme || 'blush'}`} style={{ fontSize: getBaseFontSize() }}>
        <ScrollRootContext.Provider value={scrollRef}>
          <InvitationView data={data} />
        </ScrollRootContext.Provider>
      </div>

      <style>{`
        .view-container { width: 100vw; min-height: 100vh; background: #F0F2F5; display: flex; justify-content: center; overflow-y: scroll; }
        .view-container .invitation-page { width: 100%; max-width: 480px; background-color: var(--wedding-bg); min-height: 100%; }
        .view-loading, .view-error { width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Pretendard', sans-serif; color: #6B7280; }
        .view-error h2 { color: #1F2937; margin-bottom: 8px; }
      `}</style>
    </div>
  );
};

export default ViewPage;
