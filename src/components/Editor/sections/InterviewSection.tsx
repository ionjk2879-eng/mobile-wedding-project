import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';

const InterviewSection: React.FC = () => {
  const interview = useInvitationStore((s) => s.data.interview);
  const addInterviewQA = useInvitationStore((s) => s.addInterviewQA);
  const updateInterviewQA = useInvitationStore((s) => s.updateInterviewQA);
  const removeInterviewQA = useInvitationStore((s) => s.removeInterviewQA);

  return (
    <>
      <p className="section-desc">신랑과 신부에게 같은 질문을 던지고 각자의 답변을 입력해 보세요.</p>
      <div className="interview-editor-list">
        {(interview || []).map((qa, index) => (
          <div key={qa.id} className="interview-editor-item">
            <div className="timeline-editor-header">
              <span className="timeline-index">Q{index + 1}</span>
              <button type="button" className="timeline-remove-btn" onClick={() => removeInterviewQA(qa.id)}>×</button>
            </div>
            <div className="interview-editor-fields">
              <div className="input-group">
                <label>질문</label>
                <input type="text" value={qa.question} onChange={(e) => updateInterviewQA(qa.id, 'question', e.target.value)} className="modern-input" placeholder="첫 만남의 인상은?" />
              </div>
              <div className="interview-answer-row">
                <div className="interview-answer-box">
                  <span className="person-type">신랑</span>
                  <textarea value={qa.groomAnswer} onChange={(e) => updateInterviewQA(qa.id, 'groomAnswer', e.target.value)} rows={2} className="modern-input" placeholder="신랑의 답변" />
                </div>
                <div className="interview-answer-box">
                  <span className="person-type bride">신부</span>
                  <textarea value={qa.brideAnswer} onChange={(e) => updateInterviewQA(qa.id, 'brideAnswer', e.target.value)} rows={2} className="modern-input" placeholder="신부의 답변" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="timeline-add-btn" onClick={addInterviewQA}>+ 질문 추가</button>
    </>
  );
};

export default InterviewSection;
