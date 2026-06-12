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
}
