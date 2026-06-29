import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InvitationData } from '../types';
import InvitationView from '../components/Preview/InvitationView';
import previewCss from '../styles/preview.css?raw';
import effectsCss from '../styles/effects.css?raw';

async function urlToBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

async function resolveUrl(url: string | undefined): Promise<string> {
  if (!url) return '';
  if (url.startsWith('/images/')) return urlToBase64(url);
  return url;
}

async function embedImages(data: InvitationData): Promise<InvitationData> {
  const [heroPhoto, heroPhoto2, groomPhoto, bridePhoto, photos, timeline] = await Promise.all([
    resolveUrl(data.heroPhoto),
    resolveUrl(data.heroPhoto2),
    resolveUrl(data.groomPhoto),
    resolveUrl(data.bridePhoto),
    Promise.all((data.photos || []).map(resolveUrl)),
    Promise.all((data.timeline || []).map(async (t) => ({ ...t, photo: await resolveUrl(t.photo) }))),
  ]);
  return { ...data, heroPhoto, heroPhoto2, groomPhoto, bridePhoto, photos, timeline };
}

function getThemeBgColor(theme: string, customBgColor?: string): string {
  if (customBgColor) return customBgColor;
  const map: Record<string, string> = {
    blush: '#FDF6F9', champagne: '#FBF7F0', sage: '#F4F7F4', navy: '#F0F2F7',
    burgundy: '#F7F0F2', lavender: '#F5F3FB', dusty: '#F6F3F7', modern: '#F8F8F8',
    mocha: '#F7F3EF', cloud: '#F5F7FA', emerald: '#F0F6F3', butter: '#FBF9EE',
    cobalt: '#EEF2FA', terracotta: '#FAF2EE', rosegold: '#FAF0F2', midnight: '#1A1A2E',
  };
  return map[theme] || '#FFFFFF';
}

export async function downloadInvitationHtml(data: InvitationData): Promise<void> {
  const resolved = await embedImages(data);

  const exportData: InvitationData = {
    ...resolved,
    sectionOrder: (resolved.sectionOrder || []).filter(s => s !== 'share'),
  };

  const theme = exportData.theme || 'blush';
  const fontSize =
    exportData.fontSize === 'small' ? '13px' : exportData.fontSize === 'large' ? '16px' : '14.5px';
  const bgColor = getThemeBgColor(theme, exportData.customBgColor);

  const customVars: Record<string, string> = {};
  if (exportData.customBgColor) customVars['--wedding-bg'] = exportData.customBgColor;
  if (exportData.customAccentColor) {
    customVars['--wedding-main'] = exportData.customAccentColor;
    customVars['--wedding-accent'] = exportData.customAccentColor;
  }

  const bodyHtml = renderToStaticMarkup(
    createElement(
      'div',
      {
        className: `invitation-page theme-${theme}`,
        style: Object.keys(customVars).length ? customVars : undefined,
      },
      createElement(InvitationView, { data: exportData, showOpening: false, shareEnabled: false }),
    ),
  );

  const title =
    exportData.groomName && exportData.brideName
      ? `${exportData.groomName} & ${exportData.brideName} 결혼합니다`
      : '우리들의 결혼식';

  const fontFamily = exportData.fontFamily || "'Pretendard', sans-serif";

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo:wght@400;700&family=Dancing+Script&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: ${bgColor}; }
    body { display: flex; justify-content: center; min-height: 100vh; font-family: 'Pretendard', -apple-system, sans-serif; }
    .invitation-page {
      width: 100%;
      max-width: 430px;
      min-height: 100vh;
      background-color: var(--wedding-bg, #fff);
      font-size: ${fontSize};
      font-family: ${fontFamily};
    }
    @media (max-width: 430px) {
      body { background: var(--wedding-bg, #fff); }
      .invitation-page { max-width: 100%; }
    }
    ${previewCss}
    ${effectsCss}
  </style>
</head>
<body>
  ${bodyHtml}
  <footer style="text-align:center;padding:24px 16px;font-size:0.75rem;color:#9CA3AF;font-family:'Pretendard',sans-serif;border-top:1px solid #F3F4F6;margin-top:20px;">
    Made with <a href="https://sonett.kr" style="color:#B07A8E;text-decoration:none;font-weight:600;">Sonett</a>
  </footer>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(exportData.groomName || '신랑').replace(/\s/g, '')}-${(exportData.brideName || '신부').replace(/\s/g, '')}-청첩장.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}