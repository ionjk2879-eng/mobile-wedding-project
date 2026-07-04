// 로컬 개발/테스트용: .dev.vars의 JWT_SECRET으로 worker.ts의 signJWT와 완전히 동일한
// 방식(HS256, 커스텀 base64url 인코딩)으로 서명한 로그인 토큰을 발급한다.
// 브라우저 localStorage에 그대로 넣으면 실제 로그인한 것처럼 소유자 인증이 필요한
// 화면/기능을 테스트할 수 있다. 프로덕션 시크릿과는 무관 — .dev.vars는 로컬 전용 파일.
//
// 사용법: node --experimental-strip-types scripts/make-test-token.ts <uid> <name> <email> [photo]
// 또는:   npm run make-token -- <uid> <name> <email>

import { readFileSync } from 'node:fs';

function readDevVar(key: string): string {
  let content: string;
  try {
    content = readFileSync('.dev.vars', 'utf-8');
  } catch {
    throw new Error('.dev.vars 파일이 없습니다. 프로젝트 루트에 JWT_SECRET을 넣은 .dev.vars를 먼저 만드세요 (README.md 참고).');
  }
  const line = content.split('\n').find((l) => l.trim().startsWith(`${key}=`));
  if (!line) throw new Error(`.dev.vars에 ${key}가 없습니다.`);
  return line.slice(line.indexOf('=') + 1).trim();
}

// --- 아래 두 함수는 worker.ts의 b64url/signJWT와 반드시 동일해야 한다 ---
function b64url(data: string | ArrayBuffer): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return Buffer.from(binary, 'binary').toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${body}`));
  return `${header}.${body}.${b64url(sig)}`;
}
// --- 여기까지 ---

const [, , uid, name, email, photo = ''] = process.argv;

if (!uid || !name || !email) {
  console.error('사용법: node --experimental-strip-types scripts/make-test-token.ts <uid> <name> <email> [photo]');
  process.exit(1);
}

const secret = readDevVar('JWT_SECRET');
// worker.ts의 issueToken과 동일하게 7일 유효
const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
const token = await signJWT({ uid, name, email, photo, exp }, secret);

console.log('--- 발급된 토큰 ---');
console.log(token);
console.log();
console.log('--- 브라우저 콘솔에 붙여넣기 ---');
console.log(`localStorage.setItem('sonett_token', '${token}');`);
console.log(`localStorage.setItem('sonett_user', JSON.stringify({`);
console.log(`  uid: ${JSON.stringify(uid)}, name: ${JSON.stringify(name)}, email: ${JSON.stringify(email)}, photo: ${JSON.stringify(photo)}`);
console.log(`}));`);
