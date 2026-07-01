import React, { useState } from 'react';
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
import { uploadImage } from '../../../services/storageService';
import { toast } from '../../../stores/useToastStore';
import { getApiErrorMessage } from '../../../utils/apiError';
import type { TimelineEvent } from '../../../types';

function SortableTimelineOrderItem({ event, index }: { event: TimelineEvent; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: event.id });
  const label = [event.date, event.title].filter(Boolean).join(' · ') || `이벤트 ${index + 1}`;
  return (
    <div
      ref={setNodeRef}
      className={`order-item${isDragging ? ' tl-dragging' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      aria-label={`${index + 1}. ${label}`}
    >
      <span className="order-num">{index + 1}</span>
      <span className="order-label">{label}</span>
      <span className="tl-drag-handle" {...listeners} {...attributes} aria-label="드래그하여 순서 변경">
        <GripVertical size={16} />
      </span>
    </div>
  );
}

const TimelineSection: React.FC = () => {
  const timeline = useInvitationStore((s) => s.data.timeline);
  const slug = useInvitationStore((s) => s.data.slug);
  const addTimelineEvent = useInvitationStore((s) => s.addTimelineEvent);
  const updateTimelineEvent = useInvitationStore((s) => s.updateTimelineEvent);
  const removeTimelineEvent = useInvitationStore((s) => s.removeTimelineEvent);
  const updateField = useInvitationStore((s) => s.updateField);
  const setData = useInvitationStore((s) => s.setData);
  const data = useInvitationStore((s) => s.data);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const list = timeline || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = list.findIndex((e) => e.id === active.id);
      const newIndex = list.findIndex((e) => e.id === over.id);
      updateField('timeline', arrayMove([...list], oldIndex, newIndex));
    }
  };

  const toggleShowDate = (id: string) => {
    setData({ ...data, timeline: (data.timeline || []).map(e => e.id === id ? { ...e, showDate: !(e.showDate !== false) } : e) });
  };

  const handleTimelinePhotoUpload = async (eventId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(eventId);
    try {
      const url = await uploadImage(file, `images/${slug || 'temp'}/timeline/${eventId}_${Date.now()}_${file.name}`);
      updateTimelineEvent(eventId, 'photo', url);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  return (
    <>
      <p className="section-desc">연애 시작부터 결혼까지의 과정을 입력해 보세요.</p>

      {list.length >= 2 && (
        <div className="timeline-order-panel">
          <p className="timeline-order-title">순서 관리</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={list.map((e) => e.id)} strategy={verticalListSortingStrategy}>
              <div className="order-list">
                {list.map((event, index) => (
                  <SortableTimelineOrderItem key={event.id} event={event} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <div className="timeline-editor-list">
        {list.map((event, index) => (
          <div key={event.id} className="timeline-editor-item">
            <div className="timeline-editor-header">
              <span className="timeline-index">{index + 1}</span>
              <button type="button" className="timeline-remove-btn" onClick={() => removeTimelineEvent(event.id)}>×</button>
            </div>
            <div className="timeline-editor-fields">
              <div className="input-group">
                <label>연도 구분 (선택)</label>
                <input type="text" value={event.year || ''} onChange={(e) => updateTimelineEvent(event.id, 'year', e.target.value)} className="modern-input" placeholder="2024" />
                <span className="input-hint">입력하면 사진 위에 크게 표시됩니다.</span>
              </div>
              <div className="input-grid-2">
                <div className="input-group">
                  <div className="label-row">
                    <label>날짜</label>
                    <button type="button" className={`deceased-btn ${event.showDate !== false ? 'active' : ''}`} onClick={() => toggleShowDate(event.id)}>표시</button>
                  </div>
                  <input type="text" value={event.date} onChange={(e) => updateTimelineEvent(event.id, 'date', e.target.value)} className="modern-input" placeholder="2020년 3월" />
                </div>
                <div className="input-group">
                  <div className="label-row"><label>제목</label></div>
                  <input type="text" value={event.title} onChange={(e) => updateTimelineEvent(event.id, 'title', e.target.value)} className="modern-input" placeholder="첫 만남" />
                </div>
              </div>
              <div className="input-group">
                <label>설명</label>
                <textarea value={event.description} onChange={(e) => updateTimelineEvent(event.id, 'description', e.target.value)} rows={5} className="modern-input" placeholder="소개팅으로 처음 만난 날" />
              </div>
              <div className="input-group">
                <label>사진 (선택)</label>
                {uploadingId === event.id ? (
                  <div className="timeline-photo-upload" style={{ opacity: 0.6 }}><span>업로드 중...</span></div>
                ) : event.photo ? (
                  <div className="timeline-photo-preview">
                    <img src={event.photo} alt="" />
                    <button type="button" className="timeline-remove-btn" onClick={() => updateTimelineEvent(event.id, 'photo', '')}>×</button>
                  </div>
                ) : (
                  <label className="timeline-photo-upload">
                    <span>사진 추가</span>
                    <input type="file" accept="image/*" hidden onChange={(e) => handleTimelinePhotoUpload(event.id, e)} />
                  </label>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="timeline-add-btn" onClick={addTimelineEvent}>+ 이벤트 추가</button>
    </>
  );
};

export default TimelineSection;