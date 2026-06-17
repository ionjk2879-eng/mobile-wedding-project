import React from 'react';
import { Search, ChevronUp, ChevronDown, Clock, Palette, Info, MessageSquare, Heart, MapPin, Users, Phone, CreditCard, Image as ImageIcon } from 'lucide-react';
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
  const sectionRefs = {
    design: React.useRef<HTMLDivElement>(null),
    basic: React.useRef<HTMLDivElement>(null),
    greeting: React.useRef<HTMLDivElement>(null),
    message: React.useRef<HTMLDivElement>(null),
    location: React.useRef<HTMLDivElement>(null),
    parents: React.useRef<HTMLDivElement>(null),
    contacts: React.useRef<HTMLDivElement>(null),
    accounts: React.useRef<HTMLDivElement>(null),
    photos: React.useRef<HTMLDivElement>(null),
  };

  const workspaceRef = React.useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = React.useState('design');
  const isScrollingRef = React.useRef(false);

  React.useEffect(() => {
    const observerOptions = {
      root: workspaceRef.current,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = Object.keys(sectionRefs).find(
            (key) => sectionRefs[key as keyof typeof sectionRefs].current === entry.target
          );
          if (sectionId) {
            setActiveSection(sectionId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string, ref: React.RefObject<HTMLDivElement>) => {
    isScrollingRef.current = true;
    setActiveSection(id);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  const parseTime = (timeStr: string) => {
    const parts = timeStr.match(/(AM|PM)\s(\d+):(\d+)/);
    if (parts) {
      return {
        ampm: parts[1],
        hours: parseInt(parts[2]),
        minutes: parseInt(parts[3])
      };
    }
    return { ampm: 'PM', hours: 12, minutes: 0 };
  };

  const timeParts = parseTime(data.time);

  const adjustTime = (type: 'hours' | 'minutes' | 'ampm', delta: number) => {
    let { ampm, hours, minutes } = timeParts;
    
    if (type === 'ampm') {
      ampm = ampm === 'AM' ? 'PM' : 'AM';
    } else if (type === 'hours') {
      hours += delta;
      if (hours > 12) hours = 1;
      if (hours < 1) hours = 12;
    } else if (type === 'minutes') {
      minutes += delta;
      if (minutes >= 60) minutes = 0;
      if (minutes < 0) minutes = 55;
    }
    
    const timeString = `${ampm} ${hours}:${minutes.toString().padStart(2, '0')}`;
    onChange({
      ...data,
      time: timeString
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'weddingDateISO') {
      const selectedDate = new Date(value);
      if (!isNaN(selectedDate.getTime())) {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;
        const day = selectedDate.getDate();
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const dayName = dayNames[selectedDate.getDay()];
        
        onChange({ 
          ...data, 
          [name]: value,
          date: `${year}. ${month}. ${day}. ${dayName}`
        });
        return;
      }
    }

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

  const handleHeroPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onChange({ ...data, heroPhoto: event.target?.result as string });
    };
    reader.readAsDataURL(file);
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

  const navItems = [
    { id: 'design', name: '디자인', icon: <Palette size={20} />, ref: sectionRefs.design },
    { id: 'basic', name: '기본정보', icon: <Info size={20} />, ref: sectionRefs.basic },
    { id: 'greeting', name: '인사말', icon: <MessageSquare size={20} />, ref: sectionRefs.greeting },
    { id: 'message', name: '메시지', icon: <Heart size={20} />, ref: sectionRefs.message },
    { id: 'location', name: '장소', icon: <MapPin size={20} />, ref: sectionRefs.location },
    { id: 'parents', name: '부모님', icon: <Users size={20} />, ref: sectionRefs.parents },
    { id: 'contacts', name: '연락처', icon: <Phone size={20} />, ref: sectionRefs.contacts },
    { id: 'accounts', name: '계좌', icon: <CreditCard size={20} />, ref: sectionRefs.accounts },
    { id: 'photos', name: '사진', icon: <ImageIcon size={20} />, ref: sectionRefs.photos },
  ];

  return (
    <div className="editor-main-container">
      <nav className="editor-nav-sidebar">
        <div className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => scrollToSection(item.id, item.ref)}
            >
              <div className="nav-icon-box">{item.icon}</div>
              <span className="nav-label">{item.name}</span>
            </button>
          ))}
        </div>
      </nav>
      
      <div className="editor-workspace" ref={workspaceRef}>
        <div className="editor-unified-content">
          <div className="editor-section-group" ref={sectionRefs.design}>
            <div className="section-header">
              <Palette size={22} />
              <h3>디자인 설정</h3>
            </div>
            <div className="section-content">
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
              </div>
              <div className="input-group">
                <label>글꼴 및 크기 설정</label>
                <div className="font-settings-box">
                  <div className="settings-row">
                    <span className="settings-label">글꼴</span>
                    <select 
                      name="fontFamily" 
                      value={data.fontFamily} 
                      onChange={(e) => onChange({ ...data, fontFamily: e.target.value })}
                      className="styled-select mini"
                    >
                      {fonts.map(font => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="settings-row">
                    <span className="settings-label">글자 크기</span>
                    <div className="font-size-buttons">
                      <button 
                        type="button" 
                        className={`size-btn ${data.fontSize === 'small' ? 'active' : ''}`}
                        onClick={() => onChange({ ...data, fontSize: 'small' })}
                      >작게</button>
                      <button 
                        type="button" 
                        className={`size-btn ${data.fontSize === 'medium' ? 'active' : ''}`}
                        onClick={() => onChange({ ...data, fontSize: 'medium' })}
                      >중간</button>
                      <button 
                        type="button" 
                        className={`size-btn ${data.fontSize === 'large' ? 'active' : ''}`}
                        onClick={() => onChange({ ...data, fontSize: 'large' })}
                      >크게</button>
                    </div>
                  </div>
                </div>
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
                <label>배경 재질 및 효과 설정</label>
                <div className="effect-settings-grid">
                  <div className="effect-group">
                    <span className="settings-label mini">배경 재질</span>
                    <select 
                      value={data.bgTexture || 'none'} 
                      onChange={(e) => onChange({ ...data, bgTexture: e.target.value as any })}
                      className="styled-select mini"
                    >
                      <option value="none">없음 (기본)</option>
                      <option value="paper">한지/종이 질감</option>
                      <option value="linen">린넨 패브릭</option>
                      <option value="pattern">은은한 도트 패턴</option>
                    </select>
                  </div>
                  <div className="effect-group">
                    <span className="settings-label mini">흩날리는 효과</span>
                    <select 
                      value={data.bgEffect || 'none'} 
                      onChange={(e) => onChange({ ...data, bgEffect: e.target.value as any })}
                      className="styled-select mini"
                    >
                      <option value="none">없음</option>
                      <option value="cherry-blossom">🌸 벚꽃 휘날리며</option>
                      <option value="snow">❄️ 함박눈 내리는</option>
                      <option value="stars">✨ 반짝이는 별빛</option>
                    </select>
                  </div>
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
          </div>

          <div className="section-divider"></div>

          <div className="editor-section-group" ref={sectionRefs.basic}>
            <div className="section-header">
              <Info size={22} />
              <h3>기본 정보</h3>
            </div>
            <div className="section-content">
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
                  <label>예식일 선택</label>
                  <input type="date" name="weddingDateISO" value={data.weddingDateISO} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>표시 날짜 (자동 생성)</label>
                  <input type="text" name="date" value={data.date} readOnly className="readonly-input" />
                </div>
              </div>
              <div className="input-group">
                <label>예식 시간 설정</label>
                <div className="digital-time-picker">
                  <div className="time-picker-block ampm">
                    <button 
                      type="button"
                      className={`ampm-btn ${timeParts.ampm === 'AM' ? 'active' : ''}`}
                      onClick={() => adjustTime('ampm', 0)}
                    >AM</button>
                    <button 
                      type="button"
                      className={`ampm-btn ${timeParts.ampm === 'PM' ? 'active' : ''}`}
                      onClick={() => adjustTime('ampm', 0)}
                    >PM</button>
                  </div>
                  
                  <div className="time-picker-main">
                    <div className="time-unit">
                      <button type="button" onClick={() => adjustTime('hours', 1)}><ChevronUp size={20} /></button>
                      <div className="time-value">{timeParts.hours.toString().padStart(2, '0')}</div>
                      <button type="button" onClick={() => adjustTime('hours', -1)}><ChevronDown size={20} /></button>
                    </div>
                    <div className="time-separator">:</div>
                    <div className="time-unit">
                      <button type="button" onClick={() => adjustTime('minutes', 5)}><ChevronUp size={20} /></button>
                      <div className="time-value">{timeParts.minutes.toString().padStart(2, '0')}</div>
                      <button type="button" onClick={() => adjustTime('minutes', -5)}><ChevronDown size={20} /></button>
                    </div>
                  </div>
                  <div className="time-icon-wrapper">
                    <Clock size={24} color="#D4A5C6" />
                  </div>
                </div>
                <p className="input-hint">현재 설정된 시간: {data.time}</p>
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          <div className="editor-section-group" ref={sectionRefs.greeting}>
            <div className="section-header">
              <MessageSquare size={22} />
              <h3>인사말</h3>
            </div>
            <div className="section-content">
              <div className="input-group">
                <label>제목</label>
                <input type="text" name="greetingTitle" value={data.greetingTitle} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>내용</label>
                <textarea name="greetingContent" value={data.greetingContent} onChange={handleChange} rows={6} />
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          <div className="editor-section-group" ref={sectionRefs.message}>
            <div className="section-header">
              <Heart size={22} />
              <h3>신랑/신부 한마디</h3>
            </div>
            <div className="section-content">
              <div className="input-group">
                <label>신랑의 한마디</label>
                <textarea name="groomMessage" value={data.groomMessage} onChange={handleChange} rows={3} placeholder="항상 곁에서 힘이 되어주는 든든한 남편이 되겠습니다." />
              </div>
              <div className="input-group">
                <label>신부의 한마디</label>
                <textarea name="brideMessage" value={data.brideMessage} onChange={handleChange} rows={3} placeholder="서로 아끼고 배려하며 예쁘게 잘 살겠습니다." />
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          <div className="editor-section-group" ref={sectionRefs.location}>
            <div className="section-header">
              <MapPin size={22} />
              <h3>장소 및 교통 정보</h3>
            </div>
            <div className="section-content">
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
          </div>

          <div className="section-divider"></div>

          <div className="editor-section-group" ref={sectionRefs.parents}>
            <div className="section-header">
              <Users size={22} />
              <h3>부모님 연락처</h3>
            </div>
            <div className="section-content">
              <div className="nested-grid">
                <div className="nested-card">
                  <p className="sub-label">신랑측 부모님</p>
                  <div className="nested-inputs">
                    {data.parents.groomParents.map((p, i) => (
                      <div key={i} className="input-row">
                        <input type="text" placeholder="관계" value={p.role} onChange={(e) => handleParentChange('groomParents', i, 'role', e.target.value)} />
                        <input type="text" placeholder="이름" value={p.name} onChange={(e) => handleParentChange('groomParents', i, 'name', e.target.value)} />
                        <input type="text" placeholder="전화번호" value={p.phone} onChange={(e) => handleParentChange('groomParents', i, 'phone', e.target.value)} className="full-width-input" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="nested-card">
                  <p className="sub-label">신부측 부모님</p>
                  <div className="nested-inputs">
                    {data.parents.brideParents.map((p, i) => (
                      <div key={i} className="input-row">
                        <input type="text" placeholder="관계" value={p.role} onChange={(e) => handleParentChange('brideParents', i, 'role', e.target.value)} />
                        <input type="text" placeholder="이름" value={p.name} onChange={(e) => handleParentChange('brideParents', i, 'name', e.target.value)} />
                        <input type="text" placeholder="전화번호" value={p.phone} onChange={(e) => handleParentChange('brideParents', i, 'phone', e.target.value)} className="full-width-input" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          <div className="editor-section-group" ref={sectionRefs.contacts}>
            <div className="section-header">
              <Phone size={22} />
              <h3>연락처 설정</h3>
            </div>
            <div className="section-content">
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
          </div>

          <div className="section-divider"></div>

          <div className="editor-section-group" ref={sectionRefs.accounts}>
            <div className="section-header">
              <CreditCard size={22} />
              <h3>계좌 정보</h3>
            </div>
            <div className="section-content">
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

          <div className="section-divider"></div>

          <div className="editor-section-group" ref={sectionRefs.photos}>
            <div className="section-header">
              <ImageIcon size={22} />
              <h3>사진 관리</h3>
            </div>
            <div className="section-content">
              <div className="photo-editor-wrapper">
                <div className="main-photo-upload">
                  <p className="sub-label">대표 메인 사진</p>
                  <div className="main-photo-preview">
                    <img src={data.heroPhoto} alt="Main Preview" />
                    <label className="upload-overlay">
                      <span>변경하기</span>
                      <input type="file" accept="image/*" onChange={handleHeroPhotoUpload} hidden />
                    </label>
                  </div>
                </div>
                
                <div className="gallery-photos-upload">
                  <p className="sub-label">갤러리 사진 목록</p>
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
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .editor-main-container {
          display: flex;
          height: 100%;
          overflow: hidden;
          background: #FAF5F7;
        }
        .editor-nav-sidebar {
          width: 90px;
          background: white;
          border-right: 1px solid #EEDDE4;
          display: flex;
          flex-direction: column;
          padding: 20px 0;
          flex-shrink: 0;
          overflow-y: auto;
        }
        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px 0;
          border: none;
          background: none;
          color: #B2A4B0;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          width: 100%;
        }
        .nav-item:hover {
          color: #D4A5C6;
          background: rgba(212, 165, 198, 0.03);
        }
        .nav-item.active {
          color: #D4A5C6;
          background: rgba(212, 165, 198, 0.06);
        }
        .nav-item.active::after {
          content: '';
          position: absolute;
          right: -1px;
          top: 20%;
          height: 60%;
          width: 3px;
          background: #D4A5C6;
          border-radius: 3px 0 0 3px;
        }
        .nav-icon-box {
          margin-bottom: 5px;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-item.active .nav-icon-box {
          transform: scale(1.1);
        }
        .nav-label {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: -0.2px;
        }
        .editor-workspace {
          flex: 1;
          overflow-y: auto;
          scroll-behavior: smooth;
          padding: 30px;
          background: #FAF5F7;
        }
        .editor-unified-content {
          background: white;
          border-radius: 20px;
          border: 1px solid #EEDDE4;
          box-shadow: 0 4px 30px rgba(212, 165, 198, 0.05);
          overflow: hidden;
        }
        .editor-section-group {
          padding: 40px;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
          color: #3C2B38;
        }
        .section-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .section-header svg {
          color: #D4A5C6;
        }
        .section-divider {
          height: 1px;
          background: #F0E6EB;
          margin: 0 40px;
        }
        .input-group {
          margin-bottom: 25px;
        }
        .input-group:last-child {
          margin-bottom: 0;
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
        }
        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        .tab-group.mini {
          display: flex;
          background: #FAF5F7;
          padding: 4px;
          border-radius: 10px;
          border: 1px solid #EEDDE4;
        }
        .tab-btn {
          flex: 1;
          padding: 8px;
          border: none;
          background: none;
          font-size: 0.75rem;
          font-weight: 700;
          color: #8F7D8B;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: white;
          color: #D4A5C6;
          box-shadow: 0 2px 6px rgba(212, 165, 198, 0.1);
        }
        .font-settings-box {
          background: #FAF5F7;
          border: 1px solid #EEDDE4;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }
        .settings-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #8F7D8B;
        }
        .font-size-buttons {
          flex: 1;
          display: flex;
          background: white;
          padding: 3px;
          border-radius: 8px;
          border: 1px solid #EEDDE4;
        }
        .size-btn {
          flex: 1;
          padding: 6px 0;
          border: none;
          background: none;
          font-size: 0.75rem;
          font-weight: 700;
          color: #B2A4B0;
          cursor: pointer;
          border-radius: 6px;
        }
        .size-btn.active {
          background: #D4A5C6;
          color: white;
        }
        .effect-settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .effect-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .settings-label.mini {
          font-size: 0.7rem;
        }
        .digital-time-picker {
          display: flex;
          align-items: center;
          gap: 15px;
          background: #FAF5F7;
          padding: 15px 20px;
          border-radius: 16px;
          border: 1px solid #EEDDE4;
        }
        .time-picker-block.ampm {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ampm-btn {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid #EEDDE4;
          background: white;
          font-size: 0.75rem;
          font-weight: 700;
          color: #8F7D8B;
          cursor: pointer;
        }
        .ampm-btn.active {
          background: #D4A5C6;
          color: white;
          border-color: #D4A5C6;
        }
        .time-picker-main {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          justify-content: center;
        }
        .time-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .time-unit button {
          color: #D4A5C6;
          padding: 0;
        }
        .time-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: #3C2B38;
          width: 45px;
          text-align: center;
        }
        .time-separator {
          font-size: 1.4rem;
          font-weight: 800;
          color: #D4A5C6;
          margin-bottom: 2px;
        }
        .input-hint {
          font-size: 0.75rem;
          color: #8F7D8B;
          margin-top: 8px;
        }
        .nested-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .nested-card {
          padding: 25px;
          background: #FAF5F7;
          border-radius: 16px;
          border: 1px solid #EEDDE4;
        }
        .nested-inputs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .nested-inputs input {
          background: white;
        }
        .sub-label {
          font-weight: 800;
          font-size: 0.85rem;
          margin-top: 0;
          margin-bottom: 15px;
          color: #3C2B38;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sub-label::before {
          content: '';
          width: 3px;
          height: 12px;
          background: #B3A2C8;
          border-radius: 2px;
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
          font-weight: 700;
          white-space: nowrap;
        }
        .photo-editor-wrapper {
          display: flex;
          flex-direction: column;
          gap: 35px;
        }
        .main-photo-preview {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          border: 1px solid #EEDDE4;
        }
        .main-photo-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          opacity: 0;
          transition: opacity 0.2s;
          cursor: pointer;
        }
        .main-photo-preview:hover .upload-overlay {
          opacity: 1;
        }
        .upload-btn {
          width: 100%;
          padding: 25px;
          border: 2px dashed #D4A5C6;
          border-radius: 16px;
          color: #D4A5C6;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: #FFF9FB;
        }
        .photo-preview-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .photo-preview-item {
          aspect-ratio: 1;
          border-radius: 12px;
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
          top: 6px;
          right: 6px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          color: #FF5A5A;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default EditorContainer;
