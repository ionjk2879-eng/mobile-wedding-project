import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';

const BasicInfoSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const updateContact = useInvitationStore((s) => s.updateContact);
  const updateParent = useInvitationStore((s) => s.updateParent);

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const getParent = (side: 'groomParents' | 'brideParents', role: string) => data.parents[side].find(p => p.role === role);
  const getParentValue = (side: 'groomParents' | 'brideParents', role: string) => getParent(side, role)?.name || '';
  const getParentDeceased = (side: 'groomParents' | 'brideParents', role: string) => getParent(side, role)?.isDeceased || false;
  const getParentDeceasedStyle = (side: 'groomParents' | 'brideParents', role: string) => getParent(side, role)?.deceasedStyle || 'text';
  const getParentPhone = (side: 'groomParents' | 'brideParents', role: string) => getParent(side, role)?.phone || '';

  const renderPersonCard = (type: 'groom' | 'bride') => {
    const isGroom = type === 'groom';
    const label = isGroom ? '신랑' : '신부';
    const nameField: 'groomName' | 'brideName' = isGroom ? 'groomName' : 'brideName';
    const parentSide: 'groomParents' | 'brideParents' = isGroom ? 'groomParents' : 'brideParents';
    const contactIdx = data.contacts.findIndex(c => c.role === label);

    return (
      <div className="basic-card">
        <div className="basic-card-header">
          <span className={`person-type ${isGroom ? '' : 'bride'}`}>{label}</span>
        </div>
        <div className="basic-card-body">
          <div className="basic-field-row">
            <div className="basic-field">
              <label>이름</label>
              <input type="text" value={data[nameField]} onChange={(e) => updateField(nameField, e.target.value)} className="modern-input" placeholder={label} />
            </div>
            <div className="basic-field">
              <label>연락처</label>
              <input type="tel" value={data.contacts.find(c => c.role === label)?.phone || ''} onChange={(e) => updateContact(contactIdx, 'phone', formatPhone(e.target.value))} className="modern-input" placeholder="010-0000-0000" />
            </div>
          </div>
          {['아버지', '어머니'].map(role => (
            <div className="basic-field-row" key={role}>
              <div className="basic-field">
                <label>{role} 성함</label>
                <div className="input-with-btn">
                  <input type="text" value={getParentValue(parentSide, role)} onChange={(e) => updateParent(parentSide, role, 'name', e.target.value)} className="modern-input" />
                  <button type="button" className={`deceased-btn ${getParentDeceased(parentSide, role) ? 'active' : ''}`} onClick={() => updateParent(parentSide, role, 'isDeceased', !getParentDeceased(parentSide, role))}>고인</button>
                </div>
                {getParentDeceased(parentSide, role) && (
                  <div className="deceased-style-row">
                    {([
                      { key: 'text' as const, label: '故 텍스트' },
                      { key: 'chrysanthemum' as const, label: '🏵️ 국화' },
                      { key: 'ribbon' as const, label: '🎀 리본' },
                    ]).map(s => (
                      <button key={s.key} type="button"
                        className={`deceased-style-btn ${getParentDeceasedStyle(parentSide, role) === s.key ? 'active' : ''}`}
                        onClick={() => updateParent(parentSide, role, 'deceasedStyle', s.key)}
                      >{s.label}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="basic-field">
                <label>{role} 연락처</label>
                <input type="tel" value={getParentPhone(parentSide, role)} onChange={(e) => updateParent(parentSide, role, 'phone', formatPhone(e.target.value))} className="modern-input" placeholder="010-0000-0000" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="basic-cards">
      {renderPersonCard('groom')}
      {renderPersonCard('bride')}
    </div>
  );
};

export default BasicInfoSection;
