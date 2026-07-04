import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutTemplate, MessageSquare, Clock, Heart, MessagesSquare,
  Image as ImageIcon, Milestone, MapPin, CalendarCheck, CreditCard,
  Info, BookOpen, Camera, Send,
} from 'lucide-react';
import { InvitationData, GuestRelation } from '../../types';
import useInvitationStore from '../../stores/useInvitationStore';
import '../../styles/preview.css';
import Hero from './Hero';
import Greeting from './Greeting';
import Calendar from './Calendar';
import PersonalMessage from './PersonalMessage';
import Interview from './Interview';
import Gallery from './Gallery';
import Timeline from './Timeline';
import Location from './Location';
import RSVPForm from './RSVPForm';
import Money from './Money';
import Contacts from './Contacts';
import Ending from './Ending';
import MidPhoto from './MidPhoto';
import Share from './Share';
import Guestbook from './Guestbook';
import LiveGallery from './LiveGallery';
import ScrollReveal from './ScrollReveal';
import BackgroundEffects from './BackgroundEffects';
import MusicPlayer from './MusicPlayer';
import Opening from './Opening';

interface InvitationViewProps {
  data: InvitationData;
  previewRefs?: Record<string, React.RefObject<HTMLDivElement>>;
  showOpening?: boolean;
  shareEnabled?: boolean;
  openingTopOffset?: number;
  onSectionNav?: (editorId: string) => void;
  forceAnniversaryMode?: boolean;
  guestName?: string;
  guestRelation?: GuestRelation;
  guestCode?: string;
  guestMessageIndex?: number | null;
}

// 미리보기 섹션 ID → 에디터 섹션 ID 매핑
const PREVIEW_TO_EDITOR: Record<string, string> = {
  calendar: 'datetime',
  contacts: 'basic',
};

// 미리보기 섹션 ID → { 아이콘, 레이블 }
const SECTION_NAV_INFO: Record<string, { icon: React.ReactNode; label: string }> = {
  hero:      { icon: <LayoutTemplate size={13} />, label: '메인화면' },
  greeting:  { icon: <MessageSquare size={13} />,  label: '인사말' },
  calendar:  { icon: <Clock size={13} />,          label: '예식일시' },
  message:   { icon: <Heart size={13} />,          label: '한마디' },
  interview: { icon: <MessagesSquare size={13} />, label: '인터뷰' },
  photos:    { icon: <ImageIcon size={13} />,      label: '갤러리' },
  timeline:  { icon: <Milestone size={13} />,      label: '타임라인' },
  location:  { icon: <MapPin size={13} />,         label: '장소' },
  midphoto:  { icon: <Camera size={13} />,         label: '중간사진' },
  rsvp:      { icon: <CalendarCheck size={13} />,  label: '참석의사' },
  accounts:  { icon: <CreditCard size={13} />,     label: '계좌정보' },
  contacts:  { icon: <Info size={13} />,           label: '기본정보' },
  guestbook: { icon: <BookOpen size={13} />,       label: '방명록' },
  livegallery: { icon: <Camera size={13} />,       label: '라이브 갤러리' },
  ending:    { icon: <Camera size={13} />,         label: '엔딩' },
  share:     { icon: <Send size={13} />,           label: '주소' },
};

