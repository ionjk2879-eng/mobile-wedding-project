import React from 'react';

interface BackgroundEffectsProps {
  effect?: string;
}

const BLOSSOM_PAL = [
  ['#FFF0F5', '#FFCAD8', '#FF90B8'],
  ['#FFF5F8', '#FFD8E4', '#FFB0CC'],
  ['#FFEEF5', '#FFB8D0', '#FF80A8'],
] as const;

const ROSE_PAL = [
  ['#FFF0F2', '#F8B0C0', '#D04878'],
  ['#FFF5F2', '#F8C0A8', '#C86050'],
  ['#FFF0F8', '#EEBBD0', '#B05070'],
] as const;

const MAGNOLIA_PAL = [
  ['#FEFAF5', '#F5E8D0', '#D8C0A0'],
  ['#FEF5F8', '#F0D8E0', '#D0B0B8'],
  ['#FEFAFA', '#EEE0E0', '#D0B8B8'],
] as const;

const BOKEH_PAL = [
  ['rgba(255,248,220,0.95)', 'rgba(255,222,140,0.45)', 'rgba(255,198,75,0)'],
  ['rgba(255,248,252,0.92)', 'rgba(255,215,225,0.38)', 'rgba(230,163,172,0)'],
  ['rgba(252,248,255,0.92)', 'rgba(215,210,255,0.35)', 'rgba(168,158,228,0)'],
  ['rgba(255,252,245,0.95)', 'rgba(240,225,200,0.42)', 'rgba(210,183,152,0)'],
] as const;

