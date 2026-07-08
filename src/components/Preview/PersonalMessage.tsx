import React from 'react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const PersonalMessage: React.FC<PreviewProps> = React.memo(({ data }) => {
  if (data.isMessageEnabled === false) return null;

  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';
  const groomLabel = isEn ? 'Groom' : isJa ? '新郎' : '신랑';
  const brideLabel = isEn ? 'Bride' : isJa ? '新婦' : '신부';
  const sectionSub = isEn ? 'A word from the couple' : isJa ? 'ふたりからひとこと' : '서로에게 전하는 한마디';
  const messagePlain = data.messageStyle === 'plain';
  const imgClass = `msg-profile-img${messagePlain ? ' msg-profile-stamp' : ''}`;
  const emptyClass = `msg-profile-empty${messagePlain ? ' msg-profile-stamp' : ''}`;

  return (
    <section className="personal-message section" style={{ fontFamily: data.fontFamily }} aria-label="신랑 신부 한마디">
      <h2>MESSAGE</h2>
      <p className="section-sub">{sectionSub}</p>
      <div className="message-container">
        <div className={`message-box groom ${messagePlain ? 'message-plain' : ''}`}>
          <div className="msg-profile-row">
            {data.groomPhoto ? (
              <img src={data.groomPhoto} alt="신랑" className={imgClass} />
            ) : (
              <div className={emptyClass} />
            )}
            <div className="msg-content">
              <span className="message-name">{groomLabel} {data.groomName}</span>
              <p>{data.groomMessage}</p>
            </div>
          </div>
        </div>
        <div className={`message-box bride ${messagePlain ? 'message-plain' : ''}`}>
          <div className="msg-profile-row reverse">
            <div className="msg-content">
              <span className="message-name">{brideLabel} {data.brideName}</span>
              <p>{data.brideMessage}</p>
            </div>
            {data.bridePhoto ? (
              <img src={data.bridePhoto} alt="신부" className={imgClass} />
            ) : (
              <div className={emptyClass} />
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
    && prev.data.fontFamily === next.data.fontFamily
    && prev.data.language === next.data.language
    && prev.data.isMessageEnabled === next.data.isMessageEnabled
    && prev.data.messageStyle === next.data.messageStyle;
});

export default PersonalMessage;