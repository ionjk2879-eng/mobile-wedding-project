import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';

const LandingPage: React.FC = () => {
  return (
    <div className="landing">
      <SiteHeader />
      <main className="landing-hero">
        <div className="landing-content">
          <p className="landing-sub">MOBILE WEDDING INVITATION</p>
          <h1 className="landing-title">소중한 순간을<br />영원히 간직하세요</h1>
          <p className="landing-desc">세련된 모바일 청첩장을 만들고 영구보존할 수 있습니다.</p>
          <Link to="/editor" className="landing-cta">청첩장 만들기</Link>
        </div>
      </main>

      <style>{`
        .landing {
          min-height: 100vh;
          background: #FDFBFC;
          font-family: 'Pretendard', sans-serif;
        }
        .landing-hero {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 60px);
          padding: 40px 24px;
          text-align: center;
        }
        .landing-content {
          max-width: 500px;
        }
        .landing-sub {
          font-size: 0.75rem;
          letter-spacing: 4px;
          color: #B07A8E;
          margin: 0 0 20px;
          font-weight: 600;
        }
        .landing-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 16px;
          line-height: 1.4;
        }
        .landing-desc {
          font-size: 1rem;
          color: #6B7280;
          margin: 0 0 40px;
          line-height: 1.6;
        }
        .landing-cta {
          display: inline-block;
          background: #B07A8E;
          color: white;
          text-decoration: none;
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .landing-cta:hover {
          background: #9B6A7E;
          transform: translateY(-1px);
        }
        @media (max-width: 480px) {
          .landing-title { font-size: 1.6rem; }
          .landing-cta { width: 100%; text-align: center; box-sizing: border-box; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
