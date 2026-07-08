import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { AI_PRESETS, AIPreset } from '../data/aiPresets';
import { loadInvitationPublic } from '../services/publicLoad';
import '../styles/builder.css';

// heroStyle → 라벨
const HERO_STYLE_LABEL: Record<string, string> = {
  classic: '클래식', overlay: '오버레이', minimal: '미니멀', editorial: '에디토리얼',
  fullscreen: '풀스크린', split: '스플릿', centercard: '센터카드', magcover: '매거진커버',
  glassframe: '글라스프레임', instacard: '인스타카드', bookcover: '북커버',
  bookpage: '북페이지', filmstrip: '필름스트립', verttype: '버티컬', magframe: '매거진프레임',
  boldtype: '볼드타입', datesplit: '데이트스플릿',
};

interface TemplateCardProps {
  preset: AIPreset;
  photo: string | null;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ preset, photo }) => {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const accentColor = preset.previewColors[1];
  const bgColor = preset.previewColors[0];
  const darkColor = preset.previewColors[2];
  const heroStyleLabel = HERO_STYLE_LABEL[preset.settings.heroStyle || 'classic'] || preset.settings.heroStyle || '';

  return (
    <a
      href={`/template-preview/${preset.id}`}
      className="tmpl-card-new"
      onClick={e => {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          navigate(`/template-preview/${preset.id}`);
        }
      }}
    >
      {/* 사진 영역 */}
      <div className="tmpl-card-photo" style={{ background: `linear-gradient(160deg, ${bgColor} 0%, ${accentColor}40 100%)` }}>
        {photo ? (
          <>
            <img
              src={photo}
              alt={preset.name}
              className={`tmpl-card-img ${imgLoaded ? 'loaded' : ''}`}
              onLoad={() => setImgLoaded(true)}
            />
            {/* 하단 그라디언트 오버레이 */}
            <div className="tmpl-card-overlay" style={{ background: `linear-gradient(to top, ${darkColor}CC 0%, transparent 55%)` }} />
          </>
        ) : (
          <div className="tmpl-card-no-photo" style={{ background: `linear-gradient(160deg, ${bgColor}, ${accentColor}60)` }}>
            <span className="tmpl-card-emoji">{preset.emoji}</span>
          </div>
        )}

        {/* 히어로 스타일 뱃지 */}
        <span className="tmpl-card-style-badge" style={{ background: `${accentColor}CC`, color: 'white' }}>
          {heroStyleLabel}
        </span>

        {/* 사진 위 이름 오버레이 (사진 있을 때) */}
        {photo && imgLoaded && (
          <div className="tmpl-card-photo-text">
            <p className="tmpl-card-photo-name" style={{ color: 'white', fontFamily: preset.settings.fontFamily || undefined }}>
              신랑 <span style={{ opacity: 0.7 }}>&</span> 신부
            </p>
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="tmpl-card-info" style={{ background: bgColor }}>
        <div className="tmpl-card-texts">
          <span className="tmpl-card-name" style={{ color: darkColor }}>{preset.name}</span>
          <span className="tmpl-card-desc">{preset.description}</span>
        </div>

        {/* 컬러 팔레트 */}
        <div className="tmpl-card-palette">
          {preset.previewColors.map((color, i) => (
            <span
              key={i}
              className="tmpl-card-swatch"
              style={{ background: color, border: i === 0 ? '1.5px solid #D1D5DB' : 'none' }}
              title={color}
            />
          ))}
          {preset.settings.customAccentColor && preset.settings.customAccentColor !== accentColor && (
            <span
              className="tmpl-card-swatch"
              style={{ background: preset.settings.customAccentColor }}
              title={preset.settings.customAccentColor}
            />
          )}
        </div>
      </div>
    </a>
  );
};

const TemplatesPage: React.FC = () => {
  const [photos, setPhotos] = useState<Record<string, string | null>>({});

  useEffect(() => {
    // 각 프리셋의 전용 템플릿 샘플 슬러그에서 독립적으로 사진 fetch
    AI_PRESETS.forEach(preset => {
      if (!preset.sampleSlug) return;
      loadInvitationPublic(preset.sampleSlug)
        .then(d => {
          if (d?.heroPhoto) {
            setPhotos(prev => ({ ...prev, [preset.id]: d.heroPhoto! }));
          }
        })
        .catch(() => {});
    });
  }, []);

  return (
    <div className="templates-page">
      <SiteHeader />
      <main className="templates-main">
        <div className="templates-header">
          <h2 className="templates-title">템플릿</h2>
          <p className="templates-desc">마음에 드는 디자인을 골라 바로 시작해보세요.</p>
        </div>
        <div className="templates-grid-new">
          {AI_PRESETS.map(preset => (
            <TemplateCard key={preset.id} preset={preset} photo={photos[preset.id] ?? null} />
          ))}
        </div>
      </main>

      <style>{`
        .templates-page {
          min-height: 100vh;
          background: #EBEBEB;
          font-family: 'Pretendard', sans-serif;
        }
        .templates-main {
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 24px 72px;
        }
        .templates-header { margin-bottom: 28px; }
        .templates-title { font-size: 1.4rem; font-weight: 700; color: #1F2937; margin: 0 0 6px; }
        .templates-desc { font-size: 0.85rem; color: #6B7280; margin: 0; }

        .templates-grid-new {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .tmpl-card-new {
          display: flex;
          flex-direction: column;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          background: white;
        }
        .tmpl-card-new:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.13);
        }

        /* 사진 영역 */
        .tmpl-card-photo {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          flex-shrink: 0;
        }
        .tmpl-card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          opacity: 0;
          transition: opacity 0.4s;
        }
        .tmpl-card-img.loaded { opacity: 1; }
        .tmpl-card-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .tmpl-card-no-photo {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tmpl-card-emoji { font-size: 2.4rem; }

        /* 히어로 스타일 뱃지 */
        .tmpl-card-style-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 20px;
          backdrop-filter: blur(4px);
          letter-spacing: 0.5px;
        }

        /* 사진 위 텍스트 */
        .tmpl-card-photo-text {
          position: absolute;
          bottom: 14px;
          left: 14px;
          right: 14px;
        }
        .tmpl-card-photo-name {
          font-size: 1rem;
          font-weight: 400;
          margin: 0;
          letter-spacing: 2px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }

        /* 정보 영역 */
        .tmpl-card-info {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tmpl-card-texts {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .tmpl-card-name {
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1.3;
        }
        .tmpl-card-desc {
          font-size: 0.72rem;
          color: #6B7280;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* 팔레트 */
        .tmpl-card-palette {
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .tmpl-card-swatch {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }

        @media (max-width: 600px) {
          .templates-main { padding: 24px 16px 60px; }
          .templates-grid-new { grid-template-columns: 1fr 1fr; gap: 12px; }
          .tmpl-card-style-badge { font-size: 0.6rem; padding: 2px 7px; }
          .tmpl-card-info { padding: 12px 14px 14px; }
          .tmpl-card-name { font-size: 0.82rem; }
        }
        @media (max-width: 380px) {
          .templates-grid-new { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default TemplatesPage;
