import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { OpeningConfig } from '../../types';

const OPENING_FONTS: Record<string, { family: string; url: string; weights: string }> = {
  elegant: {
    family: "'Noto Serif KR', serif",
    url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400&display=swap',
    weights: '300',
  },
  simple: {
    family: "'Noto Sans KR', sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@200;300&display=swap',
    weights: '200',
  },
  clean: {
    family: "'Gowun Batang', serif",
    url: 'https://fonts.googleapis.com/css2?family=Gowun+Batang&display=swap',
    weights: '400',
  },
};

const DECO_DOTS = [
  { left: '7%',  top: '14%', s: 4 }, { left: '16%', top: '72%', s: 3 },
  { left: '26%', top: '24%', s: 5 }, { left: '70%', top: '16%', s: 3 },
  { left: '84%', top: '63%', s: 4 }, { left: '90%', top: '32%', s: 3 },
  { left: '62%', top: '86%', s: 5 }, { left: '44%', top: '9%',  s: 3 },
  { left: '35%', top: '90%', s: 4 }, { left: '76%', top: '44%', s: 3 },
  { left: '11%', top: '50%', s: 4 }, { left: '52%', top: '76%', s: 3 },
  { left: '87%', top: '80%', s: 5 }, { left: '22%', top: '56%', s: 3 },
  { left: '66%', top: '52%', s: 4 }, { left: '4%',  top: '84%', s: 3 },
  { left: '50%', top: '5%',  s: 3 }, { left: '93%', top: '12%', s: 4 },
  { left: '33%', top: '40%', s: 3 }, { left: '78%', top: '28%', s: 4 },
  { left: '58%', top: '62%', s: 3 }, { left: '14%', top: '35%', s: 5 },
  { left: '42%', top: '78%', s: 3 }, { left: '96%', top: '55%', s: 4 },
  { left: '20%', top: '88%', s: 3 }, { left: '72%', top: '70%', s: 4 },
];

const DECO_SPARKS = [
  { left: '8%',  top: '18%' }, { left: '20%', top: '68%' },
  { left: '30%', top: '12%' }, { left: '72%', top: '20%' },
  { left: '82%', top: '58%' }, { left: '91%', top: '36%' },
  { left: '60%', top: '82%' }, { left: '46%', top: '6%'  },
  { left: '38%', top: '88%' }, { left: '74%', top: '48%' },
  { left: '13%', top: '44%' }, { left: '54%', top: '74%' },
  { left: '86%', top: '76%' }, { left: '24%', top: '52%' },
  { left: '68%', top: '30%' }, { left: '5%',  top: '80%' },
];

const THEME_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  blush:      { bg: '#3C2B2B', text: '#F3CDCC', accent: '#D4918E' },
  champagne:  { bg: '#3B3228', text: '#E8DFD2', accent: '#C8A97E' },
  sage:       { bg: '#2B3328', text: '#D6DED0', accent: '#8BA888' },
  navy:       { bg: '#1E2638', text: '#D0D8E8', accent: '#6A80A0' },
  burgundy:   { bg: '#2E1A1E', text: '#E8D4D4', accent: '#A8626E' },
  lavender:   { bg: '#2C2038', text: '#E3DFEE', accent: '#B5A4CC' },
  dusty:      { bg: '#38282A', text: '#E8D8D4', accent: '#C99498' },
  modern:     { bg: '#1A1A1A', text: '#E8E8E8', accent: '#AAAAAA' },
  mocha:      { bg: '#2C1E16', text: '#E8DDD4', accent: '#A68B78' },
  cloud:      { bg: '#1A2A34', text: '#D8E8F0', accent: '#7BA3B8' },
  emerald:    { bg: '#0E2218', text: '#D0E8D8', accent: '#4A9E78' },
  butter:     { bg: '#3A3010', text: '#F0E8C8', accent: '#D4B050' },
  cobalt:     { bg: '#0A0E20', text: '#D0D8F0', accent: '#5070B0' },
  terracotta: { bg: '#2E1A10', text: '#E8D8C8', accent: '#D08860' },
  rosegold:   { bg: '#3A2020', text: '#F0D8D0', accent: '#D4A090' },
  midnight:   { bg: '#0E0E20', text: '#D0D0E8', accent: '#6A6AA0' },
};

