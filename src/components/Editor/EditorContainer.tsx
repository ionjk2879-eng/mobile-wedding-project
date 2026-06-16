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

  const handleEnChange = (field: keyof InvitationData, value: string) => {
    onChange({
      ...data,
      en: { ...data.en, [field]: value }
    });
  };

  const handleTransportChange = (field: string, value: string) => {
    onChange({
      ...data,
      transport: { ...data.transport, [field]: value }
    });
  };

  const handleParentChange = (side: 'groomParents' | 'brideParents', index: number, field: string, value: string) => {
    const newParents = [...data.parents[side]];
    newParents[index] = { ...newParents[index], [field]: value };
    onChange({
      ...data,
      parents: { ...data.parents, [side]: newParents }
    });
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const readers = fileArray.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newPhotos => {
      onChange({ ...data, photos: [...data.photos, ...newPhotos] });
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...data.photos];
    newPhotos.splice(index, 1);
    onChange({ ...data, photos: newPhotos });
  };

  const fonts = [
    { name: '기본 (Pretendard)', value: "'Pretendard', sans-serif" },
    { name: 'Cormorant Garamond (럭셔리 세리프)', value: "'Cormorant Garamond', serif" },
    { name: 'Playfair Display (에디토리얼 세리프)', value: "'Playfair Display', serif" },
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
            <label>기본 언어 선택</label>
            <div className="tab-group mini">
              <button 
                className={`tab-btn ${data.language === 'ko' ? 'active' : ''}`}
                onClick={() => onChange({...data, language: 'ko'})}
              >KOREAN</button>
              <button 
                className={`tab-btn ${data.language === 'en' ? 'active' : ''}`}
                onClick={() => onChange({...data, language: 'en'})}
              >ENGLISH</button>
            </div>
            <p className="input-hint">언어를 전환하면 미리보기의 UI 레이블이 해당 언어로 변경됩니다.</p>
          </div>
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
            <label>청첩장 테마 선택</label>
            <div className="theme-select-grid">
              <button
                type="button"
                className={`theme-select-btn warm ${data.theme === 'warm' ? 'active' : ''}`}
                onClick={() => onChange({ ...data, theme: 'warm' })}
              >
                <div className="theme-color-dots">
                  <span style={{ background: '#FFFFFF' }}></span>
                  <span style={{ background: '#D4A5C6' }}></span>
                  <span style={{ background: '#B3A2C8' }}></span>
                </div>
                <span>Soft Blossom</span>
              </button>
              <button
                type="button"
                className={`theme-select-btn dark ${data.theme === 'dark' ? 'active' : ''}`}
                onClick={() => onChange({ ...data, theme: 'dark' })}
              >
                <div className="theme-color-dots">
                  <span style={{ background: '#FFFFFF' }}></span>
                  <span style={{ background: '#A899C9' }}></span>
                  <span style={{ background: '#DDA7C4' }}></span>
                </div>
                <span>Lavender Mist</span>
              </button>
              <button
                type="button"
                className={`theme-select-btn midnight ${data.theme === 'midnight' ? 'active' : ''}`}
                onClick={() => onChange({ ...data, theme: 'midnight' })}
              >
                <div className="theme-color-dots">
                  <span style={{ background: '#FFFFFF' }}></span>
                  <span style={{ background: '#DF8EB0' }}></span>
                  <span style={{ background: '#A396C0' }}></span>
                </div>
                <span>Blossom Bouquet</span>
              </button>
            </div>
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
          </div>
          <div className="input-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={data.isRSVPEnabled} 
                onChange={(e) => onChange({ ...data, isRSVPEnabled: e.target.checked })} 
              />
              참석 응답(RSVP) 기능 활성화
            </label>
          </div>
        </div>

        <div className="editor-section">
          <h3>기본 정보</h3>
          <div className="input-group">
            <label>신랑 이름</label>
            <input type="text" name="groomName" value={data.groomName} onChange={handleChange} />
            {data.language === 'en' && (
              <input type="text" placeholder="Groom Name (EN)" value={data.en.groomName} onChange={(e) => handleEnChange('groomName', e.target.value)} className="en-input" />
            )}
          </div>
          <div className="input-group">
            <label>신부 이름</label>
            <input type="text" name="brideName" value={data.brideName} onChange={handleChange} />
            {data.language === 'en' && (
              <input type="text" placeholder="Bride Name (EN)" value={data.en.brideName} onChange={(e) => handleEnChange('brideName', e.target.value)} className="en-input" />
            )}
          </div>
          <div className="input-row">
            <div className="input-group">
              <label>표시 날짜</label>
              <input type="text" name="date" value={data.date} onChange={handleChange} placeholder="2026. 10. 24. SAT" />
            </div>
            <div className="input-group">
              <label>D-Day 계산 날짜</label>
              <input type="date" name="weddingDateISO" value={data.weddingDateISO} onChange={handleChange} />
            </div>
          </div>
          <div className="input-group">
            <label>예식 시간</label>
            <input type="text" name="time" value={data.time} onChange={handleChange} placeholder="PM 12:30" />
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
          <h3>영상 하이라이트</h3>
          <div className="input-group">
            <label>YouTube / Vimeo URL</label>
            <input 
              type="text" 
              name="videoUrl" 
              value={data.videoUrl} 
              onChange={handleChange} 
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>

        <div className="editor-section">
          <h3>장소 및 교통 정보</h3>
          <div className="input-group">
            <label>예식장 주소</label>
            <div className="search-input-wrapper">
              <input 
                type="text" 
                name="venueAddress" 
                value={data.venueAddress} 
                onChange={handleChange} 
                readOnly
              />
              <button className="search-btn" onClick={handleAddressSearch}><Search size={18} /><span>검색</span></button>
            </div>
          </div>
          <div className="input-group">
            <label>예식장 이름</label>
            <input type="text" name="venueName" value={data.venueName} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>지하철 안내</label>
            <textarea value={data.transport.subway} onChange={(e) => handleTransportChange('subway', e.target.value)} rows={2} />
          </div>
          <div className="input-group">
            <label>버스 안내</label>
            <textarea value={data.transport.bus} onChange={(e) => handleTransportChange('bus', e.target.value)} rows={2} />
          </div>
          <div className="input-group">
            <label>주차 안내</label>
            <textarea value={data.transport.parking} onChange={(e) => handleTransportChange('parking', e.target.value)} rows={2} />
          </div>
        </div>

        <div className="editor-section">
          <h3>부모님 연락처</h3>
          <div className="parent-editor-grid">
            <div className="parent-side-editor">
              <p className="sub-label">신랑측 부모님</p>
              {data.parents.groomParents.map((p, i) => (
                <div key={i} className="mini-contact-row">
                  <input type="text" placeholder="관계" value={p.role} onChange={(e) => handleParentChange('groomParents', i, 'role', e.target.value)} />
                  <input type="text" placeholder="이름" value={p.name} onChange={(e) => handleParentChange('groomParents', i, 'name', e.target.value)} />
                  <input type="text" placeholder="번호" value={p.phone} onChange={(e) => handleParentChange('groomParents', i, 'phone', e.target.value)} />
                </div>
              ))}
            </div>
            <div className="parent-side-editor">
              <p className="sub-label">신부측 부모님</p>
              {data.parents.brideParents.map((p, i) => (
                <div key={i} className="mini-contact-row">
                  <input type="text" placeholder="관계" value={p.role} onChange={(e) => handleParentChange('brideParents', i, 'role', e.target.value)} />
                  <input type="text" placeholder="이름" value={p.name} onChange={(e) => handleParentChange('brideParents', i, 'name', e.target.value)} />
                  <input type="text" placeholder="번호" value={p.phone} onChange={(e) => handleParentChange('brideParents', i, 'phone', e.target.value)} />
                </div>
              ))}
            </div>
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

        <div className="editor-section">
          <h3>갤러리 사진</h3>
          <div className="photo-upload-area">
            <label className="upload-btn">
              <span>📸 사진 추가하기</span>
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} hidden />
            </label>
            <div className="photo-preview-grid">
              {data.photos.map((photo, index) => (
                <div key={index} className="photo-preview-item">
                  <img src={photo} alt={`Preview ${index}`} />
                  <button className="remove-photo-btn" onClick={() => removePhoto(index)}><Search size={14} style={{ transform: 'rotate(45deg)' }} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .photo-upload-area {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .upload-btn {
          width: 100%;
          padding: 20px;
          border: 2px dashed #D4A5C6;
          border-radius: 16px;
          color: #D4A5C6;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .upload-btn:hover {
          background: rgba(212, 165, 198, 0.05);
          border-color: #B3A2C8;
          color: #B3A2C8;
        }
        .photo-preview-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .photo-preview-item {
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          border: 1px solid #EEDDE4;
        }
        .photo-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .remove-photo-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
        }
        .editor-scroll-area {
          flex: 1;
          overflow-y: auto;
          background: #FAF5F7;
        }
        .editor-content-wrapper {
          padding: 30px 24px;
        }
        .editor-section {
          background: white;
          padding: 28px;
          border-radius: 20px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(212, 165, 198, 0.05);
          border: 1px solid #EEDDE4;
        }
        .editor-section h3 {
          margin-top: 0;
          margin-bottom: 24px;
          font-size: 1.1rem;
          color: #D4A5C6;
          border-left: 4px solid #B3A2C8;
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
          color: #8F7D8B;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .input-group input, .input-group textarea, .styled-select {
          width: 100%;
          padding: 14px;
          border: 1px solid #EEDDE4;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #3C2B38;
          box-sizing: border-box;
          background: #FAF5F7;
          transition: all 0.2s ease;
        }
        .input-group input:focus, .input-group textarea:focus, .styled-select:focus {
          outline: none;
          border-color: #D4A5C6;
          background: white;
          box-shadow: 0 0 0 4px rgba(212, 165, 198, 0.15);
        }
        .styled-select {
          width: 100%;
          padding: 14px;
          border: 1px solid #EEDDE4;
          border-radius: 12px;
          font-size: 0.95rem;
          background: white;
          cursor: pointer;
        }
        .theme-select-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 8px;
        }
        .theme-select-btn {
          padding: 12px 8px;
          border-radius: 12px;
          border: 1px solid #EEDDE4;
          background: #FAF5F7;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .theme-select-btn span {
          font-size: 0.75rem;
          font-weight: 600;
          color: #8F7D8B;
        }
        .theme-select-btn.active {
          border-color: #D4A5C6;
          background: white;
          box-shadow: 0 4px 12px rgba(212, 165, 198, 0.15);
        }
        .theme-select-btn.active span {
          color: #3C2B38;
        }
        .theme-color-dots {
          display: flex;
          gap: 4px;
        }
        .theme-color-dots span {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: #3C2B38;
          font-weight: 600;
          cursor: pointer;
          text-transform: none !important;
          letter-spacing: 0 !important;
        }
        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
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
          background: #D4A5C6;
          color: white;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .search-btn:hover {
          background: #B3A2C8;
          transform: translateY(-1px);
        }
        .input-hint {
          font-size: 0.75rem;
          color: #8F7D8B;
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
          background: #FAF5F7;
          border-radius: 14px;
          border: 1px solid #EEDDE4;
        }
        .nested-inputs {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .nested-inputs input {
          width: 100%;
          padding: 12px;
          border: 1px solid #EEDDE4;
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
          color: #8F7D8B;
        }
        .mini-contact-row {
          display: grid;
          grid-template-columns: 60px 1fr 1.5fr;
          gap: 8px;
          margin-bottom: 10px;
        }
        .mini-contact-row input {
          padding: 8px !important;
          font-size: 0.8rem !important;
        }
        .parent-editor-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .tab-group.mini {
          margin-bottom: 10px;
        }
        .tab-group.mini .tab-btn {
          padding: 8px;
          font-size: 0.75rem;
        }
        .en-input {
          margin-top: 8px;
          background: #fdf6f9 !important;
          border-color: #f3d6e5 !important;
        }
      `}</style>
    </div>
  );
};

export default EditorContainer;
