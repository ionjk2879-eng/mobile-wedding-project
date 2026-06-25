import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyInvitations, deleteInvitation, changeSlug } from '../firebase';
import { InvitationData } from '../types';
import { toast } from '../stores/useToastStore';
import { Edit3, Share2, Link as LinkIcon, X, MoreVertical, ClipboardList, Trash2, PenLine } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import SiteHeader from '../components/SiteHeader';
import ToastContainer from '../components/Toast';
const SITE_ORIGIN = 'https://sonett.ionjk2879.workers.dev';
const KAKAO_APP_KEY = '5a920b742f037d8e9cb29865ca00c909';

const ShareModal: React.FC<{ slug: string; data: InvitationData; onClose: () => void }> = ({ slug, data, onClose }) => {
  const shareUrl = `${SITE_ORIGIN}/w/${slug}`;
  const title = data.shareTitle || `${data.groomName || '신랑'} ♡ ${data.brideName || '신부'} 결혼합니다`;
  const description = data.shareDescription || `${data.date} ${data.time} | ${data.venueName}`;

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_APP_KEY);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('링크가 복사되었습니다.');
  };

  const handleKakaoShare = () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      toast.error('카카오 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl: `${SITE_ORIGIN}/og/${slug}`,
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
      buttons: [{ title: '청첩장 보기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }],
    });
  };

  const handleUrlShare = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('URL이 복사되었습니다. 붙여넣기로 공유하세요.');
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>청첩장 공유</h3>
          <button className="share-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="share-modal-qr">
          <QRCodeSVG value={shareUrl} size={140} level="M" bgColor="transparent" fgColor="#1F2937" className="share-qr-svg" />
          <p className="share-modal-qr-hint">QR 코드를 스캔하면 청첩장으로 이동합니다</p>
        </div>
        <div className="share-modal-url">
          <input type="text" readOnly value={shareUrl} className="share-modal-url-input" />
        </div>
        <div className="share-modal-actions">
          <button className="share-modal-btn copy" onClick={handleCopyLink}><LinkIcon size={18} /> 링크 복사</button>
          <button className="share-modal-btn url-share" onClick={handleUrlShare}><Share2 size={18} /> URL 공유</button>
          <button className="share-modal-btn kakao" onClick={handleKakaoShare}><Share2 size={18} /> 카카오톡</button>
        </div>
      </div>
    </div>
  );
};

