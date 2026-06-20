import React, { useState } from 'react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Timeline: React.FC<PreviewProps> = ({ data }) => {
  const events = data.timeline || [];
  const [open, setOpen] = useState(false);

  if (events.length === 0) return null;

  return (
    <section className="timeline-section section" style={{ fontFamily: data.fontFamily }}>
      <h2>OUR STORY</h2>
      <p className="section-sub">처음 만남부터 결혼까지, 우리의 여정</p>

      <button type="button" className={`timeline-toggle ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        {open ? (data.language === 'en' ? 'Close' : '닫기') : (data.language === 'en' ? 'View Our Story' : '이야기 보기')}
      </button>

      <div className={`timeline-body ${open ? 'open' : ''}`}>
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

      <style>{`
        .timeline-section {
          background-color: transparent;
          padding: 80px 24px;
          position: relative;
          z-index: 2;
        }
        .timeline-toggle {
          display: inline-block;
          padding: 12px 32px;
          background: var(--wedding-main);
          border: none;
          border-radius: 30px;
          font-size: 0.9em;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.25s;
          margin-bottom: 4px;
          box-shadow: 0 4px 12px color-mix(in srgb, var(--wedding-main) 30%, transparent);
        }
        .timeline-toggle:hover {
          filter: brightness(0.9);
          transform: translateY(-1px);
        }
        .timeline-toggle.open {
          background: var(--wedding-bg);
          color: var(--wedding-text-sub);
          border: 1px solid var(--wedding-border);
          box-shadow: none;
        }
        .timeline-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s ease;
        }
        .timeline-body.open {
          max-height: 20000px;
        }
        .tl-zigzag {
          padding: 30px 20px 20px;
          margin: 0 -24px;
          background: color-mix(in srgb, var(--wedding-main) 5%, var(--wedding-bg));
        }
        .tl-block {
          position: relative;
          padding-bottom: 0;
        }

        /* Vertical line */
        .tl-line-v {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--wedding-border);
        }
        .tl-line-v.line-left { left: 16px; }
        .tl-line-v.line-right { right: 16px; }

        /* Horizontal connector */
        .tl-line-h {
          position: relative;
          height: 2px;
          background: var(--wedding-border);
          margin: 20px 0;
        }
        .tl-line-h.h-to-right {
          margin-left: 16px;
          margin-right: 16px;
        }
        .tl-line-h.h-to-left {
          margin-left: 16px;
          margin-right: 16px;
        }

        /* Dot */
        .tl-dot {
          width: 12px;
          height: 12px;
          background: var(--wedding-main);
          border: 3px solid var(--wedding-card-bg, #fff);
          border-radius: 50%;
          box-shadow: 0 0 0 3px var(--wedding-border);
          margin-bottom: 14px;
        }
        .align-left .tl-dot { margin-right: auto; }
        .align-right .tl-dot { margin-left: auto; }

        /* Year divider */
        .tl-year {
          font-size: 2.2em;
          font-weight: 300;
          color: var(--wedding-text-main);
          letter-spacing: 6px;
          text-align: center;
          padding: 10px 0 20px;
          font-family: 'Cormorant Garamond', serif;
          opacity: 0.7;
        }

        /* Photo */
        .tl-photo {
          margin-bottom: 16px;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .tl-photo img {
          width: 100%;
          display: block;
        }

        /* Content */
        .tl-content {
          padding: 0 0 0 0;
        }
        .tl-content.align-left {
          text-align: left;
          padding-left: 30px;
        }
        .tl-content.align-right {
          text-align: right;
          padding-right: 30px;
        }
        .tl-date {
          display: inline-block;
          font-size: 0.78em;
          font-weight: 600;
          color: var(--wedding-text-sub);
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .tl-title {
          font-size: 1.1em;
          font-weight: 700;
          color: var(--wedding-text-main);
          margin: 0 0 8px 0;
        }
        .tl-desc {
          font-size: 0.88em;
          line-height: 1.8;
          color: var(--wedding-text-body);
          margin: 0;
          word-break: keep-all;
        }
      `}</style>
    </section>
  );
};

export default Timeline;
