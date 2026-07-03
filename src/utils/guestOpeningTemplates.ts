import { GuestRelation } from '../types';

type OpeningLang = 'ko' | 'en' | 'ja';

// family/friend: 캐주얼한 톤 · coworker/other: 격식체
const TEMPLATES: Record<OpeningLang, Record<GuestRelation, string>> = {
  ko: {
    family: '{name}님, 저희 가족의 특별한 날에 초대해요',
    friend: '{name}님, 저희 결혼식에 초대해요!',
    coworker: '{name}님, 저희 두 사람의 결혼식에 초대합니다',
    other: '{name}님, 저희의 결혼식에 초대합니다',
  },
  en: {
    family: "{name}, join us on our family's special day",
    friend: "{name}, you're invited to our wedding!",
    coworker: '{name}, we cordially invite you to our wedding',
    other: '{name}, we invite you to our wedding',
  },
  ja: {
    family: '{name}さん、私たちの特別な日にご一緒ください',
    friend: '{name}さん、私たちの結婚式に招待します！',
    coworker: '{name}様、私たちの結婚式にご招待申し上げます',
    other: '{name}様、私たちの結婚式にご招待いたします',
  },
};

export function formatGuestOpeningText(relation: GuestRelation, name: string, language: OpeningLang = 'ko'): string {
  const table = TEMPLATES[language] || TEMPLATES.ko;
  const template = table[relation] || table.other;
  return template.replace('{name}', name);
}
