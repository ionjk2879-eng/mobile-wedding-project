import React, { useState, useRef } from 'react';
import { InvitationData } from '../../types';
import { PreviewOverlay } from '../../hooks/usePreviewPopup';

interface PreviewProps { data: InvitationData; }

const Interview: React.FC<PreviewProps> = React.memo(({ data }) => {
  const qaList = data.interview || [];
  const [open, setOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';

  if (data.isInterviewEnabled === false || qaList.length === 0) return null;

  const storyLabel = isEn ? 'Our Story' : isJa ? '二人のストーリー' : '두 사람에게 물어본 이야기';

  return (
    <section className="interview-section section" style={{ fontFamily: data.fontFamily }} ref={sectionRef} aria-label="인터뷰">
      <h2>INTERVIEW</h2>
      <p className="section-sub">{storyLabel}</p>

      <button type="button" className="pf-open-btn" onClick={() => setOpen(true)}>
        {isEn ? 'Read Interview' : isJa ? 'インタビューを見る' : '인터뷰 보기'}
      </button>

      <PreviewOverlay open={open} onClose={() => setOpen(false)} anchorRef={sectionRef} title={storyLabel}>
        <div className="itv-content">
          {qaList.map((qa, index) => (
            <div key={qa.id} className="interview-qa">
              <div className="interview-q">
                <span className="q-badge">Q{index + 1}</span>
                <span className="q-text">{qa.question || '질문을 입력하세요'}</span>
              </div>
              <div className="interview-a-box groom-box">
                <span className="a-name">{data.groomName || '신랑'}</span>
                <p>{qa.groomAnswer || '-'}</p>
              </div>
              <div className="interview-a-box bride-box">
                <span className="a-name">{data.brideName || '신부'}</span>
                <p>{qa.brideAnswer || '-'}</p>
              </div>
            </div>
          ))}
        </div>
      </PreviewOverlay>

    </section>
  );
}, (prev, next) => prev.data.interview === next.data.interview && prev.data.isInterviewEnabled === next.data.isInterviewEnabled && prev.data.language === next.data.language && prev.data.fontFamily === next.data.fontFamily && prev.data.groomName === next.data.groomName && prev.data.brideName === next.data.brideName);

export default Interview;
