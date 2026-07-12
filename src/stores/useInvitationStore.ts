import { create } from 'zustand';
import { InvitationData, TimelineEvent, InterviewQA } from '../types';

export const initialData: InvitationData = {
  groomName: '',
  brideName: '',
  date: '2026. 10. 24. SAT',
  time: 'PM 12:30',
  venueName: '',
  venueAddress: '',
  greetingTitle: '초대합니다',
  greetingContent: '곁에 있을 때 가장 나다운 모습이 되게 하는 사람,\n꿈을 꾸게 하고, 그 꿈을 함께 나누고 싶은 사람을 만났습니다.\n\n서로의 다름을 인정하며,\n서로의 부족함을 채워주는 사랑으로\n행복한 가정을 일구어 나가겠습니다.\n\n저희의 시작을 축복해 주시면 감사하겠습니다.',
  contacts: [
    { role: '신랑', name: '', phone: '' },
    { role: '신부', name: '', phone: '' },
  ],
  accounts: [
    { side: '신랑', bank: '', number: '', owner: '' },
    { side: '신랑 아버지', bank: '', number: '', owner: '' },
    { side: '신랑 어머니', bank: '', number: '', owner: '' },
    { side: '신부', bank: '', number: '', owner: '' },
    { side: '신부 아버지', bank: '', number: '', owner: '' },
    { side: '신부 어머니', bank: '', number: '', owner: '' },
  ],
  accountStyle: 'style1',
  galleryStyle: 'slide',
  calendarStyle: 'card',
  locationStyle: 'card',
  messageStyle: 'card',
  heroPhoto: '',
  heroStyle: 'classic',
  heroPhotoShape: 'basic',
  photos: [],
  fontFamily: "'Pretendard', sans-serif",
  fontSize: 'medium',
  bgMusicUrl: '',
  groomMessage: '항상 곁에서 힘이 되어주는 든든한 남편이 되겠습니다.',
  brideMessage: '서로 아끼고 배려하며 예쁘게 잘 살겠습니다.',
  groomPhoto: '',
  bridePhoto: '',
  endingPhoto: '',
  endingMessage: '저희의 새로운 시작을 함께해주셔서\n진심으로 감사합니다.',
  midPhoto: '',
  midPhotoCaption: '',
  isRSVPEnabled: true,
  isRSVPNoticeEnabled: true,
  isGuestbookEnabled: true,
  isInterviewEnabled: true,
  isTimelineEnabled: true,
  isMessageEnabled: true,
  isEndingEnabled: true,
  isMidPhotoEnabled: true,
  isLiveGalleryEnabled: false,
  guestbookPassword: '',
  opening: {
    openingEnabled: false,
    openingStyle: 'curtain',
    openingColorMode: 'theme',
    openingBgColor: '#1F2937',
    openingBgOpacity: 0.95,
    openingText: '',
    openingSubText: '',
  },
  theme: 'ivorynavy',
  bgTexture: 'none',
  bgEffect: 'none',
  scrollEffect: 'none',
  weddingDateISO: '2026-10-24',
  transport: {
    subway: '예) 2호선 강남역 12번 출구 도보 5분',
    bus: '예) 강남역 정류장 하차 (140, 441번 등)',
    parking: '예) 건물 내 지하 주차장 이용 가능'
  },
  parents: {
    groomParents: [
      { role: '아버지', name: '', phone: '', isDeceased: false },
      { role: '어머니', name: '', phone: '', isDeceased: false },
    ],
    brideParents: [
      { role: '아버지', name: '', phone: '', isDeceased: false },
      { role: '어머니', name: '', phone: '', isDeceased: false },
    ]
  },
  timeline: [],
  interview: [],
  // midphoto는 순서 관리 대상이 아니라 InvitationView에서 활성 섹션 중간에 동적으로 삽입됨
  sectionOrder: ['greeting', 'contacts', 'photos', 'calendar', 'message', 'interview', 'timeline', 'location', 'guestbook', 'livegallery', 'rsvp', 'accounts'],
  slug: '',
  shareUrl: '',
  shareTitle: '',
  shareDescription: '',
  kakaoAppKey: '',
  videoUrl: '',
  language: 'ko',
  en: {
    groomName: 'Groom',
    brideName: 'Bride',
    venueName: '',
    venueAddress: '',
  },
  ja: {
    groomName: '新郎',
    brideName: '新婦',
    venueName: '',
    venueAddress: '',
  },
};

interface InvitationStore {
  data: InvitationData;

  setData: (data: InvitationData) => void;
  updateField: <K extends keyof InvitationData>(field: K, value: InvitationData[K]) => void;
  updateFields: (partial: Partial<InvitationData>) => void;

