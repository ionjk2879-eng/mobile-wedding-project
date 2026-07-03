import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';

const LiveGallerySection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);

  return (
    <div className="input-group">
      <label className="modern-checkbox">
        <input
          type="checkbox"
          checked={data.isLiveGalleryEnabled === true}
          onChange={(e) => updateField('isLiveGalleryEnabled', e.target.checked)}
        />
        <span>라이브 갤러리 활성화</span>
      </label>
      <span className="input-hint">
        결혼식 당일 하객들이 직접 찍은 사진을 올릴 수 있는 공용 갤러리 버튼이 청첩장에 추가됩니다.
      </span>
    </div>
  );
};

export default LiveGallerySection;
