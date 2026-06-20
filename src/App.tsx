import React, { useState } from 'react';
import EditorContainer from './components/Editor/EditorContainer';
import Hero from './components/Preview/Hero';
import Greeting from './components/Preview/Greeting';
import Calendar from './components/Preview/Calendar';
import PersonalMessage from './components/Preview/PersonalMessage';
import Gallery from './components/Preview/Gallery';
import Interview from './components/Preview/Interview';
import Timeline from './components/Preview/Timeline';
import Location from './components/Preview/Location';
import RSVPForm from './components/Preview/RSVPForm';
import Money from './components/Preview/Money';
import Contacts from './components/Preview/Contacts';
import ScrollReveal, { ScrollRootContext } from './components/Preview/ScrollReveal';
import Share from './components/Preview/Share';
import { InvitationData } from './types';
import { saveInvitation } from './firebase';

const App: React.FC = () => {
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);


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

  const [data, setData] = useState<InvitationData>({
    groomName: '신랑',
    brideName: '신부',
    date: '2026. 10. 24. SAT',
    time: 'PM 12:30',
    venueName: '',
    venueAddress: '',
    greetingTitle: '초대합니다',
    greetingContent: '곁에 있을 때 가장 나다운 모습이 되게 하는 사람,\n꿈을 꾸게 하고, 그 꿈을 함께 나누고 싶은 사람을 만났습니다.\n\n서로의 다름을 인정하며,\n서로의 부족함을 채워주는 사랑으로\n행복한 가정을 일구어 나가겠습니다.\n\n저희의 시작을 축복해 주시면 감사하겠습니다.',
    contacts: [
      { role: '신랑', name: '신랑', phone: '' },
      { role: '신부', name: '신부', phone: '' },
    ],
    accounts: [
      { side: '신랑', bank: '', number: '', owner: '' },
      { side: '신랑 아버지', bank: '', number: '', owner: '' },
      { side: '신랑 어머니', bank: '', number: '', owner: '' },
      { side: '신부', bank: '', number: '', owner: '' },
      { side: '신부 아버지', bank: '', number: '', owner: '' },
      { side: '신부 어머니', bank: '', number: '', owner: '' },
    ],
    accountStyle: 'style1',
    galleryStyle: 'slide',
    heroPhoto: '',
    heroStyle: 'classic',
    photos: [],
    fontFamily: "'Pretendard', sans-serif",
    fontSize: 'medium',
    bgMusicUrl: '',
    groomMessage: '항상 곁에서 힘이 되어주는 든든한 남편이 되겠습니다.',
    brideMessage: '서로 아끼고 배려하며 예쁘게 잘 살겠습니다.',
    groomPhoto: '',
    bridePhoto: '',
    isRSVPEnabled: true,
    theme: 'blush',
    bgTexture: 'none',
    bgEffect: 'none',
    scrollEffect: 'none',
    weddingDateISO: '2026-10-24',
    transport: {
      subway: '예) 2호선 강남역 12번 출구 도보 5분',
      bus: '예) 강남역 정류장 하차 (140, 441번 등)',
      parking: '예) 건물 내 지하 주차장 이용 가능'
    },
    parents: {
      groomParents: [
        { role: '아버지', name: '', phone: '', isDeceased: false },
        { role: '어머니', name: '', phone: '', isDeceased: false },
      ],
      brideParents: [
        { role: '아버지', name: '', phone: '', isDeceased: false },
        { role: '어머니', name: '', phone: '', isDeceased: false },
      ]
    },
    timeline: [],
    interview: [],
    sectionOrder: ['greeting', 'calendar', 'message', 'interview', 'photos', 'timeline', 'location', 'rsvp', 'accounts', 'contacts', 'share'],
    slug: '',
    shareUrl: '',
    shareTitle: '',
    shareDescription: '',
    kakaoAppKey: '',
    videoUrl: '',
    language: 'ko',
    en: {
      groomName: 'Groom',
      brideName: 'Bride',
      venueName: '',
      venueAddress: '',
    },
  });

  const userPaused = React.useRef(false);
  const autoPlayed = React.useRef(false);

  React.useEffect(() => {
    setIsMusicPlaying(false);
    userPaused.current = false;
    autoPlayed.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [data.bgMusicUrl]);

  React.useEffect(() => {
    if (!data.bgMusicUrl) return;

    const tryAutoPlay = () => {
      if (autoPlayed.current || userPaused.current || !audioRef.current) return;
      audioRef.current.play().then(() => {
        autoPlayed.current = true;
        setIsMusicPlaying(true);
      }).catch(() => {});
    };

    const events = ['click', 'touchstart', 'scroll', 'mousedown'] as const;
    events.forEach(e => window.addEventListener(e, tryAutoPlay, { capture: true }));
    return () => {
      events.forEach(e => window.removeEventListener(e, tryAutoPlay, { capture: true }));
    };
  }, [data.bgMusicUrl]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      userPaused.current = true;
    } else {
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
        userPaused.current = false;
      }).catch(() => {});
    }
  };

  const handleSectionScroll = (id: string) => {
    const ref = previewRefs[id as keyof typeof previewRefs];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
      /* Textures */
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

      /* Effects */
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
        position: sticky;
        top: 12px;
        float: right;
        margin-right: 12px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid var(--wedding-border);
        background: var(--wedding-card-bg);
        color: var(--wedding-main);
        font-size: 1.1em;
        cursor: pointer;
        z-index: 100;
        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .music-float-btn:hover {
        background: var(--wedding-main);
        color: white;
        border-color: var(--wedding-main);
      }
    `}</style>
  );

  const previewContent = (
    <div className={`preview-wrapper texture-${data.bgTexture || 'none'}`}>
      {data.bgEffect === 'cherry-blossom' && (
        <div className="effect-layer cherry-blossoms">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle blossom" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }} />
          ))}
        </div>
      )}
      {data.bgEffect === 'snow' && (
        <div className="effect-layer snow">
          {[...Array(40)].map((_, i) => (
            <div key={i} className="particle snowflake" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }} />
          ))}
        </div>
      )}
      {data.bgEffect === 'stars' && (
        <div className="effect-layer stars">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="particle star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }} />
          ))}
        </div>
      )}
      {data.bgEffect === 'leaves' && (
        <div className="effect-layer leaves">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle leaf" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${8 + Math.random() * 8}s`
            }} />
          ))}
        </div>
      )}
      {data.bgEffect === 'hearts' && (
        <div className="effect-layer hearts">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle heart" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 8}s`,
              fontSize: `${8 + Math.random() * 10}px`
            }}>♥</div>
          ))}
        </div>
      )}
      {data.bgEffect === 'firefly' && (
        <div className="effect-layer fireflies">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="particle firefly" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }} />
          ))}
        </div>
      )}
      {data.bgEffect === 'confetti' && (
        <div className="effect-layer confetti-layer">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`particle confetti c${(i % 5) + 1}`} style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${6 + Math.random() * 6}s`
            }} />
          ))}
        </div>
      )}
      {data.bgMusicUrl && (
        <button className="music-float-btn" onClick={toggleMusic}>
          {isMusicPlaying ? '⏸' : '▶'}
        </button>
      )}
      <div ref={previewRefs.theme} />
      <div ref={previewRefs.design} />
      <div ref={previewRefs.basic}><Hero data={data} /></div>
      {(data.sectionOrder || ['greeting','calendar','message','interview','photos','timeline','location','rsvp','accounts','contacts','share']).map((id, i) => {
        const eff = data.scrollEffect || 'none';
        const delay = i % 2 === 0 ? 0 : 100;
        switch (id) {
          case 'greeting': return <ScrollReveal key={id} effect={eff} delay={delay}><div ref={previewRefs.greeting}><Greeting data={data} /></div></ScrollReveal>;
          case 'calendar': return <ScrollReveal key={id} effect={eff} delay={delay}><Calendar data={data} /></ScrollReveal>;
          case 'message': return <ScrollReveal key={id} effect={eff} delay={delay}><div ref={previewRefs.message}><PersonalMessage data={data} /></div></ScrollReveal>;
          case 'interview': return <ScrollReveal key={id} effect={eff} delay={delay}><div ref={previewRefs.interview}><Interview data={data} /></div></ScrollReveal>;
          case 'photos': return <ScrollReveal key={id} effect={eff} delay={delay}><div ref={previewRefs.photos}><Gallery data={data} /></div></ScrollReveal>;
          case 'timeline': return <ScrollReveal key={id} effect={eff} delay={delay}><div ref={previewRefs.timeline}><Timeline data={data} /></div></ScrollReveal>;
          case 'location': return <ScrollReveal key={id} effect={eff} delay={delay}><div ref={previewRefs.location}><Location data={data} /></div></ScrollReveal>;
          case 'rsvp': return <ScrollReveal key={id} effect={eff} delay={delay}><div ref={previewRefs.rsvp}><RSVPForm data={data} /></div></ScrollReveal>;
          case 'accounts': return <ScrollReveal key={id} effect={eff} delay={delay}><div ref={previewRefs.accounts}><Money data={data} /></div></ScrollReveal>;
          case 'contacts': return <ScrollReveal key={id} effect={eff} delay={delay}><div ref={previewRefs.contacts}><Contacts data={data} /></div></ScrollReveal>;
          case 'share': return <ScrollReveal key={id} effect={eff} delay={delay}><div ref={(el) => { (previewRefs.share as any).current = el; (previewRefs.music as any).current = el; }}><Share data={data} /></div></ScrollReveal>;
          default: return null;
        }
      })}
    </div>
  );

  const audioElement = data.bgMusicUrl ? <audio ref={audioRef} src={data.bgMusicUrl} loop preload="auto" /> : null;

  if (isFullPreview) {
    return (
      <div className="full-preview-container" style={{ fontFamily: data.fontFamily }} ref={fullPreviewScrollRef}>
        {audioElement}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo&family=Dancing+Script&display=swap" rel="stylesheet" />
        {sharedStyles}
        <button className="back-to-editor-btn" onClick={() => setIsFullPreview(false)}>🛠️ 편집기로 돌아가기</button>
        <div className={`invitation-page theme-${data.theme || 'blush'}`} style={{ fontSize: getBaseFontSize() }}>
          <ScrollRootContext.Provider value={fullPreviewScrollRef}>
            {previewContent}
          </ScrollRootContext.Provider>
        </div>
        <style>{`
          .full-preview-container {
            width: 100vw;
            height: 100vh;
            background: #F0F2F5;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            overflow-y: scroll;
            padding: 0;
            margin: 0;
          }
          .invitation-page {
            width: 100%;
            max-width: 480px;
            background-color: var(--wedding-bg);
            min-height: 100%;
            position: relative;
          }
          .back-to-editor-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #B3A2C8;
            color: white;
            padding: 12px 20px;
            border-radius: 30px;
            font-size: 0.9rem;
            font-weight: 700;
            z-index: 9999;
            cursor: pointer;
            border: none;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="builder-layout">
      {audioElement}
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
                  await saveInvitation(data.slug, data);
                  alert(`저장 완료! 청첩장 주소: /w/${data.slug}\n관리 페이지: /admin/${data.slug}`);
                } catch (err) { alert('저장에 실패했습니다.'); console.error(err); }
              }}>저장하기</button>
              {data.slug && <a href={`/w/${data.slug}`} target="_blank" className="view-btn">청첩장 보기</a>}
              {data.slug && <a href={`/admin/${data.slug}`} target="_blank" className="admin-link-btn">응답 확인</a>}
            </div>
          </header>
          <EditorContainer data={data} onChange={setData} onSectionClick={handleSectionScroll} />
        </div>

        <div className="preview-panel">
          <div className="preview-container-box">
            <div className="preview-header-bar">
              <div className="preview-label">Live Preview</div>
              <button className="full-preview-btn-mini" onClick={() => setIsFullPreview(true)}>
                전체화면 보기
              </button>
            </div>
            <div className={`preview-content-scroll theme-${data.theme || 'blush'}`} ref={previewScrollRef}>
              {previewContent}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; overflow: hidden; background: #F0F2F5; }
        .builder-layout {
          height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Pretendard', sans-serif;
        }
        .builder-main-container {
          display: flex;
          width: 100%;
          max-width: 1400px;
          height: 95vh;
          gap: 30px;
          padding: 0 20px;
          justify-content: center;
        }
        .editor-panel {
          flex: 0 0 700px;
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          border-radius: 28px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.04);
          overflow: hidden;
          border: 1px solid #E5E7EB;
        }
        .builder-header {
          padding: 24px 35px;
          border-bottom: 1px solid #F0F2F5;
          background: #FFFFFF;
        }
        .builder-header { display: flex; justify-content: space-between; align-items: center; }
        .builder-header h1 { font-size: 1.4rem; font-weight: 800; margin: 0; color: #111827; }
        .builder-header p { font-size: 0.85rem; color: #6B7280; margin: 0; }
        .header-btns { display: flex; gap: 8px; }
        .save-btn { padding: 10px 20px; background: #D4A5C6; color: white; border: none; border-radius: 12px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .save-btn:hover { filter: brightness(0.9); }
        .view-btn, .admin-link-btn { padding: 10px 16px; border: 1px solid #E5E7EB; border-radius: 12px; font-size: 0.85rem; font-weight: 700; color: #4B5563; text-decoration: none; transition: all 0.2s; display: flex; align-items: center; }
        .view-btn:hover, .admin-link-btn:hover { border-color: #D4A5C6; color: #D4A5C6; }
        
        .preview-panel {
          flex: 0 0 450px;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: center;
        }
        .preview-container-box {
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.04);
          border: 1px solid #E5E7EB;
          display: flex;
          flex-direction: column;
        }
        .preview-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 25px;
          border-bottom: 1px solid #F0F2F5;
          background: white;
        }
        .preview-label { font-size: 0.75rem; font-weight: 800; color: #B2A4B0; text-transform: uppercase; letter-spacing: 1.5px; }
        .full-preview-btn-mini {
          background: #F3F4F6;
          border: none;
          color: #4B5563;
          padding: 8px 18px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .full-preview-btn-mini:hover { background: #E5E7EB; color: #111827; }
        .preview-content-scroll {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .preview-content-scroll::-webkit-scrollbar { display: none; }

      `}</style>
    </div>
  );
};

export default App;
