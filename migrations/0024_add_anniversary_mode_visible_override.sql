-- 기념일 모드 공개 여부 override. account_info_visible_override/rsvp_form_open_override와
-- 원리는 같지만(NULL=자동, 0/1=수동 설정) 개인정보가 아니라 "예식 후 앨범을 하객에게
-- 공개할지"의 문제라 별도 컬럼으로 관리한다. 같은 privacy_transition_date를 그대로
-- 공유해 판단하므로(신랑신부가 관리 페이지에서 날짜 하나로 한 번에 통제) 날짜 컬럼은
-- 새로 추가하지 않는다.
ALTER TABLE invitations ADD COLUMN anniversary_mode_visible_override INTEGER;
