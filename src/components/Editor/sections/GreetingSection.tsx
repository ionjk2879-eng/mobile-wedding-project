import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';

const GreetingSection: React.FC = () => {
  const greetingContent = useInvitationStore((s) => s.data.greetingContent);
  const updateField = useInvitationStore((s) => s.updateField);

  return (
    <div className="input-group">
      <label>내용</label>
      <textarea value={greetingContent} onChange={(e) => updateField('greetingContent', e.target.value)} rows={10} className="modern-input" />
    </div>
  );
};

export default GreetingSection;