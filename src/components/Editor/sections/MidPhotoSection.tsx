import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Move, Plus } from 'lucide-react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { uploadImage } from '../../../services/storageService';
import { toast } from '../../../stores/useToastStore';
import { getApiErrorMessage } from '../../../utils/apiError';

const MidPhotoSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const updateFields = useInvitationStore((s) => s.updateFields);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, `images/${data.slug || 'temp'}/midphoto/${Date.now()}_${file.name}`);
      updateField('midPhoto', url);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <div className="input-group">
        <label className="modern-checkbox">
          <input type="checkbox" checked={data.isMidPhotoEnabled !== false} onChange={(e) => updateField('isMidPhotoEnabled', e.target.checked)} />
          <span>중간사진 기능 활성화</span>
        </label>
      </div>
      <div className="input-group">
        <label>중간 사진</label>
        <div className="modern-hero-upload">
          {uploading ? (
            <div className="hero-empty-upload"><Loader2 size={24} className="spin" /><span>업로드 중...</span></div>
          ) : data.midPhoto ? (
            <>
              <img src={data.midPhoto} alt="Mid" />
              <label className="change-btn"><ImageIcon size={16} /> 변경<input type="file" accept="image/*" onChange={handleUpload} hidden /></label>
            </>
          ) : (
            <label className="hero-empty-upload">
              <span className="hero-empty-upload-plus"><Plus size={18} /></span>
              <span>중간 사진</span>
              <input type="file" accept="image/*" onChange={handleUpload} hidden />
            </label>
          )}
        </div>
        <span className="input-hint">청첩장 중간에 보여줄 사진입니다.</span>
      </div>
      {data.midPhoto && (
        <div className="input-group">
          <label><Move size={14} style={{ verticalAlign: 'middle' }} /> 사진 위치 조정</label>
          <div className="photo-pos-controls">
            <div className="photo-pos-row">
              <span className="photo-pos-label">좌우</span>
              <input type="range" min={0} max={100} value={data.midPhotoX ?? 50} onChange={(e) => updateField('midPhotoX', Number(e.target.value))} className="photo-pos-slider" />
            </div>
            <div className="photo-pos-row">
              <span className="photo-pos-label">상하</span>
              <input type="range" min={0} max={100} value={data.midPhotoY ?? 50} onChange={(e) => updateField('midPhotoY', Number(e.target.value))} className="photo-pos-slider" />
            </div>
            <button type="button" className="photo-pos-reset" onClick={() => updateFields({ midPhotoX: 50, midPhotoY: 50 })}>중앙으로 초기화</button>
          </div>
        </div>
      )}
      <div className="input-group">
        <label>문구 (선택)</label>
        <textarea
          className="modern-input"
          rows={3}
          value={data.midPhotoCaption}
          onChange={(e) => updateField('midPhotoCaption', e.target.value)}
          placeholder="예) 우리의 이야기는 계속됩니다"
        />
      </div>
    </>
  );
};

export default MidPhotoSection;
