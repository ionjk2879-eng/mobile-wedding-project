import React, { useState, useRef } from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { InvitationData } from '../../../types';

const THEMES: { key: NonNullable<InvitationData['theme']>; name: string; colors: string[] }[] = [
  { key: 'sage', name: '세이지 그린', colors: ['#F5F7F4', '#D6DED0', '#8BA888', '#A3B59E', '#2B3328'] },
  { key: 'mist', name: '미스트', colors: ['#F5F7F9', '#D8DFE6', '#6E8899', '#8EA0AE', '#1E2A33'] },
  { key: 'pearl', name: '펄', colors: ['#FDFAF5', '#EDE6D8', '#B0946A', '#C4AB88', '#2E261A'] },
  { key: 'walnut', name: '월넛', colors: ['#FAF6F0', '#E0D0C0', '#8A6248', '#A87C60', '#2C1E14'] },
  { key: 'slate', name: '슬레이트', colors: ['#F6F7F9', '#D4D8DF', '#5E6F80', '#788694', '#1E2830'] },
  { key: 'wisteria', name: '위스테리아', colors: ['#F8F5FC', '#E0D8F0', '#8A70B0', '#A494C4', '#281C3C'] },
  { key: 'cedar', name: '시더', colors: ['#FAF4EF', '#E4CEC4', '#A06048', '#BA7C64', '#2E1610'] },
  { key: 'stone', name: '스톤', colors: ['#F7F6F4', '#E0DDD8', '#8C8880', '#A0A098', '#282622'] },
  { key: 'copper', name: '코퍼', colors: ['#FCF8F2', '#E8D8C0', '#B87A38', '#CC9454', '#2C1E0A'] },
  { key: 'sky', name: '스카이 블루', colors: ['#EDF2FA', '#C8D6EC', '#6070A8', '#8090C0', '#1A2240'] },
  { key: 'linen', name: '리넨', colors: ['#F5EFE6', '#E2D5C2', '#9A8468', '#B49E80', '#2C2218'] },
  { key: 'olive', name: '다크 올리브', colors: ['#F2F4EE', '#C8D2BE', '#5A6C40', '#748C58', '#1E2814'] },
  { key: 'noir', name: '누아르', colors: ['#F3F2F0', '#DCDAD6', '#2A2826', '#4E4C4A', '#1A1816'] },
  { key: 'peach', name: '피치 코랄', colors: ['#FFF8F4', '#F0D8CC', '#D4785C', '#E89880', '#38201A'] },
  { key: 'white', name: '화이트 미니멀', colors: ['#FFFFFF', '#E5E5E5', '#2A2A2A', '#595959', '#1A1A1A'] },
  { key: 'whitegold', name: '화이트 골드', colors: ['#FFFFFF', '#EDE0C8', '#C9A227', '#D4B94E', '#3A2E10'] },
];

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
                  <button key={t.key} type="button" className={`theme-chip-v2 ${theme === t.key ? 'active' : ''}`} style={theme === t.key ? { borderColor: t.colors[2] } : {}} onClick={() => updateFields({ theme: t.key, customBgColor: '', customAccentColor: '' })}>
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
