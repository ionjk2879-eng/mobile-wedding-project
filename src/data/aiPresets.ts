import { InvitationData } from '../types';
import { initialData } from '../stores/useInvitationStore';

export interface AIPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  previewColors: string[];
  tags?: string[];
  sampleSlug?: string;
  sampleHeroFromGallery?: number; // 이 인덱스의 갤러리 사진을 미리보기 hero로 사용
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
  {
    id: 'natural-serene',
    name: '싱그러운 내추럴',
    category: '내추럴',
    description: '세이지 그린과 워터컬러의 싱그럽고 따뜻한 자연 감성',
    emoji: '🌿',
    previewColors: ['#F2F6EE', '#5F8E5A', '#1A2E18'],
    tags: ['나뭇잎 이펙트', '워터컬러 텍스처', '베일 오프닝', 'Gowun Batang'],
    sampleSlug: 'junho-seoyeon',
    settings: {
      ...base,
      theme: 'sage',
      fontFamily: "'Gowun Batang', serif",
      fontSize: 'medium',
      customBgColor: '#F2F6EE',
      customAccentColor: '#5F8E5A',
      bgTexture: 'watercolor',
      bgEffect: 'leaves',
      scrollEffect: 'fade-up',
      heroStyle: 'minimal',
      galleryStyle: 'slide',
      accountStyle: 'style1',
      greetingTitle: '함께 걷겠습니다',
      greetingContent: '자연처럼 변함없이\n서로의 곁에서 함께 걷겠습니다.\n\n싱그러운 바람처럼 늘 상쾌하고\n깊은 숲처럼 든든한 사람이 되어\n소중한 분들과 함께 새 출발을 합니다.',
      groomMessage: '자연처럼 변함없이 곁에 있겠습니다.',
      brideMessage: '함께라면 어디든 편안한 쉼터가 돼요.',
      bgMusicUrl: '/music/the_mountain-life-story-149913.mp3',
      opening: {
        openingEnabled: true,
        openingStyle: 'veil',
        openingColorMode: 'custom',
        openingBgColor: '#1A2E18',
        openingBgOpacity: 0.96,
        openingText: '함께 걷겠습니다',
        openingSubText: '',
        openingFontStyle: 'elegant',
        openingDecoEffect: 'dots',
      },
    },
  },
  {
    id: 'insta-peach',
    name: '화사한 인스타 무드',
    category: '모던',
    description: '따뜻한 코랄 그라데이션 오프닝과 인스타그램 스타일의 화사하고 세련된 연출',
    emoji: '📸',
    previewColors: ['#FFF9F7', '#E07A5F', '#7A2E18'],
    tags: ['인스타 스타일 히어로', '코랄 그라데이션 오프닝', '스파클 효과'],
    sampleSlug: 'junho-seoyeon',
    sampleHeroFromGallery: 1,
    settings: {
      ...base,
      theme: 'rosegold',
      fontFamily: "'Pretendard', sans-serif",
      fontSize: 'medium',
      customBgColor: '#FFF9F7',
      customAccentColor: '#E07A5F',
      bgTexture: 'none',
      bgEffect: 'none',
      scrollEffect: 'fade-in',
      heroStyle: 'instacard',
      galleryStyle: 'slide',
      accountStyle: 'style1',
      greetingTitle: '함께 써내려가는 이야기',
      greetingContent: '서로를 처음 만난 그 순간부터\n지금 이 순간까지,\n\n우리의 모든 날이 사진처럼\n선명하고 빛나는 기억으로 남아있습니다.\n\n앞으로 함께 만들어갈 새로운 이야기에\n여러분을 초대합니다.',
      groomMessage: '당신과 함께라면 매일이 특별해요.',
      brideMessage: '우리의 이야기, 이제 함께 써요.',
      bgMusicUrl: '/music/paulyudin-romantic-romantic-music-493488.mp3',
      opening: {
        openingEnabled: true,
        openingStyle: 'insta',
        openingColorMode: 'gradient',
        openingGradientMode: 'custom',
        openingBgColor: '#C05A40',
        openingBgColor2: '#F0A080',
        openingBgOpacity: 1,
        openingText: '우리 결혼합니다',
        openingSubText: '',
        openingFontStyle: 'clean',
        openingTextColor: 'white',
        openingDecoEffect: 'sparkle',
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
