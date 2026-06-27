import React from 'react';
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

  const photoPos = `${data.heroPhotoX ?? 50}% ${data.heroPhotoY ?? 50}%`;
  const photoEl = data.heroPhoto ? (
    <img src={data.heroPhoto} alt="Wedding" className="hero-photo" style={{ objectPosition: photoPos }} />
  ) : (
    <div className="hero-photo-empty"><span>사진을 등록해주세요</span></div>
  );

  const photo2Pos = `${data.heroPhoto2X ?? 50}% ${data.heroPhoto2Y ?? 50}%`;
  const photo2El = data.heroPhoto2 ? (
    <img src={data.heroPhoto2} alt="Wedding" className="hero-photo" style={{ objectPosition: photo2Pos }} />
  ) : photoEl;

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
      <div className="split-row">
        <div className="split-info">
          <p className="split-label">GROOM</p>
          <h1 className="split-name">{groomName}</h1>
          <div className="split-divider" />
          <p className="split-quote">Happily ever after<br />starts here</p>
          <p className="split-date">{dateStr}</p>
          <p className="split-time">{timeStr}</p>
          <p className="split-venue">{venueName}</p>
          <span className="split-dday">{calculateDDay()}</span>
        </div>
        <div className="split-photo">{photoEl}</div>
      </div>
      <div className="split-row">
        <div className="split-photo">{photo2El}</div>
        <div className="split-info">
          <p className="split-label">BRIDE</p>
          <h1 className="split-name">{brideName}</h1>
          <div className="split-divider" />
          <p className="split-quote">Happily ever after<br />starts here</p>
          <p className="split-date">{dateStr}</p>
          <p className="split-time">{timeStr}</p>
          <p className="split-venue">{venueName}</p>
          <span className="split-dday">{calculateDDay()}</span>
        </div>
      </div>
    </div>
  );

  const renderCentercard = () => (
    <div className="hero-centercard">
      <p className="cc-label">WEDDING INVITATION</p>
      <div className="cc-card">
        <div className="hero-img-wrap cc-img">{photoEl}</div>
      </div>
      <h1 className="cc-names">{groomName} <span>&</span> {brideName}</h1>
      <div className="cc-divider" />
      <p className="cc-date">{dateStr}</p>
      <p className="cc-time">{timeStr}</p>
      <p className="cc-venue">{venueName}</p>
      <span className="cc-dday">{calculateDDay()}</span>
    </div>
  );

  const renderGradation = () => (
    <div className="hero-gradation">
      <div className="grad-bg">{photoEl}</div>
      <div className="grad-overlay">
        <div className="grad-bottom">
          <p className="grad-quote">Forever starts here</p>
          <h1 className="grad-names">{groomName} <span>&</span> {brideName}</h1>
          <p className="grad-date">{dateStr} · {timeStr}</p>
          <p className="grad-venue">{venueName}</p>
          <span className="grad-dday">{calculateDDay()}</span>
        </div>
      </div>
    </div>
  );

  const renderMagcover = () => (
    <div className="hero-magcover">
      <div className="mag-bg">{photoEl}</div>
      <div className="mag-overlay">
        <h1 className="mag-title">{groomName}<br /><span className="mag-amp">&</span><br />{brideName}</h1>
        <div className="mag-bottom">
          <p className="mag-label">WEDDING INVITATION</p>
          <p className="mag-date">{dateStr} · {timeStr}</p>
          <p className="mag-venue">{venueName}</p>
          <span className="mag-dday">{calculateDDay()}</span>
        </div>
      </div>
    </div>
  );

  const renderGlassframe = () => (
    <div className="hero-glassframe">
      <div className="gf-card">
        <p className="gf-label">WEDDING INVITATION</p>
        <div className="gf-photo">{photoEl}</div>
        <h1 className="gf-names">{groomName} <span>&</span> {brideName}</h1>
        <div className="gf-divider" />
        <p className="gf-date">{dateStr}</p>
        <p className="gf-time">{timeStr}</p>
        <p className="gf-venue">{venueName}</p>
        <span className="gf-dday">{calculateDDay()}</span>
      </div>
    </div>
  );

  const renderBookcover = () => (
    <div className="hero-bookcover">
      <div className="bc-bg">{photoEl}</div>
      <div className="bc-overlay" />
      <div className="bc-frame">
        <p className="bc-top-label">Wedding Invitation</p>
        <div className="bc-rule" />
        <h1 className="bc-groom">{groomName}</h1>
        <p className="bc-amp">&</p>
        <h1 className="bc-bride">{brideName}</h1>
        <div className="bc-rule" />
        <p className="bc-date">{dateStr}</p>
        <p className="bc-venue">{venueName}</p>
        <span className="bc-dday">{calculateDDay()}</span>
      </div>
    </div>
  );

  const renderBookpage = () => (
    <div className="hero-bookpage">
      <div className="bp-running-head">
        <span>Wedding Invitation</span>
        <span>·</span>
        <span>{groomName} & {brideName}</span>
      </div>
      <div className="bp-rule" />
      <div className="bp-ornament"><span>✦</span></div>
      <div className="bp-photo">{photoEl}</div>
      <div className="bp-body">
        <h1 className="bp-names">{groomName} <span>&</span> {brideName}</h1>
        <div className="bp-divider" />
        <p className="bp-date">{dateStr}</p>
        <p className="bp-time">{timeStr}</p>
        <p className="bp-venue">{venueName}</p>
      </div>
      <div className="bp-footer">
        <div className="bp-rule" />
        <span className="bp-dday">{calculateDDay()}</span>
      </div>
    </div>
  );

  const renderInstacard = () => {
    const initials = `${groomName[0] || ''}${brideName[0] || ''}`;
    return (
      <div className="hero-instacard">
        <div className="ic-header">
          <div className="ic-avatar-ring">
            <div className="ic-avatar-inner">{initials}</div>
          </div>
          <div className="ic-handle">
            <span className="ic-username">{groomName} & {brideName}</span>
            <span className="ic-location">📍 {venueName}</span>
          </div>
          <span className="ic-more">···</span>
        </div>

        <div className="ic-photo-wrap">{photoEl}</div>

        <div className="ic-actions">
          <div className="ic-actions-left">
            <span className="ic-action ic-action-heart">♡</span>
            <span className="ic-action">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <span className="ic-action">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </span>
          </div>
          <span className="ic-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </span>
        </div>

        <div className="ic-likes"><span className="ic-likes-heart">♥</span> {calculateDDay()}</div>
        <div className="ic-caption">
          <span className="ic-caption-user">{groomName} & {brideName}</span>
          <span className="ic-caption-text"> {dateStr} · {timeStr}</span>
        </div>
        <p className="ic-timestamp">WEDDING INVITATION</p>
      </div>
    );
  };

  return (
    <section className="hero" style={{ fontFamily: data.fontFamily }} aria-label="메인">
      <div
        key={`${groomName}-${brideName}-${style}`}
        className="hero-entrance"
      >
        {style === 'classic' && renderClassic()}
        {style === 'overlay' && renderOverlay()}
        {style === 'minimal' && renderMinimal()}
        {style === 'editorial' && renderEditorial()}
        {style === 'fullscreen' && renderFullscreen()}
        {style === 'split' && renderSplit()}
        {style === 'centercard' && renderCentercard()}
        {style === 'gradation' && renderGradation()}
        {style === 'magcover' && renderMagcover()}
        {style === 'glassframe' && renderGlassframe()}
        {style === 'instacard' && renderInstacard()}
        {style === 'bookcover' && renderBookcover()}
        {style === 'bookpage' && renderBookpage()}
      </div>

    </section>
  );
}, (prev, next) =>
  prev.data.groomName === next.data.groomName
  && prev.data.brideName === next.data.brideName
  && prev.data.date === next.data.date
  && prev.data.time === next.data.time
  && prev.data.venueName === next.data.venueName
  && prev.data.heroPhoto === next.data.heroPhoto
  && prev.data.heroPhotoX === next.data.heroPhotoX
  && prev.data.heroPhotoY === next.data.heroPhotoY
  && prev.data.heroPhoto2 === next.data.heroPhoto2
  && prev.data.heroPhoto2X === next.data.heroPhoto2X
  && prev.data.heroPhoto2Y === next.data.heroPhoto2Y
  && prev.data.heroStyle === next.data.heroStyle
  && prev.data.weddingDateISO === next.data.weddingDateISO
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
);

export default Hero;
