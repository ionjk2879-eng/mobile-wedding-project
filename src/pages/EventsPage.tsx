import React, { useState, useEffect } from 'react';
import SiteHeader from '../components/SiteHeader';

type Tab = 'event' | 'notice';

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

function extractHashtags(content: string): string[] {
  const matches = content.match(/#[^\s#\n]+/g);
  return matches ? matches.slice(0, 5) : [];
}

const TAG_COLOR: Record<string, string> = {
  '진행중': 'green',
  '중요': 'red',
  '예정': 'gray',
};

function tagColor(tag: string) {
  return TAG_COLOR[tag] || 'pink';
}

const EventsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('event');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Post | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/posts')
      .then(r => r.json())
      .then((data: Post[]) => setPosts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  const filtered = posts.filter(p => p.type === tab);

  return (
    <div className="ep-page">
      <SiteHeader />

      <main className="ep-main">
        <div className="ep-header">
          <h2 className="ep-title">이벤트 · 공지사항</h2>
        </div>

        <div className="ep-tabs">
          <button className={`ep-tab ${tab === 'event' ? 'active' : ''}`} onClick={() => setTab('event')}>이벤트</button>
          <button className={`ep-tab ${tab === 'notice' ? 'active' : ''}`} onClick={() => setTab('notice')}>공지사항</button>
        </div>

        {loading ? (
          <div className="ep-empty">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="ep-empty">
            {tab === 'event' ? '진행 중인 이벤트가 없습니다.' : '등록된 공지사항이 없습니다.'}
          </div>
        ) : (
          <div className="ep-grid">
            {filtered.map(post => {
              const hashtags = extractHashtags(post.content);
              return (
                <div key={post.id} className="ep-card" onClick={() => setSelected(post)}>
                  <div className="ep-card-thumb" style={{ background: getGradient(post.id) }} />
                  <div className="ep-card-body">
                    <div className="ep-card-meta">
                      <span className={`ep-badge ep-badge-${tagColor(post.tag)}`}>{post.tag}</span>
                      <span className="ep-card-category">{post.type === 'event' ? '이벤트' : '공지사항'}</span>
                    </div>
                    <p className="ep-card-title">{post.title}</p>
                    {hashtags.length > 0 && (
                      <p className="ep-card-hashtags">{hashtags.join(' ')}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selected && (
        <div className="ep-overlay" onClick={() => setSelected(null)}>
          <div className="ep-detail" onClick={e => e.stopPropagation()}>
            <button className="ep-detail-close" onClick={() => setSelected(null)}>✕</button>
            <div className="ep-detail-inner">
              <div className="ep-detail-top">
                <span className={`ep-badge ep-badge-${tagColor(selected.tag)}`}>{selected.tag}</span>
              </div>
              <h2 className="ep-detail-title">{selected.title}</h2>
              <div className="ep-detail-hero" style={{ background: getGradient(selected.id) }} />
              <div className="ep-detail-content">{selected.content}</div>
              <p className="ep-detail-date">{selected.created_at.slice(0, 10)}</p>
            </div>
            <div className="ep-detail-footer">
              <button className="ep-detail-back" onClick={() => setSelected(null)}>목록보기</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ep-page { min-height: 100vh; background: #F9F9F9; font-family: 'Pretendard', sans-serif; }
        .ep-main { max-width: 900px; margin: 0 auto; padding: 40px 24px 80px; }
        .ep-header { margin-bottom: 24px; }
        .ep-title { font-size: 1.4rem; font-weight: 700; color: #1F2937; margin: 0; }

        .ep-tabs { display: flex; border-bottom: 2px solid #E5E7EB; margin-bottom: 32px; }
        .ep-tab { padding: 12px 24px; border: none; background: none; font-size: 0.9rem; font-weight: 600; color: #9CA3AF; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; font-family: inherit; }
        .ep-tab.active { color: #B07A8E; border-bottom-color: #B07A8E; }
        .ep-tab:hover:not(.active) { color: #6B7280; }

        .ep-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .ep-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07); cursor: pointer; transition: transform 0.18s, box-shadow 0.18s; }
        .ep-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .ep-card-thumb { height: 180px; width: 100%; }
        .ep-card-body { padding: 16px; }
        .ep-card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .ep-card-category { font-size: 0.8rem; color: #6B7280; }
        .ep-card-title { font-size: 0.95rem; font-weight: 700; color: #1F2937; margin: 0 0 10px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .ep-card-hashtags { font-size: 0.75rem; color: #9CA3AF; margin: 0; line-height: 1.6; }

        .ep-badge { display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
        .ep-badge-green { background: #ECFDF5; color: #059669; }
        .ep-badge-gray { background: #F3F4F6; color: #6B7280; }
        .ep-badge-red { background: #FEF2F2; color: #DC2626; }
        .ep-badge-pink { background: #FDF2F5; color: #B07A8E; }

        .ep-empty { padding: 60px 24px; text-align: center; color: #9CA3AF; font-size: 0.88rem; }

        /* 상세 모달 */
        .ep-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; }
        .ep-detail { background: white; width: 100%; max-width: 560px; max-height: 92vh; border-radius: 24px 24px 0 0; display: flex; flex-direction: column; position: relative; }
        .ep-detail-close { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 1rem; color: #9CA3AF; cursor: pointer; padding: 8px; z-index: 1; }
        .ep-detail-close:hover { color: #4B5563; }
        .ep-detail-inner { flex: 1; overflow-y: auto; padding: 32px 28px 8px; }
        .ep-detail-top { text-align: center; margin-bottom: 12px; }
        .ep-detail-title { font-size: 1.25rem; font-weight: 800; color: #1F2937; text-align: center; margin: 0 0 20px; line-height: 1.5; }
        .ep-detail-hero { height: 200px; border-radius: 16px; margin-bottom: 24px; }
        .ep-detail-content { font-size: 0.88rem; color: #374151; line-height: 1.9; white-space: pre-wrap; word-break: keep-all; }
        .ep-detail-date { font-size: 0.75rem; color: #C4B5BC; text-align: right; margin: 20px 0 0; }
        .ep-detail-footer { padding: 12px 28px 28px; border-top: 1px solid #F3F4F6; }
        .ep-detail-back { width: 100%; padding: 14px; background: #F3F4F6; border: none; border-radius: 12px; font-size: 0.9rem; font-weight: 600; color: #6B7280; cursor: pointer; font-family: inherit; }
        .ep-detail-back:hover { background: #E9EAEB; }

        @media (min-width: 640px) {
          .ep-overlay { align-items: center; }
          .ep-detail { border-radius: 24px; max-height: 85vh; }
        }

        @media (max-width: 700px) {
          .ep-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (max-width: 480px) {
          .ep-main { padding: 24px 16px 60px; }
          .ep-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .ep-card-thumb { height: 140px; }
          .ep-tab { padding: 10px 16px; font-size: 0.85rem; }
          .ep-detail-inner { padding: 28px 20px 8px; }
          .ep-detail-footer { padding: 12px 20px 24px; }
        }
      `}</style>
    </div>
  );
};

export default EventsPage;
