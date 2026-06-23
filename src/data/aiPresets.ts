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

export const AI_PRESETS: AIPreset[] = [
  {
    id: 'romantic-blush',
    name: '로맨틱 블러시',
    description: '부드러운 핑크톤과 벚꽃이 흩날리는 로맨틱한 분위기',
    emoji: '🌸',
    previewColors: ['#FFF5F6', '#D4918E', '#F3CDCC'],
    settings: {
      theme: 'blush',
      fontFamily: "'Gowun Batang', serif",
      fontSize: 'medium',
      bgTexture: 'watercolor',
      bgEffect: 'cherry-blossom',
      scrollEffect: 'fade-up',
      heroStyle: 'overlay',
      opening: {
        openingEnabled: true,
        openingStyle: 'curtain',
        openingColorMode: 'theme',
        openingBgColor: '#1F2937',
        openingBgOpacity: 0.95,
        openingText: '',
        openingSubText: '',
      },
    },
  },
  {
    id: 'modern-chic',
    name: '모던 시크',
    description: '미니멀한 흑백 톤과 세련된 타이포그래피',
    emoji: '🖤',
    previewColors: ['#F5F6F8', '#888888', '#1A1A1A'],
    settings: {
      theme: 'modern',
      fontFamily: "'Playfair Display', serif",
      fontSize: 'medium',
      customBgColor: '#F5F6F8',
      bgTexture: 'none',
      bgEffect: 'none',
      scrollEffect: 'fade-in',
      heroStyle: 'editorial',
      opening: {
        openingEnabled: true,
        openingStyle: 'circle',
        openingColorMode: 'custom',
        openingBgColor: '#1A1A1A',
        openingBgOpacity: 0.95,
        openingText: '',
        openingSubText: '',
      },
    },
  },
  {
    id: 'classic-gold',
    name: '클래식 골드',
    description: '격식 있는 샴페인 골드와 클래식한 명조 서체',
    emoji: '✨',
    previewColors: ['#FBF8F0', '#C8A97E', '#3B3228'],
    settings: {
      theme: 'champagne',
      fontFamily: "'Nanum Myeongjo', serif",
      fontSize: 'medium',
      customBgColor: '#FBF8F0',
      customAccentColor: '#C8A97E',
      bgTexture: 'linen',
      bgEffect: 'firefly',
      scrollEffect: 'fade-up',
      heroStyle: 'classic',
      opening: {
        openingEnabled: true,
        openingStyle: 'curtain',
        openingColorMode: 'theme',
        openingBgColor: '#1F2937',
        openingBgOpacity: 0.95,
        openingText: '',
        openingSubText: '',
      },
    },
  },
  {
    id: 'natural-garden',
    name: '내추럴 가든',
    description: '싱그러운 초록빛과 나뭇잎이 흩날리는 자연 느낌',
    emoji: '🌿',
    previewColors: ['#F2FAF7', '#8BA888', '#2B3328'],
    settings: {
      theme: 'sage',
      fontFamily: "'Gowun Dodum', sans-serif",
      fontSize: 'medium',
      customBgColor: '#F2FAF7',
      customAccentColor: '#8BA888',
      bgTexture: 'paper',
      bgEffect: 'leaves',
      scrollEffect: 'slide-in',
      heroStyle: 'minimal',
      opening: {
        openingEnabled: false,
        openingStyle: 'curtain',
        openingColorMode: 'theme',
        openingBgColor: '#1F2937',
        openingBgOpacity: 0.95,
        openingText: '',
        openingSubText: '',
      },
    },
  },
  {
    id: 'elegant-lavender',
    name: '엘레강스 라벤더',
    description: '우아한 보라빛과 별빛이 반짝이는 몽환적 무드',
    emoji: '💜',
    previewColors: ['#F7F5FA', '#9B8BB8', '#2C2038'],
    settings: {
      theme: 'lavender',
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 'large',
      customBgColor: '#F7F5FA',
      customAccentColor: '#9B8BB8',
      bgTexture: 'silk',
      bgEffect: 'stars',
      scrollEffect: 'fade-up',
      heroStyle: 'fullscreen',
      opening: {
        openingEnabled: true,
        openingStyle: 'circle',
        openingColorMode: 'theme',
        openingBgColor: '#1F2937',
        openingBgOpacity: 0.95,
        openingText: '',
        openingSubText: '',
      },
    },
  },
  {
    id: 'playful-party',
    name: '플레이풀 파티',
    description: '화사한 코랄톤과 꽃가루가 날리는 축제 분위기',
    emoji: '🎉',
    previewColors: ['#FFF5F6', '#E08B7A', '#8B3A4A'],
    settings: {
      theme: 'dusty',
      fontFamily: "'Pretendard', sans-serif",
      fontSize: 'medium',
      customBgColor: '#FFF5F6',
      customAccentColor: '#E08B7A',
      bgTexture: 'pattern',
      bgEffect: 'confetti',
      scrollEffect: 'slide-in',
      heroStyle: 'split',
      opening: {
        openingEnabled: true,
        openingStyle: 'curtain',
        openingColorMode: 'custom',
        openingBgColor: '#5C4648',
        openingBgOpacity: 0.9,
        openingText: '',
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
