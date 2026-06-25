import React, { useState, useRef } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

interface ContactEntry {
  role: string;
  name: string;
  phone: string;
}

const Contacts: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';

  const groomSelf = data.contacts.find(c => c.role === '신랑');
  const brideSelf = data.contacts.find(c => c.role === '신부');

  const buildList = (self: typeof groomSelf, parents: typeof data.parents.groomParents, label: string): ContactEntry[] => {
    const list: ContactEntry[] = [];
    if (self && (self.name || self.phone)) list.push({ role: label, name: self.name, phone: self.phone });
    parents.forEach(p => {
      if (p.name || p.phone) list.push({ role: `${label} ${p.role}`, name: p.name, phone: p.phone });
    });
    return list;
  };

  const groomContacts = buildList(groomSelf, data.parents.groomParents, isEn ? 'Groom' : '신랑');
  const brideContacts = buildList(brideSelf, data.parents.brideParents, isEn ? 'Bride' : '신부');

  const allGroups = [
    { label: isEn ? "Groom's Side" : '신랑측', contacts: groomContacts },
    { label: isEn ? "Bride's Side" : '신부측', contacts: brideContacts },
  ].filter(g => g.contacts.length > 0);

  if (allGroups.length === 0) return null;

  return (
    <section className="contacts-section section" style={{ fontFamily: data.fontFamily }} aria-label="연락처">
      <h2>CONTACT</h2>
      <p className="section-sub">축하의 마음을 직접 전해보세요</p>
      {allGroups.map((group, gi) => (
        <div key={gi} className="contact-group">
          <p className="contact-group-label">{group.label}</p>
          <Carousel contacts={group.contacts} />
        </div>
      ))}

    </section>
  );
}, (prev, next) =>
  prev.data.contacts === next.data.contacts
  && prev.data.parents === next.data.parents
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
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
