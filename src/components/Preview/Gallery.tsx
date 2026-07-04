import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const closeLightbox = () => setSelectedIndex(null);
  const nextImage = () => { if (selectedIndex !== null) setSelectedIndex((selectedIndex + 1) % data.photos.length); };
  const prevImage = () => { if (selectedIndex !== null) setSelectedIndex((selectedIndex - 1 + data.photos.length) % data.photos.length); };

  // 라이트박스가 열려있는 동안 배경 스크롤 잠금
  useEffect(() => {
    if (selectedIndex === null) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedIndex]);

  const handleThumbClick = (index: number) => {
    setPreviewIdx(index);
    setSelectedIndex(index);
  };

  // 스와이프 드래그 끝에 발생하는 클릭까지 라이트박스가 열리지 않도록,
  // 드래그 이동량이 작을 때(탭으로 간주)만 실제로 오픈한다.
  const openIfTap = (deltaRef: React.MutableRefObject<number>, index: number) => {
    if (Math.abs(deltaRef.current) < 10) setSelectedIndex(index);
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
              <div key={i} className="pv-preview-item" onClick={() => openIfTap(pvDragDelta2, i)}>
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

  // 라이트박스는 document.body로 포털링되어(아래 참고) 테마 wrapper(.invitation-page)
  // DOM 서브트리 바깥에 렌더링되므로, CSS 변수/폰트를 이 엘리먼트에 직접 다시 적용해야 한다.
  const lightboxThemeClass = `theme-${data.theme || 'blush'}`;
  const lightboxThemeStyle: React.CSSProperties = {
    fontFamily: data.fontFamily,
    ...(data.customBgColor ? { '--wedding-bg': data.customBgColor } as React.CSSProperties : {}),
    ...(data.customAccentColor ? { '--wedding-main': data.customAccentColor, '--wedding-accent': data.customAccentColor } as React.CSSProperties : {}),
  };

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
                    <div key={index} className="gallery-slide-item" onClick={() => openIfTap(slideDragDelta, index)}>
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

      {selectedIndex !== null && ReactDOM.createPortal(
        <div className={`lightbox-overlay ${lightboxThemeClass}`} style={lightboxThemeStyle} role="dialog" aria-modal="true" aria-label="사진 확대 보기" ref={lightboxTrapRef}>
          <div className="lightbox-backdrop" onClick={closeLightbox} />
          <button className="close-btn" onClick={closeLightbox} aria-label="닫기"><X size={32} /></button>

          {data.photos.length > 1 && (
            <button className="lightbox-nav lightbox-prev" onClick={prevImage} aria-label="이전 사진"><ChevronLeft size={28} /></button>
          )}

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

          {data.photos.length > 1 && (
            <button className="lightbox-nav lightbox-next" onClick={nextImage} aria-label="다음 사진"><ChevronRight size={28} /></button>
          )}

          {data.photos.length > 1 && (
            <div className="gallery-slide-dots lightbox-dots">
              {data.photos.map((_, i) => (
                <button key={i} className={`gallery-slide-dot ${i === selectedIndex ? 'active' : ''}`} onClick={() => setSelectedIndex(i)} aria-label={`사진 ${i + 1}`} />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}

    </section>
  );
}, (prev, next) =>
  prev.data.photos === next.data.photos
  && prev.data.galleryStyle === next.data.galleryStyle
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
  && prev.data.theme === next.data.theme
  && prev.data.customBgColor === next.data.customBgColor
  && prev.data.customAccentColor === next.data.customAccentColor
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
