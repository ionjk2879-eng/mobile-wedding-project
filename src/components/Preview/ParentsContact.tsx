import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const ParentsContact: React.FC<PreviewProps> = ({ data }) => {
  const isEn = data.language === 'en';
  
  const renderParentSide = (title: string, parents: any[]) => (
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
              <a href={`tel:${parent.phone}`} className="parent-action-btn">
                <Phone size={18} />
              </a>
              <a href={`sms:${parent.phone}`} className="parent-action-btn">
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

      <style>{`
        .parents-contact {
          background-color: var(--wedding-bg);
          transition: background-color 0.4s ease;
        }
        .parents-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .parent-card {
          background: var(--wedding-card-bg);
          padding: 30px 20px;
          border-radius: 28px;
          border: 1px solid var(--wedding-border);
          box-shadow: 0 10px 40px rgba(74, 69, 67, 0.05);
          text-align: left;
        }
        .parent-side-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--wedding-main);
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid var(--wedding-border);
          padding-bottom: 10px;
        }
        .parent-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .parent-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .parent-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .parent-role {
          font-size: 0.8rem;
          color: var(--wedding-text-sub);
          min-width: 45px;
        }
        .parent-name {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--wedding-text-main);
        }
        .parent-actions {
          display: flex;
          gap: 10px;
        }
        .parent-action-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--wedding-bg);
          border: 1px solid var(--wedding-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--wedding-text-body);
          transition: all 0.2s ease;
        }
        .parent-action-btn:hover {
          background: var(--wedding-border);
          transform: translateY(-1px);
        }
      `}</style>
    </section>
  );
};

export default ParentsContact;
