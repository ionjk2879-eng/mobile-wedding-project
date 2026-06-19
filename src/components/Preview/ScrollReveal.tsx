import React, { useRef, useEffect, useState, createContext, useContext, useCallback } from 'react';

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

  const isEnabled = !!scrollRoot && !!effect && effect !== 'none';

  const checkVisibility = useCallback(() => {
    const el = ref.current;
    const container = scrollRoot?.current;
    if (!el || !container) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const triggerPoint = containerRect.top + containerRect.height * 0.85;
    if (elRect.top < triggerPoint) {
      setTimeout(() => setVisible(true), delay);
      return true;
    }
    return false;
  }, [scrollRoot, delay]);

  useEffect(() => {
    if (!isEnabled) {
      setVisible(true);
      return;
    }

    setVisible(false);

    const container = scrollRoot?.current;
    if (!container) return;

    let revealed = false;

    const onScroll = () => {
      if (revealed) return;
      if (checkVisibility()) {
        revealed = true;
        container.removeEventListener('scroll', onScroll);
      }
    };

    const timer = setTimeout(() => {
      if (checkVisibility()) {
        revealed = true;
      } else {
        container.addEventListener('scroll', onScroll, { passive: true });
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      container.removeEventListener('scroll', onScroll);
    };
  }, [isEnabled, scrollRoot, checkVisibility]);

  if (!isEnabled) return <>{children}</>;

  return (
    <div ref={ref} className={`scroll-reveal sr-${effect} ${visible ? 'sr-visible' : ''}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;
