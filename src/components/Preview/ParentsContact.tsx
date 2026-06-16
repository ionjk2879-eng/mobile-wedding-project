import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const ParentsContact: React.FC<PreviewProps> = ({ data }) => {
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
        {renderParents("신랑측 혼주", data.parents.groomParents)}
        <div className="divider"></div>
        {renderParents("신부측 혼주", data.parents.brideParents)}
      </div>
      <style>{`
        .parents-contact {
          background-color: var(--wedding-bg);
          padding-top: 40px;
          padding-bottom: 40px;
        }
        .parents-grid {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .parent-side h3 {
          font-size: 0.9rem;
          color: var(--wedding-main);
          margin-bottom: 15px;
          font-weight: 700;
        }
        .parent-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--wedding-card-bg);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid var(--wedding-border);
        }
        .parent-item {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .role {
          font-size: 0.8rem;
          color: var(--wedding-text-sub);
          width: 50px;
        }
        .name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--wedding-text-main);
          flex: 1;
          text-align: left;
        }
        .contact-actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--wedding-bg);
          color: var(--wedding-main);
          border: 1px solid var(--wedding-border);
          transition: all 0.2s;
        }
        .divider {
          height: 1px;
          background: var(--wedding-border);
          margin: 0 20px;
        }
      `}</style>
    </section>
  );
};

export default ParentsContact;
