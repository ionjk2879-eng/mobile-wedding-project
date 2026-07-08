import React from 'react';
import { InvitationData } from '../../types';
import { formatShareDate, formatShareDateJa } from '../../utils/formatShareDateTime';

interface PreviewProps {
  data: InvitationData;
}

const Ending: React.FC<PreviewProps> = React.memo(({ data }) => {
  if (data.isEndingEnabled === false) return null;

  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';
  const groomName = isEn && data.en.groomName ? data.en.groomName : isJa && data.ja?.groomName ? data.ja.groomName : (data.groomName || (isJa ? '新郎' : '신랑'));
  const brideName = isEn && data.en.brideName ? data.en.brideName : isJa && data.ja?.brideName ? data.ja.brideName : (data.brideName || (isJa ? '新婦' : '신부'));

  const dateStr = (() => {
    if (isEn) return data.en?.date || data.date;
    if (isJa) return formatShareDateJa(data.weddingDateISO) || data.date;
    return formatShareDate(data.weddingDateISO) || data.date;
  })();

  const defaultMessage = isEn
    ? 'Thank you for celebrating\nour new beginning with us.'
    : isJa
    ? '私たちの新しい出発を\n共にお祝いくださり、ありがとうございます。'
    : '저희의 새로운 시작을 함께해주셔서\n진심으로 감사합니다.';
  const message = data.endingMessage || defaultMessage;
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
  prev.data.isEndingEnabled === next.data.isEndingEnabled
  && prev.data.endingPhoto === next.data.endingPhoto
  && prev.data.endingPhotoX === next.data.endingPhotoX
  && prev.data.endingPhotoY === next.data.endingPhotoY
  && prev.data.endingMessage === next.data.endingMessage
  && prev.data.groomName === next.data.groomName
  && prev.data.brideName === next.data.brideName
  && prev.data.date === next.data.date
  && prev.data.weddingDateISO === next.data.weddingDateISO
  && prev.data.language === next.data.language
);

export default Ending;
