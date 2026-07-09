import React from 'react';
import { InvitationData } from '../../types';

interface CalendarProps {
  data: InvitationData;
}

const Calendar: React.FC<CalendarProps> = ({ data }) => {
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weddingDate = new Date(data.weddingDateISO);

  if (isNaN(weddingDate.getTime())) {
    return null;
  }

  const year = weddingDate.getFullYear();
  const month = weddingDate.getMonth();
  const date = weddingDate.getDate();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= lastDateOfMonth; i++) {
    days.push(i);
  }

  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';
  const calendarPlain = data.calendarStyle === 'plain';

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const formatDate = () => {
    if (isEn) return `${monthNamesEn[month]} ${date}, ${year}`;
    if (isJa) return `${year}年${month + 1}月${date}日`;
    return `${year}년 ${month + 1}월 ${date}일`;
  };

  const formatTime = () => {
    if (!data.time) return '';
    const parts = data.time.match(/(AM|PM)\s(\d+):(\d+)/);
    if (parts) {
      const h = parts[2];
      const m = parts[3];
      if (isEn) return `${h}:${m} ${parts[1]}`;
      if (isJa) {
        const ampm = parts[1] === 'AM' ? '午前' : '午後';
        return `${ampm}${h}時${m === '00' ? '' : m + '分'}`.trim();
      }
      const ampm = parts[1] === 'AM' ? '오전' : '오후';
      return `${ampm} ${h}시 ${m === '00' ? '' : m + '분'}`.trim();
    }
    return data.time;
  };

  const getWeddingDateTime = () => {
    const d = new Date(data.weddingDateISO);
    if (data.time) {
      const parts = data.time.match(/(AM|PM)\s(\d+):(\d+)/);
      if (parts) {
        let h = parseInt(parts[2]);
        if (parts[1] === 'PM' && h !== 12) h += 12;
        if (parts[1] === 'AM' && h === 12) h = 0;
        d.setHours(h, parseInt(parts[3]), 0, 0);
      }
    }
    return d;
  };

  const weddingDateTime = getWeddingDateTime();
  const diff = weddingDateTime.getTime() - now;
  const isPast = diff <= 0;

  const totalSeconds = Math.floor(Math.abs(diff) / 1000);
  const cDays = Math.floor(totalSeconds / 86400);
  const cHours = Math.floor((totalSeconds % 86400) / 3600);
  const cMinutes = Math.floor((totalSeconds % 3600) / 60);
  const cSeconds = totalSeconds % 60;

  return (
    <section className="calendar-section" aria-label="캘린더">
      <div className={`calendar-container ${data.calendarStyle === 'plain' ? 'calendar-plain' : ''}`}>
        <div className="calendar-header">
          <p className="month-name">{monthNames[month]}</p>
          <p className="year-name">{year}</p>
        </div>

        <div className="calendar-grid">
          {weekDays.map(day => (
            <div key={day} className="weekday-label">{day}</div>
          ))}
          {days.map((d, index) => (
            <div
              key={index}
              className={`calendar-day ${d === date ? 'selected' : ''} ${index % 7 === 0 ? 'sunday' : ''}`}
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      <div className="wedding-detail-info">
        <p className="wedding-date-text">{formatDate()}</p>
        <p className="wedding-time-text">{formatTime()}</p>
      </div>

      <div className="countdown-area">
        {isPast ? (
          <p className="countdown-label">{isEn ? 'The wedding has begun!' : isJa ? '式が始まりました！' : '결혼식이 시작되었습니다!'}</p>
        ) : (
          <>
            <p className="countdown-label">{isEn ? 'Until the Wedding' : isJa ? '式まであと' : '결혼식까지 남은 시간'}</p>
            <div className={`countdown-boxes ${calendarPlain ? 'countdown-plain' : ''}`}>
              <div className="countdown-box">
                <span className="countdown-unit">DAYS</span>
                <span className="countdown-num">{cDays}</span>
              </div>
              <div className="countdown-box">
                <span className="countdown-unit">HOURS</span>
                <span className="countdown-num">{String(cHours).padStart(2, '0')}</span>
              </div>
              <div className="countdown-box">
                <span className="countdown-unit">MIN</span>
                <span className="countdown-num">{String(cMinutes).padStart(2, '0')}</span>
              </div>
              <div className="countdown-box">
                <span className="countdown-unit">SEC</span>
                <span className="countdown-num">{String(cSeconds).padStart(2, '0')}</span>
              </div>
            </div>
          </>
        )}
      </div>

    </section>
  );
};

export default Calendar;
