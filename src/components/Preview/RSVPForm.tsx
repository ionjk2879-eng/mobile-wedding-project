import React, { useState } from 'react';
import { InvitationData } from '../../types';
import { CheckCircle2, Users, Utensils } from 'lucide-react';

interface PreviewProps {
  data: InvitationData;
}

const RSVPForm: React.FC<PreviewProps> = ({ data }) => {
  const [formData, setFormData] = useState({
    guestName: '',
    isAttending: true,
    totalGuests: 1,
    wantsMeal: true,
    relation: 'groom',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

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
          <CheckCircle2 size={48} color="#b89c8e" />
          <h3>참석 응답이 전달되었습니다</h3>
          <p>소중한 응답 감사합니다.</p>
          <button className="reset-btn" onClick={() => setSubmitted(false)}>다시 입력하기</button>
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
          .reset-btn { margin-top: 10px; font-size: 0.8rem; color: var(--wedding-text-sub); text-decoration: underline; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="rsvp-section section" style={{ fontFamily: data.fontFamily }}>
      <div className="rsvp-header">
        <h2>참석 여부 전달하기</h2>
        <p>축하의 마음으로 참석해주시는<br />모든 분들의 성함을 남겨주세요.</p>
      </div>

      <form className="rsvp-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="section-label">구분</label>
          <div className="tab-group">
            <button 
              type="button" 
              className={`tab-btn ${formData.relation === 'groom' ? 'active' : ''}`}
              onClick={() => setFormData({...formData, relation: 'groom'})}
            >
              신랑측
            </button>
            <button 
              type="button" 
              className={`tab-btn ${formData.relation === 'bride' ? 'active' : ''}`}
              onClick={() => setFormData({...formData, relation: 'bride'})}
            >
              신부측
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="section-label">참석 여부</label>
          <div className="attendance-toggle">
            <button 
              type="button" 
              className={`toggle-btn ${formData.isAttending ? 'active' : ''}`}
              onClick={() => setFormData({...formData, isAttending: true})}
            >
              참석합니다
            </button>
            <button 
              type="button" 
              className={`toggle-btn ${!formData.isAttending ? 'active-refuse' : ''}`}
              onClick={() => setFormData({...formData, isAttending: false})}
            >
              참석이 어렵습니다
            </button>
          </div>
        </div>

        <div className="form-group">
          <input 
            type="text" 
            placeholder="성함을 입력해 주세요" 
            className="rsvp-input"
            required
            value={formData.guestName}
            onChange={(e) => setFormData({...formData, guestName: e.target.value})}
          />
        </div>

        {formData.isAttending && (
          <div className="form-row">
            <div className="form-group flex-1">
              <label><Users size={14} /> 동반 인원</label>
              <select 
                className="rsvp-select"
                value={formData.totalGuests}
                onChange={(e) => setFormData({...formData, totalGuests: parseInt(e.target.value)})}
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}명 (본인포함)</option>)}
              </select>
            </div>
            <div className="form-group flex-1">
              <label><Utensils size={14} /> 식사 여부</label>
              <select 
                className="rsvp-select"
                value={formData.wantsMeal ? 'yes' : 'no'}
                onChange={(e) => setFormData({...formData, wantsMeal: e.target.value === 'yes'})}
              >
                <option value="yes">식사 함</option>
                <option value="no">식사 안함</option>
              </select>
            </div>
          </div>
        )}

        <div className="form-group">
          <textarea 
            placeholder={formData.isAttending ? "축하 메시지 (선택사항)" : "축하 메시지 및 아쉬운 마음을 전해주세요"} 
            className="rsvp-textarea"
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          />
        </div>

        <button type="submit" className="submit-btn">
          {formData.isAttending ? "참석 의사 전달하기" : "답변 전달하기"}
        </button>
      </form>

      <style>{`
        .rsvp-section {
          background-color: var(--wedding-bg);
          transition: background-color 0.4s ease;
        }
        .section-label {
          display: block;
          font-size: 0.75rem;
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
          font-size: 0.85rem;
          color: var(--wedding-text-sub);
          transition: all 0.2s;
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
        .rsvp-header h2 { margin-bottom: 15px; }
        .rsvp-header p { 
          font-size: 0.9rem; 
          color: var(--wedding-text-sub); 
          line-height: 1.6;
          margin-bottom: 40px;
        }
        .rsvp-form {
          background: var(--wedding-card-bg);
          padding: 30px 20px;
          border-radius: 28px;
          border: 1px solid var(--wedding-border);
          box-shadow: 0 10px 40px rgba(74, 69, 67, 0.05);
          text-align: left;
        }
        .form-group { margin-bottom: 20px; }
        .form-row { display: flex; gap: 15px; }
        .flex-1 { flex: 1; }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
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
          font-size: 0.85rem;
          color: var(--wedding-text-sub);
          transition: all 0.2s;
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
          font-size: 0.9rem;
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
          font-size: 1rem;
          margin-top: 10px;
          transition: all 0.2s ease;
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
