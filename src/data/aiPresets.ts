import { InvitationData } from '../types';
import { initialData } from '../stores/useInvitationStore';

export interface AIPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  previewColors: string[];
  settings: Partial<InvitationData>;
}

const sampleTimeline = [
  { id: '1', date: '2020.03', showDate: true, year: '', title: '첫 만남', description: '공통 친구의 소개로 처음 만났습니다.', photo: '' },
  { id: '2', date: '2021.12', showDate: true, year: '', title: '첫 여행', description: '제주도에서 함께한 첫 여행', photo: '' },
  { id: '3', date: '2025.09', showDate: true, year: '', title: '프로포즈', description: '잊지 못할 프로포즈의 순간', photo: '' },
];

const sampleInterview = [
  { id: '1', question: '첫인상은 어땠나요?', groomAnswer: '밝은 미소가 인상적이었어요.', brideAnswer: '듬직하고 따뜻한 느낌이었어요.' },
  { id: '2', question: '상대방의 가장 좋은 점은?', groomAnswer: '항상 긍정적이고 배려심이 깊은 점', brideAnswer: '무엇이든 함께하려는 마음이 좋아요.' },
  { id: '3', question: '결혼 후 가장 하고 싶은 것은?', groomAnswer: '매일 함께 산책하는 소소한 일상', brideAnswer: '둘만의 아늑한 집을 꾸미고 싶어요.' },
];

const base = { timeline: sampleTimeline, interview: sampleInterview };

