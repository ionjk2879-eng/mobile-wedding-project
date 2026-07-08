import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { InvitationData, OpeningConfig } from '../types';
import { loadInvitation, updateAnniversaryMode } from '../services/invitationService';
// 이 페이지의 실제 편집 데이터(대표사진/갤러리/오프닝 스타일)는 이 store와 완전히 무관하게 로컬 state로
// 관리한다 — 여기서 가져오는 건 오프닝 미리보기 재생 트리거용 카운터(openingPreviewKey) 하나뿐이다.
// InvitationView.tsx가 이 카운터를 prop이 아니라 이 store에서 직접 구독하도록 만들어져 있어(수정 불가 대상),
// "▶ 미리보기" 버튼을 만들려면 이 액션을 그대로 쓰는 것 외에 다른 방법이 없다.
import useInvitationStore from '../stores/useInvitationStore';
import { uploadImage } from '../services/storageService';
import { toast } from '../stores/useToastStore';
import { getApiErrorMessage } from '../utils/apiError';
import { loadFont } from '../utils/loadFont';
import ToastContainer from '../components/Toast';
import InvitationView from '../components/Preview/InvitationView';
import { ScrollRootContext } from '../components/Preview/ScrollReveal';
import '../styles/effects.css';

const MAX_PHOTOS = 10;

// 기존 OpeningSection.tsx의 "전환 스타일" 목록을 그대로 재사용 (typing은 curtain의 레거시 별칭이라 제외)
const OPENING_STYLE_OPTIONS: { key: NonNullable<OpeningConfig['openingStyle']>; name: string; desc: string }[] = [
  { key: 'curtain', name: '커튼', desc: '그라데이션 배경에 단색 커튼이 닫히며 전환' },
  { key: 'circle', name: '원형 확산', desc: '중앙에서 원형으로 펼쳐짐' },
  { key: 'veil', name: '베일 드롭', desc: '위에서 베일이 내려오듯 등장, 클릭 시 걷힘' },
  { key: 'blind', name: '블라인드', desc: '수평 슬라이스가 하나씩 열리며 등장' },
  { key: 'frame', name: '투명 액자', desc: '유리 액자 속에 담은 고급스러운 연출' },
  { key: 'insta', name: '인스타그램', desc: '스토리 형식의 감각적인 연출' },
];

const LoadingScreen: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", color: '#9CA3AF' }}>
    <p>{text}</p>
  </div>
);

