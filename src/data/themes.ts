import { InvitationData } from '../types';

// colors 순서: [배경, 보더, 메인(버튼), 강조(텍스트/날짜)]. ThemeSection(테마 선택 스와이프)과
// DesignSection(색상 초기화 버튼 — "쓰고 있던 테마색으로" 되돌리기)이 함께 쓰는 단일 소스.
export const THEMES: { key: NonNullable<InvitationData['theme']>; name: string; colors: string[] }[] = [
  { key: 'none', name: '테마 없음', colors: ['#FFFFFF', '#E5E7EB', '#000000', '#000000'] },
  { key: 'ivorynavy', name: '아이보리 네이비', colors: ['#EFEDE7', '#D3C6BB', '#163A5F', '#000000'] },
  { key: 'mochaneutral', name: '모카 뉴트럴', colors: ['#F7F1DE', '#B0BA99', '#9D6638', '#4E220F'] },
  { key: 'dustyblue', name: '더스티 블루', colors: ['#D0E7E6', '#95CCDD', '#4274D9', '#293681'] },
  { key: 'pastelblush', name: '파스텔 블러쉬', colors: ['#F6F4E8', '#C0E1D2', '#DC9B9B', '#3E5A4C'] },
  { key: 'sagenature', name: '세이지 네이처', colors: ['#FBF5DD', '#E7E1B1', '#306D29', '#0D530E'] },
  { key: 'warmcharcoal', name: '웜 차콜 아이보리', colors: ['#F5F1EA', '#DDD6CC', '#B97A56', '#33302C'] },
  { key: 'sunsetgold', name: '선셋 골드', colors: ['#FFF5E5', '#E0C375', '#F69D39', '#D92243'] },
  { key: 'deepteal', name: '딥 틸 럭셔리', colors: ['#FBF8F2', '#D4B94E', '#098389', '#0D2B29'] },
  { key: 'deepplum', name: '딥 플럼 주얼', colors: ['#F4E9E6', '#DD9933', '#5A175D', '#2E0E30'] },
  { key: 'terracotta', name: '테라코타 러스트', colors: ['#F3E4D3', '#E8B08C', '#C1633B', '#7A3418'] },
  { key: 'ivorychampagne', name: '아이보리 샴페인 골드', colors: ['#FDF8F0', '#EDE0C8', '#C9A227', '#6B4E1E'] },
];

export const THEME_LABEL_DEFAULTS: Record<string, string> = {
  none: '#000000',
  ivorynavy: '#415E7A',
  mochaneutral: '#AF8259',
  dustyblue: '#5E8BDC',
  pastelblush: '#E1ADAA',
  sagenature: '#59884D',
  warmcharcoal: '#C59274',
  sunsetgold: '#F8AF5B',
  deepteal: '#399A9E',
  deepplum: '#794178',
  terracotta: '#CB7D59',
  ivorychampagne: '#D3B34F',
};
