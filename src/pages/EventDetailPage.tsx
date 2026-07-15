import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';

interface Post {
  id: number;
  type: 'event' | 'notice';
  tag: string;
  title: string;
  content: string;
  created_at: string;
}

interface EventContent {
  structured: true;
  target: string;
  benefit: string;
  howTo: string;
  notes: string;
  naverReviewUrl: string;
}

const GRADIENTS = [
  'linear-gradient(135deg, #F9C5D1 0%, #E8879A 100%)',
  'linear-gradient(135deg, #B5D5F5 0%, #6AAEE8 100%)',
  'linear-gradient(135deg, #FFD9A0 0%, #F5A623 100%)',
  'linear-gradient(135deg, #C5B5F9 0%, #8A6EE8 100%)',
  'linear-gradient(135deg, #A8E6CF 0%, #3CB371 100%)',
  'linear-gradient(135deg, #FFB5A0 0%, #E86A50 100%)',
];

function getGradient(id: number) { return GRADIENTS[id % GRADIENTS.length]; }

const TAG_COLOR: Record<string, string> = { '진행중': 'green', '중요': 'red', '예정': 'gray' };
function tagColor(tag: string) { return TAG_COLOR[tag] || 'pink'; }

function parseEventContent(raw: string): EventContent | null {
  try { const p = JSON.parse(raw); if (p.structured) return p as EventContent; } catch {}
  return null;
}

// ── 구조화 이벤트 행 ──────────────────────────────────────────────────
const SectionRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #F3F4F6', padding: '16px 0' }}>
    <span style={{ minWidth: 90, fontWeight: 700, fontSize: '0.88rem', color: '#1F2937', flexShrink: 0, paddingTop: 1 }}>{label}</span>
    <div style={{ flex: 1, fontSize: '0.88rem', color: '#374151', lineHeight: 1.8 }}>{children}</div>
  </div>
);

