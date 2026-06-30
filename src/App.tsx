import React, { useState, useEffect, useRef, useCallback } from 'react';
import EditorContainer from './components/Editor/EditorContainer';
import InvitationView from './components/Preview/InvitationView';
import ToastContainer from './components/Toast';
import { ScrollRootContext } from './components/Preview/ScrollReveal';
import useInvitationStore, { initialData } from './stores/useInvitationStore';
import { toast } from './stores/useToastStore';
import { saveInvitation, checkSlugAvailable, loadInvitation, deleteInvitation, fetchMyInvitations } from './services/invitationService';
import { getApiErrorMessage } from './utils/apiError';
import { loadAllFonts } from './utils/loadFont';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit3, Eye, Save, ClipboardList, RotateCcw, Trash2, Menu, X } from 'lucide-react';
import { AI_PRESETS, AIPreset, applyPreset } from './data/aiPresets';
import { loadInvitationPublic } from './services/publicLoad';
import { InvitationData } from './types';
import './styles/effects.css';
import './styles/builder.css';

const App: React.FC = () => {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const data = useInvitationStore((s) => s.data);
  const setData = useInvitationStore((s) => s.setData);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [previewNavOpen, setPreviewNavOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showStartScreen, setShowStartScreen] = useState<string[] | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewPreset, setPreviewPreset] = useState<AIPreset | null>(null);
  const [sampleData, setSampleData] = useState<InvitationData | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);
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
          setShowStartScreen(null);
        } else {
          setShowStartScreen([]);
        }
      }).catch(() => { setShowStartScreen([]); }).finally(() => { setLoadingData(false); dataReadyRef.current = true; });
    } else {
      fetchMyInvitations().then((items) => {
        setShowStartScreen(items.map((item) => item.slug));
      }).catch(() => {
        setShowStartScreen([]);
      }).finally(() => { setLoadingData(false); dataReadyRef.current = true; });
    }
  }, []);


  // 브라우저 뒤로/앞으로 이동 시 URL ↔ 화면 동기화
  useEffect(() => {
    if (!dataReadyRef.current) return; // 초기 마운트는 위 loadedRef 효과가 처리
    const currentShowStartScreen = showStartScreenRef.current;
    if (!urlSlug && currentShowStartScreen === null) {
      // /edit/:slug → /editor 로 뒤로가기: 시작 화면 표시
      setLoadingData(true);
      fetchMyInvitations().then((items) => {
        setShowStartScreen(items.map((item) => item.slug));
      }).catch(() => setShowStartScreen([])).finally(() => setLoadingData(false));
    } else if (urlSlug && currentShowStartScreen !== null) {
      // 시작 화면에서 /edit/:slug 로 앞으로가기: 해당 청첩장 로드
      setShowStartScreen(null);
      setLoadingData(true);
      loadInvitation(urlSlug).then((saved) => {
        if (saved) { setData(saved); hasSavedOnceRef.current = true; }
      }).catch(() => {}).finally(() => setLoadingData(false));
    }
  }, [urlSlug]);

  const handleLoadExisting = async (slug: string) => {
    setShowStartScreen(null);
    navigate(`/edit/${slug}`, { state: { screen: 'editor' } });
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
    setData(initialData);
    hasSavedOnceRef.current = false;
  };

  const handlePreviewPreset = async (preset: AIPreset) => {
    setShowTemplateModal(false);
    setPreviewPreset(preset);
    if (preset.sampleSlug && !sampleData) {
      setLoadingSample(true);
      try {
        const d = await loadInvitationPublic(preset.sampleSlug);
        if (d) setSampleData(d);
      } catch { /* 샘플 로드 실패 시 디자인만 미리보기 */ }
      setLoadingSample(false);
    }
  };

  const handleApplyTemplate = (preset: AIPreset) => {
    setPreviewPreset(null);
    setShowStartScreen(null);
    setData(applyPreset(preset)); // 디자인 설정만, 개인 정보 없음
    hasSavedOnceRef.current = false;
  };

  const handleDeleteSlug = async (slug: string) => {
    if (!confirm(`'${slug}' 청첩장을 삭제하시겠습니까?`)) return;
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
        toast.warning('이미 사용 중인 주소입니다. 다른 주소를 입력해주세요.');
        setSaveStatus('idle');
        return;
      }
      await saveInvitation(d.slug, d);
      hasSavedOnceRef.current = true;
      setSaveStatus('success');
      toast.success(`저장 완료! 청첩장 주소: /${d.slug}`);
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
          <button className="start-btn new" onClick={() => setShowTemplateModal(true)}>새로 만들기</button>
          {showStartScreen.length > 0 && (
            <>
              <div className="start-divider">이전 청첩장 이어서 편집</div>
              {showStartScreen.map((slug) => (
                <div key={slug} className="start-item">
                  <button className="start-btn load" onClick={() => handleLoadExisting(slug)}>
                    /{slug}
                  </button>
                  <button className="start-delete" onClick={() => handleDeleteSlug(slug)} title="삭제">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {showTemplateModal && (
          <div className="tmpl-overlay" onClick={() => setShowTemplateModal(false)}>
            <div className="tmpl-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="tmpl-handle" />
              <div className="tmpl-header">
                <span className="tmpl-title">어떻게 시작할까요?</span>
                <button className="tmpl-close" onClick={() => setShowTemplateModal(false)}>✕</button>
              </div>
              <div className="tmpl-body">
                <button className="tmpl-blank-btn" onClick={handleStartNew}>
                  <span className="tmpl-blank-title">+ 빈 청첩장으로 시작</span>
                  <span className="tmpl-blank-sub">처음부터 직접 꾸미기</span>
                </button>
                {AI_PRESETS.length > 0 && (
                  <>
                    <div className="tmpl-section-label">템플릿 선택</div>
                    <div className="tmpl-cards">
                      {AI_PRESETS.map((preset) => (
                        <button key={preset.id} className="tmpl-card" onClick={() => handlePreviewPreset(preset)}>
                          <div className="tmpl-card-bar" style={{
                            background: `linear-gradient(to right, ${preset.previewColors[0]} 0%, ${preset.previewColors[1]} 55%, ${preset.previewColors[2]} 100%)`,
                          }} />
                          <div className="tmpl-card-info">
                            <span className="tmpl-card-name">{preset.emoji} {preset.name}</span>
                            <span className="tmpl-card-desc">{preset.description}</span>
                            {preset.tags && (
                              <div className="tmpl-card-tags">
                                {preset.tags.map((tag, i) => (
                                  <span key={i} className="tmpl-card-tag">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="tmpl-card-arrow">미리보기 →</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {previewPreset && (
          <div className="tmpl-preview-root">
            <div className="tmpl-preview-bar">
              <button className="tmpl-preview-back" onClick={() => { setPreviewPreset(null); setShowTemplateModal(true); }}>
                ← 목록
              </button>
              <span className="tmpl-preview-name">{previewPreset.emoji} {previewPreset.name}</span>
              <button className="tmpl-preview-apply" onClick={() => handleApplyTemplate(previewPreset)}>
                이 템플릿으로 제작하기
              </button>
            </div>
            <div className="tmpl-preview-notice">
              샘플 사진과 정보로 미리 보는 화면입니다. 제작하기를 누르면 빈 청첩장으로 시작합니다.
            </div>
            <div className="tmpl-preview-scroll">
              {loadingSample ? (
                <div className="tmpl-preview-loading">
                  <div className="tmpl-spinner" />
                  <span>샘플 불러오는 중...</span>
                </div>
              ) : (() => {
                const s = sampleData;
                const base = applyPreset(previewPreset);
                const previewData: InvitationData = s ? {
                  ...base,
                  groomName: s.groomName,
                  brideName: s.brideName,
                  date: s.date,
                  time: s.time,
                  weddingDateISO: s.weddingDateISO,
                  heroPhoto: (previewPreset.sampleHeroFromGallery !== undefined && s.photos?.[previewPreset.sampleHeroFromGallery])
                    ? s.photos[previewPreset.sampleHeroFromGallery]
                    : s.heroPhoto || '',
                  heroPhotoX: previewPreset.sampleHeroFromGallery !== undefined ? 50 : s.heroPhotoX,
                  heroPhotoY: previewPreset.sampleHeroFromGallery !== undefined ? 50 : s.heroPhotoY,
                  heroPhoto2: s.heroPhoto2 || '',
                  heroPhoto2X: s.heroPhoto2X,
                  heroPhoto2Y: s.heroPhoto2Y,
                  photos: s.photos || [],
                  groomPhoto: s.groomPhoto || '',
                  bridePhoto: s.bridePhoto || '',
                  timeline: s.timeline?.length ? s.timeline : base.timeline,
                  parents: {
                    groomParents: (s.parents?.groomParents || []).map(p => ({ ...p, phone: '' })),
                    brideParents: (s.parents?.brideParents || []).map(p => ({ ...p, phone: '' })),
                  },
                  venueName: '세레나 웨딩홀 그랜드볼룸',
                  venueAddress: '서울특별시 강남구 테헤란로 123',
                  transport: {
                    subway: '2호선 강남역 3번 출구 도보 5분',
                    bus: '간선 140, 402번 강남역 하차',
                    parking: '건물 지하 1~3층 (3시간 무료)',
                  },
                } : base;
                const themeClass = previewData.theme ? `theme-${previewData.theme}` : '';
                return (
                  <div
                    className={`invitation-page ${themeClass} tmpl-preview-invitation${previewPreset.accentOnText ? ' tmpl-accent-text' : ''}`}
                    style={{
                      ...(previewData.customBgColor ? { '--wedding-bg': previewData.customBgColor } as React.CSSProperties : {}),
                      ...(previewData.customAccentColor ? { '--wedding-main': previewData.customAccentColor, '--wedding-accent': previewData.customAccentColor } as React.CSSProperties : {}),
                      fontFamily: previewData.fontFamily || undefined,
                    }}
                  >
                    <ScrollRootContext.Provider value={null}>
                      <InvitationView key={previewPreset.id} data={previewData} showOpening={true} shareEnabled={false} />
                    </ScrollRootContext.Provider>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
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
        <div className="topbar-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1 className="header-logo">Sonett</h1>
        </div>
        <div className="topbar-right">
          {hasSavedOnceRef.current && autoSaveStatus !== 'idle' && (
            <span className="autosave-indicator">
              {autoSaveStatus === 'saving' ? '저장 중...' : '자동 저장됨'}
            </span>
          )}
          <button className="save-btn" disabled={saveStatus === 'saving'} onClick={() => {
            if (!data.slug) { toast.warning('청첩장 주소를 먼저 설정해주세요.'); return; }
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) { toast.warning('주소는 영문 소문자, 숫자, 하이픈만 사용 가능합니다.'); return; }
            performSave();
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

      {showSavedPopup && (
        <div className="saved-popup-overlay" onClick={() => setShowSavedPopup(false)}>
          <div className="saved-popup" onClick={(e) => e.stopPropagation()}>
            <h3>저장 완료</h3>
            <p>청첩장이 저장되었습니다.<br />청첩장 관리 페이지로 이동하시겠습니까?</p>
            <div className="saved-popup-actions">
              <button className="saved-popup-btn cancel" onClick={() => setShowSavedPopup(false)}>계속 편집</button>
              <button className="saved-popup-btn confirm" onClick={() => navigate('/manage')}>관리 페이지로 이동</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;