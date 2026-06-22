import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import useInvitationStore from '../../../stores/useInvitationStore';

const MessageSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);

  const handleProfilePhotoUpload = (field: 'groomPhoto' | 'bridePhoto', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => updateField(field, event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const renderCard = (type: 'groom' | 'bride') => {
    const isGroom = type === 'groom';
    const label = isGroom ? '신랑' : '신부';
    const photoField = isGroom ? 'groomPhoto' : 'bridePhoto' as const;
    const msgField = isGroom ? 'groomMessage' : 'brideMessage' as const;
    const photo = data[photoField];
    const placeholder = isGroom ? '항상 곁에서 힘이 되어주는 든든한 남편이 되겠습니다.' : '서로 아끼고 배려하며 예쁘게 잘 살겠습니다.';

    return (
      <div className="profile-msg-card">
        <div className="profile-msg-header"><span className={`person-type ${isGroom ? '' : 'bride'}`}>{label}</span></div>
        <div className="profile-msg-body">
          <div className="profile-upload-area">
            {photo ? (
              <div className="profile-thumb">
                <img src={photo} alt={label} />
                <label className="profile-change-btn"><ImageIcon size={12} /><input type="file" accept="image/*" onChange={(e) => handleProfilePhotoUpload(photoField, e)} hidden /></label>
              </div>
            ) : (
              <label className="profile-empty">
                <ImageIcon size={20} /><span>프로필</span>
                <input type="file" accept="image/*" onChange={(e) => handleProfilePhotoUpload(photoField, e)} hidden />
              </label>
            )}
          </div>
          <div className="profile-msg-input">
            <textarea value={data[msgField]} onChange={(e) => updateField(msgField, e.target.value)} rows={2} className="modern-input" placeholder={placeholder} />
          </div>
        </div>
      </div>
    );
  };

  return <>{renderCard('groom')}{renderCard('bride')}</>;
};

export default MessageSection;