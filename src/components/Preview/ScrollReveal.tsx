import React, { useRef, useLayoutEffect, useEffect, useState, createContext, useContext } from 'react';

export const ScrollRootContext = createContext<React.RefObject<HTMLDivElement | null> | null>(null);

interface ScrollRevealProps {
  effect: string;
  children: React.ReactNode;
  delay?: number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ effect, children, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const scrollRoot = useContext(ScrollRootContext);

  const isEnabled = !!effect && effect !== 'none';

  // 페이지가 뜨자마자(스크롤 없이) 이미 화면에 보이는 섹션은 등장 애니메이션을 건너뛰고
  // 바로 최종 위치로 그린다 — 안 그러면 오프닝이 닫히자마자 화면에 이미 떠 있는 섹션(주로
  // 메인화면 바로 다음 섹션)이 스크롤도 안 했는데 슬라이드/페이드 되며 "밀리는" 것처럼
  // 보인다. 첫 페인트 전에(useLayoutEffect) 동기적으로 판정해 깜빡임 없이 처리한다.
  useLayoutEffect(() => {
    if (!isEnabled) { setVisible(true); return; }
    const el = ref.current;
    if (!el) { setVisible(false); return; }
    const root = scrollRoot?.current;
    const rootRect = root ? root.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
    const elRect = el.getBoundingClientRect();
    setVisible(elRect.top < rootRect.bottom && elRect.bottom > rootRect.top);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 실제 스크롤로 화면 밖에서 들어오는 섹션만 여기서 관찰해 애니메이션한다.
  // (이미 보여서 위 useLayoutEffect가 visible을 true로 정했다면 관찰할 필요가 없다.)
  useEffect(() => {
    if (!isEnabled || visible) return;

    const el = ref.current;
    if (!el) return;

    const root = scrollRoot?.current ?? null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), delay);
            observer.disconnect();
          }
        }
      },
      { root, threshold: 0.05, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isEnabled, scrollRoot, delay, visible]);

  if (!isEnabled) return <>{children}</>;

  return (
    <div ref={ref} className={`scroll-reveal sr-${effect} ${visible ? 'sr-visible' : ''}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;
