import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadInvitation, fetchPrivacySettings, updatePrivacySettings, PrivacySettings } from '../services/invitationService';
import { fetchRSVPResponses } from '../services/rsvpService';
import { fetchGuests, createGuest, updateGuest, deleteGuest, patchGuestLinkSent } from '../services/guestService';
import { fetchGalleryAdminList, unhideGalleryPhoto, adminDeleteGalleryPhoto, GalleryAdminPhoto } from '../services/galleryService';
import { signInWithGoogle, signOut } from '../services/auth';
import { toast } from '../stores/useToastStore';
import { formatShareDateTime } from '../utils/formatShareDateTime';
import { RSVPResponse, Guest, GuestRelation, InvitationData } from '../types';
import { Users, Utensils, X, RefreshCw, ArrowLeft, LogIn, LogOut, Copy, Trash2, Pencil, Check, Share2, EyeOff, RotateCcw, ChevronLeft, ChevronRight, Shield, Menu } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';
import ToastContainer from '../components/Toast';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useLightboxDrag } from '../hooks/useLightboxDrag';

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
  const [showUnvisitedOnly, setShowUnvisitedOnly] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [privacyLoading, setPrivacyLoading] = useState(true);
  const [transitionDateInput, setTransitionDateInput] = useState('');
  const [savingTransitionDate, setSavingTransitionDate] = useState(false);

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryAdminPhoto[]>([]);
  const [galleryTotal, setGalleryTotal] = useState(0);
  const [galleryLimit, setGalleryLimit] = useState(0);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);
  const [galleryLightboxIndex, setGalleryLightboxIndex] = useState<number | null>(null);
  const galleryLightboxTrapRef = useFocusTrap(galleryLightboxIndex !== null);

  // 숨김 필터를 토글하면 표시 목록이 바뀌어 인덱스가 다른 사진을 가리킬 수 있으므로 라이트박스를 닫는다
  useEffect(() => { setGalleryLightboxIndex(null); }, [showHiddenOnly]);

  useEffect(() => {
    if (authLoading || !slug) return;
    if (!user) { setAuthorized(false); setLoading(false); return; }
    loadInvitation(slug).then((inv) => {
      if (!inv) { setAuthorized(false); setLoading(false); return; }
      setInvitationInfo(inv);
      setAuthorized(!inv.ownerUid || inv.ownerUid === user.uid);
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

  const fetchPrivacy = async () => {
    if (!slug) return;
    setPrivacyLoading(true);
    try {
      const s = await fetchPrivacySettings(slug);
      setPrivacySettings(s);
      setTransitionDateInput(s.privacyTransitionDate ? s.privacyTransitionDate.slice(0, 10) : '');
    } catch (err) {
      console.error('개인정보 설정 로드 실패:', err);
    }
    setPrivacyLoading(false);
  };

  useEffect(() => { if (authorized) fetchPrivacy(); }, [slug, authorized]);

  const handleSaveTransitionDate = async () => {
    if (!slug || !transitionDateInput) return;
    setSavingTransitionDate(true);
    try {
      await updatePrivacySettings(slug, { privacyTransitionDate: new Date(`${transitionDateInput}T00:00:00`).toISOString() });
      await fetchPrivacy();
      toast.success('전환일을 저장했습니다.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '저장에 실패했습니다.');
    }
    setSavingTransitionDate(false);
  };

  const handleSetOverride = async (field: 'accountInfoVisibleOverride' | 'rsvpFormOpenOverride' | 'anniversaryModeVisibleOverride', value: 0 | 1 | null) => {
    if (!slug) return;
    try {
      await updatePrivacySettings(slug, { [field]: value });
      await fetchPrivacy();
      toast.success('설정을 변경했습니다.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '변경에 실패했습니다.');
    }
  };

  const formatDateKo = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const privacyStatusMessage = (override: 0 | 1 | null, label: string) => {
    if (!privacySettings) return '';
    if (override === 1) return `${label}를 계속 공개로 유지 중입니다.`;
    if (override === 0) return `${label}를 수동으로 비공개 처리했습니다.`;
    if (!privacySettings.privacyTransitionDate) return `청첩장 날짜가 설정되면 ${label} 자동 비공개 전환일이 계산됩니다.`;
    if (privacySettings.isPastTransition) return `${label}가 비공개 전환되었습니다.`;
    return `${label}는 ${formatDateKo(privacySettings.privacyTransitionDate)}부터 자동으로 비공개 전환됩니다.`;
  };

  const fetchGalleryList = async () => {
    if (!slug) return;
    setGalleryLoading(true);
    try {
      const { photos, total, limit } = await fetchGalleryAdminList(slug);
      setGalleryPhotos(photos);
      setGalleryTotal(total);
      setGalleryLimit(limit);
    } catch (err) {
      console.error('갤러리 로드 실패:', err);
    }
    setGalleryLoading(false);
  };

  useEffect(() => { if (authorized) fetchGalleryList(); }, [slug, authorized]);

  const handleUnhidePhoto = async (photo: GalleryAdminPhoto) => {
    if (!slug) return;
    try {
      await unhideGalleryPhoto(slug, photo.id);
      setGalleryPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, hiddenAt: null } : p)));
      toast.success('사진을 복구했습니다.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '복구에 실패했습니다.');
    }
  };

  const handleDeletePhoto = async (photo: GalleryAdminPhoto) => {
    if (!slug || !confirm('이 사진을 완전히 삭제할까요? 되돌릴 수 없습니다.')) return;
    try {
      await adminDeleteGalleryPhoto(slug, photo.id);
      setGalleryPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setGalleryTotal((prev) => Math.max(0, prev - 1));
      toast.success('사진을 삭제했습니다.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const displayedGalleryPhotos = showHiddenOnly ? galleryPhotos.filter((p) => p.hiddenAt) : galleryPhotos;
  const hiddenPhotoCount = galleryPhotos.filter((p) => p.hiddenAt).length;

  const closeGalleryLightbox = useCallback(() => setGalleryLightboxIndex(null), []);
  const showNextGalleryPhoto = useCallback(() => {
    setGalleryLightboxIndex((i) => (i === null ? null : (i + 1) % displayedGalleryPhotos.length));
  }, [displayedGalleryPhotos.length]);
  const showPrevGalleryPhoto = useCallback(() => {
    setGalleryLightboxIndex((i) => (i === null ? null : (i - 1 + displayedGalleryPhotos.length) % displayedGalleryPhotos.length));
  }, [displayedGalleryPhotos.length]);

  // 완전 삭제, 혹은 "숨김만 보기" 필터 상태에서의 복구로 displayedGalleryPhotos에서 항목이 사라질 때
  // 라이트박스 인덱스를 범위 내로 보정하고, 표시할 사진이 하나도 안 남으면 모달을 닫는다.
  const adjustLightboxAfterMutation = (mutate: (photos: GalleryAdminPhoto[]) => GalleryAdminPhoto[]) => {
    setGalleryPhotos((prev) => {
      const next = mutate(prev);
      const nextDisplayed = showHiddenOnly ? next.filter((p) => p.hiddenAt) : next;
      setGalleryLightboxIndex((i) => {
        if (i === null) return null;
        if (nextDisplayed.length === 0) return null;
        return Math.min(i, nextDisplayed.length - 1);
      });
      return next;
    });
  };

  const handleUnhidePhotoInLightbox = async (photo: GalleryAdminPhoto) => {
    if (!slug) return;
    try {
      await unhideGalleryPhoto(slug, photo.id);
      adjustLightboxAfterMutation((prev) => prev.map((p) => (p.id === photo.id ? { ...p, hiddenAt: null } : p)));
      toast.success('사진을 복구했습니다.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '복구에 실패했습니다.');
    }
  };

  const handleDeletePhotoInLightbox = async (photo: GalleryAdminPhoto) => {
    if (!slug || !confirm('이 사진을 완전히 삭제할까요? 되돌릴 수 없습니다.')) return;
    try {
      await adminDeleteGalleryPhoto(slug, photo.id);
      adjustLightboxAfterMutation((prev) => prev.filter((p) => p.id !== photo.id));
      setGalleryTotal((prev) => Math.max(0, prev - 1));
      toast.success('사진을 삭제했습니다.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (galleryLightboxIndex === null) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeGalleryLightbox();
      else if (e.key === 'ArrowRight') showNextGalleryPhoto();
      else if (e.key === 'ArrowLeft') showPrevGalleryPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [galleryLightboxIndex, closeGalleryLightbox, showNextGalleryPhoto, showPrevGalleryPhoto]);

  const { trackRef: galleryLbTrackRef, viewportRef: galleryLbVpRef, onDragStart: onGalleryDragStart, onDragMove: onGalleryDragMove, onDragEnd: onGalleryDragEnd } =
    useLightboxDrag(displayedGalleryPhotos.length, galleryLightboxIndex ?? 0, setGalleryLightboxIndex);

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

  const handleToggleLinkSent = async (guest: Guest) => {
    if (!slug) return;
    const next = !guest.linkSent;
    setGuests(prev => prev.map(g => g.code === guest.code ? { ...g, linkSent: next } : g));
    try {
      await patchGuestLinkSent(slug, guest.code, next);
    } catch {
      setGuests(prev => prev.map(g => g.code === guest.code ? { ...g, linkSent: guest.linkSent } : g));
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
    // 초대 문구와 신랑/신부 이름을 title에 함께 넣어 둘 다 굵게 렌더링되도록 함
    // (title은 대부분 플랫폼에서 굵게 표시되지만, description은 일반 굵기라 여기엔 날짜만 넣음)
    const title = `${guest.name}님을 초대합니다\n${groomName} ❤️ ${brideName}`;
    const description = invitationInfo?.weddingDateISO
      ? formatShareDateTime(invitationInfo.weddingDateISO, invitationInfo.time)
      : '';
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
  const displayedGuests = showUnvisitedOnly ? guests.filter((g) => !g.visitedAt) : guests;

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
          <p>하객 관리 — {slug}</p>
        </div>
        <div className="admin-actions">
          <button onClick={fetchResponses} className="admin-btn"><RefreshCw size={18} /> 새로고침</button>
          <Link to={`/${slug}`} className="admin-btn"><ArrowLeft size={18} /> 청첩장 보기</Link>
          <button onClick={() => signOut()} className="admin-btn"><LogOut size={18} /> 로그아웃</button>
        </div>
        <div className="admin-actions-mobile">
          <button
            className="admin-hamburger-btn"
            onClick={() => setActionsMenuOpen((v) => !v)}
            aria-label={actionsMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={actionsMenuOpen}
          >
            {actionsMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {actionsMenuOpen && (
            <>
              <div className="admin-actions-backdrop" onClick={() => setActionsMenuOpen(false)} />
              <div className="admin-actions-dropdown">
                <button onClick={() => { fetchResponses(); setActionsMenuOpen(false); }} className="admin-btn"><RefreshCw size={18} /> 새로고침</button>
                <Link to={`/${slug}`} className="admin-btn" onClick={() => setActionsMenuOpen(false)}><ArrowLeft size={18} /> 청첩장 보기</Link>
                <button onClick={() => { signOut(); setActionsMenuOpen(false); }} className="admin-btn"><LogOut size={18} /> 로그아웃</button>
              </div>
            </>
          )}
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
                  <td>
                    {r.guestName}
                    {r.guestCode && <span className="badge verified" title="개인화 링크로 확인된 하객"><Check size={11} /> 확인된 하객</span>}
                  </td>
                  <td>{r.isAttending ? `${r.totalGuests}명` : '-'}</td>
                  <td>{r.isAttending ? (r.wantsMeal === true ? 'O' : r.wantsMeal === false ? 'X' : '미정') : '-'}</td>
                  <td className="msg-cell">{r.message || '-'}</td>
                  <td className="date-cell">{r.createdAt ? new Date(r.createdAt).toLocaleString('ko') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="admin-privacy-section">
        <h2 className="admin-section-title"><Shield size={18} /> 공개 정보 설정</h2>
        {privacyLoading || !privacySettings ? (
          <p className="admin-loading">불러오는 중...</p>
        ) : (
          <>
            <div className="privacy-date-row">
              <label htmlFor="privacy-transition-date">비공개 전환일</label>
              <input
                id="privacy-transition-date"
                type="date"
                className="privacy-date-input"
                value={transitionDateInput}
                onChange={(e) => setTransitionDateInput(e.target.value)}
              />
              <button type="button" className="admin-btn primary" onClick={handleSaveTransitionDate} disabled={savingTransitionDate || !transitionDateInput}>
                {savingTransitionDate ? '저장 중...' : '날짜 저장'}
              </button>
            </div>

            <div className="privacy-fields">
              <div className="privacy-field">
                <h3>계좌번호</h3>
                <p className="privacy-status">{privacyStatusMessage(privacySettings.accountInfoVisibleOverride, '계좌번호')}</p>
                <div className="privacy-override-buttons">
                  <button
                    type="button"
                    className={`privacy-override-btn ${privacySettings.accountInfoVisibleOverride === null ? 'active' : ''}`}
                    onClick={() => handleSetOverride('accountInfoVisibleOverride', null)}
                  >
                    자동으로 전환
                  </button>
                  <button
                    type="button"
                    className={`privacy-override-btn ${privacySettings.accountInfoVisibleOverride === 1 ? 'active' : ''}`}
                    onClick={() => handleSetOverride('accountInfoVisibleOverride', 1)}
                  >
                    계속 공개 유지
                  </button>
                  <button
                    type="button"
                    className={`privacy-override-btn danger ${privacySettings.accountInfoVisibleOverride === 0 ? 'active' : ''}`}
                    onClick={() => handleSetOverride('accountInfoVisibleOverride', 0)}
                  >
                    지금 바로 비공개
                  </button>
                </div>
              </div>

              <div className="privacy-field">
                <h3>RSVP</h3>
                <p className="privacy-status">{privacyStatusMessage(privacySettings.rsvpFormOpenOverride, 'RSVP')}</p>
                <div className="privacy-override-buttons">
                  <button
                    type="button"
                    className={`privacy-override-btn ${privacySettings.rsvpFormOpenOverride === null ? 'active' : ''}`}
                    onClick={() => handleSetOverride('rsvpFormOpenOverride', null)}
                  >
                    자동으로 전환
                  </button>
                  <button
                    type="button"
                    className={`privacy-override-btn ${privacySettings.rsvpFormOpenOverride === 1 ? 'active' : ''}`}
                    onClick={() => handleSetOverride('rsvpFormOpenOverride', 1)}
                  >
                    계속 공개 유지
                  </button>
                  <button
                    type="button"
                    className={`privacy-override-btn danger ${privacySettings.rsvpFormOpenOverride === 0 ? 'active' : ''}`}
                    onClick={() => handleSetOverride('rsvpFormOpenOverride', 0)}
                  >
                    지금 바로 비공개
                  </button>
                </div>
              </div>

              <div className="privacy-field">
                <h3>기념일 모드</h3>
                <p className="privacy-field-desc">개인정보는 아니지만, 앨범처럼 예식 후에도 하객에게 공개할지 직접 정할 수 있습니다.</p>
                <p className="privacy-status">{privacyStatusMessage(privacySettings.anniversaryModeVisibleOverride, '기념일 모드')}</p>
                <div className="privacy-override-buttons">
                  <button
                    type="button"
                    className={`privacy-override-btn ${privacySettings.anniversaryModeVisibleOverride === null ? 'active' : ''}`}
                    onClick={() => handleSetOverride('anniversaryModeVisibleOverride', null)}
                  >
                    자동으로 전환
                  </button>
                  <button
                    type="button"
                    className={`privacy-override-btn ${privacySettings.anniversaryModeVisibleOverride === 1 ? 'active' : ''}`}
                    onClick={() => handleSetOverride('anniversaryModeVisibleOverride', 1)}
                  >
                    계속 공개 유지
                  </button>
                  <button
                    type="button"
                    className={`privacy-override-btn danger ${privacySettings.anniversaryModeVisibleOverride === 0 ? 'active' : ''}`}
                    onClick={() => handleSetOverride('anniversaryModeVisibleOverride', 0)}
                  >
                    지금 바로 비공개
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="admin-guests-section">
        <h2 className="admin-section-title">하객 명단 · 개인화 링크</h2>
        <p className="admin-section-desc">하객의 이름을 추가하고 공유하면 자동으로 하객 이름이 들어가는 청첩장이 만들어집니다.</p>
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

        {!guestsLoading && guests.length > 0 && (
          <label className="guest-filter-toggle">
            <input type="checkbox" checked={showUnvisitedOnly} onChange={(e) => setShowUnvisitedOnly(e.target.checked)} />
            <span>아직 안 본 사람만 보기 ({guests.filter((g) => !g.visitedAt).length}명)</span>
          </label>
        )}

        {guestsLoading ? (
          <p className="admin-loading">불러오는 중...</p>
        ) : guests.length === 0 ? (
          <div className="admin-empty"><p>등록된 하객이 없습니다.</p></div>
        ) : displayedGuests.length === 0 ? (
          <div className="admin-empty"><p>모두 청첩장을 확인했습니다.</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr><th>이름</th><th>관계</th><th>개인화 링크</th><th>등록일</th><th>방문 여부</th><th>발송</th><th></th></tr>
              </thead>
              <tbody>
                {displayedGuests.map((g) => (
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
                          {g.visitedAt ? (
                            <span className="badge visited">방문함 · {new Date(g.visitedAt).toLocaleString('ko')}</span>
                          ) : (
                            <span className="badge unvisited">아직 안 봄</span>
                          )}
                        </td>
                        <td className="link-sent-cell">
                          <input type="checkbox" className="link-sent-check" checked={g.linkSent} onChange={() => handleToggleLinkSent(g)} title="링크 발송 여부" />
                        </td>
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
                          {g.visitedAt ? (
                            <span className="badge visited">방문함 · {new Date(g.visitedAt).toLocaleString('ko')}</span>
                          ) : (
                            <span className="badge unvisited">아직 안 봄</span>
                          )}
                        </td>
                        <td className="link-sent-cell">
                          <input type="checkbox" className="link-sent-check" checked={g.linkSent} onChange={() => handleToggleLinkSent(g)} title="링크 발송 여부" />
                        </td>
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

      <section className="admin-gallery-section">
        <div className="gallery-section-head">
          <h2 className="admin-section-title">라이브 갤러리</h2>
          <span className="gallery-total-count">{galleryTotal}/{galleryLimit}장</span>
        </div>

        {!galleryLoading && hiddenPhotoCount > 0 && (
          <label className="guest-filter-toggle">
            <input type="checkbox" checked={showHiddenOnly} onChange={(e) => setShowHiddenOnly(e.target.checked)} />
            <span>숨김 처리된 사진만 보기 ({hiddenPhotoCount}장)</span>
          </label>
        )}

        {galleryLoading ? (
          <p className="admin-loading">불러오는 중...</p>
        ) : displayedGalleryPhotos.length === 0 ? (
          <div className="admin-empty"><p>{showHiddenOnly ? '숨김 처리된 사진이 없습니다.' : '아직 업로드된 사진이 없습니다.'}</p></div>
        ) : (
          <div className="admin-gallery-grid">
            {displayedGalleryPhotos.map((photo, index) => (
              <div
                className={`admin-gallery-item${photo.hiddenAt ? ' hidden' : ''}`}
                key={photo.id}
                onClick={() => setGalleryLightboxIndex(index)}
                role="button"
                tabIndex={0}
              >
                <img src={photo.url} alt={photo.guestName || '갤러리 사진'} loading="lazy" />
                {photo.hiddenAt && <span className="admin-gallery-hidden-badge"><EyeOff size={11} /> 숨김</span>}
                <div className="admin-gallery-item-footer">
                  <span className="admin-gallery-item-name">{photo.guestName || '익명'}</span>
                  <div className="admin-gallery-item-actions">
                    {photo.hiddenAt && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleUnhidePhoto(photo); }} title="복구"><RotateCcw size={13} /></button>
                    )}
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo); }} title="완전 삭제"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {galleryLightboxIndex !== null && displayedGalleryPhotos[galleryLightboxIndex] && (
        <div className="admin-gallery-lightbox" role="dialog" aria-modal="true" aria-label="사진 확대 보기" ref={galleryLightboxTrapRef}>
          <div className="admin-gallery-lightbox-backdrop" onClick={closeGalleryLightbox} />

          <div className="admin-gallery-lightbox-topbar">
            <span className="admin-gallery-lightbox-name">
              {displayedGalleryPhotos[galleryLightboxIndex].guestName || '익명'}
              {displayedGalleryPhotos[galleryLightboxIndex].hiddenAt && (
                <span className="admin-gallery-hidden-badge"><EyeOff size={11} /> 숨김</span>
              )}
            </span>
            <div className="admin-gallery-lightbox-topbar-actions">
              {displayedGalleryPhotos[galleryLightboxIndex].hiddenAt && (
                <button type="button" onClick={() => handleUnhidePhotoInLightbox(displayedGalleryPhotos[galleryLightboxIndex])} title="복구" aria-label="복구"><RotateCcw size={16} /></button>
              )}
              <button type="button" onClick={() => handleDeletePhotoInLightbox(displayedGalleryPhotos[galleryLightboxIndex])} title="완전 삭제" aria-label="완전 삭제"><Trash2 size={16} /></button>
              <button type="button" onClick={closeGalleryLightbox} aria-label="닫기"><X size={20} /></button>
            </div>
          </div>

          {displayedGalleryPhotos.length > 1 && (
            <button type="button" className="admin-gallery-lightbox-nav admin-gallery-lightbox-prev" onClick={showPrevGalleryPhoto} aria-label="이전 사진">
              <ChevronLeft size={28} />
            </button>
          )}

          <div
            className="admin-gallery-lightbox-stage"
            ref={galleryLbVpRef}
            onTouchStart={(e) => onGalleryDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => onGalleryDragMove(e.touches[0].clientX)}
            onTouchEnd={onGalleryDragEnd}
            onMouseDown={(e) => { e.preventDefault(); onGalleryDragStart(e.clientX); }}
            onMouseMove={(e) => onGalleryDragMove(e.clientX)}
            onMouseUp={onGalleryDragEnd}
            onMouseLeave={onGalleryDragEnd}
          >
            <div className="admin-gallery-lightbox-track" ref={galleryLbTrackRef} style={{ transform: `translateX(-${galleryLightboxIndex * 100}%)` }}>
              {displayedGalleryPhotos.map((photo) => (
                <div key={photo.id} className="admin-gallery-lightbox-item">
                  <img
                    src={photo.url}
                    alt={photo.guestName || '갤러리 사진 확대'}
                    draggable="false"
                  />
                </div>
              ))}
            </div>
          </div>

          {displayedGalleryPhotos.length > 1 && (
            <button type="button" className="admin-gallery-lightbox-nav admin-gallery-lightbox-next" onClick={showNextGalleryPhoto} aria-label="다음 사진">
              <ChevronRight size={28} />
            </button>
          )}

          {displayedGalleryPhotos.length > 1 && (
            <div className="admin-gallery-lightbox-dots">
              {displayedGalleryPhotos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`admin-gallery-lightbox-dot${i === galleryLightboxIndex ? ' active' : ''}`}
                  onClick={() => setGalleryLightboxIndex(i)}
                  aria-label={`사진 ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <ToastContainer />

      <style>{`
        .admin-page { max-width: 960px; margin: 0 auto; padding: 40px 20px; font-family: 'Pretendard', sans-serif; }
        .admin-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .admin-header h1 { margin: 0; font-size: 1.4rem; color: #D4A5C6; letter-spacing: 3px; }
        .admin-header p { margin: 4px 0 0; color: #6B7280; font-size: 0.9rem; }
        .admin-actions { display: flex; gap: 8px; }
        .admin-btn { display: flex; align-items: center; gap: 6px; padding: 10px 16px; border: 1px solid #E5E7EB; border-radius: 10px; background: white; color: #4B5563; font-size: 0.85rem; font-weight: 600; cursor: pointer; text-decoration: none; transition: all 0.2s; }
        .admin-btn:hover { border-color: #D4A5C6; color: #D4A5C6; }
        .admin-actions-mobile { display: none; position: relative; }
        .admin-hamburger-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: 1px solid #E5E7EB; border-radius: 10px; background: white; color: #4B5563; cursor: pointer; transition: all 0.2s; }
        .admin-hamburger-btn:hover { border-color: #D4A5C6; color: #D4A5C6; }
        .admin-actions-backdrop { position: fixed; inset: 0; z-index: 40; }
        .admin-actions-dropdown { position: absolute; top: calc(100% + 8px); right: 0; z-index: 50; display: flex; flex-direction: column; gap: 6px; background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.14); min-width: 170px; }
        .admin-actions-dropdown .admin-btn { white-space: nowrap; }
        @media (max-width: 640px) {
          .admin-actions { display: none; }
          .admin-actions-mobile { display: block; }
        }
        .admin-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 28px; }
        .stat-card { background: white; border: 1px solid #F3F4F6; border-radius: 14px; padding: 18px; display: flex; align-items: center; gap: 12px; color: #D4A5C6; }
        .stat-card div span { display: block; font-size: 0.75rem; color: #9CA3AF; }
        .stat-card div strong { font-size: 1.3rem; color: #1F2937; }
        .stat-icon { font-size: 0.7rem; font-weight: 800; color: white; background: #3B82F6; padding: 4px 8px; border-radius: 6px; }
        .stat-icon.bride { background: #F43F5E; }
        .admin-table-wrap { background: white; border: 1px solid #F3F4F6; border-radius: 16px; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        th { text-align: center; padding: 14px 16px; border-bottom: 2px solid #F3F4F6; color: #9CA3AF; font-weight: 600; font-size: 0.8rem; }
        td { padding: 12px 16px; border-bottom: 1px solid #F9FAFB; color: #374151; text-align: center; vertical-align: middle; }
        .badge { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
        .badge.ok { background: #D1FAE5; color: #059669; }
        .badge.no { background: #FEE2E2; color: #DC2626; }
        .badge.side.groom { background: #DBEAFE; color: #2563EB; }
        .badge.side.bride { background: #FCE7F3; color: #DB2777; }
        .badge.verified { display: inline-flex; align-items: center; gap: 3px; margin-left: 6px; background: #EFF6FF; color: #2563EB; vertical-align: middle; }
        .msg-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #6B7280; font-style: italic; }
        .date-cell { font-size: 0.8rem; color: #9CA3AF; white-space: nowrap; }
        .admin-empty { padding: 60px; text-align: center; background: white; border: 1px dashed #E5E7EB; border-radius: 16px; color: #9CA3AF; }
        .admin-loading { text-align: center; color: #9CA3AF; }
        .admin-btn.primary { background: #B07A8E; border-color: #B07A8E; color: white; }
        .admin-btn.primary:hover { background: #9B6A7E; border-color: #9B6A7E; color: white; }
        .admin-btn.primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .admin-guests-section { margin-top: 40px; }
        .admin-section-title { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; font-weight: 700; color: #1F2937; margin: 0 0 8px; }
        .admin-section-desc { font-size: 0.82rem; color: #9CA3AF; margin: 0 0 16px; line-height: 1.5; }
        .admin-privacy-section { margin-top: 40px; background: white; border: 1px solid #F3F4F6; border-radius: 16px; padding: 24px; }
        .privacy-date-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #F3F4F6; }
        .privacy-date-row label { font-size: 0.85rem; font-weight: 600; color: #4B5563; }
        .privacy-date-input { padding: 8px 12px; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 0.85rem; font-family: inherit; color: #374151; }
        .privacy-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .privacy-field { border: 1px solid #F3F4F6; border-radius: 12px; padding: 16px; }
        .privacy-field h3 { margin: 0 0 8px; font-size: 0.95rem; font-weight: 700; color: #1F2937; }
        .privacy-field-desc { margin: 0 0 10px; font-size: 0.78rem; color: #9CA3AF; line-height: 1.5; }
        .privacy-status { margin: 0 0 14px; font-size: 0.85rem; color: #6B7280; line-height: 1.5; min-height: 2.6em; }
        .privacy-override-buttons { display: flex; flex-wrap: wrap; gap: 6px; }
        .privacy-override-btn { padding: 8px 12px; border: 1px solid #E5E7EB; border-radius: 8px; background: white; color: #4B5563; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .privacy-override-btn:hover { border-color: #D4A5C6; color: #D4A5C6; }
        .privacy-override-btn.active { background: #B07A8E; border-color: #B07A8E; color: white; }
        .privacy-override-btn.danger.active { background: #DC2626; border-color: #DC2626; color: white; }
        @media (max-width: 640px) { .privacy-fields { grid-template-columns: 1fr; } .privacy-date-row { flex-wrap: wrap; } }
        .guest-add-row { display: flex; gap: 8px; margin-bottom: 16px; }
        .guest-add-input { flex: 1; padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.88rem; font-family: inherit; }
        .guest-add-select { padding: 10px 12px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 0.88rem; font-family: inherit; color: #374151; background: white; }
        .guest-edit-input { width: 100%; padding: 6px 8px; border: 1px solid #D4A5C6; border-radius: 6px; font-size: 0.85rem; font-family: inherit; box-sizing: border-box; }
        .guest-edit-select { padding: 6px 8px; border: 1px solid #D4A5C6; border-radius: 6px; font-size: 0.85rem; font-family: inherit; }
        .badge.relation { background: #F3F4F6; color: #6B7280; }
        .badge.visited { background: #D1FAE5; color: #059669; white-space: nowrap; }
        .badge.unvisited { background: #FEF3C7; color: #92400E; white-space: nowrap; }
        .link-sent-cell { text-align: center; }
        .link-sent-check { width: 16px; height: 16px; accent-color: #B07A8E; cursor: pointer; }
        .guest-filter-toggle { display: flex; align-items: center; gap: 8px; margin: -8px 0 14px; font-size: 0.84rem; color: #4B5563; cursor: pointer; user-select: none; }
        .guest-filter-toggle input { accent-color: #B07A8E; width: 15px; height: 15px; cursor: pointer; }
        .link-cell { font-family: monospace; font-size: 0.82rem; color: #6B7280; text-align: left; }
        .row-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; border-radius: 8px; background: none; color: #9CA3AF; cursor: pointer; transition: all 0.15s; margin-right: 2px; }
        .row-icon-btn:hover { background: #F3F4F6; color: #4B5563; }
        .row-icon-btn.danger:hover { background: #FEF2F2; color: #DC2626; }
        .row-icon-btn.kakao:hover { background: #FEF9E6; color: #C79000; }
        .admin-gallery-section { margin-top: 40px; }
        .gallery-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .gallery-section-head .admin-section-title { margin: 0; }
        .gallery-total-count { font-size: 0.82rem; font-weight: 700; color: #9CA3AF; }
        .admin-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
        .admin-gallery-item { position: relative; border-radius: 12px; overflow: hidden; background: #F3F4F6; aspect-ratio: 1; }
        .admin-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .admin-gallery-item.hidden img { opacity: 0.4; }
        .admin-gallery-hidden-badge { position: absolute; top: 6px; left: 6px; display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 6px; background: #FEE2E2; color: #DC2626; font-size: 0.68rem; font-weight: 700; }
        .admin-gallery-item-footer { position: absolute; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%); }
        .admin-gallery-item-name { font-size: 0.72rem; color: white; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.4); }
        .admin-gallery-item-actions { display: flex; gap: 4px; }
        .admin-gallery-item-actions button { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border: none; border-radius: 50%; background: rgba(255,255,255,0.85); color: #4B5563; cursor: pointer; }
        .admin-gallery-item-actions button:hover { background: white; color: #DC2626; }
        .admin-gallery-item { cursor: pointer; }

        .admin-gallery-lightbox { position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .admin-gallery-lightbox-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.9); }
        .admin-gallery-lightbox-topbar { position: absolute; top: 0; left: 0; right: 0; z-index: 2; display: flex; align-items: center; padding: 16px 20px; box-sizing: border-box; }
        .admin-gallery-lightbox-name { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.85rem; font-weight: 600; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 6px; }
        .admin-gallery-lightbox-name .admin-gallery-hidden-badge { position: static; flex-shrink: 0; }
        .admin-gallery-lightbox-topbar-actions { position: relative; z-index: 1; margin-left: auto; display: flex; align-items: center; gap: 6px; }
        .admin-gallery-lightbox-topbar-actions button { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: none; border-radius: 50%; background: rgba(255,255,255,0.12); color: #fff; cursor: pointer; }
        .admin-gallery-lightbox-topbar-actions button:hover { background: rgba(255,255,255,0.22); }
        .admin-gallery-lightbox-nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: none; border-radius: 50%; background: rgba(255,255,255,0.12); color: #fff; cursor: pointer; }
        .admin-gallery-lightbox-nav:hover { background: rgba(255,255,255,0.22); }
        .admin-gallery-lightbox-prev { left: 8px; }
        .admin-gallery-lightbox-next { right: 8px; }
        .admin-gallery-lightbox-stage { position: relative; width: 100%; max-width: 720px; max-height: 78vh; box-sizing: border-box; touch-action: pan-y; overflow: hidden; cursor: grab; }
        .admin-gallery-lightbox-stage:active { cursor: grabbing; }
        .admin-gallery-lightbox-track { display: flex; height: 78vh; transition: transform 0.35s ease; }
        .admin-gallery-lightbox-item { width: 100%; flex-shrink: 0; height: 100%; display: flex; align-items: center; justify-content: center; padding: 0 56px; box-sizing: border-box; }
        .admin-gallery-lightbox-item img { max-width: 100%; max-height: 78vh; object-fit: contain; border-radius: 8px; user-select: none; }
        .admin-gallery-lightbox-dots { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 2; display: flex; align-items: center; gap: 6px; max-width: 85vw; overflow-x: auto; padding: 4px; }
        .admin-gallery-lightbox-dot { flex-shrink: 0; width: 6px; height: 6px; padding: 0; border: none; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s; }
        .admin-gallery-lightbox-dot.active { width: 8px; height: 8px; background: #fff; }

        @media (max-width: 480px) {
          .admin-gallery-lightbox-nav { width: 36px; height: 36px; }
          .admin-gallery-lightbox-item { padding: 0 44px; }
          .admin-gallery-lightbox-name { max-width: 38%; }
        }

        @media (max-width: 768px) { .admin-stats { grid-template-columns: repeat(2, 1fr); } .guest-add-row { flex-wrap: wrap; } }
      `}</style>
    </div>
  );
};

export default AdminPage;
