import React, { useState, useEffect, useRef } from 'react';
import { InvitationData, GuestMessage } from '../../types';
import { submitGuestMessage, fetchGuestMessages, deleteGuestMessage } from '../../firebase';
import { toast } from '../../stores/useToastStore';
import { getFirebaseErrorMessage } from '../../utils/firebaseError';
import { PreviewOverlay } from '../../hooks/usePreviewPopup';
import { MessageCircle, Send, Trash2 } from 'lucide-react';

interface PreviewProps { data: InvitationData; }

const Guestbook: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!data.slug || loaded) return;
    fetchGuestMessages(data.slug).then(setMessages).catch(() => {}).finally(() => setLoaded(true));
  }, [data.slug, loaded]);

  if (!data.isGuestbookEnabled) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    if (password.length !== 4 || !/^\d{4}$/.test(password)) { toast.warning(isEn ? '4-digit PIN required.' : '4자리 숫자 비밀번호를 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      await submitGuestMessage(data.slug || 'default', { name: name.trim(), content: content.trim(), password });
      setName(''); setContent(''); setPassword(''); setFormOpen(false);
      toast.success(isEn ? 'Message sent!' : '메시지가 등록되었습니다.');
      fetchGuestMessages(data.slug || 'default').then(setMessages).catch(() => {});
    } catch (err) { toast.error(getFirebaseErrorMessage(err)); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const slug = data.slug || 'default';
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

  const formatDate = (ts: string | { seconds: number }) => {
    try { const d = typeof ts === 'object' && 'seconds' in ts ? new Date(ts.seconds * 1000) : new Date(ts); return d.toLocaleDateString('ko', { month: 'short', day: 'numeric' }); } catch { return ''; }
  };

  return (
    <section className="guestbook-section section" style={{ fontFamily: data.fontFamily }} ref={sectionRef} aria-label="방명록">
      <h2>GUESTBOOK</h2>
      <p className="section-sub">{isEn ? 'Leave a message for the couple' : '방명록'}</p>
      <button type="button" className="pf-open-btn" onClick={() => setFormOpen(true)}>{isEn ? 'Write a Message' : '방명록 작성하기'}</button>

      {messages.length > 0 && (
        <div className="gb-list">
          {messages.map((msg) => (
            <div key={msg.id} className="gb-item">
              <div className="gb-item-header">
                <MessageCircle size={14} /><strong>{msg.name}</strong>
                {msg.createdAt && <span className="gb-date">{formatDate(msg.createdAt)}</span>}
                <button type="button" className="gb-delete-btn" onClick={() => { setDeleteTarget(msg.id); setDeletePassword(''); }}><Trash2 size={13} /></button>
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
      )}

      <PreviewOverlay open={formOpen} onClose={() => setFormOpen(false)} anchorRef={sectionRef} title={isEn ? 'Write a Message' : '축하 메시지를 남겨주세요'}>
        <form onSubmit={handleSubmit}>
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
        .gb-list { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
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
      `}</style>
    </section>
  );
}, (prev, next) => prev.data.isGuestbookEnabled === next.data.isGuestbookEnabled && prev.data.guestbookPassword === next.data.guestbookPassword && prev.data.slug === next.data.slug && prev.data.language === next.data.language && prev.data.fontFamily === next.data.fontFamily);

export default Guestbook;
