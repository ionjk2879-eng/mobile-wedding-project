import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMyInvitations, deleteInvitation, changeSlug, redeemActivationCode } from '../services/invitationService';
import { InvitationData } from '../types';
import { toast } from '../stores/useToastStore';
import { Edit3, Share2, Link as LinkIcon, X, MoreVertical, ClipboardList, Trash2, Globe, ShoppingCart, BookOpen, Heart, KeyRound } from 'lucide-react';
import { downloadGuestbookPdf } from '../utils/exportGuestbookPdf';
import { formatShareDate, formatShareDateJa } from '../utils/formatShareDateTime';
import { QRCodeSVG } from 'qrcode.react';
import SiteHeader from '../components/SiteHeader';
import ToastContainer from '../components/Toast';
import { useSiteLang } from '../i18n';

const SITE_ORIGIN = 'https://sonett.kr';
const NAVER_STORE_URL = 'https://smartstore.naver.com/sonett/products/13648852696';

const ShareModal: React.FC<{ slug: string; onClose: () => void }> = ({ slug, onClose }) => {
  const { t } = useSiteLang();
  const tm = t.manage;
  const shareUrl = `${SITE_ORIGIN}/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success(tm.linkCopied);
  };

  const handleUrlShare = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success(tm.urlCopied);
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>{tm.shareInvitation}</h3>
          <button className="share-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="share-modal-qr">
          <QRCodeSVG value={shareUrl} size={140} level="M" bgColor="transparent" fgColor="#1F2937" className="share-qr-svg" />
          <p className="share-modal-qr-hint">{tm.qrHint}</p>
        </div>
        <div className="share-modal-url">
          <input type="text" readOnly value={shareUrl} className="share-modal-url-input" />
        </div>
        <div className="share-modal-actions">
          <button className="share-modal-btn copy" onClick={handleCopyLink}><LinkIcon size={18} /> {tm.copyLink}</button>
          <button className="share-modal-btn url-share" onClick={handleUrlShare}><Share2 size={18} /> {tm.urlShare}</button>
        </div>
      </div>
    </div>
  );
};

const SlugChangeModal: React.FC<{ slug: string; onDone: () => void; onClose: () => void }> = ({ slug, onDone, onClose }) => {
  const { t } = useSiteLang();
  const tm = t.manage;
  const [newSlug, setNewSlug] = useState(slug);
  const [saving, setSaving] = useState(false);
  const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug) && newSlug !== slug;

  const handleSubmit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await changeSlug(slug, newSlug);
      toast.success(tm.changeSuccess.replace('{slug}', newSlug));
      onDone();
    } catch (err: any) {
      toast.error(err?.message || tm.changeFailed);
    }
    setSaving(false);
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="slug-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>{tm.changeAddress}</h3>
          <button className="share-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="slug-modal-desc">{tm.changeAddressDesc}</p>
        <div className="slug-modal-current">
          <span className="slug-modal-label">{tm.currentAddress}</span>
          <span className="slug-modal-value">sonett.kr/{slug}</span>
        </div>
        <div className="slug-modal-field">
          <span className="slug-modal-label">{tm.newAddress}</span>
          <div className="slug-modal-input-wrap">
            <span className="slug-modal-prefix">sonett.kr/</span>
            <input
              type="text"
              className="slug-modal-input"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="new-slug"
            />
          </div>
          {newSlug && !(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)) && (
            <p className="slug-modal-hint error">{tm.addressHint}</p>
          )}
        </div>
        <div className="slug-modal-actions">
          <button className="slug-modal-btn cancel" onClick={onClose}>{tm.cancel}</button>
          <button className="slug-modal-btn confirm" disabled={!valid || saving} onClick={handleSubmit}>
            {saving ? tm.confirming : tm.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};

// 구매 후 발급받은 활성화 코드를 고객이 직접 입력해 유료 전환하는 셀프서비스 폼.
const CodeRedeemForm: React.FC<{ slug: string; onActivated: () => void }> = ({ slug, onActivated }) => {
  const { t } = useSiteLang();
  const tm = t.manage;
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed || redeeming) return;
    setRedeeming(true);
    try {
      await redeemActivationCode(slug, trimmed);
      toast.success(tm.codeActivateSuccess);
      setCode('');
      onActivated();
    } catch (err: any) {
      toast.error(err?.message || tm.codeActivateFailed);
    }
    setRedeeming(false);
  };

  return (
    <div className="mc-code-redeem">
      <span className="mc-code-redeem-label"><KeyRound size={11} /> {tm.haveCodeLabel}</span>
      <div className="mc-code-redeem-row">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
          placeholder={tm.codePlaceholder}
          className="mc-code-redeem-input"
          maxLength={12}
        />
        <button
          type="button"
          className="mc-code-redeem-btn"
          onClick={handleRedeem}
          disabled={!code.trim() || redeeming}
        >
          {redeeming ? tm.activatingCode : tm.activateCode}
        </button>
      </div>
    </div>
  );
};

const CardDropdown: React.FC<{ slug: string; isPaid?: boolean; data: InvitationData; onDelete: () => void; onChangeSlug: () => void }> = ({ slug, isPaid, data, onDelete, onChangeSlug }) => {
  const { t } = useSiteLang();
  const tm = t.manage;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isWeddingPast = data.weddingDateISO
    ? new Date(data.weddingDateISO).getTime() < Date.now()
    : false;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="mc-dropdown" ref={ref}>
      <button className="mc-action-btn mc-more-btn" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="mc-dropdown-menu" onClick={(e) => e.stopPropagation()}>
          {isPaid && (
            <button className="mc-dropdown-item highlight" onClick={() => {
              setOpen(false);
              downloadGuestbookPdf(data)
                .then(() => {})
                .catch((e: Error) => toast.error(e.message || tm.guestbookPdf));
            }}>
              <BookOpen size={14} /> {tm.guestbookPdf}
            </button>
          )}
          {isPaid && isWeddingPast && (
            <a href={`/${slug}?mode=anniversary`} target="_blank" rel="noopener noreferrer" className="mc-dropdown-item" onClick={() => setOpen(false)}>
              <Heart size={14} /> 기념일 모드
            </a>
          )}
          {isPaid && isWeddingPast && (
            <button className="mc-dropdown-item" onClick={() => { setOpen(false); navigate(`/manage/${slug}/anniversary`); }}>
              <Edit3 size={14} /> 기념일 모드 편집
            </button>
          )}
          <button className="mc-dropdown-item" onClick={() => { setOpen(false); onChangeSlug(); }}>
            <Globe size={14} /> {tm.changeUrl}
          </button>
          <a href={`/admin/${slug}`} target="_blank" rel="noopener noreferrer" className="mc-dropdown-item" onClick={() => setOpen(false)}>
            <ClipboardList size={14} /> {tm.viewResponses}
          </a>
          <button className="mc-dropdown-item danger" onClick={() => { setOpen(false); onDelete(); }}>
            <Trash2 size={14} /> {tm.delete}
          </button>
        </div>
      )}
    </div>
  );
};

// data.date는 항상 영문 요일("2026. 10. 24. SAT")로 저장돼 있다(DateTimeSection.tsx).
// 실제 청첩장(Opening.tsx의 서브텍스트)이 언어별로 요일을 로컬라이즈해 보여주는 것과
// 동일하게, 관리 카드에서도 language가 ko/ja면 그에 맞는 요일 표기로 바꿔서 보여준다.
function formatCardDate(data: InvitationData): string {
  if (data.language === 'ko' && data.weddingDateISO) return formatShareDate(data.weddingDateISO) || data.date;
  if (data.language === 'ja' && data.weddingDateISO) return formatShareDateJa(data.weddingDateISO) || data.date;
  return data.date;
}

function getExpiryInfo(data: InvitationData, expiredLabel: string): { label: string; urgent: boolean } | null {
  if (data.isPaid || !data.expiresAt) return null;
  // 밀리초 단위 잔여시간을 그대로 Math.ceil하면, 생성 직후 기기 시계의 몇 초~몇 분 오차만으로도
  // "실제로는 7일 남았는데 잠깐 D-8로 보였다가 금방 D-7로 바뀌는" 현상이 생길 수 있었다.
  // 시:분:초를 버리고 달력 날짜 차이(자정 기준)로만 계산하면 같은 날 안에서는 값이 절대
  // 바뀌지 않는다 — 자정을 넘어야만(실제로 하루가 지나야만) 숫자가 줄어든다.
  const today = new Date();
  const expiry = new Date(data.expiresAt);
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const expiryUTC = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  const diff = Math.round((expiryUTC - todayUTC) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: expiredLabel, urgent: true };
  if (diff <= 30) return { label: `D-${diff}`, urgent: diff <= 3 };
  return null;
}

const ManagePage: React.FC = () => {
  const { t } = useSiteLang();
  const tm = t.manage;
  const [invitations, setInvitations] = useState<{ slug: string; data: InvitationData }[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [changeSlugTarget, setChangeSlugTarget] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const load = () => {
    fetchMyInvitations()
      .then(list => setInvitations(
        [...list].sort((a, b) => (b.data.isPaid ? 1 : 0) - (a.data.isPaid ? 1 : 0))
      ))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`'${slug}' ${tm.delete}?`)) return;
    try {
      await deleteInvitation(slug);
      toast.success(`'${slug}' ${tm.deleteSuccess}`);
      load();
    } catch {
      toast.error(tm.deleteFailed);
    }
  };

  const shareTarget = shareSlug ? invitations.find((i) => i.slug === shareSlug) : null;

  const paidCount = invitations.filter(i => i.data.isPaid).length;
  const unpaidCount = invitations.length - paidCount;
  const filteredInvitations = invitations.filter(({ data }) => {
    if (filter === 'paid') return !!data.isPaid;
    if (filter === 'unpaid') return !data.isPaid;
    return true;
  });

  return (
    <div className="manage">
      <SiteHeader />
      <ToastContainer />
      <main className="manage-main">
        <div className="manage-title-row">
          <h2 className="manage-title">{tm.myInvitations}</h2>
          <Link to="/editor" className="manage-new-btn">{tm.newInvitation}</Link>
        </div>
        {!loading && invitations.length > 0 && (
          <div className="manage-filter-tabs">
            <button className={`manage-filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              {tm.filterAll} <span className="manage-filter-count">{invitations.length}</span>
            </button>
            <button className={`manage-filter-tab ${filter === 'paid' ? 'active' : ''}`} onClick={() => setFilter('paid')}>
              {tm.filterPaid} <span className="manage-filter-count">{paidCount}</span>
            </button>
            <button className={`manage-filter-tab ${filter === 'unpaid' ? 'active' : ''}`} onClick={() => setFilter('unpaid')}>
              {tm.filterUnpaid} <span className="manage-filter-count">{unpaidCount}</span>
            </button>
          </div>
        )}
        {!loading && filter !== 'paid' && invitations.some(i => !i.data.isPaid) && (
          <p className="manage-notice">{tm.unpaidNotice}</p>
        )}
        {loading ? (
          <p className="manage-empty">{tm.loading}</p>
        ) : invitations.length === 0 ? (
          <div className="manage-empty">
            <p>{tm.empty}</p>
            <Link to="/editor" className="manage-cta">{tm.createFirst}</Link>
          </div>
        ) : filteredInvitations.length === 0 ? (
          <p className="manage-empty">{tm.filterEmpty}</p>
        ) : (
          <div className="mc-grid">
            {filteredInvitations.map(({ slug, data }) => (
              <div key={slug} className="mc-card">
                <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" className="mc-thumb-link">
                  <div className="mc-thumb">
                    {data.heroPhoto ? (
                      <img
                        src={data.heroPhoto}
                        alt=""
                        className="mc-thumb-img"
                        style={{ objectPosition: `${data.heroPhotoX ?? 50}% ${data.heroPhotoY ?? 50}%` }}
                      />
                    ) : (
                      <div className="mc-thumb-empty">
                        <span>{tm.noPhoto}</span>
                      </div>
                    )}
                    <div className="mc-thumb-overlay">
                      <span>{tm.viewInvitation}</span>
                    </div>
                  </div>
                </a>
                <div className="mc-body">
                  <div className="mc-info">
                    <h3 className="mc-name">
                      {data.groomName && data.brideName
                        ? `${data.groomName} & ${data.brideName}`
                        : slug}
                    </h3>
                    {data.date && <p className="mc-date">{formatCardDate(data)}</p>}
                    <p className="mc-slug">sonett.kr/{slug}</p>
                  </div>
                  {!data.isPaid && (
                    <div className="mc-purchase-section">
                      <a href={NAVER_STORE_URL} target="_blank" rel="noopener noreferrer" className="mc-purchase-btn">
                        <ShoppingCart size={13} /> {tm.buyOnKmong}
                      </a>
                      <div className="mc-slug-guide">
                        <span className="mc-slug-guide-text">{tm.buyGuideText}</span>
                        <button
                          className="mc-slug-copy-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(slug);
                            toast.success(tm.linkCopied);
                          }}
                        >
                          <span className="mc-slug-copy-code">sonett.kr/{slug}</span>
                          <span className="mc-slug-copy-label">{tm.copy}</span>
                        </button>
                      </div>
                      <CodeRedeemForm slug={slug} onActivated={load} />
                    </div>
                  )}
                  <div className="mc-actions">
                    <button className="mc-action-btn mc-share-btn" onClick={() => setShareSlug(slug)}>
                      <Share2 size={12} /> {tm.share}
                    </button>
                    <Link to={`/edit/${slug}`} className="mc-action-btn mc-edit-btn">
                      <Edit3 size={12} /> {tm.edit}
                    </Link>
                    {(() => {
                      const expiry = getExpiryInfo(data, tm.expiredLabel);
                      return expiry
                        ? <span className={`mc-expiry-badge ${expiry.urgent ? 'urgent' : ''}`}>{expiry.label}</span>
                        : <span className="mc-expiry-badge mc-expiry-empty" />;
                    })()}
                    <CardDropdown
                      slug={slug}
                      isPaid={!!data.isPaid}
                      data={data}
                      onDelete={() => handleDelete(slug)}
                      onChangeSlug={() => setChangeSlugTarget(slug)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {shareTarget && (
        <ShareModal slug={shareTarget.slug} onClose={() => setShareSlug(null)} />
      )}

      {changeSlugTarget && (
        <SlugChangeModal
          slug={changeSlugTarget}
          onClose={() => setChangeSlugTarget(null)}
          onDone={() => { setChangeSlugTarget(null); load(); }}
        />
      )}


      <style>{`
        .manage {
          min-height: 100vh;
          background: #EBEBEB;
          font-family: 'Pretendard', sans-serif;
        }
        .manage-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 24px;
        }
        .manage-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 0 28px;
        }
        .manage-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0;
        }
        .manage-new-btn {
          display: inline-flex;
          align-items: center;
          padding: 8px 18px;
          background: #B07A8E;
          color: white;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: opacity 0.2s;
        }
        .manage-new-btn:hover { opacity: 0.85; }
        .manage-filter-tabs {
          display: flex;
          gap: 4px;
          margin: -8px 0 20px;
          background: #F3F4F6;
          border-radius: 12px;
          padding: 4px;
          width: fit-content;
        }
        .manage-filter-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 9px;
          background: none;
          font-size: 0.84rem;
          font-weight: 600;
          color: #6B7280;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .manage-filter-tab:hover:not(.active) {
          color: #374151;
        }
        .manage-filter-tab.active {
          background: white;
          color: #B07A8E;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .manage-filter-count {
          font-size: 0.72rem;
          font-weight: 700;
          color: inherit;
          opacity: 0.65;
        }
        .manage-notice {
          margin: -12px 0 20px;
          padding: 10px 14px;
          background: #FEF3C7;
          border-radius: 8px;
          font-size: 0.82rem;
          color: #92400E;
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

        /* Card grid */
        .mc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        .mc-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .mc-card:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        /* Thumbnail */
        .mc-thumb-link {
          display: block;
          text-decoration: none;
        }
        .mc-thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #F3F4F6;
        }
        .mc-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .mc-thumb-empty {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D1D5DB;
          font-size: 0.85rem;
          background: linear-gradient(135deg, #F9FAFB, #F3F4F6);
        }
        .mc-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .mc-thumb-overlay span {
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 10px 24px;
          border: 1.5px solid rgba(255,255,255,0.8);
          border-radius: 30px;
        }
        .mc-thumb-link:hover .mc-thumb-overlay {
          opacity: 1;
        }

        /* Body */
        .mc-body {
          padding: 16px;
        }
        .mc-info {
          margin-bottom: 14px;
        }
        .mc-name {
          font-size: 1rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 4px;
        }
        .mc-date {
          font-size: 0.82rem;
          color: #6B7280;
          margin: 0 0 2px;
        }
        .mc-slug {
          font-size: 0.75rem;
          color: #9CA3AF;
          margin: 0;
        }
        .mc-expiry-badge {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 4px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 600;
          background: #F3F4F6;
          color: #6B7280;
          white-space: nowrap;
        }
        .mc-expiry-badge.urgent {
          background: #FEF2F2;
          color: #DC2626;
        }
        .mc-expiry-empty {
          background: transparent;
        }
        .mc-purchase-section {
          margin: 10px 0 4px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .mc-purchase-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          width: 100%;
          padding: 9px 0;
          border-radius: 10px;
          background: linear-gradient(135deg, #B07A8E, #C994A8);
          color: white;
          font-size: 0.78rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          justify-content: center;
          font-family: inherit;
          transition: opacity 0.15s;
          text-decoration: none;
        }
        .mc-purchase-btn:hover { opacity: 0.88; }
        .mc-slug-guide {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px 10px;
          background: #FDF6F9;
          border-radius: 8px;
          border: 1px solid #F3E0E6;
        }
        .mc-slug-guide-text {
          font-size: 0.68rem;
          color: #9CA3AF;
        }
        .mc-slug-copy-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          padding: 5px 8px;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s;
          gap: 6px;
        }
        .mc-slug-copy-btn:hover { border-color: #B07A8E; }
        .mc-slug-copy-code {
          font-size: 0.7rem;
          color: #4B5563;
          font-family: monospace;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .mc-slug-copy-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #B07A8E;
          flex-shrink: 0;
        }
        .mc-code-redeem {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-top: 6px;
          padding-top: 8px;
          border-top: 1px dashed #F0E4E9;
        }
        .mc-code-redeem-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          color: #9CA3AF;
        }
        .mc-code-redeem-row {
          display: flex;
          gap: 6px;
        }
        .mc-code-redeem-input {
          flex: 1;
          min-width: 0;
          padding: 7px 9px;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          font-size: 0.75rem;
          font-family: monospace;
          letter-spacing: 0.5px;
          color: #1F2937;
          box-sizing: border-box;
        }
        .mc-code-redeem-input:focus { outline: none; border-color: #B07A8E; }
        .mc-code-redeem-btn {
          flex-shrink: 0;
          padding: 7px 12px;
          border: none;
          border-radius: 6px;
          background: #1F2937;
          color: white;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
        }
        .mc-code-redeem-btn:disabled { opacity: 0.4; cursor: default; }

        /* Actions */
        .mc-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: nowrap;
        }
        .mc-action-btn {
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 7px 4px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          text-decoration: none;
          font-family: inherit;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .mc-share-btn {
          flex: 1;
          justify-content: center;
          background: #B07A8E;
          color: white;
        }
        .mc-share-btn:hover {
          background: #9B6A7E;
        }
        .mc-edit-btn {
          flex: 1;
          justify-content: center;
          background: #F3F4F6;
          color: #4B5563;
        }
        .mc-edit-btn:hover {
          background: #E5E7EB;
          color: #1F2937;
        }
        .mc-more-btn {
          background: #F3F4F6;
          color: #9CA3AF;
          padding: 7px 8px;
          flex-shrink: 0;
        }
        .mc-more-btn:hover {
          background: #E5E7EB;
          color: #4B5563;
        }

        /* Dropdown */
        .mc-dropdown {
          position: relative;
          margin-left: auto;
        }
        .mc-dropdown-menu {
          position: absolute;
          bottom: calc(100% + 6px);
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.12);
          border: 1px solid #F0F0F0;
          min-width: 140px;
          padding: 4px;
          z-index: 50;
          animation: mc-menu-in 0.12s ease;
        }
        @keyframes mc-menu-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mc-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 14px;
          border: none;
          border-radius: 8px;
          background: none;
          font-size: 0.82rem;
          font-weight: 600;
          color: #4B5563;
          cursor: pointer;
          text-decoration: none;
          font-family: inherit;
          transition: all 0.12s;
          box-sizing: border-box;
          white-space: nowrap;
        }
        .mc-dropdown-item:hover {
          background: #F9FAFB;
          color: #1F2937;
        }
        .mc-dropdown-item.danger {
          color: #DC2626;
        }
        .mc-dropdown-item.danger:hover {
          background: #FEF2F2;
          color: #B91C1C;
        }
        .mc-dropdown-item.highlight {
          color: #B07A8E;
          font-weight: 700;
        }
        .mc-dropdown-item.highlight:hover {
          background: #FDF6F9;
          color: #9B6A7E;
        }

        /* Share Modal */
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
        .share-modal-btn.url-share {
          background: #B07A8E;
          color: white;
        }
        .share-modal-btn.url-share:hover { background: #9B6A7E; }

        @media (max-width: 600px) {
          .manage-filter-tabs {
            width: 100%;
            overflow-x: auto;
          }
          .manage-filter-tab {
            padding: 7px 12px;
            font-size: 0.78rem;
          }
          .mc-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .mc-body { padding: 12px; }
          .mc-name { font-size: 0.88rem; }
          .mc-action-btn { padding: 6px 10px; font-size: 0.72rem; }
          .mc-more-btn { padding: 6px; }
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
        @media (max-width: 400px) {
          .mc-grid {
            grid-template-columns: 1fr;
            max-width: 300px;
            margin: 0 auto;
          }
        }

        /* Slug Change Modal */
        .slug-modal {
          background: white;
          border-radius: 20px;
          padding: 32px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          font-family: 'Pretendard', sans-serif;
        }
        .slug-modal-desc {
          font-size: 0.85rem;
          color: #6B7280;
          margin: 0 0 20px;
          line-height: 1.5;
        }
        .slug-modal-current {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #F9FAFB;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .slug-modal-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #9CA3AF;
          flex-shrink: 0;
        }
        .slug-modal-value {
          font-size: 0.88rem;
          color: #374151;
          font-family: monospace;
        }
        .slug-modal-field {
          margin-bottom: 24px;
        }
        .slug-modal-input-wrap {
          display: flex;
          align-items: center;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 8px;
          transition: border-color 0.2s;
        }
        .slug-modal-input-wrap:focus-within {
          border-color: #B07A8E;
        }
        .slug-modal-prefix {
          padding: 12px 0 12px 14px;
          font-size: 0.88rem;
          color: #9CA3AF;
          font-family: monospace;
          flex-shrink: 0;
        }
        .slug-modal-input {
          flex: 1;
          padding: 12px 14px 12px 0;
          border: none;
          outline: none;
          font-size: 0.88rem;
          color: #1F2937;
          font-family: monospace;
          background: transparent;
        }
        .slug-modal-hint {
          font-size: 0.75rem;
          margin: 6px 0 0;
        }
        .slug-modal-hint.error {
          color: #DC2626;
        }
        .slug-modal-actions {
          display: flex;
          gap: 10px;
        }
        .slug-modal-btn {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          font-family: inherit;
          transition: all 0.2s;
        }
        .slug-modal-btn.cancel {
          background: #F3F4F6;
          color: #374151;
        }
        .slug-modal-btn.cancel:hover {
          background: #E5E7EB;
        }
        .slug-modal-btn.confirm {
          background: #B07A8E;
          color: white;
        }
        .slug-modal-btn.confirm:hover:not(:disabled) {
          background: #9B6A7E;
        }
        .slug-modal-btn.confirm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 480px) {
          .slug-modal { padding: 20px; }
        }
      `}</style>
    </div>
  );
};

export default ManagePage;