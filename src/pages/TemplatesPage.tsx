import React from 'react';
import { useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { AI_PRESETS } from '../data/aiPresets';
import '../styles/builder.css';

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="templates-page">
      <SiteHeader />
      <main className="templates-main">
        <div className="templates-header">
          <h2 className="templates-title">템플릿</h2>
          <p className="templates-desc">마음에 드는 디자인을 골라 바로 시작해보세요.</p>
        </div>
        <div className="templates-grid">
          {AI_PRESETS.map((preset) => (
            <a
              key={preset.id}
              href={`/template-preview/${preset.id}`}
              className="ss-tmpl-card"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                  navigate(`/template-preview/${preset.id}`);
                }
              }}
            >
              <div
                className="ss-tmpl-visual"
                style={{
                  background: `linear-gradient(160deg, ${preset.previewColors[0]} 0%, ${preset.previewColors[1]} 55%, ${preset.previewColors[2]} 100%)`,
                }}
              >
                <span className="ss-tmpl-emoji">{preset.emoji}</span>
              </div>
              <div className="ss-tmpl-body">
                <span className="ss-tmpl-name">{preset.name}</span>
                <span className="ss-tmpl-desc">{preset.description}</span>
              </div>
            </a>
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
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 24px 72px;
        }
        .templates-header {
          margin-bottom: 28px;
        }
        .templates-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 6px;
        }
        .templates-desc {
          font-size: 0.85rem;
          color: #6B7280;
          margin: 0;
        }
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        @media (max-width: 480px) {
          .templates-main { padding: 24px 16px 60px; }
          .templates-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
        }
      `}</style>
    </div>
  );
};

export default TemplatesPage;
