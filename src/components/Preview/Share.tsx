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
    toast.success('留곹겕媛 蹂듭궗?섏뿀?듬땲??');
  };

  const handleKakaoShare = () => {
    if (!shareEnabled) return;
    if (!window.Kakao || !window.Kakao.isInitialized()) return;
    const title = data.shareTitle || `${data.groomName || '?좊옉'} ??${data.brideName || '?좊?'} 寃고샎?⑸땲??;
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
      buttons: [{ title: '泥?꺽??蹂닿린', link: { mobileWebUrl: shareLink, webUrl: shareLink } }],
    });
  };

  return (
    <section className="share section" style={{ fontFamily: data.fontFamily }} aria-label="怨듭쑀">
      {shareEnabled ? (
        <div className="share-buttons">
          <button className="share-btn kakao" onClick={handleKakaoShare}>
            <Share2 size={20} />
            <span>移댁뭅?ㅽ넚 怨듭쑀?섍린</span>
          </button>
          <button className="share-btn link" onClick={handleCopyLink}>
            <Link size={20} />
            <span>留곹겕 蹂듭궗?섍린</span>
          </button>
        </div>
      ) : (
        <div className="share-locked">
          <Lock size={20} />
          <p className="share-locked-title">怨듭쑀 湲곕뒫? ?꾨━誘몄뾼 ?꾩슜?낅땲??/p>
          <p className="share-locked-desc">?꾨━誘몄뾼?쇰줈 ?낃렇?덉씠?쒗븯硫?br />移댁뭅?ㅽ넚 怨듭쑀 쨌 留곹겕 蹂듭궗媛 媛?ν빀?덈떎.</p>
        </div>
      )}

      <footer className="footer">
        <p>Copyright 짤 2026 {data.groomName || '?좊옉'} & {data.brideName || '?좊?'}. All rights reserved.</p>
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

