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

const THEME_COLORS: Record<string, { bg: string; lightBg: string; text: string; accent: string }> = {
  blush:      { bg: '#3C2B2B', lightBg: '#FFF5F6', text: '#F3CDCC', accent: '#D4918E' },
  champagne:  { bg: '#3B3228', lightBg: '#FBF8F3', text: '#E8DFD2', accent: '#C8A97E' },
  sage:       { bg: '#2B3328', lightBg: '#F5F7F4', text: '#D6DED0', accent: '#8BA888' },
  navy:       { bg: '#1E2638', lightBg: '#F3F5F9', text: '#D0D8E8', accent: '#6A80A0' },
  burgundy:   { bg: '#2E1A1E', lightBg: '#FBF5F5', text: '#E8D4D4', accent: '#A8626E' },
  lavender:   { bg: '#2C2038', lightBg: '#F7F5FA', text: '#E3DFEE', accent: '#B5A4CC' },
  dusty:      { bg: '#38282A', lightBg: '#FAF5F3', text: '#E8D8D4', accent: '#C99498' },
  modern:     { bg: '#1A1A1A', lightBg: '#FAFAFA', text: '#E8E8E8', accent: '#AAAAAA' },
  mocha:      { bg: '#2C1E16', lightBg: '#F5EDE4', text: '#E8DDD4', accent: '#A68B78' },
  cloud:      { bg: '#1A2A34', lightBg: '#F8FAFB', text: '#D8E8F0', accent: '#7BA3B8' },
  emerald:    { bg: '#0E2218', lightBg: '#EDF5F0', text: '#D0E8D8', accent: '#4A9E78' },
  butter:     { bg: '#3A3010', lightBg: '#FFFCE8', text: '#F0E8C8', accent: '#D4B050' },
  cobalt:     { bg: '#0A0E20', lightBg: '#EEF0F8', text: '#D0D8F0', accent: '#5070B0' },
  terracotta: { bg: '#2E1A10', lightBg: '#FAF0E6', text: '#E8D8C8', accent: '#D08860' },
  rosegold:   { bg: '#3A2020', lightBg: '#FDF5F3', text: '#F0D8D0', accent: '#D4A090' },
  midnight:   { bg: '#0E0E20', lightBg: '#F0F0F5', text: '#D0D0E8', accent: '#6A6AA0' },
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

  // Typing-specific state
  const isTyping = opening.openingStyle === 'typing';
  const [typedCount, setTypedCount] = useState(0);
  const [typingPhase, setTypingPhase] = useState<'idle' | 'heart' | 'typing' | 'done'>('idle');

  useEffect(() => {
    const delay = opening.openingStyle === 'fade' ? 2000 : 3200;
    const timer = setTimeout(() => setPhase('ready'), delay);
    return () => clearTimeout(timer);
  }, [opening.openingStyle]);

  useEffect(() => {
    if (!isTyping) return;
    setTypedCount(0);
    setTypingPhase('idle');
    const t1 = setTimeout(() => setTypingPhase('heart'), 500);
    const t2 = setTimeout(() => setTypingPhase('typing'), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isTyping]);

  const mainTextRef = useRef(opening.openingText || 'We\'re getting married');
  mainTextRef.current = opening.openingText || 'We\'re getting married';

  useEffect(() => {
    if (typingPhase !== 'typing') return;
    const text = mainTextRef.current;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setTypedCount(count);
      if (count >= text.length) {
        clearInterval(interval);
        setTimeout(() => setTypingPhase('done'), 700);
      }
    }, 90);
    return () => clearInterval(interval);
  }, [typingPhase]);

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
  const gradientMode = opening.openingGradientMode || 'theme';
  const gradientBrightness = opening.openingGradientBrightness || 'dark';
  const themeKey = theme || 'blush';
  const themeColor = THEME_COLORS[themeKey] || THEME_COLORS.blush;

  const isThemeGradient = colorMode === 'gradient' && gradientMode === 'theme';
  const isLightVariant = isThemeGradient && gradientBrightness === 'light';

  // 기본 배경색 (CSS var fallback용)
  const bgColor = isLightVariant
    ? themeColor.lightBg
    : (colorMode === 'theme' || isThemeGradient) ? themeColor.bg : (opening.openingBgColor || '#1F2937');

  // 배경 밝기 계산 → 글자색 자동 결정 (custom 모드용)
  const hexLuminance = (hex: string): number => {
    const h = hex.replace('#', '');
    if (h.length < 6) return 0;
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const lin = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const isLightBg = (): boolean => {
    if (colorMode === 'theme') return false;
    if (isThemeGradient) return isLightVariant;
    const lum1 = hexLuminance(opening.openingBgColor || '#1F2937');
    const lum2 = colorMode === 'gradient' ? hexLuminance(opening.openingBgColor2 || opening.openingBgColor || '#1F2937') : lum1;
    return (lum1 + lum2) / 2 > 0.35;
  };
  const lightBg = isLightBg();

  // 글자색: 테마 밝게 → 어두운(bg) 색, 테마 어둡게 → 밝은(text) 색, custom → 밝기 계산
  const textColor = colorMode === 'theme' ? themeColor.text
    : isLightVariant ? themeColor.bg
    : isThemeGradient ? themeColor.text
    : (lightBg ? 'rgba(40,30,28,0.82)' : 'rgba(255,255,255,0.92)');
  const accentColor = colorMode === 'theme' ? themeColor.accent
    : isLightVariant ? `${themeColor.bg}60`
    : isThemeGradient ? themeColor.accent
    : (lightBg ? 'rgba(40,30,28,0.30)' : 'rgba(255,255,255,0.40)');

  const opacity = opening.openingBgOpacity ?? 0.95;
  const groom = groomName || '신랑';
  const bride = brideName || '신부';

  const isCurtain = opening.openingStyle === 'curtain';
  const isInsta = opening.openingStyle === 'insta';

  // Gradient background support
  const bgOverride: React.CSSProperties =
    isLightVariant
      ? { background: `linear-gradient(180deg, ${themeColor.lightBg} 0%, ${themeColor.accent} 100%)` }
      : isThemeGradient
        ? { background: `linear-gradient(180deg, ${themeColor.bg} 0%, ${themeColor.accent} 100%)` }
        : colorMode === 'gradient'
          ? { background: `linear-gradient(180deg, ${opening.openingBgColor || '#F5E6A3'} 0%, ${opening.openingBgColor2 || '#E8857A'} 100%)` }
          : {};

  const handleDismiss = () => {
    if (isTyping) {
      if (typingPhase !== 'done') return;
    } else {
      if (phase !== 'ready') return;
    }
    setPhase('exit');
    const style = opening.openingStyle;
    const delay = style === 'curtain' ? 1200 : style === 'fade' ? 1800 : style === 'insta' ? 600 : style === 'frame' ? 900 : style === 'typing' ? 1000 : 2200;
    setTimeout(() => setDismissed(true), delay);
  };

  return (
    <div
      className={`op-root op-${opening.openingStyle} op-phase-${phase}`}
      style={{ '--op-bg': bgColor, '--op-opacity': opacity, '--op-text': textColor, '--op-accent': accentColor, '--op-font': fontConfig.family, '--op-weight': fontConfig.weights, '--op-hover-bg': lightBg ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.10)', '--op-hover-bd': lightBg ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.65)', ...bgOverride } as React.CSSProperties}
    >
      {isCurtain && <div className="op-curtain-deco op-deco-top" />}
      {isCurtain && <div className="op-curtain-deco op-deco-bottom" />}
      {isInsta && <div className="op-insta-progress"><div className="op-insta-bar" /></div>}

      {isTyping ? (
        <div className={`op-typing-body${typingPhase === 'done' ? ' op-typing-done' : ''}`}>
          <div className={`op-typing-heart${typingPhase !== 'idle' ? ' visible' : ''}`}>♥</div>
          <div className="op-typing-text">
            <span>{mainText.slice(0, typedCount)}</span>
            {(typingPhase === 'typing' || (typingPhase === 'heart' && typedCount === 0)) && (
              <span className="op-cursor">|</span>
            )}
          </div>
          <p className={`op-typing-names${typingPhase === 'done' ? ' visible' : ''}`}>{groom} &amp; {bride}</p>
          <p className={`op-typing-sub${typingPhase === 'done' ? ' visible' : ''}`}>{subText}</p>
          <button className="op-enter op-typing-btn" onClick={handleDismiss}>초대장 열기</button>
        </div>
      ) : (
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
      )}

    </div>
  );
};

export default Opening;
