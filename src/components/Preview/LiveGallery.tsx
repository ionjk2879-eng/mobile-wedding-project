import React, { useEffect, useState } from 'react';
import { InvitationData } from '../../types';
import { fetchGalleryPhotoCount } from '../../services/galleryService';
import { Camera } from 'lucide-react';

interface PreviewProps {
  data: InvitationData;
  guestCode?: string;
}

// 새로 추가된 기능이라 기존에 저장된 청첩장에는 이 값이 아예 없으므로,
// 다른 토글(!== false, 기본 켜짐)과 반대로 명시적으로 켠 경우에만 노출한다(기본 꺼짐).
const LiveGallery: React.FC<PreviewProps> = React.memo(({ data, guestCode }) => {
  const [count, setCount] = useState<number | null>(null);
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';

  useEffect(() => {
    if (data.isLiveGalleryEnabled !== true || !data.slug) return;
    let cancelled = false;
    fetchGalleryPhotoCount(data.slug).then((c) => { if (!cancelled) setCount(c); }).catch(() => {});
    return () => { cancelled = true; };
  }, [data.slug, data.isLiveGalleryEnabled]);

  if (data.isLiveGalleryEnabled !== true) return null;

  const href = data.slug ? `/gallery/${data.slug}${guestCode ? `?code=${encodeURIComponent(guestCode)}` : ''}` : undefined;

  return (
    <section className="livegallery-section section" style={{ fontFamily: data.fontFamily }} aria-label="라이브 갤러리">
      <h2>{isEn ? 'Live Gallery' : isJa ? 'ライブギャラリー' : '라이브 갤러리'}</h2>
      <p className="section-sub">
        {isEn ? 'Share the moments you captured today' : isJa ? '今日撮った瞬間をシェアしてください' : '오늘의 순간을 사진으로 함께 나눠주세요'}
      </p>
      {count !== null && (
        <p className="livegallery-count">
          {isEn ? `${count} photo${count === 1 ? '' : 's'} shared` : isJa ? `${count}枚の写真が届いています` : `${count}장의 사진이 올라왔어요`}
        </p>
      )}
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="livegallery-btn">
          <Camera size={16} />
          {isEn ? 'View Gallery' : isJa ? 'ギャラリーを見る' : '갤러리 보러가기'}
        </a>
      ) : (
        <p style={{ fontSize: '0.82em', color: 'var(--wedding-text-sub)', textAlign: 'center', padding: '12px', background: 'var(--wedding-card-bg)', border: '1px dashed var(--wedding-border)', borderRadius: '12px' }}>
          {isEn ? 'Save your invitation first to enable the gallery.' : isJa ? '招待状を保存するとギャラリーが有効になります。' : '청첩장을 저장하면 갤러리 기능이 활성화됩니다.'}
        </p>
      )}
    </section>
  );
}, (prev, next) =>
  prev.data.isLiveGalleryEnabled === next.data.isLiveGalleryEnabled
  && prev.data.slug === next.data.slug
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
  && prev.guestCode === next.guestCode
);

export default LiveGallery;
