import React, { useState, useRef } from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { THEMES } from '../../../data/themes';

const ITEMS_PER_PAGE = 8;

const ThemeSection: React.FC = () => {
  const theme = useInvitationStore((s) => s.data.theme);
  const updateFields = useInvitationStore((s) => s.updateFields);
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(THEMES.length / ITEMS_PER_PAGE);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const dragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  const finishDrag = (offset: number) => {
    dragging.current = false;
    if (offset < -40 && page < totalPages - 1) setPage(page + 1);
    else if (offset > 40 && page > 0) setPage(page - 1);
    setDragOffset(0);
  };

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; dragging.current = true; };
  const onTouchMove = (e: React.TouchEvent) => { if (dragging.current) setDragOffset(e.touches[0].clientX - startX.current); };
  const onTouchEnd = () => finishDrag(dragOffset);
  const onMouseDown = (e: React.MouseEvent) => { startX.current = e.clientX; dragging.current = true; };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) { e.preventDefault(); setDragOffset(e.clientX - startX.current); } };
  const onMouseUp = () => { if (dragging.current) finishDrag(dragOffset); };
  const onMouseLeave = () => { if (dragging.current) finishDrag(dragOffset); };

  const pages = Array.from({ length: totalPages }, (_, i) =>
    THEMES.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE)
  );

  const translateX = -(page * 100) + (dragOffset / (containerRef.current?.offsetWidth || 400)) * 100;

  return (
    <div className="input-group">
      <label>테마 선택</label>
      <div className="theme-slide-viewport" ref={containerRef}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}
      >
        <div className="theme-slide-track" style={{
          transform: `translateX(${translateX}%)`,
          transition: dragOffset ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        }}>
          {pages.map((group, pi) => (
            <div key={pi} className="theme-slide-page">
              <div className="theme-select-grid modern">
                {group.map(t => (
                  <button key={t.key} type="button" className={`theme-chip-v2 ${theme === t.key ? 'active' : ''}`} style={theme === t.key ? { borderColor: t.colors[2] } : {}} onClick={() => updateFields({ theme: t.key, customBgColor: t.colors[0], customAccentColor: t.colors[2], customLabelColor: '', customTextColor: t.colors[3] })}>
                    <div className="theme-chip-info">
                      <span className="dot" style={{ background: t.colors[2] }}></span>
                      <span className="theme-chip-name" style={theme === t.key ? { color: t.colors[2] } : {}}>{t.name}</span>
                    </div>
                    <div className="theme-palette">
                      {t.colors.map((c, i) => <span key={i} className="palette-swatch" style={{ background: c }} />)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {totalPages > 1 && (
        <div className="theme-page-dots">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={`theme-page-dot ${page === i ? 'active' : ''}`} onClick={() => setPage(i)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSection;
