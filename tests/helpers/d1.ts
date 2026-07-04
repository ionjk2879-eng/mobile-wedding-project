import { execSync } from 'node:child_process';
import { writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// 로컬 시뮬레이션 dev D1(sonett-db-dev)에만 접근한다 — 프로덕션 D1과는 완전히 분리된 리소스.
// SQL을 커맨드라인 인자로 넘기면 셸(bash/cmd)마다 따옴표 처리 방식이 달라 깨지기 쉬우므로,
// 항상 임시 .sql 파일에 써서 --file로 넘긴다.
function runD1(sql: string, json: boolean): string {
  const dir = mkdtempSync(join(tmpdir(), 'sonett-test-'));
  const file = join(dir, 'q.sql');
  writeFileSync(file, sql);
  try {
    return execSync(
      `npx wrangler d1 execute sonett-db-dev --env dev --local ${json ? '--json' : ''} --file "${file}"`,
      { encoding: 'utf-8' }
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function d1Exec(sql: string): void {
  runD1(sql, false);
}

export function d1Query<T = Record<string, unknown>>(sql: string): T[] {
  const out = runD1(sql, true);
  const parsed = JSON.parse(out) as { results: T[] }[];
  return parsed[0]?.results ?? [];
}
