import { fetchGuestMessages } from '../services/guestbookService';
import { GuestMessage, InvitationData } from '../types';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  } catch {
    return iso;
  }
}

function renderCard(msg: GuestMessage, accentColor: string, mainColor: string): string {
  const sideLabel = msg.side === 'groom' ? '신랑측' : '신부측';
  const sideDot = msg.side === 'groom' ? accentColor : mainColor;
  return `
  <div class="gb-card">
    <div class="gb-card-header">
      <span class="gb-dot" style="background:${sideDot}"></span>
      <span class="gb-name">${msg.name}</span>
      <span class="gb-side">${sideLabel}</span>
      <span class="gb-date">${formatDate(msg.createdAt)}</span>
    </div>
    <p class="gb-content">${msg.content.replace(/\n/g, '<br>')}</p>
  </div>`;
}

export async function downloadGuestbookPdf(data: InvitationData): Promise<void> {
  if (!data.slug) throw new Error('slug 없음');

  const messages = await fetchGuestMessages(data.slug);
  if (messages.length === 0) throw new Error('등록된 방명록이 없습니다');

  const accentColor = data.customAccentColor || '#B07A8E';
  const mainColor = data.customAccentColor || '#9E7BA0';
  const bgColor = data.customBgColor || '#FDF6F9';
  const fontFamily = data.fontFamily || "'Pretendard', sans-serif";
  const weddingDate = data.date || '';
  const groomName = data.groomName || '신랑';
  const brideName = data.brideName || '신부';


  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${groomName} ♥ ${brideName} 방명록</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Dancing+Script:wght@500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: #f5f5f5;
      font-family: 'Pretendard', -apple-system, sans-serif;
      color: #2A1F1F;
    }

    /* PDF 저장 버튼 */
    #pdf-toolbar {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    #pdf-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      background: ${accentColor};
      color: white;
      border: none;
      border-radius: 30px;
      font-size: 0.95rem;
      font-weight: 700;
      font-family: 'Pretendard', sans-serif;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      letter-spacing: 0.02em;
      transition: opacity 0.2s;
    }
    #pdf-btn:hover { opacity: 0.85; }
    #pdf-hint {
      font-size: 0.72rem;
      color: rgba(0,0,0,0.4);
      font-family: 'Pretendard', sans-serif;
      background: rgba(255,255,255,0.9);
      padding: 4px 12px;
      border-radius: 20px;
    }

    /* 페이지 */
    .page {
      width: 210mm;
      min-height: 297mm;
      background: white;
      margin: 0 auto 16px;
      padding: 16mm 14mm;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }

    /* 표지 */
    .cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 297mm;
      text-align: center;
      background: ${bgColor};
      position: relative;
    }
    .cover::before {
      content: '';
      position: absolute;
      inset: 10mm;
      border: 1px solid ${accentColor}44;
      pointer-events: none;
    }
    .cover-label {
      font-size: 0.7rem;
      letter-spacing: 6px;
      color: ${accentColor};
      opacity: 0.7;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .cover-names {
      font-family: 'Cormorant Garamond', serif;
      font-size: 3rem;
      font-weight: 300;
      letter-spacing: 4px;
      color: #2A1F1F;
      line-height: 1.2;
    }
    .cover-amp {
      font-family: 'Dancing Script', cursive;
      font-size: 2rem;
      color: ${accentColor};
      opacity: 0.6;
      margin: 8px 0;
      display: block;
    }
    .cover-date {
      margin-top: 28px;
      font-size: 0.85rem;
      letter-spacing: 3px;
      color: #6B7280;
    }
    .cover-divider {
      width: 40px;
      height: 1px;
      background: ${accentColor};
      opacity: 0.4;
      margin: 24px auto;
    }
    .cover-subtitle {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem;
      font-style: italic;
      color: ${accentColor};
      letter-spacing: 2px;
    }
    .cover-count {
      margin-top: 12px;
      font-size: 0.75rem;
      color: #9CA3AF;
      letter-spacing: 1px;
    }

    /* 방명록 카드 그리드 */
    .cards-page { padding: 14mm 14mm 10mm; }
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10mm;
    }
    .gb-card {
      border: 1px solid ${accentColor}33;
      border-radius: 8px;
      padding: 14px 16px;
      background: ${bgColor};
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .gb-card-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid ${accentColor}22;
    }
    .gb-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .gb-name {
      font-weight: 700;
      font-size: 0.88rem;
      color: #1F2937;
      flex: 1;
    }
    .gb-side {
      font-size: 0.68rem;
      color: ${accentColor};
      border: 1px solid ${accentColor}55;
      border-radius: 10px;
      padding: 1px 7px;
      font-weight: 600;
    }
    .gb-date {
      font-size: 0.65rem;
      color: #9CA3AF;
      flex-shrink: 0;
    }
    .gb-content {
      font-size: 0.83rem;
      line-height: 1.8;
      color: #374151;
      white-space: pre-wrap;
      word-break: keep-all;
      font-family: ${fontFamily};
    }

    /* 인쇄 */
    @media print {
      @page { size: A4 portrait; margin: 0; }
      html, body { background: white; }
      #pdf-toolbar { display: none !important; }
      .page { box-shadow: none; margin: 0; page-break-after: always; break-after: page; }
      .page:last-child { page-break-after: auto; break-after: auto; }
    }
  </style>
</head>
<body>

  <div id="pdf-toolbar">
    <button id="pdf-btn" onclick="window.print()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
      PDF로 저장
    </button>
    <span id="pdf-hint">Chrome에서 '대상: PDF로 저장' 선택</span>
  </div>

  <!-- 표지 -->
  <div class="page cover">
    <p class="cover-label">WEDDING GUEST BOOK</p>
    <div class="cover-names">
      ${groomName}
      <span class="cover-amp">&amp;</span>
      ${brideName}
    </div>
    <div class="cover-divider"></div>
    <p class="cover-subtitle">소중한 분들의 축하 메시지</p>
    ${weddingDate ? `<p class="cover-date">${weddingDate}</p>` : ''}
    <p class="cover-count">${messages.length}개의 방명록</p>
  </div>

  <!-- 방명록 카드 (2열 그리드, 페이지당 6개) -->
  ${(() => {
    const PER_PAGE = 6;
    let pages = '';
    for (let i = 0; i < messages.length; i += PER_PAGE) {
      const chunk = messages.slice(i, i + PER_PAGE);
      pages += `<div class="page cards-page">
    <div class="cards-grid">
      ${chunk.map(m => renderCard(m, accentColor, mainColor)).join('\n      ')}
    </div>
  </div>`;
    }
    return pages;
  })()}

</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) throw new Error('팝업이 차단되었습니다. 브라우저 팝업 허용 후 다시 시도해주세요.');
  win.document.write(html);
  win.document.close();
}