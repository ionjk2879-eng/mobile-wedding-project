import { defineConfig } from '@playwright/test';

// API 레벨 테스트만 다룬다(브라우저 불필요) — worker.ts를 --env dev 로컬 시뮬레이션으로
// 띄우고 순수 HTTP 요청으로 검증한다. 프로덕션 D1/R2는 절대 건드리지 않는다.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1, // 로컬 D1 sqlite 파일을 공유하므로 동시 실행 시 테스트 데이터가 섞일 수 있음
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:8791',
  },
  webServer: {
    command: 'node scripts/ensure-test-assets.mjs && npm run migrate:dev && npx wrangler dev --env dev --port 8791',
    url: 'http://127.0.0.1:8791/api/posts',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
