-- Users table (replaces Firebase Auth user records)
CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  provider TEXT NOT NULL,         -- 'google' | 'kakao' | 'naver'
  name TEXT,
  email TEXT,
  photo TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Invitations table (replaces Firestore 'invitations' collection)
CREATE TABLE IF NOT EXISTS invitations (
  slug TEXT PRIMARY KEY,
  owner_uid TEXT NOT NULL,
  data TEXT NOT NULL,             -- JSON blob (InvitationData)
  is_paid INTEGER DEFAULT 0,
  expires_at TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (owner_uid) REFERENCES users(uid)
);

CREATE INDEX IF NOT EXISTS idx_invitations_owner ON invitations(owner_uid);
CREATE INDEX IF NOT EXISTS idx_invitations_expires ON invitations(expires_at);

-- Guestbook table (replaces invitations/{slug}/guestbook subcollection)
CREATE TABLE IF NOT EXISTS guestbook (
  id TEXT PRIMARY KEY,
  invitation_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  password TEXT NOT NULL,
  side TEXT NOT NULL,             -- 'groom' | 'bride'
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (invitation_slug) REFERENCES invitations(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_guestbook_slug ON guestbook(invitation_slug);

-- RSVP table (replaces invitations/{slug}/rsvp subcollection)
CREATE TABLE IF NOT EXISTS rsvp (
  id TEXT PRIMARY KEY,
  invitation_slug TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  is_attending INTEGER NOT NULL,
  total_guests INTEGER DEFAULT 1,
  wants_meal INTEGER DEFAULT 0,
  relation TEXT NOT NULL,         -- 'groom' | 'bride'
  message TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (invitation_slug) REFERENCES invitations(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rsvp_slug ON rsvp(invitation_slug);
