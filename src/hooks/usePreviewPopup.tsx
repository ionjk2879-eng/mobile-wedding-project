import React, { useEffect, useState, useCallback, RefObject } from 'react';
import ReactDOM from 'react-dom';

export function usePreviewRect(anchorRef: RefObject<HTMLElement | null>, open: boolean) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const update = useCallback(() => {
    if (!anchorRef.current) return;
    const scroll = anchorRef.current.closest('.preview-content-scroll');
    const target = scroll || anchorRef.current.closest('.full-preview-container');
    if (target) setRect(target.getBoundingClientRect());
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
    <div className="pv-overlay-root" style={style}>
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