const SlugChangeModal: React.FC<{ slug: string; onClose: () => void; onChanged: () => void }> = ({ slug, onClose, onChanged }) => {
  const [newSlug, setNewSlug] = useState(slug);
  const [saving, setSaving] = useState(false);
  const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug) && newSlug !== slug;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    try {
      await changeSlug(slug, newSlug);
      toast.success(`주소가 /w/${newSlug} 으로 변경되었습니다.`);
      onChanged();
      onClose();
    } catch (err: any) {
      toast.error(err.message || '주소 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal slug-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>도메인 변경</h3>
          <button className="share-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="slug-modal-hint">청첩장 주소를 변경합니다. 기존 주소로는 더 이상 접근할 수 없습니다.</p>
          <div className="slug-modal-preview">
            <span className="slug-modal-prefix">{SITE_ORIGIN}/w/</span>
            <input
              type="text"
              className="slug-modal-input"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="new-slug"
              autoFocus
            />
          </div>
          {newSlug && !(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)) && (
            <p className="slug-modal-error">영문 소문자, 숫자, 하이픈만 사용 가능합니다.</p>
          )}
          <div className="slug-modal-actions">
            <button type="button" className="slug-modal-btn cancel" onClick={onClose}>취소</button>
            <button type="submit" className="slug-modal-btn confirm" disabled={!valid || saving}>
              {saving ? '변경 중...' : '변경하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DropdownMenu: React.FC<{
  slug: string;
  onResponse: () => void;
  onChangeSlug: () => void;
  onDelete: () => void;
}> = ({ slug, onResponse, onChangeSlug, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="mc-dropdown" ref={ref}>
      <button className="mc-more-btn" onClick={() => setOpen(!open)} aria-label="더보기"><MoreVertical size={18} /></button>
      {open && (
        <div className="mc-dropdown-menu">
          <button className="mc-dropdown-item" onClick={() => { onResponse(); setOpen(false); }}>
            <ClipboardList size={15} /> 응답 확인
          </button>
          <button className="mc-dropdown-item" onClick={() => { onChangeSlug(); setOpen(false); }}>
            <PenLine size={15} /> 도메인 변경
          </button>
          <button className="mc-dropdown-item delete" onClick={() => { onDelete(); setOpen(false); }}>
            <Trash2 size={15} /> 삭제
          </button>
        </div>
      )}
    </div>
  );
};

const ManagePage: React.FC = () => {
  const [invitations, setInvitations] = useState<{ slug: string; data: InvitationData }[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [slugChangeTarget, setSlugChangeTarget] = useState<string | null>(null);

  const load = () => {
    fetchMyInvitations().then(setInvitations).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`'${slug}' 청첩장을 삭제하시겠습니까?`)) return;
    try {
      await deleteInvitation(slug);
      toast.success(`'${slug}' 청첩장이 삭제되었습니다.`);
      load();
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const shareTarget = shareSlug ? invitations.find((i) => i.slug === shareSlug) : null;

  return (
    <div className="manage">
      <SiteHeader />
      <ToastContainer />
      <main className="manage-main">
        <h2 className="manage-title">내 청첩장</h2>
        {loading ? (
          <p className="manage-empty">불러오는 중...</p>
        ) : invitations.length === 0 ? (
          <div className="manage-empty">
            <p>아직 만든 청첩장이 없습니다.</p>
            <Link to="/editor" className="manage-cta">청첩장 만들기</Link>
          </div>
        ) : (
          <div className="manage-grid">
            {invitations.map(({ slug, data }) => (
              <div key={slug} className="mc">
                <a href={`/w/${slug}`} className="mc-thumb">
                  {data.heroPhoto ? (
                    <img src={data.heroPhoto} alt="" className="mc-thumb-img" />
                  ) : (
                    <div className="mc-thumb-empty">No Photo</div>
                  )}
                </a>
                <div className="mc-body">
                  <div className="mc-info">
                    <h3 className="mc-title">
                      {data.groomName && data.brideName
                        ? `${data.groomName} & ${data.brideName}`
                        : slug}
                    </h3>
                    <p className="mc-slug">/w/{slug}</p>
                    {data.date && <p className="mc-date">{data.date}</p>}
                  </div>
                  <div className="mc-actions">
                    <button className="mc-btn share" onClick={() => setShareSlug(slug)}><Share2 size={15} /> 공유</button>
                    <Link to={`/edit/${slug}`} className="mc-btn edit"><Edit3 size={15} /> 편집</Link>
                    <DropdownMenu
                      slug={slug}
                      onResponse={() => window.open(`/admin/${slug}`, '_blank')}
                      onChangeSlug={() => setSlugChangeTarget(slug)}
                      onDelete={() => handleDelete(slug)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {shareTarget && (
        <ShareModal slug={shareTarget.slug} data={shareTarget.data} onClose={() => setShareSlug(null)} />
      )}
      {slugChangeTarget && (
        <SlugChangeModal slug={slugChangeTarget} onClose={() => setSlugChangeTarget(null)} onChanged={load} />
      )}

      <style>{`
        .manage { min-height: 100vh; background: #F9FAFB; font-family: 'Pretendard', sans-serif; }
        .manage-main { max-width: 800px; margin: 0 auto; padding: 40px 24px; }
        .manage-title { font-size: 1.4rem; font-weight: 700; color: #1F2937; margin: 0 0 24px; }
        .manage-empty { text-align: center; color: #9CA3AF; padding: 60px 0; }
        .manage-cta { display: inline-block; margin-top: 16px; background: #B07A8E; color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 0.9rem; font-weight: 600; }

        .manage-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }

        .mc { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
        .mc:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }

        .mc-thumb { display: block; aspect-ratio: 3/4; overflow: hidden; background: #F3F4F6; cursor: pointer; text-decoration: none; }
        .mc-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }
        .mc-thumb:hover .mc-thumb-img { transform: scale(1.03); }
        .mc-thumb-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; color: #9CA3AF; }

        .mc-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 12px; }
        .mc-info {}
        .mc-title { font-size: 0.95rem; font-weight: 600; color: #1F2937; margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mc-slug { font-size: 0.75rem; color: #9CA3AF; margin: 0; }
        .mc-date { font-size: 0.75rem; color: #6B7280; margin: 3px 0 0; }

        .mc-actions { display: flex; align-items: center; gap: 6px; }
        .mc-btn { display: flex; align-items: center; gap: 4px; padding: 7px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 600; text-decoration: none; border: none; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .mc-btn.share { background: #B07A8E; color: white; flex: 1; justify-content: center; }
        .mc-btn.share:hover { background: #9B6A7E; }
        .mc-btn.edit { background: #F3F4F6; color: #374151; flex: 1; justify-content: center; }
        .mc-btn.edit:hover { background: #E5E7EB; }

        .mc-dropdown { position: relative; }
        .mc-more-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; border: none; background: #F3F4F6; color: #6B7280; cursor: pointer; transition: all 0.15s; }
        .mc-more-btn:hover { background: #E5E7EB; color: #374151; }
        .mc-dropdown-menu { position: absolute; right: 0; bottom: 100%; margin-bottom: 6px; background: white; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); border: 1px solid #E5E7EB; min-width: 150px; z-index: 100; overflow: hidden; }
        .mc-dropdown-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 11px 16px; border: none; background: none; font-size: 0.82rem; color: #374151; cursor: pointer; font-family: inherit; transition: background 0.1s; text-align: left; }
        .mc-dropdown-item:hover { background: #F3F4F6; }
        .mc-dropdown-item.delete { color: #DC2626; }
        .mc-dropdown-item.delete:hover { background: #FEF2F2; }

        /* Share Modal */
        .share-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; }
        .share-modal { background: white; border-radius: 20px; padding: 36px; max-width: 440px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .share-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .share-modal-header h3 { font-size: 1.3rem; font-weight: 700; color: #1F2937; margin: 0; }
        .share-modal-close { background: none; border: none; cursor: pointer; color: #9CA3AF; padding: 4px; }
        .share-modal-qr { display: flex; flex-direction: column; align-items: center; padding: 28px; background: #FAFAFA; border-radius: 16px; margin-bottom: 20px; }
        .share-qr-svg { width: 180px; height: 180px; }
        .share-modal-qr-hint { font-size: 0.85rem; color: #9CA3AF; margin: 16px 0 0; }
        .share-modal-url { margin-bottom: 20px; }
        .share-modal-url-input { width: 100%; padding: 12px 14px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.88rem; color: #6B7280; background: #F9FAFB; box-sizing: border-box; font-family: monospace; }
        .share-modal-actions { display: flex; gap: 10px; }
        .share-modal-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; border-radius: 12px; font-size: 1rem; font-weight: 600; border: none; cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .share-modal-btn.copy { background: #F3F4F6; color: #374151; }
        .share-modal-btn.copy:hover { background: #E5E7EB; }
        .share-modal-btn.url-share { background: #B07A8E; color: white; }
        .share-modal-btn.url-share:hover { background: #9B6A7E; }
        .share-modal-btn.kakao { background: #FEE500; color: #3C1E1E; }
        .share-modal-btn.kakao:hover { filter: brightness(0.95); }

        /* Slug Change Modal */
        .slug-modal { max-width: 400px; }
        .slug-modal-hint { font-size: 0.85rem; color: #6B7280; margin: 0 0 16px; line-height: 1.5; }
        .slug-modal-preview { display: flex; align-items: center; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 4px 12px; margin-bottom: 8px; }
        .slug-modal-prefix { font-size: 0.78rem; color: #9CA3AF; white-space: nowrap; font-family: monospace; }
        .slug-modal-input { flex: 1; border: none; background: none; padding: 10px 4px; font-size: 0.9rem; color: #1F2937; font-family: monospace; outline: none; min-width: 0; }
        .slug-modal-error { font-size: 0.78rem; color: #DC2626; margin: 0 0 8px; }
        .slug-modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .slug-modal-btn { flex: 1; padding: 12px; border-radius: 10px; font-size: 0.9rem; font-weight: 600; border: none; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .slug-modal-btn.cancel { background: #F3F4F6; color: #6B7280; }
        .slug-modal-btn.cancel:hover { background: #E5E7EB; }
        .slug-modal-btn.confirm { background: #B07A8E; color: white; }
        .slug-modal-btn.confirm:hover { background: #9B6A7E; }
        .slug-modal-btn.confirm:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 600px) {
          .manage-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .mc-body { padding: 10px 12px 12px; }
          .mc-title { font-size: 0.85rem; }
          .mc-btn { padding: 6px 8px; font-size: 0.72rem; }
          .share-modal { padding: 20px; max-width: 100%; }
          .share-modal-header { margin-bottom: 16px; }
          .share-modal-header h3 { font-size: 1rem; }
          .share-modal-qr { padding: 16px; margin-bottom: 14px; }
          .share-qr-svg { width: 130px; height: 130px; }
          .share-modal-qr-hint { font-size: 0.72rem; margin: 10px 0 0; }
          .share-modal-url { margin-bottom: 14px; }
          .share-modal-url-input { padding: 8px 10px; font-size: 0.72rem; }
          .share-modal-actions { gap: 8px; }
          .share-modal-btn { padding: 12px 8px; font-size: 0.8rem; gap: 5px; }
        }
        @media (max-width: 380px) {
          .manage-grid { grid-template-columns: 1fr; max-width: 280px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
};

export default ManagePage;
