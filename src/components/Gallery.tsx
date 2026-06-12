import React from 'react';

const Gallery: React.FC = () => {
  const photos = [
    '/src/assets/hero.png',
    '/src/assets/hero.png',
    '/src/assets/hero.png',
    '/src/assets/hero.png',
    '/src/assets/hero.png',
    '/src/assets/hero.png',
  ];

  return (
    <section className="gallery section">
      <h2>갤러리</h2>
      <div className="photo-grid">
        {photos.map((src, index) => (
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
          background: #eee;
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
