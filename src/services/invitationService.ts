import { apiFetch } from './api';
import { getCurrentUser } from './auth';
import { InvitationData } from '../types';

export const saveInvitation = async (slug: string, data: InvitationData): Promise<void> => {
  if (!getCurrentUser()) throw new Error('로그인이 필요합니다.');
  await apiFetch(`/api/invitations/${slug}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const loadInvitation = async (slug: string): Promise<InvitationData | null> => {
  try {
    return await apiFetch<InvitationData>(`/api/invitations/${slug}`);
  } catch {
    return null;
  }
};

export const checkSlugAvailable = async (slug: string): Promise<boolean> => {
  const res = await apiFetch<{ available: boolean }>(`/api/invitations/${slug}/available`);
  return res.available;
};

export const deleteInvitation = async (slug: string): Promise<void> => {
  await apiFetch(`/api/invitations/${slug}`, { method: 'DELETE' });
};

export const fetchMyInvitations = async (): Promise<{ slug: string; data: InvitationData }[]> => {
  if (!getCurrentUser()) return [];
  return apiFetch<{ slug: string; data: InvitationData }[]>('/api/invitations');
};

export const changeSlug = async (oldSlug: string, newSlug: string): Promise<void> => {
  await apiFetch(`/api/invitations/${oldSlug}/change-slug`, { method: 'POST', body: JSON.stringify({ newSlug }) });
};

export const activatePaidInvitation = async (slug: string, weddingDateISO: string): Promise<void> => {
  await apiFetch(`/api/invitations/${slug}/activate`, { method: 'POST', body: JSON.stringify({ weddingDateISO }) });
};

// 구매 후 발급받은 활성화 코드를 고객이 직접 입력해 유료 전환하는 셀프서비스 경로.
export const redeemActivationCode = async (slug: string, code: string): Promise<void> => {
  await apiFetch(`/api/invitations/${slug}/redeem`, { method: 'POST', body: JSON.stringify({ code }) });
};

export interface PrivacySettings {
  privacyTransitionDate: string | null;
  isPastTransition: boolean;
  accountInfoVisibleOverride: 0 | 1 | null;
  rsvpFormOpenOverride: 0 | 1 | null;
}

export const fetchPrivacySettings = (slug: string): Promise<PrivacySettings> =>
  apiFetch<PrivacySettings>(`/api/invitations/${slug}/privacy-settings`);

// 각 필드는 넘긴 것만 갱신된다. override에 null을 넘기면 "자동으로 전환"(tri-state 중 자동 판단)으로 되돌아간다.
export const updatePrivacySettings = (
  slug: string,
  patch: { privacyTransitionDate?: string; accountInfoVisibleOverride?: 0 | 1 | null; rsvpFormOpenOverride?: 0 | 1 | null }
): Promise<void> =>
  apiFetch(`/api/invitations/${slug}/privacy-settings`, { method: 'PUT', body: JSON.stringify(patch) });

// anniversaryMode 키만 원자적으로 갱신 (서버가 json_set으로 처리 — 메인 에디터 저장과 겹쳐도 서로 덮어쓰지 않음)
export const updateAnniversaryMode = (
  slug: string,
  patch: { heroPhoto: string; photos: string[]; openingStyle?: string }
): Promise<void> =>
  apiFetch(`/api/invitations/${slug}/anniversary`, { method: 'PATCH', body: JSON.stringify(patch) });
