import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { OpeningConfig } from '../../../types';

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
            <label>메인 멘트</label>
            <input type="text" value={opening.openingText} onChange={(e) => update({ openingText: e.target.value })} className="modern-input" placeholder="We're getting married" />
            <span className="input-hint">비워두면 기본 텍스트가 표시됩니다.</span>
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
