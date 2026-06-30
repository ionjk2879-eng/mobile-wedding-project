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
  return `<div class="gb-card">
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
  const mainColor   = data.customAccentColor || '#9E7BA0';
  const bgColor     = data.customBgColor     || '#FDF6F9';
  const fontFamily  = data.fontFamily        || "'Pretendard', sans-serif";
  const groomName   = data.groomName         || '신랑';
  const brideName   = data.brideName         || '신부';
  const weddingDate = data.date              || '';

  const cards = messages.map(m => renderCard(m, accentColor, mainColor)).join('\n');

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
      background: #eee;
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
      color: rgba(0,0,0,0.45);
      background: rgba(255,255,255,0.9);
      padding: 4px 12px;
      border-radius: 20px;
    }

    /* 페이퍼 컨테이너 (화면 미리보기용) */
    #paper {
      width: 210mm;
      margin: 20px auto 100px;
      background: white;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    }

    /* 표지 — 첫 페이지 전체 */
    .cover {
      min-height: 257mm;
      padding: 20mm 16mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      border-bottom: 1px solid ${accentColor}22;
    }
    .cover-deco {
      width: 40px;
      height: 1px;
      background: ${accentColor}66;
      margin: 10mm auto;
    }
    .cover-label {
      font-size: 0.65rem;
      letter-spacing: 6px;
      color: ${accentColor};
      font-weight: 600;
      margin-bottom: 8mm;
    }
    .cover-names {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.4rem;
      font-weight: 300;
      letter-spacing: 4px;
      line-height: 1.2;
    }
    .cover-amp {
      display: block;
      font-family: 'Dancing Script', cursive;
      font-size: 1.6rem;
      color: ${accentColor};
      opacity: 0.6;
      margin: 4mm 0;
    }
    .cover-date {
      font-size: 0.8rem;
      letter-spacing: 3px;
      color: #6B7280;
      margin-top: 6mm;
    }
    .cover-count {
      margin-top: 3mm;
      font-size: 0.72rem;
      color: #9CA3AF;
      letter-spacing: 1px;
    }

    /* 카드 섹션 — 2페이지부터 */
    .cards-section {
      padding: 16mm 16mm 20mm;
    }

    /* 카드 그리드 — 연속 흐름 */
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6mm;
    }
    .gb-card {
      border: 1px solid ${accentColor}33;
      border-radius: 6px;
      padding: 5mm 5mm 6mm;
      background: ${bgColor};
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .gb-card-header {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 4mm;
      padding-bottom: 3mm;
      border-bottom: 1px solid ${accentColor}22;
    }
    .gb-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .gb-name {
      font-weight: 700;
      font-size: 0.82rem;
      color: #1F2937;
      flex: 1;
    }
    .gb-side {
      font-size: 0.62rem;
      color: ${accentColor};
      border: 1px solid ${accentColor}55;
      border-radius: 10px;
      padding: 1px 6px;
      font-weight: 600;
      white-space: nowrap;
    }
    .gb-date {
      font-size: 0.6rem;
      color: #9CA3AF;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .gb-content {
      font-size: 0.78rem;
      line-height: 1.75;
      color: #374151;
      word-break: keep-all;
      font-family: ${fontFamily};
    }

    /* 인쇄 */
    @media print {
      @page { size: A4 portrait; margin: 14mm 12mm; }
      html, body { background: white; }
      #pdf-toolbar { display: none !important; }
      #paper {
        width: 100%;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }
      .cover {
        min-height: calc(297mm - 28mm);
        padding: 0;
        border-bottom: none;
        break-after: page;
        page-break-after: always;
      }
      .cards-section { padding: 0; }
      .gb-card { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div id="pdf-toolbar">
    <button id="pdf-btn" onclick="window.print()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
      PDF로 저장
    </button>
    <span id="pdf-hint">Chrome → 인쇄 → 대상: PDF로 저장</span>
  </div>

  <div id="paper">
    <div class="cover">
      <p class="cover-label">WEDDING GUEST BOOK</p>
      <div class="cover-deco"></div>
      <div class="cover-names">
        ${groomName}<span class="cover-amp">&amp;</span>${brideName}
      </div>
      <div class="cover-deco"></div>
      ${weddingDate ? `<p class="cover-date">${weddingDate}</p>` : ''}
      <p class="cover-count">${messages.length}개의 방명록</p>
    </div>

    <div class="cards-section">
      <div class="cards-grid">
        ${cards}
      </div>
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) throw new Error('팝업이 차단되었습니다. 브라우저 팝업 허용 후 다시 시도해주세요.');
  win.document.write(html);
  win.document.close();
}
