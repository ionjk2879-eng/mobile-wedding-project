import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';

const reviews = [
  { name: '김지은', date: '2026.05', text: '친구들이 청첩장 너무 예쁘다고 칭찬했어요! 만드는 과정도 간단해서 좋았습니다.', rating: 5 },
  { name: '이준호', date: '2026.04', text: '다른 서비스 여러 개 써봤는데 Sonett이 가장 깔끔하고 사용하기 편했어요.', rating: 5 },
  { name: '박수진', date: '2026.04', text: '카카오톡 공유가 바로 되니까 하객분들한테 전달하기 정말 편리했어요.', rating: 5 },
  { name: '정민수', date: '2026.03', text: '결혼 준비하느라 바빴는데 5분 만에 완성해서 시간 절약 많이 됐습니다.', rating: 4 },
  { name: '최하나', date: '2026.03', text: 'AI 추천 디자인이 감각적이에요. 색상 조합이 예뻐서 그대로 사용했어요.', rating: 5 },
  { name: '한승우', date: '2026.02', text: '방명록 기능이 특히 좋았어요. 하객분들 축하 메시지를 모아볼 수 있어서 감동이었습니다.', rating: 5 },
];

const ReviewsPage: React.FC = () => {
  return (
    <div className="reviews-page">
      <SiteHeader />

      <section className="reviews-hero">
        <p className="reviews-sub">REVIEWS</p>
        <h1 className="reviews-title">고객 후기</h1>
        <p className="reviews-desc">Sonett으로 청첩장을 만든 분들의 생생한 후기입니다.</p>
      </section>

      <section className="reviews-list">
        {reviews.map((r, i) => (
          <div key={i} className="review-card">
            <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
            <p className="review-text">"{r.text}"</p>
            <div className="review-meta">
              <span className="review-name">{r.name}</span>
              <span className="review-date">{r.date}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="reviews-cta">
        <h2>나만의 청첩장을 만들어보세요</h2>
        <Link to="/editor" className="reviews-cta-btn">청첩장 만들기</Link>
      </section>

      <footer className="reviews-footer">
        <p>&copy; 2026 Sonett. All rights reserved.</p>
      </footer>

      <style>{`
        .reviews-page {
          min-height: 100vh;
          background: #fff;
          font-family: 'Pretendard', sans-serif;
        }
        .reviews-hero {
          text-align: center;
          padding: 80px 24px 40px;
          background: linear-gradient(180deg, #FDFBFC 0%, #FDF6F9 100%);
        }
        .reviews-sub {
          font-size: 0.75rem;
          letter-spacing: 5px;
          color: #B07A8E;
          margin: 0 0 12px;
          font-weight: 600;
        }
        .reviews-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 12px;
        }
        .reviews-desc {
          font-size: 1rem;
          color: #6B7280;
          margin: 0;
        }
        .reviews-list {
          max-width: 800px;
          margin: 0 auto;
          padding: 60px 24px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .review-card {
          background: #FAFAFA;
          border-radius: 16px;
          padding: 28px 24px;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .review-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }
        .review-stars {
          color: #F59E0B;
          font-size: 0.9rem;
          margin-bottom: 12px;
          letter-spacing: 2px;
        }
        .review-text {
          font-size: 0.92rem;
          color: #374151;
          line-height: 1.7;
          margin: 0 0 16px;
        }
        .review-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .review-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: #1F2937;
        }
        .review-date {
          font-size: 0.75rem;
          color: #9CA3AF;
        }
        .reviews-cta {
          text-align: center;
          padding: 60px 24px 80px;
        }
        .reviews-cta h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 24px;
        }
        .reviews-cta-btn {
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
        .reviews-cta-btn:hover {
          background: #9B6A7E;
          transform: translateY(-2px);
        }
        .reviews-footer {
          text-align: center;
          padding: 24px;
          border-top: 1px solid #F0F0F0;
          color: #9CA3AF;
          font-size: 0.8rem;
        }
        @media (max-width: 640px) {
          .reviews-list { grid-template-columns: 1fr; }
          .reviews-title { font-size: 1.6rem; }
          .reviews-hero { padding: 60px 20px 30px; }
        }
      `}</style>
    </div>
  );
};

export default ReviewsPage;