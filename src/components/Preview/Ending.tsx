import React from 'react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Ending: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';
  const groomName = isEn && data.en.groomName ? data.en.groomName : (data.groomName || '신랑');
  const brideName = isEn && data.en.brideName ? data.en.brideName : (data.brideName || '신부');
  const dateStr = isEn && data.en.date ? data.en.date : data.date;
  const message = data.endingMessage || '저희의 새로운 시작을 함께해주셔서\n진심으로 감사합니다.';
  const photoPos = `${data.endingPhotoX ?? 50}% ${data.endingPhotoY ?? 50}%`;

  return (
    <section className="ending" aria-label="엔딩">
      <div className="ending-frame">
        {data.endingPhoto ? (
          <img src={data.endingPhoto} alt="Ending" className="ending-photo" style={{ objectPosition: photoPos }} />
        ) : (
          <div className="ending-photo-empty"><span>엔딩 사진을 등록해주세요</span></div>
        )}
        <div className="ending-overlay">
          <p className="ending-message">
            {message.split('\n').map((line, i) => <span key={i}>{line}</span>)}
          </p>
          <p className="ending-signature">{groomName} <span>&amp;</span> {brideName}</p>
          <p className="ending-date">{dateStr}</p>
        </div>
      </div>
    </section>
  );
}, (prev, next) =>
  prev.data.endingPhoto === next.data.endingPhoto
  && prev.data.endingPhotoX === next.data.endingPhotoX
  && prev.data.endingPhotoY === next.data.endingPhotoY
  && prev.data.endingMessage === next.data.endingMessage
  && prev.data.groomName === next.data.groomName
  && prev.data.brideName === next.data.brideName
  && prev.data.date === next.data.date
  && prev.data.language === next.data.language
);

export default Ending;
