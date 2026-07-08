import React, { useState, useRef } from 'react';
import { Phone, MessageSquare, ChevronDown, Heart } from 'lucide-react';
import { InvitationData } from '../../types';
import { PreviewOverlay } from '../../hooks/usePreviewPopup';

interface PreviewProps {
  data: InvitationData;
}

interface ContactEntry {
  role: string;
  name: string;
  phone: string;
}

interface Group {
  label: string;
  contacts: ContactEntry[];
  side: 'groom' | 'bride';
}

const buildList = (
  self: { name: string; phone: string } | undefined,
  parents: { role: string; name: string; phone: string }[],
  label: string
): ContactEntry[] => {
  const list: ContactEntry[] = [];
  if (self && (self.name || self.phone)) list.push({ role: label, name: self.name, phone: self.phone });
  parents.forEach(p => {
    if (p.name || p.phone) list.push({ role: `${label} ${p.role}`, name: p.name, phone: p.phone });
  });
  return list;
};

const GroupsInline: React.FC<{ groups: Group[] }> = ({ groups }) => (
  <>
    {groups.map((group, gi) => (
      <div key={gi} className="contact-group">
        <p className="contact-group-label">{group.label}</p>
        <Carousel contacts={group.contacts} />
      </div>
    ))}
  </>
);

