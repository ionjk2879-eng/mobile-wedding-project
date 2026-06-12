import React from 'react';
import { InvitationData } from '../../types';

interface EditorProps {
  data: InvitationData;
  onChange: (data: InvitationData) => void;
}

const EditorContainer: React.FC<EditorProps> = ({ data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    const newContacts = [...data.contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    onChange({ ...data, contacts: newContacts });
  };

  const handleAccountChange = (index: number, field: string, value: string) => {
    const newAccounts = [...data.accounts];
    newAccounts[index] = { ...newAccounts[index], [field]: value };
    onChange({ ...data, accounts: newAccounts });
  };

  return (
    <div className="editor-scroll-area">
      <div className="editor-content-wrapper">
        <div className="editor-section">
          <h3>기본 정보</h3>
          <div className="input-group">
            <label>신랑 이름</label>
            <input type="text" name="groomName" value={data.groomName} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>신부 이름</label>
            <input type="text" name="brideName" value={data.brideName} onChange={handleChange} />
          </div>
          <div className="input-row">
            <div className="input-group">
              <label>예식 날짜</label>
              <input type="text" name="date" value={data.date} onChange={handleChange} placeholder="2026. 10. 24. SAT" />
            </div>
            <div className="input-group">
              <label>예식 시간</label>
              <input type="text" name="time" value={data.time} onChange={handleChange} placeholder="PM 12:30" />
            </div>
          </div>
        </div>

        <div className="editor-section">
          <h3>인사말</h3>
          <div className="input-group">
            <label>제목</label>
            <input type="text" name="greetingTitle" value={data.greetingTitle} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>내용</label>
            <textarea name="greetingContent" value={data.greetingContent} onChange={handleChange} rows={6} />
          </div>
        </div>

        <div className="editor-section">
          <h3>장소 정보</h3>
          <div className="input-group">
            <label>예식장 이름</label>
            <input type="text" name="venueName" value={data.venueName} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>예식장 주소</label>
            <input type="text" name="venueAddress" value={data.venueAddress} onChange={handleChange} />
          </div>
        </div>

        <div className="editor-section">
          <h3>연락처 설정</h3>
          <div className="nested-grid">
            {data.contacts.map((contact, index) => (
              <div key={index} className="nested-card">
                <p className="sub-label">{contact.role}</p>
                <div className="nested-inputs">
                  <input 
                    type="text" 
                    placeholder="이름" 
                    value={contact.name} 
                    onChange={(e) => handleContactChange(index, 'name', e.target.value)} 
                  />
                  <input 
                    type="text" 
                    placeholder="전화번호" 
                    value={contact.phone} 
                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="editor-section">
          <h3>계좌 정보</h3>
          <div className="nested-grid">
            {data.accounts.map((account, index) => (
              <div key={index} className="nested-card">
                <p className="sub-label">{account.side}</p>
                <div className="nested-inputs">
                  <input 
                    type="text" 
                    placeholder="은행" 
                    value={account.bank} 
                    onChange={(e) => handleAccountChange(index, 'bank', e.target.value)} 
                  />
                  <input 
                    type="text" 
                    placeholder="계좌번호" 
                    value={account.number} 
                    onChange={(e) => handleAccountChange(index, 'number', e.target.value)} 
                  />
                  <input 
                    type="text" 
                    placeholder="예금주" 
                    value={account.owner} 
                    onChange={(e) => handleAccountChange(index, 'owner', e.target.value)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .editor-scroll-area {
          flex: 1;
          overflow-y: auto;
          background: #f8f9fa;
        }
        .editor-content-wrapper {
          padding: 24px;
        }
        .editor-section {
          background: white;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          border: 1px solid #edf2f7;
        }
        .editor-section h3 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 1.15rem;
          color: #2d3748;
          border-left: 5px solid #ff9a9e;
          padding-left: 12px;
          font-weight: 700;
        }
        .input-group {
          margin-bottom: 18px;
        }
        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .input-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 8px;
        }
        .input-group input, .input-group textarea {
          width: 100%;
          padding: 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.95rem;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .input-group input:focus, .input-group textarea:focus {
          outline: none;
          border-color: #ff9a9e;
        }
        .nested-grid {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .nested-card {
          padding: 18px;
          background: #f7fafc;
          border-radius: 12px;
          border: 1px solid #edf2f7;
        }
        .nested-inputs {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .nested-inputs input {
          width: 100%;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          box-sizing: border-box;
          background: white;
        }
        .sub-label {
          font-weight: 700;
          font-size: 0.85rem;
          margin-top: 0;
          margin-bottom: 12px;
          color: #4a5568;
        }
      `}</style>
    </div>
  );
};

export default EditorContainer;
