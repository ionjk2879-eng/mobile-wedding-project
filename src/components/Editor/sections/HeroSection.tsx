import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Move, Plus } from 'lucide-react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { InvitationData } from '../../../types';
import { uploadImage } from '../../../services/storageService';
import { toast } from '../../../stores/useToastStore';
import { getApiErrorMessage } from '../../../utils/apiError';
import { isFixedLookHeroStyle } from '../../../data/heroStyleConfig';

const HERO_PHOTO_SHAPES: { key: NonNullable<InvitationData['heroPhotoShape']>; name: string }[] = [
  { key: 'basic', name: '기본' },
  { key: 'fill', name: '라운드' },
  { key: 'arch', name: '아치형' },
  { key: 'oval', name: '오벌형' },
  { key: 'frame', name: '액자형' },
  { key: 'blob', name: '물방울형' },
  { key: 'polaroid', name: '폴라로이드형' },
  { key: 'hexagon', name: '육각형' },
  { key: 'hairline', name: '헤어라인' },
];


const HeroSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const updateFields = useInvitationStore((s) => s.updateFields);
  const [uploading, setUploading] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const isFixedLook = isFixedLookHeroStyle(data.heroStyle);

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
        <div className="photo-pos-header-row">
          <label>메인 사진</label>
          {data.heroPhoto && <label><Move size={13} style={{ verticalAlign: 'middle' }} /> 사진 위치 조정</label>}
        </div>
        <div className="photo-with-pos-row">
          <div className="modern-hero-upload">
            {uploading ? (
              <div className="hero-empty-upload"><Loader2 size={24} className="spin" /><span>업로드 중...</span></div>
            ) : data.heroPhoto ? (
              <>
                <img src={data.heroPhoto} alt="Hero" />
                <label className="change-btn"><ImageIcon size={11} /> 변경<input type="file" accept="image/*" onChange={handleHeroPhotoUpload} hidden /></label>
              </>
            ) : (
              <label className="hero-empty-upload">
                <span className="hero-empty-upload-plus"><Plus size={18} /></span>
                <span>메인 사진</span>
                <input type="file" accept="image/*" onChange={handleHeroPhotoUpload} hidden />
              </label>
            )}
          </div>
          {data.heroPhoto && (
            <div className="photo-pos-controls">
              <div className="photo-pos-row">
                <span className="photo-pos-label">좌우</span>
                <input type="range" min={0} max={100} value={data.heroPhotoX ?? 50} onChange={(e) => updateField('heroPhotoX', Number(e.target.value))} className="photo-pos-slider" />
              </div>
              <div className="photo-pos-row">
                <span className="photo-pos-label">상하</span>
                <input type="range" min={0} max={100} value={data.heroPhotoY ?? 50} onChange={(e) => updateField('heroPhotoY', Number(e.target.value))} className="photo-pos-slider" />
              </div>
              <div className="photo-pos-row">
                <span className="photo-pos-label">확대</span>
                <input type="range" min={100} max={200} value={data.heroPhotoScale ?? 100} onChange={(e) => updateField('heroPhotoScale', Number(e.target.value))} className="photo-pos-slider" />
              </div>
            </div>
          )}
        </div>
        {data.heroPhoto && (
          <button type="button" className="photo-pos-reset" onClick={() => updateFields({ heroPhotoX: 50, heroPhotoY: 50, heroPhotoScale: 100 })}>초기화</button>
        )}
      </div>
      {data.heroStyle === 'split' && (
        <>
          <div className="input-group">
            <div className="photo-pos-header-row">
              <label>신부 사진 (스플릿용)</label>
              {data.heroPhoto2 && <label><Move size={13} style={{ verticalAlign: 'middle' }} /> 사진 위치 조정</label>}
            </div>
            <div className="photo-with-pos-row">
              <div className="modern-hero-upload">
                {uploading2 ? (
                  <div className="hero-empty-upload"><Loader2 size={24} className="spin" /><span>업로드 중...</span></div>
                ) : data.heroPhoto2 ? (
                  <>
                    <img src={data.heroPhoto2} alt="Bride" />
                    <label className="change-btn"><ImageIcon size={11} /> 변경<input type="file" accept="image/*" onChange={handleHeroPhoto2Upload} hidden /></label>
                  </>
                ) : (
                  <label className="hero-empty-upload">
                    <span className="hero-empty-upload-plus"><Plus size={18} /></span>
                    <span>신부 사진</span>
                    <input type="file" accept="image/*" onChange={handleHeroPhoto2Upload} hidden />
                  </label>
                )}
              </div>
              {data.heroPhoto2 && (
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
              )}
            </div>
            <span className="input-hint">비워두면 메인 사진과 동일하게 표시됩니다.</span>
          </div>
        </>
      )}
      {isFixedLook ? (
        <div className="input-group">
          <label>사진 모형</label>
          <p className="hero-fixed-look-notice">이 스타일은 사진 모형과 무관하게 고유한 디자인을 사용합니다.</p>
        </div>
      ) : (
        <div className="opt-inline-group">
          <label className="opt-inline-label">사진 모형</label>
          <div className="hero-shape-grid">
            {HERO_PHOTO_SHAPES.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`hero-shape-btn ${(data.heroPhotoShape || 'basic') === s.key ? 'active' : ''}`}
                onClick={() => updateField('heroPhotoShape', s.key)}
              >
                <span className={`hero-shape-preview hero-shape-preview-${s.key}`} />
                <strong>{s.name}</strong>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="opt-inline-group">
        <label className="opt-inline-label">메인화면 스타일</label>
        <div className="hero-style-grid">
          {([
            { key: 'classic', name: '클래식' },
            { key: 'overlay', name: '오버레이' },
            { key: 'minimal', name: '미니멀' },
            { key: 'editorial', name: '에디토리얼' },
            { key: 'fullscreen', name: '풀스크린' },
            { key: 'split', name: '스플릿' },
            { key: 'centercard', name: '센터 카드' },
            { key: 'glassframe', name: '투명 액자' },
            { key: 'instacard', name: '인스타그램' },
            { key: 'bookcover', name: '북커버' },
            { key: 'bookpage', name: '책 한 페이지' },
            { key: 'filmstrip', name: '필름 스틸' },
            { key: 'verttype', name: '세로 타이포' },
            { key: 'magframe', name: '매거진 프레임' },
            { key: 'boldtype', name: '볼드 타이포' },
            { key: 'datesplit', name: '데이트 스플릿' },
          ] as { key: InvitationData['heroStyle']; name: string }[]).map(s => (
            <button key={s.key} type="button" className={`hero-style-btn ${data.heroStyle === s.key ? 'active' : ''}`} onClick={() => updateField('heroStyle', s.key)}>
              <strong>{s.name}</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">메인화면 효과</label>
        <div className="opt-inline-content">
          <div className="account-style-grid">
            <button type="button" className={`account-style-btn ${(data.heroWaveEffect || 'none') === 'none' ? 'active' : ''}`} onClick={() => updateField('heroWaveEffect', 'none')}>
              <strong>없음</strong>
            </button>
            <button type="button" className={`account-style-btn ${(data.heroWaveEffect || 'none') !== 'none' ? 'active' : ''}`} onClick={() => updateField('heroWaveEffect', data.heroWaveEffect && data.heroWaveEffect !== 'none' ? data.heroWaveEffect : 'bottom')}>
              <strong>물결</strong>
            </button>
          </div>
          {(data.heroWaveEffect || 'none') !== 'none' && (
            <div className="account-style-grid" style={{ marginTop: 8 }}>
              {([
                { key: 'top', name: '상단' },
                { key: 'bottom', name: '하단' },
                { key: 'both', name: '상하단' },
              ] as { key: NonNullable<InvitationData['heroWaveEffect']>; name: string }[]).map(s => (
                <button key={s.key} type="button" className={`account-style-btn ${data.heroWaveEffect === s.key ? 'active' : ''}`} onClick={() => updateField('heroWaveEffect', s.key)}>
                  <strong>{s.name}</strong>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HeroSection;