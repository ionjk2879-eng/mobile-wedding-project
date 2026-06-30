import React, { useEffect, useState, useCallback, RefObject } from 'react';
import ReactDOM from 'react-dom';

export function usePreviewRect(anchorRef: RefObject<HTMLElement | null>, open: boolean) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const update = useCallback(() => {
    if (!anchorRef.current) return;

    // 에디터 사이드바 미리보기 패널
    const scroll = anchorRef.current.closest('.preview-content-scroll');
    if (scroll) { setRect(scroll.getBoundingClientRect()); return; }

    // invitation-page로 가로 위치/너비 결정
    const invPage = anchorRef.current.closest('.invitation-page');
    const pr = invPage?.getBoundingClientRect();

    const makeRect = (top: number, height: number) => ({
      top, left: pr?.left ?? 0,
      right: (pr?.left ?? 0) + (pr?.width ?? window.innerWidth),
      bottom: top + height,
      x: pr?.left ?? 0, y: top,
      width: pr?.width ?? window.innerWidth, height,
      toJSON() { return this; },
    } as DOMRect);

    // 에디터 전체보기
    const fullPreview = anchorRef.current.closest('.full-preview-container');
    if (fullPreview) {
      const cr = fullPreview.getBoundingClientRect();
      setRect(makeRect(cr.top, cr.height));
      return;
    }

    // 템플릿 미리보기 스크롤 영역
    const tmplScroll = anchorRef.current.closest('.tmpl-preview-scroll');
    if (tmplScroll) {
      const cr = tmplScroll.getBoundingClientRect();
      setRect(makeRect(cr.top, cr.height));
      return;
    }

    // ViewPage 등: 뷰포트 전체 높이
    setRect(makeRect(0, window.innerHeight));
  }, [anchorRef]);

  useEffect(() => {
    if (!open) { setRect(null); return; }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [open, update]);

  return rect;
}

interface PreviewOverlayProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  title: string;
  children: React.ReactNode;
}

export const PreviewOverlay: React.FC<PreviewOverlayProps> = ({ open, onClose, anchorRef, title, children }) => {
  const rect = usePreviewRect(anchorRef, open);

  if (!open || !rect) return null;

  const themeEl = anchorRef.current?.closest('[class*="theme-"]');
  const themeClass = themeEl ? Array.from(themeEl.classList).find(c => c.startsWith('theme-')) || '' : '';

  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--wedding-bg, #fff)',
    borderRadius: 'inherit',
    overflow: 'hidden',
  };

  return ReactDOM.createPortal(
    <div className={`pv-overlay-root ${themeClass}`} style={style}>
      <div className="pv-overlay-header">
        <span>{title}</span>
        <button type="button" onClick={onClose} aria-label="닫기">✕</button>
      </div>
      <div className="pv-overlay-body">
        {children}
      </div>
    </div>,
    document.body
  );
};
