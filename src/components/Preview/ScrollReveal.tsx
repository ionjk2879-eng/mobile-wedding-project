import React, { useRef, useEffect, useState, createContext, useContext } from 'react';

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

  useEffect(() => {
    if (!isEnabled) { setVisible(true); return; }
    setVisible(false);

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
  }, [isEnabled, scrollRoot, delay]);

  if (!isEnabled) return <>{children}</>;

  return (
    <div ref={ref} className={`scroll-reveal sr-${effect} ${visible ? 'sr-visible' : ''}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;
