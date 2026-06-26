import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InvitationData } from '../types';
import InvitationView from '../components/Preview/InvitationView';
import previewCss from '../styles/preview.css?raw';
import effectsCss from '../styles/effects.css?raw';

export function downloadInvitationHtml(data: InvitationData): void {
  const theme = data.theme || 'blush';
  const fontSize =
    data.fontSize === 'small' ? '13px' : data.fontSize === 'large' ? '16px' : '14.5px';

  const customVars: Record<string, string> = {};
  if (data.customBgColor) customVars['--wedding-bg'] = data.customBgColor;
  if (data.customAccentColor) {
    customVars['--wedding-main'] = data.customAccentColor;
    customVars['--wedding-accent'] = data.customAccentColor;
  }

  const bodyHtml = renderToStaticMarkup(
    createElement(
      'div',
      {
        className: `invitation-page theme-${theme}`,
        style: Object.keys(customVars).length ? customVars : undefined,
      },
      createElement(InvitationView, { data, showOpening: false, shareEnabled: false }),
    ),
  );

  const title =
    data.groomName && data.brideName
      ? `${data.groomName} & ${data.brideName} 寃고샎?⑸땲??
      : '?곕━??寃고샎??;

  const fontFamily = data.fontFamily || "'Pretendard', sans-serif";

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
    html, body { margin: 0; padding: 0; background: #fff; }
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
  a.download = `${(data.groomName || '?좊옉').replace(/\s/g, '')}-${(data.brideName || '?좊?').replace(/\s/g, '')}-泥?꺽??html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

