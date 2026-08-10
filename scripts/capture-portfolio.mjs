import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const baseURL = 'http://127.0.0.1:4173';
const outputDir = 'portfolio-screenshots';
const user = { uid: 'portfolio-owner', name: '김소네트', email: 'portfolio@sonett.kr', photo: '' };
const makeCover = (top, bottom, title, subtitle) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
    <rect width="900" height="1200" fill="url(#g)"/>
    <circle cx="450" cy="390" r="190" fill="white" opacity=".18"/>
    <path d="M280 835 Q450 600 620 835" fill="none" stroke="white" stroke-width="8" opacity=".8"/>
    <circle cx="390" cy="590" r="74" fill="white" opacity=".86"/><circle cx="510" cy="590" r="74" fill="white" opacity=".86"/>
    <text x="450" y="940" text-anchor="middle" fill="white" font-family="serif" font-size="54" letter-spacing="8">${title}</text>
    <text x="450" y="1005" text-anchor="middle" fill="white" font-family="sans-serif" font-size="24" letter-spacing="5" opacity=".9">${subtitle}</text>
  </svg>`)} `;
const paidCover = makeCover('#8F756A', '#DDB9A5', 'DOYOON &amp; SEOYEON', 'OCTOBER 24, 2026');
const unpaidCover = makeCover('#6D7F88', '#B9CDD2', 'MINJUN &amp; HAEUN', 'DECEMBER 12, 2026');

const invitation = {
  ownerUid: user.uid,
  groomName: '김도윤', brideName: '이서연',
  date: '2026. 10. 24. SAT', time: 'PM 12:30', weddingDateISO: '2026-10-24',
  venueName: '메종 드 루미에르 그랜드홀', venueAddress: '서울특별시 강남구 테헤란로 123',
  greetingTitle: '소중한 분들을 초대합니다',
  greetingContent: '서로의 가장 좋은 친구가 되어\n평생을 함께 걸어가려 합니다.\n저희의 새로운 시작을 축복해 주세요.',
  contacts: [{ role: '신랑', name: '김도윤', phone: '010-1234-5678' }, { role: '신부', name: '이서연', phone: '010-9876-5432' }],
  accounts: [], parents: { groomParents: [], brideParents: [] },
  transport: { subway: '2호선 강남역 3번 출구', bus: '강남역 정류장 하차', parking: '건물 내 2시간 무료' },
  photos: [], timeline: [], interview: [],
  theme: 'pastelblush', fontFamily: "'Pretendard', sans-serif", fontSize: 'medium',
  heroStyle: 'classic', heroPhoto: paidCover, heroPhotoShape: 'basic', bgTexture: 'none', bgEffect: 'petal', scrollEffect: 'fade',
  galleryStyle: 'slide', calendarStyle: 'card', locationStyle: 'card', messageStyle: 'card', accountStyle: 'style1',
  groomMessage: '언제나 서로의 든든한 편이 되겠습니다.', brideMessage: '사랑과 배려로 예쁘게 살아가겠습니다.',
  endingPhoto: '', endingMessage: '저희의 새로운 시작을 함께해 주셔서 감사합니다.', midPhoto: '', midPhotoCaption: '',
  isRSVPEnabled: true, isRSVPNoticeEnabled: true, isGuestbookEnabled: true, isInterviewEnabled: false,
  isTimelineEnabled: false, isMessageEnabled: true, isEndingEnabled: true, isMidPhotoEnabled: false, isLiveGalleryEnabled: true,
  guestbookPassword: '', opening: { openingEnabled: false, openingStyle: 'curtain', openingColorMode: 'theme', openingBgColor: '#1F2937', openingBgOpacity: 0.95, openingText: '', openingSubText: '' },
  sectionOrder: ['greeting', 'contacts', 'photos', 'calendar', 'message', 'location', 'rsvp', 'guestbook', 'livegallery', 'accounts'],
  slug: 'doyoon-seoyeon', shareUrl: '', shareTitle: '도윤과 서연의 결혼식에 초대합니다', shareDescription: '2026년 10월 24일 메종 드 루미에르', kakaoAppKey: '', videoUrl: '', language: 'ko',
  en: { groomName: 'Doyoon', brideName: 'Seoyeon', venueName: '', venueAddress: '' },
  ja: { groomName: 'ドユン', brideName: 'ソヨン', venueName: '', venueAddress: '' },
  isPaid: true, expiresAt: '2027-01-24T00:00:00.000Z', extensionCount: 0,
};

const unpaidInvitation = {
  ...invitation,
  groomName: '박민준', brideName: '최하은',
  date: '2026. 12. 12. 토요일', weddingDateISO: '2026-12-12',
  venueName: '라움 아트센터',
  slug: 'minjun-haeun', heroPhoto: unpaidCover,
  shareTitle: '민준과 하은의 결혼식에 초대합니다',
  isPaid: false, expiresAt: '2026-08-17T00:00:00.000Z',
};

