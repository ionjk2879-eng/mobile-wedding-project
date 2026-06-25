import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';

const events = [
  {
    tag: '진행중',
    title: '첫 청첩장 제작 이벤트',
    desc: 'Sonett에서 처음 청첩장을 만드시는 분들께 특별 혜택을 드립니다.',
    period: '2026.06.01 ~ 2026.07.31',
    active: true,
  },
  {
    tag: '진행중',
    title: '후기 작성 이벤트',
    desc: '청첩장 사용 후기를 남겨주시면 추첨을 통해 기프티콘을 드립니다.',
    period: '2026.06.15 ~ 2026.08.15',
    active: true,
  },
  {
    tag: '예정',
    title: '여름 시즌 테마 출시 기념',
    desc: '새로운 여름 시즌 테마 출시와 함께 다양한 혜택을 준비하고 있습니다.',
    period: '2026.07.01 ~',
    active: false,
  },
];

const EventsPage: React.FC = () => {
  return (
    <div className="events-page">
      <SiteHeader />

      <section className="events-hero">
        <p className="events-sub">EVENTS</p>
        <h1 className="events-title">이벤트</h1>
        <p className="events-desc">Sonett에서 진행 중인 이벤트를 확인하세요.</p>
      </section>

      <section className="events-list">
        {events.map((ev, i) => (
          <div key={i} className={`event-card ${ev.active ? '' : 'upcoming'}`}>
            <span className={`event-tag ${ev.active ? 'active' : 'upcoming'}`}>{ev.tag}</span>
            <h3 className="event-title">{ev.title}</h3>
            <p className="event-desc">{ev.desc}</p>
            <span className="event-period">{ev.period}</span>
          </div>
        ))}
      </section>

      <section className="events-cta">
        <h2>청첩장을 만들고 이벤트에 참여하세요</h2>
        <Link to="/editor" className="events-cta-btn">청첩장 만들기</Link>
      </section>

      <footer className="events-footer">
        <p>&copy; 2026 Sonett. All rights reserved.</p>
      </footer>

      <style>{`
        .events-page {
          min-height: 100vh;
          background: #fff;
          font-family: 'Pretendard', sans-serif;
        }
        .events-hero {
          text-align: center;
          padding: 80px 24px 40px;
          background: linear-gradient(180deg, #FDFBFC 0%, #FDF6F9 100%);
        }
        .events-sub {
          font-size: 0.75rem;
          letter-spacing: 5px;
          color: #B07A8E;
          margin: 0 0 12px;
          font-weight: 600;
        }
        .events-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 12px;
        }
        .events-desc {
          font-size: 1rem;
          color: #6B7280;
          margin: 0;
        }
        .events-list {
          max-width: 700px;
          margin: 0 auto;
          padding: 60px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .event-card {
          background: #FAFAFA;
          border-radius: 16px;
          padding: 32px 28px;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .event-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }
        .event-card.upcoming {
          opacity: 0.7;
        }
        .event-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .event-tag.active {
          background: #ECFDF5;
          color: #059669;
        }
        .event-tag.upcoming {
          background: #F3F4F6;
          color: #6B7280;
        }
        .event-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 8px;
        }
        .event-desc {
          font-size: 0.9rem;
          color: #6B7280;
          line-height: 1.6;
          margin: 0 0 14px;
        }
        .event-period {
          font-size: 0.78rem;
          color: #9CA3AF;
        }
        .events-cta {
          text-align: center;
          padding: 60px 24px 80px;
        }
        .events-cta h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 24px;
        }
        .events-cta-btn {
          display: inline-block;
          background: #B07A8E;
          color: white;
          padding: 16px 44px;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(176,122,142,0.25);
        }
        .events-cta-btn:hover {
          background: #9B6A7E;
          transform: translateY(-2px);
        }
        .events-footer {
          text-align: center;
          padding: 24px;
          border-top: 1px solid #F0F0F0;
          color: #9CA3AF;
          font-size: 0.8rem;
        }
        @media (max-width: 640px) {
          .events-title { font-size: 1.6rem; }
          .events-hero { padding: 60px 20px 30px; }
        }
      `}</style>
    </div>
  );
};

export default EventsPage;
