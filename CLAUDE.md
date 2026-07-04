# Sonett 프로젝트

## 배포
`git push`만 하면 GitHub Actions를 통해 Cloudflare Workers에 자동 배포된다.
별도로 `npm run build` 또는 `wrangler deploy`를 실행할 필요 없다.

## 로컬 개발 시 절대 규칙
- 로컬에서 `wrangler dev`/`wrangler d1`/`wrangler r2` 명령을 실행할 때 **`--remote` 플래그를 쓰지 않는다.**
  `--remote`는 실제 프로덕션(또는 실수로 지정 안 하면 프로덕션 기본값) 리소스에 직접 연결된다.
- 로컬 개발은 항상 `--env dev`를 사용한다 (`npm run dev:worker`, `npm run migrate:dev`).
  이 환경은 `wrangler.toml`의 `[env.dev]`에 정의된 별도 D1(`sonett-db-dev`)/R2(`sonett-images-dev`)를
  쓰며, 로컬 D1 명령(`wrangler d1 execute ... --local`)도 마찬가지로 실제 원격 DB를 건드리지 않는다.
- 자세한 설정/생성 절차는 README.md의 "로컬 개발 환경 (Worker / D1 / R2)" 섹션 참고.
