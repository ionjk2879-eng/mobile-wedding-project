import React from 'react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Interview: React.FC<PreviewProps> = ({ data }) => {
  const qaList = data.interview || [];

  if (qaList.length === 0) return null;

  return (
    <section className="interview-section section" style={{ fontFamily: data.fontFamily }}>
      <h2>{data.language === 'en' ? 'Interview' : '우리에게 물어봐'}</h2>
      <div className="interview-list">
        {qaList.map((qa, index) => (
          <div key={qa.id} className="interview-card">
            <div className="interview-q">
              <span className="q-badge">Q{index + 1}</span>
              <span className="q-text">{qa.question || '질문을 입력하세요'}</span>
            </div>
            <div className="interview-answers">
              <div className="interview-a groom-a">
                <span className="a-name">{data.groomName || '신랑'}</span>
                <p>{qa.groomAnswer || '-'}</p>
              </div>
              <div className="interview-a bride-a">
                <span className="a-name">{data.brideName || '신부'}</span>
                <p>{qa.brideAnswer || '-'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .interview-section {
          background-color: transparent;
          padding: 80px 24px;
          position: relative;
          z-index: 2;
        }
        .interview-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .interview-card {
          background: var(--wedding-card-bg);
          border: 1px solid var(--wedding-border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }
        .interview-q {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid var(--wedding-border);
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
        .interview-answers {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .interview-a {
          padding: 18px 16px;
          text-align: center;
        }
        .groom-a {
          border-right: 1px solid var(--wedding-border);
        }
        .a-name {
          display: block;
          font-size: 0.75em;
          font-weight: 700;
          color: var(--wedding-main);
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        .interview-a p {
          font-size: 0.88em;
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
