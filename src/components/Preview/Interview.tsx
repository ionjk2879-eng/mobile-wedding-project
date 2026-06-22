import React, { useState, useRef, useEffect } from 'react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Interview: React.FC<PreviewProps> = React.memo(({ data }) => {
  const qaList = data.interview || [];
  const [open, setOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!open || !sectionRef.current) return;
    const scrollParent = sectionRef.current.closest('.preview-content-scroll');
    if (scrollParent) {
      const rect = scrollParent.getBoundingClientRect();
      setPopupStyle({
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setPopupStyle({
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      });
    }
  }, [open]);

  if (qaList.length === 0) return null;

  return (
    <section className="interview-section section" style={{ fontFamily: data.fontFamily }} ref={sectionRef}>
      <h2>INTERVIEW</h2>
      <p className="section-sub">두 사람에게 물어본 이야기</p>

      <button type="button" className="interview-open-btn" onClick={() => setOpen(true)}>
        인터뷰 보기
      </button>

      {open && (
        <div className="itv-popup-dim" style={popupStyle}>
          <div className="itv-popup">
            <button type="button" className="itv-popup-close" onClick={() => setOpen(false)}>×</button>
            <div className="itv-popup-scroll">
              <div className="itv-popup-top">
                <h3>INTERVIEW</h3>
                <p>두 사람에게 물어본 이야기</p>
              </div>
              <div className="itv-popup-content">
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
            </div>
          </div>
        </div>
      )}

      <style>{`
        .interview-section {
          background-color: transparent;
          padding: 80px 24px;
          position: relative;
          z-index: 2;
        }
        .interview-open-btn {
          display: inline-block;
          padding: 12px 32px;
          background: var(--wedding-main);
          border: none;
          border-radius: 30px;
          font-size: 0.9em;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 12px color-mix(in srgb, var(--wedding-main) 30%, transparent);
        }
        .interview-open-btn:hover {
          filter: brightness(0.9);
          transform: translateY(-1px);
        }

        .itv-popup-dim {
          background: rgba(0,0,0,0.45);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: itv-dim-in 0.2s ease;
          overflow: hidden;
          border-radius: inherit;
        }
        @keyframes itv-dim-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .itv-popup {
          position: relative;
          width: 92%;
          max-width: 400px;
          max-height: 90%;
          background: var(--wedding-bg, #fff);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          animation: itv-pop-in 0.3s ease;
        }
        @keyframes itv-pop-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .itv-popup-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: var(--wedding-border);
          color: var(--wedding-text-sub);
          font-size: 1.2em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: all 0.2s;
        }
        .itv-popup-close:hover {
          background: var(--wedding-main);
          color: white;
        }
        .itv-popup-scroll {
          max-height: 80vh;
          overflow-y: auto;
          padding: 0 20px 24px;
          scrollbar-width: none;
        }
        .itv-popup-scroll::-webkit-scrollbar { display: none; }
        .itv-popup-top {
          text-align: center;
          padding: 36px 0 24px;
        }
        .itv-popup-top h3 {
          margin: 0 0 8px;
          font-size: 0.8em;
          font-weight: 600;
          color: var(--wedding-text-sub);
          letter-spacing: 4px;
        }
        .itv-popup-top p {
          margin: 0;
          font-size: 1.1em;
          font-weight: 700;
          color: var(--wedding-text-main);
        }
        .itv-popup-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .interview-qa {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .interview-q {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .q-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--wedding-main);
          color: white;
          font-size: 0.75em;
          font-weight: 800;
          flex-shrink: 0;
        }
        .q-text {
          font-size: 0.95em;
          font-weight: 700;
          color: var(--wedding-text-main);
          text-align: left;
        }
        .interview-a-box {
          background: var(--wedding-card-bg);
          border: 1px solid var(--wedding-border);
          border-radius: 16px;
          padding: 16px 18px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .groom-box {
          border-left: 3px solid var(--wedding-accent);
        }
        .bride-box {
          border-left: 3px solid var(--wedding-main);
        }
        .a-name {
          display: block;
          font-size: 0.75em;
          font-weight: 700;
          color: var(--wedding-main);
          margin-bottom: 6px;
          letter-spacing: 1px;
        }
        .interview-a-box p {
          font-size: 0.9em;
          line-height: 1.7;
          color: var(--wedding-text-body);
          margin: 0;
          word-break: keep-all;
        }
        .itv-popup-back {
          display: block;
          margin: 28px auto 0;
          padding: 12px 36px;
          background: none;
          border: 1px solid var(--wedding-border);
          border-radius: 30px;
          font-size: 0.9em;
          font-weight: 600;
          color: var(--wedding-text-sub);
          cursor: pointer;
          transition: all 0.2s;
        }
        .itv-popup-back:hover {
          border-color: var(--wedding-main);
          color: var(--wedding-main);
        }
      `}</style>
    </section>
  );
}, (prev, next) =>
  prev.data.interview === next.data.interview
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
);

export default Interview;
