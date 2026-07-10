import React from 'react';

interface BackgroundEffectsProps {
  effect?: string;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ effect }) => {
  if (!effect || effect === 'none') return null;

  const fa = (name: string, dur: number, delay: number) =>
    `${name} ${dur.toFixed(1)}s linear ${delay.toFixed(1)}s infinite`;

  // depth 0=멀리(작고 흐림), 1=가까이(크고 선명)
  // --wd(wind drift): 낙하하면서 바람에 밀리는 전체 수평 이동량. 파티클마다 방향/크기가 달라
  //   가벼운 난류처럼 보인다. scaleX 플립(--fa/--fb)으로 자연스러운 텀블링 표현.
  const ps = (noFlip = false): React.CSSProperties => {
    const depth = Math.random();
    const sway = Math.round(12 + Math.random() * 28);
    const wd = Math.round(-55 + Math.random() * 110);
    const rotation = Math.round(120 + Math.random() * 280) * (Math.random() < 0.5 ? 1 : -1);
    const fa = noFlip ? 1 : parseFloat((0.08 + Math.random() * 0.22).toFixed(2));
    const fb = noFlip ? 1 : parseFloat((0.12 + Math.random() * 0.2).toFixed(2));
    return {
      '--ds': (0.32 + depth * 1.05).toFixed(2),
      '--do': (0.18 + depth * 0.82).toFixed(2),
      '--db': `${((1 - depth) * 2.0).toFixed(1)}px`,
      '--sx': `${sway}px`,
      '--wd': `${wd}px`,
      '--dr': `${rotation}deg`,
      '--fa': `${fa}`,
      '--fb': `${fb}`,
    } as React.CSSProperties;
  };

  switch (effect) {
    case 'cherry-blossom':
      return (
        <div className="effect-layer cherry-blossoms">
          {[...Array(33)].map((_, i) => (
            <div key={i} className="particle blossom" style={{
              left: `${Math.random() * 100}%`,
              animation: fa('fall-natural', 26 + Math.random() * 18, Math.random() * 24),
              ...ps(),
            }} />
          ))}
        </div>
      );
    case 'snow':
      return (
        <div className="effect-layer snow">
          {[...Array(55)].map((_, i) => (
            <div key={i} className="particle snowflake" style={{
              left: `${Math.random() * 100}%`,
              animation: fa('fall-natural', 14 + Math.random() * 10, Math.random() * 16),
              ...ps(true),
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
          {[...Array(22)].map((_, i) => (
            <div key={i} className="particle leaf" style={{
              left: `${Math.random() * 100}%`,
              animation: fa('fall-leaf', 24 + Math.random() * 14, Math.random() * 22),
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
              animation: fa('float-up', 18 + Math.random() * 14, Math.random() * 20),
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
              animation: fa('fall-natural', 15 + Math.random() * 10, Math.random() * 18),
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
              animation: fa('fall-natural', 26 + Math.random() * 16, Math.random() * 24),
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
              animation: fa('fall-leaf', 22 + Math.random() * 14, Math.random() * 22),
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
