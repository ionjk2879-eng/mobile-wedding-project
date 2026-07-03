import React from 'react';
import { Palette, Info, MessageSquare, Heart, MapPin, CreditCard, Image as ImageIcon, Sparkles, Music, Milestone, CalendarCheck, MessagesSquare, Send, ListOrdered, LayoutTemplate, BookOpen, Clock, Clapperboard, Menu, X, Camera } from 'lucide-react';
import '../../styles/editor.css';
import SectionCard from './SectionCard';
import ShareSection from './sections/ShareSection';
import HeroSection from './sections/HeroSection';
import ThemeSection from './sections/ThemeSection';
import DesignSection from './sections/DesignSection';
import BasicInfoSection from './sections/BasicInfoSection';
import GreetingSection from './sections/GreetingSection';
import MessageSection from './sections/MessageSection';
import InterviewSection from './sections/InterviewSection';
import PhotosSection from './sections/PhotosSection';
import TimelineSection from './sections/TimelineSection';
import LocationSection from './sections/LocationSection';
import RSVPSection from './sections/RSVPSection';
import AccountsSection from './sections/AccountsSection';
import MusicSection from './sections/MusicSection';
import OrderSection from './sections/OrderSection';
import GuestbookSection from './sections/GuestbookSection';
import DateTimeSection from './sections/DateTimeSection';
import OpeningSection from './sections/OpeningSection';
import EndingSection from './sections/EndingSection';
import MidPhotoSection from './sections/MidPhotoSection';
import LiveGallerySection from './sections/LiveGallerySection';

export interface EditorContainerHandle {
  navigateTo: (id: string) => void;
}

interface EditorProps {
  onSectionClick?: (id: string) => void;
}

const EditorContainer = React.forwardRef<EditorContainerHandle, EditorProps>(({ onSectionClick }, ref) => {
  const sectionRefs = {
    hero: React.useRef<HTMLDivElement>(null),
    opening: React.useRef<HTMLDivElement>(null),
    theme: React.useRef<HTMLDivElement>(null),
    design: React.useRef<HTMLDivElement>(null),
    basic: React.useRef<HTMLDivElement>(null),
    datetime: React.useRef<HTMLDivElement>(null),
    greeting: React.useRef<HTMLDivElement>(null),
    message: React.useRef<HTMLDivElement>(null),
    location: React.useRef<HTMLDivElement>(null),
    contacts: React.useRef<HTMLDivElement>(null),
    accounts: React.useRef<HTMLDivElement>(null),
    photos: React.useRef<HTMLDivElement>(null),
    timeline: React.useRef<HTMLDivElement>(null),
    midphoto: React.useRef<HTMLDivElement>(null),
    interview: React.useRef<HTMLDivElement>(null),
    rsvp: React.useRef<HTMLDivElement>(null),
    guestbook: React.useRef<HTMLDivElement>(null),
    livegallery: React.useRef<HTMLDivElement>(null),
    ending: React.useRef<HTMLDivElement>(null),
    share: React.useRef<HTMLDivElement>(null),
    order: React.useRef<HTMLDivElement>(null),
    music: React.useRef<HTMLDivElement>(null),
  };

  const workspaceRef = React.useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = React.useState('design');
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    hero: true, opening: false, theme: true, design: false, basic: true, datetime: true,
    greeting: false, message: false, location: true, contacts: false,
    accounts: false, photos: false, timeline: false, interview: false, midphoto: false,
    rsvp: false, guestbook: false, livegallery: false, ending: false, share: false, order: false, music: false,
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
          if (sectionId) setActiveSection(sectionId);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    Object.values(sectionRefs).forEach((ref) => { if (ref.current) observer.observe(ref.current); });
    return () => observer.disconnect();
  }, []);

  const toggleSection = (id: string) => {
    const willOpen = !expandedSections[id];
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    setActiveSection(id);
    if (willOpen) {
      if (onSectionClick && id !== 'share' && id !== 'order' && id !== 'music' && id !== 'hero') {
        onSectionClick(id);
      }
      const ref = sectionRefs[id as keyof typeof sectionRefs];
      if (ref) {
        isScrollingRef.current = true;
        setTimeout(() => {
          ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => { isScrollingRef.current = false; }, 800);
        }, 50);
      }
    }
  };

  const scrollToSection = (id: string, ref: React.RefObject<HTMLDivElement>) => {
    isScrollingRef.current = true;
    setActiveSection(id);
    setExpandedSections(prev => ({ ...prev, [id]: true }));
    if (onSectionClick && id !== 'share' && id !== 'order' && id !== 'music' && id !== 'hero') onSectionClick(id);
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { isScrollingRef.current = false; }, 800);
    }, 50);
  };

  const navItems = [
    { id: 'share', name: '주소', icon: <Send size={18} />, ref: sectionRefs.share },
    { id: 'hero', name: '메인화면', icon: <LayoutTemplate size={18} />, ref: sectionRefs.hero },
    { id: 'opening', name: '오프닝', icon: <Clapperboard size={18} />, ref: sectionRefs.opening },
    { id: 'theme', name: '테마', icon: <Sparkles size={18} />, ref: sectionRefs.theme },
    { id: 'design', name: '디자인', icon: <Palette size={18} />, ref: sectionRefs.design },
    { id: 'basic', name: '기본정보', icon: <Info size={18} />, ref: sectionRefs.basic },
    { id: 'datetime', name: '예식일시', icon: <Clock size={18} />, ref: sectionRefs.datetime },
    { id: 'greeting', name: '인사말', icon: <MessageSquare size={18} />, ref: sectionRefs.greeting },
    { id: 'message', name: '한마디', icon: <Heart size={18} />, ref: sectionRefs.message },
    { id: 'interview', name: '인터뷰', icon: <MessagesSquare size={18} />, ref: sectionRefs.interview },
    { id: 'midphoto', name: '중간사진', icon: <Camera size={18} />, ref: sectionRefs.midphoto },
    { id: 'photos', name: '갤러리', icon: <ImageIcon size={18} />, ref: sectionRefs.photos },
    { id: 'timeline', name: '타임라인', icon: <Milestone size={18} />, ref: sectionRefs.timeline },
    { id: 'location', name: '장소', icon: <MapPin size={18} />, ref: sectionRefs.location },
    { id: 'rsvp', name: '참석의사', icon: <CalendarCheck size={18} />, ref: sectionRefs.rsvp },
    { id: 'guestbook', name: '방명록', icon: <BookOpen size={18} />, ref: sectionRefs.guestbook },
    { id: 'livegallery', name: '라이브 갤러리', icon: <Camera size={18} />, ref: sectionRefs.livegallery },
    { id: 'accounts', name: '계좌', icon: <CreditCard size={18} />, ref: sectionRefs.accounts },
    { id: 'ending', name: '엔딩', icon: <Camera size={18} />, ref: sectionRefs.ending },
    { id: 'music', name: '배경음악', icon: <Music size={18} />, ref: sectionRefs.music },
    { id: 'order', name: '순서관리', icon: <ListOrdered size={18} />, ref: sectionRefs.order },
  ];

  React.useImperativeHandle(ref, () => ({
    navigateTo: (id: string) => {
      const item = navItems.find(n => n.id === id);
      if (item) scrollToSection(id, item.ref);
    },
  }));

  const sections = [
    { id: 'share', title: '청첩장 주소', icon: <Send size={20} />, content: <ShareSection /> },
    { id: 'hero', title: '메인화면', icon: <LayoutTemplate size={20} />, content: <HeroSection /> },
    { id: 'opening', title: '오프닝 애니메이션', icon: <Clapperboard size={20} />, content: <OpeningSection /> },
    { id: 'theme', title: '청첩장 테마', icon: <Sparkles size={20} />, content: <ThemeSection /> },
    { id: 'design', title: '디자인 및 스타일', icon: <Palette size={20} />, content: <DesignSection /> },
    { id: 'basic', title: '기본 정보', icon: <Info size={20} />, content: <BasicInfoSection /> },
    { id: 'datetime', title: '예식 일시', icon: <Clock size={20} />, content: <DateTimeSection /> },
    { id: 'greeting', title: '인사말', icon: <MessageSquare size={20} />, content: <GreetingSection /> },
    { id: 'message', title: '신랑/신부 한마디', icon: <Heart size={20} />, content: <MessageSection /> },
    { id: 'interview', title: '인터뷰', icon: <MessagesSquare size={20} />, content: <InterviewSection /> },
    { id: 'midphoto', title: '중간 사진', icon: <Camera size={20} />, content: <MidPhotoSection /> },
    { id: 'photos', title: '갤러리 관리', icon: <ImageIcon size={20} />, content: <PhotosSection /> },
    { id: 'timeline', title: '타임라인', icon: <Milestone size={20} />, content: <TimelineSection /> },
    { id: 'location', title: '장소 및 교통 정보', icon: <MapPin size={20} />, content: <LocationSection /> },
    { id: 'rsvp', title: '참석의사 (RSVP)', icon: <CalendarCheck size={20} />, content: <RSVPSection /> },
    { id: 'guestbook', title: '방명록', icon: <BookOpen size={20} />, content: <GuestbookSection /> },
    { id: 'livegallery', title: '라이브 갤러리', icon: <Camera size={20} />, content: <LiveGallerySection /> },
    { id: 'accounts', title: '계좌 정보', icon: <CreditCard size={20} />, content: <AccountsSection /> },
    { id: 'ending', title: '엔딩', icon: <Camera size={20} />, content: <EndingSection /> },
    { id: 'music', title: '배경음악', icon: <Music size={20} />, content: <MusicSection /> },
    { id: 'order', title: '순서 관리', icon: <ListOrdered size={20} />, content: <OrderSection /> },
  ];

  return (
    <div className="editor-outer-layout">
      <aside className="editor-sidebar-slim" aria-label="에디터 네비게이션">
        <div className="sidebar-logo">SONETT</div>
        <nav className="nav-menu-list" role="menubar" aria-label="섹션 네비게이션" aria-orientation="vertical" onKeyDown={(e) => {
          const items = navItems;
          const currentIdx = items.findIndex((item) => item.id === activeSection);
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const next = (currentIdx + 1) % items.length;
            scrollToSection(items[next].id, items[next].ref);
            (e.currentTarget.children[next] as HTMLElement)?.focus();
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prev = (currentIdx - 1 + items.length) % items.length;
            scrollToSection(items[prev].id, items[prev].ref);
            (e.currentTarget.children[prev] as HTMLElement)?.focus();
          } else if (e.key === 'Home') {
            e.preventDefault();
            scrollToSection(items[0].id, items[0].ref);
            (e.currentTarget.children[0] as HTMLElement)?.focus();
          } else if (e.key === 'End') {
            e.preventDefault();
            const last = items.length - 1;
            scrollToSection(items[last].id, items[last].ref);
            (e.currentTarget.children[last] as HTMLElement)?.focus();
          }
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              className={`nav-menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => scrollToSection(item.id, item.ref)}
              tabIndex={activeSection === item.id ? 0 : -1}
              aria-current={activeSection === item.id ? 'true' : undefined}
            >
              <div className="menu-icon">{item.icon}</div>
              <span className="menu-text">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="editor-content-scrollable" ref={workspaceRef}>
        <div className="editor-sections-list">
          {sections.map(s => (
            <SectionCard
              key={s.id}
              title={s.title}
              icon={s.icon}
              expanded={expandedSections[s.id] || false}
              onToggle={() => toggleSection(s.id)}
              sectionRef={sectionRefs[s.id as keyof typeof sectionRefs]}
            >
              {expandedSections[s.id] ? s.content : null}
            </SectionCard>
          ))}
        </div>
      </div>

      <button className="mobile-nav-fab" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
        {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {mobileNavOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)}>
          <div className="mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item, i) => (
              <React.Fragment key={item.id}>
                {i > 0 && i % 4 === 0 && <div className="mobile-nav-divider" />}
                <button
                  className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => { scrollToSection(item.id, item.ref); setMobileNavOpen(false); }}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

    </div>
  );
});

export default EditorContainer;
