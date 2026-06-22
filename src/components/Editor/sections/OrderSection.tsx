import React from 'react';
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

  return (
    <>
      <p className="section-desc">미리보기에 표시되는 섹션 순서를 변경할 수 있습니다.</p>
      <div className="order-list">
        {order.map((id, index) => (
          <div key={id} className="order-item">
            <span className="order-num">{index + 1}</span>
            <span className="order-label">{SECTION_LABELS[id] || id}</span>
            <div className="order-btns">
              <button type="button" className="order-btn" disabled={index === 0} onClick={() => moveSection(index, -1)}><ChevronUp size={16} /></button>
              <button type="button" className="order-btn" disabled={index === order.length - 1} onClick={() => moveSection(index, 1)}><ChevronDown size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default OrderSection;
