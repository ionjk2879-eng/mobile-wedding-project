import React from 'react';
import { InvitationData } from '../../types';
import { isFixedLookHeroStyle } from '../../data/heroStyleConfig';
import { formatShareDate, formatShareDateJa } from '../../utils/formatShareDateTime';

interface PreviewProps {
  data: InvitationData;
}

const Hero: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';
  const groomName = isEn && data.en.groomName ? data.en.groomName : isJa && data.ja?.groomName ? data.ja.groomName : (data.groomName || (isJa ? '新郎' : '신랑'));
  const brideName = isEn && data.en.brideName ? data.en.brideName : isJa && data.ja?.brideName ? data.ja.brideName : (data.brideName || (isJa ? '新婦' : '신부'));
  const venueName = isEn && data.en.venueName ? data.en.venueName : isJa && data.ja?.venueName ? data.ja.venueName : data.venueName;
  const dateStr = (() => {
    if (isEn && data.en.date) return data.en.date;
    if (isJa) return formatShareDateJa(data.weddingDateISO) || data.date;
    if (!isEn) return formatShareDate(data.weddingDateISO) || data.date;
    return data.date;
  })();
  const timeStr = (() => {
    if (isEn && data.en.time) return data.en.time;
    if (isJa && data.time) {
      const parts = data.time.match(/(AM|PM)\s(\d+):(\d+)/);
      if (parts) {
        const ampm = parts[1] === 'AM' ? '午前' : '午後';
        return `${ampm}${parts[2]}時${parts[3] === '00' ? '' : parts[3] + '分'}`;
      }
    }
    if (!isEn && !isJa && data.time) {
      const parts = data.time.match(/(AM|PM)\s(\d+):(\d+)/);
      if (parts) {
        const ampm = parts[1] === 'AM' ? '오전' : '오후';
        return `${ampm} ${parts[2]}시${parts[3] === '00' ? '' : ` ${parts[3]}분`}`;
      }
    }
    return data.time;
  })();
  const style = data.heroStyle || 'classic';
  const yearStr = data.weddingDateISO ? data.weddingDateISO.slice(0, 4) : String(new Date().getFullYear());

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

  // 사진 모형(heroPhotoShape) 축은 이 컴포넌트(메인화면 대표 사진)에만 적용된다.
  // 고정형 스타일(src/data/heroStyleConfig.ts 참고)은 이미 완성된 사진 배치/텍스트 구성을
  // 갖고 있어 이 축을 무시(항상 basic 취급)한다.
  const heroShape = isFixedLookHeroStyle(style) ? 'basic' : (data.heroPhotoShape || 'basic');

  const wrapWithShape = (src: string | undefined, pos: string, fallback: React.ReactNode): React.ReactNode => {
    const img = src ? <img src={src} alt="Wedding" className="hero-photo" style={{ objectPosition: pos }} /> : fallback;
    if (heroShape === 'basic') return img;
    if (heroShape === 'polaroid') {
      return (
        <div className="hero-shape hero-shape-polaroid">
          {src && <img src={src} alt="" aria-hidden="true" className="hero-photo hero-photo-back" style={{ objectPosition: pos }} />}
          <div className="hero-photo-front">{img}</div>
        </div>
      );
    }
    return <div className={`hero-shape hero-shape-${heroShape}`}>{img}</div>;
  };

  const photoPos = `${data.heroPhotoX ?? 50}% ${data.heroPhotoY ?? 50}%`;
  const emptyPhotoEl = <div className="hero-photo-empty"><span>사진을 등록해주세요</span></div>;
  const photoEl = wrapWithShape(data.heroPhoto, photoPos, emptyPhotoEl);

  const photo2Pos = `${data.heroPhoto2X ?? 50}% ${data.heroPhoto2Y ?? 50}%`;
  const photo2El = data.heroPhoto2 ? wrapWithShape(data.heroPhoto2, photo2Pos, emptyPhotoEl) : photoEl;

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
      {data.heroPhoto && <div className="hero-img-wrap minimal-img">{photoEl}</div>}
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

  const renderFilmstrip = () => (
    <div className="hero-filmstrip">
      <div className="fs-bar-top">
        <span className="fs-label">Wedding</span>
        <span className="fs-sep">·</span>
        <span className="fs-datesmall">{yearStr}</span>
      </div>
      <div className="fs-photo">{photoEl}</div>
      <div className="fs-bar-bottom">
        <div className="fs-rule" />
        <h1 className="fs-names">
          <span>{groomName}</span>
          <span className="fs-amp">&</span>
          <span>{brideName}</span>
        </h1>
        <p className="fs-meta">{venueName || 'Venue'}&nbsp;·&nbsp;{calculateDDay()}</p>
      </div>
    </div>
  );

  const renderVerttype = () => (
    <div className="hero-verttype">
      <div className="vt-spine">
        <span className="vt-spine-text">Wedding Invitation</span>
        <span className="vt-year">{yearStr}</span>
      </div>
      <div className="vt-main">
        <div className="vt-photo">{photoEl}</div>
        <div className="vt-info">
          <div className="vt-rule" />
          <h1 className="vt-names">
            {groomName}
            <span className="vt-amp">&</span>
            {brideName}
          </h1>
          <p className="vt-date">{dateStr}</p>
          {venueName && <p className="vt-venue">{venueName}</p>}
          <span className="vt-dday">{calculateDDay()}</span>
        </div>
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

  const renderMagframe = () => (
    <div className="hero-magframe">
      <span className="mf-vtext mf-vtext-left">Wedding</span>
      <span className="mf-vtext mf-vtext-right">Invitation</span>
      <span className="mf-dots">•••</span>
      <div className="mf-frame">
        <div className="hero-img-wrap mf-photo">{photoEl}</div>
      </div>
      <div className="mf-info">
        <h1 className="mf-names">{groomName}<span className="mf-amp">and</span>{brideName}</h1>
        <div className="mf-divider" />
        <p className="mf-date">{dateStr}</p>
        <p className="mf-venue">{venueName}</p>
      </div>
    </div>
  );

  const renderBoldtype = () => (
    <div className="hero-boldtype">
      <div className="bt-bg">{photoEl}</div>
      <div className="bt-overlay">
        <span className="bt-dots">•••</span>
        <h1 className="bt-statement"><span>Our</span><span>Wedding.</span></h1>
        <div className="bt-bottom">
          <span className="bt-name">{groomName}</span>
          <span className="bt-name">{brideName}</span>
        </div>
      </div>
    </div>
  );

  const dateParts = data.weddingDateISO ? data.weddingDateISO.split('-') : [];
  const dsYear = dateParts[0] ? dateParts[0].slice(2) : '';
  const dsMonth = dateParts[1] || '';
  const dsDay = dateParts[2] || '';

  const renderDatesplit = () => (
    <div className="hero-datesplit">
      <div className="ds-photo">{photoEl}</div>
      <div className="ds-panel">
        <div className="ds-date">
          <span>{dsDay}</span>
          <span>{dsMonth}</span>
          <span>{dsYear}</span>
        </div>
        <div className="ds-names">
          <p><em>groom.</em> {groomName}</p>
          <p><em>bride.</em> {brideName}</p>
        </div>
        <p className="ds-venue">{venueName}</p>
      </div>
    </div>
  );

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
        {style === 'magcover' && renderMagcover()}
        {style === 'glassframe' && renderGlassframe()}
        {style === 'instacard' && renderInstacard()}
        {style === 'bookcover' && renderBookcover()}
        {style === 'bookpage' && renderBookpage()}
        {style === 'filmstrip' && renderFilmstrip()}
        {style === 'verttype' && renderVerttype()}
        {style === 'magframe' && renderMagframe()}
        {style === 'boldtype' && renderBoldtype()}
        {style === 'datesplit' && renderDatesplit()}
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
  && prev.data.heroPhotoShape === next.data.heroPhotoShape
  && prev.data.weddingDateISO === next.data.weddingDateISO
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
);

export default Hero;
