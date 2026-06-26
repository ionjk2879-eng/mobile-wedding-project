interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  FIREBASE_SA_EMAIL: string;
  FIREBASE_SA_PRIVATE_KEY: string;
  KAKAO_REST_API_KEY: string;
  KAKAO_CLIENT_SECRET: string;
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function fetchInvitation(slug: string) {
  const url = `https://firestore.googleapis.com/v1/projects/sonett-app-2026-b79e5/databases/(default)/documents/invitations/${slug}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const doc = await res.json() as { fields?: Record<string, { stringValue?: string }> };
  return doc.fields || null;
}

// --- Firebase Custom Token (JWT RS256) ---

function base64url(data: string | ArrayBuffer): string {
  const str = typeof data === 'string'
    ? btoa(data)
    : btoa(String.fromCharCode(...new Uint8Array(data)));
  return str.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemBody = pem
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  const binary = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    binary,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function createCustomToken(uid: string, saEmail: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: saEmail,
    sub: saEmail,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now,
    exp: now + 3600,
    uid,
  }));

  const key = await importPrivateKey(privateKeyPem);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(`${header}.${payload}`),
  );

  return `${header}.${payload}.${base64url(signature)}`;
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// --- Kakao OAuth ---

async function handleKakaoAuth(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const body = await request.json() as { code?: string; redirectUri?: string };
  if (!body.code || !body.redirectUri) {
    return Response.json({ error: 'code and redirectUri are required' }, { status: 400, headers: corsHeaders(origin) });
  }

  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: '7edc2c74f346bfad9c9006cd26d04e3c',
    client_secret: env.KAKAO_CLIENT_SECRET,
    redirect_uri: body.redirectUri,
    code: body.code,
  });

  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    const usedKey = tokenParams.get('client_id') || '';
    return Response.json({
      error: '카카오 인증에 실패했습니다.',
      detail: errText,
      debug_key: usedKey.slice(0, 6) + '...' + usedKey.slice(-4),
      debug_redirect: body.redirectUri,
    }, { status: 401, headers: corsHeaders(origin) });
  }

  const tokenData = await tokenRes.json() as { access_token: string };

  const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileRes.ok) {
    return Response.json({ error: '카카오 프로필 조회에 실패했습니다.' }, { status: 401, headers: corsHeaders(origin) });
  }

  const profile = await profileRes.json() as {
    id: number;
    kakao_account?: { profile?: { nickname?: string; profile_image_url?: string }; email?: string };
  };

  const uid = `kakao_${profile.id}`;
  const account = profile.kakao_account || {};
  const kakaoProfile = account.profile || {};

  const customToken = await createCustomToken(uid, env.FIREBASE_SA_EMAIL, env.FIREBASE_SA_PRIVATE_KEY);

  return Response.json({
    customToken,
    displayName: kakaoProfile.nickname || '',
    photoURL: kakaoProfile.profile_image_url || '',
    email: account.email || '',
  }, { headers: corsHeaders(origin) });
}

// --- Naver OAuth ---

async function handleNaverAuth(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const body = await request.json() as { code?: string; state?: string };
  if (!body.code) {
    return Response.json({ error: 'code is required' }, { status: 400, headers: corsHeaders(origin) });
  }

  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: env.NAVER_CLIENT_ID,
    client_secret: env.NAVER_CLIENT_SECRET,
    code: body.code,
    state: body.state || '',
  });

  const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString(),
  });

  if (!tokenRes.ok) {
    return Response.json({ error: '네이버 인증에 실패했습니다.' }, { status: 401, headers: corsHeaders(origin) });
  }

  const tokenData = await tokenRes.json() as { access_token: string };

  const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileRes.ok) {
    return Response.json({ error: '네이버 프로필 조회에 실패했습니다.' }, { status: 401, headers: corsHeaders(origin) });
  }

  const profileData = await profileRes.json() as {
    response?: { id?: string; name?: string; nickname?: string; email?: string; profile_image?: string };
  };
  const naverProfile = profileData.response || {};
  const uid = `naver_${naverProfile.id}`;

  const customToken = await createCustomToken(uid, env.FIREBASE_SA_EMAIL, env.FIREBASE_SA_PRIVATE_KEY);

  return Response.json({
    customToken,
    displayName: naverProfile.nickname || '',
    photoURL: naverProfile.profile_image || '',
    email: naverProfile.email || '',
  }, { headers: corsHeaders(origin) });
}

// --- Main Router ---

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // API routes
    if (pathname === '/api/auth/kakao') {
      try {
        return await handleKakaoAuth(request, env);
      } catch (e: any) {
        const origin = request.headers.get('Origin') || '*';
        return Response.json({ error: '로그인 처리 중 오류가 발생했습니다.', detail: e?.message || String(e) }, { status: 500, headers: corsHeaders(origin) });
      }
    }
    if (pathname === '/api/auth/naver') {
      try {
        return await handleNaverAuth(request, env);
      } catch {
        const origin = request.headers.get('Origin') || '*';
        return Response.json({ error: '로그인 처리 중 오류가 발생했습니다.' }, { status: 500, headers: corsHeaders(origin) });
      }
    }

    // /og/{slug} → heroPhoto를 이미지로 반환 (OG 이미지용)
    const ogMatch = pathname.match(/^\/og\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
    if (ogMatch) {
      try {
        const f = await fetchInvitation(ogMatch[1]);
        const photo = f?.heroPhoto?.stringValue || '';
        if (photo.startsWith('data:')) {
          const [header, base64] = photo.split(',');
          const mime = header.match(/data:(.*?);/)?.[1] || 'image/jpeg';
          const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          return new Response(binary, {
            headers: {
              'Content-Type': mime,
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
        if (photo.startsWith('http')) {
          return Response.redirect(photo, 302);
        }
      } catch {}
      return Response.redirect(`${url.origin}/og-image.png`, 302);
    }

    // /{slug} → OG 태그 주입 (예약 경로 제외)
    const RESERVED = new Set(['editor', 'edit', 'manage', 'admin', 'auth', 'terms', 'privacy', 'superadmin', 'api', 'og']);
    const slugMatch = pathname.match(/^\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
    if (!slugMatch || RESERVED.has(slugMatch[1]) || pathname.includes('.')) {
      return env.ASSETS.fetch(request);
    }

    const slug = slugMatch[1];

    // index.html을 /index.html로 명시적으로 요청 (/ 요청은 리다이렉트 응답을 줄 수 있음)
    const getIndexHtml = () => env.ASSETS.fetch(new Request(`${url.origin}/index.html`));

    try {
      const f = await fetchInvitation(slug);
      if (!f) return getIndexHtml();

      const groomName = f.groomName?.stringValue || '';
      const brideName = f.brideName?.stringValue || '';
      const date = f.date?.stringValue || '';
      const venueName = f.venueName?.stringValue || '';
      const heroPhoto = f.heroPhoto?.stringValue || '';

      const title = groomName && brideName
        ? `${groomName} ♥ ${brideName} 결혼합니다`
        : '모바일 청첩장';
      const description = [date, venueName].filter(Boolean).join(' | ') || '소중한 날에 초대합니다.';
      const pageUrl = `${url.origin}/${slug}`;

      let image: string;
      if (heroPhoto.startsWith('data:')) {
        image = `${url.origin}/og/${slug}`;
      } else if (heroPhoto.startsWith('http')) {
        image = heroPhoto;
      } else {
        image = `${url.origin}/og-image.png`;
      }

      const assetResponse = await getIndexHtml();
      let html = await assetResponse.text();

      // 기존 OG/Twitter 메타 태그 + title 모두 제거
      html = html.replace(/<title>.*?<\/title>/g, '');
      html = html.replace(/<meta\s+property="og:[^"]*"\s+content="[^"]*"\s*\/?>/g, '');
      html = html.replace(/<meta\s+name="twitter:[^"]*"\s+content="[^"]*"\s*\/?>/g, '');

      const ogTags = `<title>${escapeHtml(title)} - Sonett</title>
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />`;

      html = html.replace('</head>', `${ogTags}\n  </head>`);

      // Remove heavy firebase modulepreload (ViewPage doesn't need it)
      html = html.replace(/<link rel="modulepreload"[^>]*firebase[^>]*>/g, '');

      // Add branded loading indicator visible before JS renders
      const loader = `<div id="root"><div style="position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(180deg,#FDFBFC 0%,#FDF6F9 100%);font-family:'Pretendard',-apple-system,BlinkMacSystemFont,sans-serif;gap:20px;z-index:1"><p style="font-size:1.5rem;font-weight:700;color:#B07A8E;letter-spacing:3px;margin:0">Sonett</p><div style="width:36px;height:36px;border:3px solid #F3E0E6;border-top-color:#B07A8E;border-radius:50%;animation:spin .8s linear infinite"></div><p style="font-size:.85rem;color:#9CA3AF;margin:0;letter-spacing:1px">청첩장을 불러오는 중...</p><style>@keyframes spin{to{transform:rotate(360deg)}}</style></div></div>`;
      html = html.replace('<div id="root"></div>', loader);

      return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    } catch {
      return getIndexHtml();
    }
  },
};
