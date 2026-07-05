import React from 'react';

interface BackgroundEffectsProps {
  effect?: string;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ effect }) => {
  if (!effect || effect === 'none') return null;

  const fa = (base: string, dur: number, delay: number) =>
    `${base} ${dur.toFixed(1)}s linear ${delay.toFixed(1)}s infinite`;

  switch (effect) {
    case 'cherry-blossom':
      return (
        <div className="effect-layer cherry-blossoms">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="particle blossom" style={{
              left: `${Math.random() * 100}%`,
              animation: fa('fall', 16 + Math.random() * 14, Math.random() * 14),
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
            }} />
          ))}
        </div>
      );
    default:
      return null;
  }
};

export default React.memo(BackgroundEffects);
