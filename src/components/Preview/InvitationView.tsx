import React, { useEffect, useRef, useState } from 'react';
import { InvitationData } from '../../types';
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
import Share from './Share';
import Guestbook from './Guestbook';
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
}

// 미리보기 섹션 ID → 에디터 섹션 ID 매핑
const PREVIEW_TO_EDITOR: Record<string, string> = {
  calendar: 'datetime',
  contacts: 'basic',
};

const NavIcon = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="currentColor" aria-hidden="true">
    <rect x="0" y="0" width="3.5" height="11" rx="1.2"/>
    <rect x="5" y="0" width="8" height="3" rx="1.2"/>
    <rect x="5" y="4" width="6" height="3" rx="1.2"/>
    <rect x="5" y="8" width="4" height="3" rx="1.2"/>
  </svg>
);

const SectionComponent: React.FC<{ id: string; data: InvitationData; refEl?: React.RefObject<HTMLDivElement>; shareEnabled?: boolean; onNav?: () => void }> = ({ id, data, refEl, shareEnabled, onNav }) => {
  const wrap = (children: React.ReactNode) => (
    <div ref={refEl} className={onNav ? 'preview-nav-section' : undefined}>
      {onNav && (
        <button className="preview-section-nav-btn" onClick={onNav} title="편집 섹션으로 이동" aria-label="편집 섹션으로 이동">
          <NavIcon />
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
    case 'rsvp': return wrap(<RSVPForm data={data} />);
    case 'accounts': return wrap(<Money data={data} />);
    case 'contacts': return wrap(<Contacts data={data} />);
    case 'guestbook': return wrap(<Guestbook data={data} />);
    case 'ending': return wrap(<Ending data={data} />);
    case 'share': return wrap(<Share data={data} shareEnabled={shareEnabled} />);
    default: return null;
  }
};

const DEFAULT_ORDER = ['greeting', 'calendar', 'message', 'interview', 'photos', 'timeline', 'location', 'guestbook', 'rsvp', 'accounts', 'contacts', 'ending', 'share'];

const InvitationView: React.FC<InvitationViewProps> = ({ data, previewRefs, showOpening, shareEnabled = false, openingTopOffset, onSectionNav }) => {
  const savedOrder = data.sectionOrder?.length ? data.sectionOrder : DEFAULT_ORDER;
  const sectionOrder = [...savedOrder, ...DEFAULT_ORDER.filter((id) => !savedOrder.includes(id))];
  const openingPreviewKey = useInvitationStore((s) => s.openingPreviewKey);

  const daysAfterWedding = (() => {
    if (!data.weddingDateISO) return 0;
    return Math.floor((Date.now() - new Date(data.weddingDateISO).getTime()) / 86400000);
  })();
  const isAnniversaryMode = shareEnabled && daysAfterWedding > 0;
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

  const effectiveSectionOrder = isAnniversaryMode
    ? sectionOrder.filter(id => id !== 'accounts' && id !== 'rsvp')
    : sectionOrder;

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
        />
      )}
      <BackgroundEffects effect={data.bgEffect} effectDir={data.bgEffectDir} />
      <MusicPlayer url={data.bgMusicUrl} />
      {previewRefs?.basic ? (
        <div ref={previewRefs.basic} className={onSectionNav ? 'preview-nav-section' : undefined}>
          {onSectionNav && (
            <button className="preview-section-nav-btn" onClick={() => onSectionNav('hero')} title="편집 섹션으로 이동" aria-label="편집 섹션으로 이동">
              <NavIcon />
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
            <SectionComponent id={id} data={data} refEl={ref} shareEnabled={shareEnabled} onNav={onSectionNav ? () => onSectionNav(editorId) : undefined} />
          </ScrollReveal>
        );
      })}
    </article>
  );
};

export default InvitationView;
