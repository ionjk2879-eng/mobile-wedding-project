import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { InvitationData } from '../../../types';

const MODES: { key: NonNullable<InvitationData['contactDisplayMode']>; name: string; desc: string }[] = [
  { key: 'inline', name: '인라인', desc: '그룹별로 항상 펼쳐서 표시' },
  { key: 'popup', name: '팝업', desc: '"연락처 보기" 버튼을 누르면 팝업으로 표시' },
  { key: 'accordion', name: '아코디언', desc: '신랑측·신부측 각각 클릭해서 펼치기' },
];

const ContactsSection: React.FC = () => {
  const mode = useInvitationStore((s) => s.data.contactDisplayMode ?? 'inline');
  const updateField = useInvitationStore((s) => s.updateField);

  return (
    <div className="input-group">
      <label>표시 방식</label>
      <div className="account-style-grid">
        {MODES.map(m => (
          <button
            key={m.key}
            type="button"
            className={`account-style-btn ${mode === m.key ? 'active' : ''}`}
            onClick={() => updateField('contactDisplayMode', m.key)}
          >
            <strong>{m.name}</strong>
            <span>{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContactsSection;
