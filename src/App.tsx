import React, { useState, useEffect, useRef, useCallback } from 'react';
import EditorContainer from './components/Editor/EditorContainer';
import InvitationView from './components/Preview/InvitationView';
import ToastContainer from './components/Toast';
import { ScrollRootContext } from './components/Preview/ScrollReveal';
import useInvitationStore from './stores/useInvitationStore';
import { toast } from './stores/useToastStore';
import { saveInvitation, checkSlugAvailable } from './firebase';
import { getFirebaseErrorMessage, withRetry } from './utils/firebaseError';
import { Edit3, Eye, Loader2 } from 'lucide-react';
import './styles/effects.css';
import './styles/builder.css';

const App: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const hasSavedOnceRef = useRef(false);
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
        const available = await withRetry(() => checkSlugAvailable(d.slug));
        if (!available) {
          if (!silent) toast.warning('이미 사용 중인 주소입니다. 다른 주소를 입력해주세요.');
          setSaveStatus('idle');
          return;
        }
      }
      await withRetry(() => saveInvitation(d.slug, d));
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
    contacts: React.useRef<HTMLDivElement>(null),
    accounts: React.useRef<HTMLDivElement>(null),
    share: React.useRef<HTMLDivElement>(null),
    music: React.useRef<HTMLDivElement>(null),
  };
  const previewScrollRef = React.useRef<HTMLDivElement>(null);
  const fullPreviewScrollRef = React.useRef<HTMLDivElement>(null);

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
            <div className="header-main">
              <h1>Sonett</h1>
              <p>소중한 순간을 아름답게, 소네트 모바일 청첩장</p>
            </div>
            <div className="header-btns">
              <button className="save-btn" disabled={saveStatus === 'saving'} onClick={() => {
                if (!data.slug) { toast.warning('청첩장 주소를 먼저 설정해주세요.'); return; }
                if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) { toast.warning('주소는 영문 소문자, 숫자, 하이픈만 사용 가능합니다.'); return; }
                performSave(false);
              }}>
                {saveStatus === 'saving' ? <><Loader2 size={16} className="spin" /> 저장 중...</> : saveStatus === 'success' ? '저장 완료!' : saveStatus === 'error' ? '저장 실패' : '저장하기'}
              </button>
              <button className={`autosave-toggle ${autoSaveEnabled ? 'active' : ''}`} onClick={() => setAutoSaveEnabled(!autoSaveEnabled)} title={autoSaveEnabled ? '자동 저장 켜짐' : '자동 저장 꺼짐'}>
                {autoSaveEnabled ? '자동저장 ON' : '자동저장 OFF'}
              </button>
              {data.slug && <a href={`/w/${data.slug}`} target="_blank" className="view-btn">청첩장 보기</a>}
              {data.slug && <a href={`/admin/${data.slug}`} target="_blank" className="admin-link-btn">응답 확인</a>}
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