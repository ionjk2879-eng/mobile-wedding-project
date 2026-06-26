import React, { useEffect, useState } from 'react';
import useAuthStore from '../stores/useAuthStore';
import {
  VerificationRequest,
  fetchAllVerificationRequests,
  approveVerificationRequest,
  rejectVerificationRequest,
} from '../services/verificationService';
import { toast } from '../stores/useToastStore';
import ToastContainer from '../components/Toast';

const ADMIN_EMAIL = 'ionjk2879@gmail.com';

type Filter = 'pending' | 'all' | 'approved' | 'rejected';

const SuperAdminPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchAllVerificationRequests()
      .then(setRequests)
      .catch(() => toast.error('불러오기 실패'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) load();
  }, [user]);

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Pretendard', sans-serif", color: '#6B7280', flexDirection: 'column', gap: 8 }}>
        <ToastContainer />
        <p style={{ margin: 0 }}>접근 권한이 없습니다.</p>
      </div>
    );
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const counts = {
    pending: requests.filter(r => r.status === 'pending').length,
    all: requests.length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const handleApprove = async (req: VerificationRequest) => {
    if (!confirm(`'${req.orderNumber}' 주문을 승인하시겠습니까?\n/w/${req.slug} 워터마크가 제거됩니다.`)) return;
    setProcessing(req.id);
    try {
      await approveVerificationRequest(req.id, req.slug, req.weddingDateISO);
      toast.success('승인 완료');
      load();
    } catch (e: any) {
      toast.error(e?.message || '승인 실패');
    }
    setProcessing(null);
  };

  const handleReject = async (req: VerificationRequest) => {
    if (!confirm('거절하시겠습니까?')) return;
    setProcessing(req.id);
    try {
      await rejectVerificationRequest(req.id);
      toast.success('거절 완료');
      load();
    } catch {
      toast.error('처리 실패');
    }
    setProcessing(null);
  };

  const formatDate = (ts: any) => {
    if (!ts) return '-';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const statusColor = (s: string) =>
    s === 'pending' ? '#F59E0B' : s === 'approved' ? '#10B981' : '#EF4444';
  const statusBg = (s: string) =>
    s === 'pending' ? '#FEF3C7' : s === 'approved' ? '#D1FAE5' : '#FEE2E2';
  const statusText = (s: string) =>
    s === 'pending' ? '대기' : s === 'approved' ? '승인' : '거절';

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Pretendard', sans-serif" }}>
      <ToastContainer />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1F2937', margin: '0 0 4px' }}>주문 검증 관리</h1>
        <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: '0 0 28px' }}>네이버스토어 주문번호 검증 요청을 확인하고 승인합니다.</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {(['pending', 'all', 'approved', 'rejected'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', borderRadius: 20, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem',
                background: filter === f ? '#1F2937' : 'white',
                color: filter === f ? 'white' : '#6B7280',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              {f === 'pending' ? '대기' : f === 'all' ? '전체' : f === 'approved' ? '승인' : '거절'}
              <span style={{ marginLeft: 6, opacity: 0.65, fontWeight: 400 }}>{counts[f]}</span>
            </button>
          ))}
          <button
            onClick={load}
            style={{
              marginLeft: 'auto', padding: '8px 16px', borderRadius: 20,
              border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer',
              fontSize: '0.82rem', fontFamily: 'inherit', color: '#6B7280',
            }}
          >
            새로고침
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 60 }}>불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 60 }}>요청이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(req => (
              <div
                key={req.id}
                style={{
                  background: 'white', borderRadius: 14, padding: '18px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${statusColor(req.status)}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                      fontSize: '0.7rem', fontWeight: 700,
                      background: statusBg(req.status), color: statusColor(req.status),
                    }}>
                      {statusText(req.status)}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1F2937' }}>
                      {req.groomName && req.brideName ? `${req.groomName} & ${req.brideName}` : req.slug}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 3px', fontSize: '0.8rem', color: '#374151' }}>
                    주문번호: <strong style={{ fontFamily: 'monospace', letterSpacing: 0.5 }}>{req.orderNumber}</strong>
                  </p>
                  <p style={{ margin: '0 0 3px', fontSize: '0.77rem', color: '#6B7280' }}>
                    /w/{req.slug} · {req.ownerEmail}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: '#9CA3AF' }}>
                    제출: {formatDate(req.submittedAt)}
                    {req.processedAt && ` · 처리: ${formatDate(req.processedAt)}`}
                  </p>
                </div>
                {req.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      disabled={processing === req.id}
                      onClick={() => handleApprove(req)}
                      style={{
                        padding: '8px 18px', borderRadius: 8, border: 'none',
                        background: '#10B981', color: 'white', fontWeight: 700,
                        fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
                        opacity: processing === req.id ? 0.5 : 1,
                      }}
                    >
                      승인
                    </button>
                    <button
                      disabled={processing === req.id}
                      onClick={() => handleReject(req)}
                      style={{
                        padding: '8px 18px', borderRadius: 8, border: 'none',
                        background: '#FEE2E2', color: '#DC2626', fontWeight: 700,
                        fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
                        opacity: processing === req.id ? 0.5 : 1,
                      }}
                    >
                      거절
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminPage;
