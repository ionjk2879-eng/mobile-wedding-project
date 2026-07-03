import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Move } from 'lucide-react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { uploadImage } from '../../../services/storageService';
import { toast } from '../../../stores/useToastStore';
import { getApiErrorMessage } from '../../../utils/apiError';

const EndingSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const updateFields = useInvitationStore((s) => s.updateFields);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, `images/${data.slug || 'temp'}/ending/${Date.now()}_${file.name}`);
      updateField('endingPhoto', url);
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
          <input type="checkbox" checked={data.isEndingEnabled !== false} onChange={(e) => updateField('isEndingEnabled', e.target.checked)} />
          <span>엔딩 기능 활성화</span>
        </label>
      </div>
      <div className="input-group">
        <label>엔딩 사진</label>
        <div className="modern-hero-upload">
          {uploading ? (
            <div className="hero-empty-upload"><Loader2 size={24} className="spin" /><span>업로드 중...</span></div>
          ) : data.endingPhoto ? (
            <>
              <img src={data.endingPhoto} alt="Ending" />
              <label className="change-btn"><ImageIcon size={16} /> 변경<input type="file" accept="image/*" onChange={handleUpload} hidden /></label>
            </>
          ) : (
            <label className="hero-empty-upload">
              <ImageIcon size={24} />
              <span>엔딩 사진 등록</span>
              <input type="file" accept="image/*" onChange={handleUpload} hidden />
            </label>
          )}
        </div>
        <span className="input-hint">청첩장 맨 마지막에 보여줄 사진입니다.</span>
      </div>
      {data.endingPhoto && (
        <div className="input-group">
          <label><Move size={14} style={{ verticalAlign: 'middle' }} /> 사진 위치 조정</label>
          <div className="photo-pos-controls">
            <div className="photo-pos-row">
              <span className="photo-pos-label">좌우</span>
              <input type="range" min={0} max={100} value={data.endingPhotoX ?? 50} onChange={(e) => updateField('endingPhotoX', Number(e.target.value))} className="photo-pos-slider" />
            </div>
            <div className="photo-pos-row">
              <span className="photo-pos-label">상하</span>
              <input type="range" min={0} max={100} value={data.endingPhotoY ?? 50} onChange={(e) => updateField('endingPhotoY', Number(e.target.value))} className="photo-pos-slider" />
            </div>
            <button type="button" className="photo-pos-reset" onClick={() => updateFields({ endingPhotoX: 50, endingPhotoY: 50 })}>중앙으로 초기화</button>
          </div>
        </div>
      )}
      <div className="input-group">
        <label>마무리 문구</label>
        <textarea
          className="modern-input"
          rows={3}
          value={data.endingMessage}
          onChange={(e) => updateField('endingMessage', e.target.value)}
          placeholder="저희의 새로운 시작을 함께해주셔서 진심으로 감사합니다."
        />
      </div>
    </>
  );
};

export default EndingSection;
