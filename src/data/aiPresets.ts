import { InvitationData } from '../types';
import { initialData } from '../stores/useInvitationStore';

export interface AIPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
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

export const AI_PRESETS: AIPreset[] = [
  {
    id: 'romantic-blush',
    name: '로맨틱 블러시',
    description: '부드러운 핑크톤과 벚꽃이 흩날리는 로맨틱한 분위기',
    emoji: '🌸',
    previewColors: ['#FFE8EC', '#C76B7E', '#8B2E4A'],
    settings: {
      theme: 'blush',
      fontFamily: "'Gowun Batang', serif",
      fontSize: 'medium',
      customBgColor: '#FFE8EC',
      customAccentColor: '#C76B7E',
      bgTexture: 'watercolor',
      bgEffect: 'cherry-blossom',
      scrollEffect: 'fade-up',
      heroStyle: 'overlay',
      timeline: sampleTimeline,
      interview: sampleInterview,
      opening: {
        openingEnabled: true,
        openingStyle: 'curtain',
        openingColorMode: 'custom',
        openingBgColor: '#4A1E2E',
        openingBgOpacity: 0.95,
        openingText: 'We\'re getting married',
        openingSubText: '',
      },
    },
  },
  {
    id: 'modern-chic',
    name: '모던 시크',
    description: '미니멀한 흑백 톤과 세련된 타이포그래피',
    emoji: '🖤',
    previewColors: ['#EAEAEA', '#555555', '#111111'],
    settings: {
      theme: 'modern',
      fontFamily: "'Playfair Display', serif",
      fontSize: 'medium',
      customBgColor: '#EAEAEA',
      customAccentColor: '#555555',
      bgTexture: 'none',
      bgEffect: 'none',
      scrollEffect: 'fade-in',
      heroStyle: 'editorial',
      timeline: sampleTimeline,
      interview: sampleInterview,
      opening: {
        openingEnabled: true,
        openingStyle: 'circle',
        openingColorMode: 'custom',
        openingBgColor: '#111111',
        openingBgOpacity: 0.97,
        openingText: 'We\'re getting married',
        openingSubText: '',
      },
    },
  },
  {
    id: 'classic-gold',
    name: '클래식 골드',
    description: '격식 있는 샴페인 골드와 클래식한 명조 서체',
    emoji: '✨',
    previewColors: ['#F5EFE0', '#B08D57', '#3D2E1A'],
    settings: {
      theme: 'champagne',
      fontFamily: "'Nanum Myeongjo', serif",
      fontSize: 'medium',
      customBgColor: '#F5EFE0',
      customAccentColor: '#B08D57',
      bgTexture: 'linen',
      bgEffect: 'firefly',
      scrollEffect: 'fade-up',
      heroStyle: 'classic',
      timeline: sampleTimeline,
      interview: sampleInterview,
      opening: {
        openingEnabled: true,
        openingStyle: 'curtain',
        openingColorMode: 'custom',
        openingBgColor: '#2A2010',
        openingBgOpacity: 0.95,
        openingText: '소중한 날에 초대합니다',
        openingSubText: '',
      },
    },
  },
  {
    id: 'natural-garden',
    name: '내추럴 가든',
    description: '싱그러운 초록빛과 나뭇잎이 흩날리는 자연 느낌',
    emoji: '🌿',
    previewColors: ['#E8F5E9', '#5D8A5E', '#1B3A1C'],
    settings: {
      theme: 'sage',
      fontFamily: "'Gowun Dodum', sans-serif",
      fontSize: 'medium',
      customBgColor: '#E8F5E9',
      customAccentColor: '#5D8A5E',
      bgTexture: 'paper',
      bgEffect: 'leaves',
      scrollEffect: 'slide-in',
      heroStyle: 'minimal',
      timeline: sampleTimeline,
      interview: sampleInterview,
      opening: {
        openingEnabled: true,
        openingStyle: 'curtain',
        openingColorMode: 'custom',
        openingBgColor: '#1B3A1C',
        openingBgOpacity: 0.93,
        openingText: 'Together forever',
        openingSubText: '',
      },
    },
  },
  {
    id: 'elegant-lavender',
    name: '엘레강스 라벤더',
    description: '우아한 보라빛과 별빛이 반짝이는 몽환적 무드',
    emoji: '💜',
    previewColors: ['#EDE6F5', '#7B5EA7', '#2E1B4E'],
    settings: {
      theme: 'lavender',
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 'large',
      customBgColor: '#EDE6F5',
      customAccentColor: '#7B5EA7',
      bgTexture: 'silk',
      bgEffect: 'stars',
      scrollEffect: 'fade-up',
      heroStyle: 'fullscreen',
      timeline: sampleTimeline,
      interview: sampleInterview,
      opening: {
        openingEnabled: true,
        openingStyle: 'circle',
        openingColorMode: 'custom',
        openingBgColor: '#1E0E3A',
        openingBgOpacity: 0.95,
        openingText: 'Our Wedding Day',
        openingSubText: '',
      },
    },
  },
  {
    id: 'playful-party',
    name: '플레이풀 파티',
    description: '화사한 코랄톤과 꽃가루가 날리는 축제 분위기',
    emoji: '🎉',
    previewColors: ['#FFF0EB', '#D4654A', '#6B2A3A'],
    settings: {
      theme: 'dusty',
      fontFamily: "'Pretendard', sans-serif",
      fontSize: 'medium',
      customBgColor: '#FFF0EB',
      customAccentColor: '#D4654A',
      bgTexture: 'pattern',
      bgEffect: 'confetti',
      scrollEffect: 'slide-in',
      heroStyle: 'split',
      timeline: sampleTimeline,
      interview: sampleInterview,
      opening: {
        openingEnabled: true,
        openingStyle: 'curtain',
        openingColorMode: 'custom',
        openingBgColor: '#4A1E28',
        openingBgOpacity: 0.9,
        openingText: 'Let\'s Celebrate!',
        openingSubText: '',
      },
    },
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
