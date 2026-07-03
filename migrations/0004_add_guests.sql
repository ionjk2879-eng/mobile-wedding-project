-- Guests table (하객 개인화 링크)
CREATE TABLE IF NOT EXISTS guests (
  code TEXT PRIMARY KEY,          -- 개인화 링크용 짧은 코드 (/invite/{code})
  invitation_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  relation TEXT NOT NULL DEFAULT 'other' CHECK (relation IN ('family', 'friend', 'coworker', 'other')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (invitation_slug) REFERENCES invitations(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_guests_slug ON guests(invitation_slug);
