import React, { useState, useRef, useCallback } from 'react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Timeline: React.FC<PreviewProps> = React.memo(({ data }) => {
  const events = data.timeline || [];
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // blur 처리: 포커스로 인한 스크롤 컨테이너 자동 스크롤 방지
    e.currentTarget.blur();
    const el = bodyRef.current;
    if (!el) { setOpen(v => !v); return; }
    if (open) {
      el.style.maxHeight = el.scrollHeight + 'px';
      requestAnimationFrame(() => { el.style.maxHeight = '0px'; });
    } else {
      el.style.maxHeight = el.scrollHeight + 'px';
      const onEnd = () => {
        el.style.maxHeight = '';
        el.removeEventListener('transitionend', onEnd);
      };
      el.addEventListener('transitionend', onEnd);
    }
    setOpen(v => !v);
  }, [open]);

  if (events.length === 0) return null;

  return (
    <section className="timeline-section section" style={{ fontFamily: data.fontFamily }} aria-label="타임라인">
      <h2>OUR STORY</h2>
      <p className="section-sub">처음 만남부터 결혼까지, 우리의 여정</p>

      <button type="button" className={`timeline-toggle ${open ? 'open' : ''}`} onClick={handleToggle} aria-expanded={open}>
        {open ? (data.language === 'en' ? 'Close' : '닫기') : (data.language === 'en' ? 'View Our Story' : '이야기 보기')}
      </button>

      <div className={`timeline-body ${open ? 'open' : ''}`} ref={bodyRef}>
        <div className="tl-zigzag">
          {events.map((event, index) => {
            const isLeft = index % 2 === 0;
            const isLast = index === events.length - 1;
            return (
              <div key={event.id} className="tl-block">
                {/* Vertical line */}
                <div className={`tl-line-v ${isLeft ? 'line-left' : 'line-right'}`} />

                {/* Year divider */}
                {event.year && (
                  <div className="tl-year">{event.year}</div>
                )}

                {/* Photo */}
                {event.photo && (
                  <div className="tl-photo">
                    <img src={event.photo} alt="" />
                  </div>
                )}

                {/* Content */}
                <div className={`tl-content ${isLeft ? 'align-left' : 'align-right'}`}>
                  <div className="tl-dot" />
                  {event.showDate !== false && event.date && (
                    <span className="tl-date">{event.date}</span>
                  )}
                  <h3 className="tl-title">{event.title || '제목을 입력하세요'}</h3>
                  {event.description && (
                    <p className="tl-desc" style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>
                  )}
                </div>

                {/* Horizontal connector to next block (zigzag) */}
                {!isLast && (
                  <div className={`tl-line-h ${isLeft ? 'h-to-right' : 'h-to-left'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}, (prev, next) =>
  prev.data.timeline === next.data.timeline
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
);

export default Timeline;
