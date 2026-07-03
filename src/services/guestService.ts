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

export interface InviteLookupResult {
  slug: string;
  name: string;
  relation: GuestRelation;
}

// 개인화 링크(/invite/{code}) 조회. 실패(404/DB 에러/네트워크 오류) 시 null로 통일해
// 호출부가 항상 안전하게 범용 폴백으로 넘어갈 수 있도록 한다 (apiFetch처럼 throw하지 않음).
export const lookupInviteCode = async (code: string): Promise<InviteLookupResult | null> => {
  try {
    const res = await fetch(`/api/invite/${code}`);
    if (!res.ok) return null;
    return await res.json() as InviteLookupResult;
  } catch {
    return null;
  }
};