export const AI_PRESETS: AIPreset[] = [
  // === 2025 트렌드 ===
  {
    id: 'romantic-blush', name: '로맨틱 블러시', category: '2025 트렌드',
    description: '부드러운 핑크톤과 벚꽃이 흩날리는 로맨틱한 분위기',
    emoji: '🌸', previewColors: ['#FFE8EC', '#C76B7E', '#8B2E4A'],
    settings: { ...base, theme: 'blush', fontFamily: "'Gowun Batang', serif", fontSize: 'medium', customBgColor: '#FFE8EC', customAccentColor: '#C76B7E', bgTexture: 'watercolor', bgEffect: 'cherry-blossom', scrollEffect: 'fade-up', heroStyle: 'overlay', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#4A1E2E', openingBgOpacity: 0.95, openingText: "We're getting married", openingSubText: '' } },
  },
  {
    id: 'modern-chic', name: '모던 시크', category: '2025 트렌드',
    description: '미니멀한 흑백 톤과 세련된 타이포그래피',
    emoji: '🖤', previewColors: ['#EAEAEA', '#555555', '#111111'],
    settings: { ...base, theme: 'modern', fontFamily: "'Playfair Display', serif", fontSize: 'medium', customBgColor: '#EAEAEA', customAccentColor: '#555555', bgTexture: 'none', bgEffect: 'none', scrollEffect: 'fade-in', heroStyle: 'editorial', opening: { openingEnabled: true, openingStyle: 'circle', openingColorMode: 'custom', openingBgColor: '#111111', openingBgOpacity: 0.97, openingText: "We're getting married", openingSubText: '' } },
  },
  {
    id: 'classic-gold', name: '클래식 골드', category: '2025 트렌드',
    description: '격식 있는 샴페인 골드와 클래식한 명조 서체',
    emoji: '✨', previewColors: ['#F5EFE0', '#B08D57', '#3D2E1A'],
    settings: { ...base, theme: 'champagne', fontFamily: "'Nanum Myeongjo', serif", fontSize: 'medium', customBgColor: '#F5EFE0', customAccentColor: '#B08D57', bgTexture: 'linen', bgEffect: 'firefly', scrollEffect: 'fade-up', heroStyle: 'classic', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#2A2010', openingBgOpacity: 0.95, openingText: '소중한 날에 초대합니다', openingSubText: '' } },
  },
  {
    id: 'natural-garden', name: '내추럴 가든', category: '2025 트렌드',
    description: '싱그러운 초록빛과 나뭇잎이 흩날리는 자연 느낌',
    emoji: '🌿', previewColors: ['#E8F5E9', '#5D8A5E', '#1B3A1C'],
    settings: { ...base, theme: 'sage', fontFamily: "'Gowun Dodum', sans-serif", fontSize: 'medium', customBgColor: '#E8F5E9', customAccentColor: '#5D8A5E', bgTexture: 'paper', bgEffect: 'leaves', scrollEffect: 'slide-in', heroStyle: 'minimal', opening: { openingEnabled: true, openingStyle: 'fade', openingColorMode: 'custom', openingBgColor: '#1B3A1C', openingBgOpacity: 0.93, openingText: 'Together forever', openingSubText: '' } },
  },
  {
    id: 'mocha-warmth', name: '모카 무스', category: '2025 트렌드',
    description: 'Pantone 2025 모카 브라운과 따뜻한 어스톤',
    emoji: '☕', previewColors: ['#F5EDE4', '#8B6F5C', '#3E2C22'],
    settings: { ...base, theme: 'mocha', fontFamily: "'Nanum Myeongjo', serif", fontSize: 'medium', customBgColor: '#F5EDE4', customAccentColor: '#8B6F5C', bgTexture: 'linen', bgEffect: 'firefly', scrollEffect: 'fade-up', heroStyle: 'frame', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#2C1E16', openingBgOpacity: 0.95, openingText: 'With Love', openingSubText: '' } },
  },
  {
    id: 'playful-party', name: '플레이풀 파티', category: '2025 트렌드',
    description: '화사한 코랄톤과 꽃가루가 날리는 축제 분위기',
    emoji: '🎉', previewColors: ['#FFF0EB', '#D4654A', '#6B2A3A'],
    settings: { ...base, theme: 'dusty', fontFamily: "'Pretendard', sans-serif", fontSize: 'medium', customBgColor: '#FFF0EB', customAccentColor: '#D4654A', bgTexture: 'pattern', bgEffect: 'confetti', scrollEffect: 'slide-in', heroStyle: 'split', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#4A1E28', openingBgOpacity: 0.9, openingText: "Let's Celebrate!", openingSubText: '' } },
  },

  // === 2026 트렌드 ===
  {
    id: 'cloud-dancer', name: '클라우드 댄서', category: '2026 트렌드',
    description: 'Pantone 2026 순백 세레니티와 파우더 블루의 청량함',
    emoji: '☁️', previewColors: ['#F8FAFB', '#A8C4D6', '#4A6A7A'],
    settings: { ...base, theme: 'cloud', fontFamily: "'Cormorant Garamond', serif", fontSize: 'medium', customBgColor: '#F8FAFB', customAccentColor: '#7BA3B8', bgTexture: 'silk', bgEffect: 'snow', scrollEffect: 'fade-in', heroStyle: 'minimal', opening: { openingEnabled: true, openingStyle: 'fade', openingColorMode: 'custom', openingBgColor: '#1A2A34', openingBgOpacity: 0.95, openingText: 'Forever & Always', openingSubText: '' } },
  },
  {
    id: 'emerald-luxe', name: '에메랄드 럭스', category: '2026 트렌드',
    description: '깊은 에메랄드 그린과 골드의 주얼톤 럭셔리',
    emoji: '💎', previewColors: ['#EDF5F0', '#2E7D5B', '#1A3D2E'],
    settings: { ...base, theme: 'emerald', fontFamily: "'Playfair Display', serif", fontSize: 'medium', customBgColor: '#EDF5F0', customAccentColor: '#2E7D5B', bgTexture: 'silk', bgEffect: 'firefly', scrollEffect: 'fade-up', heroStyle: 'editorial', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#0E2218', openingBgOpacity: 0.95, openingText: 'Our New Beginning', openingSubText: '' } },
  },

  {
    id: 'terracotta-boho', name: '테라코타 보헤미안', category: '2026 트렌드',
    description: '따뜻한 테라코타와 올리브의 보헤미안 감성',
    emoji: '🏺', previewColors: ['#FAF0E6', '#B86842', '#4A2E1E'],
    settings: { ...base, theme: 'terracotta', fontFamily: "'Gowun Batang', serif", fontSize: 'medium', customBgColor: '#FAF0E6', customAccentColor: '#B86842', bgTexture: 'paper', bgEffect: 'leaves', scrollEffect: 'fade-up', heroStyle: 'magcover', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#2E1A10', openingBgOpacity: 0.93, openingText: 'Two Hearts, One Love', openingSubText: '' } },
  },
  {
    id: 'midnight-gala', name: '미드나잇 갈라', category: '2026 트렌드',
    description: '딥 네이비와 별빛 골드의 우아한 이브닝 무드',
    emoji: '🌙', previewColors: ['#F0F0F5', '#2A2A5A', '#1A1A30'],
    settings: { ...base, theme: 'midnight', fontFamily: "'Cormorant Garamond', serif", fontSize: 'medium', customBgColor: '#F0F0F5', customAccentColor: '#2A2A5A', bgTexture: 'silk', bgEffect: 'stars', scrollEffect: 'fade-up', heroStyle: 'gradation', opening: { openingEnabled: true, openingStyle: 'circle', openingColorMode: 'custom', openingBgColor: '#0E0E20', openingBgOpacity: 0.97, openingText: 'A Night to Remember', openingSubText: '' } },
  },

  // === 2026 월별 ===
  // === 2026 3월 — 벚꽃 라일락 ===
  {
    id: 'march-lilac', name: '3월 라일락 블룸', category: '2026년 3월',
    description: '라일락과 벚꽃의 몽환적인 봄 시작',
    emoji: '💜', previewColors: ['#F3EBF8', '#9B6EBF', '#4A2868'],
    settings: { ...base, theme: 'lavender', fontFamily: "'Gowun Batang', serif", fontSize: 'medium', customBgColor: '#F3EBF8', customAccentColor: '#9B6EBF', bgTexture: 'watercolor', bgEffect: 'cherry-blossom', scrollEffect: 'fade-up', heroStyle: 'gradation', greetingContent: '봄꽃이 피어나듯\n서로를 향한 마음이 활짝 피었습니다.\n\n따스한 봄바람처럼 다정한 사람과\n함께 걸어갈 새로운 길 위에\n소중한 분들을 초대합니다.', opening: { openingEnabled: true, openingStyle: 'fade', openingColorMode: 'custom', openingBgColor: '#2A1040', openingBgOpacity: 0.95, openingText: 'Spring is Here', openingSubText: '' } },
  },

  // === 2026 4월 — 코랄 피치 ===
  {
    id: 'april-coral', name: '4월 코랄 브리즈', category: '2026년 4월',
    description: '따뜻한 코랄과 피치의 화사한 봄 무드',
    emoji: '🌷', previewColors: ['#FFF0EA', '#E07A60', '#7A3228'],
    settings: { ...base, theme: 'rosegold', fontFamily: "'Gowun Dodum', sans-serif", fontSize: 'medium', customBgColor: '#FFF0EA', customAccentColor: '#E07A60', bgTexture: 'watercolor', bgEffect: 'hearts', scrollEffect: 'slide-in', heroStyle: 'centercard', greetingContent: '봄꽃이 피어나듯\n서로를 향한 마음이 활짝 피었습니다.\n\n따스한 봄바람처럼 다정한 사람과\n함께 걸어갈 새로운 길 위에\n소중한 분들을 초대합니다.', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#3A1A14', openingBgOpacity: 0.93, openingText: 'Love in Bloom', openingSubText: '' } },
  },

  // === 2026 5월 — 버터 옐로 ===
  {
    id: 'may-butter', name: '5월 버터 선샤인', category: '2026년 5월',
    description: '햇살 가득 버터 옐로와 그린의 싱그러운 웨딩',
    emoji: '🌻', previewColors: ['#FFFCE8', '#C49A2A', '#4A4020'],
    settings: { ...base, theme: 'butter', fontFamily: "'Pretendard', sans-serif", fontSize: 'medium', customBgColor: '#FFFCE8', customAccentColor: '#C49A2A', bgTexture: 'paper', bgEffect: 'confetti', scrollEffect: 'slide-in', heroStyle: 'overlay', greetingContent: '봄꽃이 피어나듯\n서로를 향한 마음이 활짝 피었습니다.\n\n따스한 봄바람처럼 다정한 사람과\n함께 걸어갈 새로운 길 위에\n소중한 분들을 초대합니다.', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#3A3010', openingBgOpacity: 0.93, openingText: 'Here Comes the Sun', openingSubText: '' } },
  },

  // === 2026 6월 — 딥 코발트 ===
  {
    id: 'june-cobalt', name: '6월 딥 코발트', category: '2026년 6월',
    description: '깊은 코발트 블루와 실버의 시크한 여름 웨딩',
    emoji: '🌊', previewColors: ['#EEF0F8', '#2E4A8A', '#121830'],
    settings: { ...base, theme: 'cobalt', fontFamily: "'Playfair Display', serif", fontSize: 'medium', customBgColor: '#EEF0F8', customAccentColor: '#2E4A8A', bgTexture: 'none', bgEffect: 'stars', scrollEffect: 'fade-in', heroStyle: 'fullscreen', greetingContent: '여름 햇살처럼 찬란한 사랑이\n저희 두 사람을 하나로 이어주었습니다.\n\n뜨겁지만 시원한 바람처럼\n서로에게 쉼이 되어주는 사이,\n함께하는 인생의 여름을 시작합니다.', opening: { openingEnabled: true, openingStyle: 'circle', openingColorMode: 'custom', openingBgColor: '#0A0E20', openingBgOpacity: 0.97, openingText: 'Under the Stars', openingSubText: '' } },
  },

];

export function applyPreset(preset: AIPreset): InvitationData {
  const { settings } = preset;
  return {
    ...initialData,
    ...settings,
    opening: {
      ...initialData.opening,
      ...(settings.opening || {}),
    },
  };
}
