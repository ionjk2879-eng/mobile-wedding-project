import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InvitationData } from '../types';
import Hero from '../components/Preview/Hero';
import previewCss from '../styles/preview.css?raw';

async function toBase64(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch { return url; }
}

export async function downloadHeroPng(data: InvitationData): Promise<void> {
  const theme = data.theme || 'blush';
  const fontSize = data.fontSize === 'small' ? '13px' : data.fontSize === 'large' ? '16px' : '14.5px';

  // 이미지 base64 변환
  const heroData: InvitationData = {
    ...data,
    heroPhoto:  await toBase64(data.heroPhoto  || ''),
    heroPhoto2: await toBase64(data.heroPhoto2 || ''),
  };

  const customStyle = [
    data.customBgColor    ? `--wedding-bg:${data.customBgColor};`    : '',
    data.customAccentColor ? `--wedding-main:${data.customAccentColor};--wedding-accent:${data.customAccentColor};` : '',
  ].join('');

  const heroHtml = renderToStaticMarkup(createElement(Hero, { data: heroData }));

  const fileName = `${(data.groomName || '신랑').replace(/\s/g,'')}-${(data.brideName || '신부').replace(/\s/g,'')}-대표이미지.png`;

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Gowun+Batang&family=Gowun+Dodum&family=Nanum+Myeongjo:wght@400;700&family=Dancing+Script&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #f0f0f0; display: flex; align-items: flex-start; justify-content: center; min-height: 100vh; }
    .invitation-page { width: 430px; background-color: var(--wedding-bg, #fff); font-size: ${fontSize}; font-family: ${data.fontFamily || "'Pretendard', sans-serif"}; }
    ${previewCss}

    #capture-btn {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 8px;
      padding: 14px 28px; background: #B07A8E; color: white; border: none; border-radius: 30px;
      font-size: 0.95rem; font-weight: 700; font-family: 'Pretendard', sans-serif;
      cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999;
    }
    #capture-btn:hover { opacity: 0.85; }
    #status { position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.6); color: white; padding: 8px 20px; border-radius: 20px;
      font-size: 0.8rem; font-family: 'Pretendard', sans-serif; display: none; z-index: 9999; }
  </style>
</head>
<body>
  <div id="status">이미지 생성 중...</div>
  <div class="invitation-page theme-${theme}" style="${customStyle}">
    ${heroHtml}
  </div>
  <button id="capture-btn" onclick="capture()">PNG로 저장</button>
  <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
  <script>
    function capture() {
      var status = document.getElementById('status');
      var btn = document.getElementById('capture-btn');
      status.style.display = 'block';
      btn.style.display = 'none';
      var el = document.querySelector('.invitation-page');

      // 애니메이션 제거 후 최종 렌더링 상태로 캡처
      var freezeStyle = document.createElement('style');
      freezeStyle.textContent = '* { animation: none !important; transition: none !important; }';
      document.head.appendChild(freezeStyle);

      requestAnimationFrame(function() {
        var bg = window.getComputedStyle(el).backgroundColor;
        if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') bg = '#ffffff';

        html2canvas(el, { scale: 3, useCORS: true, allowTaint: false, backgroundColor: bg, logging: false })
          .then(function(canvas) {
            document.head.removeChild(freezeStyle);
            var link = document.createElement('a');
            link.download = '${fileName}';
            link.href = canvas.toDataURL('image/png');
            link.click();
            status.textContent = '✓ 저장 완료';
            setTimeout(function() { btn.style.display='flex'; status.style.display='none'; }, 2000);
          })
          .catch(function(e) {
            document.head.removeChild(freezeStyle);
            status.textContent = '오류: ' + e.message;
            btn.style.display = 'flex';
          });
      });
    }
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=500,height=700');
  if (!win) throw new Error('팝업이 차단되었습니다. 브라우저 팝업 허용 후 다시 시도해주세요.');
  win.document.write(html);
  win.document.close();
}