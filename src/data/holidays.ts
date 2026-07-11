// 양력 고정 공휴일만 판별한다(월-일 고정). 설날/추석 등 음력 기준 공휴일은 매년
// 날짜가 바뀌어 변환 로직 없이는 정확히 표시할 수 없어 제외한다.
const FIXED_HOLIDAYS: [number, number][] = [
  [1, 1],   // 신정
  [3, 1],   // 삼일절
  [5, 5],   // 어린이날
  [6, 6],   // 현충일
  [8, 15],  // 광복절
  [10, 3],  // 개천절
  [10, 9],  // 한글날
  [12, 25], // 크리스마스
];

export const isFixedHoliday = (month: number, day: number): boolean =>
  FIXED_HOLIDAYS.some(([m, d]) => m === month + 1 && d === day);
