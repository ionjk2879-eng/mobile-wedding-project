CREATE TABLE IF NOT EXISTS inquiry_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id INTEGER NOT NULL,
  uid TEXT NOT NULL,
  author_name TEXT NOT NULL,
  is_admin INTEGER DEFAULT 0,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inquiry_comments_inquiry ON inquiry_comments(inquiry_id);
