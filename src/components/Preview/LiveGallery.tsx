import React, { useEffect, useState } from 'react';
import { InvitationData } from '../../types';
import { fetchGalleryPhotoCount } from '../../services/galleryService';
import { Camera, Lock } from 'lucide-react';

interface PreviewProps {
  data: InvitationData;
  guestCode?: string;
  // 소유자가 에디터/전체화면 미리보기 등 내부 경로로 볼 때는 예식일 전이라도
  // 아래 날짜 잠금을 건너뛰고 평소 업로드 UI를 그대로 보여준다.
  isOwnerPreview?: boolean;
}

const formatFullDate = (d: Date, isEn: boolean, isJa: boolean) => {
  if (isEn) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  if (isJa) return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const formatShortDate = (d: Date, isEn: boolean, isJa: boolean) => {
  if (isEn) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }
  if (isJa) return `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

// 새로 추가된 기능이라 기존에 저장된 청첩장에는 이 값이 아예 없으므로,
// 다른 토글(!== false, 기본 켜짐)과 반대로 명시적으로 켠 경우에만 노출한다(기본 꺼짐).
const LiveGallery: React.FC<PreviewProps> = React.memo(({ data, guestCode, isOwnerPreview }) => {
  const [count, setCount] = useState<number | null>(null);
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';

  const weddingDate = data.weddingDateISO ? new Date(data.weddingDateISO) : null;
  const isLocked = !isOwnerPreview && !!weddingDate && !isNaN(weddingDate.getTime()) && Date.now() < weddingDate.getTime();

  useEffect(() => {
    if (data.isLiveGalleryEnabled !== true || !data.slug || isLocked) return;
    let cancelled = false;
    fetchGalleryPhotoCount(data.slug).then((c) => { if (!cancelled) setCount(c); }).catch(() => {});
    return () => { cancelled = true; };
  }, [data.slug, data.isLiveGalleryEnabled, isLocked]);

  if (data.isLiveGalleryEnabled !== true) return null;

  if (isLocked && weddingDate) {
    const fullDate = formatFullDate(weddingDate, isEn, isJa);
    const shortDate = formatShortDate(weddingDate, isEn, isJa);
    return (
      <section className="livegallery-section section" style={{ fontFamily: data.fontFamily }} aria-label="라이브 갤러리">
        <h2>{isEn ? 'Live Gallery' : isJa ? 'ライブギャラリー' : '라이브 갤러리'}</h2>
        <div className="livegallery-locked">
          <p className="livegallery-locked-title">
            {isEn ? `Photo & video uploads open on ${fullDate}.` : isJa ? `${fullDate}から写真・動画のアップロードができます。` : `${fullDate}부터 사진 및 영상 업로드가 가능합니다.`}
          </p>
          <div className="livegallery-locked-divider" />
          <p className="livegallery-locked-desc">
            {isEn
              ? <>We can't wait to see the wedding day through your eyes.<br />Please capture and share the moments that matter to you.</>
              : isJa
              ? <>結婚式当日、皆様が捉えてくださる大切な瞬間を一緒に分かち合いたいです。<br />その日の感動と思い出を写真や動画に残してください。</>
              : <>결혼식 날, 여러분이 담아주신 소중한 순간들을 함께 나누고 싶어요.<br />그날의 감동과 추억을 사진과 영상으로 남겨주세요.</>}
          </p>
          <button type="button" className="livegallery-locked-btn" disabled aria-disabled="true">
            <Lock size={14} />
            {isEn ? `Upload Photos & Videos (Opens ${shortDate})` : isJa ? `写真・動画をアップロード（${shortDate}に公開）` : `사진 및 영상 업로드 (${shortDate} OPEN)`}
          </button>
        </div>
      </section>
    );
  }

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
  && prev.data.weddingDateISO === next.data.weddingDateISO
  && prev.guestCode === next.guestCode
  && prev.isOwnerPreview === next.isOwnerPreview
);

export default LiveGallery;
