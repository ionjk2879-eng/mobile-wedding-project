interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  DB: D1Database;
  IMAGES: R2Bucket;
  JWT_SECRET: string;
  KAKAO_REST_API_KEY: string;
  KAKAO_CLIENT_SECRET: string;
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  RESEND_API_KEY?: string;
}

// --- JWT HS256 ---

function b64url(data: string | ArrayBuffer): string {
  const bytes = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : new Uint8Array(data as ArrayBuffer);
  const binary = Array.from(bytes, b => String.fromCharCode(b)).join('');
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64decodeBytes(str: string): Uint8Array {
  const binary = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function b64decode(str: string): string {
  return new TextDecoder().decode(b64decodeBytes(str));
}

async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${body}`));
  return `${header}.${body}.${b64url(sig)}`;
}

async function verifyJWT(token: string, secret: string): Promise<Record<string, unknown> | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sigStr] = parts;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sigBytes = b64decodeBytes(sigStr);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(`${header}.${body}`));
    if (!valid) return null;
    const payload = JSON.parse(b64decode(body));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function getAuthUser(request: Request, env: Env): Promise<{ uid: string; name: string; email: string; photo: string } | null> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const payload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
  if (!payload?.uid) return null;
  return { uid: payload.uid as string, name: payload.name as string, email: payload.email as string, photo: payload.photo as string };
}

async function issueToken(env: Env, uid: string, name: string, email: string, photo: string): Promise<string> {
  return signJWT({ uid, name, email, photo, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 }, env.JWT_SECRET);
}

// --- CORS & helpers ---

function cors(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(data: unknown, status = 200, origin = '*'): Response {
  return Response.json(data, { status, headers: cors(origin) });
}

// --- D1 helpers ---

async function upsertUser(env: Env, uid: string, provider: string, name: string, email: string, photo: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO users (uid, provider, name, email, photo)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(uid) DO UPDATE SET name = excluded.name, email = excluded.email, photo = excluded.photo`
  ).bind(uid, provider, name, email, photo).run();
}

function weddingPlusOneYear(iso: string): string {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

// 기념일 모드 개인정보 전환 예정일 기본값(결혼식 3주 후). 신랑신부가 관리 페이지에서
// 수동으로 조정한 뒤에는(privacy_transition_date가 이미 채워진 뒤에는) 다시 계산하지 않는다.
function weddingPlus21Days(iso: string): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + 21);
  return d.toISOString();
}

// 계좌/RSVP 노출 여부의 최종 판단.
// override가 NULL이 아니면(신랑신부가 명시적으로 0 또는 1로 설정) 날짜와 무관하게 그 값을 그대로 따른다.
// override가 NULL이면(아직 아무도 안 건드림) privacy_transition_date를 기준으로 자동 판단한다 —
// 날짜가 없으면 항상 공개, 있으면 그 날짜가 지났는지로 결정한다.
function computeEffectiveVisibility(override: number | null | undefined, transitionDate: string | null | undefined): boolean {
  if (override !== null && override !== undefined) return override === 1;
  if (!transitionDate) return true;
  return new Date(transitionDate).getTime() > Date.now();
}

// --- Auth handlers ---

async function handleGoogleAuth(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)
    return json({ error: 'Google OAuth가 설정되지 않았습니다.' }, 503, origin);

  const body = await request.json() as { code?: string; redirectUri?: string };
  if (!body.code || !body.redirectUri) return json({ error: 'code and redirectUri are required' }, 400, origin);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code: body.code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: body.redirectUri, grant_type: 'authorization_code' }),
  });
  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    console.error('[Google Auth Error]', detail, 'redirect_uri:', body.redirectUri);
    return json({ error: '구글 인증에 실패했습니다.', detail }, 401, origin);
  }
  const { access_token } = await tokenRes.json() as { access_token: string };

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!profileRes.ok) return json({ error: '구글 프로필 조회에 실패했습니다.' }, 401, origin);
  const profile = await profileRes.json() as { id: string; name?: string; email?: string; picture?: string };

  const uid = `google_${profile.id}`;
  const name = profile.name || '';
  const email = profile.email || '';
  const photo = profile.picture || '';

  await upsertUser(env, uid, 'google', name, email, photo);
  const token = await issueToken(env, uid, name, email, photo);
  return json({ token, uid, name, email, photo }, 200, origin);
}

async function handleKakaoAuth(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const body = await request.json() as { code?: string; redirectUri?: string };
  if (!body.code || !body.redirectUri) return json({ error: 'code and redirectUri are required' }, 400, origin);

  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', client_id: env.KAKAO_REST_API_KEY || '7edc2c74f346bfad9c9006cd26d04e3c', client_secret: env.KAKAO_CLIENT_SECRET, redirect_uri: body.redirectUri, code: body.code }),
  });
  if (!tokenRes.ok) return json({ error: '카카오 인증에 실패했습니다.', detail: await tokenRes.text() }, 401, origin);
  const { access_token } = await tokenRes.json() as { access_token: string };

  const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!profileRes.ok) return json({ error: '카카오 프로필 조회에 실패했습니다.' }, 401, origin);
  const profile = await profileRes.json() as { id: number; kakao_account?: { profile?: { nickname?: string; profile_image_url?: string }; email?: string } };

  const uid = `kakao_${profile.id}`;
  const kp = profile.kakao_account?.profile || {};
  const name = kp.nickname || '';
  const email = profile.kakao_account?.email || '';
  const photo = kp.profile_image_url || '';

  await upsertUser(env, uid, 'kakao', name, email, photo);
  const token = await issueToken(env, uid, name, email, photo);
  return json({ token, uid, name, email, photo }, 200, origin);
}

async function handleNaverAuth(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const body = await request.json() as { code?: string; state?: string };
  if (!body.code) return json({ error: 'code is required' }, 400, origin);

  const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', client_id: env.NAVER_CLIENT_ID, client_secret: env.NAVER_CLIENT_SECRET, code: body.code, state: body.state || '' }),
  });
  if (!tokenRes.ok) return json({ error: '네이버 인증에 실패했습니다.' }, 401, origin);
  const { access_token } = await tokenRes.json() as { access_token: string };

  const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!profileRes.ok) return json({ error: '네이버 프로필 조회에 실패했습니다.' }, 401, origin);
  const pd = await profileRes.json() as { response?: { id?: string; name?: string; nickname?: string; email?: string; profile_image?: string } };
  const np = pd.response || {};

  const uid = `naver_${np.id}`;
  const name = np.nickname || np.name || '';
  const email = np.email || '';
  const photo = np.profile_image || '';

  await upsertUser(env, uid, 'naver', name, email, photo);
  const token = await issueToken(env, uid, name, email, photo);
  return json({ token, uid, name, email, photo }, 200, origin);
}

// --- Invitations API ---

async function handleInvitations(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401, origin);

  const rows = await env.DB.prepare(
    'SELECT slug, owner_uid, data, is_paid, expires_at FROM invitations WHERE owner_uid = ? ORDER BY updated_at DESC'
  ).bind(user.uid).all();

  return json(rows.results.map((r: Record<string, unknown>) => ({
    slug: r.slug,
    data: { ...JSON.parse(r.data as string), slug: r.slug, ownerUid: r.owner_uid, expiresAt: r.expires_at ?? null, isPaid: !!r.is_paid },
  })), 200, origin);
}

