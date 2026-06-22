import React, { useState, useEffect } from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { checkSlugAvailable } from '../../../firebase';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ShareSection: React.FC = () => {
  const slug = useInvitationStore((s) => s.data.slug);
  const groomName = useInvitationStore((s) => s.data.groomName);
  const brideName = useInvitationStore((s) => s.data.brideName);
  const date = useInvitationStore((s) => s.data.date);
  const time = useInvitationStore((s) => s.data.time);
  const venueName = useInvitationStore((s) => s.data.venueName);
  const heroPhoto = useInvitationStore((s) => s.data.heroPhoto);
  const shareTitle = useInvitationStore((s) => s.data.shareTitle);
  const shareDescription = useInvitationStore((s) => s.data.shareDescription);
  const updateField = useInvitationStore((s) => s.updateField);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

  useEffect(() => {
    if (!slug) { setSlugStatus('idle'); return; }
    if (!SLUG_REGEX.test(slug)) { setSlugStatus('invalid'); return; }

    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const mySlugs: string[] = JSON.parse(localStorage.getItem('sonett_my_slugs') || '[]');
      if (mySlugs.includes(slug)) { setSlugStatus('available'); return; }
      try {
        const ok = await checkSlugAvailable(slug);
        setSlugStatus(ok ? 'available' : 'taken');
      } catch {
        setSlugStatus('idle');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [slug]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-');
    updateField('slug', raw);
  };

  const slugHint = () => {
    switch (slugStatus) {
      case 'checking': return <span className="input-hint">확인 중...</span>;
      case 'available': return <span className="input-hint hint-success">사용 가능한 주소입니다.</span>;
      case 'taken': return <span className="input-hint hint-error">이미 사용 중인 주소입니다.</span>;
      case 'invalid': return <span className="input-hint hint-error">영문 소문자, 숫자, 하이픈만 사용 가능합니다.</span>;
      default: return <span className="input-hint">영문, 숫자, 하이픈만 사용 가능합니다. 이 주소로 청첩장이 공유됩니다.</span>;
    }
  };

  return (
    <>
      <p className="section-desc">청첩장 주소를 설정하고 저장하면 하객에게 공유할 수 있습니다.</p>
      <div className="input-group">
        <label>청첩장 주소</label>
        <div className="slug-input-row">
          <span className="slug-prefix">/w/</span>
          <input type="text" value={slug || ''} onChange={handleSlugChange} className={`modern-input ${slugStatus === 'taken' || slugStatus === 'invalid' ? 'input-error' : slugStatus === 'available' ? 'input-valid' : ''}`} placeholder="jihyun-minji" />
        </div>
        {slugHint()}
      </div>
      <div className="share-divider" />
      <p className="section-desc">카카오톡으로 공유할 때 표시될 정보를 설정합니다.</p>
      <div className="input-group">
        <label>공유 제목</label>
        <input type="text" value={shareTitle} onChange={(e) => updateField('shareTitle', e.target.value)} className="modern-input" placeholder={`${groomName || '신랑'} ♡ ${brideName || '신부'} 결혼합니다`} />
        <span className="input-hint">비워두면 신랑/신부 이름으로 자동 생성됩니다.</span>
      </div>
      <div className="input-group">
        <label>공유 설명</label>
        <textarea value={shareDescription} onChange={(e) => updateField('shareDescription', e.target.value)} rows={2} className="modern-input" placeholder={`${date || '날짜'} ${time || '시간'}\n${venueName || '장소'}`} />
        <span className="input-hint">비워두면 일시와 장소로 자동 생성됩니다.</span>
      </div>
      <div className="share-preview-card">
        <div className="share-preview-header">미리보기</div>
        <div className="share-preview-body">
          <div className="share-preview-thumb">{heroPhoto ? <img src={heroPhoto} alt="" /> : <span>사진</span>}</div>
          <div className="share-preview-info">
            <strong>{shareTitle || `${groomName} ♡ ${brideName} 결혼합니다`}</strong>
            <p>{shareDescription || `${date} ${time}\n${venueName}`}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareSection;