-- account_info_visible/rsvp_form_open(0010)는 NOT NULL DEFAULT 1이라, 이미 모든 행이 1로
-- 채워져 있어 "손댄 적 없음"과 "신랑신부가 명시적으로 다시 켜둠"을 값만으로 구분할 수 없다.
-- 그렇다고 기존 두 컬럼을 DROP하지는 않는다 — D1의 DROP COLUMN 지원 여부가 불확실하고,
-- CI의 마이그레이션 적용 스텝이 continue-on-error라 실패해도 조용히 다음 배포로 넘어가
-- 스키마와 코드가 어긋난 채 배포될 위험이 있기 때문. 대신 새 nullable override 컬럼을
-- 추가하고, 이후 코드는 이 두 컬럼만 사용한다(기존 account_info_visible/rsvp_form_open은
-- 더 이상 참조하지 않고 그대로 방치).
--
-- account_info_visible_override / rsvp_form_open_override:
--   NULL(기본값)  = 신랑신부가 아직 개입하지 않음 → privacy_transition_date 기준으로 자동 판단
--   0 또는 1      = 신랑신부가 명시적으로 설정 → 날짜와 무관하게 이 값을 그대로 사용
ALTER TABLE invitations ADD COLUMN account_info_visible_override INTEGER;
ALTER TABLE invitations ADD COLUMN rsvp_form_open_override INTEGER;