async function handleInvitation(request: Request, env: Env, slug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const method = request.method;

  if (method === 'GET') {
    const row = await env.DB.prepare(
      'SELECT owner_uid, data, is_paid, expires_at, privacy_transition_date, account_info_visible_override, rsvp_form_open_override FROM invitations WHERE slug = ?'
    ).bind(slug).first();
    if (!row) return json(null, 404, origin);

    const data = JSON.parse(row.data as string);

    // 개인정보 전환 정책은 하객이 보는 화면에만 적용한다 — 청첩장 소유자 본인이 로그인해서
    // 조회하는 경우(에디터, 관리 페이지)는 이 필터링과 무관하게 항상 전체 데이터를 본다.
    const requester = await getAuthUser(request, env);
    const isOwnerRequest = !!requester && requester.uid === row.owner_uid;
    if (!isOwnerRequest) {
      if (!computeEffectiveVisibility(row.account_info_visible_override as number | null, row.privacy_transition_date as string | null)) {
        data.accounts = [];
      }
      if (!computeEffectiveVisibility(row.rsvp_form_open_override as number | null, row.privacy_transition_date as string | null)) {
        data.isRSVPEnabled = false;
      }
    }

    return json({ ...data, slug, ownerUid: row.owner_uid, isPaid: !!row.is_paid, expiresAt: row.expires_at ?? null }, 200, origin);
  }

  const user = await getAuthUser(request, env);
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401, origin);

  if (method === 'PUT') {
    const body = await request.json() as Record<string, unknown>;
    const existing = await env.DB.prepare('SELECT owner_uid, is_paid, expires_at, privacy_transition_date FROM invitations WHERE slug = ?').bind(slug).first();
    if (existing && existing.owner_uid !== user.uid) return json({ error: '권한이 없습니다.' }, 403, origin);

    // isPaid는 클라이언트 입력(body.isPaid)을 절대 신뢰하지 않고 DB에 이미 저장된 값만 유지한다.
    // 유료 전환은 오직 handleActivate(슈퍼관리자 전용, 결제 확인 후 수동 처리)를 통해서만 가능하다.
    const isPaid = !!existing?.is_paid;
    let expiresAt: string | null;
    if (existing && isPaid && existing.expires_at) {
      // 기존 유료: 만료일 보존
      expiresAt = existing.expires_at as string;
    } else if (existing && !isPaid && existing.expires_at) {
      // 기존 미결제 수정: 최초 생성 시점 기준 만료일 유지 (편집할 때마다 리셋 방지)
      expiresAt = existing.expires_at as string;
    } else {
      // 최초 생성(미결제): 지금부터 7일
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    // privacy_transition_date는 한 번 채워지면(자동 계산이든, 관리 페이지에서 수동 조정이든)
    // weddingDateISO가 나중에 바뀌어도 다시 계산하지 않는다 — 여기선 값이 비어있을 때만 채운다.
    const weddingDateISO = typeof body.weddingDateISO === 'string' ? body.weddingDateISO : '';
    const privacyTransitionDate = existing?.privacy_transition_date
      ?? (weddingDateISO ? weddingPlus21Days(weddingDateISO) : null);

    await env.DB.prepare(
      `INSERT INTO invitations (slug, owner_uid, data, is_paid, expires_at, privacy_transition_date, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(slug) DO UPDATE SET data = excluded.data, is_paid = excluded.is_paid, expires_at = excluded.expires_at, privacy_transition_date = excluded.privacy_transition_date, updated_at = excluded.updated_at`
    ).bind(slug, user.uid, JSON.stringify(body), isPaid ? 1 : 0, expiresAt, privacyTransitionDate).run();

    return json({ ok: true }, 200, origin);
  }

  if (method === 'DELETE') {
    const existing = await env.DB.prepare('SELECT owner_uid FROM invitations WHERE slug = ?').bind(slug).first();
    if (!existing) return json({ error: '청첩장을 찾을 수 없습니다.' }, 404, origin);
    if (existing.owner_uid !== user.uid) return json({ error: '권한이 없습니다.' }, 403, origin);
    await env.DB.batch([
      env.DB.prepare('DELETE FROM guestbook WHERE invitation_slug = ?').bind(slug),
      env.DB.prepare('DELETE FROM rsvp WHERE invitation_slug = ?').bind(slug),
      env.DB.prepare('DELETE FROM guests WHERE invitation_slug = ?').bind(slug),
      env.DB.prepare('DELETE FROM invitations WHERE slug = ?').bind(slug),
    ]);
    return json({ ok: true }, 200, origin);
  }

  return json({ error: 'Method not allowed' }, 405, origin);
}

async function handleSlugAvailable(request: Request, env: Env, slug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const user = await getAuthUser(request, env);
  const row = await env.DB.prepare('SELECT owner_uid FROM invitations WHERE slug = ?').bind(slug).first();
  if (!row) return json({ available: true }, 200, origin);
  return json({ available: user ? row.owner_uid === user.uid : false }, 200, origin);
}

async function handleChangeSlug(request: Request, env: Env, oldSlug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401, origin);

  const body = await request.json() as { newSlug?: string };
  if (!body.newSlug) return json({ error: 'newSlug is required' }, 400, origin);
  const newSlug = body.newSlug;

  const oldRow = await env.DB.prepare('SELECT owner_uid, data, is_paid, expires_at, privacy_transition_date, account_info_visible_override, rsvp_form_open_override FROM invitations WHERE slug = ?').bind(oldSlug).first();
  if (!oldRow) return json({ error: '기존 청첩장을 찾을 수 없습니다.' }, 404, origin);
  if (oldRow.owner_uid !== user.uid) return json({ error: '권한이 없습니다.' }, 403, origin);

  const newRow = await env.DB.prepare('SELECT slug FROM invitations WHERE slug = ?').bind(newSlug).first();
  if (newRow) return json({ error: '이미 사용 중인 주소입니다.' }, 409, origin);

  const data = JSON.parse(oldRow.data as string);
  data.slug = newSlug;

  await env.DB.batch([
    // slug 변경은 새 행을 만들고 기존 행을 지우는 방식이라, 개인정보 전환 관련 컬럼도
    // 명시적으로 옮기지 않으면 신랑신부가 수동으로 설정해둔 override(0/1)가 유실되고 NULL(자동 판단)로 되돌아간다.
    env.DB.prepare(
      'INSERT INTO invitations (slug, owner_uid, data, is_paid, expires_at, privacy_transition_date, account_info_visible_override, rsvp_form_open_override) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(newSlug, user.uid, JSON.stringify(data), oldRow.is_paid, oldRow.expires_at, oldRow.privacy_transition_date, oldRow.account_info_visible_override, oldRow.rsvp_form_open_override),
    env.DB.prepare('UPDATE guestbook SET invitation_slug = ? WHERE invitation_slug = ?').bind(newSlug, oldSlug),
    env.DB.prepare('UPDATE rsvp SET invitation_slug = ? WHERE invitation_slug = ?').bind(newSlug, oldSlug),
    env.DB.prepare('UPDATE guests SET invitation_slug = ? WHERE invitation_slug = ?').bind(newSlug, oldSlug),
    env.DB.prepare('DELETE FROM invitations WHERE slug = ?').bind(oldSlug),
  ]);

  return json({ ok: true }, 200, origin);
}

async function handleActivate(request: Request, env: Env, slug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const user = await getAuthUser(request, env);
  // 결제 확인 후 유료 전환은 슈퍼관리자만 수행할 수 있다 (SuperAdminPage 전용 기능).
  // 관리자는 청첩장 소유자가 아니므로 소유권 체크가 아니라 관리자 이메일로 검증한다.
  if (!user || user.email !== 'ionjk2879@gmail.com')
    return json({ error: '권한이 없습니다.' }, 403, origin);

  const row = await env.DB.prepare('SELECT data FROM invitations WHERE slug = ?').bind(slug).first();
  if (!row) return json({ error: '청첩장을 찾을 수 없습니다.' }, 404, origin);

  const body = await request.json() as { weddingDateISO?: string };
  if (!body.weddingDateISO) return json({ error: 'weddingDateISO is required' }, 400, origin);

  const expiresAt = weddingPlusOneYear(body.weddingDateISO);
  const data = JSON.parse(row.data as string);
  data.isPaid = true;
  data.expiresAt = expiresAt;

  await env.DB.prepare(
    `UPDATE invitations SET is_paid = 1, expires_at = ?, data = ?, updated_at = datetime('now') WHERE slug = ?`
  ).bind(expiresAt, JSON.stringify(data), slug).run();

  return json({ ok: true, expiresAt }, 200, origin);
}

