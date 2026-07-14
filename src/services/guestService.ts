import { apiFetch } from './api';
import { Guest, GuestRelation } from '../types';

export const fetchGuests = async (slug: string): Promise<Guest[]> => {
  return apiFetch<Guest[]>(`/api/guests/${slug}`);
};

export const createGuest = async (slug: string, name: string, relation: GuestRelation): Promise<Guest> => {
  return apiFetch<Guest>(`/api/guests/${slug}`, { method: 'POST', body: JSON.stringify({ name, relation }) });
};

export const updateGuest = async (slug: string, code: string, name: string, relation: GuestRelation): Promise<void> => {
  await apiFetch(`/api/guests/${slug}/${code}`, { method: 'PUT', body: JSON.stringify({ name, relation }) });
};

export const deleteGuest = async (slug: string, code: string): Promise<void> => {
  await apiFetch(`/api/guests/${slug}/${code}`, { method: 'DELETE' });
};

export const patchGuestLinkSent = async (slug: string, code: string, linkSent: boolean): Promise<void> => {
  await apiFetch(`/api/guests/${slug}/${code}`, { method: 'PATCH', body: JSON.stringify({ linkSent }) });
};

export interface InviteLookupResult {
  slug: string;
  name?: string;
  relation?: GuestRelation;
  messageIndex?: number | null;
  // 개인화 링크 만료(예식일+3주, 계좌/RSVP 비공개 전환과 동일 기준) — true면 name/relation/
  // messageIndex는 서버가 아예 내려주지 않는다. 호출부는 slug로 일반 청첩장 링크로 리디렉트해야 한다.
  expired?: boolean;
}

// 개인화 링크(/invite/{code}) 조회. 실패(404/DB 에러/네트워크 오류) 시 null로 통일해
// 호출부가 항상 안전하게 범용 폴백으로 넘어갈 수 있도록 한다 (apiFetch처럼 throw하지 않음).
// 로그인 토큰이 있으면 함께 보낸다 — 서버가 "소유자 본인이면 만료와 무관하게 정상 조회" 예외를
// 판단하는 데 쓰지만, 비로그인 상태(토큰 없음)에서도 이 엔드포인트 자체는 그대로 공개로 동작한다.
export const lookupInviteCode = async (code: string): Promise<InviteLookupResult | null> => {
  try {
    const token = localStorage.getItem('sonett_token');
    const res = await fetch(`/api/invite/${code}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    return await res.json() as InviteLookupResult;
  } catch {
    return null;
  }
};
