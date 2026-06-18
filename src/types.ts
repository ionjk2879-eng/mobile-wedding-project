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
  heroPhoto: string;
  photos: string[];
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  bgMusicUrl: string;
  groomMessage: string;
  brideMessage: string;
  isRSVPEnabled: boolean;
  theme?: 'warm' | 'dark' | 'midnight';
  bgTexture?: 'none' | 'paper' | 'linen' | 'pattern';
  bgEffect?: 'none' | 'cherry-blossom' | 'snow' | 'stars';
  
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
