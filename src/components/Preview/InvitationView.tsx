import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutTemplate, MessageSquare, Clock, Heart, MessagesSquare,
  Image as ImageIcon, Milestone, MapPin, CalendarCheck, CreditCard,
  Info, BookOpen, Camera, Send, Palette,
} from 'lucide-react';
import { InvitationData, GuestRelation, OpeningConfig } from '../../types';
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
  enableAnonymousOpening?: boolean;
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

const InvitationView: React.FC<InvitationViewProps> = ({ data, previewRefs, showOpening, shareEnabled = false, openingTopOffset, onSectionNav, forceAnniversaryMode, guestName, guestRelation, guestCode, guestMessageIndex, enableAnonymousOpening }) => {
  const openingPreviewKey = useInvitationStore((s) => s.openingPreviewKey);

  const daysAfterWedding = (() => {
    if (!data.weddingDateISO) return 0;
    return Math.floor((Date.now() - new Date(data.weddingDateISO).getTime()) / 86400000);
  })();
  // 기념일 모드 여부는 호출자(ViewPage 등)가 URL 파라미터/예식일+24시간 경과/토글 상태를
  // 종합해 계산한 뒤 이 prop으로 넘겨준다 — 이 컴포넌트는 그 결과만 그대로 반영한다.
  const isAnniversaryMode = forceAnniversaryMode === true;

  // 기념일 모드에서는 anniversaryMode에 등록된 대표사진/갤러리/오프닝 스타일을 우선 사용하고,
  // 아직 등록 안 한 값(빈 문자열/빈 배열/undefined)은 청첩장 모드 값으로 그대로 폴백한다.
  // 이 외의 모든 필드(테마/폰트/문구 등)는 그대로이므로, 기념일 모드가 아닐 때는 data와
  // 완전히 동일한 참조를 그대로 쓴다 — 일반 청첩장 열람 동작에는 영향이 없다.
  const am = data.anniversaryMode;
  const effectiveData: InvitationData = isAnniversaryMode && am
    ? {
        ...data,
        heroPhoto: am.heroPhoto || data.heroPhoto,
        photos: am.photos && am.photos.length > 0 ? am.photos : data.photos,
        opening: data.opening
          ? { ...data.opening, openingStyle: (am.openingStyle as OpeningConfig['openingStyle']) || data.opening.openingStyle }
          : data.opening,
      }
    : data;

  const sectionOrder = buildSectionOrder(effectiveData);
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

  // 예식 전(소유자 미리보기 등으로 daysAfterWedding이 음수)에도 실제 기념일 모드와 동일한
  // 구성(D+n)을 그대로 보여주기 위해, 예식일+364일이 지난 것으로 가정한다 — 예식 전 미리보기가
  // "안내 문구로 대체된 가짜 화면"이 아니라 실제 1주년 즈음 모습 그대로 보이게 하기 위함.
  const isPreWeddingAnniversaryPreview = isAnniversaryMode && daysAfterWedding < 0;
  const effectiveDaysAfterWedding = isPreWeddingAnniversaryPreview ? 364 : daysAfterWedding;
  const anniversaryOpeningText = `D+${effectiveDaysAfterWedding}`;
  const anniversaryOpeningSubText = '';

  const anniversaryOpening = isAnniversaryMode && effectiveData.opening
    ? { ...effectiveData.opening, openingEnabled: true, openingText: anniversaryOpeningText, openingSubText: anniversaryOpeningSubText }
    : effectiveData.opening;

  // 예식 전 미리보기 중임을 알리는 상단 배너 문구 — 실제 기념일 모드(예식 후)에서는 표시하지 않는다.
  const previewBannerText = (() => {
    if (!isPreWeddingAnniversaryPreview || !data.weddingDateISO) return '';
    const d = new Date(data.weddingDateISO);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
    if (data.language === 'en') {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `This is how it will look after ${months[m]} ${day}, ${y}`;
    }
    if (data.language === 'ja') return `${y}年${m + 1}月${day}日以降はこのように表示されます`;
    return `${y}년 ${m + 1}월 ${day}일 이후 이렇게 보입니다`;
  })();
  const previewBannerSubText = isPreWeddingAnniversaryPreview
    ? (data.language === 'en' ? 'Preview after the wedding' : data.language === 'ja' ? '式後のプレビュー' : '예식일 이후 미리보기')
    : '';

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
      {isPreWeddingAnniversaryPreview && previewBannerText && (
        <div className="anniversary-preview-banner">
          <strong>{previewBannerText}</strong>
          {previewBannerSubText && <span>{previewBannerSubText}</span>}
        </div>
      )}
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
          slug={data.slug}
          enableAnonymousOpening={enableAnonymousOpening}
        />
      )}
      <BackgroundEffects effect={data.bgEffect} />
      <MusicPlayer url={data.bgMusicUrl} />
      {previewRefs?.hero ? (
        <div ref={previewRefs.hero} className={onSectionNav ? 'preview-nav-section' : undefined}>
          {onSectionNav && (
            <div className="preview-nav-btn-stack">
              <button className="preview-section-nav-btn" onClick={() => onSectionNav('hero')} title="메인화면 편집" aria-label="메인화면 편집">
                <LayoutTemplate size={13} />
                <span className="preview-nav-label">메인화면</span>
              </button>
              <button className="preview-section-nav-btn" onClick={() => onSectionNav('design')} title="디자인 편집" aria-label="디자인 편집">
                <Palette size={13} />
                <span className="preview-nav-label">디자인</span>
              </button>
            </div>
          )}
          <Hero data={effectiveData} />
        </div>
      ) : (
        <Hero data={effectiveData} />
      )}
      {effectiveSectionOrder.map((id, i) => {
        const eff = data.scrollEffect || 'none';
        const delay = i % 2 === 0 ? 0 : 100;
        const ref = previewRefs?.[id];
        const editorId = PREVIEW_TO_EDITOR[id] || id;
        return (
          <ScrollReveal key={id} effect={eff} delay={delay}>
            <SectionComponent id={id} data={effectiveData} refEl={ref} shareEnabled={shareEnabled} onNav={onSectionNav ? () => onSectionNav(editorId) : undefined} guestName={guestName} guestCode={guestCode} />
          </ScrollReveal>
        );
      })}
    </article>
  );
};

export default InvitationView;
