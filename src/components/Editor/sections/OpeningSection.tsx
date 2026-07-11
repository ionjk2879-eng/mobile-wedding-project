import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { OpeningConfig } from '../../../types';

const GRADIENT_PRESETS = [
  { id: 'forest-sunset',  from: '#1A2E18', to: '#E8907A' },  // 포레스트 → 노을
  { id: 'navy-coral',     from: '#1F2937', to: '#E8857A' },  // 네이비 → 코랄
  { id: 'black-gold',     from: '#111111', to: '#B89050' },  // 블랙 → 샴페인 골드
  { id: 'black-rose',     from: '#0D0D0D', to: '#C04870' },  // 블랙 → 딥 로즈
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


const defaultOpening: OpeningConfig = {
  openingEnabled: false, openingStyle: 'curtain', openingColorMode: 'theme',
  openingBgColor: '#1F2937', openingBgOpacity: 0.95, openingText: '', openingSubText: '',
};

const OpeningSection: React.FC = () => {
  const opening = useInvitationStore((s) => s.data.opening) || defaultOpening;
  const updateField = useInvitationStore((s) => s.updateField);
  const triggerOpeningPreview = useInvitationStore((s) => s.triggerOpeningPreview);

  const update = (partial: Partial<OpeningConfig>) => {
    updateField('opening', { ...opening, ...partial });
  };

  return (
    <>
      <div className="input-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label className="modern-checkbox" style={{ flex: 1 }}>
            <input type="checkbox" checked={opening.openingEnabled} onChange={(e) => update({ openingEnabled: e.target.checked })} />
            <span>오프닝 애니메이션 활성화</span>
          </label>
          <button
            type="button"
            onClick={triggerOpeningPreview}
            style={{
              padding: '6px 14px',
              border: '1px solid #D4A5C6',
              borderRadius: 8,
              background: 'white',
              color: '#B07A8E',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              letterSpacing: '0.3px',
            }}
          >
            ▶ 미리보기
          </button>
        </div>
      </div>

      {opening.openingEnabled && (
        <>
          <div className="opt-inline-group">
            <label className="opt-inline-label">내용 연출</label>
            <div className="account-style-grid">
              {([
                { key: 'sequential' as const, name: '순차 등장' },
                { key: 'typing' as const, name: '타이핑' },
                { key: 'lines' as const, name: '줄 단위 등장' },
                { key: 'flip' as const, name: '플립 등장' },
              ]).map(s => (
                <button key={s.key} type="button"
                  className={`account-style-btn ${(opening.openingContentStyle || 'sequential') === s.key ? 'active' : ''}`}
                  onClick={() => update({ openingContentStyle: s.key })}>
                  <strong>{s.name}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="opt-inline-group">
            <label className="opt-inline-label">전환 스타일</label>
            <div className="account-style-grid">
              {([
                { key: 'curtain' as const, name: '커튼' },
                { key: 'circle' as const, name: '원형 확산' },
                { key: 'veil' as const, name: '베일 드롭' },
                { key: 'blind' as const, name: '블라인드' },
                { key: 'frame' as const, name: '투명 액자' },
                { key: 'insta' as const, name: '인스타그램' },
              ]).map(s => (
                <button key={s.key} type="button"
                  className={`account-style-btn ${(opening.openingStyle === 'typing' ? 'curtain' : opening.openingStyle) === s.key ? 'active' : ''}`}
                  onClick={() => update({ openingStyle: s.key })}>
                  <strong>{s.name}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="opt-inline-group">
            <label className="opt-inline-label">배경색</label>
            <div className="account-style-grid">
              <button type="button" className={`account-style-btn ${opening.openingColorMode === 'theme' ? 'active' : ''}`} onClick={() => update({ openingColorMode: 'theme' })}>
                <strong>테마 색상</strong>
              </button>
              <button type="button" className={`account-style-btn ${opening.openingColorMode === 'custom' ? 'active' : ''}`} onClick={() => update({ openingColorMode: 'custom' })}>
                <strong>단색</strong>
              </button>
              <button type="button" className={`account-style-btn ${opening.openingColorMode === 'gradient' ? 'active' : ''}`} onClick={() => update({ openingColorMode: 'gradient', openingGradientMode: opening.openingGradientMode || 'theme' })}>
                <strong>그라데이션</strong>
              </button>
            </div>
          </div>

          <div className="opt-inline-group">
            <label className="opt-inline-label">글자 색상</label>
            <div className="account-style-grid">
              <button type="button"
                className={`account-style-btn ${!opening.openingTextColor ? 'active' : ''}`}
                onClick={() => update({ openingTextColor: undefined })}
              >
                <strong>자동</strong>
              </button>
              <button type="button"
                className={`account-style-btn ${opening.openingTextColor === 'white' ? 'active' : ''}`}
                style={{ alignItems: 'center', textAlign: 'center' }}
                onClick={() => update({ openingTextColor: 'white' })}
              >
                <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', border: '1px solid #E5E7EB', display: 'inline-block', flexShrink: 0 }} />
                  흰색
                </strong>
              </button>
              <button type="button"
                className={`account-style-btn ${opening.openingTextColor === 'dark' ? 'active' : ''}`}
                style={{ alignItems: 'center', textAlign: 'center' }}
                onClick={() => update({ openingTextColor: 'dark' })}
              >
                <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#1C1414', border: '1px solid #E5E7EB', display: 'inline-block', flexShrink: 0 }} />
                  검정
                </strong>
              </button>
            </div>
          </div>

          {opening.openingColorMode === 'gradient' && (
            <div className="opt-inline-group" style={{ marginTop: -8 }}>
              <label className="opt-inline-label">그라데이션 색상</label>
              <div className="account-style-grid">
                <button type="button"
                  className={`account-style-btn ${(!opening.openingGradientMode || opening.openingGradientMode === 'theme') ? 'active' : ''}`}
                  onClick={() => update({ openingGradientMode: 'theme' })}
                >
                  <strong>테마 자동</strong>
                </button>
                <button type="button"
                  className={`account-style-btn ${opening.openingGradientMode === 'preset' ? 'active' : ''}`}
                  onClick={() => update({ openingGradientMode: 'preset' })}
                >
                  <strong>프리셋</strong>
                </button>
                <button type="button"
                  className={`account-style-btn ${opening.openingGradientMode === 'custom' ? 'active' : ''}`}
                  onClick={() => update({ openingGradientMode: 'custom' })}
                >
                  <strong>직접 지정</strong>
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

          <div className="opt-inline-group">
            <label className="opt-inline-label">배경 불투명도</label>
            <div className="opt-inline-content" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="range" min="0.3" max="1" step="0.01" value={opening.openingBgOpacity} onChange={(e) => update({ openingBgOpacity: parseFloat(e.target.value) })} style={{ flex: 1 }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', minWidth: 34, textAlign: 'right', flexShrink: 0 }}>{Math.round(opening.openingBgOpacity * 100)}%</span>
            </div>
          </div>

          <div className="opt-inline-group">
            <label className="opt-inline-label">장식 효과</label>
            <div className="account-style-grid">
              {([
                { key: 'none'          as const, name: '없음' },
                { key: 'dots'          as const, name: '떠다니는 점' },
                { key: 'ripple'        as const, name: '원형 파동' },
                { key: 'sparkle'       as const, name: '반짝이' },
                { key: 'bokeh'         as const, name: '빛망울' },
                { key: 'aurora'        as const, name: '오로라' },
                { key: 'firefly'       as const, name: '반딧불' },
                { key: 'petal'         as const, name: '꽃비' },
                { key: 'aurora-bokeh'  as const, name: '오로라+빛망울' },
                { key: 'firefly-petal' as const, name: '반딧불+꽃비' },
              ]).map(e => (
                <button key={e.key} type="button"
                  className={`account-style-btn ${(opening.openingDecoEffect || 'none') === e.key ? 'active' : ''}`}
                  onClick={() => update({ openingDecoEffect: e.key })}>
                  <strong>{e.name}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="opt-inline-group">
            <label className="opt-inline-label">오프닝 패턴</label>
            <div className="account-style-grid">
              {(() => {
                const raw = opening.openingBgPattern;
                const selected: string[] = Array.isArray(raw) ? raw.filter(p => p !== 'none') : (raw && raw !== 'none') ? [raw] : [];
                const toggle = (key: string) => {
                  if (key === 'none') { update({ openingBgPattern: [] }); return; }
                  const next = selected.includes(key)
                    ? selected.filter(p => p !== key)
                    : selected.length >= 2 ? [selected[1], key] : [...selected, key];
                  update({ openingBgPattern: next });
                };
                return ([
                  { key: 'none',  name: '없음' },
                  { key: 'dots',  name: '미세 도트' },
                  { key: 'wave',  name: '웨이브' },
                  { key: 'frame', name: '이중 테두리' },
                  { key: 'grain', name: '그레인 노이즈' },
                  { key: 'letter', name: '편지 봉투' },
                ] as const).map(p => (
                  <button key={p.key} type="button"
                    className={`account-style-btn ${p.key === 'none' ? (selected.length === 0 ? 'active' : '') : selected.includes(p.key) ? 'active' : ''}`}
                    onClick={() => toggle(p.key)}>
                    <strong>{p.name}</strong>
                  </button>
                ));
              })()}
            </div>
          </div>

          <div className="opt-inline-group">
            <label className="opt-inline-label">멘트 폰트 스타일</label>
            <div className="account-style-grid">
              {([
                { key: 'elegant' as const, name: '세련됨' },
                { key: 'simple' as const, name: '심플함' },
                { key: 'clean' as const, name: '깔끔함' },
              ]).map(s => (
                <button key={s.key} type="button" className={`account-style-btn ${(opening.openingFontStyle || 'elegant') === s.key ? 'active' : ''}`} onClick={() => update({ openingFontStyle: s.key })}>
                  <strong>{s.name}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="opt-inline-group">
            <label className="opt-inline-label">메인 멘트</label>
            <div className="opt-inline-content" style={{ padding: '10px 14px', borderRadius: 10, background: '#F9F5FF', border: '1px solid #E8D8F0', fontSize: '0.8rem', color: '#7A5A8A', lineHeight: 1.6, boxSizing: 'border-box' }}>
              <strong style={{ display: 'block', marginBottom: 4, color: '#6A4A7A' }}>방문자 유형에 따라 자동 설정됩니다</strong>
              하객 링크로 방문 시 → 이름·관계에 맞는 개인화 문구<br />
              일반 링크로 방문 시 → 랜덤 감성 문구 중 하나
            </div>
          </div>

          <div className="opt-inline-group">
            <label className="opt-inline-label">서브 멘트</label>
            <div className="opt-inline-content">
              <input type="text" value={opening.openingSubText} onChange={(e) => update({ openingSubText: e.target.value })} className="modern-input" placeholder="2026. 10. 24" />
              <span className="input-hint">비워두면 예식 날짜가 자동으로 표시됩니다. 예식장 이름은 날짜 아래에 자동으로 추가됩니다.</span>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default OpeningSection;