// 기념일 모드 개인정보 전환 설정 — 청첩장 소유자 전용 (관리 페이지)
async function handlePrivacySettings(request: Request, env: Env, slug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const auth = await requireInvitationOwner(request, env, slug);
  if ('error' in auth) return auth.error;

  if (request.method === 'GET') {
    const row = await env.DB.prepare(
      'SELECT privacy_transition_date, account_info_visible_override, rsvp_form_open_override FROM invitations WHERE slug = ?'
    ).bind(slug).first();
    if (!row) return json({ error: '청첩장을 찾을 수 없습니다.' }, 404, origin);

    const transitionDate = (row.privacy_transition_date as string | null) ?? null;
    const isPastTransition = !!transitionDate && new Date(transitionDate).getTime() <= Date.now();

    return json({
      privacyTransitionDate: transitionDate,
      isPastTransition,
      accountInfoVisibleOverride: (row.account_info_visible_override as number | null) ?? null,
      rsvpFormOpenOverride: (row.rsvp_form_open_override as number | null) ?? null,
    }, 200, origin);
  }

  if (request.method === 'PUT') {
    const body = await request.json() as {
      privacyTransitionDate?: string | null;
      accountInfoVisibleOverride?: 0 | 1 | null;
      rsvpFormOpenOverride?: 0 | 1 | null;
    };

    const isValidOverride = (v: unknown) => v === null || v === 0 || v === 1;

    const sets: string[] = [];
    const binds: unknown[] = [];

    // 각 필드가 body에 아예 없으면(undefined) 건드리지 않고, null이 명시적으로 오면
    // "자동으로 전환"(override를 NULL로 되돌림)으로 처리한다 — 요청에 없는 값과
    // 명시적으로 null인 값을 구분하기 위해 in 연산자로 키 존재 여부를 확인한다.
    if ('privacyTransitionDate' in body) {
      sets.push('privacy_transition_date = ?');
      binds.push(body.privacyTransitionDate ?? null);
    }
    if ('accountInfoVisibleOverride' in body) {
      if (!isValidOverride(body.accountInfoVisibleOverride)) return json({ error: 'accountInfoVisibleOverride must be 0, 1, or null' }, 400, origin);
      sets.push('account_info_visible_override = ?');
      binds.push(body.accountInfoVisibleOverride);
    }
    if ('rsvpFormOpenOverride' in body) {
      if (!isValidOverride(body.rsvpFormOpenOverride)) return json({ error: 'rsvpFormOpenOverride must be 0, 1, or null' }, 400, origin);
      sets.push('rsvp_form_open_override = ?');
      binds.push(body.rsvpFormOpenOverride);
    }

    if (sets.length === 0) return json({ error: '변경할 값이 없습니다.' }, 400, origin);

    binds.push(slug);
    await env.DB.prepare(`UPDATE invitations SET ${sets.join(', ')} WHERE slug = ?`).bind(...binds).run();
    return json({ ok: true }, 200, origin);
  }

  return json({ error: 'Method not allowed' }, 405, origin);
}

// --- Posts API ---

async function handlePostsPublic(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const where = type ? 'WHERE type = ?' : '';
  const params = type ? [type] : [];
  const rows = await env.DB.prepare(
    `SELECT id, type, tag, title, content, created_at, updated_at FROM posts ${where} ORDER BY created_at DESC`
  ).bind(...params).all();
  return json(rows.results, 200, origin);
}

async function handleAdminPosts(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const user = await getAuthUser(request, env);
  if (!user || user.email !== 'ionjk2879@gmail.com')
    return json({ error: '권한이 없습니다.' }, 403, origin);

  if (request.method === 'GET') {
    const rows = await env.DB.prepare(
      'SELECT id, type, tag, title, content, created_at, updated_at FROM posts ORDER BY created_at DESC'
    ).all();
    return json(rows.results, 200, origin);
  }

  if (request.method === 'POST') {
    const body = await request.json() as { type?: string; tag?: string; title?: string; content?: string };
    if (!body.type || !body.title) return json({ error: 'type과 title은 필수입니다.' }, 400, origin);
    const result = await env.DB.prepare(
      'INSERT INTO posts (type, tag, title, content) VALUES (?, ?, ?, ?)'
    ).bind(body.type, body.tag || '공지', body.title, body.content || '').run();
    return json({ id: result.meta.last_row_id }, 201, origin);
  }

  return json({ error: 'Method Not Allowed' }, 405, origin);
}

async function handleAdminPost(request: Request, env: Env, id: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const user = await getAuthUser(request, env);
  if (!user || user.email !== 'ionjk2879@gmail.com')
    return json({ error: '권한이 없습니다.' }, 403, origin);

  if (request.method === 'PUT') {
    const body = await request.json() as { type?: string; tag?: string; title?: string; content?: string };
    await env.DB.prepare(
      `UPDATE posts SET type = COALESCE(?, type), tag = COALESCE(?, tag), title = COALESCE(?, title),
       content = COALESCE(?, content), updated_at = datetime('now') WHERE id = ?`
    ).bind(body.type ?? null, body.tag ?? null, body.title ?? null, body.content ?? null, id).run();
    return json({ ok: true }, 200, origin);
  }

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    return json({ ok: true }, 200, origin);
  }

  return json({ error: 'Method Not Allowed' }, 405, origin);
}

// --- Admin API ---

async function handleAdminInvitations(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const user = await getAuthUser(request, env);
  if (!user || user.email !== 'ionjk2879@gmail.com')
    return json({ error: '권한이 없습니다.' }, 403, origin);

  const url = new URL(request.url);
  const filter = url.searchParams.get('filter') || 'all';
  const q = url.searchParams.get('q') || '';

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filter === 'unpaid') conditions.push('i.is_paid = 0');
  else if (filter === 'paid') conditions.push('i.is_paid = 1');

  if (q) {
    conditions.push('(i.slug LIKE ? OR u.email LIKE ? OR u.name LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await env.DB.prepare(
    `SELECT i.slug, i.is_paid, i.expires_at, i.created_at, i.data,
            u.email AS owner_email, u.name AS owner_name
     FROM invitations i
     LEFT JOIN users u ON i.owner_uid = u.uid
     ${where}
     ORDER BY i.created_at DESC
     LIMIT 200`
  ).bind(...params).all();

  return json(rows.results.map((r: Record<string, unknown>) => {
    const d = JSON.parse(r.data as string);
    return {
      slug: r.slug,
      ownerEmail: r.owner_email,
      ownerName: r.owner_name,
      isPaid: !!r.is_paid,
      expiresAt: r.expires_at,
      createdAt: r.created_at,
      groomName: d.groomName || '',
      brideName: d.brideName || '',
      date: d.date || '',
      weddingDateISO: d.weddingDateISO || '',
    };
  }), 200, origin);
}

// --- Guestbook API ---

async function handleGuestbook(request: Request, env: Env, slug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';

  if (request.method === 'GET') {
    const rows = await env.DB.prepare(
      'SELECT id, name, content, side, created_at FROM guestbook WHERE invitation_slug = ? ORDER BY created_at DESC'
    ).bind(slug).all();
    return json(rows.results.map((r: Record<string, unknown>) => ({
      id: r.id, name: r.name, content: r.content, side: r.side, createdAt: r.created_at,
    })), 200, origin);
  }

  if (request.method === 'POST') {
    const body = await request.json() as { name?: string; content?: string; password?: string; side?: string };
    if (!body.name || !body.content || !body.password || !body.side)
      return json({ error: 'All fields are required' }, 400, origin);
    const id = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO guestbook (id, invitation_slug, name, content, password, side) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, slug, body.name, body.content, body.password, body.side).run();
    sendGuestbookNotification(env, slug, body.name, body.content, body.side).catch(() => {});
    return json({ ok: true, id }, 200, origin);
  }

  return json({ error: 'Method not allowed' }, 405, origin);
}

