import React, { useState, useEffect, useRef, useCallback } from 'react';
import EditorContainer from './components/Editor/EditorContainer';
import InvitationView from './components/Preview/InvitationView';
import ToastContainer from './components/Toast';
import { ScrollRootContext } from './components/Preview/ScrollReveal';
import useInvitationStore, { initialData } from './stores/useInvitationStore';
import { toast } from './stores/useToastStore';
import { saveInvitation, checkSlugAvailable, loadInvitation, deleteInvitation } from './firebase';
import { getFirebaseErrorMessage } from './utils/firebaseError';
import { Edit3, Eye, Save, ExternalLink, ClipboardList, RotateCcw, Trash2 } from 'lucide-react';
import './styles/effects.css';
import './styles/builder.css';

const App: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const setData = useInvitationStore((s) => s.setData);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState<string[] | null>(null);
  const hasSavedOnceRef = useRef(false);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const mySlugs: string[] = JSON.parse(localStorage.getItem('sonett_my_slugs') || '[]');
    if (mySlugs.length > 0) {
      history.replaceState({ screen: 'start' }, '', '/');
      setShowStartScreen(mySlugs);
    }
  }, []);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const screen = e.state?.screen;
      if (screen === 'start') {
        const mySlugs: string[] = JSON.parse(localStorage.getItem('sonett_my_slugs') || '[]');
        if (mySlugs.length > 0) setShowStartScreen(mySlugs);
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

  const handleDeleteSlug = (slug: string) => {
    if (!confirm(`'${slug}' 청첩장을 삭제하시겠습니까?\nFirebase 데이터도 함께 삭제됩니다.`)) return;
    const mySlugs: string[] = JSON.parse(localStorage.getItem('sonett_my_slugs') || '[]').filter((s: string) => s !== slug);
    localStorage.setItem('sonett_my_slugs', JSON.stringify(mySlugs));
    if (mySlugs.length > 0) setShowStartScreen(mySlugs);
    else setShowStartScreen(null);
    toast.success(`'${slug}' 청첩장이 삭제되었습니다.`);
    deleteInvitation(slug).catch(() => {});
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
      const mySlugs: string[] = JSON.parse(localStorage.getItem('sonett_my_slugs') || '[]');
      const isOwner = mySlugs.includes(d.slug);
      if (!isOwner) {
        const available = await checkSlugAvailable(d.slug);
        if (!available) {
          if (!silent) toast.warning('이미 사용 중인 주소입니다. 다른 주소를 입력해주세요.');
          setSaveStatus('idle');
          return;
        }
      }
      await saveInvitation(d.slug, d);
      if (!isOwner) {
        mySlugs.push(d.slug);
        localStorage.setItem('sonett_my_slugs', JSON.stringify(mySlugs));
      }
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

  if (showStartScreen) {
    return (
      <div className="start-screen">
        <h1>Sonett</h1>
        <p className="start-desc">소네트 모바일 청첩장</p>
        <div className="start-options">
          <button className="start-btn new" onClick={handleStartNew}>새로 만들기</button>
          <div className="start-divider">또는 이전 청첩장 이어서 편집</div>
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
      case 'small': return '14px';
      case 'large': return '19px';
      default: return '16.5px';
    }
  };

  if (isFullPreview) {
    return (
      <div className="full-preview-container" style={{ fontFamily: data.fontFamily }} ref={fullPreviewScrollRef}>
        <ToastContainer />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo&family=Dancing+Script&display=swap" rel="stylesheet" />
        <button className="back-to-editor-btn" onClick={() => setIsFullPreview(false)}>편집기로 돌아가기</button>
        <div className={`invitation-page theme-${data.theme || 'blush'}`} style={{ fontSize: getBaseFontSize() }}>
          <ScrollRootContext.Provider value={fullPreviewScrollRef}>
            <InvitationView data={data} />
          </ScrollRootContext.Provider>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-layout">
      <ToastContainer />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo&family=Dancing+Script&display=swap" rel="stylesheet" />

      <main className="builder-main-container">
        <div className={`editor-panel ${mobileView === 'preview' ? 'mobile-hidden' : ''}`}>
          <header className="builder-header">
            <div className="header-main" onClick={() => {
              const mySlugs: string[] = JSON.parse(localStorage.getItem('sonett_my_slugs') || '[]');
              history.pushState({ screen: 'start' }, '', '/');
              if (mySlugs.length > 0) setShowStartScreen(mySlugs);
              else { setData(initialData); hasSavedOnceRef.current = false; }
            }} style={{ cursor: 'pointer' }}>
              <h1 className="header-logo">Sonett</h1>
              <p className="header-desc">소네트 모바일 청첩장</p>
            </div>
            <div className="header-btns">
              <button className="save-btn" disabled={saveStatus === 'saving'} onClick={() => {
                if (!data.slug) { toast.warning('청첩장 주소를 먼저 설정해주세요.'); return; }
                if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) { toast.warning('주소는 영문 소문자, 숫자, 하이픈만 사용 가능합니다.'); return; }
                performSave(false);
              }}>
                <Save size={15} />
                {saveStatus === 'saving' ? '저장 중...' : saveStatus === 'success' ? '완료!' : saveStatus === 'error' ? '실패' : '저장'}
              </button>
              <button className={`autosave-toggle ${autoSaveEnabled ? 'active' : ''}`} onClick={() => setAutoSaveEnabled(!autoSaveEnabled)} title={autoSaveEnabled ? '자동 저장 켜짐' : '자동 저장 꺼짐'}>
                {autoSaveEnabled ? '자동저장 ON' : '자동저장 OFF'}
              </button>
              {data.slug && <a href={`/w/${data.slug}`} target="_blank" className="header-text-btn"><ExternalLink size={15} /> 청첩장 보기</a>}
              {data.slug && <a href={`/admin/${data.slug}`} target="_blank" className="header-text-btn"><ClipboardList size={15} /> 응답 확인</a>}
              <button className="header-text-btn reset" onClick={handleReset}><RotateCcw size={14} /> 초기화</button>
            </div>
          </header>
          <EditorContainer onSectionClick={handleSectionScroll} />
        </div>

        <div className={`preview-panel ${mobileView === 'preview' ? 'mobile-visible' : ''}`}>
          <div className="preview-container-box">
            <div className="preview-header-bar">
              <div className="preview-label">Live Preview</div>
              <button className="full-preview-btn-mini" onClick={() => setIsFullPreview(true)}>전체화면 보기</button>
            </div>
            <div className={`preview-content-scroll theme-${data.theme || 'blush'}`} ref={previewScrollRef} style={{ fontFamily: data.fontFamily, fontSize: getBaseFontSize() }}>
              <ScrollRootContext.Provider value={previewScrollRef}>
                <InvitationView data={data} previewRefs={previewRefs} />
              </ScrollRootContext.Provider>
            </div>
          </div>
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