const GroupsAccordion: React.FC<{ groups: Group[] }> = ({ groups }) => {
  const [openIdx, setOpenIdx] = useState<Record<number, boolean>>({});
  return (
    <>
      {groups.map((group, gi) => (
        <div key={gi} className="accordion-group">
          <button
            className={`accordion-toggle ${openIdx[gi] ? 'open' : ''}`}
            onClick={(e) => { e.currentTarget.blur(); setOpenIdx(prev => ({ ...prev, [gi]: !prev[gi] })); }}
            aria-expanded={!!openIdx[gi]}
          >
            <span>{group.label}</span>
            <ChevronDown size={16} className={`accordion-arrow ${openIdx[gi] ? 'open' : ''}`} aria-hidden="true" />
          </button>
          <div className={`accordion-body ${openIdx[gi] ? 'open' : ''}`}>
            <div className="accordion-inner">
              <Carousel contacts={group.contacts} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

const PopupGroupsList: React.FC<{ groups: Group[] }> = ({ groups }) => (
  <div className="contact-popup-list">
    {groups.map((group, gi) => (
      <div key={gi} className="contact-popup-group">
        <div className="contact-popup-group-header">
          <Heart
            size={20}
            fill={group.side === 'groom' ? '#3B82F6' : '#EF4444'}
            color={group.side === 'groom' ? '#3B82F6' : '#EF4444'}
          />
          <span className="contact-popup-side-label">{group.label}</span>
        </div>
        {group.contacts.map((c, ci) => (
          <div key={ci} className="contact-popup-row">
            <div className="contact-popup-info">
              <span className="contact-popup-role">{c.role}</span>
              <span className="contact-popup-name">{c.name}</span>
            </div>
            {c.phone && (
              <div className="contact-popup-actions">
                <a href={`tel:${c.phone}`} className="contact-popup-btn" aria-label={`${c.name}에게 전화하기`}>
                  <Phone size={17} />
                </a>
                <a href={`sms:${c.phone}`} className="contact-popup-btn" aria-label={`${c.name}에게 문자하기`}>
                  <MessageSquare size={17} />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const Contacts: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';
  const mode = data.contactDisplayMode ?? 'inline';

  const sectionRef = useRef<HTMLElement>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const groomSelf = data.contacts.find(c => c.role === '신랑');
  const brideSelf = data.contacts.find(c => c.role === '신부');

  const groomLabel = isEn ? 'Groom' : isJa ? '新郎' : '신랑';
  const brideLabel = isEn ? 'Bride' : isJa ? '新婦' : '신부';

  const groomContacts = buildList(groomSelf, data.parents.groomParents, groomLabel);
  const brideContacts = buildList(brideSelf, data.parents.brideParents, brideLabel);

  const allGroups: Group[] = [
    { label: isEn ? "Groom's Side" : isJa ? '新郎側' : '신랑측', contacts: groomContacts, side: 'groom' as const },
    { label: isEn ? "Bride's Side" : isJa ? '新婦側' : '신부측', contacts: brideContacts, side: 'bride' as const },
  ].filter(g => g.contacts.length > 0);

  if (allGroups.length === 0) return null;

  const sub = isEn ? 'Share your congratulations directly' : isJa ? 'お祝いの気持ちを直接お伝えください' : '축하의 마음을 직접 전해보세요';
  const btnLabel = isEn ? 'View Contacts' : isJa ? '連絡先を見る' : '연락처 보기';
  const popupTitle = isEn ? 'Contact' : isJa ? '連絡先' : '연락처';

  return (
    <section className="contacts-section section" style={{ fontFamily: data.fontFamily }} aria-label="연락처" ref={sectionRef}>
      <h2>CONTACT</h2>
      <p className="section-sub">{sub}</p>

      {mode === 'inline' && <GroupsInline groups={allGroups} />}

      {mode === 'popup' && (
        <>
          <button type="button" className="pf-open-btn" onClick={() => setPopupOpen(true)}>
            {btnLabel}
          </button>
          <PreviewOverlay open={popupOpen} onClose={() => setPopupOpen(false)} anchorRef={sectionRef} title={popupTitle}>
            <PopupGroupsList groups={allGroups} />
          </PreviewOverlay>
        </>
      )}

      {mode === 'accordion' && <GroupsAccordion groups={allGroups} />}
    </section>
  );
}, (prev, next) =>
  prev.data.contacts === next.data.contacts
  && prev.data.parents === next.data.parents
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
  && prev.data.contactDisplayMode === next.data.contactDisplayMode
);

interface CarouselProps {
  contacts: ContactEntry[];
}

const Carousel: React.FC<CarouselProps> = ({ contacts }) => {
  const [idx, setIdx] = useState(0);
  const dragStartX = useRef(0);
  const dragDelta = useRef(0);
  const dragging = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const vpRef = useRef<HTMLDivElement>(null);

  const onStart = (x: number) => {
    dragging.current = true;
    dragStartX.current = x;
    dragDelta.current = 0;
    if (trackRef.current) trackRef.current.style.transition = 'none';
  };
  const onMove = (x: number) => {
    if (!dragging.current) return;
    dragDelta.current = x - dragStartX.current;
    if (trackRef.current) {
      const w = vpRef.current?.clientWidth || 1;
      trackRef.current.style.transform = `translateX(${-(idx * 100) + (dragDelta.current / w) * 100}%)`;
    }
  };
  const onEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (trackRef.current) trackRef.current.style.transition = 'transform 0.35s ease';
    const t = 40;
    if (dragDelta.current < -t && idx < contacts.length - 1) setIdx(idx + 1);
    else if (dragDelta.current > t && idx > 0) setIdx(idx - 1);
    else if (trackRef.current) trackRef.current.style.transform = `translateX(-${idx * 100}%)`;
  };

  return (
    <>
      <div
        className="contact-carousel-vp"
        ref={vpRef}
        onTouchStart={e => onStart(e.touches[0].clientX)}
        onTouchMove={e => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onMouseDown={e => { e.preventDefault(); onStart(e.clientX); }}
        onMouseMove={e => onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
      >
        <div className="contact-carousel-track" ref={trackRef} style={{ transform: `translateX(-${idx * 100}%)` }}>
          {contacts.map((c, i) => (
            <div key={i} className="contact-card">
              <span className="contact-card-role">{c.role}</span>
              <span className="contact-card-name">{c.name}</span>
              {c.phone && <span className="contact-card-phone">{c.phone}</span>}
              {c.phone && (
                <div className="contact-card-btns">
                  <a href={`tel:${c.phone}`} className="contact-action-btn" aria-label={`${c.name}에게 전화하기`}><Phone size={18} /></a>
                  <a href={`sms:${c.phone}`} className="contact-action-btn" aria-label={`${c.name}에게 문자하기`}><MessageSquare size={18} /></a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {contacts.length > 1 && (
        <div className="contact-dots">
          {contacts.map((_, i) => (
            <button key={i} className={`contact-dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} aria-label={`연락처 ${i + 1}`} />
          ))}
        </div>
      )}
    </>
  );
};

export default Contacts;
