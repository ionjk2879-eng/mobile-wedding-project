import React, { useRef } from 'react';
import { CalendarPlus, Chrome, Apple } from 'lucide-react';
import { InvitationData } from '../../types';

interface CalendarProps {
  data: InvitationData;
}

const Calendar: React.FC<CalendarProps> = ({ data }) => {
  const [now, setNow] = React.useState(Date.now());
  const [showSheet, setShowSheet] = React.useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const buildCalendarEvent = () => {
    const dt = new Date(data.weddingDateISO);
    let h = 12, m = 0;
    if (data.time) {
      const parts = data.time.match(/(AM|PM)\s(\d+):(\d+)/);
      if (parts) {
        h = parseInt(parts[2]);
        if (parts[1] === 'PM' && h !== 12) h += 12;
        if (parts[1] === 'AM' && h === 12) h = 0;
        m = parseInt(parts[3]);
      }
    }
    const y = dt.getFullYear(), mo = dt.getMonth(), d = dt.getDate();
    const pad = (n: number) => String(n).padStart(2, '0');
    const startStr = `${y}${pad(mo + 1)}${pad(d)}T${pad(h)}${pad(m)}00`;
    const end = new Date(y, mo, d, h + 1, m, 0);
    const endStr = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
    const title = isEn
      ? `${data.groomName} & ${data.brideName}'s Wedding`
      : isJa
      ? `${data.groomName}・${data.brideName} 結婚式`
      : `${data.groomName} ♥ ${data.brideName} 결혼식`;
    const location = [data.venueName, data.venueAddress].filter(Boolean).join(', ');
    return { startStr, endStr, title, location };
  };

  const handleGoogleCalendar = () => {
    const { startStr, endStr, title, location } = buildCalendarEvent();
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&ctz=Asia%2FSeoul${location ? `&location=${encodeURIComponent(location)}` : ''}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowSheet(false);
  };

  const handleICSDownload = () => {
    const { startStr, endStr, title, location } = buildCalendarEvent();
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sonett//Wedding//KO',
      'BEGIN:VTIMEZONE',
      'TZID:Asia/Seoul',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0900',
      'TZOFFSETTO:+0900',
      'TZNAME:KST',
      'DTSTART:19700101T000000',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `DTSTART;TZID=Asia/Seoul:${startStr}`,
      `DTEND;TZID=Asia/Seoul:${endStr}`,
      `SUMMARY:${title}`,
      ...(location ? [`LOCATION:${location}`] : []),
      'END:VEVENT',
      'END:VCALENDAR',
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'wedding.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    setShowSheet(false);
  };

  // 시트 외부 클릭 시 닫기
  React.useEffect(() => {
    if (!showSheet) return;
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setShowSheet(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSheet]);

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

      {!isPast && (
        <div className="cal-add-wrap" ref={sheetRef}>
          <button className="cal-add-btn" onClick={() => setShowSheet(v => !v)}>
            <CalendarPlus size={14} />
            {isEn ? 'Add to Calendar' : isJa ? 'カレンダーに追加' : '일정 등록'}
          </button>
          {showSheet && (
            <div className="cal-add-sheet">
              <button className="cal-add-option" onClick={handleGoogleCalendar}>
                <Chrome size={16} color="#4285F4" />
                {isEn ? 'Google Calendar' : isJa ? 'Googleカレンダー' : '구글 캘린더'}
              </button>
              <button className="cal-add-option" onClick={handleICSDownload}>
                <Apple size={16} color="#555" />
                {isEn ? 'Apple Calendar' : isJa ? 'Appleカレンダー' : '아이폰 캘린더'}
              </button>
            </div>
          )}
        </div>
      )}

    </section>
  );
};

export default Calendar;
