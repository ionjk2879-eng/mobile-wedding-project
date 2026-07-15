import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { activatePaidInvitation, loadInvitation, saveInvitation } from '../services/invitationService';
import { loadInvitationPublic } from '../services/publicLoad';
import useAuthStore from '../stores/useAuthStore';
import useInvitationStore, { initialData } from '../stores/useInvitationStore';
import { signInWithGoogle, initiateKakaoLogin, initiateNaverLogin, signOut } from '../services/auth';
import { toast } from '../stores/useToastStore';
import ToastContainer from '../components/Toast';
import { AI_PRESETS, applyPreset } from '../data/aiPresets';
import { InvitationData } from '../types';
import HeroSection from '../components/Editor/sections/HeroSection';
import PhotosSection from '../components/Editor/sections/PhotosSection';
import { Search, RefreshCw, CheckCircle, ExternalLink, Plus, Pencil, Trash2, X, KeyRound, Download, Copy, Image as ImageIcon, Layers } from 'lucide-react';

type Filter = 'all' | 'unpaid' | 'paid';
type AdminTab = 'orders' | 'codes' | 'posts' | 'templates' | 'reviews' | 'inquiries';
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

interface AdminReview {
  id: number;
  author_name: string;
  rating: number;
  content: string;
  photo_key: string | null;
  created_at: string;
  isOwn: boolean;
}

interface AdminInquiry {
  id: number;
  author_name: string;
  title: string;
  content: string;
  is_secret: number;
  created_at: string;
  isOwn: boolean;
}

interface InquiryComment {
  id: number;
  author_name: string;
  is_admin: number;
  content: string;
  created_at: string;
}

interface AdminInquiryDetail extends AdminInquiry {
  comments: InquiryComment[];
  canComment: boolean;
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function renderStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

const EVENT_TAGS = ['진행중', '예정', '종료'];
const NOTICE_TAGS = ['공지', '중요', '안내'];

// ── Posts Form Modal ──────────────────────────────────────────────────
interface PostFormProps {
  initial?: Post;
  onSave: (data: { type: PostType; tag: string; title: string; content: string }) => Promise<void>;
  onClose: () => void;
}

function parseEventContent(raw: string) {
  try { const p = JSON.parse(raw); if (p.structured) return p; } catch {}
  return null;
}

const FIELD_STYLE: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8,
  fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: '#1F2937',
};
const LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', paddingTop: 9, minWidth: 80, flexShrink: 0,
};

