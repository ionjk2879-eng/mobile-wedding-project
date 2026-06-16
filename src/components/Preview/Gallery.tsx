import React, { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Gallery: React.FC<PreviewProps> = ({ data }) => {
  const isEn = data.language === 'en';
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const minSwipeDistance = 50;

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % data.photos.length);
  };

  const prevImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + data.photos.length) % data.photos.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  return (
    <section className="gallery section">
      <h2>{isEn ? 'GALLERY' : '갤러리'}</h2>
      <div className="photo-grid">
        {data.photos.map((src, index) => (
          <div key={index} className="photo-item" onClick={() => openLightbox(index)}>
            <img src={src} alt={`Gallery ${index}`} />
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div 
          className="lightbox-overlay" 
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="lightbox-backdrop" />
          
          <button className="close-btn" onClick={closeLightbox} aria-label="Close">
            <X size={32} />
          </button>
          
          <button className="nav-btn prev" onClick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Previous">
            <ChevronLeft size={48} />
          </button>
          
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <img 
              src={data.photos[selectedIndex]} 
              alt={`Full view ${selectedIndex + 1}`} 
              className="lightbox-image"
              draggable="false"
            />
            <div className="index-indicator">
              {selectedIndex + 1} / {data.photos.length}
            </div>
          </div>
          
          <button className="nav-btn next" onClick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Next">
            <ChevronRight size={48} />
          </button>
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
          transition: transform 0.2s ease;
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
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          touch-action: none;
        }
        .lightbox-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(5px);
        }
        .lightbox-container {
          position: relative;
          z-index: 1;
          max-width: 90%;
          max-height: 85%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none; /* Let touches pass to overlay */
        }
        .lightbox-image {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          box-shadow: 0 0 50px rgba(0,0,0,0.5);
          user-select: none;
          pointer-events: auto; /* Re-enable for the image specifically if needed, but overlay handles swipe */
        }
        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
          transition: background 0.2s;
        }
        .close-btn:hover { background: rgba(255, 255, 255, 0.2); }
        
        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: white;
          background: none;
          border: none;
          cursor: pointer;
          padding: 20px;
          z-index: 100;
          opacity: 0.6;
          transition: all 0.2s;
        }
        .nav-btn:hover { opacity: 1; scale: 1.1; }
        .prev { left: 10px; }
        .next { right: 10px; }

        .index-indicator {
          margin-top: 15px;
          color: white;
          font-size: 0.9rem;
          background: rgba(255,255,255,0.1);
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 500;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .nav-btn { display: none; }
          .lightbox-image { max-height: 70vh; }
        }
      `}</style>
    </section>
  );
};

export default Gallery;
