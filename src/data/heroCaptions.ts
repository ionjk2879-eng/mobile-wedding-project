import { InvitationData } from '../types';

export type HeroCaptionStyle = 'script' | 'large-number' | 'vertical';

export interface HeroCaptionPreset {
  id: string;
  text: string;
  style: HeroCaptionStyle;
}

// 계속 추가하기 쉬운 평면 배열 — 새 문구는 끝에 객체 하나만 추가하면 된다.
export const HERO_CAPTIONS: HeroCaptionPreset[] = [
  { id: 'getting-married', text: 'Getting Married', style: 'script' },
  { id: 'wedding-day', text: 'The Wedding Day', style: 'script' },
  { id: 'we-marry-ko', text: '우리 결혼합니다', style: 'script' },
  { id: 'two-souls-one-heart', text: 'Two Souls, One Heart', style: 'script' },
  { id: 'love-story-begins', text: 'Our Love Story Begins', style: 'script' },
  { id: 'save-the-date', text: 'SAVE THE DATE', style: 'large-number' },
  { id: 'the-big-day', text: 'THE BIG DAY', style: 'large-number' },
  { id: 'were-getting-married', text: "WE'RE GETTING MARRIED", style: 'large-number' },
  { id: 'vertical-wedding', text: 'WEDDING', style: 'vertical' },
  { id: 'vertical-we-marry-ko', text: '결혼합니다', style: 'vertical' },
];

export function findHeroCaption(id: string | undefined): HeroCaptionPreset | undefined {
  if (!id) return undefined;
  return HERO_CAPTIONS.find((c) => c.id === id);
}

// 이미 자체 텍스트/프레임 배치를 가진 heroStyle — 캡션 축과 시각적으로 충돌해 비활성화한다.
// glassframe/magframe: heroPhotoShape 때와 동일하게 자체 액자 프레임을 가짐.
// magcover: 오버레이 텍스트(mag-title)가 사진 상단에 이미 자리해 script 캡션과 겹침.
// verttype: 세로쓰기 스파인(vt-spine)이 이미 있어 vertical 캡션과 정확히 같은 자리를 두고 충돌.
export const HERO_CAPTION_DISABLED_STYLES: InvitationData['heroStyle'][] = ['glassframe', 'magframe', 'magcover', 'verttype'];
