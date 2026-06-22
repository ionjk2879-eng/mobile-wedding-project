import React, { useEffect } from 'react';
import { Share2, Link } from 'lucide-react';
import { InvitationData } from '../../types';

declare global {
  interface Window {
    Kakao: any;
  }
}

interface PreviewProps {
  data: InvitationData;
}

const Share: React.FC<PreviewProps> = React.memo(({ data }) => {
  useEffect(() => {
    if (data.kakaoAppKey && window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(data.kakaoAppKey);
    }
  }, [data.kakaoAppKey]);

  const shareLink = data.shareUrl || window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('링크가 복사되었습니다.');
  };

  const handleKakaoShare = () => {
    if (!window.Kakao) return;

    const title = data.shareTitle || `${data.groomName} ♡ ${data.brideName} 결혼합니다`;
    const description = data.shareDescription || `${data.date} ${data.time} | ${data.venueName}`;

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl: data.heroPhoto.startsWith('data:') ? window.location.origin + '/src/assets/hero.png' : data.heroPhoto,
        link: {
          mobileWebUrl: shareLink,
          webUrl: shareLink,
        },
      },
      buttons: [
        {
          title: '모바일 청첩장 보기',
          link: {
            mobileWebUrl: shareLink,
            webUrl: shareLink,
          },
        },
      ],
    });
  };

  return (
    <section className="share section" style={{ fontFamily: data.fontFamily }}>
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
        <p>Copyright © 2026 {data.groomName} & {data.brideName}. All rights reserved.</p>
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
  && prev.data.kakaoAppKey === next.data.kakaoAppKey
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
);

export default Share;
