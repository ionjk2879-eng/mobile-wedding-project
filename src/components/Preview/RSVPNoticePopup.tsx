import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Heart } from 'lucide-react';
import { InvitationData } from '../../types';
import { formatShareDateTime, formatShareDateTimeJa } from '../../utils/formatShareDateTime';

interface Props {
  data: InvitationData;
  onClose: () => void;
}

// 팝업 배경(오버레이)의 가로 폭을 실제 청첩장 카드(.invitation-page) 너비에 맞춘다.
// 예전엔 max-width 430px를 CSS calc에 하드코딩해 가정했는데, 이는 view-container/
// full-preview-container 등 실제 컨테이너와 별도로 document.body 기준 뷰포트 폭에서
// 계산되어(스크롤바 폭 등으로) 카드 실제 렌더 폭과 어긋날 수 있었다. Opening.tsx/
// usePreviewPopup.tsx가 쓰는 것과 같은 방식으로, 실제 .invitation-page의
// getBoundingClientRect()를 읽어 그 폭에 정확히 맞춘다.
function useInvitationBounds(): { left: number; width: number } | null {
  const [bounds, setBounds] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const update = () => {
      // 에디터 라이브 프리뷰 패널 — transform: translateZ(0)이 있어 position: fixed의
      // 포함 블록이 이 컨테이너 자체가 되므로, 그 안에서는 컨테이너 폭이 곧 카드 폭이다.
      const scroll = document.querySelector<HTMLElement>('.preview-content-scroll');
      if (scroll) { setBounds({ left: 0, width: scroll.clientWidth }); return; }

      // 그 외(ViewPage 등)에서는 document.body에 포털되므로, 실제 .invitation-page의
      // 뷰포트 기준 위치/폭을 그대로 읽어야 카드와 어긋나지 않는다.
      const invPage = document.querySelector<HTMLElement>('.invitation-page');
      if (invPage) {
        const rect = invPage.getBoundingClientRect();
        setBounds({ left: rect.left, width: rect.width });
        return;
      }

      setBounds({ left: 0, width: window.innerWidth });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return bounds;
}

const RSVPNoticePopup: React.FC<Props> = ({ data, onClose }) => {
  const [hideToday, setHideToday] = useState(false);
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';
  const bounds = useInvitationBounds();

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
    // RSVP 입력은 전체화면 오버레이(PreviewOverlay)로 뜨므로 배경 스크롤을 옮길 필요가 없다 —
    // 예전엔 .rsvp-section으로 스크롤시켜서, 제출 후 오버레이를 닫으면 그 섹션(응답 감사합니다
    // 카드)에 그대로 고정되어 메인화면부터 다시 볼 수 없었다. 이제는 배경 스크롤 위치를
    // 건드리지 않아 오버레이를 닫아도 원래 보고 있던 위치(주로 메인화면 근처)가 유지된다.
    document.dispatchEvent(new CustomEvent('sonett-open-rsvp'));
  };

  if (!bounds) return null;

  const overlayStyle: React.CSSProperties = { left: bounds.left, width: bounds.width };
  if (data.customAccentColor) (overlayStyle as Record<string, string>)['--wedding-main'] = data.customAccentColor;

  // 에디터 미리보기 컨테이너가 있으면 그 안에 포털 — transform: translateZ(0)이 있어
  // position: fixed가 자동으로 해당 컨테이너 기준이 되므로 오버레이가 청첩장 패널에만 한정됨.
  // ViewPage에서는 document.body로 fallback.
  const portalTarget =
    document.querySelector<HTMLElement>('.preview-content-scroll') ?? document.body;

  const popup = (
    <div
      className={`rsvp-notice-overlay theme-${data.theme || 'blush'}`}
      style={overlayStyle}
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
            ? 'For smooth wedding preparations\nand seating arrangements,\nwe kindly ask that you let us know\nyour attendance in advance.'
            : isJa
            ? '円滑な式の準備と\n座席のご案内のため、\nご出欠を事前にお知らせいただけますと\n大変助かります。'
            : '원활한 예식 준비와 좌석 안내를 위해,\n참석 여부를 미리 알려주시면\n큰 도움이 됩니다.'}
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

  return ReactDOM.createPortal(popup, portalTarget);
};

export default RSVPNoticePopup;
