import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { OpeningConfig } from '../../../types';

const GRADIENT_PALETTES = [
  {
    group: '감성',
    items: [
      { name: 'Blue Dusk',    c1: '#5F79EC', c2: '#E8857A' },
      { name: 'Violet Coral', c1: '#7058A0', c2: '#EC8C74' },
      { name: 'Midnight',     c1: '#1E2C50', c2: '#9870B0' },
      { name: 'Slate Rose',   c1: '#6880A0', c2: '#E0A0A4' },
      { name: 'Deep Mauve',   c1: '#5C3868', c2: '#D4A4B8' },
      { name: 'Teal Coral',   c1: '#4C9898', c2: '#EC8E78' },
      { name: 'Indigo Bloom', c1: '#4A5BA0', c2: '#E8A4B4' },
      { name: 'Azure Dream',  c1: '#A0C8DC', c2: '#F0C4AC' },
    ],
  },
  {
    group: '2026 트렌드',
    items: [
      { name: 'Butter Glow',    c1: '#EED070', c2: '#F0B880' },
      { name: 'Digi Lavender',  c1: '#B8ACEC', c2: '#E4D4F4' },
      { name: 'Copper Amber',   c1: '#C88450', c2: '#E0B868' },
      { name: 'Dusty Plum',     c1: '#7A5880', c2: '#D4A4C0' },
      { name: 'Terracotta',     c1: '#C87858', c2: '#E0C8A4' },
      { name: 'Apricot Crush',  c1: '#F0A870', c2: '#F8D4A8' },
      { name: 'Berry Mauve',    c1: '#8C4870', c2: '#D8A4BC' },
      { name: 'Periwinkle',     c1: '#7C90CC', c2: '#C0C8EC' },
    ],
  },
  {
    group: '웨딩',
    items: [
      { name: 'Pure Romance',  c1: '#F8F0E8', c2: '#F0C0C8' },
      { name: 'Velvet Rose',   c1: '#8C3050', c2: '#F0C0BC' },
      { name: 'Golden Vow',    c1: '#D4A448', c2: '#F8E4C0' },
      { name: 'Midnight Veil', c1: '#1C1C38', c2: '#8C7CAC' },
      { name: 'Dusty Blue',    c1: '#8CACC4', c2: '#E8E4F0' },
      { name: 'Eternal Gold',  c1: '#C8A85C', c2: '#E8DCC8' },
    ],
  },
];

const OPENING_PRESETS = [
  { label: "We're getting married", value: "We're getting married" },
  { label: '결혼합니다', value: '결혼합니다' },
  { label: '소중한 날에 초대합니다', value: '소중한 날에 초대합니다' },
  { label: '함께해 주세요', value: '함께해 주세요' },
  { label: '두 사람이 하나가 되는 날', value: '두 사람이 하나가 되는 날' },
  { label: 'Forever begins today', value: 'Forever begins today' },
  { label: 'Save the Date', value: 'Save the Date' },
  { label: '사랑으로 하나 되는 날', value: '사랑으로 하나 되는 날' },
  { label: 'Together Forever', value: 'Together Forever' },
  { label: '평생 함께 하겠습니다', value: '평생 함께 하겠습니다' },
];

const defaultOpening: OpeningConfig = {
  openingEnabled: false, openingStyle: 'curtain', openingColorMode: 'theme',
  openingBgColor: '#1F2937', openingBgOpacity: 0.95, openingText: '', openingSubText: '',
};

