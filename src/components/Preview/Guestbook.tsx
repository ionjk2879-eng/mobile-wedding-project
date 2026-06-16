import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { InvitationData, GuestMessage } from '../../types';

interface PreviewProps {
  data: InvitationData;
  onUpdate: (messages: GuestMessage[]) => void;
}

const Guestbook: React.FC<PreviewProps> = ({ data, onUpdate }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;

    const newMessage: GuestMessage = {
      id: Date.now().toString(),
      name,
      content,
      createdAt: new Date().toISOString()
    };

    const updated = [newMessage, ...data.guestMessages];
    onUpdate(updated);
    
    // Also save to localStorage for persistence
    localStorage.setItem('wedding_guest_messages', JSON.stringify(updated));
    
    setName('');
    setContent('');
  };

  return (
    <section className="guestbook section">
      <h2>축하 메시지</h2>
      <p className="subtitle">신랑 신부에게 따뜻한 한마디를 남겨주세요.</p>

      <form className="message-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="이름" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <textarea 
          placeholder="축하의 메시지를 입력해주세요" 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required
        ></textarea>
        <button type="submit" className="submit-btn">
          <Send size={18} />
          <span>등록하기</span>
        </button>
      </form>

      <div className="message-list">
        {data.guestMessages.map((msg) => (
          <div key={msg.id} className="message-card">
            <div className="card-header">
              <span className="msg-name">{msg.name}</span>
              <span className="msg-date">{new Date(msg.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="msg-content">{msg.content}</p>
          </div>
        ))}
        {data.guestMessages.length === 0 && (
          <div className="empty-state">
            <MessageSquare size={30} color="#ddd" />
            <p>첫 번째 축하 메시지를 남겨주세요!</p>
          </div>
        )}
      </div>

      <style>{`
        .subtitle {
          font-size: 0.9rem;
          color: var(--wedding-text-sub);
          margin-bottom: 30px;
        }
        .message-form {
          background: var(--wedding-card-bg);
          padding: 20px;
          border-radius: 20px;
          border: 1px solid var(--wedding-border);
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 30px;
          text-align: left;
        }
        .message-form input, .message-form textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--wedding-border);
          border-radius: 12px;
          background: var(--wedding-bg);
          font-size: 0.9rem;
          font-family: inherit;
        }
        .submit-btn {
          padding: 12px;
          background: var(--wedding-main);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
        }
        .message-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .message-card {
          background: var(--wedding-card-bg);
          padding: 18px;
          border-radius: 16px;
          border: 1px solid var(--wedding-border);
          text-align: left;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .msg-name {
          font-weight: 700;
          color: var(--wedding-text-main);
          font-size: 0.9rem;
        }
        .msg-date {
          font-size: 0.75rem;
          color: var(--wedding-text-sub);
        }
        .msg-content {
          font-size: 0.9rem;
          color: var(--wedding-text-body);
          line-height: 1.6;
          margin: 0;
        }
        .empty-state {
          padding: 40px 0;
          color: var(--wedding-text-sub);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
      `}</style>
    </section>
  );
};

export default Guestbook;
