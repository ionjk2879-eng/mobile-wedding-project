import React, { useState, useEffect, useRef, useCallback } from 'react';
import EditorContainer from './components/Editor/EditorContainer';
import InvitationView from './components/Preview/InvitationView';
import ToastContainer from './components/Toast';
import { ScrollRootContext } from './components/Preview/ScrollReveal';
import useInvitationStore, { initialData } from './stores/useInvitationStore';
import { toast } from './stores/useToastStore';
import { saveInvitation, checkSlugAvailable, loadInvitation, deleteInvitation, fetchMyInvitations } from './firebase';
import { getFirebaseErrorMessage } from './utils/firebaseError';
import { Edit3, Eye, Save, ClipboardList, RotateCcw, Trash2, Menu, X, Sparkles } from 'lucide-react';
import { AI_PRESETS, AIPreset, applyPreset } from './data/aiPresets';
import './styles/effects.css';
import './styles/builder.css';

const ITEMS_PER_PAGE = 6;

const PresetSlider: React.FC<{ onSelect: (preset: AIPreset) => void }> = ({ onSelect }) => {
  const totalPages = Math.ceil(AI_PRESETS.length / ITEMS_PER_PAGE);
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  const finishDrag = (offset: number) => {
    dragging.current = false;
    didDrag.current = Math.abs(offset) > 10;
    if (offset < -50 && page < totalPages - 1) setPage(page + 1);
    else if (offset > 50 && page > 0) setPage(page - 1);
    setDragOffset(0);
  };

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; dragging.current = true; didDrag.current = false; };
  const onTouchMove = (e: React.TouchEvent) => { if (dragging.current) setDragOffset(e.touches[0].clientX - startX.current); };
  const onTouchEnd = () => finishDrag(dragOffset);
  const onMouseDown = (e: React.MouseEvent) => { startX.current = e.clientX; dragging.current = true; didDrag.current = false; };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) { e.preventDefault(); setDragOffset(e.clientX - startX.current); } };
  const onMouseUp = () => { if (dragging.current) finishDrag(dragOffset); };
  const onMouseLeave = () => { if (dragging.current) finishDrag(dragOffset); };

  const handleCardClick = (preset: AIPreset) => {
    if (didDrag.current) return;
    onSelect(preset);
  };

  const pages = Array.from({ length: totalPages }, (_, i) =>
    AI_PRESETS.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE)
  );

  const translateX = -(page * 100) + (dragOffset / (containerRef.current?.offsetWidth || 320)) * 100;

  return (
    <div className="ai-preset-section">
      <div className="ai-preset-label"><Sparkles size={16} /> AI 추천 샘플 청첩장</div>
      <div className="ai-preset-viewport" ref={containerRef}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}
      >
        <div className="ai-preset-track" style={{
          transform: `translateX(${translateX}%)`,
          transition: dragOffset ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        }}>
          {pages.map((group, pi) => (
            <div key={pi} className="ai-preset-page">
              {group.map((preset) => (
                <button key={preset.id} className="ai-preset-card" onClick={() => handleCardClick(preset)}>
                  <span className="ai-preset-emoji">{preset.emoji}</span>
                  <span className="ai-preset-name">{preset.name}</span>
                  <span className="ai-preset-desc">{preset.description}</span>
                  <div className="ai-preset-swatches">
                    {preset.previewColors.map((color, ci) => (
                      <span key={ci} className="ai-preset-swatch" style={{ background: color }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {totalPages > 1 && (
        <div className="ai-preset-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={`ai-preset-dot ${page === i ? 'active' : ''}`} onClick={() => setPage(i)} />
          ))}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const setData = useInvitationStore((s) => s.setData);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [previewNavOpen, setPreviewNavOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const autoSaveEnabled = true;
  const [loadingData, setLoadingData] = useState(true);
  const [showStartScreen, setShowStartScreen] = useState<string[] | null>(null);
  const hasSavedOnceRef = useRef(false);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    fetchMyInvitations().then((items) => {
      history.replaceState({ screen: 'start' }, '', '/');
      setShowStartScreen(items.map((item) => item.slug));
    }).catch(() => {
      setShowStartScreen([]);
    }).finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const screen = e.state?.screen;
      if (screen === 'start') {
        fetchMyInvitations().then((items) => {
          if (items.length > 0) setShowStartScreen(items.map((item) => item.slug));
        }).catch(() => {});
      } else if (screen === 'editor') {
        setShowStartScreen(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleLoadExisting = async (slug: string) => {
    setShowStartScreen(null);
    history.pushState({ screen: 'editor' }, '', '/');
    setLoadingData(true);
    try {
      const saved = await loadInvitation(slug);
      if (saved) {
        setData(saved);
        hasSavedOnceRef.current = true;
        toast.info(`'${slug}' 청첩장을 불러왔습니다.`);
      }
    } catch { /* ignore */ }
    setLoadingData(false);
  };

  const handleStartNew = () => {
    setShowStartScreen(null);
    history.pushState({ screen: 'editor' }, '', '/');
    setData(initialData);
    hasSavedOnceRef.current = false;
  };

  const handleStartWithPreset = (preset: AIPreset) => {
    setShowStartScreen(null);
    history.pushState({ screen: 'editor' }, '', '/');
    setData(applyPreset(preset));
    hasSavedOnceRef.current = false;
  };

  const handleDeleteSlug = async (slug: string) => {
    if (!confirm(`'${slug}' 청첩장을 삭제하시겠습니까?\nFirebase 데이터도 함께 삭제됩니다.`)) return;
    try {
      await deleteInvitation(slug);
      toast.success(`'${slug}' 청첩장이 삭제되었습니다.`);
      const items = await fetchMyInvitations();
      if (items.length > 0) setShowStartScreen(items.map((item) => item.slug));
      else setShowStartScreen(null);
    } catch { toast.error('삭제에 실패했습니다.'); }
  };

  const handleReset = () => {
    if (!confirm('현재 편집 중인 내용이 초기화됩니다. 계속하시겠습니까?')) return;
    setData(initialData);
    hasSavedOnceRef.current = false;
    setSaveStatus('idle');
    toast.info('에디터가 초기화되었습니다.');
  };
  const saveStatusRef = useRef(saveStatus);
  saveStatusRef.current = saveStatus;
  const dataRef = useRef(data);
  dataRef.current = data;
  const autoSaveRef = useRef(autoSaveEnabled);
  autoSaveRef.current = autoSaveEnabled;

  const performSave = useCallback(async (silent = false) => {
    const d = dataRef.current;
    if (!d.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug)) return;
    if (saveStatusRef.current === 'saving') return;
    setSaveStatus('saving');
    try {
      const available = await checkSlugAvailable(d.slug);
      if (!available) {
        if (!silent) toast.warning('이미 사용 중인 주소입니다. 다른 주소를 입력해주세요.');
        setSaveStatus('idle');
        return;
      }
      await saveInvitation(d.slug, d);
      hasSavedOnceRef.current = true;
      setSaveStatus('success');
      if (!silent) toast.success(`저장 완료! 청첩장 주소: /w/${d.slug}`);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      if (!silent) toast.error(getFirebaseErrorMessage(err));
      console.error(err);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, []);

  useEffect(() => {
    if (!autoSaveEnabled || !hasSavedOnceRef.current) return;
    if (!data.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) return;

    const timer = setTimeout(() => {
      performSave(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [data, autoSaveEnabled]);

  const previewRefs = {
    theme: React.useRef<HTMLDivElement>(null),
    design: React.useRef<HTMLDivElement>(null),
    basic: React.useRef<HTMLDivElement>(null),
    datetime: React.useRef<HTMLDivElement>(null),
    greeting: React.useRef<HTMLDivElement>(null),
    message: React.useRef<HTMLDivElement>(null),
    interview: React.useRef<HTMLDivElement>(null),
    photos: React.useRef<HTMLDivElement>(null),
    timeline: React.useRef<HTMLDivElement>(null),
    location: React.useRef<HTMLDivElement>(null),
    rsvp: React.useRef<HTMLDivElement>(null),
    guestbook: React.useRef<HTMLDivElement>(null),
    contacts: React.useRef<HTMLDivElement>(null),
    accounts: React.useRef<HTMLDivElement>(null),
    share: React.useRef<HTMLDivElement>(null),
    music: React.useRef<HTMLDivElement>(null),
  };
  const previewScrollRef = React.useRef<HTMLDivElement>(null);
  const fullPreviewScrollRef = React.useRef<HTMLDivElement>(null);

  if (loadingData) {
    return (
      <div className="start-screen"><p>불러오는 중...</p></div>
    );
  }

  if (showStartScreen !== null) {
    return (
      <div className="start-screen">
        <h1>Sonett</h1>
        <p className="start-desc">소네트 모바일 청첩장</p>
        <div className="start-options">
          <PresetSlider onSelect={handleStartWithPreset} />
          <div className="start-divider">또는 직접 설정하기</div>
          <button className="start-btn new" onClick={handleStartNew}>새로 만들기</button>
          {showStartScreen.length > 0 && (
            <>
              <div className="start-divider">이전 청첩장 이어서 편집</div>
              {showStartScreen.map((slug) => (
                <div key={slug} className="start-item">
                  <button className="start-btn load" onClick={() => handleLoadExisting(slug)}>
                    /w/{slug}
                  </button>
                  <button className="start-delete" onClick={() => handleDeleteSlug(slug)} title="삭제">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  const handleSectionScroll = (id: string) => {
    const ref = previewRefs[id as keyof typeof previewRefs];
    if (ref?.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getBaseFontSize = () => {
    switch (data.fontSize) {
      case 'small': return '12px';
      case 'large': return '16px';
      default: return '13px';
    }
  };

  const getCustomColorVars = (): React.CSSProperties => {
    const vars: Record<string, string> = {};
    if (data.customBgColor) vars['--wedding-bg'] = data.customBgColor;
    if (data.customAccentColor) {
      vars['--wedding-main'] = data.customAccentColor;
      vars['--wedding-accent'] = data.customAccentColor;
    }
    return vars as React.CSSProperties;
  };

  if (isFullPreview) {
    return (
      <div className="full-preview-container" style={{ fontFamily: data.fontFamily }} ref={fullPreviewScrollRef}>
        <ToastContainer />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo:wght@400;700&family=Dancing+Script&display=swap" rel="stylesheet" />
        <button className="back-to-editor-btn" onClick={() => setIsFullPreview(false)}>편집기로 돌아가기</button>
        <div className={`invitation-page theme-${data.theme || 'blush'}`} style={{ fontSize: getBaseFontSize(), ...getCustomColorVars() }}>
          <ScrollRootContext.Provider value={fullPreviewScrollRef}>
            <InvitationView data={data} showOpening />
          </ScrollRootContext.Provider>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-layout">
      <ToastContainer />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo:wght@400;700&family=Dancing+Script&display=swap" rel="stylesheet" />

      <div className="builder-topbar-wrap"><header className="builder-topbar">
        <div className="topbar-left" onClick={() => {
          fetchMyInvitations().then((items) => {
            history.pushState({ screen: 'start' }, '', '/');
            if (items.length > 0) setShowStartScreen(items.map((item) => item.slug));
            else { setData(initialData); hasSavedOnceRef.current = false; }
          }).catch(() => {});
        }} style={{ cursor: 'pointer' }}>
          <h1 className="header-logo">Sonett</h1>
        </div>
        <div className="topbar-right">
          <button className="save-btn" disabled={saveStatus === 'saving'} onClick={() => {
            if (!data.slug) { toast.warning('청첩장 주소를 먼저 설정해주세요.'); return; }
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) { toast.warning('주소는 영문 소문자, 숫자, 하이픈만 사용 가능합니다.'); return; }
            performSave(false);
          }}>
            <Save size={15} />
            {saveStatus === 'saving' ? '저장 중...' : saveStatus === 'success' ? '완료!' : saveStatus === 'error' ? '실패' : '저장'}
          </button>
          {data.slug && <a href={`/admin/${data.slug}`} target="_blank" className="header-text-btn"><ClipboardList size={15} /> 응답 확인</a>}
          <button className="header-text-btn reset" onClick={handleReset}><RotateCcw size={14} /> 초기화</button>
        </div>
      </header></div>

      <main className="builder-main-container">
        <div className={`editor-panel ${mobileView === 'preview' ? 'mobile-hidden' : ''}`}>
          <EditorContainer onSectionClick={handleSectionScroll} />
        </div>

        <div className={`preview-panel ${mobileView === 'preview' ? 'mobile-visible' : ''}`}>
          <div className="preview-container-box">
            <div className="preview-header-bar">
              <div className="preview-label">Live Preview</div>
              <button className="full-preview-btn-mini" onClick={() => setIsFullPreview(true)}>전체화면 보기</button>
            </div>
            <div className={`preview-content-scroll theme-${data.theme || 'blush'}`} ref={previewScrollRef} style={{ fontFamily: data.fontFamily, fontSize: getBaseFontSize(), ...getCustomColorVars() }}>
              <ScrollRootContext.Provider value={previewScrollRef}>
                <InvitationView data={data} previewRefs={previewRefs} />
              </ScrollRootContext.Provider>
            </div>
          </div>

          <button className="preview-nav-fab" onClick={() => setPreviewNavOpen(!previewNavOpen)}>
            {previewNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          {previewNavOpen && (
            <div className="preview-nav-overlay" onClick={() => setPreviewNavOpen(false)}>
              <div className="preview-nav-panel" onClick={(e) => e.stopPropagation()}>
                {[
                  { id: 'basic', name: '메인/기본정보' },
                  { id: 'greeting', name: '인사말' },
                  { id: 'message', name: '한마디' },
                  { id: 'interview', name: '인터뷰' },
                  { id: 'photos', name: '갤러리' },
                  { id: 'timeline', name: '타임라인' },
                  { id: 'location', name: '장소' },
                  { id: 'guestbook', name: '방명록' },
                  { id: 'rsvp', name: '참석의사' },
                  { id: 'accounts', name: '계좌' },
                  { id: 'contacts', name: '연락처' },
                  { id: 'share', name: '공유' },
                ].map((item, i) => (
                  <React.Fragment key={item.id}>
                    {i > 0 && i % 4 === 0 && <div className="preview-nav-divider" />}
                    <button className="preview-nav-item" onClick={() => {
                      const ref = previewRefs[item.id as keyof typeof previewRefs];
                      if (ref?.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setPreviewNavOpen(false);
                    }}>{item.name}</button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <nav className="mobile-tab-bar" aria-label="보기 전환">
        <button className={`mobile-tab-btn ${mobileView === 'editor' ? 'active' : ''}`} onClick={() => setMobileView('editor')} aria-pressed={mobileView === 'editor'}>
          <Edit3 size={20} />
          <span>편집</span>
        </button>
        <button className={`mobile-tab-btn ${mobileView === 'preview' ? 'active' : ''}`} onClick={() => setMobileView('preview')} aria-pressed={mobileView === 'preview'}>
          <Eye size={20} />
          <span>미리보기</span>
        </button>
      </nav>
    </div>
  );
};

export default App;