import React, { useState } from 'react';
import { X } from 'lucide-react';
import { InvitationData } from '../../types';

interface Props {
  data: InvitationData;
  onClose: () => void;
}

const RSVPNoticePopup: React.FC<Props> = ({ data, onClose }) => {
  const [hideToday, setHideToday] = useState(false);
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';

  const handleClose = () => {
    if (hideToday && data.slug) {
      localStorage.setItem(`rsvp-notice-hidden-${data.slug}`, new Date().toDateString());
    }
    onClose();
  };

  const handleRSVP = () => {
    handleClose();
    document.dispatchEvent(new CustomEvent('sonett-open-rsvp'));
    setTimeout(() => {
      const el = document.querySelector('.rsvp-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  return (
    <div className="rsvp-notice-overlay">
      <div
        className="rsvp-notice-popup"
        style={{ fontFamily: data.fontFamily || 'inherit' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="rsvp-notice-close" onClick={handleClose} aria-label="닫기">
          <X size={16} />
        </button>

        <p className="rsvp-notice-msg">
          {isEn
            ? 'We provide assigned seating for all attendees.\nPlease let us know in advance if you will be joining us.'
            : isJa
            ? '参列者へのご着席案内のため、\n出欠についてお早めにお知らせいただけますと幸いです。'
            : '예식 참석자분들께는 지정 좌석이 안내되오니,\n참석 여부를 미리 알려주시면 감사하겠습니다.'}
        </p>

        <div className="rsvp-notice-divider" />

        <div className="rsvp-notice-info">
          {(data.groomName || data.brideName) && (
            <p className="rsvp-notice-names">
              {data.groomName}
              {data.groomName && data.brideName ? ' & ' : ''}
              {data.brideName}
            </p>
          )}
          {(data.date || data.time) && (
            <p className="rsvp-notice-detail">
              {[data.date, data.time].filter(Boolean).join('  ')}
            </p>
          )}
          {data.venueName && (
            <p className="rsvp-notice-detail">{data.venueName}</p>
          )}
        </div>

        <button className="rsvp-notice-btn" onClick={handleRSVP}>
          {isEn ? 'Submit RSVP' : isJa ? '出欠を送信する' : '참석 여부 전달하기'}
        </button>

        <label className="rsvp-notice-hide">
          <input
            type="checkbox"
            checked={hideToday}
            onChange={(e) => setHideToday(e.target.checked)}
          />
          <span>{isEn ? "Don't show today" : isJa ? '今日は表示しない' : '오늘 하루 보지 않기'}</span>
        </label>
      </div>
    </div>
  );
};

export default RSVPNoticePopup;
