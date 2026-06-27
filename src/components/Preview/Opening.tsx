import React, { useState, useEffect, useRef } from 'react';
import { OpeningConfig } from '../../types';

const OPENING_FONTS: Record<string, { family: string; url: string; weights: string }> = {
  elegant: {
    family: "'Noto Serif KR', serif",
    url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300&display=swap',
    weights: '200',
  },
  simple: {
    family: "'Noto Sans KR', sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;200;300&display=swap',
    weights: '100',
  },
  clean: {
    family: "'Gowun Batang', serif",
    url: 'https://fonts.googleapis.com/css2?family=Gowun+Batang&display=swap',
    weights: '400',
  },
};

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

  useEffect(() => {
    if (dismissed) return;
    const scrollRoot = document.querySelector('.view-container') || document.body;
    const prev = (scrollRoot as HTMLElement).style.overflow;
    (scrollRoot as HTMLElement).style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      (scrollRoot as HTMLElement).style.overflow = prev;
      document.body.style.overflow = '';
    };
  }, [dismissed]);

  const fontStyle = opening.openingFontStyle || 'elegant';
  const fontConfig = OPENING_FONTS[fontStyle] || OPENING_FONTS.elegant;
  const fontLoadedRef = useRef(false);
  useEffect(() => {
    if (fontLoadedRef.current) return;
    fontLoadedRef.current = true;
    if (!document.querySelector(`link[href="${fontConfig.url}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontConfig.url;
      document.head.appendChild(link);
    }
  }, [fontConfig.url]);

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

  const isCurtain = opening.openingStyle === 'curtain';
  const isInsta = opening.openingStyle === 'insta';

  const handleDismiss = () => {
    if (phase !== 'ready') return;
    setPhase('exit');
    const style = opening.openingStyle;
    const delay = style === 'curtain' ? 1200 : style === 'fade' ? 1800 : style === 'insta' ? 600 : style === 'frame' ? 900 : 2200;
    setTimeout(() => setDismissed(true), delay);
  };

  return (
    <div
      className={`op-root op-${opening.openingStyle} op-phase-${phase}`}
      style={{ '--op-bg': bgColor, '--op-opacity': opacity, '--op-text': textColor, '--op-accent': accentColor, '--op-font': fontConfig.family, '--op-weight': fontConfig.weights } as React.CSSProperties}
    >
      {isCurtain && <div className="op-curtain-deco op-deco-top" />}
      {isCurtain && <div className="op-curtain-deco op-deco-bottom" />}
      {isInsta && <div className="op-insta-progress"><div className="op-insta-bar" /></div>}

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

    </div>
  );
};

export default Opening;
