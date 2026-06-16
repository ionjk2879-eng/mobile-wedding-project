import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Gallery: React.FC<PreviewProps> = ({ data }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % data.photos.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + data.photos.length) % data.photos.length);
  };

  return (
    <section className="gallery section">
      <h2>갤러리</h2>
      <div className="photo-grid">
        {data.photos.map((src, index) => (
          <div key={index} className="photo-item" onClick={() => openLightbox(index)}>
            <img src={src} alt={`Gallery ${index}`} />
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="close-btn" onClick={closeLightbox}><X size={30} /></button>
          <button className="nav-btn prev" onClick={prevImage}><ChevronLeft size={40} /></button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={data.photos[selectedIndex]} alt="Full view" />
          </div>
          <button className="nav-btn next" onClick={nextImage}><ChevronRight size={40} /></button>
          <div className="index-indicator">{selectedIndex + 1} / {data.photos.length}</div>
        </div>
      )}

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
          cursor: pointer;
          transition: transform 0.2s;
        }
        .photo-item:hover {
          transform: scale(1.02);
        }
        .photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }
        .lightbox-content {
          max-width: 90%;
          max-height: 80%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lightbox-content img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          box-shadow: 0 0 30px rgba(0,0,0,0.5);
        }
        .close-btn {
          position: absolute;
          top: 30px;
          right: 30px;
          color: white;
          background: none;
          border: none;
          cursor: pointer;
        }
        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: white;
          background: none;
          border: none;
          cursor: pointer;
          padding: 20px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .nav-btn:hover { opacity: 1; }
        .prev { left: 10px; }
        .next { right: 10px; }
        .index-indicator {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 0.9rem;
          background: rgba(255,255,255,0.2);
          padding: 5px 15px;
          border-radius: 20px;
        }
      `}</style>
    </section>
  );
};

export default Gallery;
