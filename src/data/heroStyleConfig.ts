import { InvitationData } from '../types';

type HeroStyle = InvitationData['heroStyle'];

// heroPhotoShape(사진 모형) 축을 실제로 열어줘도 되는지 heroStyle 17개를 하나하나 직접
// oval 모형으로 렌더링해 눈으로 확인하고 분류했다 (Playwright 스크린샷 검증, 2026-07-05).
//
// 처음엔 overlay/fullscreen/magcover/bookcover/boldtype/glassframe/magframe/instacard까지
// 8개를 고정형으로 분류했었다 — 사진이 섹션 전체를 채우는 배경(position:absolute; inset:0 등)
// 위에 이름/문구가 "사진이 빈틈없이 꽉 차 있다"는 전제로 배치돼 있어, oval 등을 적용하면
// 클리핑된 모서리에 배경색이 드러나며 텍스트가 허공에 뜬 것처럼 보이는 문제가 실제로 있었다.
// 이후 "bookcover만 빼고 나머지는 다 자유형으로 열어달라"는 요청에 따라, bookcover를 제외한
// 나머지는 그 시각적 트레이드오프(모서리에 배경이 드러남 등)를 감수하고 자유형으로 전환했다.
//
// 고정형으로 남은 스타일과 이유:
// - bookcover: 사진이 섹션 전체를 채우는 배경(.bc-bg position:absolute; inset:0)이고 그 위
//   모서리 장식(⌐ ¬ 코너 브래킷)과 하단 텍스트가 "사진이 꽉 차 있다"는 전제로 배치돼 있어,
//   oval 등을 적용하면 코너 장식이 허공에 뜬 것처럼 보이는 깨진 화면이 된다.
export const FIXED_LOOK_HERO_STYLES: HeroStyle[] = [
  'bookcover',
];

export function isFixedLookHeroStyle(style: HeroStyle): boolean {
  return FIXED_LOOK_HERO_STYLES.includes(style);
}

// 캡션(heroCaption) 축은 사진 박스 위/우측에 상단 또는 우측 가장자리 스크림으로 얹히므로,
// heroPhotoShape와는 다른 기준으로 충돌을 확인했다(실제 script 캡션을 얹어 스크린샷으로 검증).
// - bookcover: 상단에 이미 있는 "WEDDING INVITATION" 라벨과 코너 장식 위에 캡션이 그대로
//   겹쳐 라벨 글자가 캡션 텍스트에 가려 거의 안 보이게 된다.
// - magcover: 신랑·신부 이름 타이틀이 이미 상단에 딱 붙어 있어, 어떤 상단 캡션을 얹어도
//   여백 없이 바로 위에 붙어버려 두 텍스트가 구분 없이 뭉쳐 보인다.
// 나머지 스타일(overlay/fullscreen/boldtype/glassframe/magframe/instacard 포함)은 실제
// 렌더링 결과 자체 텍스트와 겹치지 않아 캡션을 그대로 허용한다.
export const CAPTION_DISABLED_HERO_STYLES: HeroStyle[] = [
  'bookcover',
  'magcover',
];

export function isCaptionDisabledHeroStyle(style: HeroStyle): boolean {
  return CAPTION_DISABLED_HERO_STYLES.includes(style);
}
