import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';

const Greeting: React.FC = () => {
  const contacts = [
    { role: '신랑', name: '김지현', phone: '010-1234-5678' },
    { role: '신부', name: '이민지', phone: '010-8765-4321' },
  ];

  return (
    <section className="greeting section">
      <div className="greeting-text">
        <h2>초대합니다</h2>
        <p>
          곁에 있을 때 가장 나다운 모습이 되게 하는 사람,<br />
          꿈을 꾸게 하고, 그 꿈을 함께 나누고 싶은 사람을 만났습니다.<br /><br />
          서로의 다름을 인정하며,<br />
          서로의 부족함을 채워주는 사랑으로<br />
          행복한 가정을 일구어 나가겠습니다.<br /><br />
          저희의 시작을 축복해 주시면 감사하겠습니다.
        </p>
      </div>

      <div className="contact-grid">
        {contacts.map((contact, index) => (
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
          color: #666;
          font-size: 0.95rem;
          margin-bottom: 50px;
        }
        .contact-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-top: 1px solid #eee;
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
          color: #888;
        }
        .name {
          font-weight: 500;
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
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #555;
          transition: background 0.2s;
        }
        .contact-btn:hover {
          background: #e0e0e0;
        }
      `}</style>
    </section>
  );
};

export default Greeting;
