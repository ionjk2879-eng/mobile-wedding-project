import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Contacts: React.FC<PreviewProps> = ({ data }) => {
  const isEn = data.language === 'en';

  return (
    <section className="contacts-section section" style={{ fontFamily: data.fontFamily }}>
      <h2>{isEn ? 'CONTACT' : '연락처'}</h2>
      <div className="contact-grid">
        {data.contacts.map((contact, index) => (
          <div key={index} className="contact-item">
            <span className="role">{contact.role}</span>
            <span className="name">{contact.name}</span>
            <div className="contact-buttons">
              <a href={`tel:${contact.phone}`} className="contact-btn">
                <Phone size={18} />
              </a>
              <a href={`sms:${contact.phone}`} className="contact-btn">
                <MessageSquare size={18} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .contacts-section {
          background-color: transparent;
        }
        .contact-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .contact-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        .contact-item .role {
          font-size: 0.8em;
          color: var(--wedding-text-sub);
        }
        .contact-item .name {
          font-weight: 500;
          color: var(--wedding-text-main);
          min-width: 60px;
        }
        .contact-buttons {
          display: flex;
          gap: 10px;
        }
        .contact-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--wedding-card-bg);
          border: 1px solid var(--wedding-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--wedding-text-body);
          transition: background 0.2s;
        }
        .contact-btn:hover {
          background: var(--wedding-border);
        }
      `}</style>
    </section>
  );
};

export default Contacts;
