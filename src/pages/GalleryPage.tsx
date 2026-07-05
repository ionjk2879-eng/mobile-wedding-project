import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Camera, Flag, Trash2, ImagePlus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchGalleryPhotos, uploadGalleryPhoto, deleteGalleryPhoto, reportGalleryPhoto, GalleryPhoto } from '../services/galleryService';
import { lookupInviteCode } from '../services/guestService';
import { loadInvitationPublic } from '../services/publicLoad';
import { resizeImageForUpload } from '../utils/imageResize';
import { toast } from '../stores/useToastStore';
import { getApiErrorMessage } from '../utils/apiError';
import ToastContainer from '../components/Toast';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useLightboxDrag } from '../hooks/useLightboxDrag';

const PER_UPLOADER_LIMIT = 4;
// 청첩장(slug)마다 별도로 저장 — 같은 브라우저로 서로 다른 청첩장 갤러리에 들어갔을 때
// 이름이 그대로 따라와 다른 사람 이름이 잘못 붙는 사고를 막기 위함
const guestNameStorageKey = (slug: string) => `sonett_gallery_guest_name:${slug}`;

const GalleryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get('code') || '';

  const [guestCode, setGuestCode] = useState<string | null>(null);
  const [guestName, setGuestName] = useState(() => {
    if (!slug) return '';
    try { return localStorage.getItem(guestNameStorageKey(slug)) || ''; } catch { return ''; }
  });
  const [identityLoading, setIdentityLoading] = useState(!!codeParam);

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxTrapRef = useFocusTrap(lightboxIndex !== null);

  const { trackRef: lbTrackRef, viewportRef: lbVpRef, onDragStart, onDragMove, onDragEnd } =
    useLightboxDrag(photos.length, lightboxIndex ?? 0, setLightboxIndex);

  // 라이트박스 배경만 청첩장 테마 톤에 맞추기 위한 최소 정보. 업로드 버튼 등 나머지 UI는
  // 의도적으로 Sonett 고정 배색을 유지하고, 이 값들은 라이트박스 root에만 적용한다.
  const [themeVars, setThemeVars] = useState<{ theme?: string; customBgColor?: string; customAccentColor?: string }>({});
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    loadInvitationPublic(slug).then((inv) => {
      if (cancelled || !inv) return;
      setThemeVars({ theme: inv.theme, customBgColor: inv.customBgColor, customAccentColor: inv.customAccentColor });
    });
    return () => { cancelled = true; };
  }, [slug]);

  const lightboxThemeStyle: React.CSSProperties = {
    ...(themeVars.customBgColor ? { '--wedding-bg': themeVars.customBgColor } as React.CSSProperties : {}),
    ...(themeVars.customAccentColor ? { '--wedding-main': themeVars.customAccentColor, '--wedding-accent': themeVars.customAccentColor } as React.CSSProperties : {}),
  };

  // 개인화 링크(?code=)로 들어온 경우, 서버에 재검증해 실제 하객 이름/코드를 확보
  useEffect(() => {
    if (!codeParam) { setIdentityLoading(false); return; }
    let cancelled = false;
    lookupInviteCode(codeParam).then((result) => {
      if (cancelled) return;
      // 만료된 개인화 링크(result.expired)는 "무효한 코드"와 동일하게 취급 — 이름을 직접
      // 입력하는 일반 하객 흐름으로 그대로 폴백한다 (라이브 갤러리 접근 자체는 계속 가능).
      if (result && !result.expired && result.name) { setGuestCode(codeParam); setGuestName(result.name); }
      setIdentityLoading(false);
    });
    return () => { cancelled = true; };
  }, [codeParam]);

  const loadPhotos = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      setPhotos(await fetchGalleryPhotos(slug, { guestCode: guestCode || undefined }));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
    setLoading(false);
  }, [slug, guestCode]);

  useEffect(() => {
    if (identityLoading) return;
    loadPhotos();
  }, [identityLoading, loadPhotos]);

  useEffect(() => {
    if (guestCode || !slug) return; // 개인화 링크는 이름을 직접 입력하지 않으므로 저장하지 않음
    try { localStorage.setItem(guestNameStorageKey(slug), guestName); } catch { /* noop */ }
  }, [guestName, guestCode, slug]);

  const myCount = photos.filter((p) => p.mine).length;
  const remaining = Math.max(0, PER_UPLOADER_LIMIT - myCount);

  const handlePickFile = () => {
    if (!guestCode && !guestName.trim()) {
      toast.error('이름을 먼저 입력해주세요.');
      return;
    }
    if (myCount >= PER_UPLOADER_LIMIT) {
      toast.error(`한 분당 최대 ${PER_UPLOADER_LIMIT}장까지 업로드할 수 있어요.`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !slug) return;

    setUploading(true);
    try {
      const blob = await resizeImageForUpload(file);
      const uploaded = await uploadGalleryPhoto(slug, blob, guestName.trim(), { guestCode: guestCode || undefined });
      setPhotos((prev) => [uploaded, ...prev]);
      toast.success('사진이 업로드됐어요!');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
    setUploading(false);
  };

  const handleDelete = async (photo: GalleryPhoto) => {
    if (!slug || !confirm('이 사진을 삭제할까요?')) return;
    try {
      await deleteGalleryPhoto(slug, photo.id, { guestCode: guestCode || undefined });
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      toast.success('삭제했어요.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleReport = async (photo: GalleryPhoto) => {
    if (!slug || !confirm('부적절한 사진으로 신고할까요? 신고하면 바로 목록에서 숨겨져요.')) return;
    try {
      await reportGalleryPhoto(slug, photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      toast.success('신고가 접수됐어요.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  // 삭제/신고로 photos 배열에서 항목이 사라질 때 라이트박스 인덱스를 다음(없으면 이전) 사진으로 옮기고,
  // 마지막 한 장이었으면 모달을 닫는다.
  const removePhotoFromLightbox = (photoId: string) => {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === photoId);
      const next = prev.filter((p) => p.id !== photoId);
      if (next.length === 0) {
        setLightboxIndex(null);
      } else {
        setLightboxIndex(Math.min(idx, next.length - 1));
      }
      return next;
    });
  };

  const handleDeleteInLightbox = async (photo: GalleryPhoto) => {
    if (!slug || !confirm('이 사진을 삭제할까요?')) return;
    try {
      await deleteGalleryPhoto(slug, photo.id, { guestCode: guestCode || undefined });
      removePhotoFromLightbox(photo.id);
      toast.success('삭제했어요.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleReportInLightbox = async (photo: GalleryPhoto) => {
    if (!slug || !confirm('부적절한 사진으로 신고할까요? 신고하면 바로 목록에서 숨겨져요.')) return;
    try {
      await reportGalleryPhoto(slug, photo.id);
      removePhotoFromLightbox(photo.id);
      toast.success('신고가 접수됐어요.');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);
  const showPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') showNext();
      else if (e.key === 'ArrowLeft') showPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, closeLightbox, showNext, showPrev]);


  return (
    <div className="gallery-page">
      <ToastContainer />
      <header className="gallery-header">
        <p className="gallery-eyebrow"><Camera size={14} /> LIVE GALLERY</p>
        <h1>결혼식 라이브 갤러리</h1>
        <p className="gallery-sub">하객분들이 직접 찍은 사진을 함께 모아요</p>
      </header>

      <div className="gallery-upload-box">
        {!guestCode && (
          <input
            type="text"
            className="gallery-name-input"
            placeholder="성함을 입력해주세요"
            value={guestName}
            maxLength={40}
            onChange={(e) => setGuestName(e.target.value)}
          />
        )}
        {guestCode && guestName && <p className="gallery-identity">{guestName}님으로 업로드해요</p>}

        <button type="button" className="gallery-upload-btn" onClick={handlePickFile} disabled={uploading || identityLoading}>
          <ImagePlus size={18} />
          {uploading ? '업로드 중...' : '사진 올리기'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />
        <p className="gallery-count">{myCount}/{PER_UPLOADER_LIMIT}장 업로드했어요{remaining === 0 ? ' · 더 이상 올릴 수 없어요' : ''}</p>
      </div>

      {loading ? (
        <p className="gallery-status">불러오는 중...</p>
      ) : photos.length === 0 ? (
        <p className="gallery-status">아직 올라온 사진이 없어요. 첫 사진을 올려주세요!</p>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo, index) => (
            <div className="gallery-item" key={photo.id} onClick={() => setLightboxIndex(index)} role="button" tabIndex={0}>
              <img src={photo.url} alt={photo.guestName || '갤러리 사진'} loading="lazy" />
              <div className="gallery-item-footer">
                <span className="gallery-item-name">{photo.guestName || '익명'}</span>
                <div className="gallery-item-actions">
                  {photo.mine && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(photo); }} title="삭제" aria-label="삭제">
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleReport(photo); }} title="신고" aria-label="신고">
                    <Flag size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className={`gallery-lightbox theme-${themeVars.theme || 'blush'}`}
          style={lightboxThemeStyle}
          role="dialog"
          aria-modal="true"
          aria-label="사진 확대 보기"
          ref={lightboxTrapRef}
        >
          <div className="gallery-lightbox-backdrop" onClick={closeLightbox} />

          <div className="gallery-lightbox-topbar">
            <span className="gallery-lightbox-name">{photos[lightboxIndex].guestName || '익명'}</span>
            <div className="gallery-lightbox-topbar-actions">
              {photos[lightboxIndex].mine && (
                <button type="button" onClick={() => handleDeleteInLightbox(photos[lightboxIndex])} title="삭제" aria-label="삭제">
                  <Trash2 size={16} />
                </button>
              )}
              <button type="button" onClick={() => handleReportInLightbox(photos[lightboxIndex])} title="신고" aria-label="신고">
                <Flag size={16} />
              </button>
              <button type="button" onClick={closeLightbox} aria-label="닫기">
                <X size={20} />
              </button>
            </div>
          </div>

          {photos.length > 1 && (
            <button type="button" className="gallery-lightbox-nav gallery-lightbox-prev" onClick={showPrev} aria-label="이전 사진">
              <ChevronLeft size={28} />
            </button>
          )}

          <div
            className="gallery-lightbox-stage"
            ref={lbVpRef}
            onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
            onTouchEnd={onDragEnd}
            onMouseDown={(e) => { e.preventDefault(); onDragStart(e.clientX); }}
            onMouseMove={(e) => onDragMove(e.clientX)}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
          >
            <div className="gallery-lightbox-track" ref={lbTrackRef} style={{ transform: `translateX(-${lightboxIndex * 100}%)` }}>
              {photos.map((photo) => (
                <div key={photo.id} className="gallery-lightbox-item">
                  <img
                    src={photo.url}
                    alt={photo.guestName || '갤러리 사진 확대'}
                    draggable="false"
                  />
                </div>
              ))}
            </div>
          </div>

          {photos.length > 1 && (
            <button type="button" className="gallery-lightbox-nav gallery-lightbox-next" onClick={showNext} aria-label="다음 사진">
              <ChevronRight size={28} />
            </button>
          )}

          {photos.length > 1 && (
            <div className="gallery-lightbox-dots">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`gallery-lightbox-dot${i === lightboxIndex ? ' active' : ''}`}
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`사진 ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .gallery-page { min-height: 100vh; background: #FDFBFC; font-family: 'Pretendard', -apple-system, sans-serif; padding: 32px 16px 60px; max-width: 560px; margin: 0 auto; }
        .gallery-header { text-align: center; margin-bottom: 24px; }
        .gallery-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 700; letter-spacing: 2px; color: #B07A8E; margin: 0 0 8px; }
        .gallery-header h1 { font-size: 1.3rem; color: #1F2937; margin: 0 0 6px; }
        .gallery-sub { font-size: 0.85rem; color: #6B7280; margin: 0; }

        .gallery-upload-box { background: #FFFFFF; border: 1px solid #F1E4EA; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .gallery-name-input { width: 100%; box-sizing: border-box; padding: 12px 14px; border: 1px solid #E5D9E0; border-radius: 10px; font-size: 0.9rem; margin-bottom: 12px; font-family: inherit; }
        .gallery-identity { font-size: 0.85rem; color: #6B7280; margin: 0 0 12px; }
        .gallery-upload-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: #B07A8E; color: white; border: none; border-radius: 30px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .gallery-upload-btn:disabled { opacity: 0.5; cursor: default; }
        .gallery-count { font-size: 0.78rem; color: #9CA3AF; margin: 12px 0 0; }

        .gallery-status { text-align: center; color: #9CA3AF; font-size: 0.85rem; padding: 40px 0; }

        .gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .gallery-item { position: relative; border-radius: 12px; overflow: hidden; background: #F3F4F6; aspect-ratio: 1; cursor: pointer; }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .gallery-item-footer { position: absolute; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%); }
        .gallery-item-name { font-size: 0.72rem; color: white; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.4); }
        .gallery-item-actions { display: flex; gap: 4px; }
        .gallery-item-actions button { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: none; border-radius: 50%; background: rgba(255,255,255,0.85); color: #4B5563; cursor: pointer; }
        .gallery-item-actions button:hover { background: white; }

        @media (min-width: 420px) {
          .gallery-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .gallery-lightbox {
          position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center;
          /* theme-* 클래스가 이 엘리먼트 자신에 붙으므로, 여기서 --wedding-accent를 읽으면
             그 테마(또는 커스텀 컬러)로 이미 오버라이드된 값이 반영된다. */
          --wedding-lightbox-bg: color-mix(in srgb, var(--wedding-accent, #E8A0A0) 45%, black 55%);
        }
        .gallery-lightbox-backdrop { position: absolute; inset: 0; background: var(--wedding-lightbox-bg, rgba(0,0,0,0.9)); }

        .gallery-lightbox-topbar { position: absolute; top: 0; left: 0; right: 0; z-index: 2; display: flex; align-items: center; padding: 16px 20px; box-sizing: border-box; }
        .gallery-lightbox-name { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.85rem; font-weight: 600; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.4); }
        .gallery-lightbox-topbar-actions { position: relative; z-index: 1; margin-left: auto; display: flex; align-items: center; gap: 6px; }
        .gallery-lightbox-topbar-actions button { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: none; border-radius: 50%; background: rgba(255,255,255,0.12); color: #fff; cursor: pointer; }
        .gallery-lightbox-topbar-actions button:hover { background: rgba(255,255,255,0.22); }

        .gallery-lightbox-nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: none; border-radius: 50%; background: rgba(255,255,255,0.12); color: #fff; cursor: pointer; }
        .gallery-lightbox-nav:hover { background: rgba(255,255,255,0.22); }
        .gallery-lightbox-prev { left: 8px; }
        .gallery-lightbox-next { right: 8px; }
        .gallery-lightbox-stage { position: relative; width: 100%; max-width: 720px; max-height: 78vh; box-sizing: border-box; touch-action: pan-y; overflow: hidden; cursor: grab; }
        .gallery-lightbox-stage:active { cursor: grabbing; }
        .gallery-lightbox-track { display: flex; height: 78vh; transition: transform 0.35s ease; }
        .gallery-lightbox-item { width: 100%; flex-shrink: 0; height: 100%; display: flex; align-items: center; justify-content: center; padding: 0 56px; box-sizing: border-box; }
        .gallery-lightbox-item img { max-width: 100%; max-height: 78vh; object-fit: contain; border-radius: 8px; user-select: none; }

        .gallery-lightbox-dots { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 2; display: flex; align-items: center; gap: 6px; max-width: 85vw; overflow-x: auto; padding: 4px; }
        .gallery-lightbox-dot { flex-shrink: 0; width: 6px; height: 6px; padding: 0; border: none; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s; }
        .gallery-lightbox-dot.active { width: 8px; height: 8px; background: #fff; }

        @media (max-width: 480px) {
          .gallery-lightbox-nav { width: 36px; height: 36px; }
          .gallery-lightbox-item { padding: 0 44px; }
          .gallery-lightbox-name { max-width: 38%; }
        }
      `}</style>
    </div>
  );
};

export default GalleryPage;
