import React, { useState, useRef, useEffect } from 'react';
import { InvitationData, RSVPResponse } from '../../types';
import { CheckCircle2, Users, Utensils } from 'lucide-react';
import { submitRSVP } from '../../services/rsvpService';
import { toast } from '../../stores/useToastStore';
import { getApiErrorMessage } from '../../utils/apiError';
import { PreviewOverlay } from '../../hooks/usePreviewPopup';

interface PreviewProps {
  data: InvitationData;
  guestName?: string;
  guestCode?: string;
}

const RSVPForm: React.FC<PreviewProps> = React.memo(({ data, guestName, guestCode }) => {
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';
  const [formData, setFormData] = useState<Omit<RSVPResponse, 'id' | 'createdAt'>>({
    guestName: guestName || '', isAttending: true, totalGuests: 1, wantsMeal: null, relation: 'groom', message: '', guestCode: guestCode || null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  useEffect(() => {
    const handler = () => setFormOpen(true);
    document.addEventListener('sonett-open-rsvp', handler);
    return () => document.removeEventListener('sonett-open-rsvp', handler);
  }, []);
  const sectionRef = useRef<HTMLElement>(null);

  if (!data.isRSVPEnabled) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.slug) return;
    try {
      await submitRSVP(data.slug, formData);
      // 다음 방문 때 RSVP 안내 팝업이 다시 뜨지 않도록(InvitationView.tsx의 showRsvpNotice 참고)
      localStorage.setItem(`rsvp-submitted-${data.slug}`, '1');
      setSubmitted(true);
      setFormOpen(false);
    } catch (err) { toast.error(getApiErrorMessage(err)); }
  };

  if (submitted) {
    return (
      <section className="rsvp-section section" aria-label="참석 의사">
        <div className="rsvp-success" role="status">
          <CheckCircle2 size={48} style={{ color: 'var(--wedding-main)' }} />
          <h3>{isEn ? 'Response Submitted' : isJa ? '回答を送信しました' : '참석 응답이 전달되었습니다'}</h3>
          <p>{isEn ? 'Thank you.' : isJa ? 'ご回答ありがとうございます。' : '소중한 응답 감사합니다.'}</p>
          <button className="rsvp-reset" onClick={() => setSubmitted(false)}>{isEn ? 'Edit' : isJa ? '再入力' : '다시 입력하기'}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="rsvp-section section" style={{ fontFamily: data.fontFamily }} ref={sectionRef} aria-label="참석 의사">
      <h2>RSVP</h2>
      <p className="section-sub">{isEn ? 'Please let us know' : isJa ? '出欠をお知らせください' : '참석 여부를 알려주세요'}</p>
      <p style={{ fontSize: '0.9em', color: 'var(--wedding-text-sub)', lineHeight: 1.6, marginBottom: 24, whiteSpace: 'pre-line', textAlign: 'center' }}>
        {isEn ? 'We will carefully prepare a seat\nfor every guest who attends. Please leave your name below.' : isJa ? 'ご出席いただく皆様のために\n心を込めて席をご用意いたします。お名前をご記入ください。' : '참석해주시는 모든 분들을 위해\n정성껏 자리를 준비하겠습니다. 성함을 남겨주세요.'}
      </p>
      {data.slug ? (
        <button type="button" className="pf-open-btn pf-open-btn-long" onClick={() => setFormOpen(true)}>
          {isEn ? 'Submit RSVP' : isJa ? '出欠を送信する' : '참석 의사 전달하기'}
        </button>
      ) : (
        <p style={{ fontSize: '0.82em', color: 'var(--wedding-text-sub)', textAlign: 'center', padding: '12px', background: 'var(--wedding-card-bg)', border: '1px dashed var(--wedding-border)', borderRadius: '12px' }}>
          {isEn ? 'Save your invitation first to enable RSVP.' : isJa ? '招待状を保存するとRSVP機能が有効になります。' : '청첩장을 저장하면 참석 의사 기능이 활성화됩니다.'}
        </p>
      )}

      <PreviewOverlay open={formOpen} onClose={() => setFormOpen(false)} anchorRef={sectionRef} title={isEn ? 'RSVP' : isJa ? '出欠をお知らせください' : '참석 여부를 알려주세요'}>
        <form onSubmit={handleSubmit}>
          <div className="pf-group">
            <label className="pf-label">{isEn ? 'Side' : isJa ? '区分' : '구분'}</label>
            <div className="pf-tabs">
              <button type="button" className={`pf-tab ${formData.relation === 'groom' ? 'active' : ''}`} onClick={() => setFormData({...formData, relation: 'groom'})}>{isEn ? "Groom's" : isJa ? '新郎側' : '신랑측'}</button>
              <button type="button" className={`pf-tab ${formData.relation === 'bride' ? 'active' : ''}`} onClick={() => setFormData({...formData, relation: 'bride'})}>{isEn ? "Bride's" : isJa ? '新婦側' : '신부측'}</button>
            </div>
          </div>
          <div className="pf-group">
            <label className="pf-label">{isEn ? 'Attendance' : isJa ? '出欠' : '참석 여부'}</label>
            <div className="pf-tabs">
              <button type="button" className={`pf-tab ${formData.isAttending ? 'active' : ''}`} onClick={() => setFormData({...formData, isAttending: true})}>{isEn ? 'Attending' : isJa ? '出席します' : '참석합니다'}</button>
              <button type="button" className={`pf-tab refuse ${!formData.isAttending ? 'active' : ''}`} onClick={() => setFormData({...formData, isAttending: false})}>{isEn ? 'Unable' : isJa ? '欠席' : '불참'}</button>
            </div>
          </div>
          <div className="pf-group">
            <label className="pf-label">{isEn ? 'Name' : isJa ? 'お名前' : '성함'}</label>
            <input type="text" className="pf-input" required value={formData.guestName} onChange={(e) => setFormData({...formData, guestName: e.target.value})} placeholder={isEn ? 'Guest Name' : isJa ? 'お名前をご記入ください' : '성함을 입력해주세요'} />
          </div>
          {formData.isAttending && (
            <div className="pf-row">
              <div className="pf-group"><label className="pf-label"><Users size={14} /> {isEn ? 'Guests' : isJa ? '人数' : '인원'}</label>
                <select className="pf-input" value={formData.totalGuests} onChange={(e) => setFormData({...formData, totalGuests: parseInt(e.target.value)})}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}{isEn ? '' : isJa ? '名' : '명'}</option>)}</select>
              </div>
              <div className="pf-group"><label className="pf-label"><Utensils size={14} /> {isEn ? 'Meal' : isJa ? 'お食事' : '식사'}</label>
                <select className="pf-input" value={formData.wantsMeal === null ? 'undecided' : formData.wantsMeal ? 'yes' : 'no'} onChange={(e) => setFormData({...formData, wantsMeal: e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null})}><option value="undecided">{isEn ? 'Undecided' : isJa ? '未定' : '미정'}</option><option value="yes">{isEn ? 'Yes' : isJa ? 'あり' : '식사 함'}</option><option value="no">{isEn ? 'No' : isJa ? 'なし' : '식사 안함'}</option></select>
              </div>
            </div>
          )}
          <div className="pf-group">
            <label className="pf-label">{isEn ? 'Message' : isJa ? 'メッセージ' : '메시지'}</label>
            <textarea className="pf-input" rows={3} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder={isEn ? 'Message (optional)' : isJa ? 'メッセージ（任意）' : '축하 메시지 (선택사항)'} />
          </div>
          <label className="pf-privacy">
            <input type="checkbox" checked={privacyAgreed} onChange={(e) => setPrivacyAgreed(e.target.checked)} />
            <span>
              {isEn ? <><a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> — I agree to the collection of my name and attendance information.</> : isJa ? <><a href="/privacy" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a>に基づく個人情報（氏名・出欠等）の収集に同意します。</> : <><a href="/privacy" target="_blank" rel="noopener noreferrer">개인정보 처리방침</a>에 따라 성함·참석 여부 등이 수집됩니다. 이에 동의합니다.</>}
            </span>
          </label>
          <button type="submit" className="pf-submit" disabled={!privacyAgreed}>{formData.isAttending ? (isEn ? 'Submit' : isJa ? '送信' : '참석 의사 전달하기') : (isEn ? 'Submit' : isJa ? '送信' : '답변 전달하기')}</button>
        </form>
      </PreviewOverlay>

    </section>
  );
}, (prev, next) => prev.data.isRSVPEnabled === next.data.isRSVPEnabled && prev.data.slug === next.data.slug && prev.data.language === next.data.language && prev.data.fontFamily === next.data.fontFamily && prev.guestName === next.guestName && prev.guestCode === next.guestCode);

export default RSVPForm;
