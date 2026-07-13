import React, { useState } from 'react';
import { Pipette, RotateCcw } from 'lucide-react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { InvitationData } from '../../../types';
import { THEMES, THEME_LABEL_DEFAULTS } from '../../../data/themes';

const FONTS = [
  { name: '기본 (Pretendard)', value: "'Pretendard', sans-serif" },
  { name: 'Cormorant Garamond (럭셔리 세리프)', value: "'Cormorant Garamond', serif" },
  { name: 'Playfair Display (에디토리얼 세리프)', value: "'Playfair Display', serif" },
  { name: '고운 바탕 (세리프)', value: "'Gowun Batang', serif" },
  { name: '고운 돋움 (산세리프)', value: "'Gowun Dodum', sans-serif" },
  { name: '나눔 명조 (클래식)', value: "'Nanum Myeongjo', serif" },
  { name: 'Dancing Script (영문 필기체)', value: "'Dancing Script', cursive" },
  { name: '마루 부리 (모던 럭셔리 세리프)', value: "'MaruBuri', serif" },
  { name: 'SUIT (심플 모던 산세리프)', value: "'SUIT', sans-serif" },
  { name: '리디바탕 (클래식 럭셔리 세리프)', value: "'Ridibatang', serif" },
];

const TEXTURES: { key: NonNullable<InvitationData['bgTexture']>; name: string }[] = [
  { key: 'none', name: '없음' }, { key: 'paper', name: '한지' }, { key: 'linen', name: '린넨' },
  { key: 'pattern', name: '도트' }, { key: 'silk', name: '실크' }, { key: 'watercolor', name: '수채화' },
];

const EFFECTS: { key: NonNullable<InvitationData['bgEffect']>; name: string }[] = [
  { key: 'none', name: '없음' }, { key: 'cherry-blossom', name: '벚꽃' },
  { key: 'snow', name: '함박눈' }, { key: 'stars', name: '별빛' },
  { key: 'leaves', name: '나뭇잎' }, { key: 'hearts', name: '하트' },
  { key: 'firefly', name: '반딧불' }, { key: 'confetti', name: '꽃가루' },
  { key: 'petals', name: '해바라기 꽃잎' }, { key: 'autumn', name: '단풍잎' },
];

