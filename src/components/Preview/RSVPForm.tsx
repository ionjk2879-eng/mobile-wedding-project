import React, { useState, useRef } from 'react';
import { InvitationData, RSVPResponse } from '../../types';
import { CheckCircle2, Users, Utensils } from 'lucide-react';
import { submitRSVP } from '../../services/rsvpService';
import { toast } from '../../stores/useToastStore';
import { getApiErrorMessage } from '../../utils/apiError';
import { PreviewOverlay } from '../../hooks/usePreviewPopup';

interface PreviewProps { data: InvitationData; }

const RSVPForm: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';
  const [formData, setFormData] = useState<Omit<RSVPResponse, 'id' | 'createdAt'>>({
    guestName: '', isAttending: true, totalGuests: 1, wantsMeal: true, relation: 'groom', message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  if (!data.isRSVPEnabled) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.slug) return;
    try {
      await submitRSVP(data.slug, formData);
      setSubmitted(true);
      setFormOpen(false);
    } catch (err) { toast.error(getApiErrorMessage(err)); }
  };

  if (submitted) {
    return (
      <section className="rsvp-section section" aria-label="참석 의사">
        <div className="rsvp-success" role="status">
          <CheckCircle2 size={48} style={{ color: 'var(--wedding-main)' }} />
          <h3>{isEn ? 'Response Submitted' : '참석 응답이 전달되었습니다'}</h3>
          <p>{isEn ? 'Thank you.' : '소중한 응답 감사합니다.'}</p>
          <button className="rsvp-reset" onClick={() => setSubmitted(false)}>{isEn ? 'Edit' : '다시 입력하기'}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="rsvp-section section" style={{ fontFamily: data.fontFamily }} ref={sectionRef} aria-label="참석 의사">
      <h2>RSVP</h2>
      <p className="section-sub">{isEn ? 'Please let us know' : '참석 여부를 알려주세요'}</p>
      <p style={{ fontSize: '0.9em', color: 'var(--wedding-text-sub)', lineHeight: 1.6, marginBottom: 24, whiteSpace: 'pre-line' }}>
        {isEn ? 'Please let us know if you can join us\nby providing your name below.' : '축하의 마음으로 참석해주시는\n모든 분들의 성함을 남겨주세요.'}
      </p>
      {data.slug ? (
        <button type="button" className="pf-open-btn" onClick={() => setFormOpen(true)}>
          {isEn ? 'Submit RSVP' : '참석 의사 전달하기'}
        </button>
      ) : (
        <p style={{ fontSize: '0.82em', color: 'var(--wedding-text-sub)', textAlign: 'center', padding: '12px', background: 'var(--wedding-card-bg)', border: '1px dashed var(--wedding-border)', borderRadius: '12px' }}>
          {isEn ? 'Save your invitation first to enable RSVP.' : '청첩장을 저장하면 참석 의사 기능이 활성화됩니다.'}
        </p>
      )}

      <PreviewOverlay open={formOpen} onClose={() => setFormOpen(false)} anchorRef={sectionRef} title={isEn ? 'RSVP' : '참석 여부를 알려주세요'}>
        <form onSubmit={handleSubmit}>
          <div className="pf-group">
            <label className="pf-label">{isEn ? 'Side' : '구분'}</label>
            <div className="pf-tabs">
              <button type="button" className={`pf-tab ${formData.relation === 'groom' ? 'active' : ''}`} onClick={() => setFormData({...formData, relation: 'groom'})}>{isEn ? "Groom's" : '신랑측'}</button>
              <button type="button" className={`pf-tab ${formData.relation === 'bride' ? 'active' : ''}`} onClick={() => setFormData({...formData, relation: 'bride'})}>{isEn ? "Bride's" : '신부측'}</button>
            </div>
          </div>
          <div className="pf-group">
            <label className="pf-label">{isEn ? 'Attendance' : '참석 여부'}</label>
            <div className="pf-tabs">
              <button type="button" className={`pf-tab ${formData.isAttending ? 'active' : ''}`} onClick={() => setFormData({...formData, isAttending: true})}>{isEn ? 'Attending' : '참석합니다'}</button>
              <button type="button" className={`pf-tab refuse ${!formData.isAttending ? 'active' : ''}`} onClick={() => setFormData({...formData, isAttending: false})}>{isEn ? 'Unable' : '불참'}</button>
            </div>
          </div>
          <div className="pf-group">
            <label className="pf-label">{isEn ? 'Name' : '성함'}</label>
            <input type="text" className="pf-input" required value={formData.guestName} onChange={(e) => setFormData({...formData, guestName: e.target.value})} placeholder={isEn ? 'Guest Name' : '성함을 입력해주세요'} />
          </div>
          {formData.isAttending && (
            <div className="pf-row">
              <div className="pf-group"><label className="pf-label"><Users size={14} /> {isEn ? 'Guests' : '인원'}</label>
                <select className="pf-input" value={formData.totalGuests} onChange={(e) => setFormData({...formData, totalGuests: parseInt(e.target.value)})}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}{isEn ? '' : '명'}</option>)}</select>
              </div>
              <div className="pf-group"><label className="pf-label"><Utensils size={14} /> {isEn ? 'Meal' : '식사'}</label>
                <select className="pf-input" value={formData.wantsMeal ? 'yes' : 'no'} onChange={(e) => setFormData({...formData, wantsMeal: e.target.value === 'yes'})}><option value="yes">{isEn ? 'Yes' : '식사 함'}</option><option value="no">{isEn ? 'No' : '식사 안함'}</option></select>
              </div>
            </div>
          )}
          <div className="pf-group">
            <label className="pf-label">{isEn ? 'Message' : '메시지'}</label>
            <textarea className="pf-input" rows={3} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder={isEn ? 'Message (optional)' : '축하 메시지 (선택사항)'} />
          </div>
          <button type="submit" className="pf-submit">{formData.isAttending ? (isEn ? 'Submit' : '참석 의사 전달하기') : (isEn ? 'Submit' : '답변 전달하기')}</button>
        </form>
      </PreviewOverlay>

    </section>
  );
}, (prev, next) => prev.data.isRSVPEnabled === next.data.isRSVPEnabled && prev.data.slug === next.data.slug && prev.data.language === next.data.language && prev.data.fontFamily === next.data.fontFamily);

export default RSVPForm;
