// wrangler dev는 [assets] 디렉터리가 실제로 존재하지 않으면 부팅 자체를 거부한다.
// 테스트는 빌드 전에 돌리므로(dist가 아직 없을 수 있음), 최소 placeholder만 만들어 넣는다.
// 이미 실제 빌드 결과물(dist)이 있으면 절대 건드리지 않는다.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
  writeFileSync('dist/index.html', '<!doctype html><title>test placeholder</title>');
}
