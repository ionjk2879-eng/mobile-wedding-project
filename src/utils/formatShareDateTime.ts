// "2026. 10. 24. 토요일" 형태로 포맷 (요일만, 시간 없이 — 오프닝 서브텍스트용)
export function formatShareDate(weddingDateISO: string): string {
  const d = new Date(weddingDateISO);
  if (isNaN(d.getTime())) return '';
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. ${dayNames[d.getDay()]}요일`;
}

// "2026年10月24日(土)" 형태로 포맷 (일본어 오프닝 서브텍스트용)
export function formatShareDateJa(weddingDateISO: string): string {
  const d = new Date(weddingDateISO);
  if (isNaN(d.getTime())) return '';
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${dayNames[d.getDay()]})`;
}

// "2026. 10. 24. 토요일 오후 12시 30분" 형태로 포맷 (공유 카드용)
export function formatShareDateTime(weddingDateISO: string, time: string): string {
  const dateText = formatShareDate(weddingDateISO);
  if (!dateText) return '';
  const parts = time?.match(/(AM|PM)\s(\d+):(\d+)/);
  if (!parts) return dateText;
  const ampm = parts[1] === 'AM' ? '오전' : '오후';
  const minuteText = parts[3] === '00' ? '' : ` ${parts[3]}분`;
  return `${dateText} ${ampm} ${parts[2]}시${minuteText}`;
}

// "2026年10月24日(土) 午後12時30分" 형태로 포맷 (일본어 공유 카드용)
export function formatShareDateTimeJa(weddingDateISO: string, time: string): string {
  const dateText = formatShareDateJa(weddingDateISO);
  if (!dateText) return '';
  const parts = time?.match(/(AM|PM)\s(\d+):(\d+)/);
  if (!parts) return dateText;
  const ampm = parts[1] === 'AM' ? '午前' : '午後';
  const minuteText = parts[3] === '00' ? '' : `${parts[3]}分`;
  return `${dateText} ${ampm}${parts[2]}時${minuteText}`;
}
