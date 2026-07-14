import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  LayoutTemplate, MessageSquare, Clock, Heart, MessagesSquare,
  Image as ImageIcon, Milestone, MapPin, CalendarCheck, CreditCard,
  Info, BookOpen, Camera, Send, Palette, Phone, ChevronLeft, ChevronRight,
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
import ScrollReveal, { ScrollRootContext, ScrollRevealProvider } from './ScrollReveal';
import BackgroundEffects from './BackgroundEffects';
import MusicPlayer from './MusicPlayer';
import Opening from './Opening';
import RSVPNoticePopup from './RSVPNoticePopup';

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
  // 오프닝 애니메이션이 화면에 떠 있는 동안(true) 호출자가 자체 플로팅 UI(섹션 이동 메뉴 등)를
  // 오프닝 위에 겹쳐 보이지 않게 숨길 수 있도록 알려준다. 오프닝을 아예 안 쓰는 청첩장이면
  // shouldShowOpening이 처음부터 false라 곧바로 false로 호출된다.
  onOpeningActiveChange?: (active: boolean) => void;
  // 라이브 갤러리의 예식일 기준 잠금 등, 날짜 기반 게이팅을 소유자 미리보기에서는 우회하기
  // 위한 플래그. 에디터/전체화면 미리보기/기념일 편집 미리보기 등 소유자만 접근 가능한
  // 내부 미리보기 경로는 모두 true로 넘기고, 실제 공개 페이지(ViewPage)는 로그인한
  // 사용자가 청첩장 소유자일 때만 true를 넘긴다.
  isOwnerPreview?: boolean;
}

// 미리보기 섹션 ID → 에디터 섹션 ID 매핑
const PREVIEW_TO_EDITOR: Record<string, string> = {
  calendar: 'datetime',
  contacts: 'basic',
};

// 미리보기 섹션 ID → { 아이콘, 레이블(에디터=한국어 고정 / 청첩장 뷰어용 영어·일본어) }
export const SECTION_NAV_INFO: Record<string, { icon: React.ReactNode; label: string; labelEn: string; labelJa: string }> = {
  hero:      { icon: <LayoutTemplate size={13} />, label: '메인화면',      labelEn: 'Home',        labelJa: 'ホーム' },
  greeting:  { icon: <MessageSquare size={13} />,  label: '인사말',        labelEn: 'Greeting',     labelJa: '挨拶' },
  calendar:  { icon: <Clock size={13} />,          label: '예식일시',      labelEn: 'Date & Time',  labelJa: '日時' },
  message:   { icon: <Heart size={13} />,          label: '한마디',        labelEn: 'A Word',       labelJa: 'ひとこと' },
  interview: { icon: <MessagesSquare size={13} />, label: '인터뷰',        labelEn: 'Interview',    labelJa: 'インタビュー' },
  photos:    { icon: <ImageIcon size={13} />,      label: '갤러리',        labelEn: 'Gallery',      labelJa: 'ギャラリー' },
  timeline:  { icon: <Milestone size={13} />,      label: '타임라인',      labelEn: 'Timeline',     labelJa: 'タイムライン' },
  location:  { icon: <MapPin size={13} />,         label: '장소',          labelEn: 'Location',     labelJa: '場所' },
  midphoto:  { icon: <Camera size={13} />,         label: '중간사진',      labelEn: 'Photo',        labelJa: '写真' },
  rsvp:      { icon: <CalendarCheck size={13} />,  label: '참석의사',      labelEn: 'RSVP',         labelJa: '出欠確認' },
  accounts:  { icon: <CreditCard size={13} />,     label: '계좌정보',      labelEn: 'Gift Account', labelJa: 'ご祝儀口座' },
  contacts:  { icon: <Info size={13} />,           label: '기본정보',      labelEn: 'Contact',      labelJa: '連絡先' },
  guestbook: { icon: <BookOpen size={13} />,       label: '방명록',        labelEn: 'Guestbook',    labelJa: '芳名録' },
  livegallery: { icon: <Camera size={13} />,       label: '라이브 갤러리', labelEn: 'Live Gallery', labelJa: 'ライブギャラリー' },
  ending:    { icon: <Camera size={13} />,         label: '엔딩',          labelJa: 'エンディング', labelEn: 'Ending' },
  share:     { icon: <Send size={13} />,           label: '주소',          labelEn: 'Address',      labelJa: '住所' },
};

