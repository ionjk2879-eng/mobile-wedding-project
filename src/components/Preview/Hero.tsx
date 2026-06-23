import React from 'react';
import { motion } from 'framer-motion';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Hero: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';
  const groomName = isEn && data.en.groomName ? data.en.groomName : (data.groomName || '신랑');
  const brideName = isEn && data.en.brideName ? data.en.brideName : (data.brideName || '신부');
  const venueName = isEn && data.en.venueName ? data.en.venueName : data.venueName;
  const dateStr = isEn && data.en.date ? data.en.date : data.date;
  const timeStr = isEn && data.en.time ? data.en.time : data.time;
  const style = data.heroStyle || 'classic';

  const calculateDDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weddingDate = new Date(data.weddingDateISO);
    weddingDate.setHours(0, 0, 0, 0);
    const diffTime = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'D-Day';
    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    return `D-${diffDays}`;
  };

  const photoEl = data.heroPhoto ? (
    <img src={data.heroPhoto} alt="Wedding" className="hero-photo" />
  ) : (
    <div className="hero-photo-empty"><span>사진을 등록해주세요</span></div>
  );

  const renderClassic = () => (
    <div className="hero-classic">
      <div className="hero-img-wrap">{photoEl}</div>
      <div className="hero-info">
        <span className="hero-dday">{calculateDDay()}</span>
        <p className="hero-quote">Together is a beautiful place to be</p>
        <p className="hero-label">WEDDING INVITATION</p>
        <h1 className="hero-names">{groomName} <span className="amp">&</span> {brideName}</h1>
        <p className="hero-date">{dateStr}</p>
        <p className="hero-time">{timeStr}</p>
        <p className="hero-venue">{venueName}</p>
      </div>
    </div>
  );

  const renderOverlay = () => (
    <div className="hero-overlay">
      <div className="hero-img-wrap overlay-img">{photoEl}</div>
      <div className="overlay-text">
        <p className="overlay-quote">Two souls, one heart</p>
        <p className="overlay-label">YOU ARE INVITED TO CELEBRATE</p>
        <h1 className="overlay-names">{groomName} <span>&</span> {brideName}</h1>
        <p className="overlay-date">{dateStr} | {timeStr}</p>
        <p className="overlay-venue">{venueName}</p>
        <span className="overlay-dday">{calculateDDay()}</span>
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="hero-minimal">
      <p className="minimal-quote">Forever begins today</p>
      <p className="minimal-label">WE ARE GETTING MARRIED</p>
      <h1 className="minimal-names">{groomName}</h1>
      <p className="minimal-amp">&</p>
      <h1 className="minimal-names">{brideName}</h1>
      <div className="minimal-divider" />
      <p className="minimal-date">{dateStr}</p>
      <p className="minimal-time">{timeStr} · {venueName}</p>
      <span className="minimal-dday">{calculateDDay()}</span>
      {data.heroPhoto && <div className="hero-img-wrap minimal-img"><img src={data.heroPhoto} alt="Wedding" className="hero-photo" /></div>}
    </div>
  );

  const renderEditorial = () => (
    <div className="hero-editorial">
      <div className="editorial-top">
        <span className="editorial-dday">{calculateDDay()}</span>
        <p className="editorial-quote">A love story written in the stars</p>
        <p className="editorial-label">THE WEDDING OF</p>
      </div>
      <div className="hero-img-wrap editorial-img">{photoEl}</div>
      <div className="editorial-bottom">
        <h1 className="editorial-groom">{groomName}</h1>
        <p className="editorial-amp">&</p>
        <h1 className="editorial-bride">{brideName}</h1>
        <p className="editorial-sub">Please join us to celebrate our love</p>
        <div className="editorial-details">
          <span>{dateStr}</span>
          <span>{timeStr}</span>
          <span>{venueName}</span>
        </div>
      </div>
    </div>
  );

  const renderFullscreen = () => (
    <div className="hero-fullscreen">
      <div className="fullscreen-bg">{photoEl}</div>
      <div className="fullscreen-overlay">
        <p className="fullscreen-quote">The beginning of forever</p>
        <p className="fullscreen-label">WEDDING INVITATION</p>
        <h1 className="fullscreen-names">{groomName} <span>&</span> {brideName}</h1>
        <div className="fullscreen-info">
          <p>{dateStr} · {timeStr}</p>
          <p>{venueName}</p>
        </div>
        <span className="fullscreen-dday">{calculateDDay()}</span>
      </div>
    </div>
  );

  const renderSplit = () => (
    <div className="hero-split">
      {data.heroPhoto && <div className="split-bg"><img src={data.heroPhoto} alt="" /></div>}
      <div className="split-left">
        <p className="split-quote">Happily ever after<br />starts here</p>
        <p className="split-label">WEDDING<br />INVITATION</p>
        <div className="split-divider" />
        <h1 className="split-name">{groomName}</h1>
        <p className="split-amp">&</p>
        <h1 className="split-name">{brideName}</h1>
        <div className="split-divider" />
        <p className="split-date">{dateStr}</p>
        <p className="split-time">{timeStr}</p>
        <p className="split-venue">{venueName}</p>
        <span className="split-dday">{calculateDDay()}</span>
      </div>
      <div className="split-right">
        {photoEl}
      </div>
    </div>
  );

  return (
    <section className="hero" style={{ fontFamily: data.fontFamily }} aria-label="메인">
      <motion.div
        key={`${groomName}-${brideName}-${style}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {style === 'classic' && renderClassic()}
        {style === 'overlay' && renderOverlay()}
        {style === 'minimal' && renderMinimal()}
        {style === 'editorial' && renderEditorial()}
        {style === 'fullscreen' && renderFullscreen()}
        {style === 'split' && renderSplit()}
      </motion.div>

      <style>{`
        .hero { text-align: center; background-color: transparent; position: relative; }
        .hero-photo { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hero-photo-empty { width: 100%; aspect-ratio: 3/4; display: flex; align-items: center; justify-content: center; background: var(--wedding-card-bg); border: 2px dashed var(--wedding-border); text-align: center; }
        .hero-photo-empty span { font-size: 0.9em; color: var(--wedding-text-sub); line-height: 1; }
        .hero-img-wrap { overflow: hidden; line-height: 0; }

        /* Classic */
        .hero-classic { padding: 40px 20px 60px; }
        .hero-classic .hero-img-wrap { margin-bottom: 35px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .hero-info { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .hero-quote { font-size: 0.85em; color: var(--wedding-accent); font-family: 'Dancing Script', cursive; font-style: italic; margin: 0 0 12px; opacity: 0.8; }
        .hero-dday { display: inline-block; padding: 4px 12px; background: color-mix(in srgb, var(--wedding-accent) 10%, transparent); color: var(--wedding-accent); border: 1px solid var(--wedding-accent); border-radius: 4px; font-size: 0.75em; font-weight: 600; letter-spacing: 1px; margin-bottom: 10px; }
        .hero-label { font-size: 0.7em; letter-spacing: 3px; color: var(--wedding-main); opacity: 0.7; margin: 0; font-weight: 600; }
        .hero-names { font-size: 1.8em; font-weight: 400; color: var(--wedding-text-main); margin: 10px 0; letter-spacing: 0.05em; }
        .hero-names .amp { font-size: 0.7em; color: var(--wedding-accent); opacity: 0.6; font-family: 'Cormorant Garamond', serif; font-style: italic; margin: 0 8px; }
        .hero-date { font-size: 1em; font-weight: 500; color: var(--wedding-text-main); margin: 0; letter-spacing: 1px; }
        .hero-time { font-size: 0.9em; color: var(--wedding-text-sub); margin: 0; }
        .hero-venue { font-size: 0.9em; color: var(--wedding-text-sub); margin: 5px 0 0; padding-top: 10px; border-top: 1px solid var(--wedding-border); display: inline-block; }

        /* Overlay */
        .hero-overlay { position: relative; }
        .overlay-img { height: 85vh; min-height: 500px; }
        .overlay-img .hero-photo-empty { height: 100%; aspect-ratio: auto; }
        .overlay-text { position: absolute; bottom: 0; left: 0; right: 0; padding: 60px 24px 40px; background: linear-gradient(transparent, rgba(0,0,0,0.6)); color: white; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .overlay-quote { font-size: 1em; font-family: 'Dancing Script', cursive; margin: 0 0 6px; opacity: 0.9; letter-spacing: 1px; }
        .overlay-label { font-size: 0.7em; letter-spacing: 4px; margin: 0; opacity: 0.85; }
        .overlay-names { font-size: 2em; font-weight: 300; margin: 0; font-family: 'Cormorant Garamond', serif; letter-spacing: 3px; }
        .overlay-names span { font-style: italic; opacity: 0.7; margin: 0 6px; }
        .overlay-date { font-size: 0.85em; margin: 0; opacity: 0.9; letter-spacing: 1px; }
        .overlay-venue { font-size: 0.8em; margin: 0; opacity: 0.7; }
        .overlay-dday { display: inline-block; padding: 4px 14px; border: 1px solid rgba(255,255,255,0.5); border-radius: 4px; font-size: 0.75em; letter-spacing: 1px; margin-top: 4px; }

        /* Minimal */
        .hero-minimal { padding: 80px 24px 40px; }
        .minimal-quote { font-size: 1em; color: var(--wedding-accent); font-family: 'Dancing Script', cursive; font-style: italic; margin: 0 0 20px; opacity: 0.7; }
        .minimal-label { font-size: 0.7em; letter-spacing: 5px; color: var(--wedding-text-sub); margin: 0 0 30px; }
        .minimal-names { font-size: 2.4em; font-weight: 300; color: var(--wedding-text-main); margin: 0; font-family: 'Cormorant Garamond', serif; letter-spacing: 5px; }
        .minimal-amp { font-size: 1.5em; color: var(--wedding-accent); font-family: 'Cormorant Garamond', serif; font-style: italic; margin: 10px 0; opacity: 0.5; }
        .minimal-divider { width: 30px; height: 1px; background: var(--wedding-border); margin: 25px auto; }
        .minimal-date { font-size: 1em; color: var(--wedding-text-main); margin: 0; letter-spacing: 2px; font-weight: 500; }
        .minimal-time { font-size: 0.85em; color: var(--wedding-text-sub); margin: 8px 0 0; }
        .minimal-dday { display: inline-block; margin-top: 20px; padding: 4px 12px; border: 1px solid var(--wedding-accent); color: var(--wedding-accent); border-radius: 4px; font-size: 0.75em; letter-spacing: 1px; }
        .minimal-img { margin-top: 40px; border-radius: 16px; }

        /* Editorial */
        .hero-editorial { padding: 50px 24px 60px; }
        .editorial-top { margin-bottom: 24px; }
        .editorial-dday { display: inline-block; padding: 4px 12px; background: var(--wedding-main); color: white; border-radius: 4px; font-size: 0.7em; font-weight: 700; letter-spacing: 1px; margin-bottom: 12px; }
        .editorial-quote { font-size: 0.9em; color: var(--wedding-accent); font-family: 'Dancing Script', cursive; font-style: italic; margin: 0 0 8px; }
        .editorial-label { font-size: 0.7em; letter-spacing: 5px; color: var(--wedding-text-sub); margin: 0; }
        .editorial-img { margin-bottom: 30px; border-radius: 8px; aspect-ratio: 4/5; }
        .editorial-bottom { display: flex; flex-direction: column; align-items: center; }
        .editorial-groom, .editorial-bride { font-size: 2em; font-weight: 300; color: var(--wedding-text-main); margin: 0; font-family: 'Playfair Display', serif; letter-spacing: 3px; }
        .editorial-amp { font-size: 1.2em; color: var(--wedding-accent); font-family: 'Cormorant Garamond', serif; font-style: italic; margin: 5px 0; opacity: 0.5; }
        .editorial-sub { font-size: 0.8em; color: var(--wedding-text-sub); font-family: 'Cormorant Garamond', serif; font-style: italic; margin: 12px 0 0; letter-spacing: 1px; }
        .editorial-details { display: flex; flex-direction: column; gap: 4px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--wedding-border); }
        .editorial-details span { font-size: 0.85em; color: var(--wedding-text-sub); letter-spacing: 1px; }

        /* Fullscreen */
        .hero-fullscreen { position: relative; height: 100vh; min-height: 600px; overflow: hidden; }
        .fullscreen-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .fullscreen-bg .hero-photo { height: 100%; object-fit: cover; }
        .fullscreen-bg .hero-photo-empty { height: 100%; aspect-ratio: auto; }
        .fullscreen-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); color: white; gap: 12px; padding: 24px; box-sizing: border-box; text-align: center; }
        .fullscreen-quote { font-size: 1.1em; font-family: 'Dancing Script', cursive; margin: 0 0 8px; opacity: 0.85; letter-spacing: 1px; }
        .fullscreen-label { font-size: 0.75em; letter-spacing: 6px; margin: 0; opacity: 0.8; }
        .fullscreen-names { font-size: 2.5em; font-weight: 300; margin: 0; font-family: 'Cormorant Garamond', serif; letter-spacing: 5px; text-shadow: 0 2px 20px rgba(0,0,0,0.3); width: 100%; text-align: center; word-break: keep-all; }
        .fullscreen-names span { font-style: italic; opacity: 0.7; margin: 0 8px; }
        .fullscreen-info { display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; }
        .fullscreen-info p { font-size: 0.9em; margin: 0; opacity: 0.9; letter-spacing: 1px; }
        .fullscreen-dday { display: inline-block; padding: 6px 16px; border: 1px solid rgba(255,255,255,0.6); border-radius: 4px; font-size: 0.8em; letter-spacing: 2px; margin-top: 8px; }

        /* Split */
        .hero-split { display: flex; min-height: 80vh; position: relative; overflow: hidden; }
        .split-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
        .split-bg img { width: 100%; height: 100%; object-fit: cover; }
        .split-left { flex: 1; padding: 50px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; background: color-mix(in srgb, var(--wedding-bg) 82%, transparent); backdrop-filter: blur(6px); z-index: 1; }
        .split-right { flex: 1; overflow: hidden; z-index: 1; }
        .split-right .hero-photo { height: 100%; }
        .split-right .hero-photo-empty { height: 100%; aspect-ratio: auto; border: none; border-radius: 0; }
        .split-quote { font-size: 0.85em; color: var(--wedding-accent); font-family: 'Dancing Script', cursive; font-style: italic; margin: 0 0 12px; opacity: 0.7; line-height: 1.6; }
        .split-label { font-size: 0.65em; letter-spacing: 4px; color: var(--wedding-text-sub); margin: 0; line-height: 1.8; }
        .split-divider { width: 24px; height: 1px; background: var(--wedding-border); margin: 12px 0; }
        .split-name { font-size: 1.5em; font-weight: 300; color: var(--wedding-text-main); margin: 0; font-family: 'Cormorant Garamond', serif; letter-spacing: 3px; }
        .split-amp { font-size: 1em; color: var(--wedding-accent); font-family: 'Cormorant Garamond', serif; font-style: italic; margin: 4px 0; opacity: 0.5; }
        .split-date { font-size: 0.85em; color: var(--wedding-text-main); margin: 0; letter-spacing: 1px; }
        .split-time { font-size: 0.8em; color: var(--wedding-text-sub); margin: 0; }
        .split-venue { font-size: 0.8em; color: var(--wedding-text-sub); margin: 0; }
        .split-dday { display: inline-block; margin-top: 10px; padding: 4px 12px; border: 1px solid var(--wedding-accent); color: var(--wedding-accent); border-radius: 4px; font-size: 0.7em; letter-spacing: 1px; }
      `}</style>
    </section>
  );
}, (prev, next) =>
  prev.data.groomName === next.data.groomName
  && prev.data.brideName === next.data.brideName
  && prev.data.date === next.data.date
  && prev.data.time === next.data.time
  && prev.data.venueName === next.data.venueName
  && prev.data.heroPhoto === next.data.heroPhoto
  && prev.data.heroStyle === next.data.heroStyle
  && prev.data.weddingDateISO === next.data.weddingDateISO
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
);

export default Hero;
