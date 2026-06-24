import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyInvitations, deleteInvitation } from '../firebase';
import { InvitationData } from '../types';
import { toast } from '../stores/useToastStore';
import { Edit3, Eye, ClipboardList, Trash2, Share2, Link as LinkIcon, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import SiteHeader from '../components/SiteHeader';
import ToastContainer from '../components/Toast';
import { loadKakaoSDK } from '../utils/loadScript';

const SITE_ORIGIN = 'https://sonett.ionjk2879.workers.dev';

const ShareModal: React.FC<{ slug: string; data: InvitationData; onClose: () => void }> = ({ slug, data, onClose }) => {
  const shareUrl = `${SITE_ORIGIN}/w/${slug}`;
  const title = data.shareTitle || `${data.groomName || '신랑'} ♡ ${data.brideName || '신부'} 결혼합니다`;
  const description = data.shareDescription || `${data.date} ${data.time} | ${data.venueName}`;

  useEffect(() => { loadKakaoSDK().catch(() => {}); }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('링크가 복사되었습니다.');
  };

  const handleKakaoShare = () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      toast.error('카카오 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    const imageUrl = data.heroPhoto && !data.heroPhoto.startsWith('data:') ? data.heroPhoto : `${SITE_ORIGIN}/og-image.png`;
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl,
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
      buttons: [{ title: '청첩장 보기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }],
    });
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
          <button className="share-modal-btn copy" onClick={handleCopyLink}>
            <LinkIcon size={18} /> 링크 복사
          </button>
          <button className="share-modal-btn kakao" onClick={handleKakaoShare}>
            <Share2 size={18} /> 카카오톡 공유
          </button>
        </div>
      </div>
    </div>
  );
};

const ManagePage: React.FC = () => {
  const [invitations, setInvitations] = useState<{ slug: string; data: InvitationData }[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareSlug, setShareSlug] = useState<string | null>(null);

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
          <div className="manage-list">
            {invitations.map(({ slug, data }) => (
              <div key={slug} className="manage-card">
                <div className="manage-card-info">
                  <h3 className="manage-card-title">
                    {data.groomName && data.brideName
                      ? `${data.groomName} & ${data.brideName}`
                      : slug}
                  </h3>
                  <p className="manage-card-slug">/w/{slug}</p>
                  {data.date && <p className="manage-card-date">{data.date}</p>}
                </div>
                <div className="manage-card-actions">
                  <button className="manage-action share" onClick={() => setShareSlug(slug)}><Share2 size={16} /> 공유</button>
                  <Link to={`/edit/${slug}`} className="manage-action"><Edit3 size={16} /> 편집</Link>
                  <a href={`/w/${slug}`} target="_blank" rel="noopener noreferrer" className="manage-action"><Eye size={16} /> 보기</a>
                  <a href={`/admin/${slug}`} target="_blank" rel="noopener noreferrer" className="manage-action"><ClipboardList size={16} /> 응답</a>
                  <button className="manage-action delete" onClick={() => handleDelete(slug)}><Trash2 size={16} /> 삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {shareTarget && (
        <ShareModal slug={shareTarget.slug} data={shareTarget.data} onClose={() => setShareSlug(null)} />
      )}

      <style>{`
        .manage {
          min-height: 100vh;
          background: #F9FAFB;
          font-family: 'Pretendard', sans-serif;
        }
        .manage-main {
          max-width: 700px;
          margin: 0 auto;
          padding: 40px 24px;
        }
        .manage-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 24px;
        }
        .manage-empty {
          text-align: center;
          color: #9CA3AF;
          padding: 60px 0;
        }
        .manage-cta {
          display: inline-block;
          margin-top: 16px;
          background: #B07A8E;
          color: white;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .manage-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .manage-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .manage-card-info { flex: 1; }
        .manage-card-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1F2937;
          margin: 0 0 4px;
        }
        .manage-card-slug {
          font-size: 0.8rem;
          color: #9CA3AF;
          margin: 0;
        }
        .manage-card-date {
          font-size: 0.8rem;
          color: #6B7280;
          margin: 4px 0 0;
        }
        .manage-card-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .manage-action {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #6B7280;
          text-decoration: none;
          background: #F3F4F6;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .manage-action:hover { background: #E5E7EB; color: #374151; }
        .manage-action.share { background: #B07A8E; color: white; }
        .manage-action.share:hover { background: #9B6A7E; }
        .manage-action.delete:hover { background: #FEE2E2; color: #DC2626; }

        /* Share Modal — PC: 크게, 모바일: 작게 */
        .share-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }
        .share-modal {
          background: white;
          border-radius: 20px;
          padding: 36px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .share-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }
        .share-modal-header h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0;
        }
        .share-modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #9CA3AF;
          padding: 4px;
        }
        .share-modal-qr {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px;
          background: #FAFAFA;
          border-radius: 16px;
          margin-bottom: 20px;
        }
        .share-qr-svg { width: 180px; height: 180px; }
        .share-modal-qr-hint {
          font-size: 0.85rem;
          color: #9CA3AF;
          margin: 16px 0 0;
        }
        .share-modal-url {
          margin-bottom: 20px;
        }
        .share-modal-url-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          font-size: 0.88rem;
          color: #6B7280;
          background: #F9FAFB;
          box-sizing: border-box;
          font-family: monospace;
        }
        .share-modal-actions {
          display: flex;
          gap: 10px;
        }
        .share-modal-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .share-modal-btn.copy {
          background: #F3F4F6;
          color: #374151;
        }
        .share-modal-btn.copy:hover { background: #E5E7EB; }
        .share-modal-btn.kakao {
          background: #FEE500;
          color: #3C1E1E;
        }
        .share-modal-btn.kakao:hover { filter: brightness(0.95); }

        @media (max-width: 600px) {
          .manage-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .manage-card-actions {
            width: 100%;
            flex-wrap: wrap;
          }
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
      `}</style>
    </div>
  );
};

export default ManagePage;
