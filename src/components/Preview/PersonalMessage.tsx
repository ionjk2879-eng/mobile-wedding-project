import React from 'react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const PersonalMessage: React.FC<PreviewProps> = ({ data }) => {
  return (
    <section className="personal-message section" style={{ fontFamily: data.fontFamily }}>
      <div className="message-container">
        <div className="message-box groom">
          <div className="quote-icon">"</div>
          <p>{data.groomMessage}</p>
          <span className="message-name">신랑 {data.groomName}</span>
        </div>
        <div className="message-box bride">
          <div className="quote-icon">"</div>
          <p>{data.brideMessage}</p>
          <span className="message-name">신부 {data.brideName}</span>
        </div>
      </div>

      <style>{`
        .personal-message {
          background-color: transparent;
          padding: 80px 24px;
        }
        .message-container {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .message-box {
          position: relative;
          padding: 30px;
          background: var(--wedding-card-bg);
          border-radius: 24px;
          border: 1px solid var(--wedding-border);
          box-shadow: 0 10px 30px rgba(74, 69, 67, 0.05);
        }
        .quote-icon {
          font-family: 'Gowun Batang', serif;
          font-size: 3em;
          color: var(--wedding-accent);
          position: absolute;
          top: -10px;
          left: 20px;
          line-height: 1;
        }
        .message-box p {
          font-size: 1em;
          line-height: 1.8;
          color: var(--wedding-text-body);
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
          word-break: keep-all;
        }
        .message-name {
          font-size: 0.85em;
          font-weight: 600;
          color: var(--wedding-main);
          display: block;
          text-align: right;
          letter-spacing: 1px;
        }
        .groom {
          border-left: 4px solid var(--wedding-accent);
        }
        .bride {
          border-left: 4px solid var(--wedding-main);
        }
      `}</style>
    </section>
  );
};

export default PersonalMessage;
