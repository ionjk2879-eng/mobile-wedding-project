import { InvitationData } from '../types';

type HeroStyle = InvitationData['heroStyle'];

// heroPhotoShape(사진 모형) 축을 실제로 열어줘도 되는지 heroStyle 17개를 하나하나 직접
// oval 모형으로 렌더링해 눈으로 확인하고 분류했다 (Playwright 스크린샷 검증, 2026-07-05).
//
// 고정형(자체적으로 완성된 사진 배치/텍스트 구성을 가져 heroPhotoShape를 적용하면 깨지거나
// 스타일의 정체성이 사라지는 경우)으로 분류된 스타일과 그 이유:
//
// - glassframe: 사진이 이미 이중 테두리 액자 카드(.gf-card) 안에 있어, clip-path 모형을 얹으면
//   액자와 사진 모양이 어긋난다.
// - magframe: 사진 좌우로 이미 자체 세로쓰기 텍스트(.mf-vtext)가 배치된 패딩 프레임(.mf-frame)을
//   갖고 있어 clip-path 모형과 프레임 테두리가 어긋난다.
// - overlay / fullscreen / magcover / bookcover / boldtype: 사진이 섹션 전체를 채우는 배경
//   (position:absolute; inset:0 등)이고 그 위에 이름/문구/장식이 "사진이 빈틈없이 꽉 차 있다"는
//   전제로 배치돼 있다. oval/hexagon/blob 등을 적용해 실제로 렌더링해보면 클리핑된 모서리에
//   섹션 배경색이 그대로 드러나 텍스트가 허공에 뜬 것처럼 보이는 깨진 화면이 된다.
// - instacard: 인스타그램 포스트를 흉내낸 레이아웃이라 사진이 항상 각진 사각형이어야 그 컨셉이
//   성립한다. oval 등을 적용하면 "인스타그램 포스트처럼 보이는" 착시 자체가 깨진다.
//
// 자유형(discrete한 사진 박스라 사진 모형을 자유롭게 바꿔도 주변 배경/여백이 자연스럽게 남는
// 경우)으로 분류된 스타일: classic, minimal, editorial, split, centercard, bookpage, filmstrip,
// verttype, datesplit — 전부 oval로 직접 렌더링해 사진 박스 둘레에 페이지 배경이 자연스럽게
// 남는 것을 확인했다. (verttype은 과거 caption 기능 검토 때 세로쓰기 스파인과의 충돌을 이유로
// 제외한 적이 있었으나, 그건 caption 축 얘기였고 caption 기능은 이후 제거됨 — heroPhotoShape
// 자체와는 충돌하지 않아 자유형으로 분류한다.)
export const FIXED_LOOK_HERO_STYLES: HeroStyle[] = [
  'overlay',
  'fullscreen',
  'magcover',
  'glassframe',
  'instacard',
  'bookcover',
  'magframe',
  'boldtype',
];

export function isFixedLookHeroStyle(style: HeroStyle): boolean {
  return FIXED_LOOK_HERO_STYLES.includes(style);
}
