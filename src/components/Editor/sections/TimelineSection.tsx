import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';

const TimelineSection: React.FC = () => {
  const timeline = useInvitationStore((s) => s.data.timeline);
  const addTimelineEvent = useInvitationStore((s) => s.addTimelineEvent);
  const updateTimelineEvent = useInvitationStore((s) => s.updateTimelineEvent);
  const removeTimelineEvent = useInvitationStore((s) => s.removeTimelineEvent);
  const setData = useInvitationStore((s) => s.setData);
  const data = useInvitationStore((s) => s.data);

  const toggleShowDate = (id: string) => {
    setData({ ...data, timeline: (data.timeline || []).map(e => e.id === id ? { ...e, showDate: !(e.showDate !== false) } : e) });
  };

  return (
    <>
      <p className="section-desc">연애 시작부터 결혼까지의 과정을 입력해 보세요.</p>
      <div className="timeline-editor-list">
        {(timeline || []).map((event, index) => (
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
                {event.photo ? (
                  <div className="timeline-photo-preview">
                    <img src={event.photo} alt="" />
                    <button type="button" className="timeline-remove-btn" onClick={() => updateTimelineEvent(event.id, 'photo', '')}>×</button>
                  </div>
                ) : (
                  <label className="timeline-photo-upload">
                    <span>사진 추가</span>
                    <input type="file" accept="image/*" hidden onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => updateTimelineEvent(event.id, 'photo', ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }} />
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