interface OpeningProps {
  opening: OpeningConfig;
  groomName: string;
  brideName: string;
  date: string;
  theme?: string;
  autoClose?: boolean;
  onDismissed?: () => void;
  topOffset?: number;
}

const Opening: React.FC<OpeningProps> = ({ opening, groomName, brideName, date, theme, autoClose, onDismissed, topOffset }) => {
  const [dismissed, setDismissed] = useState(false);
  const [phase, setPhase] = useState<'enter' | 'ready' | 'exit'>('enter');

  const rootRef = useRef<HTMLDivElement>(null);
  const [editorBounds, setEditorBounds] = useState<React.CSSProperties>({});
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const scrollEl = el.closest('.preview-content-scroll') as HTMLElement | null;
    if (!scrollEl) return;
    const update = () => {
      setEditorBounds({
        top: scrollEl.scrollTop,
        left: 0,
        width: scrollEl.clientWidth,
        height: scrollEl.clientHeight,
      });
    };
    update();
    scrollEl.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(scrollEl);
    return () => { scrollEl.removeEventListener('scroll', update); ro.disconnect(); };
  }, []);

  // openingStyle === 'typing' 은 구버전 호환용 — 새 데이터는 openingContentStyle로 판단
  const isTyping = opening.openingContentStyle === 'typing'
    || (!opening.openingContentStyle && opening.openingStyle === 'typing');
  const effectiveStyle = (opening.openingStyle === 'typing' && !opening.openingContentStyle)
    ? 'curtain'
    : opening.openingStyle;
  const [typedCount, setTypedCount] = useState(0);
  const [typingPhase, setTypingPhase] = useState<'idle' | 'heart' | 'typing' | 'done'>('idle');

  // 전환 스타일이 바뀔 때만 phase와 CSS 애니메이션 재시작
  // 내용 연출(openingContentStyle) 변경 시에는 phase를 건드리지 않음
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (el) {
      const styleClass = `op-${effectiveStyle}`;
      el.classList.remove(styleClass);
      void el.offsetWidth;
      el.classList.add(styleClass);
    }
    setPhase('enter');
  }, [opening.openingStyle]);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('ready'), 3200);
    return () => clearTimeout(timer);
  }, [opening.openingStyle]);

  // 타이핑 모드 전환 시 리셋
  useLayoutEffect(() => {
    if (!isTyping) return;
    setTypedCount(0);
    setTypingPhase('idle');
  }, [isTyping, opening.openingStyle]);

  useEffect(() => {
    if (!isTyping) return;
    const t1 = setTimeout(() => setTypingPhase('heart'), 500);
    const t2 = setTimeout(() => setTypingPhase('typing'), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isTyping, opening.openingStyle]);

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

  if ((!opening.openingEnabled && !autoClose) || dismissed) return null;

  const mainText = opening.openingText || 'We\'re getting married';
  const subText = opening.openingSubText || date;
  const colorMode = opening.openingColorMode || 'theme';
  const gradientMode = opening.openingGradientMode || 'preset';
  const isThemeGradient = colorMode === 'gradient' && gradientMode === 'theme';
  const themeKey = theme || 'blush';
  const themeColor = THEME_COLORS[themeKey] || THEME_COLORS.blush;
  const bgColor = (colorMode === 'theme' || isThemeGradient) ? themeColor.bg : (opening.openingBgColor || '#1F2937');

  const textColorMode = (colorMode === 'theme' || isThemeGradient) ? 'white' : (opening.openingTextColor || 'white');
  const isDark = textColorMode === 'dark';
  const textColor = (colorMode === 'theme' || isThemeGradient) ? 'rgba(255, 255, 255, 0.95)' : (isDark ? 'rgba(28, 20, 20, 0.90)' : '#FFFFFF');
  const accentColor = (colorMode === 'theme' || isThemeGradient) ? themeColor.accent : (isDark ? 'rgba(28, 20, 20, 0.30)' : 'rgba(255, 228, 220, 0.50)');
  const heartColor = isDark ? 'rgba(40, 20, 20, 0.55)' : 'rgba(255, 255, 255, 0.88)';
  const opacity = opening.openingBgOpacity ?? 0.95;
  const groom = groomName || '신랑';
  const bride = brideName || '신부';

  // 동적 타이밍: 이름과 본문 마지막 글자 애니메이션 종료 시간 계산
  const namesLastDelay = 0.6 + (groom.length + bride.length) * 0.08;
  const mainWords = mainText.split(' ');
  const mainNonSpaceLen = mainText.replace(/ /g, '').length;
  const mainLastCharIdx = Math.max(0, mainNonSpaceLen + mainWords.length - 2);
  const mainLastDelay = 1.2 + mainLastCharIdx * 0.04;
  const contentEndTime = Math.max(namesLastDelay, mainLastDelay) + 0.5;
  const seqSubDelay = `${(contentEndTime + 0.15).toFixed(2)}s`;
  const seqLineBottomDelay = `${contentEndTime.toFixed(2)}s`;
  const seqEnterDelay = `${(contentEndTime + 0.5).toFixed(2)}s`;

  const isCurtain = effectiveStyle === 'curtain';
  const isInsta = effectiveStyle === 'insta';
  const isBlind = effectiveStyle === 'blind';
  const decoEffect = opening.openingDecoEffect || 'none';

  const gradientValue = colorMode === 'gradient'
    ? isThemeGradient
      ? `linear-gradient(180deg, ${themeColor.bg} 0%, ${themeColor.accent} 100%)`
      : `linear-gradient(180deg, ${opening.openingBgColor || '#6B7FE0'} 0%, ${opening.openingBgColor2 || '#E8907A'} 100%)`
    : null;

  const bgOverride: React.CSSProperties = gradientValue
    ? { background: gradientValue }
    : {};

  useEffect(() => {
    if (!autoClose) return;
    const ready = isTyping ? typingPhase === 'done' : phase === 'ready';
    if (!ready) return;
    const t = setTimeout(() => {
      setPhase('exit');
      const style = effectiveStyle;
      const exitDelay = style === 'curtain' ? 1300 : style === 'circle' ? 1500 : style === 'veil' ? 900 : style === 'blind' ? 1100 : style === 'insta' ? 1500 : style === 'frame' ? 900 : 900;
      setTimeout(() => { setDismissed(true); onDismissed?.(); }, exitDelay);
    }, 2500);
    return () => clearTimeout(t);
  }, [phase, typingPhase, autoClose, isTyping, opening.openingStyle, onDismissed]);

  const handleDismiss = () => {
    if (isTyping) {
      if (typingPhase !== 'done') return;
    } else {
      if (phase !== 'ready') return;
    }
    setPhase('exit');
    const style = effectiveStyle;
    const delay = style === 'curtain' ? 1300 : style === 'circle' ? 1500 : style === 'veil' ? 900 : style === 'blind' ? 1100 : style === 'insta' ? 1500 : style === 'frame' ? 900 : 900;
    setTimeout(() => { setDismissed(true); onDismissed?.(); }, delay);
  };

  return (
    <div
      ref={rootRef}
      className={`op-root op-${effectiveStyle} op-phase-${phase}`}
      style={{ '--op-bg': bgColor, '--op-opacity': opacity, '--op-text': textColor, '--op-accent': accentColor, '--op-heart': heartColor, '--op-font': fontConfig.family, '--op-weight': fontConfig.weights, '--op-hover-bg': isDark ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.10)', '--op-hover-bd': isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.65)', ...bgOverride, ...editorBounds, ...(topOffset != null && !Object.keys(editorBounds).length ? { top: topOffset, height: `calc(100% - ${topOffset}px)` } : {}) } as React.CSSProperties}
    >
      {isCurtain && <div className="op-curtain-deco op-deco-top" />}
      {isCurtain && <div className="op-curtain-deco op-deco-bottom" />}
      {isBlind && Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="op-blind-slice" style={{ '--slice-i': i } as React.CSSProperties} />
      ))}
      {isInsta && <div key={`insta-${opening.openingContentStyle || 'sequential'}`} className="op-insta-progress"><div className="op-insta-bar" /></div>}

      {decoEffect === 'dots' && (
        <div className="op-deco-dots" aria-hidden="true">
          {DECO_DOTS.map((d, i) => (
            <span key={i} className="op-dot" style={{ left: d.left, top: d.top, width: d.s, height: d.s, animationDelay: `${(i * 0.28).toFixed(2)}s` } as React.CSSProperties} />
          ))}
        </div>
      )}
      {decoEffect === 'ripple' && (
        <div className="op-deco-ripple" aria-hidden="true">
          {[0, 2, 4].map((delay, i) => (
            <span key={i} className="op-ripple-ring" style={{ animationDelay: `${delay}s` }} />
          ))}
        </div>
      )}
      {decoEffect === 'sparkle' && (
        <div className="op-deco-sparkle" aria-hidden="true">
          {DECO_SPARKS.map((d, i) => (
            <span key={i} className="op-spark" style={{ left: d.left, top: d.top, animationDelay: `${(i * 0.38).toFixed(2)}s` }} >✦</span>
          ))}
        </div>
      )}

      {isTyping ? (
        <div
          key={`typing-${opening.openingStyle}-${opening.openingContentStyle || 'sequential'}`}
          className={`op-typing-body${typingPhase === 'done' ? ' op-typing-done' : ''}`}
        >
          <div className="op-typing-inner">
            {decoEffect === 'trace' && (
              <div className="op-deco-trace" aria-hidden="true">
                <span className="op-trace-top" />
                <span className="op-trace-right" />
                <span className="op-trace-bottom" />
                <span className="op-trace-left" />
              </div>
            )}
            <div className={`op-typing-heart${typingPhase !== 'idle' ? ' visible' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 34, height: 34, display: 'block' }}>
                <path d="M12 20.5C12 20.5 3 13.5 3 8.5C3 6.02 5.02 4 7.5 4C9.06 4 10.47 4.77 11.32 6.04L12 7L12.68 6.04C13.53 4.77 14.94 4 16.5 4C18.98 4 21 6.02 21 8.5C21 13.5 12 20.5 12 20.5Z" fill="currentColor"/>
              </svg>
            </div>
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
        </div>
      ) : (
        <div
          className="op-body"
          key={`${opening.openingStyle}-${opening.openingContentStyle || 'sequential'}`}
        >
          {decoEffect === 'trace' && (
            <div className="op-deco-trace" aria-hidden="true">
              <span className="op-trace-top" />
              <span className="op-trace-right" />
              <span className="op-trace-bottom" />
              <span className="op-trace-left" />
            </div>
          )}
          <div className="op-heart-deco">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28, display: 'block' }}>
              <path d="M12 20.5C12 20.5 3 13.5 3 8.5C3 6.02 5.02 4 7.5 4C9.06 4 10.47 4.77 11.32 6.04L12 7L12.68 6.04C13.53 4.77 14.94 4 16.5 4C18.98 4 21 6.02 21 8.5C21 13.5 12 20.5 12 20.5Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="op-line op-line-top" />

          <p className="op-names">
            {groom.split('').map((ch, i) => <span key={`g${i}`} className="op-char" style={{ animationDelay: `${0.6 + i * 0.08}s` }}>{ch}</span>)}
            <span className="op-char op-amp" style={{ animationDelay: `${0.6 + groom.length * 0.08}s` }}>&nbsp;&&nbsp;</span>
            {bride.split('').map((ch, i) => <span key={`b${i}`} className="op-char" style={{ animationDelay: `${0.6 + (groom.length + 1 + i) * 0.08}s` }}>{ch}</span>)}
          </p>

          <h2 className="op-main">
            {mainText.split(' ').map((word, wIdx, arr) => {
              const prevLen = arr.slice(0, wIdx).reduce((s, w) => s + w.length + 1, 0);
              return (
                <React.Fragment key={wIdx}>
                  {wIdx > 0 && ' '}
                  <span className="op-word">
                    {word.split('').map((ch, cIdx) => (
                      <span key={cIdx} className="op-char" style={{ animationDelay: `${1.2 + (prevLen + cIdx) * 0.04}s` }}>{ch}</span>
                    ))}
                  </span>
                </React.Fragment>
              );
            })}
          </h2>

          <p className="op-sub" style={{ animation: `op-fade-up 0.6s ease ${seqSubDelay} both` }}>{subText}</p>

          <div className="op-line op-line-bottom" style={{ animation: `op-line-grow 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${seqLineBottomDelay} both` }} />

          <button className="op-enter" style={{ animation: `op-fade-up 0.6s ease ${seqEnterDelay} both` }} onClick={handleDismiss}>초대장 열기</button>
        </div>
      )}

    </div>
  );
};

export default Opening;