const SCROLL_EFFECTS: { key: NonNullable<InvitationData['scrollEffect']>; name: string }[] = [
  { key: 'none', name: '없음' }, { key: 'fade-up', name: '페이드 업' },
  { key: 'fade-in', name: '페이드 인' }, { key: 'slide-in', name: '슬라이드' },
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

// 프리셋은 색깔 원만 보여주고(이름 텍스트 없음), 맨 앞의 팔레트 스와치를 누르면 직접
// 지정 칸이 펼쳐진다 — 기본 입력 방식은 HEX 텍스트 입력이고, 옆의 작은 원형 스와치는
// 색상표로 고르고 싶을 때를 위한 보조 수단이다. 현재 값이 프리셋 중 어디에도 없으면
// (=직접 지정한 색) 팔레트 스와치에 선택 링을 띄운다.
const ColorPickerRow: React.FC<{
  colors: { name: string; value: string }[];
  value: string;
  fallback: string;
  onChange: (v: string) => void;
  onReset?: () => void;
}> = ({ colors, value, fallback, onChange, onReset }) => {
  const [hexOpen, setHexOpen] = useState(false);
  const isCustom = !!value && !colors.some(c => c.value === value);
  const current = value || fallback;
  return (
    <div>
      <div className="color-pick-grid">
        <button type="button" className={`color-pick-btn color-pick-custom ${isCustom ? 'active' : ''}`} title="직접 입력 (HEX)" onClick={() => setHexOpen(v => !v)}>
          <span className="color-pick-swatch color-pick-swatch-custom" />
          <Pipette size={13} />
        </button>
        {colors.map(c => (
          <button key={c.name} type="button" className={`color-pick-btn ${value === c.value ? 'active' : ''}`} onClick={() => onChange(c.value)} title={c.name}>
            <span className="color-pick-swatch" style={{ background: c.value }} />
          </button>
        ))}
        {onReset && (
          <button type="button" className="color-pick-btn color-pick-reset" title="테마 색상으로 초기화" onClick={onReset}>
            <RotateCcw size={13} />
          </button>
        )}
      </div>
      {hexOpen && (
        <div className="color-hex-field">
          <span className="color-hex-prefix">#</span>
          <input
            type="text"
            autoFocus
            value={current.replace(/^#/, '')}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
              if (v.length === 6) onChange('#' + v);
            }}
            maxLength={6}
            placeholder="FFFFFF"
            className="modern-input color-hex-input"
          />
          <input type="color" value={current} onChange={(e) => onChange(e.target.value)} className="color-hex-native" title="색상표에서 선택" />
        </div>
      )}
    </div>
  );
};

const DesignSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const themeKey = data.theme || 'ivorynavy';
  const themeColors = THEMES.find(t => t.key === themeKey)?.colors || THEMES[0].colors;
  const themeLabelColor = THEME_LABEL_DEFAULTS[themeKey] || THEME_LABEL_DEFAULTS.ivorynavy;

  return (
    <>
      <div className="opt-inline-group">
        <label className="opt-inline-label">스크롤 방향</label>
        <div className="account-style-grid">
          <button type="button" className={`account-style-btn ${(data.scrollDirection || 'vertical') === 'vertical' ? 'active' : ''}`} onClick={() => updateField('scrollDirection', 'vertical')}><strong>세로 모드</strong></button>
          <button type="button" className={`account-style-btn ${data.scrollDirection === 'horizontal' ? 'active' : ''}`} onClick={() => updateField('scrollDirection', 'horizontal')}><strong>가로 모드</strong></button>
        </div>
      </div>
      {data.scrollDirection === 'horizontal' && (
        <div className="opt-inline-group">
          <label className="opt-inline-label">가로 넘김 방식</label>
          <div className="account-style-grid">
            <button type="button" className={`account-style-btn ${(data.horizontalPageMode || 'free') === 'free' ? 'active' : ''}`} onClick={() => updateField('horizontalPageMode', 'free')}><strong>자유롭게 이어서</strong></button>
            <button type="button" className={`account-style-btn ${data.horizontalPageMode === 'snap' ? 'active' : ''}`} onClick={() => updateField('horizontalPageMode', 'snap')}><strong>한 장씩 넘기기</strong></button>
          </div>
        </div>
      )}
      <div className="opt-inline-group">
        <label className="opt-inline-label">기본 언어</label>
        <div className="account-style-grid">
          <button type="button" className={`account-style-btn ${data.language === 'ko' ? 'active' : ''}`} onClick={() => updateField('language', 'ko')}><strong>한국어</strong></button>
          <button type="button" className={`account-style-btn ${data.language === 'en' ? 'active' : ''}`} onClick={() => updateField('language', 'en')}><strong>ENGLISH</strong></button>
          <button type="button" className={`account-style-btn ${data.language === 'ja' ? 'active' : ''}`} onClick={() => updateField('language', 'ja')}><strong>日本語</strong></button>
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">글꼴 선택</label>
        <div className="opt-inline-content">
          <select value={data.fontFamily} onChange={(e) => updateField('fontFamily', e.target.value)} className="modern-input">
            {FONTS.map(font => <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option>)}
          </select>
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">글씨 크기</label>
        <div className="account-style-grid">
          <button type="button" className={`account-style-btn ${data.fontSize === 'small' ? 'active' : ''}`} onClick={() => updateField('fontSize', 'small')}><strong>작게</strong></button>
          <button type="button" className={`account-style-btn ${data.fontSize === 'medium' ? 'active' : ''}`} onClick={() => updateField('fontSize', 'medium')}><strong>중간</strong></button>
          <button type="button" className={`account-style-btn ${data.fontSize === 'large' ? 'active' : ''}`} onClick={() => updateField('fontSize', 'large')}><strong>크게</strong></button>
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">배경 색상</label>
        <div className="opt-inline-content">
          <ColorPickerRow colors={BG_COLORS} value={data.customBgColor || ''} fallback="#FFFFFF" onChange={(v) => updateField('customBgColor', v)} onReset={() => updateField('customBgColor', themeColors[0])} />
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">강조 색상</label>
        <div className="opt-inline-content">
          <ColorPickerRow colors={ACCENT_COLORS} value={data.customAccentColor || ''} fallback="#D4A5C6" onChange={(v) => updateField('customAccentColor', v)} onReset={() => updateField('customAccentColor', themeColors[2])} />
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">섹션 라벨 색상</label>
        <div className="opt-inline-content">
          <ColorPickerRow colors={ACCENT_COLORS} value={data.customLabelColor || ''} fallback={themeLabelColor} onChange={(v) => updateField('customLabelColor', v)} onReset={() => updateField('customLabelColor', themeLabelColor)} />
          <span className="input-hint">MESSAGE, LOCATION처럼 섹션을 표시하는 영문 라벨의 색상입니다. 지정하지 않으면 강조 색상을 따릅니다.</span>
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">텍스트 색상</label>
        <div className="opt-inline-content">
          <ColorPickerRow colors={ACCENT_COLORS} value={data.customTextColor || ''} fallback="#000000" onChange={(v) => updateField('customTextColor', v)} onReset={() => updateField('customTextColor', themeColors[3])} />
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">배경 재질</label>
        <div className="account-style-grid">
          {TEXTURES.map(t => (
            <button key={t.key} type="button" className={`account-style-btn ${(data.bgTexture || 'none') === t.key ? 'active' : ''}`} onClick={() => updateField('bgTexture', t.key)}>
              <strong>{t.name}</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">흩날리는 효과</label>
        <div className="opt-inline-content">
          <div className="account-style-grid">
            {EFFECTS.map(t => (
              <button key={t.key} type="button" className={`account-style-btn ${(data.bgEffect || 'none') === t.key ? 'active' : ''}`} onClick={() => updateField('bgEffect', t.key)}>
                <strong>{t.name}</strong>
              </button>
            ))}
          </div>
          {(data.bgEffect || 'none') !== 'none' && (
            <label className="modern-checkbox" style={{ marginTop: 10 }}>
              <input type="checkbox" checked={!!data.bgEffectHeroOnly} onChange={(e) => updateField('bgEffectHeroOnly', e.target.checked)} />
              <span>메인화면 영역에만 표시</span>
            </label>
          )}
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">스크롤 등장 효과</label>
        <div className="opt-inline-content">
          <div className="account-style-grid">
            {SCROLL_EFFECTS.map(t => (
              <button key={t.key} type="button" className={`account-style-btn ${(data.scrollEffect || 'none') === t.key ? 'active' : ''}`} onClick={() => updateField('scrollEffect', t.key)}>
                <strong>{t.name}</strong>
              </button>
            ))}
          </div>
          <span className="input-hint">전체화면으로 확인해보세요!</span>
        </div>
      </div>
    </>
  );
};

export default DesignSection;
