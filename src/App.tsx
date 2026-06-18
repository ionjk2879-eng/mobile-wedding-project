import React, { useState } from 'react';
import EditorContainer from './components/Editor/EditorContainer';
import Hero from './components/Preview/Hero';
import Greeting from './components/Preview/Greeting';
import Calendar from './components/Preview/Calendar';
import PersonalMessage from './components/Preview/PersonalMessage';
import Gallery from './components/Preview/Gallery';
import Location from './components/Preview/Location';
import RSVPForm from './components/Preview/RSVPForm';
import Money from './components/Preview/Money';
import Share from './components/Preview/Share';
import { InvitationData } from './types';

const App: React.FC = () => {
  const [isFullPreview, setIsFullPreview] = useState(false);
  const previewRefs = {
    design: React.useRef<HTMLDivElement>(null),
    basic: React.useRef<HTMLDivElement>(null),
    greeting: React.useRef<HTMLDivElement>(null),
    message: React.useRef<HTMLDivElement>(null),
    location: React.useRef<HTMLDivElement>(null),
    contacts: React.useRef<HTMLDivElement>(null),
    accounts: React.useRef<HTMLDivElement>(null),
    photos: React.useRef<HTMLDivElement>(null),
  };
  const previewScrollRef = React.useRef<HTMLDivElement>(null);

  const [data, setData] = useState<InvitationData>({
    groomName: '김지현',
    brideName: '이민지',
    date: '2026. 10. 24. SAT',
    time: 'PM 12:30',
    venueName: '서울 웨딩 가든',
    venueAddress: '서울 강남구 테헤란로 123',
    greetingTitle: '초대합니다',
    greetingContent: '곁에 있을 때 가장 나다운 모습이 되게 하는 사람,\n꿈을 꾸게 하고, 그 꿈을 함께 나누고 싶은 사람을 만났습니다.\n\n서로의 다름을 인정하며,\n서로의 부족함을 채워주는 사랑으로\n행복한 가정을 일구어 나가겠습니다.\n\n저희의 시작을 축복해 주시면 감사하겠습니다.',
    contacts: [
      { role: '신랑', name: '김지현', phone: '010-1234-5678' },
      { role: '신부', name: '이민지', phone: '010-8765-4321' },
    ],
    accounts: [
      { side: '신랑측', bank: '국민은행', number: '123456-78-901234', owner: '김지현' },
      { side: '신부측', bank: '신한은행', number: '110-123-456789', owner: '이민지' },
    ],
    heroPhoto: '/src/assets/hero.png',
    photos: [
      '/src/assets/hero.png',
      '/src/assets/hero.png',
      '/src/assets/hero.png',
      '/src/assets/hero.png',
      '/src/assets/hero.png',
      '/src/assets/hero.png',
    ],
    fontFamily: "'Pretendard', sans-serif",
    fontSize: 'medium',
    bgMusicUrl: '',
    groomMessage: '항상 곁에서 힘이 되어주는 든든한 남편이 되겠습니다.',
    brideMessage: '서로 아끼고 배려하며 예쁘게 잘 살겠습니다.',
    isRSVPEnabled: true,
    theme: 'warm',
    bgTexture: 'none',
    bgEffect: 'none',
    weddingDateISO: '2026-10-24',
    transport: {
      subway: '2호선 강남역 12번 출구 도보 5분',
      bus: '강남역 정류장 하차 (140, 441, 470번 등)',
      parking: '건물 내 지하 주차장 이용 가능 (2시간 무료)'
    },
    parents: {
      groomParents: [
        { role: '아버지', name: '김철수', phone: '010-0000-0000', isDeceased: false },
        { role: '어머니', name: '박영희', phone: '010-0000-0000', isDeceased: false },
      ],
      brideParents: [
        { role: '아버지', name: '이영호', phone: '010-0000-0000', isDeceased: false },
        { role: '어머니', name: '최미숙', phone: '010-0000-0000', isDeceased: false },
      ]
    },
    videoUrl: '',
    language: 'ko',
    en: {
      groomName: 'Jihyun Kim',
      brideName: 'Minji Lee',
      venueName: 'Seoul Wedding Garden',
      venueAddress: '123 Teheran-ro, Gangnam-gu, Seoul',
    },
  });

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
      <div ref={previewRefs.design}><Hero data={data} /></div>
      <div ref={previewRefs.basic}><Greeting data={data} /></div>
      <div ref={previewRefs.greeting}><Calendar data={data} /></div>
      <div ref={previewRefs.message}><PersonalMessage data={data} /></div>
      <div ref={previewRefs.location}><Gallery data={data} /></div>
      <div ref={previewRefs.contacts}><Location data={data} /></div>
      <div ref={previewRefs.accounts}><RSVPForm data={data} /></div>
      <div ref={previewRefs.photos}><Money data={data} /></div>
      <Share data={data} />
    </div>
  );

  if (isFullPreview) {
    return (
      <div className="full-preview-container" style={{ fontFamily: data.fontFamily }}>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo&family=Dancing+Script&display=swap" rel="stylesheet" />
        <button className="back-to-editor-btn" onClick={() => setIsFullPreview(false)}>🛠️ 편집기로 돌아가기</button>
        <div className={`invitation-page theme-${data.theme || 'warm'}`} style={{ fontSize: getBaseFontSize() }}>
          {previewContent}
        </div>
        <style>{`
          .full-preview-container {
            width: 100vw;
            height: 100vh;
            background: #FAF5F7;
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
            background: white;
            min-height: 100%;
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
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo&family=Dancing+Script&display=swap" rel="stylesheet" />
      
      <div className="builder-main-container">
        <div className="editor-panel">
          <header className="builder-header">
            <div className="header-main">
              <h1>💍 Invitation Builder</h1>
              <p>내용을 입력하면 오른쪽에서 실시간으로 확인할 수 있습니다.</p>
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
            <div className={`preview-content-scroll theme-${data.theme || 'warm'}`} ref={previewScrollRef}>
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
        .builder-header h1 { font-size: 1.4rem; font-weight: 800; margin: 0; color: #111827; }
        .builder-header p { font-size: 0.85rem; color: #6B7280; margin: 0; }
        
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

        /* Effects */
        .preview-wrapper { position: relative; min-height: 100%; width: 100%; }
        .particle { position: absolute; top: -20px; }
        @keyframes fall { 0% { top: -20px; } 100% { top: 100%; } }
        .particle.blossom { width: 15px; height: 15px; background: #FFD1DC; border-radius: 50% 0 50% 50%; opacity: 0.7; animation: fall linear infinite; }
        .particle.snowflake { width: 6px; height: 6px; background: white; border-radius: 50%; opacity: 0.8; animation: fall linear infinite; }
        .particle.star { width: 4px; height: 4px; background: white; border-radius: 50%; animation: twinkle 2s infinite; }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default App;
