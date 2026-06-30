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
    id: 'insta-peach',
    name: '화사한 인스타 무드',
    category: '모던',
    description: '따뜻한 코랄 그라데이션 오프닝과 인스타그램 스타일의 화사하고 세련된 연출',
    emoji: '📸',
    previewColors: ['#FFF9F7', '#E07A5F', '#7A2E18'],
    tags: ['인스타 스타일 히어로', '코랄 그라데이션 오프닝', '스파클 효과'],
    sampleSlug: 'junho-seoyeon',
    sampleHeroFromGallery: 1,
    accentOnText: true,
    settings: {
      theme: 'rosegold',
      fontFamily: "'Pretendard', sans-serif",
      fontSize: 'medium',
      customBgColor: '#FFF9F7',
      customAccentColor: '#E07A5F',
      bgTexture: 'none',
      bgEffect: 'none',
      scrollEffect: 'slide-in',
      heroStyle: 'instacard',
      galleryStyle: 'slide',
      accountStyle: 'style3',
      bgMusicUrl: '/music/paulyudin-romantic-romantic-music-493488.mp3',
      sectionOrder: ['photos', 'greeting', 'message', 'calendar', 'interview', 'timeline', 'location', 'accounts', 'contacts', 'share'],
      greetingTitle: '함께 써내려가는 이야기',
      greetingContent: '서로를 처음 만난 그 순간부터\n지금 이 순간까지,\n\n우리의 모든 날이 사진처럼\n선명하고 빛나는 기억으로 남아있습니다.\n\n앞으로 함께 만들어갈 새로운 이야기에\n여러분을 초대합니다.',
      groomMessage: '당신과 함께라면 매일이 특별해요.',
      brideMessage: '우리의 이야기, 이제 함께 써요.',
      timeline: [
        { id: '1', date: '2020.11', showDate: true, year: '', title: '처음 만난 날', description: '어색한 첫 만남, 하지만 왠지 모르게 편안했어요.', photo: '' },
        { id: '2', date: '2022.03', showDate: true, year: '', title: '첫 해외여행', description: '함께 처음으로 떠난 낯선 도시', photo: '' },
        { id: '3', date: '2024.12', showDate: true, year: '', title: '프로포즈', description: '아무도 없는 겨울 밤, 반짝이던 그 순간', photo: '' },
      ],
      interview: [
        { id: '1', question: '처음 연락했을 때 기억나나요?', groomAnswer: '어색함과 설렘이 섞인 짧은 메시지였는데, 아직도 저장해 뒀어요.', brideAnswer: '솔직한 말 한마디에 마음이 열렸어요.' },
        { id: '2', question: '함께 찍은 사진 중 가장 좋아하는 건?', groomAnswer: '아무도 없는 거리에서 즉흥적으로 찍은 셀카요.', brideAnswer: '눈 맞추며 웃는 순간이 담긴 사진이면 다 좋아요.' },
        { id: '3', question: '결혼 후 꼭 함께 가고 싶은 곳은?', groomAnswer: '교토의 골목길을 천천히 걷고 싶어요.', brideAnswer: '파리의 작은 카페에서 반나절을 보내는 게 꿈이에요.' },
      ],
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