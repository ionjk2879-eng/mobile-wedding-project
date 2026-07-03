// "2026년 10월 24일 토요일 오후 12시 30분" 형태로 포맷 (공유 카드용)
export function formatShareDateTime(weddingDateISO: string, time: string): string {
  const d = new Date(weddingDateISO);
  if (isNaN(d.getTime())) return '';
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dateText = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${dayNames[d.getDay()]}요일`;
  const parts = time?.match(/(AM|PM)\s(\d+):(\d+)/);
  if (!parts) return dateText;
  const ampm = parts[1] === 'AM' ? '오전' : '오후';
  const minuteText = parts[3] === '00' ? '' : ` ${parts[3]}분`;
  return `${dateText} ${ampm} ${parts[2]}시${minuteText}`;
}