async function handleGuestbookDelete(request: Request, env: Env, slug: string, messageId: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const body = await request.json() as { password?: string };
  if (!body.password) return json({ error: 'password is required' }, 400, origin);

  const row = await env.DB.prepare('SELECT password FROM guestbook WHERE id = ? AND invitation_slug = ?').bind(messageId, slug).first();
  if (!row) return json({ ok: false, error: '메시지를 찾을 수 없습니다.' }, 404, origin);

  // Allow deletion with message password OR invitation guestbook admin password
  if (row.password !== body.password) {
    const inv = await env.DB.prepare('SELECT data FROM invitations WHERE slug = ?').bind(slug).first();
    const adminPassword = inv ? (JSON.parse(inv.data as string).guestbookPassword as string | undefined) : undefined;
    if (!adminPassword || adminPassword !== body.password) {
      return json({ ok: false, error: '비밀번호가 올바르지 않습니다.' }, 403, origin);
    }
  }

  await env.DB.prepare('DELETE FROM guestbook WHERE id = ?').bind(messageId).run();
  return json({ ok: true }, 200, origin);
}

// --- RSVP API ---

async function handleRSVP(request: Request, env: Env, slug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';

  if (request.method === 'GET') {
    const user = await getAuthUser(request, env);
    if (!user) return json({ error: '로그인이 필요합니다.' }, 401, origin);
    const inv = await env.DB.prepare('SELECT owner_uid FROM invitations WHERE slug = ?').bind(slug).first();
    if (!inv || inv.owner_uid !== user.uid) return json({ error: '권한이 없습니다.' }, 403, origin);

    const rows = await env.DB.prepare(
      'SELECT id, guest_name, is_attending, total_guests, wants_meal, relation, message, created_at, guest_code FROM rsvp WHERE invitation_slug = ? ORDER BY created_at DESC'
    ).bind(slug).all();
    return json(rows.results.map((r: Record<string, unknown>) => ({
      id: r.id, guestName: r.guest_name, isAttending: !!r.is_attending,
      totalGuests: r.total_guests, wantsMeal: !!r.wants_meal,
      relation: r.relation, message: r.message, createdAt: r.created_at,
      guestCode: r.guest_code ?? null,
    })), 200, origin);
  }

  if (request.method === 'POST') {
    // RSVP 폼이 전환 정책에 의해 닫혀 있으면(화면에서 숨겼는지와 무관하게) 제출 자체를 막는다.
    // 클라이언트가 폼을 우회해 직접 이 API를 호출해도 서버에서 최종적으로 거부된다.
    const inv = await env.DB.prepare('SELECT privacy_transition_date, rsvp_form_open_override FROM invitations WHERE slug = ?').bind(slug).first();
    if (!inv) return json({ error: '청첩장을 찾을 수 없습니다.' }, 404, origin);
    if (!computeEffectiveVisibility(inv.rsvp_form_open_override as number | null, inv.privacy_transition_date as string | null)) {
      return json({ error: 'RSVP 응답 접수가 마감되었습니다.' }, 403, origin);
    }

    const body = await request.json() as { guestName?: string; isAttending?: boolean; totalGuests?: number; wantsMeal?: boolean; relation?: string; message?: string; guestCode?: string; deviceToken?: string };
    if (!body.guestName || !body.relation) return json({ error: 'Required fields missing' }, 400, origin);

    // guestCode는 클라이언트가 임의로 지정할 수 있으므로, 실제로 이 청첩장에 속한 하객 code인지 검증 후에만 저장
    let guestCode: string | null = null;
    if (body.guestCode) {
      const guestRow = await env.DB.prepare('SELECT code FROM guests WHERE code = ? AND invitation_slug = ?').bind(body.guestCode, slug).first();
      if (guestRow) guestCode = body.guestCode;
    }

    // id는 반드시 invitation_slug로 스코프한다 — 그렇지 않으면 서로 다른 청첩장에
    // 같은 이름의 하객이 있을 때 id가 전역으로 충돌해 응답이 서로 덮어써진다.
    // 개인화 링크(guestCode 검증됨)로 들어온 경우엔 이름 대신 code로 식별해
    // 같은 청첩장 내 동명이인끼리도 충돌하지 않도록 한다.
    // 공개 링크(이름 직접 입력)의 경우, 클라이언트가 보낸 브라우저 고정 deviceToken을
    // id에 섞어서 "같은 브라우저 재제출=수정" / "다른 브라우저의 동명이인=별도 응답"을 구분한다.
    const nameId = body.guestName.trim().replace(/\s+/g, '_');
    const deviceToken = (body.deviceToken || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
    const id = guestCode
      ? `${slug}::code::${guestCode}`
      : deviceToken
        ? `${slug}::${nameId}::${deviceToken}`
        : `${slug}::${nameId}`;
    await env.DB.prepare(
      `INSERT INTO rsvp (id, invitation_slug, guest_name, is_attending, total_guests, wants_meal, relation, message, guest_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET is_attending = excluded.is_attending, total_guests = excluded.total_guests, wants_meal = excluded.wants_meal, message = excluded.message, guest_code = excluded.guest_code`
    ).bind(id, slug, body.guestName, body.isAttending ? 1 : 0, body.totalGuests ?? 1, body.wantsMeal ? 1 : 0, body.relation, body.message || '', guestCode).run();
    sendRsvpNotification(env, slug, body.guestName, body.isAttending ?? false, body.totalGuests ?? 1, body.relation, body.message || '').catch(() => {});
    return json({ ok: true }, 200, origin);
  }

  return json({ error: 'Method not allowed' }, 405, origin);
}

// --- Guests API (하객 개인화 링크) ---

const GUEST_RELATIONS = ['family', 'friend', 'coworker', 'other'] as const;

function normalizeGuestRelation(relation: unknown): typeof GUEST_RELATIONS[number] {
  return (GUEST_RELATIONS as readonly string[]).includes(relation as string) ? relation as typeof GUEST_RELATIONS[number] : 'other';
}

// Crockford Base32 alphabet (헷갈리기 쉬운 i/l/o/u 제외) — 32는 256의 약수라 바이트→문자 매핑에 편향이 없음
const GUEST_CODE_ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz';

function generateGuestCode(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => GUEST_CODE_ALPHABET[b % 32]).join('');
}

// relation당 준비된 오프닝 문구 배리에이션 개수 — src/utils/guestOpeningTemplates.ts의 배열 길이와 반드시 일치해야 함
// (worker.ts는 다른 파일을 import하지 않는 독립 파일이라 텍스트 자체가 아닌 개수만 여기서 중복 관리)
const GUEST_MESSAGE_TEMPLATE_COUNT = 4;

async function requireInvitationOwner(request: Request, env: Env, slug: string): Promise<{ error: Response } | { user: { uid: string } }> {
  const origin = request.headers.get('Origin') || '*';
  const user = await getAuthUser(request, env);
  if (!user) return { error: json({ error: '로그인이 필요합니다.' }, 401, origin) };
  const inv = await env.DB.prepare('SELECT owner_uid FROM invitations WHERE slug = ?').bind(slug).first();
  if (!inv || inv.owner_uid !== user.uid) return { error: json({ error: '권한이 없습니다.' }, 403, origin) };
  return { user };
}

async function handleGuests(request: Request, env: Env, slug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const auth = await requireInvitationOwner(request, env, slug);
  if ('error' in auth) return auth.error;

  if (request.method === 'GET') {
    const rows = await env.DB.prepare(
      'SELECT code, name, relation, created_at, visited_at FROM guests WHERE invitation_slug = ? ORDER BY created_at DESC'
    ).bind(slug).all();
    return json(rows.results.map((r: Record<string, unknown>) => ({
      code: r.code, name: r.name, relation: r.relation, createdAt: r.created_at, visitedAt: r.visited_at ?? null,
    })), 200, origin);
  }

  if (request.method === 'POST') {
    const body = await request.json() as { name?: string; relation?: string };
    const name = body.name?.trim();
    if (!name) return json({ error: '이름을 입력해주세요.' }, 400, origin);
    const relation = normalizeGuestRelation(body.relation);

    let code = generateGuestCode();
    for (let i = 0; i < 5; i++) {
      const exists = await env.DB.prepare('SELECT 1 FROM guests WHERE code = ?').bind(code).first();
      if (!exists) break;
      code = generateGuestCode();
    }

    await env.DB.prepare(
      'INSERT INTO guests (code, invitation_slug, name, relation) VALUES (?, ?, ?, ?)'
    ).bind(code, slug, name, relation).run();

    return json({ code, name, relation, createdAt: new Date().toISOString(), visitedAt: null }, 200, origin);
  }

  return json({ error: 'Method not allowed' }, 405, origin);
}

