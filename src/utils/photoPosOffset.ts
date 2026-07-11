// 사진 위치/확대 슬라이더의 표시값. 초기화 기준(center)을 0으로 두고, 오른쪽(값 증가)으로
// 움직이면 +N, 왼쪽(값 감소)으로 움직이면 -N으로 보여준다.
export const formatPosOffset = (value: number, center: number): string => {
  const diff = value - center;
  if (diff === 0) return '0';
  return diff > 0 ? `+${diff}` : `${diff}`;
};
