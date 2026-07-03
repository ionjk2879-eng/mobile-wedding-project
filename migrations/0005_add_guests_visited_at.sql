-- 하객 개인화 링크 최초 방문 시각 (NULL = 아직 방문 안 함)
ALTER TABLE guests ADD COLUMN visited_at TEXT;
