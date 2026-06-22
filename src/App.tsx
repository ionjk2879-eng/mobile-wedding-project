import React, { useState } from 'react';
import EditorContainer from './components/Editor/EditorContainer';
import InvitationView from './components/Preview/InvitationView';
import { ScrollRootContext } from './components/Preview/ScrollReveal';
import useInvitationStore from './stores/useInvitationStore';
import { saveInvitation, checkSlugAvailable } from './firebase';
import { Edit3, Eye } from 'lucide-react';
import './styles/effects.css';
import './styles/builder.css';

const App: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

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
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo&family=Dancing+Script&display=swap" rel="stylesheet" />

      <div className="builder-main-container">
        <div className={`editor-panel ${mobileView === 'preview' ? 'mobile-hidden' : ''}`}>
          <header className="builder-header">
            <div className="header-main">
              <h1>Sonett</h1>
              <p>소중한 순간을 아름답게, 소네트 모바일 청첩장</p>
            </div>
            <div className="header-btns">
              <button className="save-btn" onClick={async () => {
                if (!data.slug) { alert('청첩장 주소를 먼저 설정해주세요.'); return; }
                try {
                  const mySlugs: string[] = JSON.parse(localStorage.getItem('sonett_my_slugs') || '[]');
                  const isOwner = mySlugs.includes(data.slug);
                  if (!isOwner) {
                    const available = await checkSlugAvailable(data.slug);
                    if (!available) {
                      alert('이미 사용 중인 주소입니다. 다른 주소를 입력해주세요.');
                      return;
                    }
                  }
                  await saveInvitation(data.slug, data);
                  if (!isOwner) {
                    mySlugs.push(data.slug);
                    localStorage.setItem('sonett_my_slugs', JSON.stringify(mySlugs));
                  }
                  alert(`저장 완료! 청첩장 주소: /w/${data.slug}\n관리 페이지: /admin/${data.slug}`);
                } catch (err) { alert('저장에 실패했습니다.'); console.error(err); }
              }}>저장하기</button>
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
      </div>

      <div className="mobile-tab-bar">
        <button className={`mobile-tab-btn ${mobileView === 'editor' ? 'active' : ''}`} onClick={() => setMobileView('editor')}>
          <Edit3 size={20} />
          <span>편집</span>
        </button>
        <button className={`mobile-tab-btn ${mobileView === 'preview' ? 'active' : ''}`} onClick={() => setMobileView('preview')}>
          <Eye size={20} />
          <span>미리보기</span>
        </button>
      </div>
    </div>
  );
};

export default App;