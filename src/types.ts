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
  theme?: 'blush' | 'champagne' | 'sage' | 'navy' | 'burgundy' | 'lavender' | 'dusty' | 'modern' | 'mocha' | 'cloud' | 'emerald' | 'butter' | 'cobalt' | 'terracotta' | 'rosegold' | 'midnight';
  customBgColor?: string;
  customAccentColor?: string;
  bgTexture?: 'none' | 'paper' | 'linen' | 'pattern' | 'silk' | 'watercolor';
  bgEffect?: 'none' | 'cherry-blossom' | 'snow' | 'stars' | 'leaves' | 'hearts' | 'firefly' | 'confetti';
  scrollEffect?: 'none' | 'fade-up' | 'fade-in' | 'slide-in';
  heroPhoto: string;
  heroStyle: 'classic' | 'overlay' | 'minimal' | 'editorial' | 'fullscreen' | 'split' | 'centercard' | 'gradation' | 'magcover';
  heroPhotoX?: number;
  heroPhotoY?: number;
  heroPhoto2?: string;
  heroPhoto2X?: number;
  heroPhoto2Y?: number;
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
  timeline: TimelineEvent[];
  interview: InterviewQA[];
  accounts: Account[];
  accountStyle: 'style1' | 'style2' | 'style3';
  videoUrl: string;
}

export interface OpeningConfig {
  openingEnabled: boolean;
  openingStyle: 'curtain' | 'circle' | 'fade';
  openingColorMode: 'theme' | 'custom';
  openingBgColor: string;
  openingBgOpacity: number;
  openingText: string;
  openingSubText: string;
  openingFontStyle?: 'elegant' | 'simple' | 'clean';
}

export interface FeatureConfig {
  isRSVPEnabled: boolean;
  isGuestbookEnabled: boolean;
  guestbookPassword: string;
  opening: OpeningConfig;
  bgMusicUrl: string;
  sectionOrder: string[];
  language: 'ko' | 'en';
  en: Partial<InvitationData>;
}

export interface SharingConfig {
  slug: string;
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  kakaoAppKey: string;
  isPaid?: boolean;
  expiresAt?: string | null; // null = 영구, ISO string = 만료일, undefined = 미설정
  isPermanent?: boolean;
}

export type InvitationData = BasicInfo & DesignConfig & ContentData & FeatureConfig & SharingConfig;

export interface RSVPResponse {
  id?: string;
  guestName: string;
  isAttending: boolean;
  totalGuests: number;
  wantsMeal: boolean;
  relation: 'groom' | 'bride';
  message: string;
  createdAt?: string;
}
