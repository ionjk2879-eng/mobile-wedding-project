import React, { useState } from 'react';
import EditorContainer from './components/Editor/EditorContainer';
import InvitationView from './components/Preview/InvitationView';
import { ScrollRootContext } from './components/Preview/ScrollReveal';
import useInvitationStore from './stores/useInvitationStore';
import { saveInvitation, checkSlugAvailable } from './firebase';

const App: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const [isFullPreview, setIsFullPreview] = useState(false);

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

  const sharedStyles = (
    <style>{`
      .preview-wrapper { position: relative; min-height: 100%; width: 100%; background-color: var(--wedding-bg); transition: background-color 0.4s ease; }
      .preview-wrapper.texture-none { }
      .preview-wrapper.texture-paper {
        background-image:
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)' opacity='0.12'/%3E%3C/svg%3E"),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='b'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.15' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23b)' opacity='0.06'/%3E%3C/svg%3E");
      }
      .preview-wrapper.texture-linen {
        background-image:
          repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 4px);
      }
      .preview-wrapper.texture-pattern {
        background-image: radial-gradient(circle, rgba(0,0,0,0.06) 0.8px, transparent 0.8px);
        background-size: 12px 12px;
      }
      .preview-wrapper.texture-silk {
        background-image:
          repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 4px),
          repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px);
      }
      .preview-wrapper.texture-watercolor {
        background-image:
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='w'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.015' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23w)' opacity='0.07'/%3E%3C/svg%3E"),
          radial-gradient(ellipse at 20% 50%, rgba(var(--wedding-main-rgb, 200,150,180), 0.04) 0%, transparent 70%),
          radial-gradient(ellipse at 80% 30%, rgba(var(--wedding-main-rgb, 200,150,180), 0.03) 0%, transparent 60%);
      }
      .effect-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: 1; }
      .particle { position: absolute; top: -20px; }
      @keyframes fall { 0% { top: -20px; } 100% { top: 100%; } }
      .particle.blossom { width: 15px; height: 15px; background: #FFD1DC; border-radius: 50% 0 50% 50%; opacity: 0.7; animation: fall linear infinite; }
      .particle.snowflake { width: 6px; height: 6px; background: #C8D8E8; border-radius: 50%; opacity: 0.7; box-shadow: 0 0 4px rgba(200,216,232,0.5); animation: fall linear infinite; }
      .particle.star { width: 4px; height: 4px; background: #D4B896; border-radius: 50%; box-shadow: 0 0 6px 2px rgba(212,184,150,0.5); animation: twinkle 2s infinite; }
      @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      .particle.leaf { width: 12px; height: 16px; background: #A8C686; border-radius: 2px 50% 50% 50%; opacity: 0.6; animation: fall-sway linear infinite; transform-origin: center; }
      @keyframes fall-sway { 0% { top: -20px; transform: rotate(0deg) translateX(0); } 25% { transform: rotate(90deg) translateX(20px); } 50% { transform: rotate(180deg) translateX(-20px); } 75% { transform: rotate(270deg) translateX(15px); } 100% { top: 100%; transform: rotate(360deg) translateX(0); } }
      .particle.heart { color: #F4A0B0; opacity: 0.5; animation: float-up linear infinite; line-height: 1; }
      @keyframes float-up { 0% { top: 100%; opacity: 0; transform: scale(0.5) translateX(0); } 10% { opacity: 0.5; } 50% { transform: scale(1) translateX(15px); } 90% { opacity: 0.5; } 100% { top: -20px; opacity: 0; transform: scale(0.8) translateX(-10px); } }
      .particle.firefly { width: 5px; height: 5px; background: #F5E6A3; border-radius: 50%; box-shadow: 0 0 6px 2px rgba(245, 230, 163, 0.6); animation: firefly-glow ease-in-out infinite; }
      @keyframes firefly-glow { 0%, 100% { opacity: 0.1; transform: translate(0, 0); } 25% { opacity: 0.8; transform: translate(10px, -15px); } 50% { opacity: 0.3; transform: translate(-8px, 10px); } 75% { opacity: 0.9; transform: translate(12px, 5px); } }
      .particle.confetti { width: 6px; height: 10px; opacity: 0.7; animation: confetti-fall linear infinite; }
      .confetti.c1 { background: #FFB3BA; border-radius: 1px; }
      .confetti.c2 { background: #BAFFC9; border-radius: 50%; width: 7px; height: 7px; }
      .confetti.c3 { background: #BAE1FF; border-radius: 1px; transform: rotate(45deg); }
      .confetti.c4 { background: #FFFFBA; border-radius: 50%; width: 5px; height: 5px; }
      .confetti.c5 { background: #E8BAFF; border-radius: 1px; }
      @keyframes confetti-fall { 0% { top: -20px; transform: rotate(0deg) translateX(0); } 25% { transform: rotate(120deg) translateX(15px); } 50% { transform: rotate(240deg) translateX(-10px); } 75% { transform: rotate(300deg) translateX(12px); } 100% { top: 100%; transform: rotate(360deg) translateX(0); } }
      .music-float-btn {
        position: sticky; top: 12px; float: right; margin-right: 12px;
        width: 40px; height: 40px; border-radius: 50%;
        border: 1px solid var(--wedding-border); background: var(--wedding-card-bg);
        color: var(--wedding-main); font-size: 1.1em; cursor: pointer; z-index: 100;
        box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: all 0.2s;
        display: flex; align-items: center; justify-content: center;
      }
      .music-float-btn:hover { background: var(--wedding-main); color: white; border-color: var(--wedding-main); }
    `}</style>
  );

  if (isFullPreview) {
    return (
      <div className="full-preview-container" style={{ fontFamily: data.fontFamily }} ref={fullPreviewScrollRef}>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo&family=Dancing+Script&display=swap" rel="stylesheet" />
        {sharedStyles}
        <button className="back-to-editor-btn" onClick={() => setIsFullPreview(false)}>🛠️ 편집기로 돌아가기</button>
        <div className={`invitation-page theme-${data.theme || 'blush'}`} style={{ fontSize: getBaseFontSize() }}>
          <ScrollRootContext.Provider value={fullPreviewScrollRef}>
            <InvitationView data={data} />
          </ScrollRootContext.Provider>
        </div>
        <style>{`
          .full-preview-container { width: 100vw; height: 100vh; background: #F0F2F5; display: flex; justify-content: center; align-items: flex-start; overflow-y: scroll; padding: 0; margin: 0; }
          .invitation-page { width: 100%; max-width: 480px; background-color: var(--wedding-bg); min-height: 100%; position: relative; }
          .back-to-editor-btn { position: fixed; top: 20px; right: 20px; background: #B3A2C8; color: white; padding: 12px 20px; border-radius: 30px; font-size: 0.9rem; font-weight: 700; z-index: 9999; cursor: pointer; border: none; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="builder-layout">
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo&family=Dancing+Script&display=swap" rel="stylesheet" />
      {sharedStyles}

      <div className="builder-main-container">
        <div className="editor-panel">
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

        <div className="preview-panel">
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

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; overflow: hidden; background: #F0F2F5; }
        .builder-layout { height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; font-family: 'Pretendard', sans-serif; }
        .builder-main-container { display: flex; width: 100%; max-width: 1400px; height: 95vh; gap: 30px; padding: 0 20px; justify-content: center; }
        .editor-panel { flex: 0 0 700px; display: flex; flex-direction: column; background: #FFFFFF; border-radius: 28px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); overflow: hidden; border: 1px solid #E5E7EB; }
        .builder-header { padding: 24px 35px; border-bottom: 1px solid #F0F2F5; background: #FFFFFF; display: flex; justify-content: space-between; align-items: center; }
        .builder-header h1 { font-size: 1.4rem; font-weight: 800; margin: 0; color: #111827; }
        .builder-header p { font-size: 0.85rem; color: #6B7280; margin: 0; }
        .header-btns { display: flex; gap: 8px; }
        .save-btn { padding: 10px 20px; background: #D4A5C6; color: white; border: none; border-radius: 12px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .save-btn:hover { filter: brightness(0.9); }
        .view-btn, .admin-link-btn { padding: 10px 16px; border: 1px solid #E5E7EB; border-radius: 12px; font-size: 0.85rem; font-weight: 700; color: #4B5563; text-decoration: none; transition: all 0.2s; display: flex; align-items: center; }
        .view-btn:hover, .admin-link-btn:hover { border-color: #D4A5C6; color: #D4A5C6; }
        .preview-panel { flex: 0 0 450px; display: flex; flex-direction: column; height: 100%; justify-content: center; }
        .preview-container-box { width: 100%; height: 100%; background: white; border-radius: 28px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.04); border: 1px solid #E5E7EB; display: flex; flex-direction: column; }
        .preview-header-bar { display: flex; align-items: center; justify-content: space-between; padding: 15px 25px; border-bottom: 1px solid #F0F2F5; background: white; }
        .preview-label { font-size: 0.75rem; font-weight: 800; color: #B2A4B0; text-transform: uppercase; letter-spacing: 1.5px; }
        .full-preview-btn-mini { background: #F3F4F6; border: none; color: #4B5563; padding: 8px 18px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .full-preview-btn-mini:hover { background: #E5E7EB; color: #111827; }
        .preview-content-scroll { flex: 1; overflow-y: auto; scrollbar-width: none; }
        .preview-content-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;