// ── 쿠폰 신청 모달 ───────────────────────────────────────────────────
const CouponModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
    <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎁</div>
      <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: 800, color: '#1F2937' }}>쿠폰 신청 방법</h3>
      <p style={{ margin: '0 0 20px', fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.7 }}>
        작성하신 리뷰 스크린샷을 문의 게시판에 남겨주시면<br />
        영업일 기준 1~2일 내에 1+1 쿠폰을 발급해드립니다.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose}
          style={{ flex: 1, padding: '12px 0', border: '1.5px solid #E5E7EB', borderRadius: 12, background: 'white', color: '#6B7280', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          닫기
        </button>
        <a href="/contact"
          style={{ flex: 1, padding: '12px 0', border: 'none', borderRadius: 12, background: '#B07A8E', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          문의 게시판 가기
        </a>
      </div>
    </div>
  </div>
);

// ── 구조화 이벤트 렌더 ───────────────────────────────────────────────
const StructuredEvent: React.FC<{ post: Post; ec: EventContent }> = ({ post, ec }) => {
  const [showCoupon, setShowCoupon] = useState(false);
  const navigate = useNavigate();

  const noteLines = ec.notes.split('\n').filter(l => l.trim());

  return (
    <>
      <div className="edp-article">
        <div className="edp-meta">
          <span className={`edp-badge edp-badge-${tagColor(post.tag)}`}>{post.tag}</span>
          <span className="edp-type-label">이벤트</span>
        </div>
        <h1 className="edp-title">{post.title}</h1>
        <div className="edp-hero" style={{ background: getGradient(post.id) }} />

        {/* 구조화 섹션 */}
        <div style={{ padding: '8px 28px 4px' }}>
          {ec.target && (
            <SectionRow label="참여 대상">
              <span style={{ whiteSpace: 'pre-wrap' }}>{ec.target}</span>
            </SectionRow>
          )}
          {ec.benefit && (
            <SectionRow label="혜택">
              <span style={{ whiteSpace: 'pre-wrap' }}>{ec.benefit}</span>
            </SectionRow>
          )}
          {ec.howTo && (
            <SectionRow label="참여 방법">
              <span style={{ whiteSpace: 'pre-wrap' }}>{ec.howTo}</span>
            </SectionRow>
          )}
          {noteLines.length > 0 && (
            <SectionRow label="유의사항">
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {noteLines.map((line, i) => (
                  <li key={i} style={{ display: 'flex', gap: 6 }}>
                    <span style={{ color: '#B07A8E', fontWeight: 700, flexShrink: 0 }}>·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </SectionRow>
          )}
        </div>

        <p className="edp-date">{post.created_at.slice(0, 10)}</p>
      </div>

      {/* 액션 버튼들 */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ec.naverReviewUrl && (
          <a href={ec.naverReviewUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px', background: '#03C75A', borderRadius: 14, color: 'white', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 12px rgba(3,199,90,0.3)' }}>
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="4" fill="white" fillOpacity="0.25"/><path d="M13.56 10.7 6.15 3H3v14h3.44V9.3L13.85 17H17V3h-3.44v7.7Z" fill="white"/></svg>
            네이버 포토리뷰 작성하기
          </a>
        )}
        <button onClick={() => navigate('/reviews')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', background: 'white', border: '2px solid #E5E7EB', borderRadius: 14, color: '#1F2937', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B07A8E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          소네트 사이트에서 후기 작성하기
        </button>
        <button onClick={() => setShowCoupon(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', background: '#FEE500', border: 'none', borderRadius: 14, color: '#1A1A1A', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(254,229,0,0.4)' }}>
          🎁 (리뷰 작성완료) 쿠폰 받기
        </button>
      </div>

      {showCoupon && <CouponModal onClose={() => setShowCoupon(false)} />}
    </>
  );
};

// ── 메인 컴포넌트 ────────────────────────────────────────────────────
const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then((data: Post[]) => {
        const found = data.find(p => String(p.id) === id);
        if (found) setPost(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/events');
  };

  return (
    <div className="edp-page">
      <SiteHeader />

      <main className="edp-main">
        {loading ? (
          <div className="edp-state">불러오는 중...</div>
        ) : notFound || !post ? (
          <div className="edp-state">
            <p>게시글을 찾을 수 없습니다.</p>
            <button className="edp-back-btn-solid" onClick={() => navigate('/events')}>목록으로</button>
          </div>
        ) : (
          <>
            <button className="edp-nav-back" onClick={handleBack}>← 목록보기</button>

            {post.type === 'event' && parseEventContent(post.content) ? (
              <StructuredEvent post={post} ec={parseEventContent(post.content)!} />
            ) : (
              /* 공지사항 or 구조화되지 않은 구 이벤트: 기존 plain 레이아웃 */
              <>
                <article className="edp-article">
                  <div className="edp-meta">
                    <span className={`edp-badge edp-badge-${tagColor(post.tag)}`}>{post.tag}</span>
                    <span className="edp-type-label">{post.type === 'event' ? '이벤트' : '공지사항'}</span>
                  </div>
                  <h1 className="edp-title">{post.title}</h1>
                  <div className="edp-hero" style={{ background: getGradient(post.id) }} />
                  <div className="edp-content">{post.content}</div>
                  <p className="edp-date">{post.created_at.slice(0, 10)}</p>
                </article>
                <div className="edp-footer">
                  <button className="edp-list-btn" onClick={handleBack}>목록보기</button>
                </div>
              </>
            )}
          </>
        )}
      </main>

      <style>{`
        .edp-page { min-height: 100vh; background: #F9F9F9; font-family: 'Pretendard', sans-serif; }
        .edp-main { max-width: 680px; margin: 0 auto; padding: 32px 24px 80px; }

        .edp-state { padding: 80px 0; text-align: center; color: #9CA3AF; font-size: 0.9rem; display: flex; flex-direction: column; align-items: center; gap: 16px; }

        .edp-nav-back { background: none; border: none; font-size: 0.85rem; color: #B07A8E; font-weight: 600; cursor: pointer; font-family: inherit; padding: 0; margin-bottom: 28px; display: inline-flex; align-items: center; gap: 4px; }
        .edp-nav-back:hover { color: #9C677C; }

        .edp-article { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }

        .edp-meta { display: flex; align-items: center; gap: 8px; padding: 28px 28px 0; }
        .edp-type-label { font-size: 0.8rem; color: #9CA3AF; }

        .edp-badge { display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
        .edp-badge-green { background: #ECFDF5; color: #059669; }
        .edp-badge-gray { background: #F3F4F6; color: #6B7280; }
        .edp-badge-red { background: #FEF2F2; color: #DC2626; }
        .edp-badge-pink { background: #FDF2F5; color: #B07A8E; }

        .edp-title { font-size: 1.3rem; font-weight: 800; color: #1F2937; line-height: 1.5; margin: 14px 0 24px; padding: 0 28px; }
        .edp-hero { width: 100%; height: 220px; }
        .edp-content { padding: 28px; font-size: 0.9rem; color: #374151; line-height: 1.9; white-space: pre-wrap; word-break: keep-all; }
        .edp-date { padding: 0 28px 24px; font-size: 0.75rem; color: #C4B5BC; text-align: right; margin: 0; }

        .edp-footer { margin-top: 20px; }
        .edp-list-btn { width: 100%; padding: 15px; background: white; border: 1.5px solid #E5E7EB; border-radius: 14px; font-size: 0.9rem; font-weight: 600; color: #6B7280; cursor: pointer; font-family: inherit; transition: background 0.15s; }
        .edp-list-btn:hover { background: #F3F4F6; }

        .edp-back-btn-solid { padding: 10px 24px; background: #B07A8E; color: white; border: none; border-radius: 10px; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; }

        @media (max-width: 480px) {
          .edp-main { padding: 20px 16px 60px; }
          .edp-title { font-size: 1.1rem; padding: 0 20px; }
          .edp-hero { height: 180px; }
          .edp-meta { padding: 20px 20px 0; }
          .edp-content { padding: 20px; }
          .edp-date { padding: 0 20px 20px; }
        }
      `}</style>
    </div>
  );
};

export default EventDetailPage;
