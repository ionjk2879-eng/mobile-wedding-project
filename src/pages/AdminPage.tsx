import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadInvitation } from '../services/invitationService';
import { fetchRSVPResponses } from '../services/rsvpService';
import { fetchGuests, createGuest, updateGuest, deleteGuest } from '../services/guestService';
import { signInWithGoogle, signOut } from '../services/auth';
import { toast } from '../stores/useToastStore';
import { formatShareDateTime } from '../utils/formatShareDateTime';
import { RSVPResponse, Guest, GuestRelation, InvitationData } from '../types';
import { Users, Utensils, X, RefreshCw, ArrowLeft, LogIn, LogOut, Copy, Trash2, Pencil, Check, Share2 } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';
import ToastContainer from '../components/Toast';

const SITE_ORIGIN = 'https://sonett.kr';
const KAKAO_APP_KEY = '5a920b742f037d8e9cb29865ca00c909';
const RELATION_LABELS: Record<GuestRelation, string> = { family: '가족', friend: '친구', coworker: '직장동료', other: '기타' };

function ensureKakaoInit() {
  if (!window.Kakao) return false;
  if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_APP_KEY);
  return window.Kakao.isInitialized();
}

const AdminPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const [responses, setResponses] = useState<RSVPResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(true);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestRelation, setNewGuestRelation] = useState<GuestRelation>('friend');
  const [adding, setAdding] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRelation, setEditRelation] = useState<GuestRelation>('friend');
  const [invitationInfo, setInvitationInfo] = useState<InvitationData | null>(null);

  useEffect(() => {
    if (authLoading || !slug) return;
    if (!user) { setAuthorized(false); setLoading(false); return; }
    loadInvitation(slug).then((inv) => {
      if (!inv) { setAuthorized(false); setLoading(false); return; }
      const ownerUid = (inv as unknown as Record<string, unknown>).ownerUid as string | undefined;
      setInvitationInfo(inv);
      setAuthorized(!ownerUid || ownerUid === user.uid);
    });
  }, [user, authLoading, slug]);

  useEffect(() => { ensureKakaoInit(); }, []);

  const fetchResponses = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      setResponses(await fetchRSVPResponses(slug));
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    }
    setLoading(false);
  };

  useEffect(() => { if (authorized) fetchResponses(); }, [slug, authorized]);

  const fetchGuestList = async () => {
    if (!slug) return;
    setGuestsLoading(true);
    try {
      setGuests(await fetchGuests(slug));
    } catch (err) {
      console.error('하객 명단 로드 실패:', err);
    }
    setGuestsLoading(false);
  };

  useEffect(() => { if (authorized) fetchGuestList(); }, [slug, authorized]);

  const handleAddGuest = async () => {
    if (!slug || !newGuestName.trim() || adding) return;
    setAdding(true);
    try {
      await createGuest(slug, newGuestName.trim(), newGuestRelation);
      setNewGuestName('');
      await fetchGuestList();
      toast.success('하객이 추가되었습니다.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '추가에 실패했습니다.');
    }
    setAdding(false);
  };

  const startEditGuest = (guest: Guest) => {
    setEditingCode(guest.code);
    setEditName(guest.name);
    setEditRelation(guest.relation);
  };

  const handleSaveGuest = async (code: string) => {
    if (!slug || !editName.trim()) return;
    try {
      await updateGuest(slug, code, editName.trim(), editRelation);
      setEditingCode(null);
      await fetchGuestList();
      toast.success('수정되었습니다.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '수정에 실패했습니다.');
    }
  };

  const handleDeleteGuest = async (guest: Guest) => {
    if (!slug || !confirm(`'${guest.name}'님을 명단에서 삭제할까요?`)) return;
    try {
      await deleteGuest(slug, guest.code);
      await fetchGuestList();
      toast.success('삭제되었습니다.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleCopyGuestLink = (code: string) => {
    navigator.clipboard.writeText(`${SITE_ORIGIN}/invite/${code}`);
    toast.success('링크가 복사되었습니다.');
  };

  const handleKakaoShareGuest = (guest: Guest) => {
    if (!ensureKakaoInit()) {
      toast.error('카카오 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    const inviteLink = `${SITE_ORIGIN}/invite/${guest.code}`;
    const groomFallback = '신랑';
    const brideFallback = '신부';
    const groomName = invitationInfo?.groomName || groomFallback;
    const brideName = invitationInfo?.brideName || brideFallback;
    const title = `${guest.name}님을 초대합니다`;
    const namesLine = `${groomName} ♥ ${brideName}`;
    const dateTimeLine = invitationInfo?.weddingDateISO
      ? formatShareDateTime(invitationInfo.weddingDateISO, invitationInfo.time)
      : '';
    const description = [namesLine, dateTimeLine].filter(Boolean).join('\n');
    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          description,
          imageUrl: slug ? `${SITE_ORIGIN}/og/${slug}` : `${SITE_ORIGIN}/og-image.png`,
          link: { mobileWebUrl: inviteLink, webUrl: inviteLink },
        },
        buttons: [{ title: '초대장 보기', link: { mobileWebUrl: inviteLink, webUrl: inviteLink } }],
      });
    } catch (e: any) {
      toast.error(`카카오 공유 오류: ${e?.message || '알 수 없는 오류'}`);
    }
  };

  const attending = responses.filter(r => r.isAttending);
  const totalGuests = attending.reduce((a, r) => a + r.totalGuests, 0);
  const mealCount = attending.filter(r => r.wantsMeal).reduce((a, r) => a + r.totalGuests, 0);
  const groomGuests = attending.filter(r => r.relation === 'groom').reduce((a, r) => a + r.totalGuests, 0);
  const brideGuests = attending.filter(r => r.relation === 'bride').reduce((a, r) => a + r.totalGuests, 0);
  const notAttending = responses.filter(r => !r.isAttending).length;

  if (authLoading) return <div className="admin-page"><p className="admin-loading">인증 확인 중...</p></div>;

  if (!user) return (
    <div className="admin-page">
      <div className="admin-login">
        <h1>SONETT</h1>
        <p>관리 페이지에 접근하려면 로그인이 필요합니다.</p>
        <button onClick={() => signInWithGoogle()} className="admin-btn login-btn"><LogIn size={18} /> Google로 로그인</button>
      </div>
      <style>{`
        .admin-login { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; text-align: center; font-family: 'Pretendard', sans-serif; }
        .admin-login h1 { color: #D4A5C6; letter-spacing: 3px; margin: 0; }
        .admin-login p { color: #6B7280; margin: 0; }
        .login-btn { background: #4285F4 !important; color: white !important; border: none !important; padding: 12px 24px !important; border-radius: 12px !important; font-weight: 700 !important; cursor: pointer; }
      `}</style>
    </div>
  );

  if (authorized === false) return (
    <div className="admin-page">
      <div className="admin-login">
        <h1>SONETT</h1>
        <p>이 청첩장의 관리 권한이 없습니다.</p>
        <button onClick={() => signOut()} className="admin-btn"><LogOut size={18} /> 다른 계정으로 로그인</button>
      </div>
      <style>{`
        .admin-login { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; text-align: center; font-family: 'Pretendard', sans-serif; }
        .admin-login h1 { color: #D4A5C6; letter-spacing: 3px; margin: 0; }
        .admin-login p { color: #6B7280; margin: 0; }
      `}</style>
    </div>
  );

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>SONETT</h1>
          <p>참석 응답 관리 — {slug}</p>
        </div>
        <div className="admin-actions">
          <button onClick={fetchResponses} className="admin-btn"><RefreshCw size={18} /> 새로고침</button>
          <Link to={`/${slug}`} className="admin-btn"><ArrowLeft size={18} /> 청첩장 보기</Link>
          <button onClick={() => signOut()} className="admin-btn"><LogOut size={18} /> 로그아웃</button>
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

      <section className="admin-guests-section">
        <h2 className="admin-section-title">하객 명단 · 개인화 링크</h2>
        <div className="guest-add-row">
          <input
            type="text"
            className="guest-add-input"
            placeholder="하객 이름"
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddGuest(); }}
          />
          <select className="guest-add-select" value={newGuestRelation} onChange={(e) => setNewGuestRelation(e.target.value as GuestRelation)}>
            {(Object.keys(RELATION_LABELS) as GuestRelation[]).map((r) => (
              <option key={r} value={r}>{RELATION_LABELS[r]}</option>
            ))}
          </select>
          <button type="button" className="admin-btn primary" disabled={!newGuestName.trim() || adding} onClick={handleAddGuest}>
            {adding ? '추가 중...' : '+ 추가'}
          </button>
        </div>

        {guestsLoading ? (
          <p className="admin-loading">불러오는 중...</p>
        ) : guests.length === 0 ? (
          <div className="admin-empty"><p>등록된 하객이 없습니다.</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr><th>이름</th><th>관계</th><th>개인화 링크</th><th>등록일</th><th></th></tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.code}>
                    {editingCode === g.code ? (
                      <>
                        <td><input type="text" className="guest-edit-input" value={editName} onChange={(e) => setEditName(e.target.value)} /></td>
                        <td>
                          <select className="guest-edit-select" value={editRelation} onChange={(e) => setEditRelation(e.target.value as GuestRelation)}>
                            {(Object.keys(RELATION_LABELS) as GuestRelation[]).map((r) => (
                              <option key={r} value={r}>{RELATION_LABELS[r]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="link-cell">/invite/{g.code}</td>
                        <td className="date-cell">{g.createdAt ? new Date(g.createdAt).toLocaleDateString('ko') : ''}</td>
                        <td>
                          <button type="button" className="row-icon-btn" title="저장" onClick={() => handleSaveGuest(g.code)}><Check size={15} /></button>
                          <button type="button" className="row-icon-btn" title="취소" onClick={() => setEditingCode(null)}><X size={15} /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{g.name}</td>
                        <td><span className="badge relation">{RELATION_LABELS[g.relation]}</span></td>
                        <td className="link-cell">/invite/{g.code}</td>
                        <td className="date-cell">{g.createdAt ? new Date(g.createdAt).toLocaleDateString('ko') : ''}</td>
                        <td>
                          <button type="button" className="row-icon-btn" title="링크 복사" onClick={() => handleCopyGuestLink(g.code)}><Copy size={15} /></button>
                          <button type="button" className="row-icon-btn kakao" title="카카오톡 공유" onClick={() => handleKakaoShareGuest(g)}><Share2 size={15} /></button>
                          <button type="button" className="row-icon-btn" title="수정" onClick={() => startEditGuest(g)}><Pencil size={15} /></button>
                          <button type="button" className="row-icon-btn danger" title="삭제" onClick={() => handleDeleteGuest(g)}><Trash2 size={15} /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ToastContainer />

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
        .admin-btn.primary { background: #B07A8E; border-color: #B07A8E; color: white; }
        .admin-btn.primary:hover { background: #9B6A7E; border-color: #9B6A7E; color: white; }
        .admin-btn.primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .admin-guests-section { margin-top: 40px; }
        .admin-section-title { font-size: 1.1rem; font-weight: 700; color: #1F2937; margin: 0 0 16px; }
        .guest-add-row { display: flex; gap: 8px; margin-bottom: 16px; }
        .guest-add-input { flex: 1; padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.88rem; font-family: inherit; }
        .guest-add-select { padding: 10px 12px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.88rem; font-family: inherit; color: #374151; background: white; }
        .guest-edit-input { width: 100%; padding: 6px 8px; border: 1px solid #D4A5C6; border-radius: 6px; font-size: 0.85rem; font-family: inherit; box-sizing: border-box; }
        .guest-edit-select { padding: 6px 8px; border: 1px solid #D4A5C6; border-radius: 6px; font-size: 0.85rem; font-family: inherit; }
        .badge.relation { background: #F3F4F6; color: #6B7280; }
        .link-cell { font-family: monospace; font-size: 0.82rem; color: #6B7280; }
        .row-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; border-radius: 8px; background: none; color: #9CA3AF; cursor: pointer; transition: all 0.15s; margin-right: 2px; }
        .row-icon-btn:hover { background: #F3F4F6; color: #4B5563; }
        .row-icon-btn.danger:hover { background: #FEF2F2; color: #DC2626; }
        .row-icon-btn.kakao:hover { background: #FEF9E6; color: #C79000; }
        @media (max-width: 768px) { .admin-stats { grid-template-columns: repeat(2, 1fr); } .guest-add-row { flex-wrap: wrap; } }
      `}</style>
    </div>
  );
};

export default AdminPage;