const SectionComponent: React.FC<{ id: string; data: InvitationData; refEl?: React.RefObject<HTMLDivElement>; shareEnabled?: boolean; onNav?: () => void; guestName?: string; guestCode?: string }> = ({ id, data, refEl, shareEnabled, onNav, guestName, guestCode }) => {
  const navInfo = SECTION_NAV_INFO[id];
  const wrap = (children: React.ReactNode) => (
    <div ref={refEl} className={onNav ? 'preview-nav-section' : undefined}>
      {onNav && navInfo && (
        <button className="preview-section-nav-btn" onClick={onNav} title={`${navInfo.label} 편집`} aria-label={`${navInfo.label} 편집`}>
          {navInfo.icon}
          <span className="preview-nav-label">{navInfo.label}</span>
        </button>
      )}
      {children}
    </div>
  );

  switch (id) {
    case 'greeting': return wrap(<Greeting data={data} />);
    case 'calendar': return wrap(<Calendar data={data} />);
    case 'message': return wrap(<PersonalMessage data={data} />);
    case 'interview': return wrap(<Interview data={data} />);
    case 'photos': return wrap(<Gallery data={data} />);
    case 'timeline': return wrap(<Timeline data={data} />);
    case 'location': return wrap(<Location data={data} />);
    case 'midphoto': return wrap(<MidPhoto data={data} />);
    case 'rsvp': return wrap(<RSVPForm data={data} guestName={guestName} guestCode={guestCode} />);
    case 'accounts': return wrap(<Money data={data} />);
    case 'contacts': return wrap(<Contacts data={data} />);
    case 'guestbook': return wrap(<Guestbook data={data} />);
    case 'livegallery': return wrap(<LiveGallery data={data} guestCode={guestCode} />);
    case 'ending': return wrap(<Ending data={data} />);
    case 'share': return wrap(<Share data={data} shareEnabled={shareEnabled} />);
    default: return null;
  }
};

// midphoto는 순서 관리 대상이 아니라 활성 섹션 중간에 자동 배치되는 고정 섹션이라 여기서 제외
const DEFAULT_ORDER = ['greeting', 'calendar', 'message', 'interview', 'photos', 'timeline', 'location', 'guestbook', 'livegallery', 'rsvp', 'accounts', 'contacts', 'ending', 'share'];

// 각 섹션의 on/off 토글 여부 (없는 섹션은 항상 활성)
function isSectionActive(id: string, data: InvitationData): boolean {
  switch (id) {
    case 'interview': return data.isInterviewEnabled !== false;
    case 'timeline': return data.isTimelineEnabled !== false;
    case 'message': return data.isMessageEnabled !== false;
    case 'ending': return data.isEndingEnabled !== false;
    // 새로 추가된 기능이라 기존 청첩장에는 값이 없으므로, 다른 토글과 반대로
    // 명시적으로 켠 경우에만 노출한다(기본 꺼짐) — 갑자기 남의 청첩장에 나타나지 않도록.
    case 'livegallery': return data.isLiveGalleryEnabled === true;
    default: return true;
  }
}

// midphoto를 '현재 활성화된 섹션들' 중 중간 위치에 동적으로 삽입
function buildSectionOrder(data: InvitationData): string[] {
  const savedOrder = data.sectionOrder?.length ? data.sectionOrder : DEFAULT_ORDER;
  const baseOrder = [...savedOrder, ...DEFAULT_ORDER.filter((id) => !savedOrder.includes(id))].filter((id) => id !== 'midphoto');
  if (data.isMidPhotoEnabled === false) return baseOrder;

  const activeIndices = baseOrder.reduce<number[]>((acc, id, i) => {
    if (isSectionActive(id, data)) acc.push(i);
    return acc;
  }, []);
  const insertAt = activeIndices.length > 0 ? activeIndices[Math.floor(activeIndices.length / 2)] : baseOrder.length;
  return [...baseOrder.slice(0, insertAt), 'midphoto', ...baseOrder.slice(insertAt)];
}

