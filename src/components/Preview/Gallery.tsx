import React from 'react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Gallery: React.FC<PreviewProps> = ({ data }) => {
  return (
    <section className="gallery section">
      <h2>갤러리</h2>
      <div className="photo-grid">
        {data.photos.map((src, index) => (
          <div key={index} className="photo-item">
            <img src={src} alt={`Gallery ${index}`} />
          </div>
        ))}
      </div>
      <style>{`
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .photo-item {
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: var(--wedding-border);
          border-radius: 8px;
        }
        .photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </section>
  );
};

export default Gallery;