  updateContact: (index: number, field: string, value: string) => void;
  updateAccount: (index: number, field: string, value: string) => void;
  updateTransport: (field: string, value: string) => void;
  updateParent: (side: 'groomParents' | 'brideParents', role: string, field: string, value: string | boolean) => void;

  addTimelineEvent: () => void;
  updateTimelineEvent: (id: string, field: keyof TimelineEvent, value: string) => void;
  removeTimelineEvent: (id: string) => void;
  moveTimelineEvent: (id: string, dir: -1 | 1) => void;

  addInterviewQA: () => void;
  updateInterviewQA: (id: string, field: keyof InterviewQA, value: string) => void;
  removeInterviewQA: (id: string) => void;

  addPhotos: (photos: string[]) => void;
  removePhoto: (index: number) => void;

  moveSection: (index: number, dir: -1 | 1) => void;

  openingPreviewKey: number;
  triggerOpeningPreview: () => void;
}

const useInvitationStore = create<InvitationStore>((set) => ({
  data: initialData,
  openingPreviewKey: 0,
  triggerOpeningPreview: () => set((s) => ({ openingPreviewKey: s.openingPreviewKey + 1 })),

  setData: (data) => set({ data }),

  updateField: (field, value) =>
    set((state) => ({ data: { ...state.data, [field]: value } })),

  updateFields: (partial) =>
    set((state) => ({ data: { ...state.data, ...partial } })),

  updateContact: (index, field, value) =>
    set((state) => {
      const contacts = [...state.data.contacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { data: { ...state.data, contacts } };
    }),

  updateAccount: (index, field, value) =>
    set((state) => {
      const accounts = [...state.data.accounts];
      accounts[index] = { ...accounts[index], [field]: value };
      return { data: { ...state.data, accounts } };
    }),

  updateTransport: (field, value) =>
    set((state) => ({
      data: { ...state.data, transport: { ...state.data.transport, [field]: value } }
    })),

  updateParent: (side, role, field, value) =>
    set((state) => {
      const parents = [...state.data.parents[side]];
      const idx = parents.findIndex(p => p.role === role);
      if (idx > -1) parents[idx] = { ...parents[idx], [field]: value };
      return { data: { ...state.data, parents: { ...state.data.parents, [side]: parents } } };
    }),

  addTimelineEvent: () =>
    set((state) => ({
      data: {
        ...state.data,
        timeline: [...(state.data.timeline || []), {
          id: Date.now().toString(), date: '', showDate: true, year: '', title: '', description: '', photo: '',
        }]
      }
    })),

  updateTimelineEvent: (id, field, value) =>
    set((state) => ({
      data: {
        ...state.data,
        timeline: (state.data.timeline || []).map(e => e.id === id ? { ...e, [field]: value } : e)
      }
    })),

  removeTimelineEvent: (id) =>
    set((state) => ({
      data: { ...state.data, timeline: (state.data.timeline || []).filter(e => e.id !== id) }
    })),

  moveTimelineEvent: (id, dir) =>
    set((state) => {
      const list = [...(state.data.timeline || [])];
      const idx = list.findIndex(e => e.id === id);
      const target = idx + dir;
      if (target < 0 || target >= list.length) return state;
      [list[idx], list[target]] = [list[target], list[idx]];
      return { data: { ...state.data, timeline: list } };
    }),

  addInterviewQA: () =>
    set((state) => ({
      data: {
        ...state.data,
        interview: [...(state.data.interview || []), {
          id: Date.now().toString(), question: '', groomAnswer: '', brideAnswer: '',
        }]
      }
    })),

  updateInterviewQA: (id, field, value) =>
    set((state) => ({
      data: {
        ...state.data,
        interview: (state.data.interview || []).map(q => q.id === id ? { ...q, [field]: value } : q)
      }
    })),

  removeInterviewQA: (id) =>
    set((state) => ({
      data: { ...state.data, interview: (state.data.interview || []).filter(q => q.id !== id) }
    })),

  addPhotos: (photos) =>
    set((state) => ({
      data: { ...state.data, photos: [...state.data.photos, ...photos] }
    })),

  removePhoto: (index) =>
    set((state) => {
      const photos = [...state.data.photos];
      photos.splice(index, 1);
      return { data: { ...state.data, photos } };
    }),

  moveSection: (index, dir) =>
    set((state) => {
      const defaultOrder = ['greeting', 'calendar', 'message', 'interview', 'photos', 'timeline', 'location', 'rsvp', 'accounts', 'contacts'];
      const order = [...(state.data.sectionOrder?.length ? state.data.sectionOrder : defaultOrder)];
      const target = index + dir;
      if (target < 0 || target >= order.length) return state;
      [order[index], order[target]] = [order[target], order[index]];
      return { data: { ...state.data, sectionOrder: order } };
    }),
}));

export default useInvitationStore;