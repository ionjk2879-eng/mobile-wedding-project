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
      '--sway-x': `${(20 + Math.random() * 30).toFixed(1)}px`,
    } as React.CSSProperties;
  };

  if (effect === 'cherry-blossom') {
    const layer = (
      <div className="effect-layer cherry-blossoms">
        {[...Array(22)].map((_, i) => {
          const gid = `${uid}bl${i}`;
          const [c0, c1, c2] = BLOSSOM_PAL[i % 3];
          const depth = 0.35 + Math.random() * 0.65;
          const w = Math.round(8 + Math.random() * 5);
          const h = Math.round(w * (1.25 + Math.random() * 0.2));
          return (
            <div key={i} className="particle blossom" style={{
              left: `${(Math.random() * 108 - 4).toFixed(1)}%`,
              animation: `blossom-fall ${(20 + Math.random() * 14).toFixed(1)}s linear ${(Math.random() * 22).toFixed(1)}s infinite`,
              '--bsc': (0.5 + depth * 0.65).toFixed(2),
              '--bop': (0.42 + depth * 0.48).toFixed(2),
              '--bbl': `${((1 - depth) * 1.2).toFixed(1)}px`,
              '--bsx': `${Math.round(10 + Math.random() * 20)}px`,
              '--bdr': `${Math.round(60 + Math.random() * 220) * (Math.random() < 0.5 ? 1 : -1)}deg`,
            } as React.CSSProperties}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 24" width={w} height={h} style={{ display: 'block' }}>
                <defs>
                  <radialGradient id={gid} cx="40%" cy="28%" r="66%">
                    <stop offset="0%" stopColor={c0}/>
                    <stop offset="52%" stopColor={c1}/>
                    <stop offset="100%" stopColor={c2}/>
                  </radialGradient>
                </defs>
                <path d="M10,23 C4,21 0,17 0,12 C0,6 4,0 10,0 C16,0 20,6 20,12 C20,17 16,21 10,23 Z"
                      fill={`url(#${gid})`}/>
              </svg>
            </div>
          );
        })}
      </div>
    );
    if (scrollRoot === null) return ReactDOM.createPortal(layer, document.body);
    return layer;
  }

  switch (effect) {
    case 'cherry-blossom':
      return null; // 위에서 처리됨
    case 'snow':
      return (
        <div className="effect-layer snow">
          {[...Array(60)].map((_, i) => (
            <div key={i} className="particle snowflake" style={{
              left: `${Math.random() * 100}%`,
              animation: fa('fall', 10 + Math.random() * 8, Math.random() * 12),
              ...depthStyle(),
            }} />
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
          {[...Array(25)].map((_, i) => (
            <div key={i} className="particle leaf" style={{
              left: `${Math.random() * 100}%`,
              animation: fa('fall-sway', 14 + Math.random() * 12, Math.random() * 14),
              ...depthStyle(),
            }} />
          ))}
        </div>
      );
    case 'hearts':
      return (
        <div className="effect-layer hearts">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="particle heart" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${12 + Math.random() * 10}s`,
              fontSize: `${8 + Math.random() * 10}px`,
              ...depthStyle(),
            }}>♥</div>
          ))}
        </div>
      );
    case 'firefly':
      return (
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
    case 'confetti':
      return (
        <div className="effect-layer confetti-layer">
          {[...Array(50)].map((_, i) => (
            <div key={i} className={`particle confetti c${(i % 5) + 1}`} style={{
              left: `${Math.random() * 100}%`,
              animation: fa('confetti-fall', 10 + Math.random() * 8, Math.random() * 12),
              ...depthStyle(),
            }} />
          ))}
        </div>
      );
    case 'petals':
      return (
        <div className="effect-layer petals-layer">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`particle petal p${(i % 3) + 1}`} style={{
              left: `${Math.random() * 100}%`,
              animation: fa('fall', 15 + Math.random() * 12, Math.random() * 14),
              ...depthStyle(),
            }} />
          ))}
        </div>
      );
    case 'autumn':
      return (
        <div className="effect-layer autumn-layer">
          {[...Array(22)].map((_, i) => (
            <div key={i} className={`particle autumn-leaf al${(i % 4) + 1}`} style={{
              left: `${Math.random() * 100}%`,
              animation: fa('fall-sway', 14 + Math.random() * 12, Math.random() * 14),
              ...depthStyle(),
            }} />
          ))}
        </div>
      );
    default:
      return null;
  }
};

export default React.memo(BackgroundEffects);
