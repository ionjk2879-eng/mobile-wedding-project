import React, { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import useInvitationStore from '../../../stores/useInvitationStore';

const SECTION_LABELS: Record<string, string> = {
  greeting: '인사말', calendar: '캘린더', message: '신랑/신부 한마디', interview: '인터뷰',
  photos: '갤러리', timeline: '타임라인', location: '장소', rsvp: '참석의사',
  accounts: '계좌정보', contacts: '연락처', share: '공유',
};

const DEFAULT_ORDER = ['greeting', 'calendar', 'message', 'interview', 'photos', 'timeline', 'location', 'rsvp', 'accounts', 'contacts', 'share'];

const OrderSection: React.FC = () => {
  const sectionOrder = useInvitationStore((s) => s.data.sectionOrder);
  const moveSection = useInvitationStore((s) => s.moveSection);
  const order = sectionOrder?.length ? sectionOrder : DEFAULT_ORDER;
  const listRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<number | null>(null);

  useEffect(() => {
    if (pendingFocusRef.current !== null && listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLElement>('[role="listitem"]');
      items[pendingFocusRef.current]?.focus();
      pendingFocusRef.current = null;
    }
  }, [order]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      pendingFocusRef.current = index - 1;
      moveSection(index, -1);
    } else if (e.key === 'ArrowDown' && index < order.length - 1) {
      e.preventDefault();
      pendingFocusRef.current = index + 1;
      moveSection(index, 1);
    }
  };

  return (
    <>
      <p className="section-desc">미리보기에 표시되는 섹션 순서를 변경할 수 있습니다. <span className="input-hint">항목에 포커스 후 ↑↓ 키로 순서를 변경할 수 있습니다.</span></p>
      <div className="order-list" role="list" aria-label="섹션 순서 관리" ref={listRef}>
        {order.map((id, index) => (
          <div key={id} className="order-item" role="listitem" tabIndex={0} onKeyDown={(e) => handleKeyDown(e, index)} aria-label={`${index + 1}. ${SECTION_LABELS[id] || id}`} aria-roledescription="이동 가능한 항목">
            <span className="order-num">{index + 1}</span>
            <span className="order-label">{SECTION_LABELS[id] || id}</span>
            <div className="order-btns">
              <button type="button" className="order-btn" disabled={index === 0} onClick={() => moveSection(index, -1)} aria-label={`${SECTION_LABELS[id] || id} 위로 이동`}><ChevronUp size={16} /></button>
              <button type="button" className="order-btn" disabled={index === order.length - 1} onClick={() => moveSection(index, 1)} aria-label={`${SECTION_LABELS[id] || id} 아래로 이동`}><ChevronDown size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default OrderSection;
