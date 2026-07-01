import React from 'react';
import { GripVertical } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useInvitationStore from '../../../stores/useInvitationStore';

const SECTION_LABELS: Record<string, string> = {
  greeting: '인사말', calendar: '예식일시', message: '신랑/신부 한마디', interview: '인터뷰',
  photos: '갤러리', timeline: '타임라인', location: '장소', rsvp: '참석의사',
  guestbook: '방명록', accounts: '계좌정보', contacts: '연락처', share: '공유',
};

const DEFAULT_ORDER = ['greeting', 'calendar', 'message', 'interview', 'photos', 'timeline', 'location', 'rsvp', 'accounts', 'contacts', 'share'];

function SortableSectionItem({ id, index }: { id: string; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`order-item${isDragging ? ' tl-dragging' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      aria-label={`${index + 1}. ${SECTION_LABELS[id] || id}`}
    >
      <span className="order-num">{index + 1}</span>
      <span className="order-label">{SECTION_LABELS[id] || id}</span>
      <span className="tl-drag-handle" {...listeners} {...attributes} aria-label="드래그하여 순서 변경">
        <GripVertical size={16} />
      </span>
    </div>
  );
}

const OrderSection: React.FC = () => {
  const sectionOrder = useInvitationStore((s) => s.data.sectionOrder);
  const templateSectionOrder = useInvitationStore((s) => s.data.templateSectionOrder);
  const updateField = useInvitationStore((s) => s.updateField);
  const order = sectionOrder?.length ? sectionOrder : DEFAULT_ORDER;
  const resetTarget = templateSectionOrder ?? DEFAULT_ORDER;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(active.id as string);
      const newIndex = order.indexOf(over.id as string);
      updateField('sectionOrder', arrayMove([...order], oldIndex, newIndex));
    }
  };

  const isReset = order.join(',') === resetTarget.join(',');

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p className="section-desc" style={{ margin: 0 }}>드래그하여 섹션 순서를 변경하세요.</p>
        <button type="button" className="order-reset-btn" disabled={isReset} onClick={() => updateField('sectionOrder', [...resetTarget])}>
          {templateSectionOrder ? '템플릿 기본값' : '초기화'}
        </button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="order-list" role="list">
            {order.map((id, index) => (
              <SortableSectionItem key={id} id={id} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
};

export default OrderSection;