import React, { useState } from 'react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Interview: React.FC<PreviewProps> = ({ data }) => {
  const qaList = data.interview || [];
  const [open, setOpen] = useState(false);

  if (qaList.length === 0) return null;

  return (
    <section className="interview-section section" style={{ fontFamily: data.fontFamily }}>
      <h2>INTERVIEW</h2>
      <p className="section-sub">두 사람에게 물어본 이야기</p>

      <button type="button" className={`interview-toggle ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        {open ? '닫기' : '인터뷰 보기'}
      </button>

      <div className={`interview-body ${open ? 'open' : ''}`}>
        <div className="interview-list">
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

      <style>{`
        .interview-section {
          background-color: transparent;
          padding: 80px 24px;
          position: relative;
          z-index: 2;
        }
        .interview-toggle {
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
          margin-bottom: 4px;
          box-shadow: 0 4px 12px color-mix(in srgb, var(--wedding-main) 30%, transparent);
        }
        .interview-toggle:hover {
          filter: brightness(0.9);
          transform: translateY(-1px);
        }
        .interview-toggle.open {
          background: var(--wedding-bg);
          color: var(--wedding-text-sub);
          border: 1px solid var(--wedding-border);
          box-shadow: none;
        }
        .interview-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s ease;
        }
        .interview-body.open {
          max-height: 5000px;
        }
        .interview-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-top: 20px;
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
      `}</style>
    </section>
  );
};

export default Interview;
