import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import useAuthStore from '../stores/useAuthStore';
import { apiFetch } from '../services/api';
import { resizeImageForUpload } from '../utils/imageResize';

interface Review {
  id: number;
  authorName: string;
  rating: number;
  content: string;
  photoUrl: string | null;
  createdAt: string;
  isOwn: boolean;
}

const Stars: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => (
  <span className="rv-stars" style={{ fontSize: size }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ color: i <= rating ? '#F59E0B' : '#D1D5DB' }}>★</span>
    ))}
  </span>
);

const StarPicker: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="rv-star-picker">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className="rv-star-pick"
          style={{ color: i <= (hovered || value) ? '#F59E0B' : '#D1D5DB' }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
        >★</span>
      ))}
    </span>
  );
};

const ReviewsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'write' | 'detail'>('list');
  const [selected, setSelected] = useState<Review | null>(null);

  // Write form
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [photoFile, setPhotoFile] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [writeError, setWriteError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    apiFetch<Review[]>('/api/reviews')
      .then((data) => setReviews(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  useEffect(() => {
    if (view !== 'list') document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [view]);

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const openWrite = () => {
    setRating(5); setContent(''); setPhotoFile(null); setPhotoPreview(null); setWriteError('');
    setView('write');
  };

  const closeModal = () => {
    setView('list');
    setSelected(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImageForUpload(file, 1200);
      setPhotoFile(resized);
      setPhotoPreview(URL.createObjectURL(resized));
    } catch {
      setPhotoFile(file as Blob);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const submitReview = async () => {
    if (rating === 0) { setWriteError('별점을 선택해주세요.'); return; }
    if (!content.trim()) { setWriteError('후기 내용을 입력해주세요.'); return; }
    setSubmitting(true);
    setWriteError('');
    try {
      let photoKey: string | null = null;
      if (photoFile) {
        const fd = new FormData();
        fd.append('file', photoFile, 'review.jpg');
        fd.append('folder', 'review');
        const up = await apiFetch<{ url: string }>('/api/upload', { method: 'POST', body: fd });
        photoKey = up.url.replace('/images/', '');
      }
      await apiFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ rating, content: content.trim(), photoKey }),
      });
      closeModal();
      fetchReviews();
    } catch {
      setWriteError('등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm('후기를 삭제하시겠습니까?')) return;
    try {
      await apiFetch(`/api/reviews/${id}`, { method: 'DELETE' });
      closeModal();
      fetchReviews();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="rv-page">
      <SiteHeader />

      {/* Hero */}
      <section className="rv-hero">
        <p className="rv-hero-sub">REVIEWS</p>
        <h1 className="rv-hero-title">고객 후기</h1>
        {reviews.length > 0 && (
          <div className="rv-hero-stats">
            <span className="rv-hero-avg">{avgRating}</span>
            <Stars rating={Math.round(avgRating)} size={22} />
            <span className="rv-hero-count">({reviews.length}개의 후기)</span>
          </div>
        )}
        <p className="rv-hero-desc">Sonett으로 청첩장을 만든 분들의 생생한 후기입니다.</p>
        {!authLoading && user && (
          <button className="rv-write-btn" onClick={openWrite}>후기 작성</button>
        )}
        {!authLoading && !user && (
          <p className="rv-login-notice">로그인 후 후기를 작성할 수 있습니다.</p>
        )}
      </section>

      {/* 후기 카드 그리드 */}
      <section className="rv-section">
        {loading ? (
          <p className="rv-empty">불러오는 중...</p>
        ) : reviews.length === 0 ? (
          <p className="rv-empty">아직 등록된 후기가 없습니다. 첫 번째 후기를 남겨보세요!</p>
        ) : (
          <div className="rv-grid">
            {reviews.map(r => (
              <div key={r.id} className="rv-card" onClick={() => { setSelected(r); setView('detail'); }}>
                {r.photoUrl && (
                  <div className="rv-card-img">
                    <img src={r.photoUrl} alt="" loading="lazy" />
                  </div>
                )}
                <div className="rv-card-body">
                  <div className="rv-card-top">
                    <Stars rating={r.rating} size={15} />
                    <span className="rv-card-date">{r.createdAt.slice(0, 10)}</span>
                  </div>
                  <p className="rv-card-content">{r.content}</p>
                  <p className="rv-card-author">{r.authorName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="rv-cta">
        <h2>나만의 청첩장을 만들어보세요</h2>
        <Link to="/editor" className="rv-cta-btn">청첩장 만들기</Link>
      </section>

      <footer className="rv-footer">
        <p>&copy; 2026 Sonett. All rights reserved.</p>
      </footer>

      {/* 글쓰기 모달 */}
      {view === 'write' && (
        <div className="rv-overlay" onClick={closeModal}>
          <div className="rv-modal" onClick={e => e.stopPropagation()}>
            <div className="rv-modal-header">
              <h2 className="rv-modal-title">후기 작성</h2>
              <button className="rv-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="rv-modal-body">
              <div className="rv-field">
                <label className="rv-label">별점</label>
                <div className="rv-star-row">
                  <StarPicker value={rating} onChange={setRating} />
                  <span className="rv-star-label">{rating}점</span>
                </div>
              </div>
              <div className="rv-field">
                <label className="rv-label">후기 내용</label>
                <textarea
                  className="rv-textarea"
                  placeholder="Sonett을 사용하신 후기를 자유롭게 적어주세요."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="rv-field">
                <label className="rv-label">사진 첨부 <span className="rv-optional">(선택)</span></label>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoSelect} />
                {photoPreview ? (
                  <div className="rv-photo-preview">
                    <img src={photoPreview} alt="" />
                    <button className="rv-photo-remove" onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>✕ 사진 제거</button>
                  </div>
                ) : (
                  <button className="rv-photo-btn" onClick={() => fileInputRef.current?.click()}>
                    + 사진 선택
                  </button>
                )}
              </div>
              {writeError && <p className="rv-error">{writeError}</p>}
            </div>
            <div className="rv-modal-footer">
              <button className="rv-btn-cancel" onClick={closeModal}>취소</button>
              <button className="rv-btn-submit" onClick={submitReview} disabled={submitting}>
                {submitting ? '등록 중...' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {view === 'detail' && selected && (
        <div className="rv-overlay" onClick={closeModal}>
          <div className="rv-modal rv-modal-detail" onClick={e => e.stopPropagation()}>
            <div className="rv-modal-header">
              <div className="rv-detail-meta">
                <Stars rating={selected.rating} size={16} />
                <span className="rv-detail-author">{selected.authorName}</span>
                <span className="rv-detail-date">{selected.createdAt.slice(0, 10)}</span>
              </div>
              <button className="rv-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="rv-modal-body">
              {selected.photoUrl && (
                <div className="rv-detail-photo">
                  <img src={selected.photoUrl} alt="" />
                </div>
              )}
              <p className="rv-detail-content">{selected.content}</p>
            </div>
            <div className="rv-modal-footer">
              {selected.isOwn && (
                <button className="rv-btn-delete" onClick={() => deleteReview(selected.id)}>삭제</button>
              )}
              <button className="rv-btn-cancel" style={{ marginLeft: 'auto' }} onClick={closeModal}>닫기</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .rv-page { min-height: 100vh; background: #fff; font-family: 'Pretendard', sans-serif; }

        .rv-hero { text-align: center; padding: 80px 24px 48px; background: linear-gradient(180deg, #FDFBFC 0%, #FDF6F9 100%); }
        .rv-hero-sub { font-size: 0.72rem; letter-spacing: 5px; color: #B07A8E; font-weight: 600; margin: 0 0 10px; }
        .rv-hero-title { font-size: 2.2rem; font-weight: 700; color: #1F2937; margin: 0 0 16px; }
        .rv-hero-stats { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; }
        .rv-hero-avg { font-size: 1.6rem; font-weight: 800; color: #1F2937; }
        .rv-hero-count { font-size: 0.85rem; color: #9CA3AF; }
        .rv-hero-desc { font-size: 0.95rem; color: #6B7280; margin: 0 0 24px; }
        .rv-write-btn { background: #B07A8E; color: white; border: none; padding: 12px 28px; border-radius: 50px; font-size: 0.9rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; box-shadow: 0 4px 16px rgba(176,122,142,0.25); }
        .rv-write-btn:hover { background: #9B6A7E; transform: translateY(-1px); }
        .rv-login-notice { font-size: 0.84rem; color: #9CA3AF; margin: 0; }

        .rv-stars { letter-spacing: 1px; }

        .rv-section { max-width: 960px; margin: 0 auto; padding: 48px 24px 60px; }
        .rv-empty { text-align: center; color: #9CA3AF; font-size: 0.9rem; padding: 40px 0; }
        .rv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .rv-card { background: #FAFAFA; border-radius: 16px; overflow: hidden; cursor: pointer; transition: transform 0.18s, box-shadow 0.18s; border: 1px solid #F0F0F0; }
        .rv-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
        .rv-card-img { height: 180px; overflow: hidden; background: #F3E8EC; }
        .rv-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .rv-card-body { padding: 16px; }
        .rv-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .rv-card-date { font-size: 0.73rem; color: #9CA3AF; }
        .rv-card-content { font-size: 0.88rem; color: #374151; line-height: 1.65; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
        .rv-card-author { font-size: 0.78rem; font-weight: 600; color: #9CA3AF; margin: 0; }

        .rv-cta { text-align: center; padding: 60px 24px 80px; }
        .rv-cta h2 { font-size: 1.6rem; font-weight: 700; color: #1F2937; margin: 0 0 24px; }
        .rv-cta-btn { display: inline-block; background: #B07A8E; color: white; padding: 16px 44px; border-radius: 50px; font-size: 1rem; font-weight: 600; text-decoration: none; transition: all 0.25s; box-shadow: 0 4px 20px rgba(176,122,142,0.25); }
        .rv-cta-btn:hover { background: #9B6A7E; transform: translateY(-2px); }
        .rv-footer { text-align: center; padding: 24px; border-top: 1px solid #F0F0F0; color: #9CA3AF; font-size: 0.8rem; }

        /* 모달 공통 */
        .rv-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .rv-modal { background: white; border-radius: 16px; width: 100%; max-width: 520px; max-height: 88vh; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.16); }
        .rv-modal-detail { max-width: 600px; }
        .rv-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; flex-shrink: 0; }
        .rv-modal-title { font-size: 1.05rem; font-weight: 700; color: #1F2937; margin: 0; }
        .rv-modal-close { background: none; border: none; font-size: 1rem; color: #9CA3AF; cursor: pointer; padding: 4px 8px; }
        .rv-modal-close:hover { color: #4B5563; }
        .rv-modal-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
        .rv-modal-footer { display: flex; align-items: center; gap: 8px; padding: 0 24px 20px; flex-shrink: 0; }

        .rv-field { display: flex; flex-direction: column; gap: 6px; }
        .rv-label { font-size: 0.8rem; font-weight: 600; color: #6B7280; }
        .rv-optional { font-weight: 400; color: #9CA3AF; }
        .rv-star-row { display: flex; align-items: center; gap: 10px; }
        .rv-star-picker { display: flex; gap: 4px; }
        .rv-star-pick { font-size: 2rem; cursor: pointer; transition: transform 0.1s; user-select: none; }
        .rv-star-pick:hover { transform: scale(1.2); }
        .rv-star-label { font-size: 0.9rem; font-weight: 600; color: #F59E0B; }
        .rv-textarea { border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 12px 14px; font-size: 0.9rem; font-family: inherit; outline: none; resize: vertical; transition: border-color 0.15s; line-height: 1.7; }
        .rv-textarea:focus { border-color: #B07A8E; }
        .rv-photo-btn { border: 1.5px dashed #D1D5DB; border-radius: 10px; padding: 14px; background: #FAFAFA; color: #9CA3AF; font-size: 0.88rem; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .rv-photo-btn:hover { border-color: #B07A8E; color: #B07A8E; background: #FDF8FA; }
        .rv-photo-preview { position: relative; border-radius: 10px; overflow: hidden; }
        .rv-photo-preview img { width: 100%; max-height: 220px; object-fit: cover; display: block; }
        .rv-photo-remove { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.55); color: white; border: none; border-radius: 8px; padding: 5px 10px; font-size: 0.75rem; cursor: pointer; }
        .rv-error { font-size: 0.82rem; color: #DC2626; margin: 0; }

        .rv-btn-submit { background: #B07A8E; color: white; border: none; padding: 10px 24px; border-radius: 10px; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s; }
        .rv-btn-submit:hover:not(:disabled) { background: #9B6A7E; }
        .rv-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .rv-btn-cancel { background: #F3F4F6; color: #6B7280; border: none; padding: 10px 20px; border-radius: 10px; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: inherit; }
        .rv-btn-cancel:hover { background: #E5E7EB; }
        .rv-btn-delete { background: #FEF2F2; color: #DC2626; border: none; padding: 10px 20px; border-radius: 10px; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: inherit; }
        .rv-btn-delete:hover { background: #FEE2E2; }

        .rv-detail-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .rv-detail-author { font-size: 0.85rem; font-weight: 600; color: #4B5563; }
        .rv-detail-date { font-size: 0.78rem; color: #9CA3AF; }
        .rv-detail-photo { border-radius: 12px; overflow: hidden; }
        .rv-detail-photo img { width: 100%; max-height: 320px; object-fit: cover; display: block; }
        .rv-detail-content { font-size: 0.92rem; color: #374151; line-height: 1.9; white-space: pre-wrap; word-break: keep-all; margin: 0; }

        @media (max-width: 720px) {
          .rv-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (max-width: 480px) {
          .rv-hero { padding: 60px 20px 36px; }
          .rv-hero-title { font-size: 1.6rem; }
          .rv-section { padding: 32px 16px 48px; }
          .rv-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .rv-card-img { height: 130px; }
          .rv-overlay { padding: 0; align-items: flex-end; }
          .rv-modal { border-radius: 20px 20px 0 0; max-height: 92vh; max-width: 100%; }
          .rv-modal-detail { max-width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ReviewsPage;
