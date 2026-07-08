import React, { useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { uploadImage } from '../../../services/storageService';
import { toast } from '../../../stores/useToastStore';
import { getApiErrorMessage } from '../../../utils/apiError';

const MessageSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const isMessageEnabled = useInvitationStore((s) => s.data.isMessageEnabled);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleProfilePhotoUpload = async (field: 'groomPhoto' | 'bridePhoto', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(field);
    try {
      const url = await uploadImage(file, `images/${data.slug || 'temp'}/profile/${field}_${Date.now()}_${file.name}`);
      updateField(field, url);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const renderCard = (type: 'groom' | 'bride') => {
    const isGroom = type === 'groom';
    const label = isGroom ? '신랑' : '신부';
    const photoField = isGroom ? 'groomPhoto' : 'bridePhoto' as const;
    const msgField = isGroom ? 'groomMessage' : 'brideMessage' as const;
    const photo = data[photoField];
    const isUploading = uploadingField === photoField;
    const placeholder = isGroom ? '항상 곁에서 힘이 되어주는 든든한 남편이 되겠습니다.' : '서로 아끼고 배려하며 예쁘게 잘 살겠습니다.';

    return (
      <div className="profile-msg-card">
        <div className="profile-msg-header"><span className={`person-type ${isGroom ? '' : 'bride'}`}>{label}</span></div>
        <div className="profile-msg-body">
          <div className="profile-upload-area">
            {isUploading ? (
              <div className="profile-empty"><Loader2 size={20} className="spin" /><span>업로드...</span></div>
            ) : photo ? (
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
            <textarea value={data[msgField]} onChange={(e) => updateField(msgField, e.target.value)} rows={3} className="modern-input" placeholder={placeholder} style={{ minHeight: 80 }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="input-group">
        <label className="modern-checkbox">
          <input type="checkbox" checked={isMessageEnabled !== false} onChange={(e) => updateField('isMessageEnabled', e.target.checked)} />
          <span>신랑/신부 한마디 기능 활성화</span>
        </label>
      </div>
      {renderCard('groom')}
      {renderCard('bride')}
      <div className="input-group">
        <label>한마디 표시 스타일</label>
        <div className="account-style-grid">
          <button type="button" className={`account-style-btn ${(data.messageStyle || 'card') === 'card' ? 'active' : ''}`} onClick={() => updateField('messageStyle', 'card')}>
            <strong>카드형</strong><span>둥근 프로필 사진과 카드 배경으로 표시</span>
          </button>
          <button type="button" className={`account-style-btn ${data.messageStyle === 'plain' ? 'active' : ''}`} onClick={() => updateField('messageStyle', 'plain')}>
            <strong>배경 일체형</strong><span>테두리 없이 배경색과 이어지고, 사진은 우표 느낌의 사각형으로 표시</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MessageSection;