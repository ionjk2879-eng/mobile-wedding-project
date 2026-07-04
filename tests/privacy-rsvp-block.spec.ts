import { test, expect } from '@playwright/test';
import { d1Exec } from './helpers/d1';

// 기념일 모드 개인정보 전환: RSVP 폼이 화면에서 숨겨지는 것과 별개로, 서버가 제출 자체를
// 막아야 한다(클라이언트를 우회해 직접 POST해도 거부되어야 함). computeEffectiveVisibility의
// override(NULL=자동/0/1=수동) tri-state 판단이 실제로 맞물리는지 확인한다.

const SLUG_BLOCKED = 'test-priv-blocked';
const SLUG_OVERRIDE = 'test-priv-override';
const SLUG_NODATE = 'test-priv-nodate';
const OWNER_UID = 'test-priv-owner';
const ALL_SLUGS = [SLUG_BLOCKED, SLUG_OVERRIDE, SLUG_NODATE];

function cleanup() {
  d1Exec(`
    DELETE FROM invitations WHERE slug IN (${ALL_SLUGS.map((s) => `'${s}'`).join(',')});
    DELETE FROM rsvp WHERE invitation_slug IN (${ALL_SLUGS.map((s) => `'${s}'`).join(',')});
  `);
}

test.describe('개인정보 전환 후 RSVP 제출 차단', () => {
  test.beforeAll(() => {
    cleanup();
    d1Exec(`
      INSERT OR IGNORE INTO users (uid, provider, name, email) VALUES ('${OWNER_UID}', 'google', 'Tester', 'tester@example.com');

      INSERT INTO invitations (slug, owner_uid, data, is_paid, privacy_transition_date, rsvp_form_open_override)
        VALUES ('${SLUG_BLOCKED}', '${OWNER_UID}', '{}', 1, '2020-01-01T00:00:00.000Z', NULL);

      INSERT INTO invitations (slug, owner_uid, data, is_paid, privacy_transition_date, rsvp_form_open_override)
        VALUES ('${SLUG_OVERRIDE}', '${OWNER_UID}', '{}', 1, '2020-01-01T00:00:00.000Z', 1);

      INSERT INTO invitations (slug, owner_uid, data, is_paid, privacy_transition_date, rsvp_form_open_override)
        VALUES ('${SLUG_NODATE}', '${OWNER_UID}', '{}', 1, NULL, NULL);
    `);
  });

  test.afterAll(() => {
    cleanup();
  });

  test('전환일이 지나고 override가 없으면(자동 판단) RSVP 제출이 403으로 거부된다', async ({ request }) => {
    const res = await request.post(`/api/rsvp/${SLUG_BLOCKED}`, {
      data: { guestName: '차단테스트', relation: 'groom', isAttending: true },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('마감');
  });

  test('override=1이면 전환일이 지났어도 제출이 허용된다(수동 공개 유지)', async ({ request }) => {
    const res = await request.post(`/api/rsvp/${SLUG_OVERRIDE}`, {
      data: { guestName: '오버라이드테스트', relation: 'groom', isAttending: true },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('전환일 자체가 없으면 제출이 허용된다', async ({ request }) => {
    const res = await request.post(`/api/rsvp/${SLUG_NODATE}`, {
      data: { guestName: '날짜없음테스트', relation: 'groom', isAttending: true },
    });
    expect(res.ok()).toBeTruthy();
  });
});
