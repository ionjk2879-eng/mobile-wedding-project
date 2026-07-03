import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';

type Tab = 'event' | 'notice';

const EVENT_POSTS = [
  {
    id: 1,
    tag: '진행중',
    tagColor: 'green',
    title: '첫 청첩장 제작 이벤트',
    date: '2026.06.01',
  },
  {
    id: 2,
    tag: '진행중',
    tagColor: 'green',
    title: '후기 작성 이벤트',
    date: '2026.06.15',
  },
  {
    id: 3,
    tag: '예정',
    tagColor: 'gray',
    title: '여름 시즌 테마 출시 기념 이벤트',
    date: '2026.07.01',
  },
];

const NOTICE_POSTS: typeof EVENT_POSTS = [];

const EventsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('event');
  const posts = tab === 'event' ? EVENT_POSTS : NOTICE_POSTS;

  return (
    <div className="ep-page">
      <SiteHeader />

      <main className="ep-main">
        <div className="ep-header">
          <h2 className="ep-title">이벤트 · 공지사항</h2>
        </div>

        <div className="ep-tabs">
          <button
            className={`ep-tab ${tab === 'event' ? 'active' : ''}`}
            onClick={() => setTab('event')}
          >
            이벤트
          </button>
          <button
            className={`ep-tab ${tab === 'notice' ? 'active' : ''}`}
            onClick={() => setTab('notice')}
          >
            공지사항
          </button>
        </div>

        <div className="ep-list">
          {posts.length === 0 ? (
            <div className="ep-empty">
              <p>{tab === 'event' ? '진행 중인 이벤트가 없습니다.' : '등록된 공지사항이 없습니다.'}</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="ep-row">
                <span className={`ep-tag ep-tag-${post.tagColor}`}>{post.tag}</span>
                <span className="ep-row-title">{post.title}</span>
                <span className="ep-row-date">{post.date}</span>
              </div>
            ))
          )}
        </div>
      </main>

      <style>{`
        .ep-page {
          min-height: 100vh;
          background: #EBEBEB;
          font-family: 'Pretendard', sans-serif;
        }
        .ep-main {
          max-width: 760px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }
        .ep-header {
          margin-bottom: 24px;
        }
        .ep-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0;
        }
        .ep-tabs {
          display: flex;
          gap: 0;
          border-bottom: 2px solid #E5E7EB;
          margin-bottom: 0;
        }
        .ep-tab {
          padding: 12px 24px;
          border: none;
          background: none;
          font-size: 0.9rem;
          font-weight: 600;
          color: #9CA3AF;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.15s;
          font-family: inherit;
        }
        .ep-tab.active {
          color: #B07A8E;
          border-bottom-color: #B07A8E;
        }
        .ep-tab:hover:not(.active) {
          color: #6B7280;
        }
        .ep-list {
          background: white;
          border-radius: 0 0 16px 16px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .ep-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #F3F4F6;
          transition: background 0.12s;
          cursor: default;
        }
        .ep-row:last-child {
          border-bottom: none;
        }
        .ep-row:hover {
          background: #FAFAFA;
        }
        .ep-tag {
          flex-shrink: 0;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 6px;
          min-width: 52px;
          text-align: center;
        }
        .ep-tag-green {
          background: #ECFDF5;
          color: #059669;
        }
        .ep-tag-gray {
          background: #F3F4F6;
          color: #6B7280;
        }
        .ep-tag-blue {
          background: #EFF6FF;
          color: #2563EB;
        }
        .ep-row-title {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          color: #1F2937;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ep-row-date {
          flex-shrink: 0;
          font-size: 0.78rem;
          color: #9CA3AF;
        }
        .ep-empty {
          padding: 60px 24px;
          text-align: center;
          color: #9CA3AF;
          font-size: 0.88rem;
        }
        @media (max-width: 480px) {
          .ep-main { padding: 24px 16px 60px; }
          .ep-tab { padding: 10px 16px; font-size: 0.85rem; }
          .ep-row { padding: 14px 16px; gap: 8px; }
          .ep-row-date { display: none; }
        }
      `}</style>
    </div>
  );
};

export default EventsPage;
