import React, { useState, useEffect, useRef, useCallback } from 'react';
import EditorContainer, { EditorContainerHandle } from './components/Editor/EditorContainer';
import InvitationView from './components/Preview/InvitationView';
import ToastContainer from './components/Toast';
import { ScrollRootContext } from './components/Preview/ScrollReveal';
import useInvitationStore, { initialData } from './stores/useInvitationStore';
import { toast } from './stores/useToastStore';
import { saveInvitation, checkSlugAvailable, loadInvitation } from './services/invitationService';
import { getApiErrorMessage } from './utils/apiError';
import { loadAllFonts } from './utils/loadFont';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Edit3, Eye, Save, ClipboardList, RotateCcw, Menu, X } from 'lucide-react';
import { AI_PRESETS, applyPreset } from './data/aiPresets';
import { useSiteLang } from './i18n';
import './styles/effects.css';
import './styles/builder.css';

const App: React.FC = () => {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useSiteLang();
  const te = t.editor;
  const data = useInvitationStore((s) => s.data);
  const setData = useInvitationStore((s) => s.setData);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [previewNavOpen, setPreviewNavOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showStartScreen, setShowStartScreen] = useState(false);
  const hasSavedOnceRef = useRef(false);
  const dataReadyRef = useRef(false);
  const showStartScreenRef = useRef(showStartScreen);
  showStartScreenRef.current = showStartScreen;
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => { loadAllFonts(); }, []);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    if (urlSlug) {
      loadInvitation(urlSlug).then((saved) => {
        if (saved) {
          setData(saved);
          hasSavedOnceRef.current = true;
          setShowStartScreen(false);
        } else {
          setShowStartScreen(true);
        }
      }).catch(() => { setShowStartScreen(true); }).finally(() => { setLoadingData(false); dataReadyRef.current = true; });
    } else {
      const templateParam = searchParams.get('template');
      if (templateParam) {
        const preset = AI_PRESETS.find(p => p.id === templateParam);
        if (preset) {
          setData(applyPreset(preset));
          hasSavedOnceRef.current = false;
        }
        setShowStartScreen(false);
      } else {
        setShowStartScreen(true);
      }
      setLoadingData(false);
      dataReadyRef.current = true;
    }
  }, []);

  // 브라우저 뒤로/앞으로 이동 시 URL ↔ 화면 동기화
  useEffect(() => {
    if (!dataReadyRef.current) return;
    if (searchParams.get('template')) return;
    const currentShowStartScreen = showStartScreenRef.current;
    if (!urlSlug && !currentShowStartScreen) {
      // /edit/:slug → /editor 로 뒤로가기: 시작 화면 표시
      setShowStartScreen(true);
    } else if (urlSlug && currentShowStartScreen) {
      // 시작 화면에서 /edit/:slug 로 앞으로가기: 해당 청첩장 로드
      setShowStartScreen(false);
      setLoadingData(true);
      loadInvitation(urlSlug).then((saved) => {
        if (saved) { setData(saved); hasSavedOnceRef.current = true; }
      }).catch(() => {}).finally(() => setLoadingData(false));
    }
  }, [urlSlug]);

  const handleStartNew = () => {
    setShowStartScreen(false);
    setData(initialData);
    hasSavedOnceRef.current = false;
  };

  const handleReset = () => {
    if (!confirm(te.resetConfirm)) return;
    setData(initialData);
    hasSavedOnceRef.current = false;
    setSaveStatus('idle');
    toast.info(te.resetDone);
  };
  const saveStatusRef = useRef(saveStatus);
  saveStatusRef.current = saveStatus;
  const dataRef = useRef(data);
  dataRef.current = data;

  const autoSaveStatusRef = useRef(autoSaveStatus);
  autoSaveStatusRef.current = autoSaveStatus;

  const performAutoSave = useCallback(async () => {
    const d = dataRef.current;
    if (!d.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug)) return;
    if (saveStatusRef.current === 'saving' || autoSaveStatusRef.current === 'saving') return;
    setAutoSaveStatus('saving');
    try {
      await saveInvitation(d.slug, d);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch {
      setAutoSaveStatus('idle');
    }
  }, []);

  useEffect(() => {
    if (!dataReadyRef.current) return;
    if (!hasSavedOnceRef.current) return;
    const timer = setTimeout(() => { performAutoSave(); }, 3000);
    return () => clearTimeout(timer);
  }, [data, performAutoSave]);

  const performSave = useCallback(async () => {
    const d = dataRef.current;
    if (!d.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug)) return;
    if (saveStatusRef.current === 'saving') return;
    setSaveStatus('saving');
    try {
      const available = await checkSlugAvailable(d.slug);
      if (!available) {
        toast.warning(te.slugTaken);
        setSaveStatus('idle');
        return;
      }
      await saveInvitation(d.slug, d);
      hasSavedOnceRef.current = true;
      setSaveStatus('success');
      toast.success(te.saveSuccess.replace('{slug}', d.slug));
      setShowSavedPopup(true);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      toast.error(getApiErrorMessage(err));
      console.error(err);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, []);

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
    ending: React.useRef<HTMLDivElement>(null),
    share: React.useRef<HTMLDivElement>(null),
    music: React.useRef<HTMLDivElement>(null),
  };
  const previewScrollRef = React.useRef<HTMLDivElement>(null);
  const fullPreviewScrollRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<EditorContainerHandle>(null);

  const handlePreviewSectionNav = React.useCallback((editorId: string) => {
    editorRef.current?.navigateTo(editorId);
  }, []);

  if (loadingData) {
    return (
      <div className="start-screen"><p>불러오는 중...</p></div>
    );
  }

  if (showStartScreen) {
    return (
      <div className="start-screen-v2">
        <div className="ss-logo-area" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1 className="ss-logo-text">Sonett</h1>
          <p className="ss-logo-sub">소네트 모바일 청첩장</p>
        </div>

        <section className="ss-section">
          <h2 className="ss-section-title">{te.templateSelect}</h2>
          <p className="ss-section-sub">{te.templateSelectSub}</p>
          <div className="ss-new-card-wrap">
            <button className="ss-tmpl-card ss-tmpl-blank ss-new-card-full" onClick={handleStartNew}>
              <div className="ss-tmpl-visual ss-tmpl-visual-blank">
                <span className="ss-tmpl-blank-plus">+</span>
                <span className="ss-tmpl-blank-label">{te.blankCard}</span>
              </div>
              <div className="ss-tmpl-body">
                <span className="ss-tmpl-name">{te.customizeLabel}</span>
                <span className="ss-tmpl-desc">{te.customizeDesc}</span>
              </div>
            </button>
            <a href="/templates" className="ss-browse-tmpl-link" onClick={(e) => { e.preventDefault(); navigate('/templates'); }}>
              템플릿 둘러보기 →
            </a>
          </div>
        </section>
      </div>
    );
  }

  const handleSectionScroll = (id: string) => {
    const ref = previewRefs[id as keyof typeof previewRefs];
    if (ref?.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getBaseFontSize = () => {
    switch (data.fontSize) {
      case 'small': return '13px';
      case 'large': return '16px';
      default: return '14.5px';
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
        <button className="back-to-editor-btn" onClick={() => setIsFullPreview(false)}>{te.backToEditor}</button>
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
        <div className="topbar-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1 className="header-logo">Sonett</h1>
        </div>
        <div className="topbar-right">
          {hasSavedOnceRef.current && autoSaveStatus !== 'idle' && (
            <span className="autosave-indicator">
              {autoSaveStatus === 'saving' ? te.autoSaving : te.autoSaved}
            </span>
          )}
          <button className="save-btn" disabled={saveStatus === 'saving'} onClick={() => {
            if (!data.slug) { toast.warning(te.noSlug); return; }
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) { toast.warning(te.invalidSlug); return; }
            performSave();
          }}>
            <Save size={15} />
            {saveStatus === 'saving' ? te.saving : saveStatus === 'success' ? te.saved : saveStatus === 'error' ? te.saveFailed : te.save}
          </button>
          {data.slug && <a href={`/admin/${data.slug}`} target="_blank" className="header-text-btn"><ClipboardList size={15} /> {te.viewResponses}</a>}
          <button className="header-text-btn reset" onClick={handleReset}><RotateCcw size={14} /> {te.reset}</button>
        </div>
      </header></div>

      <main className="builder-main-container">
        <div className={`editor-panel ${mobileView === 'preview' ? 'mobile-hidden' : ''}`}>
          <EditorContainer ref={editorRef} onSectionClick={handleSectionScroll} />
        </div>

        <div className={`preview-panel ${mobileView === 'preview' ? 'mobile-visible' : ''}`}>
          <div className="preview-container-box">
            <div className="preview-header-bar">
              <div className="preview-label">Live Preview</div>
              <button className="full-preview-btn-mini" onClick={() => setIsFullPreview(true)}>{te.fullscreen}</button>
            </div>
            <div className={`preview-content-scroll theme-${data.theme || 'blush'}`} ref={previewScrollRef} style={{ fontFamily: data.fontFamily, fontSize: getBaseFontSize(), ...getCustomColorVars() }}>
              <ScrollRootContext.Provider value={previewScrollRef}>
                <InvitationView data={data} previewRefs={previewRefs} onSectionNav={handlePreviewSectionNav} />
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
          <span>{te.tabEdit}</span>
        </button>
        <button className={`mobile-tab-btn ${mobileView === 'preview' ? 'active' : ''}`} onClick={() => setMobileView('preview')} aria-pressed={mobileView === 'preview'}>
          <Eye size={20} />
          <span>{te.tabPreview}</span>
        </button>
      </nav>

      {showSavedPopup && (
        <div className="saved-popup-overlay" onClick={() => setShowSavedPopup(false)}>
          <div className="saved-popup" onClick={(e) => e.stopPropagation()}>
            <h3>{te.savedTitle}</h3>
            <p>{te.savedDesc.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < te.savedDesc.split('\n').length - 1 && <br />}</React.Fragment>)}</p>
            <div className="saved-popup-actions">
              <button className="saved-popup-btn cancel" onClick={() => setShowSavedPopup(false)}>{te.continueEdit}</button>
              <button className="saved-popup-btn confirm" onClick={() => navigate('/manage')}>{te.goToManage}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;