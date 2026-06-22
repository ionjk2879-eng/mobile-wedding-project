import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Money: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [activeSide, setActiveSide] = useState<'groom' | 'bride'>('groom');
  const [cardIndex, setCardIndex] = useState(0);
  const [groomOpen, setGroomOpen] = useState(false);
  const [brideOpen, setBrideOpen] = useState(false);
  const dragStartX = React.useRef(0);
  const dragDelta = React.useRef(0);
  const isDragging = React.useRef(false);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);

  const handleSideChange = (side: 'groom' | 'bride') => {
    setActiveSide(side);
    setCardIndex(0);
  };

  const getViewportWidth = () => viewportRef.current?.clientWidth || 1;

  const onDragStart = (clientX: number) => {
    isDragging.current = true;
    dragStartX.current = clientX;
    dragDelta.current = 0;
    if (trackRef.current) trackRef.current.style.transition = 'none';
  };

  const onDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    dragDelta.current = clientX - dragStartX.current;
    if (trackRef.current) {
      const base = -(cardIndex * 100);
      const pct = (dragDelta.current / getViewportWidth()) * 100;
      trackRef.current.style.transform = `translateX(${base + pct}%)`;
    }
  };

  const onDragEnd = (total: number) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.transition = 'transform 0.35s ease';
    const threshold = 40;
    if (dragDelta.current < -threshold && cardIndex < total - 1) {
      setCardIndex(cardIndex + 1);
    } else if (dragDelta.current > threshold && cardIndex > 0) {
      setCardIndex(cardIndex - 1);
    } else if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${cardIndex * 100}%)`;
    }
  };

  const handleCopy = (account: string) => {
    navigator.clipboard.writeText(account);
    setCopiedAccount(account);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const formatAccountNumber = (bank: string, number: string) => {
    const digits = number.replace(/[^0-9]/g, '');
    if (!digits) return number;

    const patterns: Record<string, number[]> = {
      '국민': [3, 2, 4, 3],
      'KB': [3, 2, 4, 3],
      '신한': [3, 3, 6],
      '우리': [4, 3, 6],
      '하나': [3, 6, 5],
      'KEB': [3, 6, 5],
      '농협': [3, 4, 4, 2],
      'NH': [3, 4, 4, 2],
      '기업': [3, 6, 2, 3],
      'IBK': [3, 6, 2, 3],
      '카카오': [4, 2, 7],
      '케이': [3, 3, 6],
      '토스': [4, 4, 4],
      '씨티': [3, 6, 3],
      'SC': [3, 2, 6, 1],
      '대구': [3, 2, 6, 1],
      '부산': [3, 4, 4, 2],
      '경남': [3, 2, 6, 1],
      '광주': [3, 3, 6],
      '전북': [3, 2, 7],
      '제주': [3, 2, 6, 1],
      '수협': [3, 4, 4, 2],
      '새마을': [4, 2, 6, 1],
      '신협': [3, 3, 6],
      '우체국': [6, 2, 6],
      '산업': [3, 6, 2, 3],
      'KDB': [3, 6, 2, 3],
    };

    const bankKey = Object.keys(patterns).find(k => bank.includes(k));
    if (!bankKey) {
      return digits.replace(/(\d{4})(?=\d)/g, '$1-');
    }

    const segs = patterns[bankKey];
    let result = '';
    let pos = 0;
    for (let i = 0; i < segs.length && pos < digits.length; i++) {
      if (i > 0) result += '-';
      result += digits.slice(pos, pos + segs[i]);
      pos += segs[i];
    }
    if (pos < digits.length) {
      result += '-' + digits.slice(pos);
    }
    return result;
  };

  const hasContent = (acc: typeof data.accounts[0]) => acc.bank || acc.number || acc.owner;

  const renderAccountItem = (acc: typeof data.accounts[0], index: number) => (
    <div key={index} className="account-item">
      <div className="account-info">
        <span className="side-label">{acc.side}</span>
        <div className="account-owner">{acc.owner}</div>
        <div className="account-number-row">
          <span className="account-number">{formatAccountNumber(acc.bank, acc.number)}</span>
          {acc.number && (
            <button className={`copy-icon-btn ${copiedAccount === acc.number ? 'copied' : ''}`} onClick={() => handleCopy(acc.number)}>
              {copiedAccount === acc.number ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
        </div>
        {acc.bank && <span className="bank-badge">{acc.bank}</span>}
      </div>
    </div>
  );

  const renderAccounts = () => {
    const filled = data.accounts.filter(hasContent);
    if (filled.length === 0) return null;

    if (data.accountStyle === 'style2') {
      const groomAccounts = filled.filter(a => a.side.startsWith('신랑'));
      const brideAccounts = filled.filter(a => a.side.startsWith('신부'));
      const currentAccounts = activeSide === 'groom' ? groomAccounts : brideAccounts;
      return (
        <div className="account-list style2">
          <div className="side-tabs">
            <button className={`side-tab ${activeSide === 'groom' ? 'active' : ''}`} onClick={() => handleSideChange('groom')}>
              {isEn ? "Groom's Side" : '신랑측'}
            </button>
            <button className={`side-tab ${activeSide === 'bride' ? 'active' : ''}`} onClick={() => handleSideChange('bride')}>
              {isEn ? "Bride's Side" : '신부측'}
            </button>
          </div>
          <div
            className="carousel-viewport"
            ref={viewportRef}
            onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
            onTouchEnd={() => onDragEnd(currentAccounts.length)}
            onMouseDown={(e) => { e.preventDefault(); onDragStart(e.clientX); }}
            onMouseMove={(e) => onDragMove(e.clientX)}
            onMouseUp={() => onDragEnd(currentAccounts.length)}
            onMouseLeave={() => onDragEnd(currentAccounts.length)}
          >
            <div className="carousel-track" ref={trackRef} style={{ transform: `translateX(-${cardIndex * 100}%)` }}>
              {currentAccounts.map((acc, i) => (
                <div key={`${activeSide}-${i}`} className="carousel-card">
                  <span className="side-label">{acc.side}</span>
                  <div className="carousel-owner">{acc.owner}</div>
                  <div className="account-number-row">
                    <span className="account-number">{formatAccountNumber(acc.bank, acc.number)}</span>
                    {acc.number && (
                      <button className={`copy-icon-btn ${copiedAccount === acc.number ? 'copied' : ''}`} onClick={() => handleCopy(acc.number)}>
                        {copiedAccount === acc.number ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                  {acc.bank && <span className="bank-badge">{acc.bank}</span>}
                </div>
              ))}
            </div>
          </div>
          {currentAccounts.length > 1 && (
            <div className="carousel-dots">
              {currentAccounts.map((_, i) => (
                <button key={i} className={`carousel-dot ${i === cardIndex ? 'active' : ''}`} onClick={() => setCardIndex(i)} />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (data.accountStyle === 'style1') {
      const groomAccounts = filled.filter(a => a.side.startsWith('신랑'));
      const brideAccounts = filled.filter(a => a.side.startsWith('신부'));
      return (
        <div className="account-list style1">
          {groomAccounts.length > 0 && (
            <div className="account-group">
              <p className="account-group-label">{isEn ? "Groom's Side" : '신랑측'}</p>
              {groomAccounts.map((acc, i) => renderAccountItem(acc, i))}
            </div>
          )}
          {brideAccounts.length > 0 && (
            <div className="account-group">
              <p className="account-group-label">{isEn ? "Bride's Side" : '신부측'}</p>
              {brideAccounts.map((acc, i) => renderAccountItem(acc, i + 100))}
            </div>
          )}
        </div>
      );
    }

    if (data.accountStyle === 'style3') {
      const groomAccounts = filled.filter(a => a.side.startsWith('신랑'));
      const brideAccounts = filled.filter(a => a.side.startsWith('신부'));
      return (
        <div className="account-list style3">
          {groomAccounts.length > 0 && (
            <div className="accordion-group">
              <button className={`accordion-toggle ${groomOpen ? 'open' : ''}`} onClick={() => setGroomOpen(!groomOpen)}>
                <span>{isEn ? "Groom's Side" : '신랑측'}</span>
                <span className="accordion-arrow">{groomOpen ? '−' : '+'}</span>
              </button>
              <div className={`accordion-body ${groomOpen ? 'open' : ''}`}>
                <div className="accordion-inner">
                  {groomAccounts.map((acc, i) => renderAccountItem(acc, i))}
                </div>
              </div>
            </div>
          )}
          {brideAccounts.length > 0 && (
            <div className="accordion-group">
              <button className={`accordion-toggle ${brideOpen ? 'open' : ''}`} onClick={() => setBrideOpen(!brideOpen)}>
                <span>{isEn ? "Bride's Side" : '신부측'}</span>
                <span className="accordion-arrow">{brideOpen ? '−' : '+'}</span>
              </button>
              <div className={`accordion-body ${brideOpen ? 'open' : ''}`}>
                <div className="accordion-inner">
                  {brideAccounts.map((acc, i) => renderAccountItem(acc, i + 100))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="account-list">
        {filled.map((acc, index) => renderAccountItem(acc, index))}
      </div>
    );
  };

  return (
    <section className="money section" style={{ fontFamily: data.fontFamily }}>
      <h2>GIFT</h2>
      <p className="section-sub">축하의 마음을 전하실 수 있습니다</p>
      <p className="money-desc">
        {isEn 
          ? 'Your presence is enough, but if you wish to give,\nwe appreciate your kindness.' 
          : '축하의 마음을 담아 축의금을 전달하실 수 있습니다.'}
      </p>

      {renderAccounts()}


      <style>{`
        .money-desc {
          font-size: 0.9em;
          color: var(--wedding-text-sub);
          margin-bottom: 30px;
          white-space: pre-line;
        }
        .account-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 50px;
        }
        .account-item {
          background: var(--wedding-card-bg);
          padding: 20px;
          border-radius: 14px;
          text-align: left;
          border: 1px solid var(--wedding-border);
        }
        .side-label {
          font-size: 0.75em;
          color: var(--wedding-main);
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
        }
        .account-owner {
          font-size: 1.05em;
          font-weight: 700;
          color: var(--wedding-text-main);
          margin-bottom: 8px;
        }
        .account-number-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .account-number {
          font-size: 0.9em;
          color: var(--wedding-text-body);
          letter-spacing: 0.3px;
        }
        .copy-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--wedding-border);
          background: var(--wedding-bg);
          color: var(--wedding-main);
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          padding: 0;
        }
        .copy-icon-btn:hover {
          background: var(--wedding-border);
        }
        .copy-icon-btn.copied {
          background: var(--wedding-main);
          border-color: var(--wedding-main);
          color: white;
        }
        .bank-badge {
          display: inline-block;
          font-size: 0.75em;
          font-weight: 700;
          color: var(--wedding-main);
          background: var(--wedding-bg);
          border: 1px solid var(--wedding-border);
          padding: 4px 12px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }
        .account-group {
          margin-bottom: 28px;
        }
        .account-group:last-child {
          margin-bottom: 0;
        }
        .account-group-label {
          font-size: 0.8em;
          font-weight: 700;
          color: var(--wedding-main);
          letter-spacing: 1px;
          margin: 0 0 12px 0;
        }
        .account-group .account-item {
          margin-bottom: 10px;
        }
        .account-group .account-item:last-child {
          margin-bottom: 0;
        }
        .side-tabs {
          display: flex;
          background: var(--wedding-bg);
          border-radius: 14px;
          padding: 4px;
          margin-bottom: 20px;
        }
        .side-tab {
          flex: 1;
          padding: 12px;
          border: none;
          background: none;
          border-radius: 10px;
          font-size: 0.85em;
          font-weight: 700;
          color: var(--wedding-text-sub);
          cursor: pointer;
          transition: all 0.25s;
        }
        .side-tab.active {
          background: var(--wedding-card-bg);
          color: var(--wedding-main);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .carousel-viewport {
          overflow: hidden;
          position: relative;
          touch-action: pan-x;
          cursor: grab;
          user-select: none;
        }
        .carousel-viewport:active {
          cursor: grabbing;
        }
        .carousel-track {
          display: flex;
          transition: transform 0.35s ease;
        }
        .carousel-card {
          width: 100%;
          flex-shrink: 0;
          box-sizing: border-box;
          background: var(--wedding-card-bg);
          border: 1px solid var(--wedding-border);
          border-radius: 18px;
          padding: 24px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .carousel-card .side-label {
          margin-bottom: 8px;
        }
        .carousel-owner {
          font-size: 1.1em;
          font-weight: 700;
          color: var(--wedding-text-main);
          margin-bottom: 6px;
        }
        .carousel-card .account-number-row {
          justify-content: center;
        }
        .carousel-card .bank-badge {
          margin-top: 4px;
        }
        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
        }
        .carousel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: var(--wedding-border);
          padding: 0;
          cursor: pointer;
          transition: all 0.25s;
        }
        .carousel-dot.active {
          background: var(--wedding-main);
          width: 20px;
          border-radius: 4px;
        }
        .accordion-group {
          margin-bottom: 14px;
        }
        .accordion-group:last-child {
          margin-bottom: 0;
        }
        .accordion-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--wedding-card-bg);
          border: 1px solid var(--wedding-border);
          border-radius: 14px;
          font-size: 0.9em;
          font-weight: 700;
          color: var(--wedding-text-main);
          cursor: pointer;
          transition: all 0.25s;
        }
        .accordion-toggle.open {
          border-radius: 14px 14px 0 0;
          border-bottom-color: transparent;
          color: var(--wedding-main);
        }
        .accordion-arrow {
          font-size: 1.2em;
          font-weight: 400;
          color: var(--wedding-main);
          line-height: 1;
        }
        .accordion-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
        }
        .accordion-body.open {
          max-height: 600px;
        }
        .accordion-inner {
          border: 1px solid var(--wedding-border);
          border-top: none;
          border-radius: 0 0 14px 14px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--wedding-bg);
        }
      `}</style>
    </section>
  );
}, (prev, next) =>
  prev.data.accounts === next.data.accounts
  && prev.data.accountStyle === next.data.accountStyle
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
);

export default Money;
