import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { loadInvitation } from '../firebase';
import { InvitationData } from '../types';
import Hero from '../components/Preview/Hero';
import Greeting from '../components/Preview/Greeting';
import Calendar from '../components/Preview/Calendar';
import PersonalMessage from '../components/Preview/PersonalMessage';
import Interview from '../components/Preview/Interview';
import Gallery from '../components/Preview/Gallery';
import Timeline from '../components/Preview/Timeline';
import Location from '../components/Preview/Location';
import RSVPForm from '../components/Preview/RSVPForm';
import Money from '../components/Preview/Money';
import Contacts from '../components/Preview/Contacts';
import Share from '../components/Preview/Share';
import ScrollReveal, { ScrollRootContext } from '../components/Preview/ScrollReveal';

const ViewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const userPaused = useRef(false);
  const autoPlayed = useRef(false);

  useEffect(() => {
    if (!slug) return;
    loadInvitation(slug).then(d => {
      if (d) setData(d);
      else setError(true);
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (!data?.bgMusicUrl) return;
    const tryAutoPlay = () => {
      if (autoPlayed.current || userPaused.current || !audioRef.current) return;
      audioRef.current.play().then(() => { autoPlayed.current = true; setIsMusicPlaying(true); }).catch(() => {});
    };
    const events = ['click', 'touchstart', 'scroll', 'mousedown'] as const;
    events.forEach(e => window.addEventListener(e, tryAutoPlay, { capture: true }));
    return () => { events.forEach(e => window.removeEventListener(e, tryAutoPlay, { capture: true })); };
  }, [data?.bgMusicUrl]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      userPaused.current = true;
    } else {
      audioRef.current.play().then(() => { setIsMusicPlaying(true); userPaused.current = false; }).catch(() => {});
    }
  };

  if (loading) return <div className="view-loading"><p>청첩장을 불러오는 중...</p></div>;
  if (error || !data) return <div className="view-error"><h2>청첩장을 찾을 수 없습니다</h2><p>주소를 다시 확인해주세요.</p></div>;

  const getBaseFontSize = () => {
    switch (data.fontSize) { case 'small': return '14px'; case 'large': return '19px'; default: return '16.5px'; }
  };

  const renderSection = (id: string, i: number) => {
    const eff = data.scrollEffect || 'none';
    const delay = i % 2 === 0 ? 0 : 100;
    switch (id) {
      case 'greeting': return <ScrollReveal key={id} effect={eff} delay={delay}><Greeting data={data} /></ScrollReveal>;
      case 'calendar': return <ScrollReveal key={id} effect={eff} delay={delay}><Calendar data={data} /></ScrollReveal>;
      case 'message': return <ScrollReveal key={id} effect={eff} delay={delay}><PersonalMessage data={data} /></ScrollReveal>;
      case 'interview': return <ScrollReveal key={id} effect={eff} delay={delay}><Interview data={data} /></ScrollReveal>;
      case 'photos': return <ScrollReveal key={id} effect={eff} delay={delay}><Gallery data={data} /></ScrollReveal>;
      case 'timeline': return <ScrollReveal key={id} effect={eff} delay={delay}><Timeline data={data} /></ScrollReveal>;
      case 'location': return <ScrollReveal key={id} effect={eff} delay={delay}><Location data={data} /></ScrollReveal>;
      case 'rsvp': return <ScrollReveal key={id} effect={eff} delay={delay}><RSVPForm data={data} /></ScrollReveal>;
      case 'accounts': return <ScrollReveal key={id} effect={eff} delay={delay}><Money data={data} /></ScrollReveal>;
      case 'contacts': return <ScrollReveal key={id} effect={eff} delay={delay}><Contacts data={data} /></ScrollReveal>;
      case 'share': return <ScrollReveal key={id} effect={eff} delay={delay}><Share data={data} /></ScrollReveal>;
      default: return null;
    }
  };

  const order = data.sectionOrder || ['greeting','calendar','message','interview','photos','timeline','location','rsvp','accounts','contacts','share'];

  return (
    <div className="view-container" style={{ fontFamily: data.fontFamily }} ref={scrollRef}>
      {data.bgMusicUrl && <audio ref={audioRef} src={data.bgMusicUrl} loop preload="auto" />}
      <div className={`invitation-page theme-${data.theme || 'blush'}`} style={{ fontSize: getBaseFontSize() }}>
        <ScrollRootContext.Provider value={scrollRef}>
          <div className={`preview-wrapper texture-${data.bgTexture || 'none'}`}>
            {data.bgEffect === 'cherry-blossom' && <div className="effect-layer cherry-blossoms">{[...Array(20)].map((_, i) => <div key={i} className="particle blossom" style={{ left: `${Math.random()*100}%`, animationDelay: `${Math.random()*10}s`, animationDuration: `${10+Math.random()*10}s` }} />)}</div>}
            {data.bgEffect === 'snow' && <div className="effect-layer snow">{[...Array(40)].map((_, i) => <div key={i} className="particle snowflake" style={{ left: `${Math.random()*100}%`, animationDelay: `${Math.random()*10}s`, animationDuration: `${5+Math.random()*5}s` }} />)}</div>}
            {data.bgEffect === 'hearts' && <div className="effect-layer hearts">{[...Array(15)].map((_, i) => <div key={i} className="particle heart" style={{ left: `${Math.random()*100}%`, animationDelay: `${Math.random()*10}s`, animationDuration: `${8+Math.random()*8}s`, fontSize: `${8+Math.random()*10}px` }}>♥</div>)}</div>}
            {data.bgEffect === 'leaves' && <div className="effect-layer leaves">{[...Array(15)].map((_, i) => <div key={i} className="particle leaf" style={{ left: `${Math.random()*100}%`, animationDelay: `${Math.random()*12}s`, animationDuration: `${8+Math.random()*8}s` }} />)}</div>}
            {data.bgEffect === 'stars' && <div className="effect-layer stars">{[...Array(30)].map((_, i) => <div key={i} className="particle star" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()*5}s` }} />)}</div>}
            {data.bgEffect === 'firefly' && <div className="effect-layer fireflies">{[...Array(25)].map((_, i) => <div key={i} className="particle firefly" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()*6}s`, animationDuration: `${3+Math.random()*4}s` }} />)}</div>}
            {data.bgEffect === 'confetti' && <div className="effect-layer confetti-layer">{[...Array(30)].map((_, i) => <div key={i} className={`particle confetti c${(i%5)+1}`} style={{ left: `${Math.random()*100}%`, animationDelay: `${Math.random()*10}s`, animationDuration: `${6+Math.random()*6}s` }} />)}</div>}

            {data.bgMusicUrl && (
              <button className="music-float-btn" onClick={toggleMusic}>
                {isMusicPlaying ? '⏸' : '▶'}
              </button>
            )}
            <Hero data={data} />
            {order.map((id, i) => renderSection(id, i))}
          </div>
        </ScrollRootContext.Provider>
      </div>

      <style>{`
        .view-container { width: 100vw; min-height: 100vh; background: #F0F2F5; display: flex; justify-content: center; overflow-y: scroll; }
        .view-container .invitation-page { width: 100%; max-width: 480px; background-color: var(--wedding-bg); min-height: 100%; }
        .view-loading, .view-error { width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Pretendard', sans-serif; color: #6B7280; }
        .view-error h2 { color: #1F2937; margin-bottom: 8px; }
      `}</style>
    </div>
  );
};

export default ViewPage;
