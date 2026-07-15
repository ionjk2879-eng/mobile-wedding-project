CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT NOT NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_secret INTEGER DEFAULT 0,
  password TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (uid) REFERENCES users(uid)
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);
