import React, { useState, useEffect, useRef } from 'react';
import { InvitationData, GuestMessage } from '../../types';
import { submitGuestMessage, fetchGuestMessages, deleteGuestMessage } from '../../firebase';
import { toast } from '../../stores/useToastStore';
import { getFirebaseErrorMessage } from '../../utils/firebaseError';
import { PreviewOverlay } from '../../hooks/usePreviewPopup';
import { MessageCircle, Send, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface PreviewProps { data: InvitationData; }

const MessageSlider: React.FC<{
  messages: GuestMessage[];
  isEn: boolean;
  onDelete: (id: string) => void;
  deleteTarget: string | null;
  deletePassword: string;
  setDeleteTarget: (id: string | null) => void;
  setDeletePassword: (pw: string) => void;
  handleDelete: () => void;
}> = ({ messages, isEn, onDelete, deleteTarget, deletePassword, setDeleteTarget, setDeletePassword, handleDelete }) => {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.max(1, Math.ceil(messages.length / perPage));
  const paged = messages.slice(page * perPage, (page + 1) * perPage);

  const formatDate = (ts: string | { seconds: number }) => {
    try { const d = typeof ts === 'object' && 'seconds' in ts ? new Date(ts.seconds * 1000) : new Date(ts); return d.toLocaleDateString('ko', { month: 'short', day: 'numeric' }); } catch { return ''; }
  };

  if (messages.length === 0) {
    return <p className="gb-empty">{isEn ? 'No messages yet.' : '아직 메시지가 없습니다.'}</p>;
  }

  return (
    <div className="gb-slider">
      <div className="gb-slide-list">
        {paged.map((msg) => (
          <div key={msg.id} className="gb-item">
            <div className="gb-item-header">
              <MessageCircle size={14} /><strong>{msg.name}</strong>
              {msg.createdAt && <span className="gb-date">{formatDate(msg.createdAt)}</span>}
              <button type="button" className="gb-delete-btn" onClick={() => onDelete(msg.id)}><Trash2 size={13} /></button>
            </div>
            <p className="gb-content">{msg.content}</p>
            {deleteTarget === msg.id && (
              <div className="gb-delete-form">
                <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="gb-del-input" placeholder={isEn ? 'Password' : '비밀번호'} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(); if (e.key === 'Escape') { setDeleteTarget(null); setDeletePassword(''); } }} />
                <button type="button" className="gb-del-confirm" onClick={handleDelete}>{isEn ? 'Delete' : '삭제'}</button>
                <button type="button" className="gb-del-cancel" onClick={() => { setDeleteTarget(null); setDeletePassword(''); }}>{isEn ? 'Cancel' : '취소'}</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="gb-pager">
          <button className="gb-pager-btn" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={18} /></button>
          <span className="gb-pager-info">{page + 1} / {totalPages}</span>
          <button className="gb-pager-btn" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight size={18} /></button>
        </div>
      )}
    </div>
  );
};

const Guestbook: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [side, setSide] = useState<'groom' | 'bride'>('groom');
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [activeTab, setActiveTab] = useState<'groom' | 'bride'>('groom');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!data.slug || loaded) return;
    fetchGuestMessages(data.slug).then(setMessages).catch(() => {}).finally(() => setLoaded(true));
  }, [data.slug, loaded]);

  if (!data.isGuestbookEnabled) return null;

  const groomMessages = messages.filter(m => m.side === 'groom' || (!m.side && true));
  const brideMessages = messages.filter(m => m.side === 'bride');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.slug) return;
    if (!name.trim() || !content.trim()) return;
    if (password.length !== 4 || !/^\d{4}$/.test(password)) { toast.warning(isEn ? '4-digit PIN required.' : '4자리 숫자 비밀번호를 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      await submitGuestMessage(data.slug, { name: name.trim(), content: content.trim(), password, side });
      setName(''); setContent(''); setPassword(''); setFormOpen(false);
      toast.success(isEn ? 'Message sent!' : '메시지가 등록되었습니다.');
      fetchGuestMessages(data.slug).then(setMessages).catch(() => {});
    } catch (err) { toast.error(getFirebaseErrorMessage(err)); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !data.slug) return;
    const slug = data.slug;
    const isAdmin = data.guestbookPassword && deletePassword === data.guestbookPassword;
    try {
      const ok = await deleteGuestMessage(slug, deleteTarget, deletePassword);
      if (ok || isAdmin) {
        if (!ok && isAdmin) { const { deleteDoc: d, doc: r } = await import('firebase/firestore'); const { db } = await import('../../firebase'); await d(r(db, `invitations/${slug}/guestbook`, deleteTarget)); }
        setMessages(prev => prev.filter(m => m.id !== deleteTarget));
        toast.success(isEn ? 'Deleted.' : '삭제되었습니다.');
      } else { toast.error(isEn ? 'Wrong password.' : '비밀번호가 일치하지 않습니다.'); return; }
    } catch (err) { toast.error(getFirebaseErrorMessage(err)); }
    setDeleteTarget(null); setDeletePassword('');
  };

  const groomLabel = data.groomName || (isEn ? 'Groom' : '신랑');
  const brideLabel = data.brideName || (isEn ? 'Bride' : '신부');

  return (
    <section className="guestbook-section section" style={{ fontFamily: data.fontFamily }} ref={sectionRef} aria-label="방명록">
      <h2>GUESTBOOK</h2>
      <p className="section-sub">{isEn ? 'Leave a message for the couple' : '방명록'}</p>
      {data.slug ? (
        <button type="button" className="pf-open-btn" onClick={() => setFormOpen(true)}>{isEn ? 'Write a Message' : '방명록 작성하기'}</button>
      ) : (
        <p className="gb-preview-notice">{isEn ? 'Save your invitation first to enable the guestbook.' : '청첩장을 저장하면 방명록이 활성화됩니다.'}</p>
      )}

      <div className="gb-tabs">
        <button className={`gb-tab ${activeTab === 'groom' ? 'active' : ''}`} onClick={() => setActiveTab('groom')}>
          {groomLabel}측 <span className="gb-tab-count">{groomMessages.length}</span>
        </button>
        <button className={`gb-tab ${activeTab === 'bride' ? 'active' : ''}`} onClick={() => setActiveTab('bride')}>
          {brideLabel}측 <span className="gb-tab-count">{brideMessages.length}</span>
        </button>
      </div>

      <MessageSlider
        messages={activeTab === 'groom' ? groomMessages : brideMessages}
        isEn={isEn}
        onDelete={(id) => { setDeleteTarget(id); setDeletePassword(''); }}
        deleteTarget={deleteTarget}
        deletePassword={deletePassword}
        setDeleteTarget={setDeleteTarget}
        setDeletePassword={setDeletePassword}
        handleDelete={handleDelete}
      />

      <PreviewOverlay open={formOpen} onClose={() => setFormOpen(false)} anchorRef={sectionRef} title={isEn ? 'Write a Message' : '축하 메시지를 남겨주세요'}>
        <form onSubmit={handleSubmit}>
          <div className="pf-group">
            <label className="pf-label">{isEn ? 'Side' : '구분'}</label>
            <div className="gb-side-pick">
              <button type="button" className={`gb-side-btn ${side === 'groom' ? 'active' : ''}`} onClick={() => setSide('groom')}>{groomLabel}측</button>
              <button type="button" className={`gb-side-btn ${side === 'bride' ? 'active' : ''}`} onClick={() => setSide('bride')}>{brideLabel}측</button>
            </div>
          </div>
          <div className="pf-row">
            <div className="pf-group"><label className="pf-label">{isEn ? 'Name' : '이름'}</label><input type="text" className="pf-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder={isEn ? 'Name' : '이름'} /></div>
            <div className="pf-group"><label className="pf-label">{isEn ? 'PIN' : '비밀번호'}</label><input type="password" inputMode="numeric" maxLength={4} className="pf-input" required value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder={isEn ? '4 digits' : '숫자 4자리'} /></div>
          </div>
          <div className="pf-group"><label className="pf-label">{isEn ? 'Message' : '메시지'}</label><textarea className="pf-input" rows={4} required value={content} onChange={(e) => setContent(e.target.value)} placeholder={isEn ? 'Write your message...' : '축하 메시지를 작성해주세요...'} /></div>
          <button type="submit" className="pf-submit" disabled={submitting}><Send size={16} /> {submitting ? (isEn ? 'Sending...' : '전송 중...') : (isEn ? 'Send' : '등록하기')}</button>
        </form>
      </PreviewOverlay>

      <style>{`
        .guestbook-section { background-color: transparent; }

        .gb-tabs { display: flex; gap: 0; margin-top: 20px; border-radius: 12px; overflow: hidden; border: 1px solid var(--wedding-border); }
        .gb-tab { flex: 1; padding: 12px 8px; background: var(--wedding-card-bg); border: none; font-size: 0.85em; font-weight: 600; color: var(--wedding-text-sub); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .gb-tab.active { background: var(--wedding-main); color: white; }
        .gb-tab-count { font-size: 0.8em; opacity: 0.7; }

        .gb-slider { margin-top: 14px; }
        .gb-slide-list { display: flex; flex-direction: column; gap: 10px; min-height: 80px; }
        .gb-empty { text-align: center; color: var(--wedding-text-sub); font-size: 0.85em; padding: 24px 0; }

        .gb-pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 14px; }
        .gb-pager-btn { background: var(--wedding-card-bg); border: 1px solid var(--wedding-border); border-radius: 10px; padding: 8px; cursor: pointer; color: var(--wedding-text-main); display: flex; align-items: center; transition: all 0.2s; }
        .gb-pager-btn:hover:not(:disabled) { border-color: var(--wedding-main); color: var(--wedding-main); }
        .gb-pager-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .gb-pager-info { font-size: 0.8em; color: var(--wedding-text-sub); font-weight: 600; }

        .gb-item { padding: 16px; background: var(--wedding-card-bg); border: 1px solid var(--wedding-border); border-radius: 16px; }
        .gb-item-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; color: var(--wedding-main); font-size: 0.85em; }
        .gb-item-header strong { color: var(--wedding-text-main); }
        .gb-date { margin-left: auto; color: var(--wedding-text-sub); font-size: 0.8em; }
        .gb-delete-btn { background: none; border: none; color: var(--wedding-text-sub); cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; margin-left: 6px; }
        .gb-delete-btn:hover { color: #EF4444; background: #FEF2F2; }
        .gb-content { margin: 0; font-size: 0.9em; line-height: 1.6; color: var(--wedding-text-body); white-space: pre-wrap; word-break: keep-all; }
        .gb-delete-form { display: flex; gap: 6px; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--wedding-border); }
        .gb-del-input { flex: 1; padding: 10px; border: 1px solid var(--wedding-border); border-radius: 10px; background: var(--wedding-bg); font-size: 0.82em; box-sizing: border-box; }
        .gb-del-input:focus { outline: none; border-color: var(--wedding-main); }
        .gb-del-confirm { padding: 10px 14px; background: #EF4444; color: white; border: none; border-radius: 10px; font-size: 0.8em; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .gb-del-cancel { padding: 10px 14px; background: var(--wedding-border); color: var(--wedding-text-sub); border: none; border-radius: 10px; font-size: 0.8em; font-weight: 700; cursor: pointer; white-space: nowrap; }

        .gb-side-pick { display: flex; gap: 8px; }
        .gb-side-btn { flex: 1; padding: 10px; border: 1px solid var(--wedding-border); border-radius: 10px; background: var(--wedding-card-bg); font-size: 0.85em; font-weight: 600; color: var(--wedding-text-sub); cursor: pointer; transition: all 0.2s; }
        .gb-side-btn.active { border-color: var(--wedding-main); background: var(--wedding-main); color: white; }
        .gb-preview-notice { font-size: 0.82em; color: var(--wedding-text-sub); text-align: center; padding: 12px; background: var(--wedding-card-bg); border: 1px dashed var(--wedding-border); border-radius: 12px; margin-top: 8px; }
      `}</style>
    </section>
  );
}, (prev, next) => prev.data.isGuestbookEnabled === next.data.isGuestbookEnabled && prev.data.guestbookPassword === next.data.guestbookPassword && prev.data.slug === next.data.slug && prev.data.language === next.data.language && prev.data.fontFamily === next.data.fontFamily && prev.data.groomName === next.data.groomName && prev.data.brideName === next.data.brideName);

export default Guestbook;
