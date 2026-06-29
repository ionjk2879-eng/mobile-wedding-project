import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { activatePaidInvitation } from '../services/invitationService';
import useAuthStore from '../stores/useAuthStore';
import { toast } from '../stores/useToastStore';
import ToastContainer from '../components/Toast';
import { Search, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';

const ADMIN_EMAIL = 'ionjk2879@gmail.com';

type Filter = 'all' | 'unpaid' | 'paid';

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

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

const SuperAdminPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<InvRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  // Quick-lookup section
  const [lookupSlug, setLookupSlug] = useState('');
  const [lookupInfo, setLookupInfo] = useState<InvRow | null>(null);
  const [looking, setLooking] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter, ...(query ? { q: query } : {}) });
      const data = await apiFetch<InvRow[]>(`/api/admin/invitations?${params}`);
      setRows(data);
    } catch {
      toast.error('목록 조회 실패');
    }
    setLoading(false);
  }, [filter, query]);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) fetchList();
  }, [fetchList, user]);

  const handleActivate = async (row: InvRow) => {
    if (!row.weddingDateISO) {
      toast.error('결혼 날짜 정보가 없어 활성화할 수 없습니다.');
      return;
    }
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
      if (!found) { toast.error('해당 slug를 찾을 수 없습니다.'); }
      else setLookupInfo(found);
    } catch { toast.error('조회 실패'); }
    setLooking(false);
  };

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Pretendard', sans-serif", color: '#6B7280' }}>
        <ToastContainer />
        <p>접근 권한이 없습니다.</p>
      </div>
    );
  }

  const unpaidCount = rows.filter(r => !r.isPaid).length;

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Pretendard', sans-serif" }}>
      <ToastContainer />

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #F0F0F0', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1F2937' }}>주문 관리</h1>
        {unpaidCount > 0 && (
          <span style={{ padding: '3px 10px', borderRadius: 20, background: '#FEF3C7', color: '#D97706', fontSize: '0.72rem', fontWeight: 700 }}>
            미구매 {unpaidCount}건
          </span>
        )}
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>

        {/* Filter + Search */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: 4 }}>
            {(['all', 'unpaid', 'paid'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px', border: 'none', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  background: filter === f ? '#1F2937' : 'transparent',
                  color: filter === f ? 'white' : '#6B7280',
                }}
              >
                {f === 'all' ? '전체' : f === 'unpaid' ? '미구매' : '활성화됨'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', gap: 8 }}>
            <Search size={14} color="#9CA3AF" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="slug · 이름 · 이메일 검색"
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', color: '#1F2937', fontFamily: 'inherit', background: 'transparent' }}
            />
          </div>

          <button
            onClick={fetchList}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 10, background: 'white', fontSize: '0.82rem', fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.5 : 1 }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} /> 새로고침
          </button>
        </div>

        {/* List */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F0F0F0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>불러오는 중...</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>
              {query || filter !== 'all' ? '검색 결과가 없습니다.' : '청첩장이 없습니다.'}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 120px 90px 100px', gap: 12, padding: '10px 20px', background: '#F9FAFB', borderBottom: '1px solid #F0F0F0', fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF' }}>
                <span>청첩장</span>
                <span>결혼일</span>
                <span>고객</span>
                <span>주소</span>
                <span>만료</span>
                <span></span>
              </div>

              {rows.map((row, i) => {
                const days = daysUntil(row.expiresAt);
                const name = row.groomName && row.brideName ? `${row.groomName} & ${row.brideName}` : row.slug;
                const isActivating = activating === row.slug;
                const urgent = !row.isPaid && days !== null && days <= 3;

                return (
                  <div
                    key={row.slug}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 90px 110px 120px 90px 100px', gap: 12, padding: '14px 20px', alignItems: 'center',
                      borderBottom: i < rows.length - 1 ? '1px solid #F9FAFB' : 'none',
                      background: urgent ? '#FFFBEB' : 'white',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#1F2937' }}>{name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#9CA3AF' }}>{fmtDate(row.createdAt)} 생성</p>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>{row.date || '—'}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#4B5563' }}>{row.ownerName || '—'}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#9CA3AF' }}>{row.ownerEmail || '—'}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>{row.slug}</span>
                      <a href={`https://sonett.kr/${row.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#9CA3AF', lineHeight: 1 }}>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                    <div>
                      {days === null ? (
                        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>—</span>
                      ) : days < 0 ? (
                        <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700 }}>만료됨</span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: urgent ? '#DC2626' : '#6B7280', fontWeight: urgent ? 700 : 400 }}>D-{days}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                      {row.isPaid ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                          <CheckCircle size={13} /> 활성화
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivate(row)}
                          disabled={isActivating}
                          style={{ padding: '6px 12px', border: 'none', borderRadius: 8, background: '#B07A8E', color: 'white', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: isActivating ? 0.5 : 1, transition: 'opacity 0.15s' }}
                        >
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
              <input
                type="text"
                value={lookupSlug}
                onChange={e => { setLookupSlug(e.target.value.trim()); setLookupInfo(null); }}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                placeholder="slug-here"
                style={{ flex: 1, padding: '11px 12px 11px 0', border: 'none', outline: 'none', fontSize: '0.88rem', fontFamily: 'monospace', color: '#1F2937', background: 'transparent' }}
              />
            </div>
            <button
              onClick={handleLookup}
              disabled={!lookupSlug.trim() || looking}
              style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: '#1F2937', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', opacity: (!lookupSlug.trim() || looking) ? 0.4 : 1 }}
            >
              {looking ? '...' : '조회'}
            </button>
          </div>

          {lookupInfo && (
            <div style={{ marginTop: 16, padding: 18, background: '#F9FAFB', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1F2937' }}>
                  {lookupInfo.groomName && lookupInfo.brideName ? `${lookupInfo.groomName} & ${lookupInfo.brideName}` : lookupInfo.slug}
                </p>
                {lookupInfo.date && <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>{lookupInfo.date}</p>}
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#9CA3AF' }}>{lookupInfo.ownerEmail}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: lookupInfo.isPaid ? '#D1FAE5' : '#FEF3C7', color: lookupInfo.isPaid ? '#059669' : '#D97706' }}>
                  {lookupInfo.isPaid ? '활성화됨' : '미구매'}
                </span>
                {!lookupInfo.isPaid && (
                  <button
                    onClick={() => handleActivate(lookupInfo)}
                    disabled={activating === lookupInfo.slug}
                    style={{ padding: '8px 18px', border: 'none', borderRadius: 10, background: '#B07A8E', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', opacity: activating === lookupInfo.slug ? 0.5 : 1 }}
                  >
                    {activating === lookupInfo.slug ? '처리 중...' : '워터마크 제거 · 활성화'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SuperAdminPage;
