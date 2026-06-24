import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';

const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('revealed');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);
  return ref;
};

const LandingPage: React.FC = () => {
  const containerRef = useScrollReveal();

  return (
    <div className="landing" ref={containerRef}>
      <SiteHeader />

      {/* Hero */}
      <section className="land-hero">
        <p className="land-hero-sub">MOBILE WEDDING INVITATION</p>
        <h1 className="land-hero-title">소중한 순간을<br />영원히 간직하세요</h1>
        <p className="land-hero-desc">세련된 모바일 청첩장을 쉽고 빠르게 만들고,<br />카카오톡으로 간편하게 공유하세요.</p>
        <Link to="/editor" className="land-cta primary">청첩장 만들기</Link>
      </section>

      {/* Key Points */}
      <section className="land-section land-points">
        <div className="land-points-grid">
          <div className="land-point reveal">
            <div className="land-point-num">01</div>
            <h3>5분이면 완성</h3>
            <p>AI 추천 디자인으로 원클릭 완성.<br />복잡한 과정 없이 바로 시작하세요.</p>
          </div>
          <div className="land-point reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="land-point-num">02</div>
            <h3>무제한 수정</h3>
            <p>언제든 자유롭게 수정하세요.<br />저장 즉시 반영됩니다.</p>
          </div>
          <div className="land-point reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="land-point-num">03</div>
            <h3>영구 보존</h3>
            <p>결혼식이 끝나도 사라지지 않습니다.<br />소중한 추억을 영원히 간직하세요.</p>
          </div>
          <div className="land-point reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="land-point-num">04</div>
            <h3>간편 공유</h3>
            <p>카카오톡, 링크 복사로<br />하객에게 빠르게 전달하세요.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="land-section land-steps">
        <p className="land-section-sub reveal">HOW IT WORKS</p>
        <h2 className="land-section-title reveal">3단계로 완성하는 청첩장</h2>

        <div className="land-steps-list">
          <div className="land-step reveal">
            <div className="land-step-badge">Step 1</div>
            <h3>디자인 선택</h3>
            <p>9가지 메인 스타일과 17가지 테마 컬러 중<br />원하는 조합을 골라보세요.<br />AI 추천 프리셋으로 한 번에 적용할 수도 있습니다.</p>
          </div>
          <div className="land-step-divider reveal" />
          <div className="land-step reveal" style={{ transitionDelay: '0.15s' }}>
            <div className="land-step-badge">Step 2</div>
            <h3>내용 입력</h3>
            <p>이름, 날짜, 장소, 사진, 인사말 등<br />청첩장에 들어갈 정보를 채워주세요.<br />실시간 미리보기로 바로 확인할 수 있습니다.</p>
          </div>
          <div className="land-step-divider reveal" />
          <div className="land-step reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="land-step-badge">Step 3</div>
            <h3>저장 & 공유</h3>
            <p>저장하면 고유 주소가 생성됩니다.<br />카카오톡이나 링크로 하객에게 공유하세요.<br />언제든 수정하고 다시 공유할 수 있습니다.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="land-section land-features">
        <p className="land-section-sub reveal">FEATURES</p>
        <h2 className="land-section-title reveal">필요한 기능, 전부 담았습니다</h2>

        <div className="land-features-grid">
          <div className="land-feature reveal">
            <h4>참석 여부 (RSVP)</h4>
            <p>하객이 직접 참석 여부를 응답할 수 있습니다. 관리 페이지에서 한눈에 확인하세요.</p>
          </div>
          <div className="land-feature reveal" style={{ transitionDelay: '0.1s' }}>
            <h4>방명록</h4>
            <p>하객들이 축하 메시지를 남길 수 있는 방명록. 비밀번호로 관리됩니다.</p>
          </div>
          <div className="land-feature reveal" style={{ transitionDelay: '0.2s' }}>
            <h4>포토 갤러리</h4>
            <p>웨딩 사진을 슬라이드 또는 그리드로 보여주세요. 다양한 레이아웃을 지원합니다.</p>
          </div>
          <div className="land-feature reveal" style={{ transitionDelay: '0.1s' }}>
            <h4>지도 & 길안내</h4>
            <p>카카오맵 연동으로 예식장 위치를 정확히 안내합니다. 주소 검색으로 간편 등록.</p>
          </div>
          <div className="land-feature reveal" style={{ transitionDelay: '0.2s' }}>
            <h4>카카오톡 공유</h4>
            <p>카카오톡으로 청첩장을 바로 공유하세요. 제목, 설명, 이미지를 자유롭게 설정할 수 있습니다.</p>
          </div>
          <div className="land-feature reveal" style={{ transitionDelay: '0.3s' }}>
            <h4>축의금 계좌</h4>
            <p>신랑, 신부 측 계좌를 등록하면 하객이 쉽게 복사하여 송금할 수 있습니다.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="land-section land-bottom-cta reveal">
        <h2>지금 바로 시작하세요</h2>
        <p>소중한 하루를 위한 청첩장,<br />Sonett과 함께 만들어보세요.</p>
        <Link to="/editor" className="land-cta primary large">청첩장 만들기</Link>
      </section>

      {/* Footer */}
      <footer className="land-footer">
        <p>© 2026 Sonett. All rights reserved.</p>
      </footer>

      <style>{`
        .landing {
          min-height: 100vh;
          background: #fff;
          font-family: 'Pretendard', sans-serif;
          overflow-x: hidden;
        }

        /* Scroll Reveal */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* Hero */
        .land-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 85vh;
          padding: 60px 24px;
          text-align: center;
          background: linear-gradient(180deg, #FDFBFC 0%, #FDF6F9 100%);
        }
        .land-hero-sub {
          font-size: 0.75rem;
          letter-spacing: 5px;
          color: #B07A8E;
          margin: 0 0 24px;
          font-weight: 600;
        }
        .land-hero-title {
          font-size: 2.8rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 20px;
          line-height: 1.35;
        }
        .land-hero-desc {
          font-size: 1.05rem;
          color: #6B7280;
          margin: 0 0 44px;
          line-height: 1.7;
        }

        /* CTA */
        .land-cta {
          display: inline-block;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.25s;
        }
        .land-cta.primary {
          background: #B07A8E;
          color: white;
          padding: 16px 44px;
          border-radius: 50px;
          font-size: 1rem;
          box-shadow: 0 4px 20px rgba(176, 122, 142, 0.25);
        }
        .land-cta.primary:hover {
          background: #9B6A7E;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(176, 122, 142, 0.35);
        }
        .land-cta.large {
          padding: 18px 52px;
          font-size: 1.1rem;
        }

        /* Sections */
        .land-section {
          padding: 100px 24px;
          max-width: 960px;
          margin: 0 auto;
        }
        .land-section-sub {
          text-align: center;
          font-size: 0.75rem;
          letter-spacing: 5px;
          color: #B07A8E;
          margin: 0 0 12px;
          font-weight: 600;
        }
        .land-section-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 52px;
        }

        /* Key Points */
        .land-points {
          background: #FAFAFA;
          max-width: 100%;
          padding: 80px 24px;
        }
        .land-points-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          max-width: 960px;
          margin: 0 auto;
        }
        .land-point {
          text-align: center;
          padding: 32px 16px;
        }
        .land-point-num {
          font-size: 2rem;
          font-weight: 800;
          color: #B07A8E;
          opacity: 0.3;
          margin-bottom: 16px;
          font-family: 'Georgia', serif;
        }
        .land-point h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 10px;
        }
        .land-point p {
          font-size: 0.88rem;
          color: #6B7280;
          line-height: 1.65;
          margin: 0;
        }

        /* Steps */
        .land-steps-list {
          display: flex;
          align-items: flex-start;
          gap: 0;
          justify-content: center;
        }
        .land-step {
          flex: 1;
          text-align: center;
          padding: 0 20px;
          max-width: 280px;
        }
        .land-step-badge {
          display: inline-block;
          background: linear-gradient(135deg, #B07A8E, #D4A5C6);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 20px;
          letter-spacing: 1px;
          margin-bottom: 18px;
        }
        .land-step h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 12px;
        }
        .land-step p {
          font-size: 0.88rem;
          color: #6B7280;
          line-height: 1.65;
          margin: 0;
        }
        .land-step-divider {
          width: 60px;
          height: 1px;
          background: #E5E7EB;
          margin-top: 36px;
          flex-shrink: 0;
        }

        /* Features */
        .land-features {
          background: #FAFAFA;
          max-width: 100%;
          padding: 100px 24px;
        }
        .land-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 960px;
          margin: 0 auto;
        }
        .land-feature {
          background: white;
          border-radius: 16px;
          padding: 32px 28px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .land-feature:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }
        .land-feature h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 10px;
        }
        .land-feature p {
          font-size: 0.85rem;
          color: #6B7280;
          line-height: 1.65;
          margin: 0;
        }

        /* Bottom CTA */
        .land-bottom-cta {
          text-align: center;
          padding: 100px 24px 120px;
        }
        .land-bottom-cta h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 12px;
        }
        .land-bottom-cta p {
          font-size: 1rem;
          color: #6B7280;
          margin: 0 0 36px;
          line-height: 1.6;
        }

        /* Footer */
        .land-footer {
          text-align: center;
          padding: 24px;
          border-top: 1px solid #F0F0F0;
          color: #9CA3AF;
          font-size: 0.8rem;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .land-hero-title { font-size: 1.8rem; }
          .land-hero { min-height: 70vh; padding: 40px 20px; }
          .land-points-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .land-steps-list { flex-direction: column; align-items: center; gap: 32px; }
          .land-step-divider { width: 1px; height: 40px; margin: 0; }
          .land-features-grid { grid-template-columns: 1fr; }
          .land-section { padding: 60px 20px; }
          .land-section-title { font-size: 1.5rem; margin-bottom: 36px; }
        }
        @media (max-width: 480px) {
          .land-hero-title { font-size: 1.5rem; }
          .land-points-grid { grid-template-columns: 1fr; }
          .land-cta.primary { width: 100%; text-align: center; box-sizing: border-box; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
