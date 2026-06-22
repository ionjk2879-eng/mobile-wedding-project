import React, { useMemo } from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';

const DateTimeSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const updateFields = useInvitationStore((s) => s.updateFields);

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

  return (
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
      <div className="basic-field">
        <label>예식장 이름</label>
        <input type="text" value={data.venueName} onChange={(e) => updateField('venueName', e.target.value)} className="modern-input" placeholder="예식장 이름" />
      </div>
      <div className="basic-field">
        <label>예식장 주소</label>
        <input type="text" value={data.venueAddress} onChange={(e) => updateField('venueAddress', e.target.value)} className="modern-input" placeholder="예식장 주소" />
      </div>
    </div>
  );
};

export default DateTimeSection;
