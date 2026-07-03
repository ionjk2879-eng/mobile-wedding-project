import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { signInWithGoogle, signOut, deleteAccount, initiateKakaoLogin, initiateNaverLogin } from '../services/auth';
import { LogIn, LogOut, UserX } from 'lucide-react';
import { useSiteLang, SiteLang } from '../i18n';

const getProviderLabel = (uid: string) => {
  if (uid.startsWith('kakao_')) return 'Kakao';
  if (uid.startsWith('naver_')) return 'Naver';
  return 'Google';
};

const LANG_LABELS: Record<SiteLang, string> = { ko: 'KO', en: 'EN', ja: 'JA' };

const SiteHeader: React.FC = () => {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const { lang, setLang, t } = useSiteLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleDeleteAccount = async () => {
    if (!confirm('정말 회원탈퇴 하시겠습니까?\n저장된 청첩장 데이터는 별도로 삭제되지 않습니다.')) return;
    try {
      await deleteAccount();
    } catch {
      alert('회원탈퇴에 실패했습니다. 다시 로그인 후 시도해주세요.');
    }
  };

  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const loginMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loginMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (loginMenuRef.current && !loginMenuRef.current.contains(e.target as Node)) {
        setLoginMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [loginMenuOpen]);

  return (
    <header className="site-header">
      <div className="site-header-left">
        <Link to="/" className="site-logo">Sonett</Link>
        <nav className="site-nav-left">
          <Link to="/" className={`site-nav-link ${pathname === '/' ? 'active' : ''}`}>{t.site.mobileWedding}</Link>
          <Link to="/templates" className={`site-nav-link ${pathname === '/templates' ? 'active' : ''}`}>{t.site.templates}</Link>
        </nav>
      </div>
      <div className="site-header-right">
        <Link to="/manage" className={`site-nav-link ${pathname === '/manage' ? 'active' : ''}`}>{t.site.manage}</Link>
        <div className="site-lang-switcher">
          {(['ko', 'en', 'ja'] as SiteLang[]).map((l) => (
            <button
              key={l}
              className={`site-lang-btn ${lang === l ? 'active' : ''}`}
              onClick={() => setLang(l)}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
        <div className="site-auth" ref={menuRef}>
          {loading ? (
            <span className="site-auth-loading">...</span>
          ) : user ? (
            <>
              <button className="site-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
                {user.photo ? (
                  <img src={user.photo} alt="" className="site-auth-avatar" referrerPolicy="no-referrer" />
                ) : (
                  <div className="site-auth-avatar-fallback">
                    {(user.name || '?')[0]}
                  </div>
                )}
              </button>
              {menuOpen && (
                <div className="site-auth-menu">
                  <div className="site-auth-menu-info">
                    <span className="site-auth-provider">{getProviderLabel(user.uid)}</span>
                    {user.name && <span className="site-auth-menu-name">{user.name}</span>}
                    {user.email && <span className="site-auth-menu-email">{user.email}</span>}
                  </div>
                  <div className="site-auth-menu-divider" />
                  <button className="site-auth-menu-btn" onClick={() => { setMenuOpen(false); signOut(); }}>
                    <LogOut size={14} /> {t.site.logout}
                  </button>
                  <button className="site-auth-menu-btn danger" onClick={() => { setMenuOpen(false); handleDeleteAccount(); }}>
                    <UserX size={14} /> {t.site.deleteAccount}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div ref={loginMenuRef} style={{ position: 'relative' }}>
              <button className="site-auth-btn login" onClick={() => setLoginMenuOpen(!loginMenuOpen)}>
                <LogIn size={14} /> {t.site.login}
              </button>
              {loginMenuOpen && (
                <div className="site-auth-menu" style={{ minWidth: '200px' }}>
                  <button className="site-auth-menu-btn" onClick={() => { setLoginMenuOpen(false); initiateKakaoLogin(pathname); }} style={{ gap: '10px' }}>
                    <span style={{ width: 16, height: 16, background: '#FEE500', borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 20 20" fill="none"><path d="M10 2C5.03 2 1 5.13 1 8.97c0 2.48 1.65 4.66 4.13 5.88-.18.67-.66 2.42-.75 2.8-.12.47.17.46.36.34.15-.1 2.37-1.61 3.33-2.27.3.04.61.06.93.06 4.97 0 9-3.13 9-6.97C19 5.13 14.97 2 10 2Z" fill="#191919"/></svg>
                    </span>
                    {t.site.loginWithKakao}
                  </button>
                  <button className="site-auth-menu-btn" onClick={() => { setLoginMenuOpen(false); initiateNaverLogin(pathname); }} style={{ gap: '10px' }}>
                    <span style={{ width: 16, height: 16, background: '#03C75A', borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 20 20" fill="none"><path d="M13.56 10.7 6.15 3H3v14h3.44V9.3L13.85 17H17V3h-3.44v7.7Z" fill="white"/></svg>
                    </span>
                    {t.site.loginWithNaver}
                  </button>
                  <button className="site-auth-menu-btn" onClick={() => { setLoginMenuOpen(false); signInWithGoogle(); }} style={{ gap: '10px' }}>
                    <span style={{ width: 16, height: 16, background: '#4285F4', borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 20 20" fill="none"><path d="M19.6 10.23c0-.68-.06-1.36-.17-2.01H10v3.8h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.73 2.98-4.3 2.98-7.31Z" fill="white"/><path d="M10 20c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.58-4.12H1.08v2.58A9.99 9.99 0 0 0 10 20Z" fill="white"/><path d="M4.42 11.9a6.02 6.02 0 0 1 0-3.82V5.5H1.08a10 10 0 0 0 0 8.98l3.34-2.58Z" fill="white"/><path d="M10 3.96c1.47 0 2.78.5 3.82 1.5l2.86-2.87A10 10 0 0 0 1.08 5.5l3.34 2.58c.78-2.36 2.98-4.12 5.58-4.12Z" fill="white"/></svg>
                    </span>
                    {t.site.loginWithGoogle}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
        .site-header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .site-header-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .site-logo {
          font-size: 1.4rem;
          font-weight: 700;
          color: #B07A8E;
          text-decoration: none;
          letter-spacing: 2px;
        }
        .site-nav-left {
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
        .site-auth {
          position: relative;
          display: flex;
          align-items: center;
        }
        .site-auth-loading {
          color: #9CA3AF;
          font-size: 0.85rem;
        }
        .site-avatar-btn {
          background: none;
          border: 2px solid transparent;
          border-radius: 50%;
          padding: 0;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .site-avatar-btn:hover {
          border-color: #D4A5C6;
        }
        .site-auth-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }
        .site-auth-avatar-fallback {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #D4A5C6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .site-auth-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border-radius: 14px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          border: 1px solid #F0F0F0;
          min-width: 220px;
          padding: 6px;
          animation: site-menu-in 0.15s ease;
          z-index: 200;
        }
        @keyframes site-menu-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .site-auth-menu-info {
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .site-auth-provider {
          font-size: 0.7rem;
          font-weight: 700;
          color: white;
          background: #B07A8E;
          padding: 2px 8px;
          border-radius: 6px;
          align-self: flex-start;
          margin-bottom: 2px;
        }
        .site-auth-menu-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: #1F2937;
        }
        .site-auth-menu-email {
          font-size: 0.78rem;
          color: #9CA3AF;
          word-break: break-all;
        }
        .site-auth-menu-divider {
          height: 1px;
          background: #F0F0F0;
          margin: 4px 8px;
        }
        .site-auth-menu-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 14px;
          border: none;
          border-radius: 10px;
          background: none;
          font-size: 0.82rem;
          font-weight: 600;
          color: #4B5563;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
          text-align: left;
        }
        .site-auth-menu-btn:hover {
          background: #F9FAFB;
          color: #1F2937;
        }
        .site-auth-menu-btn.danger {
          color: #DC2626;
        }
        .site-auth-menu-btn.danger:hover {
          background: #FEF2F2;
          color: #B91C1C;
        }
        .site-auth-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          border: none;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .site-auth-btn.login {
          background: #B07A8E;
          color: white;
          padding: 8px 16px;
        }
        .site-auth-btn.login:hover {
          background: #9B6A7E;
        }
        .site-lang-switcher {
          display: flex;
          align-items: center;
          gap: 2px;
          background: #F3F4F6;
          border-radius: 8px;
          padding: 3px;
        }
        .site-lang-btn {
          border: none;
          background: none;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #9CA3AF;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
          letter-spacing: 0.03em;
        }
        .site-lang-btn.active {
          background: white;
          color: #B07A8E;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .site-lang-btn:hover:not(.active) {
          color: #6B7280;
        }
        @media (max-width: 480px) {
          .site-header { padding: 12px 16px; }
          .site-header-left { gap: 16px; }
          .site-header-right { gap: 10px; }
          .site-nav-link { font-size: 0.85rem; }
          .site-auth-btn.login { padding: 6px 12px; font-size: 0.78rem; }
          .site-auth-menu { min-width: 200px; right: -4px; }
          .site-lang-btn { padding: 3px 6px; font-size: 0.68rem; }
        }
      `}</style>
    </header>
  );
};

export default SiteHeader;