async function handleGuest(request: Request, env: Env, slug: string, code: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const auth = await requireInvitationOwner(request, env, slug);
  if ('error' in auth) return auth.error;

  const existing = await env.DB.prepare('SELECT code FROM guests WHERE code = ? AND invitation_slug = ?').bind(code, slug).first();
  if (!existing) return json({ error: '하객을 찾을 수 없습니다.' }, 404, origin);

  if (request.method === 'PUT') {
    const body = await request.json() as { name?: string; relation?: string };
    const name = body.name?.trim();
    if (!name) return json({ error: '이름을 입력해주세요.' }, 400, origin);
    const relation = normalizeGuestRelation(body.relation);
    await env.DB.prepare('UPDATE guests SET name = ?, relation = ? WHERE code = ?').bind(name, relation, code).run();
    return json({ ok: true }, 200, origin);
  }

  if (request.method === 'DELETE') {
    // FK가 실제로 강제되지 않으므로(PRAGMA foreign_keys 미설정), 하객 삭제 시
    // 연결된 RSVP 응답/갤러리 사진이 존재하지 않는 code를 가리키는 고아 레코드가 되지 않도록 수동으로 정리.
    // 갤러리 사진은 결혼식 당일의 실제 추억이라 하객 삭제(명단 정리 등)로 함께 지워지면 되돌릴 수 없으므로,
    // 사진(r2_key)은 그대로 두고 uploader_ref만 끊는다 (guest_name은 별도 컬럼이라 표시는 계속 유지됨).
    await env.DB.batch([
      env.DB.prepare('UPDATE rsvp SET guest_code = NULL WHERE guest_code = ?').bind(code),
      env.DB.prepare("UPDATE gallery_photos SET uploader_ref = NULL WHERE uploader_ref = ? AND uploader_type = 'guest_code'").bind(code),
      env.DB.prepare('DELETE FROM guests WHERE code = ?').bind(code),
    ]);
    return json({ ok: true }, 200, origin);
  }

  return json({ error: 'Method not allowed' }, 405, origin);
}

// 공개(비인증) 개인화 링크 조회 — /invite/{code} 진입 시 사용
async function handleInviteLookup(request: Request, env: Env, code: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  try {
    // 최초 방문이면 visited_at 기록 (이미 값이 있거나 code가 유효하지 않으면 WHERE 조건에 안 걸려 아무 변화 없음)
    await env.DB.prepare(
      "UPDATE guests SET visited_at = datetime('now') WHERE code = ? AND visited_at IS NULL"
    ).bind(code).run();

    const row = await env.DB.prepare('SELECT invitation_slug, name, relation, assigned_message_index FROM guests WHERE code = ?').bind(code).first();
    if (!row) return json({ error: '유효하지 않은 링크입니다.' }, 404, origin);

    let messageIndex = row.assigned_message_index as number | null;
    if (messageIndex === null || messageIndex === undefined) {
      // 최초 방문 시 relation 카테고리 내에서 랜덤 배리에이션을 뽑아 고정 (재접속해도 문구가 안 바뀌도록)
      const randomIndex = Math.floor(Math.random() * GUEST_MESSAGE_TEMPLATE_COUNT);
      await env.DB.prepare(
        'UPDATE guests SET assigned_message_index = ? WHERE code = ? AND assigned_message_index IS NULL'
      ).bind(randomIndex, code).run();
      const refreshed = await env.DB.prepare('SELECT assigned_message_index FROM guests WHERE code = ?').bind(code).first();
      messageIndex = (refreshed?.assigned_message_index as number | null) ?? randomIndex;
    }

    return json({ slug: row.invitation_slug, name: row.name, relation: row.relation, messageIndex }, 200, origin);
  } catch {
    return json({ error: '조회에 실패했습니다.' }, 500, origin);
  }
}

// --- Image Upload & Serve ---

// file.type/file.name은 클라이언트가 임의로 지정할 수 있으므로, 실제 이미지 MIME 타입
// 화이트리스트로만 저장을 허용한다. 그렇지 않으면 image/svg+xml 등으로 스크립트를 심어
// 업로드한 뒤 /images/{key}로 직접 접속시켰을 때 같은 오리진에서 실행되는 저장형 XSS로 이어질 수 있다.
const IMAGE_EXT_BY_TYPE: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401, origin);

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return json({ error: 'file is required' }, 400, origin);
  if (file.size > 2 * 1024 * 1024) return json({ error: '파일 크기는 2MB를 초과할 수 없습니다.' }, 400, origin);

  const ext = IMAGE_EXT_BY_TYPE[file.type];
  if (!ext) return json({ error: 'JPEG, PNG, WEBP, GIF 이미지 파일만 업로드할 수 있습니다.' }, 400, origin);

  const key = `${crypto.randomUUID()}.${ext}`;
  await env.IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type } });

  return json({ url: `/images/${key}` }, 200, origin);
}

