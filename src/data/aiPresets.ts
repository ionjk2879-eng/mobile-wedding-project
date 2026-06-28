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

const springGreeting = '봄꽃이 피어나듯\n서로를 향한 마음이 활짝 피었습니다.\n\n따스한 봄바람처럼 다정한 사람과\n함께 걸어갈 새로운 길 위에\n소중한 분들을 초대합니다.';
const summerGreeting = '여름 햇살처럼 찬란한 사랑이\n저희 두 사람을 하나로 이어주었습니다.\n\n뜨겁지만 시원한 바람처럼\n서로에게 쉼이 되어주는 사이,\n함께하는 인생의 여름을 시작합니다.';
const autumnGreeting = '가을 하늘처럼 높고 맑은 사랑으로\n저희 두 사람이 하나 되려 합니다.\n\n단풍처럼 아름답게 물드는 계절,\n소중한 분들과 함께\n새로운 시작을 축하해주세요.';
const winterGreeting = '겨울의 포근한 온기처럼\n서로에게 따뜻한 사람을 만났습니다.\n\n하얀 눈처럼 순수한 마음으로\n평생을 함께 걸어가겠습니다.\n\n저희의 시작을 축복해주세요.';

export const AI_PRESETS: AIPreset[] = [
  // === 2025 트렌드 ===
  {
    id: 'romantic-blush', name: '로맨틱 블러시', category: '2025 트렌드',
    description: '부드러운 핑크톤과 벚꽃이 흩날리는 로맨틱한 분위기',
    emoji: '🌸', previewColors: ['#FFE8EC', '#C76B7E', '#8B2E4A'],
    settings: { ...base, theme: 'blush', fontFamily: "'Gowun Batang', serif", fontSize: 'medium', customBgColor: '#FFE8EC', customAccentColor: '#C76B7E', bgTexture: 'watercolor', bgEffect: 'cherry-blossom', scrollEffect: 'fade-up', heroStyle: 'overlay', galleryStyle: 'slide', accountStyle: 'style1', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#4A1E2E', openingBgOpacity: 0.95, openingText: "We're getting married", openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'modern-chic', name: '모던 시크', category: '2025 트렌드',
    description: '미니멀한 흑백 톤과 세련된 타이포그래피',
    emoji: '🖤', previewColors: ['#EAEAEA', '#555555', '#111111'],
    settings: { ...base, theme: 'modern', fontFamily: "'Playfair Display', serif", fontSize: 'medium', customBgColor: '#EAEAEA', customAccentColor: '#555555', bgTexture: 'none', bgEffect: 'none', scrollEffect: 'fade-in', heroStyle: 'editorial', galleryStyle: 'style3', accountStyle: 'style2', opening: { openingEnabled: true, openingStyle: 'circle', openingColorMode: 'custom', openingBgColor: '#111111', openingBgOpacity: 0.97, openingText: "We're getting married", openingSubText: '', openingFontStyle: 'simple' } },
  },
  {
    id: 'classic-gold', name: '클래식 골드', category: '2025 트렌드',
    description: '격식 있는 샴페인 골드와 클래식한 명조 서체',
    emoji: '✨', previewColors: ['#F5EFE0', '#B08D57', '#3D2E1A'],
    settings: { ...base, theme: 'champagne', fontFamily: "'Nanum Myeongjo', serif", fontSize: 'medium', customBgColor: '#F5EFE0', customAccentColor: '#B08D57', bgTexture: 'linen', bgEffect: 'firefly', scrollEffect: 'fade-up', heroStyle: 'classic', galleryStyle: 'slide', accountStyle: 'style3', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#2A2010', openingBgOpacity: 0.95, openingText: '소중한 날에 초대합니다', openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'natural-garden', name: '내추럴 가든', category: '2025 트렌드',
    description: '싱그러운 초록빛과 나뭇잎이 흩날리는 자연 느낌',
    emoji: '🌿', previewColors: ['#E8F5E9', '#5D8A5E', '#1B3A1C'],
    settings: { ...base, theme: 'sage', fontFamily: "'Gowun Dodum', sans-serif", fontSize: 'medium', customBgColor: '#E8F5E9', customAccentColor: '#5D8A5E', bgTexture: 'paper', bgEffect: 'leaves', scrollEffect: 'slide-in', heroStyle: 'minimal', galleryStyle: 'style3', accountStyle: 'style1', groomMessage: '자연처럼 변함없이 곁에 있겠습니다.', brideMessage: '함께라면 어디든 편안한 쉼터가 돼요.', opening: { openingEnabled: true, openingStyle: 'veil', openingColorMode: 'custom', openingBgColor: '#1B3A1C', openingBgOpacity: 0.93, openingText: 'Together forever', openingSubText: '', openingFontStyle: 'clean' } },
  },
  {
    id: 'mocha-warmth', name: '모카 무스', category: '2025 트렌드',
    description: 'Pantone 2025 모카 브라운과 따뜻한 어스톤',
    emoji: '☕', previewColors: ['#F5EDE4', '#8B6F5C', '#3E2C22'],
    settings: { ...base, theme: 'mocha', fontFamily: "'Nanum Myeongjo', serif", fontSize: 'medium', customBgColor: '#F5EDE4', customAccentColor: '#8B6F5C', bgTexture: 'linen', bgEffect: 'firefly', scrollEffect: 'fade-up', heroStyle: 'centercard', galleryStyle: 'slide', accountStyle: 'style2', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#2C1E16', openingBgOpacity: 0.95, openingText: 'With Love', openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'playful-party', name: '플레이풀 파티', category: '2025 트렌드',
    description: '화사한 코랄톤과 꽃가루가 날리는 축제 분위기',
    emoji: '🎉', previewColors: ['#FFF0EB', '#D4654A', '#6B2A3A'],
    settings: { ...base, theme: 'dusty', fontFamily: "'Pretendard', sans-serif", fontSize: 'medium', customBgColor: '#FFF0EB', customAccentColor: '#D4654A', bgTexture: 'pattern', bgEffect: 'confetti', scrollEffect: 'slide-in', heroStyle: 'split', galleryStyle: 'style3', accountStyle: 'style1', groomMessage: '매일이 축제 같은 날들을 함께 만들겠습니다!', brideMessage: '웃음이 끊이지 않는 행복한 가정을 꾸릴게요.', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#4A1E28', openingBgOpacity: 0.9, openingText: "Let's Celebrate!", openingSubText: '', openingFontStyle: 'simple' } },
  },

  // === 2026 트렌드 ===
  {
    id: 'cloud-dancer', name: '클라우드 댄서', category: '2026 트렌드',
    description: 'Pantone 2026 순백 세레니티와 파우더 블루의 청량함',
    emoji: '☁️', previewColors: ['#F8FAFB', '#A8C4D6', '#4A6A7A'],
    settings: { ...base, theme: 'cloud', fontFamily: "'Cormorant Garamond', serif", fontSize: 'medium', customBgColor: '#F8FAFB', customAccentColor: '#7BA3B8', bgTexture: 'silk', bgEffect: 'snow', scrollEffect: 'fade-in', heroStyle: 'minimal', galleryStyle: 'slide', accountStyle: 'style3', opening: { openingEnabled: true, openingStyle: 'veil', openingColorMode: 'custom', openingBgColor: '#1A2A34', openingBgOpacity: 0.95, openingText: 'Forever & Always', openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'emerald-luxe', name: '에메랄드 럭스', category: '2026 트렌드',
    description: '깊은 에메랄드 그린과 골드의 주얼톤 럭셔리',
    emoji: '💎', previewColors: ['#EDF5F0', '#2E7D5B', '#1A3D2E'],
    settings: { ...base, theme: 'emerald', fontFamily: "'Playfair Display', serif", fontSize: 'large', customBgColor: '#EDF5F0', customAccentColor: '#2E7D5B', bgTexture: 'silk', bgEffect: 'firefly', scrollEffect: 'fade-up', heroStyle: 'editorial', galleryStyle: 'style3', accountStyle: 'style2', groomMessage: '당신과 함께하는 모든 순간이 보석 같습니다.', brideMessage: '평생 빛나는 사랑을 함께 가꿔가요.', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#0E2218', openingBgOpacity: 0.95, openingText: 'Our New Beginning', openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'terracotta-boho', name: '테라코타 보헤미안', category: '2026 트렌드',
    description: '따뜻한 테라코타와 올리브의 보헤미안 감성',
    emoji: '🏺', previewColors: ['#FAF0E6', '#B86842', '#4A2E1E'],
    settings: { ...base, theme: 'terracotta', fontFamily: "'Gowun Batang', serif", fontSize: 'medium', customBgColor: '#FAF0E6', customAccentColor: '#B86842', bgTexture: 'paper', bgEffect: 'leaves', scrollEffect: 'fade-up', heroStyle: 'magcover', galleryStyle: 'slide', accountStyle: 'style1', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#2E1A10', openingBgOpacity: 0.93, openingText: 'Two Hearts, One Love', openingSubText: '', openingFontStyle: 'clean' } },
  },
  {
    id: 'midnight-gala', name: '미드나잇 갈라', category: '2026 트렌드',
    description: '딥 네이비와 별빛 골드의 우아한 이브닝 무드',
    emoji: '🌙', previewColors: ['#F0F0F5', '#2A2A5A', '#1A1A30'],
    settings: { ...base, theme: 'midnight', fontFamily: "'Cormorant Garamond', serif", fontSize: 'medium', customBgColor: '#F0F0F5', customAccentColor: '#2A2A5A', bgTexture: 'silk', bgEffect: 'stars', scrollEffect: 'fade-up', heroStyle: 'fullscreen', galleryStyle: 'style3', accountStyle: 'style3', groomMessage: '별빛 아래 영원을 약속합니다.', brideMessage: '밤하늘처럼 깊은 사랑을 함께해요.', opening: { openingEnabled: true, openingStyle: 'circle', openingColorMode: 'custom', openingBgColor: '#0E0E20', openingBgOpacity: 0.97, openingText: 'A Night to Remember', openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'vintage-film', name: '빈티지 필름', category: '2026 트렌드',
    description: '필름 카메라 감성의 따뜻한 빈티지 톤',
    emoji: '📷', previewColors: ['#F5F0E8', '#8A7A6A', '#3A3028'],
    settings: { ...base, theme: 'champagne', fontFamily: "'Gowun Batang', serif", fontSize: 'small', customBgColor: '#F5F0E8', customAccentColor: '#8A7A6A', bgTexture: 'paper', bgEffect: 'none', scrollEffect: 'fade-in', heroStyle: 'fullscreen', galleryStyle: 'style3', accountStyle: 'style1', groomMessage: '오래된 필름처럼, 시간이 지날수록 빛나는 사랑을 하겠습니다.', brideMessage: '우리의 모든 순간을 소중히 기록하며 살아갈게요.', sectionOrder: ['greeting', 'message', 'photos', 'calendar', 'interview', 'timeline', 'location', 'guestbook', 'rsvp', 'accounts', 'contacts', 'share'], opening: { openingEnabled: true, openingStyle: 'veil', openingColorMode: 'custom', openingBgColor: '#2A2420', openingBgOpacity: 0.95, openingText: 'Our Film', openingSubText: '', openingFontStyle: 'clean' } },
  },
  {
    id: 'soft-lavender', name: '소프트 라벤더', category: '2026 트렌드',
    description: '몽환적인 라벤더와 실크 텍스처의 드리미한 감성',
    emoji: '💜', previewColors: ['#F0EBF5', '#8A6AAE', '#3A2858'],
    settings: { ...base, theme: 'lavender', fontFamily: "'Cormorant Garamond', serif", fontSize: 'large', customBgColor: '#F0EBF5', customAccentColor: '#8A6AAE', bgTexture: 'silk', bgEffect: 'hearts', scrollEffect: 'fade-up', heroStyle: 'centercard', galleryStyle: 'slide', accountStyle: 'style2', groomMessage: '꿈같은 사랑이 현실이 된 오늘, 감사합니다.', brideMessage: '동화 속 주인공이 된 기분이에요.', opening: { openingEnabled: true, openingStyle: 'veil', openingColorMode: 'custom', openingBgColor: '#1E1030', openingBgOpacity: 0.95, openingText: 'A Dream Come True', openingSubText: '', openingFontStyle: 'elegant' } },
  },

  // === 2026 월별 ===
  {
    id: 'march-lilac', name: '3월 라일락 블룸', category: '2026년 봄',
    description: '라일락과 벚꽃의 몽환적인 봄 시작',
    emoji: '🌷', previewColors: ['#F3EBF8', '#9B6EBF', '#4A2868'],
    settings: { ...base, theme: 'lavender', fontFamily: "'Gowun Batang', serif", fontSize: 'medium', customBgColor: '#F3EBF8', customAccentColor: '#9B6EBF', bgTexture: 'watercolor', bgEffect: 'cherry-blossom', scrollEffect: 'fade-up', heroStyle: 'fullscreen', galleryStyle: 'slide', accountStyle: 'style1', greetingContent: springGreeting, opening: { openingEnabled: true, openingStyle: 'veil', openingColorMode: 'custom', openingBgColor: '#2A1040', openingBgOpacity: 0.95, openingText: 'Spring is Here', openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'april-coral', name: '4월 코랄 브리즈', category: '2026년 봄',
    description: '따뜻한 코랄과 피치의 화사한 봄 무드',
    emoji: '🌸', previewColors: ['#FFF0EA', '#E07A60', '#7A3228'],
    settings: { ...base, theme: 'rosegold', fontFamily: "'Gowun Dodum', sans-serif", fontSize: 'medium', customBgColor: '#FFF0EA', customAccentColor: '#E07A60', bgTexture: 'watercolor', bgEffect: 'hearts', scrollEffect: 'slide-in', heroStyle: 'centercard', galleryStyle: 'style3', accountStyle: 'style2', greetingContent: springGreeting, groomMessage: '봄바람처럼 설레는 마음으로 함께하겠습니다.', brideMessage: '꽃처럼 예쁜 사랑을 가꿔갈게요.', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#3A1A14', openingBgOpacity: 0.93, openingText: 'Love in Bloom', openingSubText: '', openingFontStyle: 'clean' } },
  },
  {
    id: 'may-butter', name: '5월 버터 선샤인', category: '2026년 봄',
    description: '햇살 가득 버터 옐로와 그린의 싱그러운 웨딩',
    emoji: '🌻', previewColors: ['#FFFCE8', '#C49A2A', '#4A4020'],
    settings: { ...base, theme: 'butter', fontFamily: "'Pretendard', sans-serif", fontSize: 'medium', customBgColor: '#FFFCE8', customAccentColor: '#C49A2A', bgTexture: 'paper', bgEffect: 'confetti', scrollEffect: 'slide-in', heroStyle: 'overlay', galleryStyle: 'slide', accountStyle: 'style3', greetingContent: springGreeting, opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#3A3010', openingBgOpacity: 0.93, openingText: 'Here Comes the Sun', openingSubText: '', openingFontStyle: 'simple' } },
  },
  {
    id: 'june-cobalt', name: '6월 딥 코발트', category: '2026년 여름',
    description: '깊은 코발트 블루와 실버의 시크한 여름 웨딩',
    emoji: '🌊', previewColors: ['#EEF0F8', '#2E4A8A', '#121830'],
    settings: { ...base, theme: 'cobalt', fontFamily: "'Playfair Display', serif", fontSize: 'medium', customBgColor: '#EEF0F8', customAccentColor: '#2E4A8A', bgTexture: 'none', bgEffect: 'stars', scrollEffect: 'fade-in', heroStyle: 'fullscreen', galleryStyle: 'style3', accountStyle: 'style2', greetingContent: summerGreeting, groomMessage: '깊은 바다처럼 넓은 마음으로 사랑하겠습니다.', brideMessage: '파도처럼 끊이지 않는 사랑을 약속해요.', opening: { openingEnabled: true, openingStyle: 'circle', openingColorMode: 'custom', openingBgColor: '#0A0E20', openingBgOpacity: 0.97, openingText: 'Under the Stars', openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'july-tropical', name: '7월 트로피컬 선셋', category: '2026년 여름',
    description: '선셋 오렌지와 열대 야자의 여름 파티 무드',
    emoji: '🌴', previewColors: ['#FFF5EB', '#D4764A', '#5A2E1A'],
    settings: { ...base, theme: 'terracotta', fontFamily: "'Pretendard', sans-serif", fontSize: 'medium', customBgColor: '#FFF5EB', customAccentColor: '#D4764A', bgTexture: 'none', bgEffect: 'confetti', scrollEffect: 'slide-in', heroStyle: 'magcover', galleryStyle: 'slide', accountStyle: 'style1', greetingContent: summerGreeting, groomMessage: '매일이 여행 같은 삶을 함께 만들겠습니다.', brideMessage: '선셋처럼 아름다운 하루하루를 함께해요.', sectionOrder: ['greeting', 'photos', 'calendar', 'message', 'interview', 'timeline', 'location', 'guestbook', 'rsvp', 'accounts', 'contacts', 'share'], opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#3A1A0A', openingBgOpacity: 0.92, openingText: 'Summer Love', openingSubText: '', openingFontStyle: 'simple' } },
  },
  {
    id: 'august-ocean', name: '8월 오션 블루', category: '2026년 여름',
    description: '시원한 오션 블루와 화이트의 여름 바다 감성',
    emoji: '🐚', previewColors: ['#F0F6FA', '#3A7CA5', '#1A3A50'],
    settings: { ...base, theme: 'cloud', fontFamily: "'Gowun Dodum', sans-serif", fontSize: 'medium', customBgColor: '#F0F6FA', customAccentColor: '#3A7CA5', bgTexture: 'watercolor', bgEffect: 'snow', scrollEffect: 'fade-up', heroStyle: 'overlay', galleryStyle: 'style3', accountStyle: 'style3', greetingContent: summerGreeting, groomMessage: '바다처럼 넓은 품으로 안아줄게요.', brideMessage: '파도소리처럼 늘 곁에 있을게요.', opening: { openingEnabled: true, openingStyle: 'veil', openingColorMode: 'custom', openingBgColor: '#0A1E30', openingBgOpacity: 0.95, openingText: 'By the Sea', openingSubText: '', openingFontStyle: 'clean' } },
  },
  {
    id: 'september-maple', name: '9월 메이플 골드', category: '2026년 가을',
    description: '황금빛 단풍과 따뜻한 가을 햇살의 감성',
    emoji: '🍂', previewColors: ['#FAF3E8', '#C48A3A', '#4A3018'],
    settings: { ...base, theme: 'champagne', fontFamily: "'Nanum Myeongjo', serif", fontSize: 'medium', customBgColor: '#FAF3E8', customAccentColor: '#C48A3A', bgTexture: 'linen', bgEffect: 'leaves', scrollEffect: 'fade-up', heroStyle: 'classic', galleryStyle: 'slide', accountStyle: 'style1', greetingContent: autumnGreeting, groomMessage: '가을 하늘만큼 깊은 사랑을 드리겠습니다.', brideMessage: '단풍처럼 곱게 물드는 사랑을 약속해요.', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#2A1A08', openingBgOpacity: 0.95, openingText: 'Golden Autumn', openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'october-burgundy', name: '10월 버건디 로즈', category: '2026년 가을',
    description: '깊은 와인빛 버건디와 골드의 격식있는 가을 웨딩',
    emoji: '🍷', previewColors: ['#F5EAED', '#8A3048', '#3A1020'],
    settings: { ...base, theme: 'burgundy', fontFamily: "'Playfair Display', serif", fontSize: 'large', customBgColor: '#F5EAED', customAccentColor: '#8A3048', bgTexture: 'silk', bgEffect: 'firefly', scrollEffect: 'fade-in', heroStyle: 'editorial', galleryStyle: 'style3', accountStyle: 'style2', greetingContent: autumnGreeting, groomMessage: '와인처럼 깊어지는 사랑을 약속합니다.', brideMessage: '장미처럼 아름다운 사랑을 가꿔갈게요.', sectionOrder: ['greeting', 'calendar', 'photos', 'message', 'interview', 'timeline', 'location', 'guestbook', 'rsvp', 'accounts', 'contacts', 'share'], opening: { openingEnabled: true, openingStyle: 'circle', openingColorMode: 'custom', openingBgColor: '#200810', openingBgOpacity: 0.96, openingText: 'Eternal Love', openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'november-rust', name: '11월 러스트 어텀', category: '2026년 가을',
    description: '따뜻한 러스트 브라운과 올리브의 깊은 가을',
    emoji: '🍁', previewColors: ['#F5EDE0', '#A06030', '#3A2010'],
    settings: { ...base, theme: 'mocha', fontFamily: "'Gowun Batang', serif", fontSize: 'medium', customBgColor: '#F5EDE0', customAccentColor: '#A06030', bgTexture: 'paper', bgEffect: 'leaves', scrollEffect: 'slide-in', heroStyle: 'split', galleryStyle: 'slide', accountStyle: 'style3', greetingContent: autumnGreeting, groomMessage: '낙엽처럼 천천히, 하지만 확실하게 사랑합니다.', brideMessage: '따뜻한 차 한 잔 같은 사람이 될게요.', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#1E1008', openingBgOpacity: 0.94, openingText: 'Falling for You', openingSubText: '', openingFontStyle: 'clean' } },
  },
  {
    id: 'december-crystal', name: '12월 크리스탈 윈터', category: '2026년 겨울',
    description: '순백의 눈꽃과 실버의 우아한 겨울 웨딩',
    emoji: '❄️', previewColors: ['#F5F8FA', '#7A98B0', '#1A2A3A'],
    settings: { ...base, theme: 'cloud', fontFamily: "'Cormorant Garamond', serif", fontSize: 'medium', customBgColor: '#F5F8FA', customAccentColor: '#7A98B0', bgTexture: 'silk', bgEffect: 'snow', scrollEffect: 'fade-up', heroStyle: 'fullscreen', galleryStyle: 'style3', accountStyle: 'style1', greetingContent: winterGreeting, groomMessage: '눈처럼 순수한 마음으로 사랑하겠습니다.', brideMessage: '겨울 밤 별처럼 빛나는 사랑을 함께해요.', opening: { openingEnabled: true, openingStyle: 'veil', openingColorMode: 'custom', openingBgColor: '#0E1820', openingBgOpacity: 0.96, openingText: 'Winter Wonderland', openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'january-ivory', name: '1월 아이보리 소네트', category: '2026년 겨울',
    description: '따뜻한 아이보리와 골드의 클래식한 신년 웨딩',
    emoji: '🕊️', previewColors: ['#FAF8F0', '#A09070', '#3A3020'],
    settings: { ...base, theme: 'champagne', fontFamily: "'Nanum Myeongjo', serif", fontSize: 'large', customBgColor: '#FAF8F0', customAccentColor: '#A09070', bgTexture: 'linen', bgEffect: 'firefly', scrollEffect: 'fade-in', heroStyle: 'classic', galleryStyle: 'slide', accountStyle: 'style2', greetingContent: winterGreeting, groomMessage: '새해처럼 새로운 시작을 함께 하겠습니다.', brideMessage: '평생 당신의 봄이 되어줄게요.', sectionOrder: ['greeting', 'calendar', 'message', 'photos', 'interview', 'timeline', 'location', 'guestbook', 'rsvp', 'accounts', 'contacts', 'share'], opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#1A1810', openingBgOpacity: 0.95, openingText: 'A New Beginning', openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'february-rose', name: '2월 로즈 발렌타인', category: '2026년 겨울',
    description: '로즈골드와 하트의 달콤한 발렌타인 무드',
    emoji: '💕', previewColors: ['#FFF0F0', '#C47080', '#5A2030'],
    settings: { ...base, theme: 'rosegold', fontFamily: "'Gowun Batang', serif", fontSize: 'medium', customBgColor: '#FFF0F0', customAccentColor: '#C47080', bgTexture: 'watercolor', bgEffect: 'hearts', scrollEffect: 'fade-up', heroStyle: 'overlay', galleryStyle: 'slide', accountStyle: 'style1', greetingContent: winterGreeting, groomMessage: '매일이 발렌타인처럼 달콤한 사랑을 하겠습니다.', brideMessage: '세상에서 가장 사랑하는 사람의 아내가 됩니다.', opening: { openingEnabled: true, openingStyle: 'circle', openingColorMode: 'custom', openingBgColor: '#2A0810', openingBgOpacity: 0.95, openingText: 'Be My Valentine', openingSubText: '', openingFontStyle: 'elegant' } },
  },

  // === 특별 컨셉 ===
  {
    id: 'gallery-exhibition', name: '갤러리 전시회', category: '특별 컨셉',
    description: '미술관 전시회 같은 미니멀 화이트 컨셉',
    emoji: '🖼️', previewColors: ['#FFFFFF', '#333333', '#000000'],
    settings: { ...base, theme: 'modern', fontFamily: "'Playfair Display', serif", fontSize: 'small', customBgColor: '#FFFFFF', customAccentColor: '#333333', bgTexture: 'none', bgEffect: 'none', scrollEffect: 'fade-in', heroStyle: 'minimal', galleryStyle: 'style3', accountStyle: 'style2', groomMessage: '예술처럼 아름다운 삶을 함께 그려가겠습니다.', brideMessage: '우리만의 갤러리를 가꿔갈게요.', sectionOrder: ['photos', 'greeting', 'calendar', 'message', 'interview', 'timeline', 'location', 'guestbook', 'rsvp', 'accounts', 'contacts', 'share'], opening: { openingEnabled: true, openingStyle: 'veil', openingColorMode: 'custom', openingBgColor: '#000000', openingBgOpacity: 0.97, openingText: 'The Exhibition of Us', openingSubText: '', openingFontStyle: 'simple' } },
  },
  {
    id: 'hanok-traditional', name: '한옥 전통', category: '특별 컨셉',
    description: '한옥의 단아한 아름다움을 담은 전통 컨셉',
    emoji: '🏯', previewColors: ['#F5F0E5', '#6A5040', '#2A1E14'],
    settings: { ...base, theme: 'mocha', fontFamily: "'Nanum Myeongjo', serif", fontSize: 'large', customBgColor: '#F5F0E5', customAccentColor: '#6A5040', bgTexture: 'linen', bgEffect: 'none', scrollEffect: 'fade-up', heroStyle: 'classic', galleryStyle: 'slide', accountStyle: 'style3', greetingTitle: '혼인 청첩', greetingContent: '양가 부모님의 뜻을 받들어\n저희 두 사람이 혼인의 예를 올리게 되었습니다.\n\n바쁘시더라도 부디 왕림하시어\n저희의 앞날을 축복해주시면\n더 없는 기쁨이겠습니다.', groomMessage: '아내와 함께 부모님께 효도하며 살겠습니다.', brideMessage: '두 집안의 화목을 위해 정성을 다하겠습니다.', opening: { openingEnabled: true, openingStyle: 'curtain', openingColorMode: 'custom', openingBgColor: '#1A1408', openingBgOpacity: 0.95, openingText: '혼인을 알립니다', openingSubText: '', openingFontStyle: 'elegant' } },
  },
  {
    id: 'starlight-cosmos', name: '스타라이트 코스모스', category: '특별 컨셉',
    description: '우주와 별빛의 신비로운 컨셉',
    emoji: '🌌', previewColors: ['#0E0E1A', '#6A6ACA', '#C0C0FF'],
    settings: { ...base, theme: 'midnight', fontFamily: "'Cormorant Garamond', serif", fontSize: 'medium', customBgColor: '#F0F0FA', customAccentColor: '#4A4AA0', bgTexture: 'none', bgEffect: 'stars', scrollEffect: 'fade-in', heroStyle: 'fullscreen', galleryStyle: 'style3', accountStyle: 'style2', groomMessage: '우주에서 당신을 만난 건 기적입니다.', brideMessage: '별처럼 빛나는 사랑을 영원히 함께해요.', sectionOrder: ['greeting', 'calendar', 'interview', 'message', 'photos', 'timeline', 'location', 'guestbook', 'rsvp', 'accounts', 'contacts', 'share'], opening: { openingEnabled: true, openingStyle: 'circle', openingColorMode: 'custom', openingBgColor: '#050510', openingBgOpacity: 0.98, openingText: 'Written in the Stars', openingSubText: '', openingFontStyle: 'elegant' } },
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
