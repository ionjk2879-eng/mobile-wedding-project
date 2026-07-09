import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Heart } from 'lucide-react';
import { InvitationData } from '../../types';
import { formatShareDateTime, formatShareDateTimeJa } from '../../utils/formatShareDateTime';

interface Props {
  data: InvitationData;
  onClose: () => void;
}

const RSVPNoticePopup: React.FC<Props> = ({ data, onClose }) => {
  const [hideToday, setHideToday] = useState(false);
  const [overlayBounds, setOverlayBounds] = useState<React.CSSProperties>({ position: 'fixed', inset: 0 });
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';

  useEffect(() => {
    const update = () => {
      const el = document.querySelector('.invitation-page');
      if (!el) return;
      const r = el.getBoundingClientRect();
      setOverlayBounds({ position: 'fixed', left: r.left, top: 0, width: r.width, bottom: 0 });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleClose = () => {
    if (hideToday && data.slug) {
      localStorage.setItem(`rsvp-notice-hidden-${data.slug}`, new Date().toDateString());
    }
    onClose();
  };

  const formatDateTime = () => {
    if (isEn) {
      const d = new Date(data.weddingDateISO);
      if (!isNaN(d.getTime())) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let str = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} (${days[d.getDay()]})`;
        const p = data.time?.match(/(AM|PM)\s(\d+):(\d+)/);
        if (p) str += ` ${p[2]}${p[3] !== '00' ? `:${p[3]}` : ''} ${p[1]}`;
        return str;
      }
    }
    if (isJa) return formatShareDateTimeJa(data.weddingDateISO, data.time) || [data.date, data.time].filter(Boolean).join(' ');
    return formatShareDateTime(data.weddingDateISO, data.time) || [data.date, data.time].filter(Boolean).join(' ');
  };

  const handleRSVP = () => {
    handleClose();
    document.dispatchEvent(new CustomEvent('sonett-open-rsvp'));
    setTimeout(() => {
      const el = document.querySelector('.rsvp-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const customVars: React.CSSProperties = {};
  if (data.customAccentColor) (customVars as Record<string, string>)['--wedding-main'] = data.customAccentColor;

  const popup = (
    <div
      className={`rsvp-notice-overlay theme-${data.theme || 'blush'}`}
      style={{ ...overlayBounds, ...customVars }}
    >
      <div
        className="rsvp-notice-popup"
        style={{ fontFamily: data.fontFamily || 'inherit' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="rsvp-notice-close" onClick={handleClose} aria-label="닫기">
          <X size={16} />
        </button>

        <p className="rsvp-notice-title">
          {isEn ? 'RSVP' : isJa ? '出欠のご連絡' : '참석 여부 전달'}
        </p>

        <p className="rsvp-notice-msg">
          {isEn
            ? 'We provide assigned seating\nfor all attendees.\nPlease let us know in advance\nif you will be joining us.'
            : isJa
            ? '参列者へのご着席案内のため、\n出欠についてお早めに\nお知らせいただけますと幸いです。'
            : '예식 참석자분들께는\n지정 좌석이 안내되오니,\n참석 여부를 미리\n알려주시면 감사하겠습니다.'}
        </p>

        <div className="rsvp-notice-divider" />

        <div className="rsvp-notice-info">
          {(data.groomName || data.brideName) && (
            <p className="rsvp-notice-names">
              {data.groomName && (
                <span className="rsvp-notice-name-item">
                  <Heart size={11} fill="#3B82F6" color="#3B82F6" style={{ display: 'inline', verticalAlign: 'middle', marginBottom: 1 }} />
                  {' '}{isEn ? 'Groom ' : isJa ? '新郎 ' : '신랑 '}{data.groomName}
                </span>
              )}
              {data.groomName && data.brideName && <span className="rsvp-notice-name-sep">, </span>}
              {data.brideName && (
                <span className="rsvp-notice-name-item">
                  <Heart size={11} fill="#EF4444" color="#EF4444" style={{ display: 'inline', verticalAlign: 'middle', marginBottom: 1 }} />
                  {' '}{isEn ? 'Bride ' : isJa ? '新婦 ' : '신부 '}{data.brideName}
                </span>
              )}
            </p>
          )}
          {(data.weddingDateISO || data.date || data.time) && (
            <p className="rsvp-notice-detail">{formatDateTime()}</p>
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

  return ReactDOM.createPortal(popup, document.body);
};

export default RSVPNoticePopup;