async function handleImageGet(_request: Request, env: Env, key: string): Promise<Response> {
  const obj = await env.IMAGES.get(key);
  if (!obj) return new Response('Not found', { status: 404 });
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

// --- Wedding Live Gallery (하객 업로드 갤러리) ---

const GALLERY_PER_UPLOADER_LIMIT = 4;
const GALLERY_TOTAL_LIMIT = 250;
const GALLERY_MAX_FILE_SIZE = 5 * 1024 * 1024;

async function handleGalleryUpload(request: Request, env: Env, slug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';

  const inv = await env.DB.prepare('SELECT slug FROM invitations WHERE slug = ?').bind(slug).first();
  if (!inv) return json({ error: '청첩장을 찾을 수 없습니다.' }, 404, origin);

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return json({ error: 'file is required' }, 400, origin);
  if (file.size > GALLERY_MAX_FILE_SIZE) return json({ error: '파일 크기는 5MB를 초과할 수 없습니다.' }, 400, origin);

  const ext = IMAGE_EXT_BY_TYPE[file.type];
  if (!ext) return json({ error: 'JPEG, PNG, WEBP, GIF 이미지 파일만 업로드할 수 있습니다.' }, 400, origin);

  const guestCodeInput = ((formData.get('guestCode') as string | null) || '').trim();
  const deviceTokenInput = ((formData.get('deviceToken') as string | null) || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
  const nameInput = ((formData.get('guestName') as string | null) || '').trim().slice(0, 40);

  let uploaderType: 'guest_code' | 'token';
  let uploaderRef: string;
  let guestName: string;

  if (guestCodeInput) {
    // guestCode는 클라이언트가 임의로 지정할 수 있으므로, 실제로 이 청첩장에 속한 하객 code인지 검증 후에만 사용
    const guestRow = await env.DB.prepare('SELECT code, name FROM guests WHERE code = ? AND invitation_slug = ?').bind(guestCodeInput, slug).first();
    if (!guestRow) return json({ error: '유효하지 않은 하객 코드입니다.' }, 400, origin);
    uploaderType = 'guest_code';
    uploaderRef = guestCodeInput;
    guestName = (guestRow.name as string) || nameInput;
  } else {
    if (!deviceTokenInput) return json({ error: '업로더를 식별할 수 없습니다.' }, 400, origin);
    if (!nameInput) return json({ error: '이름을 입력해주세요.' }, 400, origin);
    uploaderType = 'token';
    uploaderRef = deviceTokenInput;
    guestName = nameInput;
  }

  // 인당 업로드 제한 (숨김 처리된 사진도 포함해서 카운트 — 신고로 숨겨도 제한을 우회하지 못하게)
  const perUploaderCount = await env.DB.prepare(
    'SELECT COUNT(*) as cnt FROM gallery_photos WHERE invitation_slug = ? AND uploader_type = ? AND uploader_ref = ?'
  ).bind(slug, uploaderType, uploaderRef).first();
  if (((perUploaderCount?.cnt as number) ?? 0) >= GALLERY_PER_UPLOADER_LIMIT) {
    return json({ error: `한 분당 최대 ${GALLERY_PER_UPLOADER_LIMIT}장까지 업로드할 수 있습니다.` }, 429, origin);
  }

  // 전체 총량 제한 — count 조회와 INSERT 사이에 원자성이 없어 동시 업로드가 몰리면 제한을
  // 살짝 넘길 수 있음(예: 301장). 결혼식 규모의 동시 접속에서는 영향이 미미해 트랜잭션으로
  // 막지 않고 감수하는 쪽을 택함. 정말 엄격한 제한이 필요해지면 재검토.
  const totalCount = await env.DB.prepare(
    'SELECT COUNT(*) as cnt FROM gallery_photos WHERE invitation_slug = ?'
  ).bind(slug).first();
  if (((totalCount?.cnt as number) ?? 0) >= GALLERY_TOTAL_LIMIT) {
    return json({ error: '갤러리 사진이 가득 찼습니다.' }, 429, origin);
  }

  const id = crypto.randomUUID();
  const r2Key = `gallery/${slug}/${id}.${ext}`;
  await env.IMAGES.put(r2Key, file.stream(), { httpMetadata: { contentType: file.type } });

  await env.DB.prepare(
    'INSERT INTO gallery_photos (id, invitation_slug, r2_key, uploader_type, uploader_ref, guest_name) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, slug, r2Key, uploaderType, uploaderRef, guestName || null).run();

  return json({ id, url: `/images/${r2Key}`, guestName: guestName || null, createdAt: new Date().toISOString(), mine: true }, 200, origin);
}

async function handleGalleryPhotos(request: Request, env: Env, slug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const url = new URL(request.url);
  const myGuestCode = (url.searchParams.get('guestCode') || '').trim();
  const myDeviceToken = (url.searchParams.get('deviceToken') || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);

  const rows = await env.DB.prepare(
    'SELECT id, r2_key, guest_name, created_at, uploader_type, uploader_ref FROM gallery_photos WHERE invitation_slug = ? AND hidden_at IS NULL ORDER BY created_at DESC'
  ).bind(slug).all();
  // uploader_ref(guest_code/토큰 원본값)는 절대 클라이언트에 노출하지 않고, 요청자가 보낸
  // 자신의 식별값과 일치하는지만 서버에서 비교해 mine 여부만 계산해 돌려준다.
  return json(rows.results.map((r: Record<string, unknown>) => {
    const mine =
      (!!myGuestCode && r.uploader_type === 'guest_code' && r.uploader_ref === myGuestCode) ||
      (!!myDeviceToken && r.uploader_type === 'token' && r.uploader_ref === myDeviceToken);
    return { id: r.id, url: `/images/${r.r2_key}`, guestName: r.guest_name ?? null, createdAt: r.created_at, mine };
  }), 200, origin);
}

async function handleGalleryPhotoDelete(request: Request, env: Env, slug: string, photoId: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const row = await env.DB.prepare(
    'SELECT invitation_slug, r2_key, uploader_type, uploader_ref FROM gallery_photos WHERE id = ?'
  ).bind(photoId).first();
  if (!row || row.invitation_slug !== slug) return json({ error: '사진을 찾을 수 없습니다.' }, 404, origin);

  const body = await request.json().catch(() => ({})) as { guestCode?: string; deviceToken?: string };

  let authorized = false;

  // 1) 청첩장 소유자(로그인) 확인
  const user = await getAuthUser(request, env);
  if (user) {
    const inv = await env.DB.prepare('SELECT owner_uid FROM invitations WHERE slug = ?').bind(slug).first();
    if (inv && inv.owner_uid === user.uid) authorized = true;
  }

  // 2) 업로더 본인 확인 — guest_code 또는 deviceToken이 저장된 uploader_ref와 정확히 일치할 때만.
  // 하객 삭제로 uploader_ref가 NULL이 된 사진은 이 경로로 삭제 불가(소유자만 삭제 가능)하도록 자연히 막힘.
  if (!authorized && row.uploader_ref) {
    if (row.uploader_type === 'guest_code' && body.guestCode && body.guestCode === row.uploader_ref) authorized = true;
    if (row.uploader_type === 'token' && body.deviceToken && body.deviceToken === row.uploader_ref) authorized = true;
  }

  if (!authorized) return json({ error: '삭제 권한이 없습니다.' }, 403, origin);

  await env.IMAGES.delete(row.r2_key as string);
  await env.DB.prepare('DELETE FROM gallery_photos WHERE id = ? AND invitation_slug = ?').bind(photoId, slug).run();
  return json({ ok: true }, 200, origin);
}

async function handleGalleryPhotoReport(request: Request, env: Env, slug: string, photoId: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  // 신고 1건만 접수돼도 즉시 숨김 처리(hidden_at 설정) — 오탐/악용은 신랑신부가 관리 페이지에서 검토
  await env.DB.prepare(
    "UPDATE gallery_photos SET hidden_at = datetime('now') WHERE id = ? AND invitation_slug = ? AND hidden_at IS NULL"
  ).bind(photoId, slug).run();
  return json({ ok: true }, 200, origin);
}

// 관리 페이지 전용 — 숨김 처리된 사진까지 전부 포함해서 반환 (청첩장 소유자만 접근 가능)
async function handleGalleryAdminList(request: Request, env: Env, slug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const auth = await requireInvitationOwner(request, env, slug);
  if ('error' in auth) return auth.error;

  const rows = await env.DB.prepare(
    'SELECT id, r2_key, guest_name, created_at, hidden_at FROM gallery_photos WHERE invitation_slug = ? ORDER BY created_at DESC'
  ).bind(slug).all();

  return json({
    photos: rows.results.map((r: Record<string, unknown>) => ({
      id: r.id, url: `/images/${r.r2_key}`, guestName: r.guest_name ?? null,
      createdAt: r.created_at, hiddenAt: r.hidden_at ?? null,
    })),
    total: rows.results.length,
    limit: GALLERY_TOTAL_LIMIT,
  }, 200, origin);
}

// 신고로 숨겨진 사진을 다시 공개 목록에 노출 (청첩장 소유자만)
async function handleGalleryPhotoUnhide(request: Request, env: Env, slug: string, photoId: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const auth = await requireInvitationOwner(request, env, slug);
  if ('error' in auth) return auth.error;

  await env.DB.prepare(
    'UPDATE gallery_photos SET hidden_at = NULL WHERE id = ? AND invitation_slug = ?'
  ).bind(photoId, slug).run();
  return json({ ok: true }, 200, origin);
}

// --- Cron: expiry notification + cleanup ---

async function sendExpiryNotificationEmail(env: Env, to: string, name: string, slug: string, expiresAt: string): Promise<void> {
  if (!env.RESEND_API_KEY) return;
  const expiryDate = new Date(expiresAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const inviteUrl = `https://sonett.kr/${slug}`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Sonett <noreply@sonett.kr>',
      to: [to],
      subject: '[Sonett] 청첩장이 7일 후 만료됩니다',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#333">
          <h2 style="font-size:20px;margin-bottom:8px">안녕하세요, ${name}님</h2>
          <p style="line-height:1.7;color:#555">
            Sonett에서 제작하신 청첩장이 <strong>${expiryDate}</strong>에 만료될 예정입니다.<br>
            만료 후에는 청첩장 링크가 더 이상 작동하지 않습니다.
          </p>
          <div style="margin:24px 0;padding:16px;background:#f9f5f0;border-radius:8px;text-align:center">
            <a href="${inviteUrl}" style="color:#b08d6a;font-weight:bold;text-decoration:none">${inviteUrl}</a>
          </div>
          <p style="line-height:1.7;color:#555">
            청첩장을 계속 유지하려면
            <a href="https://sonett.kr/manage" style="color:#b08d6a">sonett.kr/manage</a>에서
            연장 문의를 해주세요.
          </p>
          <p style="margin-top:32px;font-size:13px;color:#aaa">Sonett · 온라인 모바일 청첩장</p>
        </div>
      `,
    }),
  });
}

async function notifyExpiringInvitations(env: Env): Promise<void> {
  const rows = await env.DB.prepare(`
    SELECT i.slug, i.expires_at, u.email, u.name
    FROM invitations i
    JOIN users u ON i.owner_uid = u.uid
    WHERE i.expires_at IS NOT NULL
      AND i.is_paid = 1
      AND i.expires_at > datetime('now')
      AND i.expires_at <= datetime('now', '+7 days')
      AND i.notified = 0
  `).all();

  for (const row of rows.results) {
    const { slug, expires_at, email, name } = row as { slug: string; expires_at: string; email: string; name: string };
    if (!email) continue;
    try {
      await sendExpiryNotificationEmail(env, email, name || '회원', slug, expires_at);
      await env.DB.prepare('UPDATE invitations SET notified = 1 WHERE slug = ?').bind(slug).run();
    } catch { /* 알림 실패 무시 */ }
  }
}

async function deleteExpiredInvitations(env: Env): Promise<void> {
  const now = new Date().toISOString();
  const expired = await env.DB.prepare(
    'SELECT slug FROM invitations WHERE expires_at IS NOT NULL AND expires_at <= ?'
  ).bind(now).all();
  for (const row of expired.results) {
    const slug = row.slug as string;
    await env.DB.batch([
      env.DB.prepare('DELETE FROM guestbook WHERE invitation_slug = ?').bind(slug),
      env.DB.prepare('DELETE FROM rsvp WHERE invitation_slug = ?').bind(slug),
      env.DB.prepare('DELETE FROM guests WHERE invitation_slug = ?').bind(slug),
      env.DB.prepare('DELETE FROM invitations WHERE slug = ?').bind(slug),
    ]);
  }
}

// --- OG tag injection ---

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// "2026. 10. 24. 토요일 오후 12시 30분" 형태로 포맷
function formatWeddingDateTimeKo(weddingDateISO: string, time: string): string {
  const d = new Date(weddingDateISO);
  if (isNaN(d.getTime())) return '';
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dateText = `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. ${dayNames[d.getDay()]}요일`;
  const parts = time?.match(/(AM|PM)\s(\d+):(\d+)/);
  if (!parts) return dateText;
  const ampm = parts[1] === 'AM' ? '오전' : '오후';
  const minuteText = parts[3] === '00' ? '' : ` ${parts[3]}분`;
  return `${dateText} ${ampm} ${parts[2]}시${minuteText}`;
}

// --- Notification emails (유료 청첩장 전용) ---

async function sendGuestbookNotification(env: Env, slug: string, guestName: string, content: string, side: string): Promise<void> {
  if (!env.RESEND_API_KEY) return;
  const row = await env.DB.prepare(
    `SELECT u.email, i.data, i.is_paid FROM invitations i JOIN users u ON i.owner_uid = u.uid WHERE i.slug = ?`
  ).bind(slug).first();
  if (!row || !row.is_paid || !row.email) return;

  const d = JSON.parse(row.data as string);
  const coupleName = d.groomName && d.brideName ? `${d.groomName} & ${d.brideName}` : slug;
  const sideLabel = side === 'groom' ? '신랑 측' : '신부 측';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Sonett <noreply@sonett.kr>',
      to: [row.email as string],
      subject: `[Sonett] ${coupleName} 청첩장에 방명록이 작성되었습니다`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#333">
          <h2 style="font-size:18px;margin-bottom:8px">새 방명록 메시지</h2>
          <p style="color:#555;line-height:1.6">
            <strong>${escapeHtml(guestName)}</strong>님(${sideLabel})이 방명록에 메시지를 남겼습니다.
          </p>
          <div style="margin:20px 0;padding:16px 20px;background:#f9f5f0;border-radius:10px;border-left:3px solid #B07A8E">
            <p style="margin:0;color:#333;line-height:1.7">${escapeHtml(content)}</p>
          </div>
          <a href="https://sonett.kr/admin/${slug}" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#B07A8E;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px">방명록 확인하기</a>
          <p style="margin-top:32px;font-size:12px;color:#aaa">Sonett · 온라인 모바일 청첩장</p>
        </div>
      `,
    }),
  });
}