const GOLD = ['#F8E890', '#C89818', '#F0D060'] as const;
const SILVER = ['#F0F0F0', '#B8B8B8', '#E8E8E8'] as const;
const ROSE_GOLD = ['#F8D8C8', '#C08860', '#F0C0A8'] as const;

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ effect }) => {
  const uid = React.useMemo(() => Math.random().toString(36).slice(2, 7), []);

  if (!effect || effect === 'none') return null;

  const anim = (name: string, dur: number, delay: number) =>
    `${name} ${dur.toFixed(1)}s linear ${delay.toFixed(1)}s infinite`;

  // 낙하 파티클 시작 x: 왼쪽 편향 (-10%~65%). 바람이 오른쪽으로 밀어 대각선 궤적.
  const lx = () => `${(Math.random() * 75 - 10).toFixed(1)}%`;

  // --wd: 항상 양수(오른쪽) 20~85px → 떨어지면서 자연스럽게 우측으로 흘러감
  const ps = (noFlip = false): React.CSSProperties => {
    const depth = Math.random();
    const sway = Math.round(8 + Math.random() * 20);
    const wd = Math.round(20 + Math.random() * 65);   // +20~+85, 오른쪽 방향 고정
    const rotation = Math.round(100 + Math.random() * 260) * (Math.random() < 0.5 ? 1 : -1);
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
          {[...Array(28)].map((_, i) => {
            const gid = `${uid}bp${i}`;
            const [c0, c1, c2] = BLOSSOM_PAL[i % 3];
            return (
              <div key={i} className="particle blossom" style={{
                left: lx(),
                animation: anim('fall-natural', 26 + Math.random() * 18, Math.random() * 24),
                ...ps(),
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 28" width="16" height="20" style={{ display: 'block' }}>
                  <defs>
                    <radialGradient id={gid} cx="42%" cy="28%" r="68%">
                      <stop offset="0%" stopColor={c0}/><stop offset="50%" stopColor={c1}/><stop offset="100%" stopColor={c2}/>
                    </radialGradient>
                  </defs>
                  <path d="M11,27 C4,25 0,20 0,14 C0,7 5,1 11,1 C17,1 22,7 22,14 C22,20 18,25 11,27 Z" fill={`url(#${gid})`}/>
                </svg>
              </div>
            );
          })}
        </div>
      );

    case 'snow':
      return (
        <div className="effect-layer snow">
          {[...Array(45)].map((_, i) => (
            <div key={i} className="particle snowflake" style={{
              left: lx(),
              animation: anim('fall-natural', 14 + Math.random() * 10, Math.random() * 16),
              ...ps(true),
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="13" height="13" style={{ display: 'block' }}>
                <g stroke="#C8E8FF" strokeLinecap="round" fill="none">
                  <line x1="50" y1="50" x2="50" y2="12" strokeWidth="5.5"/>
                  <line x1="50" y1="50" x2="83" y2="31" strokeWidth="5.5"/>
                  <line x1="50" y1="50" x2="83" y2="69" strokeWidth="5.5"/>
                  <line x1="50" y1="50" x2="50" y2="88" strokeWidth="5.5"/>
                  <line x1="50" y1="50" x2="17" y2="69" strokeWidth="5.5"/>
                  <line x1="50" y1="50" x2="17" y2="31" strokeWidth="5.5"/>
                  <line x1="50" y1="35" x2="59" y2="35" strokeWidth="3"/><line x1="50" y1="35" x2="41" y2="35" strokeWidth="3"/>
                  <line x1="63" y1="42" x2="68" y2="50" strokeWidth="3"/><line x1="63" y1="42" x2="58" y2="34" strokeWidth="3"/>
                  <line x1="63" y1="58" x2="58" y2="66" strokeWidth="3"/><line x1="63" y1="58" x2="68" y2="50" strokeWidth="3"/>
                  <line x1="50" y1="65" x2="59" y2="65" strokeWidth="3"/><line x1="50" y1="65" x2="41" y2="65" strokeWidth="3"/>
                  <line x1="37" y1="58" x2="33" y2="50" strokeWidth="3"/><line x1="37" y1="58" x2="42" y2="66" strokeWidth="3"/>
                  <line x1="37" y1="42" x2="42" y2="34" strokeWidth="3"/><line x1="37" y1="42" x2="33" y2="50" strokeWidth="3"/>
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
          {[...Array(40)].map((_, i) => {
            const sz = 4 + (i % 4) * 2;
            return (
              <div key={i} className="particle star" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationName: 'twinkle',
                animationDuration: `${1.5 + Math.random() * 3}s`,
                animationDelay: `${Math.random() * 6}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
              }}>
                {/* 4포인트 글린트: 빛 반사 느낌의 날카로운 별 */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={sz} height={sz} style={{ display: 'block' }}>
                  <path d="M12,1 L13.8,10.2 L23,12 L13.8,13.8 L12,23 L10.2,13.8 L1,12 L10.2,10.2 Z"
                        fill="rgba(255,255,255,0.88)"/>
                </svg>
              </div>
            );
          })}
        </div>
      );

    case 'leaves':
      return (
        <div className="effect-layer rose-petals-layer">
          {[...Array(22)].map((_, i) => {
            const gid = `${uid}rp${i}`;
            const [c0, c1, c2] = ROSE_PAL[i % 3];
            return (
              <div key={i} className="particle rose-petal" style={{
                left: lx(),
                animation: anim('fall-natural', 22 + Math.random() * 14, Math.random() * 20),
                ...ps(),
              }}>
                {/* 장미꽃잎: 가로가 넓은 타원 — 벚꽃잎보다 둥글고 납작한 비율 */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20" width="19" height="14" style={{ display: 'block' }}>
                  <defs>
                    <radialGradient id={gid} cx="44%" cy="30%" r="65%">
                      <stop offset="0%" stopColor={c0}/><stop offset="48%" stopColor={c1}/><stop offset="100%" stopColor={c2}/>
                    </radialGradient>
                  </defs>
                  <path d="M13,19 C5,17 0,13 0,9 C0,4 5,0 13,0 C21,0 26,4 26,9 C26,13 21,17 13,19 Z"
                        fill={`url(#${gid})`}/>
                </svg>
              </div>
            );
          })}
        </div>
      );

    case 'hearts':
      return (
        <div className="effect-layer bokeh-layer">
          {[...Array(20)].map((_, i) => {
            const gid = `${uid}bk${i}`;
            const sz = [8, 12, 18, 22, 10, 16, 14, 20, 9, 15][i % 10];
            const [inner, mid, outer] = BOKEH_PAL[i % 4];
            return (
              <div key={i} className="particle bokeh" style={{
                left: lx(),
                animation: `float-up ${22 + Math.random() * 16}s linear ${Math.random() * 18}s infinite`,
                '--ds': (0.55 + Math.random() * 0.8).toFixed(2),
                '--do': (0.35 + Math.random() * 0.5).toFixed(2),
                '--db': '0px',
                '--wd': `${Math.round(15 + Math.random() * 55)}px`,
              } as React.CSSProperties}>
                {/* 소프트 보케 광원: 방사형 그라디언트 원 */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width={sz} height={sz} style={{ display: 'block' }}>
                  <defs>
                    <radialGradient id={gid} cx="50%" cy="42%" r="50%">
                      <stop offset="0%" stopColor={inner}/><stop offset="58%" stopColor={mid}/><stop offset="100%" stopColor={outer}/>
                    </radialGradient>
                  </defs>
                  <circle cx="10" cy="10" r="9.5" fill={`url(#${gid})`}/>
                </svg>
              </div>
            );
          })}
        </div>
      );

    case 'firefly':
      return (
        <div className="effect-layer fireflies">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="particle firefly" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }} />
          ))}
        </div>
      );

    case 'confetti': {
      const TYPES = ['strip', 'diamond', 'dot'] as const;
      return (
        <div className="effect-layer shimmer-layer">
          {[...Array(38)].map((_, i) => {
            const gid = `${uid}sh${i}`;
            const t = TYPES[i % 3];
            const [g0, g1, g2] = t === 'strip' ? GOLD : t === 'diamond' ? SILVER : ROSE_GOLD;
            return (
              <div key={i} className="particle shimmer" style={{
                left: lx(),
                animation: anim('fall-natural', 12 + Math.random() * 10, Math.random() * 14),
                ...ps(),
              }}>
                {t === 'strip' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 12" width="3" height="10" style={{ display: 'block' }}>
                    <defs><linearGradient id={gid} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={g0}/><stop offset="50%" stopColor={g1}/><stop offset="100%" stopColor={g2}/>
                    </linearGradient></defs>
                    <rect width="4" height="12" rx="2" fill={`url(#${gid})`}/>
                  </svg>
                )}
                {t === 'diamond' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="8" height="8" style={{ display: 'block' }}>
                    <defs><linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={g0}/><stop offset="50%" stopColor={g1}/><stop offset="100%" stopColor={g2}/>
                    </linearGradient></defs>
                    <path d="M6,0 L12,6 L6,12 L0,6 Z" fill={`url(#${gid})`}/>
                  </svg>
                )}
                {t === 'dot' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="7" height="7" style={{ display: 'block' }}>
                    <defs><radialGradient id={gid} cx="38%" cy="35%" r="60%">
                      <stop offset="0%" stopColor={g0}/><stop offset="55%" stopColor={g1}/><stop offset="100%" stopColor={g2}/>
                    </radialGradient></defs>
                    <circle cx="5" cy="5" r="4.5" fill={`url(#${gid})`}/>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    case 'petals':
      return (
        <div className="effect-layer magnolia-layer">
          {[...Array(22)].map((_, i) => {
            const gid = `${uid}mg${i}`;
            const [c0, c1, c2] = MAGNOLIA_PAL[i % 3];
            return (
              <div key={i} className="particle magnolia" style={{
                left: lx(),
                animation: anim('fall-natural', 28 + Math.random() * 16, Math.random() * 24),
                ...ps(),
              }}>
                {/* 목련꽃잎: 길쭉한 타원, 아이보리 크림 계열 */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 30" width="13" height="22" style={{ display: 'block' }}>
                  <defs>
                    <radialGradient id={gid} cx="40%" cy="25%" r="70%">
                      <stop offset="0%" stopColor={c0}/><stop offset="52%" stopColor={c1}/><stop offset="100%" stopColor={c2}/>
                    </radialGradient>
                  </defs>
                  <path d="M9,29 C3,27 0,21 0,15 C0,8 4,1 9,1 C14,1 18,8 18,15 C18,21 15,27 9,29 Z"
                        fill={`url(#${gid})`}/>
                </svg>
              </div>
            );
          })}
        </div>
      );

    case 'autumn':
      return (
        <div className="effect-layer autumn-layer">
          {[...Array(16)].map((_, i) => (
            <div key={i} className={`particle autumn-leaf al${(i % 4) + 1}`} style={{
              left: lx(),
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
