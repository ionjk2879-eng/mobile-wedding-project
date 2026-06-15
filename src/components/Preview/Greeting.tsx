import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Greeting: React.FC<PreviewProps> = ({ data }) => {
  return (
    <section className="greeting section" style={{ fontFamily: data.fontFamily }}>
      <div className="greeting-text">
        <h2>{data.greetingTitle}</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          {data.greetingContent}
        </p>
      </div>

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
        .greeting-text p {
          line-height: 2;
          color: var(--wedding-text-body);
          font-size: 0.95rem;
          margin-bottom: 50px;
        }
        .contact-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-top: 1px solid var(--wedding-border);
          padding-top: 40px;
        }
        .contact-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        .role {
          font-size: 0.8rem;
          color: var(--wedding-text-sub);
        }
        .name {
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

export default Greeting;
