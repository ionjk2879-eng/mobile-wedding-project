import { test, expect } from '@playwright/test';
import { d1Exec, d1Query } from './helpers/d1';

// 과거 RSVP 사고: id가 하객 이름만으로 만들어져, 서로 다른 청첩장에 동명이인이 RSVP를
// 제출하면 id가 전역으로 충돌해 응답이 서로 덮어써졌다(0008_scope_rsvp_id.sql로 수정됨).
// 갤러리도 같은 종류의 사고를 막기 위해 애초에 invitation_slug로 스코프된 쿼리만 쓴다.
// 이 테스트는 그 두 가지가 실제로 격리되는지를 재발 방지 차원에서 확인한다.

const SLUG_A = 'test-iso-a';
const SLUG_B = 'test-iso-b';
const OWNER_UID = 'test-iso-owner';

function cleanup() {
  d1Exec(`
    DELETE FROM invitations WHERE slug IN ('${SLUG_A}', '${SLUG_B}');
    DELETE FROM rsvp WHERE invitation_slug IN ('${SLUG_A}', '${SLUG_B}');
    DELETE FROM gallery_photos WHERE invitation_slug IN ('${SLUG_A}', '${SLUG_B}');
  `);
}

test.describe('청첩장 간 데이터 격리 (RSVP / 라이브 갤러리)', () => {
  test.beforeAll(() => {
    cleanup();
    d1Exec(`
      INSERT OR IGNORE INTO users (uid, provider, name, email) VALUES ('${OWNER_UID}', 'google', 'Tester', 'tester@example.com');
      INSERT INTO invitations (slug, owner_uid, data, is_paid) VALUES ('${SLUG_A}', '${OWNER_UID}', '{}', 1);
      INSERT INTO invitations (slug, owner_uid, data, is_paid) VALUES ('${SLUG_B}', '${OWNER_UID}', '{}', 1);
    `);
  });

  test.afterAll(() => {
    cleanup();
  });

  test('동명 하객이 서로 다른 청첩장에 RSVP를 제출해도 id가 충돌하지 않고 각자 slug로만 저장된다', async ({ request }) => {
    const resA = await request.post(`/api/rsvp/${SLUG_A}`, {
      data: { guestName: '동명이인', relation: 'groom', isAttending: true },
    });
    expect(resA.ok()).toBeTruthy();

    const resB = await request.post(`/api/rsvp/${SLUG_B}`, {
      data: { guestName: '동명이인', relation: 'bride', isAttending: false },
    });
    expect(resB.ok()).toBeTruthy();

    const rows = d1Query<{ invitation_slug: string; id: string; relation: string }>(
      `SELECT invitation_slug, id, relation FROM rsvp WHERE guest_name = '동명이인'`
    );
    expect(rows).toHaveLength(2);

    const rowA = rows.find((r) => r.invitation_slug === SLUG_A);
    const rowB = rows.find((r) => r.invitation_slug === SLUG_B);
    expect(rowA).toBeTruthy();
    expect(rowB).toBeTruthy();
    // 핵심 회귀 방지 포인트: 같은 이름이라도 id는 slug로 스코프되어 서로 달라야 한다.
    expect(rowA!.id).not.toBe(rowB!.id);
    expect(rowA!.relation).toBe('groom');
    expect(rowB!.relation).toBe('bride');
  });

  test('갤러리 사진 목록은 다른 청첩장 사진과 섞이지 않는다', async ({ request }) => {
    const uploadA = await request.post(`/api/gallery/${SLUG_A}`, {
      multipart: {
        file: { name: 'a.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-image-a') },
        guestName: 'A업로더',
        deviceToken: 'devtoken-a-1234567890',
      },
    });
    expect(uploadA.ok()).toBeTruthy();

    const uploadB = await request.post(`/api/gallery/${SLUG_B}`, {
      multipart: {
        file: { name: 'b.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-image-b') },
        guestName: 'B업로더',
        deviceToken: 'devtoken-b-0987654321',
      },
    });
    expect(uploadB.ok()).toBeTruthy();

    const listA = await request.get(`/api/gallery/${SLUG_A}?deviceToken=devtoken-a-1234567890`);
    const photosA = await listA.json() as { guestName: string | null }[];
    expect(photosA).toHaveLength(1);
    expect(photosA[0].guestName).toBe('A업로더');

    const listB = await request.get(`/api/gallery/${SLUG_B}?deviceToken=devtoken-b-0987654321`);
    const photosB = await listB.json() as { guestName: string | null }[];
    expect(photosB).toHaveLength(1);
    expect(photosB[0].guestName).toBe('B업로더');
  });
});
