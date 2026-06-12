import React from 'react';
import { Search } from 'lucide-react';
import { InvitationData } from '../../types';

declare global {
  interface Window {
    daum: any;
  }
}

interface EditorProps {
  data: InvitationData;
  onChange: (data: InvitationData) => void;
}

const EditorContainer: React.FC<EditorProps> = ({ data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (searchData: any) => {
        let fullAddress = searchData.address;
        let extraAddress = '';

        if (searchData.addressType === 'R') {
          if (searchData.bname !== '') {
            extraAddress += searchData.bname;
          }
          if (searchData.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? `, ${searchData.buildingName}` : searchData.buildingName);
          }
          fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        onChange({
          ...data,
          venueAddress: fullAddress,
          venueName: searchData.buildingName || data.venueName
        });
      }
    }).open();
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

  const fonts = [
    { name: '기본 (Pretendard)', value: "'Pretendard', sans-serif" },
    { name: '고운 바탕 (세리프)', value: "'Gowun Batang', serif" },
    { name: '고운 돋움 (산세리프)', value: "'Gowun Dodum', sans-serif" },
    { name: '나눔 명조 (클래식)', value: "'Nanum Myeongjo', serif" },
    { name: 'Dancing Script (영문 필기체)', value: "'Dancing Script', cursive" },
  ];

  return (
    <div className="editor-scroll-area">
      <div className="editor-content-wrapper">
        <div className="editor-section">
          <h3>디자인 설정</h3>
          <div className="input-group">
            <label>폰트 선택</label>
            <select 
              name="fontFamily" 
              value={data.fontFamily} 
              onChange={(e) => onChange({ ...data, fontFamily: e.target.value })}
              className="styled-select"
            >
              {fonts.map(font => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>배경음악 URL (MP3)</label>
            <input 
              type="text" 
              name="bgMusicUrl" 
              value={data.bgMusicUrl} 
              onChange={handleChange} 
              placeholder="https://example.com/music.mp3"
            />
            <p className="input-hint">MP3 링크를 입력하면 청첩장에서 재생됩니다.</p>
          </div>
        </div>

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
          <h3>신랑 & 신부의 한마디</h3>
          <div className="input-group">
            <label>신랑의 한마디</label>
            <textarea name="groomMessage" value={data.groomMessage} onChange={handleChange} rows={3} placeholder="신랑의 개인적인 메시지를 입력하세요" />
          </div>
          <div className="input-group">
            <label>신부의 한마디</label>
            <textarea name="brideMessage" value={data.brideMessage} onChange={handleChange} rows={3} placeholder="신부의 개인적인 메시지를 입력하세요" />
          </div>
        </div>

        <div className="editor-section">
          <h3>장소 정보</h3>
          <div className="input-group">
            <label>예식장 주소</label>
            <div className="search-input-wrapper">
              <input 
                type="text" 
                name="venueAddress" 
                value={data.venueAddress} 
                onChange={handleChange} 
                placeholder="주소 검색 버튼을 눌러주세요"
                readOnly
              />
              <button className="search-btn" onClick={handleAddressSearch}>
                <Search size={18} />
                <span>주소 검색</span>
              </button>
            </div>
          </div>
          <div className="input-group">
            <label>예식장 이름 (자동 입력 후 수정 가능)</label>
            <input type="text" name="venueName" value={data.venueName} onChange={handleChange} />
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
          background: #fcfaf5;
        }
        .editor-content-wrapper {
          padding: 30px 24px;
        }
        .editor-section {
          background: white;
          padding: 28px;
          border-radius: 20px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(184, 156, 142, 0.08);
          border: 1px solid #f0eae5;
        }
        .editor-section h3 {
          margin-top: 0;
          margin-bottom: 24px;
          font-size: 1.1rem;
          color: #b89c8e;
          border-left: 4px solid #e5d1c8;
          padding-left: 14px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .input-group {
          margin-bottom: 20px;
        }
        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .input-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #8c8581;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .input-group input, .input-group textarea, .styled-select {
          width: 100%;
          padding: 14px;
          border: 1px solid #f0eae5;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #4a4543;
          box-sizing: border-box;
          background: #fdfbf9;
          transition: all 0.2s ease;
        }
        .input-group input:focus, .input-group textarea:focus, .styled-select:focus {
          outline: none;
          border-color: #b89c8e;
          background: white;
          box-shadow: 0 0 0 4px rgba(184, 156, 142, 0.1);
        }
        .search-input-wrapper {
          display: flex;
          gap: 10px;
        }
        .search-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 20px;
          background: #b89c8e;
          color: white;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .search-btn:hover {
          background: #a68b7d;
          transform: translateY(-1px);
        }
        .input-hint {
          font-size: 0.75rem;
          color: #b89c8e;
          margin-top: 8px;
          margin-bottom: 0;
        }
        .nested-grid {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .nested-card {
          padding: 20px;
          background: #fdfbf9;
          border-radius: 14px;
          border: 1px solid #f0eae5;
        }
        .nested-inputs {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .nested-inputs input {
          width: 100%;
          padding: 12px;
          border: 1px solid #f0eae5;
          border-radius: 10px;
          font-size: 0.9rem;
          box-sizing: border-box;
          background: white;
        }
        .sub-label {
          font-weight: 700;
          font-size: 0.8rem;
          margin-top: 0;
          margin-bottom: 12px;
          color: #b89c8e;
        }
      `}</style>
    </div>
  );
};

export default EditorContainer;
