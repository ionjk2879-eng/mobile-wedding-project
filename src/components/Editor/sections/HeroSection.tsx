import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Move } from 'lucide-react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { InvitationData } from '../../../types';
import { uploadImage } from '../../../services/storageService';
import { toast } from '../../../stores/useToastStore';
import { getApiErrorMessage } from '../../../utils/apiError';

const HeroSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const updateFields = useInvitationStore((s) => s.updateFields);
  const [uploading, setUploading] = useState(false);
  const [uploading2, setUploading2] = useState(false);

  const handleHeroPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, `images/${data.slug || 'temp'}/hero/${Date.now()}_${file.name}`, 1200);
      updateField('heroPhoto', url);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleHeroPhoto2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading2(true);
    try {
      const url = await uploadImage(file, `images/${data.slug || 'temp'}/hero/${Date.now()}_${file.name}`, 1200);
      updateField('heroPhoto2', url);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading2(false);
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
      {data.heroPhoto && (
        <div className="input-group">
          <label><Move size={14} style={{ verticalAlign: 'middle' }} /> 사진 위치 조정</label>
          <div className="photo-pos-controls">
            <div className="photo-pos-row">
              <span className="photo-pos-label">좌우</span>
              <input type="range" min={0} max={100} value={data.heroPhotoX ?? 50} onChange={(e) => updateField('heroPhotoX', Number(e.target.value))} className="photo-pos-slider" />
            </div>
            <div className="photo-pos-row">
              <span className="photo-pos-label">상하</span>
              <input type="range" min={0} max={100} value={data.heroPhotoY ?? 50} onChange={(e) => updateField('heroPhotoY', Number(e.target.value))} className="photo-pos-slider" />
            </div>
            <button type="button" className="photo-pos-reset" onClick={() => updateFields({ heroPhotoX: 50, heroPhotoY: 50 })}>중앙으로 초기화</button>
          </div>
        </div>
      )}
      {data.heroStyle === 'split' && (
        <>
          <div className="input-group">
            <label>신부 사진 (스플릿용)</label>
            <div className="modern-hero-upload">
              {uploading2 ? (
                <div className="hero-empty-upload"><Loader2 size={24} className="spin" /><span>업로드 중...</span></div>
              ) : data.heroPhoto2 ? (
                <>
                  <img src={data.heroPhoto2} alt="Bride" />
                  <label className="change-btn"><ImageIcon size={16} /> 변경<input type="file" accept="image/*" onChange={handleHeroPhoto2Upload} hidden /></label>
                </>
              ) : (
                <label className="hero-empty-upload">
                  <ImageIcon size={24} />
                  <span>신부 사진 등록</span>
                  <input type="file" accept="image/*" onChange={handleHeroPhoto2Upload} hidden />
                </label>
              )}
            </div>
            <span className="input-hint">비워두면 메인 사진과 동일하게 표시됩니다.</span>
          </div>
          {data.heroPhoto2 && (
            <div className="input-group">
              <label><Move size={14} style={{ verticalAlign: 'middle' }} /> 신부 사진 위치 조정</label>
              <div className="photo-pos-controls">
                <div className="photo-pos-row">
                  <span className="photo-pos-label">좌우</span>
                  <input type="range" min={0} max={100} value={data.heroPhoto2X ?? 50} onChange={(e) => updateField('heroPhoto2X', Number(e.target.value))} className="photo-pos-slider" />
                </div>
                <div className="photo-pos-row">
                  <span className="photo-pos-label">상하</span>
                  <input type="range" min={0} max={100} value={data.heroPhoto2Y ?? 50} onChange={(e) => updateField('heroPhoto2Y', Number(e.target.value))} className="photo-pos-slider" />
                </div>
                <button type="button" className="photo-pos-reset" onClick={() => updateFields({ heroPhoto2X: 50, heroPhoto2Y: 50 })}>중앙으로 초기화</button>
              </div>
            </div>
          )}
        </>
      )}
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
            { key: 'centercard', name: '센터 카드', desc: '카드형 사진 중앙 배치' },
            { key: 'glassframe', name: '투명 액자', desc: '사진 위에 유리 액자가 떠 있는 느낌' },
            { key: 'instacard', name: '인스타그램', desc: '인스타그램 포스트 감성 레이아웃' },
            { key: 'bookcover', name: '북커버', desc: '고급 양장본 표지 스타일' },
            { key: 'bookpage', name: '책 한 페이지', desc: '아름다운 책 속 삽화 페이지 느낌' },
          ] as { key: InvitationData['heroStyle']; name: string; desc: string }[]).map(s => (
            <button key={s.key} type="button" className={`hero-style-btn ${data.heroStyle === s.key ? 'active' : ''}`} onClick={() => updateField('heroStyle', s.key)}>
              <strong>{s.name}</strong>
              <span>{s.desc}</span>
            </button>
          ))}
        </div>
        <div className="hero-style-subgroup">
          <span className="hero-style-subgroup-label">매거진 커버</span>
          <div className="hero-style-grid">
            {([
              { key: 'filmstrip' as InvitationData['heroStyle'], name: '필름 스틸', desc: '상하 필름 바 + 사진 중앙' },
              { key: 'verttype' as InvitationData['heroStyle'], name: '세로 타이포', desc: '세로 타이틀 스파인 + 사진' },
            ]).map(s => (
              <button key={s.key} type="button" className={`hero-style-btn ${data.heroStyle === s.key ? 'active' : ''}`} onClick={() => updateField('heroStyle', s.key)}>
                <strong>{s.name}</strong>
                <span>{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="hero-style-subgroup">
          <span className="hero-style-subgroup-label">포토그래피</span>
          <div className="hero-style-grid">
            {([
              { key: 'magframe' as InvitationData['heroStyle'], name: '매거진 프레임', desc: '세로 타이틀 + 액자 사진 + 시그니처 이름' },
              { key: 'boldtype' as InvitationData['heroStyle'], name: '볼드 타이포', desc: '사진 위 굵은 타이포 강조' },
              { key: 'datesplit' as InvitationData['heroStyle'], name: '데이트 스플릿', desc: '사진 + 큰 날짜 숫자 컬럼' },
            ]).map(s => (
              <button key={s.key} type="button" className={`hero-style-btn ${data.heroStyle === s.key ? 'active' : ''}`} onClick={() => updateField('heroStyle', s.key)}>
                <strong>{s.name}</strong>
                <span>{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;