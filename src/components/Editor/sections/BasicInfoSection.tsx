import React, { useMemo } from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';

const BasicInfoSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const updateFields = useInvitationStore((s) => s.updateFields);
  const updateContact = useInvitationStore((s) => s.updateContact);
  const updateParent = useInvitationStore((s) => s.updateParent);

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const isPastDate = useMemo(() => {
    if (!data.weddingDateISO) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(data.weddingDateISO) < today;
  }, [data.weddingDateISO]);

  const parseTime = (timeStr: string) => {
    const parts = timeStr.match(/(AM|PM)\s(\d+):(\d+)/);
    if (parts) return { ampm: parts[1], hours: parseInt(parts[2]), minutes: parseInt(parts[3]) };
    return { ampm: 'PM', hours: 12, minutes: 0 };
  };

  const timeParts = parseTime(data.time);

  const adjustTime = (type: 'hours' | 'minutes' | 'ampm', delta: number) => {
    let { ampm, hours, minutes } = timeParts;
    if (type === 'ampm') ampm = ampm === 'AM' ? 'PM' : 'AM';
    else if (type === 'hours') { hours += delta; if (hours > 12) hours = 1; if (hours < 1) hours = 12; }
    else if (type === 'minutes') { minutes += delta; if (minutes >= 60) minutes = 0; if (minutes < 0) minutes = 55; }
    updateField('time', `${ampm} ${hours}:${minutes.toString().padStart(2, '0')}`);
  };

  const handleDateChange = (value: string) => {
    const selectedDate = new Date(value);
    if (!isNaN(selectedDate.getTime())) {
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      updateFields({
        weddingDateISO: value,
        date: `${selectedDate.getFullYear()}. ${selectedDate.getMonth() + 1}. ${selectedDate.getDate()}. ${dayNames[selectedDate.getDay()]}`
      });
    }
  };

  const getParentValue = (side: 'groomParents' | 'brideParents', role: string) => data.parents[side].find(p => p.role === role)?.name || '';
  const getParentDeceased = (side: 'groomParents' | 'brideParents', role: string) => data.parents[side].find(p => p.role === role)?.isDeceased || false;
  const getParentPhone = (side: 'groomParents' | 'brideParents', role: string) => data.parents[side].find(p => p.role === role)?.phone || '';

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
              <input type="text" value={data[nameField]} onChange={(e) => updateField(nameField, e.target.value)} className="modern-input" placeholder="이름" />
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
      <div className="basic-card">
        <div className="basic-card-header"><span className="person-type date">예식 일시</span></div>
        <div className="basic-card-body">
          <div className="date-time-row">
            <div className="basic-field date-field">
              <label>예식일</label>
              <input type="date" value={data.weddingDateISO} onChange={(e) => handleDateChange(e.target.value)} className={`modern-input ${isPastDate ? 'input-warning' : ''}`} />
              {isPastDate && <span className="input-hint hint-warning">과거 날짜가 선택되었습니다.</span>}
            </div>
            <div className="basic-field date-field">
              <label>표시 날짜</label>
              <input type="text" value={data.date} readOnly className="modern-input readonly" />
            </div>
            <div className="basic-field time-field">
              <label>예식 시간</label>
              <div className="time-picker-flat">
                <button type="button" className="time-adj" onClick={() => adjustTime('ampm', 0)}>{timeParts.ampm}</button>
                <button type="button" className="time-adj" onClick={() => adjustTime('hours', 1)}>{timeParts.hours.toString().padStart(2, '0')}</button>
                <span className="time-colon">:</span>
                <button type="button" className="time-adj" onClick={() => adjustTime('minutes', 5)}>{timeParts.minutes.toString().padStart(2, '0')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;