// "평생소장 아카이브"(기념일 모드 전용 대표사진/갤러리/오프닝 스타일) 편집 페이지.
// 기존 에디터(App.tsx/useInvitationStore)와는 완전히 독립적으로 동작 — 자체 로컬 state로
// 편집하고, 저장은 PATCH /api/invitations/:slug/anniversary(원자적 json_set)만 사용한다.
const AnniversaryEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const triggerOpeningPreview = useInvitationStore((s) => s.triggerOpeningPreview);

  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heroPhoto, setHeroPhoto] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [openingStyle, setOpeningStyle] = useState<string | undefined>(undefined);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    if (!slug) return;
    loadInvitation(slug).then((inv) => {
      if (inv) {
        setData(inv);
        loadFont(inv.fontFamily);
        const am = inv.anniversaryMode;
        setHeroPhoto(am?.heroPhoto || inv.heroPhoto || '');
        setPhotos(am?.photos || inv.photos || []);
        setOpeningStyle(am?.openingStyle);
      }
      setLoading(false);
    });
  }, [slug]);

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !slug) return;
    setUploadingHero(true);
    try {
      // anniversary/{slug} 접두사로 저장해야 청첩장 삭제/만료/슬러그 변경 시 R2 정리 대상에 잡힌다
      const url = await uploadImage(file, `anniversary/${slug}`, 1200);
      setHeroPhoto(url);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploadingHero(false);
    }
  };

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !slug) { e.target.value = ''; return; }

    const remaining = MAX_PHOTOS - photos.length;
    // input.value를 비우면 이 FileList 자체가 즉시 비워지므로(같은 객체를 가리킴), 반드시
    // Array.from으로 File 배열을 먼저 복사해둔 다음에 value를 초기화해야 한다.
    const toUpload = Array.from(files).slice(0, remaining);
    const exceeded = files.length > toUpload.length;
    e.target.value = '';

    if (remaining <= 0) {
      toast.error(`사진은 최대 ${MAX_PHOTOS}장까지 등록할 수 있어요.`);
      return;
    }
    if (exceeded) {
      toast.error(`최대 ${MAX_PHOTOS}장까지만 등록할 수 있어 앞의 ${toUpload.length}장만 업로드했어요.`);
    }

    setUploadingPhotos(true);
    try {
      const urls = await Promise.all(
        toUpload.map((file) => uploadImage(file, `anniversary/${slug}`))
      );
      setPhotos((prev) => [...prev, ...urls]);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!slug || saving) return;
    if (!heroPhoto) {
      toast.error('대표 사진을 먼저 등록해주세요.');
      return;
    }
    setSaving(true);
    try {
      await updateAnniversaryMode(slug, { heroPhoto, photos, ...(openingStyle ? { openingStyle } : {}) });
      toast.success('저장했어요.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
    setSaving(false);
  };

  if (loading) return <LoadingScreen text="불러오는 중..." />;
  if (!data || !slug) return <LoadingScreen text="청첩장을 찾을 수 없습니다." />;

  // 미리보기 전용 병합 데이터 — InvitationView.tsx는 건드리지 않고, 여기서만 대표사진/갤러리/
  // 오프닝 스타일을 편집 중인 값으로 덮어써서 forceAnniversaryMode 미리보기에 반영한다.
  const previewData: InvitationData = {
    ...data,
    heroPhoto: heroPhoto || data.heroPhoto,
    photos: photos.length > 0 ? photos : data.photos,
    opening: data.opening
      ? { ...data.opening, openingStyle: (openingStyle || data.opening.openingStyle || 'curtain') as OpeningConfig['openingStyle'] }
      : data.opening,
  };

  return (
    <div className="anniv-edit-page">
      <ToastContainer />
      <header className="anniv-edit-header">
        <div>
          <h1>SONETT</h1>
          <p>기념일 모드 편집 — {slug}</p>
        </div>
        <div className="anniv-edit-actions">
          <button type="button" className="anniv-edit-btn" onClick={() => navigate('/manage')}>
            <ArrowLeft size={16} /> 목록으로
          </button>
          <button type="button" className="anniv-edit-btn primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </header>

      <div className="anniv-edit-body">
        <div className="anniv-edit-form">
          <section className="anniv-edit-section">
            <h2>대표 사진</h2>
            <p className="anniv-edit-hint">기념일 모드 메인 화면에 사용할 사진 1장을 등록하세요.</p>
            <div className="anniv-hero-upload">
              {uploadingHero ? (
                <div className="anniv-hero-empty"><Loader2 size={24} className="spin" /><span>업로드 중...</span></div>
              ) : heroPhoto ? (
                <>
                  <img src={heroPhoto} alt="대표 사진" />
                  <label className="anniv-change-btn"><ImageIcon size={16} /> 변경<input type="file" accept="image/*" onChange={handleHeroUpload} hidden /></label>
                </>
              ) : (
                <label className="anniv-hero-empty">
                  <ImageIcon size={24} />
                  <span>대표 사진 등록</span>
                  <input type="file" accept="image/*" onChange={handleHeroUpload} hidden />
                </label>
              )}
            </div>
          </section>

          <section className="anniv-edit-section">
            <h2>갤러리 사진 <span className="anniv-edit-count">{photos.length}/{MAX_PHOTOS}</span></h2>
            <p className="anniv-edit-hint">기념일 모드 갤러리에 보여줄 사진을 최대 {MAX_PHOTOS}장까지 등록하세요.</p>
            <div className="anniv-gallery-grid">
              {photos.length < MAX_PHOTOS && (
                <label className={`anniv-add-photo ${uploadingPhotos ? 'uploading' : ''}`}>
                  <div className="plus">{uploadingPhotos ? '⏳' : '+'}</div>
                  <span>{uploadingPhotos ? '업로드 중...' : '사진 추가'}</span>
                  <input type="file" multiple accept="image/*" onChange={handlePhotosUpload} hidden disabled={uploadingPhotos} />
                </label>
              )}
              {photos.map((photo, index) => (
                <div key={index} className="anniv-gallery-item">
                  <img src={photo} alt="갤러리 사진" />
                  <button type="button" className="anniv-gallery-del" onClick={() => handleRemovePhoto(index)} aria-label="삭제">×</button>
                </div>
              ))}
            </div>
          </section>

          <section className="anniv-edit-section">
            <h2>오프닝 스타일</h2>
            <p className="anniv-edit-hint">비워두면 청첩장 모드에 설정한 전환 스타일을 그대로 사용해요.</p>
            <div className="anniv-style-grid">
              <button
                type="button"
                className={`anniv-style-btn ${!openingStyle ? 'active' : ''}`}
                onClick={() => setOpeningStyle(undefined)}
              >
                <strong>기본값 상속</strong>
                <span>청첩장 모드와 동일하게</span>
              </button>
              {OPENING_STYLE_OPTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`anniv-style-btn ${openingStyle === s.key ? 'active' : ''}`}
                  onClick={() => setOpeningStyle(s.key)}
                >
                  <strong>{s.name}</strong>
                  <span>{s.desc}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="anniv-edit-preview">
          {data.opening?.openingEnabled && (
            <button type="button" className="anniv-preview-opening-btn" onClick={triggerOpeningPreview}>
              ▶ 오프닝 미리보기
            </button>
          )}
          <div className="anniv-preview-frame">
            <div
              className={`anniv-preview-inner theme-${previewData.theme || 'blush'}`}
              style={{
                fontFamily: previewData.fontFamily,
                ...(previewData.customBgColor ? { '--wedding-bg': previewData.customBgColor } as React.CSSProperties : {}),
                ...(previewData.customAccentColor ? { '--wedding-main': previewData.customAccentColor } as React.CSSProperties : {}),
                ...(previewData.customLabelColor ? { '--wedding-label': previewData.customLabelColor } as React.CSSProperties : {}),
                ...(previewData.customTextColor ? { '--wedding-emphasis': previewData.customTextColor } as React.CSSProperties : {}),
              }}
            >
              <ScrollRootContext.Provider value={null}>
                <InvitationView data={previewData} forceAnniversaryMode />
              </ScrollRootContext.Provider>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .anniv-edit-page { min-height: 100vh; background: #F9FAFB; font-family: 'Pretendard', -apple-system, sans-serif; padding: 24px; box-sizing: border-box; }
        .anniv-edit-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .anniv-edit-header h1 { margin: 0; font-size: 1.4rem; color: #D4A5C6; letter-spacing: 3px; }
        .anniv-edit-header p { margin: 4px 0 0; color: #6B7280; font-size: 0.9rem; }
        .anniv-edit-actions { display: flex; gap: 8px; }
        .anniv-edit-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border: 1px solid #E5E7EB; border-radius: 10px; background: white; color: #374151; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; }
        .anniv-edit-btn.primary { background: #B07A8E; border-color: #B07A8E; color: white; }
        .anniv-edit-btn:disabled { opacity: 0.6; cursor: default; }
        .anniv-edit-btn .spin { animation: anniv-spin 0.8s linear infinite; }
        @keyframes anniv-spin { to { transform: rotate(360deg); } }

        .anniv-edit-body { display: flex; gap: 24px; align-items: flex-start; }
        .anniv-edit-form { flex: 1 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 20px; }
        .anniv-edit-section { background: white; border: 1px solid #F1E4EA; border-radius: 16px; padding: 20px; }
        .anniv-edit-section h2 { margin: 0; font-size: 1rem; color: #1F2937; display: flex; align-items: center; gap: 8px; }
        .anniv-edit-count { font-size: 0.78rem; font-weight: 400; color: #9CA3AF; }
        .anniv-edit-hint { margin: 4px 0 14px; font-size: 0.8rem; color: #9CA3AF; }

        .anniv-hero-upload { position: relative; width: 100%; aspect-ratio: 4/3; border-radius: 12px; overflow: hidden; background: #F3F4F6; }
        .anniv-hero-upload img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .anniv-hero-empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #9CA3AF; cursor: pointer; font-size: 0.85rem; }
        .anniv-change-btn { position: absolute; right: 10px; bottom: 10px; display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(0,0,0,0.55); color: white; border-radius: 20px; font-size: 0.78rem; font-weight: 600; cursor: pointer; }

        .anniv-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .anniv-add-photo { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; aspect-ratio: 1; border: 1.5px dashed #D4A5C6; border-radius: 10px; color: #B07A8E; font-size: 0.75rem; cursor: pointer; }
        .anniv-add-photo .plus { font-size: 1.4rem; line-height: 1; }
        .anniv-add-photo.uploading { opacity: 0.6; cursor: default; }
        .anniv-gallery-item { position: relative; aspect-ratio: 1; border-radius: 10px; overflow: hidden; background: #F3F4F6; }
        .anniv-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .anniv-gallery-del { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border: none; border-radius: 50%; background: rgba(0,0,0,0.55); color: white; font-size: 0.9rem; line-height: 1; cursor: pointer; }

        .anniv-style-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .anniv-style-btn { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 10px 12px; border: 1.5px solid #E5E7EB; border-radius: 10px; background: white; cursor: pointer; text-align: left; font-family: inherit; }
        .anniv-style-btn strong { font-size: 0.82rem; color: #1F2937; }
        .anniv-style-btn span { font-size: 0.72rem; color: #9CA3AF; }
        .anniv-style-btn.active { border-color: #B07A8E; background: #FDF2F4; }
        .anniv-style-btn.active strong { color: #B07A8E; }

        .anniv-edit-preview { flex: 0 0 auto; position: sticky; top: 24px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .anniv-preview-opening-btn { align-self: stretch; padding: 8px 14px; border: 1px solid #D4A5C6; border-radius: 8px; background: white; color: #B07A8E; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: inherit; }
        /* transform은 이 요소를 fixed 포지션 자손(오프닝 오버레이 .op-root 등)의 containing block으로
           만들어, 오프닝이 브라우저 전체 화면이 아니라 이 폰 프레임 안에서만 덮이게 한다. */
        .anniv-preview-frame { width: 320px; height: 640px; border-radius: 28px; border: 8px solid #1F2937; background: #1F2937; overflow: hidden; box-shadow: 0 12px 32px rgba(0,0,0,0.18); transform: translateZ(0); }
        .anniv-preview-inner { width: 100%; height: 100%; overflow-y: auto; background-color: var(--wedding-bg); }

        @media (max-width: 900px) {
          .anniv-edit-body { flex-direction: column; }
          .anniv-edit-preview { position: static; align-self: center; }
        }
        @media (max-width: 480px) {
          .anniv-edit-page { padding: 16px; }
          .anniv-preview-frame { width: 100%; max-width: 360px; height: 70vh; border-width: 6px; border-radius: 20px; }
        }
      `}</style>
    </div>
  );
};

export default AnniversaryEditPage;
