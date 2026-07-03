import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { OpeningConfig, GuestRelation } from '../../types';
import { formatGuestOpeningText } from '../../utils/guestOpeningTemplates';

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

const RIPPLE_SOURCES = [
  { cx: '50%', cy: '50%', delays: [0,   4.5, 9  ] },
  { cx: '22%', cy: '26%', delays: [1.8, 6.8      ] },
  { cx: '78%', cy: '72%', delays: [3.2, 8.2      ] },
  { cx: '80%', cy: '20%', delays: [5.5, 10.5     ] },
  { cx: '20%', cy: '74%', delays: [2.6, 7.6      ] },
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

const BOKEH_ITEMS = [
  { left: '12%', top: '22%', s: 90,  o: 0.32, dur: 7.0,  d: 0.0 },
  { left: '76%', top: '35%', s: 65,  o: 0.26, dur: 8.5,  d: 1.2 },
  { left: '34%', top: '68%', s: 110, o: 0.22, dur: 9.2,  d: 2.5 },
  { left: '58%', top: '14%', s: 55,  o: 0.36, dur: 6.5,  d: 3.8 },
  { left: '88%', top: '72%', s: 80,  o: 0.28, dur: 7.8,  d: 0.8 },
  { left: '22%', top: '82%', s: 100, o: 0.20, dur: 10.0, d: 4.2 },
  { left: '50%', top: '48%', s: 50,  o: 0.38, dur: 6.0,  d: 1.8 },
  { left: '8%',  top: '56%', s: 75,  o: 0.26, dur: 8.2,  d: 5.0 },
  { left: '92%', top: '24%', s: 85,  o: 0.22, dur: 9.5,  d: 2.0 },
  { left: '66%', top: '86%', s: 60,  o: 0.32, dur: 7.2,  d: 3.3 },
  { left: '42%', top: '10%', s: 95,  o: 0.20, dur: 11.0, d: 6.0 },
  { left: '18%', top: '42%', s: 45,  o: 0.42, dur: 5.8,  d: 4.5 },
  { left: '80%', top: '58%', s: 105, o: 0.18, dur: 12.0, d: 1.5 },
  { left: '30%', top: '28%', s: 70,  o: 0.30, dur: 7.5,  d: 7.0 },
];

const AURORA_BLOBS = [
  { left: '5%',  top: '10%', s: 280, tx: 30,  ty: -20, o: 0.38, dur: 9.0,  d: 0.0 },
  { left: '60%', top: '50%', s: 320, tx: -25, ty: 20,  o: 0.30, dur: 11.0, d: 2.5 },
  { left: '35%', top: '65%', s: 240, tx: 15,  ty: -30, o: 0.34, dur: 8.5,  d: 5.0 },
  { left: '75%', top: '5%',  s: 260, tx: -20, ty: 25,  o: 0.26, dur: 10.0, d: 3.5 },
];

const FIREFLY_ITEMS = [
  { left: '15%', top: '75%', tx: 22,  ty: -30, tx2: -12, ty2: -55, dur: 5.5, d: 0.0 },
  { left: '70%', top: '60%', tx: -18, ty: -25, tx2:  8,  ty2: -48, dur: 6.8, d: 1.5 },
  { left: '35%', top: '85%', tx: 30,  ty: -20, tx2:  15, ty2: -60, dur: 5.0, d: 3.0 },
  { left: '55%', top: '70%', tx: -22, ty: -35, tx2: -8,  ty2: -52, dur: 7.2, d: 0.8 },
  { left: '85%', top: '80%', tx: 16,  ty: -28, tx2: -18, ty2: -45, dur: 6.0, d: 4.5 },
  { left: '25%', top: '65%', tx: -28, ty: -22, tx2:  20, ty2: -58, dur: 5.8, d: 2.2 },
  { left: '45%', top: '88%', tx: 24,  ty: -32, tx2: -14, ty2: -62, dur: 7.5, d: 1.0 },
  { left: '8%',  top: '72%', tx: 18,  ty: -26, tx2:  10, ty2: -50, dur: 6.3, d: 5.5 },
  { left: '90%', top: '65%', tx: -20, ty: -30, tx2:  6,  ty2: -55, dur: 5.2, d: 2.8 },
  { left: '62%', top: '82%', tx: 26,  ty: -18, tx2: -16, ty2: -44, dur: 8.0, d: 3.8 },
  { left: '32%', top: '55%', tx: -14, ty: -35, tx2:  22, ty2: -60, dur: 6.5, d: 0.5 },
  { left: '78%', top: '75%', tx: 12,  ty: -24, tx2: -20, ty2: -48, dur: 5.5, d: 6.0 },
];

const PETAL_ITEMS = [
  { left: '8%',  w: 7,  h: 11, r0: -15, r1:  200, dx:  25, dur: 8.0,  d: 0.0 },
  { left: '22%', w: 9,  h: 14, r0:  20, r1: -180, dx: -30, dur: 9.5,  d: 1.8 },
  { left: '38%', w: 6,  h: 10, r0: -30, r1:  220, dx:  18, dur: 7.5,  d: 3.5 },
  { left: '52%', w: 10, h: 15, r0:  10, r1: -200, dx: -22, dur: 10.0, d: 0.8 },
  { left: '67%', w: 7,  h: 11, r0: -20, r1:  180, dx:  28, dur: 8.5,  d: 5.0 },
  { left: '80%', w: 8,  h: 13, r0:  25, r1: -160, dx: -18, dur: 9.0,  d: 2.5 },
  { left: '92%', w: 6,  h: 10, r0: -10, r1:  240, dx:  15, dur: 7.0,  d: 4.2 },
  { left: '15%', w: 9,  h: 14, r0:  30, r1: -190, dx: -26, dur: 11.0, d: 6.5 },
  { left: '44%', w: 7,  h: 12, r0: -25, r1:  210, dx:  20, dur: 8.8,  d: 1.2 },
  { left: '70%', w: 8,  h: 13, r0:  15, r1: -170, dx: -24, dur: 9.2,  d: 3.8 },
  { left: '30%', w: 6,  h: 10, r0: -35, r1:  195, dx:  22, dur: 7.8,  d: 7.0 },
  { left: '85%', w: 10, h: 15, r0:  20, r1: -215, dx: -16, dur: 10.5, d: 5.5 },
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
  anniversaryMode?: boolean;
  language?: 'ko' | 'en' | 'ja';
  guestName?: string;
  guestRelation?: GuestRelation;
  weddingDateISO?: string;
}

function hexLuminance(hex: string): number {
  try {
    const h = (hex || '').replace('#', '');
    if (h.length !== 6) return 0;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  } catch { return 0; }
}

const Opening: React.FC<OpeningProps> = ({ opening, groomName, brideName, date, theme, autoClose, onDismissed, topOffset, anniversaryMode, language = 'ko', guestName, guestRelation, weddingDateISO }) => {
  const [dismissed, setDismissed] = useState(false);
  const [phase, setPhase] = useState<'enter' | 'ready' | 'exit'>('enter');

  const rootRef = useRef<HTMLDivElement>(null);
  const [editorBounds, setEditorBounds] = useState<React.CSSProperties>({});
  // exit 중에는 editorBounds 갱신을 차단해 레이아웃 재계산으로 인한 순간 이동 방지
  const phaseRef = useRef<'enter' | 'ready' | 'exit'>('enter');

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // 에디터 라이브 프리뷰 패널
    const scrollEl = el.closest('.preview-content-scroll') as HTMLElement | null;
    if (scrollEl) {
      const update = () => {
        if (phaseRef.current === 'exit') return;
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
    }

    // 전체화면 프리뷰 — invitation-page 너비에만 맞게 제한
    const fullEl = el.closest('.full-preview-container') as HTMLElement | null;
    if (fullEl) {
      const pageEl = fullEl.querySelector('.invitation-page') as HTMLElement | null;
      const update = () => {
        if (phaseRef.current === 'exit') return;
        const rect = pageEl ? pageEl.getBoundingClientRect() : null;
        setEditorBounds({
          top: fullEl.scrollTop,
          left: rect ? rect.left : 0,
          width: rect ? rect.width : fullEl.clientWidth,
          height: fullEl.clientHeight,
        });
      };
      update();
      fullEl.addEventListener('scroll', update, { passive: true });
      const ro = new ResizeObserver(update);
      ro.observe(fullEl);
      if (pageEl) ro.observe(pageEl);
      return () => { fullEl.removeEventListener('scroll', update); ro.disconnect(); };
    }

    // 템플릿 미리보기 — transform: translateZ(0)으로 고정 포함 블록이 되므로 컨테이너 상대 좌표 사용
    const tmplEl = el.closest('.tmpl-preview-scroll') as HTMLElement | null;
    if (tmplEl) {
      const pageEl = tmplEl.querySelector('.invitation-page') as HTMLElement | null;
      const update = () => {
        if (phaseRef.current === 'exit') return;
        const containerRect = tmplEl.getBoundingClientRect();
        const rect = pageEl ? pageEl.getBoundingClientRect() : null;
        setEditorBounds({
          top: tmplEl.scrollTop,
          left: rect ? rect.left - containerRect.left : 0,
          width: rect ? rect.width : tmplEl.clientWidth,
          height: tmplEl.clientHeight,
        });
      };
      update();
      tmplEl.addEventListener('scroll', update, { passive: true });
      const ro = new ResizeObserver(update);
      ro.observe(tmplEl);
      if (pageEl) ro.observe(pageEl);
      return () => { tmplEl.removeEventListener('scroll', update); ro.disconnect(); };
    }

    // 공개 청첩장 보기 페이지 — invitation-page 너비에만 맞게 제한
    const viewEl = el.closest('.view-container') as HTMLElement | null;
    if (viewEl) {
      const pageEl = viewEl.querySelector('.invitation-page') as HTMLElement | null;
      const update = () => {
        if (phaseRef.current === 'exit') return;
        const rect = pageEl ? pageEl.getBoundingClientRect() : null;
        setEditorBounds({
          top: window.scrollY,
          left: rect ? rect.left : 0,
          width: rect ? rect.width : window.innerWidth,
          height: window.innerHeight,
        });
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update, { passive: true });
      const ro = new ResizeObserver(update);
      if (pageEl) ro.observe(pageEl);
      return () => {
        window.removeEventListener('scroll', update);
        window.removeEventListener('resize', update);
        ro.disconnect();
      };
    }
  }, []);

  // openingStyle === 'typing' 은 구버전 호환용 — 새 데이터는 openingContentStyle로 판단
  const isTyping = opening.openingContentStyle === 'typing'
    || (!opening.openingContentStyle && opening.openingStyle === 'typing');
  const effectiveStyle = (opening.openingStyle === 'typing' && !opening.openingContentStyle)
    ? 'curtain'
    : opening.openingStyle;
  const [typedCount, setTypedCount] = useState(0);
  const [typingPhase, setTypingPhase] = useState<'idle' | 'heart' | 'typing' | 'done'>('idle');

  // 내용 연출 부드러운 전환용 상태 (순차↔타이핑 전환 시 250ms 페이드아웃 후 교체)
  const [displayedIsTyping, setDisplayedIsTyping] = useState(isTyping);
  const [isSwitchingContent, setIsSwitchingContent] = useState(false);
  const [seqBodyKey, setSeqBodyKey] = useState(0);
  const [typingBodyKey, setTypingBodyKey] = useState(0);
  const [seqBtnActive, setSeqBtnActive] = useState(false);
  const contentSwitchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // 개인화 링크(guestName)로 들어온 경우 관계별 톤 템플릿을 우선 사용, 없으면 기존 문구로 폴백
  const guestOpeningText = guestName ? formatGuestOpeningText(guestRelation || 'other', guestName, language) : null;
  const effectiveOpeningText = guestOpeningText || opening.openingText || 'We\'re getting married';

  const mainTextRef = useRef(effectiveOpeningText);
  mainTextRef.current = effectiveOpeningText;

  // 전환 스타일이 바뀔 때: 루트 클래스 토글 + phase 재시작 + 내용 연출 상태 즉시 동기화
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (el) {
      const styleClass = `op-${effectiveStyle}`;
      el.classList.remove(styleClass);
      void el.offsetWidth;
      el.classList.add(styleClass);
    }
    setPhase('enter');
    setSeqBtnActive(false);
    clearTimeout(contentSwitchTimerRef.current);
    setDisplayedIsTyping(isTyping);
    setIsSwitchingContent(false);
  }, [effectiveStyle]);

  // 내용 연출만 바뀔 때: phase 재시작
  // 원형 확산·베일 드롭은 루트 클래스 자체에 애니메이션이 묶여 있어 클래스 토글도 필요
  useLayoutEffect(() => {
    setPhase('enter');
    setSeqBtnActive(false);
    if (effectiveStyle === 'circle' || effectiveStyle === 'veil') {
      const el = rootRef.current;
      if (el) {
        const styleClass = `op-${effectiveStyle}`;
        el.classList.remove(styleClass);
        void el.offsetWidth;
        el.classList.add(styleClass);
      }
    }
  }, [opening.openingContentStyle]);

  useEffect(() => {
    phaseTimerRef.current = setTimeout(() => setPhase('ready'), 3200);
    return () => clearTimeout(phaseTimerRef.current);
  }, [opening.openingStyle, opening.openingContentStyle]);

  // 순차↔타이핑 전환: 250ms 페이드아웃 후 새 body 마운트
  useEffect(() => {
    if (isTyping === displayedIsTyping) return;
    clearTimeout(contentSwitchTimerRef.current);
    setIsSwitchingContent(true);
    const target = isTyping;
    contentSwitchTimerRef.current = setTimeout(() => {
      setDisplayedIsTyping(target);
      setIsSwitchingContent(false);
      if (target) setTypingBodyKey(k => k + 1);
      else setSeqBodyKey(k => k + 1);
    }, 250);
    return () => clearTimeout(contentSwitchTimerRef.current!);
  }, [isTyping, displayedIsTyping]);

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
    const tmplScrollEl = document.querySelector('.tmpl-preview-scroll') as HTMLElement | null;
    if (tmplScrollEl) {
      const scrollbarW = tmplScrollEl.offsetWidth - tmplScrollEl.clientWidth;
      const prevOY = tmplScrollEl.style.overflowY;
      const prevPad = tmplScrollEl.style.paddingRight;
      tmplScrollEl.style.overflowY = 'hidden';
      if (scrollbarW > 0) tmplScrollEl.style.paddingRight = `${scrollbarW}px`;
      return () => {
        tmplScrollEl.style.overflowY = prevOY;
        tmplScrollEl.style.paddingRight = prevPad;
      };
    }
    const fullEl = document.querySelector('.full-preview-container') as HTMLElement | null;
    if (fullEl) {
      // 스크롤바 폭만큼 padding-right 보상: 해제 시 스크롤바 재등장으로 인한 좌측 이동 방지
      const scrollbarW = fullEl.offsetWidth - fullEl.clientWidth;
      const prevOverflow = fullEl.style.overflow;
      const prevPad = fullEl.style.paddingRight;
      fullEl.style.overflow = 'hidden';
      if (scrollbarW > 0) fullEl.style.paddingRight = `${scrollbarW}px`;
      return () => {
        fullEl.style.overflow = prevOverflow;
        fullEl.style.paddingRight = prevPad;
      };
    }
    const scrollRoot = document.querySelector('.view-container') || document.body;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    const prevRootOverflow = (scrollRoot as HTMLElement).style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPad = document.body.style.paddingRight;
    (scrollRoot as HTMLElement).style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    return () => {
      (scrollRoot as HTMLElement).style.overflow = prevRootOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.paddingRight = prevBodyPad;
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

  const mainText = effectiveOpeningText;
  const subText = opening.openingSubText || date;
  const todayDateStr = (() => {
    if (!anniversaryMode) return '';
    const t = new Date();
    const y = t.getFullYear(), m = t.getMonth(), d = t.getDate();
    if (language === 'en') {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${months[m]} ${d}, ${y}`;
    }
    if (language === 'ja') return `${y}年${m + 1}月${d}日`;
    return `${y}년 ${m + 1}월 ${d}일`;
  })();
  // 기념일 모드는 openingText 자체가 D+n으로 대체되므로 여기선 일반 모드에서만 D-day를 서브 멘트 아래 표시
  const dDayStr = (() => {
    if (anniversaryMode || !weddingDateISO) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weddingDate = new Date(weddingDateISO);
    weddingDate.setHours(0, 0, 0, 0);
    if (isNaN(weddingDate.getTime())) return '';
    const diffDays = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'D-Day';
    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    return `D-${diffDays}`;
  })();
  const colorMode = opening.openingColorMode || 'theme';
  const gradientMode = opening.openingGradientMode || 'theme';
  const isThemeGradient = colorMode === 'gradient' && gradientMode === 'theme';
  const themeKey = theme || 'blush';
  const themeColor = THEME_COLORS[themeKey] || THEME_COLORS.blush;
  const bgColor = (colorMode === 'theme' || isThemeGradient) ? themeColor.bg : (opening.openingBgColor || '#1F2937');

  // 단색·그라데이션 모두 배경색 밝기로 자동 감지
  const bgIsLight = (() => {
    if (colorMode === 'custom') return hexLuminance(opening.openingBgColor || '#111111') > 0.55;
    if (colorMode === 'gradient' && !isThemeGradient) {
      const avg = (hexLuminance(opening.openingBgColor || '#111111') + hexLuminance(opening.openingBgColor2 || '#111111')) / 2;
      return avg > 0.55;
    }
    return false;
  })();
  const textColorMode = (colorMode === 'theme' || isThemeGradient)
    ? 'white'
    : (bgIsLight || opening.openingTextColor === 'dark') ? 'dark' : 'white';
  const isDark = textColorMode === 'dark';
  const textColor = (colorMode === 'theme' || isThemeGradient) ? 'rgba(255, 255, 255, 0.95)' : (isDark ? 'rgba(28, 20, 20, 0.90)' : '#FFFFFF');
  const accentColor = (colorMode === 'theme' || isThemeGradient) ? themeColor.accent : (isDark ? 'rgba(175, 120, 95, 0.65)' : 'rgba(255, 228, 220, 0.50)');
  const heartColor = isDark ? 'rgba(175, 120, 95, 0.80)' : 'rgba(255, 255, 255, 0.88)';
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
  const rawPattern = opening.openingBgPattern;
  const bgPatterns: string[] = Array.isArray(rawPattern)
    ? rawPattern.filter(p => p !== 'none')
    : (rawPattern && rawPattern !== 'none') ? [rawPattern] : [];

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
      const exitDelay = style === 'curtain' ? 400 : style === 'circle' ? 480 : style === 'veil' ? 460 : style === 'blind' ? 520 : style === 'insta' ? 450 : style === 'frame' ? 430 : 380;
      setTimeout(() => { setDismissed(true); onDismissed?.(); }, exitDelay);
    }, 2500);
    return () => clearTimeout(t);
  }, [phase, typingPhase, autoClose, isTyping, opening.openingStyle, onDismissed]);

  const handleDismiss = () => {
    if (isTyping && typingPhase !== 'done') return;
    if (!isTyping && !seqBtnActive) return;
    clearTimeout(phaseTimerRef.current); // 지연된 'ready' 전환이 exit 이후에 발화하지 않도록
    phaseRef.current = 'exit'; // editorBounds 갱신 즉시 차단
    setPhase('exit');
    // 모든 exit 애니메이션을 ~400ms로 단축 (CSS와 맞춤)
    const style = effectiveStyle;
    const delay = style === 'curtain' ? 400 : style === 'circle' ? 480 : style === 'veil' ? 460 : style === 'blind' ? 520 : style === 'insta' ? 450 : style === 'frame' ? 430 : 380;
    setTimeout(() => { setDismissed(true); onDismissed?.(); }, delay);
  };

  return (
    <div
      ref={rootRef}
      className={`op-root op-${effectiveStyle} op-phase-${phase}`}
      style={{ '--op-bg': bgColor, '--op-opacity': opacity, '--op-text': textColor, '--op-accent': accentColor, '--op-heart': heartColor, '--op-font': fontConfig.family, '--op-weight': fontConfig.weights, '--op-hover-bg': isDark ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.10)', '--op-hover-bd': isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.65)', '--op-pattern-color': isDark ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', '--op-frame-color': isDark ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.30)', '--op-frame-color2': isDark ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)', ...bgOverride, ...editorBounds, ...(topOffset != null && !Object.keys(editorBounds).length ? { top: topOffset, height: `calc(100% - ${topOffset}px)` } : {}) } as React.CSSProperties}
    >
      {bgPatterns.map(pat => <div key={pat} className={`op-pattern op-pattern-${pat}`} aria-hidden="true" />)}
      {isCurtain && <div className="op-curtain-deco op-deco-top" />}
      {isCurtain && <div className="op-curtain-deco op-deco-bottom" />}
      {isBlind && (
        <React.Fragment key={`blind-${effectiveStyle}-${opening.openingContentStyle}`}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="op-blind-slice" style={{ '--slice-i': i } as React.CSSProperties} />
          ))}
        </React.Fragment>
      )}
      {isInsta && <div key={`insta-${opening.openingStyle}-${opening.openingContentStyle}`} className="op-insta-progress"><div className="op-insta-bar" /></div>}

      {decoEffect === 'dots' && (
        <div className="op-deco-dots" aria-hidden="true">
          {DECO_DOTS.map((d, i) => (
            <span key={i} className="op-dot" style={{ left: d.left, top: d.top, width: d.s, height: d.s, animationDelay: `${(i * 0.28).toFixed(2)}s` } as React.CSSProperties} />
          ))}
        </div>
      )}
      {decoEffect === 'ripple' && (
        <div className="op-deco-ripple" aria-hidden="true">
          {RIPPLE_SOURCES.map((src, si) =>
            src.delays.map((delay, ri) => (
              <span key={`${si}-${ri}`} className="op-ripple-ring" style={{ left: src.cx, top: src.cy, animationDelay: `${delay}s` } as React.CSSProperties} />
            ))
          )}
        </div>
      )}
      {decoEffect === 'sparkle' && (
        <div className="op-deco-sparkle" aria-hidden="true">
          {DECO_SPARKS.map((d, i) => (
            <span key={i} className="op-spark" style={{ left: d.left, top: d.top, animationDelay: `${(i * 0.38).toFixed(2)}s` }} >✦</span>
          ))}
        </div>
      )}
      {(decoEffect === 'bokeh' || decoEffect === 'aurora-bokeh') && (
        <div className="op-deco-bokeh" aria-hidden="true">
          {BOKEH_ITEMS.map((b, i) => (
            <span key={i} className="op-bokeh" style={{ left: b.left, top: b.top, width: b.s, height: b.s, marginLeft: -b.s / 2, marginTop: -b.s / 2, '--bk-o': b.o, '--bk-dur': `${b.dur}s`, animationDelay: `${b.d}s` } as React.CSSProperties} />
          ))}
        </div>
      )}
      {(decoEffect === 'aurora' || decoEffect === 'aurora-bokeh') && (
        <div className="op-deco-aurora" aria-hidden="true">
          {AURORA_BLOBS.map((a, i) => (
            <span key={i} className="op-aurora-blob" style={{ left: a.left, top: a.top, width: a.s, height: a.s, marginLeft: -a.s / 2, marginTop: -a.s / 2, '--au-o': a.o, '--au-dur': `${a.dur}s`, animationDelay: `${a.d}s`, '--au-tx': `${a.tx}px`, '--au-ty': `${a.ty}px` } as React.CSSProperties} />
          ))}
        </div>
      )}
      {(decoEffect === 'firefly' || decoEffect === 'firefly-petal') && (
        <div className="op-deco-firefly" aria-hidden="true">
          {FIREFLY_ITEMS.map((f, i) => (
            <span key={i} className="op-firefly" style={{ left: f.left, top: f.top, '--ff-dur': `${f.dur}s`, animationDelay: `${f.d}s`, '--ff-tx': `${f.tx}px`, '--ff-ty': `${f.ty}px`, '--ff-tx2': `${f.tx2}px`, '--ff-ty2': `${f.ty2}px` } as React.CSSProperties} />
          ))}
        </div>
      )}
      {(decoEffect === 'petal' || decoEffect === 'firefly-petal') && (
        <div className="op-deco-petal" aria-hidden="true">
          {PETAL_ITEMS.map((p, i) => (
            <span key={i} className="op-petal" style={{ left: p.left, width: p.w, height: p.h, '--pt-dur': `${p.dur}s`, animationDelay: `${p.d}s`, '--pt-r0': `${p.r0}deg`, '--pt-r1': `${p.r1}deg`, '--pt-dx': `${p.dx}px` } as React.CSSProperties} />
          ))}
        </div>
      )}

      {displayedIsTyping ? (
        <div
          key={`typing-${effectiveStyle}-${typingBodyKey}`}
          className={`op-typing-body${typingPhase === 'done' ? ' op-typing-done' : ''}${isSwitchingContent ? ' op-body-out' : ''}`}
        >
          <div className="op-typing-inner">
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
            <p className={`op-typing-sub${typingPhase === 'done' ? ' visible' : ''}`}>
              {subText}
              {anniversaryMode && todayDateStr && <span style={{ display: 'block', marginTop: '0.3em', opacity: 0.75, fontSize: '0.88em' }}>{todayDateStr}</span>}
              {dDayStr && <span style={{ display: 'block', marginTop: '0.45em', opacity: 0.95, fontSize: '1.6em', fontWeight: 600, letterSpacing: '1px' }}>{dDayStr}</span>}
            </p>
            <button className={`op-enter op-typing-btn${typingPhase === 'done' ? ' visible' : ''}`} onClick={handleDismiss}>{anniversaryMode ? (language === 'en' ? 'View Memories' : language === 'ja' ? '思い出を見る' : '추억 보기') : (language === 'en' ? 'Open Invitation' : language === 'ja' ? '招待状を開く' : '초대장 열기')}</button>
          </div>
        </div>
      ) : (
        <div
          className={`op-body${isSwitchingContent ? ' op-body-out' : ''}`}
          key={`seq-${effectiveStyle}-${seqBodyKey}`}
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

          <p className="op-sub" style={{ animation: `op-fade-up 0.6s ease ${seqSubDelay} both` }}>
            {subText}
            {anniversaryMode && todayDateStr && <span style={{ display: 'block', marginTop: '0.3em', opacity: 0.75, fontSize: '0.88em' }}>{todayDateStr}</span>}
            {dDayStr && <span style={{ display: 'block', marginTop: '0.45em', opacity: 0.95, fontSize: '1.6em', fontWeight: 600, letterSpacing: '1px' }}>{dDayStr}</span>}
          </p>

          <div className="op-line op-line-bottom" style={{ animation: `op-line-grow 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${seqLineBottomDelay} both` }} />

          <button className="op-enter" style={{ animation: `op-fade-up 0.6s ease ${seqEnterDelay} both`, pointerEvents: seqBtnActive ? 'auto' : 'none', cursor: seqBtnActive ? undefined : 'default' }} onAnimationStart={() => setSeqBtnActive(true)} onClick={handleDismiss}>{anniversaryMode ? (language === 'en' ? 'View Memories' : language === 'ja' ? '思い出を見る' : '추억 보기') : (language === 'en' ? 'Open Invitation' : language === 'ja' ? '招待状を開く' : '초대장 열기')}</button>
        </div>
      )}

    </div>
  );
};

export default Opening;
