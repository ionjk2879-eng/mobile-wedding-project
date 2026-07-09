import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Heart, FileHeart, List, Menu, ChevronDown, ChevronUp, ArrowUp, BadgeCheck } from 'lucide-react';
import { InvitationData, GuestRelation } from '../types';
import InvitationView, { buildSectionOrder, SECTION_NAV_INFO, DEFAULT_ORDER } from '../components/Preview/InvitationView';
import ToastContainer from '../components/Toast';
import { ScrollRootContext } from '../components/Preview/ScrollReveal';
import { loadFont } from '../utils/loadFont';
import { loadInvitationPublic } from '../services/publicLoad';
import useAuthStore from '../stores/useAuthStore';
import '../styles/effects.css';

const SITE_ORIGIN = 'https://sonett.kr';

const Watermark: React.FC = () => (
  <a href={SITE_ORIGIN} target="_blank" rel="noopener noreferrer" className="wm-banner">
    <span className="wm-logo">Sonett</span>
    <span className="wm-text">지금 바로 모바일 청첩장</span>
    <span className="wm-cta">지금 만들기 &rsaquo;</span>
  </a>
);

const PromoSection: React.FC = () => (
  <div className="promo-section">
    <p className="promo-brand">Sonett</p>
    <p className="promo-title">나만의 모바일 청첩장</p>
    <p className="promo-desc">워터마크 없이, 더 아름답게.<br />지금 Sonett에서 직접 만들어보세요.</p>
    <a href={SITE_ORIGIN} target="_blank" rel="noopener noreferrer" className="promo-cta">
      워터마크 제거하기 &rsaquo;
    </a>
  </div>
);

// 유료 청첩장 전용 — 워터마크/프로모션 박스 대신, 청첩장 배경색에 자연스럽게 어우러지는
// 인증마크. "~에서 제작되었다"는 문구는 오히려 무료판처럼 보여 로고만 남긴다.
const SonettBadge: React.FC = () => (
  <a href={SITE_ORIGIN} target="_blank" rel="noopener noreferrer" className="sonett-badge">
    <BadgeCheck size={13} />
    <span>Sonett</span>
  </a>
);

interface ViewPageProps {
  slugOverride?: string;
  guestName?: string;
  guestRelation?: GuestRelation;
  guestCode?: string;
  guestMessageIndex?: number | null;
}

