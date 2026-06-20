import React, { useState, useRef, useEffect } from 'react';
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
  const isDragging = useRef(false);
  const minSwipeDistance = 50;

  const [previewIdx, setPreviewIdx] = useState(0);
  const pvDragStartX = useRef(0);
  const pvDragDelta = useRef(0);
  const pvDragging = useRef(false);
  const pvTrackRef = useRef<HTMLDivElement>(null);
  const pvVpRef = useRef<HTMLDivElement>(null);

  const [slideIdx, setSlideIdx] = useState(0);
  const slideDragStartX = useRef(0);
  const slideDragDelta = useRef(0);
  const slideDragging = useRef(false);
  const slideTrackRef = useRef<HTMLDivElement>(null);
  const slideVpRef = useRef<HTMLDivElement>(null);

  const makeDrag = (
    idxRef: { current: number },
    setIdx: (v: number) => void,
    deltaRef: React.MutableRefObject<number>,
    startRef: React.MutableRefObject<number>,
    draggingRef: React.MutableRefObject<boolean>,
    trackRef: React.RefObject<HTMLDivElement>,
    vpRef: React.RefObject<HTMLDivElement>,
    total: number
  ) => ({
    onStart: (x: number) => {
      draggingRef.current = true;
      startRef.current = x;
      deltaRef.current = 0;
      if (trackRef.current) trackRef.current.style.transition = 'none';
    },
    onMove: (x: number) => {
      if (!draggingRef.current) return;
      deltaRef.current = x - startRef.current;
      if (trackRef.current) {
        const w = vpRef.current?.clientWidth || 1;
        trackRef.current.style.transform = `translateX(${-(idxRef.current * 100) + (deltaRef.current / w) * 100}%)`;
      }
    },
    onEnd: () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (trackRef.current) trackRef.current.style.transition = 'transform 0.35s ease';
      if (deltaRef.current < -40 && idxRef.current < total - 1) setIdx(idxRef.current + 1);
      else if (deltaRef.current > 40 && idxRef.current > 0) setIdx(idxRef.current - 1);
      else if (trackRef.current) trackRef.current.style.transform = `translateX(-${idxRef.current * 100}%)`;
    },
  });

  const previewIdxRef = useRef(previewIdx);
  previewIdxRef.current = previewIdx;
  const pvDrag = makeDrag(previewIdxRef, setPreviewIdx, pvDragDelta, pvDragStartX, pvDragging, pvTrackRef, pvVpRef, data.photos.length);

  const slideIdxRef = useRef(slideIdx);
  slideIdxRef.current = slideIdx;
  const slDrag = makeDrag(slideIdxRef, setSlideIdx, slideDragDelta, slideDragStartX, slideDragging, slideTrackRef, slideVpRef, data.photos.length);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  const openLightbox = (index: number) => { setSelectedIndex(index); document.body.style.overflow = 'hidden'; };
  const closeLightbox = () => { setSelectedIndex(null); document.body.style.overflow = 'auto'; };
  const nextImage = () => { if (selectedIndex !== null) setSelectedIndex((selectedIndex + 1) % data.photos.length); };
  const prevImage = () => { if (selectedIndex !== null) setSelectedIndex((selectedIndex - 1 + data.photos.length) % data.photos.length); };

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; touchEndX.current = null; };
  const onTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const onTouchEnd = () => { handleSwipe(); };
  const onMouseDown = (e: React.MouseEvent) => { touchStartX.current = e.clientX; isDragging.current = true; };
  const onMouseMove = (e: React.MouseEvent) => { if (isDragging.current) touchEndX.current = e.clientX; };
  const onMouseUp = () => { if (isDragging.current) { isDragging.current = false; handleSwipe(); } };
  const handleSwipe = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const d = touchStartX.current - touchEndX.current;
    if (d > minSwipeDistance) nextImage();
    else if (d < -minSwipeDistance) prevImage();
    touchStartX.current = null; touchEndX.current = null;
  };

  const handleThumbClick = (index: number) => {
    setPreviewIdx(index);
  };

  const renderPreviewSlider = () => (
    <div className="pv-preview">
      <div
        className="pv-preview-vp"
        ref={pvVpRef}
        onTouchStart={e => pvDrag.onStart(e.touches[0].clientX)}
        onTouchMove={e => pvDrag.onMove(e.touches[0].clientX)}
        onTouchEnd={pvDrag.onEnd}
        onMouseDown={e => { e.preventDefault(); pvDrag.onStart(e.clientX); }}
        onMouseMove={e => pvDrag.onMove(e.clientX)}
        onMouseUp={pvDrag.onEnd}
        onMouseLeave={pvDrag.onEnd}
      >
        <div className="pv-preview-track" ref={pvTrackRef} style={{ transform: `translateX(-${previewIdx * 100}%)` }}>
          {data.photos.map((src, i) => (
            <div key={i} className="pv-preview-item">
              <img src={src} alt={`Preview ${i}`} draggable="false" />
            </div>
          ))}
        </div>
      </div>
      <div className="pv-preview-counter">{previewIdx + 1} / {data.photos.length}</div>
    </div>
  );

  const style = data.galleryStyle || 'grid';

  return (
    <section className="gallery section">
      <h2>{isEn ? 'GALLERY' : '갤러리'}</h2>
      {data.photos.length > 0 ? (
        <>
          {style === 'style3' && renderPreviewSlider()}

          {style === 'grid' && (
            <div className="photo-grid">
              {data.photos.map((src, index) => (
                <div key={index} className="photo-item" onClick={() => openLightbox(index)}>
                  <img src={src} alt={`Gallery ${index}`} />
                </div>
              ))}
            </div>
          )}

          {style === 'style2' && (
            <div className="gallery-slide">
              <div
                className="gallery-slide-vp"
                ref={slideVpRef}
                onTouchStart={e => slDrag.onStart(e.touches[0].clientX)}
                onTouchMove={e => slDrag.onMove(e.touches[0].clientX)}
                onTouchEnd={slDrag.onEnd}
                onMouseDown={e => { e.preventDefault(); slDrag.onStart(e.clientX); }}
                onMouseMove={e => slDrag.onMove(e.clientX)}
                onMouseUp={slDrag.onEnd}
                onMouseLeave={slDrag.onEnd}
              >
                <div className="gallery-slide-track" ref={slideTrackRef} style={{ transform: `translateX(-${slideIdx * 100}%)` }}>
                  {data.photos.map((src, index) => (
                    <div key={index} className="gallery-slide-item">
                      <img src={src} alt={`Gallery ${index}`} draggable="false" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="gallery-slide-counter">{slideIdx + 1} / {data.photos.length}</div>
              {data.photos.length > 1 && (
                <div className="gallery-slide-dots">
                  {data.photos.map((_, i) => (
                    <button key={i} className={`gallery-slide-dot ${i === slideIdx ? 'active' : ''}`} onClick={() => setSlideIdx(i)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {style === 'style3' && (
            <div className="photo-masonry">
              {data.photos.map((src, index) => (
                <div key={index} className={`masonry-item ${index === previewIdx ? 'selected' : ''}`} onClick={() => handleThumbClick(index)}>
                  <img src={src} alt={`Gallery ${index}`} />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="gallery-empty">
          <span>갤러리 사진을 등록해주세요</span>
        </div>
      )}

      {selectedIndex !== null && (
        <div
          className="lightbox-overlay"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        >
          <div className="lightbox-backdrop" />
          <button className="close-btn" onClick={closeLightbox}><X size={32} /></button>
          <button className="nav-btn prev" onClick={e => { e.stopPropagation(); prevImage(); }}><ChevronLeft size={48} /></button>
          <div className="lightbox-container">
            <img src={data.photos[selectedIndex]} alt={`Full ${selectedIndex + 1}`} className="lightbox-image" draggable="false" />
            <div className="index-indicator">{selectedIndex + 1} / {data.photos.length}</div>
          </div>
          <button className="nav-btn next" onClick={e => { e.stopPropagation(); nextImage(); }}><ChevronRight size={48} /></button>
        </div>
      )}

      <style>{`
        /* Preview (style3) */
        .pv-preview { margin-bottom: 16px; }
        .pv-preview-vp {
          overflow: hidden;
          border-radius: 12px;
          cursor: grab;
          user-select: none;
        }
        .pv-preview-vp:active { cursor: grabbing; }
        .pv-preview-track { display: flex; transition: transform 0.35s ease; }
        .pv-preview-item {
          width: 100%;
          flex-shrink: 0;
        }
        .pv-preview-item img {
          width: 100%;
          height: auto;
          display: block;
        }
        .pv-preview-counter {
          margin-top: 10px;
          font-size: 0.85em;
          color: var(--wedding-text-sub);
          font-weight: 600;
          text-align: center;
        }

        /* Grid (style1) */
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .photo-item {
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: var(--wedding-border);
          border-radius: 6px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .photo-item:hover {
          transform: scale(1.02);
        }
        .photo-item img { width: 100%; height: 100%; object-fit: cover; }

        /* Masonry (style3) */
        .photo-masonry {
          columns: 2;
          column-gap: 8px;
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 8px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }
        .masonry-item.selected {
          border-color: var(--wedding-main);
        }
        .masonry-item img {
          width: 100%;
          display: block;
        }

        /* Slide (style2) */
        .gallery-slide { text-align: center; }
        .gallery-slide-vp { overflow: hidden; border-radius: 12px; cursor: grab; user-select: none; }
        .gallery-slide-vp:active { cursor: grabbing; }
        .gallery-slide-track { display: flex; transition: transform 0.35s ease; }
        .gallery-slide-item { width: 100%; flex-shrink: 0; aspect-ratio: 3 / 4; overflow: hidden; }
        .gallery-slide-item img { width: 100%; height: 100%; object-fit: cover; }
        .gallery-slide-counter { margin-top: 14px; font-size: 0.85em; color: var(--wedding-text-sub); font-weight: 600; }
        .gallery-slide-dots { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
        .gallery-slide-dot { width: 8px; height: 8px; border-radius: 50%; border: none; background: var(--wedding-border); padding: 0; cursor: pointer; transition: all 0.25s; }
        .gallery-slide-dot.active { background: var(--wedding-main); width: 20px; border-radius: 4px; }

        .gallery-empty { width: 100%; padding: 60px 0; display: flex; align-items: center; justify-content: center; background: var(--wedding-card-bg); border: 2px dashed var(--wedding-border); border-radius: 12px; }
        .gallery-empty span { font-size: 0.9em; color: var(--wedding-text-sub); }

        /* Lightbox */
        .lightbox-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 99999; touch-action: none; }
        .lightbox-backdrop { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: var(--wedding-bg); }
        .lightbox-container { position: relative; z-index: 1; max-width: 90%; max-height: 85%; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
        .lightbox-image { max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.08); user-select: none; pointer-events: auto; }
        .close-btn { position: absolute; top: 20px; right: 20px; color: var(--wedding-text-sub); background: var(--wedding-card-bg); border: 1px solid var(--wedding-border); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; transition: all 0.2s; }
        .close-btn:hover { background: var(--wedding-border); color: var(--wedding-text-main); }
        .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); color: var(--wedding-main); background: none; border: none; cursor: pointer; padding: 20px; z-index: 100; opacity: 0.5; transition: all 0.2s; }
        .nav-btn:hover { opacity: 1; scale: 1.1; }
        .prev { left: 10px; }
        .next { right: 10px; }
        .index-indicator { margin-top: 15px; color: var(--wedding-text-sub); font-size: 0.85em; background: var(--wedding-card-bg); border: 1px solid var(--wedding-border); padding: 6px 16px; border-radius: 20px; font-weight: 600; pointer-events: none; }
        @media (max-width: 768px) { .nav-btn { display: none; } .lightbox-image { max-height: 70vh; } }
      `}</style>
    </section>
  );
};

export default Gallery;
