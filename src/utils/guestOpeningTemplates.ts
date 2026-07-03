import { GuestRelation } from '../types';

type OpeningLang = 'ko' | 'en' | 'ja';

// family/friend: 캐주얼한 톤 · coworker/other: 격식체
// 각 relation당 4개씩 배리에이션을 준비해, 하객마다 서버에서 뽑힌 assignedMessageIndex로 고정 선택한다.
// worker.ts의 GUEST_MESSAGE_TEMPLATE_COUNT(현재 4)와 배열 길이를 맞춰야 한다.
const TEMPLATES: Record<OpeningLang, Record<GuestRelation, string[]>> = {
  ko: {
    family: [
      '{name}님, 저희 가족의 특별한 날에 초대해요',
      '{name}님, 늘 곁에 있어준 우리 가족, 함께해주세요',
      '{name}님과 함께 이 기쁜 날을 나누고 싶어요',
      '{name}님, 저희 두 사람 이제 진짜 가족이 돼요. 축복해주세요',
    ],
    friend: [
      '{name}님, 저희 결혼식에 초대해요!',
      '{name}님, 우리의 새로운 시작을 함께 축하해주세요',
      '{name}님 덕분에 더 행복한 날이 될 것 같아요, 꼭 와주세요',
      '{name}님, 소중한 친구 자리에서 함께해주면 좋겠어요',
    ],
    coworker: [
      '{name}님, 저희 두 사람의 결혼식에 초대합니다',
      '{name}님을 저희의 뜻깊은 자리에 모시고 싶습니다',
      '{name}님, 바쁘신 중에도 참석해주시면 큰 힘이 되겠습니다',
      '{name}님께 저희 결혼식 소식을 전해드립니다',
    ],
    other: [
      '{name}님, 저희의 결혼식에 초대합니다',
      '{name}님을 저희 두 사람의 새 출발에 초대합니다',
      '{name}님, 귀한 걸음 해주시면 감사하겠습니다',
      '{name}님께 기쁜 소식을 전합니다, 함께해주세요',
    ],
  },
  en: {
    family: [
      "{name}, join us on our family's special day",
      "{name}, we can't imagine this day without you",
      '{name}, come celebrate this joyful moment with our family',
      "{name}, we're becoming a family — please join us",
    ],
    friend: [
      "{name}, you're invited to our wedding!",
      '{name}, come celebrate our new beginning with us',
      "{name}, it wouldn't be the same without you there",
      "{name}, we'd love for you to be part of our big day",
    ],
    coworker: [
      '{name}, we cordially invite you to our wedding',
      '{name}, we would be honored to have you join us',
      '{name}, your presence would mean a great deal to us',
      '{name}, we are pleased to share our wedding news with you',
    ],
    other: [
      '{name}, we invite you to our wedding',
      '{name}, we invite you to celebrate our new beginning',
      '{name}, we would be grateful for your presence',
      '{name}, we are happy to share this joyful news with you',
    ],
  },
  ja: {
    family: [
      '{name}さん、私たちの特別な日にご一緒ください',
      '{name}さん、いつも支えてくれてありがとう。一緒にお祝いしてください',
      '{name}さんと一緒にこの嬉しい日を過ごしたいです',
      '{name}さん、ついに家族になります。見守ってください',
    ],
    friend: [
      '{name}さん、私たちの結婚式に招待します！',
      '{name}さん、新しい門出を一緒にお祝いしてください',
      '{name}さんがいてこそ、もっと嬉しい一日になりそうです',
      '{name}さん、大切な友人として一緒にいてほしいです',
    ],
    coworker: [
      '{name}様、私たちの結婚式にご招待申し上げます',
      '{name}様を私たちの大切な日にお招きしたく存じます',
      '{name}様にご出席いただければ、大変心強く存じます',
      '{name}様に結婚のご報告をさせていただきます',
    ],
    other: [
      '{name}様、私たちの結婚式にご招待いたします',
      '{name}様を私たちの新たな門出にご招待いたします',
      '{name}様にお越しいただけますと幸いです',
      '{name}様に嬉しいお知らせをお伝えいたします',
    ],
  },
};

export function formatGuestOpeningText(
  relation: GuestRelation,
  name: string,
  language: OpeningLang = 'ko',
  variantIndex?: number | null,
): string {
  const table = TEMPLATES[language] || TEMPLATES.ko;
  const variants = table[relation] || table.other;
  // 저장된 인덱스가 없거나(구버전 하객) 배열 범위를 벗어나면(문구 개수를 나중에 줄인 경우 등) 0번째로 안전하게 폴백
  const safeIndex = typeof variantIndex === 'number' && variantIndex >= 0 && variantIndex < variants.length ? variantIndex : 0;
  return variants[safeIndex].replace('{name}', name);
}
