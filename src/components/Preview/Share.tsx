import React, { useEffect } from 'react';
import { Share2, Link } from 'lucide-react';
import { InvitationData } from '../../types';
import { toast } from '../../stores/useToastStore';

interface PreviewProps {
  data: InvitationData;
}

const KAKAO_APP_KEY = '5a920b742f037d8e9cb29865ca00c909';
const SITE_ORIGIN = 'https://sonett.ionjk2879.workers.dev';

const Share: React.FC<PreviewProps> = React.memo(({ data }) => {
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_APP_KEY);
    }
  }, []);

  const shareLink = data.slug ? `${SITE_ORIGIN}/w/${data.slug}` : window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('링크가 복사되었습니다.');
  };

  const handleKakaoShare = () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) return;
    const title = data.shareTitle || `${data.groomName || '신랑'} ♡ ${data.brideName || '신부'} 결혼합니다`;
    const description = data.shareDescription || `${data.date} ${data.time} | ${data.venueName}`;
    const slug = data.slug || '';
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl: slug ? `${SITE_ORIGIN}/og/${slug}` : `${SITE_ORIGIN}/og-image.png`,
        link: { mobileWebUrl: shareLink, webUrl: shareLink },
      },
      buttons: [{ title: '청첩장 보기', link: { mobileWebUrl: shareLink, webUrl: shareLink } }],
    });
  };

  return (
    <section className="share section" style={{ fontFamily: data.fontFamily }} aria-label="공유">
      <div className="share-buttons">
        <button className="share-btn kakao" onClick={handleKakaoShare}>
          <Share2 size={20} />
          <span>카카오톡 공유하기</span>
        </button>
        <button className="share-btn link" onClick={handleCopyLink}>
          <Link size={20} />
          <span>링크 복사하기</span>
        </button>
      </div>

      <footer className="footer">
        <p>Copyright © 2026 {data.groomName || '신랑'} & {data.brideName || '신부'}. All rights reserved.</p>
      </footer>

      <style>{`
        .share {
          background-color: transparent;
          padding-bottom: 40px;
        }
        .share-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 40px;
        }
        .share-btn {
          width: 100%;
          padding: 15px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 500;
          font-size: 0.95em;
          transition: all 0.2s ease;
        }
        .share-btn:hover {
          filter: brightness(0.9);
          transform: translateY(-1px);
        }
        .kakao {
          background: #fee500;
          color: #3c1e1e;
        }
        .link {
          background: transparent;
          border: 1px solid var(--wedding-main);
          color: var(--wedding-main);
        }
        .footer {
          margin-top: 40px;
          font-size: 0.75em;
          color: var(--wedding-text-sub);
        }
        @media (max-width: 480px) {
          .share-btn { padding: 12px; font-size: 0.82em; gap: 7px; }
          .share-btn svg { width: 16px; height: 16px; }
          .share-buttons { gap: 8px; margin-bottom: 30px; }
          .footer { font-size: 0.65em; margin-top: 30px; }
        }
      `}</style>
    </section>
  );
}, (prev, next) =>
  prev.data.slug === next.data.slug
  && prev.data.shareTitle === next.data.shareTitle
  && prev.data.shareDescription === next.data.shareDescription
  && prev.data.heroPhoto === next.data.heroPhoto
  && prev.data.groomName === next.data.groomName
  && prev.data.brideName === next.data.brideName
  && prev.data.date === next.data.date
  && prev.data.time === next.data.time
  && prev.data.venueName === next.data.venueName
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
);

export default Share;
