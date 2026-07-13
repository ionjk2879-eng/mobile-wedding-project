import React, { useEffect } from 'react';
import { Share2, Link, Lock } from 'lucide-react';
import { InvitationData } from '../../types';
import { toast } from '../../stores/useToastStore';
import { getDefaultShareTitle, getDefaultShareDescription } from '../../utils/shareDefaults';

interface PreviewProps {
  data: InvitationData;
  shareEnabled?: boolean;
}

const KAKAO_APP_KEY = '5a920b742f037d8e9cb29865ca00c909';
const SITE_ORIGIN = 'https://sonett.kr';

function ensureKakaoInit() {
  if (!window.Kakao) return false;
  if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_APP_KEY);
  return window.Kakao.isInitialized();
}

const Share: React.FC<PreviewProps> = React.memo(({ data, shareEnabled = false }) => {
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';

  useEffect(() => {
    if (shareEnabled) ensureKakaoInit();
  }, [shareEnabled]);

  const shareLink = data.slug ? `${SITE_ORIGIN}/${data.slug}` : window.location.href;

  const handleCopyLink = () => {
    if (!shareEnabled) return;
    navigator.clipboard.writeText(shareLink);
    toast.success(isEn ? 'Link copied!' : isJa ? 'コピーしました' : '링크가 복사되었습니다');
  };

  const handleKakaoShare = async () => {
    if (!shareEnabled) return;
    if (!ensureKakaoInit()) {
      toast.error(isEn ? 'Kakao SDK not loaded yet. Please try again.' : isJa ? 'Kakao SDKの読み込みが完了していません。' : '카카오 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    const title = data.shareTitle || getDefaultShareTitle(data);
    // 신랑/신부 이름은 이미 title(플랫폼별로 굵게 렌더링되는 영역)에 들어있어
    // description에는 날짜만 넣어 중복을 없앰
    const description = data.shareDescription || getDefaultShareDescription(data);
    const slug = data.slug || '';
    const imageUrl = slug ? `${SITE_ORIGIN}/og/${slug}` : `${SITE_ORIGIN}/og-image.png`;

    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          description,
          imageUrl,
          link: { mobileWebUrl: shareLink, webUrl: shareLink },
        },
      });
    } catch (e: any) {
      toast.error(`${isEn ? 'KakaoTalk share error' : isJa ? 'カカオ共有エラー' : '카카오 공유 오류'}: ${e?.message || (isEn ? 'Unknown error' : isJa ? '不明なエラー' : '알 수 없는 오류')}`);
    }
  };

  return (
    <section className="share section" style={{ fontFamily: data.fontFamily }} aria-label="공유">
      {shareEnabled ? (
        <div className="share-buttons">
          <button className="share-btn kakao" onClick={handleKakaoShare}>
            <Share2 size={20} />
            <span>{isEn ? 'Share on KakaoTalk' : isJa ? 'カカオでシェア' : '카카오톡 공유하기'}</span>
          </button>
          <button className="share-btn link" onClick={handleCopyLink}>
            <Link size={20} />
            <span>{isEn ? 'Copy Link' : isJa ? 'リンクをコピー' : '링크 복사하기'}</span>
          </button>
        </div>
      ) : (
        <div className="share-locked">
          <Lock size={20} />
          <p className="share-locked-title">{isEn ? 'Sharing is a paid feature' : isJa ? '共有は有料サービスです' : '공유 기능은 유료 서비스입니다'}</p>
          <p className="share-locked-desc">{isEn ? 'Upgrade to share via KakaoTalk\nand copy the link.' : isJa ? '有料プランに変更すると\nカカオ共有とリンクコピーが可能です。' : '유료로 전환하시면\n카카오톡 공유 및 링크 복사가 가능합니다.'}</p>
        </div>
      )}

      <footer className="footer">
        <p>Copyright &copy; 2026 {data.groomName || (isJa ? '新郎' : '신랑')} &amp; {data.brideName || (isJa ? '新婦' : '신부')}. All rights reserved.</p>
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