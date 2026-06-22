import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, collection, getDocs, query, orderBy, verifyAdminPassword } from '../firebase';
import { RSVPResponse } from '../types';
import { Users, Utensils, X, RefreshCw, ArrowLeft, Lock } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [responses, setResponses] = useState<RSVPResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !password) return;
    setChecking(true);
    setAuthError('');
    const valid = await verifyAdminPassword(slug, password);
    if (valid) {
      setAuthenticated(true);
    } else {
      setAuthError('비밀번호가 일치하지 않습니다.');
    }
    setChecking(false);
  };

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, `invitations/${slug}/rsvp`), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setResponses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RSVPResponse)));
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) fetchResponses();
  }, [slug, authenticated]);

  if (!authenticated) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="login-icon"><Lock size={32} /></div>
          <h2>응답 확인</h2>
          <p>관리자 비밀번호를 입력해주세요.</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="login-input"
              autoFocus
            />
            {authError && <p className="login-error">{authError}</p>}
            <button type="submit" className="login-btn" disabled={checking}>
              {checking ? '확인 중...' : '확인'}
            </button>
          </form>
        </div>
        <style>{`
          .admin-login-page { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background: #F0F2F5; font-family: 'Pretendard', sans-serif; }
          .admin-login-card { background: white; border-radius: 24px; padding: 48px 40px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.06); border: 1px solid #E5E7EB; max-width: 380px; width: 90%; }
          .login-icon { color: #D4A5C6; margin-bottom: 20px; }
          .admin-login-card h2 { margin: 0 0 8px; font-size: 1.3rem; color: #1F2937; }
          .admin-login-card > p { margin: 0 0 28px; font-size: 0.88rem; color: #6B7280; }
          .login-input { width: 100%; padding: 14px 16px; border: 1px solid #E5E7EB; border-radius: 12px; background: #F9FAFB; font-size: 0.95rem; text-align: center; letter-spacing: 2px; box-sizing: border-box; }
          .login-input:focus { outline: none; border-color: #D4A5C6; box-shadow: 0 0 0 4px rgba(212,165,198,0.1); }
          .login-error { color: #EF4444; font-size: 0.82rem; margin: 10px 0 0; }
          .login-btn { width: 100%; margin-top: 16px; padding: 14px; background: #D4A5C6; color: white; border: none; border-radius: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
          .login-btn:hover { filter: brightness(0.9); }
          .login-btn:disabled { opacity: 0.6; cursor: default; }
        `}</style>
      </div>
    );
  }

  const attending = responses.filter(r => r.isAttending);
  const totalGuests = attending.reduce((a, r) => a + r.totalGuests, 0);
  const mealCount = attending.filter(r => r.wantsMeal).reduce((a, r) => a + r.totalGuests, 0);
  const groomGuests = attending.filter(r => r.relation === 'groom').reduce((a, r) => a + r.totalGuests, 0);
  const brideGuests = attending.filter(r => r.relation === 'bride').reduce((a, r) => a + r.totalGuests, 0);
  const notAttending = responses.filter(r => !r.isAttending).length;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>SONETT</h1>
          <p>참석 응답 관리 — {slug}</p>
        </div>
        <div className="admin-actions">
          <button onClick={fetchResponses} className="admin-btn"><RefreshCw size={18} /> 새로고침</button>
          <Link to={`/w/${slug}`} className="admin-btn"><ArrowLeft size={18} /> 청첩장 보기</Link>
        </div>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <Users size={20} />
          <div><span>총 참석</span><strong>{totalGuests}명</strong></div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">신랑</span>
          <div><span>신랑측</span><strong>{groomGuests}명</strong></div>
        </div>
        <div className="stat-card">
          <span className="stat-icon bride">신부</span>
          <div><span>신부측</span><strong>{brideGuests}명</strong></div>
        </div>
        <div className="stat-card">
          <Utensils size={20} />
          <div><span>식사 인원</span><strong>{mealCount}명</strong></div>
        </div>
        <div className="stat-card">
          <X size={20} />
          <div><span>불참</span><strong>{notAttending}건</strong></div>
        </div>
      </div>

      {loading ? (
        <p className="admin-loading">불러오는 중...</p>
      ) : responses.length === 0 ? (
        <div className="admin-empty"><p>아직 응답이 없습니다.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr><th>상태</th><th>구분</th><th>이름</th><th>인원</th><th>식사</th><th>메시지</th><th>일시</th></tr>
            </thead>
            <tbody>
              {responses.map((r, i) => (
                <tr key={i}>
                  <td>{r.isAttending ? <span className="badge ok">참석</span> : <span className="badge no">불참</span>}</td>
                  <td><span className={`badge side ${r.relation}`}>{r.relation === 'groom' ? '신랑측' : '신부측'}</span></td>
                  <td>{r.guestName}</td>
                  <td>{r.isAttending ? `${r.totalGuests}명` : '-'}</td>
                  <td>{r.isAttending ? (r.wantsMeal ? 'O' : 'X') : '-'}</td>
                  <td className="msg-cell">{r.message || '-'}</td>
                  <td className="date-cell">{r.createdAt ? new Date(r.createdAt).toLocaleString('ko') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .admin-page { max-width: 960px; margin: 0 auto; padding: 40px 20px; font-family: 'Pretendard', sans-serif; }
        .admin-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .admin-header h1 { margin: 0; font-size: 1.4rem; color: #D4A5C6; letter-spacing: 3px; }
        .admin-header p { margin: 4px 0 0; color: #6B7280; font-size: 0.9rem; }
        .admin-actions { display: flex; gap: 8px; }
        .admin-btn { display: flex; align-items: center; gap: 6px; padding: 10px 16px; border: 1px solid #E5E7EB; border-radius: 10px; background: white; color: #4B5563; font-size: 0.85rem; font-weight: 600; cursor: pointer; text-decoration: none; transition: all 0.2s; }
        .admin-btn:hover { border-color: #D4A5C6; color: #D4A5C6; }
        .admin-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 28px; }
        .stat-card { background: white; border: 1px solid #F3F4F6; border-radius: 14px; padding: 18px; display: flex; align-items: center; gap: 12px; color: #D4A5C6; }
        .stat-card div span { display: block; font-size: 0.75rem; color: #9CA3AF; }
        .stat-card div strong { font-size: 1.3rem; color: #1F2937; }
        .stat-icon { font-size: 0.7rem; font-weight: 800; color: white; background: #3B82F6; padding: 4px 8px; border-radius: 6px; }
        .stat-icon.bride { background: #F43F5E; }
        .admin-table-wrap { background: white; border: 1px solid #F3F4F6; border-radius: 16px; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        th { text-align: left; padding: 14px 16px; border-bottom: 2px solid #F3F4F6; color: #9CA3AF; font-weight: 600; font-size: 0.8rem; }
        td { padding: 12px 16px; border-bottom: 1px solid #F9FAFB; color: #374151; }
        .badge { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
        .badge.ok { background: #D1FAE5; color: #059669; }
        .badge.no { background: #FEE2E2; color: #DC2626; }
        .badge.side.groom { background: #DBEAFE; color: #2563EB; }
        .badge.side.bride { background: #FCE7F3; color: #DB2777; }
        .msg-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #6B7280; font-style: italic; }
        .date-cell { font-size: 0.8rem; color: #9CA3AF; white-space: nowrap; }
        .admin-empty { padding: 60px; text-align: center; background: white; border: 1px dashed #E5E7EB; border-radius: 16px; color: #9CA3AF; }
        .admin-loading { text-align: center; color: #9CA3AF; }
        @media (max-width: 768px) { .admin-stats { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
};

export default AdminPage;
