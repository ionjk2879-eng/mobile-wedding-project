import React, { useState, useEffect, useRef } from 'react';
import { InvitationData, GuestMessage } from '../../types';
import { fetchGuestMessages, submitGuestMessage, deleteGuestMessage } from '../../services/guestbookService';
import { toast } from '../../stores/useToastStore';
import { PreviewOverlay } from '../../hooks/usePreviewPopup';
import { Send, Trash2 } from 'lucide-react';

interface PreviewProps { data: InvitationData; }

const NOTE_COLORS = ['#FFFDF0', '#FFF8F0', '#F8F5FF', '#F0FFF8'];
const NOTE_ROTATIONS = ['-1deg', '0.7deg', '-0.5deg', '1.2deg', '-0.8deg', '0.4deg'];

const formatDate = (ts: string | { seconds: number }) => {
  try {
    const d = typeof ts === 'object' && 'seconds' in ts ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleDateString('ko', { month: 'short', day: 'numeric' });
  } catch { return ''; }
};

const NoteSlider: React.FC<{
  messages: GuestMessage[];
  isEn: boolean;
  isJa: boolean;
  label: string;
  onDelete: (id: string) => void;
  deleteTarget: string | null;
  deletePassword: string;
  setDeleteTarget: (id: string | null) => void;
  setDeletePassword: (pw: string) => void;
  handleDelete: () => void;
}> = ({ messages, isEn, isJa, label, onDelete, deleteTarget, deletePassword, setDeleteTarget, setDeletePassword, handleDelete }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const didDrag = useRef(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || messages.length === 0) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const scrollLeft = el.scrollLeft;
    let closest = 0;
    let minDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft - scrollLeft);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIdx(closest);
  };

  const scrollTo = (idx: number) => {
    const el = scrollRef.current;
    if (!el || messages.length === 0) return;
    const card = el.children[idx] as HTMLElement | undefined;
    if (card) el.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    didDrag.current = false;
    dragStartX.current = e.clientX;
    dragScrollLeft.current = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 4) didDrag.current = true;
    scrollRef.current.scrollLeft = dragScrollLeft.current - dx;
  };

  const onMouseUp = () => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = false;
    el.style.cursor = '';
    el.style.userSelect = '';
  };

  return (
    <div className="gb-note-section">
      <p className="gb-note-label">
        {label} <span className="gb-tab-count">{messages.length}</span>
      </p>
      {messages.length === 0 ? (
        <p className="gb-empty">{isEn ? 'No messages yet.' : isJa ? 'まだメッセージがありません。' : '아직 메시지가 없습니다.'}</p>
      ) : (
        <>
          <div
            className="gb-note-scroll"
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{ cursor: 'grab' }}
          >
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className="gb-note"
                style={{
                  background: NOTE_COLORS[i % NOTE_COLORS.length],
                  transform: `rotate(${NOTE_ROTATIONS[i % NOTE_ROTATIONS.length]})`,
                }}
              >
                <div className="gb-note-header">
                  <strong className="gb-note-name">{msg.name}</strong>
                  <div className="gb-note-meta">
                    {msg.createdAt && <span className="gb-date">{formatDate(msg.createdAt)}</span>}
                    <button type="button" className="gb-delete-btn" onClick={() => onDelete(msg.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="gb-note-content">{msg.content}</p>
                {deleteTarget === msg.id && (
                  <div className="gb-delete-form">
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="gb-del-input"
                      placeholder={isEn ? 'Password' : isJa ? 'パスワード' : '비밀번호'}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleDelete();
                        if (e.key === 'Escape') { setDeleteTarget(null); setDeletePassword(''); }
                      }}
                    />
                    <button type="button" className="gb-del-confirm" onClick={handleDelete}>
                      {isEn ? 'Delete' : isJa ? '削除' : '삭제'}
                    </button>
                    <button type="button" className="gb-del-cancel" onClick={() => { setDeleteTarget(null); setDeletePassword(''); }}>
                      {isEn ? 'Cancel' : isJa ? 'キャンセル' : '취소'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {messages.length > 1 && (
            <div className="gb-dots">
              {messages.map((_, i) => (
                <button
                  key={i}
                  className={`gb-dot ${i === activeIdx ? 'active' : ''}`}
                  onClick={() => scrollTo(i)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Guestbook: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';
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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!data.slug || loaded) return;
    fetchGuestMessages(data.slug).then(setMessages).catch(() => {}).finally(() => setLoaded(true));
  }, [data.slug, loaded]);

  if (!data.isGuestbookEnabled) return null;

  const groomMessages = messages.filter(m => m.side === 'groom' || !m.side);
  const brideMessages = messages.filter(m => m.side === 'bride');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.slug) return;
    if (!name.trim() || !content.trim()) return;
    if (password.length !== 4 || !/^\d{4}$/.test(password)) {
      toast.warning(isEn ? '4-digit PIN required.' : isJa ? '4桁の数字を入力してください。' : '4자리 숫자 비밀번호를 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await submitGuestMessage(data.slug, { name: name.trim(), content: content.trim(), password, side });
      setName(''); setContent(''); setPassword(''); setFormOpen(false);
      toast.success(isEn ? 'Message sent!' : isJa ? 'メッセージを送信しました。' : '메시지가 등록되었습니다.');
      fetchGuestMessages(data.slug).then(setMessages).catch(() => {});
    } catch (err) { toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !data.slug) return;
    const slug = data.slug;
    const ok = await deleteGuestMessage(slug, deleteTarget, deletePassword);
    if (ok) {
      setMessages(prev => prev.filter(m => m.id !== deleteTarget));
      toast.success(isEn ? 'Deleted.' : isJa ? '削除しました。' : '삭제되었습니다.');
    } else {
      toast.error(isEn ? 'Wrong password.' : isJa ? 'パスワードが違います。' : '비밀번호가 일치하지 않습니다.');
    }
    setDeleteTarget(null); setDeletePassword('');
  };

  const groomLabel = isEn ? "Groom's Side" : isJa ? '新郎側' : '신랑측';
  const brideLabel = isEn ? "Bride's Side" : isJa ? '新婦側' : '신부측';

  const sliderProps = {
    isEn,
    isJa,
    onDelete: (id: string) => { setDeleteTarget(id); setDeletePassword(''); },
    deleteTarget,
    deletePassword,
    setDeleteTarget,
    setDeletePassword,
    handleDelete,
  };

  return (
    <section className="guestbook-section section" style={{ fontFamily: data.fontFamily }} ref={sectionRef} aria-label="방명록">
      <h2>GUESTBOOK</h2>
      <p className="section-sub">{isEn ? 'Leave a message for the couple' : isJa ? 'メッセージを残してください' : '방명록'}</p>

      {data.slug ? (
        <button type="button" className="pf-open-btn" onClick={() => setFormOpen(true)}>
          {isEn ? 'Write a Message' : isJa ? 'メッセージを書く' : '방명록 작성하기'}
        </button>
      ) : (
        <p className="gb-preview-notice">
          {isEn ? 'Save your invitation first to enable the guestbook.' : isJa ? '招待状を保存するとゲストブックが有効になります。' : '청첩장을 저장하면 방명록이 활성화됩니다.'}
        </p>
      )}

      <NoteSlider messages={groomMessages} label={groomLabel} {...sliderProps} />
      <div className="gb-section-divider" />
      <NoteSlider messages={brideMessages} label={brideLabel} {...sliderProps} />

      <PreviewOverlay open={formOpen} onClose={() => setFormOpen(false)} anchorRef={sectionRef} title={isEn ? 'Write a Message' : isJa ? 'メッセージを書いてください' : '축하 메시지를 남겨주세요'}>
        <form onSubmit={handleSubmit}>
          <div className="pf-group">
            <label className="pf-label">{isEn ? 'Side' : isJa ? '区分' : '구분'}</label>
            <div className="gb-side-pick">
              <button type="button" className={`gb-side-btn ${side === 'groom' ? 'active' : ''}`} onClick={() => setSide('groom')}>{groomLabel}</button>
              <button type="button" className={`gb-side-btn ${side === 'bride' ? 'active' : ''}`} onClick={() => setSide('bride')}>{brideLabel}</button>
            </div>
          </div>
          <div className="pf-row">
            <div className="pf-group">
              <label className="pf-label">{isEn ? 'Name' : isJa ? 'お名前' : '이름'}</label>
              <input type="text" className="pf-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder={isEn ? 'Name' : isJa ? 'お名前' : '이름'} />
            </div>
            <div className="pf-group">
              <label className="pf-label">{isEn ? 'PIN' : isJa ? '暗証番号' : '비밀번호'}</label>
              <input type="password" inputMode="numeric" maxLength={4} className="pf-input" required value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder={isEn ? '4 digits' : isJa ? '数字4桁' : '숫자 4자리'} />
            </div>
          </div>
          <div className="pf-group">
            <label className="pf-label">{isEn ? 'Message' : isJa ? 'メッセージ' : '메시지'}</label>
            <textarea className="pf-input" rows={4} required value={content} onChange={(e) => setContent(e.target.value)} placeholder={isEn ? 'Write your message...' : isJa ? 'メッセージをお書きください...' : '축하 메시지를 작성해주세요...'} />
          </div>
          <button type="submit" className="pf-submit" disabled={submitting}>
            <Send size={16} /> {submitting ? (isEn ? 'Sending...' : isJa ? '送信中...' : '전송 중...') : (isEn ? 'Send' : isJa ? '送信' : '등록하기')}
          </button>
        </form>
      </PreviewOverlay>
    </section>
  );
}, (prev, next) =>
  prev.data.isGuestbookEnabled === next.data.isGuestbookEnabled
  && prev.data.guestbookPassword === next.data.guestbookPassword
  && prev.data.slug === next.data.slug
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
  && prev.data.groomName === next.data.groomName
  && prev.data.brideName === next.data.brideName
);

export default Guestbook;