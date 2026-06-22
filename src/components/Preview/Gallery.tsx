import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { InvitationData } from '../../types';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface PreviewProps {
  data: InvitationData;
}

const Gallery: React.FC<PreviewProps> = React.memo(({ data }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const lightboxTrapRef = useFocusTrap(selectedIndex !== null);

  const [previewIdx, setPreviewIdx] = useState(0);

  const lbDragStartX = useRef(0);
  const lbDragDelta = useRef(0);
  const lbDragging = useRef(false);
  const lbTrackRef = useRef<HTMLDivElement>(null);
  const lbVpRef = useRef<HTMLDivElement>(null);

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

  const slideIdxRef = useRef(slideIdx);
  slideIdxRef.current = slideIdx;
  const slDrag = makeDrag(slideIdxRef, setSlideIdx, slideDragDelta, slideDragStartX, slideDragging, slideTrackRef, slideVpRef, data.photos.length);

  const selectedIdxRef = useRef(selectedIndex || 0);
  selectedIdxRef.current = selectedIndex || 0;
  const setSelectedSafe = (v: number) => setSelectedIndex(v);
  const lbDrag = makeDrag(selectedIdxRef, setSelectedSafe, lbDragDelta, lbDragStartX, lbDragging, lbTrackRef, lbVpRef, data.photos.length);

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

  const closeLightbox = () => { setSelectedIndex(null); document.body.style.overflow = 'auto'; };
  const nextImage = () => { if (selectedIndex !== null) setSelectedIndex((selectedIndex + 1) % data.photos.length); };
  const prevImage = () => { if (selectedIndex !== null) setSelectedIndex((selectedIndex - 1 + data.photos.length) % data.photos.length); };

  const handleThumbClick = (index: number) => {
    setPreviewIdx(index);
  };

  const [photoRatios, setPhotoRatios] = useState<number[]>([]);
  const pvDragStartX2 = useRef(0);
  const pvDragDelta2 = useRef(0);
  const pvDragging2 = useRef(false);
  const pvTrackRef2 = useRef<HTMLDivElement>(null);
  const pvVpRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      data.photos.map(src => new Promise<number>(resolve => {
        const img = new Image();
        img.onload = () => resolve(img.height / img.width);
        img.onerror = () => resolve(1);
        img.src = src;
      }))
    ).then(ratios => { if (!cancelled) setPhotoRatios(ratios); });
    return () => { cancelled = true; };
  }, [data.photos]);

  const previewIdxRef2 = useRef(previewIdx);
  previewIdxRef2.current = previewIdx;
  const pvDrag2 = makeDrag(previewIdxRef2, setPreviewIdx, pvDragDelta2, pvDragStartX2, pvDragging2, pvTrackRef2, pvVpRef2, data.photos.length);

  const renderPreviewSlider = () => {
    const currentRatio = photoRatios[previewIdx] || 0.75;
    return (
      <div className="pv-preview">
        <div
          className="pv-preview-vp"
          ref={pvVpRef2}
          style={{ paddingBottom: `${currentRatio * 100}%` }}
          onTouchStart={e => pvDrag2.onStart(e.touches[0].clientX)}
          onTouchMove={e => pvDrag2.onMove(e.touches[0].clientX)}
          onTouchEnd={pvDrag2.onEnd}
          onMouseDown={e => { e.preventDefault(); pvDrag2.onStart(e.clientX); }}
          onMouseMove={e => pvDrag2.onMove(e.clientX)}
          onMouseUp={pvDrag2.onEnd}
          onMouseLeave={pvDrag2.onEnd}
        >
          <div className="pv-preview-track" ref={pvTrackRef2} style={{ transform: `translateX(-${previewIdx * 100}%)` }}>
            {data.photos.map((src, i) => (
              <div key={i} className="pv-preview-item">
                <img src={src} alt={`Preview ${i}`} draggable="false" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
        <div className="pv-preview-counter">{previewIdx + 1} / {data.photos.length}</div>
        {data.photos.length > 1 && (
          <div className="gallery-slide-dots">
            {data.photos.map((_, i) => (
              <button key={i} className={`gallery-slide-dot ${i === previewIdx ? 'active' : ''}`} onClick={() => setPreviewIdx(i)} aria-label={`사진 ${i + 1}`} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const style = data.galleryStyle === 'style3' ? 'style3' : 'slide';

  return (
    <section className="gallery section" aria-label="갤러리">
      <h2>GALLERY</h2>
      <p className="section-sub">소중한 순간을 담은 우리의 사진들</p>
      {data.photos.length > 0 ? (
        <>
          {style === 'style3' && renderPreviewSlider()}

          {style === 'slide' && (
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
                      <img src={src} alt={`Gallery ${index}`} draggable="false" loading="lazy" decoding="async" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="gallery-slide-counter">{slideIdx + 1} / {data.photos.length}</div>
              {data.photos.length > 1 && (
                <div className="gallery-slide-dots">
                  {data.photos.map((_, i) => (
                    <button key={i} className={`gallery-slide-dot ${i === slideIdx ? 'active' : ''}`} onClick={() => setSlideIdx(i)} aria-label={`사진 ${i + 1}`} />
                  ))}
                </div>
              )}
            </div>
          )}

          {style === 'style3' && (
            <MasonryGrid photos={data.photos} previewIdx={previewIdx} onThumbClick={handleThumbClick} />
          )}
        </>
      ) : (
        <div className="gallery-empty">
          <span>갤러리 사진을 등록해주세요</span>
        </div>
      )}

      {selectedIndex !== null && (
        <div className="lightbox-overlay" role="dialog" aria-modal="true" aria-label="사진 확대 보기" ref={lightboxTrapRef}>
          <div className="lightbox-backdrop" onClick={closeLightbox} />
          <button className="close-btn" onClick={closeLightbox} aria-label="닫기"><X size={32} /></button>
          <div
            className="lightbox-slide-vp"
            ref={lbVpRef}
            onTouchStart={e => lbDrag.onStart(e.touches[0].clientX)}
            onTouchMove={e => lbDrag.onMove(e.touches[0].clientX)}
            onTouchEnd={lbDrag.onEnd}
            onMouseDown={e => { e.preventDefault(); lbDrag.onStart(e.clientX); }}
            onMouseMove={e => lbDrag.onMove(e.clientX)}
            onMouseUp={lbDrag.onEnd}
            onMouseLeave={lbDrag.onEnd}
          >
            <div className="lightbox-slide-track" ref={lbTrackRef} style={{ transform: `translateX(-${(selectedIndex ?? 0) * 100}%)` }}>
              {data.photos.map((src, i) => (
                <div key={i} className="lightbox-slide-item">
                  <img src={src} alt={`Full ${i + 1}`} draggable="false" />
                </div>
              ))}
            </div>
          </div>
          <div className="index-indicator">{selectedIndex! + 1} / {data.photos.length}</div>
        </div>
      )}

      <style>{`
        /* Preview (style3) */
        .pv-preview { margin-bottom: 16px; }
        .pv-preview-vp {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          cursor: grab;
          user-select: none;
          transition: padding-bottom 0.3s ease;
        }
        .pv-preview-vp:active { cursor: grabbing; }
        .pv-preview-track { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; transition: transform 0.35s ease; }
        .pv-preview-item { width: 100%; flex-shrink: 0; height: 100%; display: flex; align-items: center; justify-content: center; }
        .pv-preview-item img { width: 100%; height: 100%; object-fit: contain; display: block; }
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
        .photo-item img { width: 100%; height: 100%; object-fit: contain; background: var(--wedding-bg); }

        /* Masonry (style3) */
        .masonry-balanced {
          display: flex;
          gap: 8px;
        }
        .masonry-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .masonry-item {
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
        .lightbox-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 99999; }
        .lightbox-backdrop { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: var(--wedding-bg); }
        .close-btn { position: absolute; top: 20px; right: 20px; color: var(--wedding-text-sub); background: var(--wedding-card-bg); border: 1px solid var(--wedding-border); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; transition: all 0.2s; }
        .close-btn:hover { background: var(--wedding-border); color: var(--wedding-text-main); }
        .lightbox-slide-vp { position: relative; z-index: 1; width: 100%; height: 80vh; overflow: hidden; cursor: grab; user-select: none; }
        .lightbox-slide-vp:active { cursor: grabbing; }
        .lightbox-slide-track { display: flex; height: 100%; transition: transform 0.35s ease; }
        .lightbox-slide-item { width: 100%; flex-shrink: 0; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
        .lightbox-slide-item img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
        .lightbox-overlay .index-indicator { position: relative; z-index: 1; margin-top: 15px; color: var(--wedding-text-sub); font-size: 0.85em; background: var(--wedding-card-bg); border: 1px solid var(--wedding-border); padding: 6px 16px; border-radius: 20px; font-weight: 600; }
      `}</style>
    </section>
  );
}, (prev, next) =>
  prev.data.photos === next.data.photos
  && prev.data.galleryStyle === next.data.galleryStyle
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
);

interface MasonryProps {
  photos: string[];
  previewIdx: number;
  onThumbClick: (index: number) => void;
}

const MasonryGrid: React.FC<MasonryProps> = ({ photos, previewIdx, onThumbClick }) => {
  const [cols, setCols] = useState<[number[], number[]]>([[], []]);

  useEffect(() => {
    let cancelled = false;
    const loadHeights = async () => {
      const heights = await Promise.all(
        photos.map(src => new Promise<number>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img.height / img.width);
          img.onerror = () => resolve(1);
          img.src = src;
        }))
      );
      if (cancelled) return;
      const left: number[] = [];
      const right: number[] = [];
      let lH = 0, rH = 0;
      heights.forEach((ratio, i) => {
        if (lH <= rH) { left.push(i); lH += ratio; }
        else { right.push(i); rH += ratio; }
      });
      setCols([left, right]);
    };
    loadHeights();
    return () => { cancelled = true; };
  }, [photos]);

  return (
    <div className="masonry-balanced">
      {cols.map((col, ci) => (
        <div key={ci} className="masonry-col">
          {col.map(i => (
            <div key={i} className={`masonry-item ${i === previewIdx ? 'selected' : ''}`} onClick={() => onThumbClick(i)}>
              <img src={photos[i]} alt={`Gallery ${i}`} loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Gallery;
