import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { InvitationData } from '../../../types';

const FONTS = [
  { name: '기본 (Pretendard)', value: "'Pretendard', sans-serif" },
  { name: 'Cormorant Garamond (럭셔리 세리프)', value: "'Cormorant Garamond', serif" },
  { name: 'Playfair Display (에디토리얼 세리프)', value: "'Playfair Display', serif" },
  { name: '고운 바탕 (세리프)', value: "'Gowun Batang', serif" },
  { name: '고운 돋움 (산세리프)', value: "'Gowun Dodum', sans-serif" },
  { name: '나눔 명조 (클래식)', value: "'Nanum Myeongjo', serif" },
  { name: 'Dancing Script (영문 필기체)', value: "'Dancing Script', cursive" },
];

const TEXTURES: { key: NonNullable<InvitationData['bgTexture']>; name: string }[] = [
  { key: 'none', name: '없음' }, { key: 'paper', name: '한지' }, { key: 'linen', name: '린넨' },
  { key: 'pattern', name: '도트' }, { key: 'silk', name: '실크' }, { key: 'watercolor', name: '수채화' },
];

const EFFECTS: { key: NonNullable<InvitationData['bgEffect']>; name: string; icon: string }[] = [
  { key: 'none', name: '없음', icon: '—' }, { key: 'cherry-blossom', name: '벚꽃', icon: '🌸' },
  { key: 'snow', name: '함박눈', icon: '❄️' }, { key: 'stars', name: '별빛', icon: '✨' },
  { key: 'leaves', name: '나뭇잎', icon: '🍃' }, { key: 'hearts', name: '하트', icon: '💕' },
  { key: 'firefly', name: '반딧불', icon: '🔅' }, { key: 'confetti', name: '꽃가루', icon: '🎊' },
  { key: 'petals', name: '꽃잎', icon: '🌼' }, { key: 'autumn', name: '단풍잎', icon: '🍂' },
];

const SCROLL_EFFECTS: { key: NonNullable<InvitationData['scrollEffect']>; name: string; icon: string }[] = [
  { key: 'none', name: '없음', icon: '—' }, { key: 'fade-up', name: '페이드 업', icon: '↑' },
  { key: 'fade-in', name: '페이드 인', icon: '◎' }, { key: 'slide-in', name: '슬라이드', icon: '→' },
];

const BG_COLORS = [
  { name: '화이트', value: '#FFFFFF' },
  { name: '아이보리', value: '#FFFDF5' },
  { name: '연분홍', value: '#FFF5F6' },
  { name: '라벤더', value: '#F7F5FA' },
  { name: '민트', value: '#F2FAF7' },
  { name: '스카이', value: '#F3F7FC' },
  { name: '크림', value: '#FBF8F0' },
  { name: '쿨그레이', value: '#F5F6F8' },
];

const ACCENT_COLORS = [
  { name: '블랙', value: '#000000' },
  { name: '로즈', value: '#D4918E' },
  { name: '골드', value: '#C8A97E' },
  { name: '세이지', value: '#8BA888' },
  { name: '네이비', value: '#4A5E7A' },
  { name: '버건디', value: '#8B3A4A' },
  { name: '라벤더', value: '#9B8BB8' },
  { name: '코럴', value: '#E08B7A' },
];

const DesignSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);

  return (
    <>
      <div className="input-grid-2">
        <div className="input-group">
          <label>기본 언어</label>
          <div className="tab-group modern">
            <button className={`tab-btn ${data.language === 'ko' ? 'active' : ''}`} onClick={() => updateField('language', 'ko')}>KOREAN</button>
            <button className={`tab-btn ${data.language === 'en' ? 'active' : ''}`} onClick={() => updateField('language', 'en')}>ENGLISH</button>
            <button className={`tab-btn ${data.language === 'ja' ? 'active' : ''}`} onClick={() => updateField('language', 'ja')}>日本語</button>
          </div>
        </div>
        <div className="input-group">
          <label>글꼴 선택</label>
          <select value={data.fontFamily} onChange={(e) => updateField('fontFamily', e.target.value)} className="modern-input">
            {FONTS.map(font => <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option>)}
          </select>
        </div>
      </div>
      <div className="input-group">
        <label>글씨 크기</label>
        <div className="tab-group modern">
          <button className={`tab-btn ${data.fontSize === 'small' ? 'active' : ''}`} onClick={() => updateField('fontSize', 'small')}>작게</button>
          <button className={`tab-btn ${data.fontSize === 'medium' ? 'active' : ''}`} onClick={() => updateField('fontSize', 'medium')}>중간</button>
          <button className={`tab-btn ${data.fontSize === 'large' ? 'active' : ''}`} onClick={() => updateField('fontSize', 'large')}>크게</button>
        </div>
      </div>
      <div className="input-group">
        <label>배경 색상</label>
        <div className="color-pick-grid">
          {BG_COLORS.map(c => (
            <button key={c.name} type="button" className={`color-pick-btn ${(data.customBgColor || '') === c.value ? 'active' : ''}`} onClick={() => updateField('customBgColor', c.value)} title={c.name}>
              <span className="color-pick-swatch" style={{ background: c.value || '#FFFFFF' }} />
              <span className="color-pick-name">{c.name}</span>
            </button>
          ))}
        </div>
        <div className="color-custom-row">
          <input type="color" value={data.customBgColor || '#FFFFFF'} onChange={(e) => updateField('customBgColor', e.target.value)} className="color-picker-input" />
          <input type="text" value={data.customBgColor || ''} onChange={(e) => updateField('customBgColor', e.target.value)} placeholder="#FFFFFF" className="modern-input color-hex-input" />
          {data.customBgColor && <button type="button" className="color-reset-btn" onClick={() => updateField('customBgColor', '')}>초기화</button>}
        </div>
        <span className="input-hint">프리셋 선택 또는 팔레트/코드로 자유롭게 지정하세요.</span>
      </div>
      <div className="input-group">
        <label>강조 색상</label>
        <div className="color-pick-grid">
          {ACCENT_COLORS.map(c => (
            <button key={c.name} type="button" className={`color-pick-btn ${(data.customAccentColor || '') === c.value ? 'active' : ''}`} onClick={() => updateField('customAccentColor', c.value)} title={c.name}>
              <span className="color-pick-swatch" style={{ background: c.value || '#FFFFFF' }} />
              <span className="color-pick-name">{c.name}</span>
            </button>
          ))}
        </div>
        <div className="color-custom-row">
          <input type="color" value={data.customAccentColor || '#D4A5C6'} onChange={(e) => updateField('customAccentColor', e.target.value)} className="color-picker-input" />
          <input type="text" value={data.customAccentColor || ''} onChange={(e) => updateField('customAccentColor', e.target.value)} placeholder="#D4A5C6" className="modern-input color-hex-input" />
          {data.customAccentColor && <button type="button" className="color-reset-btn" onClick={() => updateField('customAccentColor', '')}>초기화</button>}
        </div>
        <span className="input-hint">프리셋 선택 또는 팔레트/코드로 자유롭게 지정하세요.</span>
      </div>
      <div className="input-group">
        <label>섹션 라벨 색상</label>
        <div className="color-pick-grid">
          {ACCENT_COLORS.map(c => (
            <button key={c.name} type="button" className={`color-pick-btn ${(data.customLabelColor || '') === c.value ? 'active' : ''}`} onClick={() => updateField('customLabelColor', c.value)} title={c.name}>
              <span className="color-pick-swatch" style={{ background: c.value || '#FFFFFF' }} />
              <span className="color-pick-name">{c.name}</span>
            </button>
          ))}
        </div>
        <div className="color-custom-row">
          <input type="color" value={data.customLabelColor || '#163A5F'} onChange={(e) => updateField('customLabelColor', e.target.value)} className="color-picker-input" />
          <input type="text" value={data.customLabelColor || ''} onChange={(e) => updateField('customLabelColor', e.target.value)} placeholder="#163A5F" className="modern-input color-hex-input" />
          {data.customLabelColor && <button type="button" className="color-reset-btn" onClick={() => updateField('customLabelColor', '')}>초기화</button>}
        </div>
        <span className="input-hint">MESSAGE, LOCATION처럼 섹션을 표시하는 영문 라벨의 색상입니다. 지정하지 않으면 강조 색상을 따릅니다.</span>
      </div>
      <div className="input-group">
        <label>텍스트 색상</label>
        <div className="color-pick-grid">
          {ACCENT_COLORS.map(c => (
            <button key={c.name} type="button" className={`color-pick-btn ${(data.customTextColor || '') === c.value ? 'active' : ''}`} onClick={() => updateField('customTextColor', c.value)} title={c.name}>
              <span className="color-pick-swatch" style={{ background: c.value || '#FFFFFF' }} />
              <span className="color-pick-name">{c.name}</span>
            </button>
          ))}
        </div>
        <div className="color-custom-row">
          <input type="color" value={data.customTextColor || '#000000'} onChange={(e) => updateField('customTextColor', e.target.value)} className="color-picker-input" />
          <input type="text" value={data.customTextColor || ''} onChange={(e) => updateField('customTextColor', e.target.value)} placeholder="#000000" className="modern-input color-hex-input" />
          {data.customTextColor && <button type="button" className="color-reset-btn" onClick={() => updateField('customTextColor', '')}>초기화</button>}
        </div>
        <span className="input-hint">이름, 날짜, 본문 등 일반 텍스트의 색상입니다.</span>
      </div>
      <div className="input-group">
        <label>배경 재질</label>
        <div className="theme-select-grid modern">
          {TEXTURES.map(t => (
            <button key={t.key} type="button" className={`theme-chip ${(data.bgTexture || 'none') === t.key ? 'active' : ''}`} onClick={() => updateField('bgTexture', t.key)}>
              <span className={`texture-preview tex-${t.key}`}></span>{t.name}
            </button>
          ))}
        </div>
      </div>
      <div className="input-group">
        <label>흩날리는 효과</label>
        <div className="theme-select-grid modern">
          {EFFECTS.map(t => (
            <button key={t.key} type="button" className={`theme-chip ${(data.bgEffect || 'none') === t.key ? 'active' : ''}`} onClick={() => updateField('bgEffect', t.key)}>
              <span className="effect-icon">{t.icon}</span>{t.name}
            </button>
          ))}
        </div>
      </div>
      <div className="input-group">
        <label>스크롤 등장 효과 <span className="label-hint">(전체화면으로 확인해보세요!)</span></label>
        <div className="theme-select-grid modern">
          {SCROLL_EFFECTS.map(t => (
            <button key={t.key} type="button" className={`theme-chip ${(data.scrollEffect || 'none') === t.key ? 'active' : ''}`} onClick={() => updateField('scrollEffect', t.key)}>
              <span className="effect-icon">{t.icon}</span>{t.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default DesignSection;