const PostForm: React.FC<PostFormProps> = ({ initial, onSave, onClose }) => {
  const [type, setType] = useState<PostType>(initial?.type ?? 'event');
  const [tag, setTag] = useState(initial?.tag ?? '진행중');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [saving, setSaving] = useState(false);

  // 공지사항용 plain 내용
  const [content, setContent] = useState(() => {
    if (initial?.type !== 'event') return initial?.content ?? '';
    return '';
  });

  // 이벤트용 구조화 필드 — 기존 plain text 이벤트는 howTo에 마이그레이션
  const parsed = initial?.content ? parseEventContent(initial.content) : null;
  const isLegacyEvent = initial?.type === 'event' && initial.content && !parsed;
  const [target, setTarget] = useState(parsed?.target ?? '');
  const [benefit, setBenefit] = useState(parsed?.benefit ?? '');
  const [howTo, setHowTo] = useState(parsed?.howTo ?? (isLegacyEvent ? initial!.content : ''));
  const [notes, setNotes] = useState(parsed?.notes ?? '');
  const [naverReviewUrl, setNaverReviewUrl] = useState(parsed?.naverReviewUrl ?? '');

  const tagOptions = type === 'event' ? EVENT_TAGS : NOTICE_TAGS;

  const handleTypeChange = (t: PostType) => {
    setType(t);
    setTag(t === 'event' ? EVENT_TAGS[0] : NOTICE_TAGS[0]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('제목을 입력해주세요.'); return; }
    setSaving(true);
    try {
      const finalContent = type === 'event'
        ? JSON.stringify({ structured: true, target: target.trim(), benefit: benefit.trim(), howTo: howTo.trim(), notes: notes.trim(), naverReviewUrl: naverReviewUrl.trim() })
        : content.trim();
      await onSave({ type, tag, title: title.trim(), content: finalContent });
      onClose();
    } catch (e: any) {
      toast.error(e?.message || '저장 실패');
    }
    setSaving(false);
  };

  const row = (label: string, input: React.ReactNode) => (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
      <span style={LABEL_STYLE}>{label}</span>
      <div style={{ flex: 1 }}>{input}</div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24, overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: type === 'event' ? 620 : 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', margin: 'auto' }}>
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
            <button key={t} onClick={() => handleTypeChange(t)}
              style={{ flex: 1, padding: '9px 0', border: '1.5px solid', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                borderColor: type === t ? '#B07A8E' : '#E5E7EB', background: type === t ? '#FDF6F9' : 'white', color: type === t ? '#B07A8E' : '#6B7280' }}>
              {t === 'event' ? '이벤트' : '공지사항'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>태그</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tagOptions.map(t => (
              <button key={t} onClick={() => setTag(t)}
                style={{ padding: '5px 14px', border: '1.5px solid', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  borderColor: tag === t ? '#1F2937' : '#E5E7EB', background: tag === t ? '#1F2937' : 'white', color: tag === t ? 'white' : '#6B7280' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>제목 *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="게시글 제목"
            style={{ ...FIELD_STYLE }} />
        </div>

        {type === 'event' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, background: '#F9FAFB', borderRadius: 12, padding: '16px 14px' }}>
            {isLegacyEvent && (
              <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: '#D97706', background: '#FEF3C7', borderRadius: 8, padding: '8px 12px' }}>
                기존 텍스트 내용을 '참여 방법'에 불러왔습니다. 각 항목을 정리한 후 저장해주세요.
              </p>
            )}
            {row('참여 대상', <input value={target} onChange={e => setTarget(e.target.value)} placeholder="예: 소네트 모바일 청첩장 구매자" style={FIELD_STYLE} />)}
            {row('혜택', <textarea value={benefit} onChange={e => setBenefit(e.target.value)} placeholder="예: 청첩장 1+1 쿠폰 제공" rows={2} style={{ ...FIELD_STYLE, resize: 'vertical' }} />)}
            {row('참여 방법', <textarea value={howTo} onChange={e => setHowTo(e.target.value)} placeholder="예: 네이버 스마트스토어에서 포토리뷰 작성&#10;또는 소네트 웹사이트에서 후기 작성" rows={3} style={{ ...FIELD_STYLE, resize: 'vertical' }} />)}
            {row('유의사항', <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="유의사항 (줄바꿈으로 항목 구분)" rows={5} style={{ ...FIELD_STYLE, resize: 'vertical' }} />)}
            {row('네이버 리뷰 URL', <input value={naverReviewUrl} onChange={e => setNaverReviewUrl(e.target.value)} placeholder="https://smartstore.naver.com/..." style={FIELD_STYLE} />)}
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>내용</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="게시글 내용 (선택)" rows={5}
              style={{ ...FIELD_STYLE, resize: 'vertical' }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', border: '1.5px solid #E5E7EB', borderRadius: 12, background: 'white', color: '#6B7280', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            취소
          </button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ flex: 1, padding: '12px 0', border: 'none', borderRadius: 12, background: '#B07A8E', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 로그인 3종 버튼. beforeLogin이 있으면(예: 이미 다른 계정으로 로그인된 상태에서 관리자
// 계정으로 전환할 때) 로그인 진행 전에 먼저 실행한다(signOut). returnUrl은 항상 이 페이지로
// 고정한다 — 안 그러면 각 로그인 함수의 기본값(/manage)으로 리디렉션되어 버린다.
const LoginButtons: React.FC<{ beforeLogin?: () => void }> = ({ beforeLogin }) => {
  const go = (initiate: (returnUrl?: string) => void) => {
    beforeLogin?.();
    initiate('/superadmin');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px' }}>
      <button
        onClick={() => go(initiateKakaoLogin)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#FEE500', color: '#191919', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C5.03 2 1 5.13 1 8.97c0 2.48 1.65 4.66 4.13 5.88-.18.67-.66 2.42-.75 2.8-.12.47.17.46.36.34.15-.1 2.37-1.61 3.33-2.27.3.04.61.06.93.06 4.97 0 9-3.13 9-6.97C19 5.13 14.97 2 10 2Z" fill="#191919"/></svg>
        카카오로 로그인
      </button>
      <button
        onClick={() => go(initiateNaverLogin)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#03C75A', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13.56 10.7 6.15 3H3v14h3.44V9.3L13.85 17H17V3h-3.44v7.7Z" fill="white"/></svg>
        네이버로 로그인
      </button>
      <button
        onClick={() => go(signInWithGoogle)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#4285F4', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M19.6 10.23c0-.68-.06-1.36-.17-2.01H10v3.8h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.73 2.98-4.3 2.98-7.31Z" fill="white"/><path d="M10 20c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.58-4.12H1.08v2.58A9.99 9.99 0 0 0 10 20Z" fill="white"/><path d="M4.42 11.9a6.02 6.02 0 0 1 0-3.82V5.5H1.08a10 10 0 0 0 0 8.98l3.34-2.58Z" fill="white"/><path d="M10 3.96c1.47 0 2.78.5 3.82 1.5l2.86-2.87A10 10 0 0 0 1.08 5.5l3.34 2.58c.78-2.36 2.98-4.12 5.58-4.12Z" fill="white"/></svg>
        Google로 로그인
      </button>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────
const SuperAdminPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const authLoading = useAuthStore(s => s.loading);
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

  // Activation codes
  const [codeCount, setCodeCount] = useState('10');
  const [codeNote, setCodeNote] = useState('');
  const [codeExpiry, setCodeExpiry] = useState('90');
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[] | null>(null);
  const [generatedExpiry, setGeneratedExpiry] = useState<string>('');
  const [codeStatuses, setCodeStatuses] = useState<Record<string, string>>({});
  const [checkingCodeStatuses, setCheckingCodeStatuses] = useState(false);

  // Posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postForm, setPostForm] = useState<{ open: boolean; editing?: Post }>({ open: false });

  // Reviews
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Inquiries
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiryDetail | null>(null);
  const [inquiryDetailLoading, setInquiryDetailLoading] = useState(false);

  // Templates
  const [templateSamples, setTemplateSamples] = useState<Record<string, { heroPhoto: string; updatedAt: string }>>({});
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [seedingAll, setSeedingAll] = useState(false);
  const [seedingStatus, setSeedingStatus] = useState<Record<string, 'idle' | 'seeding' | 'done' | 'error'>>({});
  const setStoreData = useInvitationStore((s) => s.setData);

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

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const data = await apiFetch<AdminReview[]>('/api/reviews');
      setReviews(data);
    } catch {
      toast.error('후기 조회 실패');
    }
    setReviewsLoading(false);
  }, []);

  const fetchInquiries = useCallback(async () => {
    setInquiriesLoading(true);
    try {
      const data = await apiFetch<AdminInquiry[]>('/api/inquiries');
      setInquiries(data);
    } catch {
      toast.error('문의 조회 실패');
    }
    setInquiriesLoading(false);
  }, []);

  const fetchTemplateSamples = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const data = await apiFetch<{ slug: string; heroPhoto: string; updatedAt: string }[]>('/api/admin/template-samples');
      const map: Record<string, { heroPhoto: string; updatedAt: string }> = {};
      data.forEach(d => { map[d.slug] = { heroPhoto: d.heroPhoto, updatedAt: d.updatedAt }; });
      setTemplateSamples(map);
    } catch {
      toast.error('템플릿 샘플 조회 실패');
    }
    setTemplatesLoading(false);
  }, []);

  const handleEditTemplate = async (slug: string) => {
    setEditingTemplate(slug);
    const data = await loadInvitation(slug);
    if (data) {
      setStoreData(data);
    } else {
      setStoreData({ ...initialData, slug });
    }
  };

  const handleCloseEdit = () => {
    setEditingTemplate(null);
    setStoreData(initialData);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setTemplateSaving(true);
    try {
      const storeData = useInvitationStore.getState().data;
      await saveInvitation(editingTemplate, storeData);
      toast.success('저장되었습니다.');
      await fetchTemplateSamples();
      handleCloseEdit();
    } catch (e: unknown) {
      toast.error((e as Error)?.message || '저장 실패');
    }
    setTemplateSaving(false);
  };

  const handleSeedAll = async () => {
    if (!confirm('junho-seoyeon 사진/내용으로 6개 템플릿 샘플을 초기화합니다. 기존 사진은 덮어씌워집니다. 계속하시겠습니까?')) return;
    setSeedingAll(true);
    const initialStatus: Record<string, 'idle'> = {};
    AI_PRESETS.forEach(p => { if (p.sampleSlug) initialStatus[p.sampleSlug] = 'idle'; });
    setSeedingStatus(initialStatus);

    let junhoData: InvitationData | null = null;
    try {
      junhoData = await loadInvitationPublic('junho-seoyeon');
    } catch { /* ignore */ }
    if (!junhoData) {
      toast.error('junho-seoyeon 데이터를 불러올 수 없습니다.');
      setSeedingAll(false);
      return;
    }

    const HERO_PHOTOS: Record<string, string> = {
      'natural-serene':    junhoData.heroPhoto || '',
      'clear-insta':       junhoData.photos?.[2] || junhoData.heroPhoto || '',
      'elegant-pearl':     junhoData.heroPhoto2 || junhoData.heroPhoto || '',
      'romantic-wisteria': junhoData.photos?.[0] || junhoData.heroPhoto || '',
      'modern-slate':      junhoData.photos?.[1] || junhoData.heroPhoto || '',
      'warm-copper':       junhoData.photos?.[3] || junhoData.heroPhoto || '',
    };

    for (const preset of AI_PRESETS) {
      const slug = preset.sampleSlug;
      if (!slug) continue;
      setSeedingStatus(prev => ({ ...prev, [slug]: 'seeding' }));
      try {
        const base = applyPreset(preset);
        const heroPhoto = HERO_PHOTOS[preset.id] || junhoData.heroPhoto || '';
        const templateData: InvitationData = {
          ...base,
          groomName: junhoData.groomName,
          brideName: junhoData.brideName,
          date: junhoData.date,
          time: junhoData.time,
          weddingDateISO: junhoData.weddingDateISO,
          heroPhoto,
          heroPhotoX: 50,
          heroPhotoY: 50,
          heroPhoto2: junhoData.heroPhoto2 || '',
          heroPhoto2X: junhoData.heroPhoto2X,
          heroPhoto2Y: junhoData.heroPhoto2Y,
          photos: junhoData.photos || [],
          groomPhoto: junhoData.groomPhoto || '',
          bridePhoto: junhoData.bridePhoto || '',
          timeline: (junhoData.timeline?.length ? junhoData.timeline : base.timeline) ?? [],
          parents: {
            groomParents: (junhoData.parents?.groomParents || []).map(p => ({ ...p, phone: '' })),
            brideParents: (junhoData.parents?.brideParents || []).map(p => ({ ...p, phone: '' })),
          },
          venueName: '세레나 웨딩홀 그랜드볼룸',
          venueAddress: '서울특별시 강남구 테헤란로 123',
          transport: {
            subway: '2호선 강남역 3번 출구 도보 5분',
            bus: '간선 140, 402번 강남역 하차',
            parking: '건물 지하 1~3층 (3시간 무료)',
          },
          slug,
        };
        await apiFetch('/api/admin/template-samples/seed', {
          method: 'POST',
          body: JSON.stringify({ slug, data: templateData }),
        });
        setSeedingStatus(prev => ({ ...prev, [slug]: 'done' }));
      } catch (e: unknown) {
        setSeedingStatus(prev => ({ ...prev, [slug]: 'error' }));
        toast.error(`${preset.name} 시드 실패: ${(e as Error)?.message}`);
      }
    }

    setSeedingAll(false);
    await fetchTemplateSamples();
    toast.success('전체 시드 완료!');
  };

  useEffect(() => {
    // 로그인 세션 복원이 아직 안 끝났으면(authLoading) 잠깐 null(확인 중) 상태를 유지한다 —
    // 안 그러면 이미 로그인된 관리자한테도 새로고침마다 로그인 버튼이 잠깐 번쩍인다.
    if (authLoading) return;
    if (!user) { setAuthorized(false); return; }
    fetchList();
  }, [fetchList, user, authLoading]);

  useEffect(() => {
    if (authorized && adminTab === 'posts') fetchPosts();
  }, [fetchPosts, authorized, adminTab]);

  useEffect(() => {
    if (authorized && adminTab === 'templates') fetchTemplateSamples();
  }, [fetchTemplateSamples, authorized, adminTab]);

  useEffect(() => {
    if (authorized && adminTab === 'reviews') fetchReviews();
  }, [fetchReviews, authorized, adminTab]);

  useEffect(() => {
    if (authorized && adminTab === 'inquiries') fetchInquiries();
  }, [fetchInquiries, authorized, adminTab]);

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

  const handleGenerateCodes = async () => {
    const count = parseInt(codeCount, 10);
    if (!count || count < 1 || count > 500) { toast.error('1~500 사이 숫자를 입력해주세요.'); return; }
    setGeneratingCodes(true);
    try {
      const res = await apiFetch<{ codes: string[] }>('/api/admin/activation-codes', {
        method: 'POST',
        body: JSON.stringify({ count, note: codeNote.trim() || undefined, expiresAt: codeExpiry !== '0' ? new Date(Date.now() + parseInt(codeExpiry) * 86400000).toISOString().slice(0, 10) : undefined }),
      });
      setGeneratedCodes(res.codes);
      setGeneratedExpiry(codeExpiry !== '0' ? new Date(Date.now() + parseInt(codeExpiry) * 86400000).toISOString().slice(0, 10) : '');
      setCodeStatuses({});
      toast.success(`코드 ${res.codes.length}개를 생성했습니다.`);
    } catch (e: any) {
      toast.error(e?.message || '코드 생성에 실패했습니다.');
    }
    setGeneratingCodes(false);
  };

  // 방금 생성한 코드들 중 이미 고객이 사용/만료된 코드를 다시 조회해 표시한다.
  const handleCheckCodeStatuses = async () => {
    if (!generatedCodes || generatedCodes.length === 0) return;
    setCheckingCodeStatuses(true);
    try {
      const params = new URLSearchParams({ codes: generatedCodes.join(',') });
      const res = await apiFetch<{ statuses: Record<string, string> }>(`/api/admin/activation-codes/status?${params}`);
      setCodeStatuses(res.statuses);
      const usedCount = Object.values(res.statuses).filter(s => s === 'used').length;
      const expiredCount = Object.values(res.statuses).filter(s => s === 'expired').length;
      const parts = [];
      if (usedCount > 0) parts.push(`${usedCount}개 사용됨`);
      if (expiredCount > 0) parts.push(`${expiredCount}개 만료됨`);
      toast.success(parts.length > 0 ? parts.join(', ') : '아직 사용된 코드가 없습니다.');
    } catch (e: any) {
      toast.error(e?.message || '상태 조회에 실패했습니다.');
    }
    setCheckingCodeStatuses(false);
  };

  const handleDownloadCodesCsv = () => {
    if (!generatedCodes || generatedCodes.length === 0) return;
    const csv = 'code\n' + generatedCodes.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activation-codes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCodes = () => {
    if (!generatedCodes || generatedCodes.length === 0) return;
    navigator.clipboard.writeText(generatedCodes.join('\n'));
    toast.success('코드 목록이 복사되었습니다.');
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm('이 후기를 삭제하시겠습니까?')) return;
    try {
      await apiFetch(`/api/reviews/${id}`, { method: 'DELETE' });
      toast.success('삭제되었습니다.');
      fetchReviews();
    } catch (e: any) {
      toast.error(e?.message || '삭제 실패');
    }
  };

  const handleViewInquiry = async (inquiry: AdminInquiry) => {
    setInquiryDetailLoading(true);
    try {
      const data = await apiFetch<AdminInquiryDetail>(`/api/inquiries/${inquiry.id}`);
      setSelectedInquiry(data);
    } catch (e: any) {
      toast.error(e?.message || '조회 실패');
    }
    setInquiryDetailLoading(false);
  };

  const handleDeleteInquiry = async (id: number) => {
    if (!confirm('이 문의글을 삭제하시겠습니까?')) return;
    try {
      await apiFetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      toast.success('삭제되었습니다.');
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (e: any) {
      toast.error(e?.message || '삭제 실패');
    }
  };

  const handleDeleteComment = async (inquiryId: number, commentId: number) => {
    if (!confirm('이 댓글을 삭제하시겠습니까?')) return;
    try {
      await apiFetch(`/api/inquiries/${inquiryId}/comments/${commentId}`, { method: 'DELETE' });
      toast.success('삭제되었습니다.');
      const data = await apiFetch<AdminInquiryDetail>(`/api/inquiries/${inquiryId}`);
      setSelectedInquiry(data);
    } catch (e: any) {
      toast.error(e?.message || '삭제 실패');
    }
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
    if (authorized === null) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Pretendard', sans-serif", color: '#6B7280' }}>
          <ToastContainer />
          <p>확인 중...</p>
        </div>
      );
    }

    // 로그인 자체를 안 한 상태면 관리자 로그인 버튼을 보여준다. 이미 다른 계정(슈퍼관리자가
    // 아닌 본인 청첩장 계정 등)으로 로그인돼 있으면 AuthGate를 이미 통과해온 상태라 user가
    // 채워져 있으므로, "접근 권한이 없습니다"와 함께 로그아웃 후 다른 계정으로 로그인할 수
    // 있는 버튼도 같이 보여준다 — 안 그러면 이미 로그인된 사용자는 로그인 버튼 자체를
    // 볼 방법이 없어서 계정을 못 바꾼다.
    return (
      <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", gap: '20px', textAlign: 'center', padding: '40px 20px', boxSizing: 'border-box' }}>
        <ToastContainer />
        <h1 style={{ color: '#D4A5C6', letterSpacing: '3px', margin: 0, fontSize: '2rem' }}>Sonett</h1>
        {user ? (
          <>
            <p style={{ color: '#DC2626', margin: 0, fontWeight: 700 }}>접근 권한이 없습니다.</p>
            <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.85rem' }}>현재 {user.email} 계정으로 로그인되어 있습니다.</p>
            <p style={{ color: '#6B7280', margin: '8px 0 0' }}>다른 계정으로 로그인</p>
          </>
        ) : (
          <p style={{ color: '#6B7280', margin: 0 }}>관리자 로그인</p>
        )}
        <LoginButtons beforeLogin={user ? signOut : undefined} />
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
        {(['orders', 'codes', 'posts', 'templates', 'reviews', 'inquiries'] as AdminTab[]).map(t => (
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
            {t === 'orders' ? '주문 관리' : t === 'codes' ? '활성화 코드' : t === 'posts' ? '게시글 관리' : t === 'templates' ? '템플릿 샘플' : t === 'reviews' ? '후기 관리' : '문의 관리'}
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
                    <span>청첩장</span><span>결혼일</span><span>고객</span><span style={{ paddingLeft: 10 }}>주소</span><span>만료</span><span></span>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 10 }}>
                          <span style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>{row.slug}</span>
                          <a href={`https://sonett.kr/${row.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#9CA3AF', lineHeight: 1 }}><ExternalLink size={11} /></a>
                        </div>
                        <div>
                          {row.isPaid || days === null ? <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>—</span>
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

        {/* ── Activation Codes Tab ── */}
        {adminTab === 'codes' && (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #F0F0F0', marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 6 }}>
                <KeyRound size={16} /> 코드 일괄 생성
              </h2>
              <p style={{ margin: '0 0 20px', fontSize: '0.8rem', color: '#9CA3AF' }}>
                고객이 청첩장 관리 페이지에서 직접 입력해 활성화할 수 있는 코드를 생성합니다. 12자 영숫자, 헷갈리는 문자(0/O, 1/I) 제외.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>개수</label>
                  <input
                    type="number" min={1} max={500} value={codeCount} onChange={e => setCodeCount(e.target.value)}
                    style={{ width: 100, padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: '#1F2937' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>유효기간</label>
                  <select value={codeExpiry} onChange={e => setCodeExpiry(e.target.value)}
                    style={{ padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', color: '#1F2937', background: 'white', cursor: 'pointer' }}>
                    <option value="90">90일 (3개월)</option>
                    <option value="180">180일 (6개월)</option>
                    <option value="365">365일 (1년)</option>
                    <option value="0">제한 없음</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>메모 (선택)</label>
                  <input
                    type="text" value={codeNote} onChange={e => setCodeNote(e.target.value)}
                    placeholder="예: 리뷰 이벤트 쿠폰"
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: '#1F2937' }}
                  />
                </div>
                <button onClick={handleGenerateCodes} disabled={generatingCodes}
                  style={{ padding: '11px 22px', border: 'none', borderRadius: 10, background: '#B07A8E', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', opacity: generatingCodes ? 0.5 : 1 }}>
                  {generatingCodes ? '생성 중...' : '코드 생성'}
                </button>
              </div>
            </div>

            {generatedCodes && (
              <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #F0F0F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1F2937' }}>
                      방금 생성한 코드 {generatedCodes.length}개
                    </h2>
                    {generatedExpiry && (
                      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>
                        유효기간: {generatedExpiry} 까지
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleCheckCodeStatuses} disabled={checkingCodeStatuses} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: '0.78rem', fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit', opacity: checkingCodeStatuses ? 0.5 : 1 }}>
                      <RefreshCw size={12} style={{ animation: checkingCodeStatuses ? 'spin 0.8s linear infinite' : 'none' }} /> 사용 여부 확인
                    </button>
                    <button onClick={handleCopyCodes} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: '0.78rem', fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Copy size={12} /> 전체 복사
                    </button>
                    <button onClick={handleDownloadCodesCsv} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: 'none', borderRadius: 8, background: '#1F2937', color: 'white', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Download size={12} /> CSV 다운로드
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, maxHeight: 360, overflowY: 'auto', padding: 4 }}>
                  {generatedCodes.map(code => {
                    const st = codeStatuses[code];
                    const used = st === 'used';
                    const expired = st === 'expired';
                    const inactive = used || expired;
                    return (
                      <span key={code}
                        title={used ? '이미 사용된 코드' : expired ? '만료된 코드' : undefined}
                        style={{
                          padding: '8px 10px', background: expired ? '#FEF3C7' : '#F9FAFB',
                          border: `1px solid ${expired ? '#FCD34D' : '#F0F0F0'}`, borderRadius: 8,
                          fontFamily: 'monospace', fontSize: '0.82rem', textAlign: 'center', letterSpacing: '0.5px',
                          color: inactive ? '#B0B7C0' : '#1F2937',
                          textDecoration: used ? 'line-through' : 'none',
                        }}
                      >
                        {code}
                        {expired && <span style={{ display: 'block', fontSize: '0.65rem', color: '#D97706', fontFamily: 'inherit', letterSpacing: 0, marginTop: 2 }}>만료됨</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
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

        {/* ── Templates Tab ── */}
        {adminTab === 'templates' && (
          <>
            {/* 전체 시드 복원 */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #F0F0F0', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={16} /> 템플릿 샘플 관리
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#9CA3AF' }}>
                    junho-seoyeon 사진·내용을 6개 템플릿 샘플에 복사합니다. "편집" 버튼으로 사진만 개별 교체 가능합니다.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={fetchTemplateSamples} disabled={templatesLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 10, background: 'white', fontSize: '0.82rem', fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit', opacity: templatesLoading ? 0.5 : 1 }}>
                    <RefreshCw size={13} style={{ animation: templatesLoading ? 'spin 0.8s linear infinite' : 'none' }} /> 새로고침
                  </button>
                  <button onClick={handleSeedAll} disabled={seedingAll} style={{ padding: '8px 18px', border: 'none', borderRadius: 10, background: '#1F2937', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', opacity: seedingAll ? 0.5 : 1 }}>
                    {seedingAll ? '초기화 중...' : '전체 시드 복원'}
                  </button>
                </div>
              </div>

              {/* 시딩 진행 상태 */}
              {Object.keys(seedingStatus).length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {AI_PRESETS.map(preset => {
                    const slug = preset.sampleSlug || '';
                    const status = seedingStatus[slug];
                    if (!status) return null;
                    return (
                      <span key={preset.id} style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                        background: status === 'done' ? '#D1FAE5' : status === 'error' ? '#FEE2E2' : status === 'seeding' ? '#FEF3C7' : '#F3F4F6',
                        color: status === 'done' ? '#059669' : status === 'error' ? '#DC2626' : status === 'seeding' ? '#D97706' : '#6B7280',
                      }}>
                        {preset.emoji} {preset.name}: {status === 'done' ? '완료' : status === 'error' ? '실패' : status === 'seeding' ? '진행중...' : '대기'}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 템플릿 카드 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {AI_PRESETS.map(preset => {
                const slug = preset.sampleSlug || '';
                const info = templateSamples[slug];
                const accentColor = preset.previewColors[1];
                const bgColor = preset.previewColors[0];
                return (
                  <div key={preset.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #F0F0F0', overflow: 'hidden' }}>
                    {/* 썸네일 */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: `linear-gradient(160deg, ${bgColor}, ${accentColor}60)`, overflow: 'hidden' }}>
                      {info?.heroPhoto ? (
                        <img src={info.heroPhoto} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2rem' }}>{preset.emoji}</div>
                      )}
                      <span style={{ position: 'absolute', top: 8, right: 8, padding: '2px 8px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700,
                        background: info ? 'rgba(5,150,105,0.85)' : 'rgba(220,38,38,0.85)', color: 'white' }}>
                        {info ? '✓ 세팅됨' : '⚠ 미세팅'}
                      </span>
                    </div>
                    {/* 정보 + 버튼 */}
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#1F2937' }}>{preset.emoji} {preset.name}</p>
                        {info?.updatedAt && <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: '#9CA3AF' }}>{info.updatedAt.slice(0, 10)} 업데이트</p>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => handleEditTemplate(slug)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: '0.78rem', fontWeight: 600, color: '#1F2937', cursor: 'pointer', fontFamily: 'inherit' }}>
                          <ImageIcon size={12} /> 편집
                        </button>
                        <a href={`/template-preview/${preset.id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: 'none', borderRadius: 8, background: '#B07A8E', fontSize: '0.78rem', fontWeight: 700, color: 'white', textDecoration: 'none', fontFamily: 'inherit' }}>
                          <ExternalLink size={12} /> 미리보기
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Reviews Tab ── */}
        {adminTab === 'reviews' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button onClick={fetchReviews} disabled={reviewsLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 10, background: 'white', fontSize: '0.82rem', fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit', opacity: reviewsLoading ? 0.5 : 1 }}>
                <RefreshCw size={13} style={{ animation: reviewsLoading ? 'spin 0.8s linear infinite' : 'none' }} /> 새로고침
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F0F0F0', overflow: 'hidden' }}>
              {reviewsLoading ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>불러오는 중...</div>
              ) : reviews.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>등록된 후기가 없습니다.</div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 90px 1fr 60px 100px 60px', gap: 12, padding: '10px 20px', background: '#F9FAFB', borderBottom: '1px solid #F0F0F0', fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF' }}>
                    <span>작성자</span><span>별점</span><span>내용</span><span>사진</span><span>날짜</span><span></span>
                  </div>
                  {reviews.map((review, i) => (
                    <div key={review.id} style={{ display: 'grid', gridTemplateColumns: '120px 90px 1fr 60px 100px 60px', gap: 12, padding: '14px 20px', alignItems: 'center', borderBottom: i < reviews.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1F2937' }}>{review.author_name}</span>
                      <span style={{ fontSize: '0.85rem', color: '#F59E0B', letterSpacing: 1 }}>{renderStars(review.rating)}</span>
                      <span style={{ fontSize: '0.83rem', color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.content}</span>
                      <span style={{ fontSize: '0.75rem', color: review.photo_key ? '#059669' : '#D1D5DB', textAlign: 'center' }}>
                        {review.photo_key ? '있음' : '없음'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{review.created_at.slice(0, 10)}</span>
                      <button onClick={() => handleDeleteReview(review.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', border: '1px solid #FEE2E2', borderRadius: 8, background: '#FEF2F2', fontSize: '0.75rem', fontWeight: 600, color: '#DC2626', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'right' }}>총 {reviews.length}건</p>
          </>
        )}

        {/* ── Inquiries Tab ── */}
        {adminTab === 'inquiries' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button onClick={fetchInquiries} disabled={inquiriesLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 10, background: 'white', fontSize: '0.82rem', fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit', opacity: inquiriesLoading ? 0.5 : 1 }}>
                <RefreshCw size={13} style={{ animation: inquiriesLoading ? 'spin 0.8s linear infinite' : 'none' }} /> 새로고침
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F0F0F0', overflow: 'hidden' }}>
              {inquiriesLoading ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>불러오는 중...</div>
              ) : inquiries.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>등록된 문의가 없습니다.</div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 110px 100px 100px', gap: 12, padding: '10px 20px', background: '#F9FAFB', borderBottom: '1px solid #F0F0F0', fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF' }}>
                    <span>번호</span><span>제목</span><span>작성자</span><span>날짜</span><span></span>
                  </div>
                  {inquiries.map((inq, i) => (
                    <div key={inq.id} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 110px 100px 100px', gap: 12, padding: '14px 20px', alignItems: 'center', borderBottom: i < inquiries.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                      <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{inq.id}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                        {!!inq.is_secret && (
                          <span style={{ flexShrink: 0, padding: '2px 6px', borderRadius: 4, background: '#F3F4F6', color: '#6B7280', fontSize: '0.68rem', fontWeight: 700 }}>비밀</span>
                        )}
                        <span style={{ fontSize: '0.88rem', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inq.title}</span>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: '#4B5563' }}>{inq.author_name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{inq.created_at.slice(0, 10)}</span>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleViewInquiry(inq)}
                          disabled={inquiryDetailLoading}
                          style={{ padding: '5px 10px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: '0.75rem', fontWeight: 600, color: '#1F2937', cursor: 'pointer', fontFamily: 'inherit', opacity: inquiryDetailLoading ? 0.5 : 1 }}
                        >
                          보기
                        </button>
                        <button onClick={() => handleDeleteInquiry(inq.id)} style={{ display: 'flex', alignItems: 'center', padding: '5px 8px', border: '1px solid #FEE2E2', borderRadius: 8, background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontFamily: 'inherit' }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'right' }}>총 {inquiries.length}건</p>
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

      {/* 템플릿 샘플 사진 편집 모달 — 기존 HeroSection·PhotosSection 재사용 */}
      {editingTemplate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ background: '#F9FAFB', borderRadius: 20, width: '100%', maxWidth: 640, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            {/* 헤더 */}
            <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F0' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1F2937' }}>
                  {AI_PRESETS.find(p => p.sampleSlug === editingTemplate)?.emoji}{' '}
                  {AI_PRESETS.find(p => p.sampleSlug === editingTemplate)?.name} — 사진 편집
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#9CA3AF', fontFamily: 'monospace' }}>{editingTemplate}</p>
              </div>
              <button onClick={handleCloseEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}>
                <X size={22} />
              </button>
            </div>

            {/* 에디터 섹션 재사용 — useInvitationStore에 템플릿 데이터를 미리 로드한 뒤 렌더 */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <HeroSection />
              <PhotosSection />
            </div>

            {/* 저장 버튼 */}
            <div style={{ padding: '16px 24px 24px', display: 'flex', gap: 10 }}>
              <button onClick={handleCloseEdit} style={{ flex: 1, padding: '12px 0', border: '1.5px solid #E5E7EB', borderRadius: 12, background: 'white', color: '#6B7280', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                취소
              </button>
              <button onClick={handleSaveTemplate} disabled={templateSaving} style={{ flex: 2, padding: '12px 0', border: 'none', borderRadius: 12, background: '#1F2937', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', opacity: templateSaving ? 0.6 : 1 }}>
                {templateSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 문의 상세 모달 */}
      {selectedInquiry && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            {/* 헤더 */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {!!selectedInquiry.is_secret && (
                    <span style={{ padding: '2px 7px', borderRadius: 4, background: '#F3F4F6', color: '#6B7280', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>비밀글</span>
                  )}
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedInquiry.title}</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#9CA3AF' }}>{selectedInquiry.author_name} · {selectedInquiry.created_at.slice(0, 10)}</p>
              </div>
              <button onClick={() => setSelectedInquiry(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, flexShrink: 0 }}>
                <X size={20} />
              </button>
            </div>

            {/* 내용 + 댓글 스크롤 영역 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* 본문 */}
              <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16, fontSize: '0.9rem', color: '#1F2937', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {selectedInquiry.content}
              </div>

              {/* 댓글 */}
              {selectedInquiry.comments.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280' }}>댓글 {selectedInquiry.comments.length}개</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedInquiry.comments.map(c => (
                      <div key={c.id} style={{ background: c.is_admin ? '#FDF6F9' : '#F9FAFB', border: `1px solid ${c.is_admin ? '#F0D9E4' : '#F0F0F0'}`, borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: c.is_admin ? '#B07A8E' : '#1F2937' }}>{c.author_name}</span>
                            {!!c.is_admin && <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: '#B07A8E', color: 'white' }}>관리자</span>}
                            <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{c.created_at.slice(0, 10)}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.content}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(selectedInquiry.id, c.id)}
                          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2 }}
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 하단 버튼 */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #F0F0F0', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 16px', border: '1px solid #FEE2E2', borderRadius: 10, background: '#FEF2F2', color: '#DC2626', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <Trash2 size={14} /> 문의 삭제
              </button>
              <button onClick={() => setSelectedInquiry(null)} style={{ padding: '9px 20px', border: '1px solid #E5E7EB', borderRadius: 10, background: 'white', color: '#6B7280', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SuperAdminPage;
