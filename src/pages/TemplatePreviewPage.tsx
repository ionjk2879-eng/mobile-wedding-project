import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AI_PRESETS, applyPreset } from '../data/aiPresets';
import { InvitationData } from '../types';
import { loadInvitationPublic } from '../services/publicLoad';
import InvitationView from '../components/Preview/InvitationView';
import { ScrollRootContext } from '../components/Preview/ScrollReveal';
import { loadAllFonts } from '../utils/loadFont';
import '../styles/effects.css';
import '../styles/builder.css';

const TemplatePreviewPage: React.FC = () => {
  const { presetId } = useParams<{ presetId: string }>();
  const navigate = useNavigate();
  const preset = AI_PRESETS.find(p => p.id === presetId);
  const handleClose = () => {
    if (window.history.length > 1) navigate(-1);
    else window.close();
  };
  const [sampleData, setSampleData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadAllFonts(); }, []);

  useEffect(() => {
    if (!preset?.sampleSlug) return;
    setLoading(true);
    loadInvitationPublic(preset.sampleSlug)
      .then(d => { if (d) setSampleData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [preset?.sampleSlug]);

  if (!preset) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Pretendard', sans-serif" }}>
        <p style={{ color: '#9CA3AF' }}>템플릿을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const base = applyPreset(preset);
  const s = sampleData;
  const previewData: InvitationData = s ? {
    ...base,
    groomName: s.groomName,
    brideName: s.brideName,
    date: s.date,
    time: s.time,
    weddingDateISO: s.weddingDateISO,
    heroPhoto: s.heroPhoto || '',
    heroPhotoX: s.heroPhotoX,
    heroPhotoY: s.heroPhotoY,
    heroPhoto2: s.heroPhoto2 || '',
    heroPhoto2X: s.heroPhoto2X,
    heroPhoto2Y: s.heroPhoto2Y,
    photos: s.photos || [],
    groomPhoto: s.groomPhoto || '',
    bridePhoto: s.bridePhoto || '',
    timeline: s.timeline?.length ? s.timeline : base.timeline,
    parents: {
      groomParents: (s.parents?.groomParents || []).map(p => ({ ...p, phone: '' })),
      brideParents: (s.parents?.brideParents || []).map(p => ({ ...p, phone: '' })),
    },
    venueName: '세레나 웨딩홀 그랜드볼룸',
    venueAddress: '서울특별시 강남구 테헤란로 123',
    transport: {
      subway: '2호선 강남역 3번 출구 도보 5분',
      bus: '간선 140, 402번 강남역 하차',
      parking: '건물 지하 1~3층 (3시간 무료)',
    },
  } : base;

  const themeClass = previewData.theme ? `theme-${previewData.theme}` : '';

  return (
    <div className="tmpl-preview-root">
      <div className="tmpl-preview-bar">
        <button className="tmpl-preview-back" onClick={handleClose}>← 닫기</button>
        <span className="tmpl-preview-name">{preset.emoji} {preset.name}</span>
        <a href={`/editor?template=${preset.id}`} className="tmpl-preview-apply">선택</a>
      </div>
      <div className="tmpl-preview-notice">
        샘플 사진과 정보로 미리 보는 화면입니다. 제작하기를 누르면 빈 청첩장으로 시작합니다.
      </div>
      <div className="tmpl-preview-scroll">
        {loading ? (
          <div className="tmpl-preview-loading">
            <div className="tmpl-spinner" />
            <span>샘플 불러오는 중...</span>
          </div>
        ) : (
          <div
            className={`invitation-page ${themeClass} tmpl-preview-invitation${preset.accentOnText ? ' tmpl-accent-text' : ''}`}
            style={{
              ...(previewData.customBgColor ? { '--wedding-bg': previewData.customBgColor } as React.CSSProperties : {}),
              ...(previewData.customAccentColor ? { '--wedding-main': previewData.customAccentColor, '--wedding-accent': previewData.customAccentColor } as React.CSSProperties : {}),
              fontFamily: previewData.fontFamily || undefined,
            }}
          >
            <ScrollRootContext.Provider value={null}>
              <InvitationView data={previewData} showOpening={true} shareEnabled={false} />
            </ScrollRootContext.Provider>
            <a
              href="https://sonett.kr"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
                color: 'white', textDecoration: 'none',
                fontFamily: "'Pretendard', sans-serif",
              }}
            >
              <span style={{ fontSize: '0.9em', fontWeight: 700, letterSpacing: 1, color: '#D4A5C6' }}>Sonett</span>
              <span style={{ fontSize: '0.75em', color: 'rgba(255,255,255,0.7)' }}>지금 바로 모바일 청첩장</span>
              <span style={{ fontSize: '0.75em', fontWeight: 600, color: '#D4A5C6', marginLeft: 4 }}>지금 만들기 ›</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatePreviewPage;
