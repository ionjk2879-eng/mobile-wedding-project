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
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
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
  createdAt: string;
}

export interface InvitationData {
  groomName: string;
  brideName: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  greetingTitle: string;
  greetingContent: string;
  contacts: Contact[];
  accounts: Account[];
  accountStyle: 'style1' | 'style2' | 'style3';
  galleryStyle: 'grid' | 'style2' | 'style3';
  heroPhoto: string;
  photos: string[];
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  bgMusicUrl: string;
  groomMessage: string;
  brideMessage: string;
  groomPhoto: string;
  bridePhoto: string;
  isRSVPEnabled: boolean;
  theme?: 'blush' | 'champagne' | 'sage' | 'navy' | 'burgundy' | 'lavender' | 'dusty' | 'modern';
  bgTexture?: 'none' | 'paper' | 'linen' | 'pattern';
  bgEffect?: 'none' | 'cherry-blossom' | 'snow' | 'stars' | 'leaves' | 'hearts' | 'firefly' | 'confetti';
  scrollEffect?: 'none' | 'fade-up' | 'fade-in' | 'slide-in';
  
  // New features
  weddingDateISO: string;
  transport: {
    subway: string;
    bus: string;
    parking: string;
  };
  parents: {
    groomParents: Contact[];
    brideParents: Contact[];
  };
  timeline: TimelineEvent[];
  interview: InterviewQA[];
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  kakaoAppKey: string;
  videoUrl: string;
  language: 'ko' | 'en';
  en: Partial<InvitationData>;
}

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
