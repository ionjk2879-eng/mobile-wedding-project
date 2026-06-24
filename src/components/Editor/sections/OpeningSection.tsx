import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { OpeningConfig } from '../../../types';

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
                <strong>직접 선택</strong><span>원하는 색상을 직접 지정</span>
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
