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
  photos: string[];
  fontFamily: string;
  bgMusicUrl: string;
  groomMessage: string;
  brideMessage: string;
  isRSVPEnabled: boolean;
  theme?: 'warm' | 'dark' | 'midnight';
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
