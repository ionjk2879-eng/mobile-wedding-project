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
        <div className="timeline-track">
          {events.map((event, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div key={event.id} className={`timeline-item ${isLeft ? 'left' : 'right'}`}>
                <div className="timeline-dot" />
                {isLeft && event.photo && (
                  <div className="timeline-photo right-photo">
                    <img src={event.photo} alt="" />
                  </div>
                )}
                {!isLeft && event.photo && (
                  <div className="timeline-photo left-photo">
                    <img src={event.photo} alt="" />
                  </div>
                )}
                <div className="timeline-card">
                  <span className="timeline-date">{event.date || '날짜'}</span>
                  <h3 className="timeline-title">{event.title || '제목을 입력하세요'}</h3>
                  {event.description && (
                    <p className="timeline-desc">{event.description}</p>
                  )}
                </div>
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
          max-height: 2000px;
        }
        .timeline-track {
          position: relative;
          padding: 24px 0 4px;
        }
        .timeline-track::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--wedding-border);
          transform: translateX(-50%);
        }
        .timeline-item {
          position: relative;
          display: flex;
          margin-bottom: 32px;
          align-items: flex-start;
        }
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        .timeline-item.left {
          justify-content: flex-start;
          padding-right: calc(50% + 16px);
          padding-left: 0;
        }
        .timeline-item.right {
          justify-content: flex-end;
          padding-left: calc(50% + 16px);
          padding-right: 0;
        }
        .timeline-dot {
          position: absolute;
          left: 50%;
          top: 8px;
          width: 12px;
          height: 12px;
          background: var(--wedding-main);
          border: 3px solid var(--wedding-card-bg, #fff);
          border-radius: 50%;
          transform: translateX(-50%);
          z-index: 1;
          box-shadow: 0 0 0 3px var(--wedding-border);
        }
        .timeline-card {
          background: var(--wedding-card-bg);
          border: 1px solid var(--wedding-border);
          border-radius: 14px;
          padding: 14px 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          width: 100%;
        }
        .timeline-date {
          display: inline-block;
          font-size: 0.75em;
          font-weight: 700;
          color: var(--wedding-main);
          background: var(--wedding-bg);
          padding: 3px 10px;
          border-radius: 20px;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .timeline-title {
          font-size: 0.95em;
          font-weight: 700;
          color: var(--wedding-text-main);
          margin: 0 0 6px 0;
        }
        .timeline-desc {
          font-size: 0.85em;
          line-height: 1.7;
          color: var(--wedding-text-body);
          margin: 0;
          word-break: keep-all;
        }
        .timeline-item.left .timeline-card {
          text-align: right;
        }
        .timeline-item.right .timeline-card {
          text-align: left;
        }
        .timeline-photo {
          position: absolute;
          width: calc(50% - 24px);
          top: 0;
        }
        .timeline-photo.right-photo {
          left: calc(50% + 16px);
        }
        .timeline-photo.left-photo {
          right: calc(50% + 16px);
        }
        .timeline-photo img {
          width: 100%;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid var(--wedding-border);
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
      `}</style>
    </section>
  );
};

export default Timeline;
