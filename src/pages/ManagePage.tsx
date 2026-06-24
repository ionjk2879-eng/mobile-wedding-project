import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyInvitations, deleteInvitation } from '../firebase';
import { InvitationData } from '../types';
import { toast } from '../stores/useToastStore';
import { Edit3, Eye, ClipboardList, Trash2 } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import ToastContainer from '../components/Toast';

const ManagePage: React.FC = () => {
  const [invitations, setInvitations] = useState<{ slug: string; data: InvitationData }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetchMyInvitations().then(setInvitations).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`'${slug}' 청첩장을 삭제하시겠습니까?`)) return;
    try {
      await deleteInvitation(slug);
      toast.success(`'${slug}' 청첩장이 삭제되었습니다.`);
      load();
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="manage">
      <SiteHeader />
      <ToastContainer />
      <main className="manage-main">
        <h2 className="manage-title">내 청첩장</h2>
        {loading ? (
          <p className="manage-empty">불러오는 중...</p>
        ) : invitations.length === 0 ? (
          <div className="manage-empty">
            <p>아직 만든 청첩장이 없습니다.</p>
            <Link to="/editor" className="manage-cta">청첩장 만들기</Link>
          </div>
        ) : (
          <div className="manage-list">
            {invitations.map(({ slug, data }) => (
              <div key={slug} className="manage-card">
                <div className="manage-card-info">
                  <h3 className="manage-card-title">
                    {data.groomName && data.brideName
                      ? `${data.groomName} & ${data.brideName}`
                      : slug}
                  </h3>
                  <p className="manage-card-slug">/w/{slug}</p>
                  {data.date && <p className="manage-card-date">{data.date}</p>}
                </div>
                <div className="manage-card-actions">
                  <Link to={`/edit/${slug}`} className="manage-action" title="편집"><Edit3 size={16} /> 편집</Link>
                  <Link to={`/w/${slug}`} target="_blank" className="manage-action" title="보기"><Eye size={16} /> 보기</Link>
                  <Link to={`/admin/${slug}`} target="_blank" className="manage-action" title="응답 확인"><ClipboardList size={16} /> 응답</Link>
                  <button className="manage-action delete" onClick={() => handleDelete(slug)}><Trash2 size={16} /> 삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .manage {
          min-height: 100vh;
          background: #F9FAFB;
          font-family: 'Pretendard', sans-serif;
        }
        .manage-main {
          max-width: 700px;
          margin: 0 auto;
          padding: 40px 24px;
        }
        .manage-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 24px;
        }
        .manage-empty {
          text-align: center;
          color: #9CA3AF;
          padding: 60px 0;
        }
        .manage-cta {
          display: inline-block;
          margin-top: 16px;
          background: #B07A8E;
          color: white;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .manage-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .manage-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .manage-card-info { flex: 1; }
        .manage-card-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1F2937;
          margin: 0 0 4px;
        }
        .manage-card-slug {
          font-size: 0.8rem;
          color: #9CA3AF;
          margin: 0;
        }
        .manage-card-date {
          font-size: 0.8rem;
          color: #6B7280;
          margin: 4px 0 0;
        }
        .manage-card-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .manage-action {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #6B7280;
          text-decoration: none;
          background: #F3F4F6;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .manage-action:hover {
          background: #E5E7EB;
          color: #374151;
        }
        .manage-action.delete:hover {
          background: #FEE2E2;
          color: #DC2626;
        }
        @media (max-width: 600px) {
          .manage-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .manage-card-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default ManagePage;
