import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import useInvitationStore from '../../../stores/useInvitationStore';

const GuestbookSection: React.FC = () => {
  const isGuestbookEnabled = useInvitationStore((s) => s.data.isGuestbookEnabled);
  const guestbookPassword = useInvitationStore((s) => s.data.guestbookPassword);
  const updateField = useInvitationStore((s) => s.updateField);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="input-group">
        <label className="modern-checkbox">
          <input type="checkbox" checked={isGuestbookEnabled} onChange={(e) => updateField('isGuestbookEnabled', e.target.checked)} />
          <span>방명록 기능 활성화</span>
        </label>
      </div>
      {isGuestbookEnabled && (
        <>
          <div className="opt-inline-group">
            <label className="opt-inline-label">관리 비밀번호</label>
            <div className="opt-inline-content">
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={guestbookPassword}
                  onChange={(e) => updateField('guestbookPassword', e.target.value)}
                  className="modern-input"
                  placeholder="방명록 삭제 시 필요한 비밀번호"
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span className="input-hint">하객이 남긴 방명록을 삭제할 때 이 비밀번호가 필요합니다.</span>
            </div>
          </div>
          <div className="rsvp-info-box">
            <p>하객이 축하 메시지를 남기고 서로의 메시지를 볼 수 있습니다.</p>
            <p>비밀번호를 설정하면 신랑 신부만 특정 메시지를 삭제할 수 있습니다.</p>
          </div>
        </>
      )}
    </>
  );
};

export default GuestbookSection;