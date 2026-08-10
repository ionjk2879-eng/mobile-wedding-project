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
  previewPhotoIndex?: number;
  /** Legacy admin sample rows; new previews use the shared source directly. */
  sampleSlug?: string;
  accentOnText?: boolean;
  settings: Partial<InvitationData>;
}

const commonOrder = ['greeting', 'message', 'contacts', 'photos', 'calendar', 'interview', 'timeline', 'location', 'rsvp', 'guestbook', 'accounts', 'ending', 'share'];

export const AI_PRESETS: AIPreset[] = [
  {
    id: 'sage-garden', name: '세이지 가든', category: '내추럴', emoji: '🌿',
    description: '세이지 그린과 린넨 질감, 잎사귀 효과가 어우러진 편안한 정원 무드',
    previewColors: ['#FBF5DD', '#306D29', '#0D530E'],
    tags: ['에디토리얼', '베일 오프닝', '린넨', '나뭇잎'],
    settings: {
      theme: 'sagenature', fontFamily: "'Gowun Batang', serif", fontSize: 'medium',
      bgTexture: 'linen', bgEffect: 'leaves', scrollEffect: 'fade-up', heroStyle: 'editorial',
      heroPhotoShape: 'arch', galleryStyle: 'style3', calendarStyle: 'plain', locationStyle: 'plain',
      messageStyle: 'plain', accountStyle: 'style2', contactDisplayMode: 'flat', sectionOrder: commonOrder,
      opening: { openingEnabled: true, openingStyle: 'veil', openingContentStyle: 'sequential', openingColorMode: 'gradient', openingGradientMode: 'custom', openingBgColor: '#173E24', openingBgColor2: '#6E9670', openingBgOpacity: 1, openingText: '함께 걷겠습니다', openingSubText: '', openingFontStyle: 'elegant', openingTextColor: 'white', openingDecoEffect: 'firefly', openingBgPattern: ['dots', 'grain'] },
    },
  },
  {
    id: 'blue-editorial', name: '블루 에디토리얼', category: '모던', emoji: '🩵',
    description: '더스티 블루와 매거진 프레임으로 완성한 맑고 감각적인 에디토리얼',
    previewColors: ['#D0E7E6', '#4274D9', '#293681'], previewPhotoIndex: 2, accentOnText: true,
    tags: ['매거진 프레임', '인스타 오프닝', '슬라이드', '블루'],
    settings: {
      theme: 'dustyblue', fontFamily: "'Pretendard', sans-serif", fontSize: 'small',
      bgTexture: 'none', bgEffect: 'none', scrollEffect: 'slide-in', heroStyle: 'magframe',
      heroPhotoShape: 'basic', galleryStyle: 'slideshow', calendarStyle: 'card', locationStyle: 'card',
      messageStyle: 'card', accountStyle: 'style3', contactDisplayMode: 'popup', sectionOrder: ['photos', ...commonOrder.filter(id => id !== 'photos')],
      opening: { openingEnabled: true, openingStyle: 'insta', openingContentStyle: 'typing', openingColorMode: 'gradient', openingGradientMode: 'custom', openingBgColor: '#183A78', openingBgColor2: '#64B8D1', openingBgOpacity: 1, openingText: 'We are getting married', openingSubText: '', openingFontStyle: 'simple', openingTextColor: 'white', openingDecoEffect: 'aurora-bokeh', openingBgPattern: ['grid', 'grain'] },
    },
  },
  {
    id: 'champagne-classic', name: '샴페인 클래식', category: '클래식', emoji: '🥂',
    description: '아이보리와 샴페인 골드, 투명 액자가 만드는 정제된 클래식 무드',
    previewColors: ['#FDF8F0', '#C9A227', '#6B4E1E'], previewPhotoIndex: -1,
    tags: ['글라스 프레임', '커튼 오프닝', '실크', '샴페인 골드'],
    settings: {
      theme: 'ivorychampagne', fontFamily: "'Cormorant Garamond', 'Nanum Myeongjo', serif", fontSize: 'medium',
      bgTexture: 'silk', bgEffect: 'stars', bgEffectHeroOnly: true, scrollEffect: 'fade-in', heroStyle: 'glassframe',
      heroPhotoShape: 'frame', galleryStyle: 'slide', calendarStyle: 'card', locationStyle: 'card',
      messageStyle: 'card', accountStyle: 'style1', contactDisplayMode: 'accordion', sectionOrder: commonOrder,
      opening: { openingEnabled: true, openingStyle: 'curtain', openingContentStyle: 'lines', openingColorMode: 'gradient', openingGradientMode: 'custom', openingBgColor: '#18120A', openingBgColor2: '#B89542', openingBgOpacity: 1, openingText: "We're getting married", openingSubText: '', openingFontStyle: 'elegant', openingTextColor: 'white', openingDecoEffect: 'aurora-bokeh', openingBgPattern: ['frame', 'grain'] },
    },
  },
  {
    id: 'blush-romance', name: '블러쉬 로맨스', category: '로맨틱', emoji: '🌸',
    description: '파스텔 블러쉬와 수채화, 꽃잎이 흐르는 부드럽고 로맨틱한 스타일',
    previewColors: ['#F6F4E8', '#DC9B9B', '#3E5A4C'], previewPhotoIndex: 0,
    tags: ['센터 카드', '원형 오프닝', '수채화', '꽃잎'],
    settings: {
      theme: 'pastelblush', fontFamily: "'Gowun Batang', serif", fontSize: 'medium',
      bgTexture: 'watercolor', bgEffect: 'petals', scrollEffect: 'fade-up', heroStyle: 'centercard',
      heroPhotoShape: 'oval', galleryStyle: 'auto', calendarStyle: 'plain', locationStyle: 'plain',
      messageStyle: 'plain', accountStyle: 'style2', contactDisplayMode: 'inline', sectionOrder: commonOrder,
      opening: { openingEnabled: true, openingStyle: 'circle', openingContentStyle: 'sequential', openingColorMode: 'gradient', openingGradientMode: 'custom', openingBgColor: '#6F3E52', openingBgColor2: '#D99AA7', openingBgOpacity: 1, openingText: '사랑으로 하나 되는 날', openingSubText: '', openingFontStyle: 'elegant', openingTextColor: 'white', openingDecoEffect: 'firefly-petal', openingBgPattern: ['wave', 'grain'] },
    },
  },
  {
    id: 'charcoal-minimal', name: '차콜 미니멀', category: '미니멀', emoji: '🩶',
    description: '웜 차콜과 절제된 타이포그래피가 돋보이는 도시적인 미니멀 디자인',
    previewColors: ['#F5F1EA', '#B97A56', '#33302C'], previewPhotoIndex: 1, accentOnText: true,
    tags: ['데이트 스플릿', '블라인드 오프닝', '미니멀', '차콜'],
    settings: {
      theme: 'warmcharcoal', fontFamily: "'SUIT', 'Pretendard', sans-serif", fontSize: 'small',
      bgTexture: 'none', bgEffect: 'none', scrollEffect: 'slide-in', heroStyle: 'datesplit',
      heroPhotoShape: 'basic', galleryStyle: 'slide', calendarStyle: 'plain', locationStyle: 'plain',
      messageStyle: 'plain', accountStyle: 'style4', contactDisplayMode: 'flat', sectionOrder: ['calendar', 'greeting', 'photos', 'message', 'interview', 'timeline', 'location', 'contacts', 'rsvp', 'guestbook', 'accounts', 'ending', 'share'],
      opening: { openingEnabled: true, openingStyle: 'blind', openingContentStyle: 'flip', openingColorMode: 'gradient', openingGradientMode: 'custom', openingBgColor: '#252321', openingBgColor2: '#7A6658', openingBgOpacity: 1, openingText: 'TOGETHER FOREVER', openingSubText: '', openingFontStyle: 'clean', openingTextColor: 'white', openingDecoEffect: 'trace', openingBgPattern: ['grid', 'grain'] },
    },
  },
  {
    id: 'terracotta-film', name: '테라코타 필름', category: '빈티지', emoji: '🍂',
    description: '테라코타와 한지 질감, 필름 스틸 구성이 어우러진 따뜻한 빈티지 무드',
    previewColors: ['#F3E4D3', '#C1633B', '#7A3418'], previewPhotoIndex: 3,
    tags: ['필름 스틸', '프레임 오프닝', '한지', '단풍'],
    settings: {
      theme: 'terracotta', fontFamily: "'Nanum Myeongjo', serif", fontSize: 'medium',
      bgTexture: 'paper', bgEffect: 'autumn', scrollEffect: 'fade-up', heroStyle: 'filmstrip',
      heroPhotoShape: 'polaroid', galleryStyle: 'style3', calendarStyle: 'card', locationStyle: 'card',
      messageStyle: 'card', accountStyle: 'style2', contactDisplayMode: 'accordion', sectionOrder: ['greeting', 'photos', 'message', 'timeline', 'calendar', 'interview', 'location', 'contacts', 'rsvp', 'guestbook', 'accounts', 'ending', 'share'],
      opening: { openingEnabled: true, openingStyle: 'frame', openingContentStyle: 'sequential', openingColorMode: 'gradient', openingGradientMode: 'custom', openingBgColor: '#3B180E', openingBgColor2: '#B45E34', openingBgOpacity: 1, openingText: '평생 함께하겠습니다', openingSubText: '', openingFontStyle: 'elegant', openingTextColor: 'white', openingDecoEffect: 'firefly-petal', openingBgPattern: ['frame', 'grain'] },
    },
  },
];

export function applyPreset(preset: AIPreset): InvitationData {
  const { settings } = preset;
  const merged: InvitationData = {
    ...initialData,
    ...settings,
    opening: { ...initialData.opening, ...(settings.opening || {}) },
  };
  if (settings.sectionOrder) merged.templateSectionOrder = [...settings.sectionOrder];
  return merged;
}
