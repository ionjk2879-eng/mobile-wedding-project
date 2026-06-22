import React from 'react';
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
];

const ThemeSection: React.FC = () => {
  const theme = useInvitationStore((s) => s.data.theme);
  const updateField = useInvitationStore((s) => s.updateField);

  return (
    <div className="input-group">
      <label>테마 선택</label>
      <div className="theme-select-grid modern">
        {THEMES.map(t => (
          <button key={t.key} type="button" className={`theme-chip-v2 ${theme === t.key ? 'active' : ''}`} style={theme === t.key ? { borderColor: t.colors[2] } : {}} onClick={() => updateField('theme', t.key)}>
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
  );
};

export default ThemeSection;