const InvitationView: React.FC<InvitationViewProps> = ({ data, previewRefs, showOpening, shareEnabled = false, openingTopOffset, onSectionNav, forceAnniversaryMode, guestName, guestRelation, guestCode, guestMessageIndex }) => {
  const sectionOrder = buildSectionOrder(data);
  const openingPreviewKey = useInvitationStore((s) => s.openingPreviewKey);

  const daysAfterWedding = (() => {
    if (!data.weddingDateISO) return 0;
    return Math.floor((Date.now() - new Date(data.weddingDateISO).getTime()) / 86400000);
  })();
  // 기념일 모드 여부는 호출자(ViewPage 등)가 URL 파라미터/예식일+24시간 경과/토글 상태를
  // 종합해 계산한 뒤 이 prop으로 넘겨준다 — 이 컴포넌트는 그 결과만 그대로 반영한다.
  const isAnniversaryMode = forceAnniversaryMode === true;
  const [previewActive, setPreviewActive] = useState(false);
  // openingDone: 한 번 dismiss 되면 true → shouldShowOpening = false → 완전히 언마운트
  const [openingDone, setOpeningDone] = useState(false);
  // 마운트 시점의 key를 기준으로 삼아, 리마운트 시 이전 key로 재트리거 방지
  const lastProcessedKeyRef = useRef(openingPreviewKey);

  // 전체화면 진입 시마다 Opening 상태 초기화
  useEffect(() => {
    if (showOpening) setOpeningDone(false);
  }, [showOpening]);

  // 미리보기 버튼 클릭: 에디터 프리뷰 패널에서만, key가 실제로 증가했을 때만 1회 트리거
  useEffect(() => {
    if (showOpening) return;
    if (openingPreviewKey > lastProcessedKeyRef.current) {
      lastProcessedKeyRef.current = openingPreviewKey;
      setPreviewActive(true);
      setOpeningDone(false);
    }
  }, [openingPreviewKey, showOpening]);

  const effectiveSectionOrder = sectionOrder;

  const anniversaryOpening = isAnniversaryMode && data.opening
    ? { ...data.opening, openingEnabled: true, openingText: `D+${daysAfterWedding}`, openingSubText: '' }
    : data.opening;

  const isPreviewOnly = previewActive && !data.opening?.openingEnabled;

  // 에디터 패널(showOpening 없음): previewActive일 때만 표시
  // 전체화면(showOpening=true): openingEnabled이면 자동 표시, 또는 previewActive일 때
  const shouldShowOpening = !openingDone && (
    (showOpening && !!data.opening?.openingEnabled) || previewActive
  );

  const handleOpeningDismissed = () => {
    setPreviewActive(false);
    setOpeningDone(true);
  };

  return (
    <article className={`preview-wrapper texture-${data.bgTexture || 'none'}`} aria-label="청첩장">
      {shouldShowOpening && data.opening && (
        <Opening
          key={openingPreviewKey || 'static'}
          opening={anniversaryOpening!}
          groomName={data.groomName}
          brideName={data.brideName}
          date={data.date}
          theme={data.theme}
          autoClose={isPreviewOnly}
          onDismissed={handleOpeningDismissed}
          topOffset={openingTopOffset}
          anniversaryMode={isAnniversaryMode}
          language={data.language}
          guestName={guestName}
          guestRelation={guestRelation}
          guestMessageIndex={guestMessageIndex}
          weddingDateISO={data.weddingDateISO}
        />
      )}
      <BackgroundEffects effect={data.bgEffect} effectDir={data.bgEffectDir} />
      <MusicPlayer url={data.bgMusicUrl} />
      {previewRefs?.basic ? (
        <div ref={previewRefs.basic} className={onSectionNav ? 'preview-nav-section' : undefined}>
          {onSectionNav && (
            <button className="preview-section-nav-btn" onClick={() => onSectionNav('hero')} title="메인화면 편집" aria-label="메인화면 편집">
              <LayoutTemplate size={13} />
              <span className="preview-nav-label">메인화면</span>
            </button>
          )}
          <Hero data={data} />
        </div>
      ) : (
        <Hero data={data} />
      )}
      {effectiveSectionOrder.map((id, i) => {
        const eff = data.scrollEffect || 'none';
        const delay = i % 2 === 0 ? 0 : 100;
        const ref = previewRefs?.[id];
        const editorId = PREVIEW_TO_EDITOR[id] || id;
        return (
          <ScrollReveal key={id} effect={eff} delay={delay}>
            <SectionComponent id={id} data={data} refEl={ref} shareEnabled={shareEnabled} onNav={onSectionNav ? () => onSectionNav(editorId) : undefined} guestName={guestName} guestCode={guestCode} />
          </ScrollReveal>
        );
      })}
    </article>
  );
};

export default InvitationView;
