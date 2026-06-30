import React, { useState, useRef } from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { InvitationData } from '../../../types';

const THEMES: { key: NonNullable<InvitationData['theme']>; name: string; colors: string[] }[] = [
  { key: 'blush', name: '블러시 핑크', colors: ['#FFF5F6', '#F3CDCC', '#D4918E', '#E8A0A0', '#3C2B2B'] },
  { key: 'champagne', name: '샴페인', colors: ['#FBF8F3', '#E8DFD2', '#C8A97E', '#D4B896', '#3B3228'] },
  { key: 'sage', name: '세이지 그린', colors: ['#F5F7F4', '#D6DED0', '#8BA888', '#A3B59E', '#2B3328'] },
  { key: 'navy', name: '클래식 네이비', colors: ['#F3F5F9', '#D0D8E8', '#4A5E7A', '#6A80A0', '#1E2638'] },
  { key: 'burgundy', name: '버건디 와인', colors: ['#FBF5F5', '#E8D4D4', '#8B3A4A', '#A8626E', '#2E1A1E'] },
  { key: 'lavender', name: '라벤더', colors: ['#F7F5FA', '#E3DFEE', '#9B8BB8', '#B5A4CC', '#2C2038'] },
  { key: 'dusty', name: '더스티 로즈', colors: ['#FAF5F3', '#E8D8D4', '#B67A82', '#C99498', '#38282A'] },
  { key: 'modern', name: '모던 화이트', colors: ['#FAFAFA', '#E8E8E8', '#888888', '#AAAAAA', '#1A1A1A'] },
  { key: 'mocha', name: '모카', colors: ['#F5EDE4', '#E0D0C0', '#8B6F5C', '#A68B78', '#3E2C22'] },
  { key: 'cloud', name: '클라우드', colors: ['#F8FAFB', '#D8E4EC', '#7BA3B8', '#A8C4D6', '#2A3E4A'] },
  { key: 'emerald', name: '에메랄드', colors: ['#EDF5F0', '#C0D8C8', '#2E7D5B', '#4A9E78', '#1A3D2E'] },
  { key: 'butter', name: '버터', colors: ['#FFFCE8', '#E8E0B8', '#C49A2A', '#D4B050', '#4A4020'] },
  { key: 'cobalt', name: '코발트', colors: ['#EEF0F8', '#C8D0E8', '#2E4A8A', '#5070B0', '#121830'] },
  { key: 'terracotta', name: '테라코타', colors: ['#FAF0E6', '#E0CDB8', '#B86842', '#D08860', '#4A2E1E'] },
  { key: 'rosegold', name: '로즈골드', colors: ['#FDF5F3', '#F0D8D0', '#C4887A', '#D4A090', '#3E2822'] },
  { key: 'midnight', name: '미드나잇', colors: ['#F0F0F5', '#D0D0E0', '#2A2A5A', '#4A4A7A', '#1A1A30'] },
  { key: 'pearl', name: '펄', colors: ['#FDFAF5', '#EDE6D8', '#B0946A', '#C4AB88', '#2E261A'] },
  { key: 'mist', name: '미스트', colors: ['#F5F7F9', '#D8DFE6', '#6E8899', '#8EA0AE', '#1E2A33'] },
  { key: 'walnut', name: '월넛', colors: ['#FAF6F0', '#E0D0C0', '#8A6248', '#A87C60', '#2C1E14'] },
  { key: 'slate', name: '슬레이트', colors: ['#F6F7F9', '#D4D8DF', '#5E6F80', '#788694', '#1E2830'] },
  { key: 'wisteria', name: '위스테리아', colors: ['#F8F5FC', '#E0D8F0', '#8A70B0', '#A494C4', '#281C3C'] },
  { key: 'cedar', name: '시더', colors: ['#FAF4EF', '#E4CEC4', '#A06048', '#BA7C64', '#2E1610'] },
  { key: 'stone', name: '스톤', colors: ['#F7F6F4', '#E0DDD8', '#8C8880', '#A0A098', '#282622'] },
  { key: 'copper', name: '코퍼', colors: ['#FCF8F2', '#E8D8C0', '#B87A38', '#CC9454', '#2C1E0A'] },
  { key: 'ivory', name: '아이보리', colors: ['#FDFDF8', '#ECEADA', '#A89C70', '#C0B488', '#2C2A1E'] },
  { key: 'plum', name: '딥 플럼', colors: ['#F5F1F7', '#DDD0EC', '#7C4E80', '#9C6EA0', '#281630'] },
  { key: 'olive', name: '다크 올리브', colors: ['#F2F4EE', '#C8D2BE', '#5A6C40', '#748C58', '#1E2814'] },
  { key: 'noir', name: '누아르', colors: ['#F3F2F0', '#DCDAD6', '#2A2826', '#4E4C4A', '#1A1816'] },
  { key: 'peach', name: '피치 코랄', colors: ['#FFF8F4', '#F0D8CC', '#D4785C', '#E89880', '#38201A'] },
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
