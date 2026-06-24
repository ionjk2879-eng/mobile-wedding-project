interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isStaticAsset(pathname: string): boolean {
  return pathname.startsWith('/assets/')
    || pathname === '/favicon.svg'
    || pathname === '/og-image.png'
    || pathname === '/og-image.svg'
    || pathname === '/_headers';
}

async function fetchIndexHtml(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  url.pathname = '/';
  return env.ASSETS.fetch(new Request(url.toString()));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Static assets → serve directly
      if (isStaticAsset(pathname)) {
        return await env.ASSETS.fetch(request);
      }

      // Root → serve index.html directly
      if (pathname === '/' || pathname === '/index.html') {
        return await env.ASSETS.fetch(request);
      }

      // /w/{slug} → OG tag injection
      const match = pathname.match(/^\/w\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
      if (match) {
        const slug = match[1];
        const htmlResponse = await fetchIndexHtml(request, env);

        try {
          const firestoreUrl = `https://firestore.googleapis.com/v1/projects/sonett-app-2026-b79e5/databases/(default)/documents/invitations/${slug}`;
          const res = await fetch(firestoreUrl);

          if (!res.ok) return htmlResponse;

          const doc = await res.json() as { fields?: Record<string, { stringValue?: string }> };
          const f = doc.fields;
          if (!f) return htmlResponse;

          const groomName = f.groomName?.stringValue || '';
          const brideName = f.brideName?.stringValue || '';
          const date = f.date?.stringValue || '';
          const heroPhoto = f.heroPhoto?.stringValue || '';
          const venueName = f.venueName?.stringValue || '';

          const title = groomName && brideName
            ? `${groomName} ♥ ${brideName} 결혼합니다`
            : 'Sonett - 모바일 청첩장';
          const description = [date, venueName].filter(Boolean).join(' | ') || '소중한 날에 초대합니다.';
          const image = heroPhoto || `${url.origin}/og-image.svg`;
          const pageUrl = `${url.origin}/w/${slug}`;

          let html = await htmlResponse.text();

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

          html = html.replace(/<title>.*?<\/title>/, ogTags);

          return new Response(html, {
            headers: { 'Content-Type': 'text/html;charset=UTF-8' },
          });
        } catch {
          return htmlResponse;
        }
      }

      // All other routes (SPA client-side routes) → serve index.html
      return await fetchIndexHtml(request, env);

    } catch (e) {
      return new Response(`Worker error: ${e instanceof Error ? e.message : 'unknown'}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },
};
