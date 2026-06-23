import React, { useState, useEffect } from 'react';
import { OpeningConfig } from '../../types';

const THEME_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  blush:     { bg: '#3C2B2B', text: '#F3CDCC', accent: '#D4918E' },
  champagne: { bg: '#3B3228', text: '#E8DFD2', accent: '#C8A97E' },
  sage:      { bg: '#2B3328', text: '#D6DED0', accent: '#8BA888' },
  navy:      { bg: '#1E2638', text: '#D0D8E8', accent: '#6A80A0' },
  burgundy:  { bg: '#2E1A1E', text: '#E8D4D4', accent: '#A8626E' },
  lavender:  { bg: '#2C2038', text: '#E3DFEE', accent: '#B5A4CC' },
  dusty:     { bg: '#38282A', text: '#E8D8D4', accent: '#C99498' },
  modern:    { bg: '#1A1A1A', text: '#E8E8E8', accent: '#AAAAAA' },
  mocha:     { bg: '#2C1E16', text: '#E8DDD4', accent: '#A68B78' },
  cloud:     { bg: '#1A2A34', text: '#D8E8F0', accent: '#7BA3B8' },
  emerald:   { bg: '#0E2218', text: '#D0E8D8', accent: '#4A9E78' },
  butter:    { bg: '#3A3010', text: '#F0E8C8', accent: '#D4B050' },
  cobalt:    { bg: '#0A0E20', text: '#D0D8F0', accent: '#5070B0' },
  terracotta:{ bg: '#2E1A10', text: '#E8D8C8', accent: '#D08860' },
  rosegold:  { bg: '#3A2020', text: '#F0D8D0', accent: '#D4A090' },
  midnight:  { bg: '#0E0E20', text: '#D0D0E8', accent: '#6A6AA0' },
};

interface OpeningProps {
  opening: OpeningConfig;
  groomName: string;
  brideName: string;
  date: string;
  theme?: string;
}

