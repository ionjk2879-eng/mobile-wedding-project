import React, { useState } from 'react';
import { InvitationData } from '../../types';
import { CheckCircle2, Users, Utensils } from 'lucide-react';

interface PreviewProps {
  data: InvitationData;
}

const RSVPForm: React.FC<PreviewProps> = ({ data }) => {
  const isEn = data.language === 'en';
  
  const [formData, setFormData] = useState({
    guestName: '',
    isAttending: true,
    totalGuests: 1,
    wantsMeal: true,
    relation: 'groom',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  if (!data.isRSVPEnabled) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newResponse = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    // Mock Backend: Save to localStorage
    const existingResponses = JSON.parse(localStorage.getItem('wedding_rsvp_responses') || '[]');
    localStorage.setItem('wedding_rsvp_responses', JSON.stringify([...existingResponses, newResponse]));

    console.log('RSVP Submitted:', newResponse);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rsvp-section section">
        <div className="success-message">
          <CheckCircle2 size={48} style={{ color: 'var(--wedding-main)' }} />
          <h3>{isEn ? 'Response Submitted' : '참석 응답이 전달되었습니다'}</h3>
          <p>{isEn ? 'Thank you for your response.' : '소중한 응답 감사합니다.'}</p>
          <button className="reset-btn" onClick={() => setSubmitted(false)}>
            {isEn ? 'Edit Response' : '다시 입력하기'}
          </button>
        </div>
        <style>{`
          .success-message {
            padding: 40px 20px;
            background: var(--wedding-card-bg);
            border-radius: 24px;
            border: 1px solid var(--wedding-border);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
          }
          .success-message h3 { color: var(--wedding-main); margin: 0; }
          .success-message p { color: var(--wedding-text-sub); margin: 0; }
          .reset-btn { margin-top: 10px; font-size: 0.8em; color: var(--wedding-text-sub); text-decoration: underline; background: none; border: none; cursor: pointer; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="rsvp-section section" style={{ fontFamily: data.fontFamily }}>
      <h2>{isEn ? 'RSVP' : '참석 여부'}</h2>
      <p className="rsvp-desc">
        {isEn
          ? 'Please let us know if you can join us\nby providing your name below.'
          : '축하의 마음으로 참석해주시는\n모든 분들의 성함을 남겨주세요.'}
      </p>

      <button type="button" className="rsvp-open-btn" onClick={() => setFormOpen(true)}>
        {isEn ? 'Submit RSVP' : '참석 의사 전달하기'}
      </button>

      {formOpen && (
      <div className="rsvp-overlay" onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}>
      <div className="rsvp-modal">
        <div className="rsvp-modal-header">
          <h3>{isEn ? 'RSVP' : '참석 의사 전달하기'}</h3>
          <button type="button" className="rsvp-close-btn" onClick={() => setFormOpen(false)}>×</button>
        </div>
      <form className="rsvp-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="section-label">{isEn ? 'Side' : '구분'}</label>
          <div className="tab-group">
            <button 
              type="button" 
              className={`tab-btn ${formData.relation === 'groom' ? 'active' : ''}`}
              onClick={() => setFormData({...formData, relation: 'groom'})}
            >
              {isEn ? "Groom's" : '신랑측'}
            </button>
            <button 
              type="button" 
              className={`tab-btn ${formData.relation === 'bride' ? 'active' : ''}`}
              onClick={() => setFormData({...formData, relation: 'bride'})}
            >
              {isEn ? "Bride's" : '신부측'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="section-label">{isEn ? 'Attendance' : '참석 여부'}</label>
          <div className="attendance-toggle">
            <button 
              type="button" 
              className={`toggle-btn ${formData.isAttending ? 'active' : ''}`}
              onClick={() => setFormData({...formData, isAttending: true})}
            >
              {isEn ? 'Attending' : '참석합니다'}
            </button>
            <button 
              type="button" 
              className={`toggle-btn ${!formData.isAttending ? 'active-refuse' : ''}`}
              onClick={() => setFormData({...formData, isAttending: false})}
            >
              {isEn ? 'Unable to Attend' : '참석이 어렵습니다'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <input 
            type="text" 
            placeholder={isEn ? "Guest Name" : "성함을 입력해 주세요"} 
            className="rsvp-input"
            required
            value={formData.guestName}
            onChange={(e) => setFormData({...formData, guestName: e.target.value})}
          />
        </div>

        {formData.isAttending && (
          <div className="form-row">
            <div className="form-group flex-1">
              <label><Users size={14} /> {isEn ? 'Number of Guests' : '동반 인원'}</label>
              <select 
                className="rsvp-select"
                value={formData.totalGuests}
                onChange={(e) => setFormData({...formData, totalGuests: parseInt(e.target.value)})}
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}{isEn ? '' : '명'} ({isEn ? 'incl. self' : '본인포함'})</option>)}
              </select>
            </div>
            <div className="form-group flex-1">
              <label><Utensils size={14} /> {isEn ? 'Meal' : '식사 여부'}</label>
              <select 
                className="rsvp-select"
                value={formData.wantsMeal ? 'yes' : 'no'}
                onChange={(e) => setFormData({...formData, wantsMeal: e.target.value === 'yes'})}
              >
                <option value="yes">{isEn ? 'Will eat' : '식사 함'}</option>
                <option value="no">{isEn ? "Won't eat" : '식사 안함'}</option>
              </select>
            </div>
          </div>
        )}

        <div className="form-group">
          <textarea 
            placeholder={
              formData.isAttending 
                ? (isEn ? "Congratulatory Message (Optional)" : "축하 메시지 (선택사항)") 
                : (isEn ? "Share your warm wishes" : "축하 메시지 및 아쉬운 마음을 전해주세요")
            } 
            className="rsvp-textarea"
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          />
        </div>

        <button type="submit" className="submit-btn">
          {formData.isAttending ? (isEn ? 'Submit' : '참석 의사 전달하기') : (isEn ? 'Submit' : '답변 전달하기')}
        </button>
      </form>
      </div>
      </div>
      )}

      <style>{`
        .rsvp-section {
          background-color: transparent;
        }
        .rsvp-desc {
          font-size: 0.9em;
          color: var(--wedding-text-sub);
          line-height: 1.6;
          margin-bottom: 24px;
          white-space: pre-line;
        }
        .rsvp-open-btn {
          width: 100%;
          padding: 16px;
          background: var(--wedding-main);
          color: white;
          border: none;
          border-radius: 30px;
          font-size: 0.95em;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s;
        }
        .rsvp-open-btn:hover {
          filter: brightness(0.9);
          transform: translateY(-1px);
        }
        .rsvp-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 9000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: rsvp-fade-in 0.25s ease;
        }
        @keyframes rsvp-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .rsvp-modal {
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          background: var(--wedding-bg, #fff);
          border-radius: 24px 24px 0 0;
          overflow-y: auto;
          padding: 0 24px 30px;
          animation: rsvp-slide-up 0.35s ease;
        }
        @keyframes rsvp-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .rsvp-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0 16px;
          position: sticky;
          top: 0;
          background: var(--wedding-bg, #fff);
          z-index: 1;
        }
        .rsvp-modal-header h3 {
          margin: 0;
          font-size: 1.1em;
          font-weight: 700;
          color: var(--wedding-text-main);
        }
        .rsvp-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: var(--wedding-border);
          color: var(--wedding-text-sub);
          font-size: 1.3em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .rsvp-close-btn:hover {
          background: var(--wedding-main);
          color: white;
        }
        .section-label {
          display: block;
          font-size: 0.75em;
          font-weight: 700;
          color: var(--wedding-main);
          margin-bottom: 10px;
        }
        .attendance-toggle {
          display: flex;
          gap: 10px;
        }
        .toggle-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid var(--wedding-border);
          background: var(--wedding-bg);
          font-size: 0.85em;
          color: var(--wedding-text-sub);
          transition: all 0.2s;
          cursor: pointer;
        }
        .toggle-btn.active {
          background: var(--wedding-main);
          color: white;
          border-color: var(--wedding-main);
          font-weight: 700;
        }
        .toggle-btn.active-refuse {
          background: #8c8581;
          color: white;
          border-color: #8c8581;
          font-weight: 700;
        }
        .rsvp-form {
          text-align: left;
        }
        .form-group { margin-bottom: 20px; }
        .form-row { display: flex; gap: 15px; }
        .flex-1 { flex: 1; }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75em;
          font-weight: 600;
          color: var(--wedding-main);
          margin-bottom: 8px;
        }
        .tab-group {
          display: flex;
          background: var(--wedding-bg);
          padding: 4px;
          border-radius: 12px;
        }
        .tab-btn {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.85em;
          color: var(--wedding-text-sub);
          transition: all 0.2s;
          border: none;
          background: none;
          cursor: pointer;
        }
        .tab-btn.active {
          background: var(--wedding-card-bg);
          color: var(--wedding-main);
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .rsvp-input, .rsvp-select, .rsvp-textarea {
          width: 100%;
          padding: 14px;
          border: 1px solid var(--wedding-border);
          border-radius: 12px;
          background: var(--wedding-bg);
          color: var(--wedding-text-body);
          font-size: 0.9em;
          box-sizing: border-box;
          font-family: inherit;
        }
        .rsvp-input:focus, .rsvp-select:focus, .rsvp-textarea:focus {
          outline: none;
          border-color: var(--wedding-main);
        }
        .submit-btn {
          width: 100%;
          padding: 16px;
          background: var(--wedding-main);
          color: white;
          border-radius: 30px;
          font-weight: 700;
          font-size: 1em;
          margin-top: 10px;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }
        .submit-btn:hover { 
          filter: brightness(0.9);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default RSVPForm;