const rsvps = [
  { id: '1', guestName: '박지민', isAttending: true, totalGuests: 2, wantsMeal: true, relation: 'groom', message: '결혼 진심으로 축하해!', createdAt: '2026-08-08T09:20:00.000Z', guestCode: 'A001' },
  { id: '2', guestName: '최유진', isAttending: true, totalGuests: 1, wantsMeal: true, relation: 'bride', message: '두 분 행복하세요 🤍', createdAt: '2026-08-07T13:10:00.000Z', guestCode: 'A002' },
  { id: '3', guestName: '정현우', isAttending: false, totalGuests: 1, wantsMeal: false, relation: 'groom', message: '멀리서 마음으로 축하할게', createdAt: '2026-08-06T04:30:00.000Z', guestCode: null },
  { id: '4', guestName: '한수빈', isAttending: true, totalGuests: 3, wantsMeal: true, relation: 'bride', message: '기대하고 있을게요!', createdAt: '2026-08-05T11:00:00.000Z', guestCode: 'A004' },
];

const guests = [
  { code: 'A001', name: '박지민', relation: 'friend', createdAt: '2026-08-01T00:00:00.000Z', visitedAt: '2026-08-08T09:00:00.000Z', linkSent: true },
  { code: 'A002', name: '최유진', relation: 'coworker', createdAt: '2026-08-01T00:00:00.000Z', visitedAt: '2026-08-07T13:00:00.000Z', linkSent: true },
  { code: 'A003', name: '김하늘', relation: 'family', createdAt: '2026-08-01T00:00:00.000Z', visitedAt: null, linkSent: false },
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });

async function newPage(viewport = { width: 1440, height: 1000 }, mockApi = false) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: 'ko-KR', colorScheme: 'light' });
  await context.addInitScript((authUser) => {
    localStorage.setItem('sonett_token', 'portfolio-preview-token');
    localStorage.setItem('sonett_user', JSON.stringify(authUser));
  }, user);
  const page = await context.newPage();
  if (mockApi) {
    await page.route('**/api/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      let body = {};
      if (path === '/api/invitations') body = [
        { slug: invitation.slug, data: invitation },
        { slug: unpaidInvitation.slug, data: unpaidInvitation },
      ];
      else if (path === `/api/invitations/${invitation.slug}`) body = invitation;
      else if (path === `/api/rsvp/${invitation.slug}`) body = rsvps;
      else if (path === `/api/guests/${invitation.slug}`) body = guests;
      else if (path === `/api/invitations/${invitation.slug}/privacy-settings`) body = { privacyTransitionDate: '2026-11-24T00:00:00.000Z', accountInfoVisibleOverride: null, rsvpFormOpenOverride: null, anniversaryModeVisibleOverride: null, isPastTransition: false };
      else if (path === `/api/gallery/${invitation.slug}/admin`) body = { photos: [], total: 0, limit: 100 };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
  }
  return { context, page };
}

async function open(page, path) {
  await page.goto(`${baseURL}${path}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
}

async function shot(page, name) {
  await page.screenshot({ path: `${outputDir}/${name}.png` });
  console.log(`${name}: ${page.url()}`);
}

if (process.argv.includes('--manage-only')) {
  const { context, page } = await newPage(undefined, true);
  await open(page, '/manage');
  await shot(page, '04-manage-dashboard');
  await context.close();
  await browser.close();
  process.exit(0);
}

{
  const { context, page } = await newPage();
  await open(page, '/editor?template=sage-garden');
  await shot(page, '01-editor-overview');
  const navItems = page.locator('.nav-menu-item');
  await navItems.nth(7).click();
  await page.waitForTimeout(1000);
  await shot(page, '02-editor-gallery');
  await context.close();
}

{
  const { context, page } = await newPage({ width: 430, height: 932 });
  await open(page, '/template-preview/blush-romance');
  const openButton = page.getByRole('button', { name: /초대장 열기/ });
  if (await openButton.count()) await openButton.click();
  await page.waitForTimeout(1200);
  await page.locator('.calendar-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await shot(page, '03-invitation-content');
  await context.close();
}

{
  const { context, page } = await newPage(undefined, true);
  await open(page, '/manage');
  await shot(page, '04-manage-dashboard');
  const shareButton = page.locator('button').filter({ hasText: /공유/ }).first();
  if (await shareButton.count()) await shareButton.click();
  await page.waitForTimeout(600);
  await shot(page, '05-share-qr');
  await context.close();
}

{
  const { context, page } = await newPage(undefined, true);
  await open(page, `/admin/${invitation.slug}`);
  await shot(page, '06-rsvp-admin');
  await context.close();
}

await browser.close();
