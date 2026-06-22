import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';

const RSVPSection: React.FC = () => {
  const isRSVPEnabled = useInvitationStore((s) => s.data.isRSVPEnabled);
  const updateField = useInvitationStore((s) => s.updateField);

  return (
    <>
      <div className="input-group">
        <label className="modern-checkbox">
          <input type="checkbox" checked={isRSVPEnabled} onChange={(e) => updateField('isRSVPEnabled', e.target.checked)} />
          <span>참석 응답(RSVP) 기능 활성화</span>
        </label>
      </div>
      {isRSVPEnabled && (
        <div className="rsvp-info-box">
          <p>참석 응답 폼이 미리보기에 표시됩니다.</p>
          <p>하객이 참석 여부, 동반 인원, 식사 여부를 응답할 수 있습니다.</p>
        </div>
      )}
    </>
  );
};

export default RSVPSection;