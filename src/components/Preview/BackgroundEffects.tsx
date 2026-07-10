import React from 'react';
import ReactDOM from 'react-dom';
import { ScrollRootContext } from './ScrollReveal';

interface BackgroundEffectsProps {
  effect?: string;
}

const BLOSSOM_PAL = [
  ['#FFF5F8', '#FFD0E4', '#F8A8C4'],
  ['#FFF8FA', '#FFE0EC', '#FFBCD4'],
  ['#FEF2F6', '#F8C4D8', '#EE90B4'],
] as const;

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ effect }) => {
  const uid = React.useMemo(() => Math.random().toString(36).slice(2, 7), []);
  const scrollRoot = React.useContext(ScrollRootContext);

  if (!effect || effect === 'none') return null;

  const fa = (base: string, dur: number, delay: number) =>
    `${base} ${dur.toFixed(1)}s cubic-bezier(0.45, 0, 0.55, 1) ${delay.toFixed(1)}s infinite`;

  const depthStyle = (): React.CSSProperties => {
    const depth = Math.random();
    const axis = Math.random() < 0.5 ? 'X' : 'Y';
    return {
      '--depth': depth.toFixed(2),
      '--depth-scale': (0.5 + depth * 0.8).toFixed(2),
      '--depth-opacity': (0.35 + depth * 0.65).toFixed(2),
      '--depth-blur': `${(2 - depth * 2).toFixed(2)}px`,
      '--rotate-x': axis === 'X' ? '360deg' : '0deg',
      '--rotate-y': axis === 'Y' ? '360deg' : '0deg',
      '--sway-x': `${(5 + Math.random() * 12).toFixed(1)}px`,
      '--wind': `${Math.round(200 + Math.random() * 200)}px`,
    } as React.CSSProperties;
  };

  // 낙하 파티클 시작 x: 왼쪽 편향(-5%~70%). --wind 바람 편류로 낙하하면서 우측으로 흘러 대각선 연출
  const lx = () => `${(Math.random() * 75 - 5).toFixed(1)}%`;

  let layer: React.ReactElement | null = null;

  switch (effect) {
    case 'cherry-blossom':
      layer = (
        <div className="effect-layer cherry-blossoms">
          {[...Array(34)].map((_, i) => {
            const gid = `${uid}bl${i}`;
            const [c0, c1, c2] = BLOSSOM_PAL[i % 3];
            const depth = 0.3 + Math.random() * 0.7;
            // 크기: 작은 것 위주(5-9px), 20% 확률로 큰 것(12-17px) 혼합
            const isLarge = Math.random() < 0.2;
            const w = isLarge ? Math.round(12 + Math.random() * 5) : Math.round(5 + Math.random() * 4);
            const h = Math.round(w * 1.35);
            const dur = (4 + Math.random() * 4).toFixed(1);
            const delay = (Math.random() * 7).toFixed(1);
            return (
              <div key={i} className="particle blossom" style={{
                // 시작점: 화면 전체에 분산(좌측 편향), top도 화면 전반에 걸쳐 랜덤
                top: `${(-5 + Math.random() * 80).toFixed(1)}%`,
                left: `${(-20 + Math.random() * 75).toFixed(1)}%`,
                animation: `blossom-wind-sweep ${dur}s linear ${delay}s infinite backwards`,
                '--bsc': (0.5 + depth * 0.65).toFixed(2),
                '--bop': (0.35 + depth * 0.5).toFixed(2),
                '--bbl': `${((1 - depth) * 1.5).toFixed(1)}px`,
                '--bsx': `${Math.round(3 + Math.random() * 8)}px`,
                '--wind': `${Math.round(200 + Math.random() * 180)}px`,  // 수평(우측) 이동 200-380px
                '--drop': `${Math.round(60 + Math.random() * 160)}px`,   // 수직(하향) 이동 60-220px
                '--r0': `${Math.round(Math.random() * 360)}deg`,
                '--dr': `${Math.round(80 + Math.random() * 200) * (Math.random() < 0.5 ? 1 : -1)}deg`,
              } as React.CSSProperties}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 26" width={w} height={h} style={{ display: 'block' }}>
                  <defs>
                    <radialGradient id={gid} cx="40%" cy="28%" r="66%">
                      <stop offset="0%" stopColor={c0}/>
                      <stop offset="52%" stopColor={c1}/>
                      <stop offset="100%" stopColor={c2}/>
                    </radialGradient>
                  </defs>
                  {/* 벚꽃 꽃잎: 위아래로 뾰족한 갸름한 잎 모양 */}
                  <path d="M10,0 C12.5,3.5 15,8.5 15,13 C15,17.5 12.5,22.5 10,26 C7.5,22.5 5,17.5 5,13 C5,8.5 7.5,3.5 10,0 Z" fill={`url(#${gid})`}/>
                </svg>
              </div>
            );
          })}
        </div>
      );
      break;

    case 'snow':
      layer = (
        <div className="effect-layer snow">
          {[...Array(60)].map((_, i) => (
            <div key={i} className="particle snowflake" style={{
              left: lx(),
              animation: fa('fall', 10 + Math.random() * 8, Math.random() * 12),
              ...depthStyle(),
            }} />
          ))}
        </div>
      );
      break;

    case 'stars':
      layer = (
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
      break;

    case 'leaves':
      layer = (
        <div className="effect-layer leaves">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="particle leaf" style={{
              left: lx(),
              animation: fa('fall-sway', 14 + Math.random() * 12, Math.random() * 14),
              ...depthStyle(),
            }} />
          ))}
        </div>
      );
      break;

    case 'hearts':
      layer = (
        <div className="effect-layer hearts">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="particle heart" style={{
              left: lx(),
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${12 + Math.random() * 10}s`,
              fontSize: `${8 + Math.random() * 10}px`,
              ...depthStyle(),
            }}>♥</div>
          ))}
        </div>
      );
      break;

    case 'firefly':
      layer = (
        <div className="effect-layer fireflies">
          {[...Array(40)].map((_, i) => (
            <div key={i} className="particle firefly" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }} />
          ))}
        </div>
      );
      break;

    case 'confetti':
      layer = (
        <div className="effect-layer confetti-layer">
          {[...Array(50)].map((_, i) => (
            <div key={i} className={`particle confetti c${(i % 5) + 1}`} style={{
              left: lx(),
              animation: fa('confetti-fall', 10 + Math.random() * 8, Math.random() * 12),
              ...depthStyle(),
            }} />
          ))}
        </div>
      );
      break;

    case 'petals':
      layer = (
        <div className="effect-layer petals-layer">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`particle petal p${(i % 3) + 1}`} style={{
              left: lx(),
              animation: fa('fall', 15 + Math.random() * 12, Math.random() * 14),
              ...depthStyle(),
            }} />
          ))}
        </div>
      );
      break;

    case 'autumn':
      layer = (
        <div className="effect-layer autumn-layer">
          {[...Array(22)].map((_, i) => (
            <div key={i} className={`particle autumn-leaf al${(i % 4) + 1}`} style={{
              left: lx(),
              animation: fa('fall-sway', 14 + Math.random() * 12, Math.random() * 14),
              ...depthStyle(),
            }} />
          ))}
        </div>
      );
      break;
  }

  if (!layer) return null;

  const innerLayer = React.cloneElement(layer, { style: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } });

  // ViewPage (scrollRoot===null): portal to body, truly viewport-fixed
  if (scrollRoot === null) {
    return ReactDOM.createPortal(
      <div style={{
        position: 'fixed', top: 0, bottom: 0,
        left: 'calc((100vw - min(100vw, 430px)) / 2)',
        width: 'min(100vw, 430px)',
        overflow: 'hidden', pointerEvents: 'none', zIndex: 1,
      }}>
        {innerLayer}
      </div>,
      document.body
    );
  }

  // 에디터/전체화면 미리보기: position:sticky + height:0 으로 스크롤 중에도 보이는 화면 상단에 고정
  // (music 버튼과 동일한 패턴. transform 컨테이너 내 position:fixed 는 스크롤과 함께 밀려 올라가는 브라우저 버그 우회)
  return (
    <div style={{
      position: 'sticky', top: 0,
      height: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 1,
    }}>
      <div style={{
        position: 'absolute', top: 0,
        left: 'calc((100% - min(100%, 430px)) / 2)',
        width: 'min(100%, 430px)',
        height: '100dvh',
        overflow: 'hidden', pointerEvents: 'none',
      }}>
        {innerLayer}
      </div>
    </div>
  );
};

export default React.memo(BackgroundEffects);
