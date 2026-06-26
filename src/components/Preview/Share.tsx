import React, { useEffect } from 'react';
import { Share2, Link, Lock } from 'lucide-react';
import { InvitationData } from '../../types';
import { toast } from '../../stores/useToastStore';

interface PreviewProps {
  data: InvitationData;
  shareEnabled?: boolean;
}

const KAKAO_APP_KEY = '5a920b742f037d8e9cb29865ca00c909';
const SITE_ORIGIN = 'https://sonett.kr';

const Share: React.FC<PreviewProps> = React.memo(({ data, shareEnabled = false }) => {
  useEffect(() => {
    if (!shareEnabled) return;
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_APP_KEY);
    }
  }, [shareEnabled]);

  const shareLink = data.slug ? `${SITE_ORIGIN}/w/${data.slug}` : window.location.href;

  const handleCopyLink = () => {
    if (!shareEnabled) return;
    navigator.clipboard.writeText(shareLink);
    toast.success('링크가 복사되었습니다');
  };

  const handleKakaoShare = () => {
    if (!shareEnabled) return;
    if (!window.Kakao || !window.Kakao.isInitialized()) return;
    const title = data.shareTitle || `${data.groomName || '신랑'} ♥ ${data.brideName || '신부'} 결혼합니다`;
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
      {shareEnabled ? (
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
      ) : (
        <div className="share-locked">
          <Lock size={20} />
          <p className="share-locked-title">공유 기능은 유료 서비스입니다</p>
          <p className="share-locked-desc">유료로 전환하시면<br />카카오톡 공유 및 링크 복사가 가능합니다.</p>
        </div>
      )}

      <footer className="footer">
        <p>Copyright &copy; 2026 {data.groomName || '신랑'} &amp; {data.brideName || '신부'}. All rights reserved.</p>
      </footer>

    </section>
  );
}, (prev, next) =>
  prev.data.slug === next.data.slug
  && prev.shareEnabled === next.shareEnabled
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