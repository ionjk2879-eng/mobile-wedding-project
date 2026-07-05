import React from 'react';

interface BackgroundEffectsProps {
  effect?: string;
  effectDir?: string;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ effect, effectDir }) => {
  if (!effect || effect === 'none') return null;

  const isDiagonal = effectDir === 'diagonal';
  const animName = (base: string) => (isDiagonal ? `${base}-diag` : base);

  const fa = (base: string, dur: number, delay: number) =>
    `${animName(base)} ${dur.toFixed(1)}s linear ${delay.toFixed(1)}s infinite`;

  // 대각선 방향은 낙하하면서 오른쪽으로 드리프트한다(효과별 -diag 키프레임 참고, 최대
  // 330px까지 이동). 출현 위치를 왼쪽으로 넉넉히 당겨둬야, 드리프트가 끝나는 지점(하단)
  // 까지 컨테이너 안에서 대각선 궤적이 자연스럽게 이어져 보인다(그렇지 않으면 오른쪽에서
  // 출현한 입자는 화면 밖으로 드리프트해 하단에 닿기도 전에 잘려 사라져 보인다).
  const spawnLeft = () => isDiagonal ? `${-30 + Math.random() * 90}%` : `${Math.random() * 100}%`;

  switch (effect) {
    case 'cherry-blossom':
      return (
        <div className="effect-layer cherry-blossoms">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="particle blossom" style={{
              left: spawnLeft(),
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
              left: spawnLeft(),
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
              left: spawnLeft(),
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
              left: spawnLeft(),
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
              left: spawnLeft(),
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
              left: spawnLeft(),
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
