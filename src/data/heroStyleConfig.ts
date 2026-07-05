import { InvitationData } from '../types';

type HeroStyle = InvitationData['heroStyle'];

// heroPhotoShape(사진 모형) 축을 실제로 열어줘도 되는지 heroStyle 17개를 하나하나 직접
// oval 모형으로 렌더링해 눈으로 확인하고 분류했다 (Playwright 스크린샷 검증, 2026-07-05).
//
// 처음엔 overlay/fullscreen/magcover/bookcover/boldtype/glassframe/magframe/instacard까지
// 8개를 고정형으로 분류했었다 — 사진이 섹션 전체를 채우는 배경(position:absolute; inset:0 등)
// 위에 이름/문구가 "사진이 빈틈없이 꽉 차 있다"는 전제로 배치돼 있어, oval 등을 적용하면
// 클리핑된 모서리에 배경색이 드러나며 텍스트가 허공에 뜬 것처럼 보이는 문제가 실제로 있었다.
// 이후 "bookcover만 빼고 나머지는 다 자유형으로 열어달라"는 요청에 따라 나머지 7개를 먼저
// 자유형으로 전환했고, 그 다음 "bookcover도 그냥 도형 적용되게 해달라"는 요청에 따라
// bookcover도 자유형으로 전환 — 이제 17개 전부 자유형이라 이 배열은 비어 있다(향후 자체
// 프레임을 가진 새 스타일이 추가되면 여기에 등록하면 된다).
export const FIXED_LOOK_HERO_STYLES: HeroStyle[] = [];

export function isFixedLookHeroStyle(style: HeroStyle): boolean {
  return FIXED_LOOK_HERO_STYLES.includes(style);
}