const OpeningSection: React.FC = () => {
  const opening = useInvitationStore((s) => s.data.opening) || defaultOpening;
  const updateField = useInvitationStore((s) => s.updateField);

  const update = (partial: Partial<OpeningConfig>) => {
    updateField('opening', { ...opening, ...partial });
  };

  return (
    <>
      <div className="input-group">
        <label className="modern-checkbox">
          <input type="checkbox" checked={opening.openingEnabled} onChange={(e) => update({ openingEnabled: e.target.checked })} />
          <span>오프닝 애니메이션 활성화 <em style={{ fontWeight: 400, color: '#D4A5C6', fontSize: '0.85em' }}>(전체화면으로 확인해보세요!)</em></span>
        </label>
      </div>

      {opening.openingEnabled && (
        <>
          <div className="input-group">
            <label>애니메이션 스타일</label>
            <div className="account-style-grid">
              {([
                { key: 'curtain' as const, name: '커튼', desc: '위로 걷히며 청첩장이 나타남' },
                { key: 'circle' as const, name: '원형 확산', desc: '중앙에서 원형으로 펼쳐짐' },
                { key: 'fade' as const, name: '페이드', desc: '서서히 밝아지며 나타남' },
                { key: 'frame' as const, name: '투명 액자', desc: '유리 액자 속에 담은 고급스러운 연출' },
                { key: 'insta' as const, name: '인스타그램', desc: '스토리 형식의 감각적인 연출' },
                { key: 'typing' as const, name: '타이핑', desc: '글자가 한 자씩 타이핑되는 감성 연출' },
              ]).map(s => (
                <button key={s.key} type="button" className={`account-style-btn ${opening.openingStyle === s.key ? 'active' : ''}`} onClick={() => update({ openingStyle: s.key })}>
                  <strong>{s.name}</strong><span>{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>배경색</label>
            <div className="account-style-grid">
              <button type="button" className={`account-style-btn ${opening.openingColorMode === 'theme' ? 'active' : ''}`} onClick={() => update({ openingColorMode: 'theme' })}>
                <strong>테마 색상</strong><span>선택한 테마에 맞춰 자동 적용</span>
              </button>
              <button type="button" className={`account-style-btn ${opening.openingColorMode === 'custom' ? 'active' : ''}`} onClick={() => update({ openingColorMode: 'custom' })}>
                <strong>단색</strong><span>원하는 색상을 직접 지정</span>
              </button>
              <button type="button" className={`account-style-btn ${opening.openingColorMode === 'gradient' ? 'active' : ''}`} onClick={() => update({ openingColorMode: 'gradient' })}>
                <strong>그라데이션</strong><span>두 색상이 부드럽게 전환</span>
              </button>
            </div>
          </div>

          {opening.openingColorMode === 'custom' && (
            <div className="input-group">
              <label>배경색 선택</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={opening.openingBgColor} onChange={(e) => update({ openingBgColor: e.target.value })} style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                <input type="text" value={opening.openingBgColor} onChange={(e) => update({ openingBgColor: e.target.value })} className="modern-input" style={{ flex: 1 }} />
              </div>
            </div>
          )}

          {opening.openingColorMode === 'gradient' && (
            <>
              <div className="input-group">
                <label>추천 팔레트</label>
                <div className="op-palette-wrap">
                  {GRADIENT_PALETTES.map(group => (
                    <div key={group.group} className="op-palette-group">
                      <p className="op-palette-group-label">{group.group}</p>
                      <div className="op-palette-grid">
                        {group.items.map(p => {
                          const isActive = opening.openingBgColor === p.c1 && (opening.openingBgColor2 || '#E8857A') === p.c2;
                          return (
                            <div
                              key={p.name}
                              className={`op-palette-item${isActive ? ' active' : ''}`}
                              onClick={() => update({ openingBgColor: p.c1, openingBgColor2: p.c2 })}
                              title={`${p.name}\n${p.c1} → ${p.c2}`}
                            >
                              <div className="op-palette-swatch" style={{ background: `linear-gradient(180deg, ${p.c1}, ${p.c2})` }} />
                              <p className="op-palette-name">{p.name}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>직접 조정</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input type="color" value={opening.openingBgColor} onChange={(e) => update({ openingBgColor: e.target.value })} style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }} />
                  <input type="text" value={opening.openingBgColor} onChange={(e) => update({ openingBgColor: e.target.value })} className="modern-input" style={{ flex: 1 }} placeholder="시작 색상 (위)" />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={opening.openingBgColor2 || '#E8857A'} onChange={(e) => update({ openingBgColor2: e.target.value })} style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }} />
                  <input type="text" value={opening.openingBgColor2 || '#E8857A'} onChange={(e) => update({ openingBgColor2: e.target.value })} className="modern-input" style={{ flex: 1 }} placeholder="끝 색상 (아래)" />
                </div>
                <div style={{ marginTop: 10, height: 28, borderRadius: 8, background: `linear-gradient(to right, ${opening.openingBgColor || '#F5E6A3'}, ${opening.openingBgColor2 || '#E8857A'})` }} />
              </div>
            </>
          )}

          <div className="input-group">
            <label>배경 불투명도 ({Math.round(opening.openingBgOpacity * 100)}%)</label>
            <input type="range" min="0.3" max="1" step="0.05" value={opening.openingBgOpacity} onChange={(e) => update({ openingBgOpacity: parseFloat(e.target.value) })} style={{ width: '100%' }} />
          </div>

          <div className="input-group">
            <label>멘트 폰트 스타일</label>
            <div className="account-style-grid">
              {([
                { key: 'elegant' as const, name: '세련됨', desc: 'Noto Serif KR · 고급스러운 세리프' },
                { key: 'simple' as const, name: '심플함', desc: 'Noto Sans KR · 모던 미니멀' },
                { key: 'clean' as const, name: '깔끔함', desc: 'Gowun Batang · 단정한 바탕체' },
              ]).map(s => (
                <button key={s.key} type="button" className={`account-style-btn ${(opening.openingFontStyle || 'elegant') === s.key ? 'active' : ''}`} onClick={() => update({ openingFontStyle: s.key })}>
                  <strong>{s.name}</strong><span>{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>메인 멘트</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {OPENING_PRESETS.map((p) => (
                <button key={p.value} type="button"
                  style={{ padding: '6px 12px', borderRadius: 20, border: opening.openingText === p.value ? '1.5px solid #B07A8E' : '1px solid #E5E7EB', background: opening.openingText === p.value ? '#FDF2F4' : 'white', color: opening.openingText === p.value ? '#B07A8E' : '#6B7280', fontSize: '0.78rem', fontWeight: opening.openingText === p.value ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onClick={() => update({ openingText: p.value })}
                >{p.label}</button>
              ))}
            </div>
            <input type="text" value={opening.openingText} onChange={(e) => update({ openingText: e.target.value })} className="modern-input" placeholder="직접 입력하거나 위에서 선택하세요" />
          </div>

          <div className="input-group">
            <label>서브 멘트</label>
            <input type="text" value={opening.openingSubText} onChange={(e) => update({ openingSubText: e.target.value })} className="modern-input" placeholder="2026. 10. 24" />
            <span className="input-hint">비워두면 예식 날짜가 표시됩니다.</span>
          </div>
        </>
      )}
    </>
  );
};

export default OpeningSection;
