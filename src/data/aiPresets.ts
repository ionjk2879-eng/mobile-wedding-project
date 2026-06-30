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
  sampleHeroFromGallery?: number;
  accentOnText?: boolean;
  settings: Partial<InvitationData>;
}

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
    accentOnText: false,
    settings: {
      theme: 'sage',
      fontFamily: "'Gowun Batang', serif",
      fontSize: 'medium',
      customBgColor: '#F2F6EE',
      customAccentColor: '#5F8E5A',
      bgTexture: 'watercolor',
      bgEffect: 'leaves',
      scrollEffect: 'fade-up',
      heroStyle: 'minimal',
      galleryStyle: 'style3',
      accountStyle: 'style2',
      bgMusicUrl: '/music/the_mountain-life-story-149913.mp3',
      sectionOrder: ['greeting', 'calendar', 'photos', 'message', 'interview', 'timeline', 'location', 'accounts', 'contacts', 'share'],
      greetingTitle: '함께 걷겠습니다',
      greetingContent: '자연처럼 변함없이\n서로의 곁에서 함께 걷겠습니다.\n\n싱그러운 바람처럼 늘 상쾌하고\n깊은 숲처럼 든든한 사람이 되어\n소중한 분들과 함께 새 출발을 합니다.',
      groomMessage: '자연처럼 변함없이 곁에 있겠습니다.',
      brideMessage: '함께라면 어디든 편안한 쉼터가 돼요.',
      timeline: [
        { id: '1', date: '2020.03', showDate: true, year: '', title: '첫 만남', description: '공통 친구의 소개로 처음 만났습니다.', photo: '' },
        { id: '2', date: '2021.08', showDate: true, year: '', title: '첫 여행', description: '제주도의 초록빛 풍경 속에서 함께한 첫 여행', photo: '' },
        { id: '3', date: '2023.04', showDate: true, year: '', title: '봄날의 프로포즈', description: '꽃이 피던 날, 잊지 못할 그 순간', photo: '' },
      ],
      interview: [
        { id: '1', question: '상대방의 어떤 모습에서 자연스러움을 느끼나요?', groomAnswer: '아무것도 꾸미지 않은 일상 속 모습이 가장 아름다워요.', brideAnswer: '작은 것에도 감사할 줄 아는 따뜻한 마음이 느껴져요.' },
        { id: '2', question: '함께 가장 좋았던 기억은?', groomAnswer: '단둘이 걸었던 가을 산책길이 지금도 선명해요.', brideAnswer: '비 오는 날 창가에서 함께 차 마시던 그 오후요.' },
        { id: '3', question: '결혼 후 함께 꿈꾸는 일상은?', groomAnswer: '소박하고 따뜻한 하루하루를 함께 보내고 싶어요.', brideAnswer: '계절마다 함께 여행하며 서로의 취향을 맞춰가는 시간이요.' },
      ],
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
    id: 'clear-insta',
    name: '청량한 인스타 무드',
    category: '인스타',
    description: '맑고 시원한 블루 톤과 인스타그램 감성이 어우러진 청량하고 감각적인 스타일',
    emoji: '🩵',
    previewColors: ['#F4F8FA', '#4E8FA8', '#1E3A4A'],
    tags: ['인스타카드 히어로', '블루 그라데이션 오프닝', '슬라이드 갤러리', 'Pretendard'],
    sampleSlug: 'junho-seoyeon',
    sampleHeroFromGallery: 2,
    accentOnText: true,
    settings: {
      theme: 'mist',
      fontFamily: "'Pretendard', sans-serif",
      fontSize: 'medium',
      customBgColor: '#F4F8FA',
      customAccentColor: '#4E8FA8',
      bgTexture: 'none',
      bgEffect: 'none',
      scrollEffect: 'slide-in',
      heroStyle: 'instacard',
      galleryStyle: 'slide',
      accountStyle: 'style3',
      bgMusicUrl: '/music/the_mountain-smile-life-133108.mp3',
      sectionOrder: ['photos', 'greeting', 'calendar', 'message', 'interview', 'timeline', 'location', 'accounts', 'contacts', 'share'],
      greetingTitle: '맑은 하늘처럼 함께합니다',
      greetingContent: '처음 만났던 그날처럼\n늘 설레고 새로운 마음으로\n\n서로의 곁에서 맑고 투명하게\n함께 걸어가겠습니다.',
      groomMessage: '당신 옆에 있으면 여름 바다처럼 시원하고 편안해요.',
      brideMessage: '맑은 날의 하늘처럼, 항상 당신 곁에 있을게요.',
      timeline: [
        { id: '1', date: '2020.07', showDate: true, year: '', title: '첫 만남', description: '맑은 여름날, 처음으로 마주한 그 순간', photo: '' },
        { id: '2', date: '2022.05', showDate: true, year: '', title: '첫 여행', description: '바다가 보이는 카페에서 함께한 봄날', photo: '' },
        { id: '3', date: '2024.08', showDate: true, year: '', title: '프로포즈', description: '파란 하늘 아래, 영원을 약속한 날', photo: '' },
      ],
      interview: [
        { id: '1', question: '상대방의 어떤 점이 가장 좋아요?', groomAnswer: '함께 있으면 마음이 맑아지는 느낌이에요.', brideAnswer: '어떤 상황에서도 차분하고 시원하게 대해줘서요.' },
        { id: '2', question: '함께 가장 좋아하는 계절은?', groomAnswer: '파란 하늘이 예쁜 초여름이요.', brideAnswer: '서늘한 바람이 부는 초가을이요.' },
        { id: '3', question: '결혼 후 꼭 가고 싶은 곳은?', groomAnswer: '맑은 바다가 있는 남유럽 여행이요.', brideAnswer: '북유럽의 맑고 청명한 자연 속을 걷고 싶어요.' },
      ],
      opening: {
        openingEnabled: true,
        openingStyle: 'insta',
        openingColorMode: 'gradient',
        openingGradientMode: 'custom',
        openingBgColor: '#2A607A',
        openingBgColor2: '#5AAABF',
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