const SectionComponent: React.FC<{ id: string; data: InvitationData; refEl?: React.RefObject<HTMLDivElement>; shareEnabled?: boolean; onNav?: () => void; onNavExtra?: () => void; guestName?: string; guestCode?: string; isOwnerPreview?: boolean }> = ({ id, data, refEl, shareEnabled, onNav, onNavExtra, guestName, guestCode, isOwnerPreview }) => {
  const navInfo = SECTION_NAV_INFO[id];
  const wrap = (children: React.ReactNode) => (
    <div ref={refEl} className={onNav ? 'preview-nav-section' : undefined}>
      {onNav && navInfo && (
        onNavExtra ? (
          <div className="preview-nav-btn-stack">
            <button className="preview-section-nav-btn" onClick={onNav} title={`${navInfo.label} 편집`} aria-label={`${navInfo.label} 편집`}>
              {navInfo.icon}
              <span className="preview-nav-label">{navInfo.label}</span>
            </button>
            <button className="preview-section-nav-btn" onClick={onNavExtra} title="연락처 편집" aria-label="연락처 편집">
              <Phone size={13} />
              <span className="preview-nav-label">연락처</span>
            </button>
          </div>
        ) : (
          <button className="preview-section-nav-btn" onClick={onNav} title={`${navInfo.label} 편집`} aria-label={`${navInfo.label} 편집`}>
            {navInfo.icon}
            <span className="preview-nav-label">{navInfo.label}</span>
          </button>
        )
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
    case 'livegallery': return wrap(<LiveGallery data={data} guestCode={guestCode} isOwnerPreview={isOwnerPreview} />);
    case 'ending': return wrap(<Ending data={data} />);
    case 'share': return wrap(<Share data={data} shareEnabled={shareEnabled} />);
    default: return null;
  }
};

// midphoto는 순서 관리 대상이 아니라 활성 섹션 중간에 자동 배치되는 고정 섹션이라 여기서 제외
export const DEFAULT_ORDER = ['greeting', 'contacts', 'photos', 'calendar', 'message', 'interview', 'timeline', 'location', 'rsvp', 'guestbook', 'livegallery', 'accounts', 'ending', 'share'];

// 가로 스크롤 모드에서 내용이 슬라이드 높이보다 짧을 때 세로 중앙 정렬이 기본이지만,
// 위쪽 여백이 콘텐츠 일부로 읽히는 섹션(목록/아코디언형)은 상단 고정이 자연스럽다.
function isTopAlignedSlide(id: string, data: InvitationData): boolean {
  switch (id) {
    case 'guestbook':
      return true;
    case 'contacts':
      return (data.contactDisplayMode ?? 'inline') !== 'popup';
    case 'accounts':
      return data.accountStyle === 'style1' || data.accountStyle === 'style3';
    default:
      return false;
  }
}

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
export function buildSectionOrder(data: InvitationData): string[] {
  const FIXED_TAIL = ['ending', 'share'];
  const savedOrder = data.sectionOrder?.length ? data.sectionOrder : DEFAULT_ORDER;
  const savedFiltered = savedOrder.filter((id) => id !== 'midphoto' && !FIXED_TAIL.includes(id));
  const missing = DEFAULT_ORDER.filter((id) => !savedFiltered.includes(id) && id !== 'midphoto' && !FIXED_TAIL.includes(id));
  const baseOrder = [...savedFiltered, ...missing, ...FIXED_TAIL];
  if (data.isMidPhotoEnabled === false) return baseOrder;

  // midphoto는 고정 tail(ending/share) 앞의 활성 섹션들 사이 중간에 삽입
  const activeIndices = baseOrder.reduce<number[]>((acc, id, i) => {
    if (!FIXED_TAIL.includes(id) && isSectionActive(id, data)) acc.push(i);
    return acc;
  }, []);
  const insertAt = activeIndices.length > 0 ? activeIndices[Math.floor(activeIndices.length / 2)] : baseOrder.length - FIXED_TAIL.length;
  return [...baseOrder.slice(0, insertAt), 'midphoto', ...baseOrder.slice(insertAt)];
}

const InvitationView: React.FC<InvitationViewProps> = ({ data, previewRefs, showOpening, shareEnabled = false, openingTopOffset, onSectionNav, forceAnniversaryMode, guestName, guestRelation, guestCode, guestMessageIndex, enableAnonymousOpening, onOpeningActiveChange, isOwnerPreview }) => {
  const openingPreviewKey = useInvitationStore((s) => s.openingPreviewKey);
  // ScrollReveal 배치 코디네이터에 넘길 스크롤 루트 — 호출부(ViewPage/App.tsx 등)가
  // ScrollRootContext.Provider로 이미 제공하고 있는 값을 그대로 재사용한다.
  const scrollRoot = useContext(ScrollRootContext);

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
  const [rsvpNoticeVisible, setRsvpNoticeVisible] = useState(false);
  const rsvpNoticeShownRef = useRef(false);
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

  // useLayoutEffect로 페인트 전에 호출자 상태를 동기화해, 오프닝을 안 쓰는 청첩장에서도
  // "잠깐 보였다가 사라지는" 깜빡임 없이 처음부터 올바른 값으로 반영되게 한다.
  useLayoutEffect(() => {
    onOpeningActiveChange?.(shouldShowOpening);
  }, [shouldShowOpening]); // eslint-disable-line react-hooks/exhaustive-deps

  const showRsvpNotice = () => {
    if (rsvpNoticeShownRef.current) return;
    if (!showOpening || !data.isRSVPEnabled || !data.isRSVPNoticeEnabled || isAnniversaryMode || !data.slug) return;
    // 이미 참석 여부를 제출한 적이 있으면(RSVPForm.tsx에서 제출 시 저장) 다시 안내하지 않는다.
    if (localStorage.getItem(`rsvp-submitted-${data.slug}`)) return;
    if (localStorage.getItem(`rsvp-notice-hidden-${data.slug}`) === new Date().toDateString()) return;
    rsvpNoticeShownRef.current = true;
    setTimeout(() => setRsvpNoticeVisible(true), 400);
  };

  // 오프닝 애니메이션이 없을 때는 마운트 직후 팝업 표시
  useEffect(() => {
    if (!showOpening || data.opening?.openingEnabled) return;
    showRsvpNotice();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpeningDismissed = () => {
    setPreviewActive(false);
    setOpeningDone(true);
    showRsvpNotice();
  };

  const trackRef = useRef<HTMLDivElement>(null);

  // PC에서는 트랙패드/시프트+휠이 아니면 가로 스크롤을 시작할 방법이 마땅치 않고
  // 스크롤바도 숨겨져 있어(preview.css) 더 안 보인다. 마우스 왼쪽 버튼을 누른 채
  // 좌우로 끌면 네이티브 scrollLeft를 직접 옮겨 트랙패드 드래그처럼 넘어가게 한다.
  // 실제로 끌린 경우에만(임계값 이상 이동) 뒤이은 click을 취소해, 버튼/링크/입력창
  // 클릭이나 포커스는 그대로 정상 동작한다.
  useEffect(() => {
    // 탭 넘기기 모드는 드래그해도 한 장 단위로만 넘어가야 해서 아래 별도 effect가 담당한다.
    if (data.scrollDirection !== 'horizontal' || data.horizontalPageMode === 'tap') return;
    const el = trackRef.current;
    if (!el) return;
    let isDown = false;
    let moved = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as Element;
      // 계좌/연락처 카드 캐러셀, 방명록 메시지 슬라이더는 자체 마우스 드래그를 쓰므로,
      // 그 위에서 시작된 드래그는 섹션 전환 드래그가 가로채지 않도록 건너뛴다.
      if (target.closest?.('.carousel-viewport, .contact-carousel-vp, .gb-note-scroll')) return;
      // 이미지 위에서 누르면 브라우저 기본 동작(고스트 이미지 드래그)이 먼저 끼어들어
      // mousemove 단계의 preventDefault가 이미 늦어버린다 — 입력창/버튼/링크처럼
      // mousedown의 기본 동작(포커스 등)이 필요한 요소만 빼고 여기서 미리 막는다.
      const isInteractive = !!target.closest?.('input, textarea, select, button, a, [contenteditable="true"]');
      if (!isInteractive) e.preventDefault();
      isDown = true;
      moved = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        el.classList.add('h-scroll-track--dragging');
      }
      if (moved) {
        e.preventDefault();
        el.scrollLeft = startScrollLeft - dx;
      }
    };
    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove('h-scroll-track--dragging');
      if (!moved) return;
      moved = false;
      // 가장 가까운 슬라이드로 스냅 (CSS scroll-snap은 드래그 중 꺼져 있으므로 JS로 처리)
      const w = el.clientWidth || 1;
      const nearest = Math.round(el.scrollLeft / w);
      const total = el.children.length;
      el.scrollTo({ left: Math.min(Math.max(nearest, 0), total - 1) * w, behavior: 'smooth' });
    };
    const onClickCapture = (e: MouseEvent) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', endDrag);
    el.addEventListener('click', onClickCapture, true);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', endDrag);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, [data.scrollDirection, data.horizontalPageMode]);

  // 탭 넘기기 모드 전용 드래그: 마우스든 터치든(Pointer Events로 통일) 얼마나 멀리
  // 끌었는지와 상관없이 방향 판정용 임계값만 넘으면 버튼 탭과 똑같이 딱 한 장만 넘어간다
  // (자유 모드처럼 끈 거리만큼 비례해서 넘어가지 않는다). 터치의 네이티브 가로 스크롤은
  // touch-action: pan-y(CSS)로 막아 이 로직과 부딪히지 않게 한다.
  useEffect(() => {
    if (data.scrollDirection !== 'horizontal' || data.horizontalPageMode !== 'tap') return;
    const el = trackRef.current;
    if (!el) return;
    let isDown = false;
    let moved = false;
    let startX = 0;
    let baseIndex = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const target = e.target as Element;
      // 계좌/연락처 카드 캐러셀, 방명록 메시지 슬라이더는 자체 드래그를 쓰므로 건너뛴다.
      if (target.closest?.('.carousel-viewport, .contact-carousel-vp, .gb-note-scroll')) return;
      const isInteractive = !!target.closest?.('input, textarea, select, button, a, [contenteditable="true"]');
      if (!isInteractive && e.pointerType === 'mouse') e.preventDefault();
      isDown = true;
      moved = false;
      startX = e.clientX;
      baseIndex = Math.round(el.scrollLeft / (el.clientWidth || 1));
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        el.classList.add('h-scroll-track--dragging');
        el.style.scrollBehavior = 'auto';
      }
      if (moved) {
        const w = el.clientWidth || 1;
        el.scrollLeft = baseIndex * w - dx;
      }
    };
    const endDrag = (e: PointerEvent) => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove('h-scroll-track--dragging');
      el.style.scrollBehavior = '';
      if (!moved) return;
      moved = false;
      const w = el.clientWidth || 1;
      const dx = e.clientX - startX;
      const threshold = Math.min(60, w * 0.15);
      let target = baseIndex;
      if (dx <= -threshold) target = baseIndex + 1;
      else if (dx >= threshold) target = baseIndex - 1;
      const total = el.children.length;
      target = Math.min(Math.max(target, 0), total - 1);
      el.scrollTo({ left: target * w, behavior: 'smooth' });
    };
    // pointercancel은 브라우저가 제스처를 가져갈 때(세로 스크롤 등) 발생하며
    // e.clientX = 0으로 리셋된다. endDrag와 같은 함수를 쓰면 dx = -startX(항상 음수)가
    // 계산되어 threshold를 넘으면 무조건 오른쪽으로 이동하는 버그가 생긴다.
    // 순수 탭(moved=false) 시 cancelDrag는 아무것도 하지 않는다(scrollTo 하면 탭할 때마다
    // 현재 슬라이드로 smooth 스크롤이 발생해 슬라이드가 고정된 것처럼 보이는 버그).
    const cancelDrag = () => {
      if (!isDown) return;
      isDown = false;
      const wasMoved = moved;
      moved = false;
      el.classList.remove('h-scroll-track--dragging');
      el.style.scrollBehavior = '';
      if (!wasMoved) return;
      // 드래그 중 브라우저 캔슬 → pointercancel에서 e.clientX=0이므로 scrollLeft 기준으로
      // endDrag와 동일한 threshold 방식으로 방향 판정한다.
      const w = el.clientWidth || 1;
      const dScroll = el.scrollLeft - baseIndex * w; // onPointerMove: scrollLeft = base*w - dx
      const threshold = Math.min(60, w * 0.15);
      const total = el.children.length;
      let target = baseIndex;
      if (dScroll > threshold) target = baseIndex + 1;
      else if (dScroll < -threshold) target = baseIndex - 1;
      target = Math.min(Math.max(target, 0), total - 1);
      el.scrollTo({ left: target * w, behavior: 'smooth' });
    };
    const onClickCapture = (e: MouseEvent) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', cancelDrag);
    el.addEventListener('click', onClickCapture, true);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', cancelDrag);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, [data.scrollDirection, data.horizontalPageMode]);

  // 탭 넘기기 모드 전용: 지금 몇 번째 슬라이드가 보이는지, 전체 몇 장인지 추적해서
  // 좌우 버튼을 경계(첫/마지막 슬라이드)에서 비활성화한다. 렌더 중에 trackRef.current를
  // 직접 읽으면 첫 렌더 시점엔 아직 null이라 잘못된 값으로 굳어버리므로 effect에서 state로 옮겨둔다.
  const [hTapIndex, setHTapIndex] = useState(0);
  const [hTapTotal, setHTapTotal] = useState(1);
  // 좌우 버튼 자체가 아니라 화면의 나머지 부분을 탭하면 버튼을 숨기고, 다시 탭하면
  // 다시 보이게 한다. 버튼은 h-scroll-track과 별도 형제 요소라 버튼 탭은 여기 안 걸린다.
  // 드래그(끌기)로 끝난 클릭은 InvitationView 안의 캡처 단계 리스너가 이미 막아주므로
  // 실제 "탭"에서만 토글된다.
  const [hTapUiVisible, setHTapUiVisible] = useState(true);
  useEffect(() => {
    if (data.scrollDirection !== 'horizontal' || data.horizontalPageMode !== 'tap') return;
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth || 1;
      setHTapIndex(Math.round(el.scrollLeft / w));
      setHTapTotal(el.children.length);
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [data.scrollDirection, data.horizontalPageMode, effectiveSectionOrder]);

  const goToHSlide = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    const total = el.children.length;
    const current = Math.round(el.scrollLeft / w);
    const target = Math.min(Math.max(current + dir, 0), total - 1);
    el.scrollTo({ left: target * w, behavior: 'smooth' });
  };

  if (data.scrollDirection === 'horizontal') {
    return (
      <article className={`preview-wrapper texture-${effectiveData.bgTexture || 'none'} preview-wrapper--h`} aria-label="청첩장">
        {isPreWeddingAnniversaryPreview && previewBannerText && (
          <div className="anniversary-preview-banner">
            <strong>{previewBannerText}</strong>
            {previewBannerSubText && <span>{previewBannerSubText}</span>}
          </div>
        )}
        {rsvpNoticeVisible && !isAnniversaryMode && (
          <RSVPNoticePopup data={data} onClose={() => setRsvpNoticeVisible(false)} />
        )}
        {shouldShowOpening && effectiveData.opening && (
          <Opening
            key={openingPreviewKey || 'static'}
            opening={anniversaryOpening!}
            groomName={effectiveData.groomName}
            brideName={effectiveData.brideName}
            date={effectiveData.date}
            theme={effectiveData.theme}
            autoClose={isPreviewOnly}
            onDismissed={handleOpeningDismissed}
            topOffset={openingTopOffset}
            anniversaryMode={isAnniversaryMode}
            language={effectiveData.language}
            guestName={guestName}
            guestRelation={guestRelation}
            guestMessageIndex={guestMessageIndex}
            weddingDateISO={effectiveData.weddingDateISO}
            slug={effectiveData.slug}
            enableAnonymousOpening={enableAnonymousOpening}
            venueName={effectiveData.venueName}
          />
        )}
        {!effectiveData.bgEffectHeroOnly && <BackgroundEffects effect={effectiveData.bgEffect} />}
        <MusicPlayer url={effectiveData.bgMusicUrl} />
        <div
          className={`h-scroll-track${effectiveData.horizontalPageMode === 'tap' ? ' h-scroll-track--tap' : ''}`}
          ref={trackRef}
          onClick={effectiveData.horizontalPageMode === 'tap' ? () => setHTapUiVisible(v => !v) : undefined}
        >
          {/* Hero — 첫 번째 슬라이드 */}
          <div className="h-slide">
            <div style={{ position: 'relative' }}>
              {previewRefs?.hero && <div ref={previewRefs.hero} style={{ position: 'absolute', top: 0 }} />}
              {onSectionNav && (
                <div className="preview-nav-btn-stack">
                  <button className="preview-section-nav-btn" onClick={() => onSectionNav('hero')} title="메인화면 편집" aria-label="메인화면 편집">
                    <LayoutTemplate size={13} /><span className="preview-nav-label">메인화면</span>
                  </button>
                  <button className="preview-section-nav-btn" onClick={() => onSectionNav('design')} title="디자인 편집" aria-label="디자인 편집">
                    <Palette size={13} /><span className="preview-nav-label">디자인</span>
                  </button>
                </div>
              )}
              <Hero data={effectiveData} />
              {effectiveData.bgEffectHeroOnly && <BackgroundEffects effect={effectiveData.bgEffect} confined />}
            </div>
          </div>
          {/* 각 섹션 슬라이드 */}
          <ScrollRevealProvider rootRef={scrollRoot}>
            {effectiveSectionOrder.map((id, i) => {
              if (!isSectionActive(id, effectiveData)) return null;
              const ref = previewRefs?.[id];
              const editorId = PREVIEW_TO_EDITOR[id] || id;
              const eff = effectiveData.scrollEffect || 'none';
              const delay = i % 2 === 0 ? 0 : 100;
              return (
                <div key={id} className={`h-slide${isTopAlignedSlide(id, effectiveData) ? ' h-slide--top' : ''}`}>
                  <ScrollReveal effect={eff} delay={delay}>
                    <SectionComponent
                      id={id}
                      data={effectiveData}
                      refEl={ref}
                      shareEnabled={shareEnabled}
                      onNav={onSectionNav ? () => onSectionNav(editorId) : undefined}
                      onNavExtra={id === 'contacts' && onSectionNav ? () => onSectionNav('contacts') : undefined}
                      guestName={guestName}
                      guestCode={guestCode}
                      isOwnerPreview={isOwnerPreview}
                    />
                  </ScrollReveal>
                </div>
              );
            })}
          </ScrollRevealProvider>
        </div>
        {/* 탭으로 넘기기 모드에서는 드래그/스와이프도 그대로 되고, 좌우 버튼 탭으로도
            넘어간다 — 버튼은 모든 섹션에서 메인화면과 동일하게 보인다. */}
        {effectiveData.horizontalPageMode === 'tap' && (
          <>
            <button
              type="button"
              className={`h-tap-nav-btn h-tap-nav-btn--prev${hTapUiVisible ? '' : ' h-tap-nav-btn--hidden'}`}
              onClick={() => goToHSlide(-1)}
              disabled={hTapIndex <= 0}
              aria-label="이전 섹션"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className={`h-tap-nav-btn h-tap-nav-btn--next${hTapUiVisible ? '' : ' h-tap-nav-btn--hidden'}`}
              onClick={() => goToHSlide(1)}
              disabled={hTapIndex >= hTapTotal - 1}
              aria-label="다음 섹션"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </article>
    );
  }

  return (
    <article className={`preview-wrapper texture-${data.bgTexture || 'none'}`} aria-label="청첩장">
      {isPreWeddingAnniversaryPreview && previewBannerText && (
        <div className="anniversary-preview-banner">
          <strong>{previewBannerText}</strong>
          {previewBannerSubText && <span>{previewBannerSubText}</span>}
        </div>
      )}
      {rsvpNoticeVisible && !isAnniversaryMode && (
        <RSVPNoticePopup data={data} onClose={() => setRsvpNoticeVisible(false)} />
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
          venueName={data.venueName}
        />
      )}
      {!data.bgEffectHeroOnly && <BackgroundEffects effect={data.bgEffect} />}
      <MusicPlayer url={data.bgMusicUrl} />
      {previewRefs?.hero ? (
        <div ref={previewRefs.hero} className={onSectionNav ? 'preview-nav-section' : undefined} style={{ position: 'relative' }}>
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
          {data.bgEffectHeroOnly && <BackgroundEffects effect={data.bgEffect} confined />}
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <Hero data={effectiveData} />
          {data.bgEffectHeroOnly && <BackgroundEffects effect={data.bgEffect} confined />}
        </div>
      )}
      <ScrollRevealProvider rootRef={scrollRoot}>
        {effectiveSectionOrder.map((id, i) => {
          const eff = data.scrollEffect || 'none';
          const delay = i % 2 === 0 ? 0 : 100;
          const ref = previewRefs?.[id];
          const editorId = PREVIEW_TO_EDITOR[id] || id;
          return (
            <ScrollReveal key={id} effect={eff} delay={delay}>
              <SectionComponent id={id} data={effectiveData} refEl={ref} shareEnabled={shareEnabled} onNav={onSectionNav ? () => onSectionNav(editorId) : undefined} onNavExtra={id === 'contacts' && onSectionNav ? () => onSectionNav('contacts') : undefined} guestName={guestName} guestCode={guestCode} isOwnerPreview={isOwnerPreview} />
            </ScrollReveal>
          );
        })}
      </ScrollRevealProvider>
    </article>
  );
};

export default InvitationView;
