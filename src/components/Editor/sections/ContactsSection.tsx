import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { InvitationData } from '../../../types';

const MODES: { key: NonNullable<InvitationData['contactDisplayMode']>; name: string }[] = [
  { key: 'inline', name: '인라인' },
  { key: 'popup', name: '팝업' },
  { key: 'accordion', name: '아코디언' },
  { key: 'flat', name: '배경일체형' },
];

const ContactsSection: React.FC = () => {
  const mode = useInvitationStore((s) => s.data.contactDisplayMode ?? 'inline');
  const updateField = useInvitationStore((s) => s.updateField);

  return (
    <div className="opt-inline-group">
      <label className="opt-inline-label">표시 방식</label>
      <div className="account-style-grid">
        {MODES.map(m => (
          <button
            key={m.key}
            type="button"
            className={`account-style-btn ${mode === m.key ? 'active' : ''}`}
            onClick={() => updateField('contactDisplayMode', m.key)}
          >
            <strong>{m.name}</strong>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContactsSection;
