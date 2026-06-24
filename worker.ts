interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

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

    // /w/{slug} → OG 태그 주입
    const wMatch = pathname.match(/^\/w\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
    if (!wMatch) {
      return env.ASSETS.fetch(request);
    }

    const slug = wMatch[1];
    const assetResponse = await env.ASSETS.fetch(request);

    try {
      const f = await fetchInvitation(slug);
      if (!f) return assetResponse;

      const groomName = f.groomName?.stringValue || '';
      const brideName = f.brideName?.stringValue || '';
      const date = f.date?.stringValue || '';
      const venueName = f.venueName?.stringValue || '';
      const heroPhoto = f.heroPhoto?.stringValue || '';

      const title = groomName && brideName
        ? `${groomName} ♥ ${brideName} 결혼합니다`
        : '모바일 청첩장';
      const description = [date, venueName].filter(Boolean).join(' | ') || '소중한 날에 초대합니다.';
      const pageUrl = `${url.origin}/w/${slug}`;

      let image: string;
      if (heroPhoto.startsWith('data:')) {
        image = `${url.origin}/og/${slug}`;
      } else if (heroPhoto.startsWith('http')) {
        image = heroPhoto;
      } else {
        image = `${url.origin}/og-image.png`;
      }

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

      return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    } catch {
      return assetResponse;
    }
  },
};
