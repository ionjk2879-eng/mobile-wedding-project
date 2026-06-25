import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { InvitationData, Contact } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const ParentsContact: React.FC<PreviewProps> = ({ data }) => {
  const isEn = data.language === 'en';
  
  const renderParentSide = (title: string, parents: Contact[]) => (
    <div className="parent-card">
      <h3 className="parent-side-title">{title}</h3>
      <div className="parent-list">
        {parents.map((parent, idx) => (
          <div key={idx} className="parent-row">
            <div className="parent-info">
              <span className="parent-role">{parent.role}</span>
              <span className="parent-name">{parent.name}</span>
            </div>
            <div className="parent-actions">
              <a href={`tel:${parent.phone}`} className="parent-action-btn" aria-label={`${parent.name}에게 전화하기`}>
                <Phone size={18} />
              </a>
              <a href={`sms:${parent.phone}`} className="parent-action-btn" aria-label={`${parent.name}에게 문자하기`}>
                <MessageSquare size={18} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="parents-contact section" style={{ fontFamily: data.fontFamily }}>
      <div className="section-header">
        <h2>{isEn ? 'PARENTS' : '부모님께 연락하기'}</h2>
      </div>
      
      <div className="parents-container">
        {renderParentSide(isEn ? "Groom's Family" : "신랑측 부모님", data.parents.groomParents)}
        {renderParentSide(isEn ? "Bride's Family" : "신부측 부모님", data.parents.brideParents)}
      </div>

    </section>
  );
};

export default ParentsContact;
