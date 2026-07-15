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

const GRADIENTS = [
  'linear-gradient(135deg, #F9C5D1 0%, #E8879A 100%)',
  'linear-gradient(135deg, #B5D5F5 0%, #6AAEE8 100%)',
  'linear-gradient(135deg, #FFD9A0 0%, #F5A623 100%)',
  'linear-gradient(135deg, #C5B5F9 0%, #8A6EE8 100%)',
  'linear-gradient(135deg, #A8E6CF 0%, #3CB371 100%)',
  'linear-gradient(135deg, #FFB5A0 0%, #E86A50 100%)',
];

function getGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length];
}

const TAG_COLOR: Record<string, string> = {
  '진행중': 'green',
  '중요': 'red',
  '예정': 'gray',
};

function tagColor(tag: string) {
  return TAG_COLOR[tag] || 'pink';
}

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
        if (found) {
          setPost(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/events');
    }
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
            <button className="edp-back-btn" onClick={() => navigate('/events')}>목록으로</button>
          </div>
        ) : (
          <>
            <button className="edp-nav-back" onClick={handleBack}>
              ← 목록보기
            </button>

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

        .edp-back-btn { padding: 10px 24px; background: #B07A8E; color: white; border: none; border-radius: 10px; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; }

        @media (max-width: 480px) {
          .edp-main { padding: 20px 16px 60px; }
          .edp-title { font-size: 1.1rem; }
          .edp-hero { height: 180px; }
          .edp-meta { padding: 20px 20px 0; }
          .edp-title { padding: 0 20px; }
          .edp-content { padding: 20px; }
          .edp-date { padding: 0 20px 20px; }
        }
      `}</style>
    </div>
  );
};

export default EventDetailPage;
