import React, { useState } from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { InvitationData } from '../../../types';
import { uploadImage } from '../../../services/storageService';
import { toast } from '../../../stores/useToastStore';
import { getApiErrorMessage } from '../../../utils/apiError';

const PhotosSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const addPhotos = useInvitationStore((s) => s.addPhotos);
  const removePhoto = useInvitationStore((s) => s.removePhoto);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploads = Array.from(files).map((file) =>
        uploadImage(file, `images/${data.slug || 'temp'}/gallery/${Date.now()}_${file.name}`)
      );
      const urls = await Promise.all(uploads);
      addPhotos(urls);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="modern-photo-editor">
      <div className="opt-inline-group" style={{ marginBottom: '20px' }}>
        <span className="opt-inline-label">갤러리 연출 방식</span>
        <div className="account-style-grid">
          {([
            { key: 'slide', name: '슬라이드' },
            { key: 'style3', name: '메이슨리' },
            { key: 'auto', name: '자동 애니메이션' },
            { key: 'slideshow', name: '슬라이드쇼' },
          ] as { key: InvitationData['galleryStyle']; name: string }[]).map(s => (
            <button key={s.key} type="button" className={`account-style-btn ${data.galleryStyle === s.key ? 'active' : ''}`} onClick={() => updateField('galleryStyle', s.key)}>
              <strong>{s.name}</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="photo-label">갤러리 사진 (다중 선택 가능)</div>
      <div className="modern-gallery-grid">
        <label className={`add-photo-card ${uploading ? 'uploading' : ''}`}>
          <div className="plus">{uploading ? '⏳' : '+'}</div>
          <span>{uploading ? '업로드 중...' : '사진 추가'}</span>
          <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} hidden disabled={uploading} />
        </label>
        {data.photos.map((photo, index) => (
          <div key={index} className="gallery-item"><img src={photo} alt="Preview" /><button className="del-btn" onClick={() => removePhoto(index)}>×</button></div>
        ))}
      </div>
    </div>
  );
};

export default PhotosSection;