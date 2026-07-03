import React from 'react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const MidPhoto: React.FC<PreviewProps> = React.memo(({ data }) => {
  const caption = data.midPhotoCaption || '';
  const photoPos = `${data.midPhotoX ?? 50}% ${data.midPhotoY ?? 50}%`;

  return (
    <section className="midphoto" aria-label="중간사진">
      <div className="midphoto-frame">
        {data.midPhoto ? (
          <img src={data.midPhoto} alt="" className="midphoto-photo" style={{ objectPosition: photoPos }} />
        ) : (
          <div className="midphoto-photo-empty"><span>중간 사진을 등록해주세요</span></div>
        )}
        {caption && (
          <div className="midphoto-overlay">
            <p className="midphoto-caption">
              {caption.split('\n').map((line, i) => <span key={i}>{line}</span>)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}, (prev, next) =>
  prev.data.midPhoto === next.data.midPhoto
  && prev.data.midPhotoX === next.data.midPhotoX
  && prev.data.midPhotoY === next.data.midPhotoY
  && prev.data.midPhotoCaption === next.data.midPhotoCaption
);

export default MidPhoto;
