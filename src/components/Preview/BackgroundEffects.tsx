import React from 'react';

interface BackgroundEffectsProps {
  effect?: string;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ effect }) => {
  if (!effect || effect === 'none') return null;

  const fa = (base: string, dur: number, delay: number) =>
    `${base} ${dur.toFixed(1)}s cubic-bezier(0.45, 0, 0.55, 1) ${delay.toFixed(1)}s infinite`;

  // 3D 입체감: depth(0~1, 멀리~가까이)에 비례해 크기/불투명도/블러를 계산하고,
  // 기존 Z축 회전(rotate)과는 별개로 X 또는 Y축 중 하나를 랜덤으로 골라 낙하하며
  // 뒤집히는 듯한 입체 회전을 준다. --rotate-x/--rotate-y 중 실제 선택된 축만
  // 0deg→360deg로 애니메이션되고, 나머지는 0deg로 고정돼 사실상 회전하지 않는다.
  // --sway-x: 좌우로 흔들리는 폭(20~50px)을 파티클마다 랜덤으로 줘서, fall/fall-sway
  // 키프레임에서 전부 같은 궤적으로 기계적으로 움직이지 않게 한다.
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

  switch (effect) {
    case 'cherry-blossom':
      return (
        <div className="effect-layer cherry-blossoms">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="particle blossom" style={{
              left: `${Math.random() * 100}%`,
              animation: fa('fall', 16 + Math.random() * 14, Math.random() * 14),
              ...depthStyle(),
            }} />
          ))}
        </div>
      );
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
