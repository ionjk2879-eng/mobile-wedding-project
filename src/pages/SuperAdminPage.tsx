import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { activatePaidInvitation } from '../services/invitationService';
import useAuthStore from '../stores/useAuthStore';
import { toast } from '../stores/useToastStore';
import ToastContainer from '../components/Toast';
import { Search, RefreshCw, CheckCircle, ExternalLink, Plus, Pencil, Trash2, X } from 'lucide-react';

type Filter = 'all' | 'unpaid' | 'paid';
type AdminTab = 'orders' | 'posts';
type PostType = 'event' | 'notice';

interface InvRow {
  slug: string;
  ownerEmail: string;
  ownerName: string;
  isPaid: boolean;
  expiresAt: string | null;
  createdAt: string;
  groomName: string;
  brideName: string;
  date: string;
  weddingDateISO: string;
}

interface Post {
  id: number;
  type: PostType;
  tag: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

const EVENT_TAGS = ['진행중', '예정', '종료'];
const NOTICE_TAGS = ['공지', '중요', '안내'];

// ── Posts Form Modal ──────────────────────────────────────────────────
interface PostFormProps {
  initial?: Post;
  onSave: (data: { type: PostType; tag: string; title: string; content: string }) => Promise<void>;
  onClose: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ initial, onSave, onClose }) => {
  const [type, setType] = useState<PostType>(initial?.type ?? 'event');
  const [tag, setTag] = useState(initial?.tag ?? '진행중');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [saving, setSaving] = useState(false);

  const tagOptions = type === 'event' ? EVENT_TAGS : NOTICE_TAGS;

  const handleTypeChange = (t: PostType) => {
    setType(t);
    setTag(t === 'event' ? EVENT_TAGS[0] : NOTICE_TAGS[0]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('제목을 입력해주세요.'); return; }
    setSaving(true);
    try {
      await onSave({ type, tag, title: title.trim(), content: content.trim() });
      onClose();
    } catch (e: any) {
      toast.error(e?.message || '저장 실패');
    }
    setSaving(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1F2937' }}>
            {initial ? '게시글 수정' : '새 게시글 작성'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['event', 'notice'] as PostType[]).map(t => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              style={{ flex: 1, padding: '9px 0', border: '1.5px solid', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                borderColor: type === t ? '#B07A8E' : '#E5E7EB',
                background: type === t ? '#FDF6F9' : 'white',
                color: type === t ? '#B07A8E' : '#6B7280',
              }}
            >
              {t === 'event' ? '이벤트' : '공지사항'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>태그</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tagOptions.map(t => (
              <button
                key={t}
                onClick={() => setTag(t)}
                style={{ padding: '5px 14px', border: '1.5px solid', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  borderColor: tag === t ? '#1F2937' : '#E5E7EB',
                  background: tag === t ? '#1F2937' : 'white',
                  color: tag === t ? 'white' : '#6B7280',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>제목 *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="게시글 제목"
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: '#1F2937' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>내용</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="게시글 내용 (선택)"
            rows={4}
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', color: '#1F2937' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', border: '1.5px solid #E5E7EB', borderRadius: 12, background: 'white', color: '#6B7280', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ flex: 1, padding: '12px 0', border: 'none', borderRadius: 12, background: '#B07A8E', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────
const SuperAdminPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const [adminTab, setAdminTab] = useState<AdminTab>('orders');
  // 슈퍼관리자 여부를 클라이언트에 이메일로 하드코딩하지 않고, 서버(worker.ts의
  // SUPER_ADMIN_EMAIL 검사)의 실제 응답 성공/실패로만 판단한다. null=확인 중.
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // Orders
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<InvRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [lookupSlug, setLookupSlug] = useState('');
  const [lookupInfo, setLookupInfo] = useState<InvRow | null>(null);
  const [looking, setLooking] = useState(false);

  // Posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postForm, setPostForm] = useState<{ open: boolean; editing?: Post }>({ open: false });

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter, ...(query ? { q: query } : {}) });
      const data = await apiFetch<InvRow[]>(`/api/admin/invitations?${params}`);
      setRows(data);
      setAuthorized(true);
    } catch {
      setAuthorized(false);
      toast.error('목록 조회 실패');
    }
    setLoading(false);
  }, [filter, query]);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const data = await apiFetch<Post[]>('/api/admin/posts');
      setPosts(data);
    } catch {
      toast.error('게시글 조회 실패');
    }
    setPostsLoading(false);
  }, []);

  useEffect(() => {
    if (!user) { setAuthorized(false); return; }
    fetchList();
  }, [fetchList, user]);

  useEffect(() => {
    if (authorized && adminTab === 'posts') fetchPosts();
  }, [fetchPosts, authorized, adminTab]);

  const handleActivate = async (row: InvRow) => {
    if (!row.weddingDateISO) { toast.error('결혼 날짜 정보가 없어 활성화할 수 없습니다.'); return; }
    const name = row.groomName && row.brideName ? `${row.groomName} & ${row.brideName}` : row.slug;
    if (!confirm(`'${name}' 청첩장을 활성화하시겠습니까?`)) return;
    setActivating(row.slug);
    try {
      await activatePaidInvitation(row.slug, row.weddingDateISO);
      toast.success(`'${name}' 활성화 완료`);
      fetchList();
      if (lookupInfo?.slug === row.slug) setLookupInfo({ ...lookupInfo, isPaid: true });
    } catch (e: any) {
      toast.error(e?.message || '활성화 실패');
    }
    setActivating(null);
  };

  const handleLookup = async () => {
    const slug = lookupSlug.trim();
    if (!slug) return;
    setLooking(true);
    setLookupInfo(null);
    try {
      const params = new URLSearchParams({ filter: 'all', q: slug });
      const data = await apiFetch<InvRow[]>(`/api/admin/invitations?${params}`);
      const found = data.find(r => r.slug === slug);
      if (!found) toast.error('해당 slug를 찾을 수 없습니다.');
      else setLookupInfo(found);
    } catch { toast.error('조회 실패'); }
    setLooking(false);
  };

  const handleCreatePost = async (data: { type: PostType; tag: string; title: string; content: string }) => {
    await apiFetch('/api/admin/posts', { method: 'POST', body: JSON.stringify(data) });
    toast.success('게시글이 등록되었습니다.');
    fetchPosts();
  };

  const handleUpdatePost = async (id: number, data: { type: PostType; tag: string; title: string; content: string }) => {
    await apiFetch(`/api/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    toast.success('게시글이 수정되었습니다.');
    fetchPosts();
  };

  const handleDeletePost = async (post: Post) => {
    if (!confirm(`'${post.title}' 게시글을 삭제하시겠습니까?`)) return;
    try {
      await apiFetch(`/api/admin/posts/${post.id}`, { method: 'DELETE' });
      toast.success('삭제되었습니다.');
      fetchPosts();
    } catch (e: any) {
      toast.error(e?.message || '삭제 실패');
    }
  };

  if (authorized !== true) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Pretendard', sans-serif", color: '#6B7280' }}>
        <ToastContainer />
        <p>{authorized === null ? '확인 중...' : '접근 권한이 없습니다.'}</p>
      </div>
    );
  }

  const unpaidCount = rows.filter(r => !r.isPaid).length;

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Pretendard', sans-serif" }}>
      <ToastContainer />

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #F0F0F0', padding: '0 24px', display: 'flex', alignItems: 'stretch', gap: 0 }}>
        <h1 style={{ margin: '0 24px 0 0', fontSize: '1.05rem', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center' }}>관리자</h1>
        {(['orders', 'posts'] as AdminTab[]).map(t => (
          <button
            key={t}
            onClick={() => setAdminTab(t)}
            style={{
              padding: '18px 20px', border: 'none', background: 'none', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              color: adminTab === t ? '#B07A8E' : '#9CA3AF',
              borderBottom: `2px solid ${adminTab === t ? '#B07A8E' : 'transparent'}`,
              transition: 'all 0.15s',
            }}
          >
            {t === 'orders' ? '주문 관리' : '게시글 관리'}
            {t === 'orders' && unpaidCount > 0 && (
              <span style={{ marginLeft: 6, padding: '1px 7px', borderRadius: 20, background: '#FEF3C7', color: '#D97706', fontSize: '0.68rem', fontWeight: 700 }}>
                {unpaidCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── Orders Tab ── */}
        {adminTab === 'orders' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 4, background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: 4 }}>
                {(['all', 'unpaid', 'paid'] as Filter[]).map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', border: 'none', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', background: filter === f ? '#1F2937' : 'transparent', color: filter === f ? 'white' : '#6B7280' }}>
                    {f === 'all' ? '전체' : f === 'unpaid' ? '미구매' : '활성화됨'}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', gap: 8 }}>
                <Search size={14} color="#9CA3AF" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="slug · 이름 · 이메일 검색" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', color: '#1F2937', fontFamily: 'inherit', background: 'transparent' }} />
              </div>
              <button onClick={fetchList} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 10, background: 'white', fontSize: '0.82rem', fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.5 : 1 }}>
                <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} /> 새로고침
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F0F0F0', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>불러오는 중...</div>
              ) : rows.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>{query || filter !== 'all' ? '검색 결과가 없습니다.' : '청첩장이 없습니다.'}</div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 120px 90px 100px', gap: 12, padding: '10px 20px', background: '#F9FAFB', borderBottom: '1px solid #F0F0F0', fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF' }}>
                    <span>청첩장</span><span>결혼일</span><span>고객</span><span>주소</span><span>만료</span><span></span>
                  </div>
                  {rows.map((row, i) => {
                    const days = daysUntil(row.expiresAt);
                    const name = row.groomName && row.brideName ? `${row.groomName} & ${row.brideName}` : row.slug;
                    const isActivating = activating === row.slug;
                    const urgent = !row.isPaid && days !== null && days <= 3;
                    return (
                      <div key={row.slug} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 120px 90px 100px', gap: 12, padding: '14px 20px', alignItems: 'center', borderBottom: i < rows.length - 1 ? '1px solid #F9FAFB' : 'none', background: urgent ? '#FFFBEB' : 'white' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#1F2937' }}>{name}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#9CA3AF' }}>{fmtDate(row.createdAt)} 생성</p>
                        </div>
                        <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>{row.date || '—'}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#4B5563' }}>{row.ownerName || '—'}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#9CA3AF' }}>{row.ownerEmail || '—'}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>{row.slug}</span>
                          <a href={`https://sonett.kr/${row.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#9CA3AF', lineHeight: 1 }}><ExternalLink size={11} /></a>
                        </div>
                        <div>
                          {days === null ? <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>—</span>
                            : days < 0 ? <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700 }}>만료됨</span>
                            : <span style={{ fontSize: '0.75rem', color: urgent ? '#DC2626' : '#6B7280', fontWeight: urgent ? 700 : 400 }}>D-{days}</span>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                          {row.isPaid ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}><CheckCircle size={13} /> 활성화</span>
                          ) : (
                            <button onClick={() => handleActivate(row)} disabled={isActivating} style={{ padding: '6px 12px', border: 'none', borderRadius: 8, background: '#B07A8E', color: 'white', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: isActivating ? 0.5 : 1 }}>
                              {isActivating ? '처리중' : '활성화'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'right' }}>최대 200건 표시</p>

            {/* Quick lookup */}
            <div style={{ marginTop: 36, background: 'white', borderRadius: 16, padding: 28, border: '1px solid #F0F0F0' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#1F2937' }}>빠른 조회</h2>
              <p style={{ margin: '0 0 20px', fontSize: '0.8rem', color: '#9CA3AF' }}>slug를 직접 입력해 조회합니다.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', ...(lookupSlug ? { borderColor: '#B07A8E' } : {}) }}>
                  <span style={{ padding: '11px 0 11px 12px', fontSize: '0.85rem', color: '#9CA3AF', fontFamily: 'monospace', flexShrink: 0 }}>sonett.kr/</span>
                  <input type="text" value={lookupSlug} onChange={e => { setLookupSlug(e.target.value.trim()); setLookupInfo(null); }} onKeyDown={e => e.key === 'Enter' && handleLookup()} placeholder="slug-here" style={{ flex: 1, padding: '11px 12px 11px 0', border: 'none', outline: 'none', fontSize: '0.88rem', fontFamily: 'monospace', color: '#1F2937', background: 'transparent' }} />
                </div>
                <button onClick={handleLookup} disabled={!lookupSlug.trim() || looking} style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: '#1F2937', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', opacity: (!lookupSlug.trim() || looking) ? 0.4 : 1 }}>
                  {looking ? '...' : '조회'}
                </button>
              </div>
              {lookupInfo && (
                <div style={{ marginTop: 16, padding: 18, background: '#F9FAFB', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1F2937' }}>{lookupInfo.groomName && lookupInfo.brideName ? `${lookupInfo.groomName} & ${lookupInfo.brideName}` : lookupInfo.slug}</p>
                    {lookupInfo.date && <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>{lookupInfo.date}</p>}
                    <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#9CA3AF' }}>{lookupInfo.ownerEmail}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: lookupInfo.isPaid ? '#D1FAE5' : '#FEF3C7', color: lookupInfo.isPaid ? '#059669' : '#D97706' }}>
                      {lookupInfo.isPaid ? '활성화됨' : '미구매'}
                    </span>
                    {!lookupInfo.isPaid && (
                      <button onClick={() => handleActivate(lookupInfo)} disabled={activating === lookupInfo.slug} style={{ padding: '8px 18px', border: 'none', borderRadius: 10, background: '#B07A8E', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', opacity: activating === lookupInfo.slug ? 0.5 : 1 }}>
                        {activating === lookupInfo.slug ? '처리 중...' : '워터마크 제거 · 활성화'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Posts Tab ── */}
        {adminTab === 'posts' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={fetchPosts} disabled={postsLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 10, background: 'white', fontSize: '0.82rem', fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit', opacity: postsLoading ? 0.5 : 1 }}>
                  <RefreshCw size={13} style={{ animation: postsLoading ? 'spin 0.8s linear infinite' : 'none' }} /> 새로고침
                </button>
              </div>
              <button onClick={() => setPostForm({ open: true })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', borderRadius: 10, background: '#B07A8E', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Plus size={15} /> 새 게시글
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F0F0F0', overflow: 'hidden' }}>
              {postsLoading ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>불러오는 중...</div>
              ) : posts.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>게시글이 없습니다.</div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 60px 1fr 100px 80px', gap: 12, padding: '10px 20px', background: '#F9FAFB', borderBottom: '1px solid #F0F0F0', fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF' }}>
                    <span>구분</span><span>태그</span><span>제목</span><span>등록일</span><span></span>
                  </div>
                  {posts.map((post, i) => (
                    <div key={post.id} style={{ display: 'grid', gridTemplateColumns: '70px 60px 1fr 100px 80px', gap: 12, padding: '14px 20px', alignItems: 'center', borderBottom: i < posts.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, textAlign: 'center', background: post.type === 'event' ? '#EFF6FF' : '#F3F4F6', color: post.type === 'event' ? '#2563EB' : '#6B7280' }}>
                        {post.type === 'event' ? '이벤트' : '공지'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{post.tag}</span>
                      <span style={{ fontSize: '0.88rem', color: '#1F2937', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{post.created_at.slice(0, 10)}</span>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => setPostForm({ open: true, editing: post })} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit' }}>
                          <Pencil size={11} /> 수정
                        </button>
                        <button onClick={() => handleDeletePost(post)} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: '1px solid #FEE2E2', borderRadius: 8, background: '#FEF2F2', fontSize: '0.75rem', fontWeight: 600, color: '#DC2626', cursor: 'pointer', fontFamily: 'inherit' }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {postForm.open && (
        <PostForm
          initial={postForm.editing}
          onSave={postForm.editing
            ? (data) => handleUpdatePost(postForm.editing!.id, data)
            : handleCreatePost}
          onClose={() => setPostForm({ open: false })}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SuperAdminPage;
