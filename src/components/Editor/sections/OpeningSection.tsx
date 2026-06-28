import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { OpeningConfig } from '../../../types';

const GRADIENT_PRESETS = [
  { id: 'indigo-coral',   from: '#6B7FE0', to: '#E8907A' },  // 인디고 → 코랄
  { id: 'cream-blush',    from: '#F2EABF', to: '#F0A8A0' },  // 크림 → 블러쉬
  { id: 'lavender-peach', from: '#C0AADA', to: '#F4C4A8' },  // 라벤더 → 피치
  { id: 'slate-sage',     from: '#88A8C8', to: '#A8C4A0' },  // 슬레이트 → 세이지
  { id: 'mocha-blush',    from: '#B08878', to: '#EDD0C8' },  // 모카 → 블러쉬
  { id: 'peach-terra',    from: '#F5C8A0', to: '#D07858' },  // 피치 → 테라코타
  { id: 'mint-teal',      from: '#B8D4CC', to: '#6898A0' },  // 민트 → 틸
  { id: 'rose-mauve',     from: '#E8B0C0', to: '#A85888' },  // 로즈 → 모브
  { id: 'blue-lilac',     from: '#7090C8', to: '#C0AADA' },  // 블루 → 라일락
  { id: 'sand-gold',      from: '#DED0B8', to: '#C0985A' },  // 샌드 → 골드
  { id: 'sage-olive',     from: '#B8C8A8', to: '#7A9068' },  // 세이지 → 올리브
  { id: 'plum-rose',      from: '#8858A8', to: '#D898B8' },  // 플럼 → 로즈
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

          {opening.openingColorMode === 'gradient' && (
            <div className="input-group" style={{ marginTop: -8 }}>
              <label>그라데이션 색상</label>
              <div className="account-style-grid">
                <button type="button"
                  className={`account-style-btn ${(!opening.openingGradientMode || opening.openingGradientMode === 'theme') ? 'active' : ''}`}
                  onClick={() => update({ openingGradientMode: 'theme' })}
                >
                  <strong>테마 자동</strong><span>청첩장 테마 색상으로 자동 생성</span>
                </button>
                <button type="button"
                  className={`account-style-btn ${opening.openingGradientMode === 'preset' ? 'active' : ''}`}
                  onClick={() => update({ openingGradientMode: 'preset' })}
                >
                  <strong>프리셋</strong><span>감성 컬러 조합에서 선택</span>
                </button>
                <button type="button"
                  className={`account-style-btn ${opening.openingGradientMode === 'custom' ? 'active' : ''}`}
                  onClick={() => update({ openingGradientMode: 'custom' })}
                >
                  <strong>직접 지정</strong><span>시작·끝 색상을 직접 선택</span>
                </button>
              </div>

              {opening.openingGradientMode === 'preset' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 10 }}>
                  {GRADIENT_PRESETS.map(preset => {
                    const isActive = opening.openingBgColor === preset.from && opening.openingBgColor2 === preset.to;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => update({ openingBgColor: preset.from, openingBgColor2: preset.to })}
                        style={{
                          border: isActive ? '2px solid #B07A8E' : '2px solid #E5E7EB',
                          borderRadius: 8,
                          padding: '5px 5px 7px',
                          background: isActive ? '#FDF2F4' : 'white',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{
                          width: '100%', height: 60, borderRadius: 4,
                          background: `linear-gradient(180deg, ${preset.from} 0%, ${preset.to} 100%)`,
                          marginBottom: 5,
                        }} />
                        <div style={{ fontSize: '0.6rem', color: '#888', lineHeight: 1.5, fontFamily: 'monospace', letterSpacing: 0 }}>
                          <div>{preset.from}</div>
                          <div>{preset.to}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {(opening.openingGradientMode === 'preset' || opening.openingGradientMode === 'custom') && (
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: '0.78rem', color: '#6B7280', display: 'block', marginBottom: 6 }}>글자 색상</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button"
                      className={`account-style-btn ${(!opening.openingTextColor || opening.openingTextColor === 'white') ? 'active' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => update({ openingTextColor: 'white' })}
                    >
                      <strong style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', border: '1px solid #E5E7EB', display: 'inline-block', flexShrink: 0 }} />
                        흰색
                      </strong>
                    </button>
                    <button type="button"
                      className={`account-style-btn ${opening.openingTextColor === 'dark' ? 'active' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => update({ openingTextColor: 'dark' })}
                    >
                      <strong style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#1C1414', border: '1px solid #E5E7EB', display: 'inline-block', flexShrink: 0 }} />
                        검정
                      </strong>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {opening.openingColorMode === 'custom' && (
            <div className="input-group">
              <label>배경색 선택</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={opening.openingBgColor} onChange={(e) => update({ openingBgColor: e.target.value })} style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                <input type="text" value={opening.openingBgColor} onChange={(e) => update({ openingBgColor: e.target.value })} className="modern-input" style={{ flex: 1 }} />
              </div>
            </div>
          )}

          {opening.openingColorMode === 'gradient' && opening.openingGradientMode === 'custom' && (
            <>
              <div className="input-group">
                <label>시작 색상 (위)</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={opening.openingBgColor} onChange={(e) => update({ openingBgColor: e.target.value })} style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input type="text" value={opening.openingBgColor} onChange={(e) => update({ openingBgColor: e.target.value })} className="modern-input" style={{ flex: 1 }} />
                </div>
              </div>
              <div className="input-group">
                <label>끝 색상 (아래)</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={opening.openingBgColor2 || '#E8857A'} onChange={(e) => update({ openingBgColor2: e.target.value })} style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input type="text" value={opening.openingBgColor2 || '#E8857A'} onChange={(e) => update({ openingBgColor2: e.target.value })} className="modern-input" style={{ flex: 1 }} />
                </div>
                <div style={{ marginTop: 8, height: 32, borderRadius: 8, background: `linear-gradient(to right, ${opening.openingBgColor || '#F5E6A3'}, ${opening.openingBgColor2 || '#E8857A'})` }} />
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
