import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SiteHeader: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <header className="site-header">
      <Link to="/" className="site-logo">Sonett</Link>
      <nav className="site-nav">
        <Link to="/editor" className={`site-nav-link ${pathname.startsWith('/editor') || pathname.startsWith('/edit') ? 'active' : ''}`}>모바일 청첩장</Link>
        <Link to="/manage" className={`site-nav-link ${pathname === '/manage' ? 'active' : ''}`}>청첩장 관리</Link>
      </nav>

      <style>{`
        .site-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background: white;
          border-bottom: 1px solid #F0F0F0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .site-logo {
          font-size: 1.4rem;
          font-weight: 700;
          color: #B07A8E;
          text-decoration: none;
          letter-spacing: 2px;
        }
        .site-nav {
          display: flex;
          gap: 24px;
        }
        .site-nav-link {
          text-decoration: none;
          color: #6B7280;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 6px 0;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .site-nav-link:hover {
          color: #B07A8E;
        }
        .site-nav-link.active {
          color: #B07A8E;
          border-bottom-color: #B07A8E;
        }
        @media (max-width: 480px) {
          .site-header { padding: 12px 16px; }
          .site-nav { gap: 16px; }
          .site-nav-link { font-size: 0.85rem; }
        }
      `}</style>
    </header>
  );
};

export default SiteHeader;
