import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import useAuthStore from '../stores/useAuthStore';
import { apiFetch } from '../services/api';
import { Lock } from 'lucide-react';

interface InquiryItem {
  id: number;
  authorName: string;
  title: string;
  isSecret: boolean;
  isOwn: boolean;
  createdAt: string;
}

interface InquiryDetail extends InquiryItem {
  content: string;
  photoUrl?: string | null;
  canComment: boolean;
}

interface Comment {
  id: number;
  authorName: string;
  isAdmin: boolean;
  content: string;
  createdAt: string;
  isOwn: boolean;
}

type View = 'list' | 'write' | 'detail' | 'unlock';

const ContactPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const [searchParams] = useSearchParams();

  const [posts, setPosts] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [unlockId, setUnlockId] = useState<number | null>(null);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Write form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [writeError, setWriteError] = useState('');
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const fetchList = useCallback(() => {
    setLoading(true);
    apiFetch<InquiryItem[]>('/api/inquiries')
      .then((data) => setPosts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    if (view !== 'list') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [view]);

  const fetchComments = async (id: number) => {
    try {
      const data = await apiFetch<Comment[]>(`/api/inquiries/${id}/comments`);
      setComments(data);
    } catch {
      setComments([]);
    }
  };

  // 알림 클릭 등으로 특정 문의를 바로 열어야 할 때(?inquiry=id) 목록과 무관하게 상세를 바로 불러온다.
  useEffect(() => {
    const inquiryId = searchParams.get('inquiry');
    if (!inquiryId) return;
    (async () => {
      try {
        const data = await apiFetch<InquiryDetail | { secret: true }>(`/api/inquiries/${inquiryId}`);
        if (!('secret' in data)) {
          setDetail(data);
          setCommentText('');
          await fetchComments(Number(inquiryId));
          setView('detail');
        }
      } catch {
        // 접근 불가/삭제된 글이면 조용히 무시하고 목록 화면을 보여준다.
      }
    })();
  }, [searchParams]);

  const openDetail = async (post: InquiryItem) => {
    if (post.isSecret && !post.isOwn) {
      setUnlockId(post.id);
      setPwInput('');
      setPwError('');
      setView('unlock');
      return;
    }
    const data = await apiFetch<InquiryDetail | { secret: true }>(`/api/inquiries/${post.id}`);
    if ('secret' in data) {
      setUnlockId(post.id);
      setPwInput('');
      setPwError('');
      setView('unlock');
    } else {
      setDetail(data);
      setCommentText('');
      await fetchComments(post.id);
      setView('detail');
    }
  };

  const submitPassword = async () => {
    if (!pwInput.trim()) { setPwError('비밀번호를 입력해주세요.'); return; }
    const data = await apiFetch<InquiryDetail | { secret: true }>(`/api/inquiries/${unlockId}?password=${encodeURIComponent(pwInput)}`);
    if ('secret' in data) {
      setPwError('비밀번호가 올바르지 않습니다.');
    } else {
      setDetail(data);
      setCommentText('');
      await fetchComments(unlockId!);
      setView('detail');
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setWriteError('사진은 2MB 이하만 업로드 가능합니다.'); return; }
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    setWriteError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'inquiry');
      const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || '업로드 실패');
      setPhotoKey(data.url.replace('/images/', ''));
    } catch {
      setWriteError('사진 업로드에 실패했습니다. 다시 시도해주세요.');
      setPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
    }
  };

  const submitWrite = async () => {
    if (!title.trim()) { setWriteError('제목을 입력해주세요.'); return; }
    if (!content.trim()) { setWriteError('내용을 입력해주세요.'); return; }
    if (isSecret && !password.trim()) { setWriteError('비밀번호를 설정해주세요.'); return; }
    if (photoUploading) { setWriteError('사진 업로드 중입니다. 잠시 후 다시 시도해주세요.'); return; }
    setSubmitting(true);
    setWriteError('');
    try {
      await apiFetch('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), content: content.trim(), isSecret, password: isSecret ? password.trim() : undefined, photoKey }),
      });
      setTitle(''); setContent(''); setIsSecret(false); setPassword(''); setPhotoKey(null); setPhotoPreview(null);
      setView('list');
      fetchList();
    } catch {
      setWriteError('등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !detail) return;
    setCommentSubmitting(true);
    try {
      await apiFetch(`/api/inquiries/${detail.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText.trim() }),
      });
      setCommentText('');
      await fetchComments(detail.id);
    } catch {
      alert('댓글 등록에 실패했습니다.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!detail || !confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await apiFetch(`/api/inquiries/${detail.id}/comments/${commentId}`, { method: 'DELETE' });
      await fetchComments(detail.id);
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await apiFetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      closeModal();
      fetchList();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const closeModal = () => {
    setView('list');
    setDetail(null);
    setUnlockId(null);
    setPwInput('');
    setPwError('');
    setComments([]);
    setCommentText('');
    setPhotoKey(null);
    setPhotoPreview(null);
  };

  return (
    <div className="cp-page">
      <SiteHeader />

      <main className="cp-main">
        <div className="cp-header">
          <div>
            <p className="cp-label">CONTACT</p>
            <h1 className="cp-title">문의 / 건의</h1>
          </div>
          {!authLoading && user && (
            <button className="cp-write-btn" onClick={() => { setWriteError(''); setView('write'); }}>글쓰기</button>
          )}
        </div>

        {!authLoading && !user && (
          <p className="cp-login-notice">로그인 후 문의/건의 글을 작성할 수 있습니다.</p>
        )}

        <div className="cp-board">
          <div className="cp-board-head">
            <span className="cp-col-num">번호</span>
            <span className="cp-col-title">제목</span>
            <span className="cp-col-author">작성자</span>
            <span className="cp-col-date">날짜</span>
          </div>

          {loading ? (
            <div className="cp-empty">불러오는 중...</div>
          ) : posts.length === 0 ? (
            <div className="cp-empty">등록된 문의/건의가 없습니다.</div>
          ) : (
            posts.map((post, i) => (
              <div key={post.id} className="cp-row" onClick={() => openDetail(post)}>
                <span className="cp-col-num">{posts.length - i}</span>
                <span className="cp-col-title">
                  {post.isSecret && <Lock size={13} className="cp-lock-icon" />}
                  <span className={post.isSecret && !post.isOwn ? 'cp-secret-title' : ''}>{post.title}</span>
                  {post.isOwn && <span className="cp-own-badge">내글</span>}
                </span>
                <span className="cp-col-author">{post.authorName}</span>
                <span className="cp-col-date">{post.createdAt.slice(0, 10)}</span>
              </div>
            ))
          )}
        </div>
      </main>

      {/* 글쓰기 모달 */}
      {view === 'write' && (
        <div className="cp-overlay" onClick={closeModal}>
          <div className="cp-modal" onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h2 className="cp-modal-title-text">문의/건의 작성</h2>
              <button className="cp-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="cp-modal-body">
              <div className="cp-field">
                <label className="cp-label-text">제목</label>
                <input className="cp-input" placeholder="제목을 입력하세요" value={title} onChange={e => setTitle(e.target.value)} maxLength={100} />
              </div>
              <div className="cp-field">
                <label className="cp-label-text">내용</label>
                <textarea className="cp-textarea" placeholder="문의하실 내용을 자세히 적어주세요." value={content} onChange={e => setContent(e.target.value)} rows={8} />
              </div>
              <div className="cp-field">
                <label className="cp-label-text">첨부 사진 <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(선택, 2MB 이하)</span></label>
                <label className="cp-photo-upload">
                  {photoPreview ? (
                    <div className="cp-photo-preview-wrap">
                      <img src={photoPreview} alt="첨부 사진 미리보기" className="cp-photo-preview" />
                      {photoUploading && <div className="cp-photo-uploading">업로드 중...</div>}
                      <span className="cp-photo-change">사진 변경</span>
                    </div>
                  ) : (
                    <div className="cp-photo-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      <span>사진 첨부</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                </label>
                {photoKey && !photoUploading && <p className="cp-photo-ok">✓ 사진이 업로드되었습니다.</p>}
              </div>
              <label className="cp-secret-toggle">
                <input type="checkbox" checked={isSecret} onChange={e => setIsSecret(e.target.checked)} />
                <span>비밀글로 설정</span>
              </label>
              {isSecret && (
                <div className="cp-field">
                  <label className="cp-label-text">비밀번호</label>
                  <input className="cp-input" type="password" placeholder="열람 시 사용할 비밀번호를 입력하세요" value={password} onChange={e => setPassword(e.target.value)} maxLength={30} />
                </div>
              )}
              {writeError && <p className="cp-error">{writeError}</p>}
            </div>
            <div className="cp-modal-footer">
              <button className="cp-btn-cancel" onClick={closeModal}>취소</button>
              <button className="cp-btn-submit" onClick={submitWrite} disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 입력 모달 */}
      {view === 'unlock' && (
        <div className="cp-overlay" onClick={closeModal}>
          <div className="cp-modal cp-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h2 className="cp-modal-title-text">비밀글</h2>
              <button className="cp-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="cp-modal-body">
              <p className="cp-unlock-desc"><Lock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />비밀번호를 입력하면 열람할 수 있습니다.</p>
              <div className="cp-field">
                <input className="cp-input" type="password" placeholder="비밀번호" value={pwInput} onChange={e => { setPwInput(e.target.value); setPwError(''); }} onKeyDown={e => { if (e.key === 'Enter') submitPassword(); }} autoFocus />
              </div>
              {pwError && <p className="cp-error">{pwError}</p>}
            </div>
            <div className="cp-modal-footer">
              <button className="cp-btn-cancel" onClick={closeModal}>취소</button>
              <button className="cp-btn-submit" onClick={submitPassword}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {view === 'detail' && detail && (
        <div className="cp-overlay" onClick={closeModal}>
          <div className="cp-modal cp-modal-detail" onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <div className="cp-detail-meta">
                {detail.isSecret && <Lock size={13} className="cp-lock-icon" />}
                <span className="cp-detail-author">{detail.authorName}</span>
                <span className="cp-detail-date">{detail.createdAt.slice(0, 10)}</span>
              </div>
              <button className="cp-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="cp-modal-body">
              <h3 className="cp-detail-title">{detail.title}</h3>
              <div className="cp-detail-content">{detail.content}</div>
              {detail.photoUrl && (
                <div className="cp-detail-photo-wrap">
                  <img src={detail.photoUrl} alt="첨부 사진" className="cp-detail-photo" />
                </div>
              )}

              {/* 댓글 영역 */}
              <div className="cp-comments">
                <p className="cp-comments-label">댓글 {comments.length > 0 ? `(${comments.length})` : ''}</p>
                {comments.length > 0 && (
                  <div className="cp-comment-list">
                    {comments.map(c => (
                      <div key={c.id} className="cp-comment">
                        <div className="cp-comment-top">
                          <div className="cp-comment-author-row">
                            {c.isAdmin && <span className="cp-admin-badge">관리자</span>}
                            <span className="cp-comment-author">{c.authorName}</span>
                            <span className="cp-comment-date">{c.createdAt.slice(0, 10)}</span>
                          </div>
                          {c.isOwn && (
                            <button className="cp-comment-delete" onClick={() => deleteComment(c.id)}>삭제</button>
                          )}
                        </div>
                        <p className="cp-comment-content">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {detail.canComment && (
                  <div className="cp-comment-form">
                    <textarea
                      className="cp-comment-input"
                      placeholder="댓글을 입력하세요..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      rows={3}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitComment(); }}
                    />
                    <button className="cp-comment-submit" onClick={submitComment} disabled={commentSubmitting || !commentText.trim()}>
                      {commentSubmitting ? '등록 중...' : '댓글 등록'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="cp-modal-footer">
              {detail.isOwn && (
                <button className="cp-btn-delete" onClick={() => deletePost(detail.id)}>글 삭제</button>
              )}
              <button className="cp-btn-cancel" style={{ marginLeft: 'auto' }} onClick={closeModal}>목록</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cp-page { min-height: 100vh; background: #F9F9F9; font-family: 'Pretendard', sans-serif; }
        .cp-main { max-width: 860px; margin: 0 auto; padding: 48px 24px 80px; }

        .cp-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 28px; }
        .cp-label { font-size: 0.72rem; letter-spacing: 5px; color: #B07A8E; font-weight: 600; margin: 0 0 6px; }
        .cp-title { font-size: 1.8rem; font-weight: 700; color: #1F2937; margin: 0; }
        .cp-login-notice { font-size: 0.84rem; color: #9CA3AF; margin: 0 0 20px; }

        .cp-write-btn { background: #B07A8E; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s; flex-shrink: 0; }
        .cp-write-btn:hover { background: #9B6A7E; }

        .cp-board { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
        .cp-board-head { display: grid; grid-template-columns: 60px 1fr 100px 90px; gap: 12px; padding: 12px 20px; background: #F8F8F8; border-bottom: 1px solid #EBEBEB; font-size: 0.78rem; font-weight: 600; color: #9CA3AF; }
        .cp-row { display: grid; grid-template-columns: 60px 1fr 100px 90px; gap: 12px; padding: 14px 20px; border-bottom: 1px solid #F3F4F6; cursor: pointer; transition: background 0.12s; align-items: center; }
        .cp-row:last-child { border-bottom: none; }
        .cp-row:hover { background: #FDF8FA; }
        .cp-col-num { font-size: 0.82rem; color: #9CA3AF; text-align: center; }
        .cp-col-title { display: flex; align-items: center; gap: 6px; font-size: 0.88rem; font-weight: 500; color: #1F2937; overflow: hidden; }
        .cp-col-title span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cp-col-author { font-size: 0.82rem; color: #6B7280; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cp-col-date { font-size: 0.78rem; color: #9CA3AF; text-align: center; }
        .cp-lock-icon { color: #9CA3AF; flex-shrink: 0; }
        .cp-secret-title { color: #9CA3AF; }
        .cp-own-badge { flex-shrink: 0; font-size: 0.65rem; font-weight: 700; background: #FDF2F5; color: #B07A8E; padding: 2px 6px; border-radius: 6px; }
        .cp-empty { padding: 56px 24px; text-align: center; color: #9CA3AF; font-size: 0.88rem; }

        /* 모달 공통 */
        .cp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .cp-modal { background: white; border-radius: 16px; width: 100%; max-width: 560px; max-height: 88vh; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.16); }
        .cp-modal-sm { max-width: 380px; }
        .cp-modal-detail { max-width: 660px; }
        .cp-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; flex-shrink: 0; }
        .cp-modal-title-text { font-size: 1.05rem; font-weight: 700; color: #1F2937; margin: 0; }
        .cp-modal-close { background: none; border: none; font-size: 1rem; color: #9CA3AF; cursor: pointer; padding: 4px 8px; }
        .cp-modal-close:hover { color: #4B5563; }
        .cp-modal-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
        .cp-modal-footer { display: flex; align-items: center; gap: 8px; padding: 0 24px 20px; flex-shrink: 0; }

        .cp-field { display: flex; flex-direction: column; gap: 6px; }
        .cp-label-text { font-size: 0.8rem; font-weight: 600; color: #6B7280; }
        .cp-input { border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 0.9rem; font-family: inherit; outline: none; transition: border-color 0.15s; }
        .cp-input:focus { border-color: #B07A8E; }
        .cp-textarea { border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 12px 14px; font-size: 0.9rem; font-family: inherit; outline: none; resize: vertical; transition: border-color 0.15s; line-height: 1.7; }
        .cp-textarea:focus { border-color: #B07A8E; }
        .cp-secret-toggle { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: #4B5563; cursor: pointer; font-weight: 500; }
        .cp-secret-toggle input { accent-color: #B07A8E; width: 16px; height: 16px; cursor: pointer; }
        .cp-error { font-size: 0.82rem; color: #DC2626; margin: 0; }
        .cp-unlock-desc { font-size: 0.88rem; color: #6B7280; margin: 0; }

        .cp-btn-submit { background: #B07A8E; color: white; border: none; padding: 10px 24px; border-radius: 10px; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s; }
        .cp-btn-submit:hover:not(:disabled) { background: #9B6A7E; }
        .cp-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .cp-btn-cancel { background: #F3F4F6; color: #6B7280; border: none; padding: 10px 20px; border-radius: 10px; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s; }
        .cp-btn-cancel:hover { background: #E5E7EB; }
        .cp-btn-delete { background: #FEF2F2; color: #DC2626; border: none; padding: 10px 20px; border-radius: 10px; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s; }
        .cp-btn-delete:hover { background: #FEE2E2; }

        .cp-detail-meta { display: flex; align-items: center; gap: 8px; }
        .cp-detail-author { font-size: 0.85rem; font-weight: 600; color: #4B5563; }
        .cp-detail-date { font-size: 0.78rem; color: #9CA3AF; }
        .cp-detail-title { font-size: 1.1rem; font-weight: 700; color: #1F2937; margin: 0 0 16px; line-height: 1.5; }
        .cp-detail-content { font-size: 0.9rem; color: #374151; line-height: 1.9; white-space: pre-wrap; word-break: keep-all; padding-bottom: 4px; }
        .cp-detail-photo-wrap { margin-top: 12px; border-radius: 12px; overflow: hidden; border: 1px solid #F0F0F0; }
        .cp-detail-photo { width: 100%; max-height: 400px; object-fit: contain; display: block; background: #F8F8F8; }

        .cp-photo-upload { display: block; cursor: pointer; border-radius: 12px; overflow: hidden; }
        .cp-photo-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 28px; border: 2px dashed #E5E7EB; border-radius: 12px; color: #9CA3AF; font-size: 0.82rem; transition: border-color 0.15s; }
        .cp-photo-upload:hover .cp-photo-placeholder { border-color: #B07A8E; color: #B07A8E; }
        .cp-photo-preview-wrap { position: relative; border-radius: 12px; overflow: hidden; border: 1.5px solid #E5E7EB; }
        .cp-photo-preview { width: 100%; max-height: 220px; object-fit: cover; display: block; }
        .cp-photo-uploading { position: absolute; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.85rem; font-weight: 600; }
        .cp-photo-change { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.55); color: white; font-size: 0.75rem; padding: 4px 10px; border-radius: 8px; }
        .cp-photo-ok { font-size: 0.8rem; color: #059669; margin: 0; font-weight: 500; }

        /* 댓글 */
        .cp-comments { border-top: 1px solid #F0F0F0; padding-top: 16px; display: flex; flex-direction: column; gap: 12px; }
        .cp-comments-label { font-size: 0.82rem; font-weight: 700; color: #6B7280; margin: 0; }
        .cp-comment-list { display: flex; flex-direction: column; gap: 1px; }
        .cp-comment { background: #F8F9FA; border-radius: 10px; padding: 12px 14px; }
        .cp-comment-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .cp-comment-author-row { display: flex; align-items: center; gap: 6px; }
        .cp-admin-badge { font-size: 0.65rem; font-weight: 700; background: #B07A8E; color: white; padding: 2px 7px; border-radius: 6px; }
        .cp-comment-author { font-size: 0.82rem; font-weight: 600; color: #374151; }
        .cp-comment-date { font-size: 0.75rem; color: #9CA3AF; }
        .cp-comment-delete { background: none; border: none; font-size: 0.75rem; color: #9CA3AF; cursor: pointer; padding: 2px 6px; border-radius: 6px; }
        .cp-comment-delete:hover { background: #FEE2E2; color: #DC2626; }
        .cp-comment-content { font-size: 0.88rem; color: #374151; line-height: 1.7; white-space: pre-wrap; word-break: keep-all; margin: 0; }
        .cp-comment-form { display: flex; flex-direction: column; gap: 8px; }
        .cp-comment-input { border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 0.88rem; font-family: inherit; outline: none; resize: none; line-height: 1.6; transition: border-color 0.15s; }
        .cp-comment-input:focus { border-color: #B07A8E; }
        .cp-comment-submit { align-self: flex-end; background: #B07A8E; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s; }
        .cp-comment-submit:hover:not(:disabled) { background: #9B6A7E; }
        .cp-comment-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 600px) {
          .cp-main { padding: 32px 16px 60px; }
          .cp-board-head { grid-template-columns: 40px 1fr 70px; }
          .cp-board-head .cp-col-date { display: none; }
          .cp-row { grid-template-columns: 40px 1fr 70px; }
          .cp-row .cp-col-date { display: none; }
          .cp-overlay { padding: 0; align-items: flex-end; }
          .cp-modal { border-radius: 20px 20px 0 0; max-height: 92vh; max-width: 100%; }
          .cp-modal-sm { max-width: 100%; }
          .cp-modal-detail { max-width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