async function sendRsvpNotification(env: Env, slug: string, guestName: string, isAttending: boolean, totalGuests: number, relation: string, message: string): Promise<void> {
  if (!env.RESEND_API_KEY) return;
  const row = await env.DB.prepare(
    `SELECT u.email, i.data, i.is_paid FROM invitations i JOIN users u ON i.owner_uid = u.uid WHERE i.slug = ?`
  ).bind(slug).first();
  if (!row || !row.is_paid || !row.email) return;

  const d = JSON.parse(row.data as string);
  const coupleName = d.groomName && d.brideName ? `${d.groomName} & ${d.brideName}` : slug;
  const relationLabel = relation === 'groom' ? '신랑 측' : '신부 측';
  const attendLabel = isAttending ? '✅ 참석' : '❌ 불참';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Sonett <noreply@sonett.kr>',
      to: [row.email as string],
      subject: `[Sonett] ${coupleName} 청첩장에 RSVP 응답이 도착했습니다`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#333">
          <h2 style="font-size:18px;margin-bottom:8px">새 RSVP 응답</h2>
          <p style="color:#555;line-height:1.6">
            <strong>${escapeHtml(guestName)}</strong>님(${relationLabel})이 참석 여부를 응답했습니다.
          </p>
          <div style="margin:20px 0;padding:16px 20px;background:#f9f5f0;border-radius:10px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:6px 0;color:#888;width:80px">참석 여부</td><td style="padding:6px 0;font-weight:bold">${attendLabel}</td></tr>
              ${isAttending ? `<tr><td style="padding:6px 0;color:#888">인원</td><td style="padding:6px 0">${totalGuests}명</td></tr>` : ''}
              ${message ? `<tr><td style="padding:6px 0;color:#888">메시지</td><td style="padding:6px 0">${escapeHtml(message)}</td></tr>` : ''}
            </table>
          </div>
          <a href="https://sonett.kr/admin/${slug}" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#B07A8E;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px">전체 응답 보기</a>
          <p style="margin-top:32px;font-size:12px;color:#aaa">Sonett · 온라인 모바일 청첩장</p>
        </div>
      `,
    }),
  });
}

// --- Main Router ---

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const origin = request.headers.get('Origin') || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    try {
      // Auth
      if (pathname === '/api/auth/google') return await handleGoogleAuth(request, env);
      if (pathname === '/api/auth/kakao') return await handleKakaoAuth(request, env);
      if (pathname === '/api/auth/naver') return await handleNaverAuth(request, env);

      // Invitations
      if (pathname === '/api/invitations') return await handleInvitations(request, env);

      const invMatch = pathname.match(/^\/api\/invitations\/([^/]+)$/);
      if (invMatch) return await handleInvitation(request, env, invMatch[1]);

      const availMatch = pathname.match(/^\/api\/invitations\/([^/]+)\/available$/);
      if (availMatch) return await handleSlugAvailable(request, env, availMatch[1]);

      const changeSlugMatch = pathname.match(/^\/api\/invitations\/([^/]+)\/change-slug$/);
      if (changeSlugMatch) return await handleChangeSlug(request, env, changeSlugMatch[1]);

      const activateMatch = pathname.match(/^\/api\/invitations\/([^/]+)\/activate$/);
      if (activateMatch) return await handleActivate(request, env, activateMatch[1]);

      const privacySettingsMatch = pathname.match(/^\/api\/invitations\/([^/]+)\/privacy-settings$/);
      if (privacySettingsMatch) return await handlePrivacySettings(request, env, privacySettingsMatch[1]);

      // Posts (public)
      if (pathname === '/api/posts') return await handlePostsPublic(request, env);

      // Posts (admin CRUD)
      if (pathname === '/api/admin/posts') return await handleAdminPosts(request, env);
      const postMatch = pathname.match(/^\/api\/admin\/posts\/(\d+)$/);
      if (postMatch) return await handleAdminPost(request, env, postMatch[1]);

      // Admin
      if (pathname === '/api/admin/invitations' && request.method === 'GET')
        return await handleAdminInvitations(request, env);

      // Upload
      if (pathname === '/api/upload') return await handleUpload(request, env);

      // Guestbook
      const gbMatch = pathname.match(/^\/api\/guestbook\/([^/]+)$/);
      if (gbMatch) return await handleGuestbook(request, env, gbMatch[1]);

      const gbDelMatch = pathname.match(/^\/api\/guestbook\/([^/]+)\/([^/]+)$/);
      if (gbDelMatch && request.method === 'DELETE') return await handleGuestbookDelete(request, env, gbDelMatch[1], gbDelMatch[2]);

      // RSVP
      const rsvpMatch = pathname.match(/^\/api\/rsvp\/([^/]+)$/);
      if (rsvpMatch) return await handleRSVP(request, env, rsvpMatch[1]);

      // Guests (하객 개인화 링크)
      const guestsMatch = pathname.match(/^\/api\/guests\/([^/]+)$/);
      if (guestsMatch) return await handleGuests(request, env, guestsMatch[1]);

      const guestMatch = pathname.match(/^\/api\/guests\/([^/]+)\/([^/]+)$/);
      if (guestMatch) return await handleGuest(request, env, guestMatch[1], guestMatch[2]);

      const inviteMatch = pathname.match(/^\/api\/invite\/([^/]+)$/);
      if (inviteMatch) return await handleInviteLookup(request, env, inviteMatch[1]);

      // Live Gallery (하객 업로드 갤러리)
      const galleryAdminMatch = pathname.match(/^\/api\/gallery\/([^/]+)\/admin$/);
      if (galleryAdminMatch && request.method === 'GET') return await handleGalleryAdminList(request, env, galleryAdminMatch[1]);

      const galleryReportMatch = pathname.match(/^\/api\/gallery\/([^/]+)\/([^/]+)\/report$/);
      if (galleryReportMatch && request.method === 'POST') return await handleGalleryPhotoReport(request, env, galleryReportMatch[1], galleryReportMatch[2]);

      const galleryUnhideMatch = pathname.match(/^\/api\/gallery\/([^/]+)\/([^/]+)\/unhide$/);
      if (galleryUnhideMatch && request.method === 'POST') return await handleGalleryPhotoUnhide(request, env, galleryUnhideMatch[1], galleryUnhideMatch[2]);

      const galleryPhotoMatch = pathname.match(/^\/api\/gallery\/([^/]+)\/([^/]+)$/);
      if (galleryPhotoMatch && request.method === 'DELETE') return await handleGalleryPhotoDelete(request, env, galleryPhotoMatch[1], galleryPhotoMatch[2]);

      const galleryMatch = pathname.match(/^\/api\/gallery\/([^/]+)$/);
      if (galleryMatch && request.method === 'GET') return await handleGalleryPhotos(request, env, galleryMatch[1]);
      if (galleryMatch && request.method === 'POST') return await handleGalleryUpload(request, env, galleryMatch[1]);

      // Images from R2
      const imgMatch = pathname.match(/^\/images\/(.+)$/);
      if (imgMatch) return await handleImageGet(request, env, imgMatch[1]);

      // OG image
      const ogMatch = pathname.match(/^\/og\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
      if (ogMatch) {
        const row = await env.DB.prepare('SELECT data FROM invitations WHERE slug = ?').bind(ogMatch[1]).first();
        if (row) {
          const data = JSON.parse(row.data as string);
          const photo = data.heroPhoto || '';
          if (photo.startsWith('data:')) {
            const [hdr, base64] = photo.split(',');
            const mime = hdr.match(/data:(.*?);/)?.[1] || 'image/jpeg';
            return new Response(Uint8Array.from(atob(base64), c => c.charCodeAt(0)), {
              headers: { 'Content-Type': mime, 'Cache-Control': 'public, max-age=3600' },
            });
          }
          if (photo.startsWith('/images/') || photo.startsWith('http')) {
            const photoUrl = photo.startsWith('/images/') ? `${url.origin}${photo}` : photo;
            return Response.redirect(photoUrl, 302);
          }
        }
        return Response.redirect(`${url.origin}/og-image.png`, 302);
      }

      // SPA routing with OG tag injection
      const RESERVED = new Set(['editor', 'edit', 'manage', 'admin', 'auth', 'terms', 'privacy', 'superadmin', 'api', 'og', 'images', 'templates', 'events', 'invite']);
      const slugMatch = pathname.match(/^\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
      if (!slugMatch || RESERVED.has(slugMatch[1]) || pathname.includes('.')) {
        return env.ASSETS.fetch(request);
      }

      const slug = slugMatch[1];
      const getIndex = () => env.ASSETS.fetch(new Request(`${url.origin}/__spa__`));

      const row = await env.DB.prepare('SELECT data FROM invitations WHERE slug = ?').bind(slug).first();
      if (!row) return getIndex();

      const data = JSON.parse(row.data as string);
      const title = data.groomName && data.brideName
        ? `${data.groomName} ❤️ ${data.brideName} 결혼합니다`
        : '모바일 청첩장';
      // 신랑/신부 이름은 이미 title(굵게 렌더링되는 영역)에 들어있어 description에는 날짜만 넣어 중복을 없앰
      const dateTimeLine = data.weddingDateISO ? formatWeddingDateTimeKo(data.weddingDateISO, data.time) : (data.date || '');
      const description = dateTimeLine || '소중한 날에 초대합니다.';
      const heroPhoto = data.heroPhoto || '';

      let image: string;
      if (heroPhoto.startsWith('data:')) image = `${url.origin}/og/${slug}`;
      else if (heroPhoto.startsWith('/images/')) image = `${url.origin}${heroPhoto}`;
      else if (heroPhoto.startsWith('http')) image = heroPhoto;
      else image = `${url.origin}/og-image.png`;

      const assetRes = await getIndex();
      let html = await assetRes.text();
      html = html.replace(/<title>.*?<\/title>/g, '');
      html = html.replace(/<meta\s+property="og:[^"]*"\s+content="[^"]*"\s*\/?>/g, '');
      html = html.replace(/<meta\s+name="twitter:[^"]*"\s+content="[^"]*"\s*\/?>/g, '');

      const ogTags = `<title>${escapeHtml(title)} - Sonett</title>
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Sonett" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:url" content="${escapeHtml(`${url.origin}/${slug}`)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />`;

      html = html.replace('</head>', `${ogTags}\n  </head>`);
      html = html.replace(/<link rel="modulepreload"[^>]*firebase[^>]*>/g, '');

      const loader = `<div id="root"><div style="position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(180deg,#FDFBFC 0%,#FDF6F9 100%);font-family:'Pretendard',-apple-system,BlinkMacSystemFont,sans-serif;gap:20px;z-index:1"><p style="font-size:1.5rem;font-weight:700;color:#B07A8E;letter-spacing:3px;margin:0">Sonett</p><div style="width:36px;height:36px;border:3px solid #F3E0E6;border-top-color:#B07A8E;border-radius:50%;animation:spin .8s linear infinite"></div><p style="font-size:.85rem;color:#9CA3AF;margin:0;letter-spacing:1px">청첩장을 불러오는 중...</p><style>@keyframes spin{to{transform:rotate(360deg)}}</style></div></div>`;
      html = html.replace('<div id="root"></div>', loader);

      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (pathname.startsWith('/api/')) return json({ error: msg }, 500, origin);
      return env.ASSETS.fetch(request);
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    await notifyExpiringInvitations(env);
    await deleteExpiredInvitations(env);
  },
};
