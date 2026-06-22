import React from 'react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const PersonalMessage: React.FC<PreviewProps> = React.memo(({ data }) => {
  return (
    <section className="personal-message section" style={{ fontFamily: data.fontFamily }} aria-label="신랑 신부 한마디">
      <h2>MESSAGE</h2>
      <p className="section-sub">서로에게 전하는 한마디</p>
      <div className="message-container">
        <div className="message-box groom">
          <div className="msg-profile-row">
            {data.groomPhoto ? (
              <img src={data.groomPhoto} alt="신랑" className="msg-profile-img" />
            ) : (
              <div className="msg-profile-empty" />
            )}
            <div className="msg-content">
              <span className="message-name">신랑 {data.groomName || '신랑'}</span>
              <p>{data.groomMessage}</p>
            </div>
          </div>
        </div>
        <div className="message-box bride">
          <div className="msg-profile-row reverse">
            <div className="msg-content">
              <span className="message-name">신부 {data.brideName || '신부'}</span>
              <p>{data.brideMessage}</p>
            </div>
            {data.bridePhoto ? (
              <img src={data.bridePhoto} alt="신부" className="msg-profile-img" />
            ) : (
              <div className="msg-profile-empty" />
            )}
          </div>
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
          gap: 24px;
        }
        .message-box {
          padding: 16px;
          background: var(--wedding-card-bg);
          border-radius: 20px;
          border: 1px solid var(--wedding-border);
          box-shadow: 0 10px 30px rgba(74, 69, 67, 0.05);
        }
        .message-box.groom { border-left: 4px solid var(--wedding-accent); border-right: none; }
        .message-box.bride { border-right: 4px solid var(--wedding-main); border-left: none; }
        .msg-profile-row.reverse { flex-direction: row; }
        .msg-profile-row.reverse .msg-content { text-align: center; }
        .msg-profile-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .msg-profile-img {
          width: 130px;
          height: 130px;
          border-radius: 14px;
          object-fit: cover;
          flex-shrink: 0;
          border: 2px solid var(--wedding-border);
        }
        .msg-profile-empty {
          width: 130px;
          height: 130px;
          border-radius: 14px;
          flex-shrink: 0;
          background: var(--wedding-border);
          opacity: 0.5;
        }
        .msg-content {
          flex: 1;
          min-width: 0;
        }
        .message-name {
          font-size: 0.8em;
          font-weight: 700;
          color: var(--wedding-main);
          letter-spacing: 1px;
          display: block;
          margin-bottom: 8px;
        }
        .msg-content p {
          font-size: 0.95em;
          line-height: 1.8;
          color: var(--wedding-text-body);
          margin: 0;
          word-break: keep-all;
        }
      `}</style>
    </section>
  );
}, (prev, next) => {
  return prev.data.groomName === next.data.groomName
    && prev.data.brideName === next.data.brideName
    && prev.data.groomMessage === next.data.groomMessage
    && prev.data.brideMessage === next.data.brideMessage
    && prev.data.groomPhoto === next.data.groomPhoto
    && prev.data.bridePhoto === next.data.bridePhoto
    && prev.data.fontFamily === next.data.fontFamily;
});

export default PersonalMessage;
