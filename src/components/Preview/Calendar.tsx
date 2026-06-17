import React from 'react';
import { InvitationData } from '../../types';

interface CalendarProps {
  data: InvitationData;
}

const Calendar: React.FC<CalendarProps> = ({ data }) => {
  const weddingDate = new Date(data.weddingDateISO);
  
  // If invalid date, don't render or render placeholder
  if (isNaN(weddingDate.getTime())) {
    return null;
  }

  const year = weddingDate.getFullYear();
  const month = weddingDate.getMonth();
  const date = weddingDate.getDate();

  // Get first day of the month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Get last date of the month
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  // Add empty slots for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Add dates of the month
  for (let i = 1; i <= lastDateOfMonth; i++) {
    days.push(i);
  }

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const formatKoreanDate = () => {
    return `${year}년 ${month + 1}월 ${date}일`;
  };

  const formatKoreanTime = () => {
    if (!data.time) return '';
    const parts = data.time.match(/(AM|PM)\s(\d+):(\d+)/);
    if (parts) {
      const ampm = parts[1] === 'AM' ? '오전' : '오후';
      const h = parts[2];
      const m = parts[3];
      return `${ampm} ${h}시 ${m === '00' ? '' : m + '분'}`.trim();
    }
    return data.time;
  };

  return (
    <section className="calendar-section">
      <div className="calendar-container">
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
        <p className="wedding-date-text">{formatKoreanDate()}</p>
        <p className="wedding-time-text">{formatKoreanTime()}</p>
      </div>

      <style>{`
        .calendar-section {
          padding: 80px 20px;
          background: var(--wedding-bg);
          text-align: center;
        }
        .calendar-container {
          max-width: 320px;
          margin: 0 auto;
          background: white;
          padding: 30px 20px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(212, 165, 198, 0.1);
          border: 1px solid var(--wedding-border);
        }
        .calendar-header {
          margin-bottom: 25px;
        }
        .month-name {
          font-size: 1.2em;
          font-weight: 700;
          color: var(--wedding-accent);
          margin: 0;
          letter-spacing: 2px;
        }
        .year-name {
          font-size: 0.9em;
          color: #8F7D8B;
          margin: 5px 0 0;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
          margin-bottom: 30px;
        }
        .weekday-label {
          font-size: 0.7em;
          font-weight: 700;
          color: #B3A2C8;
          padding: 10px 0;
        }
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9em;
          color: #3C2B38;
          position: relative;
          border-radius: 50%;
        }
        .calendar-day.sunday {
          color: #E78DA1;
        }
        .calendar-day.selected {
          background: var(--wedding-accent);
          color: white;
          font-weight: 700;
        }
        .heart-marker {
          position: absolute;
          bottom: -2px;
          font-size: 0.6em;
          color: var(--wedding-accent);
          display: none;
        }
        .calendar-day.selected .heart-marker {
          display: block;
          color: white;
          bottom: 2px;
        }
        .wedding-detail-info {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .wedding-date-text {
          font-size: 1.2em;
          font-weight: 700;
          color: #3C2B38;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .wedding-time-text {
          font-size: 1.1em;
          color: #8F7D8B;
          margin: 0;
          font-weight: 500;
        }
      `}</style>
    </section>
  );
};

export default Calendar;
