export interface Account {
  side: string;
  bank: string;
  number: string;
  owner: string;
}

export interface Contact {
  role: string;
  name: string;
  phone: string;
  isDeceased?: boolean;
  deceasedStyle?: 'text' | 'chrysanthemum' | 'ribbon';
}

export interface TimelineEvent {
  id: string;
  date: string;
  showDate: boolean;
  year: string;
  title: string;
  description: string;
  photo: string;
}

export interface InterviewQA {
  id: string;
  question: string;
  groomAnswer: string;
  brideAnswer: string;
}

export interface GuestMessage {
  id: string;
  name: string;
  content: string;
  password: string;
  side: 'groom' | 'bride';
  createdAt: string;
}

export interface BasicInfo {
  groomName: string;
  brideName: string;
  date: string;
  time: string;
  weddingDateISO: string;
  venueName: string;
  venueAddress: string;
  contacts: Contact[];
  parents: {
    groomParents: Contact[];
    brideParents: Contact[];
  };
  transport: {
    subway: string;
    bus: string;
    parking: string;
  };
}

export interface DesignConfig {
  theme?: 'ivorynavy' | 'mochaneutral' | 'dustyblue' | 'pastelblush' | 'sagenature' | 'warmcharcoal' | 'sunsetgold' | 'deepteal' | 'deepplum' | 'terracotta' | 'ivorychampagne';
  customBgColor?: string;
  customAccentColor?: string;
  customLabelColor?: string;
  customTextColor?: string;
  bgTexture?: 'none' | 'paper' | 'linen' | 'pattern' | 'silk' | 'watercolor';
  bgEffect?: 'none' | 'cherry-blossom' | 'snow' | 'stars' | 'leaves' | 'hearts' | 'firefly' | 'confetti' | 'petals' | 'autumn';
  // true면 흩날리는 효과를 메인화면(Hero) 영역 안에만 가두어 스크롤하면 함께 사라지게
  // 한다. 기본값(false/미지정)은 기존처럼 화면 전체에 고정되어 스크롤해도 계속 보인다.
  bgEffectHeroOnly?: boolean;
  // 메인화면(Hero) 사진 경계에 얹는 물결(파도) 효과. 위/아래/양쪽 중 어디에 표시할지.
  heroWaveEffect?: 'none' | 'top' | 'bottom' | 'both';
  scrollEffect?: 'none' | 'fade-up' | 'fade-in' | 'slide-in';
  heroPhoto: string;
  heroStyle: 'classic' | 'overlay' | 'minimal' | 'editorial' | 'fullscreen' | 'split' | 'centercard' | 'magcover' | 'glassframe' | 'instacard' | 'bookcover' | 'bookpage' | 'filmstrip' | 'verttype' | 'magframe' | 'boldtype' | 'datesplit';
  heroPhotoX?: number;
  heroPhotoY?: number;
  // 사진 확대 비율(%). 100 = 원본(확대 없음). object-fit: cover로 이미 채워진 사진을
  // 중심 기준으로 더 확대해 보여준다.
  heroPhotoScale?: number;
  heroPhoto2?: string;
  heroPhoto2X?: number;
  heroPhoto2Y?: number;
  // 사진 모형(테두리 형태) 축. Hero.tsx(메인화면 대표 사진)에만 적용되며, src/data/heroStyleConfig.ts의
  // FIXED_LOOK_HERO_STYLES에 해당하는 heroStyle에서는 무시된다. 미지정 시 'basic'(기존과 동일한 사각형).
  heroPhotoShape?: 'basic' | 'fill' | 'arch' | 'oval' | 'frame' | 'blob' | 'polaroid' | 'hexagon' | 'hairline';
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface ContentData {
  greetingTitle: string;
  greetingContent: string;
  groomMessage: string;
  brideMessage: string;
  groomPhoto: string;
  bridePhoto: string;
  photos: string[];
  galleryStyle: 'slide' | 'style3';
  calendarStyle?: 'card' | 'plain';
  locationStyle?: 'card' | 'plain';
  messageStyle?: 'card' | 'plain';
  timeline: TimelineEvent[];
  interview: InterviewQA[];
  accounts: Account[];
  accountStyle: 'style1' | 'style2' | 'style3' | 'style4';
  contactDisplayMode?: 'inline' | 'popup' | 'accordion';
  videoUrl: string;
  endingPhoto: string;
  endingPhotoX?: number;
  endingPhotoY?: number;
  endingPhotoScale?: number;
  endingMessage: string;
  midPhoto: string;
  midPhotoX?: number;
  midPhotoY?: number;
  midPhotoScale?: number;
  midPhotoCaption?: string;
}

export interface OpeningConfig {
  openingEnabled: boolean;
  openingStyle: 'curtain' | 'circle' | 'veil' | 'blind' | 'frame' | 'insta' | 'typing'; // 'typing' kept for backwards compat
  openingContentStyle?: 'sequential' | 'typing' | 'lines';
  openingColorMode: 'theme' | 'custom' | 'gradient';
  openingGradientMode?: 'theme' | 'preset' | 'custom';
  openingTextColor?: 'white' | 'dark';
  openingBgColor: string;
  openingBgColor2?: string;
  openingBgOpacity: number;
  openingText: string;
  openingSubText: string;
  openingFontStyle?: 'elegant' | 'simple' | 'clean';
  openingDecoEffect?: 'none' | 'dots' | 'ripple' | 'sparkle' | 'bokeh' | 'aurora' | 'firefly' | 'petal' | 'aurora-bokeh' | 'firefly-petal' | 'trace';
  openingBgPattern?: string | string[];
}

export interface FeatureConfig {
  isRSVPEnabled: boolean;
  isRSVPNoticeEnabled: boolean;
  isGuestbookEnabled: boolean;
  isInterviewEnabled: boolean;
  isTimelineEnabled: boolean;
  isMessageEnabled: boolean;
  isEndingEnabled: boolean;
  isMidPhotoEnabled: boolean;
  isLiveGalleryEnabled: boolean;
  guestbookPassword: string;
  opening: OpeningConfig;
  bgMusicUrl: string;
  sectionOrder: string[];
  templateSectionOrder?: string[];
  language: 'ko' | 'en' | 'ja';
  en: Partial<InvitationData>;
  ja?: Partial<InvitationData>;
  anniversaryMode?: {
    heroPhoto: string;
    photos: string[]; // 최대 10장
    openingStyle?: string; // 기존 오프닝 스타일 키, 없으면 청첩장 모드 값 상속
  };
}

export interface SharingConfig {
  slug: string;
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  kakaoAppKey: string;
  isPaid?: boolean;
  expiresAt?: string | null; // null = 영구, ISO string = 만료일, undefined = 미설정
  extensionCount?: number;
  isPermanent?: boolean;
  ownerUid?: string;
  isPastAnniversaryThreshold?: boolean; // 서버가 weddingDateISO+24시간 경과 여부를 계산해 내려주는 값
}

export type InvitationData = BasicInfo & DesignConfig & ContentData & FeatureConfig & SharingConfig;

export interface RSVPResponse {
  id?: string;
  guestName: string;
  isAttending: boolean;
  totalGuests: number;
  wantsMeal: boolean | null;
  relation: 'groom' | 'bride';
  message: string;
  createdAt?: string;
  guestCode?: string | null;
}

export type GuestRelation = 'family' | 'friend' | 'coworker' | 'other';

export interface Guest {
  code: string;
  name: string;
  relation: GuestRelation;
  createdAt: string;
  visitedAt: string | null;
}
