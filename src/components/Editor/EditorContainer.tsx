import React from 'react';
import { Palette, Info, MessageSquare, Heart, MapPin, CreditCard, Image as ImageIcon, Sparkles, Music, Milestone, CalendarCheck, MessagesSquare, Send, ListOrdered, LayoutTemplate } from 'lucide-react';
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

interface EditorProps {
  onSectionClick?: (id: string) => void;
}

const EditorContainer: React.FC<EditorProps> = ({ onSectionClick }) => {
  const sectionRefs = {
    hero: React.useRef<HTMLDivElement>(null),
    theme: React.useRef<HTMLDivElement>(null),
    design: React.useRef<HTMLDivElement>(null),
    basic: React.useRef<HTMLDivElement>(null),
    greeting: React.useRef<HTMLDivElement>(null),
    message: React.useRef<HTMLDivElement>(null),
    location: React.useRef<HTMLDivElement>(null),
    contacts: React.useRef<HTMLDivElement>(null),
    accounts: React.useRef<HTMLDivElement>(null),
    photos: React.useRef<HTMLDivElement>(null),
    timeline: React.useRef<HTMLDivElement>(null),
    interview: React.useRef<HTMLDivElement>(null),
    rsvp: React.useRef<HTMLDivElement>(null),
    share: React.useRef<HTMLDivElement>(null),
    order: React.useRef<HTMLDivElement>(null),
    music: React.useRef<HTMLDivElement>(null),
  };

  const workspaceRef = React.useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = React.useState('design');
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    hero: false, theme: true, design: true, basic: true,
    greeting: false, message: false, location: false, contacts: false,
    accounts: false, photos: false, timeline: false, interview: false,
    rsvp: false, share: false, order: false, music: false,
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
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
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
    { id: 'theme', name: '테마', icon: <Sparkles size={18} />, ref: sectionRefs.theme },
    { id: 'design', name: '디자인', icon: <Palette size={18} />, ref: sectionRefs.design },
    { id: 'basic', name: '기본정보', icon: <Info size={18} />, ref: sectionRefs.basic },
    { id: 'greeting', name: '인사말', icon: <MessageSquare size={18} />, ref: sectionRefs.greeting },
    { id: 'message', name: '한마디', icon: <Heart size={18} />, ref: sectionRefs.message },
    { id: 'interview', name: '인터뷰', icon: <MessagesSquare size={18} />, ref: sectionRefs.interview },
    { id: 'photos', name: '갤러리', icon: <ImageIcon size={18} />, ref: sectionRefs.photos },
    { id: 'timeline', name: '타임라인', icon: <Milestone size={18} />, ref: sectionRefs.timeline },
    { id: 'location', name: '장소', icon: <MapPin size={18} />, ref: sectionRefs.location },
    { id: 'rsvp', name: '참석의사', icon: <CalendarCheck size={18} />, ref: sectionRefs.rsvp },
    { id: 'accounts', name: '계좌', icon: <CreditCard size={18} />, ref: sectionRefs.accounts },
    { id: 'music', name: '배경음악', icon: <Music size={18} />, ref: sectionRefs.music },
    { id: 'order', name: '순서관리', icon: <ListOrdered size={18} />, ref: sectionRefs.order },
  ];

  const sections = [
    { id: 'share', title: '청첩장 주소', icon: <Send size={20} />, content: <ShareSection /> },
    { id: 'hero', title: '메인화면', icon: <LayoutTemplate size={20} />, content: <HeroSection /> },
    { id: 'theme', title: '청첩장 테마', icon: <Sparkles size={20} />, content: <ThemeSection /> },
    { id: 'design', title: '디자인 및 스타일', icon: <Palette size={20} />, content: <DesignSection /> },
    { id: 'basic', title: '기본 정보', icon: <Info size={20} />, content: <BasicInfoSection /> },
    { id: 'greeting', title: '인사말', icon: <MessageSquare size={20} />, content: <GreetingSection /> },
    { id: 'message', title: '신랑/신부 한마디', icon: <Heart size={20} />, content: <MessageSection /> },
    { id: 'interview', title: '인터뷰', icon: <MessagesSquare size={20} />, content: <InterviewSection /> },
    { id: 'photos', title: '갤러리 관리', icon: <ImageIcon size={20} />, content: <PhotosSection /> },
    { id: 'timeline', title: '타임라인', icon: <Milestone size={20} />, content: <TimelineSection /> },
    { id: 'location', title: '장소 및 교통 정보', icon: <MapPin size={20} />, content: <LocationSection /> },
    { id: 'rsvp', title: '참석의사 (RSVP)', icon: <CalendarCheck size={20} />, content: <RSVPSection /> },
    { id: 'accounts', title: '계좌 정보', icon: <CreditCard size={20} />, content: <AccountsSection /> },
    { id: 'music', title: '배경음악', icon: <Music size={20} />, content: <MusicSection /> },
    { id: 'order', title: '순서 관리', icon: <ListOrdered size={20} />, content: <OrderSection /> },
  ];

  return (
    <div className="editor-outer-layout">
      <aside className="editor-sidebar-slim">
        <div className="sidebar-logo">SONETT</div>
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
          {sections.map(s => (
            <SectionCard
              key={s.id}
              title={s.title}
              icon={s.icon}
              expanded={expandedSections[s.id] || false}
              onToggle={() => toggleSection(s.id)}
              sectionRef={sectionRefs[s.id as keyof typeof sectionRefs]}
            >
              {s.content}
            </SectionCard>
          ))}
        </div>
      </div>

      <style>{`
        .editor-outer-layout { display: flex; flex: 1; overflow: hidden; background: #FFFFFF; }
        .editor-sidebar-slim { width: 75px; background: #FFFFFF; border-right: 1px solid #F3F4F6; display: flex; flex-direction: column; align-items: center; padding: 25px 0; flex-shrink: 0; overflow-y: auto; scrollbar-width: none; }
        .editor-sidebar-slim::-webkit-scrollbar { display: none; }
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
        .basic-cards { display: flex; flex-direction: column; gap: 16px; }
        .basic-card { background: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; overflow: hidden; }
        .basic-card-header { padding: 14px 20px; border-bottom: 1px solid #F0F2F5; }
        .basic-card-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .basic-field label { display: block; font-size: 0.8rem; font-weight: 700; color: #6B7280; margin-bottom: 8px; }
        .basic-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .person-type { display: inline-block; background: #EFF6FF; color: #3B82F6; padding: 5px 14px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; }
        .person-type.bride { background: #FFF1F2; color: #F43F5E; }
        .person-type.date { background: #F0FDF4; color: #16A34A; }
        .date-time-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; align-items: start; }
        .time-picker-flat { display: flex; align-items: center; gap: 4px; width: 100%; padding: 0; height: 48px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; justify-content: center; }
        .time-adj { padding: 6px 10px; border-radius: 8px; font-size: 0.95rem; font-weight: 800; color: #1F2937; background: none; cursor: pointer; transition: all 0.15s; }
        .time-adj:hover { background: #F3F4F6; color: #D4A5C6; }
        .time-colon { font-size: 0.95rem; font-weight: 800; color: #1F2937; }
        .profile-msg-card { background: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; overflow: hidden; margin-bottom: 16px; }
        .profile-msg-header { padding: 14px 20px; border-bottom: 1px solid #F0F2F5; }
        .profile-msg-body { display: flex; gap: 16px; padding: 20px; align-items: flex-start; }
        .profile-upload-area { flex-shrink: 0; }
        .profile-thumb { position: relative; width: 80px; height: 80px; border-radius: 12px; overflow: hidden; }
        .profile-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .profile-change-btn { position: absolute; bottom: 0; right: 0; width: 24px; height: 24px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.15); cursor: pointer; color: #6B7280; }
        .profile-empty { width: 80px; height: 80px; border-radius: 12px; border: 2px dashed #D1D5DB; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: #9CA3AF; cursor: pointer; transition: all 0.2s; }
        .profile-empty:hover { border-color: #D4A5C6; color: #D4A5C6; }
        .profile-empty span { font-size: 0.6rem; font-weight: 700; }
        .profile-msg-input { flex: 1; }
        .input-with-btn { display: flex; align-items: center; gap: 8px; }
        .input-with-btn .modern-input { flex: 1; }
        .deceased-btn { padding: 8px 14px; border-radius: 10px; font-size: 0.78rem; font-weight: 800; color: #9CA3AF; background: #F3F4F6; border: 1px solid #E5E7EB; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
        .deceased-btn:hover { background: #E5E7EB; color: #6B7280; }
        .deceased-btn.active { background: #4B5563; color: #FFFFFF; border-color: #4B5563; }
        .input-group { margin-bottom: 25px; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #4B5563; margin-bottom: 10px; }
        .input-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
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
        .theme-chip-v2 { padding: 12px 14px; border-radius: 14px; border: 1.5px solid #E5E7EB; background: white; display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: all 0.2s; text-align: left; }
        .theme-chip-v2:hover { border-color: #D1D5DB; background: #FAFAFA; }
        .theme-chip-v2.active { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06); }
        .theme-chip-info { display: flex; align-items: center; gap: 8px; }
        .theme-chip-name { font-size: 0.8rem; font-weight: 700; color: #4B5563; }
        .theme-palette { display: flex; gap: 3px; }
        .palette-swatch { width: 16px; height: 16px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.06); }
        .texture-preview { width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0; border: 1px solid #E5E7EB; }
        .tex-none { background: #FFFFFF; }
        .tex-paper { background: #F5EDE3; background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E"); }
        .tex-linen { background: #F0EBE3; background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px); }
        .tex-pattern { background: #F8F8F8; background-image: radial-gradient(circle, #D1D5DB 0.5px, transparent 0.5px); background-size: 6px 6px; }
        .tex-silk { background: #F5F0EC; background-image: repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px); }
        .tex-watercolor { background: #F3EEF5; background-image: radial-gradient(ellipse at 30% 50%, rgba(200,150,180,0.15) 0%, transparent 70%); }
        .section-desc { font-size: 0.85rem; color: #6B7280; margin: 0 0 20px 0; }
        .timeline-editor-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
        .timeline-editor-item { background: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; overflow: hidden; }
        .timeline-editor-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #F0F2F5; }
        .timeline-index { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: #D4A5C6; color: white; font-size: 0.75rem; font-weight: 800; }
        .timeline-remove-btn { width: 28px; height: 28px; border-radius: 50%; border: none; background: #FEE2E2; color: #EF4444; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .timeline-remove-btn:hover { background: #FECACA; }
        .timeline-editor-fields { padding: 16px 20px; }
        .timeline-add-btn { width: 100%; padding: 14px; border: 2px dashed #D1D5DB; border-radius: 14px; background: none; color: #9CA3AF; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; min-height: 30px; }
        .label-row label { margin-bottom: 0; }
        .timeline-add-btn:hover { border-color: #D4A5C6; color: #D4A5C6; background: #FFF9FB; }
        .timeline-photo-upload { display: flex; align-items: center; justify-content: center; padding: 12px; border: 2px dashed #D1D5DB; border-radius: 12px; color: #9CA3AF; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .timeline-photo-upload:hover { border-color: #D4A5C6; color: #D4A5C6; background: #FFF9FB; }
        .timeline-photo-preview { position: relative; display: inline-block; }
        .timeline-photo-preview img { width: 100%; max-height: 120px; object-fit: cover; border-radius: 12px; }
        .timeline-photo-preview .timeline-remove-btn { position: absolute; top: 6px; right: 6px; }
        .interview-editor-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
        .interview-editor-item { background: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; overflow: hidden; }
        .interview-editor-fields { padding: 16px 20px; }
        .interview-answer-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .interview-answer-box { display: flex; flex-direction: column; gap: 8px; }
        .interview-answer-box .person-type { align-self: flex-start; }
        .input-hint { display: block; font-size: 0.78rem; color: #9CA3AF; margin-top: 6px; }
        .slug-input-row { display: flex; align-items: center; gap: 0; }
        .slug-prefix { padding: 14px 0 14px 16px; background: #F3F4F6; border: 1px solid #E5E7EB; border-right: none; border-radius: 12px 0 0 12px; font-size: 0.9rem; font-weight: 700; color: #9CA3AF; white-space: nowrap; }
        .slug-input-row .modern-input { border-radius: 0 12px 12px 0; }
        .share-divider { height: 1px; background: #F3F4F6; margin: 20px 0; }
        .share-preview-card { background: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; overflow: hidden; }
        .share-preview-header { padding: 10px 16px; font-size: 0.75rem; font-weight: 800; color: #9CA3AF; border-bottom: 1px solid #F0F2F5; }
        .share-preview-body { display: flex; gap: 14px; padding: 16px; align-items: flex-start; }
        .share-preview-thumb { width: 64px; height: 64px; border-radius: 10px; overflow: hidden; background: #E5E7EB; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-size: 0.7rem; }
        .share-preview-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .share-preview-info { flex: 1; min-width: 0; }
        .share-preview-info strong { display: block; font-size: 0.88rem; color: #1F2937; margin-bottom: 4px; word-break: keep-all; }
        .share-preview-info p { font-size: 0.78rem; color: #6B7280; margin: 0; line-height: 1.5; white-space: pre-line; word-break: keep-all; }
        .hero-style-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .hero-style-btn { display: flex; flex-direction: column; gap: 2px; padding: 14px 10px; border-radius: 14px; border: 1px solid #E5E7EB; background: #F9FAFB; text-align: center; cursor: pointer; transition: all 0.2s; }
        .hero-style-btn:hover { border-color: #D1D5DB; background: #FAFAFA; }
        .hero-style-btn.active { border-color: #D4A5C6; background: #FFF9FB; box-shadow: 0 2px 8px rgba(212,165,198,0.1); }
        .hero-style-btn strong { font-size: 0.85rem; color: #1F2937; }
        .hero-style-btn.active strong { color: #D4A5C6; }
        .hero-style-btn span { font-size: 0.7rem; color: #9CA3AF; }
        .account-style-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .account-style-btn { display: flex; flex-direction: column; gap: 2px; padding: 14px 18px; border-radius: 14px; border: 1px solid #E5E7EB; background: #F9FAFB; text-align: left; cursor: pointer; transition: all 0.2s; }
        .account-style-btn:hover { border-color: #D1D5DB; background: #FAFAFA; }
        .account-style-btn.active { border-color: #D4A5C6; background: #FFF9FB; box-shadow: 0 2px 8px rgba(212,165,198,0.1); }
        .account-style-btn strong { font-size: 0.88rem; color: #1F2937; }
        .account-style-btn.active strong { color: #D4A5C6; }
        .account-style-btn span { font-size: 0.78rem; color: #9CA3AF; }
        .order-list { display: flex; flex-direction: column; gap: 6px; }
        .order-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 12px; }
        .order-num { width: 24px; height: 24px; border-radius: 50%; background: #D4A5C6; color: white; font-size: 0.72rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .order-label { flex: 1; font-size: 0.88rem; font-weight: 700; color: #1F2937; }
        .order-btns { display: flex; gap: 4px; }
        .order-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid #E5E7EB; background: white; color: #6B7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; padding: 0; }
        .order-btn:hover:not(:disabled) { background: #F3F4F6; color: #D4A5C6; border-color: #D4A5C6; }
        .order-btn:disabled { opacity: 0.3; cursor: default; }
        .music-select-list { display: flex; flex-direction: column; gap: 6px; }
        .music-select-btn { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-radius: 12px; border: 1px solid #E5E7EB; background: #F9FAFB; text-align: left; cursor: pointer; transition: all 0.2s; }
        .music-select-btn:hover { border-color: #D1D5DB; background: #FAFAFA; }
        .music-select-btn.active { border-color: #D4A5C6; background: #FFF9FB; }
        .music-select-name { font-size: 0.88rem; font-weight: 700; color: #1F2937; }
        .music-select-btn.active .music-select-name { color: #D4A5C6; }
        .music-playing-badge { font-size: 0.72rem; font-weight: 700; color: white; background: #D4A5C6; padding: 3px 10px; border-radius: 20px; }
        .music-upload-btn { display: flex; align-items: center; justify-content: center; padding: 14px; border: 2px dashed #D1D5DB; border-radius: 14px; color: #9CA3AF; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .music-upload-btn:hover { border-color: #D4A5C6; color: #D4A5C6; background: #FFF9FB; }
        .rsvp-info-box { background: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 14px; padding: 18px 20px; }
        .rsvp-info-box p { margin: 0 0 6px 0; font-size: 0.85rem; color: #6B7280; line-height: 1.6; }
        .rsvp-info-box p:last-child { margin-bottom: 0; }
        .label-hint { font-size: 0.78rem; font-weight: 500; color: #D4A5C6; }
        .effect-icon { font-size: 1rem; line-height: 1; }
        .modern-checkbox { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .modern-checkbox input { width: 20px; height: 20px; accent-color: #D4A5C6; }
        .modern-checkbox span { font-size: 0.9rem; font-weight: 700; color: #374151; }
        .modern-search-box { display: flex; gap: 10px; align-items: stretch; }
        .modern-search-box .modern-input { flex: 1; }
        .search-btn { display: flex; align-items: center; gap: 8px; background: #111827; color: white; padding: 0 20px; border-radius: 12px; font-weight: 700; font-size: 0.85rem; white-space: nowrap; flex-shrink: 0; }
        .modern-list { display: flex; flex-direction: column; gap: 12px; }
        .modern-list-item { display: flex; align-items: center; gap: 15px; background: #F9FAFB; padding: 8px 15px; border-radius: 14px; border: 1px solid #F3F4F6; }
        .modern-list-item.col { flex-direction: column; align-items: stretch; padding: 15px; }
        .role-tag { background: #FCE7F3; color: #D4A5C6; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; white-space: nowrap; }
        .photo-label { font-size: 0.8rem; font-weight: 800; color: #9CA3AF; text-transform: uppercase; margin-bottom: 12px; }
        .modern-hero-upload { position: relative; width: 100%; min-height: 180px; border-radius: 20px; overflow: hidden; background: #F3F4F6; display: flex; align-items: center; justify-content: center; }
        .modern-hero-upload img { width: 100%; display: block; }
        .hero-empty-upload { width: 100%; min-height: 180px; display: flex !important; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #9CA3AF; cursor: pointer; border: 2px dashed #D1D5DB; border-radius: 20px; transition: all 0.2s; box-sizing: border-box; }
        .hero-empty-upload:hover { border-color: #D4A5C6; color: #D4A5C6; background: #FFF9FB; }
        .hero-empty-upload span { font-size: 0.85rem; font-weight: 700; }
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
