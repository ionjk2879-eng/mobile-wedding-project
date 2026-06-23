import React, { useState } from 'react';
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
];

const ITEMS_PER_PAGE = 8;

const ThemeSection: React.FC = () => {
  const theme = useInvitationStore((s) => s.data.theme);
  const updateFields = useInvitationStore((s) => s.updateFields);
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(THEMES.length / ITEMS_PER_PAGE);
  const paged = THEMES.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="input-group">
      <label>테마 선택</label>
      <div className="theme-select-grid modern">
        {paged.map(t => (
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
