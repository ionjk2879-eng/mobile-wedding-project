-- 하객별 링크 발송 여부 수동 체크 컬럼
ALTER TABLE guests ADD COLUMN link_sent INTEGER DEFAULT 0 NOT NULL;
