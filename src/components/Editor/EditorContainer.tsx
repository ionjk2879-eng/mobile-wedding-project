import React from 'react';
import { Search, ChevronUp, ChevronDown, Clock, Palette, Info, MessageSquare, Heart, MapPin, Phone, CreditCard, Image as ImageIcon, ChevronRight, Sparkles } from 'lucide-react';
import { InvitationData } from '../../types';

declare global {
  interface Window {
    daum: any;
  }
}

interface EditorProps {
  data: InvitationData;
  onChange: (data: InvitationData) => void;
  onSectionClick?: (id: string) => void;
}

const EditorContainer: React.FC<EditorProps> = ({ data, onChange, onSectionClick }) => {
  const sectionRefs = {
    theme: React.useRef<HTMLDivElement>(null),
    design: React.useRef<HTMLDivElement>(null),
    basic: React.useRef<HTMLDivElement>(null),
    greeting: React.useRef<HTMLDivElement>(null),
    message: React.useRef<HTMLDivElement>(null),
    location: React.useRef<HTMLDivElement>(null),
    contacts: React.useRef<HTMLDivElement>(null),
    accounts: React.useRef<HTMLDivElement>(null),
    photos: React.useRef<HTMLDivElement>(null),
  };

  const workspaceRef = React.useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = React.useState('design');
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    theme: true,
    design: true,
    basic: true,
    greeting: false,
    message: false,
    location: false,
    contacts: false,
    accounts: false,
    photos: false,
  });
  
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

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollToSection = (id: string, ref: React.RefObject<HTMLDivElement>) => {
    isScrollingRef.current = true;
    setActiveSection(id);
    
    // Ensure section is expanded before scrolling
    setExpandedSections(prev => ({ ...prev, [id]: true }));
    
    // Sync with preview
    if (onSectionClick) onSectionClick(id);
    
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }, 50);
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

  const handleParentNameChange = (side: 'groomParents' | 'brideParents', role: string, value: string) => {
    const newParents = [...data.parents[side]];
    const index = newParents.findIndex(p => p.role === role);
    if (index > -1) {
      newParents[index] = { ...newParents[index], name: value };
      onChange({ ...data, parents: { ...data.parents, [side]: newParents } });
    }
  };

  const handleParentDeceasedChange = (side: 'groomParents' | 'brideParents', role: string, checked: boolean) => {
    const newParents = [...data.parents[side]];
    const index = newParents.findIndex(p => p.role === role);
    if (index > -1) {
      newParents[index] = { ...newParents[index], isDeceased: checked };
      onChange({ ...data, parents: { ...data.parents, [side]: newParents } });
    }
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
    { id: 'theme', name: '테마', icon: <Sparkles size={18} />, ref: sectionRefs.theme },
    { id: 'design', name: '디자인', icon: <Palette size={18} />, ref: sectionRefs.design },
    { id: 'basic', name: '기본정보', icon: <Info size={18} />, ref: sectionRefs.basic },
    { id: 'greeting', name: '인사말', icon: <MessageSquare size={18} />, ref: sectionRefs.greeting },
    { id: 'message', name: '메시지', icon: <Heart size={18} />, ref: sectionRefs.message },
    { id: 'location', name: '장소', icon: <MapPin size={18} />, ref: sectionRefs.location },
    { id: 'contacts', name: '연락처', icon: <Phone size={18} />, ref: sectionRefs.contacts },
    { id: 'accounts', name: '계좌', icon: <CreditCard size={18} />, ref: sectionRefs.accounts },
    { id: 'photos', name: '사진', icon: <ImageIcon size={18} />, ref: sectionRefs.photos },
  ];

  const getParentValue = (side: 'groomParents' | 'brideParents', role: string) => {
    return data.parents[side].find(p => p.role === role)?.name || '';
  };

  const getParentDeceased = (side: 'groomParents' | 'brideParents', role: string) => {
    return data.parents[side].find(p => p.role === role)?.isDeceased || false;
  };

  return (
    <div className="editor-outer-layout">
      <aside className="editor-sidebar-slim">
        <div className="sidebar-logo">WEDDING</div>
        <nav className="nav-menu-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => scrollToSection(item.id, item.ref)}
            >
              <div className="menu-icon">{item.icon}</div>
              <span className="menu-text">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>
      
      <div className="editor-content-scrollable" ref={workspaceRef}>
        <div className="editor-sections-list">
          {/* Theme Section */}
          <div className={`editor-section-card ${expandedSections.theme ? 'expanded' : ''}`} ref={sectionRefs.theme}>
            <div className="section-header" onClick={() => toggleSection('theme')}>
              <div className="header-left">
                <Sparkles size={20} />
                <h3>청첩장 테마</h3>
              </div>
              <ChevronRight size={18} className="collapse-icon" />
            </div>
            {expandedSections.theme && (
              <div className="section-content">
                <div className="input-group">
                  <label>테마 선택</label>
                  <div className="theme-select-grid modern">
                    {[
                      { key: 'blush', color: '#D4918E', name: '블러시 핑크' },
                      { key: 'champagne', color: '#C8A97E', name: '샴페인' },
                      { key: 'sage', color: '#8BA888', name: '세이지 그린' },
                      { key: 'navy', color: '#4A5E7A', name: '클래식 네이비' },
                      { key: 'burgundy', color: '#8B3A4A', name: '버건디 와인' },
                      { key: 'lavender', color: '#9B8BB8', name: '라벤더' },
                      { key: 'dusty', color: '#B67A82', name: '더스티 로즈' },
                      { key: 'modern', color: '#888888', name: '모던 화이트' },
                    ].map(t => (
                      <button key={t.key} type="button" className={`theme-chip ${data.theme === t.key ? 'active' : ''}`} style={data.theme === t.key ? { borderColor: t.color, color: t.color } : {}} onClick={() => onChange({ ...data, theme: t.key as any })}>
                        <span className="dot" style={{ background: t.color }}></span>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Design Section */}
          <div className={`editor-section-card ${expandedSections.design ? 'expanded' : ''}`} ref={sectionRefs.design}>
            <div className="section-header" onClick={() => toggleSection('design')}>
              <div className="header-left">
                <Palette size={20} />
                <h3>디자인 및 스타일</h3>
              </div>
              <ChevronRight size={18} className="collapse-icon" />
            </div>
            {expandedSections.design && (
              <div className="section-content">
                <div className="input-grid-2">
                  <div className="input-group">
                    <label>기본 언어</label>
                    <div className="tab-group modern">
                      <button className={`tab-btn ${data.language === 'ko' ? 'active' : ''}`} onClick={() => onChange({...data, language: 'ko'})}>KOREAN</button>
                      <button className={`tab-btn ${data.language === 'en' ? 'active' : ''}`} onClick={() => onChange({...data, language: 'en'})}>ENGLISH</button>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>글꼴 선택</label>
                    <select name="fontFamily" value={data.fontFamily} onChange={(e) => onChange({ ...data, fontFamily: e.target.value })} className="modern-input">
                      {fonts.map(font => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>배경 재질</label>
                  <div className="theme-select-grid modern">
                    {[
                      { key: 'none', name: '없음', desc: '기본 배경' },
                      { key: 'paper', name: '한지', desc: '종이 질감' },
                      { key: 'linen', name: '린넨', desc: '패브릭 질감' },
                      { key: 'pattern', name: '도트', desc: '은은한 패턴' },
                    ].map(t => (
                      <button key={t.key} type="button" className={`theme-chip ${(data.bgTexture || 'none') === t.key ? 'active' : ''}`} onClick={() => onChange({ ...data, bgTexture: t.key as any })}>
                        <span className={`texture-preview tex-${t.key}`}></span>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <label>흩날리는 효과</label>
                  <div className="theme-select-grid modern">
                    {[
                      { key: 'none', name: '없음', icon: '—' },
                      { key: 'cherry-blossom', name: '벚꽃', icon: '🌸' },
                      { key: 'snow', name: '함박눈', icon: '❄️' },
                      { key: 'stars', name: '별빛', icon: '✨' },
                      { key: 'leaves', name: '나뭇잎', icon: '🍃' },
                      { key: 'hearts', name: '하트', icon: '💕' },
                      { key: 'firefly', name: '반딧불', icon: '🔅' },
                      { key: 'confetti', name: '꽃가루', icon: '🎊' },
                    ].map(t => (
                      <button key={t.key} type="button" className={`theme-chip ${(data.bgEffect || 'none') === t.key ? 'active' : ''}`} onClick={() => onChange({ ...data, bgEffect: t.key as any })}>
                        <span className="effect-icon">{t.icon}</span>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <label>배경음악 URL</label>
                  <input type="text" name="bgMusicUrl" value={data.bgMusicUrl} onChange={handleChange} className="modern-input" placeholder="https://example.com/music.mp3" />
                </div>
                <div className="input-group">
                  <label className="modern-checkbox">
                    <input type="checkbox" checked={data.isRSVPEnabled} onChange={(e) => onChange({ ...data, isRSVPEnabled: e.target.checked })} />
                    <span>참석 응답(RSVP) 기능 활성화</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Basic Info Section */}
          <div className={`editor-section-card ${expandedSections.basic ? 'expanded' : ''}`} ref={sectionRefs.basic}>
            <div className="section-header" onClick={() => toggleSection('basic')}>
              <div className="header-left">
                <Info size={20} />
                <h3>기본 정보</h3>
              </div>
              <ChevronRight size={18} className="collapse-icon" />
            </div>
            {expandedSections.basic && (
              <div className="section-content">
                <div className="person-info-group">
                  <div className="info-label-row">
                    <span className="person-type">신랑</span>
                    <input type="text" name="groomName" value={data.groomName} onChange={handleChange} className="modern-input name-input" placeholder="이름" />
                  </div>
                  <div className="parents-grid">
                    <div className="parent-input-item">
                      <label>아버지 성함</label>
                      <div className="input-with-checkbox">
                        <input type="text" value={getParentValue('groomParents', '아버지')} onChange={(e) => handleParentNameChange('groomParents', '아버지', e.target.value)} className="modern-input" />
                        <label className="deceased-check"><input type="checkbox" checked={getParentDeceased('groomParents', '아버지')} onChange={(e) => handleParentDeceasedChange('groomParents', '아버지', e.target.checked)} /> 故</label>
                      </div>
                    </div>
                    <div className="parent-input-item">
                      <label>어머니 성함</label>
                      <div className="input-with-checkbox">
                        <input type="text" value={getParentValue('groomParents', '어머니')} onChange={(e) => handleParentNameChange('groomParents', '어머니', e.target.value)} className="modern-input" />
                        <label className="deceased-check"><input type="checkbox" checked={getParentDeceased('groomParents', '어머니')} onChange={(e) => handleParentDeceasedChange('groomParents', '어머니', e.target.checked)} /> 故</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="section-divider-mini"></div>
                <div className="person-info-group">
                  <div className="info-label-row">
                    <span className="person-type bride">신부</span>
                    <input type="text" name="brideName" value={data.brideName} onChange={handleChange} className="modern-input name-input" placeholder="이름" />
                  </div>
                  <div className="parents-grid">
                    <div className="parent-input-item">
                      <label>아버지 성함</label>
                      <div className="input-with-checkbox">
                        <input type="text" value={getParentValue('brideParents', '아버지')} onChange={(e) => handleParentNameChange('brideParents', '아버지', e.target.value)} className="modern-input" />
                        <label className="deceased-check"><input type="checkbox" checked={getParentDeceased('brideParents', '아버지')} onChange={(e) => handleParentDeceasedChange('brideParents', '아버지', e.target.checked)} /> 故</label>
                      </div>
                    </div>
                    <div className="parent-input-item">
                      <label>어머니 성함</label>
                      <div className="input-with-checkbox">
                        <input type="text" value={getParentValue('brideParents', '어머니')} onChange={(e) => handleParentNameChange('brideParents', '어머니', e.target.value)} className="modern-input" />
                        <label className="deceased-check"><input type="checkbox" checked={getParentDeceased('brideParents', '어머니')} onChange={(e) => handleParentDeceasedChange('brideParents', '어머니', e.target.checked)} /> 故</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="section-divider-mini"></div>
                <div className="input-grid-2">
                  <div className="input-group">
                    <label>예식일</label>
                    <input type="date" name="weddingDateISO" value={data.weddingDateISO} onChange={handleChange} className="modern-input" />
                  </div>
                  <div className="input-group">
                    <label>표시 날짜</label>
                    <input type="text" name="date" value={data.date} readOnly className="modern-input readonly" />
                  </div>
                </div>
                <div className="input-group">
                  <label>예식 시간</label>
                  <div className="modern-time-picker">
                    <div className="time-controls">
                      <div className="time-unit">
                        <button type="button" onClick={() => adjustTime('hours', 1)}><ChevronUp size={16} /></button>
                        <span>{timeParts.hours.toString().padStart(2, '0')}</span>
                        <button type="button" onClick={() => adjustTime('hours', -1)}><ChevronDown size={16} /></button>
                      </div>
                      <span className="sep">:</span>
                      <div className="time-unit">
                        <button type="button" onClick={() => adjustTime('minutes', 5)}><ChevronUp size={16} /></button>
                        <span>{timeParts.minutes.toString().padStart(2, '0')}</span>
                        <button type="button" onClick={() => adjustTime('minutes', -5)}><ChevronDown size={16} /></button>
                      </div>
                    </div>
                    <div className="ampm-toggle">
                      <button type="button" className={timeParts.ampm === 'AM' ? 'active' : ''} onClick={() => adjustTime('ampm', 0)}>AM</button>
                      <button type="button" className={timeParts.ampm === 'PM' ? 'active' : ''} onClick={() => adjustTime('ampm', 0)}>PM</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Greeting Section */}
          <div className={`editor-section-card ${expandedSections.greeting ? 'expanded' : ''}`} ref={sectionRefs.greeting}>
            <div className="section-header" onClick={() => toggleSection('greeting')}>
              <div className="header-left">
                <MessageSquare size={20} />
                <h3>인사말</h3>
              </div>
              <ChevronRight size={18} className="collapse-icon" />
            </div>
            {expandedSections.greeting && (
              <div className="section-content">
                <div className="input-group">
                  <label>제목</label>
                  <input type="text" name="greetingTitle" value={data.greetingTitle} onChange={handleChange} className="modern-input" />
                </div>
                <div className="input-group">
                  <label>내용</label>
                  <textarea name="greetingContent" value={data.greetingContent} onChange={handleChange} rows={5} className="modern-input" />
                </div>
              </div>
            )}
          </div>

          {/* Message Section */}
          <div className={`editor-section-card ${expandedSections.message ? 'expanded' : ''}`} ref={sectionRefs.message}>
            <div className="section-header" onClick={() => toggleSection('message')}>
              <div className="header-left">
                <Heart size={20} />
                <h3>신랑/신부 한마디</h3>
              </div>
              <ChevronRight size={18} className="collapse-icon" />
            </div>
            {expandedSections.message && (
              <div className="section-content">
                <div className="input-group">
                  <label>신랑의 한마디</label>
                  <textarea name="groomMessage" value={data.groomMessage} onChange={handleChange} rows={2} className="modern-input" placeholder="항상 곁에서 힘이 되어주는 든든한 남편이 되겠습니다." />
                </div>
                <div className="input-group">
                  <label>신부의 한마디</label>
                  <textarea name="brideMessage" value={data.brideMessage} onChange={handleChange} rows={2} className="modern-input" placeholder="서로 아끼고 배려하며 예쁘게 잘 살겠습니다." />
                </div>
              </div>
            )}
          </div>

          {/* Location Section */}
          <div className={`editor-section-card ${expandedSections.location ? 'expanded' : ''}`} ref={sectionRefs.location}>
            <div className="section-header" onClick={() => toggleSection('location')}>
              <div className="header-left">
                <MapPin size={20} />
                <h3>장소 및 교통 정보</h3>
              </div>
              <ChevronRight size={18} className="collapse-icon" />
            </div>
            {expandedSections.location && (
              <div className="section-content">
                <div className="input-group">
                  <label>예식장 주소</label>
                  <div className="modern-search-box">
                    <input type="text" value={data.venueAddress} readOnly className="modern-input" />
                    <button onClick={handleAddressSearch} className="search-btn"><Search size={16} /> 주소 검색</button>
                  </div>
                </div>
                <div className="input-group">
                  <label>예식장 이름</label>
                  <input type="text" name="venueName" value={data.venueName} onChange={handleChange} className="modern-input" />
                </div>
                <div className="input-grid-3">
                  <div className="input-group">
                    <label>지하철</label>
                    <textarea value={data.transport.subway} onChange={(e) => handleTransportChange('subway', e.target.value)} rows={3} className="modern-input" />
                  </div>
                  <div className="input-group">
                    <label>버스</label>
                    <textarea value={data.transport.bus} onChange={(e) => handleTransportChange('bus', e.target.value)} rows={3} className="modern-input" />
                  </div>
                  <div className="input-group">
                    <label>주차</label>
                    <textarea value={data.transport.parking} onChange={(e) => handleTransportChange('parking', e.target.value)} rows={3} className="modern-input" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contacts Section */}
          <div className={`editor-section-card ${expandedSections.contacts ? 'expanded' : ''}`} ref={sectionRefs.contacts}>
            <div className="section-header" onClick={() => toggleSection('contacts')}>
              <div className="header-left">
                <Phone size={20} />
                <h3>연락처 설정</h3>
              </div>
              <ChevronRight size={18} className="collapse-icon" />
            </div>
            {expandedSections.contacts && (
              <div className="section-content">
                <div className="modern-list">
                  {data.contacts.map((contact, index) => (
                    <div key={index} className="modern-list-item">
                      <span className="role-tag">{contact.role}</span>
                      <input type="text" placeholder="이름" value={contact.name} onChange={(e) => handleContactChange(index, 'name', e.target.value)} className="modern-input transparent" />
                      <input type="text" placeholder="전화번호" value={contact.phone} onChange={(e) => handleContactChange(index, 'phone', e.target.value)} className="modern-input transparent" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Accounts Section */}
          <div className={`editor-section-card ${expandedSections.accounts ? 'expanded' : ''}`} ref={sectionRefs.accounts}>
            <div className="section-header" onClick={() => toggleSection('accounts')}>
              <div className="header-left">
                <CreditCard size={20} />
                <h3>계좌 정보</h3>
              </div>
              <ChevronRight size={18} className="collapse-icon" />
            </div>
            {expandedSections.accounts && (
              <div className="section-content">
                <div className="modern-list">
                  {data.accounts.map((account, index) => (
                    <div key={index} className="modern-list-item col">
                      <div className="item-row">
                        <span className="role-tag">{account.side}</span>
                        <input type="text" placeholder="은행명" value={account.bank} onChange={(e) => handleAccountChange(index, 'bank', e.target.value)} className="modern-input transparent" />
                        <input type="text" placeholder="예금주" value={account.owner} onChange={(e) => handleAccountChange(index, 'owner', e.target.value)} className="modern-input transparent" />
                      </div>
                      <input type="text" placeholder="계좌번호" value={account.number} onChange={(e) => handleAccountChange(index, 'number', e.target.value)} className="modern-input transparent full" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Photos Section */}
          <div className={`editor-section-card ${expandedSections.photos ? 'expanded' : ''}`} ref={sectionRefs.photos}>
            <div className="section-header" onClick={() => toggleSection('photos')}>
              <div className="header-left">
                <ImageIcon size={20} />
                <h3>사진 관리</h3>
              </div>
              <ChevronRight size={18} className="collapse-icon" />
            </div>
            {expandedSections.photos && (
              <div className="section-content">
                <div className="modern-photo-editor">
                  <div className="photo-label">메인 사진</div>
                  <div className="modern-hero-upload">
                    <img src={data.heroPhoto} alt="Hero" />
                    <label className="change-btn"><ImageIcon size={16} /> 변경<input type="file" accept="image/*" onChange={handleHeroPhotoUpload} hidden /></label>
                  </div>
                  <div className="photo-label" style={{ marginTop: '30px' }}>갤러리 (다중 선택 가능)</div>
                  <div className="modern-gallery-grid">
                    <label className="add-photo-card"><div className="plus">+</div><span>사진 추가</span><input type="file" multiple accept="image/*" onChange={handlePhotoUpload} hidden /></label>
                    {data.photos.map((photo, index) => (
                      <div key={index} className="gallery-item"><img src={photo} alt="Preview" /><button className="del-btn" onClick={() => removePhoto(index)}>×</button></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .editor-outer-layout { display: flex; flex: 1; overflow: hidden; background: #FFFFFF; }
        .editor-sidebar-slim { width: 75px; background: #FFFFFF; border-right: 1px solid #F3F4F6; display: flex; flex-direction: column; align-items: center; padding: 25px 0; flex-shrink: 0; }
        .sidebar-logo { font-size: 0.55rem; font-weight: 900; color: #D4A5C6; margin-bottom: 35px; letter-spacing: 2px; }
        .nav-menu-list { display: flex; flex-direction: column; gap: 12px; width: 100%; }
        .nav-menu-item { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 12px 0; border: none; background: none; color: #A0A0A0; cursor: pointer; width: 100%; transition: all 0.2s; }
        .nav-menu-item:hover { color: #D4A5C6; background: #FFF9FB; }
        .nav-menu-item.active { color: #D4A5C6; background: #FFF9FB; position: relative; }
        .nav-menu-item.active::after { content: ''; position: absolute; right: 0; top: 15%; height: 70%; width: 3px; background: #D4A5C6; border-radius: 4px 0 0 4px; }
        .menu-icon { display: flex; align-items: center; justify-content: center; }
        .menu-text { font-size: 0.65rem; font-weight: 700; }
        .editor-content-scrollable { flex: 1; overflow-y: auto; background: #FFFFFF; scroll-behavior: smooth; padding: 30px; }
        .editor-sections-list { width: 100%; display: flex; flex-direction: column; gap: 20px; }
        .editor-section-card { width: 100%; background: #FFFFFF; border-radius: 20px; border: 1px solid #F3F4F6; transition: all 0.2s; overflow: hidden; }
        .editor-section-card.expanded { border-color: #EEDDE4; box-shadow: 0 4px 20px rgba(212, 165, 198, 0.05); }
        .section-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 25px; cursor: pointer; user-select: none; background: white; transition: background 0.2s; }
        .section-header:hover { background: #F9FAFB; }
        .header-left { display: flex; align-items: center; gap: 12px; color: #1A1A1A; }
        .section-header h3 { margin: 0; font-size: 1.05rem; font-weight: 800; }
        .section-header svg { color: #D4A5C6; }
        .collapse-icon { color: #B2A4B0; transition: transform 0.3s; }
        .expanded .collapse-icon { transform: rotate(90deg); }
        .section-content { padding: 0 25px 25px 25px; border-top: 1px solid #F9FAFB; padding-top: 25px; }
        .person-info-group { padding: 15px 0; }
        .info-label-row { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
        .person-type { background: #EFF6FF; color: #3B82F6; padding: 4px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; }
        .person-type.bride { background: #FFF1F2; color: #F43F5E; }
        .name-input { flex: 1; max-width: 200px; }
        .parents-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .parent-input-item label { display: block; font-size: 0.8rem !important; color: #8F7D8B !important; margin-bottom: 8px !important; }
        .input-with-checkbox { display: flex; align-items: center; gap: 10px; }
        .deceased-check { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; font-weight: 700; color: #6B7280; cursor: pointer; white-space: nowrap; }
        .deceased-check input { width: 16px; height: 16px; accent-color: #D4A5C6; }
        .section-divider-mini { height: 1px; background: #F3F4F6; margin: 10px 0; }
        .input-group { margin-bottom: 25px; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #4B5563; margin-bottom: 10px; }
        .input-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .input-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .modern-input { width: 100%; padding: 14px 16px; border: 1px solid #E5E7EB; border-radius: 12px; background: #F9FAFB; color: #1F2937; font-size: 0.95rem; transition: all 0.2s; }
        .modern-input:focus { outline: none; border-color: #D4A5C6; background: #FFF; box-shadow: 0 0 0 4px rgba(212, 165, 198, 0.1); }
        .modern-input.readonly { background: #F3F4F6; cursor: default; color: #6B7280; }
        .modern-input.transparent { background: transparent; border-color: transparent; padding: 8px 12px; }
        .modern-input.transparent:focus { background: #FFF; border-color: #D4A5C6; }
        .tab-group.modern { display: flex; background: #F3F4F6; padding: 4px; border-radius: 12px; }
        .tab-btn { flex: 1; padding: 10px; border: none; background: none; font-size: 0.75rem; font-weight: 800; color: #6B7280; cursor: pointer; border-radius: 8px; }
        .tab-btn.active { background: white; color: #D4A5C6; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .theme-select-grid.modern { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .theme-chip { padding: 10px 16px; border-radius: 14px; border: 1px solid #E5E7EB; background: white; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.8rem; font-weight: 700; color: #4B5563; transition: all 0.2s; }
        .theme-chip:hover { border-color: #D1D5DB; background: #FAFAFA; }
        .theme-chip.active { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06); }
        .theme-chip .dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
        .texture-preview { width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0; border: 1px solid #E5E7EB; }
        .tex-none { background: #FFFFFF; }
        .tex-paper { background: #F5EDE3; background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E"); }
        .tex-linen { background: #F0EBE3; background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px); }
        .tex-pattern { background: #F8F8F8; background-image: radial-gradient(circle, #D1D5DB 0.5px, transparent 0.5px); background-size: 6px 6px; }
        .effect-icon { font-size: 1rem; line-height: 1; }
        .modern-checkbox { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .modern-checkbox input { width: 20px; height: 20px; accent-color: #D4A5C6; }
        .modern-checkbox span { font-size: 0.9rem; font-weight: 700; color: #374151; }
        .modern-time-picker { display: flex; align-items: center; gap: 20px; background: #F9FAFB; padding: 15px 25px; border-radius: 16px; width: fit-content; }
        .time-unit span { font-size: 1.5rem; font-weight: 900; color: #1F2937; min-width: 40px; text-align: center; }
        .time-unit button { color: #D4A5C6; padding: 0; }
        .ampm-toggle { display: flex; background: #EEE; padding: 3px; border-radius: 10px; }
        .ampm-toggle button { padding: 8px 15px; border-radius: 7px; font-size: 0.75rem; font-weight: 800; color: #9CA3AF; }
        .ampm-toggle button.active { background: white; color: #D4A5C6; }
        .search-btn { display: flex; align-items: center; gap: 8px; background: #111827; color: white; padding: 0 20px; border-radius: 12px; font-weight: 700; font-size: 0.85rem; white-space: nowrap; }
        .modern-list { display: flex; flex-direction: column; gap: 12px; }
        .modern-list-item { display: flex; align-items: center; gap: 15px; background: #F9FAFB; padding: 8px 15px; border-radius: 14px; border: 1px solid #F3F4F6; }
        .modern-list-item.col { flex-direction: column; align-items: stretch; padding: 15px; }
        .role-tag { background: #FCE7F3; color: #D4A5C6; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; white-space: nowrap; }
        .photo-label { font-size: 0.8rem; font-weight: 800; color: #9CA3AF; text-transform: uppercase; margin-bottom: 12px; }
        .modern-hero-upload { position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 20px; overflow: hidden; background: #F3F4F6; }
        .modern-hero-upload img { width: 100%; height: 100%; object-fit: cover; }
        .change-btn { position: absolute; bottom: 20px; right: 20px; background: white; color: #111827; padding: 10px 20px; border-radius: 30px; font-size: 0.85rem; font-weight: 800; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .modern-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 15px; }
        .add-photo-card { aspect-ratio: 1; border: 2px dashed #D1D5DB; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #9CA3AF; cursor: pointer; transition: all 0.2s; }
        .add-photo-card:hover { border-color: #D4A5C6; color: #D4A5C6; background: #FFF9FB; }
        .gallery-item { position: relative; aspect-ratio: 1; border-radius: 16px; overflow: hidden; }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; }
        .del-btn { position: absolute; top: 5px; right: 5px; width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.9); color: #FF5A5A; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};

export default EditorContainer;
