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
    data: { ...JSON.parse(r.data as string), slug: r.slug, ownerUid: r.owner_uid },
  })), 200, origin);
}

async function handleInvitation(request: Request, env: Env, slug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const method = request.method;

  if (method === 'GET') {
    const row = await env.DB.prepare('SELECT owner_uid, data FROM invitations WHERE slug = ?').bind(slug).first();
    if (!row) return json(null, 404, origin);
    return json({ ...JSON.parse(row.data as string), slug, ownerUid: row.owner_uid }, 200, origin);
  }

  const user = await getAuthUser(request, env);
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401, origin);

  if (method === 'PUT') {
    const body = await request.json() as Record<string, unknown>;
    const existing = await env.DB.prepare('SELECT owner_uid, is_paid, expires_at FROM invitations WHERE slug = ?').bind(slug).first();
    if (existing && existing.owner_uid !== user.uid) return json({ error: '권한이 없습니다.' }, 403, origin);

    let expiresAt: string | null;
    const isPaid = !!body.isPaid;
    const weddingDateISO = body.weddingDateISO as string;
    if (existing && existing.is_paid && isPaid && existing.expires_at) {
      expiresAt = existing.expires_at as string;
    } else if (isPaid && weddingDateISO) {
      expiresAt = weddingPlusOneYear(weddingDateISO);
    } else {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    await env.DB.prepare(
      `INSERT INTO invitations (slug, owner_uid, data, is_paid, expires_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(slug) DO UPDATE SET data = excluded.data, is_paid = excluded.is_paid, expires_at = excluded.expires_at, updated_at = excluded.updated_at`
    ).bind(slug, user.uid, JSON.stringify(body), isPaid ? 1 : 0, expiresAt).run();

    return json({ ok: true }, 200, origin);
  }

  if (method === 'DELETE') {
    const existing = await env.DB.prepare('SELECT owner_uid FROM invitations WHERE slug = ?').bind(slug).first();
    if (!existing) return json({ error: '청첩장을 찾을 수 없습니다.' }, 404, origin);
    if (existing.owner_uid !== user.uid) return json({ error: '권한이 없습니다.' }, 403, origin);
    await env.DB.batch([
      env.DB.prepare('DELETE FROM guestbook WHERE invitation_slug = ?').bind(slug),
      env.DB.prepare('DELETE FROM rsvp WHERE invitation_slug = ?').bind(slug),
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

  const oldRow = await env.DB.prepare('SELECT owner_uid, data, is_paid, expires_at FROM invitations WHERE slug = ?').bind(oldSlug).first();
  if (!oldRow) return json({ error: '기존 청첩장을 찾을 수 없습니다.' }, 404, origin);
  if (oldRow.owner_uid !== user.uid) return json({ error: '권한이 없습니다.' }, 403, origin);

  const newRow = await env.DB.prepare('SELECT slug FROM invitations WHERE slug = ?').bind(newSlug).first();
  if (newRow) return json({ error: '이미 사용 중인 주소입니다.' }, 409, origin);

  const data = JSON.parse(oldRow.data as string);
  data.slug = newSlug;

  await env.DB.batch([
    env.DB.prepare('INSERT INTO invitations (slug, owner_uid, data, is_paid, expires_at) VALUES (?, ?, ?, ?, ?)').bind(newSlug, user.uid, JSON.stringify(data), oldRow.is_paid, oldRow.expires_at),
    env.DB.prepare('UPDATE guestbook SET invitation_slug = ? WHERE invitation_slug = ?').bind(newSlug, oldSlug),
    env.DB.prepare('UPDATE rsvp SET invitation_slug = ? WHERE invitation_slug = ?').bind(newSlug, oldSlug),
    env.DB.prepare('DELETE FROM invitations WHERE slug = ?').bind(oldSlug),
  ]);

  return json({ ok: true }, 200, origin);
}

async function handleActivate(request: Request, env: Env, slug: string): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401, origin);

  const row = await env.DB.prepare('SELECT owner_uid, data FROM invitations WHERE slug = ?').bind(slug).first();
  if (!row || row.owner_uid !== user.uid) return json({ error: '권한이 없습니다.' }, 403, origin);

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
      'SELECT id, guest_name, is_attending, total_guests, wants_meal, relation, message, created_at FROM rsvp WHERE invitation_slug = ? ORDER BY created_at DESC'
    ).bind(slug).all();
    return json(rows.results.map((r: Record<string, unknown>) => ({
      id: r.id, guestName: r.guest_name, isAttending: !!r.is_attending,
      totalGuests: r.total_guests, wantsMeal: !!r.wants_meal,
      relation: r.relation, message: r.message, createdAt: r.created_at,
    })), 200, origin);
  }

  if (request.method === 'POST') {
    const body = await request.json() as { guestName?: string; isAttending?: boolean; totalGuests?: number; wantsMeal?: boolean; relation?: string; message?: string };
    if (!body.guestName || !body.relation) return json({ error: 'Required fields missing' }, 400, origin);
    const id = body.guestName.trim().replace(/\s+/g, '_');
    await env.DB.prepare(
      `INSERT INTO rsvp (id, invitation_slug, guest_name, is_attending, total_guests, wants_meal, relation, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET is_attending = excluded.is_attending, total_guests = excluded.total_guests, wants_meal = excluded.wants_meal, message = excluded.message`
    ).bind(id, slug, body.guestName, body.isAttending ? 1 : 0, body.totalGuests ?? 1, body.wantsMeal ? 1 : 0, body.relation, body.message || '').run();
    return json({ ok: true }, 200, origin);
  }

  return json({ error: 'Method not allowed' }, 405, origin);
}

// --- Image Upload & Serve ---

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401, origin);

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return json({ error: 'file is required' }, 400, origin);
  if (file.size > 2 * 1024 * 1024) return json({ error: '파일 크기는 2MB를 초과할 수 없습니다.' }, 400, origin);

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const key = `${crypto.randomUUID()}.${ext}`;
  await env.IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type || 'image/jpeg' } });

  return json({ url: `/images/${key}` }, 200, origin);
}

async function handleImageGet(_request: Request, env: Env, key: string): Promise<Response> {
  const obj = await env.IMAGES.get(key);
  if (!obj) return new Response('Not found', { status: 404 });
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
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
      env.DB.prepare('DELETE FROM invitations WHERE slug = ?').bind(slug),
    ]);
  }
}

// --- OG tag injection ---

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
      const RESERVED = new Set(['editor', 'edit', 'manage', 'admin', 'auth', 'terms', 'privacy', 'superadmin', 'api', 'og', 'images']);
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
        ? `${data.groomName} ♥ ${data.brideName} 결혼합니다`
        : '모바일 청첩장';
      const description = [data.date, data.venueName].filter(Boolean).join(' | ') || '소중한 날에 초대합니다.';
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
