-- 기념일 모드 개인정보 전환 정책: 결혼식 후 일정 기간이 지나면 계좌/RSVP 노출을 자동으로 끈다.
--
-- privacy_transition_date를 "wedding_date + 21일"로 자동 채우는 컬럼 DEFAULT는 쓸 수 없다.
-- SQLite의 ALTER TABLE ADD COLUMN DEFAULT는 같은 행의 다른 컬럼을 참조하지 못하고,
-- 애초에 invitations 테이블엔 wedding_date라는 SQL 컬럼 자체가 없다 — 결혼식 날짜는
-- invitations.data(JSON, InvitationData)의 weddingDateISO 필드에만 존재한다.
-- 그래서 신규 청첩장은 생성 API(handleInvitations)에서 weddingDateISO + 21일을 계산해
-- INSERT 시점에 명시적으로 채우고, 기존 청첩장은 아래 UPDATE로 JSON에서 뽑아 백필한다.
ALTER TABLE invitations ADD COLUMN privacy_transition_date TEXT;
ALTER TABLE invitations ADD COLUMN account_info_visible INTEGER NOT NULL DEFAULT 1;
ALTER TABLE invitations ADD COLUMN rsvp_form_open INTEGER NOT NULL DEFAULT 1;

-- 기존 청첩장 백필: data JSON에 weddingDateISO가 있는 경우에만 21일 뒤로 채움.
-- 값이 없거나(초안 상태 등) 파싱 불가하면 NULL로 남겨 "전환 대상 아님"으로 취급한다.
UPDATE invitations
SET privacy_transition_date = date(json_extract(data, '$.weddingDateISO'), '+21 days')
WHERE privacy_transition_date IS NULL
  AND json_extract(data, '$.weddingDateISO') IS NOT NULL;
