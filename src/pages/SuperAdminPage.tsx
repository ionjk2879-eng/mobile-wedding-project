import React, { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db, activatePaidInvitation } from '../firebase';
import useAuthStore from '../stores/useAuthStore';
import { toast } from '../stores/useToastStore';
import ToastContainer from '../components/Toast';

const ADMIN_EMAIL = 'ionjk2879@gmail.com';

interface InvInfo {
  groomName: string;
  brideName: string;
  date: string;
  weddingDateISO: string;
  isPaid: boolean;
  expiresAt?: string | null;
}

const SuperAdminPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const [slug, setSlug] = useState('');
  const [invInfo, setInvInfo] = useState<InvInfo | null>(null);
  const [looking, setLooking] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => { setInvInfo(null); }, [slug]);

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Pretendard', sans-serif", color: '#6B7280' }}>
        <ToastContainer />
        <p>접근 권한이 없습니다.</p>
      </div>
    );
  }

  const handleLookup = async () => {
    const trimmed = slug.trim();
    if (!trimmed) return;
    setLooking(true);
    setInvInfo(null);
    try {
      const snap = await getDoc(doc(db, 'invitations', trimmed));
      if (!snap.exists()) { toast.error('청첩장을 찾을 수 없습니다.'); setLooking(false); return; }
      const d = snap.data();
      setInvInfo({
        groomName: d.groomName || '',
        brideName: d.brideName || '',
        date: d.date || '',
        weddingDateISO: d.weddingDateISO || '',
        isPaid: !!d.isPaid,
        expiresAt: d.expiresAt,
      });
    } catch { toast.error('조회 실패'); }
    setLooking(false);
  };

  const handleActivate = async () => {
    if (!invInfo || !slug.trim()) return;
    const name = invInfo.groomName && invInfo.brideName
      ? `${invInfo.groomName} & ${invInfo.brideName}`
      : slug;
    if (!confirm(`'${name}' 청첩장을 활성화하시겠습니까?\n워터마크가 제거되고 1년 보관이 설정됩니다.`)) return;
    setActivating(true);
    try {
      await activatePaidInvitation(slug.trim(), invInfo.weddingDateISO);
      toast.success('활성화 완료');
      setSlug('');
      setInvInfo(null);
    } catch (e: any) {
      toast.error(e?.message || '활성화 실패');
    }
    setActivating(false);
  };

  const expiryLabel = invInfo?.expiresAt
    ? new Date(invInfo.expiresAt).toLocaleDateString('ko-KR')
    : '-';

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Pretendard', sans-serif", display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 24px' }}>
      <ToastContainer />
      <div style={{ width: '100%', maxWidth: 480 }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1F2937', margin: '0 0 4px' }}>청첩장 활성화</h1>
        <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: '0 0 32px' }}>크몽 주문 확인 후 청첩장의 워터마크를 제거합니다.</p>

        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>
            청첩장 슬러그
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s', ...(slug ? { borderColor: '#B07A8E' } : {}) }}>
              <span style={{ padding: '11px 0 11px 12px', fontSize: '0.85rem', color: '#9CA3AF', fontFamily: 'monospace', flexShrink: 0 }}>/w/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.trim())}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="slug-here"
                style={{ flex: 1, padding: '11px 12px 11px 0', border: 'none', outline: 'none', fontSize: '0.88rem', fontFamily: 'monospace', color: '#1F2937', background: 'transparent' }}
              />
            </div>
            <button
              onClick={handleLookup}
              disabled={!slug.trim() || looking}
              style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: '#1F2937', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', opacity: (!slug.trim() || looking) ? 0.4 : 1 }}
            >
              {looking ? '...' : '조회'}
            </button>
          </div>

          {invInfo && (
            <div style={{ marginTop: 20, padding: 18, background: '#F9FAFB', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1F2937' }}>
                  {invInfo.groomName && invInfo.brideName ? `${invInfo.groomName} & ${invInfo.brideName}` : slug}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                  background: invInfo.isPaid ? '#D1FAE5' : '#FEF3C7',
                  color: invInfo.isPaid ? '#059669' : '#D97706',
                }}>
                  {invInfo.isPaid ? '활성화됨' : '미구매'}
                </span>
              </div>
              {invInfo.date && (
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#6B7280' }}>결혼일: {invInfo.date}</p>
              )}
              {invInfo.isPaid && (
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#9CA3AF' }}>만료: {expiryLabel}</p>
              )}

              {!invInfo.isPaid && (
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  style={{ marginTop: 12, width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: '#B07A8E', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', opacity: activating ? 0.5 : 1, transition: 'opacity 0.15s' }}
                >
                  {activating ? '처리 중...' : '워터마크 제거 · 활성화'}
                </button>
              )}
              {invInfo.isPaid && (
                <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#9CA3AF', textAlign: 'center' }}>이미 활성화된 청첩장입니다.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPage;