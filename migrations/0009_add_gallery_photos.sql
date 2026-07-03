-- 결혼식 라이브 갤러리: 하객이 결혼식 중/후에 직접 업로드하는 사진
-- id는 RSVP 사고(사용자 입력으로 id를 만들다 청첩장 간 충돌) 재발을 막기 위해
-- 반드시 crypto.randomUUID()로 생성한다 (guestbook.id와 동일한 패턴).
CREATE TABLE IF NOT EXISTS gallery_photos (
  id TEXT PRIMARY KEY,
  invitation_slug TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  uploader_type TEXT NOT NULL,   -- 'guest_code' | 'token'
  uploader_ref TEXT,             -- guest_code 값 또는 브라우저 고정 토큰 값
  guest_name TEXT,               -- 표시용 이름(업로드 시점에 저장) — uploader_ref가 끊겨도 이름은 남도록 별도 보관
  created_at TEXT DEFAULT (datetime('now')),
  hidden_at TEXT,                -- 신고/숨김 처리 시각 (NULL이면 노출됨)
  FOREIGN KEY (invitation_slug) REFERENCES invitations(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gallery_photos_slug ON gallery_photos(invitation_slug);