const Opening: React.FC<OpeningProps> = ({ opening, groomName, brideName, date, theme }) => {
  const [dismissed, setDismissed] = useState(false);
  const [phase, setPhase] = useState<'enter' | 'ready' | 'exit'>('enter');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('ready'), 3200);
    return () => clearTimeout(timer);
  }, []);

  if (!opening.openingEnabled || dismissed) return null;

  const mainText = opening.openingText || 'We\'re getting married';
  const subText = opening.openingSubText || date;
  const colorMode = opening.openingColorMode || 'theme';
  const themeKey = theme || 'blush';
  const themeColor = THEME_COLORS[themeKey] || THEME_COLORS.blush;
  const bgColor = colorMode === 'theme' ? themeColor.bg : (opening.openingBgColor || '#1F2937');
  const textColor = colorMode === 'theme' ? themeColor.text : 'white';
  const accentColor = colorMode === 'theme' ? themeColor.accent : 'rgba(255,255,255,0.4)';
  const opacity = opening.openingBgOpacity ?? 0.95;
  const groom = groomName || '신랑';
  const bride = brideName || '신부';

  const handleDismiss = () => {
    if (phase !== 'ready') return;
    setPhase('exit');
    const delay = isCurtain ? 1200 : opening.openingStyle === 'fade' ? 1000 : 2200;
    setTimeout(() => setDismissed(true), delay);
  };

  const isCurtain = opening.openingStyle === 'curtain';

  return (
    <div
      className={`op-root op-${opening.openingStyle} op-phase-${phase}`}
      style={{ '--op-bg': bgColor, '--op-opacity': opacity, '--op-text': textColor, '--op-accent': accentColor } as React.CSSProperties}
    >
      {isCurtain && <div className="op-curtain-deco op-deco-top" />}
      {isCurtain && <div className="op-curtain-deco op-deco-bottom" />}

      <div className="op-body">
        <div className="op-line op-line-top" />

        <p className="op-names">
          {groom.split('').map((ch, i) => <span key={`g${i}`} className="op-char" style={{ animationDelay: `${0.6 + i * 0.08}s` }}>{ch}</span>)}
          <span className="op-char op-amp" style={{ animationDelay: `${0.6 + groom.length * 0.08}s` }}>&nbsp;&&nbsp;</span>
          {bride.split('').map((ch, i) => <span key={`b${i}`} className="op-char" style={{ animationDelay: `${0.6 + (groom.length + 1 + i) * 0.08}s` }}>{ch}</span>)}
        </p>

        <h2 className="op-main">
          {mainText.split('').map((ch, i) => (
            <span key={i} className="op-char" style={{ animationDelay: `${1.2 + i * 0.04}s` }}>{ch === ' ' ? ' ' : ch}</span>
          ))}
        </h2>

        <p className="op-sub">{subText}</p>

        <div className="op-line op-line-bottom" />

        <button className="op-enter" onClick={handleDismiss}>초대장 열기</button>
      </div>

      <style>{`
        .op-root {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          z-index: 99999; display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          background: var(--op-bg); opacity: var(--op-opacity);
        }

        /* === Curtain === */
        .op-curtain .op-curtain-deco {
          position: absolute; left: 0; width: 100%; height: 50%;
          background: color-mix(in srgb, var(--op-bg) 90%, white 10%);
          transition: transform 1s cubic-bezier(0.76, 0, 0.24, 1);
          z-index: 1;
        }
        .op-deco-top { top: 0; transform-origin: top; }
        .op-deco-bottom { bottom: 0; transform-origin: bottom; }
        .op-curtain.op-phase-enter .op-deco-top { transform: scaleY(1); }
        .op-curtain.op-phase-enter .op-deco-bottom { transform: scaleY(1); }
        .op-curtain.op-phase-ready .op-deco-top { transform: scaleY(0); transition-delay: 0.2s; }
        .op-curtain.op-phase-ready .op-deco-bottom { transform: scaleY(0); transition-delay: 0.2s; }
        .op-curtain.op-phase-exit {
          transition: opacity 0.6s ease 0.6s, transform 0.8s cubic-bezier(0.76, 0, 0.24, 1) 0.4s;
          transform: scale(1.05);
          opacity: 0 !important;
        }

        /* === Circle === */
        .op-circle {
          clip-path: circle(0% at 50% 50%);
          animation: op-circle-open 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards;
        }
        @keyframes op-circle-open {
          to { clip-path: circle(150% at 50% 50%); }
        }
        .op-circle.op-phase-exit {
          animation: none;
          clip-path: circle(150% at 50% 50%);
          transition: clip-path 1.2s cubic-bezier(0.76, 0, 0.24, 1) 0.2s, opacity 0.4s ease 1.2s;
          clip-path: circle(0% at 50% 50%) !important;
          opacity: 0 !important;
        }

        /* === Fade === */
        .op-fade {
          opacity: 0;
          animation: op-fade-open 2s ease 0.2s forwards;
        }
        @keyframes op-fade-open {
          to { opacity: var(--op-opacity); }
        }
        .op-fade.op-phase-exit {
          animation: none;
          transition: opacity 0.8s ease;
          opacity: 0 !important;
        }

        /* === Body content === */
        .op-body {
          position: relative; z-index: 2;
          text-align: center; color: var(--op-text);
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          padding: 40px;
          max-width: 360px;
        }

        .op-phase-exit .op-body {
          animation: op-body-exit 0.5s ease forwards;
        }
        @keyframes op-body-exit {
          to { opacity: 0; transform: translateY(-30px); }
        }

        /* Character animation */
        .op-char {
          display: inline-block;
          opacity: 0;
          transform: translateY(12px);
          animation: op-char-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes op-char-in {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Decorative lines */
        .op-line {
          width: 0; height: 1px;
          background: var(--op-accent);
          animation: op-line-grow 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s forwards;
        }
        @keyframes op-line-grow { to { width: 60px; } }

        /* Names */
        .op-names {
          margin: 0; font-size: 0.9em; letter-spacing: 6px;
          font-weight: 300; opacity: 0.85;
        }
        .op-amp { opacity: 0.5; font-weight: 200; }

        /* Main text */
        .op-main {
          margin: 4px 0; font-size: 1.6em; font-weight: 300;
          letter-spacing: 1.5px; line-height: 1.4;
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
        }

        /* Sub text */
        .op-sub {
          margin: 0; font-size: 0.85em; opacity: 0;
          letter-spacing: 3px; font-weight: 300;
          animation: op-fade-up 0.6s ease 2s forwards;
        }
        @keyframes op-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 0.5; transform: translateY(0); }
        }

        /* Enter button */
        .op-enter {
          margin-top: 12px; padding: 12px 36px;
          background: transparent; border: 1px solid var(--op-accent);
          border-radius: 30px; color: var(--op-text); font-size: 0.82em;
          font-weight: 600; letter-spacing: 1.5px; cursor: pointer;
          opacity: 0; animation: op-fade-up 0.6s ease 2.4s forwards;
          transition: all 0.3s;
        }
        .op-enter:hover {
          background: color-mix(in srgb, var(--op-text) 12%, transparent);
          border-color: var(--op-text);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default Opening;
