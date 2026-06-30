import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AI_PRESETS, applyPreset } from '../data/aiPresets';
import { InvitationData } from '../types';
import { loadInvitationPublic } from '../services/publicLoad';
import InvitationView from '../components/Preview/InvitationView';
import { ScrollRootContext } from '../components/Preview/ScrollReveal';
import { loadAllFonts } from '../utils/loadFont';
import '../styles/effects.css';

const TemplatePreviewPage: React.FC = () => {
  const { presetId } = useParams<{ presetId: string }>();
  const preset = AI_PRESETS.find(p => p.id === presetId);
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
    heroPhoto: (preset.sampleHeroFromGallery !== undefined && s.photos?.[preset.sampleHeroFromGallery])
      ? s.photos[preset.sampleHeroFromGallery]
      : s.heroPhoto || '',
    heroPhotoX: preset.sampleHeroFromGallery !== undefined ? 50 : s.heroPhotoX,
    heroPhotoY: preset.sampleHeroFromGallery !== undefined ? 50 : s.heroPhotoY,
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
    <>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 52,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #F3F4F6',
        fontFamily: "'Pretendard', sans-serif",
        gap: 8,
      }}>
        <button
          onClick={() => window.close()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '0.85rem', padding: '4px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          ← 닫기
        </button>
        <span style={{ fontWeight: 700, color: '#1F2937', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {preset.emoji} {preset.name}
        </span>
        <a
          href={`/editor?template=${preset.id}`}
          style={{
            background: '#B07A8E', color: 'white',
            padding: '8px 14px', borderRadius: 20,
            fontSize: '0.8rem', fontWeight: 700,
            textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          이 템플릿으로 제작하기
        </a>
      </div>
      <div style={{
        position: 'fixed', top: 52, left: 0, right: 0, zIndex: 999,
        textAlign: 'center', padding: '7px 16px', fontSize: '0.75rem', color: '#9CA3AF',
        background: '#FAFAFA', borderBottom: '1px solid #F3F4F6',
        fontFamily: "'Pretendard', sans-serif",
      }}>
        샘플 사진과 정보로 미리 보는 화면입니다. 제작하기를 누르면 빈 청첩장으로 시작합니다.
      </div>
      <div style={{ paddingTop: 88, width: '100%', minHeight: 'calc(100vh - 88px)', background: '#ffffff', display: 'flex', justifyContent: 'center' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', fontFamily: "'Pretendard', sans-serif" }}>
            <span style={{ color: '#9CA3AF' }}>샘플 불러오는 중...</span>
          </div>
        ) : (
          <div
            className={`invitation-page ${themeClass}${preset.accentOnText ? ' tmpl-accent-text' : ''}`}
            style={{
              width: '100%',
              maxWidth: 430,
              ...(previewData.customBgColor ? { '--wedding-bg': previewData.customBgColor } as React.CSSProperties : {}),
              ...(previewData.customAccentColor ? { '--wedding-main': previewData.customAccentColor, '--wedding-accent': previewData.customAccentColor } as React.CSSProperties : {}),
              fontFamily: previewData.fontFamily || undefined,
            }}
          >
            <ScrollRootContext.Provider value={null}>
              <InvitationView data={previewData} showOpening={true} shareEnabled={false} openingTopOffset={88} />
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
    </>
  );
};

export default TemplatePreviewPage;
