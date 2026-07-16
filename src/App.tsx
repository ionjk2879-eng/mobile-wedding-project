import React, { useState, useEffect, useRef, useCallback } from 'react';
import EditorContainer, { EditorContainerHandle } from './components/Editor/EditorContainer';
import InvitationView from './components/Preview/InvitationView';
import ToastContainer from './components/Toast';
import { ScrollRootContext } from './components/Preview/ScrollReveal';
import useInvitationStore, { initialData } from './stores/useInvitationStore';
import { toast } from './stores/useToastStore';
import { saveInvitation, checkSlugAvailable, loadInvitation } from './services/invitationService';
import { getApiErrorMessage } from './utils/apiError';
import { loadAllFonts, loadFont } from './utils/loadFont';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Edit3, Eye, Save, RotateCcw, Menu, X } from 'lucide-react';
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
    // 폰트가 실제로 준비된 뒤에 로딩 화면을 내려야, 폴백 글꼴 → 커스텀 글꼴 교체로
    // 메인화면 텍스트 높이가 바뀌면서 다음 섹션이 밀리는 현상을 막을 수 있다.
    (async () => {
      if (urlSlug) {
        try {
          const saved = await loadInvitation(urlSlug);
          if (saved) {
            setData(saved);
            hasSavedOnceRef.current = true;
            setShowStartScreen(false);
            await loadFont(saved.fontFamily);
          } else {
            setShowStartScreen(true);
          }
        } catch {
          setShowStartScreen(true);
        }
      } else {
        const templateParam = searchParams.get('template');
        if (templateParam) {
          const preset = AI_PRESETS.find(p => p.id === templateParam);
          if (preset) {
            const presetData = applyPreset(preset);
            setData(presetData);
            hasSavedOnceRef.current = false;
            await loadFont(presetData.fontFamily);
          }
          setShowStartScreen(false);
        } else {
          setShowStartScreen(true);
        }
      }
      setLoadingData(false);
      dataReadyRef.current = true;
    })();
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
    hero: React.useRef<HTMLDivElement>(null),
    calendar: React.useRef<HTMLDivElement>(null),
    greeting: React.useRef<HTMLDivElement>(null),
    message: React.useRef<HTMLDivElement>(null),
    interview: React.useRef<HTMLDivElement>(null),
    photos: React.useRef<HTMLDivElement>(null),
    timeline: React.useRef<HTMLDivElement>(null),
    location: React.useRef<HTMLDivElement>(null),
    midphoto: React.useRef<HTMLDivElement>(null),
    rsvp: React.useRef<HTMLDivElement>(null),
    guestbook: React.useRef<HTMLDivElement>(null),
    livegallery: React.useRef<HTMLDivElement>(null),
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

  // InvitationView.tsx의 PREVIEW_TO_EDITOR(미리보기 id → 편집 섹션 id)를 그대로 뒤집은 매핑.
  // 편집 섹션 id와 실제 미리보기 DOM에 붙는 ref 키가 다른 두 곳(예식일시↔달력, 기본정보↔연락처)을
  // 여기서 변환해줘야 카테고리/편집섹션 → 미리보기 스크롤이 올바른 위치로 향한다.
  // design(배경 효과/텍스처 등)은 미리보기에 독립된 섹션이 없어 previewRefs.design이 항상
  // null이었다 — 배경 효과가 가장 잘 보이는 메인화면(hero)으로 대신 이동시킨다.
  const EDITOR_TO_PREVIEW_REF: Record<string, string> = { datetime: 'calendar', basic: 'contacts', design: 'hero' };

  const handleSectionScroll = (id: string) => {
    const refId = EDITOR_TO_PREVIEW_REF[id] || id;
    const ref = previewRefs[refId as keyof typeof previewRefs];
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
    if (data.customAccentColor) vars['--wedding-main'] = data.customAccentColor;
    if (data.customLabelColor) vars['--wedding-label'] = data.customLabelColor;
    if (data.customTextColor) vars['--wedding-emphasis'] = data.customTextColor;
    return vars as React.CSSProperties;
  };

  if (isFullPreview) {
    // 가로 스크롤 모드는 세로로 이어 스크롤되는 구조가 아니라 한 섹션이 화면 높이를
    // 그대로 채우는 구조라, 실제 청첩장 링크(ViewPage)와 동일하게 컨테이너 자체를
    // 화면 높이에 고정하고 내부 세로 스크롤은 막아야 한다 — 그래야 가운데 정렬된
    // 카드 안에서 섹션이 화면 높이만큼만 나타나고 좌우로만 넘어간다.
    const isHorizontal = data.scrollDirection === 'horizontal';
    return (
      <div
        className="full-preview-container"
        style={{ fontFamily: data.fontFamily, ...(isHorizontal ? { overflowY: 'hidden' } : {}) }}
        ref={fullPreviewScrollRef}
      >
        <ToastContainer />
        <button className="back-to-editor-btn" onClick={() => setIsFullPreview(false)}>{te.backToEditor}</button>
        <div
          className={`invitation-page theme-${data.theme || 'blush'}`}
          style={{ fontSize: getBaseFontSize(), ...getCustomColorVars(), ...(isHorizontal ? { height: '100%', minHeight: 0 } : {}) }}
        >
          <ScrollRootContext.Provider value={fullPreviewScrollRef}>
            <InvitationView data={data} showOpening shareEnabled={!!data.isPaid} enableAnonymousOpening isOwnerPreview />
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
            // 최초 저장(아직 한 번도 저장/불러온 적 없는 새 청첩장)일 때만 신랑/신부 이름도
            // 필수로 요구한다 — 이미 저장된 청첩장을 다시 편집/저장할 때는 굳이 막지 않는다.
            if (!hasSavedOnceRef.current && (!data.groomName?.trim() || !data.brideName?.trim())) {
              toast.warning(te.noGroomBrideName);
              return;
            }
            performSave();
          }}>
            <Save size={15} />
            {saveStatus === 'saving' ? te.saving : saveStatus === 'success' ? te.saved : saveStatus === 'error' ? te.saveFailed : te.save}
          </button>
          <button className="header-text-btn reset" onClick={handleReset}><RotateCcw size={14} /> {te.reset}</button>
        </div>
      </header></div>

      <main className="builder-main-container">
        <div className={`editor-panel ${mobileView === 'preview' ? 'mobile-hidden' : ''}`}>
          <EditorContainer ref={editorRef} onSectionClick={handleSectionScroll} />
        </div>

        <div className={`preview-panel ${mobileView === 'preview' ? 'mobile-visible' : ''}`}>
          <div className={`preview-container-box${data.scrollDirection === 'horizontal' ? ' preview-container-box--phone' : ''}`}>
            <div className="preview-header-bar">
              <div className="preview-label">Live Preview</div>
              <button className="full-preview-btn-mini" onClick={() => setIsFullPreview(true)}>{te.fullscreen}</button>
            </div>
            <div className={`preview-content-scroll theme-${data.theme || 'blush'}`} ref={previewScrollRef} style={{ fontFamily: data.fontFamily, fontSize: getBaseFontSize(), ...getCustomColorVars(), ...(data.scrollDirection === 'horizontal' ? { overflowY: 'hidden' } : {}) }}>
              <ScrollRootContext.Provider value={previewScrollRef}>
                <InvitationView data={data} previewRefs={previewRefs} onSectionNav={handlePreviewSectionNav} shareEnabled={!!data.isPaid} enableAnonymousOpening isOwnerPreview />
              </ScrollRootContext.Provider>
            </div>
          </div>

          {data.scrollDirection === 'horizontal' && (
            <p className="preview-horizontal-note">
              가로모드 미리보기는 실제 폰 화면 비율에 맞추기 위해 위쪽에 고정돼 있어 아래
              여백이 비어 보일 수 있어요. 실제 청첩장에서는 화면을 꽉 채워 균형 있게 보이도록
              설계되어 있으니 걱정하지 않으셔도 됩니다.
            </p>
          )}

          <button className="preview-nav-fab" onClick={() => setPreviewNavOpen(!previewNavOpen)}>
            {previewNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          {previewNavOpen && (
            <div className="preview-nav-overlay" onClick={() => setPreviewNavOpen(false)}>
              <div className="preview-nav-panel" onClick={(e) => e.stopPropagation()}>
                {[
                  { id: 'hero', name: '메인화면' },
                  { id: 'calendar', name: '예식일시' },
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