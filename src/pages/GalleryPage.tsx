import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Camera, Flag, Trash2, ImagePlus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchGalleryPhotos, uploadGalleryPhoto, deleteGalleryPhoto, reportGalleryPhoto, GalleryPhoto } from '../services/galleryService';
import { lookupInviteCode } from '../services/guestService';
import { resizeImageForUpload } from '../utils/imageResize';
import { toast } from '../stores/useToastStore';
import { getApiErrorMessage } from '../utils/apiError';
import ToastContainer from '../components/Toast';
import { useFocusTrap } from '../hooks/useFocusTrap';

const SWIPE_THRESHOLD = 50;

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
  const touchStartX = useRef(0);

  // 개인화 링크(?code=)로 들어온 경우, 서버에 재검증해 실제 하객 이름/코드를 확보
  useEffect(() => {
    if (!codeParam) { setIdentityLoading(false); return; }
    let cancelled = false;
    lookupInviteCode(codeParam).then((result) => {
      if (cancelled) return;
      if (result) { setGuestCode(codeParam); setGuestName(result.name); }
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta <= -SWIPE_THRESHOLD) showNext();
    else if (delta >= SWIPE_THRESHOLD) showPrev();
  };

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
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="사진 확대 보기" ref={lightboxTrapRef}>
          <div className="gallery-lightbox-backdrop" onClick={closeLightbox} />
          <button type="button" className="gallery-lightbox-close" onClick={closeLightbox} aria-label="닫기">
            <X size={26} />
          </button>

          {photos.length > 1 && (
            <button type="button" className="gallery-lightbox-nav gallery-lightbox-prev" onClick={showPrev} aria-label="이전 사진">
              <ChevronLeft size={28} />
            </button>
          )}

          <div
            className="gallery-lightbox-stage"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].guestName || '갤러리 사진 확대'}
              draggable="false"
            />
          </div>

          {photos.length > 1 && (
            <button type="button" className="gallery-lightbox-nav gallery-lightbox-next" onClick={showNext} aria-label="다음 사진">
              <ChevronRight size={28} />
            </button>
          )}

          <div className="gallery-lightbox-footer">
            <div className="gallery-lightbox-info">
              <span className="gallery-item-name">{photos[lightboxIndex].guestName || '익명'}</span>
              {photos.length > 1 && (
                <span className="gallery-lightbox-counter">{lightboxIndex + 1} / {photos.length}</span>
              )}
            </div>
            <div className="gallery-item-actions">
              {photos[lightboxIndex].mine && (
                <button type="button" onClick={() => handleDeleteInLightbox(photos[lightboxIndex])} title="삭제" aria-label="삭제">
                  <Trash2 size={14} />
                </button>
              )}
              <button type="button" onClick={() => handleReportInLightbox(photos[lightboxIndex])} title="신고" aria-label="신고">
                <Flag size={14} />
              </button>
            </div>
          </div>
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

        .gallery-lightbox { position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .gallery-lightbox-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.9); }
        .gallery-lightbox-close { position: absolute; top: 16px; right: 16px; z-index: 2; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: none; border-radius: 50%; background: rgba(255,255,255,0.12); color: #fff; cursor: pointer; }
        .gallery-lightbox-close:hover { background: rgba(255,255,255,0.22); }
        .gallery-lightbox-nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: none; border-radius: 50%; background: rgba(255,255,255,0.12); color: #fff; cursor: pointer; }
        .gallery-lightbox-nav:hover { background: rgba(255,255,255,0.22); }
        .gallery-lightbox-prev { left: 8px; }
        .gallery-lightbox-next { right: 8px; }
        .gallery-lightbox-stage { position: relative; width: 100%; max-width: 720px; max-height: 78vh; display: flex; align-items: center; justify-content: center; padding: 0 56px; box-sizing: border-box; touch-action: pan-y; }
        .gallery-lightbox-stage img { max-width: 100%; max-height: 78vh; object-fit: contain; border-radius: 8px; user-select: none; }
        .gallery-lightbox-footer { position: relative; z-index: 2; width: 100%; max-width: 720px; display: flex; align-items: center; justify-content: space-between; padding: 14px 20px 0; box-sizing: border-box; }
        .gallery-lightbox-info { display: flex; align-items: center; gap: 10px; }
        .gallery-lightbox-counter { font-size: 0.75rem; color: rgba(255,255,255,0.7); }
        .gallery-lightbox-footer .gallery-item-actions button { background: rgba(255,255,255,0.85); }

        @media (max-width: 480px) {
          .gallery-lightbox-nav { width: 36px; height: 36px; }
          .gallery-lightbox-stage { padding: 0 44px; }
        }
      `}</style>
    </div>
  );
};

export default GalleryPage;
