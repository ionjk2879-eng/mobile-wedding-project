import React, { useRef, useLayoutEffect, useEffect, useState, useMemo, createContext, useContext } from 'react';

export const ScrollRootContext = createContext<React.RefObject<HTMLDivElement | null> | null>(null);

// 마운트 시 "이미 화면에 보이는가" 판정을 섹션마다 따로 하지 않고 한 프레임에 모아서
// 처리하기 위한 코디네이터. 개별 ScrollReveal이 각자 useLayoutEffect에서 바로
// getBoundingClientRect()를 부르면(=read) 섹션 수만큼 읽기/쓰기가 번갈아 일어나며
// 강제 리플로우(레이아웃 스래싱)가 반복될 수 있다. 대신 "등록"만 해두고, 다음
// requestAnimationFrame 한 번에 등록된 모든 섹션의 rect를 한꺼번에 읽은 뒤(read phase),
// 그다음에 한꺼번에 visible 상태를 반영한다(write phase).
interface ScrollRevealCoordinator {
  register: (key: object, el: HTMLElement, setVisible: (v: boolean) => void) => void;
  unregister: (key: object) => void;
}
const ScrollRevealCoordinatorContext = createContext<ScrollRevealCoordinator | null>(null);

export const ScrollRevealProvider: React.FC<{ rootRef: React.RefObject<HTMLDivElement | null> | null; children: React.ReactNode }> = ({ rootRef, children }) => {
  const coordinator = useMemo<ScrollRevealCoordinator>(() => {
    const registry = new Map<object, { el: HTMLElement; setVisible: (v: boolean) => void }>();
    let scheduled = false;

    const flush = () => {
      scheduled = false;
      const rootEl = rootRef?.current ?? null;
      const rootRect = rootEl ? rootEl.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
      const entries = Array.from(registry.entries());
      registry.clear();
      // read phase — 전부 모아서 한 번에 읽는다
      const measured = entries.map(([, { el, setVisible }]) => {
        const r = el.getBoundingClientRect();
        return { setVisible, visible: r.top < rootRect.bottom && r.bottom > rootRect.top };
      });
      // write phase — 다 읽고 나서 한 번에 반영한다
      measured.forEach(({ setVisible, visible }) => setVisible(visible));
    };

    return {
      register(key, el, setVisible) {
        registry.set(key, { el, setVisible });
        if (!scheduled) {
          scheduled = true;
          requestAnimationFrame(flush);
        }
      },
      unregister(key) {
        registry.delete(key);
      },
    };
  }, [rootRef]);

  return (
    <ScrollRevealCoordinatorContext.Provider value={coordinator}>
      {children}
    </ScrollRevealCoordinatorContext.Provider>
  );
};

interface ScrollRevealProps {
  effect: string;
  children: React.ReactNode;
  delay?: number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ effect, children, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const scrollRoot = useContext(ScrollRootContext);
  const coordinator = useContext(ScrollRevealCoordinatorContext);
  const keyRef = useRef({});

  const isEnabled = !!effect && effect !== 'none';

  // 페이지가 뜨자마자(스크롤 없이) 이미 화면에 보이는 섹션은 등장 애니메이션을 건너뛰고
  // 바로 최종 위치로 그린다 — 안 그러면 오프닝이 닫히자마자 화면에 이미 떠 있는 섹션(주로
  // 메인화면 바로 다음 섹션)이 스크롤도 안 했는데 슬라이드/페이드 되며 "밀리는" 것처럼
  // 보인다. 코디네이터가 있으면 그쪽에 위임(배치 처리), 없으면(예외적 사용) 예전처럼
  // 즉시 개별 판정한다.
  useLayoutEffect(() => {
    if (!isEnabled) { setVisible(true); return; }
    const el = ref.current;
    if (!el) { setVisible(false); return; }

    if (coordinator) {
      const key = keyRef.current;
      coordinator.register(key, el, setVisible);
      return () => coordinator.unregister(key);
    }

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
