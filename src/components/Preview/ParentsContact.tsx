import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const ParentsContact: React.FC<PreviewProps> = ({ data }) => {
  const isEn = data.language === 'en';
  
  const renderParents = (title: string, parents: any[]) => (
    <div className="parent-side">
      <h3>{title}</h3>
      <div className="parent-list">
        {parents.map((parent, idx) => (
          <div key={idx} className="parent-item">
            <span className="role">{parent.role}</span>
            <span className="name">{parent.name}</span>
            <div className="contact-actions">
              <a href={`tel:${parent.phone}`} className="action-btn call"><Phone size={16} /></a>
              <a href={`sms:${parent.phone}`} className="action-btn sms"><MessageSquare size={16} /></a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="parents-contact section">
      <div className="parents-grid">
        {renderParents(isEn ? "Groom's Parents" : "신랑측 부모님", data.parents.groomParents)}
        {renderParents(isEn ? "Bride's Parents" : "신부측 부모님", data.parents.brideParents)}
      </div>
      <style>{`
        .parents-contact {
          background-color: var(--wedding-bg);
          padding: 40px 20px;
        }
        .parents-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          width: 100%;
        }
        .parent-side {
          min-width: 0; /* Prevents flex/grid blowout */
        }
        .parent-side h3 {
          font-size: 0.85rem;
          color: var(--wedding-main);
          margin-bottom: 12px;
          font-weight: 700;
          text-align: center;
        }
        .parent-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--wedding-card-bg);
          padding: 15px 12px;
          border-radius: 16px;
          border: 1px solid var(--wedding-border);
        }
        .parent-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 5px;
        }
        .role {
          font-size: 0.7rem;
          color: var(--wedding-text-sub);
          flex-shrink: 0;
        }
        .name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--wedding-text-main);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          text-align: left;
          padding-left: 4px;
        }
        .contact-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }
        .action-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--wedding-bg);
          color: var(--wedding-main);
          border: 1px solid var(--wedding-border);
          transition: all 0.2s;
        }
        @media (max-width: 350px) {
          .parents-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default ParentsContact;
