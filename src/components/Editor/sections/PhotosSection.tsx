import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';

const PhotosSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const addPhotos = useInvitationStore((s) => s.addPhotos);
  const removePhoto = useInvitationStore((s) => s.removePhoto);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const readers = Array.from(files).map(file =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      })
    );
    Promise.all(readers).then(addPhotos);
  };

  return (
    <div className="modern-photo-editor">
      <div className="photo-label">갤러리 연출 방식</div>
      <div className="account-style-grid" style={{ marginBottom: '20px' }}>
        {[
          { key: 'slide', name: '슬라이드', desc: '한 장씩 좌우로 넘기기' },
          { key: 'style3', name: '메이슨리', desc: '사진 미리보기 + 자유 배치' },
        ].map(s => (
          <button key={s.key} type="button" className={`account-style-btn ${data.galleryStyle === s.key ? 'active' : ''}`} onClick={() => updateField('galleryStyle', s.key as any)}>
            <strong>{s.name}</strong><span>{s.desc}</span>
          </button>
        ))}
      </div>
      <div className="photo-label">갤러리 사진 (다중 선택 가능)</div>
      <div className="modern-gallery-grid">
        <label className="add-photo-card"><div className="plus">+</div><span>사진 추가</span><input type="file" multiple accept="image/*" onChange={handlePhotoUpload} hidden /></label>
        {data.photos.map((photo, index) => (
          <div key={index} className="gallery-item"><img src={photo} alt="Preview" /><button className="del-btn" onClick={() => removePhoto(index)}>×</button></div>
        ))}
      </div>
    </div>
  );
};

export default PhotosSection;