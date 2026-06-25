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
