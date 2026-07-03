import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { useSiteLang } from '../i18n';

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
  const { t } = useSiteLang();
  const tl = t.landing;

  return (
    <div className="landing" ref={containerRef}>
      <SiteHeader />

      {/* Hero */}
      <section className="land-hero">
        <div className="land-hero-brand">
          <img src="/logo-icon.png" alt="" className="land-hero-brand-icon" />
          <img src="/logo-wordmark.png" alt="Sonett" className="land-hero-brand-wordmark" />
        </div>
        <p className="land-hero-sub">MOBILE WEDDING INVITATION</p>
        <h1 className="land-hero-title">{tl.heroTitle.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < tl.heroTitle.split('\n').length - 1 && <br />}</React.Fragment>)}</h1>
        <p className="land-hero-desc">{tl.heroDesc.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < tl.heroDesc.split('\n').length - 1 && <br />}</React.Fragment>)}</p>
        <Link to="/editor" className="land-cta primary">{tl.ctaCreate}</Link>
      </section>

      {/* Key Points */}
      <section className="land-section land-points">
        <div className="land-points-grid">
          <div className="land-point reveal">
            <div className="land-point-num">01</div>
            <h3>{tl.point1Title}</h3>
            <p>{tl.point1Desc.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < tl.point1Desc.split('\n').length - 1 && <br />}</React.Fragment>)}</p>
          </div>
          <div className="land-point reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="land-point-num">02</div>
            <h3>{tl.point2Title}</h3>
            <p>{tl.point2Desc.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < tl.point2Desc.split('\n').length - 1 && <br />}</React.Fragment>)}</p>
          </div>
          <div className="land-point reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="land-point-num">03</div>
            <h3>{tl.point3Title}</h3>
            <p>{tl.point3Desc.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < tl.point3Desc.split('\n').length - 1 && <br />}</React.Fragment>)}</p>
          </div>
          <div className="land-point reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="land-point-num">04</div>
            <h3>{tl.point4Title}</h3>
            <p>{tl.point4Desc.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < tl.point4Desc.split('\n').length - 1 && <br />}</React.Fragment>)}</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="land-section land-steps">
        <p className="land-section-sub reveal">{tl.howItWorksLabel}</p>
        <h2 className="land-section-title reveal">{tl.howItWorksTitle}</h2>

        <div className="land-steps-list">
          <div className="land-step reveal">
            <div className="land-step-badge">Step 1</div>
            <h3>{tl.step1Title}</h3>
            <p>{tl.step1Desc.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < tl.step1Desc.split('\n').length - 1 && <br />}</React.Fragment>)}</p>
          </div>
          <div className="land-step-divider reveal" />
          <div className="land-step reveal" style={{ transitionDelay: '0.15s' }}>
            <div className="land-step-badge">Step 2</div>
            <h3>{tl.step2Title}</h3>
            <p>{tl.step2Desc.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < tl.step2Desc.split('\n').length - 1 && <br />}</React.Fragment>)}</p>
          </div>
          <div className="land-step-divider reveal" />
          <div className="land-step reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="land-step-badge">Step 3</div>
            <h3>{tl.step3Title}</h3>
            <p>{tl.step3Desc.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < tl.step3Desc.split('\n').length - 1 && <br />}</React.Fragment>)}</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="land-section land-features">
        <p className="land-section-sub reveal">{tl.featuresLabel}</p>
        <h2 className="land-section-title reveal">{tl.featuresTitle}</h2>

        <div className="land-features-grid">
          <div className="land-feature reveal">
            <h4>{tl.feat1Title}</h4>
            <p>{tl.feat1Desc}</p>
          </div>
          <div className="land-feature reveal" style={{ transitionDelay: '0.1s' }}>
            <h4>{tl.feat2Title}</h4>
            <p>{tl.feat2Desc}</p>
          </div>
          <div className="land-feature reveal" style={{ transitionDelay: '0.2s' }}>
            <h4>{tl.feat3Title}</h4>
            <p>{tl.feat3Desc}</p>
          </div>
          <div className="land-feature reveal" style={{ transitionDelay: '0.1s' }}>
            <h4>{tl.feat4Title}</h4>
            <p>{tl.feat4Desc}</p>
          </div>
          <div className="land-feature reveal" style={{ transitionDelay: '0.2s' }}>
            <h4>{tl.feat5Title}</h4>
            <p>{tl.feat5Desc}</p>
          </div>
          <div className="land-feature reveal" style={{ transitionDelay: '0.3s' }}>
            <h4>{tl.feat6Title}</h4>
            <p>{tl.feat6Desc}</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="land-section land-bottom-cta reveal">
        <h2>{tl.bottomCtaTitle}</h2>
        <p>{tl.bottomCtaDesc.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < tl.bottomCtaDesc.split('\n').length - 1 && <br />}</React.Fragment>)}</p>
        <Link to="/editor" className="land-cta primary large">{tl.ctaCreate}</Link>
      </section>

      {/* Footer */}
      <footer className="land-footer">
        <div className="land-footer-links">
          <Link to="/terms">{tl.terms}</Link>
          <span>|</span>
          <Link to="/privacy" className="land-footer-privacy">{tl.privacy}</Link>
        </div>
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
        .land-hero-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin: 0 0 8px;
        }
        .land-hero-brand-icon {
          height: 54px;
          width: auto;
          object-fit: contain;
          display: block;
        }
        .land-hero-brand-wordmark {
          height: 48px;
          width: auto;
          object-fit: contain;
          display: block;
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
        .land-footer-links {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 10px;
          font-size: 0.78rem;
        }
        .land-footer-links a {
          color: #9CA3AF;
          text-decoration: none;
          transition: color 0.15s;
        }
        .land-footer-links a:hover { color: #6B7280; }
        .land-footer-links span { color: #D1D5DB; }
        .land-footer-privacy { font-weight: 700; }

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
          .land-hero-brand-icon { height: 42px; }
          .land-hero-brand-wordmark { height: 36px; }
          .land-hero-title { font-size: 1.5rem; }
          .land-points-grid { grid-template-columns: 1fr; }
          .land-cta.primary { width: 100%; text-align: center; box-sizing: border-box; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
