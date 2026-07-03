-- RSVP id가 하객 이름만으로 만들어져 있어, 서로 다른 청첩장에 같은 이름의 하객이
-- RSVP를 제출하면 id가 전역으로 충돌해 응답이 서로 덮어써지는 문제가 있었다.
-- id를 invitation_slug로 스코프하고(개인화 링크로 들어온 경우 guest_code로 더 강하게 식별)
-- 기존 데이터도 같은 규칙으로 재구성해 앞으로의 충돌을 막는다.
UPDATE rsvp
SET id = CASE
  WHEN guest_code IS NOT NULL THEN invitation_slug || '::code::' || guest_code
  ELSE invitation_slug || '::' || id
END;
