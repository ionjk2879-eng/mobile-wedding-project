import React from 'react';
import { useLocation } from 'react-router-dom';

const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/gP7YR8Hi';

// 청첩장 뷰·갤러리·관리자 페이지 등 사이트 외부 UI에서는 숨긴다
const HIDDEN_PATTERNS = [
  /^\/gallery\//,
  /^\/admin\//,
  /^\/auth\//,
];

const KNOWN_SITE_PATHS = new Set([
  '/', '/manage', '/templates', '/events', '/reviews',
  '/guide', '/contact', '/board', '/terms', '/privacy',
  '/editor', '/invite', '/superadmin',
]);

function useShouldShow(): boolean {
  const { pathname } = useLocation();

  if (HIDDEN_PATTERNS.some((re) => re.test(pathname))) return false;

  // 알려진 사이트 경로이거나 그 하위 경로면 표시
  if (KNOWN_SITE_PATHS.has(pathname)) return true;
  for (const p of KNOWN_SITE_PATHS) {
    if (p !== '/' && pathname.startsWith(p + '/')) return true;
  }

  // /:slug 형태 (청첩장 뷰) — 숨긴다
  return false;
}

const KakaoOpenChatFab: React.FC = () => {
  const show = useShouldShow();
  if (!show) return null;

  return (
    <a
      href={KAKAO_OPEN_CHAT_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: 28,
        right: 24,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#FEE500',
        color: '#3C1E1E',
        borderRadius: 50,
        padding: '11px 18px 11px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        fontFamily: "'Pretendard', sans-serif",
        fontSize: 13,
        fontWeight: 700,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.22)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = '';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
      }}
      aria-label="카카오 오픈채팅방 바로가기"
    >
      {/* KakaoTalk speech bubble icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <ellipse cx="12" cy="11" rx="10" ry="8.5" fill="#3C1E1E"/>
        <path d="M8 15.5c-.4 1.2-.9 2.5-1.2 3 2-.6 3.3-1.4 3.8-1.7.5.1 1 .2 1.4.2 5.5 0 10-3.8 10-8.5S17.5 0 12 0 2 3.8 2 8.5c0 2.5 1.2 4.7 3.1 6.3L8 15.5z" fill="#3C1E1E" opacity="0"/>
        <ellipse cx="12" cy="10.5" rx="9" ry="7.5" fill="#3C1E1E"/>
        <circle cx="8.5" cy="10.5" r="1.3" fill="#FEE500"/>
        <circle cx="12" cy="10.5" r="1.3" fill="#FEE500"/>
        <circle cx="15.5" cy="10.5" r="1.3" fill="#FEE500"/>
      </svg>
      오픈채팅
    </a>
  );
};

export default KakaoOpenChatFab;