const ViewPage: React.FC<ViewPageProps> = ({ slugOverride, guestName, guestRelation, guestCode, guestMessageIndex }) => {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugOverride || slugParam;
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // 세션 동안만 유지되는 임시 미리보기 전환 — 새로고침하면 기본값(URL 파라미터 또는
  // 서버가 계산한 예식일+24시간 경과 여부)으로 되돌아간다.
  const [modeOverride, setModeOverride] = useState<'invitation' | 'anniversary' | null>(null);
  const authUser = useAuthStore((s) => s.user);
  // 우측 하단 메뉴 FAB: 아이콘만 노출되고, 안에 섹션 이동 / 기념일 모드 미리보기를 담는다.
  const [showMenu, setShowMenu] = useState(false);
  const [sectionListOpen, setSectionListOpen] = useState(false);
  // 오프닝 애니메이션이 떠 있는 동안(z-index 99999)에는 이 FAB(z-index 100000)가 그 위에
  // 겹쳐 보이지 않도록 InvitationView가 useLayoutEffect로 알려주는 값을 그대로 따른다.
  const [openingActive, setOpeningActive] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // 섹션 이동 기능이 스크롤할 대상 ref들 — InvitationView에 previewRefs로 그대로 넘겨
  // 편집용 미리보기와 동일한 방식으로 각 섹션 DOM에 ref를 붙인다(onSectionNav를 안 넘기므로
  // 에디터용 오버레이 버튼은 렌더링되지 않는다).
  const sectionRefsHolder = useRef<Record<string, React.RefObject<HTMLDivElement>> | null>(null);
  if (!sectionRefsHolder.current) {
    sectionRefsHolder.current = Object.fromEntries(
      ['hero', ...DEFAULT_ORDER, 'midphoto'].map((id) => [id, React.createRef<HTMLDivElement>()])
    );
  }
  const sectionRefs = sectionRefsHolder.current;

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setSectionListOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  useEffect(() => {
    if (!slug) return;
    loadInvitationPublic(slug).then(d => {
      if (d) {
        setData(d);
        loadFont(d.fontFamily);
      }
      else setError(true);
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", color: '#9CA3AF' }}>
      <p>불러오는 중...</p>
    </div>
  );
  if (error || !data) return <div className="view-error" role="alert"><h2>청첩장을 찾을 수 없습니다</h2><p>주소를 다시 확인해주세요.</p></div>;

  const isExpired = !data.isPaid && data.expiresAt && new Date(data.expiresAt) < new Date();
  if (isExpired) return (
    <div className="view-error" role="alert">
      <p className="view-expired-icon">⏰</p>
      <h2>공유 기간이 만료되었습니다</h2>
      <p>이 청첩장의 공유 기간이 만료되었습니다.<br />새로운 청첩장 시작에 대해 문의해주세요.</p>
      <a href={SITE_ORIGIN} className="view-expired-link">Sonett에서 청첩장 만들기</a>
      <style>{`
        .view-expired-icon { font-size: 2.5rem; margin: 0 0 12px; }
        .view-expired-link {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 28px;
          background: #B07A8E;
          color: white;
          border-radius: 30px;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'Pretendard', sans-serif;
        }
      `}</style>
    </div>
  );

  const getBaseFontSize = () => {
    switch (data.fontSize) { case 'small': return '13px'; case 'large': return '16px'; default: return '14.5px'; }
  };

  const showWatermark = !data.isPaid;

  // 기념일 모드 전환 로직.
  // - ?mode= URL 파라미터가 있으면(공유 링크 등에서 명시적으로 강제) 그 값을 기본으로 삼는다.
  // - 없으면 서버가 계산해 내려준 예식일+24시간 경과 여부(isPastAnniversaryThreshold)로 기본값을 정한다.
  // - modeOverride는 화면에서 토글 버튼을 눌렀을 때만 채워지는 세션 한정 임시 상태다.
  const canAnniversaryMode = !!data.isPaid;
  const isPastAnniversaryThreshold = !!data.isPastAnniversaryThreshold;
  // ownerUid는 공개 응답에도 항상 포함되는 값이라(민감 정보 아님) 클라이언트에서 비교해도 안전하다 —
  // 관리자 API들처럼 서버가 매번 로그인 헤더로 소유권을 재확인하는 대신, 이미 내려온 값과 현재
  // 로그인 사용자를 비교하는 방식. 실제 데이터 마스킹(계좌/RSVP)은 이 값과 무관하게 서버가
  // Authorization 헤더 기준으로 별도 판단하므로, 여기서의 비교는 토글 버튼 노출 여부에만 영향을 준다.
  const isOwner = !!authUser && !!data.ownerUid && authUser.uid === data.ownerUid;

  const urlMode = searchParams.get('mode');
  const forcedMode: 'invitation' | 'anniversary' | null = urlMode === 'anniversary' ? 'anniversary' : urlMode === 'invitation' ? 'invitation' : null;
  const defaultMode: 'invitation' | 'anniversary' = isPastAnniversaryThreshold ? 'anniversary' : 'invitation';
  const currentMode: 'invitation' | 'anniversary' = canAnniversaryMode ? (modeOverride ?? forcedMode ?? defaultMode) : 'invitation';
  const anniversaryMode = currentMode === 'anniversary';

  // 예식일+24시간 이전엔 소유자만 토글이 보인다(자기 청첩장 미리보기 목적).
  // 이후엔 누구나 토글로 오갈 수 있다.
  const showModeToggle = canAnniversaryMode && (isPastAnniversaryThreshold || isOwner);
  // 예식 전엔 기본이 청첩장 모드라서, 되돌아가는 방향은 "다른 모드로 전환"이 아니라
  // "미리보기 종료" 뉘앙스가 자연스럽다. 예식 후엔 둘 다 정식 모드라 "OO 모드로 보기"로 대칭.
  const modeToggleLabel = !isPastAnniversaryThreshold
    ? (currentMode === 'invitation' ? '기념일 모드 미리보기' : '미리보기 종료')
    : (currentMode === 'anniversary' ? '청첩장 모드로 보기' : '기념일 모드로 보기');
  const handleToggleMode = () => setModeOverride(currentMode === 'anniversary' ? 'invitation' : 'anniversary');
  const handleModeToggleClick = () => {
    handleToggleMode();
    setShowMenu(false);
    setSectionListOpen(false);
  };

  // 청첩장을 이루는 섹션 중 실제로 렌더링되는 것만(데이터의 on/off 토글·순서 반영), 에디터와
  // 동일한 buildSectionOrder 로직으로 계산 — 렌더링 목록과 항상 일치한다.
  const isEn = data.language === 'en', isJa = data.language === 'ja';
  const navSectionIds = ['hero', ...buildSectionOrder(data)].filter((id) => id !== 'midphoto' && SECTION_NAV_INFO[id]);
  const sectionLabel = (id: string) => {
    const info = SECTION_NAV_INFO[id];
    return isEn ? info.labelEn : isJa ? info.labelJa : info.label;
  };
  const handleSectionNavClick = (id: string) => {
    sectionRefs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setShowMenu(false);
    setSectionListOpen(false);
  };
  // window.scrollTo는 실제 스크롤 컨테이너가 아닐 수 있어 동작하지 않을 때가 있다 — 다른 섹션
  // 이동 버튼들과 동일하게 hero ref로의 scrollIntoView를 사용해 항상 같은 방식으로 동작시킨다.
  const handleScrollToTop = () => handleSectionNavClick('hero');

  return (
    <div className="view-container" style={{ fontFamily: data.fontFamily }}>
      <ToastContainer />
      <div className={`invitation-page theme-${data.theme || 'blush'}`} style={{ fontSize: getBaseFontSize(), ...(data.customBgColor ? { '--wedding-bg': data.customBgColor } as React.CSSProperties : {}), ...(data.customAccentColor ? { '--wedding-main': data.customAccentColor } as React.CSSProperties : {}), ...(data.customLabelColor ? { '--wedding-label': data.customLabelColor } as React.CSSProperties : {}), ...(data.customTextColor ? { '--wedding-emphasis': data.customTextColor } as React.CSSProperties : {}) }}>
        <ScrollRootContext.Provider value={null}>
          <InvitationView data={data} previewRefs={sectionRefs} showOpening shareEnabled={!!data.isPaid} forceAnniversaryMode={anniversaryMode} guestName={guestName} guestRelation={guestRelation} guestCode={guestCode} guestMessageIndex={guestMessageIndex} enableAnonymousOpening onOpeningActiveChange={setOpeningActive} />
        </ScrollRootContext.Provider>
        {showWatermark && <Watermark />}
        {showWatermark && <PromoSection />}
        {data.isPaid && <SonettBadge />}
      </div>

      {!openingActive && (navSectionIds.length > 0 || showModeToggle) && (
        <div className="view-menu-fab-wrap" ref={menuRef}>
          {showMenu && (
            <div className="view-menu-sheet">
              {navSectionIds.length > 0 && (
                <>
                  <button type="button" className="view-menu-option" onClick={() => setSectionListOpen((v) => !v)}>
                    <List size={14} />
                    <span className="view-menu-option-label">{isEn ? 'Sections' : isJa ? 'セクション' : '섹션 이동'}</span>
                    {sectionListOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {sectionListOpen && (
                    <div className="view-menu-section-list">
                      {navSectionIds.map((id) => (
                        <button key={id} className="view-menu-option view-menu-option-nested" onClick={() => handleSectionNavClick(id)}>
                          {SECTION_NAV_INFO[id].icon}
                          <span className="view-menu-option-label">{sectionLabel(id)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              {showModeToggle && (
                <button type="button" className="view-menu-option" onClick={handleModeToggleClick}>
                  {currentMode === 'anniversary' ? <FileHeart size={14} /> : <Heart size={14} />}
                  <span className="view-menu-option-label">{modeToggleLabel}</span>
                </button>
              )}
            </div>
          )}
          <button type="button" className="view-menu-fab view-top-fab" onClick={handleScrollToTop} aria-label={isEn ? 'Scroll to top' : isJa ? '上部へ' : '맨 위로'}>
            <ArrowUp size={16} />
          </button>
          <button type="button" className="view-menu-fab" onClick={() => setShowMenu((v) => !v)} aria-label={isEn ? 'Menu' : isJa ? 'メニュー' : '메뉴'}>
            <Menu size={18} />
          </button>
        </div>
      )}

      <style>{`
        /* align-items 기본값(stretch)에서는 .invitation-page의 min-height:100svh와 겹쳐
           .view-container/.invitation-page의 페인트 영역이 카드 마지막 자식(워터마크/인증마크)
           앞에서 끊기고, 그 아래는 :root의 기본 배경색이 전체 폭으로 드러나 보였다.
           flex-start로 stretch를 끄면 카드가 실제 콘텐츠 높이만큼 정상적으로 끝까지 포함된다. */
        .view-container { width: 100%; min-height: 100svh; background: #EBEBEB; display: flex; justify-content: center; align-items: flex-start; overflow-anchor: none; }
        /* .invitation-page는 기본 max-width:430px로 뷰포트 중앙에 놓인다 — PC처럼 뷰포트가
           넓을 때도 이 메뉴 FAB가 청첩장 카드 기준 우측 하단에 붙도록, 뷰포트 우측 끝이 아니라
           카드 우측 끝에서부터 16px 떨어지게 계산한다. 480px 이하에서는 카드가 뷰포트 전체 폭을
           채우므로(.invitation-page 미디어쿼리와 동일 기준) 그냥 뷰포트 기준 16px로 되돌아간다. */
        .view-menu-fab-wrap {
          position: fixed; bottom: 20px; z-index: 100000;
          right: calc((100vw - min(100vw, 430px)) / 2 + 16px);
          display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
        }
        .view-menu-fab {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border: 1px solid rgba(0,0,0,0.06); border-radius: 50%;
          background: rgba(255,255,255,0.72); color: #8B95A1; backdrop-filter: blur(6px);
          box-shadow: 0 2px 10px rgba(0,0,0,0.08); cursor: pointer; transition: opacity 0.2s, background 0.2s;
        }
        .view-menu-fab:hover { opacity: 0.85; background: rgba(255,255,255,0.9); }
        .view-top-fab { width: 36px; height: 36px; }
        .view-menu-sheet { background: rgba(255,255,255,0.92); backdrop-filter: blur(6px); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); min-width: 190px; max-height: 60vh; overflow-y: auto; }
        .view-menu-option { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; border: none; background: none; cursor: pointer; font-family: 'Pretendard', sans-serif; font-size: 0.88rem; color: #6B7280; border-radius: 10px; transition: background 0.15s; box-sizing: border-box; white-space: nowrap; }
        .view-menu-option:hover { background: rgba(0,0,0,0.045); }
        .view-menu-option-label { flex: 1; text-align: left; }
        .view-menu-section-list { display: flex; flex-direction: column; padding-left: 10px; border-left: 2px solid rgba(0,0,0,0.06); margin: 2px 0 2px 20px; }
        .view-menu-option-nested { font-size: 0.85rem; padding: 10px 12px; }
        .view-container .invitation-page { width: 100%; max-width: 430px; background-color: var(--wedding-bg); min-height: 100svh; overflow-anchor: none; }
        .view-loading, .view-error { width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Pretendard', sans-serif; color: #6B7280; text-align: center; padding: 20px; box-sizing: border-box; }
        .view-error h2 { color: #1F2937; margin-bottom: 8px; }

        .wm-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
          color: white;
          text-decoration: none;
          font-family: 'Pretendard', sans-serif;
          transition: opacity 0.2s;
        }
        .wm-banner:hover { opacity: 0.9; }
        .wm-logo {
          font-size: 0.9em;
          font-weight: 700;
          letter-spacing: 1px;
          color: #D4A5C6;
        }
        .wm-text {
          font-size: 0.75em;
          color: rgba(255,255,255,0.7);
        }
        .wm-cta {
          font-size: 0.75em;
          font-weight: 600;
          color: #D4A5C6;
          margin-left: 4px;
        }

        .promo-section {
          padding: 36px 24px 40px;
          text-align: center;
          background: linear-gradient(180deg, var(--wedding-bg) 0%, var(--wedding-card-bg) 100%);
          border-top: 1px solid var(--wedding-border);
          font-family: 'Pretendard', sans-serif;
        }
        .promo-brand {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 3px;
          color: #B07A8E;
          margin: 0 0 8px;
        }
        .promo-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1F2937;
          margin: 0 0 10px;
        }
        .promo-desc {
          font-size: 0.82rem;
          color: #6B7280;
          line-height: 1.65;
          margin: 0 0 20px;
        }
        .promo-cta {
          display: inline-block;
          padding: 11px 28px;
          background: #B07A8E;
          color: white;
          border-radius: 30px;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: opacity 0.2s;
        }
        .promo-cta:hover { opacity: 0.85; }

        .sonett-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 18px 20px;
          background: var(--wedding-bg);
          border-top: 1px solid var(--wedding-border);
          color: var(--wedding-main);
          text-decoration: none;
          font-family: 'Pretendard', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          transition: opacity 0.2s;
        }
        .sonett-badge:hover { opacity: 0.7; }

        @media (max-width: 480px) {
          .view-container { background: var(--wedding-bg); }
          .view-container .invitation-page { max-width: 100%; }
          .view-menu-fab-wrap { right: 16px; }
          .wm-banner { padding: 12px 16px; gap: 6px; }
          .wm-logo { font-size: 0.82em; }
          .wm-text { font-size: 0.7em; }
          .wm-cta { font-size: 0.7em; }
        }
      `}</style>
    </div>
  );
};

export default ViewPage;