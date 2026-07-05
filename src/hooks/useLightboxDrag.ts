import { useRef } from 'react';

// 라이트박스 스와이프: 손가락을 따라 다음/이전 사진이 부드럽게 끌려오다가,
// 손을 떼는 순간에만 완전히 넘어가거나 제자리로 돌아온다.
export function useLightboxDrag(itemCount: number, currentIndex: number, setIndex: (index: number) => void) {
  const dragStartX = useRef(0);
  const dragDelta = useRef(0);
  const dragging = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  indexRef.current = currentIndex;

  const onDragStart = (x: number) => {
    dragging.current = true;
    dragStartX.current = x;
    dragDelta.current = 0;
    if (trackRef.current) trackRef.current.style.transition = 'none';
  };
  const onDragMove = (x: number) => {
    if (!dragging.current) return;
    dragDelta.current = x - dragStartX.current;
    if (trackRef.current) {
      const w = viewportRef.current?.clientWidth || 1;
      trackRef.current.style.transform = `translateX(${-(indexRef.current * 100) + (dragDelta.current / w) * 100}%)`;
    }
  };
  const onDragEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (trackRef.current) trackRef.current.style.transition = 'transform 0.35s ease';
    if (dragDelta.current < -40 && indexRef.current < itemCount - 1) setIndex(indexRef.current + 1);
    else if (dragDelta.current > 40 && indexRef.current > 0) setIndex(indexRef.current - 1);
    else if (trackRef.current) trackRef.current.style.transform = `translateX(-${indexRef.current * 100}%)`;
  };

  return { trackRef, viewportRef, onDragStart, onDragMove, onDragEnd };
}
