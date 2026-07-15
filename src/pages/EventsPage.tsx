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

  const filtered = posts.filter(p => p.type === tab);

  const tagColor = (tag: string) => {
    if (tag === '진행중') return 'green';
    if (tag === '중요') return 'red';
    if (tag === '예정') return 'gray';
    return 'blue';
  };

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

        <div className="ep-list">
          {loading ? (
            <div className="ep-empty">불러오는 중...</div>
          ) : filtered.length === 0 ? (
            <div className="ep-empty">
              {tab === 'event' ? '진행 중인 이벤트가 없습니다.' : '등록된 공지사항이 없습니다.'}
            </div>
          ) : (
            filtered.map(post => (
              <div key={post.id} className="ep-row" onClick={() => setSelected(post)}>
                <span className={`ep-tag ep-tag-${tagColor(post.tag)}`}>{post.tag}</span>
                <span className="ep-row-title">{post.title}</span>
                <span className="ep-row-date">{post.created_at.slice(0, 10)}</span>
              </div>
            ))
          )}
        </div>
      </main>

      {selected && (
        <div className="ep-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="ep-modal" onClick={e => e.stopPropagation()}>
            <div className="ep-modal-header">
              <span className={`ep-tag ep-tag-${tagColor(selected.tag)}`}>{selected.tag}</span>
              <button className="ep-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <h3 className="ep-modal-title">{selected.title}</h3>
            <p className="ep-modal-date">{selected.created_at.slice(0, 10)}</p>
            <div className="ep-modal-content">{selected.content}</div>
          </div>
        </div>
      )}

      <style>{`
        .ep-page { min-height: 100vh; background: #EBEBEB; font-family: 'Pretendard', sans-serif; }
        .ep-main { max-width: 760px; margin: 0 auto; padding: 40px 24px 80px; }
        .ep-header { margin-bottom: 24px; }
        .ep-title { font-size: 1.4rem; font-weight: 700; color: #1F2937; margin: 0; }
        .ep-tabs { display: flex; border-bottom: 2px solid #E5E7EB; margin-bottom: 0; }
        .ep-tab { padding: 12px 24px; border: none; background: none; font-size: 0.9rem; font-weight: 600; color: #9CA3AF; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; font-family: inherit; }
        .ep-tab.active { color: #B07A8E; border-bottom-color: #B07A8E; }
        .ep-tab:hover:not(.active) { color: #6B7280; }
        .ep-list { background: white; border-radius: 0 0 16px 16px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .ep-row { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #F3F4F6; cursor: pointer; transition: background 0.12s; }
        .ep-row:last-child { border-bottom: none; }
        .ep-row:hover { background: #FDF8FA; }
        .ep-tag { flex-shrink: 0; font-size: 0.68rem; font-weight: 700; padding: 3px 10px; border-radius: 6px; min-width: 52px; text-align: center; }
        .ep-tag-green { background: #ECFDF5; color: #059669; }
        .ep-tag-gray { background: #F3F4F6; color: #6B7280; }
        .ep-tag-blue { background: #EFF6FF; color: #2563EB; }
        .ep-tag-red { background: #FEF2F2; color: #DC2626; }
        .ep-row-title { flex: 1; font-size: 0.9rem; font-weight: 500; color: #1F2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ep-row-date { flex-shrink: 0; font-size: 0.78rem; color: #9CA3AF; }
        .ep-empty { padding: 60px 24px; text-align: center; color: #9CA3AF; font-size: 0.88rem; }

        .ep-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .ep-modal { background: white; border-radius: 16px; width: 100%; max-width: 560px; max-height: 80vh; overflow-y: auto; padding: 28px 28px 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
        .ep-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .ep-modal-close { background: none; border: none; font-size: 1rem; color: #9CA3AF; cursor: pointer; padding: 4px 8px; line-height: 1; }
        .ep-modal-close:hover { color: #4B5563; }
        .ep-modal-title { font-size: 1.05rem; font-weight: 700; color: #1F2937; margin: 0 0 6px; line-height: 1.5; }
        .ep-modal-date { font-size: 0.78rem; color: #9CA3AF; margin: 0 0 20px; }
        .ep-modal-content { font-size: 0.9rem; color: #374151; line-height: 1.8; white-space: pre-wrap; }

        @media (max-width: 480px) {
          .ep-main { padding: 24px 16px 60px; }
          .ep-tab { padding: 10px 16px; font-size: 0.85rem; }
          .ep-row { padding: 14px 16px; gap: 8px; }
          .ep-row-date { display: none; }
          .ep-modal { padding: 20px 20px 28px; }
        }
      `}</style>
    </div>
  );
};

export default EventsPage;
