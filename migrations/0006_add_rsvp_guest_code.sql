-- RSVP 응답을 특정 하객과 연결 (개인화 링크로 들어온 응답만 채워짐, NULL이면 범용 링크로 직접 입력한 응답)
ALTER TABLE rsvp ADD COLUMN guest_code TEXT REFERENCES guests(code);
