-- 결제 후 청첩장을 자동으로 유료 전환하기 위한 활성화 코드.
-- 코드는 슈퍼관리자가 미리 일괄 생성해두고(SuperAdminPage), 고객이 청첩장 관리 페이지에서
-- 직접 입력하면 POST /api/invitations/:slug/redeem이 소비하고 해당 청첩장을 활성화한다.
CREATE TABLE IF NOT EXISTS activation_codes (
  code TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'unused',   -- 'unused' | 'used'
  used_by_slug TEXT,                        -- 사용된 청첩장 slug (nullable)
  used_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  note TEXT                                 -- 어떤 상품/배치인지 메모용 (선택)
);

CREATE INDEX IF NOT EXISTS idx_activation_codes_status ON activation_codes(status);
