import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';

const ShareSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);

  return (
    <>
      <p className="section-desc">청첩장 주소를 설정하고 저장하면 하객에게 공유할 수 있습니다.</p>
      <div className="input-group">
        <label>청첩장 주소</label>
        <div className="slug-input-row">
          <span className="slug-prefix">/w/</span>
          <input type="text" value={data.slug || ''} onChange={(e) => updateField('slug', e.target.value)} className="modern-input" placeholder="jihyun-minji" />
        </div>
        <span className="input-hint">영문, 숫자, 하이픈만 사용 가능합니다. 이 주소로 청첩장이 공유됩니다.</span>
      </div>
      <div className="input-group">
        <label>관리자 비밀번호</label>
        <input type="password" value={data.adminPassword || ''} onChange={(e) => updateField('adminPassword', e.target.value)} className="modern-input" placeholder="응답 확인 페이지 접속 시 필요합니다" />
        <span className="input-hint">관리자 페이지(/admin)에 접속할 때 이 비밀번호가 필요합니다.</span>
      </div>
      <div className="share-divider" />
      <p className="section-desc">카카오톡으로 공유할 때 표시될 정보를 설정합니다.</p>
      <div className="input-group">
        <label>공유 제목</label>
        <input type="text" value={data.shareTitle} onChange={(e) => updateField('shareTitle', e.target.value)} className="modern-input" placeholder={`${data.groomName || '신랑'} ♡ ${data.brideName || '신부'} 결혼합니다`} />
        <span className="input-hint">비워두면 신랑/신부 이름으로 자동 생성됩니다.</span>
      </div>
      <div className="input-group">
        <label>공유 설명</label>
        <textarea value={data.shareDescription} onChange={(e) => updateField('shareDescription', e.target.value)} rows={2} className="modern-input" placeholder={`${data.date || '날짜'} ${data.time || '시간'}\n${data.venueName || '장소'}`} />
        <span className="input-hint">비워두면 일시와 장소로 자동 생성됩니다.</span>
      </div>
      <div className="share-preview-card">
        <div className="share-preview-header">미리보기</div>
        <div className="share-preview-body">
          <div className="share-preview-thumb">{data.heroPhoto ? <img src={data.heroPhoto} alt="" /> : <span>사진</span>}</div>
          <div className="share-preview-info">
            <strong>{data.shareTitle || `${data.groomName} ♡ ${data.brideName} 결혼합니다`}</strong>
            <p>{data.shareDescription || `${data.date} ${data.time}\n${data.venueName}`}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareSection;