import React, { useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { InvitationData } from '../../../types';
import { uploadImage } from '../../../firebase';
import { toast } from '../../../stores/useToastStore';
import { getFirebaseErrorMessage } from '../../../utils/firebaseError';

const HeroSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const [uploading, setUploading] = useState(false);

  const handleHeroPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, `images/${data.slug || 'temp'}/hero/${Date.now()}_${file.name}`);
      updateField('heroPhoto', url);
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <div className="input-group">
        <label>메인 사진</label>
        <div className="modern-hero-upload">
          {uploading ? (
            <div className="hero-empty-upload"><Loader2 size={24} className="spin" /><span>업로드 중...</span></div>
          ) : data.heroPhoto ? (
            <>
              <img src={data.heroPhoto} alt="Hero" />
              <label className="change-btn"><ImageIcon size={16} /> 변경<input type="file" accept="image/*" onChange={handleHeroPhotoUpload} hidden /></label>
            </>
          ) : (
            <label className="hero-empty-upload">
              <ImageIcon size={24} />
              <span>메인 사진 등록</span>
              <input type="file" accept="image/*" onChange={handleHeroPhotoUpload} hidden />
            </label>
          )}
        </div>
      </div>
      <div className="input-group">
        <label>메인화면 스타일</label>
        <div className="hero-style-grid">
          {([
            { key: 'classic', name: '클래식', desc: '사진 위, 정보 아래' },
            { key: 'overlay', name: '오버레이', desc: '사진 위에 텍스트 겹침' },
            { key: 'minimal', name: '미니멀', desc: '이름과 날짜만 강조' },
            { key: 'editorial', name: '에디토리얼', desc: '매거진 느낌 레이아웃' },
            { key: 'fullscreen', name: '풀스크린', desc: '사진이 전체를 채움' },
            { key: 'split', name: '스플릿', desc: '좌우 분할 레이아웃' },
            { key: 'elegant', name: '엘레강스', desc: '세로형 고급 레이아웃' },
            { key: 'frame', name: '프레임', desc: '액자 테두리 느낌' },
            { key: 'cinematic', name: '시네마틱', desc: '영화 포스터 느낌' },
          ] as { key: InvitationData['heroStyle']; name: string; desc: string }[]).map(s => (
            <button key={s.key} type="button" className={`hero-style-btn ${data.heroStyle === s.key ? 'active' : ''}`} onClick={() => updateField('heroStyle', s.key)}>
              <strong>{s.name}</strong>
              <span>{s.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default HeroSection;