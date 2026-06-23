interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/w\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);

    if (!match) {
      return env.ASSETS.fetch(request);
    }

    const slug = match[1];
    const assetResponse = await env.ASSETS.fetch(request);

    try {
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/sonett-app-2026-b79e5/databases/(default)/documents/invitations/${slug}`;
      const res = await fetch(firestoreUrl);

      if (!res.ok) return assetResponse;

      const doc = await res.json() as { fields?: Record<string, { stringValue?: string }> };
      const f = doc.fields;
      if (!f) return assetResponse;

      const groomName = f.groomName?.stringValue || '';
      const brideName = f.brideName?.stringValue || '';
      const date = f.date?.stringValue || '';
      const heroPhoto = f.heroPhoto?.stringValue || '';
      const venueName = f.venueName?.stringValue || '';

      const title = groomName && brideName
        ? `${groomName} ♥ ${brideName} 결혼합니다`
        : 'Sonett - 모바일 청첩장';
      const description = [date, venueName].filter(Boolean).join(' | ') || '소중한 날에 초대합니다.';
      const image = heroPhoto || `${url.origin}/favicon.svg`;
      const pageUrl = `${url.origin}/w/${slug}`;

      let html = await assetResponse.text();

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
      return assetResponse;
    }
  },
};
