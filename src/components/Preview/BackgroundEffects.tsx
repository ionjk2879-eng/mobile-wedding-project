import React from 'react';

interface BackgroundEffectsProps {
  effect?: string;
}

// 벚꽃잎 그라디언트 팔레트 — 밝은 핑크~진한 핑크 3종 순환
const BLOSSOM_PALETTES = [
  ['#FFF0F5', '#FFCAD8', '#FF90B8'],
  ['#FFF5F8', '#FFD8E4', '#FFB0CC'],
  ['#FFEEF5', '#FFB8D0', '#FF80A8'],
] as const;

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ effect }) => {
  // SVG gradient id 충돌 방지 — 다중 인스턴스(에디터 프리뷰 + ViewPage) 대응
  const uid = React.useMemo(() => Math.random().toString(36).slice(2, 7), []);

  if (!effect || effect === 'none') return null;

  const anim = (name: string, dur: number, delay: number) =>
    `${name} ${dur.toFixed(1)}s linear ${delay.toFixed(1)}s infinite`;

  // depth 0=멀리(작고 흐림), 1=가까이(크고 선명)
  // --wd(wind drift): 낙하하면서 바람에 밀리는 전체 수평 이동량. 파티클마다 방향/크기가 달라
  //   가벼운 난류처럼 보인다. scaleX 플립(--fa/--fb)으로 자연스러운 텀블링 표현.
  const ps = (noFlip = false): React.CSSProperties => {
    const depth = Math.random();
    const sway = Math.round(12 + Math.random() * 28);
    const wd = Math.round(-55 + Math.random() * 110);
    const rotation = Math.round(120 + Math.random() * 280) * (Math.random() < 0.5 ? 1 : -1);
    const flipA = noFlip ? 1 : parseFloat((0.08 + Math.random() * 0.22).toFixed(2));
    const flipB = noFlip ? 1 : parseFloat((0.12 + Math.random() * 0.2).toFixed(2));
    return {
      '--ds': (0.32 + depth * 1.05).toFixed(2),
      '--do': (0.18 + depth * 0.82).toFixed(2),
      '--db': `${((1 - depth) * 2.0).toFixed(1)}px`,
      '--sx': `${sway}px`,
      '--wd': `${wd}px`,
      '--dr': `${rotation}deg`,
      '--fa': `${flipA}`,
      '--fb': `${flipB}`,
    } as React.CSSProperties;
  };

  switch (effect) {
    case 'cherry-blossom':
      return (
        <div className="effect-layer cherry-blossoms">
          {[...Array(33)].map((_, i) => {
            const gid = `${uid}bp${i}`;
            const [c0, c1, c2] = BLOSSOM_PALETTES[i % 3];
            return (
              <div key={i} className="particle blossom" style={{
                left: `${Math.random() * 100}%`,
                animation: anim('fall-natural', 26 + Math.random() * 18, Math.random() * 24),
                ...ps(),
              }}>
                {/* 벚꽃 한 장: 자연스러운 타원형 꽃잎 패스 + 방사형 그라디언트 */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 28" width="16" height="20" style={{ display: 'block' }}>
                  <defs>
                    <radialGradient id={gid} cx="42%" cy="28%" r="68%">
                      <stop offset="0%" stopColor={c0}/>
                      <stop offset="50%" stopColor={c1}/>
                      <stop offset="100%" stopColor={c2}/>
                    </radialGradient>
                  </defs>
                  <path
                    d="M11,27 C4,25 0,20 0,14 C0,7 5,1 11,1 C17,1 22,7 22,14 C22,20 18,25 11,27 Z"
                    fill={`url(#${gid})`}
                  />
                </svg>
              </div>
            );
          })}
        </div>
      );
    case 'snow':
      return (
        <div className="effect-layer snow">
          {[...Array(55)].map((_, i) => (
            <div key={i} className="particle snowflake" style={{
              left: `${Math.random() * 100}%`,
              animation: anim('fall-natural', 14 + Math.random() * 10, Math.random() * 16),
              ...ps(true),
            }}>
              {/* 6각 결정 눈송이: 팔 6개 + 각 팔 40% 지점 가지 2개씩 */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="14" height="14" style={{ display: 'block' }}>
                <g stroke="#C8E8FF" strokeLinecap="round" fill="none">
                  <line x1="50" y1="50" x2="50" y2="12" strokeWidth="5.5"/>
                  <line x1="50" y1="50" x2="83" y2="31" strokeWidth="5.5"/>
                  <line x1="50" y1="50" x2="83" y2="69" strokeWidth="5.5"/>
                  <line x1="50" y1="50" x2="50" y2="88" strokeWidth="5.5"/>
                  <line x1="50" y1="50" x2="17" y2="69" strokeWidth="5.5"/>
                  <line x1="50" y1="50" x2="17" y2="31" strokeWidth="5.5"/>
                  <line x1="50" y1="35" x2="59" y2="35" strokeWidth="3"/>
                  <line x1="50" y1="35" x2="41" y2="35" strokeWidth="3"/>
                  <line x1="63" y1="42" x2="68" y2="50" strokeWidth="3"/>
                  <line x1="63" y1="42" x2="58" y2="34" strokeWidth="3"/>
                  <line x1="63" y1="58" x2="58" y2="66" strokeWidth="3"/>
                  <line x1="63" y1="58" x2="68" y2="50" strokeWidth="3"/>
                  <line x1="50" y1="65" x2="59" y2="65" strokeWidth="3"/>
                  <line x1="50" y1="65" x2="41" y2="65" strokeWidth="3"/>
                  <line x1="37" y1="58" x2="33" y2="50" strokeWidth="3"/>
                  <line x1="37" y1="58" x2="42" y2="66" strokeWidth="3"/>
                  <line x1="37" y1="42" x2="42" y2="34" strokeWidth="3"/>
                  <line x1="37" y1="42" x2="33" y2="50" strokeWidth="3"/>
                  <circle cx="50" cy="50" r="5" fill="#D8F0FF" stroke="none"/>
                  <circle cx="50" cy="12" r="3.5" fill="#D8F0FF" stroke="none"/>
                  <circle cx="83" cy="31" r="3.5" fill="#D8F0FF" stroke="none"/>
                  <circle cx="83" cy="69" r="3.5" fill="#D8F0FF" stroke="none"/>
                  <circle cx="50" cy="88" r="3.5" fill="#D8F0FF" stroke="none"/>
                  <circle cx="17" cy="69" r="3.5" fill="#D8F0FF" stroke="none"/>
                  <circle cx="17" cy="31" r="3.5" fill="#D8F0FF" stroke="none"/>
                </g>
              </svg>
            </div>
          ))}
        </div>
      );
    case 'stars':
      return (
        <div className="effect-layer stars">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="particle star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }} />
          ))}
        </div>
      );
    case 'leaves':
      return (
        <div className="effect-layer leaves">
          {[...Array(22)].map((_, i) => (
            <div key={i} className="particle leaf" style={{
              left: `${Math.random() * 100}%`,
              animation: anim('fall-leaf', 24 + Math.random() * 14, Math.random() * 22),
              ...ps(),
            }} />
          ))}
        </div>
      );
    case 'hearts':
      return (
        <div className="effect-layer hearts">
          {[...Array(22)].map((_, i) => (
            <div key={i} className="particle heart" style={{
              left: `${Math.random() * 100}%`,
              animation: anim('float-up', 18 + Math.random() * 14, Math.random() * 20),
              fontSize: `${9 + Math.random() * 9}px`,
              ...ps(true),
            }}>♥</div>
          ))}
        </div>
      );
    case 'firefly':
      return (
        <div className="effect-layer fireflies">
          {[...Array(38)].map((_, i) => (
            <div key={i} className="particle firefly" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }} />
          ))}
        </div>
      );
    case 'confetti':
      return (
        <div className="effect-layer confetti-layer">
          {[...Array(45)].map((_, i) => (
            <div key={i} className={`particle confetti c${(i % 5) + 1}`} style={{
              left: `${Math.random() * 100}%`,
              animation: anim('fall-natural', 15 + Math.random() * 10, Math.random() * 18),
              ...ps(),
            }} />
          ))}
        </div>
      );
    case 'petals':
      return (
        <div className="effect-layer petals-layer">
          {[...Array(28)].map((_, i) => (
            <div key={i} className={`particle petal p${(i % 3) + 1}`} style={{
              left: `${Math.random() * 100}%`,
              animation: anim('fall-natural', 26 + Math.random() * 16, Math.random() * 24),
              ...ps(),
            }} />
          ))}
        </div>
      );
    case 'autumn':
      return (
        <div className="effect-layer autumn-layer">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle autumn-leaf al${(i % 4) + 1}`} style={{
              left: `${Math.random() * 100}%`,
              animation: anim('fall-leaf', 22 + Math.random() * 14, Math.random() * 22),
              ...ps(),
            }} />
          ))}
        </div>
      );
    default:
      return null;
  }
};

export default React.memo(BackgroundEffects);
