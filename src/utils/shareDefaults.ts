import { InvitationData } from '../types';
import { formatShareDateTime, formatShareDateTimeJa } from './formatShareDateTime';

// 공유 제목/설명을 비워뒀을 때 실제 카카오톡 공유(Share.tsx)에 쓰이는 기본값과
// 에디터의 placeholder/미리보기가 서로 어긋나지 않도록 로직을 한 곳에 모은다.

type TitleFields = Pick<InvitationData, 'language' | 'groomName' | 'brideName'>;
type DescriptionFields = Pick<InvitationData, 'language' | 'weddingDateISO' | 'time' | 'date'>;

export function getDefaultShareTitle(data: TitleFields): string {
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';
  const groom = data.groomName || (isEn ? 'Groom' : isJa ? '新郎' : '신랑');
  const bride = data.brideName || (isEn ? 'Bride' : isJa ? '新婦' : '신부');
  if (isEn) return `${groom} ❤️ ${bride} Wedding`;
  if (isJa) return `${groom} ❤️ ${bride} 結婚式`;
  return `${groom} ❤️ ${bride} 결혼합니다`;
}

export function getDefaultShareDescription(data: DescriptionFields): string {
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';
  if (isJa && data.weddingDateISO) return formatShareDateTimeJa(data.weddingDateISO, data.time);
  if (!isEn && !isJa && data.weddingDateISO) return formatShareDateTime(data.weddingDateISO, data.time);
  return `${data.date} ${data.time}`;
}
